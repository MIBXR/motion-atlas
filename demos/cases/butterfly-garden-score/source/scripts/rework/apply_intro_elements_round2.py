import sys
from pathlib import Path
import json
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
measure=read(OUT/'intro-elements-round2.json');shots=read(CASE/'film/data/shots.json')
measure['words']=[{k:v for k,v in e.items()if k in ['id','role','text','fx','fy','offsetX','offsetY']}for e in measure['words']]
shots['intro']['measured']=measure;shots['intro'].pop('english',None)
shots['intro']['auxiliary']=[{k:v for k,v in e.items()if k in ['id','text','x','y','fontSize','fontFamily','fontWeight','curve']}for e in shots['intro']['auxiliary']]
(CASE/'film/data/shots.json').write_text(json.dumps(shots,ensure_ascii=False,separators=(',',':')),encoding='utf8')
