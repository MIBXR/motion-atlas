import sys
from pathlib import Path
import json,cv2,numpy as np
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';ANA=ROOT/'analysis/case';pano=np.zeros((74,2000),dtype='uint8');origin=11000
for f in range(3630,4051,15):
    p=ANA/'frames'/f's{f:05d}.jpg'
    if not p.exists():continue
    a=cv2.cvtColor(cv2.imread(str(p)),cv2.COLOR_BGR2RGB);bg=float(np.median(a[195:218,300:790,1]));patch=np.clip((a[565:639,180:1580,1].astype(float)-bg)/max(1,255-bg)*255,0,255).astype('uint8');patch[:,696:705]=0;t=f/60;gx=round(190*t-700)-origin;left=max(0,gx);right=min(2000,gx+1400)
    if right>left:pano[:,left:right]=np.maximum(pano[:,left:right],patch[:,left-gx:right-gx])
mask=cv2.morphologyEx((pano>78).astype('uint8'),cv2.MORPH_CLOSE,np.ones((3,3),np.uint8));_,labels,stats,cents=cv2.connectedComponentsWithStats(mask);paths=[]
for k,(x,y,w,h,area)in enumerate(stats[1:],1):
    if not(w>65 and h>12 and area/w/h<.32):continue
    points=[]
    for xx in range(x,x+w):
        yy=np.flatnonzero(labels[:,xx]==k)
        if len(yy):points.append([float(xx+origin),float(np.median(yy)+565)])
    curve=cv2.approxPolyDP(np.array(points,dtype='float32'),.4,False).reshape(-1,2).tolist()
    paths.append(dict(row='Vln. I',points=curve,t0=points[0][0]/190,t1=points[-1][0]/190))
Image.fromarray(255-pano).save(WORK/'leggiero-panorama.png');(WORK/'leggiero-paths.json').write_text(json.dumps(paths,indent=2),encoding='utf8');print(json.dumps([dict(t0=p['t0'],t1=p['t1'],points=len(p['points']))for p in paths]),flush=True)
