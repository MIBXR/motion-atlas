// 某块瓦片在哪些时刻出现在扫描清单里，以及缓冲计划里有没有它：node dev/shots/T4/tools/scanwhen.mjs <源/键> <起> <止> [步长]
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [key, a, b, step = '0.025'] = process.argv.slice(2);
const browser = await launch({ width: 640, height: 360 });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/demos/cases/map-pilgrimage/index.html?embed=1&orient=landscape&tilemirror=http://localhost:4330&demmirror=http://127.0.0.1:4330', 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 120000);
  await page.eval('(window.__motion.pause(), true)');
  const r = await page.eval(`(() => { const out = []; for (let t = ${a}; t <= ${b} + 1e-9; t = +(t + ${step}).toFixed(3)) { const s = window.__bufDebug.scan1(t); if (s.need.some((x) => x.startsWith('${key} '))) out.push(t); } return out; })()`, 120000);
  console.log('scan hits:', r.join(' '));
  console.log('in plan:', await page.eval(`window.__bufDebug.urls().length + ' tiles; samples near: ' + JSON.stringify(${JSON.stringify(a)})`));
  console.log('sample times:', await page.eval(`(() => { const o = []; for (let t = ${a}; t <= ${b}; t += 0.025) { const n = window.__bufDebug.near(t); if (!o.includes(n.t)) o.push(n.t); } return o.join(' '); })()`));
} finally { await browser.close(); }
