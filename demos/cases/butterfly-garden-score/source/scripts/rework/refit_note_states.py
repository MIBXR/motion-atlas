import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();WORK=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';ANA=ROOT/'analysis/case'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
score=read(CASE/'film/data/notes.json');tracks={k:np.array(v)for k,v in read(CASE/'film/data/rowStates.json')['rows'].items()};notes=score['notes']
samples=[];perNote=[[]for n in notes]
for f in range(180,6991,30):
    t=f/60
    if any(a<t<b for a,b in [(8.3,12.4),(20.1,23.2),(27.5,29),(39,43.6),(43.6,47.4),(56.2,61.4),(76.2,77.8),(81,84.9),(88,93.5)]):continue
    ref=WORK/'reference'/f'{f:05d}.png';img=cv2.imread(str(ref if ref.exists()else ANA/'frames'/f's{f:05d}.jpg'));img=cv2.cvtColor(img,cv2.COLOR_BGR2RGB).astype('float32');bg=np.median(img[195:218,300:790],axis=(0,1));mode=int(bg[1]<100)
    for ni,n in enumerate(notes):
        x0=n['x0']-190*t+880;x1=n['x1']-190*t+880
        if x0>1570 or x1<190 or x1-x0<8:continue
        a=tracks[n['row']];cy=np.interp(t,a[:,0],a[:,1]);alpha=np.interp(t,a[:,0],a[:,2]);y=cy+n['yOffset']
        if alpha<.6:continue
        l=max(185,int(np.ceil(x0+3)));r=min(1575,int(np.floor(x1-3)))
        if r-l<4:continue
        if l<884 and r>876:
            if 876-l>r-884:r=876
            else:l=884
        if r-l<4 or not 230<y<775:continue
        top=round(y)-9;bottom=round(y)+10;profile=np.median(img[top:bottom,l:r],axis=1);delta=profile-bg
        # A rectangle's core fixes the ink color; area coverage fixes its thickness.
        strengths=np.max(abs(delta),axis=1);peak=float(np.max(strengths))
        if peak<12:continue
        strong=np.flatnonzero(strengths>peak*.55);near=strong[abs(strong+top+.5-y)<7]
        if not len(near):continue
        cut=int(near[np.argmax(strengths[near])]);color=bg+(profile[cut]-bg)/alpha
        if np.max(color)>269 or np.min(color)<-14:continue
        if n['group']==3 and mode==0 and color[0]-color[1]<15:continue
        # Remove isolated pixels from the adjacent staff guide before integrating.
        core=delta[cut];weights=np.clip(delta@core/max(float(core@core),1),0,1.15)
        valid=abs(np.arange(top,bottom)+.5-y)<7
        left=cut;right=cut
        while left>0 and weights[left-1]>.08:left-=1
        while right+1<len(weights)and weights[right+1]>.08:right+=1
        h=float(np.sum(weights[left:right+1]));center=float(np.sum((np.arange(top+left,top+right+1)+.5)*weights[left:right+1])/max(.1,np.sum(weights[left:right+1])))
        if not 1<h<12 or abs(center-y)>2.2:continue
        dt=t-n['x0']/190;de=t-(n['x1']+6)/190
        obs=dict(note=ni,row=n['row'],mode=mode,t=t,dt=dt,de=de,color=np.clip(color,0,255).tolist(),h=h,y=center-cy)
        samples.append(obs);perNote[ni].append(obs)
    if f%600==0:print('note sample',f,len(samples),flush=True)

states={};fits=[]
for row in tracks:
    if row=='dyn.':continue
    if not any(n['row']==row for n in notes):continue
    group=next(n['group']for n in notes if n['row']==row)
    for mode in [0,1]:
        ss=[s for s in samples if s['row']==row and s['mode']==mode]
        if len(ss)<18:ss=[s for s in samples if next(n['group']for n in notes if n['row']==s['row'])==group and s['mode']==mode]
        dt=np.array([s['dt']for s in ss]);de=np.array([s['de']for s in ss]);rgb=np.array([s['color']for s in ss]);hh=np.array([s['h']for s in ss]);best=None
        for attack in [0,.025,.05,.075,.1]:
            for release in [.15,.25,.4,.6,.8,1.,1.2]:
                for delay in [0,.025,.05,.1]:
                    on=np.clip(dt/max(attack,.000001),0,1);on=on*on*(3-2*on);rel=np.clip((de-delay)/release,0,1);rel=rel*rel*(3-2*rel)
                    X=np.stack([1-on,on*(1-rel),on*rel],axis=1)
                    colors=np.linalg.lstsq(X,rgb,rcond=None)[0];res=rgb-X@colors
                    # Iteratively reweight image compression and overlapping notes.
                    for _ in range(3):
                        weights=np.minimum(1,12/(np.mean(abs(res),axis=1)+.1));colors=np.linalg.lstsq(X*weights[:,None],rgb*weights[:,None],rcond=None)[0];res=rgb-X@colors
                    loss=float(np.mean(np.minimum(abs(res),30)))
                    if best is None or loss<best[0]:best=(loss,attack,release,delay,colors,X)
        loss,attack,release,delay,colors,X=best
        hs=np.linalg.lstsq(X,hh,rcond=None)[0]
        states[f'{row}:{mode}']=dict(attack=attack,release=release,delay=delay,colors=np.round(np.clip(colors,0,255),2).tolist(),heights=np.round(hs,3).tolist(),error=loss,samples=len(ss))
for ni,n in enumerate(notes):
    ss=perNote[ni];future=[s for s in ss if s['dt']<-.2];current=[s for s in ss if s['dt']>.15 and s['de']<-.08];past=[s for s in ss if s['de']>1.2]
    fallback=states[f'{n["row"]}:0']['heights'];height=[]
    for arr,j in [(future,0),(current,1),(past,2)]:height.append(float(np.median([s['h']for s in arr]))if arr else float(fallback[j]))
    # The same rectangle keeps its own base thickness across the two backgrounds.
    if n['kind']=='dot':height=[float(n['thickness'])]*3
    n['futureThickness'],n['currentThickness'],n['thickness']=[round(float(np.clip(h,1,10)),3)for h in height]
    ys=[s['y']for s in ss]
    if ys:n['yOffset']=round(float(np.median(ys))*2)/2
    fits.append(dict(note=ni,row=n['row'],samples=len(ss),future=len(future),current=len(current),past=len(past),heights=height))
score['rowColors']=states
(WORK/'refitted-notes.json').write_text(json.dumps(score,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(WORK/'note-state-fits.json').write_text(json.dumps(dict(states=states,notes=fits),ensure_ascii=False,separators=(',',':')),encoding='utf8')
(WORK/'note-color-samples.json').write_text(json.dumps(samples,separators=(',',':')),encoding='utf8')
print('fits',len(samples),len(states),flush=True)
