import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 1440, height: 900 });
try {
  const page = await browser.newPage();
  await page.goto((process.argv[2] || 'http://localhost:4326') + '/docs.html');
  await page.waitFor('document.querySelector("#doc h1")');
  await page.eval('document.fonts.ready');
  await page.screenshot('dev/shots/Tcopy/docs-before.png');
  console.log('baseline docs screenshot saved');
} finally {
  await browser.close();
}
