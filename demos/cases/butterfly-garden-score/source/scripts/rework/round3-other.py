import sys
from pathlib import Path
import json,cv2,numpy as np,shutil
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';CASE=REPO/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
def sample(k,t):
    a=np.array(k);return np.array([np.interp(t,a[:,0],a[:,i])for i in range(1,a.shape[1])])
shots=read(OUT/'round3-shots.json');states=read(OUT/'round3-rowStates.json');ann=read(CASE/'source/analysis/rework/state-input/annotations.json')
glyph=next(e for e in shots['intro']['auxiliary']if e['text']=='ー');glyph['x']=1025;glyph['y']=624
reference=cv2.cvtColor(cv2.imread(str(OUT/'round3-reference/00100.png')),cv2.COLOR_BGR2RGB).astype('float32')[625:649,1028:1032];mask=np.max(abs(reference-255),2)>50;keys=[]
for f in range(0,201,10):
    a=cv2.cvtColor(cv2.imread(str(OUT/'round3-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32');color=np.median(a[625:649,1028:1032][mask],axis=0);keys.append([round(f/60,6),int(np.max(abs(color-255))>5),*np.round(color,2).tolist(),0,0])
glyph['curve']=keys
evidence=[]
for wi,w in enumerate(ann['wedges']):
    additions=[]
    for f in range(max(200,int(w['t0']*60/10)*10),min(7310,int((w['x1']+700)/190*60))+1,10):
        t=f/60;x0=w['x0']-190*t+880;x1=w['x1']-190*t+880;left=max(180,int(x0));right=min(1580,int(x1))
        if not 8<right-left<180:continue
        cy=sample(states['rows']['dyn.'],t)[0];middle=795.5+cy-798;top=max(190,round(middle)-8);bottom=min(846,round(middle)+9)
        if bottom-top<5:continue
        a=cv2.cvtColor(cv2.imread(str(OUT/'round3-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32');paper=np.median(a[193:215,900:1200],axis=(0,1));q=float(np.clip((255-paper[1])/247,0,1));F=np.array([24]*3)*(1-q)+255*q;v=F-paper;P=np.sum((a[top:bottom,left:right]-paper)*v,2)/max(1,float(v@v));mask=P>.12;ys,xs=np.where(mask)
        if len(xs)<12 or np.ptp(ys)>3 or np.ptp(xs)<(right-left)*.75:continue
        y=float(np.median(ys))+top+.5;alpha=float(np.clip(np.percentile(P[mask],85),0,1));width=sample(w['curve'],t)[-1];additions.append([round(t,6),round(alpha,3),*F.tolist(),w['x0'],w['x1'],y,y,y,y,float(width)])
    if additions:
        lo=min(k[0]for k in additions);hi=max(k[0]for k in additions);w['curve']=[k for k in w['curve']if not(lo<=k[0]<=hi)]+additions;w['curve'].sort();w['t1']=max(w['t1'],(w['x1']+700)/190+1/60);evidence.append(dict(wedge=wi,frames=[round(k[0]*60)for k in additions],values=additions))
for name,data in [('shots',shots),('rowStates',states),('annotations',ann)]:
    (CASE/f'film/data/{name}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(OUT/'round3-dyn-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf8');print('vertical long mark, row tracks and flat wedge tails',[(e['wedge'],len(e['frames']))for e in evidence],flush=True)
