import sys
from pathlib import Path
import json,numpy as np,cv2
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));cv2.setNumThreads(2)
exec(Path(__file__).with_name('fit_words_round2.py').read_text(encoding='utf8').split('result=[]')[0])
score=read(OUT/'notes-before-alpha-round2.json');evidence=read(OUT/'focus-rectangle-evidence.json')['observations'];shot=next(e for e in shots['focus']if e['id']=='focus-cym-pf');groups={}
for o in evidence:
    matches=[(abs(n['x0']-o['x0'])+abs(n['x1']-o['x1']),i)for i,n in enumerate(score['notes'])if n['row']=='Mar.']
    error,index=min(matches)
    if error>17:
        matches=[(abs(n['x0']-o['x0'])+abs(n['x1']-o['x1']),i)for i,n in enumerate(score['notes'])if n['row']=='Pf.'and abs(n['yOffset']-o['y'])<.8]
        if not matches:continue
        error,index=min(matches)
        if error>25:continue
    groups.setdefault(index,[]).append(o)
result=[]
for index,observations in groups.items():
    if len(set(o['frame']for o in observations))<3:continue
    n=score['notes'][index];keys=[]
    for o in observations:
        f=o['frame'];t=f/60;c=camera(t);cy=float(np.interp(t,rows['Pf.'][:,0],rows['Pf.'][:,1]));x0=c['head']+(o['x0']-190*t)*c['sx'];x1=c['head']+(o['x1']-190*t)*c['sx'];keys.append([t,x0-(c['head']+(n['x0']-190*t)*c['sx']),x1-(c['head']+(n['x1']-190*t)*c['sx']),o['y'],o['h']])
    keys=np.array(sorted(keys));curve=[]
    for f in sorted(set(range(3372,3631,6))|{3596}):
        t=f/60
        if not shot['t0']<=t<=shot['t1']:continue
        c=camera(t);cy=float(np.interp(t,rows['Pf.'][:,0],rows['Pf.'][:,1]));dx0,dx1,dy,h=[float(np.interp(t,keys[:,0],keys[:,i]))for i in range(1,5)];x0=c['head']+(n['x0']-190*t)*c['sx']+dx0;x1=c['head']+(n['x1']-190*t)*c['sx']+dx1;y=cy+dy*c['sy'];height=h*c['sx']
        if x1<0 or x0>1620 or not 195<y<840:curve.append([round(t,6),round(x0,2),round(x1,2),round(y,2),round(height,2),0]);continue
        a=image(f);paper=np.median(a[193:215,900:1200],axis=(0,1));q=float(np.clip((255-paper[1])/247,0,1));fg=np.array(score['rowColors']['Mar.:0']['paint']['color'])*(1-q)+np.array(score['rowColors']['Mar.:1']['paint']['color'])*q;x=int(round((max(2,x0+height/2)+min(1617,x1-height/2))/2))
        if abs(x-c['head'])<4:x=int(round(x0+(x1-x0)*.3))
        Y=np.arange(max(190,int(y-height/2)-4),min(846,int(y+height/2)+5));band=a[Y,180:1580];distance=np.max(abs(band-paper),2);ix=np.argpartition(distance,25,axis=1)[:,:25];B=np.median(np.take_along_axis(band,ix[:,:,None],axis=1),axis=1);O=np.mean(a[Y,max(0,x-1):min(1620,x+2)],axis=1);best=None
        for cyFit in np.arange(y-.75,y+.751,.25):
            for hFit in np.arange(max(1,height-2),height+2.01,.25):
                coverage=np.maximum(0,np.minimum(Y+1,cyFit+hFit/2)-np.maximum(Y,cyFit-hFit/2));prediction=(fg-B)*coverage[:,None];alpha=float(np.sum((O-B)*prediction)/max(.01,float(np.sum(prediction*prediction))));alpha=float(np.clip(alpha,0,1));loss=float(np.mean((B+alpha*prediction-O)**2))
                if best is None or loss<best[0]:best=(loss,cyFit,hFit,alpha)
        _,yFit,hFit,alpha=best;curve.append([round(t,6),round(x0*2)/2,round(x1*2)/2,round(yFit*2)/2,round(hFit*2)/2,round(alpha,3)])
    result.append(dict(row=n['row'],x0=n['x0'],x1=n['x1'],yOffset=n['yOffset'],shot='focus-cym-pf',curve=curve,sourceFrames=sorted(set(o['frame']for o in observations))))
(OUT/'focus-note-overrides-round2.json').write_text(json.dumps(result,separators=(',',':')),encoding='utf8');print('matched focus notes',len(result),[(e['row'],e['x0'],e['x1'],len(e['sourceFrames']))for e in result])
