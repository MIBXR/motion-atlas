// 某一时刻扫描出的瓦片清单里有没有某块瓦片（排查“计划外”瓦片）：node dev/shots/T4/tools/scanprobe.mjs <key> <t1,t2,…>
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [key, ts] = process.argv.slice(2);
const browser = await launch({ width: 640, height: 360 });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/demos/cases/map-pilgrimage/index.html?embed=1&orient=landscape&tilemirror=http://localhost:4330&demmirror=http://127.0.0.1:4330', 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 120000);
  await page.eval('(window.__motion.pause(), true)');
  for (const t of ts.split(',')) {
    const r = await page.eval(`window.__bufDebug.scan1(${t})`);
    const hit = r.need.filter((s) => s.startsWith(key + ' ') || s.includes('/' + key.split('/')[1] + ' '));
    console.log(t, 'fast', r.fast, 'n', r.need.length, 'z5:', r.need.filter((s) => / 5\//.test(s)).length, 'hit', hit.join(' '));
  }
  const near = await page.eval(`window.__bufDebug.near(8.32)`);
  console.log('sample near 8.32:', near.t, near.n);
} finally { await browser.close(); }
