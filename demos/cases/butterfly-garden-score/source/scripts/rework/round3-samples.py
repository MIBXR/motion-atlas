import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';CASE=REPO/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
score=read(CASE/'film/data/notes.json');notes=score['notes'];shots=read(CASE/'film/data/shots.json');states=read(CASE/'film/data/rowStates.json');ann=read(CASE/'film/data/annotations.json');rows={r:np.array(k)for r,k in states['rows'].items()};frames=[]
def sample(k,t):
    a=np.array(k);return np.array([np.interp(t,a[:,0],a[:,i])for i in range(1,a.shape[1])])
def smooth(x):x=np.clip(x,0,1);return x*x*(3-2*x)
def camera(t):
    e=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
    if e is None:return 1,1,1,880,[],None
    p,head=sample(e['curve'],t)[:2];sx=1+(e['maxX']-1)*p;sy=1+(e['maxY']-1)*p;gy=sx
    if e['id']=='focus-cym-pf':sx,sy=sample(e['scaleCurve'],t)[:2];gy=sample(e['verticalCurve'],t)[0]
    return sx,sy,gy,head,e['rows'],e['id']
geometry={e['id']:e for e in read(OUT/'word-geometry-round2.json')if e.get('detected')};shapes={k:np.load(e['template'],mmap_mode='r').shape for k,e in geometry.items()}
NX0=np.array([n['x0']for n in notes]);NX1=np.array([n['x1']for n in notes]);NY=np.array([n['yOffset']for n in notes]);names=list(rows);RI=np.array([names.index(n['row'])for n in notes])
ATTACK=np.array([[max(.000001,score['rowColors'][f"{n['row']}:{m}"]['attack'])for n in notes]for m in [0,1]]);RELEASE=np.array([[score['rowColors'][f"{n['row']}:{m}"]['release']for n in notes]for m in [0,1]]);DELAY=np.array([[score['rowColors'][f"{n['row']}:{m}"]['delay']for n in notes]for m in [0,1]]);HEIGHTS=np.array([[n[k]for n in notes]for k in ['futureThickness','currentThickness','thickness']])
for f in range(0,7320,10):
    t=f/60;a=cv2.cvtColor(cv2.imread(str(OUT/'round3-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB);paper=np.median(a[193:215,900:1200],axis=(0,1));q=float(np.clip((255-paper[1])/247,0,1));mode=int(q>.5);sx,sy,gy,head,selected,shot=camera(t);poses=np.array([sample(k,t)for k in rows.values()]);X0=head+(NX0-190*t)*sx;X1=head+(NX1-190*t)*sx;Y=poses[RI,0]+NY*np.array([sy if names[r]in selected else gy for r in RI]);H=[];stage=[]
    attack=smooth((t-NX0[None,:]/190)/ATTACK);release=smooth((t-(NX1[None,:]+6)/190-DELAY)/RELEASE);current=attack*(1-release);at=attack[0]*(1-q)+attack[1]*q;cur=current[0]*(1-q)+current[1]*q;H=(HEIGHTS[0]*(1-at)+HEIGHTS[1]*cur+HEIGHTS[2]*(at-cur))*sx;stage=np.where(t<NX0/190,0,np.where(t<(NX1+6)/190,1,2))
    for i,n in enumerate(notes):
        if shot in n.get('shotCurves',{}):X0[i],X1[i],Y[i],H[i]=sample(n['shotCurves'][shot],t)
    left=max(180-60*(sx-1)*2 if shot!='focus-cym-pf'else 0,head-700*sx,0);right=min(1620,head+700*sx);active=np.flatnonzero((X1>left+2)&(X0<right-2)&(Y>190)&(Y<844)&(poses[RI,1]>.025));records=[];wordBoxes=[]
    for w in ann['words']:
        if not w['t0']<=t<w['t1']or w['id']not in geometry:continue
        g=geometry[w['id']];v=sample(w['curve'],t);scale=sx if w.get('row')or'worldX'in w else 1;x=w.get('screenX',head+(w.get('worldX',0)-190*t)*sx)
        if w.get('kind')=='motifLabel':continue
        y=poses[names.index(w['row']),0]+w.get('pitch',0)*(sy if w['row']in selected else gy)+w.get('offset',0)*sx if w.get('row')else w['screenY'];top=y+(g['boxOffset'][1]+v[5])*scale;l=x+(g['boxOffset'][0]+v[4])*scale;hh,ww=shapes[w['id']];wordBoxes.append((l,top,l+ww*scale/g['referenceScale'],top+hh*scale/g['referenceScale'],w['id']))
    for i in active:
        n=notes[i];x0=X0[i];x1=X1[i];y=Y[i];h=H[i];margin=max(2,min(8,h/2+1));l=max(left+1,x0+margin);r=min(right-1,x1-margin)
        if r<l:continue
        xs=np.unique(np.round(np.linspace(l,r,3)).astype(int));coords=[];clean=[];reasons=[]
        for x in xs:
            why=[];ys=np.arange(max(190,int(np.ceil(y-h/4-.5))),min(845,int(np.floor(y+h/4-.5)))+1);rawCount=len(ys);ys=ys[abs(ys+.5-poses[RI[i],0]-.5)>.75]
            if not len(ys):ys=np.array([int(round(y-.5))]);why.append('无法分离：音符内部与网格线重合'if rawCount else'无法分离：细线内部不足完整像素')
            if abs(x-head)<5:why.append('遮挡：播放头')
            other=(X0<x+1)&(X1>x-1)&(abs(Y-y)<(H+h)/2+.75);other[i]=False
            if np.any(other):why.append('无法分离：叠置音符 '+','.join(str(j)for j in np.flatnonzero(other)[:4]))
            for ll,top,rr,bottom,word in wordBoxes:
                if ll-1<=x<=rr+1 and top-1<=y<=bottom+1:why.append('遮挡：文字 '+word)
            points=[[int(x),int(yy)]for yy in ys if 0<=yy<1080];coords.extend(points);reasons.extend(why)
            if not why:clean.extend(points)
        if clean:coords=clean;reasons=[]
        if any(e['t0']<=t<e['t1']for e in shots['giants'])and 400<y<710:reasons.append('遮挡：巨型标题字形底层合成')
        if 39<t<43.95 or t>116.9:reasons.append('遮挡：调性梯子与谱面交替')
        if not coords:continue
        rgb=np.median(np.array([a[yy,xx]for xx,yy in coords]),axis=0).tolist();records.append(dict(note=int(i),row=n['row'],stage=int(stage[i]),mode=mode,coords=coords,source=rgb,box=np.round([x0,y,x1,h],2).tolist(),rowAlpha=round(float(poses[RI[i],1]),3),reasons=sorted(set(reasons))))
    frames.append(dict(frame=f,samples=records))
    if f%1500==0:print('note sample geometry',f,sum(len(e['samples'])for e in frames),flush=True)
(OUT/'round3-sample-points.json').write_text(json.dumps(frames,ensure_ascii=False,separators=(',',':'),default=lambda x:x.item()),encoding='utf8');print('note sample points complete',sum(len(e['samples'])for e in frames),flush=True)


