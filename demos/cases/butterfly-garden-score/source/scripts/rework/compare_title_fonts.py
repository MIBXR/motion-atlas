import sys
from pathlib import Path
import json,cv2,numpy as np
from PIL import Image,ImageFont,ImageDraw
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';ANA=ROOT/'analysis/case'
fonts=json.loads((WORK/'title-font-sources.json').read_text(encoding='utf8'))
OUT=WORK/'title-font-compare';OUT.mkdir(exist_ok=True)
source=np.array(Image.open(ANA/'frames/f01380.png').convert('RGB')).astype('float32')
bg=np.array([232,8,39]);white=np.array([255,255,255]);v=white-bg
mask=np.clip(np.sum((source-bg)*v,axis=2)/(v@v),0,1)
# The six crops isolate the complete title glyphs at frame 1380.
slots=[(298,510),(515,680),(681,819),(945,1074),(1080,1253),(1256,1456)]
chars='第二場ニ長調';results=[]
for fi,item in enumerate(fonts):
    font=ImageFont.truetype(item['path'],380)
    if '[wght]' in item['path']:font.set_variation_by_axes([item['weight']])
    glyphs=[];panels=[]
    for char,(l,r)in zip(chars,slots):
        left=l*2;top=420*2;crop=mask[top:670*2,left:r*2]
        target=cv2.morphologyEx((crop>.50).astype('float32'),cv2.MORPH_OPEN,np.ones((15,3),np.uint8))
        bbox=font.getbbox(char);im=Image.new('L',(bbox[2]-bbox[0],bbox[3]-bbox[1]));ImageDraw.Draw(im).text((-bbox[0],-bbox[1]),char,font=font,fill=255)
        glyph=np.array(im,dtype='float32')/255
        canvas=np.zeros_like(target);h,w=glyph.shape;ox=(target.shape[1]-w)//2;oy=(target.shape[0]-h)//2
        canvas[max(0,oy):min(target.shape[0],oy+h),max(0,ox):min(target.shape[1],ox+w)]=glyph[max(0,-oy):min(h,target.shape[0]-oy),max(0,-ox):min(w,target.shape[1]-ox)]
        yy,xx=np.where(target>.5);g0=np.array([[np.ptp(xx)/w,0,float(xx.min()-ox*np.ptp(xx)/w)],[0,np.ptp(yy)/h,float(yy.min()-oy*np.ptp(yy)/h)]],np.float32)
        best=None
        for angle in [-7,0,7]:
            guess=g0.copy();guess[0,1]=np.tan(np.deg2rad(angle));guess[1,0]=-guess[0,1]
            try:cc,m=cv2.findTransformECC(canvas,target,guess,cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_COUNT|cv2.TERM_CRITERIA_EPS,180,1e-6),None,5)
            except cv2.error:continue
            painted=cv2.warpAffine(canvas,m,(target.shape[1],target.shape[0]))
            a=painted>.5;b=target>.5;score=float(np.sum(a&b)/np.sum(a|b))
            if best is None or score>best[0]:best=(score,cc,m,painted)
        if best is None:raise ValueError((item['family'],char))
        score,cc,m,painted=best;glyphs.append(dict(char=char,IoU=score,ECC=float(cc),matrix=m.tolist()))
        overlay=np.full((*crop.shape,3),255,np.uint8);overlay[:,:,0]=255-(target*200).astype('uint8');overlay[:,:,2]=255-(painted*200).astype('uint8');panels.append(Image.fromarray(overlay).resize((int(crop.shape[1]/2),int(crop.shape[0]/2))))
    panel=Image.new('RGB',(sum(x.width for x in panels),280),'white');x=0
    for p in panels:panel.paste(p,(x,30));x+=p.width
    ImageDraw.Draw(panel).text((8,8),item['family']+' IoU '+str(round(float(np.mean([g['IoU']for g in glyphs])),6)),fill='black');panel.save(OUT/f'{fi:02d}.png')
    result=dict(**item,score=float(np.mean([g['IoU']for g in glyphs])),glyphs=glyphs);results.append(result);print(json.dumps({k:result[k]for k in ['family','score']}),flush=True)
results.sort(key=lambda r:r['score'],reverse=True)
(WORK/'title-font-scores.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
