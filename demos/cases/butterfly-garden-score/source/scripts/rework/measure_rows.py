import sys
from pathlib import Path
import json, subprocess, cv2, numpy as np
from PIL import Image

ROOT=Path(sys.argv[1]).resolve()
WORK=ROOT/'codex/case-impl'
CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score'
ANA=ROOT/'analysis/case'
YS={'Fl.':242,'Ob.':274,'Cl.':306,'Bsn.':338,'Hn.':382,'Trp.':414,'Trb.':446,'Cym.':490,'Mar.':522,'Pf.':554,'Hp.':586,'Vln. I':630,'Vln. II':662,'Va.':694,'Vc.':726,'Cb.':758,'dyn.':798}
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
write=lambda p,d:Path(p).write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf8')
shots=read(CASE/'film/data/shots.json')
notes=read(CASE/'film/data/notes.json')['notes']
profiles=np.load(ANA/'frames/rowprofiles.npy',mmap_mode='r')
backgrounds=np.array(read(ANA/'frames/scan.json')['backgrounds'])
cache=WORK/'row-labels.npy'
if not cache.exists():
    dest=np.lib.format.open_memmap(cache,mode='w+',dtype='uint8',shape=(3660,670,180,3))
    p=subprocess.Popen(['ffmpeg','-v','error','-i',str(ROOT/'audio/case.mp4'),'-an','-vf','select=not(mod(n\\,2)),format=rgb24,scale=1920:1080:flags=area,crop=180:670:0:170','-fps_mode','vfr','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
    for i in range(3660):
        data=p.stdout.read(670*180*3)
        if len(data)!=670*180*3:raise ValueError(i)
        dest[i]=np.frombuffer(data,np.uint8).reshape(670,180,3)
        if i%600==0:print('decode',i,flush=True)
    p.stdout.close()
    if p.wait():raise RuntimeError('ffmpeg')
    dest.flush();del dest
source=np.load(cache,mmap_mode='r')
reference=np.array(Image.open(WORK/'reference/00480.png')).astype(float)
templates={}
for row,y in YS.items():
    top=round(y)-15
    patch=reference[top:round(y)+14,99:164]
    contrast=np.max(abs(patch-255),2)
    yy,xx=np.where(contrast>22)
    left=max(0,xx.min()-1);right=min(65,xx.max()+2);low=max(0,yy.min()-1);high=min(29,yy.max()+2)
    m=contrast[low:high,left:right].astype('float32')
    m/=max(1,np.percentile(m[m>20],98))
    templates[row]=(m,99+left,top+low-y)

groups={'木管':(49,286),'金管':(49,412),'打鍵':(49,536),'弦':(49,695)}
for row,(x,y)in groups.items():
    patch=reference[y-25:y+25,x-14:x+14]
    contrast=np.max(abs(patch-255),2);yy,xx=np.where(contrast>20)
    low=max(0,yy.min()-1);high=min(50,yy.max()+2);left=max(0,xx.min()-1);right=min(28,xx.max()+2)
    m=contrast[low:high,left:right].astype('float32');m/=np.percentile(m[m>20],98)
    templates[row]=(m,x-14+left,y-25+low-y)

def simplify(a):
    keep={0,len(a)-1};stack=[(0,len(a)-1)]
    while stack:
        lo,hi=stack.pop()
        if hi-lo<2:continue
        u=(a[lo+1:hi,0]-a[lo,0])/(a[hi,0]-a[lo,0])
        fit=a[lo,1:]+u[:,None]*(a[hi,1:]-a[lo,1:])
        error=np.max(abs(a[lo+1:hi,1:]-fit)/np.array([.5,.02]),axis=1)
        j=int(np.argmax(error))
        if error[j]>1:
            mid=lo+1+j;keep.add(mid);stack.extend([(lo,mid),(mid,hi)])
    return np.round(a[sorted(keep)],5).tolist()

out={row:[]for row in templates};diagnostics={row:[]for row in templates};activeTracks={row:[]for row in YS}
last={row:float(YS.get(row,groups.get(row,(0,0))[1]))for row in templates}
for i,frame in enumerate(source):
    f=i*2;t=f/60
    back=np.median(frame[10:30,80:170],axis=(0,1)).astype(float)
    diff=np.max(abs(frame.astype(float)-back),2).astype('float32')
    focus=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
    if focus:
        curve=np.array(focus['curve']);pval=float(np.interp(t,curve[:,0],curve[:,1]));scale=1+(focus['maxX']-1)*pval
    else:pval=0;scale=1
    for row,(template,xorig,yoff)in templates.items():
        group=row in groups;basey=float(YS.get(row,groups.get(row,(0,0))[1]))
        selected=focus and row in focus['rows']
        s=scale if focus and focus['id']!='focus-cym-hp' and not group else 1
        temp=cv2.resize(template,None,fx=s,fy=s,interpolation=cv2.INTER_LINEAR)
        h,w=temp.shape
        expected=last[row]if 22.4<t<28.1 else basey
        # A full-height search lets a row cross its neighbours during a focus.
        if selected:expected=float(np.interp(t,curve[:,0],curve[:,3+focus['rows'].index(row)]))
        lo=max(0,round(expected-170)-24);hi=min(670,round(expected-170)+h+25)
        if group:left=12;right=71
        else:left=max(18,round(160-(70*pval if focus else 0))-w-14);right=min(178,round(160-(70*pval if focus else 0))+14)
        region=diff[lo:hi,left:right]
        if region.shape[0]<h or region.shape[1]<w:
            y=last[row];alpha=0;cc=0;amplitude=0
        else:
            corr=cv2.matchTemplate(region,temp,cv2.TM_CCOEFF_NORMED)
            _,cc,_,(xx,yy)=cv2.minMaxLoc(corr)
            # Subpixel translation from the correlation parabola.
            fy=0
            if 0<yy<corr.shape[0]-1:
                v=corr[yy-1:yy+2,xx];den=float(v[0]-2*v[1]+v[2])
                if abs(den)>1e-6:fy=float(np.clip((v[0]-v[2])/(2*den),-.5,.5))
            y=lo+yy+170-yoff*s+fy
            patch=frame[lo+yy:lo+yy+h,left+xx:left+xx+w].astype(float)
            m=temp>.15
            observed=np.sum((patch-back)*temp[:,:,None],axis=(0,1))/max(float(np.sum(temp*temp)),.01)
            if group:
                nominal=np.array([129,122,69]if back[1]>150 else [255,255,255])-back
                amplitude=float(np.dot(observed,nominal)/max(1,float(nominal@nominal)))
            else:
                mx=168-(66*pval if focus and focus['id']!='focus-cym-hp'else 0)
                my=round(y-170);marker=diff[max(0,my-round(6*s)):min(670,my+round(7*s)),max(0,round(mx)):min(180,round(mx+3*s))]
                active=bool(marker.size and np.percentile(marker,80)>max(5,np.max(abs(observed))*.38))
                if row=='dyn.':active=False
                if back[1]>150:nominal=np.array([24]*3 if active else [136]*3)-back
                else:nominal=np.array([255]*3 if np.sum(observed)>0 else [35,0,5])-back
                amplitude=float(np.dot(observed,nominal)/max(1,float(nominal@nominal)))
            alpha=float(np.clip(amplitude,0,1))
            if cc<.58 or np.max(abs(observed))<1.6:y=last[row];alpha=0
        if focus and focus['id']=='focus-cym-hp' and pval>.025:
            profile=np.max(abs(profiles[f].astype(float)-backgrounds[f]),1)
            guides=[]
            for j in [0,1]:
                expected=float(np.interp(t,curve[:,0],curve[:,3+j]));lo=max(220,round(expected)-16);hi=min(784,round(expected)+17)
                candidates=np.arange(lo,hi);values=profile[lo-220:hi-220]
                cost=abs(values-25)+.4*abs(candidates-expected)
                guides.append(float(candidates[np.argmin(cost)])+.5)
            vertical=(guides[1]-guides[0])/96
            y=guides[0]+(basey-490)*vertical
            if group:alpha=0
            elif row in ['Cym.','Hp.']:alpha=1
            elif row=='dyn.':alpha=0
            elif 222<y<782:
                values=profile[round(y)-221:round(y)-217];alpha=float(np.clip(np.max(values)/25,0,.2))
            else:alpha=.08
        if row in YS:activeTracks[row].append([t,int(bool(locals().get('active',False)))])
        last[row]=y
        out[row].append([t,y,alpha]);diagnostics[row].append([t,round(float(cc),4),round(amplitude,4)])
    if i%600==0:print('match',i,flush=True)

for row,values in out.items():
    a=np.array(values)
    visible=np.flatnonzero(a[:,2]>.025)
    if len(visible):
        a[:,1]=np.interp(np.arange(len(a)),visible,a[visible,1])
    # Pixel antialiasing shifts the match by a fraction of a pixel at steady positions.
    a[:,1]=np.round(a[:,1]*2)/2
    a=np.vstack([a,[122.005,*a[-1,1:]]])
    out[row]=simplify(a)
write(CASE/'film/data/rowStates.json',{'rows':{k:v for k,v in out.items()if k in YS},'groups':{k:v for k,v in out.items()if k in groups},'active':{k:[v for i,v in enumerate(a)if i==0 or v[1]!=a[i-1][1]]for k,a in activeTracks.items()}})
write(WORK/'row-diagnostics.json',diagnostics)
print({row:len(v)for row,v in out.items()},flush=True)
