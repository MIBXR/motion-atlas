// 打开页面并实时打印 console（带秒数），用于观察预取各阶段耗时
import { launch } from '../../../../scripts/lib/cdp.mjs';
const url = process.argv[2], wait = Number(process.argv[3] || 120);
const browser = await launch({ width: 1280, height: 720 });
const t0 = Date.now();
const ts = () => ((Date.now() - t0) / 1000).toFixed(1).padStart(6);
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', (p) => console.log(ts(), 'EXC', p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  page.on('Runtime.consoleAPICalled', (p) => console.log(ts(), p.type, p.args.map((a) => a.value ?? a.description).join(' ')));
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__scanDbg = true' });
  await page.goto(url, 60000);
  const end = Date.now() + wait * 1000;
  let last = '';
  while (Date.now() < end) {
    const st = await page.eval('document.documentElement.dataset.motionLoading + " ready=" + (document.documentElement.dataset.motionReady || 0)').catch(() => '?');
    if (st !== last) { console.log(ts(), 'loading', st); last = st; }
    if (/ready=1/.test(st)) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
} finally { await browser.close(); }
