import sys
from pathlib import Path
import json,numpy as np
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));data=read(CASE/'film/data/rowStates.json');tracks={r:np.array(k)for r,k in data['rows'].items()};frames=np.load(WORK/'row-labels.npy',mmap_mode='r');bg=np.array(read(ANA/'frames/scan.json')['backgrounds']);shots=read(CASE/'film/data/shots.json');active={r:[]for r in tracks}
for i,a in enumerate(frames):
    t=i/30;sx=1;head=880;focus=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
    if focus:
        curve=np.array(focus['curve']);p=float(np.interp(t,curve[:,0],curve[:,1]));sx=1+(focus['maxX']-1)*p;head=float(np.interp(t,curve[:,0],curve[:,2]))
        if focus['id']=='focus-cym-pf':v=np.array(focus['scaleCurve']);sx=float(np.interp(t,v[:,0],v[:,1]))
    mx=head-712*sx
    for row,keys in tracks.items():
        y=float(np.interp(t,keys[:,0],keys[:,1]));alpha=float(np.interp(t,keys[:,0],keys[:,2]));on=0
        if 0<=mx<177 and 183<y<828 and alpha>.015 and row!='dyn.':
            l=max(0,int(np.floor(mx)));r=min(180,int(np.ceil(mx+3*sx)));top=max(0,int(np.floor(y-170-8*sx)));bottom=min(670,int(np.ceil(y-170+8*sx)));patch=a[top:bottom,l:r].astype(float);contrast=np.max(abs(patch-bg[2*i]),2)
            on=int(np.sum(np.max(contrast,axis=1)>max(6,5*alpha))>=max(4,int(5*sx)))
        active[row].append([round(t,6),on])
data['active']={r:[v for i,v in enumerate(k)if i==0 or v[1]!=k[i-1][1]]for r,k in active.items()}
(CASE/'film/data/rowStates.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8');print('active marks remeasured',flush=True)
