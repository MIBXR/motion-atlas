import sys
exec((__import__('pathlib').Path(__file__).parent/'scan_dynamics.py').read_text(encoding='utf8').split("p=subprocess.Popen")[0])
out=255-np.array(Image.open(WORK/'dynamics-panorama.png'))
for f in range(210,6991,30):
    t=f/60
    if any(s<t<e for s,e in [(8.3,12.4),(56.2,61.3),(88,93.5)]):continue
    a=cv2.cvtColor(cv2.imread(str(ANA/'frames'/f's{f:05d}.jpg')),cv2.COLOR_BGR2RGB)[777:817,180:1580].astype(float)
    contrast=np.max(abs(a-bg[f]),2);contrast[:,696:706]=0;contrast[35:]=0
    gx=int(round(190*t-700));l=max(0,gx);r=min(22400,gx+1400)
    if r>l:out[:,l:r]=np.maximum(out[:,l:r],np.clip(contrast[:,l-gx:r-gx],0,255).astype('uint8'))
Image.fromarray(255-out).save(WORK/'dynamics-panorama-filled.png')
sheet=Image.new('RGB',(1920,14*85),'white');draw=ImageDraw.Draw(sheet)
for i,x in enumerate(range(0,22400,1600)):
    im=Image.fromarray(255-out[:,x:x+1600]);sheet.paste(im.resize((1920,48)),(0,i*85+25));draw.text((5,i*85+4),f'x={x} time={x/190:.3f}',fill='black')
sheet.save(WORK/'dynamics-sheet-filled.png')
