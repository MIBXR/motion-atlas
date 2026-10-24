// 每块瓦片的内存代价：停在某一时刻、缓冲好后，强制 GC 读堆 → 清空数据源的瓦片缓存（不在画面里的）→ 再 GC 读堆，
// 差值 / 缓存瓦片的原始 pbf 字节 = 每字节 pbf 在主线程堆上的代价
// node dev/shots/T4/tools/tileprobe.mjs [t]
import { launch } from '../../../../scripts/lib/cdp.mjs';
const t = Number(process.argv[2] || 20);
const browser = await launch({ width: 640, height: 360, args: ['--enable-precise-memory-info'] });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/demos/cases/map-pilgrimage/index.html?embed=1&orient=landscape&tilemirror=http://localhost:4330', 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 120000);
  await page.eval(`(window.__motion.pause(), window.__motion.seek(${t}), true)`);
  await page.eval(`new Promise(r => { const a = performance.now(); const iv = setInterval(() => { if (window.__buffer.bufferedUntil >= ${t} + 10 || performance.now() - a > 90000) { clearInterval(iv); r(true); } }, 200); })`, 100000);
  await page.eval('new Promise(r => setTimeout(r, 2000))');
  const stat = `(() => { const out = {}; for (const [id, sc] of Object.entries(window.__map.style.sourceCaches)) { if (!/openmaptiles|dem/.test(id)) continue; const live = Object.values(sc._tiles), cached = sc._cache.order.map((k) => sc._cache.getByKey(k)).filter(Boolean); const raw = (arr) => Math.round(arr.reduce((s, x) => s + ((x.latestRawTileData && x.latestRawTileData.byteLength) || (x.dem && x.dem.data && x.dem.data.byteLength) || 0), 0) / 1048576 * 10) / 10; out[id] = { live: live.length, liveRawMB: raw(live), cached: cached.length, cachedRawMB: raw(cached) }; } return JSON.stringify(out); })()`;
  await page.send('HeapProfiler.collectGarbage');
  const h1 = await page.eval('Math.round(performance.memory.usedJSHeapSize / 1048576)');
  console.log('t', t, 'bufferedUntil', await page.eval('window.__buffer.bufferedUntil'), 'heap', h1, await page.eval(stat));
  await page.eval('(Object.entries(window.__map.style.sourceCaches).forEach(([id, sc]) => { if (/openmaptiles|dem/.test(id)) sc._cache.reset(); }), true)');
  await page.send('HeapProfiler.collectGarbage');
  const h2 = await page.eval('Math.round(performance.memory.usedJSHeapSize / 1048576)');
  console.log('cache cleared → heap', h2, await page.eval(stat));
} finally { await browser.close(); }
