import fs from 'node:fs';
import vm from 'node:vm';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync('data/resources.js', 'utf8'), ctx);
const items = ctx.window.MA_RES.videos.items;
const selected = [items.find((v) => v.title), items.find((v) => v.partial === 'part'), items.find((v) => v.partial === 'post'), items.find((v) => v.slug === 'ajith-io-615243'), items.find((v) => v.slug === '0xlangeai-178533')];
const originals = JSON.parse(fs.readFileSync('resources/opus-videos/data/videos.json', 'utf8'));
const browser = await launch({ args: ['--no-proxy-server'] });
const results = [];
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4328/resources.html#videos');
  await page.send('Browser.grantPermissions', { origin: 'http://localhost:4328', permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
  await page.send('Page.bringToFront');
  await page.eval(`(() => {
    const nativeWrite = navigator.clipboard.writeText.bind(navigator.clipboard);
    window.copySamples = [];
    navigator.clipboard.writeText = async (text) => { window.copySamples.push(text); return nativeWrite(text); };
  })()`);
  for (const item of selected) {
    await page.eval(`new Promise(resolve => { addEventListener('hashchange', () => resolve(true), { once: true }); location.hash = '#video/${item.slug}'; })`);
    await page.waitFor('document.querySelector("#doc pre code")');
    await page.send('Runtime.evaluate', { expression: 'document.querySelector("#copy-prompt").click()', userGesture: true });
    await page.waitFor('document.querySelector(".toast-msg.show")?.textContent === "已复制"');
    const { argument, copied } = await page.eval('(async () => ({ argument: copySamples.at(-1), copied: await navigator.clipboard.readText() }))()');
    const original = originals.find((v) => v.slug === item.slug).prompt;
    results.push({ slug: item.slug, partial: item.partial, argumentEqualsJSON: argument === original, strictEqual: copied === original, equalAfterCRLFToLF: copied.replace(/\r\n/g, '\n') === original, originalLength: original.length, copiedLength: copied.length, originalLF: (original.match(/\n/g) || []).length, copiedCRLF: (copied.match(/\r\n/g) || []).length });
    await page.eval('document.querySelector(".toast-msg").classList.remove("show")');
  }
  fs.writeFileSync('dev/wip/Tres/evidence/prompt-copy-boundaries.json', JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
