import sys
from pathlib import Path
import json,numpy as np,cv2
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
exec(Path(__file__).with_name('fit_words_round2.py').read_text(encoding='utf8').split('result=[]')[0])
paths=read(OUT/'hp-refined-round2.json');score=read(CASE/'film/data/notes.json');results=[]
for p in paths:
    endx,endy=p['points'][-1];curve=[]
    for f in range(max(180,int((endx-700)/190*60/6)*6),min(6990,int((endx+700)/190*60/6)*6)+1,6):
        t=f/60;c=camera(t);sx=c['sx'];k=rows['Hp.'];cy=float(np.interp(t,k[:,0],k[:,1]));sy=sx
        foc=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
        if foc and foc['id']=='focus-cym-pf':a=np.array(foc['verticalCurve']);sy=float(np.interp(t,a[:,0],a[:,1]))
        x=c['head']+(endx-190*t)*sx;y=cy+(endy-586)*sy
        if not 195<x<1565 or not 207<y<828:continue
        im=image(f);l=round(x)-int(9*sx)-2;r=round(x)+int(9*sx)+3;top=round(y)-int(9*sx)-2;bottom=round(y)+int(9*sx)+3
        native=im[top:bottom,l:r];B=im[top:bottom,r+2:r+5].mean(1);D=native-B[:,None,:];mag=np.max(abs(D),2)
        if np.percentile(mag,95)<4:continue
        Y,X=np.mgrid[top:bottom,l:r];X=X+.5;Y=Y+.5;best=None
        for radius in np.arange(1.5,6.01,.25):
            for dx in [-.5,0,.5]:
                for dy in [-.5,0,.5]:
                    distance=np.sqrt((X-(x+dx))**2+(Y-(y+dy))**2);mask=np.clip(radius*sx+.5-distance,0,1);valid=X>=x+dx;cov=mask*valid;K=np.sum(cov[:,:,None]*D,axis=(0,1))/max(.001,float(np.sum(cov*cov)));prediction=mask[:,:,None]*K;loss=float(np.mean((prediction[valid]-D[valid])**2))
                    if best is None or loss<best[0]:best=(loss,radius,dx,dy,K)
        loss,radius,dx,dy,K=best;bg=np.median(B,axis=0);q=0 if bg[1]>150 else 1;fg=np.array(score['rowColors'][f'Pf.:{q}']['paint']['color']);v=fg-bg;alpha=float(K@v/max(1,float(v@v)));minimum=np.where(K>=0,K/np.maximum(255-bg,.001),-K/np.maximum(bg,.001));alpha=float(np.clip(max(alpha,float(minimum.max())),0,1));color=np.clip(bg+K/max(.001,alpha),0,255)
        curve.append([round(t,6),radius,round(alpha,4),*np.round(color,2).tolist()])
    results.append(dict(**{k:v for k,v in p.items()if k!='samples'},dotCurve=curve))
(OUT/'hp-dots-round2.json').write_text(json.dumps(results,ensure_ascii=False,separators=(',',':')),encoding='utf8');print([(p['t0'],len(p['dotCurve']),[(k[0],k[1])for k in p['dotCurve']if abs(k[0]-p['t1'])<.22])for p in results])
