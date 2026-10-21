// 站点详情页里 Demo 的加载遮罩与缓冲状态随时间的变化（排查“缓冲开头 20%”遮罩不消失）
import { launch } from '../../../../scripts/lib/cdp.mjs';
const url = process.argv[2] || 'http://localhost:4321/cases.html#case/map-pilgrimage';
const browser = await launch({ width: 1440, height: 900 });
const F = `document.getElementById('demo-frame')`;
try {
  const page = await browser.newPage();
  const log = [];
  page.on('Runtime.consoleAPICalled', (p) => log.push(p.type + ' ' + p.args.map((a) => a.value ?? a.description).join(' ').slice(0, 160)));
  const t0 = Date.now();
  await page.goto(url, 60000);
  for (let i = 0; i < 45; i++) {
    const s = await page.eval(`(() => { const f = ${F}; const w = f && f.contentWindow; if (!w || !w.__motion) return null; const ld = w.document.querySelector('.loading'); const b = w.__buffer; return { href: w.location.search, t: +w.__motion.time.toFixed(2), playing: w.__motion.playing, overlay: ld ? ld.className + ' ' + ld.textContent.trim().slice(0, 30) : null, readyMs: b && b.readyMs, until: b && b.bufferedUntil, stalled: b && b.stalled, states: w.__bufDebug && JSON.stringify(w.__bufDebug.states()) }; })()`);
    console.log(((Date.now() - t0) / 1000).toFixed(1), JSON.stringify(s));
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(log.filter((l) => /地图巡礼|MotionKit|error|warn/.test(l)).slice(0, 20).join('\n'));
} finally { await browser.close(); }
