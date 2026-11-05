import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';refs=OUT/'residual-reference';obs=[]
for f in range(180,6991,6):
    t=f/60
    if any(a<t<b for a,b in [(8.3,12.4),(22.2,28),(39,43.4),(56.2,60.4),(88,93.5)]):continue
    a=cv2.cvtColor(cv2.imread(str(refs/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype(float);bg=np.median(a[194:218,900:1200],axis=(0,1));patch=a[566:620,180:1580];signal=np.max(abs(patch-bg),2);mask=(signal>7).astype('uint8');mask[:,696:705]=0;ls=cv2.HoughLinesP(mask,1,np.pi/7200,30,minLineLength=100,maxLineGap=7)
    if ls is None:continue
    for x0,y0,x1,y1 in np.asarray(ls).reshape(-1,4):
        if not(x1-x0>110 and x0>4 and x1<1390):continue
        slope=(y1-y0)/(x1-x0)
        if not -.15<slope<-.055:continue
        last=x1;miss=0;linePeak=float(np.percentile(signal[max(0,y1-3):min(54,y1+4),max(0,x1-12):x1+1],90))
        for xx in range(x1,min(1395,x1+81)):
            yy=round(y0+slope*(xx-x0))
            if not 2<=yy<20:break
            ink=float(np.max(signal[max(0,yy-5):min(54,yy+6),xx]))
            if ink>max(8,linePeak*.2):last=xx;miss=0
            else:miss+=1
            if miss>=6:break
        x1=last;y1=round(y0+slope*(x1-x0))
        left=max(0,x1-14);right=min(1400,x1+2);top=max(0,y1-8);bottom=min(18,y1+10)
        if bottom<=top:continue
        p=signal[top:bottom,left:right];pm=(p>max(8,float(np.percentile(p,92))*.25)).astype('uint8');heights=[]
        for xx in range(pm.shape[1]):
            yy=np.flatnonzero(pm[:,xx])
            if len(yy):heights.append((xx,int(yy.max()-yy.min()+1),float((yy.max()+yy.min())/2)))
        if not heights:continue
        dx,diam,dy=max(heights,key=lambda v:v[1])
        if not 5<=diam<=11:continue
        maxx=max(v[0]for v in heights);r=(diam-1)/2;endx=left+maxx-r+180+.5+190*t-880;endy=top+dy+566.5
        # The start is the half-energy point of the round line cap.
        xs=np.arange(max(0,x0-80),min(1400,x0+12));energy=[]
        for xx in xs:
            yy=round(y0+slope*(xx-x0));energy.append(float(np.sum(signal[max(0,yy-2):min(54,yy+3),xx])))
        energy=np.array(energy);floor=float(np.median(energy[:3]));full=float(np.median(energy[-4:]));cross=np.flatnonzero(energy>(floor+full)/2)
        if not len(cross):continue
        j=int(cross[0]);startx=float(xs[j])
        if j and energy[j]!=energy[j-1]:startx=xs[j-1]+((floor+full)/2-energy[j-1])/(energy[j]-energy[j-1])
        starty=float(y0+slope*(startx-x0)+566.5);startx+=180+.5+190*t-880
        if not 140<endx-startx<310:continue
        obs.append(dict(frame=f,points=[[startx,starty],[endx,endy]],radius=r))
groups=[]
for o in obs:
    g=next((g for g in groups if abs(np.median([v['points'][1][0]for v in g])-o['points'][1][0])<12),None)
    if g is None:groups.append([o])
    else:g.append(o)
paths=[]
for g in groups:
    if len(set(o['frame']for o in g))<3:continue
    xy=np.median(np.array([o['points']for o in g]),axis=0);xy=np.round(xy*2)/2;paths.append(dict(row='Hp.',points=xy.tolist(),t0=float(xy[0,0]/190),t1=float(xy[1,0]/190),radius=float(np.median([o['radius']for o in g])),sourceFrames=sorted(set(o['frame']for o in g))))
(OUT/'hp-full-measurements.json').write_text(json.dumps(dict(paths=paths,observations=obs),separators=(',',':')),encoding='utf8');print(json.dumps([{k:v for k,v in p.items()if k!='sourceFrames'}for p in paths]),flush=True)
