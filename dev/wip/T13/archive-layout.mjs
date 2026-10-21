import fs from 'node:fs';
import assert from 'node:assert/strict';
import { launch } from '../../../scripts/lib/cdp.mjs';

const label = process.argv[2] || 'final';
const out = `dev/shots/T13/archive-${label}`;
fs.mkdirSync(out, { recursive: true });
const result = { records: [], errors: [] };
const browser = await launch({ width: 1080, height: 1920 });
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', (e) => result.errors.push(e.exceptionDetails?.text));
  await page.goto('http://localhost:4321/demos/cases/archive-os/index.html?render=1&embed=1&orient=portrait');
  await page.waitFor('window.__motion');
  await page.eval('window.__motion.ready');
  if (label === 'before') await page.eval('document.querySelector("#abstract").style.textWrap = "wrap"');
  await page.eval('window.__motion.seek(39.22)');
  await page.screenshot(`${out}/P-39.22.png`);
  await page.eval('window.__originalEvents = CONFIG.events.slice()');
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 8; row++) {
      await page.eval(`(() => {
        const keys = [...Array(${col}).fill('ArrowRight'), ...Array(${row}).fill('ArrowDown')];
        CONFIG.events.splice(0, CONFIG.events.length, ...keys.map((key, i) => ({ t: 22 + i * .01, key })));
        return window.__motion.seek(24);
      })()`);
      const record = await page.eval(`(() => {
        const el = document.querySelector('#abstract'), node = el.firstChild, lines = [];
        for (let i = 0; i < node.length; i++) {
          const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
          const rect = range.getBoundingClientRect();
          let line = lines.find((entry) => Math.abs(entry.top - rect.top) < .5);
          if (!line) { line = { top: rect.top, bottom: rect.bottom, text: '', left: rect.left, right: rect.right }; lines.push(line); }
          line.text += node.textContent[i]; line.right = Math.max(line.right, rect.right);
        }
        const rect = el.getBoundingClientRect(), next = document.querySelector('#metrics').getBoundingClientRect();
        return {
          id: document.querySelector('#stage').dataset.record, text: el.textContent, lines,
          wrap: getComputedStyle(el).textWrap, fontSize: getComputedStyle(el).fontSize,
          width: rect.width, height: rect.height, bottom: rect.bottom, nextTop: next.top,
          sourceSentence: CONFIG.files[${col}][${row}].abstract.split('。')[0] + '。',
          overflow: lines.some((line) => line.left < rect.left - .5 || line.right > rect.right + .5 || line.bottom > next.top),
        };
      })()`);
      record.orphan = record.lines.length > 1 && record.lines.at(-1).text.replace(/[\p{P}\p{Z}]/gu, '').length <= 2;
      result.records.push(record);
      const shot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 64, y: 1374, width: 952, height: 88, scale: 1 } });
      fs.writeFileSync(`${out}/${record.id}.png`, Buffer.from(shot.data, 'base64'));
    }
  }
  await page.eval('CONFIG.events.splice(0, CONFIG.events.length, ...window.__originalEvents); window.__motion.seek(39.22)');
  result.count = result.records.length;
  result.orphans = result.records.filter((r) => r.orphan).map((r) => r.id);
  result.overflows = result.records.filter((r) => r.overflow || r.bottom > r.nextTop).map((r) => r.id);
  assert.equal(new Set(result.records.map((r) => r.id)).size, 40);
  for (const record of result.records) {
    assert.equal(record.text, record.sourceSentence);
    assert.ok(record.lines.length <= 2, `${record.id}: more than two lines`);
    assert.equal(record.fontSize, '36px');
  }
  assert.equal(result.errors.length, 0);
  if (label === 'final') {
    assert.equal(result.orphans.length, 0, `Orphans: ${result.orphans.join(', ')}`);
    assert.equal(result.overflows.length, 0, `Overflow: ${result.overflows.join(', ')}`);
  }
  fs.writeFileSync(`${out}/contact.html`, `<meta charset="UTF-8"><title>档案摘要 ${label}</title><style>body{margin:16px;background:#f2f0ea;font:14px sans-serif}h1{font-size:20px}.grid{display:grid;grid-template-columns:repeat(2,476px);gap:8px 16px}.item{height:64px}img{display:block;width:476px;height:44px}</style><h1>竖屏摘要 ${label} · 40 份实际 DOM 截图</h1><div class="grid">${result.records.map((r) => `<div class="item"><span>${r.id} · ${r.lines.map((line) => line.text.length).join(' / ')} 字</span><img src="${r.id}.png"></div>`).join('')}</div>`);
  await page.viewport(1024, 1550);
  await page.goto(`http://localhost:4321/${out}/contact.html`);
  await page.eval('Promise.all([...document.images].map((image) => image.decode()))');
  await page.screenshot(`${out}/contact.png`);
  result.passed = true;
} catch (error) { result.failure = error.stack; process.exitCode = 1; }
finally {
  await browser.close();
  fs.writeFileSync(`${out}/layout.json`, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ ...result, records: result.records.map((r) => ({ id: r.id, lines: r.lines.map((line) => line.text), orphan: r.orphan })) }, null, 2));
}
