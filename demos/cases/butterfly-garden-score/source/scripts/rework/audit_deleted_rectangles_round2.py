import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score'
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
original=read(OUT/'round2-baseline/data/notes.json')['notes'];now=read(CASE/'film/data/notes.json');notes=now['notes'];changes=read(OUT/'note-corrections-round2.json');tracks={r:np.array(k)for r,k in read(CASE/'film/data/rowStates.json')['rows'].items()}
deleted=sorted(set(e['index']for e in changes if e['action'].startswith('delete')));measurements={i:[]for i in deleted};exposure={i:0 for i in deleted}
for f in range(210,6991,18):
    t=f/60
    if any(a<t<b for a,b in [(8.3,12.4),(20.1,21.6),(27.7,29),(39,43.4),(56.2,60.5),(76.2,77.8),(88,93.5)]):continue
    relevant=[]
    for i in deleted:
        n=original[i];x0=n['x0']-190*t+880;x1=n['x1']-190*t+880;k=tracks[n['row']];cy=float(np.interp(t,k[:,0],k[:,1]));op=float(np.interp(t,k[:,0],k[:,2]))
        if x1<195 or x0>1565 or op<.35:continue
        y=cy+n['yOffset'];l=max(185,int(x0+4));r=min(1575,int(x1-4))
        if r-l<4 or not 237<y<770:continue
        relevant.append((i,n,x0,x1,cy,op,l,r));exposure[i]+=1
    if not relevant:continue
    image=cv2.cvtColor(cv2.imread(str(OUT/'residual-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32');paper=np.median(image[193:218,900:1200],axis=(0,1));bases={}
    for i,n,x0,x1,cy,op,l,r in relevant:
        if n['row']not in bases:
            yy=int(np.floor(cy))-26;band=image[yy:yy+53,180:1580];mag=np.max(abs(band-paper),2);idx=np.argsort(mag,axis=1)[:,:20];base=np.median(np.take_along_axis(band,idx[:,:,None],axis=1),axis=1);bases[n['row']]=(yy,base)
        yy,base=bases[n['row']];xs=np.linspace(l+1,r-2,min(3,max(1,(r-l)//30))).astype(int);xs=[x for x in xs if abs(x-880)>6]
        for x in xs:
            profile=np.median(image[yy:yy+53,x-1:x+2],axis=1);D=profile-base;signal=np.max(abs(D),1);seed=cy+n['yOffset']-yy-.5;index=int(round(seed))
            nearby=np.arange(max(0,index-1),min(53,index+2));peak=signal[nearby].max()
            if peak<12:continue
            k=int(nearby[np.argmax(signal[nearby])]);threshold=max(7,peak*.28);lo=k;hi=k+1
            while lo>0 and signal[lo-1]>threshold:lo-=1
            while hi<53 and signal[hi]>threshold:hi+=1
            if lo==0 or hi==53 or not .5<hi-lo<17:continue
            center=yy+(lo+hi)/2
            if abs(center-(cy+n['yOffset']))>2.1:continue
            # A second voice in the same row does not invalidate the voice containing the candidate.
            strength=float(np.max(abs(np.median(D[lo:hi],axis=0))))
            if strength<12:continue
            state=0 if t<n['x0']/190-.15 else 1 if n['x0']/190+.15<t<(n['x1']+6)/190-.15 else 2 if t>(n['x1']+6)/190+.8 else -1
            # Fractional boundaries are recovered from edge pixel coverage.
            left=lo+max(0,1-signal[lo]/max(1,peak));right=hi-max(0,1-signal[hi-1]/max(1,peak));height=right-left;offset=yy+(left+right)/2-cy
            measurements[i].append([f,state,round(offset,3),round(height,3),strength])
    if f%900==30:print('deleted audit',f,sum(len(s)for s in measurements.values()),flush=True)
restore=[];decisions=[]
for i in deleted:
    n=original[i].copy();samples=measurements[i];seen=len(set(s[0]for s in samples));nativeSupport=seen/max(1,exposure[i])
    if seen<4 or nativeSupport<.35:
        decisions.append(dict(index=i,action='keep deleted',frames=seen,exposures=exposure[i],support=nativeSupport));continue
    ar=np.array(samples);offset=float(np.median(ar[:,2]));height=float(np.median(ar[:,3]));n['yOffset']=round(offset*2)/2
    duplicate=next((e for e in notes+restore if e['row']==n['row']and e['kind']==n['kind']and abs(e['yOffset']-n['yOffset'])<1.2 and max(0,min(e['x1'],n['x1'])-max(e['x0'],n['x0']))>.83*(n['x1']-n['x0'])),None)
    if duplicate:
        decisions.append(dict(index=i,action='existing voice',frames=seen,offset=offset));continue
    for state,key in [(0,'futureThickness'),(1,'currentThickness'),(2,'thickness')]:
        hs=ar[ar[:,1]==state,3];n[key]=round(float(np.median(hs)),3)if len(hs)>2 else height
    restore.append(n);decisions.append(dict(index=i,action='restore',frames=seen,exposures=exposure[i],offset=offset,heights=[n[k]for k in ['futureThickness','currentThickness','thickness']]))
(OUT/'deleted-audit-round2.json').write_text(json.dumps(dict(decisions=decisions,samples=measurements,restore=restore),ensure_ascii=False,separators=(',',':'),default=float),encoding='utf8')
print('restored',len(restore),'deleted candidates',len(deleted),[(d['index'],d['action'])for d in decisions if d['index']in [1839,1840,1841,1869,1870,1902,1903,2235]],flush=True)
