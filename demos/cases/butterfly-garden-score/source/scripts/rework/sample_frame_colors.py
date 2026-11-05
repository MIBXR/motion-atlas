import sys
from pathlib import Path
import json,numpy as np
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';ANA=ROOT/'analysis/case';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
strip=np.load(ANA/'frames/strips.npy',mmap_mode='r');bg=np.array(read(ANA/'frames/scan.json')['backgrounds']);print('strip',strip.shape,[(f,np.median(strip[f],axis=(0,1)).tolist(),bg[f].tolist())for f in [480,4260]],flush=True)
score=read(CASE/'film/data/notes.json');tracks={r:np.array(k)for r,k in read(CASE/'film/data/rowStates.json')['rows'].items()};samples=[]
for f in range(180,7000):
    t=f/60
    if any(a<t<b for a,b in [(8.3,12.4),(20.1,21.5),(27.7,29),(39,43.5),(56.2,61.3),(76.2,77.8),(88,93.5)]):continue
    mode=0 if bg[f,1]>200 else 1 if bg[f,1]<60 else -1
    if mode<0:continue
    gx=190*t+4
    for n in score['notes']:
        if not n['x0']+2<gx<n['x1']-2:continue
        a=tracks[n['row']];cy=float(np.interp(t,a[:,0],a[:,1]));alpha=float(np.interp(t,a[:,0],a[:,2]));y=cy+n['yOffset']
        if alpha<.7 or not 232<y<758:continue
        yy=int(round(y-225));patch=strip[f,yy-3:yy+4,15:19].astype(float);delta=patch-bg[f];strength=np.max(abs(delta),2);v=np.unravel_index(np.argmax(strength),strength.shape);color=bg[f]+delta[v]/alpha
        if np.max(abs(delta[v]))<20 or np.max(color)>267 or np.min(color)<-12:continue
        samples.append(dict(row=n['row'],mode=mode,t=round(t,6),dt=t-n['x0']/190,de=t-(n['x1']+6)/190,color=np.clip(color,0,255).tolist()))
(WORK/'frame-color-samples.json').write_text(json.dumps(samples,separators=(',',':')),encoding='utf8');print('frame samples',len(samples),flush=True)
