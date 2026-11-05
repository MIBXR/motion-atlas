import sys
from pathlib import Path
import json, cv2, numpy as np

ROOT=Path(sys.argv[1]).resolve(); OUT=ROOT/'codex/case-impl'; CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
write=lambda p,a:p.write_text(json.dumps(a,ensure_ascii=False,separators=(',',':')),encoding='utf8')
ann=read(CASE/'film/data/annotations.json'); shots=read(CASE/'film/data/shots.json')
rows={r:np.array(k)for r,k in read(CASE/'film/data/rowStates.json')['rows'].items()}
geometry={e['id']:e for e in read(OUT/'word-geometry-round2.json')if e.get('detected')}

def camera(t):
    e=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
    if not e:return 1,880,0
    k=np.array(e['curve']); p=float(np.interp(t,k[:,0],k[:,1])); sx=1+(e['maxX']-1)*p; head=float(np.interp(t,k[:,0],k[:,2]))
    if e['id']=='focus-cym-pf':k=np.array(e['scaleCurve']);sx=float(np.interp(t,k[:,0],k[:,1]))
    return sx,head,p

def image(f):return cv2.cvtColor(cv2.imread(str(OUT/'residual-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32')
def values(curve,t):
    k=np.array(curve);return np.array([np.interp(t,k[:,0],k[:,i])for i in range(1,k.shape[1])])

# The clip uses the same measured horizontal transform as the notes.
p=CASE/'film/scene.js'; scene=p.read_text(encoding='utf8')
scene=scene.replace("ctx.rect(focus.id === 'focus-cym-pf' ? 0 : 180 - 60 * focus.p, 185, focus.id === 'focus-cym-pf' ? 1620 : 1400 + 100 * focus.p, 665)","ctx.rect(Math.max(0, focus.head - 700 * focus.sx), 185, Math.min(1620, focus.head + 700 * focus.sx) - Math.max(0, focus.head - 700 * focus.sx), 665)")
scene=scene.replace("    const exit = l.id === 'cadence-key-ladder' ? 1 - segment(t, 42.75, 43.3) : 1;\n",'')
scene=scene.replace('ctx.globalAlpha = clamp(a) * exit;', 'ctx.globalAlpha = clamp(a);')
p.write_text(scene,encoding='utf8')

# The input crop origins are 658.5px for the diagram and 983px for the byline.
for k in shots['intro']['byline']:
    if k[1]>0 and k[2]>300:k[2]-=324.5

introChanges=[]
for observation in read(OUT/'closure-glyph-inputs.json'):
    ch=observation['text'];e=next(e for e in shots['intro']['auxiliary']if e['text']==ch)
    x,y,w,h=observation['box'];e['x'],e['y']=observation['origin']
    reference=image(120)[y:y+h,x:x+w];core=np.max(abs(reference-255),2)>100
    curve=[]
    for f in range(0,199,6):
        rgb=np.median(image(f)[y:y+h,x:x+w][core],axis=0);visible=float(np.max(abs(rgb-255)))>5
        curve.append([round(f/60,6),int(visible),*np.round(rgb,2).tolist(),0,0])
    e['curve']=curve;introChanges.append(dict(text=ch,box=[x,y,w,h],origin=[e['x'],e['y']]))

partialChanges=[]
for w in ann['words']:
    if 'worldX'not in w or w['id']not in geometry:continue
    g=geometry[w['id']];shape=np.load(g['template'],mmap_mode='r').shape;k=np.array(w['curve']);good=k[k[:,1]>.1]
    if not len(good):continue
    additions=[]
    for f in range(max(0,int(w['t0']*60/6)*6),min(7314,int(w['t1']*60))+1,6):
        t=f/60;old=values(w['curve'],t)
        if old[0]>.004:continue
        prior=good[good[:,0]<t]
        if not len(prior):continue
        last=prior[-1];sx,head,p=camera(t);x=head+(w['worldX']-190*t)*sx+last[5]*sx
        left=x+g['boxOffset'][0]*sx;right=left+shape[1]*sx/g['referenceScale'];clip=max(0,head-700*sx)
        if left<clip<right:
            additions.append([round(t,6),*last[1:].tolist()])
    if additions:
        keys={round(k[0]*60):k for k in w['curve']};keys.update({round(k[0]*60):k for k in additions});w['curve']=[keys[f]for f in sorted(keys)];partialChanges.append((w['id'],len(additions)))

rulerChanges=[]
for r in ann['rulers']:
    if r['id']not in ['M1','M2']:continue
    additions=[];valid=[k for k in r['curve']if k[3]>.5]
    for f in range(int(r['t0']*60/6)*6,min(7314,int(r['t1']*60))+1,6):
        t=f/60;old=values(r['curve'],t)
        if old[2]>.004:continue
        sx,head,p=camera(t);cy=float(np.interp(t,rows[r['row']][:,0],rows[r['row']][:,1]));start=head+(r['worldX']-190*t)*sx;clip=max(0,head-700*sx);left=max(0,int(max(clip,start))-4);right=min(1620,int(head+(max(k[1]for k in valid)-190*t)*sx)+6)
        if right-left<35:continue
        top=max(190,int(cy+old[1])-40);bottom=min(846,int(cy+old[1])+41)
        a=image(f);paper=np.median(a[193:215,900:1200],axis=(0,1));mask=np.max(abs(a[top:bottom,left:right]-paper),2)>70;candidates=[]
        for yy,m in enumerate(mask):
            edges=np.flatnonzero(np.diff(np.r_[False,m,False].astype('int8')))
            for lo,hi in zip(edges[::2],edges[1::2]):
                if hi-lo<35 or abs(left+lo-max(clip,start))>9:continue
                candidates.append((hi-lo,-abs(top+yy+.5-(cy+old[1])),left+hi,top+yy+.5))
        if not candidates:continue
        _,_,end,y=max(candidates);endWorld=(end-head)/sx+190*t;alpha=min(valid,key=lambda k:abs(k[0]-t))[3]
        additions.append([round(t,6),round(endWorld,3),round(y-cy,3),alpha,9])
    keys={round(k[0]*60):k for k in r['curve']};keys.update({round(k[0]*60):k for k in additions});r['curve']=[keys[f]for f in sorted(keys)];rulerChanges.append((r['id'],len(additions)))

# Fixed diagram words use their recorded source glyph footprint to recover missing samples.
cadence=[w for w in ann['words']if w['t0']<40 and 43<w['t1']<44 and 'screenX'in w]
title=next(w for w in cadence if w['id']=='tonality-title');tg=geometry[title['id']];tm=np.load(tg['template']);tv=values(title['curve'],41)
tx=round(title['screenX']+tv[4]+tg['boxOffset'][0]);ty=round(title['screenY']+tv[5]+tg['boxOffset'][1]);ref=image(2460);patch=ref[ty:ty+tm.shape[0],tx:tx+tm.shape[1]];red=(patch[:,:,0]-patch[:,:,1])>40
visible=[]
for f in range(2340,2683,6):
    patch=image(f)[ty:ty+tm.shape[0],tx:tx+tm.shape[1]]
    if np.mean((patch[:,:,0]-patch[:,:,1])[red]>15)>.12:visible.append(f)
end=(max(visible)+6)/60
cadenceChanges=[]
for w in cadence:
    g=geometry[w['id']];template=np.load(g['template']);good=[k for k in w['curve']if k[1]>.1]
    if not good:continue
    base=min(good,key=lambda k:abs(k[0]-41));x=round(w['screenX']+base[5]+g['boxOffset'][0]);y=round(w['screenY']+base[6]+g['boxOffset'][1]);shape=template.shape
    reference=ref[y:y+shape[0],x:x+shape[1]];paper=np.array([255]*3);core=np.max(abs(reference-paper),2)>50
    if not np.any(core):continue
    additions=[]
    for f in visible:
        t=f/60
        if values(w['curve'],t)[0]>.004 and t<w['t1']:continue
        rgb=np.median(image(f)[y:y+shape[0],x:x+shape[1]][core],axis=0)
        if np.max(abs(rgb-paper))<7:continue
        additions.append([round(t,6),1,*np.round(rgb,2).tolist(),*base[5:]])
    w['t1']=end;keys={round(k[0]*60):k for k in w['curve']};keys.update({round(k[0]*60):k for k in additions});keys[round(end*60)]=[end,0,*base[2:]];w['curve']=[keys[f]for f in sorted(keys)];cadenceChanges.append((w['id'],len(additions)))
ladder=next(l for l in ann['ladders']if l['id']=='cadence-key-ladder');ladder['t1']=end
for g in ladder['groups']:
    x0,y0,x1,y1=g['line'];additions=[]
    for f in visible:
        old=values(g['curve'],f/60)
        if old[0]>.004:continue
        band=image(f)[int(y0):int(np.ceil(y1)),int(x0):int(x1)];contrast=np.max(abs(band-255),2)
        if np.mean(contrast>40)>.2:additions.append([round(f/60,6),1,1])
    keys={round(k[0]*60):k for k in g['curve']};keys.update({round(k[0]*60):k for k in additions});keys[round(end*60)]=[end,0,0];g['curve']=[keys[f]for f in sorted(keys)]
def continuous(curve,alphaIndex):
    grid={round(k[0]*60):k for k in curve if round(k[0]*60)%6==0};changed=[];result=[]
    for k in curve:
        f=round(k[0]*60);lo=f//6*6;hi=lo+6
        if f%6 and k[alphaIndex]<.005 and lo in grid and hi in grid and min(grid[lo][alphaIndex],grid[hi][alphaIndex])>.005:
            a=np.array(grid[lo][1:]);b=np.array(grid[hi][1:]);k=[k[0],*(a+(b-a)*(f-lo)/6).tolist()];changed.append(f)
        result.append(k)
    return result,changed

# Continue measured visible samples between adjacent six-frame observations.
continued=[];ids={e[0]for e in partialChanges+cadenceChanges}
for e in ann['words']:
    if e['id']in ids:e['curve'],frames=continuous(e['curve'],1);continued.extend(frames)
for e in ann['rulers']:
    if e['id']in ['M1','M2']:e['curve'],frames=continuous(e['curve'],3);continued.extend(frames)
for e in ladder['groups']:e['curve'],frames=continuous(e['curve'],1);continued.extend(frames)
for e in ann['connections']:
    if e['curve'][-1][0]<122.005:e['curve'].append([122.005,*e['curve'][-1][1:]])
for e in ann['words']:
    if e['t0']>116:e['t1']=122.005
write(CASE/'film/data/annotations.json',ann);write(CASE/'film/data/shots.json',shots)
write(OUT/'closure-element-measurements.json',dict(intro=introChanges,partial=partialChanges,rulers=rulerChanges,cadence=cadenceChanges,cadenceEnd=end,bylineOffset=324.5,continuedFrames=sorted(set(continued))))
print('restored missing elements',introChanges,partialChanges,rulerChanges,'cadence end',end,flush=True)
