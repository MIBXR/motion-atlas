import sys
from pathlib import Path
import json,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';p=CASE/'film/data/notes.json';score=json.loads((OUT/'notes-before-alpha-round2.json').read_text(encoding='utf8'));samples=json.loads((OUT/'note-alpha-measurements-round2.json').read_text(encoding='utf8'));(OUT/'notes-before-alpha-round2.json').write_text(json.dumps(score,separators=(',',':')),encoding='utf8')
def simplify(a,tolerance):
    keep={0,len(a)-1};stack=[(0,len(a)-1)]
    while stack:
        l,r=stack.pop()
        if r-l<2:continue
        u=(a[l+1:r,0]-a[l,0])/(a[r,0]-a[l,0]);pred=a[l,1]+u*(a[r,1]-a[l,1]);err=abs(a[l+1:r,1]-pred);j=int(np.argmax(err))+l+1
        if err[j-l-1]>tolerance:keep.add(j);stack.extend([(l,j),(j,r)])
    return [[int(a[i,0]),round(float(a[i,1]),3)]for i in sorted(keep)]
rawNotes=score['notes'];removed=[]
for radius in [1,2,3]:
    retained=[];removed=[]
    for i,(n,ss)in enumerate(zip(rawNotes,samples)):
        ss=[s for s in ss if not 39.2<s[0]/60<43.4 and s[0]/60<116.9]
        if len(ss)<6:retained.append(n.copy());continue
        a=np.array(ss,float)
        if len(a)>20 and np.max(a[:,1])<.02:removed.append(dict(index=i,note=n,samples=len(a)));continue
        values=a[:,1].copy();onset=n['x0']/190*60;end=(n['x1']+6)/190*60
        for j in range(len(a)):
            if min(abs(a[j,0]-onset),abs(a[j,0]-end))<9:continue
            lo=max(0,j-radius);hi=min(len(a),j+radius+1)
            if a[hi-1,0]-a[lo,0]<=2*(hi-lo+1):values[j]=np.median(a[lo:hi,1])
        a[:,1]=values;n=n.copy();n['alphaKeys']=simplify(a,.025);retained.append(n)
    score['notes']=retained;score['alphaSpace']='native-composite';text=json.dumps(score,ensure_ascii=False,separators=(',',':'))
    if len(text.encode('utf8'))<=800000:break
if len(text.encode('utf8'))>800000:raise ValueError(('notes size',len(text.encode('utf8'))))
p.write_text(text,encoding='utf8');(OUT/'alpha-deletions-round2.json').write_text(json.dumps(removed,ensure_ascii=False,indent=2),encoding='utf8');print('notes',len(retained),'removed',len(removed),'bytes',len(text.encode('utf8')),'median radius',radius,'keys',sum(len(n.get('alphaKeys',[]))for n in retained))
