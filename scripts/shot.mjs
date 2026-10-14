#!/usr/bin/env node
// 单帧截图：node scripts/shot.mjs <url> --out a.png [--w 1600 --h 900] [--t 12.5 ...] [--wait 1200]
// --t 可重复：同一页面依次 seek 到多个时刻，输出 a-12.5.png 这样的文件名。
import { launch } from './lib/cdp.mjs';

const args = process.argv.slice(2);
const url = args.find((a) => /^https?:/.test(a));
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const all = (k) => args.flatMap((a, i) => (a === k ? [args[i + 1]] : []));
if (!url) { console.error('用法：node scripts/shot.mjs <url> --out file.png [--w 1600 --h 900 --t 秒 --wait 毫秒]'); process.exit(1); }

const w = Number(get('--w', 1600)), h = Number(get('--h', 900));
const out = get('--out', 'shot.png');
const wait = Number(get('--wait', 800));
const times = all('--t').map(Number);

const browser = await launch({ width: w, height: h });
try {
  const page = await browser.newPage();
  await page.goto(url);
  if (times.length) {
    await page.waitFor('window.__motion', 20000);
    await page.eval(`new Promise(r => setTimeout(r, ${Number(get('--settle', 1500))}))`);
    for (const t of times) {
      await page.eval(`window.__motion.pause && window.__motion.pause(), window.__motion.seek(${t})`);
      await page.eval(`new Promise(r => setTimeout(r, ${wait}))`);
      await page.eval(`window.__motion.seek(${t})`);
      const file = times.length > 1 ? out.replace(/(\.\w+)$/, `-${t}$1`) : out;
      await page.screenshot(file, { format: file.endsWith('.jpg') ? 'jpeg' : 'png' });
      console.log('saved', file);
    }
  } else {
    await page.eval(`new Promise(r => setTimeout(r, ${wait}))`);
    await page.screenshot(out, { format: out.endsWith('.jpg') ? 'jpeg' : 'png' });
    console.log('saved', out);
  }
} finally {
  await browser.close();
}
