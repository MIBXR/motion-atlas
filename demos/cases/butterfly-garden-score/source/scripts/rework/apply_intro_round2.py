import sys, json
from pathlib import Path
work = Path(sys.argv[1]).resolve() / 'codex/case-impl'
case = Path(sys.argv[2]).resolve() / 'demos/cases/butterfly-garden-score'
p = case / 'film/data/shots.json'
shots = json.loads(p.read_text(encoding='utf8'))
measure = json.loads((work / 'intro-measurements-round2.json').read_text(encoding='utf8'))
shots['intro']['auxiliary'] = [{k: v for k, v in e.items() if k in ['id', 'text', 'x', 'y', 'fontSize', 'fontFamily', 'fontWeight', 'curve']} for e in measure['actors']]
p.write_text(json.dumps(shots, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
