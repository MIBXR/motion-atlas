/* Motion Atlas · 案例库、巧思库与素材库（共用浏览、筛选和收藏） */
(function () {
  'use strict';
  const { ICONS, favs, copy, esc, toast, store } = window.Site;
  const MA = window.MA;
  const KIND = document.body.dataset.lib;
  const isMaterial = KIND === 'materials';
  const libName = KIND === 'cases' ? '案例库' : isMaterial ? '素材库' : '巧思库';
  const itemName = KIND === 'cases' ? '案例' : isMaterial ? '素材' : '巧思';
  const hashKind = KIND === 'cases' ? 'case' : isMaterial ? 'material' : 'pattern';
  const materialTypes = MA.taxonomy.materialTypes;
  const TAX = MA.taxonomy;
  const root = document.getElementById('app');
  const items = MA[KIND];
  const byId = (list, id) => list.find((x) => x.id === id);

  /* ---------- 小工具 ---------- */
  const fmtT = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
  const fmtB = (s) => fmtT(s).replace(/^00:/, ''); // 节拍点的短格式：不足一分钟时省略分钟
  const energyPoints = (it, duration = it.rhythm?.duration) => it.energySegments?.length && duration
    ? it.energySegments.flatMap((s) => [[s.t0 / duration, s.from], [s.t1 / duration, s.to]])
    : (it.energy || []).map((v, i, arr) => [i / Math.max(1, arr.length - 1), v]);
  const energyPath = (it, w = 100, h = 26) => {
    const pts = energyPoints(it).map(([t, v]) => [t * w, h - 2 - v * (h - 4)]);
    if (!pts.length) return '';
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('');
    return `<svg class="energy" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="fill" d="${line}L${w} ${h}L0 ${h}Z"/><path class="stroke" d="${line}" vector-effect="non-scaling-stroke"/></svg>`;
  };
  const heroArt = KIND === 'cases'
    ? `<svg class="hero-art" viewBox="0 0 380 220" aria-hidden="true">
        <g font-family="var(--f-mono)" font-size="12" fill="var(--muted)"><text x="0" y="34">CAM</text><text x="0" y="84">HUD</text><text x="0" y="134">TYPE</text><text x="0" y="184">SFX</text></g>
        <g stroke="var(--line-2)"><path d="M50 30H380M50 80H380M50 130H380M50 180H380"/></g>
        <g fill="var(--ink)"><path d="M90 30l7-7 7 7-7 7zM190 30l7-7 7 7-7 7zM320 30l7-7 7 7-7 7z"/><rect x="120" y="74" width="120" height="12" rx="3" opacity=".85"/><rect x="260" y="74" width="80" height="12" rx="3" opacity=".4"/>
        <path d="M70 130l7-7 7 7-7 7zM100 130l7-7 7 7-7 7zM130 130l7-7 7 7-7 7z" opacity=".6"/></g>
        <g fill="var(--accent-1)"><circle cx="150" cy="180" r="5"/><circle cx="210" cy="180" r="5"/><circle cx="270" cy="180" r="5"/><circle cx="330" cy="180" r="5"/></g>
        <path d="M50 214C100 214 120 196 160 186S240 150 280 160 340 206 380 200" fill="none" stroke="var(--accent-1)" stroke-width="2"/>
        <g class="ph-anim"><rect x="236" y="8" width="2" height="212" fill="var(--accent-1)"/><path d="M231 4h12l-6 8z" fill="var(--accent-1)"/></g>
      </svg>`
    : `<svg class="hero-art" viewBox="0 0 380 220" aria-hidden="true">
        <g stroke="var(--line-2)" fill="none"><rect x="10" y="10" width="110" height="110"/><rect x="135" y="10" width="110" height="110"/><rect x="260" y="10" width="110" height="110"/></g>
        <path d="M10 120C50 120 40 10 120 10" fill="none" stroke="var(--ink)" stroke-width="2"/>
        <path d="M135 120C215 120 165 10 245 10" fill="none" stroke="var(--accent-1)" stroke-width="2.5"/>
        <path d="M260 120C270 40 300 -10 370 10" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="4 4"/>
        <g fill="var(--accent-1)"><circle cx="10" cy="120" r="4"/><circle cx="120" cy="10" r="4"/><circle cx="135" cy="120" r="4"/><circle cx="245" cy="10" r="4"/></g>
        <g font-family="var(--f-mono)" font-size="12" fill="var(--muted)"><text x="10" y="146">glide</text><text x="135" y="146">snap</text><text x="260" y="146">overshoot</text></g>
        <g fill="var(--ink)"><rect x="10" y="170" width="40" height="40" rx="6"/><rect x="62" y="178" width="40" height="32" rx="6" opacity=".7"/><rect x="114" y="186" width="40" height="24" rx="6" opacity=".45"/><rect x="166" y="194" width="40" height="16" rx="6" opacity=".25"/></g>
        <path d="M230 210h140" stroke="var(--line-2)"/><path d="M230 210h40l20-36 20 36h60" fill="none" stroke="var(--accent-1)" stroke-width="2"/>
      </svg>`;

  /* ---------- 状态（列表筛选保存在 URL） ---------- */
  const q = new URLSearchParams(location.search);
  const state = {
    carrier: q.get('carrier') || 'all',
    type: q.get('type') || 'all',
    caseId: q.get('case') || 'all',
    fav: q.get('fav') === '1',
    query: q.get('q') || '',
    sort: q.get('sort') === 'title' ? 'title' : 'order',
    dir: q.get('dir') === 'desc' ? 'desc' : 'asc',
  };
  function syncURL() {
    const p = new URLSearchParams();
    if (state.carrier !== 'all') p.set('carrier', state.carrier);
    if (KIND !== 'cases' && state.type !== 'all') p.set('type', state.type);
    if (KIND === 'patterns' && state.caseId !== 'all') p.set('case', state.caseId);
    if (state.fav) p.set('fav', '1');
    if (state.query) p.set('q', state.query);
    if (state.sort !== 'order') p.set('sort', state.sort);
    if (state.dir !== 'asc') p.set('dir', state.dir);
    const s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  const haystack = (it) => [it.id, it.title, it.subtitle, it.summary, ...(it.tags || []), ...(it.useCases || []), it.mechanism, it.trigger, it.effect,
    it.carrierNote, ...(it.workflow || []), ...(it.avoid || []), materialTypes[it.type],
    ...(it.carriers || []).map((c) => TAX.carriers[c]), ...(it.types || []).map((c) => TAX.types[c])].filter(Boolean).join(' ').toLowerCase();
  function filtered(filters = state) {
    const words = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
    let list = items.filter((it) => {
      if (filters.carrier !== 'all' && !(it.carriers || []).includes(filters.carrier)) return false;
      if (KIND === 'patterns' && filters.type !== 'all' && !(it.types || []).includes(filters.type)) return false;
      if (isMaterial && filters.type !== 'all' && it.type !== filters.type) return false;
      if (KIND === 'patterns' && filters.caseId !== 'all' && !(it.sources || []).some((s) => s.caseId === filters.caseId)) return false;
      if (filters.fav && !favs.has(KIND, it.id)) return false;
      if (words.length) { const h = haystack(it); if (!words.every((w) => h.includes(w))) return false; }
      return true;
    });
    list.sort(filters.sort === 'title' ? (a, b) => a.title.localeCompare(b.title, 'zh') : (a, b) => a.order - b.order);
    if (filters.dir === 'desc') list.reverse();
    return list;
  }

  /* ---------- 列表 ---------- */
  function sideButton(group, value, label, count) {
    const pressed = (group === 'fav' ? state.fav : state[group] === value) ? 'true' : 'false';
    return `<li><button type="button" data-group="${group}" data-value="${esc(value)}" aria-pressed="${pressed}"><span>${esc(label)}</span><span class="count">${String(count).padStart(2, '0')}</span></button></li>`;
  }
  function renderList() {
    document.title = libName + ' · Motion Atlas';
    const carriers = Object.entries(TAX.carriers);
    const group = KIND === 'cases' ? 'carrier' : 'type';
    const side = `<details class="side-group" open><summary>${KIND === 'cases' ? '载体' : '类型'}</summary><ul class="side-list">
      ${[['all', KIND === 'cases' ? '全部载体' : '全部类型'], ...Object.entries(KIND === 'cases' ? TAX.carriers : isMaterial ? materialTypes : TAX.types).filter(([value]) => !isMaterial || items.some(it => it.type === value))].map(([value, label]) => sideButton(group, value, label, filtered({ ...state, [group]: value }).length)).join('')}
      </ul></details><details class="side-group" open><summary>收藏</summary><ul class="side-list">
      ${sideButton('fav', '1', '我的收藏', favs.all()[KIND].length)}
      <li><button type="button" data-tool="export"><span>导出收藏</span>${ICONS.download}</button></li>
      <li><button type="button" data-tool="import"><span>导入收藏</span>${ICONS.upload}</button></li>
      </ul></details>`;
    const filterSelect = (id, label, all, values, value) => `<select class="select" id="${id}" aria-label="${label}"><option value="all">${all}</option>${values.map(([k, v]) => `<option value="${k}"${value === k ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select>`;
    const filters = [
      KIND === 'patterns' ? filterSelect('carrier-filter', '载体', '全部载体', carriers, state.carrier) : '',
      KIND === 'patterns' ? filterSelect('case-filter', '所属案例', '全部案例', MA.cases.map(c => [c.id, c.title]), state.caseId) : '',
    ].join('');
    const sortOptions = [['order', '按编号'], ['title', '按名称']];
    const description = isMaterial ? '工作流、适用场景、作者效果图与固定版本的技能原文。' : KIND === 'cases'
      ? '节拍表、动效参数、可复用 Prompt，以及能拖动逐帧查看的 Demo。'
      : '每个巧思都有触发方式、效果、参数、可复制的 Prompt 和独立 Demo。';

    root.innerHTML = `
      <div class="lib">
        <aside class="lib-side" id="lib-side" aria-label="${KIND === 'cases' ? '载体' : '类型'}与收藏工具">${side}</aside>
        <section>
          <header class="lib-head">
            <div>
              <p class="eyebrow">${KIND === 'cases' ? 'CASE COLLECTION · RHYTHM / MOTION / HUD' : isMaterial ? '素材库 · 工作流与实现手段' : 'PATTERN COLLECTION · ATOMIC MECHANISMS'}</p>
              <h1>${KIND === 'cases' ? '先看懂节拍，<br>再拿走<em>动势</em>。' : isMaterial ? '找到<em>实现手段</em>，<br>让想法走向成片。' : '一个触发，<br>一种<em>可借用</em>的结果。'}</h1>
              <p title="${esc(description)}">${esc(description)}</p>
            </div>
            ${isMaterial ? '' : heroArt}
          </header>
          <div class="toolbar">
            <label class="field">${ICONS.search}<span class="sr-only">搜索</span><input id="search" type="search" placeholder="${KIND === 'cases' ? '搜索案例、节奏、转场、HUD…' : isMaterial ? '搜索素材、工作流、适用场景…' : '搜索巧思、触发、转场、参数…'}" value="${esc(state.query)}"><span class="kbd" aria-hidden="true">/</span></label>
            ${filters}
            <span class="toolbar-divider" aria-hidden="true"></span>
            <div class="sort-group"><select class="select" id="sort" aria-label="排序方式">${sortOptions.map(([v, l]) => `<option value="${v}"${state.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select><button class="sort-dir" id="sort-dir" type="button"></button></div>
          </div>
          <div class="result-line"><span id="result-count" role="status"></span><span>${KIND === 'cases' ? '每个案例都能拖动时间轴' : isMaterial ? '作者产出效果，未复刻' : '每个巧思都有独立 Demo'}</span></div>
          <div class="grid" id="grid"></div>
        </section>
      </div>`;
    bindList();
    paintGrid();
    window.Site.decorateControls(root);
    root.querySelectorAll('.side-group > summary').forEach(summary => summary.insertAdjacentHTML('beforeend', `<span class="group-indicator" aria-hidden="true">${ICONS.plus}${ICONS.minus}</span>`));
    sizeHeroLabels();
    window.Site.syncMenu();
  }

  function sizeHeroLabels() {
    const art = root.querySelector('.hero-art');
    if (!art || !art.getClientRects().length) return;
    const matrix = art.getScreenCTM();
    const size = Math.ceil(12 / Math.hypot(matrix.c, matrix.d) * 1000) / 1000;
    art.querySelectorAll('[font-size]').forEach((label) => label.setAttribute('font-size', size));
  }

  function cardHTML(it) {
    const tagLine = isMaterial ? `<span class="chip accent">${esc(materialTypes[it.type])}</span>` : KIND === 'cases'
      ? it.carriers.map((c) => `<span class="chip">${esc(TAX.carriers[c])}</span>`).join('')
      : [...it.types.map((c) => `<span class="chip accent">${esc(TAX.types[c])}</span>`), ...it.carriers.map((c) => `<span class="chip">${esc(TAX.carriers[c])}</span>`)].join('');
    const preview = it.preview;
    const fav = favs.has(KIND, it.id);
    return `<article class="card">
      <div class="card-media">${preview ? `<img src="${esc(preview)}" alt="${esc(it.title)} ${isMaterial ? '作者产出效果，未复刻' : 'Demo 实际截图'}" loading="lazy">` : '<span class="ph">预览图</span>'}</div>
      <div class="card-body">
        <div class="card-title"><a href="#${hashKind}/${it.id}">${esc(it.title)}</a>
          <button class="fav-btn" type="button" data-fav="${it.id}" aria-pressed="${fav}" aria-label="${fav ? '取消收藏' : '收藏'}：${esc(it.title)}">${fav ? ICONS.starFill : ICONS.star}</button></div>
        <p class="card-sum" title="${esc(it.summary)}">${esc(it.summary)}</p>
        ${KIND === 'cases' ? energyPath(it) : ''}
        <div class="card-tags">${tagLine}</div>
      </div></article>`;
  }
  function paintGrid() {
    const list = filtered();
    const grid = document.getElementById('grid');
    grid.innerHTML = list.length ? list.map(cardHTML).join('') : `<div class="empty">没有符合条件的${itemName}。换个关键词，或清除筛选。</div>`;
    const dir = root.querySelector('#sort-dir');
    dir.setAttribute('aria-label', state.dir === 'asc' ? '正序' : '反序');
    dir.setAttribute('aria-pressed', String(state.dir === 'desc'));
    dir.innerHTML = state.dir === 'asc' ? ICONS.up : ICONS.down;
    document.getElementById('result-count').textContent = `${state.fav ? '我的收藏' : '当前筛选'} / ${list.length} 个条目`;
    paintSideCounts();
    syncURL();
  }
  function paintSideCounts() {
    document.querySelectorAll('.lib-side [data-group="carrier"], .lib-side [data-group="type"]').forEach((b) => {
      b.querySelector('.count').textContent = String(filtered({ ...state, [b.dataset.group]: b.dataset.value }).length).padStart(2, '0');
    });
  }
  function bindList() {
    root.querySelector('#lib-side').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.tool === 'export') return favs.export();
      if (b.dataset.tool === 'import') {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'application/json';
        inp.onchange = () => inp.files[0] && favs.import(inp.files[0]).then(() => { toast('已合并导入收藏'); renderList(); }).catch(() => toast('文件无法读取'));
        return inp.click();
      }
      const g = b.dataset.group;
      if (!g) return;
      if (g === 'fav') state.fav = !state.fav;
      else state[g] = b.dataset.value;
      renderList();
    });
    const s = root.querySelector('#search');
    s.addEventListener('input', () => { state.query = s.value.trim(); paintGrid(); });
    root.querySelector('#sort').addEventListener('change', (e) => { state.sort = e.target.value; paintGrid(); });
    root.querySelector('#sort-dir').addEventListener('click', () => { state.dir = state.dir === 'asc' ? 'desc' : 'asc'; paintGrid(); });
    for (const [id, key] of [['carrier-filter', 'carrier'], ['case-filter', 'caseId']]) {
      const select = root.querySelector('#' + id);
      if (select) select.addEventListener('change', (e) => { state[key] = e.target.value; paintGrid(); });
    }
    root.querySelector('#grid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-fav]');
      if (!b) return;
      e.preventDefault();
      const on = favs.toggle(KIND, b.dataset.fav);
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = on ? ICONS.starFill : ICONS.star;
      if (state.fav) paintGrid();
    });
  }

  /* ---------- 详情：舞台、刻度条、画幅、声音、全屏 ----------
   * 舞台在主体左列内按可用宽高等比适配；横屏 16:9、竖屏 9:16，自适应 Demo 使用 16:9。
   * 竖屏且旁边放得下时，节拍列表放到舞台右侧（data-side="1"），刻度条横跨两者。
   * 全屏：舞台按 contain 铺满屏幕，工具栏与刻度条浮在上下，静止 2.5 秒后淡出。
   * 与 Demo 的通信：同源 iframe，直接读写 contentWindow.__motion；画幅、声音、加载状态走 postMessage（docs/pipeline.md 第六节）。 */
  const PREF_ORIENT = 'ma-orient', PREF_SOUND = 'ma-sound';
  const SIDE_MIN = 220, SIDE_MAX = 360, MIN_STAGE_H = 200, BOTTOM = 16;
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const normOrient = (o) => (o === 'portrait' || o === 'p' ? 'portrait' : o === 'landscape' || o === 'l' ? 'landscape' : null);
  // 详情页 hash 可带参数，便于分享：#case/<id>?orient=portrait&t=3.5
  const hashParams = () => { const h = location.hash, i = h.indexOf('?'); return new URLSearchParams(i > -1 ? h.slice(i + 1) : ''); };
  function setHashParam(k, v) {
    const h = location.hash, i = h.indexOf('?');
    const p = new URLSearchParams(i > -1 ? h.slice(i + 1) : '');
    if (v == null) p.delete(k); else p.set(k, v);
    const s = p.toString();
    history.replaceState(null, '', location.pathname + location.search + (i > -1 ? h.slice(0, i) : h) + (s ? '?' + s : ''));
  }
  const SI = {
    play: window.Site.icon('play', 'i-play'), pause: window.Site.icon('pause', 'i-pause'),
    landscape: ICONS.landscape, portrait: ICONS.portrait,
    soundOn: window.Site.icon('soundOn', 'i-on'), soundOff: window.Site.icon('soundOff', 'i-off'),
    expand: window.Site.icon('expand', 'i-expand'), collapse: window.Site.icon('collapse', 'i-collapse'),
  };
  const SOUND_TEXT = { off: '关', on: '开', blocked: '待启用', pending: '开启中', none: '无' };
  const SOUND_TITLE = {
    off: '声音已关闭：点击开启（M）', on: '声音已开启：点击关闭（M）', pending: '正在开启声音…',
    blocked: '浏览器拦截了自动播放：点击这里或点击舞台一次即可出声', none: '这个 Demo 还没有声音设计',
  };

  let det = null; // 当前详情页的舞台控制器（离开详情页时销毁）
  let detailColumns = null;

  function stageHTML(it) {
    const want = wantedOrient();
    const t = Number(hashParams().get('t'));
    const autoplay = hashParams().get('autoplay') || q.get('autoplay');
    const src = `${it.demo}?embed=1&orient=${want}${Number.isFinite(t) && t > 0 ? `&t=${t}` : ''}${autoplay === '0' ? '&autoplay=0' : ''}`;
    const caption = KIND === 'patterns' ? `<p class="stage-caption">所属案例：${(it.sources || []).map((s) => { const c = byId(MA.cases, s.caseId); return c ? `<a href="cases.html#case/${c.id}">${esc(c.title)}</a>` : ''; }).join('、')}</p>` : '';
    return `<section class="stage-col" id="stage-col" aria-label="${esc(it.title)} Demo">
      <div class="stage-bar">
        <div class="stage-views" role="group" aria-label="查看方式">
        <div class="orient-seg" role="group" aria-label="画幅" hidden>
          <button type="button" data-orient="landscape" aria-pressed="false" title="横屏 1920×1080">${SI.landscape}<span class="lbl-mid">横屏 16:9</span></button>
          <button type="button" data-orient="portrait" aria-pressed="false" title="竖屏 1080×1920">${SI.portrait}<span class="lbl-mid">竖屏 9:16</span></button>
        </div>
        <span class="orient-badge" hidden></span>
        </div><div class="stage-controls" role="group" aria-label="播放控制">
        <button class="sound-btn" type="button" data-state="off" aria-pressed="false">${SI.soundOff}${SI.soundOn}<span class="sound-state">关</span></button>
        <button class="tool-btn" type="button" data-act="fullscreen" aria-label="全屏查看" title="全屏查看（F）">${SI.expand}${SI.collapse}<span class="lbl-wide">全屏</span></button>
        <button class="tool-btn" type="button" data-act="replay" disabled aria-disabled="true" aria-label="从头播放" title="从头播放">${ICONS.replay}<span class="lbl-wide">重播</span></button>
        <a class="tool-btn" data-act="open" href="${esc(it.demo)}" target="_blank" rel="noopener" aria-label="独立打开 Demo" title="在新标签页独立打开">${ICONS.external}<span class="lbl-wide">独立打开</span></a>
        </div>
      </div>
      <div class="stage-body">
        <div class="stage-frame" id="stage-frame" aria-busy="true">
          <iframe id="demo-frame" title="${esc(it.title)} Demo" src="${esc(src)}" allow="autoplay"></iframe>
          <div class="stage-loading" role="status"><div class="ld-card"><i class="ld-bar" role="progressbar" aria-label="资源下载" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><b></b></i><span class="ld-text">已下载 0.0 / 未知总量 · 0.0 MB/s · 文件 0 / 0 · 下载中</span><span class="ld-error" hidden></span><button type="button" class="btn ld-retry" hidden>重试</button></div></div>
          <div class="stage-hint" hidden>${SI.soundOn}<span>点击舞台启用声音</span></div>
        </div>
        <div class="beat-side"><p class="side-h">节拍点<small>BEATS</small></p><div class="side-beats" id="beat-side"></div></div>
      </div>
      ${caption}
      <div class="scrubber" id="scrubber" data-ready="0">
        <div class="scrub-row">
          <button class="icon-btn play-btn" type="button" id="scrub-play" disabled aria-disabled="true" data-playing="false" aria-label="播放" title="播放 / 暂停（空格）">${SI.play}${SI.pause}</button>
          <div class="scrub-track" id="scrub-track" tabindex="-1" disabled aria-disabled="true" role="slider" aria-label="时间轴（←/→ 跳 1 秒，Shift 跳到上 / 下一个节拍点）" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="00:00.00"><svg id="scrub-svg" preserveAspectRatio="none" aria-hidden="true"></svg><i class="head" id="scrub-head"></i><span class="scrub-tip" id="scrub-tip" aria-hidden="true"></span></div>
          <span class="scrub-time" aria-hidden="true"><b id="scrub-time">00:00.00</b><span class="dur" id="scrub-dur"></span></span>
        </div>
        <div class="beat-list" id="beat-list"></div>
      </div>
    </section>`;
  }
  // 画幅意向：hash 参数 → 页面查询参数 → 上次的选择 → 横屏
  function wantedOrient() {
    return normOrient(hashParams().get('orient')) || normOrient(q.get('orient')) || normOrient(store.get(PREF_ORIENT, null)) || 'landscape';
  }

  function mountStage(it) {
    const $ = (id) => document.getElementById(id);
    const el = root.querySelector('.detail');
    const want = wantedOrient();
    const d = det = {
      it, el, actions: root.querySelector('.page-actions'), col: $('stage-col'), bar: el.querySelector('.stage-bar'),
      frame: $('stage-frame'), ifr: $('demo-frame'), sc: $('scrubber'), track: $('scrub-track'), svg: $('scrub-svg'),
      caption: el.querySelector('.stage-caption'),
      head: $('scrub-head'), tip: $('scrub-tip'), time: $('scrub-time'), dur: $('scrub-dur'), play: $('scrub-play'),
      strip: $('beat-list'), side: $('beat-side'), seg: el.querySelector('.orient-seg'), badge: el.querySelector('.orient-badge'),
      snd: el.querySelector('.sound-btn'), fsBtn: el.querySelector('[data-act="fullscreen"]'), open: el.querySelector('[data-act="open"]'),
      hint: el.querySelector('.stage-hint'), loader: el.querySelector('.stage-loading'),
      m: null, unsub: null, D: (it.rhythm && it.rhythm.duration) || 0, markers: null, beats: [], beatKey: '', cur: -2,
      playing: null, lastText: '', lastPct: -1, pendingT: null, dragging: false,
      // 有竖屏预览图时先按意向画幅给出舞台框，随后采用 Demo 回报的画幅
      want, orient: it.previewPortrait && want === 'portrait' ? 'portrait' : 'landscape', orients: null,
      sound: { pref: store.get(PREF_SOUND, false) === true, state: 'off', available: true, pending: false, seq: 0 },
      loaded: false, fs: false, pseudo: false, lastPointerInCol: false,
      timers: new Set(), poll: 0, idleT: 0, touchAt: new WeakMap(),
    };
    paintOrient();
    paintBeats(true);
    renderSound();
    layout(); // 同步算一次，首帧就是正确尺寸

    // 加载状态：200ms 内就绪的不显示，避免闪一下
    later(() => { if (!d.loaded) d.loader.classList.add('show'); }, 200);
    d.ifr.addEventListener('load', () => { if (det !== d) return; hookFrame(); tryConnect(); });
    let tries = 0;
    d.poll = setInterval(() => { if (det !== d || d.m || ++tries > 600) clearInterval(d.poll); else tryConnect(); }, 100);

    // 工具栏
    d.loader.querySelector('.ld-retry').addEventListener('click', reloadFrame);
    d.bar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.orient) chooseOrient(b.dataset.orient);
      else if (b === d.snd) toggleSound();
      else if (b.dataset.act === 'fullscreen') toggleFs();
      else if (b.dataset.act === 'replay' && d.loaded) { d.m.seek(0); d.m.play(); }
    });
    d.play.addEventListener('click', () => togglePlay());
    const beatClick = (e) => { const b = e.target.closest('[data-t]'); if (b) seekTo(Number(b.dataset.t)); };
    d.strip.addEventListener('click', beatClick);
    d.strip.addEventListener('scroll', updateBeatOverflow, { passive: true });
    ['pointerdown', 'touchstart'].forEach((t) => d.strip.addEventListener(t, () => d.touchAt.set(d.strip, performance.now()), { passive: true }));
    d.strip.addEventListener('wheel', (e) => {
      if (d.strip.scrollWidth <= d.strip.clientWidth) return;
      d.touchAt.set(d.strip, performance.now());
      if (e.deltaY) { e.preventDefault(); d.strip.scrollLeft += e.deltaY; }
    }, { passive: false });
    d.side.addEventListener('click', beatClick);
    // 竖向节拍列表手动滚动后 4 秒内不自动跟随。
    ['pointerdown', 'wheel', 'touchstart'].forEach((t) => d.side.addEventListener(t, () => d.touchAt.set(d.side, performance.now()), { passive: true }));
    d.col.addEventListener('pointermove', poke, { passive: true });
    d.col.addEventListener('focusin', poke);
    bindTrack();
    mountDetailColumns();
  }

  function destroyDetail() {
    if (detailColumns) { detailColumns.ro.disconnect(); detailColumns = null; }
    const d = det;
    if (!d) return;
    det = null;
    clearInterval(d.poll);
    d.timers.forEach(clearTimeout);
    clearTimeout(d.idleT);
    if (d.unsub) { try { d.unsub(); } catch { /* iframe 已卸载 */ } }
    document.documentElement.classList.remove('ma-fs-lock');
    const fe = document.fullscreenElement || document.webkitFullscreenElement;
    if (fe && fe === d.col) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch { /* 已退出 */ } }
  }
  function later(fn, ms) {
    const d = det;
    const id = setTimeout(() => { d.timers.delete(id); if (det === d) fn(); }, ms);
    d.timers.add(id);
  }
  function post(msg) {
    try { det.ifr.contentWindow.postMessage(msg, location.origin && location.origin !== 'null' ? location.origin : '*'); } catch { /* iframe 尚未就绪 */ }
  }
  function frameWin() { try { return det && det.ifr.contentWindow; } catch { return null; } }
  function reloadFrame() {
    const d = det;
    if (d.unsub) { try { d.unsub(); } catch { /* 已卸载 */ } d.unsub = null; }
    d.m = null; d.loaded = false;
    setPlaybackReady(false);
    d.loader.querySelector('.ld-error').hidden = true;
    d.loader.querySelector('.ld-retry').hidden = true;
    d.loader.querySelector('.ld-bar b').style.transform = 'scaleX(0)';
    d.loader.querySelector('.ld-text').textContent = '已下载 0.0 / 未知总量 · 0.0 MB/s · 文件 0 / 0 · 下载中';
    d.loader.classList.add('show');
    d.frame.setAttribute('aria-busy', 'true');
    d.ifr.src = d.ifr.src;
  }

  /* ----- 尺寸 ----- */
  let layoutRaf = 0;
  function scheduleLayout() {
    if (!layoutRaf) layoutRaf = requestAnimationFrame(() => { layoutRaf = 0; sizeHeroLabels(); layout(); layoutColumns(); });
  }
  addEventListener('resize', scheduleLayout);
  function mountDetailColumns() {
    const el = root.querySelector('.detail'), cols = [...el.querySelector('.detail-grid').children];
    const header = document.getElementById('site-header'), actions = root.querySelector('.page-actions');
    const ro = new ResizeObserver(scheduleLayout);
    detailColumns = { el, cols, header, actions, ro };
    const targets = [el, ...cols, header, actions];
    if (det) targets.push(det.bar, det.sc, det.strip);
    targets.forEach(x => ro.observe(x));
    layoutColumns();
  }
  function layoutColumns() {
    if (!detailColumns) return;
    const { el, cols, actions } = detailColumns;
    const sticky = innerWidth > 1159 && !det?.fs;
    const top = actions.getBoundingClientRect().height + parseFloat(getComputedStyle(el).paddingTop);
    el.style.setProperty('--detail-sticky-top', `calc(var(--header-offset) + ${top}px)`);
    cols[0].classList.toggle('is-sticky', sticky);
    cols[1].classList.toggle('is-sticky', sticky && cols[0].getBoundingClientRect().height > cols[1].getBoundingClientRect().height);
  }
  function layout() {
    const d = det;
    if (!d) return;
    const vars = {};
    let mode = d.el.dataset.layout || 'split', side = '0';
    if (d.fs) {
      // 全屏：舞台按 contain 铺满，工具栏与刻度条为浮层，不参与计算
      const W = d.col.clientWidth, H = d.col.clientHeight, r = d.orient === 'portrait' ? 9 / 16 : 16 / 9;
      const w = Math.floor(Math.min(W, H * r)), h = Math.round(w / r);
      Object.assign(vars, { '--ifr-w': w, '--ifr-h': h });
    } else {
      const cs = getComputedStyle(d.el), colCS = getComputedStyle(d.col), scCS = getComputedStyle(d.sc);
      const W = d.col.getBoundingClientRect().width;
      const header = document.querySelector('.site-header');
      const headH = header ? header.getBoundingClientRect().height : 0;
      const gap = parseFloat(colCS.rowGap) || 0;
      const stripBlock = parseFloat(getComputedStyle(d.strip).height) + (parseFloat(scCS.rowGap) || 0);
      const scBase = d.sc.querySelector('.scrub-row').offsetHeight + parseFloat(scCS.paddingTop) + parseFloat(scCS.paddingBottom) + parseFloat(scCS.borderTopWidth) + parseFloat(scCS.borderBottomWidth);
      const actionH = d.actions.getBoundingClientRect().height;
      const chrome = headH + actionH + parseFloat(cs.paddingTop) + d.bar.offsetHeight + 2 * gap + BOTTOM + (d.caption ? d.caption.offsetHeight + gap : 0);
      const availH = (strip) => Math.max(MIN_STAGE_H, innerHeight - chrome - scBase - (strip ? stripBlock : 0));
      mode = innerWidth > 1159 ? 'split' : 'stack';
      Object.assign(vars, { '--stage-col': W });
      if (d.orient === 'portrait') {
        const h = Math.floor(Math.min(availH(false), W * 16 / 9)), w = Math.round(h * 9 / 16);
        if (W - w - gap >= SIDE_MIN) {
          side = '1';
          Object.assign(vars, { '--beat-side-w': Math.min(SIDE_MAX, W - w - gap), '--frame-w': w, '--frame-h': h, '--ifr-w': w, '--ifr-h': h });
        } else {
          const h2 = Math.floor(Math.min(availH(true), W * 16 / 9)), w2 = Math.round(h2 * 9 / 16);
          Object.assign(vars, { '--frame-w': W, '--frame-h': h2, '--ifr-w': w2, '--ifr-h': h2 });
        }
      } else {
        const w = Math.floor(Math.min(W, availH(true) * 16 / 9)), h = Math.round(w * 9 / 16);
        Object.assign(vars, { '--frame-w': w, '--frame-h': h, '--ifr-w': w, '--ifr-h': h });
      }
    }
    const el = d.el;
    if (el.dataset.layout !== mode) el.dataset.layout = mode;
    if (el.dataset.side !== side) el.dataset.side = side;
    for (const [k, v] of Object.entries(vars)) {
      const s = v + 'px';
      if (el.style.getPropertyValue(k) !== s) el.style.setProperty(k, s);
    }
    updateBeatOverflow();
  }

  function updateBeatOverflow() {
    const strip = det.strip;
    const left = strip.scrollLeft > 1, right = strip.scrollWidth - strip.clientWidth - strip.scrollLeft > 1;
    strip.dataset.overflow = left ? (right ? 'both' : 'left') : (right ? 'right' : '');
  }

  /* ----- 连接 Demo ----- */
  function tryConnect() {
    const d = det;
    if (!d) return;
    let m = null;
    try { m = d.ifr.contentWindow.__motion; } catch { return; }
    if (!m || !m.duration || m === d.m) return;
    if (d.unsub) { try { d.unsub(); } catch { /* 旧文档已卸载 */ } }
    d.m = m;
    d.D = m.duration;
    try { d.unsub = m.on(onFrame); } catch { d.unsub = null; }
    if (!d.markers && Array.isArray(m.markers) && m.markers.length) d.markers = m.markers.map((x) => ({ t: x.t, label: x.label }));
    applyOrients(Array.isArray(m.orients) ? m.orients : [], m.orient);
    paintBeats();

    onFrame(m.time, m.playing);
    hookFrame();
    syncSound();
    Promise.resolve(m.ready).then(() => { if (det === d && d.m === m) loadDone(); }, error => { if (det === d && d.m === m) loadFailed(error.message); });
  }
  // 同源 iframe：在 Demo 窗口里监听指针（全屏时唤出浮层）与 Esc（伪全屏时退出）
  function hookFrame() {
    const w = frameWin();
    try {
      if (!w || !w.document || w.__maHost) return;
      w.__maHost = true;
      w.addEventListener('pointermove', poke, { passive: true });
      w.addEventListener('pointerdown', poke, { passive: true });
      w.addEventListener('keydown', (e) => { if (e.key === 'Escape' && det && det.pseudo) setPseudo(false); }, true);
    } catch { /* 跨源时忽略 */ }
  }

  addEventListener('message', (e) => {
    const d = det;
    if (!d || e.source !== frameWin()) return;
    const msg = e.data;
    if (!msg || typeof msg.type !== 'string') return;
    if (msg.type === 'motion:loading') setLoading(msg);
    else if (msg.type === 'motion:ready') onReady(msg);
    else if (msg.type === 'motion:orient') {
      const o = normOrient(msg.orient);
      if (o) d.orient = o;
      if (msg.rejected) toast(`这个 Demo 只有${o === 'portrait' ? '竖屏' : '横屏'}画幅`);
      paintOrient();
      layout();
    } else if (msg.type === 'motion:sound') {
      d.sound.pending = false;
      d.sound.state = msg.state || (msg.on ? 'on' : 'off');
      renderSound();
    }
  });

  function onReady(msg) {
    const d = det;
    if (Array.isArray(msg.markers) && msg.markers.length) d.markers = msg.markers;
    if (msg.duration) d.D = msg.duration;
    applyOrients(Array.isArray(msg.orients) ? msg.orients : [], msg.orient);
    d.sound.available = msg.sound !== false;
    // 每个新载入的 Demo 都按上次的选择重发一次（同源子框架继承父页面的用户激活，无需新手势）
    if (d.sound.available && d.sound.pref) {
      d.sound.pending = true;
      post({ type: 'motion:sound', on: true });
      settleSound(); // 回报丢失时的兜底
    }
    tryConnect();
    paintBeats();
    syncSound();
    loadDone();
  }

  /* ----- 加载状态 ----- */
  function setPlaybackReady(ready) {
    const d = det;
    d.sc.dataset.ready = ready ? '1' : '0';
    for (const node of [d.play, d.el.querySelector('[data-act="replay"]'), d.track, ...d.col.querySelectorAll('[data-t]')]) {
      node.toggleAttribute('disabled', !ready);
      node.setAttribute('aria-disabled', String(!ready));
      node.tabIndex = ready ? 0 : -1;
    }
  }
  function setLoading(state) {
    const d = det;
    if (!d || d.loaded) return;
    const mb = n => ((n || 0) / 1e6).toFixed(1);
    const phase = { download: '下载中', decode: '解码中', frame: '准备首帧', error: '加载失败', ready: '就绪' };
    d.loader.querySelector('.ld-text').textContent = '已下载 ' + mb(state.loadedBytes) + ' / ' + (state.unknownTotal ? '未知总量' : mb(state.totalBytes) + ' MB') + ' · ' + mb(state.bytesPerSecond) + ' MB/s · 文件 ' + (state.filesDone || 0) + ' / ' + (state.filesTotal || 0) + ' · ' + phase[state.phase];
    const percent = Math.min(state.phase === 'ready' ? 1 : .99, state.progress || 0);
    d.loader.querySelector('.ld-bar b').style.transform = 'scaleX(' + percent + ')';
    d.loader.querySelector('.ld-bar').setAttribute('aria-valuenow', String(Math.floor(percent * 100)));
    if (state.error) loadFailed(state.error);
  }
  function loadFailed(reason) {
    const d = det;
    setPlaybackReady(false);
    d.loader.classList.add('show');
    d.loader.querySelector('.ld-error').hidden = false;
    d.loader.querySelector('.ld-error').textContent = '加载失败：' + reason;
    d.loader.querySelector('.ld-retry').hidden = false;
  }
  function loadDone() {
    const d = det;
    if (!d || d.loaded) return;
    d.loaded = true;
    setPlaybackReady(true);
    onFrame(d.m.time, d.m.playing);
    if (d.pendingT != null) { const t = d.pendingT; d.pendingT = null; if (Math.abs(d.m.time - t) > 1e-6) d.m.seek(t); }
    d.loader.classList.remove('show');
    d.frame.removeAttribute('aria-busy');
  }

  /* ----- 画幅 ----- */
  function applyOrients(list, cur) {
    const d = det;
    d.orients = list.slice();
    const adaptive = !d.orients.length;
    d.orient = adaptive ? 'landscape' : (normOrient(cur) && d.orients.includes(normOrient(cur)) ? normOrient(cur) : d.orients[0]);
    d.seg.hidden = d.orients.length < 2;
    d.badge.hidden = d.orients.length > 1;
    d.badge.textContent = adaptive ? '16:9 · 自适应' : d.orients[0] === 'portrait' ? '仅竖屏 9:16' : '仅横屏 16:9';
    d.badge.title = adaptive ? '这个 Demo 按 16:9 显示，内容随画框自适应。' : '这个 Demo 只提供一种画幅。';
    paintOrient();
    layout();
  }
  function paintOrient() {
    const d = det;
    d.el.dataset.orient = d.orient;
    d.seg.querySelectorAll('[data-orient]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.orient === d.orient)));
    const multi = d.orients && d.orients.length > 1;
    d.open.href = d.it.demo + (multi ? `?orient=${d.orient}` : '');
  }
  function chooseOrient(o) {
    const d = det;
    o = normOrient(o);
    if (!o || !d.orients || !d.orients.includes(o) || o === d.orient) return;
    d.want = o;
    store.set(PREF_ORIENT, o);
    setHashParam('orient', o);
    post({ type: 'motion:orient', orient: o });
    // 以 Demo 回报的 motion:orient 为准；万一消息丢失，稍后直接读一次
    later(() => { const m = d.m; if (m && normOrient(m.orient) && m.orient !== d.orient) { d.orient = m.orient; paintOrient(); layout(); } }, 500);
  }

  /* ----- 声音 ----- */
  function syncSound() {
    const d = det;
    if (!d) return;
    const w = frameWin();
    try {
      const a = w && w.MotionKit && w.MotionKit.audio;
      if (a && typeof a.state === 'string' && !d.sound.pending) d.sound.state = a.state;
    } catch { /* 跨源时只靠消息 */ }
    renderSound();
  }
  function renderSound() {
    const d = det, s = d.sound, b = d.snd;
    const st = !s.available ? 'none' : s.pending ? 'pending' : s.state;
    if (b.dataset.state !== st) {
      b.dataset.state = st;
      b.disabled = st === 'none';
      b.setAttribute('aria-pressed', String(st !== 'off' && st !== 'none'));
      b.querySelector('.sound-state').textContent = SOUND_TEXT[st] || '';
      b.title = SOUND_TITLE[st] || '';
      b.setAttribute('aria-label', `声音：${SOUND_TEXT[st] || ''}`);
    }
    d.hint.hidden = st !== 'blocked';
  }
  function toggleSound() {
    const d = det;
    if (!d || !d.sound.available) return;
    // 关 → 开；开（或开启中）→ 关；待启用（被自动播放策略挡住）时这次点击本身就是手势，直接再开一次
    const next = d.sound.pending ? false : d.sound.state !== 'on';
    d.sound.pref = next;
    store.set(PREF_SOUND, next);
    post({ type: 'motion:sound', on: next });
    d.sound.pending = next;
    if (!next) d.sound.state = 'off';
    renderSound();
    settleSound();
  }
  // 首次启动音频设备可能要一两秒：在 Demo 回报 motion:sound 之前保持“开启中”，2.5 秒仍无回报再读一次实际状态（只认最近一次操作）
  function settleSound() {
    const d = det, seq = ++d.sound.seq;
    later(() => { if (d.sound.pending && d.sound.seq === seq) { d.sound.pending = false; syncSound(); } }, 2500);
  }
  /* ----- 全屏 ----- */
  function toggleFs() { if (det) (det.fs ? exitFs : enterFs)(); }
  function enterFs() {
    const c = det.col, req = c.requestFullscreen || c.webkitRequestFullscreen;
    if (!req) return setPseudo(true); // iPhone Safari 等不支持元素全屏：用固定定位铺满窗口
    try { Promise.resolve(req.call(c)).catch(() => setPseudo(true)); } catch { setPseudo(true); }
  }
  function exitFs() {
    const d = det;
    if (d.pseudo) return setPseudo(false);
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex && (document.fullscreenElement || document.webkitFullscreenElement)) { try { Promise.resolve(ex.call(document)).catch(() => {}); } catch { /* 已退出 */ } }
  }
  function setPseudo(on) {
    const d = det;
    d.pseudo = on;
    document.documentElement.classList.toggle('ma-fs-lock', on);
    setFs(on);
  }
  function setFs(on) {
    const d = det;
    if (!d || d.fs === on) return;
    d.fs = on;
    d.col.classList.toggle('is-fs', on);
    d.col.classList.remove('idle');
    d.fsBtn.dataset.fs = String(on);
    d.fsBtn.setAttribute('aria-label', on ? '退出全屏' : '全屏查看');
    d.fsBtn.title = on ? '退出全屏（Esc）' : '全屏查看（F）';
    d.fsBtn.querySelector('.lbl-wide').textContent = on ? '退出全屏' : '全屏';
    layout();
    poke();
  }
  const onFsChange = () => {
    if (!det) return;
    const fe = document.fullscreenElement || document.webkitFullscreenElement;
    if (!det.pseudo) setFs(!!fe && fe === det.col);
  };
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  // 全屏时浮层在静止 2.5 秒后淡出（暂停、拖动、悬停在浮层上或键盘聚焦时保持显示）
  function poke() {
    const d = det;
    if (!d || !d.fs) return;
    d.col.classList.remove('idle');
    clearTimeout(d.idleT);
    d.idleT = setTimeout(() => {
      if (det !== d || !d.fs || !d.m || !d.m.playing || d.dragging) return;
      if (d.col.querySelector('.stage-bar:hover, .scrubber:hover')) return poke();
      const a = document.activeElement;
      if (a && d.col.contains(a) && a.matches(':focus-visible')) return poke();
      d.col.classList.add('idle');
    }, 2500);
  }

  /* ----- 时间轴与节拍点 ----- */
  function seekTo(t) {
    const d = det;
    if (!d || !d.loaded || !Number.isFinite(t)) return;
    const T = Math.max(0, Math.min(d.D || t, t));
    if (d.m) d.m.seek(T);
    else { d.pendingT = T; onFrame(T, false); } // Demo 尚未载入：先记下，连上后再定位
  }
  function togglePlay() { const d = det; if (d && d.loaded && d.m) d.m.toggle(); }
  function stepBeat(dir) {
    const d = det, t = d.m ? d.m.time : d.pendingT || 0;
    const ts = d.beats.map((b) => b.t);
    const nx = dir > 0 ? ts.find((v) => v > t + 0.05) : [...ts].reverse().find((v) => v < t - 0.05);
    if (nx != null) seekTo(nx);
  }

  function onFrame(t, playing) {
    const d = det;
    if (!d || !d.loaded) return;
    if (d.m && d.m.duration && d.m.duration !== d.D) { d.D = d.m.duration; paintBeats(); }
    const pct = d.D ? Math.max(0, Math.min(1, t / d.D)) * 100 : 0;
    if (Math.abs(pct - d.lastPct) > 0.005) { d.lastPct = pct; d.head.style.left = pct.toFixed(3) + '%'; }
    const txt = fmtT(t);
    if (txt !== d.lastText) {
      d.lastText = txt;
      d.time.textContent = txt;
      d.track.setAttribute('aria-valuenow', t.toFixed(2));
      d.track.setAttribute('aria-valuetext', txt);
    }
    // 播放状态只在变化时更新：两个图标常驻，用 data-playing 切换显隐（每帧重写按钮内容会让按下与抬起落在不同节点上，click 丢失）
    playing = !!playing;
    if (playing !== d.playing) {
      d.playing = playing;
      d.play.dataset.playing = String(playing);
      d.play.setAttribute('aria-label', playing ? '暂停' : '播放');
      if (d.fs) poke();
    }
    let idx = -1;
    for (let i = 0; i < d.beats.length; i++) { if (d.beats[i].t <= t + 0.02) idx = i; else break; }
    if (idx !== d.cur) setCurrentBeat(idx);
  }

  function computeBeats() {
    const d = det, it = d.it;
    const src = it.rhythm && it.rhythm.beats && it.rhythm.beats.length ? it.rhythm.beats : d.markers || [];
    return src.map((b) => ({ t: Number(b.t), label: b.label || '', note: b.note || '' }))
      .filter((b) => Number.isFinite(b.t) && b.t >= 0 && (!d.D || b.t <= d.D + 1e-3))
      .sort((a, b) => a.t - b.t);
  }
  function paintBeats(initial) {
    const d = det;
    const beats = computeBeats();
    const key = JSON.stringify([d.D, beats.map((b) => [b.t, b.label])]);
    if (key === d.beatKey) return;
    d.beatKey = key;
    d.beats = beats;
    d.cur = -2;
    const D = d.D;
    const W = 1000, H = 48;
    d.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const pts = energyPoints(d.it, D).map(([t, v]) => [t * W, H - 6 - v * (H - 14)]);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('');
    d.svg.innerHTML = `<rect class="base" x="0" y="${H - 5}" width="${W}" height="2"/>
      ${line ? `<path class="e-fill" d="${line}L${W} ${H}L0 ${H}Z"/><path class="e-line" d="${line}" vector-effect="non-scaling-stroke"/>` : ''}
      ${D ? beats.map((b, i) => { const x = ((b.t / D) * W).toFixed(2); return `<line class="tick" data-i="${i}" x1="${x}" x2="${x}" y1="2" y2="${H - 5}" vector-effect="non-scaling-stroke"/>`; }).join('') : ''}`;
    const empty = initial && !beats.length ? '正在读取节拍点…' : '这个 Demo 没有节拍标记：拖动刻度条逐帧查看';
    d.strip.innerHTML = beats.length
      ? beats.map((b, i) => `<button type="button" data-t="${b.t}" data-i="${i}"><b>${fmtB(b.t)}</b>${esc(b.label)}</button>`).join('')
      : `<span class="beat-empty">${empty}</span>`;
    d.side.innerHTML = beats.length
      ? beats.map((b, i) => `<button type="button" data-t="${b.t}" data-i="${i}"><b>${fmtB(b.t)}</b><span>${esc(b.label)}</span>${b.note ? `<small>${esc(b.note)}</small>` : ''}</button>`).join('')
      : `<span class="beat-empty">${empty}</span>`;
    updateBeatOverflow();
    setPlaybackReady(d.loaded);
    d.track.setAttribute('aria-valuemax', D ? D.toFixed(2) : '0');
    d.dur.textContent = D ? ` / ${fmtB(D)}` : '';
    if (d.m) onFrame(d.m.time, d.m.playing);
  }
  function setCurrentBeat(idx) {
    const d = det;
    d.cur = idx;
    for (const box of [d.strip, d.side]) {
      const a = box.querySelector('[aria-current]');
      if (a) a.removeAttribute('aria-current');
      const b = idx >= 0 ? box.querySelector(`[data-i="${idx}"]`) : null;
      if (b) {
        b.setAttribute('aria-current', 'true');
        if (box === d.side) follow(box, b);
        else if (box.clientWidth && performance.now() - (d.touchAt.get(box) ?? -Infinity) >= 2000) b.scrollIntoView({ block: 'nearest', inline: 'center', container: 'nearest' });
      }
    }
    const on = d.svg.querySelector('.tick.on');
    if (on) on.classList.remove('on');
    const tk = idx >= 0 ? d.svg.querySelector(`.tick[data-i="${idx}"]`) : null;
    if (tk) tk.classList.add('on');
  }
  // 只滚动竖向节拍列表自身，不滚动页面。
  function follow(box, item) {
    const d = det;
    if (!box.clientWidth || performance.now() - (d.touchAt.get(box) || 0) < 4000) return;
    const pos = item.offsetTop, size = item.offsetHeight;
    const view = box.clientHeight, cur = box.scrollTop, pad = 28;
    let to = null;
    if (pos < cur + pad) to = pos - pad;
    else if (pos + size > cur + view - pad) to = pos + size - view + pad;
    if (to == null) return;
    box.scrollTo({ top: Math.max(0, to), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  function bindTrack() {
    const d = det, tr = d.track;
    const tAt = (x) => { const r = tr.getBoundingClientRect(); return r.width ? Math.max(0, Math.min(1, (x - r.left) / r.width)) * (d.D || 0) : 0; };
    let raf = 0, lastX = 0, was = false;
    const flush = () => { raf = 0; seekTo(tAt(lastX)); };
    const tip = (x) => {
      if (!d.D) return;
      const t = tAt(x);
      const near = d.beats.find((b) => Math.abs(b.t - t) <= d.D * 0.012);
      d.tip.textContent = near ? `${fmtB(near.t)} · ${near.label}` : fmtB(t);
      d.tip.style.left = `${(t / d.D) * 100}%`;
      d.tip.classList.add('show');
    };
    tr.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0 || !d.D || !d.loaded) return;
      d.dragging = true;
      was = !!(d.m && d.m.playing);
      if (d.m) d.m.pause();
      try { tr.setPointerCapture(ev.pointerId); } catch { /* 不支持时退化为普通事件 */ }
      lastX = ev.clientX;
      flush();
      tip(ev.clientX);
    });
    tr.addEventListener('pointermove', (ev) => {
      if (ev.pointerType === 'mouse' || d.dragging) tip(ev.clientX);
      if (!d.dragging) return;
      lastX = ev.clientX;
      if (!raf) raf = requestAnimationFrame(flush);
    });
    const end = () => {
      if (!d.dragging) return;
      d.dragging = false;
      if (raf) { cancelAnimationFrame(raf); flush(); }
      if (was && d.m) d.m.play();
      if (!tr.matches(':hover')) d.tip.classList.remove('show');
    };
    tr.addEventListener('pointerup', end);
    tr.addEventListener('pointercancel', end);
    tr.addEventListener('lostpointercapture', end);
    tr.addEventListener('pointerleave', () => { if (!d.dragging) d.tip.classList.remove('show'); });
  }

  // 键盘：焦点在刻度条上、在舞台列内、全屏中，或焦点在页面主体且最近一次指针操作落在舞台列内时生效。
  // 焦点在按钮 / 链接上时空格与回车交给它们自己（避免双重切换）；焦点在 Demo 里时由 Demo 自己的快捷键处理（父页面收不到）。
  document.addEventListener('pointerdown', (e) => { if (det) det.lastPointerInCol = det.col.contains(e.target); }, true);
  document.addEventListener('keydown', (e) => {
    const d = det;
    if (!d || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Escape' && d.pseudo) { e.preventDefault(); setPseudo(false); return; }
    const tg = e.target instanceof Element ? e.target : document.body;
    if (tg.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
    const bodyFocus = tg === document.body || tg === document.documentElement;
    if (!(d.fs || d.col.contains(tg) || (bodyFocus && d.lastPointerInCol))) return;
    const k = e.key;
    if ((k === ' ' || k === 'Enter') && tg.closest('button, a, summary')) return;
    if (k === ' ') { e.preventDefault(); togglePlay(); }
    else if (k === 'ArrowRight' || k === 'ArrowLeft') {
      e.preventDefault();
      const dir = k === 'ArrowRight' ? 1 : -1;
      if (e.shiftKey) stepBeat(dir);
      else seekTo((d.m ? d.m.time : d.pendingT || 0) + dir);
    } else if (k === 'Home') { e.preventDefault(); seekTo(0); }
    else if (k === 'End') { e.preventDefault(); seekTo(d.D); }
    else if (k === 'f' || k === 'F') { e.preventDefault(); toggleFs(); }
    else if (k === 'm' || k === 'M') { e.preventDefault(); toggleSound(); }
  });

  /* ---------- 详情：说明 ---------- */
  const sec = (title, en, body) => `<section class="note-sec"><h2>${title}<small>${en}</small></h2>${body}</section>`;
  const ul = (arr) => (arr && arr.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>—</p>');
  const promptBox = (id, text) => `<div class="prompt-box"><pre id="${id}">${esc(text)}</pre><button class="btn" type="button" data-copy="${id}">${ICONS.copy}<span>复制</span></button></div>`;
  const documentLinks = it => {
    const links = [['research', '阅读说明与研究'], ['fidelity', '复刻对照'], ['licenses', '许可原文索引']].filter(([key]) => it[key]);
    return links.length ? sec('相关文档', 'DOCUMENTS', `<ul>${links.map(([key, label]) => `<li><a href="docs.html#doc/${esc(it[key])}">${label}</a></li>`).join('')}</ul>`) : '';
  };
  function pageActions(it) {
    const fav = favs.has(KIND, it.id);
    return `<div class="page-actions"><a class="btn back-btn" href="#" aria-label="返回${libName}">${ICONS.back}<span>返回${libName}</span></a><div class="detail-actions" role="group" aria-label="条目操作">
      <button class="btn" type="button" data-act="fav" aria-label="收藏" aria-pressed="${fav}" title="${fav ? '取消收藏' : '收藏'}">${fav ? ICONS.starFill : ICONS.star}<span class="fav-lbl">${fav ? '已收藏' : '收藏'}</span></button>
      <a class="btn bundle-btn" href="agent/${KIND}/${it.id}.json" download aria-label="下载资料包 JSON">${ICONS.download}<span>资料包 JSON</span></a>
      ${isMaterial ? '' : `<button class="btn primary" type="button" data-copy="p-impl">${ICONS.copy}<span>复制 Prompt</span></button>`}
    </div></div>`;
  }

  function materialNotes(it) {
    const galleryKinds = { style: '风格样张', work: '作品节选', theme: '主题预览' };
    const gallery = `<div class="grid material-gallery">${(it.gallery || []).map((image) => {
      const sourceUrl = image.sourceUrl || image.url;
      const license = typeof image.license === 'string' ? image.license : image.license?.notes || image.license?.name;
      return `<figure class="material-preview"><a class="card-media" href="${esc(image.path)}" target="_blank" rel="noopener" aria-label="查看原图：${esc(image.caption)}"><img src="${esc(image.path)}" alt="${esc(image.caption)}" loading="lazy"></a>
        <figcaption class="card-body"><span class="chip accent">${galleryKinds[image.kind]}</span><p class="card-sum">${esc(image.caption)}</p><p class="material-credit">作者产出效果，未复刻</p>${sourceUrl ? `<a class="material-credit" href="${esc(sourceUrl)}" target="_blank" rel="noopener">原图来源</a>` : ''}${license ? `<p class="material-credit">${esc(license)}</p>` : ''}</figcaption></figure>`;
    }).join('')}</div>`;
    const related = it.relatedEntries?.length ? `<ul>${it.relatedEntries.map((relation) => {
      const kind = { case: 'cases', pattern: 'patterns' }[relation.kind] || relation.kind;
      const entry = byId(MA[kind], relation.id);
      const hash = kind === 'cases' ? 'case' : 'pattern';
      return `<li><a href="${kind}.html#${hash}/${esc(relation.id)}">${esc(entry.title)}</a>：${esc(relation.note)}</li>`;
    }).join('')}</ul>` : `<p>本库暂无由此 ${it.type === 'agent-skill' ? 'skill' : '素材'} 产出的复刻案例</p>`;
    const references = [['README.zh-CN.md', '中文说明'], ['README.md', '原版说明']];
    if (it.type === 'prompt-kit') references.push(['template.md', '提示词模板'], ['rubric.md', '评审量表'], ['lib/audio/README.md', 'mgaudio 配乐说明'], ...it.snapshotFiles.filter(file => file.startsWith(it.snapshotPath + 'prompts/') && file.endsWith('.md')).map(file => [file.slice(it.snapshotPath.length), '风格提示词']));
    const snapshotLinks = it.snapshotPath ? `<ul><li><a href="docs.html#doc/${esc(it.snapshotPath + it.snapshotEntry)}">${it.type === 'agent-skill' ? '技能原文' : '素材原文'}（${esc(it.snapshotEntry)}）</a></li>${references.filter(([file]) => it.snapshotFiles.includes(it.snapshotPath + file) && file !== it.snapshotEntry).map(([file, label]) => `<li><a href="docs.html#doc/${esc(it.snapshotPath + file)}">${label}（${file}）</a></li>`).join('')}</ul>` : '';
    return { preview: `${it.gallery?.length ? sec('效果图画廊', '', gallery) : ''}${it.snapshotPath ? sec(it.type === 'agent-skill' ? 'skill 原文入口' : '素材原文入口', '', snapshotLinks) : sec('样例', '', `<a href="${esc(it.demo)}">打开样例</a><div class="stage-frame"><iframe src="${esc(it.demo)}" title="${esc(it.title)}"></iframe></div>`)}`, notes: [
      sec('说明', '', `<p>${esc(it.summary)}</p>`),
      sec('为什么归入本库', '', `<p>${esc(it.carrierNote)}</p>`),
      it.workflow?.length ? sec('工作流', '', `<ol>${it.workflow.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>`) : '',
      sec('适合与避用', '', `<h3>适合</h3>${ul(it.useCases)}<h3>避用</h3>${ul(it.avoid)}`),
      sec('关联条目', '', related),
      it.install ? sec('安装方式', '', promptBox('material-install', it.install)) : '',
      sec('许可与来源', '', `<dl class="kv"><dt>上游仓库</dt><dd><a href="${esc(it.upstream.url)}">${esc(it.upstream.repository)}</a></dd><dt>固定提交</dt><dd>${esc(it.upstream.commit)}</dd><dt>版本</dt><dd>${esc(it.upstream.version)}</dd><dt>${it.type === 'agent-skill' ? '技能' : '素材'}许可</dt><dd><a href="${esc(it.license.url)}">${esc(it.license.name)}</a></dd></dl><p>${esc(it.license.notes)}</p>${it.snapshotPath && it.snapshotFiles.includes(it.snapshotPath + 'LICENSE') ? `<p><a href="${esc(it.snapshotPath)}LICENSE">快照附带许可原文</a></p>` : ''}<ul>${it.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.title || source.label)}</a></li>`).join('')}</ul>`),
      documentLinks(it),
    ].join('') };
  }

  function renderMaterial(it) {
    destroyDetail();
    document.title = `${it.title} · Motion Atlas`;
    const material = materialNotes(it);
    root.innerHTML = `${pageActions(it)}<div class="detail material-detail"><div class="detail-grid"><section class="material-stage" aria-label="素材预览">${material.preview}</section><div class="info-col">
      <header class="detail-head"><p class="eyebrow">${String(items.indexOf(it) + 1).padStart(2, '0')} / 素材 · ${esc(it.id)}</p><h1>${esc(it.title)}</h1><div class="chips"><span class="chip accent">${esc(materialTypes[it.type])}</span></div></header>
      <div class="notes">${material.notes}</div></div></div></div>`;
    mountDetailColumns();
    bindDetailFavorite(it);
    root.querySelector('[data-copy]')?.addEventListener('click', () => copy(it.install, '安装方式已复制'));
    window.scrollTo(0, 0);
  }

  function bindDetailFavorite(it) {
    root.querySelector('[data-act="fav"]').addEventListener('click', (e) => {
      const b = e.currentTarget;
      const on = favs.toggle(KIND, it.id);
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? '取消收藏' : '收藏');
      b.innerHTML = `${on ? ICONS.starFill : ICONS.star}<span class="fav-lbl">${on ? '已收藏' : '收藏'}</span>`;
      b.title = on ? '取消收藏' : '收藏';
    });
  }

  function promptTabs(it) {
    const tabs = [['impl', '实现 Prompt', it.prompt]];
    if (it.videoPrompt) tabs.push(['video', '视频生成 Prompt', it.videoPrompt]);
    if (it.negativePrompt) tabs.push(['neg', '负向约束', it.negativePrompt]);
    return `<div class="tabs" role="tablist">${tabs.map(([k, l], i) => `<button class="tab" type="button" role="tab" aria-selected="${i === 0}" data-tab="${k}">${l}</button>`).join('')}</div>
      ${tabs.map(([k, , txt], i) => `<div data-panel="${k}"${i ? ' hidden' : ''}>${promptBox('p-' + k, txt)}</div>`).join('')}`;
  }
  function relPatterns(ids) {
    const ps = (ids || []).map((id) => byId(MA.patterns, id)).filter(Boolean);
    if (!ps.length) return '<p>—</p>';
    return `<div class="rel-list">${ps.map((p) => `<a href="patterns.html#pattern/${p.id}">${p.preview ? `<img src="${esc(p.preview)}" alt="" loading="lazy">` : '<img alt="">'}<span><strong>${esc(p.title)}</strong><small>${p.types.map((t) => TAX.types[t]).join(' · ')}</small></span></a>`).join('')}</div>`;
  }

  function caseNotes(it) {
    const c = it.composition || {};
    const beats = it.rhythm?.beats || [];
    return [
      sec('概述', 'OVERVIEW', `<p>${esc(it.summary)}</p>${it.focus ? `<p>${esc(it.focus)}</p>` : ''}`),
      beats.length ? sec('节奏结构', `BEAT SHEET · ${it.rhythm.duration ? it.rhythm.duration + 's' : ''}${it.rhythm.bpm ? ' · ' + it.rhythm.bpm + ' BPM' : ''}`,
        `<table class="beat-table"><thead><tr><th>时间</th><th>节拍</th><th>发生了什么</th></tr></thead><tbody>${beats.map((b) => `<tr><td><button type="button" data-seek="${b.t}">${fmtT(b.t).replace(/^00:/, '')}</button></td><td>${esc(b.label)}</td><td>${esc(b.note || '')}</td></tr>`).join('')}</tbody></table>${it.energyNote ? `<p>${esc(it.energyNote)}</p>` : ''}`) : '',
      sec('构成', 'COMPOSITION', `${it.tokens?.palette ? `<div class="swatches" style="margin-bottom:14px">${it.tokens.palette.map((p) => `<span class="swatch"><i style="background:${esc(p)}"></i>${esc(p)}</span>`).join('')}</div>` : ''}
        <dl class="kv">${[['色彩', c.color], ['字体', c.typography], ['版式', c.layout], ['图像', c.imagery], ['动效', c.motion], ['声音', c.sound], ['节奏', c.rhythm], ['协调', c.coherence]].filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`),
      it.tokens?.motion ? sec('动效 Token', 'MOTION TOKENS', `<table class="token-table"><tbody>${it.tokens.motion.map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.value)}</td></tr>`).join('')}</tbody></table>`) : '',
      it.layers ? sec('画面分层', 'LAYERS', `<table class="token-table"><tbody>${it.layers.map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.role)}</td></tr>`).join('')}</tbody></table>`) : '',
      it.observations ? sec('画面细节', 'DETAILS', `<table class="beat-table obs-table"><tbody>${it.observations.map((o) => `<tr><td>${esc(o.at)}</td><td>${esc(o.what)}</td></tr>`).join('')}</tbody></table>`) : '',
      sec('交互与状态', 'INTERACTION', ul(it.interaction)),
      sec('可复用 Prompt', 'PROMPT', promptTabs(it)),
      it.migration ? sec('迁移指南', 'MIGRATE', `<table class="token-table"><tbody>${it.migration.map((m) => `<tr><td>${esc(m.field)}</td><td>${esc(m.how)}</td></tr>`).join('')}</tbody></table>`) : '',
      sec('适用与边界', 'FIT', `<dl class="kv"><dt>适用</dt><dd>${esc((it.useCases || []).join('、'))}</dd><dt>避免</dt><dd>${esc((it.avoid || []).join('、'))}</dd></dl><div style="margin-top:10px">${ul(it.constraints)}</div>`),
      sec('关联巧思', 'PATTERNS', relPatterns(it.patternIds)),
      it.relatedEntries?.length ? sec('关联素材', 'MATERIALS', `<ul>${it.relatedEntries.filter(relation => relation.kind === 'material').map(relation => `<li><a href="materials.html#material/${esc(relation.id)}">${esc(byId(MA.materials, relation.id).title)}</a>：${esc(relation.note)}</li>`).join('')}</ul>`) : '',
      documentLinks(it),
    ].join('');
  }

  function patternNotes(it) {
    const comp = it.composition || {};
    return [
      sec('机制', 'MECHANISM', `<p>${esc(it.mechanism)}</p><dl class="kv" style="margin-top:12px"><dt>触发</dt><dd>${esc(it.trigger)}</dd><dt>结果</dt><dd>${esc(it.effect)}</dd></dl>`),
      it.timing ? sec('参数', 'PARAMETERS', `<table class="token-table"><tbody>${it.timing.map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.value)}${m.note ? `<br><small style="color:var(--muted)">${esc(m.note)}</small>` : ''}</td></tr>`).join('')}</tbody></table>`) : '',
      sec('可复用 Prompt', 'PROMPT', promptBox('p-impl', it.prompt)),
      sec('适用与边界', 'FIT', `<dl class="kv"><dt>适用</dt><dd>${esc((it.useCases || []).join('、'))}</dd><dt>避免</dt><dd>${esc((it.avoid || []).join('、'))}</dd></dl>`),
      sec('组合', 'COMPOSE', `<dl class="kv"><dt>职责</dt><dd>${esc(TAX.roles[comp.role] || comp.role || '—')}</dd><dt>搭配</dt><dd>${(comp.pairsWellWith || []).map((id) => { const p = byId(MA.patterns, id); return p ? `<a href="#pattern/${id}">${esc(p.title)}</a>` : esc(id); }).join('、') || '—'}</dd><dt>冲突</dt><dd>${(comp.conflicts || []).map((id) => { const p = byId(MA.patterns, id); return p ? `<a href="#pattern/${id}">${esc(p.title)}</a>` : esc(id); }).join('、') || '—'}</dd></dl>${comp.notes ? `<p style="margin-top:10px">${esc(comp.notes)}</p>` : ''}`),
      sec('可访问性', 'A11Y', `<dl class="kv"><dt>减少动态</dt><dd>${esc(it.accessibility?.reducedMotion || '—')}</dd><dt>键盘</dt><dd>${esc(it.accessibility?.keyboard || '—')}</dd></dl>`),
      documentLinks(it),
    ].join('');
  }

  function renderDetail(it) {
    destroyDetail();
    document.title = `${it.title} · Motion Atlas`;
    const isCase = KIND === 'cases';
    const idx = items.indexOf(it);
    const chips = isCase
      ? [...it.carriers.map((c) => `<span class="chip">${esc(TAX.carriers[c])}</span>`), ...(it.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`)]
      : [...it.types.map((c) => `<span class="chip accent">${esc(TAX.types[c])}</span>`), ...it.carriers.map((c) => `<span class="chip">${esc(TAX.carriers[c])}</span>`)];
    root.innerHTML = `
      ${pageActions(it)}
      <div class="detail" data-layout="split" data-orient="landscape" data-side="0">
        <div class="detail-grid">
          ${stageHTML(it)}
          <div class="info-col">
            <header class="detail-head">
              <p class="eyebrow">${String(idx + 1).padStart(2, '0')} / ${isCase ? 'CASE' : 'PATTERN'} · ${esc(it.id)}</p>
              <h1>${esc(it.title)}</h1>
              ${it.subtitle ? `<p class="sub">${esc(it.subtitle)}</p>` : ''}
              <div class="chips">${chips.join('')}</div>
            </header>
            <div class="notes">${isCase ? caseNotes(it) : patternNotes(it)}</div>
          </div>
        </div>
      </div>`;
    window.scrollTo(0, 0);
    mountStage(it);
    bindDetailFavorite(it);
    root.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(document.getElementById(b.dataset.copy).textContent, 'Prompt 已复制')));
    root.querySelectorAll('.tabs').forEach((tabs) => tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      tabs.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      tabs.parentElement.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.tab; });
    }));
    // 说明里的节拍表：只定位时间，不滚动页面；舞台不在视野里时（上下排列且已向下滚动）用提示告知
    root.querySelectorAll('[data-seek]').forEach((b) => b.addEventListener('click', () => {
      const t = Number(b.dataset.seek);
      seekTo(t);
      const r = det && det.frame.getBoundingClientRect();
      if (r && (r.bottom < 80 || r.top > innerHeight - 80)) toast(`已定位到 ${fmtB(t)}，舞台在页面上方`);
    }));
  }

  /* ---------- 路由 ---------- */
  function route() {
    const m = location.hash.match(/^#(case|pattern|material)\/([\w-]+)/);
    const it = m && byId(items, m[2]);
    if (it) { if (isMaterial) renderMaterial(it); else renderDetail(it); window.Site.syncMenu(); }
    else { destroyDetail(); renderList(); }
  }
  addEventListener('hashchange', () => window.Site.viewTransition(route));
  document.addEventListener('ma:favorites', () => {
    const c = document.querySelector('[data-group="fav"] .count');
    if (c) c.textContent = String(favs.all()[KIND].length).padStart(2, '0');
    paintSideCounts();
  });
  route();
})();
