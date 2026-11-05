import sys
from pathlib import Path
from collections import defaultdict
import json,csv,numpy as np,shutil
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';CASE=REPO/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(p.read_text(encoding='utf8'));score=read(CASE/'film/data/notes.json');notes=score['notes'];shots=read(CASE/'film/data/shots.json');frames=read(OUT/'round3-sample-points.json');renders={e['frame']:e['colors']for e in read(OUT/'round3-physical-input-colors.json')}
shutil.copyfile(CASE/'film/data/notes.json',OUT/'round3-before-physical.json')
with (OUT/'note-outliers.csv').open(encoding='utf-8-sig')as f:outliers=list(csv.DictReader(f))
proven={(int(e['frame']),int(e['note']))for e in outliers if e['judgement'].startswith('颜色/状态残差')};interiors={(e['frame'],e['note']):e['nativeMedian']for e in read(OUT/'round3-interior-evidence.json')};groups=defaultdict(list);releaseSamples=defaultdict(list)
for frame in frames:
    f=frame['frame'];t=f/60
    if t<3.2 or t>116.8 or 39<t<44 or any(e['t0']<=t<=e['t1']for e in shots['backgrounds'])or any(e['t0']-.1<t<e['t1']+.1 for e in shots['giants']+shots['focus']):continue
    for s,R in zip(frame['samples'],renders[f]):
        if s['reasons']or s['rowAlpha']<.25:continue
        i=s['note'];n=notes[i];m=s['mode'];st=s['stage'];isProven=(f,i)in proven;S=np.array(interiors[(f,i)]if isProven else s['source']);R=np.array(R);B=np.array([255]*3 if m==0 else[232,8,39]);F=np.array(score['rowColors'][f"{n['row']}:{m}"]['paint']['color']);v=F-B
        if not isProven and np.max(abs(S-R))>40:continue
        ratio=float((S-B)@v/max(1,float(v@v)));perp=np.linalg.norm(S-B-v*ratio)
        if ratio<.025 or perp>25:continue
        alpha=float(np.clip(ratio/s['rowAlpha'],0,1));start=n['x0']/190;end=(n['x1']+6)/190
        if st==2 and 0<t-end<1.1:releaseSamples[(n['row'],m)].append((i,t-end,alpha,f))
        if abs(t-start)<.06 or abs(t-end)<.08 or st==2 and t-end<.8:continue
        groups[(i,m,st)].append((alpha,f))
changes=[]
for(i,m,s),values in groups.items():
    if len(values)<(2 if s==1 else 3):continue
    old=notes[i]['stateAlpha'][m][s];new=round(float(np.median([v[0]for v in values])),3)
    if abs(new-old)<.025:continue
    notes[i]['stateAlpha'][m][s]=new;changes.append(dict(note=i,mode=m,stage=s,old=old,new=new,frames=[v[1]for v in values]))
for i,n in enumerate(notes):
    for m in [0,1]:
        if len(groups[(i,m,2)])<3:continue
        a=n['stateAlpha'][m];minimum=max(a[0],a[2]);default=score['rowColors'][f"{n['row']}:{m}"]['paint']['alpha'][1]
        if a[1]<minimum:
            changes.append(dict(note=i,mode=m,stage=1,old=a[1],new=max(default,minimum),evidence='独立已过轮廓可见；发声状态下限由本行三态和该音符已过中位数约束'));a[1]=round(max(default,minimum),3)
evidence=[]
for(row,m),values in releaseSamples.items():
    if len(values)<25:continue
    s=score['rowColors'][f'{row}:{m}'];loss=[]
    for delay in [0,.025,.05,.1]:
        for duration in [.000001,.025,.05,.1,.15,.2,.3,.4,.6,.8]:
            errors=[]
            for i,dt,actual,f in values:
                current,past=notes[i]['stateAlpha'][m][1:];p=float(np.clip((dt-delay)/duration,0,1));p=p*p*(3-2*p);expected=current*(1-p)+past*p
                if min(current,past)-.12<=actual<=max(current,past)+.12:errors.append(abs(actual-expected))
            if len(errors)>=20:loss.append((float(np.mean(np.minimum(errors,.25))),delay,duration,len(errors)))
    if not loss:continue
    loss.sort();best=loss[0];evidence.append(dict(row=row,mode=m,samples=len(values),old=[s['delay'],s['release']],measured=[best[1],best[2]],loss=best[0],candidates=loss))
    s['delay']=best[1];s['release']=best[2]
(CASE/'film/data/notes.json').write_text(json.dumps(score,ensure_ascii=False,separators=(',',':')),encoding='utf8');(OUT/'round3-physical-state-evidence.json').write_text(json.dumps(dict(changes=changes,releases=evidence),ensure_ascii=False,indent=2),encoding='utf8');print('physical state medians',len(changes),'release fits',[(e['row'],e['mode'],e['measured'])for e in evidence],flush=True)
