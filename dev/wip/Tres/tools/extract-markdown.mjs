import fs from 'node:fs';

const source = fs.readFileSync('assets/docs.js', 'utf8').replace(/\r\n/g, '\n');
const start = source.indexOf('  // ---------- 路径 ----------');
const end = source.indexOf('  // ---------- 目录 ----------');
let shared = source.slice(start, end);
shared = shared.replace('inline(s, base)', 'inline(s, base, opts)')
  .replaceAll('parseList(lines, i, base)', 'parseList(lines, i, base, opts)')
  .replaceAll('inline(it.text, base)', 'inline(it.text, base, opts)')
  .replace('render(md, base, heads)', 'render(md, base, heads, opts)')
  .replaceAll('inline(text, base)', 'inline(text, base, opts)')
  .replaceAll('inline(c, base)', 'inline(c, base, opts)')
  .replace("render(buf.join('\\n'), base, [])", "render(buf.join('\\n'), base, [], opts)")
  .replace("inline(buf.join(' '), base)", "inline(buf.join(' '), base, opts)")
  .replace("        const l = linkFor(base, href.replace(/&amp;/g, '&'));", `        const raw = href.replace(/&amp;/g, '&');
        const l = linkFor(base, raw);
        if (opts && opts.link) {
          const resolved = /^(https?:|mailto:)/.test(raw) ? raw : raw.startsWith('#') ? base + raw : raw.startsWith('/') ? raw.slice(1) : resolve(base, raw);
          l.href = opts.link(resolved, raw);
        }`);
fs.writeFileSync('assets/markdown.js', `/* Motion Atlas · 共享 Markdown 渲染器 */
(function () {
  'use strict';
  const { esc } = window.Site;
  const byPath = new Map((window.MA_DOCS || []).map((d) => [d.path, d]));

${shared}  window.MAMarkdown = { render, resolve };
})();
`);
fs.writeFileSync('assets/docs.js', source.slice(0, start) + '  const { render, resolve } = window.MAMarkdown;\n\n' + source.slice(end));
const html = fs.readFileSync('docs.html', 'utf8').replace(/\r\n/g, '\n');
fs.writeFileSync('docs.html', html.replace('  <script src="assets/docs.js"></script>', '  <script src="assets/markdown.js"></script>\n  <script src="assets/docs.js"></script>'));
