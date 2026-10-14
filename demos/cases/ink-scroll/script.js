/*
 * 水墨长卷展台 · 渲染器
 * 展开（自右向左）→ 墨层依次晕开（湍流位移 + 扩散遮罩）→ 题诗笔刷式显现 → 镜头自右向左平移（多层视差）→ 盖章
 * 用户拖动/滚轮/方向键后切换为自由浏览（临界阻尼跟随），重播回到自动演示。
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG, T = C.timing;
  const { clamp, lerp, seg, ease } = MK;
  const $ = (s) => document.querySelector(s);
  const P = MK.params();
  const sfx = MK.sound();
  const REDUCE = MK.prefersReducedMotion();
  const NS = 'http://www.w3.org/2000/svg';

  $('#col1').textContent = C.poem.lines[0];
  $('#col2').textContent = C.poem.lines[1];
  $('#by').textContent = C.poem.author;
  $('#sealSmall').textContent = C.seal.small;
  $('#sealA').textContent = C.seal.chars[0];
  $('#sealB').textContent = C.seal.chars[1];

  let VW = innerWidth, H = 0, PW = 0;
  const layers = [];

  /* ---------- 程序化山水：山脊 + 墨色渐变 + 皴笔 + 松树 ---------- */
  function ridge(r, x, scale) { // 值噪声叠加
    let v = 0, amp = 1, f = 1, n = 0;
    for (let o = 0; o < 4; o++) { const xx = x * f / scale, i = Math.floor(xx), fr = xx - i, s = fr * fr * (3 - 2 * fr); const a = r(i, o), b = r(i + 1, o); v += amp * (a * (1 - s) + b * s); n += amp; amp *= 0.5; f *= 2; }
    return v / n;
  }
  const hashR = (seed) => (i, o) => { const x = Math.sin((i + 1) * 127.1 + o * 311.7 + seed * 74.7) * 43758.5453; return x - Math.floor(x); };

  function buildLayer(L, idx) {
    const LW = Math.ceil(VW + (PW - VW) * L.parallax);
    const el = document.createElement('div');
    el.className = 'layer';
    el.style.width = `${LW}px`;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${LW} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    const r = hashR(L.seed);
    const base = H * (0.55 + idx * 0.14), amp = H * L.height;
    const pts = [];
    for (let x = 0; x <= LW; x += 6) {
      const peaks = Math.pow(Math.abs(Math.sin((x / LW) * Math.PI * L.peaks + L.seed)), 1.6);
      const y = base - amp * (0.35 + 0.65 * peaks) * (0.55 + 0.45 * ridge(r, x, 90 + idx * 40)) - ridge(r, x * 3, 30) * amp * 0.08;
      pts.push([x, y]);
    }
    const d = `M0 ${H}` + pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') + `L${LW} ${H}Z`;
    const ink = C.palette.ink;
    let pines = '';
    if (L.name === 'near') {
      for (let k = 0; k < 40; k++) {
        const p = pts[Math.floor(r(k, 9) * pts.length)];
        const s = H * (0.05 + r(k, 8) * 0.06);
        pines += `<g transform="translate(${p[0].toFixed(1)} ${(p[1] + s * 0.2).toFixed(1)})"><path d="M0 0V${-s}" stroke="${ink}" stroke-width="${(s * 0.06).toFixed(1)}"/>${[0.3, 0.55, 0.8].map((h, j) => `<path d="M${-s * (0.45 - j * 0.1)} ${-s * h}Q0 ${-s * (h + 0.12)} ${s * (0.45 - j * 0.1)} ${-s * h}" fill="none" stroke="${ink}" stroke-width="${(s * 0.09).toFixed(1)}" stroke-linecap="round" opacity=".85"/>`).join('')}</g>`;
      }
    }
    let extra = '';
    if (L.name === 'mid') { // 小舟与飞鸟
      const bx = LW * 0.55, by = H * 0.82;
      extra += `<path d="M${bx - 40} ${by}Q${bx} ${by + 14} ${bx + 46} ${by - 2}L${bx + 30} ${by + 8}H${bx - 28}Z" fill="${ink}" opacity=".8"/><path d="M${bx - 6} ${by - 2}V${by - 34}" stroke="${ink}" stroke-width="2"/>`;
      for (let k = 0; k < 6; k++) { const x = LW * (0.3 + r(k, 5) * 0.4), y = H * (0.12 + r(k, 6) * 0.15); extra += `<path d="M${x - 9} ${y}q9 -7 9 0q0 -7 9 0" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>`; }
    }
    svg.innerHTML = `<defs>
        <linearGradient id="wash${idx}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ink}" stop-opacity="${L.tone}"/><stop offset=".55" stop-color="${ink}" stop-opacity="${L.tone * 0.55}"/><stop offset="1" stop-color="${ink}" stop-opacity="${L.tone * 0.08}"/></linearGradient>
        <filter id="bleed${idx}" filterUnits="userSpaceOnUse" x="0" y="${-H * 0.1}" width="${VW}" height="${H * 1.2}"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="${L.seed}"/><feDisplacementMap in="SourceGraphic" scale="0" id="disp${idx}"/><feGaussianBlur stdDeviation="0" id="blur${idx}"/></filter>
      </defs>
      <g class="inkg" filter="url(#bleed${idx})"><path d="${d}" fill="url(#wash${idx})"/><path d="${'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}" fill="none" stroke="${ink}" stroke-opacity="${Math.min(0.9, L.tone + 0.15)}" stroke-width="${2 + idx}" stroke-linejoin="round"/>${pines}${extra}</g>`;
    el.appendChild(svg);
    $('#layers').appendChild(el);
    return { L, el, LW, g: svg.querySelector('.inkg'), filter: svg.querySelector(`#bleed${idx}`), disp: svg.querySelector(`#disp${idx}`), blur: svg.querySelector(`#blur${idx}`) };
  }

  function layout() {
    VW = innerWidth;
    H = $('#paper').clientHeight;
    PW = Math.round(VW * C.span);
    $('#layers').innerHTML = '';
    layers.length = 0;
    C.layers.forEach((L, i) => layers.push(buildLayer(L, i)));
    // 雾带有自己的视差系数（0.8 / 1.1），宽度需覆盖 VW + (PW − VW) × 系数，再留余量
    $('#mist1').style.width = `${Math.ceil(VW + (PW - VW) * 0.8 + 600)}px`;
    $('#mist2').style.width = `${Math.ceil(VW + (PW - VW) * 1.1 + 600)}px`;
  }
  layout();

  /* ---------- 镜头：自动平移 / 用户浏览 ---------- */
  let userCam = null;
  const camFollow = MK.follow(0, 7);
  const autoCam = (t) => (PW - VW) * (1 - seg(t, T.panFrom, T.panTo - T.panFrom, ease.inOutCubic));

  function render(t) {
    // 展开：右轴固定，左轴向左移动，纸面在两轴之间显露
    const u = seg(t, T.open, T.unroll - T.open, ease.outCubic);
    const rightX = VW * 0.94, leftX = lerp(rightX - 26, VW * 0.06, u);
    $('#rollL').style.left = `${leftX - 13}px`;
    $('#rollR').style.left = `${rightX - 13}px`;
    $('#paper').style.clipPath = `inset(0 ${VW - rightX}px 0 ${leftX}px)`;

    const camX = userCam != null ? camFollow.value : autoCam(t);
    // 墨层：视差平移 + 晕开显影
    layers.forEach((ly, i) => {
      ly.el.style.transform = `translateX(${(-camX * ly.L.parallax).toFixed(1)}px)`;
      const k = seg(t, ly.L.bleed, 1.6, ease.outCubic);
      const cx = camX * ly.L.parallax + VW * 0.62;
      if (k >= 1 || REDUCE) { ly.el.style.maskImage = 'none'; ly.el.style.webkitMaskImage = 'none'; }
      else {
        const rr = k * ly.LW * 0.9;
        const m = `radial-gradient(circle at ${cx.toFixed(0)}px 55%, #000 ${rr.toFixed(0)}px, transparent ${(rr + 220).toFixed(0)}px)`;
        ly.el.style.maskImage = m; ly.el.style.webkitMaskImage = m;
      }
      // 滤镜只在晕开期间启用，并把滤镜区域限制在当前可见窗口（超宽元素的滤镜区域会被浏览器截断）
      const bleeding = k > 0 && k < 1 && !REDUCE;
      if (bleeding) {
        ly.g.setAttribute('filter', `url(#bleed${i})`);
        ly.filter.setAttribute('x', (camX * ly.L.parallax - 240).toFixed(0));
        ly.filter.setAttribute('width', (VW + 480).toFixed(0));
        ly.disp.setAttribute('scale', ((1 - k) * 70).toFixed(1));
        ly.blur.setAttribute('stdDeviation', ((1 - k) * 6).toFixed(2));
      } else ly.g.removeAttribute('filter');
      ly.el.style.opacity = t >= ly.L.bleed - 0.05 || REDUCE ? 1 : 0;
    });
    $('#mist1').style.transform = `translateX(${(-camX * 0.8 + Math.sin(t * 0.3) * 30).toFixed(1)}px)`;
    $('#mist2').style.transform = `translateX(${(-camX * 1.1 - Math.sin(t * 0.25) * 40).toFixed(1)}px)`;
    $('#mist1').style.opacity = seg(t, 2.6, 1.5); $('#mist2').style.opacity = seg(t, 3.2, 1.5);

    // 题诗：位于长卷右侧，逐列由上而下显现
    const poem = $('#poem');
    poem.style.left = `${(PW * C.poem.at - camX).toFixed(1)}px`;
    [['#col1', 0], ['#col2', 0.9], ['#by', 1.8]].forEach(([s, d]) => {
      const k = seg(t, T.text + d, 1.1, ease.inOutCubic);
      const m = `linear-gradient(180deg, #000 ${k * 100}%, transparent ${k * 100 + 12}%)`;
      $(s).style.maskImage = m; $(s).style.webkitMaskImage = m;
      $(s).style.filter = k < 1 && !REDUCE ? `blur(${(1 - k) * 1.2}px)` : 'none';
    });
    $('.seal-s').style.opacity = seg(t, T.text + 2.4, 0.3);

    // 盖章：位于长卷左端（阅读终点）
    const seal = $('#seal'), sx = PW * 0.07 - camX, sy = H * 0.62;
    seal.style.left = `${sx.toFixed(1)}px`; seal.style.top = `${sy.toFixed(1)}px`;
    const sk = seg(t, T.stamp, 0.26, ease.outBack);
    seal.style.opacity = t >= T.stamp ? clamp(sk * 4) : 0;
    seal.style.transform = `translate(-50%, -50%) rotate(${lerp(-6, -2, clamp(sk))}deg) scale(${lerp(1.35, 1, clamp(sk, 0, 1.1))})`;
    const ring = $('#inkRing'), rk = seg(t, T.stamp + 0.1, 0.8, ease.outCubic);
    ring.style.left = `${sx}px`; ring.style.top = `${sy}px`;
    ring.style.opacity = t >= T.stamp + 0.1 ? (1 - rk) * 0.6 : 0;
    ring.style.transform = `translate(-50%, -50%) scale(${1 + rk * 18})`;
    const shake = !REDUCE && t >= T.stamp ? 6 * Math.exp(-(t - T.stamp) * 14) : 0;
    $('#scroll').style.transform = `translate(${Math.sin(t * 80) * shake}px, calc(-52% + ${Math.cos(t * 70) * shake}px))`;

    // 缩略图视窗
    const mw = $('#mini').clientWidth;
    $('#win').style.width = `${(VW / PW) * mw}px`;
    $('#win').style.left = `${(camX / PW) * mw}px`;
    $('#mini').style.opacity = u;
    $('#hint').style.opacity = seg(t, T.panTo, 0.6) * (userCam == null ? 1 : 0);
  }

  /* ---------- 时间轴 ---------- */
  const tl = MK.timeline({
    duration: T.duration, render,
    markers: [{ t: T.open, label: '展开' }, ...C.layers.map((L) => ({ t: L.bleed, label: `墨层 · ${L.name}` })), { t: T.text, label: '题诗' }, { t: T.panFrom, label: '平移' }, { t: T.stamp, label: '盖章' }],
  });
  const seek0 = tl.seek, play0 = tl.play;
  tl.seek = (x) => { userCam = null; return seek0(x); };
  tl.play = () => { userCam = null; return play0(); };

  // 用户浏览：拖动、滚轮、方向键 → 目标位置；临界阻尼跟随
  let raf = 0, last = 0;
  function liveLoop(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    camFollow.step(dt); render(tl.time);
    if (Math.abs(camFollow.value - camFollow.target) > 0.3 || Math.abs(camFollow.velocity) > 0.3) raf = requestAnimationFrame(liveLoop); else { last = 0; raf = 0; }
  }
  function moveTo(x) {
    if (userCam == null) { tl.pause(); camFollow.snap(autoCam(tl.time)); }
    userCam = clamp(x, 0, PW - VW);
    camFollow.target = userCam;
    if (REDUCE) camFollow.snap(userCam);
    if (!raf) raf = requestAnimationFrame(liveLoop);
  }
  const room = $('#room');
  let drag = null;
  room.addEventListener('pointerdown', (e) => { if (e.target.closest('.mk-controls')) return; drag = { x: e.clientX, cam: userCam ?? autoCam(tl.time) }; room.setPointerCapture(e.pointerId); });
  room.addEventListener('pointermove', (e) => { if (drag) moveTo(drag.cam - (e.clientX - drag.x) * 1.4); });
  room.addEventListener('pointerup', () => { drag = null; });
  room.addEventListener('wheel', (e) => { e.preventDefault(); moveTo((userCam ?? autoCam(tl.time)) + (e.deltaY + e.deltaX)); }, { passive: false });
  addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault(); e.stopImmediatePropagation();
    moveTo((userCam ?? autoCam(tl.time)) + (e.key === 'ArrowRight' ? 1 : -1) * VW * 0.3);
  }, true);
  $('#mini').addEventListener('pointerdown', (e) => { e.stopPropagation(); const r = $('#mini').getBoundingClientRect(); moveTo(((e.clientX - r.left) / r.width) * PW - VW / 2); });

  const cues = [
    { t: T.open, fn: () => sfx.noise({ d: 1.6, g: 0.05, hp: 300, lp: 2400 }) },
    ...C.layers.map((L) => ({ t: L.bleed, fn: () => sfx.tone({ f: 196 + L.parallax * 98, d: 1.8, type: 'sine', g: 0.05 }) })),
    { t: T.stamp, fn: () => { sfx.tone({ f: 90, d: 0.25, g: 0.35, slide: -40 }); sfx.noise({ d: 0.08, g: 0.12, lp: 1200 }); } },
  ];
  let prev = 0;
  tl.on((t, playing) => { if (playing && t > prev && t - prev < 0.5) for (const c of cues) if (c.t > prev && c.t <= t) c.fn(); prev = t; });

  MK.expose(tl, { title: '水墨长卷展台', sound: sfx });
  MK.controls(tl, { sound: sfx, accent: '#b8322a' });
  addEventListener('resize', () => { layout(); render(tl.time); });
  tl.seek(P.t ?? (REDUCE ? T.panTo + 0.5 : 0));
  if (P.autoplay && !REDUCE) tl.play();
})();
