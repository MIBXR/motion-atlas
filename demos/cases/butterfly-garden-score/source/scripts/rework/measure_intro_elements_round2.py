import sys
from pathlib import Path
import json,cv2,numpy as np,subprocess
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));cv2.setNumThreads(2)
words=read(OUT/'intro-word-metrics.json');base=[]
def normalize(a):
    B=np.median(a[3:9],axis=0);panel=np.flatnonzero(B[:,0]-B[:,1]>25);edge=float(panel[0])if len(panel)else 1920.;F=np.where((np.arange(1920)<edge)[:,None],24.,255.);v=F-B;D=a-B[None,:,:];P=np.sum(D*v[None,:,:],2)/np.maximum(1,np.sum(v*v,1))[None,:];return np.clip(P,0,1).astype('float32'),edge,B,v
def template(e):
    im=np.array(Image.open(OUT/'intro-word-rasters'/f'{e["id"]}.png'))[:,:,3].astype('float32')/255;ys,xs=np.where(im>.005);l,r=xs.min(),xs.max()+1;t,b=ys.min(),ys.max()+1;mask=cv2.resize(im[t:b,l:r],(round((r-l)/2),round((b-t)/2)),interpolation=cv2.INTER_AREA);return mask,np.array([l/2-e['anchor'][0],t/2-e['anchor'][1]])
def correlation(target,mask):
    cc=cv2.matchTemplate(target,mask,cv2.TM_CCOEFF_NORMED);h,w=mask.shape;mean=cv2.boxFilter(target,-1,(w,h),anchor=(0,0),normalize=True);squares=cv2.boxFilter(target*target,-1,(w,h),anchor=(0,0),normalize=True);variance=(squares-mean*mean)[:cc.shape[0],:cc.shape[1]];cc[variance<.0001]=-1
    return cv2.minMaxLoc(cc)
ref=np.array(Image.open(OUT/'residual-reference/00120.png')).astype('float32');P,_,_,_=normalize(ref)
for e in words:
    mask,off=template(e);e=e.copy();e['_mask']=mask;e['_off']=off;best=None
    top=max(0,int(163+e['offset']+off[1])-40);bottom=min(1080,int(163+e['offset']+off[1]+mask.shape[0])+45);left=1280;right=1400;target=P[top:bottom,left:right]
    for fx in np.arange(.75,1.151,.025):
        for fy in np.arange(.8,1.151,.025):
            m=cv2.resize(mask,None,fx=fx,fy=fy,interpolation=cv2.INTER_LINEAR)
            if m.shape[0]>target.shape[0]:continue
            _,rho,_,(x,y)=correlation(target,m)
            patch=target[y:y+m.shape[0],x:x+m.shape[1]]
            if patch.std()<.03:continue
            if best is None or rho>best[0]:best=(rho,fx,fy,left+x-off[0]*fx,top+y-off[1]*fy)
    if best is None:raise ValueError(e['id'])
    e.update(match=best[0],fx=best[1],fy=best[2],x=best[3],y=best[4]);e['_mask']=cv2.resize(mask,None,fx=e['fx'],fy=e['fy'],interpolation=cv2.INTER_LINEAR);e['_off']=off*np.array([e['fx'],e['fy']]);base.append(e)
