import sys
from pathlib import Path
from collections import defaultdict
import json,numpy as np
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';CASE=REPO/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(p.read_text(encoding='utf8'))
score=read(CASE/'film/data/notes.json');shots=read(CASE/'film/data/shots.json');notes=score['notes'];frames=read(OUT/'round3-sample-points.json');colors={e['frame']:e['colors']for e in read(OUT/'round3-render-colors.json')};groups=defaultdict(list)
def qAt(t):
    q=0
    for e in shots['backgrounds']:
        if t>=e['t1']:q=e['to']
        elif t>=e['t0']:
            k=np.array(e['curve']);q=np.interp(t,k[:,0],k[:,1]);break
    return q
for f in frames:
    t=f['frame']/60;q=qAt(t)
    if t<3.2 or .03<q<.97 or any(e['t0']-.2<t<e['t1']+.2 for e in shots['focus'])or any(e['t0']-.1<t<e['t1']+.1 for e in shots['giants'])or 39<t<44 or t>116.8:continue
    B=np.array([255]*3)*(1-q)+np.array([232,8,39])*q
    for s,R in zip(f['samples'],colors[f['frame']]):
        if s['reasons']or s['rowAlpha']<.25:continue
        i=s['note'];n=notes[i];stage=s['stage'];mode=s['mode'];start=n['x0']/190;end=(n['x1']+6)/190
        if abs(t-start)<.025 or abs(t-end)<.06 or stage==2 and t-end<.8:continue
        D=np.array(R)-B;S=np.array(s['source'])-B
        if float(D@D)<12**2:continue
        ratio=float(S@D/max(1,float(D@D)));a=n['stateAlpha'][mode][stage]*ratio
        perpendicular=float(np.linalg.norm(S-D*ratio))
        if perpendicular>30:continue
        groups[(i,mode,stage)].append((t,float(np.clip(a,0,1)),ratio))
evidence=[]
for (i,m,s),obs in groups.items():
    if len(obs)<(1 if s==1 else 3):continue
    values=np.array([o[1]for o in obs]);old=notes[i]['stateAlpha'][m][s];new=round(float(np.median(values)),3)
    if abs(old-new)<.015:continue
    notes[i]['stateAlpha'][m][s]=new;evidence.append(dict(note=i,row=notes[i]['row'],mode=m,stage=s,alpha=new,spatialTemporalSamples=len(obs),iqr=np.percentile(values,[25,75]).tolist(),sourceFrames=[round(o[0]*60)for o in obs]))
(CASE/'film/data/notes.json').write_text(json.dumps(score,ensure_ascii=False,separators=(',',':')),encoding='utf8');(OUT/'round3-state-median-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf8');print('constrained source/render state medians',len(evidence),'notes',len(set(e['note']for e in evidence)),flush=True)
