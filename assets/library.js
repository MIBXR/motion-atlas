/* Motion Atlas · 案例库与巧思库（同一套浏览、筛选、详情与刻度条） */
(function () {
  'use strict';
  const { ICONS, favs, copy, esc, toast } = window.Site;
  const MA = window.MA;
  const KIND = document.body.dataset.lib; // 'cases' | 'patterns'
  const TAX = MA.taxonomy;
  const root = document.getElementById('app');
  const items = KIND === 'cases' ? MA.cases : MA.patterns;
  const byId = (list, id) => list.find((x) => x.id === id);

  /* ---------- 小工具 ---------- */
  const fmtT = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
  const evBadge = (ev) => `<span class="ev ev-${ev}">${esc(TAX.evidence[ev] || ev)}</span>`;
  const energyPath = (arr, w = 100, h = 26) => {
    if (!arr || !arr.length) return '';
    const pts = arr.map((v, i) => [(i / (arr.length - 1)) * w, h - 2 - v * (h - 4)]);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('');
    return `<svg class="energy" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="fill" d="${line}L${w} ${h}L0 ${h}Z"/><path class="stroke" d="${line}" vector-effect="non-scaling-stroke"/></svg>`;
  };
  const heroArt = KIND === 'cases'
    ? `<svg class="hero-art" viewBox="0 0 380 220" aria-hidden="true">
        <g font-family="var(--f-mono)" font-size="12" fill="var(--muted)"><text x="0" y="34">CAM</text><text x="0" y="84">HUD</text><text x="0" y="134">TYPE</text><text x="0" y="184">SFX</text></g>
        <g stroke="var(--line-2)"><path d="M50 30H380M50 80H380M50 130H380M50 180H380"/></g>
        <g fill="var(--ink)"><path d="M90 30l7-7 7 7-7 7zM190 30l7-7 7 7-7 7zM320 30l7-7 7 7-7 7z"/><rect x="120" y="74" width="120" height="12" rx="3" opacity=".85"/><rect x="260" y="74" width="80" height="12" rx="3" opacity=".4"/>
        <path d="M70 130l7-7 7 7-7 7zM100 130l7-7 7 7-7 7zM130 130l7-7 7 7-7 7z" opacity=".6"/></g>
        <g fill="var(--accent)"><circle cx="150" cy="180" r="5"/><circle cx="210" cy="180" r="5"/><circle cx="270" cy="180" r="5"/><circle cx="330" cy="180" r="5"/></g>
        <path d="M50 214C100 214 120 196 160 186S240 150 280 160 340 206 380 200" fill="none" stroke="var(--accent)" stroke-width="2"/>
        <g class="ph-anim"><rect x="236" y="8" width="2" height="212" fill="var(--accent)"/><path d="M231 4h12l-6 8z" fill="var(--accent)"/></g>
      </svg>`
    : `<svg class="hero-art" viewBox="0 0 380 220" aria-hidden="true">
        <g stroke="var(--line-2)" fill="none"><rect x="10" y="10" width="110" height="110"/><rect x="135" y="10" width="110" height="110"/><rect x="260" y="10" width="110" height="110"/></g>
        <path d="M10 120C50 120 40 10 120 10" fill="none" stroke="var(--ink)" stroke-width="2"/>
        <path d="M135 120C215 120 165 10 245 10" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
        <path d="M260 120C270 40 300 -10 370 10" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="4 4"/>
        <g fill="var(--accent)"><circle cx="10" cy="120" r="4"/><circle cx="120" cy="10" r="4"/><circle cx="135" cy="120" r="4"/><circle cx="245" cy="10" r="4"/></g>
        <g font-family="var(--f-mono)" font-size="12" fill="var(--muted)"><text x="10" y="146">glide</text><text x="135" y="146">snap</text><text x="260" y="146">overshoot</text></g>
        <g fill="var(--ink)"><rect x="10" y="170" width="40" height="40" rx="6"/><rect x="62" y="178" width="40" height="32" rx="6" opacity=".7"/><rect x="114" y="186" width="40" height="24" rx="6" opacity=".45"/><rect x="166" y="194" width="40" height="16" rx="6" opacity=".25"/></g>
        <path d="M230 210h140" stroke="var(--line-2)"/><path d="M230 210h40l20-36 20 36h60" fill="none" stroke="var(--accent)" stroke-width="2"/>
      </svg>`;

  /* ---------- 状态（列表筛选保存在 URL） ---------- */
  const q = new URLSearchParams(location.search);
  const state = {
    carrier: q.get('carrier') || 'all',
    source: q.get('source') || 'all',
    type: q.get('type') || 'all',
    caseId: q.get('case') || 'all',
    fav: q.get('fav') === '1',
    query: q.get('q') || '',
    sort: q.get('sort') || 'curated',
  };
  function syncURL() {
    const p = new URLSearchParams();
    if (state.carrier !== 'all') p.set('carrier', state.carrier);
    if (KIND === 'cases' && state.source !== 'all') p.set('source', state.source);
    if (KIND === 'patterns' && state.type !== 'all') p.set('type', state.type);
    if (KIND === 'patterns' && state.caseId !== 'all') p.set('case', state.caseId);
    if (state.fav) p.set('fav', '1');
    if (state.query) p.set('q', state.query);
    if (state.sort !== 'curated') p.set('sort', state.sort);
    const s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  const haystack = (it) => [it.id, it.title, it.subtitle, it.summary, ...(it.tags || []), ...(it.useCases || []), it.mechanism, it.trigger, it.effect,
    ...(it.carriers || []).map((c) => TAX.carriers[c]), ...(it.types || []).map((c) => TAX.types[c]), TAX.sources?.[it.source]].filter(Boolean).join(' ').toLowerCase();
  function filtered() {
    const words = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    let list = items.filter((it) => {
      if (state.carrier !== 'all' && !(it.carriers || []).includes(state.carrier)) return false;
      if (KIND === 'cases' && state.source !== 'all' && it.source !== state.source) return false;
      if (KIND === 'patterns' && state.type !== 'all' && !(it.types || []).includes(state.type)) return false;
      if (KIND === 'patterns' && state.caseId !== 'all' && !(it.sources || []).some((s) => s.caseId === state.caseId)) return false;
      if (state.fav && !favs.has(KIND, it.id)) return false;
      if (words.length) { const h = haystack(it); if (!words.every((w) => h.includes(w))) return false; }
      return true;
    });
    if (state.sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'zh'));
    if (state.sort === 'energy') list = [...list].sort((a, b) => avg(b.energy) - avg(a.energy));
    return list;
  }
  const avg = (a) => (a && a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

  /* ---------- 列表 ---------- */
  function sideButton(group, value, label, count) {
    const pressed = (group === 'fav' ? state.fav : state[group] === value && !state.fav) ? 'true' : 'false';
    return `<li><button type="button" data-group="${group}" data-value="${esc(value)}" aria-pressed="${pressed}"><span>${esc(label)}</span><span class="count">${String(count).padStart(2, '0')}</span></button></li>`;
  }
  function renderList() {
    document.title = (KIND === 'cases' ? '案例库' : '巧思库') + ' · Motion Atlas';
    const carriers = Object.entries(TAX.carriers);
    const countBy = (fn) => items.filter(fn).length;
    let side = `<div class="side-group"><h2>${KIND === 'cases' ? '案例载体' : '巧思类型'}</h2><ul class="side-list">`;
    if (KIND === 'cases') {
      side += sideButton('carrier', 'all', '全部案例', items.length);
      for (const [k, v] of carriers) side += sideButton('carrier', k, v, countBy((it) => it.carriers.includes(k)));
      side += `</ul></div><div class="side-group"><h2>参考来源</h2><ul class="side-list">`;
      side += sideButton('source', 'all', '全部来源', items.length);
      for (const [k, v] of Object.entries(TAX.sources)) side += sideButton('source', k, v, countBy((it) => it.source === k));
    } else {
      side += sideButton('type', 'all', '全部巧思', items.length);
      for (const [k, v] of Object.entries(TAX.types)) side += sideButton('type', k, v, countBy((it) => it.types.includes(k)));
      side += `</ul></div><div class="side-group"><h2>适用载体</h2><ul class="side-list">`;
      side += sideButton('carrier', 'all', '全部载体', items.length);
      for (const [k, v] of carriers) side += sideButton('carrier', k, v, countBy((it) => it.carriers.includes(k)));
    }
    side += `</ul></div><div class="side-group"><h2>收藏与工具</h2><ul class="side-list">
      ${sideButton('fav', '1', '我的收藏', favs.all()[KIND].length)}
      <li><button type="button" data-tool="export"><span>导出收藏备份</span>${ICONS.download}</button></li>
      <li><button type="button" data-tool="import"><span>导入收藏备份</span>${ICONS.upload}</button></li>
      <li><a href="${KIND === 'cases' ? 'patterns.html' : 'cases.html'}"><span>${KIND === 'cases' ? '浏览巧思库' : '浏览案例库'}</span>${ICONS.arrow}</a></li>
      </ul></div>
      <p class="side-foot"><b>●</b> SEEKABLE / SOURCE-BACKED<br>Demo 可逐帧定位；证据等级见各条目</p>`;

    const caseOptions = KIND === 'patterns'
      ? `<select class="select" id="case-filter" aria-label="来源案例"><option value="all">全部来源案例</option>${MA.cases.map((c) => `<option value="${c.id}"${state.caseId === c.id ? ' selected' : ''}>${esc(c.title)}</option>`).join('')}</select>` : '';
    const sortOptions = KIND === 'cases'
      ? [['curated', '策展顺序'], ['energy', '能量强 → 弱'], ['title', '名称']]
      : [['curated', '策展顺序'], ['title', '名称']];

    root.innerHTML = `
      <div class="lib">
        <aside class="lib-side" id="lib-side" aria-label="${KIND === 'cases' ? '案例分类' : '巧思分类'}">${side}</aside>
        <section>
          <header class="lib-head">
            <div>
              <p class="eyebrow">${KIND === 'cases' ? 'CASE COLLECTION · RHYTHM / MOTION / HUD' : 'PATTERN COLLECTION · ATOMIC MECHANISMS'}</p>
              <h1>${KIND === 'cases' ? '先看懂节拍，<br>再拿走<em>动势</em>。' : '一个触发，<br>一种<em>可借用</em>的结果。'}</h1>
              <p>${KIND === 'cases'
                ? `${items.length} 个完整案例：拆成镜头、信息层、文字、转场与声音轨道，附节拍表、动效 Token、可复用 Prompt 与可逐帧定位的 Demo。`
                : `${items.length} 个独立巧思：每项都有触发、结果、参数、组合边界、可复制 Prompt 和单文件 Demo，可以跨案例组合。`}</p>
            </div>
            ${heroArt}
          </header>
          <div class="toolbar">
            <button class="btn side-toggle" type="button" aria-expanded="false" aria-controls="lib-side">${ICONS.filter}<span>分类与工具</span></button>
            <label class="field">${ICONS.search}<span class="sr-only">搜索</span><input id="search" type="search" placeholder="${KIND === 'cases' ? '搜索案例、节奏、转场、HUD…' : '搜索巧思、触发、转场、参数…'}" value="${esc(state.query)}"><span class="kbd" aria-hidden="true">/</span></label>
            ${caseOptions}
            <select class="select" id="sort" aria-label="排序">${sortOptions.map(([v, l]) => `<option value="${v}"${state.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
          </div>
          <div class="result-line"><span id="result-count"></span><span>${KIND === 'cases' ? '每个案例都能拖动时间轴' : '每个巧思都有独立 Demo'}</span></div>
          <div class="grid" id="grid"></div>
        </section>
      </div>`;
    bindList();
    paintGrid();
  }

  function cardHTML(it, i) {
    const tagLine = KIND === 'cases'
      ? [...it.carriers.map((c) => `<span class="chip">${esc(TAX.carriers[c])}</span>`), `<span class="chip accent">${esc(TAX.sources[it.source])}</span>`].join('')
      : [...it.types.map((c) => `<span class="chip accent">${esc(TAX.types[c])}</span>`), ...it.carriers.map((c) => `<span class="chip">${esc(TAX.carriers[c])}</span>`)].join('');
    const label = KIND === 'cases' ? TAX.carriers[it.carriers[0]] : TAX.types[it.types[0]];
    const fav = favs.has(KIND, it.id);
    return `<article class="card">
      <div class="card-media">${it.preview ? `<img src="${esc(it.preview)}" alt="${esc(it.title)} Demo 实际截图" loading="lazy">` : '<span class="ph">PREVIEW</span>'}
        <span class="card-index">${String(i + 1).padStart(2, '0')} / ${esc(label)}</span></div>
      <div class="card-body">
        <div class="card-title"><a href="#${KIND === 'cases' ? 'case' : 'pattern'}/${it.id}">${esc(it.title)}</a>
          <button class="fav-btn" type="button" data-fav="${it.id}" aria-pressed="${fav}" aria-label="${fav ? '取消收藏' : '收藏'}：${esc(it.title)}">${fav ? ICONS.starFill : ICONS.star}</button></div>
        <p class="card-sum">${esc(it.summary)}</p>
        ${KIND === 'cases' && it.energy ? energyPath(it.energy) : ''}
        <div class="card-tags">${tagLine}</div>
      </div></article>`;
  }
  function paintGrid() {
    const list = filtered();
    const grid = document.getElementById('grid');
    grid.innerHTML = list.length ? list.map(cardHTML).join('') : `<div class="empty">没有符合条件的${KIND === 'cases' ? '案例' : '巧思'}。换个关键词，或清除分类筛选。</div>`;
    document.getElementById('result-count').textContent = `${state.fav ? '我的收藏' : '当前筛选'} / ${list.length} 个条目`;
    syncURL();
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
      else { state[g] = b.dataset.value; state.fav = false; }
      renderList();
    });
    const s = root.querySelector('#search');
    s.addEventListener('input', () => { state.query = s.value.trim(); paintGrid(); });
    root.querySelector('#sort').addEventListener('change', (e) => { state.sort = e.target.value; paintGrid(); });
    const cf = root.querySelector('#case-filter');
    if (cf) cf.addEventListener('change', (e) => { state.caseId = e.target.value; paintGrid(); });
    const st = root.querySelector('.side-toggle');
    st.addEventListener('click', () => { const open = root.querySelector('#lib-side').classList.toggle('open'); st.setAttribute('aria-expanded', String(open)); });
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
  addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      const s = document.getElementById('search');
      if (s) { e.preventDefault(); s.focus(); }
    }
  });

  /* ---------- 详情：舞台与刻度条 ---------- */
  let poll = 0, unsub = null;
  function stageHTML(it) {
    return `<div class="stage-panel">
      <div class="stage-tools">
        <div class="seg" role="group" aria-label="预览尺寸">
          <button type="button" data-size="fit" aria-pressed="true">适应面板</button>
          <button type="button" data-size="1080" aria-pressed="false">成片 1920×1080</button>
          <button type="button" data-size="phone" aria-pressed="false">手机 390</button>
        </div>
        <button class="btn" type="button" data-act="replay">${ICONS.replay}<span>重播</span></button>
        <a class="btn ghost" href="${esc(it.demo)}" target="_blank" rel="noopener">${ICONS.external}<span>独立打开</span></a>
      </div>
      <div class="stage-frame fit" id="stage-frame"><iframe id="demo-frame" title="${esc(it.title)} Demo" src="${esc(it.demo)}?embed=1" allow="autoplay"></iframe></div>
      <p class="stage-note" id="stage-note">适应面板使用真实 CSS 像素排版；“成片”按 1920×1080 画幅等比缩放，用于检查视频构图。</p>
      <div class="scrubber" id="scrubber" hidden>
        <div class="scrub-row">
          <button class="icon-btn" type="button" id="scrub-play" aria-label="播放">${ICONS.play}</button>
          <div class="scrub-track" id="scrub-track" tabindex="0" role="slider" aria-label="时间轴" aria-valuemin="0"><svg id="scrub-svg" preserveAspectRatio="none"></svg><i class="head" id="scrub-head"></i></div>
          <output id="scrub-time">00:00.00</output>
        </div>
        <div class="beat-list" id="beat-list"></div>
      </div>
    </div>`;
  }

  function sizeFrame(mode) {
    const box = document.getElementById('stage-frame');
    const fr = document.getElementById('demo-frame');
    if (!box || !fr) return;
    box.className = 'stage-frame ' + (mode === '1080' ? 'scaled' : mode);
    fr.style.cssText = '';
    if (mode === '1080') {
      const s = Math.min(box.clientWidth / 1920, box.clientHeight / 1080);
      fr.style.width = '1920px'; fr.style.height = '1080px';
      fr.style.transform = `translate(-50%, -50%) scale(${s})`;
    }
  }

  function bindStage(it) {
    let mode = 'fit';
    const tools = root.querySelector('.stage-tools');
    tools.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.size) {
        mode = b.dataset.size;
        tools.querySelectorAll('[data-size]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        sizeFrame(mode);
        // 尺寸变化后重新载入，让作品按新视口布局
        reloadFrame();
      }
      if (b.dataset.act === 'replay') {
        const m = frameMotion();
        if (m) { m.seek(0); m.play(); } else reloadFrame();
      }
    });
    const ro = new ResizeObserver(() => sizeFrame(mode));
    ro.observe(document.getElementById('stage-frame'));
    watchMotion(it);
  }
  function reloadFrame() {
    const fr = document.getElementById('demo-frame');
    const src = fr.getAttribute('src');
    fr.src = 'about:blank';
    setTimeout(() => { fr.src = src; watchMotion(currentItem); }, 30);
  }
  function frameMotion() {
    const fr = document.getElementById('demo-frame');
    try { return fr && fr.contentWindow && fr.contentWindow.__motion; } catch { return null; }
  }

  function watchMotion(it) {
    clearInterval(poll);
    if (unsub) { try { unsub(); } catch { /* iframe 已卸载 */ } unsub = null; }
    const sc = document.getElementById('scrubber');
    if (!sc) return;
    sc.hidden = true;
    let tries = 0;
    poll = setInterval(() => {
      const m = frameMotion();
      if (m && m.duration) { clearInterval(poll); setupScrubber(m, it); }
      else if (++tries > 120) clearInterval(poll);
    }, 250);
  }

  function setupScrubber(m, it) {
    const sc = document.getElementById('scrubber');
    const track = document.getElementById('scrub-track');
    const svg = document.getElementById('scrub-svg');
    const head = document.getElementById('scrub-head');
    const out = document.getElementById('scrub-time');
    const play = document.getElementById('scrub-play');
    const list = document.getElementById('beat-list');
    sc.hidden = false;
    const D = m.duration;
    const beats = (it.rhythm && it.rhythm.beats && it.rhythm.beats.length ? it.rhythm.beats : (m.markers || []).map((x) => ({ t: x.t, label: x.label })));
    track.setAttribute('aria-valuemax', String(D));
    const W = 1000, H = 56;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const e = it.energy || [];
    const ePts = e.map((v, i) => [(i / Math.max(1, e.length - 1)) * W, H - 6 - v * (H - 16)]);
    const eLine = ePts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
    svg.innerHTML = `
      <rect x="0" y="${H - 6}" width="${W}" height="2" fill="var(--line-2)"/>
      ${eLine ? `<path d="${eLine}L${W} ${H}L0 ${H}Z" fill="var(--accent-soft)"/><path d="${eLine}" fill="none" stroke="var(--accent)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>` : ''}
      ${beats.map((b) => `<rect x="${((b.t / D) * W).toFixed(1)}" y="2" width="1.5" height="${H - 8}" fill="var(--ink)" opacity=".35"/>`).join('')}`;
    list.innerHTML = beats.map((b) => `<button type="button" data-t="${b.t}"><b>${fmtT(b.t).replace(/^00:/, '')}</b>${esc(b.label)}</button>`).join('');
    const paint = (t, playing) => {
      head.style.left = `${(t / D) * 100}%`;
      out.textContent = fmtT(t);
      track.setAttribute('aria-valuenow', t.toFixed(2));
      track.setAttribute('aria-valuetext', fmtT(t));
      play.innerHTML = playing ? ICONS.pause : ICONS.play;
      play.setAttribute('aria-label', playing ? '暂停' : '播放');
    };
    unsub = m.on(paint);
    paint(m.time, m.playing);
    const seekAt = (clientX) => {
      const r = track.getBoundingClientRect();
      m.seek(Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * D);
    };
    let dragging = false, was = false;
    track.onpointerdown = (ev) => { dragging = true; was = m.playing; m.pause(); track.setPointerCapture(ev.pointerId); seekAt(ev.clientX); };
    track.onpointermove = (ev) => { if (dragging) seekAt(ev.clientX); };
    track.onpointerup = () => { dragging = false; if (was) m.play(); };
    track.onkeydown = (ev) => {
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault();
        const dir = ev.key === 'ArrowRight' ? 1 : -1;
        if (ev.shiftKey) {
          const ts = beats.map((b) => b.t).sort((a, b) => a - b);
          const nx = dir > 0 ? ts.find((v) => v > m.time + 0.05) : [...ts].reverse().find((v) => v < m.time - 0.05);
          if (nx != null) m.seek(nx);
        } else m.seek(m.time + dir);
      } else if (ev.key === ' ') { ev.preventDefault(); m.toggle(); }
      else if (ev.key === 'Home') m.seek(0);
    };
    play.onclick = () => m.toggle();
    list.onclick = (ev) => { const b = ev.target.closest('button'); if (b) { m.seek(Number(b.dataset.t)); } };
    root.querySelectorAll('[data-seek]').forEach((b) => { b.onclick = () => { m.seek(Number(b.dataset.seek)); document.getElementById('stage-frame').scrollIntoView({ block: 'nearest' }); }; });
  }

  /* ---------- 详情：说明 ---------- */
  const sec = (title, en, body) => `<section class="note-sec"><h2>${title}<small>${en}</small></h2>${body}</section>`;
  const ul = (arr) => (arr && arr.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>—</p>');
  const promptBox = (id, text) => `<div class="prompt-box"><pre id="${id}">${esc(text)}</pre><button class="btn" type="button" data-copy="${id}">${ICONS.copy}<span>复制</span></button></div>`;

  function promptTabs(it) {
    const tabs = [['impl', '实现 Prompt', it.prompt]];
    if (it.videoPrompt) tabs.push(['video', '视频生成 Prompt', it.videoPrompt]);
    if (it.negativePrompt) tabs.push(['neg', '负向约束', it.negativePrompt]);
    return `<div class="tabs" role="tablist">${tabs.map(([k, l], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${k}">${l}</button>`).join('')}</div>
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
        `<table class="beat-table"><thead><tr><th>时间</th><th>节拍</th><th>发生了什么</th></tr></thead><tbody>${beats.map((b) => `<tr><td><button type="button" data-seek="${b.t}">${fmtT(b.t).replace(/^00:/, '')}</button></td><td>${esc(b.label)}</td><td>${esc(b.note || '')}</td></tr>`).join('')}</tbody></table>`) : '',
      sec('构成', 'COMPOSITION', `${it.tokens?.palette ? `<div class="swatches" style="margin-bottom:14px">${it.tokens.palette.map((p) => `<span class="swatch"><i style="background:${esc(p)}"></i>${esc(p)}</span>`).join('')}</div>` : ''}
        <dl class="kv">${[['色彩', c.color], ['字体', c.typography], ['版式', c.layout], ['图像', c.imagery], ['动效', c.motion], ['声音', c.sound], ['节奏', c.rhythm], ['协调', c.coherence]].filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`),
      it.tokens?.motion ? sec('动效 Token', 'MOTION TOKENS', `<table class="token-table"><tbody>${it.tokens.motion.map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.value)}</td></tr>`).join('')}</tbody></table>`) : '',
      it.layers ? sec('画面分层', 'LAYERS', `<table class="token-table"><tbody>${it.layers.map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.role)}</td></tr>`).join('')}</tbody></table>`) : '',
      it.observations ? sec('逐帧观察', 'OBSERVED', `<table class="beat-table"><tbody>${it.observations.map((o) => `<tr><td>${esc(o.at)}</td><td>${esc(o.what)}</td></tr>`).join('')}</tbody></table>`) : '',
      sec('交互与状态', 'INTERACTION', ul(it.interaction)),
      sec('可复用 Prompt', 'PROMPT', promptTabs(it)),
      it.migration ? sec('迁移指南', 'MIGRATE', `<table class="token-table"><tbody>${it.migration.map((m) => `<tr><td>${esc(m.field)}</td><td>${esc(m.how)}</td></tr>`).join('')}</tbody></table>`) : '',
      sec('适用与边界', 'FIT', `<dl class="kv"><dt>适用</dt><dd>${esc((it.useCases || []).join('、'))}</dd><dt>避免</dt><dd>${esc((it.avoid || []).join('、'))}</dd></dl><div style="margin-top:10px">${ul(it.constraints)}</div>`),
      sec('关联巧思', 'PATTERNS', relPatterns(it.patternIds)),
      sec('来源与证据', 'SOURCES', `<p>${evBadge(it.evidence)} ${it.capturedAt ? `<span class="chip">采集 ${esc(it.capturedAt)}</span>` : ''} ${it.research ? `<a class="chip" href="docs.html#doc/${esc(it.research)}">阅读研究笔记</a>` : ''}</p>
        <ul style="margin-top:10px">${(it.sources || []).map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}${s.type ? ` · ${esc(s.type)}` : ''}<br><small style="color:var(--muted)">${esc(s.note || '')}</small></li>`).join('')}</ul>`),
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
      sec('来源', 'SOURCES', `<div class="rel-list">${(it.sources || []).map((s) => { const c = byId(MA.cases, s.caseId); return c ? `<a href="cases.html#case/${c.id}">${c.preview ? `<img src="${esc(c.preview)}" alt="" loading="lazy">` : '<img alt="">'}<span><strong>${esc(c.title)}</strong><small>${esc(TAX.evidence[s.evidence] || s.evidence)}${s.locator ? ' · ' + esc(s.locator) : ''}</small></span></a>` : ''; }).join('')}</div>
        <ul style="margin-top:12px">${(it.sources || []).map((s) => `<li>${evBadge(s.evidence)} ${esc(s.observation)}</li>`).join('')}</ul>`),
    ].join('');
  }

  let currentItem = null;
  function renderDetail(it) {
    currentItem = it;
    document.title = `${it.title} · Motion Atlas`;
    const isCase = KIND === 'cases';
    const idx = items.indexOf(it);
    const chips = isCase
      ? [...it.carriers.map((c) => `<span class="chip">${esc(TAX.carriers[c])}</span>`), `<span class="chip accent">${esc(TAX.sources[it.source])}</span>`, ...(it.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`)]
      : [...it.types.map((c) => `<span class="chip accent">${esc(TAX.types[c])}</span>`), ...it.carriers.map((c) => `<span class="chip">${esc(TAX.carriers[c])}</span>`)];
    const fav = favs.has(KIND, it.id);
    root.innerHTML = `
      <div class="detail">
        <div class="detail-bar">
          <a class="back" href="#">${ICONS.back}<span>返回${isCase ? '案例库' : '巧思库'}</span></a>
          <span class="spacer"></span>
          <button class="btn" type="button" data-act="fav" aria-pressed="${fav}">${fav ? ICONS.starFill : ICONS.star}<span>${fav ? '已收藏' : '收藏'}</span></button>
          <button class="btn primary" type="button" data-copy="p-impl">${ICONS.copy}<span>复制 Prompt</span></button>
          <a class="btn" href="agent/${KIND}/${it.id}.json" download>${ICONS.download}<span>资料包 JSON</span></a>
        </div>
        <header class="detail-head">
          <p class="eyebrow">${String(idx + 1).padStart(2, '0')} / ${isCase ? 'CASE' : 'PATTERN'} · ${esc(it.id)}</p>
          <h1>${esc(it.title)}</h1>
          ${it.subtitle ? `<p class="sub">${esc(it.subtitle)}</p>` : ''}
          <div class="chips">${chips.join('')} ${evBadge(it.evidence || (it.sources && it.sources[0] && it.sources[0].evidence) || 'original')}</div>
        </header>
        <div class="detail-grid">
          ${stageHTML(it)}
          <div class="notes">${isCase ? caseNotes(it) : patternNotes(it)}</div>
        </div>
      </div>`;
    bindStage(it);
    root.querySelector('[data-act="fav"]').addEventListener('click', (e) => {
      const b = e.currentTarget;
      const on = favs.toggle(KIND, it.id);
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = `${on ? ICONS.starFill : ICONS.star}<span>${on ? '已收藏' : '收藏'}</span>`;
    });
    root.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(document.getElementById(b.dataset.copy).textContent, 'Prompt 已复制')));
    root.querySelectorAll('.tabs').forEach((tabs) => tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      tabs.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      tabs.parentElement.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.tab; });
    }));
    window.scrollTo(0, 0);
  }

  /* ---------- 路由 ---------- */
  function route() {
    clearInterval(poll);
    const m = location.hash.match(/^#(case|pattern)\/([\w-]+)/);
    const it = m && byId(items, m[2]);
    if (it) renderDetail(it);
    else { currentItem = null; renderList(); }
  }
  addEventListener('hashchange', route);
  document.addEventListener('ma:favorites', () => {
    const c = root.querySelector('[data-group="fav"] .count');
    if (c) c.textContent = String(favs.all()[KIND].length).padStart(2, '0');
  });
  route();
})();
