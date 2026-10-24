import { launch } from '../../../../scripts/lib/cdp.mjs';
import fs from 'node:fs';
const [url, file] = process.argv.slice(2);
const browser = await launch({ width: 1280, height: 720 });
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', (p) => console.log('EXC', p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  await page.goto(url, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 300000);
  page.on('Runtime.consoleAPICalled', (p) => console.log('  ·', p.args.map((a) => a.value ?? a.description).join(' ')));
  console.log(JSON.stringify(await page.eval(fs.readFileSync(file, 'utf8'), 900000), null, 1));
} finally { await browser.close(); }
