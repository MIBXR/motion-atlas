/*
 * 节拍动态字幕 · 渲染器
 * 画面：render(t) 只依赖时间；每个视觉事件都换算成“第几拍”。
 * 声音：合成鼓点按“前瞻 120ms”调度到 AudioContext（不是逐帧触发），保证听到的拍与看到的拍对齐。
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
  const SPB = BT.spb;
  const TOTAL_BEATS = C.bars * 4;
  const END_AT = TOTAL_BEATS - 4; // 结尾卡从倒数第 4 拍出现
  const DURATION = TOTAL_BEATS * SPB + 1.2;

  $('#title').textContent = C.title;
  $('#ecTitle').textContent = C.title;
  $('#ecCredit').textContent = C.credit;
  $('#meter').innerHTML = '<i></i>'.repeat(24);
  const meterBars = [...document.querySelectorAll('#meter i')];
  const squares = [...document.querySelectorAll('#sq i')];

  /* ---------- 文字元素 ---------- */
  const words = C.lyrics.filter((l) => l.style !== 'stack').map((l) => {
    const el = document.createElement('p');
    el.className = `w ${l.style}`;
    if (l.style === 'rise') el.innerHTML = `<span>${l.text}</span>`;
    else if (l.style === 'giant') el.innerHTML = MK.chars(l.text).map((c) => `<span>${c}</span>`).join('');
    else el.textContent = l.text;
    $('#words').appendChild(el);
    return { l, el };
  });
  const stackWords = C.lyrics.filter((l) => l.style === 'stack');
  $('#stack').innerHTML = Array.from({ length: 8 }, () => '<div class="cell"><b></b></div>').join('');
  const cells = [...document.querySelectorAll('#stack .cell')];

  const sectionAt = (bar) => C.sections.filter((s) => s.bar <= bar).pop();
  const prevSectionOf = (sec) => C.sections[Math.max(0, C.sections.indexOf(sec) - 1)];
  const kickPulse = (beat, decay = 8) => { if (beat < 0) return 0; const f = beat - Math.floor(beat); return Math.exp(-f * decay); };

  function render(t) {
    const beat = t / SPB;
    const bar = Math.floor(beat / 4);
    const sec = sectionAt(Math.min(bar, C.bars - 1));
    const inDrop = beat >= C.pattern.dropFrom && beat < C.pattern.dropTo;
    const inBuild = beat >= C.pattern.buildFrom && beat < C.pattern.dropFrom;

    // 配色：段落开始时新色块从左擦入；Drop 每拍换色
    let bg = sec.bg, fg = sec.fg;
    if (sec.strobe && inDrop) { const k = Math.floor(beat) % sec.strobe.length; bg = sec.strobe[k]; fg = sec.strobe[(k + 2) % sec.strobe.length]; }
    const secStart = sec.bar * 4 * SPB;
    const wp = seg(t, secStart, 0.35, ease.inOutQuart);
    const prev = prevSectionOf(sec);
    $('#bg').style.background = wp < 1 && !sec.strobe ? prev.bg : bg;
    $('#wipe').style.background = bg;
    $('#wipe').style.clipPath = wp < 1 && !sec.strobe ? `inset(0 ${(1 - wp) * 100}% 0 0)` : 'inset(0 0 0 0)';
    const stage = $('#stage');
    stage.style.setProperty('--bg', bg);
    stage.style.setProperty('--fg', fg);
    stage.style.setProperty('--accent', sec.accent);
    stage.style.color = fg;

    // 镜头：每拍一次缩放脉冲；Drop 加抖动
    const kp = kickPulse(beat);
    const zoom = 1 + (inDrop ? 0.06 : 0.022) * kp * (REDUCE ? 0 : 1);
    const sh = inDrop && !REDUCE ? 14 * kp : 0;
    $('#cam').style.transform = `translate(${Math.sin(t * 90) * sh}px, ${Math.cos(t * 77) * sh}px) scale(${zoom})`;

    // 军鼓拍（每小节第 2、4 拍）条纹闪；Build 段随进度加密
    const snareBeat = Math.floor(beat) % 2 === 1 && beat >= 8;
    const snareK = snareBeat ? kickPulse(beat, 10) : 0;
    const buildK = inBuild ? (beat - C.pattern.buildFrom) / (C.pattern.dropFrom - C.pattern.buildFrom) : 0;
    $('#stripes').style.opacity = REDUCE ? 0 : Math.max(snareK * (inDrop ? 0.5 : 0.18), inBuild ? kickPulse(beat * 2, 9) * buildK * 0.35 : 0);

    // 文字
    let current = '';
    for (const { l, el } of words) {
      const b0 = l.beat, t0 = b0 * SPB;
      let vis = 0, tr = '';
      if (l.style === 'count') {
        vis = beat >= b0 && beat < b0 + 1 ? 1 - seg(t, t0 + SPB * 0.6, SPB * 0.35) : 0;
        tr = `translate(-50%, -50%) scale(${lerp(1.4, 1, seg(t, t0, 0.15, ease.outExpo))})`;
      } else if (l.style === 'slam') {
        // 拍上硬切：出现瞬间 1.5→1，持续 hold 拍后直接消失；反拍轻轻上弹
        const hold = l.hold || 1;
        vis = beat >= b0 && beat < b0 + hold ? 1 : 0;
        const k = seg(t, t0, 0.12, ease.outExpo);
        const off = beat - b0 >= 0.5 ? Math.exp(-(beat - b0 - 0.5) * 10) : 0;
        tr = `translate(-50%, calc(-50% - ${off * 2}%)) scale(${lerp(1.5, 1, k)}) rotate(${(1 - k) * -3}deg)`;
      } else if (l.style === 'rise') {
        const hold = l.hold || 1;
        vis = beat >= b0 && beat < b0 + hold + 0.3 ? 1 : 0;
        const inK = seg(t, t0, 0.25, ease.outCubic), outK = seg(t, (b0 + hold) * SPB - 0.05, 0.2, ease.inCubic);
        el.firstChild.style.transform = `translateY(${(1 - inK) * 100 - outK * 100}%)`;
        tr = 'translate(-50%, -50%)';
      } else if (l.style === 'build') {
        // 八分音符连击：一层层叠加并放大，旧的留下残影
        vis = beat >= b0 && beat < C.pattern.dropFrom ? 1 : 0;
        const age = beat - b0;
        el.style.opacity = vis ? Math.max(0.08, 1 - age * 0.6) : 0;
        tr = `translate(-50%, -50%) translate(${Math.sin(l.i * 1.7) * 18}vw, ${Math.cos(l.i * 1.3) * 22}vh) scale(${(1 + l.i * 0.12) * lerp(1.4, 1, seg(t, t0, 0.1, ease.outExpo))}) rotate(${(l.i % 2 ? 1 : -1) * l.i * 1.5}deg)`;
        el.style.transform = tr;
        el.style.visibility = vis ? 'visible' : 'hidden';
        if (vis && age < 0.5) current = l.text;
        continue;
      } else if (l.style === 'giant') {
        vis = beat >= b0 && beat < b0 + l.hold ? 1 : 0;
        const k = seg(t, t0, 0.18, ease.outExpo);
        tr = `translate(-50%, -50%) scale(${lerp(2.2, 1, k)}, ${lerp(2.2, 1, k) * (1 + 0.12 * kp)})`;
        [...el.children].forEach((s, i) => { s.style.transform = `translateY(${Math.sin(beat * Math.PI + i) * 3 * kp}%)`; });
      }
      el.style.visibility = vis ? 'visible' : 'hidden';
      if (l.style !== 'build') el.style.opacity = vis;
      el.style.transform = tr;
      if (vis) current = l.text;
    }

    // 堆叠网格：段内保留，逐拍点亮；第 20 拍起整格反色
    const stackOn = beat >= 16 && beat < 24;
    $('#stack').style.visibility = stackOn ? 'visible' : 'hidden';
    cells.forEach((c, i) => {
      const w = stackWords.find((s) => s.cell === i);
      const on = w && beat >= w.beat;
      c.querySelector('b').textContent = on ? w.text : '';
      const k = on ? seg(t, w.beat * SPB, 0.12, ease.outExpo) : 0;
      c.querySelector('b').style.clipPath = `inset(0 ${(1 - k) * 100}% 0 0)`;
      c.classList.toggle('inv', on && beat >= 20 && (i + Math.floor(beat)) % 2 === 0);
    });

    // HUD：小节/拍计数与四格拍点
    const shownBeat = Math.min(Math.floor(beat), TOTAL_BEATS - 1);
    $('#section').textContent = beat >= TOTAL_BEATS ? 'END' : sec.name;
    $('#pos').textContent = `BAR ${MK.pad(Math.floor(shownBeat / 4) + 1)} · BEAT ${(shownBeat % 4) + 1} · ${C.bpm} BPM`;
    squares.forEach((q, i) => q.classList.toggle('on', i === shownBeat % 4 && beat < TOTAL_BEATS));

    // 频谱：底鼓 + 镲片的确定性包络
    const hat = kickPulse(beat * 2 + 0.5, 14);
    meterBars.forEach((m, i) => {
      const low = i < 8 ? kp * (1 - i / 10) : 0;
      const high = i >= 14 ? hat * (0.4 + (i - 14) / 20) : 0;
      const mid = 0.12 + 0.1 * Math.sin(t * 3 + i);
      const v = clamp(mid + low * (inDrop ? 1 : 0.7) + high * 0.6 + (inBuild ? buildK * 0.3 : 0));
      m.style.transform = `scaleY(${beat >= TOTAL_BEATS ? 0.04 : v})`;
      m.style.height = '100%';
    });

    // 结尾卡
    const ek = seg(t, END_AT * SPB, 0.4, ease.outExpo);
    $('#endcard').style.visibility = ek > 0 ? 'visible' : 'hidden';
    $('#endcard').style.opacity = ek;
    $('#endcard').style.transform = `scale(${lerp(1.2, 1, ek)})`;
    $('#now').textContent = current;
  }

  /* ---------- 合成鼓点：生成事件表 ---------- */
  const events = [];
  const at16 = (s) => s * SPB / 4;
  for (let s = 0; s < TOTAL_BEATS * 4; s++) {
    const beat = s / 4, step = s % 16, bar = Math.floor(beat / 4);
    const inDrop = beat >= C.pattern.dropFrom && beat < C.pattern.dropTo;
    const inBuild = beat >= C.pattern.buildFrom && beat < C.pattern.dropFrom;
    const intro = beat < 8;
    if (intro) { if (step % 4 === 0) events.push({ t: at16(s), fn: (d) => sfx.tone({ f: step === 0 ? 1760 : 1320, d: 0.05, type: 'square', g: 0.05, delay: d }) }); continue; }
    if (C.pattern.kick[step] === 'x' || (inDrop && step % 4 === 0)) events.push({ t: at16(s), fn: (d) => sfx.tone({ f: 130, d: 0.2, g: 0.55, slide: -85, delay: d }) });
    if (C.pattern.snare[step] === 'x' || (inBuild && step % 2 === 0 && beat >= 28) || (inBuild && step % 4 === 0)) events.push({ t: at16(s), fn: (d) => { sfx.noise({ d: 0.13, g: 0.22, hp: 1400, delay: d }); sfx.tone({ f: 190, d: 0.08, type: 'triangle', g: 0.1, delay: d }); } });
    if (C.pattern.hat[step] === 'x' || inDrop) events.push({ t: at16(s), fn: (d) => sfx.noise({ d: inDrop && step % 4 === 2 ? 0.09 : 0.03, g: 0.05, hp: 7500, delay: d }) });
    if (step % 4 === 0 && !inBuild) { const f = C.pattern.bassNotes[bar % 4]; events.push({ t: at16(s), fn: (d) => sfx.tone({ f, d: SPB * 0.9, type: 'sawtooth', g: 0.05, delay: d }) }); }
  }
  events.push({ t: END_AT * SPB, fn: (d) => [220, 277, 330, 440].forEach((f, i) => sfx.tone({ f, d: 1.6, type: 'triangle', g: 0.05, delay: d + i * 0.02 })) });
  events.sort((a, b) => a.t - b.t);

  // 前瞻调度：每帧把未来 120ms 内的事件交给 AudioContext 定时播放
  const LOOKAHEAD = 0.12;
  let cursor = 0, lastT = 0;
  function schedule(t, playing) {
    if (t < lastT - 0.02 || !playing) cursor = events.findIndex((e) => e.t >= t - 0.001);
    if (cursor < 0) cursor = events.length;
    if (playing && sfx.enabled) while (cursor < events.length && events[cursor].t < t + LOOKAHEAD) { const e = events[cursor++]; if (e.t >= t - 0.02) e.fn(Math.max(0, e.t - t)); }
    lastT = t;
  }

  const markers = C.sections.map((s) => ({ t: s.bar * 4 * SPB, label: `${s.name} · BAR ${s.bar + 1}` })).concat([{ t: END_AT * SPB, label: '结尾卡' }]);
  const tl = MK.timeline({ duration: DURATION, render, markers });
  tl.on(schedule);
  MK.expose(tl, { title: '节拍动态字幕', bpm: C.bpm, sound: sfx });
  MK.controls(tl, { sound: sfx, accent: '#ff4d2e' });
  tl.seek(P.t ?? (REDUCE ? 17.5 * SPB : 0));
  if (P.autoplay && !REDUCE) tl.play();
})();
