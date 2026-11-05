import sys
from pathlib import Path
import json,subprocess,cv2,numpy as np
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));cv2.setNumThreads(2)
def peak(target,mask):
    cc=cv2.matchTemplate(target,mask,cv2.TM_CCOEFF_NORMED);h,w=mask.shape;mean=cv2.boxFilter(target,-1,(w,h),anchor=(0,0));sq=cv2.boxFilter(target*target,-1,(w,h),anchor=(0,0));cc[(sq-mean*mean)[:cc.shape[0],:cc.shape[1]]<.01]=-1;return cv2.minMaxLoc(cc)
ref=np.array(Image.open(OUT/'residual-reference/00480.png')).astype('float32');box=(1658,983,1900,1010);x0,y0,x1,y1=box;B=np.median(ref[983:1010,1625:1640],axis=(0,1));v=np.array([255]*3)-B;bylineMask=np.clip(np.sum((ref[y0:y1,x0:x1]-B)*v,2)/float(v@v),0,1).astype('float32');byline=[]
indices=list(range(229))+list(range(7020,7320));filt=r'select=between(n\,0\,228)+between(n\,7020\,7319),format=rgb24,scale=1920:1080:flags=area';p=subprocess.Popen(['ffmpeg','-v','error','-threads','4','-i',str(ROOT/'audio/case.mp4'),'-an','-vf',filt,'-fps_mode','vfr','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
ann=read(CASE/'film/data/annotations.json');ladder=next(e for e in ann['ladders']if e['id']=='ending-key-ladder');connections=[]
for i in range(1,5):
    prior=ladder['groups'][i-1];g=ladder['groups'][i];x=prior['line'][2]-2;y=(prior['line'][1]+prior['line'][3])/2;nextY=g['line'][1];ay=(y+nextY)/2
    for kind in ['arrow','dash']:
        if kind=='arrow':points=[[(x+16,ay-10),(x+16,ay+12)],[(x+11,ay+6),(x+16,ay+12),(x+21,ay+6)]];fg=np.array([232,8,39],float)
        else:
            points=[];sy=y+10
            while sy<nextY-6:points.append([(x,sy),(x,min(sy+3.5,nextY-6))]);sy+=9.5
            fg=np.array([24]*3,float)
        coords=np.array([v for path in points for v in path]);left=int(coords[:,0].min())-8;top=int(coords[:,1].min())-8;right=int(coords[:,0].max())+9;bottom=int(coords[:,1].max())+9;mask=np.zeros(((bottom-top)*4,(right-left)*4),dtype='uint8')
        for path in points:cv2.polylines(mask,[np.round((np.array(path)-[left,top])*4).astype('int32')],False,255,7,cv2.LINE_AA)
        mask=cv2.resize(mask,(right-left,bottom-top),interpolation=cv2.INTER_AREA).astype('float32')/255;connections.append(dict(id=f'{kind}-{i}',kind=kind,index=i,box=[left,top,right,bottom],mask=mask,fg=fg,curve=[]))
for f in indices:
    raw=p.stdout.read(1920*1080*3)
    if len(raw)!=1920*1080*3:raise ValueError(f)
    a=np.frombuffer(raw,np.uint8).reshape(1080,1920,3).astype('float32');t=f/60
    if f<229:
        bg=np.median(a[3:9,x0:x1],axis=0);v=np.array([255]*3)-bg;target=np.sqrt(np.sum((a[973:1020,x0:x1]-bg)**2,2));_,rho,_,(_,dy)=peak(target,bylineMask)
        if rho<.4 or np.max(abs(v))<5:byline.append([round(t,6),0,0]);continue
        D=a[973+dy:973+dy+bylineMask.shape[0],x0:x1]-bg;pred=bylineMask[:,:,None]*v[None,:,:];alpha=float(np.sum(D*pred)/max(.01,float(np.sum(pred*pred))));byline.append([round(t,6),round(float(np.clip(alpha,0,1)),4),973+dy-y0]);continue
    bg=np.median(a[3:9,30:1200],axis=(0,1))
    for e in connections:
        left,top,right,bottom=e['box'];mask=e['mask'];target=np.sqrt(np.sum((a[top-4:bottom+4,left-4:right+4]-bg)**2,2));_,rho,_,(dx,dy)=peak(target,mask)
        if rho<.4:e['curve'].append([round(t,6),0,*e['fg'].tolist(),0,0]);continue
        D=a[top-4+dy:bottom-4+dy,left-4+dx:right-4+dx]-bg;K=np.sum(mask[:,:,None]*D,axis=(0,1))/max(.01,float(np.sum(mask*mask)));v=e['fg']-bg;alpha=float(K@v/max(1,float(v@v)));minimum=np.where(K>=0,K/np.maximum(255-bg,.001),-K/np.maximum(bg,.001));alpha=float(np.clip(max(alpha,float(minimum.max())),0,1));color=np.clip(bg+K/max(.001,alpha),0,255);e['curve'].append([round(t,6),round(alpha,4),*np.round(color,2).tolist(),dx-4,dy-4])
p.stdout.close()
if p.wait():raise RuntimeError('small layer decode')
for e in connections:e.pop('mask');e.pop('fg');e.pop('box')
(OUT/'small-layers-round2.json').write_text(json.dumps(dict(byline=byline,connections=connections),separators=(',',':')),encoding='utf8');print('small layer curves complete',flush=True)
