import sys
from pathlib import Path
import json,subprocess,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
ann=read(CASE/'film/data/annotations.json');widths=read(OUT/'modulation-widths-round2.json');result=[]
def paint(K,bg,fg):
    v=fg-bg;alpha=float(K@v/max(1,float(v@v)));lower=np.where(K>=0,K/np.maximum(255-bg,.001),-K/np.maximum(bg,.001));alpha=float(np.clip(max(alpha,float(lower.max())),0,1))
    return alpha,np.clip(bg+K/max(.001,alpha),0,255)
for m,measure in zip(ann['modulations'],widths):
    width=measure['width'];dx=float(np.median([o['dx']for o in measure['observations']]));world=m['globalX']+.5+dx;first=round(m['t0']*60);last=round(m['t1']*60)-1;t0=first/60
    vf=f"format=rgb24,scale=1920:1080:flags=area,setpts=N/60/TB,crop=32:590:x='floor(max(0,min(1588,{world}+880-190*(t+{t0})-8)))':y=210"
    p=subprocess.Popen(['ffmpeg','-v','error','-ss',str(t0),'-i',str(ROOT/'audio/case.mp4'),'-an','-frames:v',str(last-first+1),'-vf',vf,'-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE);curve=[];old=np.array(m['curve'])
    ys=np.array([y for y in range(222,440,9)if all(abs(y+1-r)>5 for r in [242,274,306,338,382,414])]);iy=(ys[:,None]+np.array([1,2])[None,:]-210).ravel()
    for f in range(first,last+1):
        raw=p.stdout.read(32*590*3)
        if len(raw)!=32*590*3:raise ValueError((m['id'],f,len(raw)))
        a=np.frombuffer(raw,np.uint8).reshape(590,32,3).astype(float);t=f/60;x=world-190*t+880;l=int(np.floor(max(0,min(1588,x-8))));fg=np.array([np.interp(t,old[:,0],old[:,i])for i in range(2,5)])
        if not 180<x<1580:curve.append([round(t,6),0,*fg.tolist()]);continue
        rowbg=(a[iy,0:3].mean(1)+a[iy,19:22].mean(1))/2;D=a[iy]-rowbg[:,None,:];profile=np.median(D,axis=0);B=np.median(rowbg,axis=0);X=np.arange(32)+l+.5
        cov=np.maximum(0,np.minimum(X+.5,x+width/2)-np.maximum(X-.5,x-width/2));K=cov@profile/max(.01,float(cov@cov));alpha,color=paint(K,B,fg)
        curve.append([round(t,6),round(alpha,4),*np.round(color,2).tolist()])
    p.stdout.close()
    if p.wait():raise RuntimeError(m['id'])
    result.append(dict(id=m['id'],width=width,globalX=world-.5,curve=curve))
(OUT/'modulation-paint-round2.json').write_text(json.dumps(result,separators=(',',':')),encoding='utf8');print([(m['id'],m['width'],m['globalX'])for m in result])
