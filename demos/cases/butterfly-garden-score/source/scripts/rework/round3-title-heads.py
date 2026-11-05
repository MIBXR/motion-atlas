import sys
from pathlib import Path
import json,subprocess,cv2,numpy as np
from PIL import Image,ImageFont,ImageDraw
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';CASE=REPO/'demos/cases/butterfly-garden-score';cv2.setNumThreads(2)
shots=json.loads((CASE/'film/data/shots.json').read_text(encoding='utf8'));font=ImageFont.truetype(str(CASE/'fonts/ZenKakuGothicNew-Black.ttf'),190);slots=[(274,512),(503,680),(674,827),(932,1080),(1073,1260),(1250,1484)];evidence=[]
for e in shots['giants']:
    oldEnd=e['t1'];start=round(e['t0']*60);last=start+8;templates=[];previous=[];entryKeys=[[]for g in e['glyphs']]
    for g,(left,right)in zip(e['glyphs'],slots):
        bb=font.getbbox(g['char']);iw=bb[2]-bb[0];ih=bb[3]-bb[1];ix=(right-left-iw)/2;iy=(340-ih)/2;im=Image.new('L',(right-left,340));ImageDraw.Draw(im).text((ix-bb[0],iy-bb[1]),g['char'],font=font,fill=255);templates.append((np.array(im,dtype='float32')/255,ix,iy,iw,ih))
        _,a,b,c,d,x,y,_=g['keys'][0];previous.append(np.array([[a,c,x-left-a*ix-c*iy],[b,d,y-380-b*ix-d*iy]],dtype='float32'))
    first=start-8;end=start+9;command=['ffmpeg','-v','error','-ss',str(first/60),'-i',str(ROOT/'audio/case.mp4'),'-an','-frames:v',str(end-first),'-vf','format=rgb24,scale=1920:1080:flags=area','-pix_fmt','rgb24','-f','rawvideo','pipe:1'];p=subprocess.Popen(command,stdout=subprocess.PIPE);lastVisible=last;perGlyph=[0]*6;areas=[]
    for f in range(first,end):
        raw=p.stdout.read(1920*1080*3)
        if len(raw)!=1920*1080*3:raise ValueError(f)
        full=np.frombuffer(raw,np.uint8).reshape(1080,1920,3).astype('float32');paper=np.median(full[193:215,900:1200],axis=(0,1));fg=np.array([255]*3 if e['color']=='white'else[232,8,39]);v=fg-paper;alpha=np.clip(np.sum((full[380:720,260:1500]-paper)*v,2)/max(1,float(v@v)),0,1).astype('float32');frameArea=0
        for j,(g,(left,right),(template,ix,iy,iw,ih))in enumerate(zip(e['glyphs'],slots,templates)):
            crop=alpha[:,left-260:right-260];peak=float(np.percentile(crop,97));target=cv2.morphologyEx((crop>max(.01,peak*.4)).astype('float32'),cv2.MORPH_OPEN,np.ones((9,2),np.uint8));yy,xx=np.where(target>.5);frameArea+=len(xx);op=0;mat=previous[j].copy()
            if len(xx)>=140 and peak>.008:
                guess=np.array([[(np.ptp(xx)+1)/iw,0,0],[0,(np.ptp(yy)+1)/ih,0]],np.float32);guess[0,2]=xx.min()-ix*guess[0,0];guess[1,2]=yy.min()-iy*guess[1,1];best=None
                for init in [previous[j].copy(),guess]:
                    try:_,m=cv2.findTransformECC(template,target,init,cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_COUNT|cv2.TERM_CRITERIA_EPS,35,1e-4),None,3)
                    except cv2.error:continue
                    if not .005<abs(float(np.linalg.det(m[:,:2])))<6:continue
                    paint=cv2.warpAffine(template,m,(crop.shape[1],crop.shape[0]));aa=paint>.5;bb=target>.5;iou=float(np.sum(aa&bb)/max(1,np.sum(aa|bb)))
                    if best is None or iou>best[0]:best=(iou,m,paint)
                if best is None:mat=guess;paint=cv2.warpAffine(template,mat,(crop.shape[1],crop.shape[0]))
                else:_,mat,paint=best
                vals=crop[paint>.9];vals=vals[vals>max(.005,peak*.2)];op=float(np.median(vals))if len(vals)else 0
                if op>.008:lastVisible=max(lastVisible,f);perGlyph[j]=f
            previous[j]=mat.copy();ox=left+mat[0,0]*ix+mat[0,1]*iy+mat[0,2];oy=380+mat[1,0]*ix+mat[1,1]*iy+mat[1,2]
            entryKeys[j].append([round(f/60,6),float(mat[0,0]),float(mat[1,0]),float(mat[0,1]),float(mat[1,1]),float(ox),float(oy),round(op,5)])
        areas.append([f,frameArea])
    p.stdout.close()
    if p.wait():raise RuntimeError('title decode')
    visible=[k[0]for ks in entryKeys for k in ks if k[-1]>.008];e['t0']=min(visible)if visible else e['t0'];
    for g,ks in zip(e['glyphs'],entryKeys):g['keys']=[k for k in ks if k[0]>=e['t0']]+[k for k in g['keys']if k[0]>last/60]
    for g in e['glyphs']:g['keys']=[k for k in g['keys']if k[0]<=e['t1']]
    evidence.append(dict(id=e['id'],t0=e['t0'],oldEnd=oldEnd,newEnd=e['t1'],lastGlyphFrames=perGlyph,sourceInkAreas=areas));print('title',e['id'],oldEnd,'->',e['t1'],flush=True)
(CASE/'film/data/shots.json').write_text(json.dumps(shots,ensure_ascii=False,separators=(',',':')),encoding='utf8');(OUT/'round3-title-head-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf8')
