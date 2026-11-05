import sys
from pathlib import Path
import json,subprocess,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
score=read(CASE/'film/data/notes.json');rowNames=list(dict.fromkeys(n['row']for n in score['notes']));tracks={r:np.array(k)for r,k in read(CASE/'film/data/rowStates.json')['rows'].items()};notes=[n for n in score['notes']if n['x1']-n['x0']>=14];samples=[]
p=subprocess.Popen(['ffmpeg','-v','error','-i',str(ROOT/'audio/case.mp4'),'-an','-vf','format=rgb24,scale=1920:1080:flags=area,crop=780:540:450:225','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for f in range(7320):
    raw=p.stdout.read(780*540*3)
    if len(raw)!=780*540*3:raise ValueError(f)
    t=f/60
    if f<180 or f>7000 or any(a<t<b for a,b in [(8.3,12.4),(20.1,23.3),(27.5,29),(39,47.5),(56.2,61.4),(76.2,77.8),(81,85),(88,93.5)]):continue
    a=np.frombuffer(raw,np.uint8).reshape(540,780,3);bg=np.median(a[0:4,20:200],axis=(0,1)).astype(float);mode=0 if bg[1]>200 else 1 if bg[1]<60 else -1
    if mode<0:continue
    poses={r:(float(np.interp(t,k[:,0],k[:,1])),float(np.interp(t,k[:,0],k[:,2])))for r,k in tracks.items()}
    for n in notes:
        dt=t-n['x0']/190;de=t-(n['x1']+6)/190
        future=dt<-.1;current=dt>=0 and de<0;past=0<=de<1.6
        if not(future or current or past):continue
        x0=n['x0']-190*t+880;x1=n['x1']-190*t+880
        if future:x=max(x0+5,980)
        elif current:x=max(x0+5,min(x1-6,883))
        else:x=x1-6
        if not 455<x<1223 or x>=x1-3 or abs(x-880)<5:continue
        cy,alpha=poses[n['row']];y=cy+n['yOffset']
        if alpha<.7 or not 234<y<755:continue
        xx=round(x-450);yy=round(y-225);profile=np.median(a[yy-7:yy+8,xx-1:xx+2].astype(float),axis=1);delta=profile-bg;strength=np.max(abs(delta),axis=1);j=int(np.argmax(strength));color=bg+delta[j]/alpha
        if np.max(strength)<18 or np.max(color)>267 or np.min(color)<-12:continue
        core=delta[j];weights=np.clip(delta@core/max(float(core@core),1),0,1.2);lo=j;hi=j
        while lo>0 and weights[lo-1]>.08:lo-=1
        while hi+1<len(weights)and weights[hi+1]>.08:hi+=1
        h=float(np.sum(weights[lo:hi+1]));samples.append([rowNames.index(n['row']),mode,t,dt,de,*np.clip(color,0,255).tolist(),h])
    if f%600==0:print('frame release',f,len(samples),flush=True)
p.stdout.close()
if p.wait():raise RuntimeError('ffmpeg state samples')
np.savez_compressed(WORK/'video-color-samples.npz',samples=np.array(samples,dtype='float32'),rows=np.array(rowNames));print('frame release samples',len(samples),flush=True)
