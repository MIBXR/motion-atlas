import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const roots = [
  ['resources/skills/garden-skills', '../../dev/shots/Tnew/refs/3-garden-skills'],
  ['resources/skills/agent-anime-skill', '../../dev/shots/Tnew/refs/4-agent-anime-skill'],
];
const context = { window: { Site: {} } };
const escLine = fs.readFileSync('assets/site.js', 'utf8').split('\n').find((line) => line.includes('const esc ='));
vm.runInNewContext(escLine + '\nwindow.Site.esc = esc;', context);
vm.runInNewContext(fs.readFileSync('assets/markdown.js', 'utf8'), context);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const missing = new Map();
let documents = 0;
for (const [publicRoot, sourceRoot] of roots) {
  for (const skill of fs.readdirSync(path.join(sourceRoot, 'skills'))) {
    const dir = path.join(sourceRoot, 'skills', skill), publicDir = `${publicRoot}/skills/${skill}`;
    if (!fs.existsSync(path.join(dir, 'SKILL.md'))) continue;
    for (const file of walk(dir).filter((p) => /\.md$/i.test(p))) {
      const base = `${publicDir}/${path.relative(dir, file).split(path.sep).join('/')}`;
      const html = context.window.MAMarkdown.render(fs.readFileSync(file, 'utf8'), base, [], { link: (resolved) => resolved });
      documents++;
      for (const [, escaped] of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
        const raw = escaped.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
        const url = new URL(raw, 'http://localhost:4328/resources.html');
        if (url.origin !== 'http://localhost:4328') continue;
        const target = decodeURIComponent(url.pathname.slice(1));
        const mapping = roots.find(([p]) => target.startsWith(p + '/'));
        let disk = mapping ? path.join(mapping[1], target.slice(mapping[0].length + 1)) : target;
        if (fs.existsSync(disk) && fs.statSync(disk).isDirectory()) disk = path.join(disk, 'index.html');
        if (!fs.existsSync(disk)) {
          if (!missing.has(target)) missing.set(target, []);
          missing.get(target).push({ source: base, href: raw });
        }
      }
    }
  }
}
const result = { documents, missing: [...missing].map(([target, sources]) => ({ target, sources })) };
fs.writeFileSync('dev/wip/Tres/evidence/preflight-links.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ documents, missing: result.missing.map((m) => ({ target: m.target, references: m.sources.length })) }, null, 2));
