import sys
from pathlib import Path
from functools import lru_cache
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';CASE=REPO/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(p.read_text(encoding='utf8'))
score=read(CASE/'film/data/notes.json');notes=score['notes'];states=read(CASE/'film/data/rowStates.json')['rows'];evidence=[];remove=[]
@lru_cache(maxsize=8)
def image(f):return cv2.cvtColor(cv2.imread(str(OUT/'round3-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32')
for i,n in enumerate(notes):
    if n['x1']-n['x0']<90:continue
    children=[(j,e)for j,e in enumerate(notes)if j!=i and e['row']==n['row']and abs(e['yOffset']-n['yOffset'])<1.6 and e['x0']>=n['x0']-3 and e['x1']<=n['x1']+3 and e['x1']-e['x0']<(n['x1']-n['x0'])*.85]
    if len(children)<2:continue
    intervals=sorted((e['x0'],e['x1'])for j,e in children);merged=[]
    for l,r in intervals:
        if merged and l<=merged[-1][1]:merged[-1][1]=max(r,merged[-1][1])
        else:merged.append([l,r])
    if sum(r-l for l,r in merged)<(n['x1']-n['x0'])*.65:continue
    gaps=[(r,ll)for(l,r),(ll,rr)in zip(merged,merged[1:])if ll-r>=4];observations=[]
    for l,r in gaps:
        world=(l+r)/2
        for f in range(max(200,int((world-650)/190*6)*10),min(6980,int((world+650)/190*6)*10)+1,10):
            t=f/60
            if any(a<t<b for a,b in [(8.3,12.4),(20,23.6),(39,47.5),(56.2,60.6),(76.2,77.5),(81,85),(88,93.5)]):continue
            k=np.array(states[n['row']]);cy,op=[np.interp(t,k[:,0],k[:,v])for v in [1,2]]
            if op<.25:continue
            x=round(world-190*t+880);y=cy+n['yOffset']
            if not 190<x<1570 or abs(x-880)<8:continue
            ys=np.array([yy for yy in range(round(y-2),round(y+2)+1)if abs(yy+.5-cy-.5)>1]);a=image(f);paper=np.median(a[193:215,900:1200],axis=(0,1));patch=a[ys,x:x+1];strength=float(np.max(abs(patch-paper)))/op if len(ys)else 999
            observations.append(dict(frame=f,world=world,x=x,y=y,contrast=round(strength,2)))
    low=[o for o in observations if o['contrast']<12]
    if len(low)>=4 and len(low)>len(observations)*.6:
        remove.append(i);decision='删除：拼接出的长条跨过原片空白间隙，已有独立短音覆盖'
    else:decision='保留：空白间隙证据不足'
    evidence.append(dict(note=i,row=n['row'],x0=n['x0'],x1=n['x1'],children=[j for j,e in children],gaps=gaps,decision=decision,observations=observations))
score['notes']=[n for i,n in enumerate(notes)if i not in remove]
(CASE/'film/data/notes.json').write_text(json.dumps(score,ensure_ascii=False,separators=(',',':')),encoding='utf8');(OUT/'round3-duplicates-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf8');print('duplicate aggregates removed',remove,'notes',len(score['notes']),flush=True)

