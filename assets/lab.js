/* Motion Atlas · 节奏实验室：缓动曲线、时长错峰、BPM 吸附与导出 */
(function () {
  'use strict';
  const { ICONS, store, copy, esc } = window.Site;
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PRESETS = {
    snap: [0.2, 0.9, 0.1, 1], glide: [0.25, 0.1, 0.25, 1], emphasized: [0.2, 0, 0, 1],
    exit: [0.4, 0, 1, 1], anticipate: [0.36, 0, 0.66, -0.56], overshoot: [0.34, 1.56, 0.64, 1], linear: [0, 0, 1, 1],
  };
  const DEF = { curve: PRESETS.snap, preset: 'snap', dur: 420, stag: 40, dist: 70, count: 6, bpm: 120, offset: 0, div: 2, events: '0.31, 0.74, 1.62, 2.05, 2.9', tab: 'css' };
  const S = Object.assign({}, DEF, store.get('ma-lab', {}));
  const save = () => store.set('ma-lab', S);
  const r2 = (n) => Math.round(n * 100) / 100;

  // 预设与 kit/motion-kit.js 的 MotionKit.ease 命名 Token 保持一致；overshoot 为额外的回弹参考
  // cubic-bezier 求值：按 x 二分求参数 t，再取 y
  function bez([x1, y1, x2, y2]) {
    const f = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (f(x1, x2, t) < x) lo = t; else hi = t; }
      return f(y1, y2, t);
    };
  }
  let ease = bez(S.curve);

  // ---- 曲线编辑器 ----
  const svg = $('#curve');
  const SZ = 300, X = (v) => v * SZ, Y = (v) => SZ - v * SZ;
  $('#cvGrid').setAttribute('d', [1, 2, 3].map((i) => `M${i * 75} 0V300M0 ${i * 75}H300`).join(''));
  $('#presets').innerHTML = Object.keys(PRESETS).map((k) => `<button type="button" data-p="${k}">${k}</button>`).join('');
  function drawCurve() {
    const [x1, y1, x2, y2] = S.curve;
    $('#cvPath').setAttribute('d', `M0 300C${X(x1)} ${Y(y1)} ${X(x2)} ${Y(y2)} 300 0`);
    $('#h1').setAttribute('x1', 0); $('#h1').setAttribute('y1', 300); $('#h1').setAttribute('x2', X(x1)); $('#h1').setAttribute('y2', Y(y1));
    $('#h2').setAttribute('x1', 300); $('#h2').setAttribute('y1', 0); $('#h2').setAttribute('x2', X(x2)); $('#h2').setAttribute('y2', Y(y2));
    $('#p1').setAttribute('cx', X(x1)); $('#p1').setAttribute('cy', Y(y1));
    $('#p2').setAttribute('cx', X(x2)); $('#p2').setAttribute('cy', Y(y2));
    ['x1', 'y1', 'x2', 'y2'].forEach((k, i) => { if (document.activeElement !== $('#' + k)) $('#' + k).value = S.curve[i]; });
    document.querySelectorAll('#presets button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.p === S.preset)));
  }
  function setCurve(c, preset = '') {
    S.curve = [Math.min(1, Math.max(0, c[0])), Math.min(2, Math.max(-1, c[1])), Math.min(1, Math.max(0, c[2])), Math.min(2, Math.max(-1, c[3]))].map(r2);
    S.preset = preset; ease = bez(S.curve); drawCurve(); if (drag === null) fitView(); exportOut(); save(); restart();
  }
  // 视窗随控制点越界（回弹/回拉）自动扩展，拖动中不变以免抖动
  function fitView() {
    const lo = Math.min(0, S.curve[1], S.curve[3]), hi = Math.max(1, S.curve[1], S.curve[3]);
    svg.setAttribute('viewBox', `-20 ${Y(hi) - 24} 340 ${(hi - lo) * SZ + 48}`);
  }
  $('#presets').addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) setCurve(PRESETS[b.dataset.p], b.dataset.p); });
  ['x1', 'y1', 'x2', 'y2'].forEach((k, i) => $('#' + k).addEventListener('change', (e) => { const c = S.curve.slice(); c[i] = +e.target.value || 0; setCurve(c); }));
  let drag = null;
  function toVal(e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x / SZ, (SZ - q.y) / SZ]; }
  [['#p1', 0], ['#p2', 2]].forEach(([sel, o]) => {
    const el = $(sel);
    el.addEventListener('pointerdown', (e) => { drag = o; el.setPointerCapture(e.pointerId); });
    el.addEventListener('keydown', (e) => {
      const d = e.shiftKey ? 0.1 : 0.01, c = S.curve.slice();
      if (e.key === 'ArrowLeft') c[o] -= d; else if (e.key === 'ArrowRight') c[o] += d;
      else if (e.key === 'ArrowUp') c[o + 1] += d; else if (e.key === 'ArrowDown') c[o + 1] -= d; else return;
      e.preventDefault(); setCurve(c);
    });
  });
  svg.addEventListener('pointermove', (e) => { if (drag === null) return; const [x, y] = toVal(e), c = S.curve.slice(); c[drag] = x; c[drag + 1] = y; setCurve(c); });
  svg.addEventListener('pointerup', () => { drag = null; fitView(); });

  // ---- 时长与错峰预览 ----
  const sliders = { dur: (v) => `${v}ms`, stag: (v) => `${v}ms`, dist: (v) => `${v}%`, count: (v) => `${v}`, bpm: (v) => `${v}`, offset: (v) => `${v}ms` };
  Object.entries(sliders).forEach(([k, fmt]) => {
    const el = $('#' + k); el.value = S[k]; $('#' + k + 'V').textContent = fmt(S[k]);
    el.addEventListener('input', () => { S[k] = +el.value; $('#' + k + 'V').textContent = fmt(S[k]); save(); exportOut(); if (k === 'bpm' || k === 'offset') drawBeats(); else { build(); restart(); } });
  });
  function build() {
    const n = S.count, h = 230;
    $('#preview').innerHTML = Array.from({ length: n }, (_, i) => { const y = ((i + 0.5) / n) * h; return `<span class="lane" style="top:${y}px"></span><i style="top:${y - 7}px"></i>`; }).join('');
  }
  const total = () => S.dur + S.stag * (S.count - 1);
  let start = performance.now();
  const restart = () => { start = performance.now(); };
  function frame(now) {
    const t = now - start, T = total(), w = $('#preview').clientWidth - 28 - 34;
    if ($('#loop').checked && t > T + 600) restart();
    document.querySelectorAll('#preview i').forEach((el, i) => {
      const p = reduce ? 1 : Math.min(1, Math.max(0, (t - i * S.stag) / S.dur));
      el.style.transform = `translateX(${ease(p) * w * (S.dist / 100)}px)`;
    });
    const p = Math.min(1, Math.max(0, t / S.dur));
    $('#cvDot').setAttribute('cx', X(p)); $('#cvDot').setAttribute('cy', Y(ease(p)));
    $('#total').textContent = `总时长 ${T}ms`;
    requestAnimationFrame(frame);
  }
  $('#replay').innerHTML = `${ICONS.replay}重播`;
  $('#replay').addEventListener('click', restart);

  // ---- BPM 拍点与吸附 ----
  $('#events').value = S.events;
  const evs = () => S.events.split(/[\s,，]+/).map(Number).filter((v) => Number.isFinite(v) && v >= 0);
  const spb = () => 60 / S.bpm;
  const quant = (t) => { const g = spb() / S.div, o = S.offset / 1000; return o + Math.round((t - o) / g) * g; };
  function drawBeats() {
    const list = evs(), span = Math.max(4 * spb(), ...list.map((v) => v + spb() / 2)), pct = (t) => `${(t / span) * 100}%`, o = S.offset / 1000;
    let html = '';
    for (let b = 0; o + b * spb() <= span; b++) html += `<span class="tick${b % 4 === 0 ? ' bar' : ''}" style="left:${pct(o + b * spb())}"></span>`;
    html += list.map((t) => `<span class="ev" style="left:${pct(t)}"></span><span class="q" style="left:${pct(quant(t))}"></span>`).join('') + '<span class="head" id="bhead"></span>';
    $('#beatbar').innerHTML = html; $('#beatbar').dataset.span = span;
    $('#qtable').innerHTML = '<tr><th>事件</th><th>原时刻</th><th>吸附后</th><th>偏差</th></tr>' + list.map((t, i) => {
      const q = quant(t), d = Math.round((q - t) * 1000);
      return `<tr><td>#${i + 1}</td><td>${t.toFixed(3)}s</td><td>${q.toFixed(3)}s</td><td>${d > 0 ? '+' : ''}${d}ms</td></tr>`;
    }).join('');
    $('#beatInfo').textContent = `1 拍 = ${Math.round(spb() * 1000)}ms · 1 小节 = ${(spb() * 4).toFixed(2)}s`;
    document.querySelectorAll('#div button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.d === S.div)));
  }
  $('#events').addEventListener('input', () => { S.events = $('#events').value; save(); drawBeats(); exportOut(); });
  $('#div').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) { S.div = +b.dataset.d; save(); drawBeats(); exportOut(); } });

  // 节拍器：WebAudio 提前 120ms 排程，默认不发声
  let ac = null, metroOn = false, nextBeat = 0, beatN = 0, mStart = 0;
  function metroBtn() { $('#metro').innerHTML = `${metroOn ? ICONS.pause : ICONS.play}${metroOn ? '停止节拍器' : '播放节拍器'}`; $('#metro').setAttribute('aria-pressed', String(metroOn)); }
  $('#metro').addEventListener('click', () => {
    metroOn = !metroOn;
    if (metroOn) { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); mStart = nextBeat = ac.currentTime + 0.05; beatN = 0; }
    metroBtn();
  });
  function tick() {
    if (metroOn && ac) {
      while (nextBeat < ac.currentTime + 0.12) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = beatN % 4 === 0 ? 1320 : 880;
        g.gain.setValueAtTime(0.0001, nextBeat); g.gain.exponentialRampToValueAtTime(0.18, nextBeat + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, nextBeat + 0.06);
        o.connect(g).connect(ac.destination); o.start(nextBeat); o.stop(nextBeat + 0.07);
        nextBeat += spb(); beatN++;
      }
      const span = +$('#beatbar').dataset.span || 2, h = $('#bhead');
      if (h) h.style.left = `${(((ac.currentTime - mStart) % span) / span) * 100}%`;
    }
    setTimeout(tick, 25);
  }

  // ---- 导出 ----
  function exportOut() {
    const c = S.curve.join(', '), list = evs();
    const out = {
      css: `:root {\n  --ease-main: cubic-bezier(${c});\n  --dur-main: ${S.dur}ms;\n  --stagger: ${S.stag}ms;\n  --beat: ${Math.round(spb() * 1000)}ms; /* ${S.bpm} BPM */\n}\n.item {\n  transition: transform var(--dur-main) var(--ease-main);\n  transition-delay: calc(var(--i) * var(--stagger));\n}`,
      js: `// MotionKit（kit/motion-kit.js）\nconst ease = MotionKit.bezier(${c});\nconst DUR = ${S.dur / 1000}, STAGGER = ${S.stag / 1000};\nconst beat = MotionKit.beats(${S.bpm}, ${S.offset / 1000});\n// 第 i 个元素在时刻 t 的进度\nconst progress = (t, i) => ease(MotionKit.clamp((t - i * STAGGER) / DUR, 0, 1));\n// 事件吸附到${['', '拍', '半拍', '', '十六分'][S.div]}\nconst EVENTS = [${list.map((t) => quant(t).toFixed(3)).join(', ')}];`,
      prompt: `动效节奏约束：主缓动 cubic-bezier(${c})（${S.preset || '自定义'}），单个元素时长 ${S.dur}ms，元素间错峰 ${S.stag}ms，${S.count} 个元素总时长 ${total()}ms。音乐/剪辑节拍 ${S.bpm} BPM（1 拍 ${Math.round(spb() * 1000)}ms，首拍偏移 ${S.offset}ms），关键事件吸附到${['', '整拍', '半拍', '', '十六分音符'][S.div]}：${list.map((t) => quant(t).toFixed(2) + 's').join('、')}。重音落在小节第一拍；减少动态时取消位移、只保留透明度变化。`,
    };
    $('#exOut').textContent = out[S.tab];
    document.querySelectorAll('#exTabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.k === S.tab)));
  }
  $('#exTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { S.tab = b.dataset.k; save(); exportOut(); } });
  $('#copyEx').innerHTML = `${ICONS.copy}复制`;
  $('#copyEx').addEventListener('click', () => copy($('#exOut').textContent));

  drawCurve(); fitView(); build(); drawBeats(); exportOut(); metroBtn();
  requestAnimationFrame(frame); tick();
  void esc;
})();
