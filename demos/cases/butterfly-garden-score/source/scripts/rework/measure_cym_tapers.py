import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
score=read(CASE/'film/data/notes.json');shots=read(CASE/'film/data/shots.json');k=np.array(read(CASE/'film/data/rowStates.json')['rows']['Cym.']);result=[]
for ni,n in enumerate(score['notes']):
    if n['row']!='Cym.'or n['x1']-n['x0']<100:continue
    obs=[]
    for f in range(max(180,int((n['x0']/190-3.4)*10)*6),min(6990,int((n['x1']/190+2)*10)*6)+1,6):
        t=f/60;cy=float(np.interp(t,k[:,0],k[:,1]));op=float(np.interp(t,k[:,0],k[:,2]));sx=sy=1;head=880;focus=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
        if focus:
            c=np.array(focus['curve']);p=float(np.interp(t,c[:,0],c[:,1]));sx=1+(focus['maxX']-1)*p;sy=1+(focus['maxY']-1)*p;head=float(np.interp(t,c[:,0],c[:,2]))
            if focus['id']=='focus-cym-pf':c=np.array(focus['scaleCurve']);sx=float(np.interp(t,c[:,0],c[:,1]));sy=float(np.interp(t,c[:,0],c[:,2]))
        if op<.3 or not 230<cy<720:continue
        state=0 if t<n['x0']/190-.12 else 1 if n['x0']/190+.12<t<(n['x1']+6)/190-.12 else 2 if t>(n['x1']+6)/190+.9 else -1
        if state<0:continue
        a=cv2.cvtColor(cv2.imread(str(OUT/'residual-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype(float);bg=np.median(a[194:218,900:1200],axis=(0,1));yy=round(cy);band=a[yy-34:yy+35,180:1580];mag=np.max(abs(band-bg),2);ix=np.argsort(mag,axis=1)[:,:20];base=np.median(np.take_along_axis(band,ix[:,:,None],axis=1),axis=1)
        for u in [.15,.35,.55,.75,.9]:
            gx=n['x0']+(n['x1']-n['x0'])*u;x=head+(gx-190*t)*sx
            if not 190<x<1570 or abs(x-head)<8:continue
            xx=round(x);O=np.median(a[yy-34:yy+35,xx-1:xx+2],axis=1);B=base.copy();upper=np.median(a[yy-32:yy-28,xx-1:xx+2],axis=(0,1));lower=np.median(a[yy+28:yy+32,xx-1:xx+2],axis=(0,1))
            if np.max(abs(upper-lower))<10 and np.min((upper+lower)/2)>230:B[:]=(upper+lower)/2
            D=O-B;strength=np.max(abs(D),1);j=int(np.argmax(strength))
            if strength[j]<12:continue
            v=D[j];p=np.clip(D@v/max(1,float(v@v)),0,1.2);lo=j;hi=j
            while lo>0 and p[lo-1]>.08:lo-=1
            while hi+1<len(p)and p[hi+1]>.08:hi+=1
            h=float(np.sum(p[lo:hi+1]))/sx;centre=float(np.sum((np.arange(lo,hi+1)-34)*p[lo:hi+1])/max(.1,p[lo:hi+1].sum()))/sx
            if abs(centre)>.9 or h>12:continue
            obs.append([f,state,u,h])
    states=[]
    for state in range(3):
        z=np.array([o for o in obs if o[1]==state])
        if len(z)<4:states.append(None);continue
        X=np.stack([np.ones(len(z)),z[:,2]],1);c=np.linalg.lstsq(X,z[:,3],rcond=None)[0];error=abs(X@c-z[:,3]);good=error<np.percentile(error,70)+.1;c=np.linalg.lstsq(X[good],z[good,3],rcond=None)[0];states.append([round(float(max(0,c[0])),3),round(float(max(0,c[0]+c[1])),3)])
    result.append(dict(index=ni,x0=n['x0'],x1=n['x1'],states=states,samples=obs))
(OUT/'cym-taper-measurements.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps([{k:v for k,v in r.items()if k!='samples'}for r in result]),flush=True)
