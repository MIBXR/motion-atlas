import sys
from pathlib import Path
import subprocess,cv2,numpy as np
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';dest=OUT/'round3-reference';dest.mkdir(exist_ok=True)
frames=list(range(0,7320,10));p=subprocess.Popen(['ffmpeg','-v','error','-threads','4','-i',str(ROOT/'audio/case.mp4'),'-an','-vf',r'select=not(mod(n\,10)),format=rgb24,scale=1920:1080:flags=area','-fps_mode','vfr','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],stdout=subprocess.PIPE)
for i,f in enumerate(frames):
    raw=p.stdout.read(1920*1080*3)
    if len(raw)!=1920*1080*3:raise ValueError(f)
    a=np.frombuffer(raw,np.uint8).reshape(1080,1920,3);cv2.imwrite(str(dest/f'{f:05d}.png'),cv2.cvtColor(a,cv2.COLOR_RGB2BGR),[cv2.IMWRITE_PNG_COMPRESSION,1])
    if i%150==0:print('source',i,f,flush=True)
p.stdout.close()
if p.wait():raise RuntimeError('source decode')
print('source frames',len(frames),flush=True)
