/*
 * 工业协议 · 渲染器
 * 状态 = 事件序列（切换模块、选择设备、按住部署）在时刻 t 的推导；自动演示走时间轴，真实点击切到实时时钟。
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG;
  const { clamp, lerp, seg, ease } = MK;
  const $ = (s, r = document) => r.querySelector(s);
  const P = MK.params();
  const sfx = MK.sound();
  const REDUCE = MK.prefersReducedMotion();
  const BOOT = 2.4;

  /* ---------- 静态内容 ---------- */
  $('#brandCode').textContent = C.brand.code;
  $('#brandSite').textContent = `${C.brand.site} · ${C.brand.build}`;
  $('#res').innerHTML = C.resources.map((r) => `<div><dt>${r.k}</dt><dd data-v="${r.v}">0</dd></div>`).join('');
  $('#tabs').innerHTML = C.tabs.map((tb, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="false"><b>${tb.label}</b><small>${tb.cn}</small></button>`).join('') + '<i class="tab-ind" id="tabInd"></i>';
  const tabBtns = [...document.querySelectorAll('#tabs button')];
  $('#opGrid').innerHTML = C.operators.map((o) => `<li class="op"><b>${o.name}</b><small>${o.role}</small><span class="rar">${'<i></i>'.repeat(o.rarity)}</span></li>`).join('');
  const opCards = [...document.querySelectorAll('.op')];
  const DEPOT = [['原矿', 'ORE-01', 0.82, '8,420'], ['精炼晶体', 'XTL-02', 0.46, '1,236'], ['结构件', 'STR-07', 0.64, '3,208'], ['电池组', 'BAT-03', 0.21, '144'], ['封装物资', 'PKG-11', 0.58, '960']];
  $('#depot').innerHTML = DEPOT.map(([n, c, p, v]) => `<li><small>${c}</small><span>${n}</span><span class="bar"><i style="width:${p * 100}%"></i></span><b>${v}</b></li>`).join('');
  const depotRows = [...document.querySelectorAll('#depot li')];
  $('#segs').innerHTML = '<i></i>'.repeat(24);
  const segs = [...document.querySelectorAll('#segs i')];
  const views = { aic: $('#viewAic'), ops: $('#viewOps'), depot: $('#viewDepot'), mission: $('#viewMission') };
  const heads = { aic: $('#hAic'), ops: $('#hOps'), depot: $('#hDepot'), mission: $('#hMission') };

  /* ---------- 产线图 ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = $('#factory');
  const el = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const BW = 188, BH = 80;
  const M = Object.fromEntries(C.machines.map((m) => [m.id, m]));
  const linkEls = C.links.map(([a, b]) => {
    const A = M[a], Bm = M[b];
    const x1 = A.x + BW / 2, y1 = A.y, x2 = Bm.x - BW / 2, y2 = Bm.y, mx = (x1 + x2) / 2;
    const r = Math.min(14, Math.abs(y2 - y1) / 2);
    const sy = Math.sign(y2 - y1);
    const d = Math.abs(y2 - y1) < 1 ? `M${x1} ${y1}H${x2}` : `M${x1} ${y1}H${mx - r}Q${mx} ${y1} ${mx} ${y1 + sy * r}V${y2 - sy * r}Q${mx} ${y2} ${mx + r} ${y2}H${x2}`;
    el('path', { d, fill: 'none', stroke: '#c9cbc6', 'stroke-width': 10, 'stroke-linejoin': 'round' });
    const belt = el('path', { d, fill: 'none', stroke: '#1d1f22', 'stroke-width': 2, 'stroke-dasharray': '6 10' });
    const g = el('g', {});
    const items = Array.from({ length: 4 }, () => el('rect', { width: 9, height: 9, x: -4.5, y: -4.5, fill: '#1d1f22' }, g));
    return { a, b, belt, items, len: belt.getTotalLength() };
  });
  const ICON = {
    drill: 'M-10 -8h20v6h-6l-4 12-4-12h-6z', flame: 'M0 -12c8 8 9 12 9 16a9 9 0 0 1-18 0c0-6 5-8 5-14 2 3 4 4 4 -2z', gear: 'M-3 -12h6l1 4 4 2 4-2 4 5-3 3v4l3 3-4 5-4-2-4 2-1 4h-6l-1-4-4-2-4 2-4-5 3-3v-4l-3-3 4-5 4 2 4-2z',
    box: 'M-11 -8l11-5 11 5v14l-11 5-11-5z M-11 -8l11 5 11-5 M0 -3v14', depot: 'M-12 -4l12-8 12 8v14h-24z M-6 10v-8h12v8',
  };
  const nodeEls = C.machines.map((m) => {
    const g = el('g', { transform: `translate(${m.x} ${m.y})`, class: 'node', 'data-id': m.id, style: 'cursor:pointer' });
    const c = 10;
    const shape = `M${-BW / 2 + c} ${-BH / 2}H${BW / 2}V${BH / 2 - c}L${BW / 2 - c} ${BH / 2}H${-BW / 2}V${-BH / 2 + c}Z`;
    const body = el('path', { d: shape, fill: '#fff', stroke: '#1d1f22', 'stroke-width': 2 }, g);
    const sel = el('path', { d: `M${-BW / 2 - 8} ${-BH / 2 + 8}V${-BH / 2 - 8}H${-BW / 2 + 8}M${BW / 2 - 8} ${-BH / 2 - 8}H${BW / 2 + 8}V${-BH / 2 + 8}M${BW / 2 + 8} ${BH / 2 - 8}V${BH / 2 + 8}H${BW / 2 - 8}M${-BW / 2 + 8} ${BH / 2 + 8}H${-BW / 2 - 8}V${BH / 2 - 8}`, fill: 'none', stroke: '#ffd400', 'stroke-width': 4 }, g);
    el('path', { d: ICON[m.icon], transform: 'translate(-62 0)', fill: m.icon === 'box' || m.icon === 'depot' ? 'none' : '#1d1f22', stroke: '#1d1f22', 'stroke-width': m.icon === 'box' || m.icon === 'depot' ? 2 : 0 }, g);
    el('text', { x: -36, y: -12, 'data-fs': 12, 'font-family': 'JetBrains Mono, Consolas, monospace', fill: '#6b6e70' }, g).textContent = m.code;
    el('text', { x: -36, y: 9, 'data-fs': 16, 'font-family': 'Microsoft YaHei, PingFang SC, sans-serif', 'font-weight': 700, fill: '#1d1f22' }, g).textContent = m.name;
    const rate = el('text', { x: -36, y: 28, 'data-fs': 12, 'font-family': 'JetBrains Mono, Consolas, monospace', fill: '#1d1f22' }, g);
    const lamp = el('circle', { cx: BW / 2 - 16, cy: -BH / 2 + 16, r: 5, fill: '#2fbf71' }, g);
    return { m, g, body, sel, rate, lamp };
  });

  /* ---------- 蓝图（线框，逐条描出） ---------- */
  const bp = $('#blueprint');
  const bpLines = [
    'M60 130L160 160L260 130L160 100Z', 'M60 130V70L160 40L260 70V130', 'M160 160V100', 'M60 70L160 100L260 70',
    'M120 60V30H200V60', 'M140 30V12H180V30', 'M90 112L130 124V96L90 84Z', 'M230 112L190 124V96L230 84Z',
  ];
  bp.innerHTML = `<path class="bp2" d="${Array.from({ length: 16 }, (_, i) => `M${i * 20} 0V180`).join('')}${Array.from({ length: 9 }, (_, i) => `M0 ${i * 20}H320`).join('')}"/>`
    + bpLines.map((d) => `<path class="bp" pathLength="1" d="${d}"/>`).join('')
    + '<text x="12" y="170" data-fs="12">SCALE 1:40</text><text x="222" y="20" data-fs="12" id="bpCode"></text>';
  const bpPaths = [...bp.querySelectorAll('.bp')];
  const STATS = [['EFFICIENCY', 'eff'], ['POWER', 'power'], ['OUTPUT', 'rate']];
  $('#stats').innerHTML = STATS.map(([k]) => `<div><dt>${k}</dt><dd>${'<i></i>'.repeat(10)}</dd><b>0</b></div>`).join('');
  const statRows = [...document.querySelectorAll('#stats div')];

  /* ---------- 状态推导 ---------- */
  const autopilot = C.autopilot.map((e) => ({ ...e }));
  let live = false, liveEvents = [], liveBase = 0, liveStart = 0;
  function derive(events, t) {
    const S = { tab: 0, prevTab: 0, tabT: -9, sel: null, selT: -9, holdStart: null, holdEnd: null, deployedT: null };
    for (const e of events) {
      if (e.t > t) break;
      if (e.type === 'tab' && e.i !== S.tab) { S.prevTab = S.tab; S.tab = e.i; S.tabT = e.t; }
      if (e.type === 'select') { S.sel = e.id; S.selT = e.t; S.holdStart = null; S.holdEnd = null; S.deployedT = null; }
      if (e.type === 'holdStart' && S.sel && S.deployedT == null) { S.holdStart = e.t; S.holdEnd = null; }
      if (e.type === 'holdEnd' && S.holdStart != null && S.holdEnd == null) S.holdEnd = e.t;
    }
    if (S.holdStart != null) {
      const reached = S.holdStart + C.holdDuration;
      const EPS = 1e-6;
      if ((S.holdEnd == null && t >= reached - EPS) || (S.holdEnd != null && S.holdEnd >= reached - EPS)) S.deployedT = reached;
    }
    return S;
  }

  function scrambleInto(node, text, p, t) {
    if (p >= 1) { node.textContent = text; return; }
    node.innerHTML = MK.scramble(text, p, Math.floor(t * 24), 11, 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/+=<>').map((c) => (c.done ? c.ch : `<span class="n">${c.ch}</span>`)).join('');
  }

  // SVG 内文字随画布缩放：按当前缩放换算，保证最终渲染字号不低于 data-fs（且 ≥12px）
  let lastScale = 0;
  function fitSvgText() {
    for (const [node, vbw] of [[svg, 1000], [bp, 320]]) {
      const w = node.getBoundingClientRect().width;
      if (!w) continue;
      const sc = w / vbw;
      if (node === svg && Math.abs(sc - lastScale) < 0.01) continue;
      if (node === svg) lastScale = sc;
      node.querySelectorAll('text').forEach((tx) => { const want = Number(tx.dataset.fs || 12); tx.setAttribute('font-size', Math.max(want, 12 / sc).toFixed(2)); });
    }
  }

  /* ---------- 渲染 ---------- */
  function renderAt(t, events) {
    const S = derive(events, t);
    fitSvgText();

    // 加载：分段进度 + 标题解码
    const loader = $('#loader');
    const lOut = seg(t, BOOT - 0.3, 0.35, ease.inCubic);
    loader.style.visibility = t < BOOT + 0.1 ? 'visible' : 'hidden';
    loader.style.clipPath = `inset(${lOut * 100}% 0 0 0)`;
    const prog = clamp((t - 0.2) / 1.8);
    const lit = Math.floor(prog * segs.length + MK.rng(Math.floor(t * 8))() * 0.6);
    segs.forEach((s, i) => { s.classList.toggle('on', i < lit); s.classList.toggle('hot', i === lit); });
    $('#lPct').textContent = `${String(Math.round(prog * 100)).padStart(3, '0')}%`;
    scrambleInto($('#lTitle'), C.brand.code, seg(t, 0.2, 1.2, ease.linear), t);

    // 界面装配：各区块以 snap 缓动从各自边缘就位
    const asm = (d, dur = 0.42) => seg(t, BOOT - 0.2 + d, dur, ease.snap);
    $('#topbar').style.transform = `translateY(${(asm(0) - 1) * 120}%)`;
    $('#content').style.clipPath = `polygon(12px 0, ${asm(0.2) * 100}% 0, ${asm(0.2) * 100}% calc(100% - 12px), calc(${asm(0.2) * 100}% - 12px) 100%, 0 100%, 0 12px)`;
    $('#detail').style.transform = `translateX(${(1 - asm(0.3)) * 110}%)`;
    $('#status').style.transform = `translateY(${(1 - asm(0.35)) * 140}%)`;
    // 资源计数
    document.querySelectorAll('#res dd').forEach((dd, i) => { const r = C.resources[i]; dd.textContent = MK.count(0, r.v, seg(t, BOOT + 0.1 + i * 0.1, 0.9, ease.outQuart)) + (r.unit || ''); });

    // 模块页签：指示条 snap 移动；内容由扫描线揭示
    tabBtns.forEach((b, i) => b.setAttribute('aria-selected', String(i === S.tab)));
    const ind = $('#tabInd'), rail = $('#tabs').getBoundingClientRect();
    const r0 = tabBtns[S.prevTab].getBoundingClientRect(), r1 = tabBtns[S.tab].getBoundingClientRect();
    const k = seg(t, S.tabT, 0.35, ease.snap);
    ind.style.left = `${lerp(r0.left, r1.left, k) - rail.left + 14}px`;
    ind.style.width = `${lerp(r0.width, r1.width, k) - 28}px`;
    const tab = C.tabs[S.tab], prevTab = C.tabs[S.prevTab];
    renderRail(tab, t, S.tabT);
    const sweep = seg(t, S.tabT, 0.5, ease.inOutQuart);
    const switching = t >= S.tabT && t < S.tabT + 0.5 && S.prevTab !== S.tab;
    for (const [id, v] of Object.entries(views)) {
      if (id === tab.id) { v.style.visibility = 'visible'; v.style.clipPath = switching ? `inset(0 ${(1 - sweep) * 100}% 0 0)` : 'none'; }
      else if (switching && id === prevTab.id) { v.style.visibility = 'visible'; v.style.clipPath = `inset(0 0 0 ${sweep * 100}%)`; }
      else v.style.visibility = 'hidden';
    }
    const sl = $('#scanline');
    sl.style.left = `${sweep * 100}%`;
    sl.style.opacity = switching ? 1 : 0;
    const headTexts = { aic: '集成工业 · 产线总览', ops: '干员 · 编队', depot: '仓储 · 物资', mission: '任务 · 主线' };
    for (const [id, h] of Object.entries(heads)) scrambleInto(h, headTexts[id], id === tab.id ? seg(t, Math.max(S.tabT, BOOT), 0.6, ease.linear) : 1, t);
    opCards.forEach((c, i) => { const q = tab.id === 'ops' ? seg(t, S.tabT + 0.25 + i * 0.06, 0.32, ease.snap) : 1; c.style.clipPath = `inset(0 ${(1 - q) * 100}% 0 0)`; c.style.transform = `translateY(${(1 - q) * 12}px)`; });
    depotRows.forEach((r, i) => { const q = tab.id === 'depot' ? seg(t, S.tabT + 0.25 + i * 0.06, 0.32, ease.snap) : 1; r.style.transform = `translateX(${(1 - q) * -40}px)`; r.style.opacity = q; });

    // 产线：物料沿传送带流动（按时间取路径上的点，可复现）
    for (const L of linkEls) {
      const speed = S.deployedT != null && t > S.deployedT && (L.a === S.sel || L.b === S.sel) ? 150 : 90;
      L.belt.style.strokeDashoffset = -t * speed * 0.5;
      L.items.forEach((it, i) => {
        const u = (((t * speed) / L.len + i / L.items.length) % 1 + 1) % 1;
        const p = L.belt.getPointAtLength(u * L.len);
        it.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(45)`);
      });
    }
    nodeEls.forEach((n) => {
      const isSel = n.m.id === S.sel;
      const sk = isSel ? seg(t, S.selT, 0.3, ease.outBack) : 0;
      n.sel.style.opacity = clamp(sk);
      n.sel.setAttribute('transform', `scale(${lerp(1.25, 1, clamp(sk, 0, 1.2))})`);
      n.body.setAttribute('fill', isSel ? '#fffbe0' : '#fff');
      const boosted = isSel && S.deployedT != null && t > S.deployedT;
      n.rate.textContent = `${boosted ? Math.round(n.m.rate * 1.5) : n.m.rate}/min`;
      n.lamp.setAttribute('fill', Math.floor(t * 2 + n.m.x) % 2 ? '#2fbf71' : '#1f8a51');
    });

    // 详情：名称解码、蓝图描线、分段条
    const m = S.sel ? M[S.sel] : null;
    const dk = m ? seg(t, S.selT, 0.6, ease.linear) : 1;
    scrambleInto($('#dCode'), m ? `${m.code} · ${m.en}` : 'NO TARGET', dk, t);
    scrambleInto($('#dName'), m ? m.name : '选择一台设备', dk, t);
    $('#dEn').textContent = m ? m.en : 'SELECT A MACHINE';
    $('#bpCode').textContent = m ? m.code : '';
    bpPaths.forEach((p, i) => { const q = m ? seg(t, S.selT + 0.15 + i * 0.07, 0.45, ease.inOutCubic) : 0; p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = 1 - q; });
    statRows.forEach((row, i) => {
      const key = STATS[i][1];
      const val = m ? (key === 'rate' ? Math.min(100, m.rate * 3) : m[key] ?? 60 + i * 9) : 0;
      const q = m ? seg(t, S.selT + 0.4 + i * 0.1, 0.5, ease.outCubic) : 0;
      const on = Math.round((val / 100) * 10 * q);
      row.querySelectorAll('i').forEach((s, j) => s.classList.toggle('on', j < on));
      row.querySelector('b').textContent = m ? (key === 'rate' ? `${m.rate}` : `${Math.round(val * q)}%`) : '—';
    });

    // 按住部署：按住期间填充，松手过早则回落；完成后盖章
    let fill = 0;
    if (S.holdStart != null) {
      const end = S.holdEnd ?? t;
      const reached = clamp((Math.min(end, t) - S.holdStart) / C.holdDuration);
      fill = S.deployedT != null ? 1 : S.holdEnd != null ? reached * (1 - seg(t, S.holdEnd, 0.3, ease.outCubic)) : reached;
    }
    $('#deployFill').style.width = `${fill * 100}%`;
    $('#deployLabel').textContent = S.deployedT != null && t >= S.deployedT ? 'DEPLOYED' : S.holdStart != null && S.holdEnd == null ? `HOLDING · ${Math.round(fill * 100)}%` : 'HOLD TO DEPLOY';
    $('#deploy').disabled = !m;
    const st = S.deployedT != null ? seg(t, S.deployedT, 0.35, ease.outBack) : 0;
    $('#stamp').style.opacity = clamp(st * 3) * (S.tab === 0 ? 1 : 0.4);
    $('#stamp').style.transform = `translate(-50%, -50%) rotate(-8deg) scale(${lerp(1.5, 1, clamp(st, 0, 1.2))})`;

    // 底栏日志滚动与时钟
    $('#ticker').textContent = `LOG ${MK.pad(Math.floor(t * 3) % 100)} · BELT K7-02 NOMINAL · RF-02 TEMP 812°C · DEPOT INTAKE ${Math.round(24 + Math.sin(t) * 3)}/min · ${S.deployedT != null && t > S.deployedT ? 'RF-02 OVERCLOCK ENGAGED' : 'STANDBY'}`;
    const secs = 6 * 3600 + 12 * 60 + 4 + Math.floor(t);
    $('#clock').textContent = `${MK.pad(secs / 3600)}:${MK.pad((secs % 3600) / 60)}:${MK.pad(secs % 60)}`;
  }

  let railKey = '';
  function renderRail(tab, t, tabT) {
    const rail = $('#rail');
    if (railKey !== tab.id) {
      railKey = tab.id;
      rail.innerHTML = tab.sub.map((s, i) => `<button type="button"${i === 0 ? ' aria-current="true"' : ''}><small>${MK.pad(i + 1)}</small><b>${s}</b></button>`).join('') + '<i class="ruler" aria-hidden="true"></i>';
    }
    [...rail.querySelectorAll('button')].forEach((b, i) => {
      const k = Math.min(seg(t, tabT + 0.1 + i * 0.05, 0.3, ease.snap), seg(t, BOOT - 0.08 + i * 0.06, 0.42, ease.snap));
      b.style.transform = `translateX(${(k - 1) * 110}%)`;
    });
  }

  /* ---------- 时间轴 / 实时 ---------- */
  const tl = MK.timeline({
    duration: C.duration,
    render: (t) => { if (!live) renderAt(t, autopilot); },
    markers: [{ t: 0.2, label: '分段加载' }, { t: BOOT - 0.2, label: '界面装配' }, { t: 4.6, label: '选择设备' }, { t: 6.4, label: '按住部署' }, { t: 7.6, label: '部署完成' }, { t: 9.4, label: '扫描线换页' }, { t: 12.2, label: '仓储' }, { t: 14.6, label: '回到产线' }],
  });
  const seek0 = tl.seek, play0 = tl.play;
  tl.seek = (x) => { live = false; return seek0(x); };
  tl.play = () => { live = false; return play0(); };
  let raf = 0;
  const nowT = () => liveBase + (performance.now() - liveStart) / 1000;
  function liveLoop() { if (!live) return; renderAt(nowT(), liveEvents); raf = requestAnimationFrame(liveLoop); }
  function input(ev) {
    if (!live) {
      tl.pause();
      live = true;
      liveBase = Math.max(tl.time, BOOT + 0.6);
      liveStart = performance.now();
      liveEvents = autopilot.filter((e) => e.t <= tl.time && e.type !== 'holdStart' && e.type !== 'holdEnd');
      cancelAnimationFrame(raf); raf = requestAnimationFrame(liveLoop);
    }
    liveEvents.push({ ...ev, t: nowT() });
  }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) { input({ type: 'tab', i: Number(b.dataset.i) }); sfx.tone({ f: 1500, d: 0.05, type: 'square', g: 0.04 }); } });
  svg.addEventListener('click', (e) => { const g = e.target.closest('.node'); if (g) { input({ type: 'select', id: g.dataset.id }); sfx.tone({ f: 990, d: 0.07, type: 'triangle', g: 0.07 }); } });
  const dep = $('#deploy');
  const holdOn = (e) => { e.preventDefault(); input({ type: 'holdStart' }); sfx.tone({ f: 220, d: C.holdDuration, type: 'sawtooth', g: 0.04, slide: 660 }); };
  const holdOff = () => { if (live) liveEvents.push({ type: 'holdEnd', t: nowT() }); };
  dep.addEventListener('pointerdown', holdOn);
  dep.addEventListener('pointerup', holdOff);
  dep.addEventListener('pointerleave', holdOff);
  dep.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.stopPropagation(); holdOn(e); } });
  dep.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') holdOff(); });

  const cues = [
    ...Array.from({ length: 8 }, (_, i) => ({ t: 0.3 + i * 0.22, fn: () => sfx.tone({ f: 600 + i * 60, d: 0.04, type: 'square', g: 0.025 }) })),
    { t: BOOT - 0.2, fn: () => sfx.noise({ d: 0.25, g: 0.06, hp: 1500 }) },
    { t: 4.6, fn: () => sfx.tone({ f: 990, d: 0.07, type: 'triangle', g: 0.07 }) },
    { t: 6.4, fn: () => sfx.tone({ f: 220, d: 1.2, type: 'sawtooth', g: 0.04, slide: 660 }) },
    { t: 7.6, fn: () => { sfx.tone({ f: 880, d: 0.12, g: 0.08 }); sfx.tone({ f: 1320, d: 0.2, g: 0.07, delay: 0.1 }); } },
    ...[9.4, 12.2, 14.6].map((t) => ({ t, fn: () => sfx.noise({ d: 0.4, g: 0.05, hp: 2500, lp: 9000 }) })),
  ];
  let prev = 0;
  tl.on((t, playing) => { if (playing && t > prev && t - prev < 0.5) for (const c of cues) if (c.t > prev && c.t <= t) c.fn(); prev = t; });

  MK.expose(tl, { title: '工业协议', sound: sfx });
  MK.controls(tl, { sound: sfx, accent: '#ffd400' });
  addEventListener('resize', () => (live ? null : tl.seek(tl.time)));
  tl.seek(P.t ?? (REDUCE ? 8.5 : 0));
  if (P.autoplay && !REDUCE) tl.play();
})();
