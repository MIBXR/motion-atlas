/* Motion Atlas · 节奏实验室
 * 01 节拍器：音乐时钟（拍为单位）+ 前瞻调度，用 MotionKit.audio 的音色按绝对时刻排程；改速度 / 拍号 / 细分 / 摇摆从“此刻”起生效，相位连续。
 * 02 吸附：循环时间线（网格、偏移、摇摆、量化强度）、A/B 播放、打拍录入、小球演示。
 * 03 曲线 × 时长 × 拍子：曲线编辑器与错峰预览，可跟随节拍并带提示音。
 * 04 导出：CSS / MotionKit / Prompt 与离线渲染 WAV。实时与离线用同一个乐谱生成函数 gen()。
 */
(function () {
  'use strict';
  const { ICONS, store, copy, toast } = window.Site;
  const MK = window.MotionKit, audio = MK.audio;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = mq.matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mod = (a, n) => ((a % n) + n) % n;
  const r2 = (n) => Math.round(n * 100) / 100;
  const r3 = (n) => Math.round(n * 1000) / 1000;
  const ms = (s) => Math.round(s * 1000);
  const signed = (v, unit = 'ms') => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v) + unit;
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) || 1; };

  const IC = {
    play: ICONS.play.replace('class="icon"', 'class="icon i-play"'),
    stop: '<svg class="icon i-stop" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/></svg>',
    minus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    sndOn: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    sndOff: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tap: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.4" fill="currentColor"/><circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".55"/></svg>',
    rec: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>',
    wave: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h1.5M7 8.5v7M10.5 5v14M14 9v6M17.5 6.5v11M21 12h-.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };

  /* ---------- 常量：拍号、细分、音色组、事件音色、示例 ---------- */
  // BPM 指拍号分母那个音符：x/4 按四分音符，x/8 按八分音符计拍；groups 决定次强拍（每组第一拍）
  const METERS = {
    '2/4': { n: 2, unit: 4, groups: [2], hint: '2/4：强—弱，进行曲式的两拍。' },
    '3/4': { n: 3, unit: 4, groups: [3], hint: '3/4：强—弱—弱，圆舞曲式的三拍。' },
    '4/4': { n: 4, unit: 4, groups: [2, 2], hint: '4/4：强—弱—次强—弱，流行音乐与剪辑最常用。' },
    '5/4': { n: 5, unit: 4, groups: [3, 2], hint: '5/4：按 3+2 分组，第 4 拍是次强拍。' },
    '6/8': { n: 6, unit: 8, groups: [3, 3], hint: '6/8：按八分音符计拍（BPM 指八分音符），3+3 分组，听起来是两个大拍、各分三份。' },
    '7/8': { n: 7, unit: 8, groups: [2, 2, 3], hint: '7/8：按八分音符计拍，2+2+3 分组，最后一组长一拍，有“踉跄”感。' },
  };
  const accOf = (m) => { const s = new Set(); let a = 0; for (const g of m.groups) { if (a) s.add(a); a += g; } return s; };
  const DIVS = [1, 2, 3, 4];
  const divName = (d) => ({ 1: '拍', 2: '半拍', 3: '三连音', 4: METERS[S.meter].unit === 8 ? '¼ 拍' : '十六分' })[d];
  // 节拍器音色组：四个层级（小节重拍 / 次强拍 / 拍 / 细分）各用一到两层音色。g 是层的增益修正（不传给音色），
  // 校准目标（默认三级音量 100 / 75 / 45 时，dev/shots/T3/levels.txt 实测）：重拍峰值约 -9～-11 dBFS，拍比重拍低 4–6 dB 且音高更低，细分再低 6–9 dB；
  // 重拍一定带中高频层（笔记本扬声器放不出底鼓）。
  const KITS = {
    drum: { name: '鼓组', bar: [['kick', { vel: 1 }], ['rim', { tone: 1.2, vel: 1 }]], acc: [['kick', { vel: 0.45 }], ['rim', { tone: 1.1, vel: 0.95 }]], beat: [['rim', { vel: 0.85 }]], sub: [['hat', { vel: 0.8 }]] },
    wood: { name: '木块', bar: [['tom', { f: 1046, decay: 0.09, vel: 1 }]], acc: [['tom', { f: 932, decay: 0.08, vel: 0.95 }]], beat: [['tom', { f: 784, decay: 0.07, vel: 0.85 }]], sub: [['tick', { f: 2600, vel: 1, g: 2.4 }]] },
    blip: { name: '电子', bar: [['blip', { note: 'A6', vel: 1, g: 2.2 }]], acc: [['blip', { note: 'F#6', vel: 0.95, g: 2.2 }]], beat: [['blip', { note: 'E6', vel: 0.85, g: 2.2 }]], sub: [['tick', { f: 4200, vel: 1, g: 2.6 }]] },
    key: { name: '机械', bar: [['key', { heavy: 1, vel: 1, g: 2.1 }], ['click', { f: 3200, vel: 0.7, g: 2.1 }]], acc: [['key', { heavy: 0.8, vel: 0.95, g: 2.1 }]], beat: [['key', { heavy: 0.6, vel: 0.9, g: 2.2 }]], sub: [['click', { f: 1800, vel: 0.6, g: 1.6 }]] },
  };
  // 层参数拆成音色参数与增益修正
  const layer = (p) => { const q = Object.assign({}, p), g = q.g ?? 1; delete q.g; return [q, g]; };
  const EVOICES = {
    clap: { name: '拍手', v: 'clap', p: { vel: 0.95 } },
    snare: { name: '军鼓', v: 'snare', p: { vel: 0.9 } },
    tom: { name: '通鼓', v: 'tom', p: { f: 165, vel: 0.95 } },
    pluck: { name: '拨弦', v: 'pluck', p: { note: 'E5', vel: 0.9 } },
  };
  const MODES = [['off', '只听节拍器'], ['a', 'A 原始'], ['b', 'B 吸附'], ['ab', 'A/B 交替'], ['both', 'A+B 叠放']];
  const KIND = { down: '小节重拍', acc: '次强拍', on: '正拍', off: '反拍 · 切分', trip: '三连音', weak: '十六分弱位' };
  const DRAG = [28, 46, 38, 62, 44, 70, 52, 80];
  const HUM = [12, -18, 9, 15, -14, 20, -10, 6, -16, 11];
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  // 示例：x 为相对第一个重拍的拍数，dev 为人为偏差（毫秒）；t 为直接给定的秒数
  const EXAMPLES = {
    drag: {
      name: '拖拍', desc: '每拍都有，但一拍比一拍晚（+28～+80ms），像没踩准的剪辑。',
      tip: '把量化强度从 0% 拉到 100%，听拖沓感被一点点拉回拍上。', tries: [['强度 0%', { strength: 0 }], ['强度 50%', { strength: 50 }], ['强度 100%', { strength: 100 }], ['A/B 交替', { mode: 'ab' }]],
      make: (c) => range(c.loopBeats).map((i) => ({ x: i, dev: DRAG[i % DRAG.length] })),
    },
    sync: {
      name: '切分', desc: '3+3+2 的切分节奏：第 2 下落在第 2 拍的后半拍（反拍）上。',
      tip: '切到「拍」网格，反拍上的那一下会被拉到第 3 拍——切分被抹平；切回「半拍」才保留下来。', tries: [['拍网格', { div: 1 }], ['半拍网格', { div: 2 }], ['A/B 交替', { mode: 'ab' }]],
      make: (c) => { const out = []; for (let b = 0; b < c.bars; b++) for (let x = 0; x < c.bpb - 1e-9; x += 1.5) out.push({ x: b * c.bpb + x, dev: HUM[out.length % HUM.length] }); return out; },
    },
    trip: {
      name: '三连音', desc: '一拍里均分三下（每隔一拍一组）。',
      tip: '「十六分」会把三下吸成不均匀的 1/4、3/4；「半拍」会把两下挤到同一点；只有「三连音」网格吸附正确。', tries: [['半拍网格', { div: 2 }], ['十六分网格', { div: 4 }], ['三连音网格', { div: 3 }]],
      make: (c) => { const out = []; for (let i = 0; i < c.loopBeats; i++) (i % 2 ? [0] : [0, 1 / 3, 2 / 3]).forEach((f) => out.push({ x: i + f, dev: Math.round(HUM[out.length % HUM.length] * 0.6) })); return out; },
    },
    swing: {
      name: '摇摆', desc: '八分音符成对出现，后一个被推迟到 2/3 处（长短比 2:1）。',
      tip: '直的「半拍」网格会把它拉直、失去摇摆；把摇摆调到 100% 时网格和它吻合，吸附几乎不动。', tries: [['摇摆 0%', { div: 2, swing: 0 }], ['摇摆 60%', { div: 2, swing: 60 }], ['摇摆 100%', { div: 2, swing: 100 }]],
      make: (c) => { const out = []; for (let i = 0; i < c.loopBeats; i++) [0, 2 / 3].forEach((f) => out.push({ x: i + f, dev: Math.round(HUM[out.length % HUM.length] * 0.5) })); return out; },
    },
    cuts: {
      name: '剪辑点', desc: '一组按秒记录的真实剪辑点（0.31、0.74、1.62、2.05、2.9 秒），不属于任何网格。',
      tip: '剪辑点按秒固定：改 BPM、首拍偏移或细分，看它们分别被吸到哪里。', tries: [['BPM 100', { bpm: 100 }], ['BPM 120', { bpm: 120 }], ['偏移 150ms', { offset: 150 }], ['偏移 0', { offset: 0 }]],
      make: () => [0.31, 0.74, 1.62, 2.05, 2.9].map((t) => ({ t })),
    },
  };
  // 缓动预设与 kit/motion-kit.js 的 MotionKit.ease 命名 Token 一致；overshoot 为额外的回弹参考
  const PRESETS = {
    snap: [0.2, 0.9, 0.1, 1], glide: [0.25, 0.1, 0.25, 1], emphasized: [0.2, 0, 0, 1],
    exit: [0.4, 0, 1, 1], anticipate: [0.36, 0, 0.66, -0.56], overshoot: [0.34, 1.56, 0.64, 1], linear: [0, 0, 1, 1],
  };

  /* ---------- 状态（localStorage，旧版字段兼容） ---------- */
  const DEF = {
    v: 2, bpm: 120, meter: '4/4', div: 2, swing: 0, offset: 0, kit: 'drum', vol: 80, lv: { bar: 100, beat: 75, sub: 45 }, sound: true,
    bars: 2, strength: 100, mode: 'off', evVoice: 'clap', startCue: true, ev: null, example: 'sync', lat: 0,
    curve: PRESETS.snap, preset: 'snap', dur: 420, stag: 40, dist: 70, count: 6, sync: true, align: 'land', cue: true, trail: false, ghost: false,
    tab: 'css', wavCycles: 2,
  };
  const parseEv = (s) => String(s || '').split(/[\s,，、;；]+/).map(Number).filter((v) => Number.isFinite(v) && v >= 0).map(r3);
  const saved = store.get('ma-lab', {}) || {};
  const S = Object.assign({}, DEF, saved);
  S.lv = Object.assign({}, DEF.lv, saved.lv || {});
  if (!Array.isArray(S.ev)) S.ev = typeof saved.events === 'string' ? parseEv(saved.events) : null;
  delete S.events;
  if (!METERS[S.meter]) S.meter = '4/4';
  if (!DIVS.includes(S.div)) S.div = 2;
  if (!KITS[S.kit]) S.kit = 'drum';
  if (!EVOICES[S.evVoice]) S.evVoice = 'clap';
  if (!MODES.some(([k]) => k === S.mode)) S.mode = 'off';
  if (![1, 2, 4].includes(S.bars)) S.bars = 2;
  if (![1, 2, 4].includes(S.wavCycles)) S.wavCycles = 2;
  if (!Array.isArray(S.curve) || S.curve.length !== 4 || !S.curve.every(Number.isFinite)) { S.curve = PRESETS.snap; S.preset = 'snap'; }
  S.bpm = clamp(Math.round(+S.bpm || 120), 40, 240);
  S.swing = clamp(+S.swing || 0, 0, 100); S.offset = clamp(+S.offset || 0, 0, 1000); S.strength = clamp(+S.strength ?? 100, 0, 100);
  S.vol = clamp(+S.vol ?? 80, 0, 100); S.lat = clamp(+S.lat || 0, -150, 150);
  let saveT = 0;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => store.set('ma-lab', S), 200); };

  /* ---------- 网格与片段 ---------- */
  // 片段：循环 = bars 个小节，单位秒；首拍偏移 o 之后才是第一个重拍；事件时刻是相对循环起点的秒数
  function clip() {
    const m = METERS[S.meter], bpb = m.n, spb = 60 / S.bpm, loopBeats = bpb * S.bars, L = loopBeats * spb;
    return { m, bpb, spb, loopBeats, L, bars: S.bars, o: mod(S.offset / 1000, L), acc: accOf(m) };
  }
  const swingOn = () => S.div === 2 || S.div === 4;
  // 一拍内各网格点的位置（拍）：摇摆把成对格子的后一个推迟 swing × 步长 / 3（与 MotionKit.audio.pattern 的 swing 相同；100% = 三连音 shuffle）
  function grid() {
    const d = S.div, sw = swingOn() ? S.swing / 100 : 0, g = [];
    for (let k = 0; k < d; k++) g.push(k / d + (k % 2 ? sw / (3 * d) : 0));
    return g;
  }
  /** 最近的网格点：x 为拍数（相对第一个重拍）；min 为下限（吸附后不早于片段第 0 秒） */
  function snapX(x, g = grid(), min = -Infinity) {
    const n0 = Math.floor(x);
    let best = null, bd = Infinity;
    for (let n = n0 - 1; n <= n0 + 2; n++) {
      for (let k = 0; k < g.length; k++) {
        const p = n + g[k];
        if (p < min) continue;
        const d = Math.abs(x - p);
        if (d <= bd + 1e-12) { bd = d; best = { p, n, k }; } // 相等时取后一个（与四舍五入一致）
      }
    }
    return best || { p: x, n: n0, k: 0 };
  }
  function kindOf(n, k, c) {
    if (k === 0) { const b = mod(n, c.bpb); return b === 0 ? 'down' : c.acc.has(b) ? 'acc' : 'on'; }
    if (S.div === 3) return 'trip';
    if (S.div === 2 || k === 2) return 'off';
    return 'weak';
  }
  const posLabel = (q, c) => `${mod(Math.floor(q.n / c.bpb), S.bars) + 1}.${mod(q.n, c.bpb) + 1}${S.div > 1 ? '.' + (q.k + 1) : ''}`;

  let evCache = null;
  const bump = () => { evCache = null; };
  /** 事件明细（按时刻排序，i 为 S.ev 中的下标） */
  function evs() {
    if (evCache) return evCache;
    const c = clip(), g = grid(), s = S.strength / 100, minX = -c.o / c.spb - 1e-9;
    const list = S.ev.map((t, i) => {
      const x = (t - c.o) / c.spb, q = snapX(x, g, minX), full = c.o + q.p * c.spb, snap = t + s * (full - t);
      return { i, t, x, q, full, snap, dev: snap - t, devFull: full - t, kind: kindOf(q.n, q.k, c), label: posLabel(q, c), inLoop: t < c.L - 1e-9 };
    }).sort((a, b) => a.t - b.t || a.i - b.i);
    const cnt = new Map();
    list.forEach((e) => { if (e.inLoop) { const k = e.full.toFixed(4); cnt.set(k, (cnt.get(k) || 0) + 1); } });
    list.forEach((e) => { e.dup = cnt.get(e.full.toFixed(4)) || 1; });
    return (evCache = list);
  }
  function loadExample(id) {
    const ex = EXAMPLES[id];
    if (!ex) return;
    const c = clip();
    S.ev = ex.make(c).map((e) => (e.t != null ? e.t : mod(c.o + e.x * c.spb + e.dev / 1000, c.L))).filter((t) => t < c.L - 1e-6).map(r3).sort((a, b) => a - b);
    S.example = id;
  }
  if (!S.ev) loadExample(EXAMPLES[S.example] ? S.example : 'sync');

  /* ---------- 声音：按绝对时刻触发 kit 音色 ----------
   * audio.play() 只接受相对延迟（内部再读一次 currentTime），这里注册一个包装音色，
   * 把 kit 传入的时刻替换成我们算好的绝对时刻 at：同一套音色、同一条混音链，排程精确到样本。 */
  audio.define('lab:at', (ctx, out, w, p) => {
    const fn = audio.voices[p.v];
    return fn ? fn(ctx, out, Math.max(p.at, ctx.currentTime), p) : w;
  }, { bus: 'sfx', send: 0, level: 1 });

  /* ---------- 走带：音乐时钟（单位：拍） ----------
   * 位置 p = p0 + (t − t0) / 每拍秒数；t 来自 AudioContext（出声时）或 performance.now()（静音时）。
   * 改速度 / 拍号：以“此刻 + 15ms”为锚点重设 (t0, p0)，相位连续；已排程但晚于锚点的声音全部取消，从锚点起按新参数重排。 */
  // PROC：kit 主链路里 DynamicsCompressorNode 的固定预读延迟（浏览器实现为 6ms），声音实际比排程时刻晚这么多；
  // “听到的”时钟与离线 WAV 都按它补偿。
  const LOOK = 0.15, SAFE = 0.015, PROC = 0.006;
  const T = { run: false, src: 'perf', t0: 0, p0: 0, bar: 0, cursor: 0, pend: [], rec: null, abPhase: 0 };
  const LOG = [];
  const spb = () => 60 / S.bpm;
  const live = () => audio.state === 'on' && !!audio.ctx && audio.ctx.state === 'running';
  const clockOf = (src) => (src === 'audio' ? audio.ctx.currentTime : performance.now() / 1000);
  const now = () => clockOf(T.src);
  const beatAt = (t) => T.p0 + (t - T.t0) / spb();
  const timeAt = (p) => T.t0 + (p - T.p0) * spb();
  const clipAbs = (p, c = clip()) => c.o + (p - T.bar) * c.spb;
  /** 此刻“听到的”时钟：用 getOutputTimestamp 补偿输出延迟，画面与耳朵对齐 */
  function heard() {
    if (T.src !== 'audio') return performance.now() / 1000;
    const ctx = audio.ctx, cur = ctx.currentTime;
    if (ctx.getOutputTimestamp) {
      const ts = ctx.getOutputTimestamp();
      if (ts && ts.contextTime > 0 && ts.performanceTime > 0) {
        const h = ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
        if (h <= cur + 0.005 && h > cur - 0.5) return Math.min(h, cur) - PROC;
      }
    }
    return cur - (ctx.outputLatency || ctx.baseLatency || 0) - PROC;
  }
  /** 输入事件（event.timeStamp，performance 时间基）对应的“听到的”时钟 */
  function tapClock(stamp) {
    if (T.src !== 'audio') return stamp / 1000;
    const ctx = audio.ctx, ts = ctx.getOutputTimestamp && ctx.getOutputTimestamp();
    if (ts && ts.contextTime > 0 && ts.performanceTime > 0) return ts.contextTime + (stamp - ts.performanceTime) / 1000 - PROC;
    return heard() - (performance.now() - stamp) / 1000;
  }
  function cancelAfter(ref) {
    T.pend = T.pend.filter((x) => {
      if (x.when > ref) { try { x.h.stop(); } catch (e) { /* 已停止 */ } x.log.x = 1; return false; }
      return true;
    });
  }
  function start(p0 = 0) {
    if (T.run) return;
    T.src = live() ? 'audio' : 'perf';
    T.t0 = now() + 0.08; T.p0 = p0; T.bar = 0; T.abPhase = 0;
    T.cursor = beatAt(now());
    T.run = true;
    bump();
    tick();
    paintPlay();
  }
  function stop() {
    if (!T.run) return;
    cancelAfter(now()); // 只取消还没响的；正在响的自然衰减
    T.run = false;
    if (T.rec) { T.rec = null; recUI(); }
    paintPlay();
    invalidate();
  }
  /** 改时钟参数（速度、拍号、时钟源）：mut(p) 在锚点处修改状态 */
  function rebase(mut) {
    if (!T.run) { if (mut) mut(null); bump(); return; }
    const ref = now() + SAFE, p = beatAt(ref);
    if (mut) mut(p);
    bump();
    T.t0 = ref; T.p0 = p;
    cancelAfter(ref);
    T.cursor = p + 1e-9;
    tick();
  }
  /** 其他参数变化：时钟不变，取消锚点之后的声音并重排 */
  function resched() {
    bump();
    if (!T.run) return;
    const ref = now() + SAFE, p = beatAt(ref);
    cancelAfter(ref);
    T.cursor = p + 1e-9;
    tick();
  }
  function syncSrc() {
    const want = live() ? 'audio' : 'perf';
    if (want === T.src) return;
    if (!T.run) { T.src = want; return; }
    const p = beatAt(now());
    if (T.src === 'audio' && audio.ctx) cancelAfter(audio.ctx.currentTime);
    T.src = want;
    T.t0 = now(); T.p0 = p;
    T.cursor = p + 1e-9;
  }
  function tick() {
    if (!T.run) return;
    syncSrc();
    const t = now();
    if (T.src !== 'audio') { T.cursor = Math.max(T.cursor, beatAt(t)); return; }
    const a = Math.max(T.cursor, beatAt(t - 0.002)), b = beatAt(t + LOOK);
    if (b > a) {
      for (const ev of gen(a, b)) emit(ev, t);
      T.cursor = b;
    }
    if (T.pend.length > 24) T.pend = T.pend.filter((x) => x.when > t - 0.05);
  }
  function emit(ev, t) {
    const when = timeAt(ev.pos);
    if (when < t - 0.001) return; // 绝不排到过去（卡顿后不会补发一串）
    const meta = audio.meta[ev.v] || {};
    const h = audio.play('lab:at', Object.assign({}, ev.p, {
      v: ev.v, at: when, delay: when - audio.ctx.currentTime - 0.005, gain: ev.gain * (meta.level ?? 1),
      bus: meta.bus || 'sfx', send: meta.send ?? 0, duck: 0, pan: ev.pan || 0, seed: ev.seed,
    }));
    const log = { k: ev.kind, lv: ev.lv, v: ev.v, pos: ev.pos, when, at: t, cyc: ev.cyc };
    LOG.push(log);
    if (LOG.length > 8000) LOG.splice(0, 2000);
    if (h) T.pend.push({ when, h, log });
  }

  /* ---------- 乐谱生成：返回位置 p ∈ [a, b) 的全部声音事件（实时与离线共用） ---------- */
  const levelVol = (lv) => (lv === 'sub' ? S.lv.sub : lv === 'beat' ? S.lv.beat : lv === 'acc' ? (S.lv.bar + S.lv.beat) / 2 : S.lv.bar);
  const totalMs = () => S.dur + S.stag * (S.count - 1);
  function gen(a, b, opt = {}) {
    const c = opt.c || clip(), bar = opt.bar ?? T.bar, abPhase = opt.abPhase ?? T.abPhase, out = [], g = grid(), vol = S.vol / 100, kit = KITS[S.kit];
    // 1. 节拍器：每个网格点按层级取音色
    for (let n = Math.floor(a) - 1; n <= Math.ceil(b); n++) {
      const bib = mod(n - bar, c.bpb);
      for (let k = 0; k < g.length; k++) {
        const pos = n + g[k];
        if (pos < a || pos >= b) continue;
        const lv = k ? 'sub' : bib === 0 ? 'bar' : c.acc.has(bib) ? 'acc' : 'beat', lvl = levelVol(lv) / 100;
        if (lvl <= 0) continue;
        for (const [v, lp] of kit[lv]) { const [p, lg] = layer(lp); out.push({ kind: 'metro', lv, pos, v, p, gain: vol * lvl * lg, seed: hash(v + Math.round(pos * 1000)) }); }
      }
    }
    // 2. 事件（A 原始 / B 吸附）与 3. 循环起点提示：按片段时间 C = o + (p − bar) × 每拍秒数，循环长度 L
    const ca = c.o + (a - bar) * c.spb, cb = c.o + (b - bar) * c.spb;
    const m0 = Math.floor(ca / c.L) - 1, m1 = Math.floor(cb / c.L) + 1;
    if (S.mode !== 'off' && !(T.rec && !opt.offline)) {
      const list = evs().filter((e) => e.inLoop), ev = EVOICES[S.evVoice];
      for (let m = m0; m <= m1; m++) {
        const ab = S.mode === 'ab' ? (mod(m - abPhase, 2) ? 'b' : 'a') : S.mode;
        const layers = ab === 'both' ? [['a', -0.55], ['b', 0.55]] : [[ab, 0]];
        for (const [which, pan] of layers) {
          for (const e of list) {
            const pos = bar + (m * c.L + (which === 'a' ? e.t : e.snap) - c.o) / c.spb;
            if (pos >= a && pos < b) out.push({ kind: which === 'a' ? 'evA' : 'evB', lv: e.i, pos, v: ev.v, p: ev.p, gain: vol * 0.85, pan, seed: hash(which + e.i), cyc: m });
          }
        }
      }
    }
    if (S.startCue) {
      for (let m = m0; m <= m1; m++) {
        const pos = bar + (m * c.L - c.o) / c.spb;
        if (pos >= a && pos < b) out.push({ kind: 'cue0', pos, v: 'blip', p: { note: 'C7', vel: 0.7, decay: 0.07 }, gain: vol * 0.5, seed: 3, cyc: m });
      }
    }
    // 4. 曲线提示音（跟随节拍时）：呼啸 + 每个元素落定一声
    if (S.sync && S.cue) {
      const tot = totalMs() / 1000, tb = tot / c.spb, land = S.align === 'land';
      for (let k = Math.floor((a - bar) / c.bpb) - 1; k <= Math.ceil((b - bar + tb) / c.bpb) + 1; k++) {
        const s0 = bar + k * c.bpb - (land ? tb : 0);
        if (s0 >= a && s0 < b) out.push({ kind: 'cueW', pos: s0, v: 'whoosh', p: land ? { dur: clamp(tot, 0.15, 2), dir: 'up', peak: 0.9, vel: 0.6 } : { dur: clamp(tot, 0.15, 2), dir: 'down', peak: 0.12, vel: 0.55 }, gain: vol * 1.1, seed: 11 });
        for (let i = 0; i < S.count; i++) {
          const pos = s0 + (i * S.stag + S.dur) / 1000 / c.spb;
          if (pos >= a && pos < b) out.push({ kind: 'cueT', lv: i, pos, v: 'tick', p: { f: 2900 + i * 110, vel: 0.85 }, gain: vol * 1.3, pan: S.count > 1 ? -0.5 + i / (S.count - 1) : 0, seed: 20 + i });
        }
      }
    }
    return out;
  }

  /* ---------- 离线渲染（WAV）：从片段第 0 秒开始的整数圈 ---------- */
  function offlineScore(cycles = S.wavCycles) {
    const c = clip(), p0 = -c.o / c.spb, p1 = p0 + cycles * c.loopBeats;
    const list = gen(p0, p1, { c, bar: 0, abPhase: 0, offline: true });
    return {
      dur: cycles * c.L,
      score: list.map((ev) => Object.assign({}, ev.p, { t: Math.max(0, (ev.pos - p0) * c.spb), voice: ev.v, gain: ev.gain, pan: ev.pan || 0, seed: ev.seed, kind: ev.kind })),
    };
  }
  async function renderWav(cycles = S.wavCycles) {
    const { score, dur } = offlineScore(cycles);
    // 从 PROC 秒处开始截取：抵消压缩器预读延迟，WAV 第 0 个样本 = 片段第 0 秒
    return audio.renderOffline(score, dur, { sampleRate: 48000, from: PROC, preroll: PROC });
  }

  /* ---------- 统一修改入口：所有控件都走这里 ---------- */
  function applyMeter(id, p) {
    const ob = METERS[S.meter].n, nb = METERS[id].n;
    S.meter = id;
    if (p == null) return;
    // 当前小节里已经走过的拍数小于新拍号的拍数：继续数下去；否则下一拍当作新小节的重拍
    const s0 = T.bar + Math.floor((p - T.bar) / ob) * ob;
    T.bar = p - s0 < nb - 1e-9 ? s0 : Math.ceil(p - 1e-9);
  }
  function update(patch) {
    const tempo = patch.bpm != null && clamp(Math.round(patch.bpm), 40, 240) !== S.bpm;
    const meter = patch.meter && patch.meter !== S.meter && METERS[patch.meter] ? patch.meter : null;
    const next = Object.assign({}, patch);
    delete next.bpm; delete next.meter;
    if (next.lv) { S.lv = Object.assign({}, S.lv, next.lv); delete next.lv; }
    // 切到 A/B 交替（或载入示例）时，让“这一圈”放 A、下一圈放 B
    const curCycle = () => Math.floor(clipAbs(beatAt(heard())) / clip().L);
    if (next.mode === 'ab' && S.mode !== 'ab' && T.run) T.abPhase = curCycle();
    const exId = next.example; delete next.example;
    Object.assign(S, next);
    if (exId) { loadExample(exId); if (S.mode === 'off') { S.mode = 'ab'; if (T.run) T.abPhase = curCycle(); } }
    if (tempo || meter) rebase((p) => { if (tempo) S.bpm = clamp(Math.round(patch.bpm), 40, 240); if (meter) applyMeter(meter, p); });
    else resched();
    save();
    invalidate(patch.curve ? 'curve' : 'all');
  }

  /* =====================================================================
   * 界面
   * ===================================================================== */
  const segBuild = (el, items) => { el.innerHTML = items.map(([v, l, t]) => `<button type="button" data-v="${v}"${t ? ` title="${t}"` : ''}>${l}</button>`).join(''); };
  const segSet = (el, cur) => $$('button[data-v]', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === String(cur))));
  const segOn = (el, fn) => el.addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (b && !b.disabled) fn(b.dataset.v); });

  // ---- 走带 ----
  const playBtn = $('#play');
  playBtn.innerHTML = `${IC.play}${IC.stop}<span class="tp-play-label">播放</span>`;
  $('#bpmDown').innerHTML = IC.minus;
  $('#bpmUp').innerHTML = IC.plus;
  $('#tap').innerHTML = `${IC.tap}<span><span class="tp-long">打拍</span>测速</span> <kbd class="kbd">T</kbd>`;
  function paintPlay() {
    playBtn.dataset.playing = String(T.run);
    playBtn.setAttribute('aria-pressed', String(T.run));
    playBtn.setAttribute('aria-label', T.run ? '停止（空格）' : '播放（空格）');
    $('.tp-play-label', playBtn).textContent = T.run ? '停止' : '播放';
  }
  function startUser(p0) {
    if (S.sound) audio.enable(); // 在点击手势里开启声音（浏览器自动播放策略）
    start(p0);
  }
  const togglePlay = () => (T.run ? stop() : startUser());
  playBtn.addEventListener('click', togglePlay);
  const bpmNum = $('#bpmNum');
  bpmNum.addEventListener('change', () => update({ bpm: +bpmNum.value || S.bpm }));
  bpmNum.addEventListener('keydown', (e) => { if (e.key === 'Enter') bpmNum.blur(); });
  $('#bpmDown').addEventListener('click', () => update({ bpm: S.bpm - 1 }));
  $('#bpmUp').addEventListener('click', () => update({ bpm: S.bpm + 1 }));
  $('#bpm').addEventListener('input', (e) => update({ bpm: +e.target.value }));

  function paintSound() {
    const st = audio.state, b = $('#snd');
    const on = st === 'on', blocked = st === 'blocked';
    b.innerHTML = `${on || blocked ? IC.sndOn : IC.sndOff}<span class="tp-snd-label">${on ? '声音 开' : blocked ? '声音 待启用' : '声音 关'}</span>`;
    b.setAttribute('aria-pressed', String(audio.enabled));
    b.dataset.state = st;
    b.title = blocked ? '浏览器暂时挡住了声音：在页面上点一下即可' : on ? '关闭声音' : '开启声音';
  }
  $('#snd').addEventListener('click', () => {
    if (audio.enabled) { audio.disable(); S.sound = false; } else { audio.enable(); S.sound = true; }
    save(); paintSound();
  });
  audio.on('change', () => { paintSound(); syncSrc(); });
  $('#vol').addEventListener('input', (e) => update({ vol: +e.target.value }));

  // 打拍测速：最近 8 下的间隔，去掉偏离中位数 25% 以上的，停顿 2 秒重新开始
  const tapT = [];
  function tapTempo(stamp) {
    if (S.sound && !audio.enabled) audio.enable();
    if (tapT.length && stamp - tapT[tapT.length - 1] > 2000) tapT.length = 0;
    tapT.push(stamp);
    if (tapT.length > 8) tapT.shift();
    if (live()) audio.play('click', { f: 2600, vel: 0.8, gain: S.vol / 100 });
    flashHit($('#tap'));
    if (tapT.length < 2) { $('#tapInfo').textContent = '继续敲…'; return; }
    const iv = tapT.slice(1).map((t, i) => t - tapT[i]), sorted = iv.slice().sort((x, y) => x - y), med = sorted[sorted.length >> 1];
    const good = iv.filter((x) => Math.abs(x - med) <= med * 0.25), avg = good.reduce((s, x) => s + x, 0) / good.length;
    update({ bpm: 60000 / avg });
    $('#tapInfo').textContent = `${tapT.length} 下 · ${S.bpm} BPM`;
  }
  // 按下反馈：短暂加 .hit（减少动态时没有动画，也要按时移除）
  const flashHit = (el) => { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); clearTimeout(el._hit); el._hit = setTimeout(() => el.classList.remove('hit'), 220); };
  // 指针按下即计时（比 click 少一个抬起的延迟）；键盘激活按钮时 click.detail 为 0
  function pressable(el, fn) {
    el.addEventListener('pointerdown', (e) => { if (e.button === 0) { e.preventDefault(); fn(e.timeStamp); } });
    el.addEventListener('click', (e) => { if (e.detail === 0) fn(e.timeStamp); });
  }
  // 鼠标点按钮不抢焦点：点完“半拍”之类的按钮后，空格仍是播放 / 停止；键盘 Tab 聚焦的按钮照常响应空格
  $('.lab').addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.target.closest('button')) e.preventDefault(); });
  pressable($('#tap'), tapTempo);

  // ---- 01 节拍器 ----
  segBuild($('#meter'), Object.keys(METERS).map((k) => [k, k]));
  segOn($('#meter'), (v) => update({ meter: v }));
  $$('[data-bind="div"]').forEach((el) => segOn(el, (v) => update({ div: +v })));
  $$('input[data-bind="swing"]').forEach((el) => el.addEventListener('input', () => update({ swing: +el.value })));
  segBuild($('#kit'), Object.entries(KITS).map(([k, v]) => [k, v.name]));
  segOn($('#kit'), (v) => { update({ kit: v }); preview(v); });
  [['vBar', 'bar'], ['vBeat', 'beat'], ['vSub', 'sub']].forEach(([id, k]) => $('#' + id).addEventListener('input', (e) => update({ lv: { [k]: +e.target.value } })));
  // 停止状态下点音色：试听一小节的三个层级
  function preview(kitId) {
    if (T.run || !live()) return;
    const kit = KITS[kitId], t0 = audio.ctx.currentTime + 0.03, step = 0.16;
    [['bar', 0], ['sub', 1], ['beat', 2], ['sub', 3]].forEach(([lv, i]) => {
      for (const [v, lp] of kit[lv]) {
        const meta = audio.meta[v] || {}, [p, lg] = layer(lp);
        audio.play('lab:at', Object.assign({}, p, { v, at: t0 + i * step, delay: i * step + 0.025, gain: (S.vol / 100) * (levelVol(lv) / 100) * lg * (meta.level ?? 1), bus: meta.bus, send: meta.send ?? 0, duck: 0, seed: hash(v + i) }));
      }
    });
  }

  let cellGeo = [], lightEls = [], metroSig = '';
  function buildMetro() {
    const c = clip(), g = grid(), sig = `${S.meter}|${S.div}|${S.swing}`;
    if (sig === metroSig) return;
    metroSig = sig;
    $('#mCells').innerHTML = range(c.bpb).map((b) => {
      const lv = b === 0 ? 'bar' : c.acc.has(b) ? 'acc' : 'beat';
      return `<div class="cell${c.acc.has(b) ? ' gs' : ''}" data-lv="${lv}"><b>${b + 1}</b>${g.slice(1).map((o) => `<i style="left:${(o * 100).toFixed(2)}%"></i>`).join('')}</div>`;
    }).join('');
    $('#lights').innerHTML = range(c.bpb).map((b) => `<i data-lv="${b === 0 ? 'bar' : c.acc.has(b) ? 'acc' : 'beat'}"${c.acc.has(b) ? ' class="gs"' : ''}></i>`).join('');
    lightEls = $$('#lights i');
    measureMetro();
    $('#meterHint').textContent = `${METERS[S.meter].hint} 细分：${divName(S.div)}${S.div > 1 ? `（每拍 ${S.div} 格）` : ''}。`;
  }
  function measureMetro() {
    const bar = $('#mBar').getBoundingClientRect();
    cellGeo = $$('#mCells .cell').map((el) => { const r = el.getBoundingClientRect(); return { x: r.left - bar.left, w: r.width, el, subs: $$('i', el) }; });
  }

  // ---- 02 吸附 ----
  segBuild($('#bars'), [[1, '1 小节'], [2, '2 小节'], [4, '4 小节']]);
  segOn($('#bars'), (v) => update({ bars: +v }));
  segBuild($('#mode'), MODES);
  segOn($('#mode'), (v) => update({ mode: v }));
  $('#evVoice').innerHTML = Object.entries(EVOICES).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('');
  $('#evVoice').addEventListener('change', (e) => update({ evVoice: e.target.value }));
  $('#startCue').addEventListener('change', (e) => update({ startCue: e.target.checked }));
  $('#offset').addEventListener('input', (e) => update({ offset: +e.target.value }));
  $('#strength').addEventListener('input', (e) => update({ strength: +e.target.value }));
  $('#examples').innerHTML = Object.entries(EXAMPLES).map(([k, v]) => `<button type="button" class="chip-btn" data-v="${k}">${v.name}</button>`).join('');
  segOn($('#examples'), (v) => update({ example: v }));
  $('#exHint').addEventListener('click', (e) => {
    const b = e.target.closest('[data-try]');
    if (!b) return;
    const ex = EXAMPLES[S.example];
    if (ex) update(ex.tries[+b.dataset.try][1]);
  });
  const evTa = $('#events');
  evTa.addEventListener('input', () => { S.ev = parseEv(evTa.value).sort((a, b) => a - b); S.example = ''; resched(); save(); invalidate(); });
  evTa.addEventListener('blur', () => { evTa.value = S.ev.map((t) => t.toFixed(3)).join(', '); });
  $('#applySnap').addEventListener('click', () => {
    const n = evs().filter((e) => Math.abs(e.dev) > 5e-4).length;
    S.ev = evs().map((e) => r3(e.snap)).sort((a, b) => a - b); S.example = '';
    resched(); save(); invalidate();
    toast(n ? `已把 ${n} 个事件改为吸附后的时刻` : '事件已经都在网格上');
  });
  $('#clearEv').addEventListener('click', () => { S.ev = []; S.example = ''; resched(); save(); invalidate(); });

  // 时间线（SVG，按容器像素宽度绘制，文字不缩放）
  const TL = { W: 0, H: 236, padL: 34, padR: 14, yR: 18, yA: 70, yB: 150, gTop: 26, gBot: 182, aEls: new Map(), bEls: new Map(), drag: null, focus: null };
  const tlSvg = $('#tl');
  const tlX = (t, c) => TL.padL + (t / c.L) * (TL.W - TL.padL - TL.padR);
  const tlT = (x, c) => ((x - TL.padL) / (TL.W - TL.padL - TL.padR)) * c.L;
  function drawTL() {
    const box = $('#tlBox'), W = Math.max(300, Math.round(box.clientWidth));
    TL.W = W;
    const c = clip(), g = grid(), X = (t) => tlX(t, c), list = evs();
    const beatPx = (W - TL.padL - TL.padR) / c.loopBeats;
    let s = `<defs><marker id="ahE" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="ah-e"/></marker><marker id="ahL" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="ah-l"/></marker></defs>`;
    s += `<rect class="tl-lane" x="${TL.padL - 6}" y="${TL.yA - 19}" width="${W - TL.padL - TL.padR + 12}" height="38" rx="9"/><rect class="tl-lane" x="${TL.padL - 6}" y="${TL.yB - 19}" width="${W - TL.padL - TL.padR + 12}" height="38" rx="9"/>`;
    s += `<text class="tl-tag" x="6" y="${TL.yA + 5}">A</text><text class="tl-tag b" x="6" y="${TL.yB + 5}">B</text>`;
    if (c.o > 0.0005) s += `<rect class="tl-off" x="${X(0)}" y="${TL.gTop}" width="${(X(c.o) - X(0)).toFixed(1)}" height="${TL.gBot - TL.gTop}"/>${X(c.o) - X(0) > 58 ? `<text class="tl-offt" x="${X(0) + 5}" y="${TL.gBot - 6}">偏移 ${ms(c.o)}ms</text>` : ''}`;
    const n0 = Math.floor(-c.o / c.spb) - 1, n1 = Math.ceil((c.L - c.o) / c.spb) + 1;
    for (let n = n0; n <= n1; n++) {
      for (let k = 0; k < g.length; k++) {
        const C = c.o + (n + g[k]) * c.spb;
        if (C < -1e-9 || C >= c.L - 1e-9) continue;
        const x = Math.round(X(C)) + 0.5, b = mod(n, c.bpb);
        const cls = k ? 'sub' : b === 0 ? 'bar' : c.acc.has(b) ? 'acc' : 'beat';
        s += `<line class="g-${cls}" x1="${x}" x2="${x}" y1="${cls === 'sub' ? TL.gTop + 6 : TL.gTop}" y2="${TL.gBot}"/>`;
        // 标尺：位置写成“小节.拍”（与吸附明细一致）；太挤时只标小节号
        const barNo = mod(Math.floor(n / c.bpb), S.bars) + 1;
        if (!k && (b === 0 || beatPx >= 26)) s += `<text class="tl-num${b === 0 ? ' bar' : ''}" x="${x + 3}" y="${TL.yR}">${beatPx >= 34 ? `${barNo}.${b + 1}` : b === 0 ? barNo : b + 1}</text>`;
      }
    }
    s += `<line class="tl-end" x1="${Math.round(X(c.L)) + 0.5}" x2="${Math.round(X(c.L)) + 0.5}" y1="${TL.gTop}" y2="${TL.gBot}"/>`;
    // 秒刻度
    const pxs = (W - TL.padL - TL.padR) / c.L, stepS = [0.1, 0.25, 0.5, 1, 2].find((v) => v * pxs >= 56) || 2;
    for (let t = 0; t <= c.L + 1e-9; t += stepS) { const x = Math.round(X(t)) + 0.5; s += `<line class="tl-sec" x1="${x}" x2="${x}" y1="${TL.gBot + 4}" y2="${TL.gBot + 9}"/><text class="tl-sect" x="${x}" y="${TL.gBot + 24}">${r2(t)}s</text>`; }
    s += `<rect class="tl-hitA" x="${TL.padL - 6}" y="${TL.yA - 19}" width="${W - TL.padL - TL.padR + 12}" height="38"/>`;
    // 箭头与吸附目标
    for (const e of list) {
      if (!e.inLoop) continue;
      const xa = X(e.t), xb = X(clamp(e.snap, 0, c.L)), d = ms(e.dev);
      if (S.strength < 100 && Math.abs(e.devFull) > 5e-4) s += `<line class="tl-target" x1="${X(e.full)}" x2="${X(e.full)}" y1="${TL.yB - 15}" y2="${TL.yB + 15}"/>`;
      if (Math.abs(d) >= 2) s += `<path class="tl-arrow ${d > 0 ? 'early' : 'late'}" d="M${xa.toFixed(1)} ${TL.yA + 11}L${xb.toFixed(1)} ${TL.yB - 12}" marker-end="url(#${d > 0 ? 'ahE' : 'ahL'})"/>`;
    }
    for (const e of list) {
      if (!e.inLoop) continue;
      s += `<g class="tl-b${e.dup > 1 ? ' dup' : ''}" data-i="${e.i}" transform="translate(${X(clamp(e.snap, 0, c.L)).toFixed(1)} ${TL.yB})"><circle r="7.5"/>${e.dup > 1 ? `<circle class="dup-ring" r="12"/>` : ''}</g>`;
    }
    // A 点（可拖动、可聚焦）与偏差标签（相邻足够远才显示）
    const inl = list.filter((e) => e.inLoop);
    inl.forEach((e, j) => {
      const xa = X(e.t), d = ms(e.devFull);
      const roomL = j ? xa - X(inl[j - 1].t) : 99, roomR = j < inl.length - 1 ? X(inl[j + 1].t) - xa : 99;
      const lab = Math.min(roomL, roomR) >= 40 ? `<text class="tl-dev ${d > 0 ? 'early' : d < 0 ? 'late' : 'on'}" y="-14">${d ? signed(d, '') : '准'}</text>` : '';
      s += `<g class="tl-a" data-i="${e.i}" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="${r3(c.L)}" aria-valuenow="${e.t}" aria-valuetext="事件 ${j + 1}：${e.t.toFixed(3)} 秒，吸附到 ${e.snap.toFixed(3)} 秒（${signed(ms(e.dev))}，${e.label} ${KIND[e.kind]}）" aria-label="事件 ${j + 1}" transform="translate(${xa.toFixed(1)} ${TL.yA})"><circle class="hit-area" r="14"/><circle class="dot" r="7.5"/>${lab}</g>`;
    });
    s += `<g id="tlRec"></g><g id="tlHead" class="tl-head"><line y1="${TL.gTop - 4}" y2="${TL.gBot}"/><path d="M-6 ${TL.gTop - 10}h12l-6 7z"/></g>`;
    tlSvg.setAttribute('viewBox', `0 0 ${W} ${TL.H}`);
    tlSvg.setAttribute('width', W);
    tlSvg.setAttribute('height', TL.H);
    tlSvg.innerHTML = s;
    TL.aEls = new Map($$('.tl-a', tlSvg).map((el) => [+el.dataset.i, el]));
    TL.bEls = new Map($$('.tl-b', tlSvg).map((el) => [+el.dataset.i, el]));
    TL.hit = new Map();
    if (TL.focus != null && TL.aEls.has(TL.focus)) TL.aEls.get(TL.focus).focus({ preventScroll: true });
    drawRecTaps();
  }
  const svgX = (e) => { const r = tlSvg.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * TL.W; };
  tlSvg.addEventListener('pointerdown', (e) => {
    const c = clip(), a = e.target.closest('.tl-a');
    let i;
    if (a) i = +a.dataset.i;
    else if (e.target.classList.contains('tl-hitA')) { S.ev.push(r3(clamp(tlT(svgX(e), c), 0, c.L - 0.001))); i = S.ev.length - 1; S.example = ''; resched(); save(); }
    else return;
    e.preventDefault();
    TL.drag = { i, id: e.pointerId };
    TL.focus = i;
    tlSvg.setPointerCapture(e.pointerId);
    drawTL();
    invalidate();
  });
  tlSvg.addEventListener('pointermove', (e) => {
    if (!TL.drag || e.pointerId !== TL.drag.id) return;
    const c = clip();
    S.ev[TL.drag.i] = r3(clamp(tlT(svgX(e), c), 0, c.L - 0.001));
    resched(); invalidate();
  });
  const endDrag = () => {
    if (!TL.drag) return;
    const v = S.ev[TL.drag.i];
    TL.drag = null;
    S.ev.sort((a, b) => a - b);
    TL.focus = S.ev.indexOf(v);
    S.example = '';
    resched(); save(); invalidate();
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => tlSvg.addEventListener(t, endDrag));
  tlSvg.addEventListener('focusin', (e) => { const a = e.target.closest('.tl-a'); if (a) TL.focus = +a.dataset.i; });
  tlSvg.addEventListener('focusout', () => { if (!TL.drag) setTimeout(() => { if (!tlSvg.contains(document.activeElement)) TL.focus = null; }, 0); });
  tlSvg.addEventListener('keydown', (e) => {
    const a = e.target.closest('.tl-a');
    if (!a) return;
    const i = +a.dataset.i, c = clip();
    const d = e.shiftKey ? 0.001 : e.altKey ? 0.1 : 0.01;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') S.ev[i] = r3(clamp(S.ev[i] - d, 0, c.L - 0.001));
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') S.ev[i] = r3(clamp(S.ev[i] + d, 0, c.L - 0.001));
    else if (e.key === 'Delete' || e.key === 'Backspace') { S.ev.splice(i, 1); TL.focus = Math.min(i, S.ev.length - 1); if (TL.focus < 0) TL.focus = null; }
    else return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key.startsWith('Arrow')) { const v = S.ev[i]; S.ev.sort((x, y) => x - y); TL.focus = S.ev.indexOf(v); }
    S.example = '';
    resched(); save(); invalidate();
  });

  // 小球演示（A / B 两道）
  const BN = { W: 0, H: 180 };
  function drawBounce() {
    const svg = $('#bnc'), W = Math.max(280, Math.round($('#bounce').clientWidth));
    BN.W = W;
    const half = W / 2, gy = BN.H - 56;
    let s = '';
    ['a', 'b'].forEach((w, j) => {
      const x0 = j * half;
      s += `<g class="bn-lane" id="bn-${w}" transform="translate(${x0} 0)"><rect class="bn-bg" x="${j ? 6 : 0}" y="0" width="${half - 6}" height="${BN.H}" rx="12"/>`;
      s += `<text class="bn-title" x="${(j ? 6 : 0) + 14}" y="22">${w === 'a' ? 'A 原始' : 'B 吸附后'}</text><text class="bn-live" x="${(j ? 6 : 0) + half - 20}" y="22" text-anchor="end">正在播放</text>`;
      s += `<circle class="bn-lamp" cx="${(j ? 6 : 0) + 26}" cy="${gy - 40}" r="9"/><text class="bn-lampt" x="${(j ? 6 : 0) + 26}" y="${gy - 20}" text-anchor="middle">拍</text>`;
      s += `<line class="bn-ground" x1="${(j ? 6 : 0) + 50}" x2="${(j ? 6 : 0) + half - 20}" y1="${gy}" y2="${gy}"/>`;
      const cx = (j ? 6 : 0) + 50 + (half - 70) / 2;
      s += `<circle class="bn-ring" cx="${cx}" cy="${gy}" r="14"/><circle class="bn-ball" cx="${cx}" cy="${gy - 12}" r="12"/><text class="bn-lab" x="${cx}" y="${gy + 34}" text-anchor="middle"></text><text class="bn-pos" x="${cx}" y="${gy + 50}" text-anchor="middle"></text></g>`;
    });
    svg.setAttribute('viewBox', `0 0 ${W} ${BN.H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', BN.H);
    svg.innerHTML = s;
    BN.gy = gy;
    BN.lanes = ['a', 'b'].map((w) => { const g = $('#bn-' + w, svg); return { w, g, ball: $('.bn-ball', g), ring: $('.bn-ring', g), lamp: $('.bn-lamp', g), lab: $('.bn-lab', g), pos: $('.bn-pos', g), last: null }; });
  }

  // 打拍板与录入
  const TAPS = [];
  function judge(d) {
    const a = Math.abs(d);
    return a <= 12 ? ['正中', 'on'] : a <= 35 ? [d < 0 ? '略早' : '略晚', d < 0 ? 'early' : 'late'] : [d < 0 ? '偏早' : '偏晚', d < 0 ? 'early' : 'late'];
  }
  function padTap(stamp) {
    if (S.sound && !audio.enabled) audio.enable();
    const ev = EVOICES[S.evVoice];
    if (live()) audio.play(ev.v, Object.assign({}, ev.p, { gain: (S.vol / 100) * 0.85 }));
    flashHit($('#pad'));
    if (!T.run) { $('#padFb').textContent = '先点“播放”，跟着节拍器敲。'; return; }
    const c = clip(), tc = tapClock(stamp) - S.lat / 1000, p = beatAt(tc), x = p - T.bar, q = snapX(x), dev = Math.round((x - q.p) * c.spb * 1000);
    const C = clipAbs(p, c), [word, cls] = judge(dev);
    TAPS.push({ dev, cls });
    if (TAPS.length > 24) TAPS.shift();
    const r = T.rec;
    if (r && (r.state === 'on' || C >= r.start - 0.12)) { r.state = 'on'; $('#rec').dataset.state = 'on'; r.taps.push(C - r.start); drawRecTaps(); }
    const fb = $('#padFb');
    fb.dataset.cls = cls;
    fb.textContent = `${signed(dev)} · ${word}（${posLabel(q, c)} ${KIND[kindOf(q.n, q.k, c)]}）`;
    paintHist();
    return { dev, pos: p, clip: mod(C, c.L) };
  }
  function paintHist() {
    const n = TAPS.length, mean = n ? TAPS.reduce((s, t) => s + t.dev, 0) / n : 0;
    $('#tapHist').innerHTML = TAPS.slice(-16).map((t) => `<i class="${t.cls}" style="--d:${clamp(t.dev / 80, -1, 1).toFixed(3)}"></i>`).join('') + (n ? `<span>${n} 下 · 平均 ${signed(Math.round(mean))}</span>` : '');
    $('#latCal').disabled = n < 4;
  }
  pressable($('#pad'), padTap);
  function recToggle() {
    if (T.rec) { T.rec = null; recUI(); resched(); return; }
    if (S.sound && !audio.enabled) audio.enable();
    const c = clip(), fresh = !T.run;
    if (fresh) startUser(-c.bpb - c.o / c.spb); // 从停止开始：先数一小节，再从片段第 0 秒录一整圈
    const Ch = clipAbs(beatAt(heard()), c);
    T.rec = { state: 'armed', taps: [], start: fresh ? 0 : (Math.floor(Ch / c.L + 1e-9) + 1) * c.L };
    TAPS.length = 0;
    paintHist();
    recUI();
    resched();
  }
  function recStep(C, c) {
    const r = T.rec;
    if (!r) return;
    if (r.state === 'armed' && C >= r.start - 0.1) { r.state = 'on'; $('#rec').dataset.state = 'on'; }
    if (r.state === 'on' && C >= r.start + c.L - 0.1) { finishRec(); return; }
    const prog = r.state === 'on' ? clamp((C - r.start) / c.L, 0, 1) : 0;
    $('#recProg i').style.transform = `scaleX(${prog.toFixed(4)})`;
    const label = r.state === 'armed' ? `预备 ${Math.max(1, Math.ceil((r.start - C) / c.spb))}…` : `录入中 ${Math.round(prog * 100)}%`;
    if ($('#recLabel').textContent !== label) $('#recLabel').textContent = label;
  }
  function finishRec() {
    const r = T.rec, c = clip();
    T.rec = null;
    if (r.taps.length) {
      S.ev = r.taps.map((x) => r3(mod(x, c.L))).filter((t) => t < c.L - 1e-6).sort((a, b) => a - b);
      S.example = '';
      S.mode = 'ab';
      T.abPhase = Math.round(r.start / c.L) + 1; // 录完的下一圈先放 A（你敲的），再放 B（吸附后）
      toast(`已录入 ${S.ev.length} 个事件：接下来一圈 A（你敲的）、一圈 B（吸附后）`);
    } else toast('这一圈没有敲击，事件保持不变');
    recUI();
    resched(); save(); invalidate();
  }
  function recUI() {
    const r = T.rec, b = $('#rec');
    b.setAttribute('aria-pressed', String(!!r));
    b.dataset.state = r ? r.state : 'idle';
    $('#recLabel').textContent = r ? (r.state === 'armed' ? '预备…' : '录入中') : '录入一遍';
    $('#recProg').classList.toggle('on', !!r);
    tlSvg.classList.toggle('rec', !!r);
    if (!r) $('#recProg i').style.transform = 'scaleX(0)';
    drawRecTaps();
  }
  function drawRecTaps() {
    const g = $('#tlRec');
    if (!g) return;
    const r = T.rec, c = clip();
    g.innerHTML = r ? r.taps.map((x) => `<circle class="rec-tap" cx="${tlX(mod(x, c.L), c).toFixed(1)}" cy="${TL.yA}" r="6"/>`).join('') : '';
  }
  $('#rec .ic-rec').outerHTML = IC.rec;
  $('#rec').addEventListener('click', recToggle);
  $('#lat').addEventListener('input', (e) => { S.lat = +e.target.value; save(); $('#latV').textContent = signed(S.lat); });
  $('#latCal').addEventListener('click', () => {
    if (TAPS.length < 4) return;
    const mean = TAPS.reduce((s, t) => s + t.dev, 0) / TAPS.length;
    S.lat = clamp(Math.round(S.lat + mean), -150, 150);
    TAPS.length = 0;
    paintHist();
    save();
    $('#lat').value = S.lat; $('#latV').textContent = signed(S.lat);
    toast(`延迟补偿设为 ${signed(S.lat)}`);
  });

  // ---- 03 曲线 × 时长 × 拍子 ----
  function bez([x1, y1, x2, y2]) { return MK.bezier(x1, y1, x2, y2); }
  let ease = bez(S.curve);
  const curveSvg = $('#curve');
  const SZ = 300, CX = (v) => v * SZ, CY = (v) => SZ - v * SZ;
  $('#cvGrid').setAttribute('d', [1, 2, 3].map((i) => `M${i * 75} 0V300M0 ${i * 75}H300`).join(''));
  $('#presets').innerHTML = Object.keys(PRESETS).map((k) => `<button type="button" data-v="${k}">${k}</button>`).join('');
  function drawCurve() {
    const [x1, y1, x2, y2] = S.curve, at = (id, o) => Object.entries(o).forEach(([k, v]) => $('#' + id).setAttribute(k, v));
    at('cvPath', { d: `M0 300C${CX(x1)} ${CY(y1)} ${CX(x2)} ${CY(y2)} 300 0` });
    at('h1', { x1: 0, y1: 300, x2: CX(x1), y2: CY(y1) });
    at('h2', { x1: 300, y1: 0, x2: CX(x2), y2: CY(y2) });
    at('p1', { cx: CX(x1), cy: CY(y1), 'aria-valuetext': `x1 ${x1}，y1 ${y1}` });
    at('p2', { cx: CX(x2), cy: CY(y2), 'aria-valuetext': `x2 ${x2}，y2 ${y2}` });
    ['x1', 'y1', 'x2', 'y2'].forEach((k, i) => { if (document.activeElement !== $('#' + k)) $('#' + k).value = S.curve[i]; });
    segSet($('#presets'), S.preset);
    $('#cvCss').textContent = `cubic-bezier(${S.curve.join(', ')})${S.preset ? ` · ${S.preset}` : ' · 自定义'}`;
  }
  let curveDrag = null;
  function fitView() {
    const lo = Math.min(0, S.curve[1], S.curve[3]), hi = Math.max(1, S.curve[1], S.curve[3]);
    curveSvg.setAttribute('viewBox', `-20 ${CY(hi) - 24} 340 ${(hi - lo) * SZ + 48}`);
  }
  function setCurve(cv, preset = '') {
    S.curve = [clamp(cv[0], 0, 1), clamp(cv[1], -1, 2), clamp(cv[2], 0, 1), clamp(cv[3], -1, 2)].map(r2);
    S.preset = preset;
    ease = bez(S.curve);
    drawCurve();
    if (curveDrag === null) fitView();
    if (S.trail || reduce) buildPreview();
    save();
    invalidate('curve');
  }
  segOn($('#presets'), (k) => { setCurve(PRESETS[k], k); restartFree(); });
  ['x1', 'y1', 'x2', 'y2'].forEach((k, i) => $('#' + k).addEventListener('change', (e) => { const cv = S.curve.slice(); cv[i] = Number.isFinite(+e.target.value) && e.target.value !== '' ? +e.target.value : cv[i]; setCurve(cv); }));
  function toVal(e) { const p = curveSvg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(curveSvg.getScreenCTM().inverse()); return [q.x / SZ, (SZ - q.y) / SZ]; }
  [['#p1', 0], ['#p2', 2]].forEach(([sel, o]) => {
    const el = $(sel);
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); curveDrag = o; curveSvg.setPointerCapture(e.pointerId); el.focus({ preventScroll: true }); });
    el.addEventListener('keydown', (e) => {
      const d = e.shiftKey ? 0.1 : 0.01, cv = S.curve.slice();
      if (e.key === 'ArrowLeft') cv[o] -= d; else if (e.key === 'ArrowRight') cv[o] += d;
      else if (e.key === 'ArrowUp') cv[o + 1] += d; else if (e.key === 'ArrowDown') cv[o + 1] -= d; else return;
      e.preventDefault();
      setCurve(cv);
    });
  });
  curveSvg.addEventListener('pointermove', (e) => { if (curveDrag === null) return; const [x, y] = toVal(e), cv = S.curve.slice(); cv[curveDrag] = x; cv[curveDrag + 1] = y; setCurve(cv); });
  const endCurve = () => { if (curveDrag === null) return; curveDrag = null; fitView(); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => curveSvg.addEventListener(t, endCurve));

  const SLD = { dur: (v) => `${v}ms`, stag: (v) => `${v}ms`, dist: (v) => `${v}%`, count: (v) => `${v}` };
  Object.keys(SLD).forEach((k) => $('#' + k).addEventListener('input', (e) => { update({ [k]: +e.target.value }); if (k === 'count' || k === 'dist') buildPreview(); }));
  $('.snap-chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip-btn');
    if (!b) return;
    const c = clip();
    if (b.dataset.dur) update({ dur: clamp(Math.round((+b.dataset.dur * c.spb * 1000) / 10) * 10, 80, 2000) });
    else update({ stag: clamp(Math.round((c.spb / S.div) * 1000 / 5) * 5, 0, 300) });
    restartFree();
  });
  $('#sync').addEventListener('change', (e) => update({ sync: e.target.checked }));
  segOn($('#align'), (v) => update({ align: v }));
  $('#cue').addEventListener('change', (e) => update({ cue: e.target.checked }));
  $('#trail').addEventListener('change', (e) => { S.trail = e.target.checked; save(); buildPreview(); });
  $('#ghost').addEventListener('change', (e) => { S.ghost = e.target.checked; save(); buildPreview(); });
  $('#replay').innerHTML = `${ICONS.replay}重播`;
  $('#replay').addEventListener('click', () => { restartFree(); playCuesNow(); });

  let pvItems = [];
  function buildPreview() {
    const n = S.count, h = 230, box = $('#preview'), w = Math.max(120, box.clientWidth - 28 - 34) * (S.dist / 100);
    let s = '';
    for (let i = 0; i < n; i++) {
      const y = ((i + 0.5) / n) * h;
      s += `<span class="lane" style="top:${y}px"></span>`;
      if (S.trail || reduce) for (let j = 0; j <= 10; j++) { const tt = Math.min(1, j / 10); s += `<b class="trail" style="top:${y - 2}px;left:${14 + 17 - 2 + ease(tt) * w}px"></b>`; }
      if (S.ghost) s += `<i class="ghost" style="top:${y - 7}px"></i>`;
      s += `<i class="box" style="top:${y - 7}px"></i>`;
    }
    box.innerHTML = s;
    pvItems = range(n).map((i) => ({ box: $$('i.box', box)[i], ghost: S.ghost ? $$('i.ghost', box)[i] : null }));
    pvW = w;
  }
  let pvW = 0, freeStart = performance.now();
  const restartFree = () => { freeStart = performance.now(); };
  function easeClock() {
    // 跟随节拍：每小节一轮。落点踩重拍 = 最后一个元素在重拍处落定；起步踩重拍 = 重拍时出发
    if (T.run && S.sync) {
      const c = clip(), pH = beatAt(heard()), tb = totalMs() / 1000 / c.spb;
      if (S.align === 'land') { const k = Math.floor((pH + tb - T.bar) / c.bpb); return (pH - (T.bar + k * c.bpb - tb)) * c.spb * 1000; }
      const k = Math.floor((pH - T.bar) / c.bpb);
      return (pH - (T.bar + k * c.bpb)) * c.spb * 1000;
    }
    const t = performance.now() - freeStart;
    if (t > totalMs() + 700) { restartFree(); return 0; }
    return t;
  }
  // 停止时点“重播”：立即播一遍提示音
  function playCuesNow() {
    if (!S.cue || !live() || (T.run && S.sync)) return;
    const t0 = audio.ctx.currentTime + 0.02, tot = totalMs() / 1000;
    const shot = (v, p, at, gain, pan = 0, seed = 1) => { const meta = audio.meta[v] || {}; audio.play('lab:at', Object.assign({}, p, { v, at, delay: at - audio.ctx.currentTime - 0.005, gain: gain * (meta.level ?? 1), bus: meta.bus, send: meta.send ?? 0, duck: 0, pan, seed })); };
    shot('whoosh', { dur: clamp(tot, 0.15, 2), dir: 'up', peak: 0.9, vel: 0.6 }, t0, (S.vol / 100) * 1.1, 0, 11);
    for (let i = 0; i < S.count; i++) shot('tick', { f: 2900 + i * 110, vel: 0.85 }, t0 + (i * S.stag + S.dur) / 1000, (S.vol / 100) * 1.3, S.count > 1 ? -0.5 + i / (S.count - 1) : 0, 20 + i);
  }

  // ---- 04 导出 ----
  function patternTracks(c) {
    const kit = KITS[S.kit], steps = c.bpb * S.div, tracks = {}, voices = {}, keyOf = new Map();
    for (let s = 0; s < steps; s++) {
      const b = Math.floor(s / S.div), k = s % S.div, lv = k ? 'sub' : b === 0 ? 'bar' : c.acc.has(b) ? 'acc' : 'beat', lvl = levelVol(lv) / 100;
      if (lvl <= 0) continue;
      for (const [v, lp] of kit[lv]) {
        const [p, lg] = layer(lp), params = Object.assign({}, p); delete params.vel;
        const sig = v + JSON.stringify(params);
        if (!keyOf.has(sig)) {
          let name = v, j = 2;
          while (tracks[name]) name = v + j++;
          keyOf.set(sig, name);
          tracks[name] = Array(steps).fill('.');
          voices[name] = Object.assign({}, params, { gain: r2((S.vol / 100) * lg) });
        }
        const vel = (p.vel ?? 1) * lvl;
        tracks[keyOf.get(sig)][s] = vel >= 0.85 ? 'X' : vel >= 0.55 ? 'x' : 'o';
      }
    }
    const fmt = (arr) => (S.div > 1 ? range(c.bpb).map((b) => arr.slice(b * S.div, (b + 1) * S.div).join('')).join(' ') : arr.join(''));
    return { tracks: Object.entries(tracks).map(([k, v]) => `${k}: '${fmt(v)}'`).join(', '), voices: Object.entries(voices).map(([k, v]) => `${k}: ${JSON.stringify(v).replace(/"(\w+)":/g, '$1: ').replace(/,/g, ', ').replace(/"/g, "'")}`).join(', ') };
  }
  function exportText(k) {
    const c = clip(), list = evs().filter((e) => e.inLoop), cv = S.curve.join(', '), m = METERS[S.meter];
    const gridMs = ms(c.spb / S.div), swingMs = swingOn() ? ms(((S.swing / 100) * c.spb) / S.div / 3) : 0;
    const ratio = swingOn() ? r2((1 + S.swing / 300) / (1 - S.swing / 300)) : 1;
    const durBeats = r2(S.dur / 1000 / c.spb), totBeats = r2(totalMs() / 1000 / c.spb);
    const head = `${S.meter} · ${S.bpm} BPM · 网格 ${divName(S.div)}${swingMs ? ` · 摇摆 ${S.swing}%` : ''} · 量化强度 ${S.strength}%`;
    if (k === 'css') {
      return `:root {\n  /* 节奏实验室 · ${head} */\n  --ease-main: cubic-bezier(${cv}); /* ${S.preset || '自定义'} */\n  --dur-main: ${S.dur}ms; /* ≈ ${durBeats} 拍 */\n  --stagger: ${S.stag}ms;\n  --beat: ${ms(c.spb)}ms; /* ${S.bpm} BPM，${m.unit === 8 ? '八分' : '四分'}音符 */\n  --bar: ${ms(c.spb * c.bpb)}ms; /* ${S.meter} */\n  --grid: ${gridMs}ms; /* ${divName(S.div)} */\n  --swing-delay: ${swingMs}ms; /* 反拍推迟 */\n  --beat-offset: ${S.offset}ms; /* 首拍偏移 */\n${list.map((e, j) => `  --hit-${j + 1}: ${ms(e.snap)}ms; /* ${e.label} ${KIND[e.kind]} */`).join('\n')}\n}\n.item {\n  transition: transform var(--dur-main) var(--ease-main);\n  transition-delay: calc(var(--i) * var(--stagger));\n}\n/* 事件动画在吸附后的时刻触发，例如 */\n.hit-1 { animation-delay: var(--hit-1); }`;
    }
    if (k === 'js') {
      const pt = patternTracks(c);
      return `// MotionKit · 节奏实验室导出 · ${head}\nconst ease = MotionKit.bezier(${cv});\nconst DUR = ${S.dur / 1000}, STAGGER = ${S.stag / 1000}; // 秒\nconst BPM = ${S.bpm}, OFFSET = ${r3(c.o)}, METER = [${m.n}, ${m.unit}]; // 首拍在 OFFSET 秒\nconst GRID = ${S.div}, SWING = ${swingOn() ? r2(S.swing / 100) : 0}; // 每拍格数；摇摆 0–1（1 = 三连音 shuffle）\nconst beat = MotionKit.beats(BPM, OFFSET);\n// 第 i 个元素在时刻 t 的进度\nconst progress = (t, i) => ease(MotionKit.clamp((t - i * STAGGER) / DUR, 0, 1));\n// 事件：原始 → 吸附后（${divName(S.div)}网格，强度 ${S.strength}%），单位秒\nconst RAW = [${list.map((e) => r3(e.t)).join(', ')}];\nconst EVENTS = [${list.map((e) => r3(e.snap)).join(', ')}];\n// 声音乐谱：节拍器（${KITS[S.kit].name}）+ 事件（${EVOICES[S.evVoice].name}）\nconst SCORE = [\n  MotionKit.audio.pattern({\n    bpm: BPM, offset: OFFSET, div: GRID, swing: SWING,\n    tracks: { ${pt.tracks} },\n    voices: { ${pt.voices} },\n  }),\n  ...EVENTS.map((t) => ({ t, voice: '${EVOICES[S.evVoice].v}', ${Object.entries(EVOICES[S.evVoice].p).map(([a, b]) => `${a}: ${typeof b === 'string' ? `'${b}'` : b}`).join(', ')}, gain: ${r2((S.vol / 100) * 0.85)} })),\n];\n// MotionKit.audio.attach(timeline, SCORE);`;
    }
    const evText = list.length ? list.map((e) => `${e.snap.toFixed(2)}s（${e.label} ${KIND[e.kind]}${Math.abs(ms(e.dev)) >= 1 ? `，由 ${e.t.toFixed(2)}s 移动 ${signed(ms(e.dev))}` : ''}）`).join('。') : '（暂无）';
    return `动效节奏：${S.meter}拍，${S.bpm} BPM。1拍${ms(c.spb)}ms，1小节${(c.spb * c.bpb).toFixed(2)}s${m.unit === 8 ? '，按八分音符计拍' : ''}。首拍偏移${S.offset}ms，重拍在${c.o.toFixed(3)}s。网格${divName(S.div)}，每格${gridMs}ms。${swingMs ? `摇摆${S.swing}%，反拍推迟${swingMs}ms。长短比${ratio}:1。` : ''}量化强度${S.strength}%。关键事件：${evText}。小节重拍放主动作，次强拍放次要强调。反拍放回弹与细节，主动作避免偏离网格几十毫秒。缓动cubic-bezier(${cv})。曲线：${S.preset || '自定义'}。单个元素${S.dur}ms，约${durBeats}拍。错峰${S.stag}ms，${S.count}个元素共${totalMs()}ms。总时长约${totBeats}拍。${S.align === 'land' ? '最后一个元素在小节重拍落定' : '在小节重拍起步'}。节拍底用${KITS[S.kit].name}音色，分重拍、拍、细分三级音量。事件用${EVOICES[S.evVoice].name}音。起步配呼啸，落定配短促提示音。减少动态时只保留透明度变化，声音照常。`;

  }
  $('#exTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { S.tab = b.dataset.k; save(); paintExport(); } });
  $('#exTabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const ks = ['css', 'js', 'prompt'], i = (ks.indexOf(S.tab) + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
    S.tab = ks[i]; save(); paintExport(); $(`#exTabs [data-k="${S.tab}"]`).focus();
  });
  function paintExport() {
    $('#exOut').textContent = exportText(S.tab);
    $$('#exTabs button').forEach((b) => { const on = b.dataset.k === S.tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  }
  $('#copyEx').innerHTML = `${ICONS.copy}复制`;
  $('#copyEx').addEventListener('click', () => copy($('#exOut').textContent));
  segBuild($('#wavCycles'), [[1, '1 圈'], [2, '2 圈'], [4, '4 圈']]);
  segOn($('#wavCycles'), (v) => { S.wavCycles = +v; save(); invalidate(); });
  $('#wavBtn').innerHTML = `${IC.wave}导出 WAV`;
  $('#wavBtn').addEventListener('click', async () => {
    const btn = $('#wavBtn');
    btn.disabled = true;
    $('#wavRes').textContent = '正在离线渲染…';
    try {
      const r = await renderWav(S.wavCycles);
      const blob = new Blob([r.wav()], { type: 'audio/wav' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `motion-atlas-rhythm-${S.bpm}bpm-${S.meter.replace('/', '-')}-${S.wavCycles}x.wav`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      $('#wavRes').textContent = `已导出 ${a.download} · ${r.duration.toFixed(2)}s · ${r.events} 个声音事件 · 峰值 ${r.peakDb.toFixed(1)} dBFS · RMS ${r.rmsDb.toFixed(1)} dBFS${r.clipped ? ` · 削波 ${r.clipped}` : ' · 无削波'}`;
    } catch (err) {
      $('#wavRes').textContent = '导出失败：' + err.message;
    } finally { btn.disabled = false; }
  });

  /* ---------- 同步全部控件与静态绘制（合并到下一帧） ---------- */
  // 'curve'：只影响曲线与导出；'all'：全部静态部分
  let dirty = 'all';
  function invalidate(part = 'all') { if (dirty !== 'all') dirty = part; }
  const setHTML = (el, html) => { if (el._html !== html) { el.innerHTML = html; el._html = html; } };
  function syncControls() {
    const c = clip();
    if (document.activeElement !== bpmNum) bpmNum.value = S.bpm;
    $('#bpm').value = S.bpm; $('#bpmV').textContent = S.bpm;
    $('#vol').value = S.vol;
    segSet($('#meter'), S.meter);
    const divItems = DIVS.map((d) => `<button type="button" data-v="${d}">${divName(d)}</button>`).join('');
    $$('[data-bind="div"]').forEach((el) => { setHTML(el, divItems); segSet(el, S.div); });
    $$('input[data-bind="swing"]').forEach((el) => { el.value = S.swing; el.disabled = !swingOn(); });
    const swingMs = ((S.swing / 100) * c.spb) / S.div / 3 * 1000;
    $$('[data-out="swing"]').forEach((el) => { el.textContent = swingOn() ? `${S.swing}%` : '—'; });
    $$('[data-hint="swing"]').forEach((el) => { el.textContent = swingOn() ? (S.swing ? `反拍推迟 ${Math.round(swingMs)}ms · 长短比 ${r2((1 + S.swing / 300) / (1 - S.swing / 300))} : 1 · 相当于 MPC ${Math.round(((1 + S.swing / 300) / 2) * 100)}%（100% = 三连音 shuffle）` : '0% 为直拍；调高后每对格子的后一个被推迟，100% 时变成三连音 shuffle。') : '摇摆只作用于成对的格子：请选「半拍」或「十六分」细分。'; });
    segSet($('#kit'), S.kit);
    [['vBar', 'bar'], ['vBeat', 'beat'], ['vSub', 'sub']].forEach(([id, k]) => { $('#' + id).value = S.lv[k]; $('#' + id + 'V').textContent = `${S.lv[k]}%`; });
    $('#offset').value = S.offset; $('#offsetV').textContent = `${S.offset}ms`;
    $('#strength').value = S.strength; $('#strengthV').textContent = `${S.strength}%`;
    segSet($('#bars'), S.bars);
    $('#loopLen').textContent = `= ${c.L.toFixed(2)} 秒`;
    segSet($('#mode'), S.mode);
    $('#evVoice').value = S.evVoice;
    $('#startCue').checked = S.startCue;
    segSet($('#examples'), S.example);
    const ex = EXAMPLES[S.example];
    setHTML($('#exHint'), ex ?`<p><b>${ex.name}</b>：${ex.desc}${ex.tip}</p><div class="tries">${ex.tries.map(([l], j) => `<button type="button" class="chip-btn" data-try="${j}">${l}</button>`).join('')}</div>` : `<p>${S.ev.length ? '自定义事件（拖动、键盘或打拍录入得到）。' : '还没有事件：点上方示例、在 A 道空白处点一下，或用打拍录入。'}</p>`);
    if (document.activeElement !== evTa) evTa.value = S.ev.map((t) => t.toFixed(3)).join(', ');
    $('#lat').value = S.lat; $('#latV').textContent = signed(S.lat);
    Object.entries(SLD).forEach(([k, f]) => { $('#' + k).value = S[k]; $('#' + k + 'V').textContent = f(S[k]); });
    $('#sync').checked = S.sync; $('#cue').checked = S.cue; $('#trail').checked = S.trail; $('#ghost').checked = S.ghost;
    segSet($('#align'), S.align);
    $$('#align button').forEach((b) => { b.disabled = !S.sync; });
    segSet($('#wavCycles'), S.wavCycles);
  }
  function paintTable() {
    const list = evs(), c = clip(), inl = list.filter((e) => e.inLoop), out = list.length - inl.length;
    $('#qtable').innerHTML = '<thead><tr><th>#</th><th>原始</th><th>吸附到</th><th>吸附后</th><th>移动</th><th>落点</th></tr></thead><tbody>' + inl.map((e, j) => {
      const d = ms(e.dev);
      return `<tr><td>${j + 1}</td><td>${e.t.toFixed(3)}s</td><td>${e.label}</td><td>${e.snap.toFixed(3)}s</td><td class="${d > 0 ? 'early' : d < 0 ? 'late' : 'on'}">${d ? signed(d) : '0'}</td><td>${KIND[e.kind]}${e.dup > 1 ? ' · 重叠' : ''}</td></tr>`;
    }).join('') + '</tbody>';
    const abs = inl.map((e) => Math.abs(ms(e.dev))), max = abs.length ? Math.max(...abs) : 0, dups = new Set(inl.filter((e) => e.dup > 1).map((e) => e.full.toFixed(4))).size;
    $('#qStats').textContent = inl.length ? `${inl.length} 个事件 · 平均移动 ${Math.round(abs.reduce((s, v) => s + v, 0) / abs.length)}ms · 最大 ${max}ms${dups ? ` · ${dups} 处重叠（多个事件吸到同一点）` : ''}${out ? ` · ${out} 个超出 ${c.L.toFixed(2)}s 循环` : ''}` : (out ? `${out} 个事件超出 ${c.L.toFixed(2)}s 循环` : '没有事件');
  }
  function paintTotals() {
    const c = clip(), tot = totalMs(), bar = c.spb * c.bpb * 1000;
    $('#total').innerHTML = `总时长 <b>${tot}ms</b> ≈ ${r2(tot / 1000 / c.spb)} 拍 · 时长 ${S.dur}ms ≈ ${r2(S.dur / 1000 / c.spb)} 拍 · 1 小节 ${Math.round(bar)}ms${tot > bar ? ' · <span class="warn">总时长超过 1 小节，跟随节拍时动画会被下一小节打断</span>' : ''}`;
    const wavC = clip();
    $('#wavSum').textContent = `${S.meter} · ${S.bpm} BPM · ${S.bars} 小节一圈（${wavC.L.toFixed(2)}s）× ${S.wavCycles} = ${(wavC.L * S.wavCycles).toFixed(2)}s · 事件 ${MODES.find(([k]) => k === S.mode)[1]}`;
  }
  function redraw() {
    const part = dirty;
    dirty = false;
    if (part === 'curve') { paintExport(); return; }
    syncControls();
    buildMetro();
    drawTL();
    paintTable();
    paintTotals();
    paintExport();
    drawCurve();
    if (pvItems.length !== S.count || !pvItems.length) buildPreview();
  }

  /* ---------- 帧循环：全部画面由“听到的”音乐位置驱动 ---------- */
  const glow = (dt, tau) => (dt < 0 ? 0 : Math.exp(-dt / tau));
  // 只在数值变化时写样式，避免每帧触发样式重算
  const VARS = new WeakMap();
  function setVar(el, name, v) {
    let m = VARS.get(el);
    if (!m) VARS.set(el, (m = {}));
    const s = typeof v === 'number' ? v.toFixed(3) : v;
    if (m[name] !== s) { m[name] = s; if (name === 'transform' || name === 'opacity') el.style[name] = s; else el.style.setProperty(name, s); }
  }
  const setText = (el, s) => { if (el.textContent !== s) el.textContent = s; };
  const EL = { pos: $('#pos'), ball: $('#mBall'), count: $('#mCount'), read: $('#mRead'), replay: $('#replay'), abNow: $('#abNow'), cvDot: $('#cvDot'), cvT: $('#cvT') };
  let lastAB = '';
  function frame() {
    tick();
    if (dirty) redraw();
    const c = clip(), g = grid();
    const hT = T.run ? heard() : null, pH = T.run ? beatAt(hT) : null;
    T.vis = { heard: hT, beat: pH }; // 最近一帧画面所用的“听到的”时刻与位置（自动化验证用）
    const going = pH != null && pH >= -0.02 - c.bpb * 4;
    // 走带位置、迷你灯、节拍器
    let beatIdx = -1, beatGlow = 0, subK = -1, subGlow = 0, inBar = 0;
    if (going) {
      const rel = pH - T.bar, barN = Math.floor(rel / c.bpb);
      inBar = rel - barN * c.bpb;
      beatIdx = Math.floor(inBar + 1e-9);
      const f = inBar - beatIdx;
      let k = 0;
      for (let j = 0; j < g.length; j++) if (g[j] <= f + 1e-9) k = j;
      beatGlow = glow(f * c.spb, 0.16);
      subK = k; subGlow = k ? glow((f - g[k]) * c.spb, 0.1) : 0;
      setText(EL.pos, rel < 0 ? `预备 ${Math.ceil(-rel)}` : `${barN + 1}.${beatIdx + 1}${S.div > 1 ? '.' + (k + 1) : ''}`);
      recStep(clipAbs(pH, c), c);
    } else setText(EL.pos, '—');
    const countIn = going && pH - T.bar < 0;
    lightEls.forEach((el, i) => el.classList.toggle('on', i === beatIdx && going));
    cellGeo.forEach((cg, i) => {
      const on = i === beatIdx && going;
      cg.el.classList.toggle('on', on);
      cg.el.classList.toggle('pre', on && countIn);
      setVar(cg.el, '--glow', on ? (reduce ? 1 : beatGlow) : 0);
      cg.subs.forEach((s, j) => setVar(s, '--glow', on && subK === j + 1 ? (reduce ? 1 : subGlow) : 0));
    });
    if (going && cellGeo.length && !reduce) {
      const cg = cellGeo[clamp(beatIdx, 0, cellGeo.length - 1)], f = inBar - beatIdx;
      setVar(EL.ball, 'opacity', '1');
      setVar(EL.ball, 'transform', `translate(${(cg.x + f * cg.w).toFixed(1)}px, ${(-Math.sin(Math.PI * f) * 34).toFixed(1)}px)`);
    } else setVar(EL.ball, 'opacity', '0');
    const cntTxt = !going ? '·' : String(beatIdx + 1); // 预备小节也数拍（灰色）
    if (EL.count.textContent !== cntTxt) { EL.count.textContent = cntTxt; EL.count.dataset.lv = countIn || !going ? 'idle' : beatIdx === 0 ? 'bar' : c.acc.has(beatIdx) ? 'acc' : 'beat'; }
    setText(EL.read, `${!going ? '已停止' : countIn ? '预备小节' : `小节 ${Math.floor((pH - T.bar) / c.bpb) + 1}`} · ${S.bpm} BPM · 1 拍 ${ms(c.spb)}ms · 1 小节 ${(c.spb * c.bpb).toFixed(2)}s`);
    paintTimeline(pH, c);
    paintBounce(pH, c);
    paintEase();
    requestAnimationFrame(frame);
  }
  function abAt(m) { return S.mode === 'ab' ? (mod(m - T.abPhase, 2) ? 'b' : 'a') : S.mode; }
  function paintTimeline(pH, c) {
    const head = $('#tlHead');
    if (!head) return;
    if (pH == null) { setVar(head, 'opacity', '0'); if (lastAB) { EL.abNow.textContent = ''; lastAB = ''; } return; }
    const C = clipAbs(pH, c), ct = mod(C, c.L), m = Math.floor(C / c.L);
    setVar(head, 'opacity', '1');
    setVar(head, 'transform', `translateX(${tlX(ct, c).toFixed(1)}px)`);
    const ab = T.rec ? 'rec' : abAt(m);
    const txt = ab === 'rec' ? '录入中：事件静音，只放节拍器' : ab === 'a' ? '正在播放：A 原始' : ab === 'b' ? '正在播放：B 吸附后' : ab === 'both' ? '正在播放：A（左）+ B（右）' : '';
    if (txt !== lastAB) { EL.abNow.textContent = txt; EL.abNow.dataset.ab = ab; lastAB = txt; }
    // 命中闪光：事件在本圈被播放时放大（减少动态时不闪）
    if (reduce) return;
    const em = new Map(evs().map((e) => [e.i, e]));
    const flash = (map, which) => map.forEach((el, i) => {
      const e = em.get(i);
      if (!e) return;
      const t = which === 'a' ? e.t : e.snap, dt = mod(ct - t, c.L), audible = ab === which || ab === 'both';
      setVar(el, '--hit', audible && dt < 0.35 ? glow(dt, 0.12) : 0);
    });
    flash(TL.aEls, 'a');
    flash(TL.bEls, 'b');
  }
  function paintBounce(pH, c) {
    if (!BN.lanes) return;
    const list = evs().filter((e) => e.inLoop);
    const C = pH == null ? null : clipAbs(pH, c), ct = C == null ? 0 : mod(C, c.L), m = C == null ? 0 : Math.floor(C / c.L);
    const ab = T.rec ? 'rec' : abAt(m);
    const beatF = pH == null ? 1 : mod(pH - T.bar, 1), barBeat = pH == null ? 1 : mod(Math.floor(pH - T.bar), c.bpb);
    BN.lanes.forEach((ln) => {
      ln.g.classList.toggle('live', pH != null && (ab === ln.w || ab === 'both'));
      const lampV = pH == null ? 0 : reduce ? (beatF < 0.25 ? 1 : 0) : glow(beatF * c.spb, 0.12);
      setVar(ln.lamp, '--glow', lampV);
      ln.lamp.classList.toggle('bar', barBeat === 0);
      const ts = list.map((e) => ({ t: ln.w === 'a' ? e.t : e.snap, e })).sort((x, y) => x.t - y.t);
      if (pH == null || !ts.length) { setVar(ln.ball, 'transform', 'translateY(0px)'); setVar(ln.ring, 'opacity', '0'); return; }
      // 上一次落地与下一次落地（循环回绕）
      let prev = null, next = null;
      for (const x of ts) { if (x.t <= ct + 1e-9) prev = x; else if (!next) next = x; }
      const pT = prev ? prev.t : ts[ts.length - 1].t - c.L, nx = next || { t: ts[0].t + c.L, e: ts[0].e }, pv = prev || { t: pT, e: ts[ts.length - 1].e };
      const span = Math.max(0.05, nx.t - pT), u = clamp((ct - pT) / span, 0, 1), hgt = Math.min(1, span / 0.6) * 62;
      setVar(ln.ball, 'transform', `translateY(${reduce ? 0 : (-Math.sin(Math.PI * u) * hgt).toFixed(1)}px)`);
      const since = ct - pT;
      setVar(ln.ring, 'opacity', reduce ? (since < 0.2 ? '1' : '0') : glow(since, 0.14).toFixed(3));
      setVar(ln.ring, 'transform', `scale(${(1 + (reduce ? 0 : Math.min(1, since / 0.3) * 0.35)).toFixed(3)})`);
      if (ln.last !== pv.e.i + ln.w) {
        ln.last = pv.e.i + ln.w;
        const e = pv.e, d = ms(e.devFull);
        const onBeat = ln.w === 'b' ? e.kind : Math.abs(d) <= 12 ? e.kind : null;
        ln.lab.textContent = ln.w === 'a' ? (onBeat ? `${KIND[onBeat]} · 准` : `离网格 ${signed(-d)}`) : KIND[e.kind];
        ln.pos.textContent = `位置 ${e.label}`;
        ln.lab.dataset.k = ln.w === 'a' && !onBeat ? 'miss' : e.kind;
      }
    });
  }
  function paintEase() {
    const t = easeClock();
    pvItems.forEach((it, i) => {
      const pr = reduce ? 1 : clamp((t - i * S.stag) / S.dur, 0, 1);
      if (it.box) setVar(it.box, 'transform', `translateX(${(ease(pr) * pvW).toFixed(1)}px)`);
      if (it.ghost) setVar(it.ghost, 'transform', `translateX(${(pr * pvW).toFixed(1)}px)`);
    });
    const p = reduce ? 1 : clamp(t / S.dur, 0, 1);
    EL.cvDot.setAttribute('cx', CX(p)); EL.cvDot.setAttribute('cy', CY(ease(p)));
    EL.cvT.setAttribute('x1', CX(p)); EL.cvT.setAttribute('x2', CX(p));
    const dis = T.run && S.sync;
    if (EL.replay.disabled !== dis) { EL.replay.disabled = dis; EL.replay.title = dis ? '跟随节拍时每小节自动重播' : ''; }
  }

  /* ---------- 键盘：输入框里不抢键；按钮 / 链接上的空格交给元素本身 ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const el = e.target, tag = el.tagName;
    const typing = tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable || (tag === 'INPUT' && !['range', 'checkbox', 'radio'].includes(el.type));
    if (typing) return;
    const k = e.key.toLowerCase();
    if (e.key === ' ' || e.code === 'Space') {
      if (tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY' || (tag === 'INPUT' && el.type !== 'range')) return;
      e.preventDefault();
      if (!e.repeat) togglePlay();
    } else if (k === 't' && !e.repeat) { tapTempo(e.timeStamp); }
    else if (k === 'j' && !e.repeat) { e.preventDefault(); padTap(e.timeStamp); }
    else if (k === 'r' && !e.repeat) recToggle();
    else if (k === 'a' && !e.repeat) update({ mode: 'a' });
    else if (k === 'b' && !e.repeat) update({ mode: 'b' });
    else if (k === 'x' && !e.repeat) update({ mode: 'ab' });
  });

  /* ---------- 尺寸、主题、减少动态 ---------- */
  const ro = new ResizeObserver(() => { measureMetro(); drawTL(); drawBounce(); buildPreview(); });
  [$('#tlBox'), $('#bounce'), $('#mBar'), $('#preview')].forEach((el) => ro.observe(el));
  mq.addEventListener('change', () => { reduce = mq.matches; buildPreview(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  // 调试 / 自动化钩子（只读为主；apply 与界面走同一入口）
  window.__lab = {
    S, T, LOG, PROC, clip, grid, snapX, beatAt, timeAt, heard, now, offlineScore, exportText, update, KITS, EVOICES,
    evs: () => evs().map((e) => ({ i: e.i, t: e.t, snap: e.snap, full: e.full, dev: e.dev, label: e.label, kind: e.kind, dup: e.dup, inLoop: e.inLoop })),
    clock: () => ({ src: T.src, run: T.run, now: T.run ? now() : null, heard: T.run ? heard() : null, beat: T.run ? beatAt(heard()) : null, bar: T.bar, t0: T.t0, p0: T.p0, abPhase: T.abPhase }),
    start: (p0) => startUser(p0), stop, padTap, tapTempo, recToggle,
    async render(cycles) { const r = await renderWav(cycles); return { peakDb: r.peakDb, rmsDb: r.rmsDb, clipped: r.clipped, events: r.events, duration: r.duration, b64: await r.base64() }; },
  };

  drawCurve(); fitView(); drawBounce(); redraw(); buildPreview(); paintPlay(); paintSound(); paintHist();
  setInterval(tick, 25);
  requestAnimationFrame(frame);
})();
