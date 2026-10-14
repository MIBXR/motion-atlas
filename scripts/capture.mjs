#!/usr/bin/env node
// 生成卡片预览：用无头 Edge/Chrome 打开每个 Demo，定位到 entry.previewAt 秒并截图。
// 用法：node scripts/capture.mjs [--only id1,id2] [--kind cases|patterns] [--base http://localhost:4321] [--w 1280 --h 720]
// 需要先启动 npm start（或任意静态服务器指向仓库根目录）。
import path from 'node:path';
import { launch } from './lib/cdp.mjs';
import { ROOT, loadEntries } from './lib/catalog.mjs';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const base = get('--base', 'http://localhost:4321').replace(/\/$/, '');
const only = get('--only', '') ? new Set(get('--only').split(',')) : null;
const kind = get('--kind', 'all');
const w = Number(get('--w', 1280)), h = Number(get('--h', 720));

const { cases, patterns } = loadEntries();
const jobs = [
  ...(kind === 'patterns' ? [] : cases.map((e) => ({ e, dir: 'cases' }))),
  ...(kind === 'cases' ? [] : patterns.map((e) => ({ e, dir: 'patterns' }))),
].filter(({ e }) => !only || only.has(e.id));

const browser = await launch({ width: w, height: h });
let ok = 0;
try {
  for (const { e, dir } of jobs) {
    const page = await browser.newPage();
    await page.viewport(w, h);
    const url = `${base}/${e.demo}?render=1`;
    const out = path.join(ROOT, 'previews', dir, `${e.id}.jpg`);
    try {
      await page.goto(url, 45000);
      const hasMotion = await page.eval('new Promise(r => { let n = 0; const iv = setInterval(() => { if (window.__motion || ++n > 120) { clearInterval(iv); r(!!window.__motion); } }, 100); })', 20000);
      if (hasMotion) {
        const t = e.previewAt ?? 0;
        await page.eval(`window.__motion.pause(), window.__motion.seek(${t})`, 30000);
        await page.eval('new Promise(r => setTimeout(r, 700))');
        await page.eval(`window.__motion.seek(${t})`, 30000);
      } else {
        if (e.previewScript) await page.eval(e.previewScript, 20000);
        await page.eval(`new Promise(r => setTimeout(r, ${e.previewWait ?? 1500}))`);
      }
      await page.screenshot(out, { format: 'jpeg', quality: 82 });
      console.log('✓', dir, e.id);
      ok++;
    } catch (err) {
      console.error('✗', dir, e.id, err.message);
    }
    try { await page.send('Page.close'); } catch { /* 已关闭 */ }
  }
} finally {
  await browser.close();
}
console.log(`captured ${ok}/${jobs.length}`);
if (ok < jobs.length) process.exit(1);
