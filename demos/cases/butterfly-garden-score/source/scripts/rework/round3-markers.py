import sys
from pathlib import Path
import json,cv2,numpy as np
ROOT=Path(sys.argv[1]);REPO=Path(sys.argv[2]);OUT=ROOT/'codex/case-impl';CASE=REPO/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
states=read(CASE/'source/analysis/rework/state-input/rowStates.json');shots=read(CASE/'film/data/shots.json');rows={r:np.array(k)for r,k in states['rows'].items()};markers={r:[]for r in rows if r!='dyn.'};names={r:[]for r in markers}
def sample(k,t):
    a=np.array(k);return np.array([np.interp(t,a[:,0],a[:,i])for i in range(1,a.shape[1])])
for f in range(0,7320,10):
    t=f/60;a=cv2.cvtColor(cv2.imread(str(OUT/'round3-reference'/f'{f:05d}.png')),cv2.COLOR_BGR2RGB).astype('float32');paper=np.median(a[193:215,900:1200],axis=(0,1));q=float(np.clip((255-paper[1])/247,0,1));accent=np.array([232,8,39])*(1-q)+255*q;ink=np.array([24]*3)*(1-q)+255*q;muted=np.array([136]*3)*(1-q)+np.array([35,0,5])*q;shot=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None);sx=1;head=880
    if shot:
        p,head=sample(shot['curve'],t)[:2];sx=1+(shot['maxX']-1)*p
        if shot['id']=='focus-cym-pf':sx=sample(shot['scaleCurve'],t)[0]
    for r,k in rows.items():
        if r=='dyn.':continue
        y,op=sample(k,t);x=head-712*sx;right=head-720*sx
        if t<3.2 or op<.025 or not 2<x<1615 or not 218<y<820:markers[r].append([round(t,6),0]);names[r].append([round(t,6),0]);continue
        patch=a[round(y-6*sx):round(y+6*sx),max(0,round(x)-1):min(1620,round(x+3*sx)+2)];v=accent-paper;coeff=np.sum((patch-paper)*v,2)/max(1,float(v@v));strength=float(np.percentile(coeff,85))/op;markers[r].append([round(t,6),round(float(np.clip(strength,0,1)),3)])
        left=max(0,round(right-85*sx));top=max(190,round(y-12*sx));bottom=min(846,round(y+12*sx));patch=a[top:bottom,left:max(left+1,round(right))];contrast=np.max(abs(patch-paper),2);peak=float(np.percentile(contrast,99))
        if peak<3:active=0
        else:
            color=np.median(patch[contrast>peak*.85],axis=0);color=paper+(color-paper)/op;v=ink-muted;active=float(np.clip((color-muted)@v/max(1,float(v@v)),0,1))
        names[r].append([round(t,6),round(active,3)])
def simplify(keys):
    a=np.array(keys);keep={0,len(a)-1};todo=[(0,len(a)-1)]
    while todo:
        l,r=todo.pop()
        if r-l<2:continue
        pred=a[l,1]+(a[r,1]-a[l,1])*(a[l+1:r,0]-a[l,0])/(a[r,0]-a[l,0]);err=abs(a[l+1:r,1]-pred);j=int(np.argmax(err))+l+1
        if err[j-l-1]>.03:keep.add(j);todo.extend([(l,j),(j,r)])
    return [keys[i]for i in sorted(keep)]
states['markers']={r:simplify(k)for r,k in markers.items()};states['nameStates']={r:simplify(k)for r,k in names.items()};(OUT/'round3-rowStates.json').write_text(json.dumps(states,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print('measured row marker and name states',sum(map(len,states['markers'].values())),sum(map(len,states['nameStates'].values())),flush=True)
