// 渲染模式每帧耗时拆分：seek 总耗时，以及 'idle' 事件是否在 waitIdle 超时前到来
import { launch } from '../../../../scripts/lib/cdp.mjs';
const ts = (process.argv[2] || '8,8.0333,8.0667,12,12.0333,22,22.0333,30,30.0333').split(',').map(Number);
const browser = await launch({ width: 1920, height: 1080 });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/demos/cases/map-pilgrimage/index.html?render=1&embed=1&orient=landscape&tilemirror=http://localhost:4330&demmirror=http://127.0.0.1:4330', 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 240000);
  await page.eval(`(() => { const m = window.__map; window.__ev = []; const a = () => performance.now(); ['idle', 'render', 'data', 'sourcedata'].forEach((n) => m.on(n, () => { if (window.__rec) window.__ev.push([n, Math.round(a() - window.__t0)]); })); return true; })()`);
  for (const t of ts) {
    const r = await page.eval(`(async () => { window.__ev = []; window.__rec = true; window.__t0 = performance.now(); await window.__motion.seek(${t}); const dt = Math.round(performance.now() - window.__t0); window.__rec = false; const ev = window.__ev; const idle = ev.filter((e) => e[0] === 'idle').map((e) => e[1]); const renders = ev.filter((e) => e[0] === 'render').length; return { t: ${t}, ms: dt, idle: idle.slice(0, 3), renders, loaded: window.__map.loaded(), tiles: window.__map.areTilesLoaded(), repaint: window.__map._repaint, dirty: [window.__map._sourcesDirty, window.__map._styleDirty, window.__map._placementDirty] }; })()`, 60000);
    console.log(JSON.stringify(r));
  }
} finally { await browser.close(); }
