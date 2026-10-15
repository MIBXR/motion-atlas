#!/usr/bin/env node
// 生成卡片预览：用无头 Edge/Chrome 打开每个 Demo，定位到 entry.previewAt 秒并截图。
//   横屏：?orient=landscape，视口 1280×720（固定画幅舞台 1920×1080 等比缩到 2/3）→ previews/<kind>/<id>.jpg
//   竖屏：?orient=portrait，视口 720×1280 → previews/<kind>/<id>-portrait.jpg（只在 Demo 使用 MotionKit.stage() 且支持竖屏时生成）
//   竖屏时刻用 entry.previewAtPortrait（缺省同 previewAt）。
// 用法：node scripts/capture.mjs [--only id1,id2] [--kind cases|patterns] [--orient both|landscape|portrait] [--base http://localhost:4321] [--w 1280 --h 720]
//        [--out <目录>（默认 previews）] [--url <页面> --t <秒>]（--url 截任意页面，例如模板；输出 <out>/misc/<目录名>.jpg）
// 需要先启动 npm start（或任意静态服务器指向仓库根目录）。
import fs from 'node:fs';
import path from 'node:path';
import { launch } from './lib/cdp.mjs';
import { ROOT, loadEntries } from './lib/catalog.mjs';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const base = get('--base', 'http://localhost:4321').replace(/\/$/, '');
const only = get('--only', '') ? new Set(get('--only').split(',')) : null;
const kind = get('--kind', 'all');
const orientArg = get('--orient', 'both');
const w = Number(get('--w', 1280)), h = Number(get('--h', 720));
const outRoot = path.resolve(ROOT, get('--out', 'previews'));
const urlArg = get('--url', null);

const { cases, patterns } = loadEntries();
const jobs = [
  ...(kind === 'patterns' ? [] : cases.map((e) => ({ e, dir: 'cases' }))),
  ...(kind === 'cases' ? [] : patterns.map((e) => ({ e, dir: 'patterns' }))),
].filter(({ e }) => !urlArg && (!only || only.has(e.id)));
if (urlArg) {
  const demo = urlArg.replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '').replace(/\?.*$/, '');
  jobs.push({ e: { id: demo.split('/').filter((x) => x && x !== 'index.html').slice(-2).join('-'), demo, previewAt: Number(get('--t', 0)) }, dir: 'misc' });
}

const browser = await launch({ width: w, height: h });
let ok = 0, portraits = 0;

async function shoot(e, dir, orient) {
  const portrait = orient === 'portrait';
  const page = await browser.newPage();
  const [vw, vh] = portrait ? [h, w] : [w, h];
  await page.viewport(vw, vh);
  const url = `${base}/${e.demo}?render=1&orient=${orient}`;
  const out = path.join(outRoot, dir, `${e.id}${portrait ? '-portrait' : ''}.jpg`);
  try {
    await page.goto(url, 45000);
    const hasMotion = await page.eval('new Promise(r => { let n = 0; const iv = setInterval(() => { if (window.__motion || ++n > 120) { clearInterval(iv); r(!!window.__motion); } }, 100); })', 20000);
    if (hasMotion) {
      await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 60000);
      const orients = await page.eval('window.__motion.orients || []');
      if (portrait && !orients.includes('portrait')) return 'skip';
      const t = (portrait ? e.previewAtPortrait : null) ?? e.previewAt ?? 0;
      await page.eval(`window.__motion.pause(), window.__motion.seek(${t})`, 30000);
      await page.eval('new Promise(r => setTimeout(r, 700))');
      await page.eval(`window.__motion.seek(${t})`, 30000);
    } else {
      if (portrait) return 'skip';
      if (e.previewScript) await page.eval(e.previewScript, 20000);
      await page.eval(`new Promise(r => setTimeout(r, ${e.previewWait ?? 1500}))`);
    }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot(out, { format: 'jpeg', quality: 82 });
    return 'ok';
  } finally {
    try { await page.send('Page.close'); } catch { /* 已关闭 */ }
  }
}

try {
  for (const { e, dir } of jobs) {
    try {
      const done = [];
      if (orientArg !== 'portrait') { await shoot(e, dir, 'landscape'); done.push('横'); }
      if (orientArg !== 'landscape' && (await shoot(e, dir, 'portrait')) === 'ok') { done.push('竖'); portraits++; }
      console.log('✓', dir, e.id, done.join(' / '));
      ok++;
    } catch (err) {
      console.error('✗', dir, e.id, err.message);
    }
  }
} finally {
  await browser.close();
}
console.log(`captured ${ok}/${jobs.length}${portraits ? ` · 竖屏预览 ${portraits}` : ''}`);
if (ok < jobs.length) process.exit(1);
