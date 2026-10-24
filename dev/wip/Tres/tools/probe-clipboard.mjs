import fs from 'node:fs';
import assert from 'node:assert/strict';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 1440, height: 900, args: ['--no-proxy-server'] });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4328/resources.html#videos');
  await page.send('Browser.grantPermissions', { origin: 'http://localhost:4328', permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
  await page.send('Page.bringToFront');
  const result = await page.eval(String.raw`(async () => {
    const expected = 'a\nb';
    await Site.copy(expected);
    const actual = await navigator.clipboard.readText();
    return { expected, actual, strictEqual: expected === actual };
  })()`);
  fs.writeFileSync('dev/wip/Tres/evidence/clipboard-minimal.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  assert.ok(result.strictEqual, 'Site.copy 最小换行回读与原文不相等');
} finally { await browser.close(); }
