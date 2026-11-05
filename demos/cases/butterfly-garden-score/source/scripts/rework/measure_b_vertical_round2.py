import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
shots=read(CASE/'film/data/shots.json');e=next(e for e in shots['focus']if e['id']=='focus-cym-pf');old=np.array(e['scaleCurve']);prof=np.load(ANA/'frames/rowprofiles.npy').astype(float);bg=np.array(read(ANA/'frames/scan.json')['backgrounds']);ys={'Fl.':242,'Ob.':274,'Cl.':306,'Bsn.':338,'Hn.':382,'Trp.':414,'Trb.':446,'Mar.':522,'Hp.':586,'Vln. I':630,'Vln. II':662,'Va.':694,'Vc.':726,'Cb.':758,'dyn.':798};base=np.array(list(ys.values()));result=[]
for f in range(round(e['t0']*60),round(e['t1']*60)+1):
    t=f/60;sx=float(np.interp(t,old[:,0],old[:,1]));cy=float(np.interp(t,old[:,0],old[:,3]));py=float(np.interp(t,old[:,0],old[:,4]));v=np.max(abs(prof[f]-bg[f]),1);peaks=[]
    for j in range(2,len(v)-2):
        y=j+220
        if abs(y-cy)<12 or abs(y-py)<12:continue
        if 3<v[j]<40 and v[j]>=max(v[j-1:j+2]):peaks.append(y)
    peaks=np.array(peaks);best=None
    if len(peaks)>=4:
        As=sx+np.arange(-.05,.1001,.001);Bs=490*(1-sx)+np.arange(-35,20.01,.5);A,B=np.meshgrid(As,Bs,indexing='ij');pred=A[:,:,None]*base+B[:,:,None];valid=(pred>224)&(pred<781);dist=np.min(abs(pred[:,:,:,None]-peaks[None,None,None,:]),axis=3);cost=np.where(valid,np.minimum(dist,12)**2,0);count=np.sum(valid,axis=2);loss=np.sum(cost,axis=2)/np.maximum(count,1);loss[count<4]=1e6;loss+=.03*((A-sx)/.1)**2
        ai,bi=np.unravel_index(np.argmin(loss),loss.shape);a=float(A[ai,bi]);b=float(B[ai,bi]);matches=[]
        for y in base:
            py0=a*y+b
            if not 224<py0<781:continue
            peak=float(peaks[np.argmin(abs(peaks-py0))])
            if abs(peak-py0)<3:matches.append([float(y),peak])
        if len(matches)>=4:
            m=np.array(matches);coef=np.linalg.lstsq(np.stack([m[:,0],np.ones(len(m))],axis=1),m[:,1],rcond=None)[0];a,b=map(float,coef);best=dict(t=round(t,6),a=a,b=b,matches=matches,loss=float(loss[ai,bi]))
    if best is None:best=dict(t=round(t,6),a=sx,b=490*(1-sx),matches=[],loss=None)
    q=float(np.clip((255-bg[f,1])/247,0,1));grid=np.array([230]*3)*(1-q)+np.array([235,43,69])*q;delta=grid-bg[f];opacities={}
    for row,basey in ys.items():
        y=best['a']*basey+best['b']
        if 223<y<782 and best['matches']:
            j=round(y)-220;local=prof[f,j-1:j+2];op=float(np.max((local-bg[f])@delta/max(1,float(delta@delta))));opacities[row]=round(float(np.clip(op,0,1)),4)
    best['opacity']=opacities;result.append(best)
(OUT/'focus-b-vertical-measurements.json').write_text(json.dumps(result,separators=(',',':')),encoding='utf8');print(json.dumps([r for r in result if any(abs(r['t']-f/60)<1e-5 for f in [3596,3600,3606])]),flush=True)
