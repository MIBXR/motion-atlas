// 无头软件渲染下的逐层合成成本：同一页面里依次套用不同的 CSS / JS 变体，暂停状态下每个 rAF 手动 seek 一帧（不受缓冲暂停影响），
// 统计 1.5 秒内能出多少帧。node dev/shots/T4/tools/gpucost.mjs <url> [t] [宽x高]；变体用环境变量 V（JSON：名称 → {css, js}）
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [url, from = '1', size = '1280x720'] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
const browser = await launch({ width: w, height: h });
const VARIANTS = JSON.parse(process.env.V || '{"baseline":{}}');
try {
  const page = await browser.newPage();
  page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'log') console.log('  console:', p.args.map((a) => a.value ?? a.description).join(' ').slice(0, 1500)); });
  await page.goto(url, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 300000);
  await page.eval('(() => { const s = document.createElement("style"); s.id = "__v"; document.head.appendChild(s); window.__motion.pause(); return true; })()');
  for (const [name, v] of Object.entries(VARIANTS)) {
    await page.eval(`(document.getElementById('__v').textContent = ${JSON.stringify(v.css || '')}, true)`);
    if (v.js) await page.eval(v.js);
    await page.eval(`window.__motion.seek(${from})`, 60000);
    await page.eval('new Promise(r => setTimeout(r, 1500))');
    const r = await page.eval(`(async () => { const m = window.__motion; const t0 = ${from}; let n = 0; const a = performance.now(); await new Promise((res) => { const c = () => { n++; m.seek(t0 + n / 30); if (performance.now() - a < 1500) requestAnimationFrame(c); else res(); }; requestAnimationFrame(c); }); return { fps: +(n / ((performance.now() - a) / 1000)).toFixed(1), frames: n }; })()`, 60000);
    console.log(name.padEnd(18), JSON.stringify(r));
    if (v.undo) console.log(await page.eval(v.undo));
  }
} finally { await browser.close(); }
