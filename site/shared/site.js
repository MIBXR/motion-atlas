/* Motion Atlas · 站点外壳：顶栏、主题、收藏、复制、提示。所有功能图标为内联 SVG。 */
(function () {
  'use strict';
  const cacheReady = new Promise(resolve => {
    const script = document.createElement('script');
    script.src = new URL('../runtime/asset-cache.js', document.currentScript.src);
    script.onload = script.onerror = resolve;
    document.head.append(script);
  });

  const ICONS = {
    cache: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></svg>',
    close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    logo: '<svg viewBox="0 0 96 96" aria-hidden="true"><path fill="var(--brand-mark)" fill-rule="evenodd" d="M8 48a28 28 0 1 0 56 0a28 28 0 1 0-56 0Z M32 48a28 28 0 1 0 56 0a28 28 0 1 0-56 0Z"/></svg>',
    sun: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    moon: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    system: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    menu: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    starFill: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" fill="currentColor"/></svg>',
    back: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    external: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    copy: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    download: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    upload: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V9M7 14l5-5 5 5M5 4h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    replay: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.05-4.95M5 4.5V9h4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    filter: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    up: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevronDown: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    minus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    stop: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/></svg>',
    landscape: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="6.5" width="19" height="11" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10.5v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    portrait: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 18h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    soundOn: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    soundOff: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    expand: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collapse: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M15 20v-5h5M9 20v-5H4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tap: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.4" fill="currentColor"/><circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" stroke-width="1.8" opacity=".55"/></svg>',
    rec: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>',
    wave: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h1.5M7 8.5v7M10.5 5v14M14 9v6M17.5 6.5v11M21 12h-.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const icon = (name, cls) => ICONS[name].replace('class="icon"', `class="icon ${cls}"`);

  function decorateControls(root = document) {
    root.querySelectorAll('select.select').forEach(select => {
      if (select.parentElement.classList.contains('select-wrap')) return;
      const wrap = document.createElement('span');
      wrap.className = 'select-wrap';
      select.before(wrap);
      wrap.append(select);
      wrap.insertAdjacentHTML('beforeend', ICONS.chevronDown);
    });
    root.querySelectorAll('input[type="search"]').forEach(input => {
      let field = input.closest('.field');
      if (!field) {
        field = document.createElement('span');
        field.className = 'field';
        input.before(field);
        field.append(input);
      }
      if (!field.querySelector('svg')) field.insertAdjacentHTML('afterbegin', ICONS.search);
      if (!field.querySelector('.kbd')) field.insertAdjacentHTML('beforeend', '<span class="kbd" aria-hidden="true">/</span>');
    });
  }
  addEventListener('keydown', event => {
    if (event.key !== '/' || event.target.closest('input, textarea, select, [contenteditable]')) return;
    const input = document.querySelector('input[type="search"]');
    if (input) { event.preventDefault(); input.focus(); }
  });

  const NAV = [
    ['index.html', '首页'], ['cases.html', '案例库'], ['patterns.html', '巧思库'], ['materials.html', '素材库'],
    ['lab.html', '节奏实验室'], ['docs.html', '文档中心'], ['agent.html', 'Agent 工作流'],
  ];

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 隐私模式忽略 */ } },
  };

  /* ---------- 主题：system → light → dark ---------- */
  const THEMES = ['system', 'light', 'dark'];
  const THEME_LABEL = { system: '主题：跟随系统', light: '主题：浅色', dark: '主题：深色' };
  function applyTheme(mode) {
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
  }
  let theme = store.get('ma-theme', 'system');
  applyTheme(theme);

  /* ---------- 收藏：各库共用一个备份文件 ---------- */
  const favs = {
    all() { return { cases: [], patterns: [], materials: [], ...store.get('ma-favorites', {}) }; },
    has(kind, id) { return this.all()[kind].includes(id); },
    toggle(kind, id) {
      const f = this.all();
      f[kind] = f[kind].includes(id) ? f[kind].filter((x) => x !== id) : [...f[kind], id];
      store.set('ma-favorites', f);
      document.dispatchEvent(new CustomEvent('ma:favorites'));
      return f[kind].includes(id);
    },
    export() {
      const blob = new Blob([JSON.stringify({ app: 'motion-atlas', version: 1, exportedAt: new Date().toISOString(), favorites: this.all() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'motion-atlas-favorites.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    import(file) {
      return file.text().then((txt) => {
        const data = JSON.parse(txt);
        const inc = data.favorites || data;
        const f = this.all();
        const known = window.MA || { cases: [], patterns: [], materials: [] };
        for (const kind of ['cases', 'patterns', 'materials']) {
          const ids = new Set(known[kind].map((x) => x.id));
          for (const id of inc[kind] || []) if (ids.has(id) && !f[kind].includes(id)) f[kind].push(id);
        }
        store.set('ma-favorites', f);
        document.dispatchEvent(new CustomEvent('ma:favorites'));
        return f;
      });
    },
  };

  function toast(msg) {
    let el = document.querySelector('.toast-msg');
    if (!el) { el = document.createElement('div'); el.className = 'toast-msg'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 1800);
  }

  async function copy(text, label = '已复制') {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast(label);
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let syncMenu = () => {};

  function bindMenu(header) {
    const toggle = header.querySelector('.nav-toggle');
    const nav = header.querySelector('.site-nav');
    const navHome = document.createComment('');
    nav.before(navHome);
    const panel = document.createElement('div');
    panel.id = 'mobile-menu';
    panel.className = 'mobile-menu';
    panel.hidden = true;
    panel.tabIndex = -1;
    panel.setAttribute('aria-label', '菜单');
    panel.innerHTML = `<div class="menu-views" role="group" aria-label="菜单内容"><button class="btn" type="button" data-view="page">本页目录</button><button class="btn" type="button" data-view="site">全站导航</button></div><div class="menu-page"></div><div class="menu-site"></div>`;
    header.after(panel);
    const views = panel.querySelector('.menu-views');
    const pageHost = panel.querySelector('.menu-page');
    const siteHost = panel.querySelector('.menu-site');
    const mobile = matchMedia('(max-width: 980px)');
    let side = null, sideHome = null, open = false, lastY = scrollY;
    function setView(view) {
      pageHost.hidden = view !== 'page';
      siteHost.hidden = view !== 'site';
      views.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
      panel.scrollTop = 0;
    }
    function close(restoreFocus = true) {
      if (!open) return;
      open = false;
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }
    function sync() {
      if (side && !sideHome.isConnected) { side.remove(); side = null; sideHome = null; }
      const next = document.querySelector('.lib > .lib-side, .docs > .lib-side');
      if (next && next !== side) {
        side = next;
        sideHome = document.createComment('');
        side.before(sideHome);
      }
      views.hidden = !side;
      if (mobile.matches) {
        siteHost.append(nav);
        if (side) pageHost.append(side);
      } else {
        navHome.after(nav);
        if (side) sideHome.after(side);
      }
      setView(side ? 'page' : 'site');
    }
    function show() {
      if (!mobile.matches) return;
      sync();
      pageHost.querySelectorAll('details').forEach((d) => { d.open = true; });
      open = true;
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      header.classList.remove('is-hidden');
      panel.focus({ preventScroll: true });
    }
    toggle.addEventListener('click', () => open ? close() : show());
    views.addEventListener('click', (e) => {
      const b = e.target.closest('[data-view]');
      if (b) setView(b.dataset.view);
    });
    panel.addEventListener('click', (e) => {
      if (e.target.closest('[data-group], #docNav a, #labNav a, .menu-site a')) close();
    }, true);
    document.addEventListener('click', (e) => {
      if (open && !panel.contains(e.target) && !toggle.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) { e.preventDefault(); close(); }
    });
    mobile.addEventListener('change', () => {
      const focused = panel.contains(document.activeElement);
      close(mobile.matches);
      sync();
      header.classList.remove('is-hidden');
      lastY = scrollY;
      if (!mobile.matches && focused) nav.querySelector('a[aria-current], a').focus({ preventScroll: true });
    });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    addEventListener('scroll', () => {
      const y = Math.max(0, scrollY);
      if (!mobile.matches || open || y <= 80) header.classList.remove('is-hidden');
      else if (y > lastY) header.classList.add('is-hidden');
      else if (y < lastY - 8) header.classList.remove('is-hidden');
      if (y > lastY || y < lastY - 8 || y <= 80 || open) lastY = y;
    }, { passive: true });
    syncMenu = sync;
    sync();
  }

  /* ---------- 顶栏与页脚 ---------- */
  function renderShell() {
    // 线上站点会把 cases.html 重定向为 /cases，比较前统一去掉 .html
    const pageKey = (p) => (p.split('/').pop() || 'index').replace(/\.html$/, '');
    const page = pageKey(location.pathname) + '.html';
    const header = document.getElementById('site-header');
    if (header) {
      header.className = 'site-header';
      header.innerHTML = `
        <a class="brand" href="index.html" aria-label="Motion Atlas 首页">
          <span class="brand-mark">${ICONS.logo}</span>
          <span class="brand-word"><strong>MOTION ATLAS</strong><small>节拍 · 动势 · 审美</small></span>
        </a>
        <nav class="site-nav" id="site-nav" aria-label="主导航">
          ${NAV.map(([href, label]) => `<a href="${href}"${href === page ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
        </nav>
        <div class="header-tools">
          <button class="icon-btn nav-toggle" type="button" aria-label="菜单" aria-expanded="false" aria-controls="mobile-menu">${ICONS.menu}<span>菜单</span></button>
          <button class="icon-btn atlas-cache-toggle" type="button" aria-label="管理已下载的素材" title="已下载的素材" aria-haspopup="dialog" aria-controls="asset-cache-dialog">${ICONS.cache}</button>
          <button class="icon-btn theme-btn" type="button"></button>
        </div>`;
      const tb = header.querySelector('.theme-btn');
      const paint = () => {
        tb.innerHTML = theme === 'light' ? ICONS.sun : theme === 'dark' ? ICONS.moon : ICONS.system;
        tb.setAttribute('aria-label', THEME_LABEL[theme] + '（点击切换）');
        tb.title = THEME_LABEL[theme];
      };
      paint();
      const cacheButton = header.querySelector('.atlas-cache-toggle');
      const cacheDialog = document.createElement('dialog');
      cacheDialog.id = 'asset-cache-dialog';
      cacheDialog.className = 'atlas-cache-dialog';
      cacheDialog.setAttribute('aria-labelledby', 'asset-cache-title');
      cacheDialog.innerHTML = '<form method="dialog"><button class="dialog-close" aria-label="关闭素材缓存管理">' + ICONS.close + '</button></form><h2 id="asset-cache-title">已下载的素材</h2><p>嵌入预览与独立页面共享当前站点的素材缓存。浏览器空间不足时会重新下载。</p><p id="cache-status" role="status"></p><button id="cache-clear" class="btn" disabled>清除素材缓存</button>';
      document.body.append(cacheDialog);
      async function showCacheStatus(clear = false) {
        const status = cacheDialog.querySelector('#cache-status');
        const button = cacheDialog.querySelector('#cache-clear');
        status.textContent = clear ? '正在清除素材缓存…' : '正在检查素材缓存…';
        button.disabled = true;
        await cacheReady;
        const api = window.AtlasAssetCache;
        const result = api ? await api[clear ? 'clear' : 'status']() : { available: false };
        status.textContent = result.available ? `${result.files} 项 · ${(result.bytes / 1024 / 1024).toFixed(1)} MiB · 上限 ${(result.limit / 1024 / 1024).toFixed(0)} MiB${clear ? ' · 下次打开时按需重新下载' : ''}` : '此浏览器暂不支持持久素材缓存，页面仍可正常加载。';
        button.disabled = !result.available;
      }
      cacheButton.addEventListener('click', async () => {
        cacheDialog.showModal();
        await showCacheStatus();
      });
      cacheDialog.querySelector('#cache-clear').addEventListener('click', () => showCacheStatus(true));
      tb.addEventListener('click', () => {
        theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
        store.set('ma-theme', theme);
        applyTheme(theme);
        paint();
        document.dispatchEvent(new CustomEvent('ma:theme'));
      });
      bindMenu(header);
    }
    const footer = document.getElementById('site-footer');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML = `<div class="footer-inner">
        <div class="footer-about"><a class="footer-brand" href="index.html"><span class="footer-mark">${ICONS.logo}</span><strong>MOTION ATLAS</strong></a><p>以时间线为线索，拆解影像与操作台。</p><small>由 MIBXR 维护 · 素材署名见各条目</small></div>
        <nav class="footer-nav" aria-label="页脚导航"><div class="footer-links footer-explore"><p>探索 Atlas</p>${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</div>
        <div class="footer-links"><p>项目资料</p><a href="docs.html#doc/docs/guide.md">使用与维护</a><a href="docs.html#doc/docs/methodology.md">调研方法</a><a href="https://github.com/MIBXR/motion-atlas" target="_blank" rel="noopener noreferrer">项目 GitHub${ICONS.external}</a></div></nav></div>`;
    }
    const top = document.createElement('button');
    top.type = 'button';
    top.className = 'icon-btn to-top';
    top.setAttribute('aria-label', '回到顶部');
    top.innerHTML = ICONS.up;
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    document.body.appendChild(top);
    addEventListener('scroll', () => top.classList.toggle('show', scrollY > innerHeight), { passive: true });
    decorateControls();
  }

  function viewTransition(update) {
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(update);
    else update();
  }

  window.Site = { ICONS, icon, decorateControls, store, favs, toast, copy, esc, renderShell, viewTransition, syncMenu: () => syncMenu() };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderShell);
  else renderShell();
})();
