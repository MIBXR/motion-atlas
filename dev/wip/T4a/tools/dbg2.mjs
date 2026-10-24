// 不等 ready：打开页面后直接执行脚本（排查卡在加载中的问题）
import { launch } from '../../../../scripts/lib/cdp.mjs';
import fs from 'node:fs';
const [url, file, wait = '3000'] = process.argv.slice(2);
const browser = await launch({ width: 1280, height: 720 });
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', (p) => console.log('EXC', p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  page.on('Runtime.consoleAPICalled', (p) => console.log('  ·', p.type, p.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300)));
  await page.goto(url, 60000);
  await new Promise((r) => setTimeout(r, Number(wait)));
  console.log(JSON.stringify(await page.eval(fs.readFileSync(file, 'utf8'), 600000), null, 1));
} finally { await browser.close(); }
