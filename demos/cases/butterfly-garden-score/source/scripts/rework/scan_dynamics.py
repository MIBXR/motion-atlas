import sys
from pathlib import Path
import json,subprocess,cv2,numpy as np
from PIL import Image,ImageDraw
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';ANA=ROOT/'analysis/case'
bg=np.array(json.loads((ANA/'frames/scan.json').read_text(encoding='utf8'))['backgrounds']);out=np.zeros((40,22400),dtype='uint8');observations=[]
p=subprocess.Popen(['ffmpeg','-v','error','-i',str(ROOT/'audio/case.mp4'),'-an','-vf','format=rgb24,scale=1920:1080:flags=area,crop=1400:40:180:777','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for f in range(7320):
    raw=p.stdout.read(1400*40*3)
    if len(raw)!=1400*40*3:raise ValueError(f)
    a=np.frombuffer(raw,np.uint8).reshape(40,1400,3);t=f/60
    if f%600==0:print('dyn',f,flush=True)
    if any(s<t<e for s,e in [(0,3),(8.3,12.3),(56.2,61.3),(88,93.5),(116.9,123)]):continue
    contrast=np.max(abs(a.astype(float)-bg[f]),2)
    contrast[:,696:706]=0;contrast[35:]=0
    gx=int(round(190*t))+14;l=max(0,gx-3);r=min(22400,gx+3)
    if r>l:out[:,l:r]=np.maximum(out[:,l:r],np.clip(contrast[:,711:711+r-l],0,255).astype('uint8'))
    num,labels,stats,centers=cv2.connectedComponentsWithStats((contrast>20).astype('uint8'))
    observations.append(dict(frame=f,boxes=[dict(x=round(float(x+180+190*t-880),3),y=int(y+777),w=int(w),h=int(h),area=int(area))for x,y,w,h,area in stats[1:]if h>6 and area>8]))
p.stdout.close()
if p.wait():raise RuntimeError('ffmpeg dyn')
Image.fromarray(255-out).save(WORK/'dynamics-panorama.png')
sheet=Image.new('RGB',(1920,14*100),'white');draw=ImageDraw.Draw(sheet)
for i,x in enumerate(range(0,22400,1600)):
    im=Image.fromarray(255-out[:,x:x+1600]);sheet.paste(im.resize((1920,48)),(0,i*100+25));draw.text((5,i*100+4),f'x={x} time={x/190:.3f}',fill='black')
sheet.save(WORK/'dynamics-sheet.png')
(WORK/'dyn-component-observations.json').write_text(json.dumps(observations,separators=(',',':')),encoding='utf8')
print('dyn scan complete',flush=True)
