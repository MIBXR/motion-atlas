import sys
from pathlib import Path
import json,cv2,numpy as np
from PIL import Image,ImageDraw
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';ANA=ROOT/'analysis/case';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
bars=read(CASE/'film/data/bars.json');a=np.load(ANA/'frames/counters.npy',mmap_mode='r');meters=np.load(ANA/'frames/meters.npy',mmap_mode='r')
def masks(src):
    result=[];strength=[]
    for im in src:
        bg=np.median(im,axis=(0,1));d=np.max(abs(im.astype(float)-bg),2);peak=float(np.percentile(d,99));strength.append(peak);result.append(cv2.resize(np.clip(d/max(peak,1),0,1).astype('float32'),(55,45),interpolation=cv2.INTER_AREA).reshape(-1))
    return np.array(result),np.array(strength)
features,strength=masks(a);examples=[]
for i,b in enumerate(bars['counters']):
    end=bars['counters'][i+1]['frame']if i+1<len(bars['counters'])else 7010;examples.append(features[(b['frame']+end)//2])
T=np.array(examples);scores=(2*features@T.T)/(np.sum(features*features,1)[:,None]+np.sum(T*T,1)[None,:]+.001)
cost=1-scores;cost[strength<8]=0
dp=np.full(57,1e12);dp[0]=0;back=np.zeros((7320,57),np.uint8)
for f in range(7320):
    stay=dp;advance=np.r_[1e12,dp[:-1]]+.1;take=advance<stay;back[f]=take;dp=np.minimum(stay,advance)+cost[f]
k=56;labels=[]
for f in range(7319,-1,-1):labels.append(k);k-=int(back[f,k])
labels=np.array(labels[::-1]);changes=np.flatnonzero(np.r_[True,np.diff(labels)!=0]);counterChanges=[]
firstVisible=int(np.flatnonzero((strength>15)&(np.arange(7320)>60))[0])
for f in changes:
    label=int(labels[f])+1
    if label==1:f=firstVisible
    counterChanges.append(dict(bar=label,frame=int(f),t=int(f)/60,shapeScore=float(scores[f,label-1])))
mf,ms=masks(meters);meterNames=list(dict.fromkeys(b['meter']for b in bars['counters']));templates=[]
for m in meterNames:
    b=next(b for b in bars['counters']if b['meter']==m);idx=bars['counters'].index(b);end=bars['counters'][idx+1]['frame']if idx<56 else 7010;templates.append(mf[(b['frame']+end)//2])
TT=np.array(templates);sc=(2*mf@TT.T)/(np.sum(mf*mf,1)[:,None]+np.sum(TT*TT,1)[None,:]+.001);ml=np.argmax(sc,axis=1)
for f in range(1,7320):
    if ms[f]<8:ml[f]=ml[f-1]
meterChanges=[]
for f in np.flatnonzero(np.r_[True,np.diff(ml)!=0]):
    if f<firstVisible:continue
    meterChanges.append(dict(frame=int(f),t=int(f)/60,meter=meterNames[int(ml[f])],score=float(sc[f,ml[f]])))
meterChanges.insert(0,dict(frame=firstVisible,t=firstVisible/60,meter=meterNames[int(ml[firstVisible])],score=float(sc[firstVisible,ml[firstVisible]])))
result=dict(counters=counterChanges,meters=meterChanges,firstVisible=firstVisible)
(OUT/'counter-frame-measurements.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps(dict(counters=len(counterChanges),meters=meterChanges,around32=[b for b in counterChanges if 30<=b['bar']<=33])),flush=True)
sheet=Image.new('RGB',(700,len(counterChanges)*56),'white');draw=ImageDraw.Draw(sheet)
for i,b in enumerate(counterChanges):
    f=b['frame'];draw.text((3,i*56+5),f'{b["bar"]:02d}  f={f}',fill='black')
    for j,ff in enumerate([max(0,f-1),f,min(7319,f+1)]):
        patch=Image.fromarray(a[ff]);patch.thumbnail((100,52));sheet.paste(patch,(130+j*125,i*56));m=Image.fromarray(meters[ff]);m.thumbnail((70,40));sheet.paste(m,(510+j*60,i*56))
sheet.save(OUT/'counter-changes-round2.png')
