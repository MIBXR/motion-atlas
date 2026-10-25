import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { buildAll } from '../../../../scripts/lib/catalog.mjs';

const { cases, patterns, errors } = buildAll();
const failures = [...errors];
const baseline = p => JSON.parse(execFileSync('git', ['show', 'HEAD:'+p], {encoding:'utf8',maxBuffer:30_000_000}));
const unchangedNumberFields = (a,b,p='') => {
  if (typeof a === 'number' && a !== b) failures.push('Numeric field changed: '+p);
  else if (a && typeof a === 'object') for (const [k,v] of Object.entries(a)) {
    if (p === '' && ['energy','source','evidence','capturedAt','research','sources','carriers'].includes(k)) continue;
    unchangedNumberFields(v,b?.[k],p ? p+'.'+k : k);
  }
};
let fileCount = 0;
for (const [kind, list] of [['cases', cases], ['patterns', patterns]]) for (const e of list) {
  const before = baseline(`entries/${kind}/${e.id}.json`);
  unchangedNumberFields(before,e);
  if (e.id !== 'archive-os' && JSON.stringify(e.energy) !== JSON.stringify(before.energy)) failures.push('Energy changed: '+e.id);
  if (kind === 'cases' && ['source','evidence','capturedAt','research','sources'].some(k=>k in e)) failures.push('Removed field remains: '+e.id);
  if (kind === 'patterns' && e.sources.some(s=>Object.keys(s).join(',') !== 'caseId')) failures.push('Pattern sources fields: '+e.id);
  const bundle = baseline(`agent/${kind}/${e.id}.json`);
  for (const f of bundle.files) {
    const bytes = fs.readFileSync(f.path);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    if (hash !== f.sha256) failures.push('Demo/preview baseline bytes differ: '+f.path);
    fileCount++;
  }
}
const modifications = execFileSync('git',['diff','HEAD','--name-status'],{encoding:'utf8'}).trim().split('\n');
for (const line of modifications) {
  const [status,p] = line.split('\t');
  if (p?.startsWith('vendor/') || p?.startsWith('kit/') || p?.startsWith('demos/') && status !== 'D') failures.push('Scope violation: '+line);
}
const result = { entries:cases.length+patterns.length, baselineFiles:fileCount, failures };
fs.writeFileSync('dev/wip/Tcopy/structure-results.json',JSON.stringify(result,null,2)+'\n');
console.log(`structure ${result.entries}/19 entries checked · ${fileCount} baseline files byte-identical · ${failures.length} failures`);
for (const f of failures) console.log(f);
if (failures.length) process.exitCode=1;
