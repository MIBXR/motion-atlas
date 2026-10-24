import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 1440, height: 900, args: ['--no-proxy-server'] });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4328/resources.html#videos');
  await page.send('Browser.grantPermissions', { origin: 'http://localhost:4328', permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
  await page.send('Page.bringToFront');
  const result = await page.eval(String.raw`(async () => {
    const input = 'a\nb';
    const write = navigator.clipboard.writeText.bind(navigator.clipboard);
    const calls = [];
    navigator.clipboard.writeText = async (text) => {
      const call = { text, rejected: false };
      calls.push(call);
      try { return await write(text); }
      catch (e) { call.rejected = true; throw e; }
    };
    await Site.copy(input);
    const throughSite = await navigator.clipboard.readText();
    navigator.clipboard.writeText = write;
    await write(input);
    const nativeAPI = await navigator.clipboard.readText();
    await write('plain');
    const withoutNewline = await navigator.clipboard.readText();
    return { input, calls, throughSite, nativeAPI, withoutNewline, onlyCRLFChanged: nativeAPI.replace(/\r\n/g, '\n') === input };
  })()`);
  fs.writeFileSync('dev/wip/Tres/evidence/clipboard-boundaries.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
