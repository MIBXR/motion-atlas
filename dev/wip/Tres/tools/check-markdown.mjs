import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const context = { window: { Site: {} } };
vm.runInNewContext(fs.readFileSync('data/docs.js', 'utf8'), context);
const escLine = fs.readFileSync('assets/site.js', 'utf8').split('\n').find((line) => line.includes('const esc ='));
vm.runInNewContext(escLine + '\nwindow.Site.esc = esc;', context);
vm.runInNewContext(fs.readFileSync('assets/markdown.js', 'utf8'), context);
const original = execFileSync('git', ['show', 'HEAD:assets/docs.js'], { encoding: 'utf8' });
const body = original.slice(original.indexOf('  // ---------- 路径 ----------'), original.indexOf('  // ---------- 目录 ----------'));
vm.runInNewContext(`(() => { const { esc } = window.Site; const byPath = new Map(window.MA_DOCS.map(d => [d.path, d])); ${body} window.originalRender = render; })()`, context);
for (const doc of context.window.MA_DOCS) {
  const oldHeads = [], newHeads = [];
  assert.equal(context.window.MAMarkdown.render(doc.content, doc.path, newHeads), context.window.originalRender(doc.content, doc.path, oldHeads), doc.path);
  assert.deepEqual(newHeads, oldHeads, doc.path);
}
const calls = [];
const rendered = context.window.MAMarkdown.render('[文档](references/a.md) <https://example.org> ![图](assets/a.png)', 'resources/skills/test/SKILL.md', [], {
  link(resolved, raw) { calls.push({ resolved, raw }); return resolved; },
});
assert.deepEqual(calls, [
  { resolved: 'https://example.org', raw: 'https://example.org' },
  { resolved: 'resources/skills/test/references/a.md', raw: 'references/a.md' },
]);
assert.ok(rendered.includes('src="resources/skills/test/assets/a.png"'));
const result = { documentsIdentical: context.window.MA_DOCS.length, linkCallback: calls, imagePathUnchanged: true };
fs.writeFileSync('dev/wip/Tres/evidence/markdown-default.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
