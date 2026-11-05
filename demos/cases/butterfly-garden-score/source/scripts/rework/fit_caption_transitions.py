import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
shots=read(CASE/'film/data/shots.json');caps=np.load(ANA/'frames/captions.npy',mmap_mode='r');backgrounds=np.array(read(ANA/'frames/scan.json')['backgrounds']);events=shots['captions'];scale=.25;size=(254,31);dys=np.arange(-10,13,dtype=float)
print('backgrounds',[(f,np.median(caps[f],axis=(0,1)).tolist(),backgrounds[f].tolist())for f in [480,1260,3606,4260]],flush=True)
def coverage(frame):
    a=caps[frame].astype('float32');bg=backgrounds[frame];red=bg[1]<100
    colors=np.zeros_like(a);colors[:36]=[255]*3 if red else[129,122,69];colors[36:85]=[255]*3 if red else[24]*3;colors[85:]=[255]*3 if red else[103]*3
    v=colors-bg;m=np.clip(np.sum((a-bg)*v,2)/np.maximum(np.sum(v*v,2),1),0,1)
    return cv2.resize(m,size,interpolation=cv2.INTER_AREA)
def shifted(mask):return np.stack([cv2.warpAffine(mask,np.array([[1,0,0],[0,1,dy*scale]],np.float32),size,flags=cv2.INTER_LINEAR)for dy in dys])
def colors(bg):
    q=float(np.clip((255-bg[1])/247,0,1));c=np.zeros((31,254,3),dtype='float32');c[:9]=np.array([129,122,69])*(1-q)+255*q;c[9:21]=24*(1-q)+255*q;c[21:]=103*(1-q)+255*q
    return c-bg
for ei,e in enumerate(events):
    t=e['t'];previous=events[ei-1]['t']if ei else 0;following=events[ei+1]['t']if ei+1<len(events)else 122
    before=max(0,round((previous+t)/2*60));after=min(7319,round((t+following)/2*60));ma=coverage(before)if e.get('old')else np.zeros((31,254),np.float32);mb=coverage(after)
    ta=shifted(ma);tb=shifted(mb);start=max(0,round(min(e['t0'],t-.5)*60));end=min(round((following-.4)*60),round(max(e['t1'],t+1.2)*60));keys=[]
    for f in range(start,end+1):
        bg=backgrounds[f].astype('float32');color=colors(bg);A=(ta[:,:,:,None]*color).reshape(len(dys),-1);B=(tb[:,:,:,None]*color).reshape(len(dys),-1);target=cv2.resize(caps[f].astype('float32')-bg,size,interpolation=cv2.INTER_AREA).reshape(-1)
        aa=np.sum(A*A,1)[:,None]+.001;bb=np.sum(B*B,1)[None,:]+.001;ab=A@B.T;ay=(A@target)[:,None];by=(B@target)[None,:];det=np.maximum(aa*bb-ab*ab,.001)
        ca=np.clip((ay*bb-by*ab)/det,0,1);cb=np.clip((by*aa-ay*ab)/det,0,1);loss=ca*ca*aa+cb*cb*bb+2*ca*cb*ab-2*ca*ay-2*cb*by
        # Displacements stay close to the common fade-up motion when two phrases overlap.
        loss+=250*(np.maximum(dys[:,None],0)**2+np.minimum(dys[None,:],0)**2)
        ia,ib=np.unravel_index(np.argmin(loss),loss.shape);keys.append([round(f/60,6),round(float(ca[ia,ib]),5),float(dys[ia]),round(float(cb[ia,ib]),5),float(dys[ib])])
    e['t0']=start/60;e['t1']=end/60;e['curve']=keys;print('caption',ei,t,'atSwitch',keys[round(t*60)-start],flush=True)
(WORK/'caption-transition-fits.json').write_text(json.dumps(events,ensure_ascii=False,separators=(',',':')),encoding='utf8')
