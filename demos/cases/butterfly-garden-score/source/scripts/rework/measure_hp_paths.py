import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';ANA=ROOT/'analysis/case'
candidates=[]
for f in range(3180,4591,30):
    t=f/60
    if 56.2<t<60.4:continue
    a=cv2.cvtColor(cv2.imread(str(ANA/'frames'/f's{f:05d}.jpg')),cv2.COLOR_BGR2RGB);patch=a[567:620,180:1580].astype(float);bg=np.median(a[195:218,300:790],axis=(0,1));contrast=np.max(abs(patch-bg),2);mask=(contrast>max(7,22 if bg[1]>150 else 7)).astype('uint8');mask[:,696:705]=0
    lines=cv2.HoughLinesP(mask,1,np.pi/7200,30,minLineLength=65,maxLineGap=7)
    if lines is None:continue
    for x0,y0,x1,y1 in np.asarray(lines).reshape(-1,4):
        if x1<=x0:continue
        slope=(y1-y0)/(x1-x0)
        if not(-.18<slope<-.045)or x1-x0<100 or x0<4 or x1>1395:continue
        candidates.append(dict(x0=round(float(x0+180+190*t-880),2),y0=float(y0+567),x1=round(float(x1+180+190*t-880),2),y1=float(y1+567),slope=slope,sourceFrame=f))
paths=[]
for c in sorted(candidates,key=lambda c:c['x1']-c['x0'],reverse=True):
    duplicate=False
    for p in paths:
        overlap=max(0,min(c['x1'],p['x1'])-max(c['x0'],p['x0']))
        expected=p['y0']+(c['x0']-p['x0'])*p['slope']
        if overlap>.65*min(c['x1']-c['x0'],p['x1']-p['x0'])and abs(c['y0']-expected)<3:duplicate=True;break
    if not duplicate:paths.append(c)
result=[]
for c in sorted(paths,key=lambda p:p['x0']):
    x0=c['x0'];x1=c['x1'];result.append(dict(row='Hp.',points=[[x0,c['y0']],[x1,c['y1']]],t0=x0/190,t1=x1/190,sourceFrame=c['sourceFrame']))
(WORK/'hp-paths.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result),flush=True)
