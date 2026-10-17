// 时间线追踪：渲染模式播放 1.5 秒，按事件名汇总主线程耗时
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [url, from = '0'] = process.argv.slice(2);
const browser = await launch({ width: 1280, height: 720 });
try {
  const page = await browser.newPage();
  await page.goto(url, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 300000);
  if (process.env.SWEEP) await page.eval('(() => { const m = window.__motion; m.pause(); for (let t = 0; t <= m.duration; t += 0.2) m.seek(t); m.seek(m.duration); return true; })()', 120000);
  else { await page.eval(`window.__motion.seek(${from})`, 60000); await page.eval('new Promise(r => setTimeout(r, 800))'); }
  if (process.env.SWEEP) await page.eval('(window.__motion.seek(0), true)');
  const events = [];
  page.on('Tracing.dataCollected', (p) => events.push(...p.value));
  const done = page.once('Tracing.tracingComplete', 60000);
  await page.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,v8,blink,gpu,cc', transferMode: 'ReportEvents' });
  await page.eval('(window.__motion.play(), new Promise(r => setTimeout(r, 1500))).then(() => (window.__motion.pause(), window.__motion.time))').then((t) => console.log('advanced to', t));
  await page.send('Tracing.end');
  await done;
  const main = events.filter((e) => e.ph === 'X' && e.dur);
  const threads = new Map();
  for (const e of events) if (e.ph === 'M' && e.name === 'thread_name') threads.set(`${e.pid}:${e.tid}`, e.args.name);
  const agg = new Map();
  for (const e of main) { const th = threads.get(`${e.pid}:${e.tid}`) || '?'; if (!/CrRendererMain|CrGpuMain|VizCompositor|DedicatedWorker/.test(th)) continue; const k = th + ' | ' + e.name; agg.set(k, (agg.get(k) || 0) + e.dur); }
  for (const [k, v] of [...agg].sort((a, b) => b[1] - a[1]).slice(0, 40)) console.log(String(Math.round(v / 1000)).padStart(6), k);
} finally { await browser.close(); }
