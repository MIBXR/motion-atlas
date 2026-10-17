// 节拍点截图（渲染模式，每帧等瓦片）：node dev/shots/T4/tools/beats.mjs <outDir> <landscape|portrait> t1 t2 ...
// 额外：打印控制台错误、就绪耗时、每次 seek 的耗时
import path from 'node:path';
import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [outDir, orient = 'landscape', ...ts] = process.argv.slice(2);
const times = ts.length ? ts.map(Number) : [0.5, 2.5, 3.5, 5.5, 7.6, 9.5, 11.8, 13.4, 15.5, 17.6, 19.8, 22.0, 24.0, 25.0, 27.0, 30.5, 32.0, 33.6, 35.4, 37.6, 38.6, 40.0, 41.8, 43.2, 45.4, 46.6, 48.2, 49.8, 51.6, 53.2, 55.0, 57.0, 59.5];
const [w, h] = orient === 'portrait' ? [1080, 1920] : [1920, 1080];
const extra = process.env.Q || '';
fs.mkdirSync(outDir, { recursive: true });
const browser = await launch({ width: w, height: h });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('Runtime.exceptionThrown', (p) => errors.push('EXC ' + (p.exceptionDetails?.exception?.description || p.exceptionDetails?.text)));
  page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error' || p.type === 'warning') errors.push(p.type.toUpperCase() + ' ' + p.args.map((a) => a.value ?? a.description).join(' ')); });
  const t0 = Date.now();
  await page.goto(`http://localhost:4321/demos/cases/map-pilgrimage/index.html?render=1&embed=1&orient=${orient}${extra}`, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 240000);
  console.log('ready in', ((Date.now() - t0) / 1000).toFixed(1) + 's', await page.eval('JSON.stringify({ map: !!window.__map, orient: window.__motion.orient })'));
  for (const t of times) {
    const s0 = Date.now();
    await page.eval(`window.__motion.seek(${t}).then(() => new Promise(r => requestAnimationFrame(() => r())))`, 90000);
    const file = path.join(outDir, `${orient[0].toUpperCase()}-${t.toFixed(1).padStart(4, "0")}.png`);
    await page.screenshot(file);
    console.log(t, ((Date.now() - s0) / 1000).toFixed(1) + 's');
  }
  if (errors.length) console.log('--- console ---\n' + [...new Set(errors)].slice(0, 30).join('\n'));
} finally { await browser.close(); }
