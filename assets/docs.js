/* Motion Atlas · 文档中心：读取 window.MA_DOCS，渲染 Markdown；地址形如 docs.html#doc/docs/guide.md */
(function () {
  'use strict';
  const { esc, ICONS, copy } = window.Site;
  const DOCS = window.MA_DOCS || [];
  const byPath = new Map(DOCS.map((d) => [d.path, d]));
  const $ = (s) => document.querySelector(s);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const DEFAULT = byPath.has('docs/guide.md') ? 'docs/guide.md' : (DOCS[0] && DOCS[0].path);

  const { render } = window.MAMarkdown;

  // ---------- 目录 ----------
  const groups = [];
  for (const d of DOCS) {
    let g = groups.find((x) => x.name === d.group);
    if (!g) groups.push((g = { name: d.group, docs: [] }));
    g.docs.push(d);
  }
  const openGroups = new Set();
  function drawNav(q = '') {
    const k = q.trim().toLowerCase();
    $('#docNav').innerHTML = groups.map((g) => {
      const list = g.docs.filter((d) => !k || d.title.toLowerCase().includes(k) || d.path.toLowerCase().includes(k));
      // 长分组默认折叠；搜索中或当前文档所在分组展开
      const open = k || list.length <= 12 || list.some((d) => d.path === current) || openGroups.has(g.name);
      return list.length ? `<details data-g="${esc(g.name)}"${open ? ' open' : ''}><summary>${esc(g.name)} · ${list.length}</summary>${list.map((d) => `<a href="#doc/${esc(d.path)}" data-p="${esc(d.path)}">${esc(d.title.replace(/ · 复用 Prompt$/, ''))}</a>`).join('')}</details>` : '';
    }).join('') || '<p class="doc-empty">没有匹配的文档</p>';
    markNav();
  }
  let current = null;
  function markNav() {
    document.querySelectorAll('#docNav a').forEach((a) => (a.dataset.p === current ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  }
  const side = $('.docs-side');
  const tog = document.createElement('button');
  tog.type = 'button'; tog.className = 'btn docs-toggle'; tog.setAttribute('aria-expanded', 'false');
  tog.innerHTML = `${ICONS.menu}全部文档（${DOCS.length}）`;
  tog.addEventListener('click', () => { const o = side.classList.toggle('open'); tog.setAttribute('aria-expanded', String(o)); });
  side.insertBefore(tog, side.firstChild);
  $('#docQ').addEventListener('input', (e) => { side.classList.toggle('searching', !!e.target.value.trim()); drawNav(e.target.value); });

  // ---------- 打开文档 ----------
  let spy = null;
  function open() {
    const raw = decodeURIComponent(location.hash.replace(/^#doc\//, ''));
    const [p, frag] = raw.split('::');
    const path = byPath.has(p) ? p : DEFAULT;
    const d = byPath.get(path);
    const art = $('#doc');
    if (!d) { art.innerHTML = '<p class="doc-empty">还没有文档。运行 <code>node scripts/build.mjs</code> 生成 data/docs.js。</p>'; return; }
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
  $('#docNav').addEventListener('toggle', (e) => { const g = e.target.dataset && e.target.dataset.g; if (g) e.target.open ? openGroups.add(g) : openGroups.delete(g); }, true);
  addEventListener('hashchange', () => { open(); if (!$('#docQ').value) drawNav(); });
  open();
  drawNav();
})();
