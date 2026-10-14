#!/usr/bin/env node
// 浏览器冒烟测试：逐个打开 Demo，按 0.2 秒步长 seek 全时间轴，再实际播放 1.5 秒，
// 收集未捕获异常与 console.error。需要先启动 npm start。
// 用法：node scripts/smoke.mjs [--only id1,id2] [--base http://localhost:4321] [--w 1280 --h 720] [--step 0.2]
import { launch } from './lib/cdp.mjs';
import { loadEntries } from './lib/catalog.mjs';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const base = get('--base', 'http://localhost:4321').replace(/\/$/, '');
const only = get('--only', '') ? new Set(get('--only').split(',')) : null;
const w = Number(get('--w', 1280)), h = Number(get('--h', 720));
const step = Number(get('--step', 0.2));

const { cases, patterns } = loadEntries();
const jobs = [...cases, ...patterns].filter((e) => !only || only.has(e.id));
const browser = await launch({ width: w, height: h });
const failures = [];
try {
  for (const e of jobs) {
    const page = await browser.newPage();
    await page.viewport(w, h);
    const errors = [];
    page.on('Runtime.exceptionThrown', (p) => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
    page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') errors.push(p.args.map((a) => a.value ?? a.description).join(' ')); });
    let note = '';
    try {
      await page.goto(`${base}/${e.demo}?render=1`, 45000);
      const hasMotion = await page.eval('new Promise(r => { let n = 0; const iv = setInterval(() => { if (window.__motion || ++n > 150) { clearInterval(iv); r(!!window.__motion); } }, 100); })', 25000);
      if (hasMotion) {
        const D = await page.eval('window.__motion.duration');
        await page.eval(`(() => { const m = window.__motion; m.pause(); for (let t = 0; t <= ${D}; t += ${step}) m.seek(t); m.seek(${D}); return true; })()`, 60000);
        const t0 = await page.eval('(window.__motion.seek(0), window.__motion.play(), window.__motion.time)');
        await page.eval('new Promise(r => setTimeout(r, 1500))');
        const t1 = await page.eval('window.__motion.time');
        if (!(t1 > t0 + 0.5)) errors.push(`播放 1.5 秒后时间只从 ${t0} 走到 ${t1}`);
        note = `seek 0–${D}s`;
      } else {
        await page.eval('new Promise(r => setTimeout(r, 1500))');
        note = 'interactive';
      }
    } catch (err) {
      errors.push(err.message);
    }
    if (errors.length) failures.push({ id: e.id, errors });
    console.log(errors.length ? '✗' : '✓', e.id, note, errors.length ? `\n    ${[...new Set(errors)].slice(0, 3).join('\n    ')}` : '');
    try { await page.send('Page.close'); } catch { /* 已关闭 */ }
  }
} finally {
  await browser.close();
}
console.log(`smoke ${jobs.length - failures.length}/${jobs.length} passed`);
if (failures.length) process.exit(1);
