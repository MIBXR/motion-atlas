import sys
from pathlib import Path
import json,subprocess,cv2,numpy as np
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
ann=read(CASE/'film/data/annotations.json');obs=read(WORK/'dyn-component-observations.json');tracks={r:np.array(k)for r,k in read(CASE/'film/data/rowStates.json')['rows'].items()};font=ImageFont.truetype(str(CASE/'fonts/CormorantGaramond-Italic.ttf'),25);font.set_variation_by_axes([500])
words=[(726,'f'),(908,'mf giocoso'),(3828,'f'),(5275,'mp dolce'),(8260,'mf scherzando'),(11390,'f dolce'),(12878,'mf dolce'),(15394,'p'),(18560,'mf'),(20572,'mp'),(21580,'p')]
dynamics=[]
for x,word in words:
    bb=font.getbbox(word,anchor='ls');width=bb[2]-bb[0];matches=[]
    for o in obs:
        t=o['frame']/60
        if t<3.2 or any(a<t<b for a,b in [(8.3,12.4),(56.2,60.283333),(88,93.5)]):continue
        area=sum(b['area']for b in o['boxes']if x+bb[0]-10<=b['x']<=x+bb[2]+10 and b['h']>=12 and b['w']<100 and b['y']<804)
        if area>15:matches.append((o['frame'],area))
    if x==21580:
        proc=subprocess.Popen(['ffmpeg','-v','error','-ss','112','-i',str(ROOT/'audio/case.mp4'),'-frames:v','300','-an','-vf','format=rgb24,scale=1920:1080:flags=area,crop=1400:40:180:777','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
        for frame in range(6720,7020):
            raw=proc.stdout.read(1400*40*3)
            if len(raw)!=1400*40*3:raise ValueError(frame)
            a=np.frombuffer(raw,np.uint8).reshape(40,1400,3);contrast=np.max(abs(a.astype(float)-255),2);_,_,stats,_=cv2.connectedComponentsWithStats((contrast>5).astype('uint8'))
            area=sum(int(area)for px,py,w,h,area in stats[1:]if x+bb[0]-10<=px+180+190*frame/60-880<=x+bb[2]+10 and h>=9 and w<40)
            if area>8:matches.append((frame,area))
        proc.stdout.close()
        if proc.wait():raise RuntimeError('ffmpeg last dynamic')
    if not matches:raise ValueError((word,x,bb))
    peak=max(a for f,a in matches);visible=[f for f,a in matches if a>=max(18,peak*.12)];t0=min(visible)/60;t1=(max(visible)+1)/60
    mask=Image.new('L',(width+4,bb[3]-bb[1]+4));ImageDraw.Draw(mask).text((2-bb[0],2-bb[1]),word,font=font,fill=255,anchor='ls');m=np.array(mask,dtype=float)/255
    keys=[]
    for f in range(int(np.ceil(t0*2)*30),min(6991,int(t1*60)),30):
        t=f/60
        if any(a<t<b for a,b in [(8.3,12.4),(56.2,61.3),(88,93.5)]):continue
        px=int(round(x-190*t+880+bb[0]-2));py=801+bb[1]-2
        if px<182 or px+m.shape[1]>1579:continue
        a=cv2.cvtColor(cv2.imread(str(ANA/'frames'/f's{f:05d}.jpg')),cv2.COLOR_BGR2RGB).astype(float);bg=np.median(a[780:812,1180:1560],axis=(0,1));fg=np.array([255]*3 if bg[1]<100 else[24]*3);v=fg-bg
        patch=a[py:py+m.shape[0],px:px+m.shape[1]];num=np.sum((patch-bg)*m[:,:,None]*v);den=np.sum(m*m)*float(v@v)
        rowAlpha=float(np.interp(t,tracks['dyn.'][:,0],tracks['dyn.'][:,2]));alpha=float(np.clip(num/max(1,den)/max(rowAlpha,.01),0,1));keys.append([round(t,6),round(alpha,4)])
    if not keys:keys=[[t0,1],[t1,1]]
    if x==11390:t0=59.95
    keys=[[round(t0,6),keys[0][1]],*keys,[round(t1,6),keys[-1][1]]];dynamics.append(dict(x=x,text=word,row='dyn.',y=801,t0=round(t0,6),t1=round(t1,6),alpha=keys))
ann['dynamics']=dynamics
# The full-strip maximum joins the wedge strokes while retaining their measured slopes.
pano=255-np.array(Image.open(WORK/'dynamics-panorama-filled.png'));lines=cv2.HoughLinesP((pano>65).astype('uint8'),1,np.pi/7200,50,minLineLength=90,maxLineGap=10);ls=[]if lines is None else[np.array(l,dtype=float)for l in np.asarray(lines).reshape(-1,4)if l[2]-l[0]>90 and abs(l[3]-l[1])<13]
candidates=[]
for i,a in enumerate(ls):
    for b in ls[i+1:]:
        if abs(a[0]-b[0])>24 or abs(a[2]-b[2])>24:continue
        if (a[3]-a[1])*(b[3]-b[1])>0 or max(abs(a[1]-b[1]),abs(a[3]-b[3]))<4:continue
        candidates.append(dict(x0=float((a[0]+b[0])/2),x1=float((a[2]+b[2])/2),ys=[float(a[1]+777),float(a[3]+777),float(b[1]+777),float(b[3]+777)],row='dyn.'))
wedges=[]
for w in sorted(candidates,key=lambda w:w['x1']-w['x0'],reverse=True):
    if not any(max(0,min(w['x1'],v['x1'])-max(w['x0'],v['x0']))>.7*min(w['x1']-w['x0'],v['x1']-v['x0'])for v in wedges):wedges.append(w)
ann['wedges']=wedges
for i,a in enumerate(ann['arcs']):a.update(fromRow=ann['motifs'][i]['row'],toRow=ann['motifs'][i+1]['row'])
(WORK/'refined-annotations.json').write_text(json.dumps(ann,ensure_ascii=False,separators=(',',':')),encoding='utf8');print(json.dumps(dict(dynamics=[{k:d[k]for k in ['text','x','t0','t1']}for d in dynamics],wedges=len(wedges))),flush=True)
