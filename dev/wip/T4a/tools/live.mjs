// 实时模式全程（冷缓存：每次新建浏览器配置）：可播放耗时、缓冲暂停、未就绪帧、JS 堆峰值
// node dev/shots/T4/tools/live.mjs [landscape|portrait] [--mirror] [--small] [--mbps 10] [--tag 名称]
//   --mirror：瓦片走本地镜像 tileproxy（http://localhost:4330），--mbps 此时改镜像的带宽（全局令牌桶），不用 CDP 限速
//   --small：视口 640×360 / 360×640（舞台等比缩小，地图像素比按显示尺寸，瓦片清单与大视口相同量级但内存更小）
import { launch } from '../../../../scripts/lib/cdp.mjs';
import fs from 'node:fs';
const args = process.argv.slice(2);
const orient = args.find((a) => /^(landscape|portrait)$/.test(a)) || 'landscape';
const arg = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const mbps = Number(arg('--mbps') || 0);
const mirror = args.includes('--mirror');
const small = args.includes('--small');
const tag = arg('--tag') || '';
const gcEvery = Number(arg('--gc') || 0); // 诊断用：每隔 N 秒强制 GC 后读一次堆（看真实驻留量，而不是未回收的垃圾）
const base = small ? [640, 360] : [1280, 720];
const [w, h] = orient === 'portrait' ? [base[1], base[0]] : base;
if (mirror) {
  const r = await fetch(`http://localhost:4330/__set?mbps=${mbps || 50}&latency=40`).then((x) => x.json());
  console.log('mirror', r);
}
const stats0 = mirror ? await fetch('http://localhost:4330/__stats').then((x) => x.json()) : null;
const browser = await launch({ width: w, height: h, args: ['--enable-precise-memory-info'] });
const out = { orient, mirror, small, viewport: [w, h], mbps: mbps || (mirror ? 50 : 'unthrottled') };
try {
  const page = await browser.newPage();
  const log = [];
  page.on('Runtime.exceptionThrown', (p) => log.push('EXC ' + (p.exceptionDetails?.exception?.description || p.exceptionDetails?.text)));
  page.on('Runtime.consoleAPICalled', (p) => log.push(p.type + ' ' + p.args.map((a) => a.value ?? a.description).join(' ').slice(0, 240)));
  await page.send('Network.enable');
  await page.send('Network.setCacheDisabled', { cacheDisabled: false });
  if (mbps && !mirror) await page.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: (mbps * 1e6) / 8, uploadThroughput: (5 * 1e6) / 8 });
  const t0 = Date.now();
  const q = `embed=1&orient=${orient}` + (mirror ? '&tilemirror=http://localhost:4330&demmirror=http://127.0.0.1:4330' : '');
  await page.goto(`http://localhost:4321/demos/cases/map-pilgrimage/index.html?${q}`, 120000);
  await page.waitFor('window.__motion', 60000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 300000);
  out.readyS = +((Date.now() - t0) / 1000).toFixed(1);
  // 自动播放（MotionKit.start 在 ready 后开始播放）；采样直到播放结束
  const samples = [];
  const blocking = [];
  const tEnd = Date.now() + 480000;
  let maxHeap = 0, lastBlock = 0, lastGc = Date.now();
  const retained = [];
  while (Date.now() < tEnd) {
    const s = await page.eval('({ t: +window.__motion.time.toFixed(2), playing: window.__motion.playing, missing: window.__baseMissing(), buffering: document.getElementById("stage").dataset.buffering === "1", veil: +getComputedStyle(document.getElementById("veil")).opacity, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0, until: +(window.__buffer.bufferedUntil || 0).toFixed(2) })');
    s.w = +((Date.now() - t0) / 1000).toFixed(1);
    samples.push(s);
    maxHeap = Math.max(maxHeap, s.heap);
    // 缓冲暂停时每 2 秒记一次挡住的瓦片
    if (s.buffering && Date.now() - lastBlock > 2000) {
      lastBlock = Date.now();
      blocking.push({ w: s.w, t: s.t, b: await page.eval('JSON.stringify(window.__bufDebug.blocking())').then(JSON.parse), st: await page.eval('window.__bufDebug.states()') });
    }
    if (gcEvery && Date.now() - lastGc > gcEvery * 1000) { lastGc = Date.now(); await page.send('HeapProfiler.collectGarbage'); retained.push([s.t, await page.eval('Math.round(performance.memory.usedJSHeapSize / 1048576)'), await page.eval('JSON.stringify(window.__buffer.cache)'), await page.eval('Object.values(window.__map.style.sourceCaches).reduce((n, sc) => n + Object.keys(sc._tiles).length, 0)')]); }
    if (s.t >= 59.9 && !s.playing) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  out.wallS = +((Date.now() - t0) / 1000).toFixed(1);
  out.buffer = await page.eval('window.__buffer');
  out.frames = await page.eval('({ frames: window.__mapStats.frames, missFrames: window.__mapStats.misses, at: window.__mapStats.missFrames.slice(0, 40), tiles: window.__mapStats.missTiles })');
  out.maxHeapMB = maxHeap;
  out.samples = samples.length;
  out.missingWhilePlaying = samples.filter((s) => s.playing && s.missing).map((s) => s.t);
  out.veilSamples = samples.filter((s) => s.veil > 0.05).map((s) => s.t);
  out.bufferingSamples = samples.filter((s) => s.buffering).length;
  out.blocking = blocking.slice(0, 40);
  if (gcEvery) out.retained = retained;
  out.timeline = samples.filter((_, i) => i % 5 === 0).map((s) => [s.w, s.t, s.until, s.buffering ? 'B' : '', s.heap]);
  out.log = log.slice(0, 30);
} finally { await browser.close(); }
if (mirror) { const s1 = await fetch('http://localhost:4330/__stats').then((x) => x.json()); out.mirrorBytesMB = +((s1.bytes - stats0.bytes) / 1048576).toFixed(1); out.mirrorRequests = s1.requests - stats0.requests; }
const { timeline, blocking, ...brief } = out;
console.log(JSON.stringify({ ...brief, blocking: blocking.slice(0, 6) }, null, 1));
fs.mkdirSync('dev/shots/T4/live', { recursive: true });
const name = `live-${orient}${mirror ? '-mirror' : ''}${small ? '-small' : ''}${mbps ? '-' + mbps + 'mbps' : ''}${tag ? '-' + tag : ''}`;
fs.writeFileSync(`dev/shots/T4/live/${name}.json`, JSON.stringify(out, null, 1));
console.log('→ dev/shots/T4/live/' + name + '.json');
