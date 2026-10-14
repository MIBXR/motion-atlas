/*
 * 赛事转播图形包 · 渲染器
 * 全部出入场以“拍”为单位（config.beats），一拍 = 60 / bpm 秒；render(t) 只依赖时间。
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG;
  const { clamp, lerp, seg, ease } = MK;
  const $ = (s) => document.querySelector(s);
  const P = MK.params();
  const sfx = MK.sound();
  const REDUCE = MK.prefersReducedMotion();
  const BT = MK.beats(C.bpm);
  const at = (b) => BT.at(b);
  const B = C.beats;
  const [A, Bt] = C.teams;

  /* ---------- 构建 ---------- */
  $('#bugEvent').textContent = `${C.event.name} · ${C.event.stage}`;
  document.querySelectorAll('.t-a .code').forEach((e) => { e.textContent = A.code; });
  document.querySelectorAll('.t-b .code').forEach((e) => { e.textContent = Bt.code; });
  $('#l3Tag').textContent = C.lowerThird.tag;
  $('#l3Name').textContent = C.lowerThird.name;
  $('#l3Role').textContent = C.lowerThird.role;
  $('.st-a').textContent = A.name; $('.st-b').textContent = Bt.name;
  $('#stRows').innerHTML = C.stats.map((s) => `<div class="st-row"><b class="va"></b><span class="bar ba"><i></i></span><span class="lab">${s.label}</span><span class="bar bb"><i></i></span><b class="vb"></b></div>`).join('');
  const rows = [...document.querySelectorAll('.st-row')];
  $('#pointText').textContent = `POINT · ${A.name}`;
  $('#tkText').textContent = `${C.ticker}  ·  ${C.ticker}  ·  `;
  $('#wName').textContent = A.name;
  $('#wScore').textContent = `${A.score[1]} – ${Bt.score[1]}`;
  const COLORS = [C.palette.lime, C.palette.cyan, C.palette.white, C.palette.magenta, C.palette.navy];
  $('#stinger').innerHTML = COLORS.map((c) => `<i style="background:${c}"></i>`).join('');
  const bars = [...document.querySelectorAll('#stinger i')];
  const letters = MK.chars(C.event.name).map((ch) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; $('#lgA').appendChild(s); return s; });
  $('#lgB').textContent = `${C.event.stage} · ${C.event.venue}`;
  const confetti = Array.from({ length: 60 }, (_, i) => { const r = MK.rng(40 + i); return { x: r(), vx: (r() - 0.5) * 0.6, vy: -0.9 - r() * 0.8, rot: r() * 360, vr: (r() - 0.5) * 720, c: [C.palette.lime, C.palette.cyan, C.palette.white][i % 3], w: 6 + r() * 8 }; });
  const confEls = confetti.map((c) => { const e = document.createElement('i'); e.style.cssText = `position:absolute;left:0;top:0;width:${c.w}px;height:${c.w * 0.5}px;background:${c.c};pointer-events:none`; $('#winner').appendChild(e); return e; });

  const show = (el, v) => { el.style.opacity = v; el.style.visibility = v > 0.001 ? 'visible' : 'hidden'; };
  const rollNum = (el, from, to, p) => {
    if (p >= 1 || from === to) { el.innerHTML = `<span>${to}</span>`; return; }
    el.innerHTML = `<span style="transform:translateY(${-p * 100}%)">${from}</span><span style="transform:translateY(${-p * 100}%)">${to}</span>`;
  };

  /* ---------- 色带转场：5 条斜色带错峰横扫（2 拍） ---------- */
  function stinger(t, b0) {
    const t0 = at(b0), dur = BT.spb * 2;
    bars.forEach((bar, i) => { bar.style.left = `${lerp(-60, 160, seg(t, t0 + i * 0.07, dur, ease.inOutCubic))}%`; });
  }

  function render(t) {
    const beat = BT.beatOf(t);
    // 场景：灯光旋转、地板网格滚动；回放段放慢一半并降低饱和
    const replayOn = beat >= B.replayIn + 0.6 && beat < B.replayOut + 0.4;
    const slow = replayOn ? 0.5 : 1;
    $('#beams').style.transform = `rotate(${Math.sin(t * 0.4 * slow) * 6}deg)`;
    $('#floor').style.backgroundPosition = `0 ${t * 60 * slow}px`;
    $('#arena').style.filter = replayOn ? 'saturate(.55) brightness(.9)' : 'none';
    const pointShake = !REDUCE && beat >= B.point ? 10 * Math.exp(-(t - at(B.point)) * 8) : 0;
    $('#arena').style.transform = `translate(${Math.sin(t * 80) * pointShake}px, ${Math.cos(t * 67) * pointShake}px)`;

    // 色带转场（4 次）
    let active = null;
    for (const b of [B.stingerIn, B.replayIn, B.replayOut, B.outro]) if (t >= at(b) && t <= at(b) + BT.spb * 2 + 0.4) active = b;
    $('#stinger').style.visibility = active != null ? 'visible' : 'hidden';
    if (active != null) stinger(t, active);

    // 开场与结尾标志：字母斜切滑入
    const logoAt = beat < B.bug ? B.stingerIn : beat >= B.outro ? B.outro : null;
    const logo = $('#logo');
    if (logoAt != null) {
      const inT = at(logoAt) + BT.spb * 1.2;
      const outT = logoAt === B.stingerIn ? at(B.bug) - 0.25 : 999;
      show(logo, 1 - seg(t, outT, 0.25));
      letters.forEach((s, i) => { const k = seg(t, inT + i * 0.03, 0.3, ease.outExpo); s.style.opacity = k; s.style.transform = `translateX(${(1 - k) * 60}px) skewX(${(1 - k) * -30}deg)`; });
      $('#lgB').style.opacity = seg(t, inT + 0.4, 0.3);
    } else show(logo, 0);

    // 比分角标：横向展开 → 队名 → 比分
    const bug = $('#bug');
    const bk = seg(t, at(B.bug), 0.4, ease.snap), bout = seg(t, at(B.outro), 0.3, ease.exit);
    show(bug, bk > 0 ? 1 - bout : 0);
    bug.style.transform = `scaleX(${bk * (1 - bout)})`;
    const pk = seg(t, at(B.point) + 0.1, 0.4, ease.outCubic);
    rollNum($('#scA'), A.score[0], A.score[1], beat >= B.point ? pk : 0);
    rollNum($('#scB'), Bt.score[0], Bt.score[1], 1);
    $('#bugFlash').style.opacity = beat >= B.point ? Math.exp(-(t - at(B.point)) * 4) * (Math.floor((t - at(B.point)) * 8) % 2 ? 0.4 : 0.9) : 0;

    // 下三分之一：竖条 → 底板擦出 → 文字上浮；离场反向
    const l3 = $('#l3');
    const i0 = at(B.l3In), o0 = at(B.l3Out);
    const barK = seg(t, i0, 0.2, ease.outCubic) * (1 - seg(t, o0 + 0.25, 0.2, ease.inCubic));
    const plateK = seg(t, i0 + 0.15, 0.35, ease.snap) * (1 - seg(t, o0 + 0.1, 0.25, ease.exit));
    show(l3, barK > 0 ? 1 : 0);
    $('#l3Bar').style.transform = `scaleY(${barK})`;
    $('#l3Plate').style.clipPath = `polygon(0 0, ${plateK * 100}% 0, calc(${plateK * 100}% - 28px) 100%, 0 100%)`;
    ['#l3Tag', '#l3Name', '#l3Role'].forEach((s, i) => { const k = seg(t, i0 + 0.35 + i * 0.08, 0.3, ease.outCubic) * (1 - seg(t, o0, 0.15)); $(s).style.opacity = k; $(s).style.transform = `translateY(${(1 - k) * 14}px)`; });

    // 数据对比：标题下落 → 每半拍一行，条形从中线向两侧生长并计数
    const stats = $('#stats');
    const s0 = at(B.statsIn), s1 = at(B.statsOut);
    const sv = seg(t, s0, 0.3, ease.snap) * (1 - seg(t, s1, 0.3, ease.exit));
    show(stats, sv);
    $('.st-head').style.transform = `translateY(${(1 - seg(t, s0, 0.3, ease.snap)) * -30}px)`;
    rows.forEach((r, i) => {
      const s = C.stats[i], rt = s0 + BT.spb * (1 + i * 0.5);
      const k = seg(t, rt, 0.3, ease.snap);
      r.style.clipPath = `inset(0 ${(1 - k) * 50}% 0 ${(1 - k) * 50}%)`;
      const g = seg(t, rt + 0.15, 0.9, ease.outQuart), max = Math.max(s.a, s.b);
      r.querySelector('.ba i').style.width = `${(s.a / max) * 100 * g}%`;
      r.querySelector('.bb i').style.width = `${(s.b / max) * 100 * g}%`;
      r.querySelector('.va').textContent = MK.count(0, s.a, g, s.decimals || 0);
      r.querySelector('.vb').textContent = MK.count(0, s.b, g, s.decimals || 0);
    });

    // 得分大字
    const pt = $('#point');
    const p0 = at(B.point);
    const pin = seg(t, p0 + 0.05, 0.25, ease.outBack), pout = seg(t, p0 + BT.spb * 3, 0.25, ease.inCubic);
    show(pt, beat >= B.point && beat < B.point + 4 ? 1 - pout : 0);
    pt.style.transform = `translate(-50%, -50%) skewX(-10deg) scale(${lerp(1.6, 1, clamp(pin, 0, 1.2)) * (1 + pout * 0.2)})`;

    // 回放框
    show($('#replay'), replayOn ? 1 : 0);
    if (replayOn) {
      // 慢动作：一道弧线轨迹以半速划过，时间码按 0.5× 走
      const rt = (t - at(B.replayIn + 0.6)) * 0.5, total = (at(B.replayOut + 0.4) - at(B.replayIn + 0.6)) * 0.5;
      const u = clamp(rt / total), pts = [];
      for (let k = 0; k <= 40; k++) { const v = Math.max(0, u - 0.35) + (k / 40) * Math.min(u, 0.35); pts.push([200 + v * 1200, 700 - Math.sin(v * Math.PI) * 520]); }
      $('#rpTrail').setAttribute('d', pts.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(''));
      const e = pts[pts.length - 1];
      $('#rpBall').setAttribute('cx', e[0]); $('#rpBall').setAttribute('cy', e[1]);
      $('#rpTc').textContent = `GAME 5 · 12:${(31.2 + rt).toFixed(1).padStart(4, '0')}`;
    }
    $('.rp-tag').style.opacity = Math.floor(t * 2) % 2 ? 1 : 0.55;

    // 滚动新闻
    const tk = $('#ticker');
    const tkIn = seg(t, at(B.ticker), 0.35, ease.snap) * (1 - seg(t, at(B.outro), 0.3, ease.exit));
    tk.style.transform = `translateY(${(1 - tkIn) * 110}%)`;
    const tw = $('#tkText').scrollWidth / 2 || 1000;
    $('#tkText').style.transform = `translate(${-(((t - at(B.ticker)) * 90) % tw)}px, -50%)`;

    // 冠军卡 + 彩带
    const win = $('#winner');
    const w0 = at(B.winner);
    show(win, beat >= B.winner && beat < B.outro + 0.5 ? 1 - seg(t, at(B.outro), 0.3) : 0);
    $('#wName').style.transform = `skewX(-8deg) scale(${lerp(1.4, 1, clamp(seg(t, w0 + 0.1, 0.35, ease.outBack), 0, 1.2))})`;
    $('#wScore').style.transform = `scale(${seg(t, w0 + 0.45, 0.25, ease.outBack)})`;
    $('.w-k').style.opacity = seg(t, w0, 0.3);
    const cw = innerWidth, ch = innerHeight, ct = t - w0;
    confEls.forEach((e, i) => {
      const c = confetti[i];
      if (ct < 0 || REDUCE) { e.style.opacity = 0; return; }
      const x = (c.x * cw) + c.vx * cw * ct, y = ch * 0.75 + (c.vy * ct + 0.9 * ct * ct) * ch * 0.45;
      e.style.opacity = 1 - clamp((ct - 1.6) / 0.6);
      e.style.transform = `translate(${x - cw / 2}px, ${y - ch * 0.46}px) rotate(${c.rot + c.vr * ct}deg)`;
    });

    // 拍点指示：每拍一次脉冲（小节首拍更大）
    const pulse = BT.pulse(t, 7), bar1 = Math.floor(beat) % 4 === 0;
    $('#beatDot').style.transform = `scale(${1 + pulse * (bar1 ? 0.9 : 0.45)})`;
    $('#beatDot').style.opacity = 0.35 + 0.65 * pulse;
  }

  /* ---------- 时间轴与声音 ---------- */
  const markers = Object.entries({ 开场色带: B.stingerIn, 比分角标: B.bug, 下三分之一: B.l3In, 数据对比: B.statsIn, 得分: B.point, 回放转场: B.replayIn, 回到直播: B.replayOut, 冠军卡: B.winner, 结尾色带: B.outro }).map(([label, b]) => ({ t: at(b), label }));
  const tl = MK.timeline({ duration: at(B.end), render, markers });
  const cues = [];
  for (let b = 0; b < B.end; b++) {
    cues.push({ t: at(b), fn: () => sfx.tone({ f: 110, d: 0.16, g: 0.22, slide: -60 }) });            // 每拍底鼓
    cues.push({ t: at(b + 0.5), fn: () => sfx.noise({ d: 0.04, g: 0.05, hp: 6000 }) });                 // 反拍镲
  }
  [B.stingerIn, B.replayIn, B.replayOut, B.outro].forEach((b) => cues.push({ t: at(b), fn: () => sfx.noise({ d: 0.9, g: 0.08, hp: 400, lp: 7000 }) }));
  cues.push({ t: at(B.point), fn: () => [523, 659, 784].forEach((f, i) => sfx.tone({ f, d: 0.5, type: 'square', g: 0.05, delay: i * 0.04 })) });
  cues.push({ t: at(B.winner), fn: () => [392, 523, 659, 784, 1046].forEach((f, i) => sfx.tone({ f, d: 1.2, type: 'triangle', g: 0.05, delay: i * 0.05 })) });
  let prev = 0;
  tl.on((t, playing) => { if (playing && t > prev && t - prev < 0.5) for (const c of cues) if (c.t > prev && c.t <= t) c.fn(); prev = t; });

  MK.expose(tl, { title: '赛事转播图形包', bpm: C.bpm, sound: sfx });
  MK.controls(tl, { sound: sfx, accent: C.palette.lime });
  addEventListener('resize', () => tl.seek(tl.time));
  tl.seek(P.t ?? (REDUCE ? at(B.statsIn + 3) : 0));
  if (P.autoplay && !REDUCE) tl.play();
})();
