// 实时模式全程（冷缓存：每次新建浏览器配置）：可播放耗时、缓冲暂停、未就绪帧、JS 堆峰值
// node dev/shots/T4/tools/live.mjs [landscape|portrait] [--mbps 10]
import { launch } from '../../../../scripts/lib/cdp.mjs';
import fs from 'node:fs';
const args = process.argv.slice(2);
const orient = args.find((a) => /^(landscape|portrait)$/.test(a)) || 'landscape';
const mbps = args.includes('--mbps') ? Number(args[args.indexOf('--mbps') + 1]) : 0;
const [w, h] = orient === 'portrait' ? [720, 1280] : [1280, 720];
const browser = await launch({ width: w, height: h, args: ['--enable-precise-memory-info'] });
const out = { orient, mbps: mbps || 'unthrottled' };
try {
  const page = await browser.newPage();
  const log = [];
  page.on('Runtime.exceptionThrown', (p) => log.push('EXC ' + (p.exceptionDetails?.exception?.description || p.exceptionDetails?.text)));
  page.on('Runtime.consoleAPICalled', (p) => { if (p.type !== 'log') log.push(p.type + ' ' + p.args.map((a) => a.value ?? a.description).join(' ').slice(0, 240)); });
  await page.send('Network.enable');
  await page.send('Network.setCacheDisabled', { cacheDisabled: false });
  if (mbps) await page.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: (mbps * 1e6) / 8, uploadThroughput: (5 * 1e6) / 8 });
  const t0 = Date.now();
  await page.goto(`http://localhost:4321/demos/cases/map-pilgrimage/index.html?embed=1&orient=${orient}`, 120000);
  await page.waitFor('window.__motion', 60000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 300000);
  out.readyS = +((Date.now() - t0) / 1000).toFixed(1);
  // 自动播放（MotionKit.start 在 ready 后开始播放）；采样直到播放结束
  const samples = [];
  const tEnd = Date.now() + 480000;
  let maxHeap = 0;
  while (Date.now() < tEnd) {
    const s = await page.eval('({ t: +window.__motion.time.toFixed(2), playing: window.__motion.playing, missing: window.__baseMissing(), buffering: document.getElementById("stage").dataset.buffering === "1", veil: +getComputedStyle(document.getElementById("veil")).opacity, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0 })');
    samples.push(s);
    maxHeap = Math.max(maxHeap, s.heap);
    if (s.t >= 59.9 && !s.playing) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  out.wallS = +((Date.now() - t0) / 1000).toFixed(1);
  out.buffer = await page.eval('window.__buffer');
  out.frames = await page.eval('({ frames: window.__mapStats.frames, missFrames: window.__mapStats.misses, at: window.__mapStats.missFrames.slice(0, 40) })');
  out.maxHeapMB = maxHeap;
  out.samples = samples.length;
  out.missingWhilePlaying = samples.filter((s) => s.playing && s.missing).map((s) => s.t);
  out.veilSamples = samples.filter((s) => s.veil > 0.05).map((s) => s.t);
  out.bufferingSamples = samples.filter((s) => s.buffering).length;
  out.log = log.slice(0, 30);
} finally { await browser.close(); }
console.log(JSON.stringify(out, null, 1));
fs.mkdirSync('dev/shots/T4/live', { recursive: true });
fs.writeFileSync(`dev/shots/T4/live/live-${orient}${mbps ? '-' + mbps + 'mbps' : ''}.json`, JSON.stringify(out, null, 1));
