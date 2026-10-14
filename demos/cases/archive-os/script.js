/*
 * 白色档案终端 · 渲染器
 * 状态 = 按键事件序列在时刻 t 的推导结果（选中列/行、模式、每次切换的时间）。
 * 阵列抬起、波浪、呼吸、编号滚动、解密都写成时间的解析函数：
 *   自动演示时由时间轴驱动（可拖动、可逐帧渲染）；真实按键后切到实时时钟，用同一个 render。
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG, T = C.timing;
  const { clamp, lerp, seg, ease } = MK;
  const $ = (s, r = document) => r.querySelector(s);
  const P = MK.params();
  const sfx = MK.sound();
  const REDUCE = MK.prefersReducedMotion();
  const NCOL = C.columns.length, NROW = 8, ROWS = T.rowsVisible, ROW0 = 5; // 档案行 r 显示在第 ROW0 + r 块
  const W = 170, TH = 12, HH = 118, PITCH_X = 192, PITCH_Y = 26; // 档案块尺寸（px）

  /* ---------- 数据 ---------- */
  const fileAt = (c, r) => {
    const f = (C.files[c] || [])[r];
    return f || { title: `${C.columns[c].name} · 档案 ${MK.pad(r + 1)}`, dept: '—', collection: '示意占位', related: '—', status: '已归档 · 可读取', abstract: '本档案为示意占位，正文可在 config.js 的 files 中补充。' };
  };
  const fileNo = (c, r) => c * NROW + r + 1;

  /* ---------- 品牌与静态文字 ---------- */
  $('.b1').textContent = C.brand.line1;
  $('.b2').textContent = C.brand.line2;
  $('.b3a').textContent = C.brand.line3a;
  $('.b3b').textContent = C.brand.line3b;
  $('#powered b').textContent = C.brand.powered;
  $('.status .op').textContent = C.brand.operator;
  $('#wCompany').textContent = C.brand.line1;
  $('#colTotal').textContent = MK.pad(NCOL);
  $('#rowTotal').textContent = MK.pad(NROW);
  $('#ticks').innerHTML = Array.from({ length: NROW }, () => '<i></i>').join('');
  const ticks = [...document.querySelectorAll('#ticks i')];

  /* ---------- 阵列 DOM ---------- */
  const world = $('#world');
  const plates = [];
  for (let c = 0; c < NCOL; c++) for (let pr = 0; pr < ROWS; pr++) {
    const el = document.createElement('div');
    el.className = 'plate';
    el.dataset.c = c; el.dataset.r = pr;
    el.innerHTML = `<i class="top" style="width:${W}px;height:${TH}px;transform:translateZ(${HH}px)"></i>`
      + `<i class="front" style="width:${W}px;height:${HH}px;transform:translateY(${TH}px) rotateX(90deg)"></i>`
      + `<i class="side" style="width:${HH}px;height:${TH}px;transform:rotateY(-90deg)"></i>`;
    world.appendChild(el);
    plates.push({ el, c, pr, faces: [...el.children], x: c * PITCH_X - (NCOL * PITCH_X) / 2, y: pr * PITCH_Y - (ROWS * PITCH_Y) / 2 });
  }

  /* ---------- 状态推导 ---------- */
  const autopilot = C.autopilot.map((e) => ({ ...e }));
  let live = false, liveEvents = [], liveBase = 0, liveStart = 0, saved = 0;
  function derive(events, t) {
    let col = 2, row = 0, mode = 'array';
    const mem = new Array(NCOL).fill(0);
    const sels = [{ t: T.bootEnd - 0.5, col, row, dir: 1, boot: true }];
    const modes = [];
    let lastT = T.bootEnd;
    for (const e of events) {
      if (e.t > t) break;
      if (mode === 'detail' && e.key !== 'Escape') continue;
      const prev = { col, row };
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        mem[col] = row;
        col = (col + (e.key === 'ArrowRight' ? 1 : -1) + NCOL) % NCOL;
        row = mem[col];
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        row = (row + (e.key === 'ArrowDown' ? 1 : -1) + NROW) % NROW;
      } else if (e.key === 'select') {
        mem[col] = row; col = e.col; row = e.row;
      } else if (e.key === 'Enter' && mode === 'array') { mode = 'detail'; modes.push({ t: e.t, on: true }); }
      else if (e.key === 'Escape' && mode === 'detail') { mode = 'array'; modes.push({ t: e.t, on: false }); }
      if (prev.col !== col || prev.row !== row) {
        const dir = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1;
        sels.push({ t: e.t, col, row, dir, pcol: prev.col, prow: prev.row });
      }
      lastT = e.t;
    }
    return { col, row, mode, sels, modes, lastT };
  }

  const w = T.liftRate;
  const crit = (tau) => (tau <= 0 ? 0 : 1 - (1 + w * tau) * Math.exp(-w * tau)); // 临界阻尼阶跃 0→1
  const detailAmount = (S, t) => clamp(S.modes.reduce((a, m) => a + (m.on ? 1 : -1) * crit(t - m.t), 0));

  function plateLift(p, t, S, m) {
    let lift = 0;
    const from = Math.max(0, S.sels.length - 5);
    for (let i = from; i < S.sels.length; i++) {
      const s = S.sels[i];
      if (s.col === p.c && s.row + ROW0 === p.pr) {
        const end = i + 1 < S.sels.length ? S.sels[i + 1].t : Infinity;
        if (t < end) lift += T.previewLift * crit(t - s.t);
        else { const v0 = T.previewLift * crit(end - s.t), tau = t - end; lift += v0 * (1 + w * tau) * Math.exp(-w * tau); }
      }
      // 选中波浪：按距离延迟、随距离衰减
      if (i >= S.sels.length - 3) {
        const d = s.boot ? p.c * 1.6 + Math.abs(p.pr - (s.row + ROW0)) * 0.4 : Math.abs(p.pr - (s.row + ROW0)) + 0.8 * Math.abs(p.c - s.col);
        if (d > 0) {
          const tau = t - s.t - d * T.waveDelay;
          if (tau > 0) lift += T.waveAmp * Math.sin(T.waveFreq * tau) * Math.exp(-T.waveDecay * tau) / (1 + 0.35 * d);
        }
      }
    }
    const isSel = p.c === S.col && p.pr === S.row + ROW0;
    if (isSel) lift += (T.detailLift - T.previewLift) * m;
    // 空闲呼吸：8s 与 13s 两个周期叠加，相邻块错相
    const idle = REDUCE ? 0 : clamp((t - S.lastT - T.idleAfter) / 1.5) * (1 - m);
    if (idle > 0) lift += idle * T.breatheAmp * (0.6 * Math.sin((2 * Math.PI * t) / T.breathe[0] + p.c * 1.3 + p.pr * 0.7) + 0.4 * Math.sin((2 * Math.PI * t) / T.breathe[1] + p.c * 0.4 + p.pr * 1.1));
    return lift;
  }

  /* ---------- 滚动数字与文字 ---------- */
  function rollDigits(el, from, to, p, dir, len) {
    const a = String(from).padStart(len, '0'), b = String(to).padStart(len, '0');
    let html = '';
    for (let i = 0; i < len; i++) {
      if (a[i] === b[i] || p >= 1) { html += `<span><i>${b[i]}</i></span>`; continue; }
      const y = dir > 0 ? -p : p - 1;
      html += `<span><i style="transform:translateY(${y * 100}%);filter:blur(${(Math.sin(p * Math.PI) * 0.35).toFixed(2)}px)">${dir > 0 ? a[i] : b[i]}</i><i style="transform:translateY(${y * 100}%)">${dir > 0 ? b[i] : a[i]}</i></span>`;
    }
    el.innerHTML = html;
  }
  function rollText(el, from, to, p, dir) {
    if (p >= 1 || from === to) { el.innerHTML = `<span>${to}</span>`; return; }
    const out = dir > 0 ? -p * 100 : p * 100, inn = dir > 0 ? (1 - p) * 100 : -(1 - p) * 100;
    el.innerHTML = `<span style="transform:translateY(${out}%);opacity:${1 - p}">${from}</span><span class="next" style="transform:translateY(${inn}%);opacity:${p}">${to}</span>`;
  }

  /* ---------- 详情遮挡条 ---------- */
  const doc = $('#doc');
  function fillDoc(c, r) {
    const f = fileAt(c, r), no = MK.pad(fileNo(c, r), 3);
    $('#docFile').textContent = `FILE X-${no}`;
    $('#docTitle').textContent = f.title;
    $('#docCn').textContent = C.columns[c].name;
    $('#docCol').textContent = C.columns[c].en;
    $('#meta').innerHTML = [['DEPARTMENT / 科室', f.dept], ['COLLECTION / 编目范围', f.collection], ['RELATED / 相关人物', f.related], ['STATUS / 状态', f.status]]
      .map(([k, v]) => `<div class="masked"><dt>${k}</dt><dd>${v}</dd><i class="mask-bar"></i></div>`).join('');
    $('#abs').innerHTML = `${f.abstract}<i class="mask-bar"></i>`;
    $('#glassNo').textContent = `NO.${no}`;
    $('#glassNum').textContent = `NO.${no}`;
    for (const sel of ['#docTitle', '.doc-cn']) {
      const el = $(sel, doc);
      el.classList.add('masked');
      if (!el.querySelector('.mask-bar')) el.insertAdjacentHTML('beforeend', '<i class="mask-bar"></i>');
    }
    $('#abs').classList.add('masked');
  }
  let docKey = '';

  /* ---------- 启动序列 ---------- */
  const bootText = 'ACCESS REQUEST : ANALYSIS OS';
  const bootLines = [`ID CONFIRMED : ${C.brand.operator}`, 'REQUEST RECEIVED', 'START PROCESSING...'];
  $('#bootLines').innerHTML = bootLines.map(() => '<p></p>').join('');
  const lineEls = [...document.querySelectorAll('#bootLines p')];
  const circ = 2 * Math.PI * 40;
  ['#ringA', '#ringB'].forEach((s) => { $(s).style.strokeDasharray = circ; });

  function renderBoot(t) {
    const boot = $('#boot');
    const out = seg(t, T.bootEnd - 0.8, 0.8, ease.inCubic);
    boot.style.visibility = t < T.bootEnd ? 'visible' : 'hidden';
    boot.style.opacity = 1 - out;
    boot.style.transform = `scale(${1 - 0.04 * out})`;
    boot.style.filter = out > 0 ? `blur(${out * 8}px) hue-rotate(${out * 12}deg)` : 'none';
    // 逐字输入：每字 45ms，“ : ”后停顿
    const typed = t < 2.0 ? MK.typeText(bootText, clamp((t - 0.3) / 1.4)) : '';
    $('#bootType').textContent = typed + (t > 0.3 && t < 2.0 && Math.floor(t * 4) % 2 ? '_' : '');
    $('#bootType').style.opacity = t < 2.0 ? 1 : 0;
    // 圆环绕行与标志
    const logo = $('#bootLogo');
    logo.style.opacity = t > 1.95 && t < 4.7 ? 1 - seg(t, 4.4, 0.3) : 0;
    logo.style.transform = `translateX(${-seg(t, 3.2, 0.5, ease.outCubic) * 4}vw)`;
    $('#ringA').style.strokeDashoffset = circ * (1 - seg(t, 2.0, 0.9, ease.inOutCubic));
    $('#ringB').style.strokeDashoffset = circ * (1 - seg(t, 2.45, 0.9, ease.inOutCubic));
    $('#markBar').style.opacity = seg(t, 3.15, 0.2);
    // 身份确认
    lineEls.forEach((el, i) => {
      const st = 3.3 + i * 0.42;
      el.textContent = t > st ? MK.typeText(bootLines[i], seg(t, st, 0.36, ease.linear)) : '';
      el.style.opacity = t < 4.7 ? 1 - seg(t, 4.4, 0.3) : 0;
    });
    // 授权扫描：双环从画面外收拢，核心四帧跳变
    const scan = $('#scan');
    const sv = t > 4.6 && t < 5.8;
    scan.style.opacity = sv ? 1 : 0;
    if (sv) {
      const k = seg(t, 4.6, 0.7, ease.outCubic);
      $('#scanA').setAttribute('transform', `scale(${lerp(2.4, 1, k)}) rotate(${k * 90})`);
      $('#scanB').setAttribute('transform', `scale(${lerp(0.3, 1, k)})`);
      const a = t * 7;
      $('#scanNode').setAttribute('cx', Math.cos(a) * 70); $('#scanNode').setAttribute('cy', Math.sin(a) * 70);
      const jump = [1, 1.5, 0.75, 1.25, 1][clamp(Math.floor((t - 5.2) / 0.08), 0, 4)];
      $('#scanCore').setAttribute('transform', `scale(${t > 5.2 ? jump : 0.001})`);
    }
    // 欢迎：黑底公司名横扫，INTERNAL DATABASE 闪现
    const wel = $('#welcome');
    wel.style.opacity = t > 5.8 && t < T.bootEnd ? 1 : 0;
    $('.w2 b', wel).style.clipPath = `inset(0 ${(1 - seg(t, 5.9, 0.45, ease.outCubic)) * 100}% 0 0)`;
    $('.w3', wel).style.opacity = t > 6.25 && !(t > 6.4 && t < 6.5) ? 1 : 0;
  }

  /* ---------- 主渲染 ---------- */
  let lastSelKey = '';
  function renderAt(t, events) {
    const S = derive(events, t);
    const m = detailAmount(S, t);
    renderBoot(t);

    // 阵列入场：从左侧滑入、镜头抬高
    const enter = seg(t, T.bootEnd - 0.9, 1.3, ease.outCubic);
    const narrow = innerWidth < 760;
    const baseScale = narrow ? 0.62 : Math.min(1.9, innerWidth / 1060);
    const rx = lerp(74, 58, enter) - 4 * m;
    const rz = -38 + 6 * m;
    const ox = (1 - enter) * -innerWidth * 0.4 - m * innerWidth * 0.22 + (narrow ? -innerWidth * 0.05 : -innerWidth * 0.1);
    const oy = (narrow ? innerHeight * 0.06 : innerHeight * 0.04) + m * innerHeight * 0.05;
    const sc = baseScale * (1 + 0.45 * m);
    world.style.transform = `translate3d(${ox}px, ${oy}px, 0) scale(${sc}) rotateX(${rx}deg) rotateZ(${rz}deg)`;
    world.style.visibility = enter > 0.001 ? 'visible' : 'hidden';
    $('#viewport').style.opacity = enter;
    for (const p of plates) {
      const lift = plateLift(p, t, S, m);
      const isSel = p.c === S.col && p.pr === S.row + ROW0;
      p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, ${lift.toFixed(2)}px)`;
      p.el.classList.toggle('sel', isSel);
      // 透明度放在各个面上：preserve-3d 元素本身 opacity<1 会被压平
      const op = isSel || m < 0.002 ? '' : String(1 - 0.75 * m);
      if (p.op !== op) { p.op = op; p.faces.forEach((f) => { f.style.opacity = op; }); }
    }

    // HUD 入场与详情让位
    const hud = seg(t, T.bootEnd - 0.2, 0.8, ease.outCubic);
    for (const id of ['#brand', '#sysnav', '#powered', '#status']) $(id).style.opacity = hud;
    for (const id of ['#info', '#selectBox', '#navBox']) { $(id).style.opacity = hud * (1 - m); $(id).style.visibility = hud * (1 - m) > 0.02 ? 'visible' : 'hidden'; }
    $('#info').style.transform = `translateX(${(1 - hud) * 30}px)`;

    // 编号、标题、列名滚动（只显示当前运动与最终目标）
    const last = S.sels[S.sels.length - 1];
    const prevSel = S.sels.length > 1 ? S.sels[S.sels.length - 2] : last;
    const p = last.boot ? 1 : seg(t, last.t, T.roll, ease.outCubic);
    const fromC = last.boot ? last.col : last.pcol, fromR = last.boot ? last.row : last.prow;
    rollDigits($('#digits'), fileNo(fromC, fromR), fileNo(S.col, S.row), p, last.dir, 3);
    rollDigits($('#rowDigits'), fromR + 1, S.row + 1, p, last.dir, 2);
    rollText($('#titleRoll'), fileAt(fromC, fromR).title, fileAt(S.col, S.row).title, p, last.dir);
    rollText($('#catRoll'), C.columns[fromC].name, C.columns[S.col].name, p, last.dir);
    rollText($('#colRoll'), C.columns[fromC].name, C.columns[S.col].name, p, last.dir);
    $('#colIdx').textContent = MK.pad(S.col + 1);
    ticks.forEach((tk, i) => tk.classList.toggle('on', i === S.row));
    void prevSel;

    // 详情：玻璃检视与解密
    const det = $('#detail');
    const lastMode = S.modes[S.modes.length - 1];
    const dv = lastMode ? (lastMode.on ? seg(t, lastMode.t + 0.35, 0.4, ease.outCubic) : 1 - seg(t, lastMode.t, 0.25)) : 0;
    det.style.visibility = dv > 0.01 ? 'visible' : 'hidden';
    det.style.opacity = dv;
    det.classList.toggle('on', S.mode === 'detail');
    det.setAttribute('aria-hidden', String(S.mode !== 'detail'));
    const key = `${S.col}:${S.row}`;
    if (key !== docKey) { docKey = key; fillDoc(S.col, S.row); }
    if (lastMode && lastMode.on) {
      const te = lastMode.t;
      $('#glass').style.transform = `translateX(${(1 - seg(t, te + 0.35, 0.6, ease.outCubic)) * -40}px) scale(${0.97 + 0.03 * seg(t, te + 0.35, 0.6, ease.outCubic)})`;
      const dIn = seg(t, te + 0.55, 0.45, ease.inOutCubic), dOut = seg(t, te + 0.55 + T.decrypt, 0.35, ease.inCubic);
      ['#diagA', '#diagB'].forEach((s) => {
        const el = $(s);
        el.style.strokeDasharray = '142 142';
        el.style.strokeDashoffset = 142 * (1 - dIn) - 142 * dOut;
        el.style.opacity = 1 - dOut;
      });
      // 盖板自上而下由磨砂变清晰
      const clear = seg(t, te + 0.9, T.decrypt - 0.3, ease.inOutCubic);
      $('#frost').style.clipPath = `inset(${clear * 100}% 0 0 0)`;
      // 正文遮挡条依次退开
      doc.querySelectorAll('.mask-bar').forEach((b, i) => {
        const k = seg(t, te + 1.0 + i * 0.08, 0.42, ease.inOutCubic);
        b.style.width = '100%';
        b.style.transform = `scaleX(${1 - k})`;
      });
      $('.tab-line').style.transform = 'translateX(0)';
    }

    // 时钟
    const s0 = 12 * 3600 + 21 * 60 + Math.floor(t);
    $('#clock').textContent = `${MK.pad(s0 / 3600)}:${MK.pad((s0 % 3600) / 60)}:${MK.pad(s0 % 60)}`;
    $('#saved').textContent = MK.pad(saved);

    // 声音：选择变化时玻璃轻碰（仅播放/实时状态）
    const sk = `${last.t}|${key}`;
    if (sk !== lastSelKey) { if (lastSelKey && !last.boot) glass(); lastSelKey = sk; }
  }
  function glass() {
    sfx.tone({ f: 2140, d: 0.18, g: 0.07, type: 'sine' });
    sfx.tone({ f: 3260, d: 0.12, g: 0.04, type: 'sine', delay: 0.012 });
    sfx.noise({ d: 0.03, g: 0.05, hp: 4000, lp: 12000 });
  }

  /* ---------- 时间轴 / 实时模式 ---------- */
  const tl = MK.timeline({
    duration: C.duration,
    render: (t) => { if (!live) renderAt(t, autopilot); },
    markers: [{ t: 0.3, label: '逐字输入' }, { t: 2.0, label: '圆环与标志' }, { t: 3.3, label: '身份确认' }, { t: 4.6, label: '授权扫描' }, { t: 5.8, label: '欢迎' }, { t: T.bootEnd - 0.9, label: '阵列入场' }, ...C.autopilot.map((e) => ({ t: e.t, label: { ArrowRight: '→ 下一列', ArrowLeft: '← 上一列', ArrowDown: '↓ 下一份', ArrowUp: '↑ 上一份', Enter: '读取 · 解密', Escape: '返回阵列' }[e.key] })) ],
  });
  // 外部 seek / play（站点刻度条、重播）回到自动演示
  const seek0 = tl.seek, play0 = tl.play;
  tl.seek = (x) => { live = false; return seek0(x); };
  tl.play = () => { live = false; return play0(); };

  let raf = 0;
  function liveLoop() {
    if (!live) return;
    renderAt(liveBase + (performance.now() - liveStart) / 1000, liveEvents);
    raf = requestAnimationFrame(liveLoop);
  }
  function input(key, extra = {}) {
    if (!live) {
      const now = Math.max(tl.time, T.bootEnd);
      tl.pause();
      live = true;
      liveBase = now;
      liveStart = performance.now();
      liveEvents = autopilot.filter((e) => e.t <= tl.time);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(liveLoop);
    }
    const t = liveBase + (performance.now() - liveStart) / 1000;
    liveEvents.push({ t, key, ...extra });
    if (key === 'Enter') sfx.tone({ f: 520, d: 0.35, g: 0.08, slide: -220 });
  }
  addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
      if (e.target.closest && e.target.closest('input, textarea, select')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      input(e.key);
    }
  }, true);
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-key], [data-act]');
    if (b && b.dataset.key) return input(b.dataset.key);
    if (b && b.dataset.act === 'enter') return input('Enter');
    if (b && b.dataset.act === 'save') { saved++; return; }
    if (b && b.dataset.act === 'sound') {
      sfx.toggle();
      b.setAttribute('aria-pressed', String(sfx.enabled));
      b.setAttribute('aria-label', sfx.enabled ? '关闭声音' : '开启声音');
      $('#sndwave').setAttribute('d', sfx.enabled ? 'M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11' : 'M16 9.5l5 5M21 9.5l-5 5');
      return;
    }
    const plate = e.target.closest('.plate');
    if (plate) {
      const r = Number(plate.dataset.r) - ROW0;
      if (r >= 0 && r < NROW) input('select', { col: Number(plate.dataset.c), row: r });
    }
  });

  // 启动序列的逐字音
  const cues = [];
  MK.chars(bootText).forEach((_, i) => cues.push({ t: 0.3 + (i / bootText.length) * 1.4, fn: () => sfx.tone({ f: 1800 + (i % 3) * 140, d: 0.035, type: 'square', g: 0.025 }) }));
  cues.push({ t: 2.0, fn: () => sfx.tone({ f: 180, d: 0.9, g: 0.08, slide: 60 }) });
  cues.push({ t: 4.6, fn: () => { sfx.tone({ f: 880, d: 0.08, type: 'square', g: 0.04 }); sfx.tone({ f: 1320, d: 0.08, type: 'square', g: 0.04, delay: 0.1 }); } });
  cues.push({ t: 5.9, fn: () => sfx.tone({ f: 440, d: 0.6, g: 0.07, slide: 440 }) });
  let prevT = 0;
  tl.on((t, playing) => {
    if (playing && t > prevT && t - prevT < 0.5) for (const c of cues) if (c.t > prevT && c.t <= t) c.fn();
    prevT = t;
  });

  MK.expose(tl, { title: '白色档案终端', sound: sfx });
  MK.controls(tl, { sound: sfx, accent: C.palette.accent });
  addEventListener('resize', () => (live ? null : tl.seek(tl.time)));
  const reduce = MK.prefersReducedMotion();
  tl.seek(P.t ?? (reduce ? T.bootEnd + 0.5 : 0));
  if (P.autoplay && !reduce) tl.play();
})();
