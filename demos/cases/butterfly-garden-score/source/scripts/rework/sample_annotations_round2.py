import sys
from pathlib import Path
import json,subprocess,cv2,numpy as np
from PIL import Image
ROOT=Path(sys.argv[1]).resolve()
OUT=ROOT/'codex/case-impl'
CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
# Reuse the measured camera and font-coordinate functions without running the fitting pass.
exec(Path(__file__).with_name('fit_words_round2.py').read_text(encoding='utf8').split('result=[]')[0])
descriptors={e['id']:e for e in read(OUT/'word-descriptors.json')}
actors=[e.copy()for e in read(OUT/'word-geometry-round2.json')if e.get('detected')and not e['id'].startswith('M5-digit')]
for e in actors:
    e['_mask']=np.load(e['template'])
    raster=np.array(Image.open(OUT/'word-rasters'/f'{e["id"]}.png'))[:,:,3]/255
    runtimeArea=float(raster.sum()/4*(e['fontSize']/descriptors[e['id']]['fontSize'])**2*e['referenceScale']**2)
    e['_gain']=float(e['_mask'].sum()/max(runtimeArea,.1))
    e['_keys']=[]
    e['_last']=[0,0,1]
    e['_active']=range(max(0,int(e['t0']*60)),min(7320,int(e['t1']*60)+1))
mods=read(OUT/'modulation-detections.json')
for i,m in enumerate(mods):
    m.update(id=f'mod-{i}',_keys=[])
wedges=ann['wedges']
for w in wedges:w['_keys']=[]
rulers=[]
for m in ann['motifs']:
    rulers.append(dict(id='M'+str(m['index']),motif=m['index'],row=m['row'],worldX=m['x'],t0=m['t']-.65,t1=m['t']+7,_keys=[]))
rulers.append(dict(id='ostinato',row='Mar.',worldX=907,t0=2,t1=11,offset=-17,_keys=[]))
def style_color(ink,f,style):
    if style=='accent':return counterFg[f].astype('float32')
    if style=='muted':return np.clip(103+(ink-24)*(255-103)/(255-24),0,255)
    return ink
def paint_from_coefficient(K,bg,fg):
    v=fg-bg
    alpha=float(np.dot(K,v)/max(1,float(v@v)))
    lower=np.where(K>=0,K/np.maximum(255-bg,.001),-K/np.maximum(bg,.001))
    alpha=float(np.clip(max(alpha,float(np.max(lower))),0,1))
    if alpha<.006:return 0,[float(x)for x in fg]
    color=np.clip(bg+K/alpha,0,255)
    return alpha,color.tolist()
def source_palette(a,f):
    bg=np.median(a[0:6,30:1000],axis=(0,1)).astype('float32')
    if f>=7014:return bg,np.array([24,24,24],dtype='float32')
    x=int(round(heads[f,0]));best=None
    for xx in range(max(0,x-2),min(1620,x+3)):
        col=a[10:630,xx].astype('float32');med=np.median(col,axis=0);var=float(np.mean(abs(col-med)))
        if best is None or var<best[0]:best=(var,med)
    return bg,best[1]
def line_runs(mask,gap=4):
    mask=mask.copy();edges=np.flatnonzero(np.diff(np.r_[True,mask,True].astype('int8')))
    for l,r in zip(edges[::2],edges[1::2]):
        if l and r<len(mask)and r-l<=gap:mask[l:r]=True
    z=np.flatnonzero(np.diff(np.r_[False,mask,False].astype('int8')))
    return list(zip(z[::2],z[1::2]))
