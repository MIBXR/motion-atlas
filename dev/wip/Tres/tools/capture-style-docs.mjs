import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 1440, height: 900, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--no-proxy-server'] });
const results = [];
try {
  const page = await browser.newPage();
  for (const [doc, name] of [['DEMO.md', 'demo'], ['demo/CREDITS', 'credits']]) {
    const hash = `#style/swiss-motion/${doc}`, file = `dev/shots/Tres/1440-style-swiss-${name}.png`;
    if (!results.length) await page.goto(`http://localhost:4328/resources.html${hash}`);
    else await page.eval(`location.hash = ${JSON.stringify(hash)}`);
    await page.waitFor(`document.querySelector('.doc-path')?.textContent.includes(${JSON.stringify(doc)})`);
    await page.waitFor('document.querySelector(".style-player")?.dataset.ready === "true"', 195000);
    await page.eval('document.fonts.ready.then(() => true)');
    await page.eval('scrollTo({ top: scrollY + document.querySelector(".style-docs").getBoundingClientRect().top - document.querySelector("#site-header").getBoundingClientRect().height - 16, behavior: "instant" })');
    await page.eval('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
    await page.screenshot(file);
    results.push({ hash, file, scrollY: await page.eval('scrollY'), docPath: await page.eval('document.querySelector(".doc-path").textContent') });
    console.log(`document screenshot ${file}`);
  }
} finally {
  fs.writeFileSync('dev/wip/Tres/evidence/doc-screenshots.json', JSON.stringify(results, null, 2) + '\n');
  await browser.close();
}
