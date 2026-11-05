import sys
from pathlib import Path
import json,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
score=read(CASE/'film/data/notes.json');notes=score['notes'];fits=read(OUT/'rectangle-fits-round2.json');gaps=read(OUT/'native-note-gaps.json');tracks={r:np.array(k)for r,k in read(CASE/'film/data/rowStates.json')['rows'].items()};changes=[];allSamples=[];rowH={}
for n,fit in zip(notes,fits):
    if fit.get('count',0)<2:continue
    for state,h in enumerate(fit['heights']):
        if h is not None:rowH.setdefault((n['row'],n['kind'],state),[]).append(h)
for i,(n,fit)in enumerate(zip(notes,fits)):
    n=n.copy();before=dict(n)
    if fit.get('count',0)>=2 and fit['medianLoss']<30:
        n['yOffset']=fit['yOffset']
        for state,key in [(0,'futureThickness'),(1,'currentThickness'),(2,'thickness')]:
            if fit['heights'][state]is not None:n[key]=round(fit['heights'][state],3)
    elif n['kind']!='dot':
        for state,key in [(0,'futureThickness'),(1,'currentThickness'),(2,'thickness')]:
            hs=rowH.get((n['row'],n['kind'],state),[])
            if len(hs)>8:n[key]=round(float(np.median(hs)),3)
    exposure=0
    if n['kind']!='dot'and fit.get('count',0)==0:
        for f in range(210,6991,18):
            t=f/60
            if any(a<t<b for a,b in [(8.3,12.4),(20.1,21.6),(27.7,29),(39,43.4),(56.2,60.5),(76.2,77.8),(88,93.5)]):continue
            k=tracks[n['row']];cy=np.interp(t,k[:,0],k[:,1]);op=np.interp(t,k[:,0],k[:,2]);x0=n['x0']-190*t+880;x1=n['x1']-190*t+880;y=cy+n['yOffset']
            if op>.35 and x1>195 and x0<1565 and x1-x0>=9 and 238<y<769:exposure+=1
    if exposure>=8:
        changes.append(dict(index=i,row=n['row'],action='delete',reason='no independent rectangle in native profiles',exposure=exposure,before=before));continue
    evidence=gaps.get(str(i),[]);clusters=[]
    for ev in evidence:
        for left,right in ev['gaps']:
            if not n['x0']+8<left<right<n['x1']-6:continue
            c=next((c for c in clusters if abs(np.median([v[0]for v in c])-left)<3 and abs(np.median([v[1]for v in c])-right)<3),None)
            if c is None:clusters.append([(left,right,ev['frame'])])
            else:c.append((left,right,ev['frame']))
    reliable=[]
    for c in clusters:
        if len(set(v[2]for v in c))<3:continue
        l=round(float(np.median([v[0]for v in c]))*2)/2;r=round(float(np.median([v[1]for v in c]))*2)/2
        if r-l>=3:reliable.append((l,r))
    reliable.sort();pieces=[];left=n['x0']
    for l,r in reliable:
        if l<left+7:continue
        piece=n.copy();piece['x0']=left;piece['x1']=l;piece['_origin']=i;pieces.append(piece);left=r
    if n['x1']-left>=6:piece=n.copy();piece['x0']=left;piece['_origin']=i;pieces.append(piece)
    if len(pieces)>1:changes.append(dict(index=i,row=n['row'],action='split',before=before,pieces=[[p['x0'],p['x1']]for p in pieces],evidence=reliable))
    elif n!=before:changes.append(dict(index=i,row=n['row'],action='geometry',before=before,after=n))
    allSamples.extend(pieces)
retained=[]
for n in sorted(allSamples,key=lambda n:(n['row'],-(n['x1']-n['x0']),n['x0'])):
    duplicate=next((m for m in retained if m['row']==n['row']and m['kind']==n['kind']and abs(m['yOffset']-n['yOffset'])<=.6 and max(0,min(m['x1'],n['x1'])-max(m['x0'],n['x0']))>.9*(n['x1']-n['x0'])),None)
    if duplicate:
        changes.append(dict(index=n['_origin'],row=n['row'],action='delete duplicate',before=n,retained=duplicate['_origin']));continue
    retained.append(n)
retained.sort(key=lambda n:(n['x0'],n['row'],n['yOffset']))
for n in retained:n.pop('_origin')
score['notes']=retained
(OUT/'notes-round2.json').write_text(json.dumps(score,ensure_ascii=False,separators=(',',':')),encoding='utf8');(OUT/'note-corrections-round2.json').write_text(json.dumps(changes,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(json.dumps(dict(before=len(notes),after=len(retained),split=sum(c['action']=='split'for c in changes),deleted=sum(c['action'].startswith('delete')for c in changes),hn=[c for c in changes if c['index']==1564 or c['index']==2235])),flush=True)
