import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
old=read(OUT/'hp-full-measurements.json');results=[]
old['paths'].insert(0,dict(points=[[725.5,596],[911,576]],radius=3.5))
for index,p in enumerate(old['paths']):
    end=np.array(p['points'][1]);starts=[o['points'][0]for o in old['observations']if abs(o['points'][1][0]-end[0])<3]
    start=np.array([np.percentile(np.array(starts)[:,0],70 if 3800<end[0]<3900 else 10),596.5])
    samples=[]
    for f in range(max(180,int((start[0]-500)/190*60/6)*6),min(6990,int((start[0]+500)/190*60/6)*6),6):
        if any(a<f/60<b for a,b in [(8.3,12.4),(22.2,28),(39,43.4),(56.2,60.5),(88,93.5)]):continue
        sx=start[0]-190*f/60+880;ex=end[0]-190*f/60+880
        if not 200<sx<1350 or ex>1560:continue
        im=cv2.cvtColor(cv2.imread(str(OUT/'residual-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype(float)
        native=im[566:616,180:1580]
        # The median of the clean columns retains the stave, removing it from the sloping stroke.
        bg=np.median(native,axis=1);d=native-bg[:,None,:];strength=np.sqrt(np.sum(d*d,2));xy=[]
        for x in range(round(sx+8),round(ex-8)):
            if abs(x-880)<4:continue
            y=start[1]+(end[1]-start[1])*(x-sx)/(ex-sx)
            lo=max(0,int(y)-566-3);hi=min(50,int(y)-566+4)
            if hi<=lo or abs(y-586)<2:continue
            v=strength[lo:hi,x-180];peak=v.max()
            if peak<5:continue
            yy=np.arange(lo,hi)+566.5;v=np.maximum(0,v-peak*.08)
            cy=float(np.sum(yy*v)/v.sum())
            if abs(cy-y)<2:xy.append([x,cy,float(v.sum())])
        if len(xy)<75:continue
        xy=np.array(xy);X=np.stack([np.ones(len(xy)),xy[:,0]],1);coef=np.linalg.lstsq(X*xy[:,2,None]**.5,xy[:,1]*xy[:,2]**.5,rcond=None)[0]
        residual=abs(X@coef-xy[:,1]);good=residual<.6
        if good.sum()<65:continue
        coef=np.linalg.lstsq(X[good],xy[good,1],rcond=None)[0]
        xs=np.arange(round(sx)-16,round(sx)+20);energy=[]
        for x in xs:
            y=float(coef@[1,x]);lo=max(0,int(y)-566-3);hi=min(50,int(y)-566+4)
            energy.append(float(strength[lo:hi,x-180].sum()))
        energy=np.array(energy);baseline=float(np.median(energy[:8]));full=float(np.median(energy[-8:]));target=(baseline+full)/2
        crossing=np.flatnonzero((energy[:-1]<target)&(energy[1:]>=target))
        if not len(crossing)or full<10:continue
        j=min(crossing,key=lambda j:abs(xs[j]-sx));x=float(xs[j]+(target-energy[j])/(energy[j+1]-energy[j]));y=float(coef@[1,x])
        samples.append(dict(frame=f,start=[x-880+190*f/60,y],endY=float(coef@[1,ex]),width=float(np.median(xy[good,2])/max(1,np.percentile(strength,99.9))),coefficient=np.median(d[max(0,int(y)-566-1):min(50,int(y)-566+2),round(x)-180+5:round(x)-180+11],axis=(0,1)).tolist()))
    if not samples:raise ValueError(index)
    points=[[float(np.median([s['start'][0]for s in samples])),float(np.median([s['start'][1]for s in samples]))],[float(end[0]),float(np.median([s['endY']for s in samples]))]]
    points=(np.round(np.array(points)*2)/2).tolist()
    results.append(dict(row='Hp.',points=points,t0=points[0][0]/190,t1=points[1][0]/190,radius=p['radius'],samples=samples))
(OUT/'hp-refined-round2.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
print([{k:v for k,v in p.items()if k!='samples'}for p in results])
