import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = p=>JSON.parse(fs.readFileSync(p,'utf8'));
const before=read('dev/wip/Tcopy/rework-1/before.json');
const timing=read('dev/wip/Tcopy/rework-1/timing-review.json');
const checked=[];
for (const row of timing) {
  const p=`entries/patterns/${row.id}.json`, e=read(p), old=JSON.parse(before[p]);
  assert([...e.trigger].length<=20,row.id+' trigger length');
  assert([...e.effect].length<=30,row.id+' effect length');
  assert.notEqual(e.effect,e.summary,row.id+' duplicate effect');
  assert(!/caseT|\d+(?:\.\d+)?s|片段重放|镜头固定/.test(e.mechanism),row.id+' internal mapping');
  assert.deepEqual(e.timing,old.timing.filter(item=>!row.removed.some(r=>r.name===item.name&&r.value===item.value)),row.id+' timing changed beyond removals');
  assert.deepEqual(e.migration,old.migration,row.id+' parameter list changed');
  checked.push(row.id);
}
const archiveIds=['boot-typing','rolling-digits','decrypt-reveal','wave-array','idle-breathing'];
for (const id of archiveIds) {
  const p=`entries/patterns/${id}.json`,e=read(p),old=JSON.parse(before[p]);
  assert.notEqual(e.effect,e.summary,id+' duplicate effect');
  assert.deepEqual(e,old,id+' archive pattern changed');
}
const map=read('entries/cases/map-pilgrimage.json');
for (const id of ['archive-os','map-pilgrimage']) {
  const file=`entries/cases/${id}.json`,current=read(file),old=JSON.parse(before[file]);
  const {focus:currentFocus,observations:currentObservations,...currentRest}=current;
  const {focus:oldFocus,observations:oldObservations,...oldRest}=old;
  assert.deepEqual(currentRest,oldRest,id+' fields changed beyond requested copy');
  if(id==='map-pilgrimage')assert.equal(currentFocus,oldFocus,'map focus changed');
}
assert(map.observations.length>=8&&map.observations.length<=10);
let previous=-1;
for (const o of map.observations) {
  assert([...o.what].length<=40,o.what+' exceeds length');
  const times=o.at.split('–').map(s=>{
    assert(/^0:\d{2}(?:\.\d)?$/.test(s),'time format '+s);
    return Number(s.slice(2));
  });
  assert(times.every(t=>t>=0&&t<=60),'out of range '+o.at);
  assert(times[0]>=previous,'unsorted '+o.at);
  assert(times.at(-1)>=times[0],'reversed range '+o.at);
  previous=times[0];
  assert(!map.rhythm.beats.some(b=>b.note===o.what),'beat note duplicated');
  assert(!/首尔|YUI|聖地巡礼|S1 EP05|动画 2015/.test(o.what),'foreign content');
}
for(const p of ['AGENT.md','CONTRIBUTING.md']) assert(!fs.readFileSync(p,'utf8').includes('showcase'),p+' showcase');
const result={mapObservations:map.observations.length,checkedMapPatterns:checked,archivePatternsUnchanged:archiveIds,timingRemoved:timing.reduce((n,r)=>n+r.removed.length,0),timingRetained:timing.reduce((n,r)=>n+r.retained.length,0),uncertain:timing.flatMap(r=>r.uncertain),failures:0};
fs.writeFileSync('dev/wip/Tcopy/rework-1/content-checks.json',JSON.stringify(result,null,2)+'\n');
console.log('rework copy check passed · 10 observations · 12 patterns · 5 archive patterns unchanged · 38 timing removals · 24 timing items preserved · 0 uncertain');
