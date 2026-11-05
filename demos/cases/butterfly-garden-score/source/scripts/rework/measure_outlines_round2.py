import sys
from pathlib import Path
import json,subprocess,numpy as np,cv2
from PIL import Image
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));cv2.setNumThreads(2)
exec(Path(__file__).with_name('fit_words_round2.py').read_text(encoding='utf8').split('result=[]')[0])
score=read(CASE/'film/data/notes.json');outlines=[]
for index in [2,9]:
    m=ann['motifs'][index-1]
    for j,n in enumerate(m['notes']):
        pitch=n['y']
        if index==2 and j==3:pitch=m['notes'][0]['y']+ann['motifs'][0]['notes'][3]['y']-ann['motifs'][0]['notes'][0]['y']
        parent=min((p for p in score['notes']if p['row']==m['row']),key=lambda p:abs(p['x0']-n['x0'])+abs(p['x1']-n['x1'])+abs(p['yOffset']-n['y']))
        outlines.append(dict(id=f'M{index}-{j}',motif=index,row=m['row'],x0=n['x0'],x1=n['x1'],pitch=pitch,parent=parent,h=14,padding=6,stroke=2.5,curve=[]))
def mask_for(e,t,parameters=None):
    c=camera(t);cy=float(np.interp(t,rows[e['row']][:,0],rows[e['row']][:,1]));x0=c['head']+(e['x0']-190*t)*c['sx'];x1=c['head']+(e['x1']-190*t)*c['sx'];y=cy+e['pitch']*(c['sy']if e['row']in c['selected']else c['sx']);height,pad,stroke=parameters or(e['h'],e['padding'],e['stroke']);r=height/2;l=max(0,int(x0-pad-stroke-2));right=min(1620,int(x1+pad+stroke+3));top=max(190,int(y-r-stroke-2));bottom=min(846,int(y+r+stroke+3))
    if right<=l or bottom<=top:return None
    Y,X=np.mgrid[top:bottom,l:right];X=X+.5;Y=Y+.5;cx0=x0-pad+r;cx1=x1+pad-r;dist=np.sqrt((X-np.clip(X,cx0,cx1))**2+(Y-y)**2);outer=np.clip(r+stroke/2+.5-dist,0,1);inner=np.clip(r-stroke/2+.5-dist,0,1);mask=outer-inner;parent=e['parent'];py=cy+parent['yOffset']*(c['sy']if e['row']in c['selected']else c['sx']);ph=max(parent['futureThickness'],parent['currentThickness'],parent['thickness'])*c['sx']/2+1.25;valid=~((abs(Y-py)<ph)&(X>x0-2)&(X<x1+2));valid&=abs(X-c['head'])>=4;mask[~valid]=0;return l,top,right,bottom,mask,valid
for e in outlines:
    f=660 if e['motif']==2 else 5520;a=np.array(Image.open(OUT/'residual-reference'/f'{f:05d}.png')).astype('float32');best=None
    seed=e['pitch']
    for pitch in seed+np.arange(-6,6.01,.5)/6:
        e['pitch']=float(pitch)
        for h in np.arange(12,17,.5):
            for pad in [5,6,7,8]:
                for stroke in [2,2.5,3]:
                    item=mask_for(e,f/60,(h,pad,stroke))
                    if not item:continue
                    l,top,right,bottom,mask,valid=item;observed=np.mean(255-a[top:bottom,l:right],axis=2)/231;alpha=float(np.sum(mask*observed)/max(.01,float(np.sum(mask*mask))))
                    if alpha<.35:continue
                    loss=float(np.sum((mask*alpha-observed)**2*valid)/max(1,float(np.sum(valid))))
                    if best is None or loss<best[0]:best=(loss,h,pad,stroke,float(pitch))
    if best is None:raise ValueError(e['id'])
    _,e['h'],e['padding'],e['stroke'],e['pitch']=best
    print('outline geometry',e['id'],best,flush=True)
frames=list(range(498,751))+list(range(5280,5641));vf=r'select=between(n\,498\,750)+between(n\,5280\,5640),format=rgb24,scale=1920:1080:flags=area,crop=1620:656:0:190'
p=subprocess.Popen(['ffmpeg','-v','error','-threads','4','-i',str(ROOT/'audio/case.mp4'),'-an','-vf',vf,'-fps_mode','vfr','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for f in frames:
    raw=p.stdout.read(1620*656*3)
    if len(raw)!=1620*656*3:raise ValueError(f)
    a=np.frombuffer(raw,np.uint8).reshape(656,1620,3).astype('float32');t=f/60
    for e in outlines:
        if(e['motif']==2)!=(f<1000):continue
        item=mask_for(e,t)
        if not item:e['curve'].append([round(t,6),0]);continue
        l,top,right,bottom,mask,valid=item;observed=np.mean(255-a[top-190:bottom-190,l:right],axis=2)/231;alpha=float(np.sum(mask*observed)/max(.01,float(np.sum(mask*mask))));e['curve'].append([round(t,6),round(float(np.clip(alpha,0,1)),4)])
p.stdout.close()
if p.wait():raise RuntimeError('outline extraction')
for e in outlines:e.pop('parent');e['t0']=e['curve'][0][0];e['t1']=e['curve'][-1][0]+1/60
(OUT/'outlines-round2.json').write_text(json.dumps(outlines,separators=(',',':'),default=float),encoding='utf8');print([(e['id'],e['pitch'],e['h'],e['padding'],e['stroke'])for e in outlines])
