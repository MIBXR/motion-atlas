#!/usr/bin/env node
// 逐帧渲染：打开遵守 render(t) 协议的 Demo，按帧率 seek 并截图，输出帧序列；PATH 上有 ffmpeg 时自动合成 MP4。
// 用法：node scripts/render.mjs <demo 路径或 URL> [--fps 30 --w 1920 --h 1080 --from 0 --to 秒 --out renders/<名> --format png|jpeg --port 4321 --no-encode]
// 传入仓库内相对路径时，若端口上没有服务器，会临时启动 scripts/serve.mjs。
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { launch } from './lib/cdp.mjs';
import { ROOT } from './lib/catalog.mjs';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const target = args.find((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
if (!target) {
  console.error('用法：node scripts/render.mjs demos/cases/beat-lyric/index.html [--fps 30 --w 1920 --h 1080 --from 0 --to 10 --out renders/x --format png|jpeg --no-encode]');
  process.exit(1);
}
const fps = Number(get('--fps', 30)), w = Number(get('--w', 1920)), h = Number(get('--h', 1080));
const format = get('--format', 'png') === 'jpeg' || get('--format') === 'jpg' ? 'jpeg' : 'png';
const port = Number(get('--port', 4321));
const shown = (p) => { const r = path.relative(ROOT, p); return r && !r.startsWith('..') ? r : p; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let url = target, server = null;
if (!/^https?:/.test(target)) {
  const rel = path.relative(ROOT, path.resolve(target)).split(path.sep).join('/');
  if (rel.startsWith('..') || !fs.existsSync(path.join(ROOT, rel))) { console.error('找不到 Demo：' + target); process.exit(1); }
  url = `http://localhost:${port}/${rel}`;
  const up = await fetch(`http://localhost:${port}/`).then(() => true, () => false);
  if (!up) {
    server = spawn(process.execPath, [path.join(ROOT, 'scripts/serve.mjs'), '--port', String(port)], { stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await fetch(`http://localhost:${port}/`).then(() => true, () => false)); i++) await sleep(100);
  }
}
const u = new URL(url);
u.searchParams.set('render', '1');
u.searchParams.set('embed', '1');
const demoName = (u.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'render').replace(/[^\w-]/g, '');
const out = path.resolve(get('--out', path.join(ROOT, 'renders', demoName)));

const browser = await launch({ width: w, height: h });
const started = Date.now();
try {
  const page = await browser.newPage();
  await page.goto(u.href, 60000);
  await page.waitFor('window.__motion && typeof window.__motion.seek === "function"', 30000);
  const duration = await page.eval('window.__motion.pause(), window.__motion.duration');
  const from = Math.max(0, Number(get('--from', 0)));
  const to = Math.min(duration, Number(get('--to', duration)));
  const total = Math.max(1, Math.round((to - from) * fps));
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (/^frame-\d+\.(png|jpe?g)$/.test(f)) fs.rmSync(path.join(out, f));
  // 先 seek 一次预热字体与图片
  await page.eval(`window.__motion.seek(${from})`, 60000);
  await sleep(600);
  console.log(`渲染 ${u.pathname} · ${w}×${h} · ${fps}fps · ${from}s–${to.toFixed(2)}s · ${total} 帧 → ${shown(out)}`);
  const ext = format === 'png' ? 'png' : 'jpg';
  for (let i = 0; i < total; i++) {
    const t = from + i / fps;
    await page.eval(`window.__motion.seek(${t.toFixed(5)}).then(() => new Promise(r => requestAnimationFrame(() => r())))`, 60000);
    await page.screenshot(path.join(out, `frame-${String(i + 1).padStart(5, '0')}.${ext}`), { format, quality: 92 });
    if ((i + 1) % fps === 0 || i === total - 1) process.stdout.write(`\r${i + 1}/${total} 帧 · ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  process.stdout.write('\n');
  const ff = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (args.includes('--no-encode')) console.log('已跳过合成（--no-encode）。');
  else if (ff.status === 0) {
    const mp4 = `${out}.mp4`;
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(out, `frame-%05d.${ext}`), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', mp4], { stdio: 'inherit' });
    console.log(r.status === 0 ? `已合成 ${shown(mp4)}` : 'ffmpeg 合成失败，帧序列已保留。');
  } else {
    console.log(`未找到 ffmpeg：帧序列已保留。可手动合成：\nffmpeg -framerate ${fps} -i "${path.join(out, `frame-%05d.${ext}`)}" -c:v libx264 -pix_fmt yuv420p -crf 18 "${out}.mp4"`);
  }
} catch (err) {
  console.error('\n渲染失败：', err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  if (server) server.kill();
}
