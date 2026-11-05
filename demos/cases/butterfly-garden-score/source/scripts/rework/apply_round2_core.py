import sys
from pathlib import Path
import json,numpy as np,shutil
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));write=lambda p,d:Path(p).write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf8')
score=read(OUT/'notes-round2.json')
for key,s in score['rowColors'].items():
    row,mode=key.rsplit(':',1);mode=int(mode);bg=np.array([232,8,39]if mode else[255]*3,dtype=float);fg=np.array(s['colors'][1],dtype=float)
    group=next(n['group']for n in score['notes']if n['row']==row)
    if mode and group in [0,3]:fg=np.array([255]*3,dtype=float)
    v=fg-bg;alphas=[]
    for color in s['colors']:alphas.append(float(np.clip(np.dot(np.array(color)-bg,v)/max(1,float(v@v)),0,1)))
    s['paint']=dict(color=fg.tolist(),alpha=alphas)
write(CASE/'film/data/notes.json',score)
bars=read(CASE/'film/data/bars.json');measure=read(OUT/'counter-frame-measurements.json')
for b,m in zip(bars['counters'],measure['counters']):b['frame']=m['frame']if b['bar']>1 else 139;b['t']=b['frame']/60
bars['meters']=measure['meters'];bars['meters'][0]['frame']=139;bars['meters'][0]['t']=139/60
write(CASE/'film/data/bars.json',bars)
shots=read(CASE/'film/data/shots.json');e=next(e for e in shots['focus']if e['id']=='focus-cym-pf');vm=read(OUT/'focus-b-vertical-measurements.json');good=[v for v in vm if len(v['matches'])>=4 and v['loss']is not None and v['loss']<18];valid=np.array([[v['t'],v['a'],v['b']]for v in good]);vertical=[]
for v in vm:
    t=v['t'];a=float(np.interp(t,valid[:,0],valid[:,1]));b=float(np.interp(t,valid[:,0],valid[:,2]));vertical.append([t,a,b])
e['verticalCurve']=vertical;write(CASE/'film/data/shots.json',shots)
states=read(CASE/'film/data/rowStates.json');ys={'Fl.':242,'Ob.':274,'Cl.':306,'Bsn.':338,'Hn.':382,'Trp.':414,'Trb.':446,'Cym.':490,'Mar.':522,'Pf.':554,'Hp.':586,'Vln. I':630,'Vln. II':662,'Va.':694,'Vc.':726,'Cb.':758,'dyn.':798}
for row,keys in states['rows'].items():
    if row in e['rows']:continue
    new=[k for k in keys if not e['t0']<=k[0]<=e['t1']];old=np.array(keys)
    for t,a,b in vertical:new.append([t,ys[row]*a+b,float(np.interp(t,old[:,0],old[:,2]))])
    states['rows'][row]=sorted(new)
write(CASE/'film/data/rowStates.json',states)
