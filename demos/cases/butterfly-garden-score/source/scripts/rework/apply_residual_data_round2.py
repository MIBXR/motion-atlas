import sys
from pathlib import Path
import json
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'));write=lambda p,a:p.write_text(json.dumps(a,ensure_ascii=False,separators=(',',':')),encoding='utf8')
score=read(CASE/'film/data/notes.json');restore=read(OUT/'deleted-audit-round2.json')['restore']
for n in restore:
    if not any(e['row']==n['row']and e['x0']==n['x0']and e['x1']==n['x1']and e['yOffset']==n['yOffset']for e in score['notes']):score['notes'].append(n)
score['notes'].sort(key=lambda n:(n['x0'],n['row'],n['yOffset']));write(CASE/'film/data/notes.json',score)
ann=read(CASE/'film/data/annotations.json')
ann['hp']=read(OUT/'hp-dots-round2.json')
for m,p in zip(ann['modulations'],read(OUT/'modulation-paint-round2.json')):
    m.update(width=p['width'],globalX=p['globalX'],curve=p['curve'])
write(CASE/'film/data/annotations.json',ann)
