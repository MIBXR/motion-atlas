/*!
 * Motion Kit v1 · Motion Atlas
 * 无依赖的确定性动效工具：时间轴 seek、缓动、节拍、文字揭示、可选合成音效与控制条。
 * 复制本文件到页面旁边即可使用：<script src="motion-kit.js"></script>
 * 约定：时间驱动的作品把画面写成 render(t) 纯函数，并通过 MotionKit.expose() 暴露 window.__motion，
 *       站点刻度条与 scripts/render.mjs 逐帧渲染都依赖这个协议。
 */
(function (global) {
  'use strict';

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const invLerp = (a, b, v) => (a === b ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a)));

  // CSS cubic-bezier 的 JS 实现（牛顿迭代 + 二分兜底）
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const err = sx(t) - x;
        if (Math.abs(err) < 1e-5) return sy(t);
        const d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= err / d;
      }
      let lo = 0, hi = 1;
      t = x;
      for (let i = 0; i < 24; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-5) break;
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }

  const ease = {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
    inOutQuart: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
    inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutExpo: (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
    outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    // 命名动效 Token：与 docs/rhythm.md 对应
    snap: bezier(0.2, 0.9, 0.1, 1), // 机械吸附：快进、硬停
    glide: bezier(0.25, 0.1, 0.25, 1), // 平滑滑行
    emphasized: bezier(0.2, 0, 0, 1), // 强调进入
    exit: bezier(0.4, 0, 1, 1), // 快速离场
    anticipate: bezier(0.36, 0, 0.66, -0.56), // 先回拉再出发
  };

  /** 片段进度：t 落在 [start, start+dur] 内时 0→1，并套用缓动 */
  function seg(t, start, dur, e = ease.outCubic) {
    return e(clamp((t - start) / Math.max(dur, 1e-6)));
  }

  /** 入—停—出包络：a 开始进入，b 开始离开 */
  function env(t, a, b, inDur = 0.4, outDur = 0.3, ei = ease.outCubic, eo = ease.inCubic) {
    if (t < a) return 0;
    if (t < a + inDur) return ei((t - a) / inDur);
    if (t < b) return 1;
    if (t < b + outDur) return 1 - eo((t - b) / outDur);
    return 0;
  }

  /** 关键帧插值：frames = [{t, ...numbers}]，返回对应时刻的数值对象 */
  function keyframes(frames, t, e = ease.inOutCubic) {
    if (t <= frames[0].t) return { ...frames[0] };
    const last = frames[frames.length - 1];
    if (t >= last.t) return { ...last };
    let i = 0;
    while (i < frames.length - 2 && t > frames[i + 1].t) i++;
    const a = frames[i], b = frames[i + 1];
    const p = (b.ease || e)(invLerp(a.t, b.t, t));
    const out = { t };
    for (const k in b) {
      if (k === 't' || k === 'ease') continue;
      const va = a[k], vb = b[k];
      if (Array.isArray(vb)) out[k] = vb.map((v, j) => lerp(va[j], v, p));
      else if (typeof vb === 'number') out[k] = lerp(va, vb, p);
      else out[k] = p < 1 ? va : vb;
    }
    return out;
  }

  /** 可复现随机数（mulberry32） */
  function rng(seed = 1) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const chars = (s) => Array.from(String(s));

  /** 打字：按进度返回已出现的字符串（按 Unicode 字符计） */
  function typeText(text, p) {
    const c = chars(text);
    return c.slice(0, Math.round(clamp(p) * c.length)).join('');
  }

  /**
   * 字符解码：未解出的字符用字符集随机替换；tick 决定随机帧，保证同一时刻结果一致。
   * 返回 [{ch, done}]，便于给已解出字符和噪声字符不同样式。
   */
  function scramble(text, p, tick = 0, seed = 7, set = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/%+=<>') {
    const c = chars(text);
    const r = rng(seed);
    const thresholds = c.map((_, i) => (i / c.length) * 0.7 + r() * 0.3);
    return c.map((ch, i) => {
      if (ch === ' ' || p >= thresholds[i]) return { ch, done: true };
      const rr = rng(seed * 131 + i * 17 + tick * 7919);
      return { ch: set[Math.floor(rr() * set.length)], done: false };
    });
  }

  /** 计数：from→to 按进度插值并格式化 */
  function count(from, to, p, decimals = 0) {
    const v = lerp(from, to, clamp(p));
    return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  const pad = (n, len = 2) => String(Math.floor(n)).padStart(len, '0');

  /** 节拍：bpm 与起点 offset（秒） */
  function beats(bpm, offset = 0) {
    const spb = 60 / bpm;
    return {
      bpm,
      spb,
      at: (beat) => offset + beat * spb,
      beatOf: (t) => (t - offset) / spb,
      /** 每拍起点为 1、随后指数衰减的脉冲，用于闪光、缩放冲击 */
      pulse(t, decay = 6, every = 1) {
        const b = (t - offset) / (spb * every);
        if (b < 0) return 0;
        return Math.exp(-(b - Math.floor(b)) * decay);
      },
      /** 把时刻吸附到最近的拍点 */
      quantize: (t, div = 1) => offset + Math.round((t - offset) / (spb / div)) * (spb / div),
    };
  }

  /**
   * 时间轴：render(t) 必须只依赖 t。返回控制器：play/pause/seek/on。
   * seek 返回 Promise，render 可返回 Promise（如等待地图瓦片）以便逐帧渲染。
   * duration 可在运行时修改（如改变 BPM 后重算长度）。
   */
  function timeline({ duration, render, loop = false, markers = [], fps = 60 }) {
    let t = 0, playing = false, last = 0, raf = 0, rate = 1;
    const listeners = new Set();
    const draw = () => {
      const r = render(t);
      listeners.forEach((fn) => fn(t, playing));
      return r;
    };
    const frame = (now) => {
      if (!playing) return;
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      t += dt * rate;
      if (t >= api.duration) {
        if (loop) t %= api.duration;
        else { t = api.duration; playing = false; }
      }
      try { draw(); } catch (err) { console.error(err); }
      if (playing) raf = requestAnimationFrame(frame);
    };
    const api = {
      duration, fps, markers,
      get time() { return t; },
      get playing() { return playing; },
      get rate() { return rate; },
      setRate(r) { rate = r; },
      play() {
        if (playing) return;
        if (t >= api.duration) t = 0;
        playing = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
        listeners.forEach((fn) => fn(t, playing));
      },
      pause() {
        playing = false;
        cancelAnimationFrame(raf);
        draw();
      },
      toggle() { playing ? api.pause() : api.play(); },
      seek(time) {
        t = clamp(time, 0, api.duration);
        return Promise.resolve(draw()).then(() => t);
      },
      on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    };
    return api;
  }

  /** 读取 URL 参数：?embed（站内嵌入）、?render（逐帧渲染）、?t=秒、?autoplay=0 */
  function params() {
    const q = new URLSearchParams(location.search);
    return {
      embed: q.has('embed'),
      render: q.has('render'),
      t: q.has('t') ? Number(q.get('t')) : null,
      autoplay: q.get('autoplay') !== '0' && !q.has('render'),
      theme: q.get('theme'),
    };
  }

  const prefersReducedMotion = () => global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** 暴露给站点刻度条与渲染脚本 */
  function expose(tl, meta = {}) {
    global.__motion = tl;
    Object.assign(tl, meta);
    document.documentElement.dataset.motionReady = '1';
    try { global.parent !== global && global.parent.postMessage({ type: 'motion:ready', duration: tl.duration }, '*'); } catch (e) { /* 跨源忽略 */ }
    return tl;
  }

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    restart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.05-4.95M5 4.5V9h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };

  const fmt = (s) => `${pad(s / 60)}:${pad(s % 60)}.${pad((s % 1) * 100)}`;

  /**
   * 控制条：播放/暂停、重播、刻度、时间、可选声音开关。
   * 嵌入（?embed）与渲染（?render）模式不创建；键盘：空格播放，←/→ 跳 1 秒，Shift+←/→ 跳到上/下一个标记。
   */
  function controls(tl, { sound = null, accent = '#ff5b2e' } = {}) {
    const p = params();
    const keys = (e) => {
      if (e.target.closest && e.target.closest('input, textarea, select')) return;
      if (e.code === 'Space') { e.preventDefault(); tl.toggle(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        if (e.shiftKey && tl.markers.length) {
          const ts = tl.markers.map((m) => m.t).sort((a, b) => a - b);
          const next = dir > 0 ? ts.find((v) => v > tl.time + 0.05) : [...ts].reverse().find((v) => v < tl.time - 0.05);
          if (next != null) tl.seek(next);
        } else tl.seek(tl.time + dir);
      } else if (e.key === 'Home') tl.seek(0);
    };
    global.addEventListener('keydown', keys);
    if (p.embed || p.render) return null;

    const bar = document.createElement('div');
    bar.className = 'mk-controls';
    bar.innerHTML = `
      <button type="button" data-act="toggle" aria-label="播放">${ICON.play}</button>
      <button type="button" data-act="restart" aria-label="从头播放">${ICON.restart}</button>
      <input type="range" min="0" max="${tl.duration}" step="0.01" value="0" aria-label="时间">
      <output>${fmt(0)}</output>
      ${sound ? `<button type="button" data-act="sound" aria-label="开启声音" aria-pressed="false">${ICON.soundOff}</button>` : ''}`;
    const style = document.createElement('style');
    style.textContent = `
      .mk-controls{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:8px;
        padding:6px 10px;border-radius:999px;background:rgba(14,15,18,.72);color:#f1efe9;backdrop-filter:blur(10px);
        font:12px/1 "Cascadia Mono","JetBrains Mono",Consolas,monospace;box-shadow:0 8px 30px rgba(0,0,0,.25);opacity:.25;transition:opacity .2s}
      .mk-controls:hover,.mk-controls:focus-within{opacity:1}
      .mk-controls button{all:unset;cursor:pointer;width:28px;height:28px;display:grid;place-items:center;border-radius:50%}
      .mk-controls button:focus-visible{outline:2px solid ${accent};outline-offset:1px}
      .mk-controls button:hover{background:rgba(255,255,255,.12)}
      .mk-controls svg{width:18px;height:18px}
      .mk-controls input{width:min(42vw,360px);accent-color:${accent}}
      .mk-controls output{min-width:72px;font-variant-numeric:tabular-nums}`;
    document.head.appendChild(style);
    document.body.appendChild(bar);
    const btn = bar.querySelector('[data-act="toggle"]');
    const range = bar.querySelector('input');
    const out = bar.querySelector('output');
    let scrubbing = false, wasPlaying = false;
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.act === 'toggle') tl.toggle();
      if (b.dataset.act === 'restart') { tl.seek(0); tl.play(); }
      if (b.dataset.act === 'sound' && sound) {
        sound.toggle();
        b.innerHTML = sound.enabled ? ICON.soundOn : ICON.soundOff;
        b.setAttribute('aria-pressed', String(sound.enabled));
        b.setAttribute('aria-label', sound.enabled ? '关闭声音' : '开启声音');
      }
    });
    range.addEventListener('pointerdown', () => { scrubbing = true; wasPlaying = tl.playing; tl.pause(); });
    range.addEventListener('input', () => tl.seek(Number(range.value)));
    range.addEventListener('change', () => { scrubbing = false; if (wasPlaying) tl.play(); });
    tl.on((t, playing) => {
      if (!scrubbing) range.value = t;
      out.textContent = fmt(t);
      btn.innerHTML = playing ? ICON.pause : ICON.play;
      btn.setAttribute('aria-label', playing ? '暂停' : '播放');
    });
    return bar;
  }

  /**
   * 可选合成音效（默认关闭，必须由用户手势开启）。
   * tone({f, d, type, g, slide}) 合成短音；noise({d, g, lp, hp}) 噪声；页面隐藏时自动静音。
   */
  function sound() {
    let ctx = null, master = null, enabled = false;
    const ensure = () => {
      if (!ctx) {
        const AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && enabled) api.disable();
    });
    const api = {
      get enabled() { return enabled; },
      get ctx() { return ctx; },
      enable() { if (ensure()) enabled = true; },
      disable() { enabled = false; if (ctx) ctx.suspend(); },
      toggle() { enabled ? api.disable() : api.enable(); },
      tone({ f = 880, d = 0.08, type = 'sine', g = 0.2, slide = 0, delay = 0, attack = 0.004 } = {}) {
        if (!enabled || !ensure()) return;
        const t0 = ctx.currentTime + delay;
        const o = ctx.createOscillator(), v = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f, t0);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t0 + d);
        v.gain.setValueAtTime(0.0001, t0);
        v.gain.exponentialRampToValueAtTime(g, t0 + attack);
        v.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        o.connect(v).connect(master);
        o.start(t0);
        o.stop(t0 + d + 0.02);
      },
      noise({ d = 0.12, g = 0.15, lp = 8000, hp = 200, delay = 0 } = {}) {
        if (!enabled || !ensure()) return;
        const t0 = ctx.currentTime + delay;
        const len = Math.ceil(ctx.sampleRate * d);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const l = ctx.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = lp;
        const h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp;
        const v = ctx.createGain(); v.gain.value = g;
        src.connect(h).connect(l).connect(v).connect(master);
        src.start(t0);
      },
    };
    return api;
  }

  /** 实时补间（交互型作品使用）；返回 cancel() */
  function tween({ from = 0, to = 1, duration = 0.4, delay = 0, ease: e = ease.outCubic, onUpdate, onDone } = {}) {
    let raf = 0, start = 0, cancelled = false;
    const reduce = prefersReducedMotion();
    const step = (now) => {
      if (cancelled) return;
      if (!start) start = now + delay * 1000;
      const p = reduce ? 1 : clamp((now - start) / (duration * 1000));
      if (now >= start) onUpdate && onUpdate(lerp(from, to, e(p)), p);
      if (p < 1) raf = requestAnimationFrame(step);
      else onDone && onDone();
    };
    raf = requestAnimationFrame(step);
    return { cancel() { cancelled = true; cancelAnimationFrame(raf); } };
  }

  /**
   * 临界阻尼跟随：保留速度，可在途中改目标（适合可打断的抬起、轨道、镜头）。
   * f = follow(0, 8); 每帧 f.step(dt)；f.target = 1。
   */
  function follow(value = 0, rate = 8) {
    let v = 0;
    return {
      value, target: value, rate,
      step(dt) {
        const w = this.rate, x = this.value - this.target;
        const e = Math.exp(-w * dt);
        const nx = (x + (v + w * x) * dt) * e;
        v = (v - (v + w * x) * w * dt) * e;
        this.value = this.target + nx;
        return this.value;
      },
      snap(to) { this.value = this.target = to; v = 0; },
      get velocity() { return v; },
    };
  }

  global.MotionKit = {
    version: '1.0.0',
    clamp, lerp, invLerp, bezier, ease, seg, env, keyframes, rng, chars, typeText, scramble, count, pad, beats,
    timeline, params, prefersReducedMotion, expose, controls, sound, tween, follow, icons: ICON,
  };
})(typeof window !== 'undefined' ? window : globalThis);
