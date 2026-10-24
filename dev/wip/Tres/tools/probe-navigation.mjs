import fs from 'node:fs';
import assert from 'node:assert/strict';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 390, height: 844, args: ['--no-proxy-server'] });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4328/resources.html#videos?cat=3d&sort=author');
  await page.waitFor('document.querySelectorAll("#grid .card").length === 48');
  await page.eval('document.querySelector(".res-more button").click()');
  await page.eval('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
  await page.eval('scrollTo({ top: 620, behavior: "instant" })');
  const before = await page.eval('({ hash: location.hash, scroll: scrollY, cards: document.querySelectorAll("#grid .card").length, detail: document.querySelector("#grid .card a").getAttribute("href") })');
  await page.eval(`new Promise(r => { addEventListener('hashchange', () => r(true), { once: true }); location.hash = ${JSON.stringify(before.detail)}; })`);
  await page.waitFor('document.querySelector("#doc h2")');
  await page.eval('document.querySelector(".res-back").click()');
  await page.waitFor('document.querySelectorAll("#grid .card").length === 96');
  await page.eval('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
  const after = await page.eval('({ hash: location.hash, scroll: scrollY, cards: document.querySelectorAll("#grid .card").length })');
  const result = { before, after, ok: before.scroll === 620 && after.scroll === before.scroll && after.hash === before.hash && after.cards === before.cards };
  fs.writeFileSync('dev/wip/Tres/evidence/navigation-restoration.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  assert.ok(result.ok);
} finally { await browser.close(); }
