import sys
from pathlib import Path
import json,subprocess,numpy as np,cv2
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
cv2.setNumThreads(2);metrics=read(OUT/'intro-raster-metrics.json');rasters=OUT/'intro-rasters';reference=np.array(Image.open(OUT/'residual-reference/00120.png')).astype('float32')
def raster(e):
    im=np.array(Image.open(rasters/f'{e["id"]}.png'))[:,:,3].astype('float32')/255;ys,xs=np.where(im>.005);l,r=xs.min(),xs.max()+1;t,b=ys.min(),ys.max()+1;mask=cv2.resize(im[t:b,l:r],(max(1,round((r-l)/2)),max(1,round((b-t)/2))),interpolation=cv2.INTER_AREA)
    return mask,[l/2-e['anchor'][0],t/2-e['anchor'][1]]
fits=[]
for e in metrics:
    if 'frame'in e:continue
    mask,off=raster(e);best=None
    for size in np.arange(.875,1.151,.025):
        template=cv2.resize(mask,None,fx=size,fy=size,interpolation=cv2.INTER_LINEAR);h,w=template.shape;l=int(e['x']+off[0]*size)-7;t=int(e['y']+off[1]*size)-9;r=l+w+15;b=t+h+19;patch=reference[t:b,l:r];target=np.max(abs(patch-255),2)
        corr=cv2.matchTemplate(target,template,cv2.TM_CCOEFF_NORMED);_,rho,_,(dx,dy)=cv2.minMaxLoc(corr)
        if best is None or rho>best['rho']:best=dict(rho=rho,factor=size,x=l+dx-off[0]*size,y=t+dy-off[1]*size)
    fits.append(e|best)
scores={}
for e in fits:
    if e['id'].startswith('jp'):scores.setdefault((e['family'],e['weight']),[]).append(e['rho'])
family,weight=max(scores,key=lambda k:np.mean(scores[k]));chosen=[e for e in fits if e['id']=='prologue'or(e['family'],e['weight'])==(family,weight)]
actors=[]
for e in chosen:
    mask,off=raster(e);e=e.copy();e['fontSize']=round(e['size']*e['factor'],3);e['fontFamily']=e.pop('family');e['fontWeight']=e.pop('weight');e['_mask']=cv2.resize(mask,None,fx=e['factor'],fy=e['factor'],interpolation=cv2.INTER_LINEAR);e['_off']=np.array(off)*e['factor'];e['curve']=[];actors.append(e)
def paint(D,cov,B,fg):
    valid=cov>.03;C=cov[valid];pixels=D[valid];bases=B[valid];K=np.sum(C[:,None]*pixels,axis=0)/max(.001,float(C@C));bg=np.sum(C[:,None]**2*bases,axis=0)/max(.001,float(C@C));v=fg-bg;alpha=float(K@v/max(1,float(v@v)));lower=np.where(K>=0,K/np.maximum(255-bg,.001),-K/np.maximum(bg,.001));alpha=float(np.clip(max(alpha,float(lower.max())),0,1));color=np.clip(bg+K/max(.001,alpha),0,255)
    return alpha,color
def register(a,mask,left,top,fg,padX=7,padY=9):
    h,w=mask.shape;l=max(0,int(left)-padX);t=max(0,int(top)-padY);r=min(1920,int(left)+w+padX+1);b=min(1080,int(top)+h+padY+1)
    if r-l<w or b-t<h:return [0,*fg,0,0]
    patch=a[t:b,l:r];background=np.median(a[3:9,l:r],axis=0);B=np.broadcast_to(background[None,:,:],patch.shape);D=patch-B;target=np.sqrt(np.sum(D*D,2));corr=cv2.matchTemplate(target,mask,cv2.TM_CCOEFF_NORMED);_,rho,_,(dx,dy)=cv2.minMaxLoc(corr)
    if rho<.5 or np.percentile(target,97)<3:return [0,*fg,0,0]
    cropD=D[dy:dy+h,dx:dx+w];cropB=B[dy:dy+h,dx:dx+w];alpha,color=paint(cropD,mask,cropB,fg)
    return [round(alpha,4),*np.round(color,2).tolist(),round(l+dx-left,3),round(t+dy-top,3)]
p=subprocess.Popen(['ffmpeg','-v','error','-i',str(ROOT/'audio/case.mp4'),'-an','-frames:v','196','-vf','format=rgb24,scale=1920:1080:flags=area','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for f in range(196):
    raw=p.stdout.read(1920*1080*3)
    if len(raw)!=1920*1080*3:raise ValueError(f)
    a=np.frombuffer(raw,np.uint8).reshape(1080,1920,3).astype('float32');t=f/60
    for e in actors:
        mask=e['_mask'];off=e['_off'];fg=np.array([232,8,39]if e['id']=='prologue'else[119]*3,dtype=float);values=register(a,mask,e['x']+off[0],e['y']+off[1],fg)
        e['curve'].append([round(t,6),*values])
    if f%60==0:print('intro frames',f,flush=True)
p.stdout.close()
if p.wait():raise RuntimeError('intro ffmpeg')
for e in actors:
    for k in list(e):
        if k.startswith('_')or k in ['anchor','rho','factor','size']:e.pop(k)
result=dict(fontScores={f'{k[0]} {k[1]}':float(np.mean(v))for k,v in scores.items()},actors=actors)
large=[e for e in actors if len(e['text'])==1 and e['text']not in ['ー','☆']]
for e in actors:
    if e['text']=='ー':
        for i,k in enumerate(e['curve']):
            if max(a['curve'][i][1]for a in large)==0:k[1]=0
(OUT/'intro-measurements-round2.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'),default=float),encoding='utf8');print(result['fontScores'],[(e['id'],e['fontSize'])for e in actors[:4]],flush=True)
