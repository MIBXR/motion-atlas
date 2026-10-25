import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const nums = s => [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m=>m[0]);
const flat = (v, p = '', out = {}) => {
  if (typeof v === 'string' || typeof v === 'number') out[p] = v;
  else if (v && typeof v === 'object') for (const [k,x] of Object.entries(v)) flat(x, p ? p + '.' + k : k, out);
  return out;
};
for (const kind of ['cases', 'patterns']) for (const f of fs.readdirSync('entries/'+kind)) {
  const file = 'entries/'+kind+'/'+f;
  const old = flat(JSON.parse(execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'}))), now = flat(JSON.parse(fs.readFileSync(file,'utf8')));
  for (const [key,v] of Object.entries(old)) {
    if (typeof v !== 'string' || typeof now[key] !== 'string' || /^(sources|source|evidence|research|capturedAt|carriers|migration.*field|id|demo)/.test(key)) continue;
    const source = v.split('来源：')[0], before = nums(source), after = nums(now[key]);
    const lost = before.filter(n=>!after.includes(n));
    if (lost.length) console.log(file+':'+key+' missing '+lost.join(',')+'\nOLD '+source+'\nNEW '+now[key]);
  }
}
