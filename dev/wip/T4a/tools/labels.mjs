// 某些时刻的地图标签位置与事件文字块（排查标签换边）：node dev/shots/T4/tools/labels.mjs <landscape|portrait> t1 t2 …
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [orient, ...ts] = process.argv.slice(2);
const [w, h] = orient === 'portrait' ? [1080, 1920] : [1920, 1080];
const browser = await launch({ width: w, height: h });
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:4321/demos/cases/map-pilgrimage/index.html?render=1&embed=1&orient=${orient}&tilemirror=http://localhost:4330&demmirror=http://127.0.0.1:4330`, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 240000);
  for (const t of ts) {
    await page.eval(`window.__motion.seek(${t}).then(() => true)`, 90000);
    console.log('  zones', await page.eval('JSON.stringify(window.__labelDebug())'));
    console.log(t, await page.eval(`JSON.stringify([...document.querySelectorAll('.mk-label')].filter((e) => +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.querySelector('.mk-en').textContent.slice(0, 14), Math.round(r.left), Math.round(r.top), Math.round(r.width)]; }))`));
  }
} finally { await browser.close(); }
