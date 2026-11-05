import sys
from pathlib import Path
from collections import defaultdict
from functools import lru_cache
import json,cv2,numpy as np,shutil
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';CASE=REPO/'demos/cases/butterfly-garden-score'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
write=lambda p,a:p.write_text(json.dumps(a,ensure_ascii=False,separators=(',',':')),encoding='utf8')
before=CASE/'source/analysis/rework/state-input'
score=read(before/'notes.json');shots=read(CASE/'film/data/shots.json');states=read(CASE/'film/data/rowStates.json');rows={r:np.array(k)for r,k in states['rows'].items()};notes=score['notes']
@lru_cache(maxsize=10)
def image(f):return cv2.cvtColor(cv2.imread(str(OUT/'round3-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32')
def sample(k,t):
    k=np.array(k);return np.array([np.interp(t,k[:,0],k[:,i])for i in range(1,k.shape[1])])
def camera(t):
    e=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
    if e is None:return 1,1,1,880,[],None
    p,head=sample(e['curve'],t)[:2];sx=1+(e['maxX']-1)*p;sy=1+(e['maxY']-1)*p;gy=sx
    if e['id']=='focus-cym-pf':sx,sy=sample(e['scaleCurve'],t)[:2];gy=sample(e['verticalCurve'],t)[0]
    return sx,sy,gy,head,e['rows'],e['id']
def excluded(t):return t<3.2 or any(a<t<b for a,b in [(8.3,12.4),(20,23.6),(39,47.5),(56.2,60.6),(76.2,77.5),(81,85),(88,93.5),(116.8,123)])
def runs(m):
    z=np.flatnonzero(np.diff(np.r_[False,m,False].astype('int8')));return list(zip(z[::2],z[1::2]))

audit=[];restored=[]
for item in read(CASE/'source/analysis/rework/removed-candidates.json')+[
    {'index':'missing-pf-1','note':dict(row='Pf.',x0=13439.,x1=13463.,yOffset=-7.5,thickness=3.,kind='bar',group=2,futureThickness=3.,currentThickness=3.)},
    {'index':'missing-pf-2','note':dict(row='Pf.',x0=13533.,x1=13557.,yOffset=-3.5,thickness=3.,kind='bar',group=2,futureThickness=3.,currentThickness=3.)},
    {'index':'missing-vln-line','note':dict(row='Vln. I',x0=4461.5,x1=4539.,yOffset=-5.5,thickness=2.,kind='line',group=3,futureThickness=1.,currentThickness=2.)}]:
    n=item['note'].copy();obs=[]
    first=max(200,int((n['x0']-650)/190*60/30)*30);last=min(6990,int((n['x1']+650)/190*60/30)*30)
    for f in range(first,last+1,30):
        t=f/60
        if excluded(t):continue
        a=image(f);cy,op=[float(np.interp(t,rows[n['row']][:,0],rows[n['row']][:,i]))for i in [1,2]]
        if op<.25:continue
        x0=n['x0']-190*t+880;x1=n['x1']-190*t+880
        if x0<190 or x1>1570:continue
        y=cy+n['yOffset'];top=max(220,int(y)-11);bottom=min(782,int(y)+12);l=int(x0)+1;r=int(x1)-1
        if r-l<3:continue
        band=a[top:bottom,180:1580];paper=np.median(a[193:216,900:1200],axis=(0,1));mag=np.max(abs(band-paper),2);ix=np.argpartition(mag,25,axis=1)[:,:25];B=np.median(np.take_along_axis(band,ix[:,:,None],axis=1),axis=1)
        F=np.array(score['rowColors'][f"{n['row']}:{int(paper[1]<100)}"]['paint']['color']);D=a[top:bottom,l:r]-B[:,None,:];v=F[None,:]-B;strength=np.maximum(0,np.sum(D*v[:,None,:],2)/np.maximum(1,np.linalg.norm(v,axis=1))[:,None]);profile=np.median(strength,axis=1);parts=runs(profile>max(10,float(profile.max())*.2))
        if not parts:continue
        lo,hi=max(parts,key=lambda z:float(profile[z[0]:z[1]].max())/(1+abs(top+(z[0]+z[1])/2-y)));j=lo+int(np.argmax(profile[lo:hi]));peak=float(profile[j])
        if peak<18:continue
        lo=j;hi=j
        while lo>0 and profile[lo-1]>peak*.3:lo-=1
        while hi+1<len(profile)and profile[hi+1]>peak*.3:hi+=1
        yy=top+(lo+hi+1)/2;line=strength[max(0,j-1):j+2].max(axis=0);segments=runs(line>max(12,peak*.3));continuity=max((b-a for a,b in segments),default=0)/(r-l)
        if continuity<.86:continue
        xl=max(180,l-15);xr=min(1580,r+15);b=B[j];v=F-b;extension=np.maximum(0,np.mean(a[max(top,top+j-1):min(bottom,top+j+2),xl:xr]-b,axis=0)@v/max(1,float(np.linalg.norm(v))));zz=runs(extension>max(12,peak*.3));cover=next(((a+xl,b+xl)for a,b in zz if a+xl<=l+2 and b+xl>=r-2),None)
        if cover and cover[0]<x0-7 and cover[1]>x1+7:continue
        obs.append(dict(frame=f,yOffset=round(yy-cy,2),height=round(float(profile[lo:hi+1].sum()/peak),2),contrast=peak,continuity=continuity))
    required=2 if str(item['index']).startswith('missing-pf')else 3
    if len(obs)>=required:
        offsets=np.array([o['yOffset']for o in obs]);n['yOffset']=round(float(np.median(offsets))*2)/2
        duplicate=any(e['row']==n['row']and abs(e['x0']-n['x0'])<3 and abs(e['x1']-n['x1'])<3 and abs(e['yOffset']-n['yOffset'])<1.5 for e in notes)
        if not duplicate:
            n['thickness']=round(float(np.median([o['height']for o in obs])),2);n['futureThickness']=n['thickness'];n['currentThickness']=n['thickness'];notes.append(n);restored.append(item['index']);decision='恢复'
        else:decision='现有同位置音符已覆盖'
    else:decision='未恢复：没有三个独立连续轮廓样本，或与其他声部无法分离'
    audit.append(dict(index=item['index'],note=n,decision=decision,observations=obs))
print('candidate audit',len(audit),'restored',restored,flush=True);write(OUT/'round3-candidate-audit.json',audit)

names=list(rows);N=len(notes);nx0=np.array([n['x0']for n in notes]);nx1=np.array([n['x1']for n in notes]);ny=np.array([n['yOffset']for n in notes]);ri=np.array([names.index(n['row'])for n in notes]);heights=np.array([max(n['thickness'],n['futureThickness'],n['currentThickness'])for n in notes]);observations=[[]for _ in notes];group=defaultdict(list)
for f in range(200,7000,10):
    t=f/60
    if excluded(t):continue
    a=image(f);paper=np.median(a[193:216,900:1200],axis=(0,1));q=float(np.clip((255-paper[1])/247,0,1))
    if .05<q<.95:continue
    mode=int(q>.5);poses=np.array([[np.interp(t,k[:,0],k[:,i])for i in [1,2]]for k in rows.values()]);Y=poses[ri,0]+ny;X0=nx0-190*t+880;X1=nx1-190*t+880;visible=np.flatnonzero((X0>185)&(X1<1575)&(poses[ri,1]>.25));band=a[220:782,180:1580];mag=np.max(abs(band-paper),2);ix=np.argpartition(mag,30,axis=1)[:,:30];B=np.median(np.take_along_axis(band,ix[:,:,None],axis=1),axis=1)
    for i in visible:
        n=notes[i];start=n['x0']/190;end=(n['x1']+6)/190
        if abs(t-start)<.08 or abs(t-end)<.2:continue
        stage=0 if t<start else 1 if t<end else 2
        if stage==2 and t-end<.8:continue
        width=X1[i]-X0[i];margin=max(2,min(5,heights[i]/2));left=X0[i]+margin;right=X1[i]-margin
        if right<left:continue
        xs=np.linspace(left,right,3).astype(int);samples=[];centres=[];hs=[]
        for x in xs:
            if abs(x-880)<6:continue
            overlap=(X0<x+2)&(X1>x-2)&(abs(Y-Y[i])<(heights+heights[i])/2+1.5);overlap[i]=False
            if np.any(overlap):continue
            y=Y[i];top=max(220,int(y)-7);bottom=min(782,int(y)+8);P=a[top:bottom,x-1:x+2].mean(axis=1);base=B[top-220:bottom-220];F=np.array(score['rowColors'][f"{n['row']}:{mode}"]['paint']['color']);v=F-base;s=np.maximum(0,np.sum((P-base)*v,1)/np.maximum(1,np.linalg.norm(v,axis=1)));parts=runs(s>max(5,float(s.max())*.2))
            if not parts:continue
            lo,hi=max(parts,key=lambda z:float(s[z[0]:z[1]].max())/(1+abs(top+(z[0]+z[1])/2-y)));j=lo+int(np.argmax(s[lo:hi]));peak=float(s[j])
            if peak<8:
                samples.append(paper.copy());continue
            lo=j;hi=j
            while lo>0 and s[lo-1]>peak*.3:lo-=1
            while hi+1<len(s)and s[hi+1]>peak*.3:hi+=1
            centre=top+(lo+hi+1)/2
            if abs(centre-y)>6 or not 0<j<len(P)-1:continue
            ys=np.arange(top+lo,top+hi+1);valid=(abs(ys+.5-poses[ri[i],0]-.5)>1)&(s[lo:hi+1]>peak*.8)
            if not np.any(valid):continue
            O=np.median(P[lo:hi+1][valid],axis=0);baseColor=np.median(base[lo:hi+1][valid],axis=0)
            samples.append((O-baseColor)/poses[ri[i],1]+paper);centres.append(centre-poses[ri[i],0]);hs.append(float(s[lo:hi+1].sum()/peak))
        if samples:
            rgb=np.median(samples,axis=0);entry=[f,mode,stage,*rgb.tolist(),*paper.tolist(),float(np.median(centres))if centres else float('nan'),float(np.median(hs))if hs else float('nan')];observations[i].append(entry);group[(n['row'],mode)].append((stage,rgb,paper))
    if f%1000==0:print('state samples',f,sum(map(len,observations)),flush=True)

models={};evidence={}
for row in names:
    if row=='dyn.'or f'{row}:0'not in score['rowColors']:continue
    for mode in [0,1]:
        entries=group[(row,mode)];s=score['rowColors'][f'{row}:{mode}']
        instrumentGroup=next(n['group']for n in notes if n['row']==row)
        F=np.array(s['colors'][1])if instrumentGroup==1 else np.array([232,8,39]if not mode and instrumentGroup==3 else[255]*3 if mode and instrumentGroup in [0,3]else[24,0,5]if mode else[24]*3,dtype=float)
        if len(entries)<10:models[(row,mode)]=(F,np.array(s['paint']['alpha']),[np.array([v,v])for v in s['paint']['alpha']]);s['paint']['color']=F.tolist();continue
        alphas=[];bounds=[]
        for stage in range(3):
            values=[]
            for st,O,B in entries:
                if st!=stage:continue
                v=F-B;values.append(float(np.clip((O-B)@v/max(1,float(v@v)),0,1)))
            alphas.append(float(np.median(values))if values else s['paint']['alpha'][stage]);bounds.append(np.percentile(values,[25,75])if values else np.array([alphas[-1]]*2))
        models[(row,mode)]=(F,np.array(alphas),bounds);s['paint']=dict(color=np.round(F,2).tolist(),alpha=np.round(alphas,3).tolist());evidence[f'{row}:{mode}']=dict(samples=len(entries),foreground=F.tolist(),alpha=alphas,iqr=[b.tolist()for b in bounds])

for i,n in enumerate(notes):
    n.pop('alphaKeys',None);n.pop('samples',None);n['stateAlpha']=[]
    for mode in [0,1]:
        F,A,bounds=models[(n['row'],mode)];values=A.copy()
        for stage in [0,1,2]:
            ss=[o for o in observations[i]if o[1]==mode and o[2]==stage];aa=[]
            for o in ss:
                O=np.array(o[3:6]);B=np.array(o[6:9]);v=F-B;aa.append(float(np.clip((O-B)@v/max(1,float(v@v)),0,1)))
            if len(aa)>=3:values[stage]=min(float(np.median(aa)),float(bounds[stage][1]))if stage==0 else float(np.median(aa))
        n['stateAlpha'].append(np.round(values,3).tolist())
    os=observations[i]
    if len(os)>=6:
        offsets=np.array([o[9]for o in os if np.isfinite(o[9])]);delta=float(np.median(offsets))-n['yOffset']if len(offsets)else 0
        if len(offsets)>=6 and abs(delta)>2 and np.percentile(offsets,75)-np.percentile(offsets,25)<1.5:n['yOffset']=round(float(np.median(offsets))*2)/2
    for mode,field in [(0,'futureThickness'),(1,'currentThickness'),(2,'thickness')]:
        hh=[o[10]for o in os if o[2]==mode and np.isfinite(o[10])]
        if len(hh)>=3 and n['kind']!='dot':n[field]=round(float(np.median(hh))*2)/2
    if 'shotCurves'in n:
        for key,curve in n['shotCurves'].items():n['shotCurves'][key]=[k[:5]for k in curve]
score['notes']=notes;score['alphaSpace']='row-state-times-three-state';write(CASE/'film/data/notes.json',score);write(OUT/'round3-state-evidence.json',evidence);write(OUT/'round3-note-observations.json',observations)
print('three-state notes',len(notes),'bytes',(CASE/'film/data/notes.json').stat().st_size,flush=True)
