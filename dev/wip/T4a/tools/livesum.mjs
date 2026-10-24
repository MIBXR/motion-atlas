// live.mjs 结果摘要：node dev/shots/T4/tools/livesum.mjs <json>…
import fs from 'node:fs';
for (const f of process.argv.slice(2)) {
  const o = JSON.parse(fs.readFileSync(f, 'utf8'));
  const b = o.buffer;
  console.log(`${f.split('/').pop()}: ready ${o.readyS}s · wall ${o.wallS}s · stalls ${b.stallCount} / ${(b.stallMs / 1000).toFixed(1)}s ${JSON.stringify(b.stalls)} · missFrames ${o.frames.missFrames}/${o.frames.frames} · veil ${o.veilSamples.length} · heap peak ${o.maxHeapMB}MB · cachedMB max ${b.maxCachedMB} · budgetHits ${b.budgetHits} · loads ${b.loads} fetches ${b.fetches} evicted ${b.evicted} timeouts ${b.timeouts} · mirror ${o.mirrorBytesMB}MB/${o.mirrorRequests}`);
  if (o.retained) console.log('  retained(after GC):', o.retained.map((r) => `${r[0]}:${r[1]}`).join(' '));
  if (o.log && o.log.some((l) => /EXC|error/.test(l))) console.log('  errors:', o.log.filter((l) => /EXC|error/.test(l)).join(' | '));
}
