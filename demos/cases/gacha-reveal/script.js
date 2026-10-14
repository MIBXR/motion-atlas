/*
 * 抽卡揭示舞台 · 渲染器（时间轴驱动，可 seek）
 * 节奏：蓄力（粒子螺旋内收）→ 预示色 → 升格假动作（金）→ 爆发 → 十张飞入 → 逐张翻牌 → 金卡停顿后翻开 → 结果
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG, T = C.timing;
  const { clamp, lerp, seg, ease } = MK;
  const $ = (s) => document.querySelector(s);
  const P = MK.params();
  const sfx = MK.sound();
  const REDUCE = MK.prefersReducedMotion();
  const top = Math.max(...C.results.map((r) => r.r));
  const RC = C.rarityColors;

  /* ---------- 卡面 ---------- */
  const GLYPH = {
    moon: '<path d="M60 10a40 40 0 1 0 30 70 34 34 0 1 1-30-70z" fill="#fff"/>',
    flame: '<path d="M50 6c22 24 28 38 28 52a28 28 0 0 1-56 0c0-18 16-24 16-40 6 8 10 12 12 0z" fill="#fff"/>',
    star: '<path d="M50 6l12 30 32 2-25 20 9 32-28-18-28 18 9-32L6 38l32-2z" fill="#fff"/>',
    wave: '<path d="M6 60c14-20 30-20 44 0s30 20 44 0M6 40c14-20 30-20 44 0s30 20 44 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>',
    feather: '<path d="M80 8C40 18 20 50 22 92l10-10C40 60 56 38 80 8z" fill="#fff"/>',
    sun: '<circle cx="50" cy="50" r="18" fill="#fff"/><path d="M50 8v14M50 78v14M8 50h14M78 50h14M20 20l10 10M70 70l10 10M80 20L70 30M30 70L20 80" stroke="#fff" stroke-width="6" stroke-linecap="round"/>',
    leaf: '<path d="M14 86C14 40 40 14 86 14c0 46-26 72-72 72zM14 86l40-40" fill="#fff" stroke="#fff" stroke-width="2"/>',
    crown: '<path d="M10 76l6-46 20 22 14-36 14 36 20-22 6 46z" fill="#fff"/><rect x="10" y="80" width="80" height="10" fill="#fff"/>',
  };
  const GRAD = { 3: ['#1d3f8f', '#4aa8ff'], 4: ['#3d1f8f', '#b06bff'], 5: ['#8f5a0c', '#ffcf4a'] };
  $('#cards').innerHTML = C.results.map((c, i) => `<div class="card" data-i="${i}" style="--rc:${RC[c.r]};--c1:${GRAD[c.r][0]};--c2:${GRAD[c.r][1]}"><div class="face back"></div><div class="face front"><svg viewBox="0 0 100 100" aria-hidden="true">${GLYPH[c.glyph]}</svg><b>${c.name}</b><span class="stars">${'★'.repeat(c.r)}</span><i class="sheen"></i></div></div>`).join('');
  const cards = [...document.querySelectorAll('.card')];
  $('#title').textContent = C.title;
  const goldIdx = C.results.findIndex((c) => c.r === 5);
  // 翻牌顺序：其余按位置依次翻，金卡最后
  const order = C.results.map((_, i) => i).filter((i) => i !== goldIdx).concat(goldIdx >= 0 ? [goldIdx] : []);
  const flipAt = (i) => { const k = order.indexOf(i); return T.flip + k * T.flipStagger + (i === goldIdx ? T.goldPause : 0); };
  const n4 = C.results.filter((c) => c.r === 4).length, n5 = C.results.filter((c) => c.r === 5).length;

  /* ---------- 粒子（固定种子，按时间计算位置） ---------- */
  const fx = $('#fx'), g = fx.getContext('2d');
  const parts = Array.from({ length: 160 }, (_, i) => { const r = MK.rng(9 + i); return { a: r() * Math.PI * 2, r0: 0.35 + r() * 0.5, w: 1.5 + r() * 2.5, s: 0.6 + r() * 1.4, size: 1 + r() * 2.6, hue: r() }; });

  function tellColor(t) {
    if (t < T.tell) return '#ffffff';
    if (top === 5 && t < T.upgrade) return RC[4]; // 假动作：先给紫色
    return RC[top];
  }

  function drawFx(t, col) {
    const W = fx.width, H = fx.height, cx = W / 2, cy = H * 0.48;
    g.clearRect(0, 0, W, H);
    const charge = seg(t, T.press, T.burst - T.press, ease.inCubic);
    const burst = t >= T.burst ? (t - T.burst) : -1;
    for (const p of parts) {
      let x, y, alpha;
      if (t < T.press) { // 待机：缓慢漂浮
        const a = p.a + t * 0.05 * p.s, rr = p.r0 * W * 0.45;
        x = cx + Math.cos(a) * rr; y = cy + Math.sin(a) * rr * 0.55; alpha = 0.25;
      } else if (burst < 0) { // 蓄力：螺旋内收
        const a = p.a + (t - T.press) * p.w * (1 + charge * 3), rr = p.r0 * W * 0.45 * (1 - charge * 0.9);
        x = cx + Math.cos(a) * rr; y = cy + Math.sin(a) * rr * 0.55; alpha = 0.35 + charge * 0.65;
      } else { // 爆发：径向飞散并淡出
        const k = ease.outExpo(clamp(burst / 1.2)), rr = k * W * 0.6 * p.s;
        x = cx + Math.cos(p.a) * rr; y = cy + Math.sin(p.a) * rr * 0.7; alpha = 1 - clamp(burst / 1.6);
      }
      if (alpha <= 0) continue;
      g.fillStyle = col; g.globalAlpha = alpha * (0.6 + 0.4 * p.hue);
      g.beginPath(); g.arc(x, y, p.size * (burst >= 0 ? 1.4 : 1), 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    // 冲击波
    if (burst >= 0 && burst < 0.8) {
      g.strokeStyle = col; g.lineWidth = 8 * (1 - burst / 0.8); g.globalAlpha = 1 - burst / 0.8;
      g.beginPath(); g.ellipse(cx, cy, burst * 1400, burst * 900, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
  }

  function render(t) {
    const col = tellColor(t);
    document.documentElement.style.setProperty('--tell', col);
    drawFx(t, col);

    // 光球：蓄力时放大、双环反向旋转；爆发时消失
    const orb = $('#orb');
    const ch = seg(t, T.press, T.burst - T.press, ease.inCubic);
    const orbOn = t >= T.press && t < T.burst + 0.05;
    orb.style.opacity = orbOn ? 1 : 0;
    const jitter = t >= T.upgrade && t < T.burst && !REDUCE ? Math.sin(t * 90) * 4 : 0;
    orb.style.transform = `translate(${jitter}px, 0) scale(${0.3 + ch * 1.1 + (t >= T.upgrade && top === 5 ? 0.25 : 0)})`;
    orb.querySelector('.r1').style.transform = `rotate(${t * 140}deg) scale(${1 + Math.sin(t * 12) * 0.03})`;
    orb.querySelector('.r2').style.transform = `rotate(${-t * 220}deg)`;

    // 闪白：预示（弱）→ 升格（中）→ 爆发（强）
    let fl = 0;
    if (t >= T.tell) fl = Math.max(fl, 0.35 * Math.exp(-(t - T.tell) * 10));
    if (top === 5 && t >= T.upgrade) fl = Math.max(fl, 0.7 * Math.exp(-(t - T.upgrade) * 9));
    if (t >= T.burst) fl = Math.max(fl, Math.exp(-(t - T.burst) * 5));
    $('#flash').style.opacity = REDUCE ? 0 : fl;

    // 卡牌：从中心飞入网格 → 逐张翻面（金卡最后、前有光柱）
    const gridW = $('#cards').getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle($('#cards')).columnGap) || 12;
    const cw = (gridW - gap * 4) / 5, chh = cw * 1.4;
    cards.forEach((el, i) => {
      const col0 = i % 5, row = Math.floor(i / 5);
      const ox = (col0 - 2) * (cw + gap), oy = (row - 0.5) * (chh + gap);
      const fk = seg(t, T.fly + i * T.flyStagger, 0.5, ease.outCubic);
      const fa = flipAt(i), flk = seg(t, fa, 0.45, ease.outBack);
      const isGold = i === goldIdx;
      const pop = isGold ? Math.exp(-Math.max(0, t - fa - 0.3) * 3) * (t > fa + 0.3 ? 0.12 : 0) : 0;
      el.style.opacity = t >= T.fly ? clamp(fk * 3) : 0;
      el.style.transform = `translate(${-ox * (1 - fk)}px, ${-oy * (1 - fk)}px) scale(${lerp(0.2, 1, fk) * (1 + pop)}) rotate(${(1 - fk) * -25}deg) rotateY(${clamp(flk, 0, 1.08) * 180}deg)`;
      el.querySelector('.sheen').style.transform = `translateX(${lerp(-100, 100, seg(t, fa + 0.3, 0.6, ease.inOutCubic))}%)`;
    });

    // 金卡光柱
    const pillar = $('#pillar');
    if (goldIdx >= 0) {
      const ga = flipAt(goldIdx);
      const pv = seg(t, ga - 0.45, 0.35, ease.outCubic) * (1 - seg(t, ga + 0.8, 0.8));
      const rect = cards[goldIdx].getBoundingClientRect();
      pillar.style.left = `${rect.left + rect.width / 2}px`;
      pillar.style.opacity = pv;
      pillar.style.transform = `scaleX(${0.4 + pv * 0.6})`;
    } else pillar.style.opacity = 0;

    // UI
    const idle = t < T.press, done = t >= T.results;
    const draw = $('#draw'), skip = $('#skip');
    draw.style.visibility = idle || done ? 'visible' : 'hidden';
    draw.style.transform = `scale(${idle ? 1 + Math.sin(t * 6) * 0.03 : seg(t, T.results, 0.3, ease.outBack)})`;
    skip.style.visibility = !idle && !done ? 'visible' : 'hidden';
    $('#count').textContent = done ? `RESULTS · ★5 ×${n5} · ★4 ×${n4}` : idle ? 'READY' : 'SUMMONING…';
    $('#sr').textContent = done ? `结果：${C.results.map((c) => `${c.name} ${c.r} 星`).join('，')}` : '';
  }

  const tl = MK.timeline({
    duration: T.duration, render,
    markers: [{ t: T.press, label: '按下 · 蓄力' }, { t: T.tell, label: '预示色' }, ...(top === 5 ? [{ t: T.upgrade, label: '升格' }] : []), { t: T.burst, label: '爆发' }, { t: T.fly, label: '飞入' }, { t: T.flip, label: '逐张翻牌' }, ...(goldIdx >= 0 ? [{ t: flipAt(goldIdx), label: '金卡' }] : []), { t: T.results, label: '结果' }],
  });
  const cues = [
    { t: T.press, fn: () => sfx.tone({ f: 110, d: T.burst - T.press, type: 'sawtooth', g: 0.04, slide: 330 }) },
    { t: T.tell, fn: () => sfx.tone({ f: 660, d: 0.4, type: 'triangle', g: 0.08 }) },
    ...(top === 5 ? [{ t: T.upgrade, fn: () => { sfx.noise({ d: 0.2, g: 0.15, hp: 2000 }); sfx.tone({ f: 988, d: 0.5, type: 'triangle', g: 0.1 }); } }] : []),
    { t: T.burst, fn: () => { sfx.noise({ d: 0.6, g: 0.25, lp: 4000 }); sfx.tone({ f: 80, d: 0.5, g: 0.3, slide: -40 }); } },
    ...C.results.map((c, i) => ({ t: flipAt(i), fn: () => sfx.tone({ f: c.r === 5 ? 1318 : c.r === 4 ? 1046 : 880, d: c.r === 5 ? 1.2 : 0.18, type: 'sine', g: c.r === 5 ? 0.1 : 0.05 }) })),
    ...(goldIdx >= 0 ? [{ t: flipAt(goldIdx), fn: () => [523, 659, 784, 1046].forEach((f, i) => sfx.tone({ f, d: 1.4, type: 'triangle', g: 0.05, delay: i * 0.06 })) }] : []),
  ];
  let prev = 0;
  tl.on((t, playing) => { if (playing && t > prev && t - prev < 0.5) for (const c of cues) if (c.t > prev && c.t <= t) c.fn(); prev = t; });
  $('#draw').addEventListener('click', () => { tl.seek(T.press); tl.play(); });
  $('#skip').addEventListener('click', () => { tl.seek(T.results); tl.pause(); });
  MK.expose(tl, { title: '抽卡揭示舞台', sound: sfx });
  MK.controls(tl, { sound: sfx, accent: '#ffcf4a' });
  addEventListener('resize', () => tl.seek(tl.time));
  tl.seek(P.t ?? (REDUCE ? T.results + 0.5 : 0));
  if (P.autoplay && !REDUCE) tl.play();
})();
