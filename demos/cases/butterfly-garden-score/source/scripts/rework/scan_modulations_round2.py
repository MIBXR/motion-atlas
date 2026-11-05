import sys
from pathlib import Path
import json,cv2,numpy as np
from PIL import Image,ImageDraw
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';refs=OUT/'residual-reference'
obs=[]
for f in range(180,7020,6):
    a=cv2.cvtColor(cv2.imread(str(refs/f'{f:05d}.png')),cv2.COLOR_BGR2RGB);bg=np.median(a[198:218,300:690],axis=(0,1));patch=a[220:780,180:1580];m=np.max(abs(patch.astype(float)-bg),2)>55
    count=np.sum(m,axis=0);runs=np.sum(np.diff(m.astype('int8'),axis=0)>0,axis=0);xs=np.flatnonzero((count>95)&(count<430)&(runs>=30))
    choices=[]
    for x in xs:
        starts=np.flatnonzero(np.diff(np.r_[False,m[:,x]].astype('int8'))>0);gaps=np.diff(starts);period=float(np.median(gaps))if len(gaps)else 0
        regular=float(np.mean(abs(gaps-9)<1.1))if len(gaps)else 0
        if regular<.45:continue
        choices.append((int(x),float(regular),int(count[x])))
    groups=[]
    for c in choices:
        if not groups or c[0]-groups[-1][-1][0]>3:groups.append([c])
        else:groups[-1].append(c)
    for group in groups:
        x=int(max(group,key=lambda c:c[1]*c[2])[0])+180;gx=x+190*f/60-880;obs.append(dict(frame=f,x=x,globalX=round(gx,3),regularity=max(c[1]for c in group)))
events=[]
for o in obs:
    e=next((e for e in events if abs(np.median([v['globalX']for v in e])-o['globalX'])<12 and o['frame']-e[-1]['frame']<=90),None)
    if e is None:events.append([o])
    else:e.append(o)
events=[e for e in events if len(e)>=3];result=[]
sheet=Image.new('RGB',(1000,max(1,len(events))*110),'white');draw=ImageDraw.Draw(sheet)
for i,e in enumerate(events):
    gx=float(np.median([o['globalX']for o in e]));peak=max(e,key=lambda o:o['regularity']);f=peak['frame'];x=peak['x'];a=Image.open(refs/f'{f:05d}.png');crop=a.crop((max(180,x-10),190,min(1580,x+270),245));crop=crop.resize((crop.width*2,crop.height*2));sheet.paste(crop,(350,i*110));draw.text((5,i*110+5),f'{e[0]["frame"]}-{e[-1]["frame"]} gx={gx:.2f} peak={f}',fill='black');result.append(dict(first=e[0]['frame'],last=e[-1]['frame'],globalX=gx,peakFrame=f,observations=e))
sheet.save(OUT/'modulation-detection-sheet.png');(OUT/'modulation-detections.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps([{k:v for k,v in e.items()if k!='observations'}for e in result]),flush=True)
