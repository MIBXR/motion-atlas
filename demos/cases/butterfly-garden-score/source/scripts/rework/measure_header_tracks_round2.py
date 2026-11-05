import sys
from pathlib import Path
import json,numpy as np,cv2
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case/frames';cv2.setNumThreads(2)
images=np.load(ANA/'headers.npy',mmap_mode='r');strips=np.load(ANA/'strips.npy',mmap_mode='r');heads=np.load(ANA/'heads.npy');times=[4.783333,20.15,27.766667,43.466667,81.016667];refs=[720,1380,1920,3120,5820];items=[]
for i,f in enumerate(refs):
    a=images[f].astype('float32');bg=np.median(a,axis=(0,1));d=np.sqrt(np.sum((a-bg)**2,2));latin=d[:27].copy();key=d[31:].copy();latin/=max(1,np.percentile(latin[latin>5],98));key/=max(1,np.percentile(key[key>5],98));items.append(dict(scene=i+1,t0=times[i]-1,t1=times[i+1]+1 if i<4 else 122.005,latin=latin,key=key,curve=[]))
def peak(target,mask):
    cc=cv2.matchTemplate(target,mask,cv2.TM_CCOEFF_NORMED);h,w=mask.shape;mean=cv2.boxFilter(target,-1,(w,h),anchor=(0,0));sq=cv2.boxFilter(target*target,-1,(w,h),anchor=(0,0));cc[(sq-mean*mean)[:cc.shape[0],:cc.shape[1]]<2]=-1;_,rho,_,(x,y)=cv2.minMaxLoc(cc);delta=0
    if 0<y<len(cc)-1:
        v=cc[y-1:y+2,0];den=float(v[0]-2*v[1]+v[2]);delta=float(np.clip((v[0]-v[2])/(2*den),-.5,.5))if abs(den)>1e-8 else 0
    return rho,y+delta
def shifted(mask,dy,top):
    return cv2.warpAffine(mask,np.array([[1,0,0],[0,1,top+dy]],dtype='float32'),(470,69),flags=cv2.INTER_LINEAR)
for f in range(7320):
    t=f/60;active=[e for e in items if e['t0']<=t<=e['t1']]
    if not active:continue
    a=images[f].astype('float32');bg=np.median(a,axis=(0,1));target=np.sqrt(np.sum((a-bg)**2,2));ink=np.array([24]*3,dtype='float32')
    if heads[f,0]>866 and heads[f,0]<893 and t<116.9:
        s=strips[f].astype('float32');best=None
        for x in range(max(0,round(heads[f,0])-868-1),min(25,round(heads[f,0])-868+2)):
            med=np.median(s[:,x],axis=0);var=float(np.mean(abs(s[:,x]-med)))
            if best is None or var<best[0]:best=(var,med)
        if best is not None:ink=best[1]
    keym=[];latinm=[];poses=[]
    for e in active:
        rho,y=peak(target,e['latin'][11:21]);dy=float(np.clip(y-11,-11,11));poses.append(dy);keym.append(shifted(e['key'],dy,31));latinm.append(shifted(e['latin'],dy,0))
    keyX=np.stack([m.ravel()for m in keym],axis=1);v=ink-bg;projection=np.sum((a-bg)*v,2)/max(1,float(v@v));source=projection.ravel();alpha=np.linalg.lstsq(keyX[31*470:],source[31*470:],rcond=None)[0];alpha=np.clip(alpha,0,1)
    latinX=np.stack([m.ravel()for m in latinm],axis=1);observed=(a-bg).reshape(-1,3);coeff=np.linalg.lstsq(latinX[:31*470],observed[:31*470],rcond=None)[0]
    for i,e in enumerate(active):
        op=float(alpha[i]);olive=np.clip(bg+coeff[i]/max(.01,op),0,255);e['curve'].append([round(t,6),round(op,4),round(poses[i],3),*ink.tolist(),*np.round(olive,2).tolist()])
    if f%600==0:print('header frames',f,flush=True)
for e in items:e.pop('latin');e.pop('key')
(OUT/'header-tracks-round2.json').write_text(json.dumps(items,ensure_ascii=False,separators=(',',':')),encoding='utf8');print('header tracks complete',flush=True)
