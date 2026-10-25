/* Motion Atlas · 文档中心：读取 window.MA_DOCS，渲染 Markdown；地址形如 docs.html#doc/docs/guide.md */
(function () {
  'use strict';
  const { esc, ICONS, copy } = window.Site;
  const DOCS = window.MA_DOCS || [];
  const byPath = new Map(DOCS.map((d) => [d.path, d]));
  const $ = (s) => document.querySelector(s);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const DEFAULT = byPath.has('docs/guide.md') ? 'docs/guide.md' : (DOCS[0] && DOCS[0].path);

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
  function inline(s, base) {
    return s.split(/(`[^`]+`)/).map((part) => {
      if (/^`[^`]+`$/.test(part)) return `<code>${esc(part.slice(1, -1))}</code>`;
      let h = esc(part);
      h = h.replace(/&lt;(https?:\/\/[^\s&]+(?:&amp;[^\s&]+)*)&gt;/g, (_, u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
      h = h.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${esc(linkFor(base, src).href)}" alt="${alt}" loading="lazy">`);
      h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
        const l = linkFor(base, href.replace(/&amp;/g, '&'));
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

  function parseList(lines, i, base) {
    const first = lines[i].match(RE.list), indent = first[1].length, ordered = /\d/.test(first[2]);
    const items = [];
    while (i < lines.length) {
      const m = lines[i].match(RE.list);
      if (m && m[1].length === indent) { items.push({ text: m[3], sub: '' }); i++; continue; }
      if (m && m[1].length > indent && items.length) { const r = parseList(lines, i, base); items[items.length - 1].sub += r.html; i = r.i; continue; }
      if (!m && lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) { items[items.length - 1].text += ' ' + lines[i].trim(); i++; continue; }
      break;
    }
    const tag = ordered ? 'ol' : 'ul';
    return { html: `<${tag}>${items.map((it) => `<li>${inline(it.text, base)}${it.sub}</li>`).join('')}</${tag}>`, i };
  }

  function render(md, base, heads) {
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
        out.push(`<h${lv} id="${esc(id)}">${inline(text, base)}</h${lv}>`);
        i++;
      } else if (RE.hr.test(l)) { out.push('<hr>'); i++; }
      else if (l.includes('|') && lines[i + 1] != null && RE.tableSep.test(lines[i + 1])) {
        const head = cells(l);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(cells(lines[i++]));
        out.push(`<div class="tbl"><table><thead><tr>${head.map((c) => `<th>${inline(c, base)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, base)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      } else if (RE.list.test(l)) {
        const r = parseList(lines, i, base);
        out.push(r.html); i = r.i;
      } else if (RE.quote.test(l)) {
        const buf = [];
        while (i < lines.length && RE.quote.test(lines[i])) buf.push(lines[i++].match(RE.quote)[1]);
        out.push(`<blockquote>${render(buf.join('\n'), base, [])}</blockquote>`);
      } else {
        const buf = [l.trim()];
        i++;
        while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], lines[i + 1])) buf.push(lines[i++].trim());
        out.push(`<p>${inline(buf.join(' '), base)}</p>`);
      }
    }
    return out.join('\n');
  }

  // ---------- 目录 ----------
  const groups = [];
  for (const d of DOCS) {
    let g = groups.find((x) => x.name === d.group);
    if (!g) groups.push((g = { name: d.group, docs: [] }));
    g.docs.push(d);
  }
  function drawNav(q = '') {
    const k = q.trim().toLowerCase();
    $('#docNav').innerHTML = groups.map((g) => {
      const list = g.docs.filter((d) => !k || d.title.toLowerCase().includes(k));
      return list.length ? `<div class="side-group"><h2>${esc(g.name)}</h2><ul class="side-list">${list.map((d) => `<li><a href="#doc/${esc(d.path)}" data-p="${esc(d.path)}">${esc(d.title)}</a></li>`).join('')}</ul></div>` : '';
    }).join('') || '<p class="doc-empty">没有匹配的文档</p>';
    markNav();
  }
  let current = null;
  function markNav() {
    document.querySelectorAll('#docNav a').forEach((a) => (a.dataset.p === current ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  }
  const side = $('#doc-side');
  const tog = $('.side-toggle');
  $('#doc-search-icon').outerHTML = ICONS.search;
  tog.innerHTML = `${ICONS.menu}全部文档（${DOCS.length}）`;
  tog.addEventListener('click', () => { const o = side.classList.toggle('open'); tog.setAttribute('aria-expanded', String(o)); });
  $('#docQ').addEventListener('input', (e) => drawNav(e.target.value));

  // ---------- 打开文档 ----------
  let spy = null;
  function open() {
    const raw = decodeURIComponent(location.hash.replace(/^#doc\//, ''));
    const [p, frag] = raw.split('::');
    const path = byPath.has(p) ? p : DEFAULT;
    const d = byPath.get(path);
    const art = $('#doc');
    if (!d) { art.innerHTML = '<p class="doc-empty">还没有文档。</p>'; return; }
    const heads = [];
    const body = render(d.content, d.path, heads);
    const isMd = /\.md$/.test(d.path);
    art.innerHTML = `<div class="doc-path"><span>${esc(d.group)} / ${esc(d.path)}</span>${isMd && !d.path.startsWith('prompts/') ? `<a href="${esc(d.path)}">原始 Markdown</a>` : ''}</div>${body}`;
    art.querySelectorAll('pre').forEach((pre) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.innerHTML = `${ICONS.copy}复制`;
      b.addEventListener('click', () => copy(pre.querySelector('code').textContent));
      pre.appendChild(b);
    });
    document.title = `${d.title} · Motion Atlas`;
    current = path; markNav();
    side.classList.remove('open'); tog.setAttribute('aria-expanded', 'false');
    const toc = heads.filter((h) => h.lv === 2 || h.lv === 3);
    $('#toc').innerHTML = toc.map((h) => `<a href="#doc/${esc(path)}::${esc(h.id)}" data-id="${esc(h.id)}"${h.lv === 3 ? ' class="sub"' : ''}>${esc(h.text)}</a>`).join('');
    const target = frag && document.getElementById(frag);
    // 内容写入后再滚动；instant 绕过全局 smooth（滚动恢复已设为 manual）
    setTimeout(() => {
      if (target) target.scrollIntoView({ behavior: 'instant' });
      else if (!frag) scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
    if (spy) spy.disconnect();
    if ('IntersectionObserver' in window && toc.length) {
      spy = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) document.querySelectorAll('#toc a').forEach((a) => a.classList.toggle('on', a.dataset.id === e.target.id));
      }, { rootMargin: '-80px 0px -70% 0px' });
      toc.forEach((h) => { const el = document.getElementById(h.id); if (el) spy.observe(el); });
    }
  }
  addEventListener('hashchange', () => { open(); if (!$('#docQ').value) drawNav(); });
  open();
  drawNav();
})();
