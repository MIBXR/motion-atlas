/*
 * 怪盗动势 · 渲染器（时间轴驱动，可 seek / 逐帧渲染）
 * 指令选择 → 命中 → WEAK → 1 MORE 切入 → HOLD UP → 询问 → 星形遮罩 → 总攻 → 收尾漫画格 → 结算
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG, B = C.beats;
  const { clamp, lerp, seg, env, ease } = MK;
  const $ = (s, r = document) => r.querySelector(s);
  const P = MK.params();
  const sfx = MK.sound();
  const REDUCE = MK.prefersReducedMotion();

  /* ---------- 剪报拼贴字：每个字母随机底色、字体、旋转与缩放（固定种子，可复现） ---------- */
  const PAIRS = [['#0b0b0c', '#fff'], ['#fff', '#0b0b0c'], ['#d7141a', '#fff'], ['#fff', '#d7141a'], ['#0b0b0c', '#d7141a']];
  const FONTS = ['"Arial Black", Impact, sans-serif', 'Georgia, "Times New Roman", serif', '"Courier New", monospace', 'Bahnschrift, "Segoe UI", sans-serif', 'Impact, "Arial Black", sans-serif'];
  function ransom(el, text, seed) {
    const r = MK.rng(seed);
    el.innerHTML = '';
    return MK.chars(text).map((ch) => {
      const s = document.createElement('span');
      if (ch === ' ') { s.style.width = '.35em'; el.appendChild(s); return { s, rot: 0, sc: 1, space: true }; }
      const [bg, fg] = PAIRS[Math.floor(r() * PAIRS.length)];
      s.textContent = ch;
      s.style.background = bg; s.style.color = fg;
      s.style.fontFamily = FONTS[Math.floor(r() * FONTS.length)];
      s.style.fontWeight = r() > 0.3 ? 900 : 700;
      const rot = (r() - 0.5) * 18, sc = 0.88 + r() * 0.36, dy = (r() - 0.5) * 0.16;
      el.appendChild(s);
      return { s, rot, sc, dy };
    });
  }
  // 字母“拍”进来：从 2.2 倍缩回、角度回弹，30ms 错峰
  function slam(letters, t, start, stagger = 0.03) {
    letters.forEach((l, i) => {
      if (l.space) return;
      const k = seg(t, start + i * stagger, 0.22, ease.outBack);
      const v = clamp(k * 4);
      l.s.style.opacity = v;
      l.s.style.transform = `translateY(${l.dy}em) rotate(${l.rot * (2 - k)}deg) scale(${l.sc * lerp(2.2, 1, clamp(k, 0, 1.2))})`;
    });
  }

  /* ---------- 构建 ---------- */
  const GLYPH = {
    triangle: '<path d="M12 4l9 15H3z" fill="none" stroke="#9be15d" stroke-width="3" stroke-linejoin="round"/>',
    circle: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="#ff4b5c" stroke-width="3"/>',
    cross: '<path d="M5 5l14 14M19 5L5 19" stroke="#1fb4ff" stroke-width="3" stroke-linecap="round"/>',
    square: '<rect x="5" y="5" width="14" height="14" fill="none" stroke="#ff6fb0" stroke-width="3"/>',
  };
  $('#commands').innerHTML = C.commands.map((c, i) => `<li class="cmd" data-i="${i}"><button type="button" aria-label="${c.cn}（${c.key}）"><i class="shadow"></i><i class="plate"></i><span class="glyph"><svg viewBox="0 0 24 24" aria-hidden="true">${GLYPH[c.glyph]}</svg></span><span class="label">${c.label}</span><span class="cn">${c.key}</span></button></li>`).join('');
  const cmds = [...document.querySelectorAll('.cmd')];
  $('#party').innerHTML = C.party.map((m) => `<li class="pm"><i class="pf" style="background:${m.color}"></i><b>${m.name}</b><div class="bar"><i style="width:${(m.hp[0] / m.hp[1]) * 100}%;background:#9be15d"></i></div><div class="bar"><i style="width:${(m.sp[0] / m.sp[1]) * 100}%;background:#ff6fb0"></i></div></li>`).join('');
  const pms = [...document.querySelectorAll('.pm')];
  $('#enemyName').textContent = C.enemy.name;
  $('#enemyLv').textContent = C.enemy.level;
  const L = {
    weak: (() => { const el = $('#weak'); el.textContent = C.text.weak; return el; })(),
    more: ransom($('#moreText'), C.text.more, C.seed),
    hold: ransom($('#holdUp'), C.text.holdUp, C.seed + 1),
    ask: ransom($('#askTitle'), C.text.allOut, C.seed + 2),
    fin: ransom($('#finishText'), C.text.finish, C.seed + 3),
  };
  $('#askSub').textContent = C.text.ask;
  $('#finishCn').textContent = C.text.finishCn;
  $('#resList').innerHTML = C.text.results.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  const resRows = [...document.querySelectorAll('#resList div')];

  // 星形遮罩路径（16 角）
  const star = (() => { let d = ''; for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 0.42 : 1; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r * 50).toFixed(2)} ${(Math.sin(a) * r * 50).toFixed(2)}`; } return d + 'Z'; })();
  $('#wipeStar').setAttribute('d', star);

  const ink = $('#ink').getContext('2d');
  const rngInk = MK.rng(C.seed + 9);
  const runners = Array.from({ length: 6 }, () => ({ y: 0.35 + rngInk() * 0.5, speed: 1600 + rngInk() * 1800, off: rngInk() * 2000, size: 1.3 + rngInk() * 1.1, dir: rngInk() > 0.5 ? 1 : -1 }));
  const slashes = Array.from({ length: 12 }, (_, i) => ({ t: B.frenzy[0] + 0.1 + i * 0.22, x: rngInk(), y: rngInk(), a: -0.6 + rngInk() * 0.4 }));

  /* ---------- 用户输入（菜单阶段） ---------- */
  let userIdx = null;

  function shakeAt(t) {
    const hits = [[B.hit, 22], [B.more, 10], [B.holdUp, 16], [B.confirm, 12], ...slashes.map((s) => [s.t, 14]), [B.finish, 18]];
    let a = 0;
    for (const [ht, amp] of hits) if (t >= ht) a += amp * Math.exp(-(t - ht) * 12);
    if (REDUCE) a = 0;
    return [Math.sin(t * 93) * a, Math.cos(t * 71) * a];
  }

  function show(el, v) { el.style.opacity = v; el.style.visibility = v > 0.001 ? 'visible' : 'hidden'; }

  function render(t) {
    const w = innerWidth, h = innerHeight;
    const [sx, sy] = shakeAt(t);
    $('#shake').style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;

    // 背景斜切黑带缓慢漂移
    $('#slab').style.transform = `rotate(-14deg) translateX(${Math.sin(t * 0.6) * 20}px)`;

    // 指令菜单：围绕角色放射分布，选中项放大、扭转、双层影子抖动
    const hero = $('#hero').getBoundingClientRect();
    const cx = hero.left + hero.width * 0.55 + 30, cy = hero.top + hero.height * 0.42 + 30;
    const R = Math.max(hero.width * 1.0, 170);
    const menuOn = t < B.hit + 0.1 ? 1 - seg(t, B.select + 0.25, 0.2) : 0;
    let cur = 2;
    for (const m of C.menuCursor) if (t >= m.t) cur = m.i;
    if (userIdx != null && t < B.select) cur = userIdx;
    if (t >= B.select) cur = 2;
    cmds.forEach((el, i) => {
      const c = C.commands[i];
      const a = (c.angle * Math.PI) / 180;
      const inK = seg(t, 0.05 + i * 0.06, 0.32, ease.outBack);
      const on = i === cur;
      const sel = on ? 1 : 0;
      const x = cx + Math.cos(a) * R * (on ? 1.08 : 1) - 30, y = cy + Math.sin(a) * R * 0.78 - 30;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${-6 + i * 3 - 6 * sel}deg) scale(${(0.6 + 0.4 * clamp(inK, 0, 1.2)) * (1 + 0.2 * sel)})`;
      el.style.opacity = clamp(inK * 3) * menuOn;
      el.classList.toggle('on', on);
      const sh = el.querySelector('.shadow');
      sh.style.transform = on && !REDUCE ? `translate(${8 + Math.sin(t * 31) * 3}px, ${7 + Math.cos(t * 27) * 3}px)` : 'translate(8px, 7px)';
      el.style.zIndex = on ? 2 : 1;
    });
    $('#cmdHelp').style.opacity = menuOn;
    pms.forEach((el, i) => { const k = seg(t, 0.15 + i * 0.08, 0.35, ease.outCubic); el.style.transform = `translateX(${(1 - k) * 60}px) rotate(-3deg)`; el.style.opacity = k; });

    // 目标准星与命中
    const enemy = $('#enemy').getBoundingClientRect();
    const ex = enemy.left + enemy.width / 2 + 30, ey = enemy.top + enemy.height * 0.5 + 30;
    const tgt = $('#target');
    show(tgt, t >= B.select && t < B.hit ? 1 : 0);
    tgt.style.transform = `translate(${ex - 30}px, ${ey - 30}px) rotate(${t * 220}deg) scale(${lerp(1.6, 1, seg(t, B.select, 0.25, ease.outCubic))})`;
    $('#hitflash').style.opacity = t >= B.hit && t < B.hit + 0.08 ? 1 : 0;
    const recoil = t >= B.hit ? Math.exp(-(t - B.hit) * 6) : 0;
    const dizzy = t >= B.holdUp ? Math.sin((t - B.holdUp) * 6) * 8 : 0;
    $('#enemy').style.transform = `translateX(${recoil * 40}px) rotate(${recoil * 8 + dizzy}deg)`;
    $('#enemy').style.filter = t >= B.hit && t < B.hit + 0.12 ? 'brightness(3)' : 'none';
    $('#enemyHp').style.width = `${lerp(100, 34, seg(t, B.hit, 0.4, ease.outCubic))}%`;

    // WEAK 冲击字
    const weak = L.weak;
    const wk = seg(t, B.weak, 0.26, ease.outBack);
    show(weak, t >= B.weak && t < B.more ? 1 - seg(t, B.more - 0.2, 0.2) : 0);
    weak.style.left = `${ex - 30 - w * 0.2}px`; weak.style.top = `${ey - 30 + h * 0.08}px`;
    weak.style.transform = `rotate(${-10 + (1 - clamp(wk)) * -20}deg) scale(${lerp(2.6, 1, clamp(wk, 0, 1.15))})`;

    // 1 MORE 切入：斜带从右切入、速度线流动、离场继续向左
    const ci = $('#cutin');
    const cin = seg(t, B.more, 0.22, ease.outExpo), cout = seg(t, B.holdUp - 0.25, 0.22, ease.inCubic);
    show(ci, t >= B.more && t < B.holdUp ? 1 : 0);
    $('#band').style.transform = `rotate(-8deg) translateX(${(1 - cin) * 120 - cout * 120}%)`;
    $('#speed').style.backgroundPosition = `${-t * 1400}px 0`;
    $('.eyes').style.transform = `translate(-50%, -50%) scale(${1 + seg(t, B.more, 1.4, ease.linear) * 0.12})`;
    slam(L.more, t, B.more + 0.15);
    $('#moreText').style.opacity = 1 - cout;

    // HOLD UP
    show($('#holdUp'), t >= B.holdUp && t < B.ask ? 1 - seg(t, B.ask - 0.15, 0.15) : 0);
    slam(L.hold, t, B.holdUp, 0.04);

    // 询问总攻
    const ask = $('#ask');
    show(ask, t >= B.ask && t < B.wipe ? 1 : 0);
    ask.style.background = `rgba(11,11,12,${0.55 * seg(t, B.ask, 0.2)})`;
    slam(L.ask, t, B.ask + 0.05, 0.025);
    $('#askSub').style.transform = `rotate(-4deg) scale(${seg(t, B.ask + 0.45, 0.25, ease.outBack)})`;

    // 星形遮罩：黑色星从中心放大覆盖，再在总攻画面里缩回
    const wIn = seg(t, B.wipe, 0.38, ease.inQuad), wOut = seg(t, B.frenzy[0], 0.3, ease.outCubic);
    const wipeScale = t < B.frenzy[0] ? wIn * 3.2 : 3.2 * (1 - wOut);
    $('#wipeStar').setAttribute('transform', `rotate(${t * 90}) scale(${wipeScale.toFixed(3)})`);
    $('#wipe').style.visibility = wipeScale > 0.01 ? 'visible' : 'hidden';

    // 场景切换
    const inBattle = t < B.frenzy[0];
    show($('#battle'), inBattle ? 1 : 0);
    const fz = $('#frenzy');
    show(fz, t >= B.frenzy[0] && t < B.finish ? 1 : 0);
    if (t >= B.frenzy[0] && t < B.finish) drawInk(t);

    // 收尾漫画格
    const fin = $('#finish');
    show(fin, t >= B.finish && t < B.results ? 1 : 0);
    $('#burst').style.transform = `rotate(${t * 8}deg)`;
    const pk = seg(t, B.finish + 0.05, 0.35, ease.outExpo);
    $('#panel').style.transform = `translateX(${(1 - pk) * 70}%) rotate(${(1 - pk) * 6}deg)`;
    slam(L.fin, t, B.finish + 0.35, 0.035);
    $('#finishCn').style.transform = `rotate(-4deg) scale(${seg(t, B.finish + 0.95, 0.3, ease.outBack)})`;
    fin.style.filter = t >= B.finish && t < B.finish + 0.07 ? 'invert(1)' : 'none';

    // 结算
    const res = $('#results');
    show(res, t >= B.results ? 1 : 0);
    const rk = seg(t, B.results + 0.05, 0.45, ease.outExpo);
    $('#resSlab').style.transform = `translateX(${(rk - 1) * 110}%)`;
    resRows.forEach((r, i) => { const k = seg(t, B.results + 0.4 + i * 0.12, 0.3, ease.outCubic); r.style.opacity = k; r.style.transform = `translateX(${(1 - k) * -40}px)`; });
  }

  function drawInk(t) {
    const W = 1600, H = 900, g = ink;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    const local = t - B.frenzy[0];
    // 红色斜切：按节拍闪现、快速衰减
    for (const s of slashes) {
      if (t < s.t) continue;
      const k = 1 - clamp((t - s.t) / 0.35);
      if (k <= 0) continue;
      g.save(); g.translate(s.x * W, s.y * H); g.rotate(s.a);
      g.fillStyle = `rgba(215,20,26,${k})`;
      g.fillRect(-W, -28 * k - 6, W * 2, (28 * k + 6) * 2);
      g.fillStyle = `rgba(11,11,12,${k * 0.9})`;
      g.fillRect(-W, 34 * k + 8, W * 2, 6);
      g.restore();
    }
    // 黑色剪影冲刺：带拖尾
    for (const r of runners) {
      const x = ((local * r.speed + r.off) % (W + 600)) - 300;
      const X = r.dir > 0 ? x : W - x, y = r.y * H, s = 120 * r.size;
      for (let k = 0; k < 4; k++) {
        g.globalAlpha = k === 0 ? 1 : 0.18 / k;
        const xx = X - r.dir * k * 40;
        g.fillStyle = '#0b0b0c';
        g.beginPath();
        g.ellipse(xx, y - s * 0.9, s * 0.22, s * 0.26, 0, 0, Math.PI * 2);
        g.moveTo(xx - s * 0.35, y - s * 0.6); g.lineTo(xx + s * 0.45 * r.dir, y - s * 0.55); g.lineTo(xx + s * 0.25, y + s * 0.5); g.lineTo(xx - s * 0.55 * r.dir, y + s * 0.45);
        g.fill();
      }
      g.globalAlpha = 1;
    }
    const words = ['STRIKE!', 'SLASH!', 'CRASH!', 'BREAK!'];
    $('#frenzyWord').textContent = words[Math.floor(local / 0.66) % words.length];
    $('#frenzyWord').style.transform = `rotate(-6deg) scale(${1 + 0.25 * Math.exp(-((local % 0.66) * 10))})`;
  }

  /* ---------- 时间轴 ---------- */
  const markers = [
    { t: 0.4, label: '指令菜单' }, { t: B.select, label: '选择攻击' }, { t: B.hit, label: '命中 · WEAK' }, { t: B.more, label: '1 MORE 切入' },
    { t: B.holdUp, label: 'HOLD UP' }, { t: B.ask, label: '询问总攻' }, { t: B.wipe, label: '星形遮罩' }, { t: B.frenzy[0], label: '总攻' },
    { t: B.finish, label: '收尾漫画格' }, { t: B.results, label: '结算' },
  ];
  const tl = MK.timeline({ duration: C.duration, render, markers });
  const cues = [
    ...C.menuCursor.map((m) => ({ t: m.t, fn: () => sfx.tone({ f: 1320, d: 0.05, type: 'square', g: 0.04 }) })),
    { t: B.select, fn: () => sfx.tone({ f: 880, d: 0.12, type: 'sawtooth', g: 0.05, slide: 440 }) },
    { t: B.hit, fn: () => { sfx.noise({ d: 0.18, g: 0.3, lp: 3000 }); sfx.tone({ f: 120, d: 0.2, g: 0.25, slide: -60 }); } },
    { t: B.weak, fn: () => sfx.tone({ f: 660, d: 0.25, type: 'square', g: 0.06, slide: 330 }) },
    { t: B.more, fn: () => sfx.noise({ d: 0.35, g: 0.12, hp: 800, lp: 9000 }) },
    { t: B.holdUp, fn: () => { sfx.tone({ f: 523, d: 0.2, type: 'square', g: 0.06 }); sfx.tone({ f: 784, d: 0.3, type: 'square', g: 0.06, delay: 0.12 }); } },
    { t: B.confirm, fn: () => sfx.tone({ f: 220, d: 0.5, type: 'sawtooth', g: 0.08, slide: 660 }) },
    ...slashes.map((s) => ({ t: s.t, fn: () => sfx.noise({ d: 0.1, g: 0.18, lp: 5000, hp: 600 }) })),
    { t: B.finish, fn: () => { [392, 494, 587, 784].forEach((f, i) => sfx.tone({ f, d: 0.9, g: 0.05, type: 'triangle', delay: i * 0.03 })); } },
    { t: B.results, fn: () => sfx.tone({ f: 988, d: 0.1, g: 0.06 }) },
  ];
  let prev = 0;
  tl.on((t, playing) => { if (playing && t > prev && t - prev < 0.5) for (const c of cues) if (c.t > prev && c.t <= t) c.fn(); prev = t; });

  // 菜单阶段：WASD 选择，Enter 执行；询问阶段 Enter 确认
  const KEYMAP = { w: 0, d: 1, s: 2, a: 3 };
  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k in KEYMAP && tl.time < B.select) { userIdx = KEYMAP[k]; tl.pause(); tl.seek(Math.min(tl.time, B.select - 0.01)); sfx.tone({ f: 1320, d: 0.05, type: 'square', g: 0.04 }); }
    if (e.key === 'Enter') {
      if (tl.time < B.select) { tl.seek(B.select); tl.play(); }
      else if (tl.time >= B.ask && tl.time < B.confirm) { tl.seek(B.confirm); tl.play(); }
    }
  });
  $('#commands').addEventListener('click', (e) => {
    const li = e.target.closest('.cmd');
    if (!li) return;
    userIdx = Number(li.dataset.i);
    tl.seek(B.select); tl.play();
  });

  MK.expose(tl, { title: '怪盗动势', sound: sfx });
  MK.controls(tl, { sound: sfx, accent: '#d7141a' });
  addEventListener('resize', () => tl.seek(tl.time));
  tl.seek(P.t ?? (REDUCE ? 2.2 : 0));
  if (P.autoplay && !REDUCE) tl.play();
})();
