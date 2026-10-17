// 渲染模式下播放 1.5 秒前进多少（可先执行一段脚本隐藏某些图层，对比合成开销）
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [url, from = '0', pre = ''] = process.argv.slice(2);
const browser = await launch({ width: 1280, height: 720 });
try {
  const page = await browser.newPage();
  await page.goto(url, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 300000);
  if (pre) await page.eval(pre);
  for (const t of from.split(',')) {
    await page.eval(`window.__motion.seek(${t})`, 60000);
    await page.eval('new Promise(r => setTimeout(r, 800))');
    const r = await page.eval(`(async () => { const m = window.__motion; const t0 = m.time; let n = 0; const c = () => { n++; if (m.playing) requestAnimationFrame(c); }; m.play(); requestAnimationFrame(c); await new Promise(r => setTimeout(r, 1500)); m.pause(); return { t0, adv: +(m.time - t0).toFixed(2), frames: n }; })()`, 60000);
    console.log(t, JSON.stringify(r));
  }
} finally { await browser.close(); }
