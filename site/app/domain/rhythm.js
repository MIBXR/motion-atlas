export function createRhythmLab(notify = () => {}) {
  const MK = window.MotionKit,
    audio = MK.audio;
  const store = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        notify('节奏参数未能保存，本次页面仍可使用。');
        return false;
      }
    },
  };
  const toast = notify;
  let root = null,
    mounted = false,
    frameId = 0,
    tickTimer = 0,
    observer,
    audioUnsubscribe;
  const cleanups = [];
  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];
  const subscribers = new Set();
  let snapshot,
    EL,
    tapInfo = '',
    feedback = { text: '跟着节拍器敲击，比较自己的落点。', cls: '' },
    recordingLabel = '录入一遍';
  function listen(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    cleanups.push(() => target.removeEventListener(type, listener, options));
  }
  const mq = matchMedia('(prefers-reduced-motion: reduce)');

  let reduce = mq.matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const mod = (a, n) => ((a % n) + n) % n;

  const r2 = (n) => Math.round(n * 100) / 100;

  const r3 = (n) => Math.round(n * 1000) / 1000;

  const ms = (s) => Math.round(s * 1000);

  const signed = (v, unit = 'ms') =>
    (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v) + unit;

  const hash = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0 || 1;
  };

  const METERS = {
    '2/4': { n: 2, unit: 4, groups: [2], hint: '2/4：强—弱，进行曲式的两拍。' },
    '3/4': {
      n: 3,
      unit: 4,
      groups: [3],
      hint: '3/4：强—弱—弱，圆舞曲式的三拍。',
    },
    '4/4': {
      n: 4,
      unit: 4,
      groups: [2, 2],
      hint: '4/4：强—弱—次强—弱，流行音乐与剪辑最常用。',
    },
    '5/4': {
      n: 5,
      unit: 4,
      groups: [3, 2],
      hint: '5/4：按 3+2 分组，第 4 拍是次强拍。',
    },
    '6/8': {
      n: 6,
      unit: 8,
      groups: [3, 3],
      hint: '6/8：按八分音符计拍（BPM 指八分音符），3+3 分组，听起来是两个大拍、各分三份。',
    },
    '7/8': {
      n: 7,
      unit: 8,
      groups: [2, 2, 3],
      hint: '7/8：按八分音符计拍，2+2+3 分组，最后一组长一拍，有“踉跄”感。',
    },
  };

  const accOf = (m) => {
    const s = new Set();
    let a = 0;
    for (const g of m.groups) {
      if (a) s.add(a);
      a += g;
    }
    return s;
  };

  const DIVS = [1, 2, 3, 4];

  const divName = (d) =>
    ({
      1: '拍',
      2: '半拍',
      3: '三连音',
      4: METERS[S.meter].unit === 8 ? '¼ 拍' : '十六分',
    })[d];

  const KITS = {
    drum: {
      name: '鼓组',
      bar: [
        ['kick', { vel: 1 }],
        ['rim', { tone: 1.2, vel: 1 }],
      ],
      acc: [
        ['kick', { vel: 0.45 }],
        ['rim', { tone: 1.1, vel: 0.95 }],
      ],
      beat: [['rim', { vel: 0.85 }]],
      sub: [['hat', { vel: 0.8 }]],
    },
    wood: {
      name: '木块',
      bar: [['tom', { f: 1046, decay: 0.09, vel: 1 }]],
      acc: [['tom', { f: 932, decay: 0.08, vel: 0.95 }]],
      beat: [['tom', { f: 784, decay: 0.07, vel: 0.85 }]],
      sub: [['tick', { f: 2600, vel: 1, g: 2.4 }]],
    },
    blip: {
      name: '电子',
      bar: [['blip', { note: 'A6', vel: 1, g: 2.2 }]],
      acc: [['blip', { note: 'F#6', vel: 0.95, g: 2.2 }]],
      beat: [['blip', { note: 'E6', vel: 0.85, g: 2.2 }]],
      sub: [['tick', { f: 4200, vel: 1, g: 2.6 }]],
    },
    key: {
      name: '机械',
      bar: [
        ['key', { heavy: 1, vel: 1, g: 2.1 }],
        ['click', { f: 3200, vel: 0.7, g: 2.1 }],
      ],
      acc: [['key', { heavy: 0.8, vel: 0.95, g: 2.1 }]],
      beat: [['key', { heavy: 0.6, vel: 0.9, g: 2.2 }]],
      sub: [['click', { f: 1800, vel: 0.6, g: 1.6 }]],
    },
  };

  const layer = (p) => {
    const q = Object.assign({}, p),
      g = q.g ?? 1;
    delete q.g;
    return [q, g];
  };

  const EVOICES = {
    clap: { name: '拍手', v: 'clap', p: { vel: 0.95 } },
    snare: { name: '军鼓', v: 'snare', p: { vel: 0.9 } },
    tom: { name: '通鼓', v: 'tom', p: { f: 165, vel: 0.95 } },
    pluck: { name: '拨弦', v: 'pluck', p: { note: 'E5', vel: 0.9 } },
  };

  const MODES = [
    ['off', '只听节拍器'],
    ['a', 'A 原始'],
    ['b', 'B 吸附'],
    ['ab', 'A/B 交替'],
    ['both', 'A+B 叠放'],
  ];

  const KIND = {
    down: '小节重拍',
    acc: '次强拍',
    on: '正拍',
    off: '反拍 · 切分',
    trip: '三连音',
    weak: '十六分弱位',
  };

  const DRAG = [28, 46, 38, 62, 44, 70, 52, 80];

  const HUM = [12, -18, 9, 15, -14, 20, -10, 6, -16, 11];

  const range = (n) => Array.from({ length: n }, (_, i) => i);

  const EXAMPLES = {
    drag: {
      name: '拖拍',
      desc: '每拍都有，但一拍比一拍晚（+28～+80ms），像没踩准的剪辑。',
      tip: '把量化强度从 0% 拉到 100%，听拖沓感被一点点拉回拍上。',
      tries: [
        ['强度 0%', { strength: 0 }],
        ['强度 50%', { strength: 50 }],
        ['强度 100%', { strength: 100 }],
        ['A/B 交替', { mode: 'ab' }],
      ],
      make: (c) =>
        range(c.loopBeats).map((i) => ({ x: i, dev: DRAG[i % DRAG.length] })),
    },
    sync: {
      name: '切分',
      desc: '3+3+2 的切分节奏：第 2 下落在第 2 拍的后半拍（反拍）上。',
      tip: '切到「拍」网格，反拍上的那一下会被拉到第 3 拍——切分被抹平；切回「半拍」才保留下来。',
      tries: [
        ['拍网格', { div: 1 }],
        ['半拍网格', { div: 2 }],
        ['A/B 交替', { mode: 'ab' }],
      ],
      make: (c) => {
        const out = [];
        for (let b = 0; b < c.bars; b++)
          for (let x = 0; x < c.bpb - 1e-9; x += 1.5)
            out.push({ x: b * c.bpb + x, dev: HUM[out.length % HUM.length] });
        return out;
      },
    },
    trip: {
      name: '三连音',
      desc: '一拍里均分三下（每隔一拍一组）。',
      tip: '「十六分」会把三下吸成不均匀的 1/4、3/4；「半拍」会把两下挤到同一点；只有「三连音」网格吸附正确。',
      tries: [
        ['半拍网格', { div: 2 }],
        ['十六分网格', { div: 4 }],
        ['三连音网格', { div: 3 }],
      ],
      make: (c) => {
        const out = [];
        for (let i = 0; i < c.loopBeats; i++)
          (i % 2 ? [0] : [0, 1 / 3, 2 / 3]).forEach((f) =>
            out.push({
              x: i + f,
              dev: Math.round(HUM[out.length % HUM.length] * 0.6),
            }),
          );
        return out;
      },
    },
    swing: {
      name: '摇摆',
      desc: '八分音符成对出现，后一个被推迟到 2/3 处（长短比 2:1）。',
      tip: '直的「半拍」网格会把它拉直、失去摇摆；把摇摆调到 100% 时网格和它吻合，吸附几乎不动。',
      tries: [
        ['摇摆 0%', { div: 2, swing: 0 }],
        ['摇摆 60%', { div: 2, swing: 60 }],
        ['摇摆 100%', { div: 2, swing: 100 }],
      ],
      make: (c) => {
        const out = [];
        for (let i = 0; i < c.loopBeats; i++)
          [0, 2 / 3].forEach((f) =>
            out.push({
              x: i + f,
              dev: Math.round(HUM[out.length % HUM.length] * 0.5),
            }),
          );
        return out;
      },
    },
    cuts: {
      name: '剪辑点',
      desc: '一组按秒记录的真实剪辑点（0.31、0.74、1.62、2.05、2.9 秒），不属于任何网格。',
      tip: '剪辑点按秒固定：改 BPM、首拍偏移或细分，看它们分别被吸到哪里。',
      tries: [
        ['BPM 100', { bpm: 100 }],
        ['BPM 120', { bpm: 120 }],
        ['偏移 150ms', { offset: 150 }],
        ['偏移 0', { offset: 0 }],
      ],
      make: () => [0.31, 0.74, 1.62, 2.05, 2.9].map((t) => ({ t })),
    },
  };

  const PRESETS = {
    snap: [0.2, 0.9, 0.1, 1],
    glide: [0.25, 0.1, 0.25, 1],
    emphasized: [0.2, 0, 0, 1],
    exit: [0.4, 0, 1, 1],
    anticipate: [0.36, 0, 0.66, -0.56],
    overshoot: [0.34, 1.56, 0.64, 1],
    linear: [0, 0, 1, 1],
  };

  const DEF = {
    v: 2,
    bpm: 120,
    meter: '4/4',
    div: 2,
    swing: 0,
    offset: 0,
    kit: 'drum',
    vol: 80,
    lv: { bar: 100, beat: 75, sub: 45 },
    sound: true,
    bars: 2,
    strength: 100,
    mode: 'off',
    evVoice: 'clap',
    startCue: true,
    ev: null,
    example: 'sync',
    lat: 0,
    curve: PRESETS.snap,
    preset: 'snap',
    dur: 420,
    stag: 40,
    dist: 70,
    count: 6,
    sync: true,
    align: 'land',
    cue: true,
    trail: false,
    ghost: false,
    tab: 'css',
    wavCycles: 2,
  };

  const parseEv = (s) =>
    String(s || '')
      .split(/[\s,，、;；]+/)
      .map(Number)
      .filter((v) => Number.isFinite(v) && v >= 0)
      .map(r3);

  const saved = store.get('ma-lab', {}) || {};

  const S = Object.assign({}, DEF, saved);

  S.lv = Object.assign({}, DEF.lv, saved.lv || {});

  if (!METERS[S.meter]) S.meter = '4/4';

  if (!DIVS.includes(S.div)) S.div = 2;

  if (!KITS[S.kit]) S.kit = 'drum';

  if (!EVOICES[S.evVoice]) S.evVoice = 'clap';

  if (!MODES.some(([k]) => k === S.mode)) S.mode = 'off';

  if (![1, 2, 4].includes(S.bars)) S.bars = 2;

  if (![1, 2, 4].includes(S.wavCycles)) S.wavCycles = 2;

  if (
    !Array.isArray(S.curve) ||
    S.curve.length !== 4 ||
    !S.curve.every(Number.isFinite)
  ) {
    S.curve = PRESETS.snap;
    S.preset = 'snap';
  }

  S.bpm = clamp(Math.round(+S.bpm || 120), 40, 240);

  S.swing = clamp(+S.swing || 0, 0, 100);

  S.offset = clamp(+S.offset || 0, 0, 1000);

  S.strength = clamp(+(S.strength ?? 100), 0, 100);

  S.vol = clamp(+(S.vol ?? 80), 0, 100);

  S.lat = clamp(+S.lat || 0, -150, 150);

  let saveT = 0;

  const save = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => store.set('ma-lab', S), 200);
  };

  function clip() {
    const m = METERS[S.meter],
      bpb = m.n,
      spb = 60 / S.bpm,
      loopBeats = bpb * S.bars,
      L = loopBeats * spb;
    return {
      m,
      bpb,
      spb,
      loopBeats,
      L,
      bars: S.bars,
      o: mod(S.offset / 1000, L),
      acc: accOf(m),
    };
  }

  const swingOn = () => S.div === 2 || S.div === 4;

  function grid() {
    const d = S.div,
      sw = swingOn() ? S.swing / 100 : 0,
      g = [];
    for (let k = 0; k < d; k++) g.push(k / d + (k % 2 ? sw / (3 * d) : 0));
    return g;
  }

  function snapX(x, g = grid(), min = -Infinity) {
    const n0 = Math.floor(x);
    let best = null,
      bd = Infinity;
    for (let n = n0 - 1; n <= n0 + 2; n++) {
      for (let k = 0; k < g.length; k++) {
        const p = n + g[k];
        if (p < min) continue;
        const d = Math.abs(x - p);
        if (d <= bd + 1e-12) {
          bd = d;
          best = { p, n, k };
        } // 相等时取后一个（与四舍五入一致）
      }
    }
    return best || { p: x, n: n0, k: 0 };
  }

  function kindOf(n, k, c) {
    if (k === 0) {
      const b = mod(n, c.bpb);
      return b === 0 ? 'down' : c.acc.has(b) ? 'acc' : 'on';
    }
    if (S.div === 3) return 'trip';
    if (S.div === 2 || k === 2) return 'off';
    return 'weak';
  }

  const posLabel = (q, c) =>
    `${mod(Math.floor(q.n / c.bpb), S.bars) + 1}.${mod(q.n, c.bpb) + 1}${S.div > 1 ? '.' + (q.k + 1) : ''}`;

  let evCache = null;

  const bump = () => {
    evCache = null;
  };

  function evs() {
    if (evCache) return evCache;
    const c = clip(),
      g = grid(),
      s = S.strength / 100,
      minX = -c.o / c.spb - 1e-9;
    const list = S.ev
      .map((t, i) => {
        const x = (t - c.o) / c.spb,
          q = snapX(x, g, minX),
          full = c.o + q.p * c.spb,
          snap = t + s * (full - t);
        return {
          i,
          t,
          x,
          q,
          full,
          snap,
          dev: snap - t,
          devFull: full - t,
          kind: kindOf(q.n, q.k, c),
          label: posLabel(q, c),
          inLoop: t < c.L - 1e-9,
        };
      })
      .sort((a, b) => a.t - b.t || a.i - b.i);
    const cnt = new Map();
    list.forEach((e) => {
      if (e.inLoop) {
        const k = e.full.toFixed(4);
        cnt.set(k, (cnt.get(k) || 0) + 1);
      }
    });
    list.forEach((e) => {
      e.dup = cnt.get(e.full.toFixed(4)) || 1;
    });
    return (evCache = list);
  }

  function loadExample(id) {
    const ex = EXAMPLES[id];
    if (!ex) return;
    const c = clip();
    S.ev = ex
      .make(c)
      .map((e) =>
        e.t != null ? e.t : mod(c.o + e.x * c.spb + e.dev / 1000, c.L),
      )
      .filter((t) => t < c.L - 1e-6)
      .map(r3)
      .sort((a, b) => a - b);
    S.example = id;
  }

  if (!S.ev) loadExample(EXAMPLES[S.example] ? S.example : 'sync');

  audio.define(
    'lab:at',
    (ctx, out, w, p) => {
      const fn = audio.voices[p.v];
      return fn ? fn(ctx, out, Math.max(p.at, ctx.currentTime), p) : w;
    },
    { bus: 'sfx', send: 0, level: 1 },
  );

  const LOOK = 0.15,
    SAFE = 0.015,
    PROC = 0.006;

  const T = {
    run: false,
    src: 'perf',
    t0: 0,
    p0: 0,
    bar: 0,
    cursor: 0,
    pend: [],
    rec: null,
    abPhase: 0,
  };

  const LOG = [];

  const spb = () => 60 / S.bpm;

  const live = () =>
    audio.state === 'on' && !!audio.ctx && audio.ctx.state === 'running';

  const clockOf = (src) =>
    src === 'audio' ? audio.ctx.currentTime : performance.now() / 1000;

  const now = () => clockOf(T.src);

  const beatAt = (t) => T.p0 + (t - T.t0) / spb();

  const timeAt = (p) => T.t0 + (p - T.p0) * spb();

  const clipAbs = (p, c = clip()) => c.o + (p - T.bar) * c.spb;

  function heard() {
    if (T.src !== 'audio') return performance.now() / 1000;
    const ctx = audio.ctx,
      cur = ctx.currentTime;
    if (ctx.getOutputTimestamp) {
      const ts = ctx.getOutputTimestamp();
      if (ts && ts.contextTime > 0 && ts.performanceTime > 0) {
        const h =
          ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
        if (h <= cur + 0.005 && h > cur - 0.5) return Math.min(h, cur) - PROC;
      }
    }
    return cur - (ctx.outputLatency || ctx.baseLatency || 0) - PROC;
  }

  function tapClock(stamp) {
    if (T.src !== 'audio') return stamp / 1000;
    const ctx = audio.ctx,
      ts = ctx.getOutputTimestamp && ctx.getOutputTimestamp();
    if (ts && ts.contextTime > 0 && ts.performanceTime > 0)
      return ts.contextTime + (stamp - ts.performanceTime) / 1000 - PROC;
    return heard() - (performance.now() - stamp) / 1000;
  }

  function cancelAfter(ref) {
    T.pend = T.pend.filter((x) => {
      if (x.when > ref) {
        try {
          x.h.stop();
        } catch (e) {
          /* 已停止 */
        }
        x.log.x = 1;
        return false;
      }
      return true;
    });
  }

  function start(p0 = 0) {
    if (T.run) return;
    T.src = live() ? 'audio' : 'perf';
    T.t0 = now() + 0.08;
    T.p0 = p0;
    T.bar = 0;
    T.abPhase = 0;
    T.cursor = beatAt(now());
    T.run = true;
    bump();
    tick();
    publish();
  }

  function stop() {
    if (!T.run) return;
    cancelAfter(now()); // 只取消还没响的；正在响的自然衰减
    T.run = false;
    if (T.rec) {
      T.rec = null;
      recordScene();
    }
    publish();
    invalidate();
  }

  function rebase(mut) {
    if (!T.run) {
      if (mut) mut(null);
      bump();
      return;
    }
    const ref = now() + SAFE,
      p = beatAt(ref);
    if (mut) mut(p);
    bump();
    T.t0 = ref;
    T.p0 = p;
    cancelAfter(ref);
    T.cursor = p + 1e-9;
    tick();
  }

  function resched() {
    bump();
    if (!T.run) return;
    const ref = now() + SAFE,
      p = beatAt(ref);
    cancelAfter(ref);
    T.cursor = p + 1e-9;
    tick();
  }

  function syncSrc() {
    const want = live() ? 'audio' : 'perf';
    if (want === T.src) return;
    if (!T.run) {
      T.src = want;
      return;
    }
    const p = beatAt(now());
    if (T.src === 'audio' && audio.ctx) cancelAfter(audio.ctx.currentTime);
    T.src = want;
    T.t0 = now();
    T.p0 = p;
    T.cursor = p + 1e-9;
  }

  function tick() {
    if (!T.run) return;
    syncSrc();
    const t = now();
    if (T.src !== 'audio') {
      T.cursor = Math.max(T.cursor, beatAt(t));
      return;
    }
    const a = Math.max(T.cursor, beatAt(t - 0.002)),
      b = beatAt(t + LOOK);
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
    const h = audio.play(
      'lab:at',
      Object.assign({}, ev.p, {
        v: ev.v,
        at: when,
        delay: when - audio.ctx.currentTime - 0.005,
        gain: ev.gain * (meta.level ?? 1),
        bus: meta.bus || 'sfx',
        send: meta.send ?? 0,
        duck: 0,
        pan: ev.pan || 0,
        seed: ev.seed,
      }),
    );
    const log = {
      k: ev.kind,
      lv: ev.lv,
      v: ev.v,
      pos: ev.pos,
      when,
      at: t,
      cyc: ev.cyc,
    };
    LOG.push(log);
    if (LOG.length > 8000) LOG.splice(0, 2000);
    if (h) T.pend.push({ when, h, log });
  }

  const levelVol = (lv) =>
    lv === 'sub'
      ? S.lv.sub
      : lv === 'beat'
        ? S.lv.beat
        : lv === 'acc'
          ? (S.lv.bar + S.lv.beat) / 2
          : S.lv.bar;

  const totalMs = () => S.dur + S.stag * (S.count - 1);

  function gen(a, b, opt = {}) {
    const c = opt.c || clip(),
      bar = opt.bar ?? T.bar,
      abPhase = opt.abPhase ?? T.abPhase,
      out = [],
      g = grid(),
      vol = S.vol / 100,
      kit = KITS[S.kit];
    // 1. 节拍器：每个网格点按层级取音色
    for (let n = Math.floor(a) - 1; n <= Math.ceil(b); n++) {
      const bib = mod(n - bar, c.bpb);
      for (let k = 0; k < g.length; k++) {
        const pos = n + g[k];
        if (pos < a || pos >= b) continue;
        const lv = k
            ? 'sub'
            : bib === 0
              ? 'bar'
              : c.acc.has(bib)
                ? 'acc'
                : 'beat',
          lvl = levelVol(lv) / 100;
        if (lvl <= 0) continue;
        for (const [v, lp] of kit[lv]) {
          const [p, lg] = layer(lp);
          out.push({
            kind: 'metro',
            lv,
            pos,
            v,
            p,
            gain: vol * lvl * lg,
            seed: hash(v + Math.round(pos * 1000)),
          });
        }
      }
    }
    // 2. 事件（A 原始 / B 吸附）与 3. 循环起点提示：按片段时间 C = o + (p − bar) × 每拍秒数，循环长度 L
    const ca = c.o + (a - bar) * c.spb,
      cb = c.o + (b - bar) * c.spb;
    const m0 = Math.floor(ca / c.L) - 1,
      m1 = Math.floor(cb / c.L) + 1;
    if (S.mode !== 'off' && !(T.rec && !opt.offline)) {
      const list = evs().filter((e) => e.inLoop),
        ev = EVOICES[S.evVoice];
      for (let m = m0; m <= m1; m++) {
        const ab = S.mode === 'ab' ? (mod(m - abPhase, 2) ? 'b' : 'a') : S.mode;
        const layers =
          ab === 'both'
            ? [
                ['a', -0.55],
                ['b', 0.55],
              ]
            : [[ab, 0]];
        for (const [which, pan] of layers) {
          for (const e of list) {
            const pos =
              bar + (m * c.L + (which === 'a' ? e.t : e.snap) - c.o) / c.spb;
            if (pos >= a && pos < b)
              out.push({
                kind: which === 'a' ? 'evA' : 'evB',
                lv: e.i,
                pos,
                v: ev.v,
                p: ev.p,
                gain: vol * 0.85,
                pan,
                seed: hash(which + e.i),
                cyc: m,
              });
          }
        }
      }
    }
    if (S.startCue) {
      for (let m = m0; m <= m1; m++) {
        const pos = bar + (m * c.L - c.o) / c.spb;
        if (pos >= a && pos < b)
          out.push({
            kind: 'cue0',
            pos,
            v: 'blip',
            p: { note: 'C7', vel: 0.7, decay: 0.07 },
            gain: vol * 0.5,
            seed: 3,
            cyc: m,
          });
      }
    }
    // 4. 曲线提示音（跟随节拍时）：呼啸 + 每个元素落定一声
    if (S.sync && S.cue) {
      const tot = totalMs() / 1000,
        tb = tot / c.spb,
        land = S.align === 'land';
      for (
        let k = Math.floor((a - bar) / c.bpb) - 1;
        k <= Math.ceil((b - bar + tb) / c.bpb) + 1;
        k++
      ) {
        const s0 = bar + k * c.bpb - (land ? tb : 0);
        if (s0 >= a && s0 < b)
          out.push({
            kind: 'cueW',
            pos: s0,
            v: 'whoosh',
            p: land
              ? { dur: clamp(tot, 0.15, 2), dir: 'up', peak: 0.9, vel: 0.6 }
              : {
                  dur: clamp(tot, 0.15, 2),
                  dir: 'down',
                  peak: 0.12,
                  vel: 0.55,
                },
            gain: vol * 1.1,
            seed: 11,
          });
        for (let i = 0; i < S.count; i++) {
          const pos = s0 + (i * S.stag + S.dur) / 1000 / c.spb;
          if (pos >= a && pos < b)
            out.push({
              kind: 'cueT',
              lv: i,
              pos,
              v: 'tick',
              p: { f: 2900 + i * 110, vel: 0.85 },
              gain: vol * 1.3,
              pan: S.count > 1 ? -0.5 + i / (S.count - 1) : 0,
              seed: 20 + i,
            });
        }
      }
    }
    return out;
  }

  function offlineScore(cycles = S.wavCycles) {
    const c = clip(),
      p0 = -c.o / c.spb,
      p1 = p0 + cycles * c.loopBeats;
    const list = gen(p0, p1, { c, bar: 0, abPhase: 0, offline: true });
    return {
      dur: cycles * c.L,
      score: list.map((ev) =>
        Object.assign({}, ev.p, {
          t: Math.max(0, (ev.pos - p0) * c.spb),
          voice: ev.v,
          gain: ev.gain,
          pan: ev.pan || 0,
          seed: ev.seed,
          kind: ev.kind,
        }),
      ),
    };
  }

  async function renderWav(cycles = S.wavCycles) {
    const { score, dur } = offlineScore(cycles);
    // 从 PROC 秒处开始截取：抵消压缩器预读延迟，WAV 第 0 个样本 = 片段第 0 秒
    return audio.renderOffline(score, dur, {
      sampleRate: 48000,
      from: PROC,
      preroll: PROC,
    });
  }

  function applyMeter(id, p) {
    const ob = METERS[S.meter].n,
      nb = METERS[id].n;
    S.meter = id;
    if (p == null) return;
    // 当前小节里已经走过的拍数小于新拍号的拍数：继续数下去；否则下一拍当作新小节的重拍
    const s0 = T.bar + Math.floor((p - T.bar) / ob) * ob;
    T.bar = p - s0 < nb - 1e-9 ? s0 : Math.ceil(p - 1e-9);
  }

  function update(patch) {
    const tempo =
      patch.bpm != null && clamp(Math.round(patch.bpm), 40, 240) !== S.bpm;
    const meter =
      patch.meter && patch.meter !== S.meter && METERS[patch.meter]
        ? patch.meter
        : null;
    const next = Object.assign({}, patch);
    delete next.bpm;
    delete next.meter;
    if (next.lv) {
      S.lv = Object.assign({}, S.lv, next.lv);
      delete next.lv;
    }
    // 切到 A/B 交替（或载入示例）时，让“这一圈”放 A、下一圈放 B
    const curCycle = () => Math.floor(clipAbs(beatAt(heard())) / clip().L);
    if (next.mode === 'ab' && S.mode !== 'ab' && T.run) T.abPhase = curCycle();
    const exId = next.example;
    delete next.example;
    Object.assign(S, next);
    if (exId) {
      loadExample(exId);
      if (S.mode === 'off') {
        S.mode = 'ab';
        if (T.run) T.abPhase = curCycle();
      }
    }
    if (tempo || meter)
      rebase((p) => {
        if (tempo) S.bpm = clamp(Math.round(patch.bpm), 40, 240);
        if (meter) applyMeter(meter, p);
      });
    else resched();
    save();
    invalidate(patch.curve ? 'curve' : 'all');
  }

  function startUser(p0) {
    if (S.sound) audio.enable(); // 在点击手势里开启声音（浏览器自动播放策略）
    start(p0);
  }

  const togglePlay = () => (T.run ? stop() : startUser());

  const tapT = [];

  function preview(kitId) {
    if (T.run || !live()) return;
    const kit = KITS[kitId],
      t0 = audio.ctx.currentTime + 0.03,
      step = 0.16;
    [
      ['bar', 0],
      ['sub', 1],
      ['beat', 2],
      ['sub', 3],
    ].forEach(([lv, i]) => {
      for (const [v, lp] of kit[lv]) {
        const meta = audio.meta[v] || {},
          [p, lg] = layer(lp);
        audio.play(
          'lab:at',
          Object.assign({}, p, {
            v,
            at: t0 + i * step,
            delay: i * step + 0.025,
            gain: (S.vol / 100) * (levelVol(lv) / 100) * lg * (meta.level ?? 1),
            bus: meta.bus,
            send: meta.send ?? 0,
            duck: 0,
            seed: hash(v + i),
          }),
        );
      }
    });
  }

  let cellGeo = [],
    lightEls = [],
    metroSig = '';

  function buildMetro() {
    const c = clip(),
      g = grid(),
      sig = `${S.meter}|${S.div}|${S.swing}`;
    if (sig === metroSig) return;
    metroSig = sig;
    $('#mCells').innerHTML = range(c.bpb)
      .map((b) => {
        const lv = b === 0 ? 'bar' : c.acc.has(b) ? 'acc' : 'beat';
        return `<div class="cell${c.acc.has(b) ? ' gs' : ''}" data-lv="${lv}"><b>${b + 1}</b>${g
          .slice(1)
          .map((o) => `<i style="left:${(o * 100).toFixed(2)}%"></i>`)
          .join('')}</div>`;
      })
      .join('');
    $('#lights').innerHTML = range(c.bpb)
      .map(
        (b) =>
          `<i data-lv="${b === 0 ? 'bar' : c.acc.has(b) ? 'acc' : 'beat'}"${c.acc.has(b) ? ' class="gs"' : ''}></i>`,
      )
      .join('');
    lightEls = $$('#lights i');
    measureMetro();
  }

  function measureMetro() {
    const bar = $('#mBar').getBoundingClientRect();
    cellGeo = $$('#mCells .cell').map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - bar.left, w: r.width, el, subs: $$('i', el) };
    });
  }

  const TL = {
    W: 0,
    H: 236,
    padL: 34,
    padR: 14,
    yR: 18,
    yA: 70,
    yB: 150,
    gTop: 26,
    gBot: 182,
    aEls: new Map(),
    bEls: new Map(),
    drag: null,
    focus: null,
  };

  let tlSvg;

  const tlX = (t, c) => TL.padL + (t / c.L) * (TL.W - TL.padL - TL.padR);

  const tlT = (x, c) => ((x - TL.padL) / (TL.W - TL.padL - TL.padR)) * c.L;

  function drawTL() {
    const box = $('#tlBox'),
      W = Math.max(300, Math.round(box.clientWidth));
    TL.W = W;
    const c = clip(),
      g = grid(),
      X = (t) => tlX(t, c),
      list = evs();
    const beatPx = (W - TL.padL - TL.padR) / c.loopBeats;
    let s = `<defs><marker id="ahE" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="ah-e"/></marker><marker id="ahL" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="ah-l"/></marker></defs>`;
    s += `<rect class="tl-lane" x="${TL.padL - 6}" y="${TL.yA - 19}" width="${W - TL.padL - TL.padR + 12}" height="38" rx="9"/><rect class="tl-lane" x="${TL.padL - 6}" y="${TL.yB - 19}" width="${W - TL.padL - TL.padR + 12}" height="38" rx="9"/>`;
    s += `<text class="tl-tag" x="6" y="${TL.yA + 5}">A</text><text class="tl-tag b" x="6" y="${TL.yB + 5}">B</text>`;
    if (c.o > 0.0005)
      s += `<rect class="tl-off" x="${X(0)}" y="${TL.gTop}" width="${(X(c.o) - X(0)).toFixed(1)}" height="${TL.gBot - TL.gTop}"/>${X(c.o) - X(0) > 58 ? `<text class="tl-offt" x="${X(0) + 5}" y="${TL.gBot - 6}">偏移 ${ms(c.o)}ms</text>` : ''}`;
    const n0 = Math.floor(-c.o / c.spb) - 1,
      n1 = Math.ceil((c.L - c.o) / c.spb) + 1;
    for (let n = n0; n <= n1; n++) {
      for (let k = 0; k < g.length; k++) {
        const C = c.o + (n + g[k]) * c.spb;
        if (C < -1e-9 || C >= c.L - 1e-9) continue;
        const x = Math.round(X(C)) + 0.5,
          b = mod(n, c.bpb);
        const cls = k ? 'sub' : b === 0 ? 'bar' : c.acc.has(b) ? 'acc' : 'beat';
        s += `<line class="g-${cls}" x1="${x}" x2="${x}" y1="${cls === 'sub' ? TL.gTop + 6 : TL.gTop}" y2="${TL.gBot}"/>`;
        // 标尺：位置写成“小节.拍”（与吸附明细一致）；太挤时只标小节号
        const barNo = mod(Math.floor(n / c.bpb), S.bars) + 1;
        if (!k && (b === 0 || beatPx >= 26))
          s += `<text class="tl-num${b === 0 ? ' bar' : ''}" x="${x + 3}" y="${TL.yR}">${beatPx >= 34 ? `${barNo}.${b + 1}` : b === 0 ? barNo : b + 1}</text>`;
      }
    }
    s += `<line class="tl-end" x1="${Math.round(X(c.L)) + 0.5}" x2="${Math.round(X(c.L)) + 0.5}" y1="${TL.gTop}" y2="${TL.gBot}"/>`;
    // 秒刻度
    const pxs = (W - TL.padL - TL.padR) / c.L,
      stepS = [0.1, 0.25, 0.5, 1, 2].find((v) => v * pxs >= 56) || 2;
    for (let t = 0; t <= c.L + 1e-9; t += stepS) {
      const x = Math.round(X(t)) + 0.5;
      s += `<line class="tl-sec" x1="${x}" x2="${x}" y1="${TL.gBot + 4}" y2="${TL.gBot + 9}"/><text class="tl-sect" x="${x}" y="${TL.gBot + 24}">${r2(t)}s</text>`;
    }
    s += `<rect class="tl-hitA" x="${TL.padL - 6}" y="${TL.yA - 19}" width="${W - TL.padL - TL.padR + 12}" height="38"/>`;
    // 箭头与吸附目标
    for (const e of list) {
      if (!e.inLoop) continue;
      const xa = X(e.t),
        xb = X(clamp(e.snap, 0, c.L)),
        d = ms(e.dev);
      if (S.strength < 100 && Math.abs(e.devFull) > 5e-4)
        s += `<line class="tl-target" x1="${X(e.full)}" x2="${X(e.full)}" y1="${TL.yB - 15}" y2="${TL.yB + 15}"/>`;
      if (Math.abs(d) >= 2)
        s += `<path class="tl-arrow ${d > 0 ? 'early' : 'late'}" d="M${xa.toFixed(1)} ${TL.yA + 11}L${xb.toFixed(1)} ${TL.yB - 12}" marker-end="url(#${d > 0 ? 'ahE' : 'ahL'})"/>`;
    }
    for (const e of list) {
      if (!e.inLoop) continue;
      s += `<g class="tl-b${e.dup > 1 ? ' dup' : ''}" data-i="${e.i}" transform="translate(${X(clamp(e.snap, 0, c.L)).toFixed(1)} ${TL.yB})"><circle r="7.5"/>${e.dup > 1 ? `<circle class="dup-ring" r="12"/>` : ''}</g>`;
    }
    // A 点（可拖动、可聚焦）与偏差标签（相邻足够远才显示）
    const inl = list.filter((e) => e.inLoop);
    inl.forEach((e, j) => {
      const xa = X(e.t),
        d = ms(e.devFull);
      const roomL = j ? xa - X(inl[j - 1].t) : 99,
        roomR = j < inl.length - 1 ? X(inl[j + 1].t) - xa : 99;
      const lab =
        Math.min(roomL, roomR) >= 40
          ? `<text class="tl-dev ${d > 0 ? 'early' : d < 0 ? 'late' : 'on'}" y="-14">${d ? signed(d, '') : '准'}</text>`
          : '';
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
    if (TL.focus != null && TL.aEls.has(TL.focus))
      TL.aEls.get(TL.focus).focus({ preventScroll: true });
    drawRecTaps();
  }

  const svgX = (e) => {
    const r = tlSvg.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * TL.W;
  };

  const endDrag = () => {
    if (!TL.drag) return;
    const v = S.ev[TL.drag.i];
    TL.drag = null;
    S.ev.sort((a, b) => a - b);
    TL.focus = S.ev.indexOf(v);
    S.example = '';
    resched();
    save();
    invalidate();
  };

  const BN = { W: 0, H: 180 };

  function drawBounce() {
    const svg = $('#bnc'),
      W = Math.max(280, Math.round($('#bounce').clientWidth));
    BN.W = W;
    const half = W / 2,
      gy = BN.H - 56;
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
    BN.lanes = ['a', 'b'].map((w) => {
      const g = $('#bn-' + w, svg);
      return {
        w,
        g,
        ball: $('.bn-ball', g),
        ring: $('.bn-ring', g),
        lamp: $('.bn-lamp', g),
        lab: $('.bn-lab', g),
        pos: $('.bn-pos', g),
        last: null,
      };
    });
  }

  const TAPS = [];

  function judge(d) {
    const a = Math.abs(d);
    return a <= 12
      ? ['正中', 'on']
      : a <= 35
        ? [d < 0 ? '略早' : '略晚', d < 0 ? 'early' : 'late']
        : [d < 0 ? '偏早' : '偏晚', d < 0 ? 'early' : 'late'];
  }

  function recToggle() {
    if (T.rec) {
      T.rec = null;
      recordScene();
      resched();
      return;
    }
    if (S.sound && !audio.enabled) audio.enable();
    const c = clip(),
      fresh = !T.run;
    if (fresh) startUser(-c.bpb - c.o / c.spb); // 从停止开始：先数一小节，再从片段第 0 秒录一整圈
    const Ch = clipAbs(beatAt(heard()), c);
    T.rec = {
      state: 'armed',
      taps: [],
      start: fresh ? 0 : (Math.floor(Ch / c.L + 1e-9) + 1) * c.L,
    };
    TAPS.length = 0;
    publish();
    recordScene();
    resched();
  }

  function finishRec() {
    const r = T.rec,
      c = clip();
    T.rec = null;
    if (r.taps.length) {
      S.ev = r.taps
        .map((x) => r3(mod(x, c.L)))
        .filter((t) => t < c.L - 1e-6)
        .sort((a, b) => a - b);
      S.example = '';
      S.mode = 'ab';
      T.abPhase = Math.round(r.start / c.L) + 1; // 录完的下一圈先放 A（你敲的），再放 B（吸附后）
      toast(
        `已录入 ${S.ev.length} 个事件：接下来先播放一圈 A（原始敲击），再播放一圈 B（吸附后）`,
      );
    } else toast('这一圈没有敲击，事件保持不变');
    recordScene();
    resched();
    save();
    invalidate();
  }

  function drawRecTaps() {
    const g = $('#tlRec');
    if (!g) return;
    const r = T.rec,
      c = clip();
    g.innerHTML = r
      ? r.taps
          .map(
            (x) =>
              `<circle class="rec-tap" cx="${tlX(mod(x, c.L), c).toFixed(1)}" cy="${TL.yA}" r="6"/>`,
          )
          .join('')
      : '';
  }

  function bez([x1, y1, x2, y2]) {
    return MK.bezier(x1, y1, x2, y2);
  }

  let ease = bez(S.curve);

  let curveSvg;

  const SZ = 300,
    CX = (v) => v * SZ,
    CY = (v) => SZ - v * SZ;

  function drawCurve() {
    const [x1, y1, x2, y2] = S.curve,
      at = (id, o) =>
        Object.entries(o).forEach(([k, v]) => $('#' + id).setAttribute(k, v));
    at('cvPath', { d: `M0 300C${CX(x1)} ${CY(y1)} ${CX(x2)} ${CY(y2)} 300 0` });
    at('h1', { x1: 0, y1: 300, x2: CX(x1), y2: CY(y1) });
    at('h2', { x1: 300, y1: 0, x2: CX(x2), y2: CY(y2) });
    at('p1', {
      cx: CX(x1),
      cy: CY(y1),
      'aria-valuetext': `x1 ${x1}，y1 ${y1}`,
    });
    at('p2', {
      cx: CX(x2),
      cy: CY(y2),
      'aria-valuetext': `x2 ${x2}，y2 ${y2}`,
    });
  }

  let curveDrag = null;

  function fitView() {
    const lo = Math.min(0, S.curve[1], S.curve[3]),
      hi = Math.max(1, S.curve[1], S.curve[3]);
    curveSvg.setAttribute(
      'viewBox',
      `-20 ${CY(hi) - 24} 340 ${(hi - lo) * SZ + 48}`,
    );
  }

  function setCurve(cv, preset = '') {
    S.curve = [
      clamp(cv[0], 0, 1),
      clamp(cv[1], -1, 2),
      clamp(cv[2], 0, 1),
      clamp(cv[3], -1, 2),
    ].map(r2);
    S.preset = preset;
    ease = bez(S.curve);
    drawCurve();
    if (curveDrag === null) fitView();
    if (S.trail || reduce) buildPreview();
    save();
    invalidate('curve');
  }

  function toVal(e) {
    const p = curveSvg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(curveSvg.getScreenCTM().inverse());
    return [q.x / SZ, (SZ - q.y) / SZ];
  }

  const endCurve = () => {
    if (curveDrag === null) return;
    curveDrag = null;
    fitView();
  };

  const SLD = {
    dur: (v) => `${v}ms`,
    stag: (v) => `${v}ms`,
    dist: (v) => `${v}%`,
    count: (v) => `${v}`,
  };

  let pvItems = [];

  function buildPreview() {
    const n = S.count,
      h = 230,
      box = $('#preview'),
      w = Math.max(120, box.clientWidth - 28 - 34) * (S.dist / 100);
    let s = '';
    for (let i = 0; i < n; i++) {
      const y = ((i + 0.5) / n) * h;
      s += `<span class="lane" style="top:${y}px"></span>`;
      if (S.trail || reduce)
        for (let j = 0; j <= 10; j++) {
          const tt = Math.min(1, j / 10);
          s += `<b class="trail" style="top:${y - 2}px;left:${14 + 17 - 2 + ease(tt) * w}px"></b>`;
        }
      if (S.ghost) s += `<i class="ghost" style="top:${y - 7}px"></i>`;
      s += `<i class="box" style="top:${y - 7}px"></i>`;
    }
    box.innerHTML = s;
    pvItems = range(n).map((i) => ({
      box: $$('i.box', box)[i],
      ghost: S.ghost ? $$('i.ghost', box)[i] : null,
    }));
    pvW = w;
  }

  let pvW = 0,
    freeStart = performance.now();

  const restartFree = () => {
    freeStart = performance.now();
  };

  function easeClock() {
    // 跟随节拍：每小节一轮。落点踩重拍 = 最后一个元素在重拍处落定；起步踩重拍 = 重拍时出发
    if (T.run && S.sync) {
      const c = clip(),
        pH = beatAt(heard()),
        tb = totalMs() / 1000 / c.spb;
      if (S.align === 'land') {
        const k = Math.floor((pH + tb - T.bar) / c.bpb);
        return (pH - (T.bar + k * c.bpb - tb)) * c.spb * 1000;
      }
      const k = Math.floor((pH - T.bar) / c.bpb);
      return (pH - (T.bar + k * c.bpb)) * c.spb * 1000;
    }
    const t = performance.now() - freeStart;
    if (t > totalMs() + 700) {
      restartFree();
      return 0;
    }
    return t;
  }

  function playCuesNow() {
    if (!S.cue || !live() || (T.run && S.sync)) return;
    const t0 = audio.ctx.currentTime + 0.02,
      tot = totalMs() / 1000;
    const shot = (v, p, at, gain, pan = 0, seed = 1) => {
      const meta = audio.meta[v] || {};
      audio.play(
        'lab:at',
        Object.assign({}, p, {
          v,
          at,
          delay: at - audio.ctx.currentTime - 0.005,
          gain: gain * (meta.level ?? 1),
          bus: meta.bus,
          send: meta.send ?? 0,
          duck: 0,
          pan,
          seed,
        }),
      );
    };
    shot(
      'whoosh',
      { dur: clamp(tot, 0.15, 2), dir: 'up', peak: 0.9, vel: 0.6 },
      t0,
      (S.vol / 100) * 1.1,
      0,
      11,
    );
    for (let i = 0; i < S.count; i++)
      shot(
        'tick',
        { f: 2900 + i * 110, vel: 0.85 },
        t0 + (i * S.stag + S.dur) / 1000,
        (S.vol / 100) * 1.3,
        S.count > 1 ? -0.5 + i / (S.count - 1) : 0,
        20 + i,
      );
  }

  function patternTracks(c) {
    const kit = KITS[S.kit],
      steps = c.bpb * S.div,
      tracks = {},
      voices = {},
      keyOf = new Map();
    for (let s = 0; s < steps; s++) {
      const b = Math.floor(s / S.div),
        k = s % S.div,
        lv = k ? 'sub' : b === 0 ? 'bar' : c.acc.has(b) ? 'acc' : 'beat',
        lvl = levelVol(lv) / 100;
      if (lvl <= 0) continue;
      for (const [v, lp] of kit[lv]) {
        const [p, lg] = layer(lp),
          params = Object.assign({}, p);
        delete params.vel;
        const sig = v + JSON.stringify(params);
        if (!keyOf.has(sig)) {
          let name = v,
            j = 2;
          while (tracks[name]) name = v + j++;
          keyOf.set(sig, name);
          tracks[name] = Array(steps).fill('.');
          voices[name] = Object.assign({}, params, {
            gain: r2((S.vol / 100) * lg),
          });
        }
        const vel = (p.vel ?? 1) * lvl;
        tracks[keyOf.get(sig)][s] = vel >= 0.85 ? 'X' : vel >= 0.55 ? 'x' : 'o';
      }
    }
    const fmt = (arr) =>
      S.div > 1
        ? range(c.bpb)
            .map((b) => arr.slice(b * S.div, (b + 1) * S.div).join(''))
            .join(' ')
        : arr.join('');
    return {
      tracks: Object.entries(tracks)
        .map(([k, v]) => `${k}: '${fmt(v)}'`)
        .join(', '),
      voices: Object.entries(voices)
        .map(
          ([k, v]) =>
            `${k}: ${JSON.stringify(v)
              .replace(/"(\w+)":/g, '$1: ')
              .replace(/,/g, ', ')
              .replace(/"/g, "'")}`,
        )
        .join(', '),
    };
  }

  function exportText(k) {
    const c = clip(),
      list = evs().filter((e) => e.inLoop),
      cv = S.curve.join(', '),
      m = METERS[S.meter];
    const gridMs = ms(c.spb / S.div),
      swingMs = swingOn() ? ms(((S.swing / 100) * c.spb) / S.div / 3) : 0;
    const ratio = swingOn() ? r2((1 + S.swing / 300) / (1 - S.swing / 300)) : 1;
    const durBeats = r2(S.dur / 1000 / c.spb),
      totBeats = r2(totalMs() / 1000 / c.spb);
    const head = `${S.meter} · ${S.bpm} BPM · 网格 ${divName(S.div)}${swingMs ? ` · 摇摆 ${S.swing}%` : ''} · 量化强度 ${S.strength}%`;
    if (k === 'css') {
      return `:root {\n  /* 节奏实验室 · ${head} */\n  --ease-main: cubic-bezier(${cv}); /* ${S.preset || '自定义'} */\n  --dur-main: ${S.dur}ms; /* ≈ ${durBeats} 拍 */\n  --stagger: ${S.stag}ms;\n  --beat: ${ms(c.spb)}ms; /* ${S.bpm} BPM，${m.unit === 8 ? '八分' : '四分'}音符 */\n  --bar: ${ms(c.spb * c.bpb)}ms; /* ${S.meter} */\n  --grid: ${gridMs}ms; /* ${divName(S.div)} */\n  --swing-delay: ${swingMs}ms; /* 反拍推迟 */\n  --beat-offset: ${S.offset}ms; /* 首拍偏移 */\n${list.map((e, j) => `  --hit-${j + 1}: ${ms(e.snap)}ms; /* ${e.label} ${KIND[e.kind]} */`).join('\n')}\n}\n.item {\n  transition: transform var(--dur-main) var(--ease-main);\n  transition-delay: calc(var(--i) * var(--stagger));\n}\n/* 事件动画在吸附后的时刻触发，例如 */\n.hit-1 { animation-delay: var(--hit-1); }`;
    }
    if (k === 'js') {
      const pt = patternTracks(c);
      return `// MotionKit · 节奏实验室导出 · ${head}\nconst ease = MotionKit.bezier(${cv});\nconst DUR = ${S.dur / 1000}, STAGGER = ${S.stag / 1000}; // 秒\nconst BPM = ${S.bpm}, OFFSET = ${r3(c.o)}, METER = [${m.n}, ${m.unit}]; // 首拍在 OFFSET 秒\nconst GRID = ${S.div}, SWING = ${swingOn() ? r2(S.swing / 100) : 0}; // 每拍格数；摇摆 0–1（1 = 三连音 shuffle）\nconst beat = MotionKit.beats(BPM, OFFSET);\n// 第 i 个元素在时刻 t 的进度\nconst progress = (t, i) => ease(MotionKit.clamp((t - i * STAGGER) / DUR, 0, 1));\n// 事件：原始 → 吸附后（${divName(S.div)}网格，强度 ${S.strength}%），单位秒\nconst RAW = [${list.map((e) => r3(e.t)).join(', ')}];\nconst EVENTS = [${list.map((e) => r3(e.snap)).join(', ')}];\n// 声音乐谱：节拍器（${KITS[S.kit].name}）+ 事件（${EVOICES[S.evVoice].name}）\nconst SCORE = [\n  MotionKit.audio.pattern({\n    bpm: BPM, offset: OFFSET, div: GRID, swing: SWING,\n    tracks: { ${pt.tracks} },\n    voices: { ${pt.voices} },\n  }),\n  ...EVENTS.map((t) => ({ t, voice: '${EVOICES[S.evVoice].v}', ${Object.entries(
        EVOICES[S.evVoice].p,
      )
        .map(([a, b]) => `${a}: ${typeof b === 'string' ? `'${b}'` : b}`)
        .join(
          ', ',
        )}, gain: ${r2((S.vol / 100) * 0.85)} })),\n];\n// MotionKit.audio.attach(timeline, SCORE);`;
    }
    const evText = list.length
      ? list
          .map(
            (e) =>
              `${e.snap.toFixed(2)}s（${e.label} ${KIND[e.kind]}${Math.abs(ms(e.dev)) >= 1 ? `，由 ${e.t.toFixed(2)}s 移动 ${signed(ms(e.dev))}` : ''}）`,
          )
          .join('。')
      : '（暂无）';
    return `动效节奏：${S.meter}拍，${S.bpm} BPM。1拍${ms(c.spb)}ms，1小节${(c.spb * c.bpb).toFixed(2)}s${m.unit === 8 ? '，按八分音符计拍' : ''}。首拍偏移${S.offset}ms，重拍在${c.o.toFixed(3)}s。网格${divName(S.div)}，每格${gridMs}ms。${swingMs ? `摇摆${S.swing}%，反拍推迟${swingMs}ms。长短比${ratio}:1。` : ''}量化强度${S.strength}%。关键事件：${evText}。小节重拍放主动作，次强拍放次要强调。反拍放回弹与细节，主动作避免偏离网格几十毫秒。缓动cubic-bezier(${cv})。曲线：${S.preset || '自定义'}。单个元素${S.dur}ms，约${durBeats}拍。错峰${S.stag}ms，${S.count}个元素共${totalMs()}ms。总时长约${totBeats}拍。${S.align === 'land' ? '最后一个元素在小节重拍落定' : '在小节重拍起步'}。节拍底用${KITS[S.kit].name}音色，分重拍、拍、细分三级音量。事件用${EVOICES[S.evVoice].name}音。起步配呼啸，落定配短促提示音。`;
  }

  let dirty = 'all';

  const glow = (dt, tau) => (dt < 0 ? 0 : Math.exp(-dt / tau));

  const VARS = new WeakMap();

  function setVar(el, name, v) {
    let m = VARS.get(el);
    if (!m) VARS.set(el, (m = {}));
    const s = typeof v === 'number' ? v.toFixed(3) : v;
    if (m[name] !== s) {
      m[name] = s;
      if (name === 'transform' || name === 'opacity') el.style[name] = s;
      else el.style.setProperty(name, s);
    }
  }

  const setText = (el, s) => {
    if (el.textContent !== s) el.textContent = s;
  };

  let lastAB = '';

  function frame() {
    tick();
    if (dirty) redraw();
    const c = clip(),
      g = grid();
    const hT = T.run ? heard() : null,
      pH = T.run ? beatAt(hT) : null;
    // 最近一帧画面所用的“听到的”时刻与位置（自动化验证用）
    const going = pH != null && pH >= -0.02 - c.bpb * 4;
    // 走带位置、迷你灯、节拍器
    let beatIdx = -1,
      beatGlow = 0,
      subK = -1,
      subGlow = 0,
      inBar = 0;
    if (going) {
      const rel = pH - T.bar,
        barN = Math.floor(rel / c.bpb);
      inBar = rel - barN * c.bpb;
      beatIdx = Math.floor(inBar + 1e-9);
      const f = inBar - beatIdx;
      let k = 0;
      for (let j = 0; j < g.length; j++) if (g[j] <= f + 1e-9) k = j;
      beatGlow = glow(f * c.spb, 0.16);
      subK = k;
      subGlow = k ? glow((f - g[k]) * c.spb, 0.1) : 0;
      setText(
        EL.pos,
        rel < 0
          ? `预备 ${Math.ceil(-rel)}`
          : `${barN + 1}.${beatIdx + 1}${S.div > 1 ? '.' + (k + 1) : ''}`,
      );
      recStep(clipAbs(pH, c), c);
    } else setText(EL.pos, '—');
    const countIn = going && pH - T.bar < 0;
    lightEls.forEach((el, i) =>
      el.classList.toggle('on', i === beatIdx && going),
    );
    cellGeo.forEach((cg, i) => {
      const on = i === beatIdx && going;
      cg.el.classList.toggle('on', on);
      cg.el.classList.toggle('pre', on && countIn);
      setVar(cg.el, '--glow', on ? (reduce ? 1 : beatGlow) : 0);
      cg.subs.forEach((s, j) =>
        setVar(s, '--glow', on && subK === j + 1 ? (reduce ? 1 : subGlow) : 0),
      );
    });
    if (going && cellGeo.length && !reduce) {
      const cg = cellGeo[clamp(beatIdx, 0, cellGeo.length - 1)],
        f = inBar - beatIdx;
      setVar(EL.ball, 'opacity', '1');
      setVar(
        EL.ball,
        'transform',
        `translate(${(cg.x + f * cg.w).toFixed(1)}px, ${(-Math.sin(Math.PI * f) * 34).toFixed(1)}px)`,
      );
    } else setVar(EL.ball, 'opacity', '0');
    const cntTxt = !going ? '·' : String(beatIdx + 1); // 预备小节也数拍（灰色）
    if (EL.count.textContent !== cntTxt) {
      EL.count.textContent = cntTxt;
      EL.count.dataset.lv =
        countIn || !going
          ? 'idle'
          : beatIdx === 0
            ? 'bar'
            : c.acc.has(beatIdx)
              ? 'acc'
              : 'beat';
    }
    setText(
      EL.read,
      `${!going ? '已停止' : countIn ? '预备小节' : `小节 ${Math.floor((pH - T.bar) / c.bpb) + 1}`} · ${S.bpm} BPM · 1 拍 ${ms(c.spb)}ms · 1 小节 ${(c.spb * c.bpb).toFixed(2)}s`,
    );
    paintTimeline(pH, c);
    paintBounce(pH, c);
    paintEase();
    frameId = requestAnimationFrame(frame);
  }

  function abAt(m) {
    return S.mode === 'ab' ? (mod(m - T.abPhase, 2) ? 'b' : 'a') : S.mode;
  }

  function paintTimeline(pH, c) {
    const head = $('#tlHead');
    if (!head) return;
    if (pH == null) {
      setVar(head, 'opacity', '0');
      if (lastAB) {
        EL.abNow.textContent = '';
        lastAB = '';
      }
      return;
    }
    const C = clipAbs(pH, c),
      ct = mod(C, c.L),
      m = Math.floor(C / c.L);
    setVar(head, 'opacity', '1');
    setVar(head, 'transform', `translateX(${tlX(ct, c).toFixed(1)}px)`);
    const ab = T.rec ? 'rec' : abAt(m);
    const txt =
      ab === 'rec'
        ? '录入中：事件静音，只放节拍器'
        : ab === 'a'
          ? '正在播放：A 原始'
          : ab === 'b'
            ? '正在播放：B 吸附后'
            : ab === 'both'
              ? '正在播放：A（左）+ B（右）'
              : '';
    if (txt !== lastAB) {
      EL.abNow.textContent = txt;
      EL.abNow.dataset.ab = ab;
      lastAB = txt;
    }
    // 命中闪光：事件在本圈被播放时放大（减少动态时不闪）
    if (reduce) return;
    const em = new Map(evs().map((e) => [e.i, e]));
    const flash = (map, which) =>
      map.forEach((el, i) => {
        const e = em.get(i);
        if (!e) return;
        const t = which === 'a' ? e.t : e.snap,
          dt = mod(ct - t, c.L),
          audible = ab === which || ab === 'both';
        setVar(el, '--hit', audible && dt < 0.35 ? glow(dt, 0.12) : 0);
      });
    flash(TL.aEls, 'a');
    flash(TL.bEls, 'b');
  }

  function paintBounce(pH, c) {
    if (!BN.lanes) return;
    const list = evs().filter((e) => e.inLoop);
    const C = pH == null ? null : clipAbs(pH, c),
      ct = C == null ? 0 : mod(C, c.L),
      m = C == null ? 0 : Math.floor(C / c.L);
    const ab = T.rec ? 'rec' : abAt(m);
    const beatF = pH == null ? 1 : mod(pH - T.bar, 1),
      barBeat = pH == null ? 1 : mod(Math.floor(pH - T.bar), c.bpb);
    BN.lanes.forEach((ln) => {
      ln.g.classList.toggle(
        'live',
        pH != null && (ab === ln.w || ab === 'both'),
      );
      const lampV =
        pH == null
          ? 0
          : reduce
            ? beatF < 0.25
              ? 1
              : 0
            : glow(beatF * c.spb, 0.12);
      setVar(ln.lamp, '--glow', lampV);
      ln.lamp.classList.toggle('bar', barBeat === 0);
      const ts = list
        .map((e) => ({ t: ln.w === 'a' ? e.t : e.snap, e }))
        .sort((x, y) => x.t - y.t);
      if (pH == null || !ts.length) {
        setVar(ln.ball, 'transform', 'translateY(0px)');
        setVar(ln.ring, 'opacity', '0');
        return;
      }
      // 上一次落地与下一次落地（循环回绕）
      let prev = null,
        next = null;
      for (const x of ts) {
        if (x.t <= ct + 1e-9) prev = x;
        else if (!next) next = x;
      }
      const pT = prev ? prev.t : ts[ts.length - 1].t - c.L,
        nx = next || { t: ts[0].t + c.L, e: ts[0].e },
        pv = prev || { t: pT, e: ts[ts.length - 1].e };
      const span = Math.max(0.05, nx.t - pT),
        u = clamp((ct - pT) / span, 0, 1),
        hgt = Math.min(1, span / 0.6) * 62;
      setVar(
        ln.ball,
        'transform',
        `translateY(${reduce ? 0 : (-Math.sin(Math.PI * u) * hgt).toFixed(1)}px)`,
      );
      const since = ct - pT;
      setVar(
        ln.ring,
        'opacity',
        reduce ? (since < 0.2 ? '1' : '0') : glow(since, 0.14).toFixed(3),
      );
      setVar(
        ln.ring,
        'transform',
        `scale(${(1 + (reduce ? 0 : Math.min(1, since / 0.3) * 0.35)).toFixed(3)})`,
      );
      if (ln.last !== pv.e.i + ln.w) {
        ln.last = pv.e.i + ln.w;
        const e = pv.e,
          d = ms(e.devFull);
        const onBeat =
          ln.w === 'b' ? e.kind : Math.abs(d) <= 12 ? e.kind : null;
        ln.lab.textContent =
          ln.w === 'a'
            ? onBeat
              ? `${KIND[onBeat]} · 准`
              : `离网格 ${signed(-d)}`
            : KIND[e.kind];
        ln.pos.textContent = `位置 ${e.label}`;
        ln.lab.dataset.k = ln.w === 'a' && !onBeat ? 'miss' : e.kind;
      }
    });
  }

  function paintEase() {
    const t = easeClock();
    pvItems.forEach((it, i) => {
      const pr = reduce ? 1 : clamp((t - i * S.stag) / S.dur, 0, 1);
      if (it.box)
        setVar(
          it.box,
          'transform',
          `translateX(${(ease(pr) * pvW).toFixed(1)}px)`,
        );
      if (it.ghost)
        setVar(it.ghost, 'transform', `translateX(${(pr * pvW).toFixed(1)}px)`);
    });
    const p = reduce ? 1 : clamp(t / S.dur, 0, 1);
    EL.cvDot.setAttribute('cx', CX(p));
    EL.cvDot.setAttribute('cy', CY(ease(p)));
    EL.cvT.setAttribute('x1', CX(p));
    EL.cvT.setAttribute('x2', CX(p));
  }
  function makeSnapshot() {
    const c = clip(),
      list = evs(),
      inLoop = list.filter((event) => event.inLoop),
      outside = list.length - inLoop.length;
    const moves = inLoop.map((event) => Math.abs(ms(event.dev)));
    const duplicate = new Set(
      inLoop
        .filter((event) => event.dup > 1)
        .map((event) => event.full.toFixed(4)),
    ).size;
    const quantStats = inLoop.length
      ? inLoop.length +
        ' 个事件 · 平均移动 ' +
        Math.round(
          moves.reduce((sum, value) => sum + value, 0) / moves.length,
        ) +
        'ms · 最大 ' +
        Math.max(0, ...moves) +
        'ms' +
        (duplicate ? ' · ' + duplicate + ' 处重叠（多个事件吸到同一点）' : '') +
        (outside
          ? ' · ' + outside + ' 个超出 ' + c.L.toFixed(2) + 's 循环'
          : '')
      : outside
        ? outside + ' 个事件超出 ' + c.L.toFixed(2) + 's 循环'
        : '没有事件';
    const swingMs = (((S.swing / 100) * c.spb) / S.div / 3) * 1000;
    return {
      state: { ...S, curve: [...S.curve], lv: { ...S.lv }, ev: [...S.ev] },
      running: T.run,
      soundState: audio.state,
      soundEnabled: audio.enabled,
      recording: T.rec?.state || 'idle',
      recordingLabel,
      meterOptions: Object.keys(METERS).map((value) => ({
        value,
        label: value,
      })),
      divisionOptions: DIVS.map((value) => ({
        value: String(value),
        label: divName(value),
      })),
      kitOptions: Object.entries(KITS).map(([value, kit]) => ({
        value,
        label: kit.name,
      })),
      voiceOptions: Object.entries(EVOICES).map(([value, voice]) => ({
        value,
        label: voice.name,
      })),
      modeOptions: MODES.map(([value, label]) => ({ value, label })),
      exampleOptions: Object.entries(EXAMPLES).map(([value, example]) => ({
        value,
        label: example.name,
      })),
      example: EXAMPLES[S.example]
        ? {
            name: EXAMPLES[S.example].name,
            description: EXAMPLES[S.example].desc,
            tip: EXAMPLES[S.example].tip,
            tries: EXAMPLES[S.example].tries.map(([label]) => label),
          }
        : null,
      presets: Object.keys(PRESETS),
      swingEnabled: swingOn(),
      swingHint: swingOn()
        ? S.swing
          ? '反拍推迟 ' +
            Math.round(swingMs) +
            'ms · 长短比 ' +
            r2((1 + S.swing / 300) / (1 - S.swing / 300)) +
            ' : 1 · 相当于 MPC ' +
            Math.round(((1 + S.swing / 300) / 2) * 100) +
            '%（100% = 三连音 shuffle）'
          : '0% 为直拍；调高后每对格子的后一个被推迟，100% 时变成三连音 shuffle。'
        : '摇摆只作用于成对的格子：请选「半拍」或「十六分」细分。',
      meterHint:
        METERS[S.meter].hint +
        ' 细分：' +
        divName(S.div) +
        (S.div > 1 ? '（每拍 ' + S.div + ' 格）' : '') +
        '。',
      clipLength: c.L,
      beatMilliseconds: c.spb * 1000,
      totalMilliseconds: totalMs(),
      barMilliseconds: c.spb * c.bpb * 1000,
      quantRows: inLoop.map((event, index) => ({
        index: index + 1,
        original: event.t.toFixed(3) + 's',
        target: event.label,
        snapped: event.snap.toFixed(3) + 's',
        move: ms(event.dev) ? signed(ms(event.dev)) : '0',
        kind: KIND[event.kind] + (event.dup > 1 ? ' · 重叠' : ''),
        className:
          ms(event.dev) > 0 ? 'early' : ms(event.dev) < 0 ? 'late' : 'on',
      })),
      quantStats,
      feedback,
      tapInfo,
      taps: TAPS.slice(-16).map((tap) => ({ ...tap })),
      canCalibrate: TAPS.length >= 4,
      tapMean: TAPS.length
        ? Math.round(TAPS.reduce((sum, tap) => sum + tap.dev, 0) / TAPS.length)
        : 0,
      curveCSS:
        'cubic-bezier(' +
        S.curve.join(', ') +
        ')' +
        (S.preset ? ' · ' + S.preset : ' · 自定义'),
      replayDisabled: T.run && S.sync,
      code: exportText(S.tab),
      wavSummary:
        S.meter +
        ' · ' +
        S.bpm +
        ' BPM · ' +
        S.bars +
        ' 小节一圈（' +
        c.L.toFixed(2) +
        's）× ' +
        S.wavCycles +
        ' = ' +
        (c.L * S.wavCycles).toFixed(2) +
        's · 事件 ' +
        MODES.find(([key]) => key === S.mode)[1],
    };
  }
  function publish() {
    snapshot = makeSnapshot();
    subscribers.forEach((listener) => listener());
  }
  function invalidate(part = 'all') {
    if (dirty !== 'all') dirty = part;
  }
  function redraw() {
    const part = dirty;
    dirty = false;
    if (part === 'curve') {
      publish();
      return;
    }
    buildMetro();
    drawTL();
    drawCurve();
    if (pvItems.length !== S.count || !pvItems.length) buildPreview();
    publish();
  }
  function recordScene() {
    recordingLabel = T.rec
      ? T.rec.state === 'armed'
        ? '预备…'
        : '录入中'
      : '录入一遍';
    if (mounted) {
      $('#recProg').classList.toggle('on', Boolean(T.rec));
      tlSvg.classList.toggle('rec', Boolean(T.rec));
      if (!T.rec) $('#recProg i').style.transform = 'scaleX(0)';
      drawRecTaps();
    }
    publish();
  }
  function recStep(C, c) {
    const recording = T.rec;
    if (!recording) return;
    if (recording.state === 'armed' && C >= recording.start - 0.1)
      recording.state = 'on';
    if (recording.state === 'on' && C >= recording.start + c.L - 0.1) {
      finishRec();
      return;
    }
    const progress =
      recording.state === 'on' ? clamp((C - recording.start) / c.L, 0, 1) : 0;
    $('#recProg i').style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    const label =
      recording.state === 'armed'
        ? '预备 ' + Math.max(1, Math.ceil((recording.start - C) / c.spb)) + '…'
        : '录入中 ' + Math.round(progress * 100) + '%';
    if (recordingLabel !== label) {
      recordingLabel = label;
      publish();
    }
  }
  function tapTempo(stamp) {
    if (S.sound && !audio.enabled) audio.enable();
    if (tapT.length && stamp - tapT[tapT.length - 1] > 2000) tapT.length = 0;
    tapT.push(stamp);
    if (tapT.length > 8) tapT.shift();
    if (live()) audio.play('click', { f: 2600, vel: 0.8, gain: S.vol / 100 });
    if (tapT.length < 2) {
      tapInfo = '继续敲…';
      publish();
      return;
    }
    const intervals = tapT.slice(1).map((time, index) => time - tapT[index]),
      sorted = intervals.slice().sort((a, b) => a - b),
      median = sorted[sorted.length >> 1];
    const good = intervals.filter(
        (value) => Math.abs(value - median) <= median * 0.25,
      ),
      average = good.reduce((sum, value) => sum + value, 0) / good.length;
    update({ bpm: 60000 / average });
    tapInfo = tapT.length + ' 下 · ' + S.bpm + ' BPM';
    publish();
  }
  function padTap(stamp) {
    if (S.sound && !audio.enabled) audio.enable();
    const voice = EVOICES[S.evVoice];
    if (live()) audio.play(voice.v, { ...voice.p, gain: (S.vol / 100) * 0.85 });
    if (!T.run) {
      feedback = { text: '先点击“播放”，再跟着节拍器敲击。', cls: '' };
      publish();
      return;
    }
    const c = clip(),
      time = tapClock(stamp) - S.lat / 1000,
      position = beatAt(time),
      x = position - T.bar,
      target = snapX(x),
      deviation = Math.round((x - target.p) * c.spb * 1000);
    const C = clipAbs(position, c),
      [word, className] = judge(deviation);
    TAPS.push({ dev: deviation, cls: className });
    if (TAPS.length > 24) TAPS.shift();
    if (T.rec && (T.rec.state === 'on' || C >= T.rec.start - 0.12)) {
      T.rec.state = 'on';
      T.rec.taps.push(C - T.rec.start);
      drawRecTaps();
    }
    feedback = {
      text:
        signed(deviation) +
        ' · ' +
        word +
        '（' +
        posLabel(target, c) +
        ' ' +
        KIND[kindOf(target.n, target.k, c)] +
        '）',
      cls: className,
    };
    publish();
    return { dev: deviation, pos: position, clip: mod(C, c.L) };
  }
  function updateConfiguration(patch) {
    update(patch);
    if (
      mounted &&
      ['count', 'dist', 'trail', 'ghost'].some((key) => key in patch)
    )
      buildPreview();
    publish();
  }
  function keyboard(event) {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.target.closest('input,textarea,select,[contenteditable]')
    )
      return;
    const key = event.key.toLowerCase();
    if (event.key === ' ' || event.code === 'Space') {
      if (event.target.closest('button,a,summary')) return;
      event.preventDefault();
      if (!event.repeat) togglePlay();
    } else if (key === 't' && !event.repeat) tapTempo(event.timeStamp);
    else if (key === 'j' && !event.repeat) {
      event.preventDefault();
      padTap(event.timeStamp);
    } else if (key === 'r' && !event.repeat) recToggle();
    else if (key === 'a' && !event.repeat) update({ mode: 'a' });
    else if (key === 'b' && !event.repeat) update({ mode: 'b' });
    else if (key === 'x' && !event.repeat) update({ mode: 'ab' });
  }
  publish();
  return {
    subscribe(listener) {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    getSnapshot: () => snapshot,
    mount(element) {
      root = element;
      mounted = true;
      tlSvg = $('#tl');
      curveSvg = $('#curve');
      EL = {
        pos: $('#pos'),
        ball: $('#mBall'),
        count: $('#mCount'),
        read: $('#mRead'),
        abNow: $('#abNow'),
        cvDot: $('#cvDot'),
        cvT: $('#cvT'),
      };
      listen(tlSvg, 'pointerdown', (e) => {
        const c = clip(),
          a = e.target.closest('.tl-a');
        let i;
        if (a) i = +a.dataset.i;
        else if (e.target.classList.contains('tl-hitA')) {
          S.ev.push(r3(clamp(tlT(svgX(e), c), 0, c.L - 0.001)));
          i = S.ev.length - 1;
          S.example = '';
          resched();
          save();
        } else return;
        e.preventDefault();
        TL.drag = { i, id: e.pointerId };
        TL.focus = i;
        tlSvg.setPointerCapture(e.pointerId);
        drawTL();
        invalidate();
      });
      listen(tlSvg, 'pointermove', (e) => {
        if (!TL.drag || e.pointerId !== TL.drag.id) return;
        const c = clip();
        S.ev[TL.drag.i] = r3(clamp(tlT(svgX(e), c), 0, c.L - 0.001));
        resched();
        invalidate();
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) =>
        listen(tlSvg, t, endDrag),
      );
      listen(tlSvg, 'focusin', (e) => {
        const a = e.target.closest('.tl-a');
        if (a) TL.focus = +a.dataset.i;
      });
      listen(tlSvg, 'focusout', () => {
        if (!TL.drag)
          setTimeout(() => {
            if (!tlSvg.contains(document.activeElement)) TL.focus = null;
          }, 0);
      });
      listen(tlSvg, 'keydown', (e) => {
        const a = e.target.closest('.tl-a');
        if (!a) return;
        const i = +a.dataset.i,
          c = clip();
        const d = e.shiftKey ? 0.001 : e.altKey ? 0.1 : 0.01;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown')
          S.ev[i] = r3(clamp(S.ev[i] - d, 0, c.L - 0.001));
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp')
          S.ev[i] = r3(clamp(S.ev[i] + d, 0, c.L - 0.001));
        else if (e.key === 'Delete' || e.key === 'Backspace') {
          S.ev.splice(i, 1);
          TL.focus = Math.min(i, S.ev.length - 1);
          if (TL.focus < 0) TL.focus = null;
        } else return;
        e.preventDefault();
        e.stopPropagation();
        if (e.key.startsWith('Arrow')) {
          const v = S.ev[i];
          S.ev.sort((x, y) => x - y);
          TL.focus = S.ev.indexOf(v);
        }
        S.example = '';
        resched();
        save();
        invalidate();
      });
      $('#cvGrid').setAttribute(
        'd',
        [1, 2, 3].map((i) => `M${i * 75} 0V300M0 ${i * 75}H300`).join(''),
      );
      [
        ['#p1', 0],
        ['#p2', 2],
      ].forEach(([sel, o]) => {
        const el = $(sel);
        listen(el, 'pointerdown', (e) => {
          e.preventDefault();
          curveDrag = o;
          curveSvg.setPointerCapture(e.pointerId);
          el.focus({ preventScroll: true });
        });
        listen(el, 'keydown', (e) => {
          const d = e.shiftKey ? 0.1 : 0.01,
            cv = S.curve.slice();
          if (e.key === 'ArrowLeft') cv[o] -= d;
          else if (e.key === 'ArrowRight') cv[o] += d;
          else if (e.key === 'ArrowUp') cv[o + 1] += d;
          else if (e.key === 'ArrowDown') cv[o + 1] -= d;
          else return;
          e.preventDefault();
          setCurve(cv);
        });
      });
      listen(curveSvg, 'pointermove', (e) => {
        if (curveDrag === null) return;
        const [x, y] = toVal(e),
          cv = S.curve.slice();
        cv[curveDrag] = x;
        cv[curveDrag + 1] = y;
        setCurve(cv);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) =>
        listen(curveSvg, t, endCurve),
      );
      audioUnsubscribe = audio.on('change', () => {
        syncSrc();
        publish();
      });
      listen(window, 'keydown', keyboard);
      listen(mq, 'change', () => {
        reduce = mq.matches;
        buildPreview();
      });
      listen(document, 'visibilitychange', () => {
        if (!document.hidden) tick();
      });
      observer = new ResizeObserver(() => {
        measureMetro();
        drawTL();
        drawBounce();
        buildPreview();
      });
      [$('#tlBox'), $('#bounce'), $('#mBar'), $('#preview')].forEach((node) =>
        observer.observe(node),
      );
      drawCurve();
      fitView();
      drawBounce();
      redraw();
      buildPreview();
      publish();
      tickTimer = setInterval(tick, 25);
      frameId = requestAnimationFrame(frame);
    },
    destroy() {
      stop();
      clearInterval(tickTimer);
      cancelAnimationFrame(frameId);
      clearTimeout(saveT);
      observer?.disconnect();
      audioUnsubscribe?.();
      cleanups.splice(0).forEach((remove) => remove());
      store.set('ma-lab', S);
      audio.disable();
      mounted = false;
      root = null;
    },
    update: updateConfiguration,
    togglePlay,
    toggleSound() {
      if (audio.enabled) {
        audio.disable();
        S.sound = false;
      } else {
        S.sound = true;
        audio.enable();
      }
      save();
      syncSrc();
      publish();
    },
    tapTempo,
    padTap,
    record: recToggle,
    chooseKit(value) {
      update({ kit: value });
      preview(value);
    },
    setCurve,
    preset(value) {
      setCurve(PRESETS[value], value);
      restartFree();
    },
    replay() {
      restartFree();
      playCuesNow();
    },
    tryExample(index) {
      const example = EXAMPLES[S.example];
      if (example) update(example.tries[index][1]);
    },
    setEvents(value) {
      S.ev = parseEv(value).sort((a, b) => a - b);
      S.example = '';
      resched();
      save();
      invalidate();
      publish();
    },
    clearEvents() {
      S.ev = [];
      S.example = '';
      resched();
      save();
      invalidate();
      publish();
    },
    applySnap() {
      const count = evs().filter((event) => Math.abs(event.dev) > 5e-4).length;
      S.ev = evs()
        .map((event) => r3(event.snap))
        .sort((a, b) => a - b);
      S.example = '';
      resched();
      save();
      invalidate();
      publish();
      toast(
        count
          ? '已把 ' + count + ' 个事件改为吸附后的时刻'
          : '事件已经都在网格上',
      );
    },
    calibrate() {
      if (TAPS.length < 4) return;
      S.lat = clamp(
        Math.round(
          S.lat + TAPS.reduce((sum, tap) => sum + tap.dev, 0) / TAPS.length,
        ),
        -150,
        150,
      );
      TAPS.length = 0;
      save();
      publish();
      toast('延迟补偿设为 ' + signed(S.lat));
    },
    snapTiming(part, fraction) {
      const c = clip();
      part === 'dur'
        ? update({
            dur: clamp(
              Math.round((fraction * c.spb * 1000) / 10) * 10,
              80,
              2000,
            ),
          })
        : update({
            stag: clamp(Math.round(((c.spb / S.div) * 1000) / 5) * 5, 0, 300),
          });
      restartFree();
    },
    renderWav: () => renderWav(S.wavCycles),
  };
}
