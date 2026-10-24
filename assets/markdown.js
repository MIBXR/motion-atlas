/* Motion Atlas · 共享 Markdown 渲染器 */
(function () {
  'use strict';
  const { esc } = window.Site;
  const byPath = new Map((window.MA_DOCS || []).map((d) => [d.path, d]));

  // ---------- 路径 ----------
  function resolve(base, href) {
    const parts = base.split('/').slice(0, -1);
    for (const seg of href.split('/')) {
      if (seg === '..') parts.pop();
      else if (seg && seg !== '.') parts.push(seg);
    }
    return parts.join('/');
  }
  function linkFor(base, href) {
    if (/^(https?:|mailto:)/.test(href)) return { href, ext: true };
    if (href.startsWith('#')) return { href: `#doc/${base}${href.length > 1 ? '::' + href.slice(1) : ''}` };
    const [p, frag] = href.split('#');
    const target = p.startsWith('/') ? p.slice(1) : resolve(base, p);
    if (byPath.has(target)) return { href: `#doc/${target}${frag ? '::' + frag : ''}` };
    return { href: target + (frag ? '#' + frag : '') };
  }

  // ---------- 行内 ----------
  function inline(s, base, opts) {
    return s.split(/(`[^`]+`)/).map((part) => {
      if (/^`[^`]+`$/.test(part)) return `<code>${esc(part.slice(1, -1))}</code>`;
      let h = esc(part);
      h = h.replace(/&lt;(https?:\/\/[^\s&]+(?:&amp;[^\s&]+)*)&gt;/g, (_, u) => {
        const raw = u.replace(/&amp;/g, '&');
        return `<a href="${opts && opts.link ? esc(opts.link(raw, raw)) : u}" target="_blank" rel="noopener">${u}</a>`;
      });
      h = h.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${esc(linkFor(base, src).href)}" alt="${alt}" loading="lazy">`);
      h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
        const raw = href.replace(/&amp;/g, '&');
        const l = linkFor(base, raw);
        if (opts && opts.link) {
          const resolved = /^(https?:|mailto:)/.test(raw) ? raw : raw.startsWith('#') ? base + raw : raw.startsWith('/') ? raw.slice(1) : resolve(base, raw);
          l.href = opts.link(resolved, raw);
        }
        return `<a href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
      });
      h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      h = h.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
      h = h.replace(/~~([^~]+)~~/g, '<del>$1</del>');
      return h;
    }).join('');
  }

  // ---------- 块级 ----------
  const RE = {
    fence: /^\s*```(\S*)\s*$/, heading: /^(#{1,4})\s+(.*)$/, hr: /^\s*(-{3,}|\*{3,})\s*$/,
    list: /^(\s*)([-*+]|\d+\.)\s+(.*)$/, quote: /^\s*>\s?(.*)$/, tableSep: /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/,
  };
  const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

  function parseList(lines, i, base, opts) {
    const first = lines[i].match(RE.list), indent = first[1].length, ordered = /\d/.test(first[2]);
    const items = [];
    while (i < lines.length) {
      const m = lines[i].match(RE.list);
      if (m && m[1].length === indent) { items.push({ text: m[3], sub: '' }); i++; continue; }
      if (m && m[1].length > indent && items.length) { const r = parseList(lines, i, base, opts); items[items.length - 1].sub += r.html; i = r.i; continue; }
      if (!m && lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) { items[items.length - 1].text += ' ' + lines[i].trim(); i++; continue; }
      break;
    }
    const tag = ordered ? 'ol' : 'ul';
    return { html: `<${tag}>${items.map((it) => `<li>${inline(it.text, base, opts)}${it.sub}</li>`).join('')}</${tag}>`, i };
  }

  function render(md, base, heads, opts) {
    const lines = md.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '').split('\n');
    const out = [];
    let i = 0;
    const startsBlock = (l, next) => RE.fence.test(l) || RE.heading.test(l) || RE.hr.test(l) || RE.list.test(l) || RE.quote.test(l) || (l.includes('|') && next != null && RE.tableSep.test(next));
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { i++; continue; }
      let m;
      if ((m = l.match(RE.fence))) {
        const buf = [];
        i++;
        while (i < lines.length && !RE.fence.test(lines[i])) buf.push(lines[i++]);
        i++;
        out.push(`<pre><code${m[1] ? ` data-lang="${esc(m[1])}"` : ''}>${esc(buf.join('\n'))}</code></pre>`);
      } else if ((m = l.match(RE.heading))) {
        const lv = m[1].length, text = m[2].trim();
        let id = text.toLowerCase().replace(/<[^>]+>|[`*_[\]()]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || `h-${heads.length}`;
        while (heads.some((h) => h.id === id)) id += '-1';
        heads.push({ lv, id, text: text.replace(/[`*]/g, '') });
        out.push(`<h${lv} id="${esc(id)}">${inline(text, base, opts)}</h${lv}>`);
        i++;
      } else if (RE.hr.test(l)) { out.push('<hr>'); i++; }
      else if (l.includes('|') && lines[i + 1] != null && RE.tableSep.test(lines[i + 1])) {
        const head = cells(l);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(cells(lines[i++]));
        out.push(`<div class="tbl"><table><thead><tr>${head.map((c) => `<th>${inline(c, base, opts)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, base, opts)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      } else if (RE.list.test(l)) {
        const r = parseList(lines, i, base, opts);
        out.push(r.html); i = r.i;
      } else if (RE.quote.test(l)) {
        const buf = [];
        while (i < lines.length && RE.quote.test(lines[i])) buf.push(lines[i++].match(RE.quote)[1]);
        out.push(`<blockquote>${render(buf.join('\n'), base, [], opts)}</blockquote>`);
      } else {
        const buf = [l.trim()];
        i++;
        while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], lines[i + 1])) buf.push(lines[i++].trim());
        out.push(`<p>${inline(buf.join(' '), base, opts)}</p>`);
      }
    }
    return out.join('\n');
  }

  window.MAMarkdown = { render, resolve };
})();
