import sys
from pathlib import Path
import json,subprocess,numpy as np,cv2
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));cv2.setNumThreads(2)
exec(Path(__file__).with_name('fit_words_round2.py').read_text(encoding='utf8').split('result=[]')[0])
score=read(CASE/'film/data/notes.json');notes=score['notes'];samples=[[]for _ in notes];heads=np.load(ROOT/'analysis/case/frames/heads.npy');backgrounds=shots['backgrounds'];wordGeometry=read(OUT/'word-geometry-round2.json')
names=list(rows);rowIndex=np.array([names.index(n['row'])for n in notes]);NX0=np.array([n['x0']for n in notes]);NX1=np.array([n['x1']for n in notes]);NY=np.array([n['yOffset']for n in notes]);HT=np.array([[n[k]for n in notes]for k in ['futureThickness','currentThickness','thickness']]);PA=np.array([[score['rowColors'][f'{n["row"]}:{m}']['paint']['alpha']for n in notes]for m in [0,1]]);PC=np.array([[score['rowColors'][f'{n["row"]}:{m}']['paint']['color']for n in notes]for m in [0,1]]);AT=np.array([[max(.000001,score['rowColors'][f'{n["row"]}:{m}']['attack'])for n in notes]for m in [0,1]]);RE=np.array([[score['rowColors'][f'{n["row"]}:{m}']['release']for n in notes]for m in [0,1]]);DE=np.array([[score['rowColors'][f'{n["row"]}:{m}']['delay']for n in notes]for m in [0,1]])
def smooth(x):x=np.clip(x,0,1);return x*x*(3-2*x)
def q_at(t):
    q=0
    for e in backgrounds:
        if t>=e['t1']:q=e['to']
        elif t>=e['t0']:k=np.array(e['curve']);q=float(np.interp(t,k[:,0],k[:,1]));break
    return q
def state(n,t,q):
    modes=[]
    for mode in [0,1]:
        s=score['rowColors'][f'{n["row"]}:{mode}'];attack=smooth((t-n['x0']/190)/max(.000001,s['attack']));release=smooth((t-(n['x1']+6)/190-s['delay'])/s['release']);current=attack*(1-release);past=attack*release;alpha=s['paint']['alpha'][0]*(1-attack)+s['paint']['alpha'][1]*current+s['paint']['alpha'][2]*past;modes.append((alpha,current,attack,np.array(s['paint']['color'])))
    a,b=modes;op=a[0]*(1-q)+b[0]*q;F=(a[3]*a[0]*(1-q)+b[3]*b[0]*q)/max(.00001,op);current=a[1]*(1-q)+b[1]*q;attack=a[2]*(1-q)+b[2]*q;h=n['futureThickness']*(1-attack)+n['currentThickness']*current+n['thickness']*(attack-current);return F,h
geometry={e['id']:e for e in wordGeometry if e.get('detected')};wordBoxes={}
for e in wordGeometry:
    if e.get('detected'):
        shape=np.load(e['template'],mmap_mode='r').shape;wordBoxes[e['id']]=shape