originX=float(np.median([e['x']for e in base if e['role']=='prefix']));originY=next(e['y']for e in base if e['id']=='prefix-0')
for e in base:e['offsetX']=e['x']-originX;e['offsetY']=e['y']-originY
motion=[]
for f in range(120,229,6):
    a=np.array(Image.open(OUT/'residual-reference'/f'{f:05d}.png')).astype('float32');P,_,_,_=normalize(a);t=f/60;u=np.clip((t-2.1)/1.1,0,1);u=u*u*(3-2*u);nomX=1341+(1688.73077-1341)*u;nomY=163+(75.94915-163)*u;sx=(1+(25/26-1)*u)*(30-4*u)/30;sy=(1+(363/354-1)*u)*(30-4*u)/30;matches=[]
    for e in base:
        if e['text']=='—':continue
        Sx=sx if e['role']=='prefix'else 1+(25/26-1)*u;Sy=sy if e['role']=='prefix'else 1+(363/354-1)*u;mask=cv2.resize(e['_mask'],None,fx=Sx,fy=Sy,interpolation=cv2.INTER_LINEAR);off=e['_off']*np.array([Sx,Sy]);x0=nomX+e['offsetX']*Sx+off[0];y0=nomY+e['offsetY']*Sy+off[1];l=max(1250,int(x0)-145);r=min(1760,int(x0)+mask.shape[1]+120);top=max(0,int(y0)-65);bottom=min(1080,int(y0)+mask.shape[0]+66);target=P[top:bottom,l:r]
        if target.shape[0]<mask.shape[0]:continue
        _,rho,_,(x,y)=correlation(target,mask);patch=target[y:y+mask.shape[0],x:x+mask.shape[1]]
        if rho>.5 and patch.std()>.03:matches.append(dict(role=e['role'],id=e['id'],x=l+x-off[0],y=top+y-off[1],offset=e['offsetY'],rho=rho))
    valid=[m for m in matches if m['role']=='prefix'];scales=[]
    for i,m in enumerate(valid):
        for n in valid[i+1:]:
            if abs(n['offset']-m['offset'])>90:
                scale=(n['y']-m['y'])/(n['offset']-m['offset'])
                if .75<scale<1.1:scales.append(scale)
    if len(valid)>=2 and scales:
        ScaleY=float(np.median(scales));X=float(np.median([m['x']for m in valid]));Y=float(np.median([m['y']-m['offset']*ScaleY for m in valid]));motion.append([f/60,X,Y,sx,ScaleY]);
    print('English motion',f,[(m['id'],round(m['rho'],2),round(m['x'],1),round(m['y'],1))for m in valid],flush=True)
motion=np.array(motion);print('word reference',[(e['id'],round(e['match'],2),round(e['fx'],2),round(e['fy'],2))for e in base],flush=True)
# The official mark supplies its own color and alpha template.
rgba=np.array(Image.open(CASE/'assets/official-intro-red.png').convert('RGBA')).astype('float32')/255;rgba=cv2.resize(rgba,(522,234),interpolation=cv2.INTER_AREA);logoMask=np.sqrt(np.sum(((rgba[:,:,:3]-1)*rgba[:,:,3,None])**2,2));logoMask/=max(.01,float(logoMask.max()));logoMotion=[]
for f in range(120,229,6):
    a=np.array(Image.open(OUT/'residual-reference'/f'{min(7314,round(f/6)*6):05d}.png')).astype('float32')if f%6==0 else None
    if a is None:continue
    P,_,_,_=normalize(a);target=cv2.resize(P[650:1010],(960,180),interpolation=cv2.INTER_AREA);best=None
    for s in np.arange(.44,1.031,.02):
        m=cv2.resize(logoMask,None,fx=s*.5,fy=s*.5,interpolation=cv2.INTER_AREA);_,rho,_,(x,y)=correlation(target,m)
        if best is None or rho>best[0]:best=(rho,s,x*2,y*2+650)
    _,scale,x,y=best;small=P[max(630,y-10):min(1040,y+round(234*scale)+12),max(0,x-12):min(1920,x+round(522*scale)+14)];left=max(0,x-12);top=max(630,y-10);fine=None
    for w in range(round(522*scale)-8,round(522*scale)+9,2):
        for h in range(round(234*scale)-7,round(234*scale)+8):
            m=cv2.resize(logoMask,(w,h),interpolation=cv2.INTER_AREA)
            if m.shape[0]>small.shape[0]or m.shape[1]>small.shape[1]:continue
            _,rho,_,(dx,dy)=correlation(small,m)
            if fine is None or rho>fine[0]:fine=(rho,left+dx,top+dy,w,h)
    logoMotion.append([f/60,*fine[1:]]);print('mark',f,tuple(round(float(x),2)for x in fine),flush=True)
