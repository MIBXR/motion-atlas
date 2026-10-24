import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('需要 before 或 after');
const browser = await launch({ width: 1440, height: 900, args: ['--no-proxy-server'] });
try {
  const page = await browser.newPage();
  for (const [name, doc] of [['guide', 'docs/guide.md'], ['pipeline', 'docs/pipeline.md'], ['archive-os', 'prompts/cases/archive-os.md']]) {
    await page.goto(`http://localhost:4328/docs.html?capture=${name}#doc/${doc}`);
    await page.waitFor('document.querySelector("#doc h1")');
    await page.eval('document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))');
    await page.screenshot(`dev/shots/Tres/docs-${phase}-${name}.png`);
    fs.mkdirSync('dev/wip/Tres/evidence', { recursive: true });
    fs.writeFileSync(`dev/wip/Tres/evidence/docs-${phase}-${name}.html`, await page.eval('document.querySelector("#doc").innerHTML'));
    console.log(`${phase} ${doc} · 1440×900`);
  }
} finally { await browser.close(); }