runtimeWords=[e for e in wordGeometry if e.get('detected')]
p=subprocess.Popen(['ffmpeg','-v','error','-threads','4','-i',str(ROOT/'audio/case.mp4'),'-an','-vf',r'select=not(mod(n\,2)),format=rgb24,scale=1920:1080:flags=area,crop=1620:656:0:190','-fps_mode','vfr','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for f in range(0,7320,2):
    raw=p.stdout.read(1620*656*3)
    if len(raw)!=1620*656*3:raise ValueError(f)
    a=np.frombuffer(raw,np.uint8).reshape(656,1620,3).astype('float32');t=f/60;c=camera(t);sx=c['sx'];globalSy=sx;focus=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
    if focus and focus['id']=='focus-cym-pf':v=np.array(focus['verticalCurve']);globalSy=float(np.interp(t,v[:,0],v[:,1]))
    poses={r:float(np.interp(t,k[:,0],k[:,1]))for r,k in rows.items()};paper=np.median(a[3:20,900:1200],axis=(0,1));ink=np.array([24]*3,dtype=float)
    hx=int(round(heads[f,0]))
    if 2<hx<1617 and t<116.9:
        candidates=[]
        for x in range(hx-1,hx+2):
            med=np.median(a[10:620,x],axis=0);candidates.append((float(np.mean(abs(a[10:620,x]-med))),med))
        ink=min(candidates,key=lambda v:v[0])[1]
    mag=np.max(abs(a[:,180:1580]-paper),2);index=np.argpartition(mag,20,axis=1)[:,:20];B=np.median(np.take_along_axis(a[:,180:1580],index[:,:,None],axis=1),axis=1);v=ink-paper;gridAlpha=np.sum((B-paper)*v,1)/max(1,float(v@v));gridAlpha=np.clip(gridAlpha,0,.6)
    exclusions=[]
    for w in runtimeWords:
        e=geometry.get(w['id'])
        if not e or not w['t0']<=t<w['t1']:continue
        x,y,s=pose(e,t);off=e['boxOffset'];shape=wordBoxes[e['id']];exclusions.append((x+off[0]*s-3,y+off[1]*s-3,x+off[0]*s+shape[1]*s/e['referenceScale']+3,y+off[1]*s+shape[0]*s/e['referenceScale']+3))
    q=q_at(t);inGiant=any(e['t0']<=t<e['t1']for e in shots['giants']);left=max(0,c['head']-700*sx);right=min(1620,c['head']+700*sx);X0=c['head']+(NX0-190*t)*sx;X1=c['head']+(NX1-190*t)*sx;SY=np.array([c['sy']if r in c['selected']else globalSy for r in names]);Y=np.array([poses[r]for r in names])[rowIndex]+NY*SY[rowIndex];visible=np.flatnonzero((X1>=left+2)&(X0<=right-2)&(Y>207)&(Y<829));attack=smooth((t-NX0[None,:]/190)/AT);release=smooth((t-(NX1[None,:]+6)/190-DE)/RE);current=attack*(1-release);past=attack*release;op=PA[:,:,0]*(1-attack)+PA[:,:,1]*current+PA[:,:,2]*past;weighted=op[0]*(1-q)+op[1]*q;Foreground=(PC[0]*op[0,:,None]*(1-q)+PC[1]*op[1,:,None]*q)/np.maximum(.00001,weighted[:,None]);Current=current[0]*(1-q)+current[1]*q;Attack=attack[0]*(1-q)+attack[1]*q;Height=(HT[0]*(1-Attack)+HT[1]*Current+HT[2]*(Attack-Current))*sx
    for i in visible:
        n=notes[i];x0=X0[i];x1=X1[i];y=Y[i]
        if f<139:samples[i].append([f,0]);continue
        F=Foreground[i];h=Height[i]
        margin=max(4,h/2+1);l=max(x0+margin,left+2);r=min(x1-margin,right-2)
        if r>=l:xs=np.linspace(l,r,min(3,max(1,int((r-l)/30)+1)))
        elif n['kind']=='dot'and left<(x0+x1)/2<right:xs=[(x0+x1)/2]
        else:continue
        ratios=[]
        for xf in xs:
            x=int(round(xf))
            if abs(x-heads[f,0])<4:continue
            if any(l-1<x<r+1 and top-2<y<bottom+2 for l,top,r,bottom in exclusions):continue
            pad=max(4,int(h/2)+3);up=int(round(y-pad))-190;down=int(round(y+pad))-190
            upper=np.mean(a[up,x-1:x+2],axis=0);lower=np.mean(a[down,x-1:x+2],axis=0);local=(upper+lower)/2
            if np.max(abs(upper-lower))>12:continue
            if np.max(abs(local-paper))>15 and not(inGiant and local[1]>paper[1]+25):continue
            top=max(190,int(np.floor(y-h/2))-1);bottom=min(846,int(np.ceil(y+h/2))+1)
            yy=np.arange(top,bottom);coverage=np.maximum(0,np.minimum(yy+1,y+h/2)-np.maximum(yy,y-h/2));base=local[None,:]+(ink-local)[None,:]*gridAlpha[yy-190,None];observed=np.mean(a[yy-190,x-1:x+2],axis=1);prediction=(F[None,:]-base)*coverage[:,None];numerator=float(np.sum((observed-base)*prediction));denominator=float(np.sum(prediction*prediction))
            if denominator>20:ratios.append(float(np.clip(numerator/denominator,0,1)))
        if ratios:samples[i].append([f,round(float(np.median(ratios)),4)])
    if f%600==0:print('note alpha',f,sum(len(s)for s in samples),flush=True)
p.stdout.close()
if p.wait():raise RuntimeError('note alpha decode')
(OUT/'note-alpha-measurements-round2.json').write_text(json.dumps(samples,separators=(',',':')),encoding='utf8');print('note alpha complete',flush=True)
