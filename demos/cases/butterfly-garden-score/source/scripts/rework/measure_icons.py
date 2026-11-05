import sys
from pathlib import Path
import json,numpy as np
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score'
boxes=[[1187,926,1209,965],[1230,926,1253,965],[1266,926,1304,965],[1314,926,1340,965],[1352,926,1390,965],[1395,930,1432,956],[1443,926,1470,965],[1486,926,1513,965],[1529,926,1556,965]]
names=['ob','va','hn','cl','hn','fl','ob','cl','cl'];onsets=[7.65,9.566667,15.316667,22.966667,24.883333,30.65,62.25,64.2,89.25]
samples=[]
for t in [8,16,24,26,32,64,66,71,80,97,110]:
    im=np.array(Image.open(WORK/'reference'/f'{t*60:05d}.png')).astype(float);bg=np.median(im[910:920,1180:1560],axis=(0,1));mode='red'if bg[1]<100 else'white';selected=max(i for i,v in enumerate(onsets)if t>=v)
    for i,(box,name)in enumerate(zip(boxes,names)):
        x0,y0,x1,y1=box;alpha=Image.open(CASE/'assets'/f'instrument-{i+1:02d}-{name}-black.png').getchannel('A').resize((x1-x0,y1-y0),Image.Resampling.LANCZOS);a=np.array(alpha)/255
        patch=im[y0:y1,x0:x1];fg=bg+np.sum((patch-bg)*a[:,:,None],axis=(0,1))/np.sum(a*a)
        state='current'if i==selected else'past'if i<selected else'future'
        samples.append(dict(t=t,icon=i,state=state,background=mode,rgb=np.round(fg,3).tolist()))
summary=[]
for mode in ['white','red']:
    for state in ['past','current','future']:
        values=[s['rgb']for s in samples if s['state']==state and s['background']==mode]
        summary.append(dict(background=mode,state=state,rgb=np.round(np.median(values,axis=0),3).tolist(),samples=len(values)))
(WORK/'icon-state-samples.json').write_text(json.dumps(dict(summary=summary,samples=samples),ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(summary),flush=True)
