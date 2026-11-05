import sys
from pathlib import Path
import json,numpy as np
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';ANA=ROOT/'analysis/case';ann=json.loads((ROOT/'repo-case/demos/cases/butterfly-garden-score/film/data/annotations.json').read_text(encoding='utf8'));result=[]
for m in ann['modulations']:
    obs=[]
    for p in (ANA/'frames').glob('f*.png'):
        try:f=int(p.stem[1:])
        except ValueError:continue
        if not m['first']+12<=f<=m['last']-12:continue
        a=np.array(Image.open(p)).astype('float32');x=(m['globalX']+.5-190*f/60+880)*2;xx=int(round(x));profiles=[]
        for y in range(222,774,9):
            native=a[y*2+1:y*2+5,xx-10:xx+11]
            B=(a[y*2+1:y*2+5,xx-12:xx-11]+a[y*2+1:y*2+5,xx+11:xx+12])/2
            dy=(native-B)@np.array([.2126,.7152,.0722]);profiles.append(np.mean(dy,axis=0))
        signal=np.median(profiles,axis=0);sign=1 if abs(signal.max())>abs(signal.min())else-1;signal*=sign;best=None;coordinates=np.arange(xx-10,xx+11)+.5
        for h in np.arange(1,5.01,.1):
            for dx in np.arange(-1.5,1.51,.1):
                cov=np.maximum(0,np.minimum(coordinates+.5,x+dx+h/2)-np.maximum(coordinates-.5,x+dx-h/2));amp=float(cov@signal/max(.001,cov@cov));loss=float(np.mean((cov*amp-signal)**2))
                if best is None or loss<best[0]:best=(loss,h/2,dx/2,amp)
        obs.append(dict(frame=f,loss=best[0],width=best[1],dx=best[2],amplitude=best[3]))
    result.append(dict(id=m['id'],width=float(np.median([o['width']for o in obs])),observations=obs))
(OUT/'modulation-widths-round2.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(result)
