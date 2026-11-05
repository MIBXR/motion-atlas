import sys
from pathlib import Path
import json,subprocess,cv2,numpy as np
from PIL import Image,ImageFont,ImageDraw
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
winner=read(WORK/'title-font-scores.json')[0];font=ImageFont.truetype(winner['path'],190)
events=[e for e in read(ANA/'shots.json')['events']if e['type']=='giant-title'];backgrounds=np.array(read(ANA/'frames/scan.json')['backgrounds']);slots=[(274,512),(503,680),(674,827),(932,1080),(1073,1260),(1250,1484)]
results=[]
for e in events:
    start=e['startFrame'];end=e['endFrame'];chars=e['text'].replace(' ','');glyphs=[dict(char=c,keys=[])for c in chars]
    p=subprocess.Popen(['ffmpeg','-v','error','-ss',str(start/60),'-i',str(ROOT/'audio/case.mp4'),'-frames:v',str(end-start),'-an','-vf','format=rgb24,scale=1920:1080:flags=area,crop=1240:340:260:380','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
    previous=[None]*len(chars);templates=[]
    for ch,(left,right)in zip(chars,slots):
        bb=font.getbbox(ch);im=Image.new('L',(right-left,340));ix=(right-left-(bb[2]-bb[0]))/2;iy=(340-(bb[3]-bb[1]))/2
        ImageDraw.Draw(im).text((ix-bb[0],iy-bb[1]),ch,font=font,fill=255);templates.append((np.array(im,dtype='float32')/255,ix,iy,bb[2]-bb[0],bb[3]-bb[1]))
    for f in range(start,end):
        raw=p.stdout.read(1240*340*3)
        if len(raw)!=1240*340*3:raise ValueError(f)
        a=np.frombuffer(raw,np.uint8).reshape(340,1240,3).astype('float32');bg=backgrounds[f];fg=np.array([255]*3 if e['id']=='giant-scene-ii'else[232,8,39]);v=fg-bg
        alpha=np.clip(np.sum((a-bg)*v,axis=2)/max(float(v@v),1),0,1).astype('float32')
        for j,(ch,(left,right),(template,ix,iy,iw,ih))in enumerate(zip(chars,slots,templates)):
            crop=alpha[:,left-260:right-260];peak=float(np.percentile(crop,97));target=cv2.morphologyEx((crop>max(.008,peak*.42)).astype('float32'),cv2.MORPH_OPEN,np.ones((9,2),np.uint8))
            yy,xx=np.where(target>.5)
            if len(xx)<140 or peak<.006:
                mat=previous[j]if previous[j]is not None else np.eye(2,3,dtype='float32');op=0
            else:
                sx=(np.ptp(xx)+1)/iw;sy=(np.ptp(yy)+1)/ih;guess=np.array([[sx,0,xx.min()-ix*sx],[0,sy,yy.min()-iy*sy]],np.float32)
                initial=[previous[j].copy()]if previous[j]is not None else[]
                initial.append(guess);best=None
                for init in initial:
                    try:cc,m=cv2.findTransformECC(template,target,init,cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_COUNT|cv2.TERM_CRITERIA_EPS,60,1e-5),None,3)
                    except cv2.error:continue
                    det=float(np.linalg.det(m[:,:2]))
                    if not .25<det<4:continue
                    paint=cv2.warpAffine(template,m,(crop.shape[1],crop.shape[0]));b=paint>.5;c=target>.5;iou=float(np.sum(b&c)/max(1,np.sum(b|c)))
                    if best is None or iou>best[0]:best=(iou,m,paint)
                if best is None:mat=guess;paint=cv2.warpAffine(template,mat,(crop.shape[1],crop.shape[0]))
                else:_,mat,paint=best
                vals=crop[paint>.93];vals=vals[vals>max(.003,peak*.2)];op=float(np.percentile(vals,65))if len(vals)else 0
            previous[j]=mat.copy();ox=left+mat[0,0]*ix+mat[0,1]*iy+mat[0,2];oy=380+mat[1,0]*ix+mat[1,1]*iy+mat[1,2]
            glyphs[j]['keys'].append([round(f/60,6),float(mat[0,0]),float(mat[1,0]),float(mat[0,1]),float(mat[1,1]),float(ox),float(oy),round(op,5)])
        if (f-start)%60==0:print(e['id'],f,flush=True)
    p.stdout.close()
    if p.wait():raise RuntimeError('ffmpeg title')
    results.append(dict(id=e['id'],t0=start/60,t1=end/60,fontSize=190,fontFamily='Giant',fontWeight=900,color='white'if e['id']=='giant-scene-ii'else'red',glyphs=glyphs))
(WORK/'refitted-giants.json').write_text(json.dumps(results,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print('titles done',flush=True)
