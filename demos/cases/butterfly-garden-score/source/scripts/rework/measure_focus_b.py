import sys
from pathlib import Path
import json,subprocess,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
shots=read(CASE/'film/data/shots.json');e=next(x for x in shots['focus']if x['id']=='focus-cym-pf');curve=np.array(e['curve']);notes=[n for n in read(CASE/'film/data/notes.json')['notes']if n['row']=='Pf.'];profiles=np.load(ANA/'frames/rowprofiles.npy');backgrounds=np.array(read(ANA/'frames/scan.json')['backgrounds'])
start=3370;end=3640;observations=[]
p=subprocess.Popen(['ffmpeg','-v','error','-ss',str(start/60),'-i',str(ROOT/'audio/case.mp4'),'-frames:v',str(end-start),'-an','-vf','format=rgb24,scale=1920:1080:flags=area,crop=1620:300:0:380','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for f in range(start,end):
    raw=p.stdout.read(1620*300*3)
    if len(raw)!=1620*300*3:raise ValueError(f)
    if f%2:continue
    a=np.frombuffer(raw,np.uint8).reshape(300,1620,3);t=f/60;pval=float(np.interp(t,curve[:,0],curve[:,1]));initial=1+pval**.75
    bg=backgrounds[f];contrast=np.max(abs(a.astype(float)-bg),2);mask=(contrast>28).astype('uint8');mask[:,876:884]=0
    num,lab,stats,cents=cv2.connectedComponentsWithStats(mask);obs=[]
    for (x,y,w,h,area),(cx,cy)in zip(stats[1:],cents[1:]):
        cy+=380
        if not(8<w<170 and 3<h<16 and area/w/h>.55):continue
        possibles=[]
        for n in notes:
            z=(n['x0']+n['x1'])/2-190*t;predx=880+initial*z;predy=554+55*(initial-1)+n['yOffset']*(1+7*pval)
            if abs(predx-cx)<20 and abs(predy-cy)<15:possibles.append((abs(predx-cx)+abs(predy-cy),n,z))
        if possibles:
            _,n,z=min(possibles,key=lambda a:a[0]);obs.append((z,cx-880,n['yOffset'],cy))
    if len(obs)>=4:
        a=np.array(obs);ratios=a[:,1]/np.where(abs(a[:,0])>30,a[:,0],np.nan);good=np.isfinite(ratios)&(abs(a[:,0])>30)
        sx=float(np.nanmedian(ratios[good]));X=np.stack([np.ones(len(a)),a[:,2]],1);coef=np.linalg.lstsq(X,a[:,3],rcond=None)[0]
        error=abs(a[:,3]-X@coef);good=error<6
        if good.sum()>=4:coef=np.linalg.lstsq(X[good],a[good,3],rcond=None)[0]
        if not .95<sx<2.1:sx=initial
        observations.append(dict(t=t,p=pval,sx=sx,pfY=float(coef[0]),pitchScale=float(coef[1]),samples=len(obs)))
p.stdout.close()
if p.wait():raise RuntimeError('ffmpeg focus')
valid=[o for o in observations if .025<o['p']<.98 and o['samples']>=4 and 1<o['sx']<1.98];aa=np.array([[np.log(o['p']),np.log(o['sx']-1)]for o in valid]);power=float(np.sum(aa[:,0]*aa[:,1])/np.sum(aa[:,0]**2))
result=[]
for f in range(start,end):
    t=f/60;pval=float(np.interp(t,curve[:,0],curve[:,1]));sx=1+pval**power;v=np.max(abs(profiles[f]-backgrounds[f]),1);guides=[]
    for expected in [490-65*(sx-1),554+55*(sx-1)]:
        lo=max(220,round(expected)-13);hi=min(784,round(expected)+14);yy=np.arange(lo,hi);val=v[lo-220:hi-220]
        cost=abs(val-25)+.6*abs(yy-expected);guides.append(float(yy[np.argmin(cost)])+.5)
    result.append([round(t,6),round(sx,5),round(1+7*pval,5),*guides])
(WORK/'focus-b-fits.json').write_text(json.dumps(dict(power=power,curve=result,observations=observations),separators=(',',':')),encoding='utf8')
print(json.dumps(dict(power=power,samples=len(observations),at60_1=next(x for x in result if x[0]==60.1))),flush=True)
