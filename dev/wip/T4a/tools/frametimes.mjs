// smoke 同样的流程（全程 seek 一遍 → seek(0) → 播放），逐帧记录 rAF 间隔与时间轴前进，判断慢在“跳转后的头几帧”还是“每一帧”
// node dev/shots/T4/tools/frametimes.mjs [landscape|portrait] [--mirror] [--nosweep]
import { launch } from '../../../../scripts/lib/cdp.mjs';
const args = process.argv.slice(2);
const orient = args.find((a) => /^(landscape|portrait)$/.test(a)) || 'landscape';
const mirror = args.includes('--mirror');
const browser = await launch({ width: 1280, height: 720 });
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:4321/demos/cases/map-pilgrimage/index.html?embed=1&orient=${orient}` + (mirror ? '&tilemirror=http://localhost:4330' : ''), 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 120000);
  const D = await page.eval('window.__motion.duration');
  if (!args.includes('--nosweep')) await page.eval(`(() => { const m = window.__motion; m.pause(); for (let t = 0; t <= ${D}; t += 0.2) m.seek(t); m.seek(${D}); return true; })()`, 60000);
  const r = await page.eval(`(async () => { const m = window.__motion; m.seek(0); m.play(); const a = performance.now(); const fr = []; await new Promise((res) => { const c = (ts) => { fr.push([Math.round(performance.now() - a), +m.time.toFixed(2), m.playing ? 1 : 0, window.__buffer.stalled ? 'S' : '']); if (performance.now() - a < 2500) requestAnimationFrame(c); else res(); }; requestAnimationFrame(c); }); return { fr, t15: (fr.filter((f) => f[0] <= 1500).pop() || [])[1] }; })()`, 60000);
  console.log('time at 1.5s ≈', r.t15);
  console.log(r.fr.map((f) => f.join(':')).join(' '));
} finally { await browser.close(); }
