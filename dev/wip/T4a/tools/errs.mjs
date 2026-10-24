import { launch } from '../../../../scripts/lib/cdp.mjs';
const url = process.argv[2];
const browser = await launch({ width: 1280, height: 720 });
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', (p) => console.log('EXC', p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  page.on('Runtime.consoleAPICalled', (p) => console.log(p.type, p.args.map((a) => a.value ?? a.description).join(' ')));
  await page.goto(url, 60000);
  await new Promise((r) => setTimeout(r, Number(process.argv[3] || 8000)));
  console.log('motion?', await page.eval('!!window.__motion'), await page.eval('document.documentElement.dataset.motionLoading'));
} finally { await browser.close(); }
