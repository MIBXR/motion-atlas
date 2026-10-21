// 复现 smoke 的“全程 seek 一遍后从 0 播放 1.5 秒”，并读出缓冲状态（判断是缓冲暂停还是渲染太慢）
// node dev/shots/T4/tools/smokeplay.mjs [landscape|portrait] [--mirror]
import { launch } from '../../../../scripts/lib/cdp.mjs';
const args = process.argv.slice(2);
const orient = args.find((a) => /^(landscape|portrait)$/.test(a)) || 'landscape';
const mirror = args.includes('--mirror');
const browser = await launch({ width: 1280, height: 720 });
try {
  const page = await browser.newPage();
  const log = [];
  page.on('Runtime.consoleAPICalled', (p) => log.push(p.type + ' ' + p.args.map((a) => a.value ?? a.description).join(' ').slice(0, 200)));
  const t0 = Date.now();
  await page.goto(`http://localhost:4321/demos/cases/map-pilgrimage/index.html?embed=1&orient=${orient}` + (mirror ? '&tilemirror=http://localhost:4330' : ''), 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 120000);
  console.log('ready', (Date.now() - t0) / 1000, 's');
  const D = await page.eval('window.__motion.duration');
  const s0 = Date.now();
  await page.eval(`(() => { const m = window.__motion; m.pause(); for (let t = 0; t <= ${D}; t += 0.2) m.seek(t); m.seek(${D}); return true; })()`, 60000);
  console.log('sweep', (Date.now() - s0) / 1000, 's');
  const st = await page.eval('(window.__motion.seek(0), window.__motion.play(), { t: window.__motion.time, buf: window.__buffer })');
  console.log('after seek(0)+play', JSON.stringify(st.buf));
  const f0 = await page.eval('window.__mapStats.frames');
  const samples = [];
  for (let i = 0; i < 15; i++) { await page.eval('new Promise(r => setTimeout(r, 100))'); samples.push(await page.eval('[+window.__motion.time.toFixed(2), window.__motion.playing, window.__buffer.bufferedUntil, window.__buffer.stalled]')); }
  console.log(JSON.stringify(samples));
  console.log('frames in 1.5s', (await page.eval('window.__mapStats.frames')) - f0, 'blocking', JSON.stringify(await page.eval('window.__bufDebug.blocking()')));
  console.log(log.filter((l) => !/^log/.test(l)).slice(0, 12).join('\n'));
} finally { await browser.close(); }
