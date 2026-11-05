import sys
from pathlib import Path
import json,numpy as np
ROOT=Path(sys.argv[1]).resolve();OUT=ROOT/'codex/case-impl';CASE=Path(sys.argv[2]).resolve()/'demos/cases/butterfly-garden-score';p=CASE/'film/data/notes.json';score=json.loads(p.read_text(encoding='utf8'));overrides=json.loads((OUT/'focus-note-overrides-round2.json').read_text(encoding='utf8'))
for e in overrides:
    n=next(n for n in score['notes']if all(n[k]==e[k]for k in ['row','x0','x1','yOffset']));n.setdefault('shotCurves',{})[e['shot']]=e['curve']
text=json.dumps(score,ensure_ascii=False,separators=(',',':'))
if len(text.encode('utf8'))>800000:raise ValueError(len(text.encode('utf8')))
p.write_text(text,encoding='utf8');print('focus overrides',len(overrides),'notes bytes',len(text.encode('utf8')))