logoMotion=np.array(logoMotion);curves=[];panel=[];prefixAlpha=[];suffixAlpha=[]
white=np.array(Image.open(CASE/'assets/official-white.png').convert('RGBA')).astype('float32')/255
whiteMap=[(1652-logoMotion[-1,1])/logoMotion[-1,3],(850-logoMotion[-1,2])/logoMotion[-1,4],237/logoMotion[-1,3],111/logoMotion[-1,4]]
p=subprocess.Popen(['ffmpeg','-v','error','-i',str(ROOT/'audio/case.mp4'),'-an','-frames:v','229','-vf','format=rgb24,scale=1920:1080:flags=area','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for f in range(229):
    raw=p.stdout.read(1920*1080*3)
    if len(raw)!=1920*1080*3:raise ValueError(f)
    a=np.frombuffer(raw,np.uint8).reshape(1080,1920,3).astype('float32');P,edge,B,v=normalize(a);t=f/60;panel.append([round(t,6),edge]);X,Y,Sx,Sy=[float(np.interp(t,motion[:,0],motion[:,i]))for i in range(1,5)];alphas={'prefix':[],'suffix':[]}
    for e in base:
        mask=cv2.resize(e['_mask'],None,fx=Sx,fy=Sy,interpolation=cv2.INTER_LINEAR);x=X+e['offsetX']*Sx+e['_off'][0]*Sx;y=Y+e['offsetY']*Sy+e['_off'][1]*Sy;h,w=mask.shape;l=int(round(x));top=int(round(y))
        if l<0 or top<0 or l+w>1920 or top+h>1080:continue
        roi=P[top:top+h,l:l+w];alpha=float(np.sum(roi*mask)/max(.001,float(np.sum(mask*mask))));alphas[e['role']].append(float(np.clip(alpha,0,1)))
    prefixAlpha.append([round(t,6),float(np.median(alphas['prefix']))if alphas['prefix']else 0]);suffixAlpha.append([round(t,6),float(np.median(alphas['suffix']))if alphas['suffix']else 0]);x,y,w,h=[float(np.interp(t,logoMotion[:,0],logoMotion[:,i]))for i in range(1,5)]
    wx=x+whiteMap[0]*w;wy=y+whiteMap[1]*h;ww=w*whiteMap[2];wh=h*whiteMap[3];l=max(0,int(np.floor(min(x,wx))));top=max(0,int(np.floor(min(y,wy))));right=min(1920,int(np.ceil(max(x+w,wx+ww))));bottom=min(1080,int(np.ceil(max(y+h,wy+wh))));shape=(bottom-top,right-l);delta=np.zeros((*shape,3),dtype='float32')
    for bitmap,box,inverse in [(rgba,[x,y,w,h],False),(white,[wx,wy,ww,wh],True)]:
        bx,by,bw,bh=box;alpha=cv2.resize(bitmap[:,:,3],(round(bw),round(bh)),interpolation=cv2.INTER_AREA);premult=cv2.resize(bitmap[:,:,:3]*bitmap[:,:,3,None],(round(bw),round(bh)),interpolation=cv2.INTER_AREA)*255;xx=round(bx);yy=round(by);sourceB=B[xx:xx+alpha.shape[1]][None,:,:];D=premult-alpha[:,:,None]*sourceB;selected=np.arange(xx,xx+alpha.shape[1])>=edge
        if not inverse:selected=~selected
        D[:,~selected]=0;dl=xx-l;dt=yy-top;rh=min(shape[0]-dt,D.shape[0]);rw=min(shape[1]-dl,D.shape[1]);delta[dt:dt+rh,dl:dl+rw]+=D[:rh,:rw]
    observed=a[top:bottom,l:right]-B[l:right][None,:,:];opacity=float(np.sum(delta*observed)/max(.01,float(np.sum(delta*delta))));curves.append([round(t,6),x,y,w,h,float(np.clip(opacity,0,1))])
p.stdout.close()
if p.wait():raise RuntimeError('intro source')
for e in base:
    for k in list(e):
        if k.startswith('_')or k in ['anchor','offset']:e.pop(k)
result=dict(words=base,wordMotion=motion.tolist(),prefixAlpha=prefixAlpha,suffixAlpha=suffixAlpha,logo=curves,whiteMap=whiteMap,panel=panel)
(OUT/'intro-elements-round2.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'),default=float),encoding='utf8');print('intro elements measured',flush=True)
