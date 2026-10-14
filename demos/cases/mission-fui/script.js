/*
 * 任务指挥台 · 渲染器
 * 雷达、锁定、波形、日志全部由时间与事件序列推导；自动演示走时间轴，真实输入（点击目标、按 1/2/3）切到实时时钟。
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG;
  const { clamp, lerp, seg, ease } = MK;
  const $ = (s) => document.querySelector(s);
  const P = MK.params();
  const sfx = MK.sound();
  const REDUCE = MK.prefersReducedMotion();
  const TAU = Math.PI * 2;

  $('#mName').textContent = C.mission.name;
  $('#mCode').textContent = `${C.mission.code} · ${C.mission.station}`;
  $('#cCount').textContent = String(C.contacts.length).padStart(2, '0');
  $('#contacts').innerHTML = C.contacts.map((c) => `<li><button type="button" data-id="${c.id}" aria-pressed="false"><b>${c.id}</b><small>${c.kind}</small><small class="rng"></small></button></li>`).join('');
  const cBtns = [...document.querySelectorAll('#contacts button')];
  const SYS = ['POWER', 'SHIELD', 'COMMS', 'CPU'];
  $('#sys').innerHTML = SYS.map((k) => `<div><span>${k}</span><span class="bar"><i></i></span><b></b></div>`).join('');
  const sysRows = [...document.querySelectorAll('#sys div')];

  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, p) => `rgb(${hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], p))).join(',')})`;
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };

  /* ---------- 状态推导 ---------- */
  const autopilot = C.autopilot.map((e) => ({ ...e }));
  let live = false, liveEvents = [], liveBase = 0, liveStart = 0;
  function derive(events, t) {
    const S = { lock: null, lockT: -9, state: 'nominal', prev: 'nominal', stateT: -9, cmds: [] };
    for (const e of events) {
      if (e.t > t) break;
      if (e.type === 'lock') { S.lock = e.id; S.lockT = e.t; S.cmds.push({ t: e.t, text: `lock ${e.id.toLowerCase()}` }); }
      if (e.type === 'state' && e.s !== S.state) { S.prev = S.state; S.state = e.s; S.stateT = e.t; S.cmds.push({ t: e.t, text: `set state ${e.s}` }); }
    }
    return S;
  }
  const contactAt = (c, t) => ({ r: clamp(c.r + c.vr * t, 0.08, 0.95), a: ((c.a + c.va * t) % 360 + 360) % 360 });

  /* ---------- 雷达 ---------- */
  const scope = $('#scope'), g = scope.getContext('2d');
  function drawScope(t, S, col) {
    const W = scope.width, cx = W / 2, cy = W / 2, R = W * 0.46;
    const cssScale = scope.getBoundingClientRect().width / W || 1;
    const fs = Math.max(12 / cssScale, 14); // 保证刻度文字渲染 ≥12px
    g.fillStyle = col.bg; g.fillRect(0, 0, W, W);
    g.strokeStyle = col.dim; g.lineWidth = 1.5;
    for (let i = 1; i <= C.radar.rings; i++) { g.beginPath(); g.arc(cx, cy, (R * i) / C.radar.rings, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
    g.fillStyle = col.dim; g.font = `${fs}px ${getComputedStyle(document.body).fontFamily}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let d = 0; d < 360; d += 10) {
      const a = (d - 90) * Math.PI / 180, r1 = R, r2 = R + (d % 30 === 0 ? 14 : 7);
      g.beginPath(); g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); g.stroke();
      if (d % 30 === 0) g.fillText(String(d).padStart(3, '0'), cx + Math.cos(a) * (R + 14 + fs), cy + Math.sin(a) * (R + 14 + fs));
    }
    // 扫描线与余辉（锥形渐变）
    const sweep = (t / C.radar.period) * TAU;
    const sa = sweep - Math.PI / 2;
    if (g.createConicGradient) {
      const W0 = 0.9; // 余辉角宽（弧度）
      const cg = g.createConicGradient(sa - W0, cx, cy);
      cg.addColorStop(0, rgba(col.mainHex, 0)); cg.addColorStop(W0 / TAU, rgba(col.mainHex, 0.18)); cg.addColorStop(W0 / TAU + 0.0005, rgba(col.mainHex, 0)); cg.addColorStop(1, rgba(col.mainHex, 0));
      g.fillStyle = cg; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, sa - W0, sa); g.closePath(); g.fill();
    }
    g.strokeStyle = col.main; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sa) * R, cy + Math.sin(sa) * R); g.stroke();
    // 目标：扫描线经过时点亮，之后按余辉衰减
    const pos = {};
    for (const c of C.contacts) {
      const p = contactAt(c, t);
      const ang = p.a * Math.PI / 180;
      const since = ((((sweep - ang) % TAU) + TAU) % TAU) / TAU * C.radar.period;
      const I = Math.exp(-since * C.radar.glow);
      const x = cx + Math.cos(ang - Math.PI / 2) * R * p.r, y = cy + Math.sin(ang - Math.PI / 2) * R * p.r;
      pos[c.id] = { x: x / W, y: y / W, p };
      const locked = S.lock === c.id;
      const a = 0.25 + 0.75 * I;
      g.fillStyle = rgba(col.mainHex, a); g.strokeStyle = rgba(col.mainHex, a);
      if (c.kind === 'UNKNOWN') { g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 9, y); g.lineTo(x, y + 9); g.lineTo(x - 9, y); g.closePath(); g.fill(); }
      else { g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); }
      if (I > 0.05) { g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 6 + (1 - I) * 22, 0, TAU); g.globalAlpha = I * 0.6; g.stroke(); g.globalAlpha = 1; }
      g.textAlign = 'left'; g.fillText(c.id, x + 14, y - 12);
      // 速度矢量
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(ang - Math.PI / 2) * c.vr * 2400, y - Math.sin(ang - Math.PI / 2) * c.vr * 2400); g.lineWidth = locked ? 2 : 1; g.stroke();
    }
    $('#sweep').textContent = `BRG ${String(Math.floor(((sweep * 180) / Math.PI) % 360)).padStart(3, '0')}`;
    return pos;
  }

  /* ---------- 遥测波形 ---------- */
  const osc = $('#osc'), og = osc.getContext('2d');
  function drawOsc(t, col, level) {
    const W = osc.width, H = osc.height;
    og.fillStyle = col.bg; og.fillRect(0, 0, W, H);
    og.strokeStyle = col.dim; og.lineWidth = 1;
    for (let x = 0; x <= W; x += 50) { og.beginPath(); og.moveTo(x, 0); og.lineTo(x, H); og.stroke(); }
    for (let y = 0; y <= H; y += 44) { og.beginPath(); og.moveTo(0, y); og.lineTo(W, y); og.stroke(); }
    const trace = (amp, f, ph, w, color) => {
      og.strokeStyle = color; og.lineWidth = w; og.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const u = x / W;
        const jag = level > 1 ? Math.sin((u * 80 + t * 30) * 1.7) * 0.25 * (level - 1) : 0;
        const y = H / 2 + (Math.sin(u * f + t * 4 + ph) * 0.6 + Math.sin(u * f * 2.7 - t * 6) * 0.25 + jag) * amp * H * 0.4;
        x ? og.lineTo(x, y) : og.moveTo(x, y);
      }
      og.stroke();
    };
    trace(0.5 + level * 0.25, 9, 0, 1.2, col.dim);
    trace(0.7 + level * 0.3, 14, 1.3, 2.4, col.main);
  }

  /* ---------- 渲染 ---------- */
  function renderAt(t, events) {
    const S = derive(events, t);
    const A = C.states[S.prev], Bs = C.states[S.state];
    const k = seg(t, S.stateT, 0.4, ease.inOutCubic);
    const col = { main: mix(A.main, Bs.main, k), dim: mix(A.dim, Bs.dim, k), bg: mix(A.bg, Bs.bg, k), panel: mix(A.panel, Bs.panel, k), mainHex: k > 0.5 ? Bs.main : A.main };
    const root = document.documentElement.style;
    root.setProperty('--main', col.main); root.setProperty('--dim', col.dim); root.setProperty('--bg', col.bg); root.setProperty('--panel', col.panel);

    // 告警态：标签、闪烁节奏（CAUTION 1Hz / ALERT 2Hz）、屏幕边缘脉冲
    $('#stateLabel').textContent = Bs.label;
    const hz = Bs.blink;
    const on = REDUCE || hz === 0 ? 1 : (Math.floor(t * hz * 2) % 2 === 0 ? 1 : 0.25);
    $('#state').style.opacity = on;
    const edge = hz === 2 && !REDUCE ? (0.5 + 0.5 * Math.sin(t * Math.PI * 4)) * 26 : hz === 1 ? 8 : 0;
    $('#edge').style.boxShadow = `inset 0 0 ${edge * 2}px ${edge}px ${rgba(Bs.main, 0.35)}`;

    // 启动：面板描边展开
    const boot = seg(t, 0.1, 1.2, ease.snap);
    for (const id of ['#left', '#center', '#right']) $(id).style.clipPath = `inset(0 ${(1 - boot) * 100}% 0 0)`;
    $('#top').style.opacity = seg(t, 0, 0.4);

    // 雷达与目标
    const pos = drawScope(t, S, col);
    cBtns.forEach((b) => {
      const c = C.contacts.find((x) => x.id === b.dataset.id), p = contactAt(c, t);
      b.setAttribute('aria-pressed', String(S.lock === c.id));
      b.querySelector('.rng').textContent = `${Math.round(p.r * C.radar.rangeKm)}KM`;
    });

    // 锁定：括号分四档阶梯收缩（机械感），随后标签与数据
    const ret = $('#reticle');
    if (S.lock && pos[S.lock]) {
      const rect = scope.getBoundingClientRect(), wrap = $('#scopeWrap').getBoundingClientRect();
      const x = rect.left - wrap.left + pos[S.lock].x * rect.width, y = rect.top - wrap.top + pos[S.lock].y * rect.height;
      const steps = [180, 120, 80, 48];
      const i = clamp(Math.floor((t - S.lockT) / 0.15), 0, 3);
      const local = seg(t, S.lockT + i * 0.15, 0.08, ease.snap);
      const size = i === 0 ? lerp(240, steps[0], local) : lerp(steps[i - 1], steps[i], local);
      ret.style.visibility = 'visible';
      ret.style.left = `${x}px`; ret.style.top = `${y}px`;
      ret.style.width = `${size}px`; ret.style.height = `${size}px`;
      ret.style.transform = `translate(-50%, -50%) rotate(${i >= 3 ? 0 : 45 * (1 - local)}deg)`;
      const locked = t >= S.lockT + 1.6;
      $('#rtLabel').textContent = locked ? `LOCK ${S.lock}` : `ACQ ${'■'.repeat(clamp(Math.floor((t - S.lockT) / 0.4) + 1, 1, 4))}`;
      const c = C.contacts.find((x) => x.id === S.lock), p = pos[S.lock].p;
      $('#lkId').textContent = S.lock;
      const rows = [['BRG', String(Math.round(p.a)).padStart(3, '0')], ['RNG', `${Math.round(p.r * C.radar.rangeKm)} KM`], ['VEL', `${Math.abs(c.va).toFixed(1)} °/S`], ['TYPE', c.kind]];
      $('#lkData').innerHTML = rows.map(([kk, v], j) => `<dt>${kk}</dt><dd>${MK.typeText(v, seg(t, S.lockT + 0.3 + j * 0.15, 0.3, ease.linear))}</dd>`).join('');
      $('#lkStatus').textContent = locked ? 'LOCKED' : 'ACQUIRING…';
      $('#lkStatus').classList.toggle('on', locked);
    } else {
      ret.style.visibility = 'hidden';
      $('#lkId').textContent = '—'; $('#lkData').innerHTML = ''; $('#lkStatus').textContent = 'NO LOCK'; $('#lkStatus').classList.remove('on');
    }

    // 波形与系统条
    const level = S.state === 'alert' ? 2 : S.state === 'caution' ? 1 : 0;
    drawOsc(t, { ...col, main: col.main, dim: col.dim, bg: col.bg }, level);
    sysRows.forEach((r, i) => {
      const base = [0.86, 0.92, 0.74, 0.48][i];
      const wob = Math.sin(t * (1.3 + i) + i) * 0.05 + (level === 2 && i === 1 ? -0.3 - Math.sin(t * 9) * 0.12 : 0) + (level ? 0.08 * level * (i === 3 ? 1 : 0) : 0);
      const v = clamp(base + wob);
      r.querySelector('.bar i').style.width = `${v * 100}%`;
      r.querySelector('b').textContent = `${Math.round(v * 100)}%`;
    });

    // 日志：逐行打字，最新一行高亮
    const shown = C.log.filter((l) => t >= l.t).slice(-7);
    const base = 4 * 3600 + 17 * 60;
    $('#log').innerHTML = shown.map((l) => { const s = base + Math.floor(l.t); return `<li class="${t - l.t < 1.5 ? 'hot' : ''}"><time>${MK.pad(s / 3600)}:${MK.pad((s % 3600) / 60)}:${MK.pad(s % 60)}</time><span>${MK.typeText(l.text, seg(t, l.t, 0.6, ease.linear))}</span></li>`; }).join('');
    const sec = base + Math.floor(t);
    $('#utc').textContent = `${MK.pad(sec / 3600)}:${MK.pad((sec % 3600) / 60)}:${MK.pad(sec % 60)}`;
    const lastCmd = S.cmds[S.cmds.length - 1];
    $('#cmd').textContent = lastCmd ? MK.typeText(lastCmd.text, seg(t, lastCmd.t, 0.5, ease.linear)) : '';
    $('.caret').style.opacity = Math.floor(t * 2) % 2 ? 1 : 0.2;
  }

  /* ---------- 时间轴 / 实时 ---------- */
  const tl = MK.timeline({
    duration: C.duration,
    render: (t) => { if (!live) renderAt(t, autopilot); },
    markers: [{ t: 0.1, label: '面板展开' }, { t: 6.0, label: '锁定目标' }, { t: 9.5, label: 'CAUTION' }, { t: 12.5, label: 'ALERT' }, { t: 16.6, label: '恢复 NOMINAL' }],
  });
  const seek0 = tl.seek, play0 = tl.play;
  tl.seek = (x) => { live = false; return seek0(x); };
  tl.play = () => { live = false; return play0(); };
  let raf = 0;
  const nowT = () => liveBase + (performance.now() - liveStart) / 1000;
  function liveLoop() { if (!live) return; renderAt(nowT(), liveEvents); raf = requestAnimationFrame(liveLoop); }
  function input(ev) {
    if (!live) {
      tl.pause(); live = true; liveBase = Math.max(tl.time, 1.4); liveStart = performance.now();
      liveEvents = autopilot.filter((e) => e.t <= tl.time);
      cancelAnimationFrame(raf); raf = requestAnimationFrame(liveLoop);
    }
    liveEvents.push({ ...ev, t: nowT() });
    if (ev.type === 'lock') [880, 1100, 1320].forEach((f, i) => sfx.tone({ f, d: 0.07, type: 'square', g: 0.05, delay: i * 0.15 }));
    if (ev.type === 'state') sfx.tone({ f: ev.s === 'alert' ? 520 : ev.s === 'caution' ? 700 : 990, d: 0.3, type: 'triangle', g: 0.08 });
  }
  $('#contacts').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) input({ type: 'lock', id: b.dataset.id }); });
  addEventListener('keydown', (e) => {
    const map = { 1: 'nominal', 2: 'caution', 3: 'alert' };
    if (map[e.key]) input({ type: 'state', s: map[e.key] });
  });

  const cues = [];
  for (let t = 0; t < C.duration; t += C.radar.period) cues.push({ t, fn: () => sfx.tone({ f: 1800, d: 0.25, g: 0.03, slide: -900 }) });
  cues.push({ t: 6.0, fn: () => [880, 1100, 1320].forEach((f, i) => sfx.tone({ f, d: 0.07, type: 'square', g: 0.05, delay: i * 0.15 })) });
  cues.push({ t: 9.5, fn: () => sfx.tone({ f: 700, d: 0.4, type: 'triangle', g: 0.08 }) });
  for (let t = 12.5; t < 16.6; t += 0.5) cues.push({ t, fn: () => sfx.tone({ f: Math.round((t - 12.5) * 2) % 2 ? 520 : 660, d: 0.42, type: 'sawtooth', g: 0.05 }) });
  cues.push({ t: 16.6, fn: () => [523, 659, 784].forEach((f, i) => sfx.tone({ f, d: 0.6, g: 0.06, delay: i * 0.05 })) });
  let prev = 0;
  tl.on((t, playing) => { if (playing && t > prev && t - prev < 0.5) for (const c of cues) if (c.t > prev && c.t <= t) c.fn(); prev = t; });

  MK.expose(tl, { title: '任务指挥台', sound: sfx });
  MK.controls(tl, { sound: sfx, accent: '#5ff3ff' });
  addEventListener('resize', () => (live ? null : tl.seek(tl.time)));
  tl.seek(P.t ?? (REDUCE ? 8 : 0));
  if (P.autoplay && !REDUCE) tl.play();
})();
