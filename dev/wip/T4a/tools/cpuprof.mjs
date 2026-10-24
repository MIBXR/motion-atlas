// CPU 采样：渲染模式下播放 1.5 秒，按函数自耗时汇总（找出播放卡顿的来源）
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [url, from = '0'] = process.argv.slice(2);
const browser = await launch({ width: 1280, height: 720 });
try {
  const page = await browser.newPage();
  await page.goto(url, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 300000);
  await page.eval(`window.__motion.seek(${from})`, 60000);
  await page.send('Profiler.enable');
  await page.send('Profiler.setSamplingInterval', { interval: 500 });
  await page.send('Profiler.start');
  await page.eval('(window.__motion.play(), new Promise(r => setTimeout(r, 1500))).then(() => (window.__motion.pause(), window.__motion.time))').then((t) => console.log('advanced to', t));
  const { profile } = await page.send('Profiler.stop');
  const self = new Map(), byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const dt = profile.timeDeltas; let total = 0;
  profile.samples.forEach((id, i) => { const n = byId.get(id); const k = `${n.callFrame.functionName || '(anon)'} ${(n.callFrame.url || '').split('/').pop()}:${n.callFrame.lineNumber}`; self.set(k, (self.get(k) || 0) + (dt[i] || 0)); total += dt[i] || 0; });
  console.log('total ms', Math.round(total / 1000));
  for (const [k, v] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(String(Math.round(v / 1000)).padStart(6), k);
} finally { await browser.close(); }
