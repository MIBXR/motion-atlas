import sys
from pathlib import Path
from functools import lru_cache
import json,cv2,numpy as np
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
words=read(OUT/'word-descriptors.json');metrics=read(OUT/'word-font-metrics.json');ann=read(CASE/'film/data/annotations.json');shots=read(CASE/'film/data/shots.json');rows={r:np.array(k)for r,k in read(CASE/'film/data/rowStates.json')['rows'].items()};heads=np.load(ANA/'frames/heads.npy');counters=np.load(ANA/'frames/counters.npy',mmap_mode='r');counterFg=[]
for a in counters:
    bg=np.median(a,axis=(0,1));d=np.max(abs(a.astype(float)-bg),2);mask=d>=max(3,np.percentile(d,99));counterFg.append(np.median(a[mask],axis=0)if np.any(mask)else[232,8,39])
counterFg=np.array(counterFg)
@lru_cache(maxsize=32)
def image(f):return cv2.cvtColor(cv2.imread(str(OUT/'residual-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32')
def camera(t):
    e=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
    if not e:return dict(sx=1,sy=1,head=880,p=0,selected=[])
    c=np.array(e['curve']);p=float(np.interp(t,c[:,0],c[:,1]));sx=1+(e['maxX']-1)*p;sy=1+(e['maxY']-1)*p;head=float(np.interp(t,c[:,0],c[:,2]))
    if e['id']=='focus-cym-pf':c=np.array(e['scaleCurve']);sx=float(np.interp(t,c[:,0],c[:,1]));sy=float(np.interp(t,c[:,0],c[:,2]))
    return dict(sx=sx,sy=sy,head=head,p=p,selected=e['rows'])
def pose(e,t):
    c=camera(t);s=c['sx']if'row'in e or'worldX'in e else 1;x=e['screenX']if'screenX'in e else c['head']+(e['worldX']-190*t)*c['sx']
    if e.get('kind')=='motifLabel':
        m=ann['motifs'][e['motif']-1];y=float(np.interp(t,rows[e['row']][:,0],rows[e['row']][:,1]));off=20+(96*c['p']if e['motif']==9 else 40*c['p']if e['row']in c['selected']else 0);y-=off+7*s;y+=e.get('labelDy',0)*s
    elif'row'in e:
        k=rows[e['row']];cy=float(np.interp(t,k[:,0],k[:,1]));sy=c['sy']if e['row']in c['selected']else c['sx'];y=cy+e.get('pitch',0)*sy+e.get('offset',0)*s
    else:y=e['screenY']
    return x,y,s
def colors(a,f,style):
    bg=np.median(a[3:8,30:500],axis=(0,1));x=int(round(heads[f,0]));best=None
    for xx in range(max(0,x-2),min(1920,x+3)):
        col=a[200:820,xx];med=np.median(col,axis=0);var=float(np.mean(abs(col-med)))
        if best is None or var<best[0]:best=(var,med)
    ink=best[1]
    if f>=7014:ink=np.array([24,24,24],dtype='float32')
    if style=='accent':return bg,counterFg[f]
    if style=='muted':return bg,np.clip(103+(ink-24)*(255-103)/(255-24),0,255)
    return bg,ink
def valid_peak(target,template):
    corr=cv2.matchTemplate(target,template,cv2.TM_CCOEFF_NORMED);h,w=template.shape;mean=cv2.boxFilter(target,-1,(w,h),anchor=(0,0));squares=cv2.boxFilter(target*target,-1,(w,h),anchor=(0,0));corr[(squares-mean*mean)[:corr.shape[0],:corr.shape[1]]<.0001]=-1
    return cv2.minMaxLoc(corr)
result=[];rasterDir=OUT/'word-rasters';snap=OUT/'word-fit-previews';snap.mkdir(exist_ok=True)
cached={e['id']:e for e in read(OUT/'word-geometry-round2.json')} if (OUT/'word-geometry-round2.json').exists() else {}
for e in words:
    previous=cached.get(e['id'])
    if previous and previous.get('detected') and previous.get('match',0)>.85 and previous['text']==e['text'] and previous['fontFamily']==e['fontFamily'] and previous['style']==e['style']:
        result.append(previous);continue
    im=np.array(Image.open(rasterDir/f'{e["id"]}.png').convert('RGBA'))[:,:,3].astype('float32')/255;yy,xx=np.where(im>.005)
    if not len(xx):raise ValueError(e['id'])
    x0,x1=xx.min(),xx.max()+1;y0,y1=yy.min(),yy.max()+1;mask=im[y0:y1,x0:x1];mask=cv2.resize(mask,(max(1,round(mask.shape[1]/2)),max(1,round(mask.shape[0]/2))),interpolation=cv2.INTER_AREA);m=metrics[e['id']];left=x0/2-m['anchor'][0];top=y0/2-m['anchor'][1]
    start=max(180,round(e['t0']*60/6)*6);end=min(7314,round(e['t1']*60/6)*6);available=[]
    for f in range(start,end+1,6):
        x,y,s=pose(e,f/60);l=x+left*s;r=l+mask.shape[1]*s;ty=y+top*s;by=ty+mask.shape[0]*s
        if l>190 and r<1618 and 188<ty and by<815:available.append(f)
    # Registered native glyphs determine geometry; the templates include the browser's font fallback.
    if len(available)>15:available=[available[i]for i in np.linspace(0,len(available)-1,15).astype(int)]
    if '-digit'in e['id']:
        onset=e['worldX']/190;available=sorted(set(available)|{f for f in range(max(start,round(onset*10)*6),min(end,round((onset+.65)*10)*6)+1,6)})
    best=None
    for f in available:
        a=image(f);x,y,s=pose(e,f/60);bg,fg=colors(a,f,e['style']);v=fg-bg
        if np.max(abs(v))<40:continue
        L=round(x+left*s)-15;T=round(y+top*s)-15;R=round(x+(left+mask.shape[1])*s)+16;B=round(y+(top+mask.shape[0])*s)+16;patch=a[T:B,L:R];target=np.clip(np.sum((patch-bg)*v,2)/max(1,float(v@v)),0,1).astype('float32')
        if f<7014:target[:,abs(np.arange(L,R)-heads[f,0])<1.1]=0
        for factor in np.arange(.75,1.251,.025):
            template=cv2.resize(mask,None,fx=s*factor,fy=s*factor,interpolation=cv2.INTER_LINEAR)
            if target.shape[0]<template.shape[0]or target.shape[1]<template.shape[1]:continue
            _,value,_,(dx,dy)=valid_peak(target,template);height=template.shape[0];width=template.shape[1];actual=target[dy:dy+height,dx:dx+width]
            binary=(actual>max(.08,float(np.percentile(actual,97))*.3)).astype('uint8');_,_,stats,_=cv2.connectedComponentsWithStats(binary);tall=any(h>e['fontSize']*s*.35 and area>8 for px,py,w,h,area in stats[1:])
            if not tall:continue
            score=value-.02*abs(factor-1)
            if best is None or score>best['score']:best=dict(score=float(score),correlation=float(value),factor=factor,f=f,L=L+dx,T=T+dy,width=width,height=height,target=actual.copy(),font=template.copy())
    if best is None or best['correlation']<.48:
        result.append(dict(**e,detected=False,match=best['correlation']if best else 0));print('absent',e['id'],best['correlation']if best else 0,flush=True);continue
    f=best['f'];x,y,s=pose(e,f/60);factor=best['factor'];e=e.copy();e['fontSize']*=factor;newLeft=left*factor;newTop=top*factor;dx=(best['L']-(x+newLeft*s))/s;dy=(best['T']-(y+newTop*s))/s
    if'worldX'in e:e['worldX']+=dx
    else:e['screenX']+=dx
    if'row'in e:e['offset']=e.get('offset',0)+dy
    else:e['screenY']+=dy
    # motif labels use the measured baseline correction independently of their bracket transform.
    if e.get('kind')=='motifLabel':e['labelDy']=dy
    actual=best['target'];glyph=best['font'];near=cv2.dilate((glyph>.06).astype('uint8'),np.ones((3,3),np.uint8));actual*=near;alpha=float(np.percentile(actual[actual>.05],98))if np.any(actual>.05)else 1;native=np.clip(actual/max(alpha,.03),0,1)
    np.save(snap/f'{e["id"]}.npy',native.astype('float32'));Image.fromarray((255-native*230).astype('uint8')).save(snap/f'{e["id"]}.png');e.update(detected=True,referenceFrame=f,referenceScale=s,template=str(snap/f'{e["id"]}.npy'),boxOffset=[newLeft,newTop],templateAlpha=alpha,match=best['correlation']);result.append(e);print('word fit',e['id'],round(e['fontSize'],2),round(best['correlation'],3),flush=True)
(OUT/'word-geometry-round2.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
