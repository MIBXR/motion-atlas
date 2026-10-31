/* Motion Atlas · 文档中心：读取 window.MA_DOCS，渲染 Markdown；地址形如 docs.html#doc/docs/guide.md */
(function () {
  'use strict';
  const { esc, ICONS, copy } = window.Site;
  const DOCS = window.MA_DOCS || [];
  const byPath = new Map(DOCS.map((d) => [d.path, d]));
  const localFiles = new Set(window.MA_DOC_LINKS.files);
  const entries = window.MA_DOC_LINKS.entries;
  const $ = (s) => document.querySelector(s);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const DEFAULT = byPath.has('docs/guide.md') ? 'docs/guide.md' : (DOCS[0] && DOCS[0].path);

  // ---------- 路径 ----------
  function upstreamDocument(base) {
    const entry = entries.find(e => base.startsWith(e.root) || base === `prompts/${e.kind}/${e.id}.md`);
    if (!entry) return null;
    let pin = entry.upstream;
    let sourceDirectory = '';
    if (!pin) {
      for (const source of [...(entry.sources || []), ...(entry.attribution || []).filter(a => a.scope === '作品' || a.scope === '原作')]) {
        const text = [source.url, source.notes].filter(Boolean).join('\n');
        const repository = source.repository || text.match(/https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/)?.[1];
        const commit = source.commit || text.match(/github\.com\/[^/]+\/[^/]+\/(?:tree|blob)\/([a-f\d]{7,40})/i)?.[1] || text.match(/(?:固定提交|上游提交)[^`]*`([a-f\d]{7,40})`/i)?.[1];
        if (!repository || !commit) continue;
        pin = { repository, commit };
        sourceDirectory = text.match(/(?:原目录为|源码目录[：:])\s*`([^`]+)`/)?.[1] || '';
        break;
      }
    }
    if (!pin?.repository || !pin.commit) return null;
    if (base.startsWith('prompts/')) {
      const original = entry.promptSource && upstreamDocument(entry.promptSource);
      return original ? { ...pin, path: original.path } : null;
    }
    if (entry.kind === 'materials') {
      const prefix = pin.url.match(/\/(?:tree|blob)\/[^/]+\/?(.*)$/)[1];
      return { ...pin, path: (prefix ? prefix + '/' : '') + base.slice(entry.root.length) };
    }
    const repositoryRoot = entry.root + 'source/' + pin.repository.split('/')[1] + '/';
    if (base.toLowerCase().startsWith(repositoryRoot.toLowerCase())) return { ...pin, path: base.slice(repositoryRoot.length) };
    if (sourceDirectory) return { ...pin, path: sourceDirectory + base.slice(entry.root.length).replace(/^source\//, '') };
    return null;
  }
  function linkFor(base, href, image = false) {
    const root = new URL('.', location.href);
    const url = new URL(href, new URL(base, root));
    if (url.origin !== root.origin) return { href, ext: true };
    const target = decodeURIComponent(url.pathname.slice(root.pathname.length));
    const frag = url.hash.slice(1);
    if (image) return { href: target + url.search + url.hash };
    if (byPath.has(target)) return { href: `docs.html${url.search}#doc/${target}${frag ? '::' + frag : ''}` };
    if (localFiles.has(target)) return { href: target + url.search + url.hash };
    const original = upstreamDocument(base);
    if (!original) return { href: null };
    const upstream = new URL(href, `https://atlas.local/${original.path}`);
    const kind = upstream.pathname.endsWith('/') ? 'tree' : 'blob';
    return { href: `https://github.com/${original.repository}/${kind}/${original.commit}${upstream.pathname}${upstream.search}${upstream.hash}`, ext: true, upstream: href };
  }

  // ---------- 行内 ----------
  function inline(s, base) {
    return s.split(/(`[^`]+`)/).map((part) => {
      if (/^`[^`]+`$/.test(part)) return `<code>${esc(part.slice(1, -1))}</code>`;
      let h = esc(part);
      h = h.replace(/&lt;(https?:\/\/[^\s&]+(?:&amp;[^\s&]+)*)&gt;/g, (_, u) => `<a href="${u}" target="_blank" rel="noopener">${u}${ICONS.external}</a>`);
      h = h.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${esc(linkFor(base, src, true).href)}" alt="${alt}" loading="lazy">`);
      h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
        const l = linkFor(base, href.replace(/&amp;/g, '&'));
        if (!l.href) return `<span data-missing-link="${esc(href)}">${text}</span>`;
        return `<a href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener"' : ''}${l.upstream ? ` data-upstream="${esc(l.upstream)}"` : ''}>${text}${l.ext ? ICONS.external : ''}</a>`;
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
        let id = text.toLowerCase().replace(/<[^>]+>|[`*_[\]()]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-') || `h-${heads.length}`;
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
        out.push(`<div class="tbl"><div class="tbl-scroll"><table><thead><tr>${head.map((c) => `<th>${inline(c, base)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, base)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`);
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
    if (d.hidden) continue;
    let g = groups.find((x) => x.name === d.group);
    if (!g) groups.push((g = { name: d.group, docs: [] }));
    g.docs.push(d);
  }
  function drawNav() {
    $('#docNav').innerHTML = groups.map((g) => {
      return `<details class="side-group" data-group="${esc(g.name)}"${g.docs.some(d => d.path === current) ? ' open' : ''}><summary title="${esc(g.name)}"><span class="doc-group-title">${esc(g.name)}</span><span class="group-indicator" aria-hidden="true">${ICONS.plus}${ICONS.minus}</span></summary><ul class="side-list">${g.docs.map((d) => `<li><a href="#doc/${esc(d.path)}" data-p="${esc(d.path)}" title="${esc(d.title)}">${esc(d.title)}</a></li>`).join('')}</ul></details>`;
    }).join('') + '<p class="doc-empty" hidden>没有匹配的文档</p>';
    markNav();
  }
  let current = null;
  let searchState = null;
  function markNav(reveal = false) {
    document.querySelectorAll('#docNav a').forEach((a) => {
      if (a.dataset.p === current) {
        a.setAttribute('aria-current', 'page');
        if (reveal) {
          const group = a.closest('details');
          group.open = true;
          searchState?.set(group.dataset.group, true);
        }
      }
      else a.removeAttribute('aria-current');
    });
  }
  function filterNav() {
    const query = $('#docQ').value.trim().toLowerCase();
    const sections = [...$('#docNav').querySelectorAll('details')];
    if (query && !searchState) searchState = new Map(sections.map(g => [g.dataset.group, g.open]));
    let matches = 0;
    for (const group of sections) {
      let count = 0;
      for (const link of group.querySelectorAll('a')) {
        const match = !query || link.textContent.toLowerCase().includes(query);
        link.parentElement.hidden = !match;
        if (match) count++;
      }
      group.hidden = !count;
      if (query) group.open = !!count;
      else if (searchState) group.open = searchState.get(group.dataset.group);
      matches += count;
    }
    $('#docNav .doc-empty').hidden = !!matches;
    if (!query) searchState = null;
  }
  function positionCurrent(center = false) {
    const active = $('#docNav [aria-current="page"]');
    if (!active || !active.getClientRects().length) return;
    const item = active.getBoundingClientRect();
    const fade = parseFloat(getComputedStyle(side).getPropertyValue('--doc-rail-fade'));
    const top = search.getBoundingClientRect().bottom + active.closest('details').querySelector('summary').getBoundingClientRect().height + fade;
    const bottom = side.getBoundingClientRect().bottom - parseFloat(getComputedStyle(side).paddingBottom);
    if (center) side.scrollTop += item.top + item.height / 2 - (top + bottom) / 2;
    else if (item.top < top) side.scrollTop += Math.floor(item.top - top);
    else if (item.bottom > bottom) side.scrollTop += Math.ceil(item.bottom - bottom);
  }
  $('#doc-search-icon').outerHTML = ICONS.search;
  $('#docQ').addEventListener('input', filterNav);
  const side = $('#doc-side');
  const search = document.createElement('div');
  search.className = 'doc-search';
  const field = $('#docQ').closest('.field');
  field.before(search);
  search.append(field);
  function sizeSearch() {
    side.style.setProperty('--doc-side-padding', getComputedStyle(side).paddingTop);
    side.style.setProperty('--doc-search-height', `${search.getBoundingClientRect().height}px`);
  }
  sizeSearch();
  const searchSize = new ResizeObserver(sizeSearch);
  searchSize.observe(search);
  searchSize.observe(side);
  $('#docNav').addEventListener('click', (event) => {
    const summary = event.target.closest('summary');
    if (!summary) return;
    const top = summary.getBoundingClientRect().top;
    requestAnimationFrame(() => { side.scrollTop += summary.getBoundingClientRect().top - top; });
  });

  const outline = $('.doc-toc');
  const tocToggle = $('#toc-toggle');
  const tocPanel = $('#toc-panel');
  const tocClose = $('#toc-close');
  const compact = matchMedia('(max-width: 800px)');
  function setTocOpen(open, restoreFocus = false) {
    tocPanel.hidden = compact.matches && !open;
    tocToggle.setAttribute('aria-expanded', String(open));
    tocToggle.setAttribute('aria-label', open ? '收起本文目录' : '打开本文目录');
    if (restoreFocus) tocToggle.focus({ preventScroll: true });
  }
  function syncToc() {
    tocToggle.hidden = !compact.matches;
    tocClose.hidden = !compact.matches;
    setTocOpen(false);
  }
  tocToggle.addEventListener('click', () => setTocOpen(tocPanel.hidden));
  tocClose.addEventListener('click', () => setTocOpen(false, true));
  $('#toc').addEventListener('click', event => {
    if (compact.matches && event.target.closest('a')) setTocOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (compact.matches && !tocPanel.hidden && event.key === 'Escape') {
      event.preventDefault();
      setTocOpen(false, true);
    }
  });
  document.addEventListener('click', event => {
    if (compact.matches && !tocPanel.hidden && !outline.contains(event.target)) setTocOpen(false);
  });
  compact.addEventListener('change', syncToc);
  syncToc();

  // ---------- 打开文档 ----------
  let spy = null;
  function open() {
    const raw = decodeURIComponent(location.hash.replace(/^#doc\//, ''));
    const [p, frag] = raw.split('::');
    const path = p || DEFAULT;
    const d = byPath.get(path);
    const art = $('#doc');
    if (!d) { art.innerHTML = '<p class="doc-empty">未找到文档。</p>'; return; }
    const heads = [];
    const body = render(d.content, d.path, heads);
    art.innerHTML = `<div class="doc-path"><span title="${esc(d.group)} / ${esc(d.path)}">${esc(d.group)} / ${esc(d.path)}</span><a class="btn" href="${esc(d.path)}" download="${esc(d.path.split('/').pop())}" aria-label="下载原始 Markdown">${ICONS.download}<span>下载 Markdown</span></a></div>${heads.length ? '' : `<h1>${esc(d.title)}</h1>`}${body}`;
    art.querySelectorAll('pre').forEach((pre) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.innerHTML = `${ICONS.copy}复制`;
      b.addEventListener('click', () => copy(pre.querySelector('code').textContent));
      pre.appendChild(b);
    });
    document.title = `${d.title} · Motion Atlas`;
    const changed = current !== path;
    current = path; markNav(changed);
    if (changed) positionCurrent();
    const toc = heads.filter((h) => h.lv === 2 || h.lv === 3);
    $('#toc').innerHTML = toc.map((h) => `<a href="#doc/${esc(path)}::${esc(h.id)}" data-id="${esc(h.id)}"${h.lv === 3 ? ' class="sub"' : ''}>${esc(h.text)}</a>`).join('');
    outline.hidden = !toc.length;
    setTocOpen(false);
    const target = frag && document.getElementById(frag);
    // 内容写入后再滚动；instant 绕过全局 smooth（滚动恢复已设为 manual）
    setTimeout(() => {
      if (target) target.scrollIntoView({ behavior: 'instant' });
      else scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
    if (spy) spy.disconnect();
    if ('IntersectionObserver' in window && toc.length) {
      spy = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) document.querySelectorAll('#toc a').forEach((a) => a.classList.toggle('on', a.dataset.id === e.target.id));
      }, { rootMargin: '-80px 0px -70% 0px' });
      toc.forEach((h) => { const el = document.getElementById(h.id); if (el) spy.observe(el); });
    }
  }
  addEventListener('hashchange', open);
  open();
  drawNav();
  // 初次定位等字体与布局稳定；当前项尚未排版时逐帧重试
  const settle = (tries = 60) => {
    const active = $('#docNav [aria-current="page"]');
    if (active && active.getClientRects().length && side.clientHeight) positionCurrent(true);
    else if (tries) requestAnimationFrame(() => settle(tries - 1));
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(() => requestAnimationFrame(() => settle())));
})();
