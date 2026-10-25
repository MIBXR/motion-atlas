import fs from 'node:fs';
import path from 'node:path';

const removed = ['industrial-protocol', 'chamfer-panel', 'text-scramble', 'conveyor-flow', 'hold-confirm', 'scanline-wipe'];
const root = fs.realpathSync('.');
const targets = [
  'entries/cases/industrial-protocol.json', 'demos/cases/industrial-protocol', 'docs/research/industrial-protocol.md',
  ...removed.slice(1).flatMap(id => [`entries/patterns/${id}.json`, `demos/patterns/${id}`]),
  ...['cases', 'patterns'].flatMap(kind => fs.readdirSync(`previews/${kind}`).filter(f => removed.some(id => f.startsWith(id))).map(f => `previews/${kind}/${f}`)),
];
for (const p of targets) {
  const abs = path.resolve(p);
  if (!abs.startsWith(root + path.sep)) throw new Error('Outside workspace: ' + abs);
  fs.rmSync(abs, { recursive: true, force: true });
}
for (const kind of ['cases', 'patterns']) for (const name of fs.readdirSync(`entries/${kind}`)) {
  const p = `entries/${kind}/${name}`, e = JSON.parse(fs.readFileSync(p, 'utf8'));
  e.carriers = e.carriers.filter(c => c !== 'showcase');
  if (!e.carriers.length) throw new Error('Empty carriers: ' + p);
  for (const k of ['pairsWellWith', 'conflicts']) if (e.composition?.[k]) e.composition[k] = e.composition[k].filter(id => !removed.includes(id));
  if (kind === 'cases') {
    for (const k of ['source', 'evidence', 'capturedAt', 'research', 'sources']) delete e[k];
    e.patternIds = e.patternIds.filter(id => !removed.includes(id));
    e.carriers = [e.id === 'map-pilgrimage' ? 'video' : 'console'];
    if (e.id === 'archive-os') e.energy = [0.12,0.18,0.22,0.26,0.3,0.32,0.36,0.4,0.44,0.5,0.6,0.82,0.6,0.52,0.5,0.48,0.5,0.7,0.6,0.55,0.5,0.62,0.56,0.54,0.72,0.66,0.64,0.92,0.8,0.84,0.62,0.78,0.72,0.8,0.74,0.8,0.74,0.7,0.55];
  } else e.sources = e.sources.map(s => ({ caseId: s.caseId }));
  fs.writeFileSync(p, JSON.stringify(e, null, 2) + '\n');
}
console.log('Removed 1 case + 5 patterns; all retained carriers nonempty');
