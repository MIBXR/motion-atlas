/* Motion Atlas · 站点外壳：顶栏、主题、收藏、复制、提示。所有功能图标为内联 SVG。 */
(function () {
  'use strict';

  const ICONS = {
    logo: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="1" y="1" width="32" height="32" rx="8" fill="var(--accent)"/><path d="M7 23h20M7 11h20" stroke="var(--accent-ink)" stroke-width="1.6" stroke-linecap="round" opacity=".5"/><path d="M10 23v-3M14 23v-5M18 23v-2M22 23v-6M26 23v-3" stroke="var(--accent-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M15 6l7 5-7 5z" fill="var(--accent-ink)"/></svg>',
    sun: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    moon: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    system: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    menu: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
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
  };

  const NAV = [
    ['index.html', '首页'], ['cases.html', '案例库'], ['patterns.html', '巧思库'],
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

  /* ---------- 收藏：案例与巧思共用一个备份文件 ---------- */
  const favs = {
    all() { return store.get('ma-favorites', { cases: [], patterns: [] }); },
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
        const known = window.MA || { cases: [], patterns: [] };
        for (const kind of ['cases', 'patterns']) {
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
      if (e.target.closest('[data-group], #docNav a, .menu-site a')) close();
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
    const page = (location.pathname.split('/').pop() || 'index.html');
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
          <button class="icon-btn theme-btn" type="button"></button>
        </div>`;
      const tb = header.querySelector('.theme-btn');
      const paint = () => {
        tb.innerHTML = theme === 'light' ? ICONS.sun : theme === 'dark' ? ICONS.moon : ICONS.system;
        tb.setAttribute('aria-label', THEME_LABEL[theme] + '（点击切换）');
        tb.title = THEME_LABEL[theme];
      };
      paint();
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
      footer.innerHTML = `
        <div><b>MOTION ATLAS</b> · 动态视觉参考库：案例、巧思、节奏、Prompt 与可运行的 Demo。</div>
        <div class="links"><a href="docs.html#doc/docs/guide.md">使用指南</a><a href="docs.html#doc/docs/methodology.md">条目结构</a><a href="docs.html#doc/docs/pipeline.md">渲染管线</a><a href="agent/catalog.json">Agent 索引</a></div>`;
    }
    const top = document.createElement('button');
    top.type = 'button';
    top.className = 'icon-btn to-top';
    top.setAttribute('aria-label', '回到顶部');
    top.innerHTML = ICONS.up;
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    document.body.appendChild(top);
    addEventListener('scroll', () => top.classList.toggle('show', scrollY > innerHeight), { passive: true });
  }

  window.Site = { ICONS, store, favs, toast, copy, esc, renderShell, syncMenu: () => syncMenu() };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderShell);
  else renderShell();
})();
