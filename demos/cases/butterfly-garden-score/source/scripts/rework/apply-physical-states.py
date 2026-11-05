from pathlib import Path
import json,sys
case=Path(sys.argv[2])/'demos/cases/butterfly-garden-score'
score=json.loads((case/'film/data/notes.json').read_text(encoding='utf8'))
measured=json.loads((case/'source/analysis/rework/round3-physical-state-evidence.json').read_text(encoding='utf8'))
for e in measured['changes']:score['notes'][e['note']]['stateAlpha'][e['mode']][e['stage']]=e['new']
for e in measured['releases']:
    model=score['rowColors'][f"{e['row']}:{e['mode']}"];model['delay'],model['release']=e['measured']
(case/'film/data/notes.json').write_text(json.dumps(score,ensure_ascii=False,separators=(',',':')),encoding='utf8')