p=subprocess.Popen(['ffmpeg','-v','error','-i',str(ROOT/'audio/case.mp4'),'-an','-vf','format=rgb24,scale=1920:1080:flags=area,crop=1620:656:0:190','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for f in range(7320):
    raw=p.stdout.read(1620*656*3)
    if len(raw)!=1620*656*3:raise ValueError(f)
    a=np.frombuffer(raw,np.uint8).reshape(656,1620,3)
    t=f/60
    bg,ink=source_palette(a,f)
    c=camera(t);sx=c['sx']
    clipLeft=max(0,c['head']-700*c['sx'])
    for e in actors:
        if f not in e['_active']:continue
        x,y,s=pose(e,t)
        base=e['_mask'];ratio=s/e['referenceScale'];L=x+e['boxOffset'][0]*s;T=y+e['boxOffset'][1]*s
        pad=10
        left=max(int(clipLeft),int(np.floor(L))-pad)
        top=max(190,int(np.floor(T))-pad)
        right=min(1620,int(np.ceil(L+base.shape[1]*ratio*1.3))+pad)
        bottom=min(846,int(np.ceil(T+base.shape[0]*ratio*1.3))+pad)
        fg=style_color(ink,f,e['style'])
        if right-left<4 or bottom-top<4:
            e['_keys'].append([round(t,6),0,*map(float,fg),0,0,1]);continue
        patch=a[top-190:bottom-190,left:right].astype('float32')
        D=patch-bg
        magnitude=np.sqrt(np.sum(D*D,2)).astype('float32')
        valid=np.ones(magnitude.shape,dtype=bool)
        if f<7014:valid[:,abs(np.arange(left,right)-heads[f,0])<1.1]=False
        magnitude[~valid]=0
        best=None
        factors=[.9,1,1.1,1.2,1.3]if'-digit'in e['id']else[1]
        for factor in factors:
            template=cv2.resize(base,None,fx=ratio*factor,fy=ratio*factor,interpolation=cv2.INTER_LINEAR)
            h,w=template.shape
            if h>magnitude.shape[0]or w>magnitude.shape[1]:continue
            _,rho,_,(dx,dy)=valid_peak(magnitude,template)
            score=rho-.008*abs(factor-1)
            if best is None or score>best[0]:best=(score,rho,dx,dy,template,factor)
        if best is None or best[1]<.42 or np.percentile(magnitude,95)<5:
            e['_keys'].append([round(t,6),0,*map(float,fg),0,0,1]);continue
        _,rho,dx,dy,template,factor=best
        h,w=template.shape
        good=valid[dy:dy+h,dx:dx+w]
        cov=template*good
        pixelD=D[dy:dy+h,dx:dx+w]
        K=np.sum(cov[:,:,None]*pixelD,axis=(0,1))/max(.001,float(np.sum(cov*cov)))
        K*=e['_gain']
        alpha,color=paint_from_coefficient(K,bg,fg)
        shiftX=(left+dx-L)/s
        shiftY=(top+dy-T)/s
        e['_keys'].append([round(t,6),round(alpha,4),*np.round(color,2).tolist(),round(shiftX,3),round(shiftY,3),factor])
    # Measure the four moving dotted modulation lines independently of the score rows.
    for mi,m in enumerate(mods):
        if not m['first']-30<=f<=m['last']+84:continue
        gx=m['globalX']+.5
        x=gx-190*t+880
        if not 180<x<1581:
            m['_keys'].append([round(t,6),0,*map(float,counterFg[f]),gx,221,775,1.5]);continue
        xx=round(x);l=max(0,xx-4);r=min(1620,xx+5)
        pixels=a[30:590,l:r].astype('float32')
        B=(a[30:590,max(0,xx-7)].astype('float32')+a[30:590,min(1619,xx+7)].astype('float32'))/2
        delta=pixels-B[:,None,:]
        mag=np.sqrt(np.sum(delta*delta,2))
        profile=np.percentile(mag,94,axis=0)
        if profile.max()<7:
            m['_keys'].append([round(t,6),0,*map(float,counterFg[f]),gx,221,775,1.5]);continue
        centre=float(np.sum((np.arange(l,r)+.5)*profile)/profile.sum())
        width=float(np.clip(profile.sum()/profile.max(),.75,2.5))
        jj=int(np.argmax(profile))
        vertical=mag[:,jj]
        mask=vertical>max(7,float(np.percentile(vertical,90))*.3)
        z=np.flatnonzero(np.diff(np.r_[False,mask,False].astype('int8')))
        segments=[(int(s+220),int(e+220))for s,e in zip(z[::2],z[1::2])if 1<=e-s<=6]
        if len(segments)<6:
            m['_keys'].append([round(t,6),0,*map(float,counterFg[f]),gx,221,775,width]);continue
        if 'dash'not in m:
            ds=np.diff([s for s,e in segments]);ds=ds[(ds>=6)&(ds<=12)]
            if len(ds)>3:m['dash']=[float(np.median([e-s for s,e in segments])),float(np.median(ds))]
        on=np.zeros(len(vertical),bool)
        for sy,ey in segments:on[sy-220:ey-220]=True
        core=delta[on,jj]
        localB=B[on]
        fg=counterFg[f].astype('float32')
        v=fg-localB
        ratios=np.sum(core*v,1)/np.maximum(np.sum(v*v,1),1)
        alpha=float(np.clip(np.percentile(ratios,80),0,1))
        first=min(s for s,e in segments);last=max(e for s,e in segments)
        m['_keys'].append([round(t,6),round(alpha,4),*map(float,fg),(centre-880)+190*t,first,last,round(width,3)])
    # Ruler endpoints are read directly, including the endpoint's note-by-note expansion.
    for r in rulers:
        if not r['t0']<=t<=r['t1']:continue
        cy=float(np.interp(t,rows[r['row']][:,0],rows[r['row']][:,1]));sx=c['sx']
        if 'motif'in r:
            offset=20+(96*c['p']if r['motif']==9 else 40*c['p']if r['row']in c['selected']else 0)
            yy=cy-offset
        else:yy=cy+r['offset']*sx
        start=c['head']+(r['worldX']-190*t)*sx
        left=max(int(clipLeft),int(np.floor(start))-5);right=min(1620,int(start+650*sx))
        top=max(190,round(yy)-9);bottom=min(846,round(yy)+10)
        if right-left<8 or bottom-top<3:
            r['_keys'].append([round(t,6),r['worldX'],yy-cy,0,9]);continue
        D=a[top-190:bottom-190,left:right].astype('float32')-bg
        v=ink-bg
        P=np.clip(np.sum(D*v,2)/max(1,float(v@v)),0,1)
        P[:,abs(np.arange(left,right)-heads[f,0])<1.1]=0
        best=None
        for yi in range(len(P)):
            vals=P[yi];peak=float(np.percentile(vals,97))
            if peak<.18:continue
            for lo,hi in line_runs(vals>max(.08,peak*.35)):
                if hi-lo<6 or abs(left+lo-max(clipLeft,start))>8:continue
                score=(hi-lo)*min(1,peak*2)-4*abs(top+yi+.5-yy)
                if best is None or score>best[0]:best=(score,lo,hi,yi,peak)
        if best is None:
            r['_keys'].append([round(t,6),r['worldX'],yy-cy,0,9]);continue
        _,lo,hi,yi,alpha=best
        lineY=top+yi+.5
        endX=left+hi-.5
        endWorld=(endX-c['head'])/sx+190*t
        r['_keys'].append([round(t,6),round(endWorld,3),round(lineY-cy,3),round(float(np.clip(alpha,0,1)),4),9])
    # Each visible hairpin is fitted as two straight ridges in the native dyn. band.
    dynY=float(np.interp(t,rows['dyn.'][:,0],rows['dyn.'][:,1]))
    middle=795.5+dynY-798
    top=max(190,round(middle)-9);bottom=min(846,round(middle)+10)
    if bottom-top>=6 and f>=139:
        native=a[top-190:bottom-190,180:1580].astype('float32')
        delta=native-bg
        strength=np.sqrt(np.sum(delta*delta,2))
        threshold=max(7,float(np.percentile(strength,96))*.2)
        mask=strength>threshold
        for lo,hi in line_runs(np.any(mask,axis=0),1):
            if hi-lo<8:continue
            Xs=[];upper=[];lower=[];energy=[];peaks=[];Ds=[]
            for xx in range(lo,hi):
                ys=np.arange(top,bottom)+.5;values=strength[:,xx];up=ys<middle-.5;down=ys>middle+.5
                su=float(values[up].sum());sd=float(values[down].sum())
                if su<10 or sd<10:continue
                uy=float(np.sum(ys[up]*values[up])/su);dy=float(np.sum(ys[down]*values[down])/sd)
                if dy-uy<2:continue
                Xs.append(xx+180+.5);upper.append(uy);lower.append(dy);energy.append(float(np.sum(values)));peaks.append(float(values.max()));Ds.append(np.sum(delta[:,xx],axis=0))
            if len(Xs)<6:continue
            X=np.stack([np.ones(len(Xs)),Xs],axis=1);cu=np.linalg.lstsq(X,np.array(upper),rcond=None)[0];cd=np.linalg.lstsq(X,np.array(lower),rcond=None)[0];err=float(np.mean(abs(X@cu-upper))+np.mean(abs(X@cd-lower)))
            if err>1.2:continue
            x0=float(min(Xs));x1=float(max(Xs));gx0=(x0-c['head'])/sx+190*t;gx1=(x1-c['head'])/sx+190*t
            candidates=[w for w in wedges if max(gx0,w['x0'])<min(gx1,w['x1'])]
            if not candidates:continue
            w=min(candidates,key=lambda w:min(abs(gx0-w['x0']),abs(gx1-w['x1'])))
            width=float(np.median(np.array(energy)/np.maximum(np.array(peaks),1))/2)
            width=float(np.clip(width,1,2.5))
            K=np.median(np.array(Ds),axis=0)/(2*width)
            alpha,color=paint_from_coefficient(K,bg,ink)
            values=[round(t,6),round(alpha,4),*np.round(color,2).tolist(),round(gx0,3),round(gx1,3),float(cu@[1,x0]),float(cu@[1,x1]),float(cd@[1,x0]),float(cd@[1,x1]),round(width,3)]
            w['_keys'].append(values)
    if f%300==0:print('annotation frames',f,'word keys',sum(len(e['_keys'])for e in actors),flush=True)
p.stdout.close()
if p.wait():raise RuntimeError('ffmpeg annotation sampling')
for e in actors:
    e['curve']=e.pop('_keys')
    e['alphaSpace']='native-composite'
    for key in [k for k in e if k.startswith('_')]:e.pop(key)
for m in mods:m['curve']=m.pop('_keys')
for r in rulers:r['curve']=r.pop('_keys')
for w in wedges:w['curve']=w.pop('_keys')
(OUT/'annotation-frame-measurements.json').write_text(json.dumps(dict(words=actors,modulations=mods,rulers=rulers,wedges=wedges),ensure_ascii=False,separators=(',',':')),encoding='utf8')
print('annotation sampling complete',flush=True)
