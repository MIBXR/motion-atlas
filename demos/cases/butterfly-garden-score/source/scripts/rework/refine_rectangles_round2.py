import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';refs=OUT/'residual-reference';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
score=read(CASE/'film/data/notes.json');notes=score['notes'];tracks={r:np.array(k)for r,k in read(CASE/'film/data/rowStates.json')['rows'].items()};samples=[[]for n in notes];presence=[[]for n in notes];colorPairs=[]
cache=OUT/'rectangle-samples-round2.json'
hs=np.arange(.75,8.01,.25);dys=np.arange(-5,5.01,.5);hh,dd=np.meshgrid(hs,dys);hh=hh.ravel();dd=dd.ravel()
for f in ([] if cache.exists() else range(210,6991,18)):
    t=f/60
    if any(a<t<b for a,b in [(8.3,12.4),(20.1,21.6),(27.7,29),(39,43.4),(56.2,60.5),(76.2,77.8),(88,93.5)]):continue
    a=cv2.cvtColor(cv2.imread(str(refs/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32');paper=np.median(a[193:218,900:1200],axis=(0,1));mode=int(paper[1]<100);poses={r:(float(np.interp(t,k[:,0],k[:,1])),float(np.interp(t,k[:,0],k[:,2])))for r,k in tracks.items()}
    bases={}
    for row,(cy,op)in poses.items():
        if not 230<cy<770:continue
        y0=int(np.floor(cy))-18;band=a[y0:y0+37,180:1580];mag=np.max(abs(band-paper),2);ix=np.argsort(mag,axis=1)[:,:20];base=np.median(np.take_along_axis(band,ix[:,:,None],axis=1),axis=1)
        fallback=paper+((np.array([235,43,69])if mode else np.array([230]*3))-paper)*op*np.maximum(0,np.minimum(np.arange(y0,y0+37)+1,cy+1)-np.maximum(np.arange(y0,y0+37),cy))[:,None]
        unreliable=np.max(abs(base-paper),1)>42;base[unreliable]=fallback[unreliable];bases[row]=(y0,base)
    for ni,n in enumerate(notes):
        if n['kind']=='dot' or n['row']not in bases:continue
        x0=n['x0']-190*t+880;x1=n['x1']-190*t+880
        if x1<195 or x0>1565 or x1-x0<9:continue
        cy,op=poses[n['row']]
        if op<.35:continue
        y=cy+n['yOffset'];top=int(np.floor(y))-10
        if top<228 or top+21>779:continue
        l=max(185,int(np.ceil(x0+3)));r=min(1575,int(np.floor(x1-3)))
        if r-l<4:continue
        pxs=np.linspace(l+1,r-2,min(3,max(1,(r-l)//16))).astype(int);pxs=[int(x)for x in pxs if abs(x-880)>6]
        if not pxs:continue
        profiles=[]
        by0,base=bases[n['row']];B=base[top-by0:top-by0+21]
        if len(B)!=21:continue
        Y=np.arange(top,top+21)+.5;centers=y+dd
        cov=np.maximum(0,np.minimum(Y[None,:]+.5,centers[:,None]+hh[:,None]/2)-np.maximum(Y[None,:]-.5,centers[:,None]-hh[:,None]/2)).astype('float32');cc=np.sum(cov*cov,1);cov2=cov*cov
        for px in pxs:
            O=np.median(a[top:top+21,px-1:px+2],axis=1);d=O-B
            if float(np.max(abs(d)))<9:continue
            foreground=(cov@d+cov2@B)/cc[:,None];foreground=np.clip(foreground,0,255);prediction=B[None,:,:]*(1-cov[:,:,None])+foreground[:,None,:]*cov[:,:,None];err=np.mean((prediction-O)**2,axis=(1,2))
            # Choose the nearest observed voice when the old candidate lies between two voices.
            err+=.05*dd*dd
            k=int(np.argmin(err));height=float(hh[k]);center=float(centers[k]);loss=float(err[k]);ink=foreground[k];strength=float(np.max(abs(ink-paper)))
            if loss>90 or strength<15 or height>=7.99:continue
            state=0 if t<n['x0']/190-.15 else 1 if t>n['x0']/190+.15 and t<(n['x1']+6)/190-.15 else 2 if t>(n['x1']+6)/190+.8 else -1
            samples[ni].append([f,state,round(center-cy,3),height,round(loss,3),*np.round(ink,3).tolist()])
        # The native gaps distinguish repeated notes from a mistakenly merged long rectangle.
        if n['x1']-n['x0']>90 and op>.65:
            yy=int(round(y));band=a[yy-1:yy+1,l:r];localbase=base[yy-1-by0:yy+1-by0];signal=np.max(abs(band-localbase[:,None,:]),axis=(0,2));peak=float(np.percentile(signal,85));mask=signal>max(9,peak*.24)
            starts=np.flatnonzero(np.diff(np.r_[False,mask,False].astype('int8')));runs=[(int(s+l+190*t-880),int(e+l+190*t-880))for s,e in zip(starts[::2],starts[1::2])if e-s>=5]
            gaps=[(runs[i][1],runs[i+1][0])for i in range(len(runs)-1)if runs[i+1][0]-runs[i][1]>=3]
            if gaps:presence[ni].append(dict(frame=f,runs=runs,gaps=gaps))
    if f%180==30:print('rectangle sample',f,sum(len(s)for s in samples),flush=True)
if cache.exists():
    saved=read(cache);samples=saved['samples'];presence=saved['presence']
else:cache.write_text(json.dumps(dict(samples=samples,presence=presence),separators=(',',':')),encoding='utf8')
result=[]
for i,(n,ss)in enumerate(zip(notes,samples)):
    if not ss:result.append(dict(index=i,row=n['row'],count=0));continue
    ar=np.array(ss);good=ar[:,4]<min(40,float(np.percentile(ar[:,4],75))+1)
    if not np.any(good):result.append(dict(index=i,row=n['row'],count=0,rejection='source profile is not one rectangle'));continue
    ar=ar[good];centers=ar[:,2];bins=np.round(centers*2)/2;values,counts=np.unique(bins,return_counts=True);density=np.array([np.sum(counts[abs(values-v)<1.1])for v in values]);choice=np.flatnonzero(density==density.max());chosen=int(choice[np.argmin(abs(values[choice]-n['yOffset']))]);center=float(values[chosen]);same=abs(centers-center)<1.1;ar=ar[same];center=float(np.median(ar[:,2]))
    heights=[]
    for state in range(3):
        values=ar[ar[:,1]==state,3];heights.append(float(np.median(values))if len(values)>=2 else None)
    result.append(dict(index=i,row=n['row'],count=len(ss),yOffset=round(center*2)/2,heights=heights,medianLoss=float(np.median(ar[:,4])),clusters=[[float(v),int(c)]for v,c in zip(values,counts)],samples=ss))
(OUT/'rectangle-fits-round2.json').write_text(json.dumps(result,separators=(',',':')),encoding='utf8');(OUT/'native-note-gaps.json').write_text(json.dumps({str(i):p for i,p in enumerate(presence)if p},separators=(',',':')),encoding='utf8')
print('rectangle fits',sum(bool(s)for s in samples),'samples',sum(len(s)for s in samples),flush=True)
