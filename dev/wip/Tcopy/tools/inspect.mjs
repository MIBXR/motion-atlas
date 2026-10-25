import fs from 'node:fs';

const mode = process.argv[2];
if (mode === 'inventory') {
  const rows = JSON.parse(fs.readFileSync('dev/wip/Tcopy/copy-inventory.json', 'utf8'));
  console.log(JSON.stringify(rows.filter(r => mode && (r.page === 'lab' && r.flags.some(f => ['wordy', 'internal', 'provenance'].includes(f)) || r.category === 'ui' && r.flags.length)), null, 2));
} else if (mode === 'files') {
  for (const p of process.argv.slice(3)) console.log('\nFILE ' + p + '\n' + fs.readFileSync(p, 'utf8'));
} else if (mode === 'long') {
  const scan = (v, key = '') => {
    if (typeof v === 'string') {
      if (key.startsWith('sources') || /prompt/i.test(key) || /^(demo|id|types|carriers|patternIds)/.test(key)) return;
      if (v.length > 39 || /dev\/|vendor\/|scripts\/|来源|原版|上游|实测|驱动|帧窗|推断|展示台|移植|参考|T\d|证据/.test(v)) console.log(key + ': ' + v);
    } else if (v && typeof v === 'object') for (const [k, value] of Object.entries(v)) scan(value, key ? key + '.' + k : k);
  };
  for (const kind of ['cases', 'patterns']) for (const f of fs.readdirSync('entries/' + kind)) {
    if (process.argv[3] && !f.includes(process.argv[3])) continue;
    console.log('\n' + f); scan(JSON.parse(fs.readFileSync('entries/' + kind + '/' + f, 'utf8')));
  }
} else if (mode === 'entries') {
  for (const kind of ['cases', 'patterns']) {
    for (const f of fs.readdirSync('entries/' + kind)) {
      if (process.argv[3] && !f.includes(process.argv[3])) continue;
      console.log('\nFILE entries/' + kind + '/' + f + '\n' + fs.readFileSync('entries/' + kind + '/' + f, 'utf8'));
    }
  }
}
