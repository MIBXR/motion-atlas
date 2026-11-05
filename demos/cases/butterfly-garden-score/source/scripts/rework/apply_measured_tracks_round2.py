import sys
from pathlib import Path
import json,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));write=lambda p,a:p.write_text(json.dumps(a,ensure_ascii=False,separators=(',',':')),encoding='utf8')
def simplify(keys,tol):
    if len(keys)<3:return keys
    a=np.array(keys,float);keep={0,len(a)-1};stack=[(0,len(a)-1)]
    while stack:
        l,r=stack.pop()
        if r-l<2:continue
        u=((a[l+1:r,0]-a[l,0])/(a[r,0]-a[l,0]))[:,None];prediction=a[l,1:]+u*(a[r,1:]-a[l,1:]);error=np.max(abs(a[l+1:r,1:]-prediction)/np.array(tol),axis=1);j=int(np.argmax(error))+l+1
        if error[j-l-1]>1:keep.add(j);stack.extend([(l,j),(j,r)])
    return [keys[i]for i in sorted(keep)]
data=read(OUT/'annotation-frame-measurements.json');ann=read(CASE/'film/data/annotations.json');words=[]
for e in data['words']:
    e={k:v for k,v in e.items()if k not in ['template','referenceFrame','referenceScale','boxOffset','templateAlpha','detected','match']};e['curve']=simplify(e['curve'],[.02,2,2,2,.4,.4,.04]);e['t0']=e['curve'][0][0];e['t1']=e['curve'][-1][0]+1/60;words.append(e)
ann['words']=words
for e in data['rulers']:e['curve']=simplify(e['curve'],[.6,.4,.02,.2])
ann['rulers']=data['rulers']
for e in data['wedges']:
    keys={round(k[0]*60):k for k in e['curve']}
    if not keys:e['curve']=[];e['t0']=e['t1']=0;continue
    lo=min(keys);hi=max(keys);curve=[]
    for f in range(lo-1,hi+2):
        if f in keys:curve.append(keys[f]);continue
        key=keys[min(keys,key=lambda k:abs(k-f))].copy();key[0]=round(f/60,6);key[1]=0;curve.append(key)
    e['t0']=(lo-1)/60;e['t1']=(hi+2)/60;e['curve']=simplify(curve,[.02,2,2,2,.5,.5,.3,.3,.3,.3,.15])
ann['wedges']=data['wedges'];ann['outlines']=read(OUT/'outlines-round2.json')
for e in ann['outlines']:e['curve']=simplify(e['curve'],[.02])
small=read(OUT/'small-layers-round2.json');ann['connections']=small['connections']
for e in ann['connections']:e['curve']=simplify(e['curve'],[.02,2,2,2,.5,.5])
write(CASE/'film/data/annotations.json',ann)
shots=read(CASE/'film/data/shots.json');shots['headers']=read(OUT/'header-tracks-round2.json')
for e in shots['headers']:e['curve']=simplify(e['curve'],[.02,.3,2,2,2,2,2,2])
shots['intro']['byline']=simplify(small['byline'],[.02,.5]);write(CASE/'film/data/shots.json',shots)
