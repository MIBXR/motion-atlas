/*
 * 舞台模板 · 渲染器（9 个案例迁移的起点）
 * 约定（逐条对应 docs/pipeline.md）：
 *  1. 舞台：MotionKit.stage() 把 #stage 固定为 1920×1080 / 1080×1920 并整体等比缩放（四周黑边）。
 *     内部一律用舞台像素；画幅切换时 stage 先触发 'orient'（这里重建几何），kit 再重新 render 当前时刻。
 *  2. 画面：render(t) 只依赖 t；随机数用 MotionKit.rng 按 t 派生。几何（圆环、刻度、节点、引线、标签锚点）
 *     全部由同一个 polar() 计算并取整到像素，端点与圆心严格重合。
 *  3. 声音：SCORE = 节拍底（pattern 生成器）+ 事件音（与画面读同一张节拍表）。MotionKit.audio.attach() 负责
 *     前瞻调度、暂停 / 拖动 / 画幅切换时立即停止并从新位置继续；render.mjs --audio 用同一份乐谱离线导出 WAV。
 *  4. 预加载：MotionKit.preload() 登记资源；__motion.ready 在资源就绪后 resolve，MotionKit.start() 等它再自动播放。
 *  5. 控制条：MotionKit.controls() 只在独立打开时出现（?embed / ?render 不显示），含画幅与声音开关。
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG;
  const { clamp, lerp, seg, ease } = MK;
  const $ = (s) => document.querySelector(s);
  const BT = MK.beats(C.bpm);
  const B = C.beats;
  const at = (beat) => BT.at(beat); // 拍 → 秒
  const DURATION = at(B.total);

  /* ---------- 1. 舞台 ---------- */
  const stage = MK.stage({ root: '#stage' });

  /* ---------- 2. 预加载 ---------- */
  // 自定义任务示范：任何返回 Promise 的函数都可以（地图类 Demo 在这里按相机关键帧预取瓦片）
  function makeGrain() {
    return new Promise((resolve) => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 256;
      const g = cv.getContext('2d'), img = g.createImageData(256, 256), r = MK.rng(42);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.floor(r() * 256);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      resolve(cv.toDataURL('image/png'));
    });
  }
  MK.preload([
    MK.preload.fonts(),
    MK.preload.image(C.mark),
    { label: '颗粒纹理', run: makeGrain },
  ]).then(([, mark, grain]) => {
    if (mark) $('#mark').src = mark.src;
    if (grain) $('#grain').style.backgroundImage = `url(${grain})`;
  });

  /* ---------- 3. 静态内容（只写一次） ---------- */
  $('#kicker').innerHTML = '<span id="kt"></span><i class="caret"></i>';
  const kt = $('#kt'), caret = $('#kicker .caret');
  $('#title').innerHTML = MK.chars(C.title).map((c) => `<span>${c}</span>`).join('');
  const titleChars = [...$('#title').children];
  $('#sub').innerHTML = C.subtitle.map((s) => `<b>${s}</b>`).join('');
  $('#labels').innerHTML = C.items.map((it) => `<div class="label"><b>${it.cn}</b><small>${it.en}</small></div>`).join('');
  const labels = [...document.querySelectorAll('#labels .label')];
  $('#ecTitle').textContent = C.end.title;
  $('#ecEn').textContent = C.end.en;
  $('#ecStamp').textContent = C.end.stamp;
  const corners = [...document.querySelectorAll('.hud .corner')];
  const readout = $('#readout'), rdNum = $('#rdNum');
  const squares = [...document.querySelectorAll('#sq i')];
  const els = { bg: $('.bg'), gfx: $('#gfx'), txt: $('.txt'), sub: $('#sub'), brand: $('.hud .brand'), tc: $('#tc'), fmt: $('#fmt'), wipe: $('#wipe'), end: $('#endcard'), ecTitle: $('#ecTitle'), ecEn: $('#ecEn'), stamp: $('#ecStamp'), grain: $('#grain') };

  /* ---------- 4. 几何：同一个 polar() 计算所有点 ---------- */
  // 角度 0° 指向正上方、顺时针为正；坐标取整到像素（2px 描边落在像素网格上，不发虚）
  const polar = (cx, cy, r, deg) => {
    const a = (deg * Math.PI) / 180;
    return { x: Math.round(cx + r * Math.sin(a)), y: Math.round(cy - r * Math.cos(a)) };
  };
  let L = null;
  const G = {};
  // 引线：横屏先沿半径外伸再水平拉到 labelX；竖屏垂直落到 labelY。标签锚点 = 引线终点（衬底外缘）
  function leader(i) {
    const { cx, cy, r } = L.ring, deg = L.nodes[i], P = polar(cx, cy, r, deg);
    let pts, anchor, base;
    if (L.leader === 'h') {
      const E = polar(cx, cy, r + L.elbow, deg);
      pts = [P, E, { x: L.labelX, y: E.y }];
      anchor = { x: L.labelX, y: E.y };
      base = 'translateY(-50%)';
    } else {
      pts = [P, { x: P.x, y: L.labelY }];
      anchor = { x: P.x, y: L.labelY };
      base = 'translateX(-50%)';
    }
    let len = 0;
    for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
    return { P, d: pts.map((p, k) => `${k ? 'L' : 'M'}${p.x} ${p.y}`).join(' '), len, anchor, base };
  }
  /** 按画幅重建几何（创建时与每次切换画幅时调用；随后 kit 会重新 render 当前时刻） */
  function layout(orient) {
    L = C.layout[orient];
    const W = stage.width, H = stage.height, { cx, cy, r } = L.ring;
    const svg = els.gfx;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    G.leaders = C.items.map((_, i) => leader(i));
    let s = `<circle class="ring-base" cx="${cx}" cy="${cy}" r="${r}"/>`;
    s += `<circle class="glow" cx="${cx}" cy="${cy}" r="${r + 22}"/>`;
    for (let i = 0; i < L.ticks; i++) {
      const deg = (i * 360) / L.ticks, major = i % 6 === 0;
      const a = polar(cx, cy, r - (major ? 34 : 16), deg), b = polar(cx, cy, r - 6, deg);
      s += `<line class="tick${major ? ' major' : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    }
    s += `<circle class="ring-draw" cx="${cx}" cy="${cy}" r="${r}" transform="rotate(-90 ${cx} ${cy})"/>`;
    G.leaders.forEach((ld) => { s += `<path class="leader" d="${ld.d}"/>`; });
    G.leaders.forEach((ld) => { s += `<g class="node-g"><circle class="node" cx="${ld.P.x}" cy="${ld.P.y}" r="13"/><circle class="node-core" cx="${ld.P.x}" cy="${ld.P.y}" r="5"/></g>`; });
    s += '<path class="marker" d="M0 -16 L11 6 L-11 6 Z"/>';
    svg.innerHTML = s;
    G.ring = svg.querySelector('.ring-draw');
    G.glow = svg.querySelector('.glow');
    G.ticks = [...svg.querySelectorAll('.tick')].map((el, i) => ({ el, deg: (i * 360) / L.ticks }));
    G.ld = [...svg.querySelectorAll('.leader')];
    G.nd = [...svg.querySelectorAll('.node-g')];
    G.marker = svg.querySelector('.marker');
    G.circ = 2 * Math.PI * r;
    G.ring.style.strokeDasharray = `${G.circ} ${G.circ}`;
    G.ld.forEach((el, i) => { el.style.strokeDasharray = `${G.leaders[i].len} ${G.leaders[i].len}`; });
    labels.forEach((el, i) => {
      const a = G.leaders[i].anchor;
      el.style.left = a.x + 'px';
      el.style.top = a.y + 'px';
    });
    // 圆心读数：HTML 元素的锚点同样来自 L.ring，与 SVG 圆心重合
    readout.style.left = cx + 'px';
    readout.style.top = cy + 'px';
    els.fmt.textContent = orient === 'portrait' ? 'PORTRAIT 1080 × 1920' : 'LANDSCAPE 1920 × 1080';
  }
  layout(stage.orient);
  stage.on('orient', layout);

  /* ---------- 5. 画面：render(t) ---------- */
  const KICK = { from: at(B.kicker), dur: at(B.ring) + 0.3 - at(B.kicker) };
  const fmtTC = (s) => `${MK.pad(s / 60)}:${MK.pad(s % 60)}.${MK.pad((s % 1) * 100)}`;
  function render(t) {
    const beat = BT.beatOf(t);
    const { cx, cy, r } = L.ring;

    // 背景与 HUD 入场
    els.bg.style.opacity = lerp(0.25, 1, seg(t, 0, 1, ease.outCubic));
    corners.forEach((c, i) => {
      const p = seg(t, 0.12 + i * 0.08, 0.35, ease.snap);
      c.style.opacity = p;
      c.style.transform = `scale(${lerp(1.8, 1, p)})`;
    });
    els.brand.style.opacity = seg(t, 0.3, 0.4);
    els.fmt.style.opacity = seg(t, 0.45, 0.4);
    els.tc.textContent = fmtTC(t);
    const live = t >= at(B.drop) && t < at(B.outro);
    squares.forEach((q, i) => q.classList.toggle('on', live && Math.floor(beat) % 4 === i));

    // 冲击抖动：图形层与文字层同步位移，引线与标签保持对齐
    const sinceDrop = t - at(B.drop);
    const k = sinceDrop >= 0 ? Math.exp(-sinceDrop * 16) : 0;
    const rr = MK.rng(1 + Math.floor(t * 60));
    const shake = k > 0.01 ? `translate(${((rr() - 0.5) * 28 * k).toFixed(1)}px, ${((rr() - 0.5) * 20 * k).toFixed(1)}px)` : '';
    els.gfx.style.transform = shake;
    els.txt.style.transform = shake;

    // 打字：与乐谱的 tick 用同一个进度函数（见 SCORE）
    const kp = seg(t, KICK.from, KICK.dur, ease.linear);
    kt.textContent = MK.typeText(C.kicker, kp);
    // 注意：子元素显式 visibility: visible 会盖过父层的 hidden，所以闪烁用 opacity
    caret.style.opacity = t >= KICK.from && (kp < 1 || Math.floor(t * 4) % 2 === 0) ? '1' : '0';

    // 圆环描绘与刻度点亮
    const rp = seg(t, at(B.ring), at(B.drop) - at(B.ring), ease.inOutCubic);
    G.ring.style.strokeDashoffset = String(G.circ * (1 - rp));
    for (const tk of G.ticks) tk.el.style.opacity = clamp((rp * 360 - tk.deg) / 24);

    // 标题：落点逐字砸入（outBack 过冲）
    titleChars.forEach((el, i) => {
      const t0 = at(B.drop) - 0.03 + i * 0.05;
      const p = seg(t, t0, 0.42, ease.outBack);
      el.style.opacity = clamp((t - t0) / 0.06);
      el.style.transform = `translateY(${((1 - p) * 90).toFixed(1)}px) scale(${lerp(1.5, 1, clamp(p)).toFixed(3)})`;
    });

    // 副标题
    const sp = seg(t, at(B.sub), 0.6, ease.emphasized);
    els.sub.style.opacity = sp;
    els.sub.style.transform = `translateX(${((1 - sp) * -40).toFixed(1)}px)`;

    // 节点 → 引线 → 标签
    C.items.forEach((_, i) => {
      const t0 = at(B.items[i]);
      const np = seg(t, t0, 0.35, ease.outBack);
      G.nd[i].style.opacity = clamp((t - t0) / 0.05);
      G.nd[i].style.transform = `scale(${np.toFixed(3)})`;
      const lp = seg(t, t0 + 0.08, 0.32, ease.outCubic);
      G.ld[i].style.strokeDashoffset = String(G.leaders[i].len * (1 - lp));
      const bp = seg(t, t0 + 0.3, 0.35, ease.emphasized);
      labels[i].style.opacity = bp;
      labels[i].style.clipPath = `inset(0 ${((1 - bp) * 100).toFixed(2)}% 0 0)`;
      labels[i].style.transform = G.leaders[i].base;
    });

    // 节拍脉冲光环与圆心读数（落点之后）
    const pulse = live ? BT.pulse(t, 7) : 0;
    const rd = seg(t, at(B.drop) + 0.2, 0.4, ease.emphasized);
    readout.style.opacity = rd;
    rdNum.textContent = live ? MK.pad(Math.floor(beat - B.drop) + 1) : t < at(B.drop) ? '00' : MK.pad(B.outro - B.drop);
    rdNum.style.transform = `scale(${(1 + pulse * 0.06).toFixed(3)})`;
    G.glow.style.opacity = (pulse * 0.55).toFixed(3);
    G.glow.setAttribute('r', String(r + 22 + Math.round(pulse * 10)));

    // 上升段：标记绕圈加速
    const mp = seg(t, at(B.riser), at(B.outro) - at(B.riser), ease.inCubic);
    const showMarker = t >= at(B.riser) && t < at(B.outro);
    G.marker.style.visibility = showMarker ? 'visible' : 'hidden';
    if (showMarker) {
      const deg = mp * 360, m = polar(cx, cy, r + 30, deg);
      G.marker.setAttribute('transform', `translate(${m.x} ${m.y}) rotate(${(deg + 180).toFixed(2)})`);
    }

    // 转场：斜切色块扫过，中点切到收尾卡
    const wp = seg(t, at(B.outro), 0.5, ease.inOutQuart);
    els.wipe.style.visibility = wp > 0 && wp < 1 ? 'visible' : 'hidden';
    els.wipe.style.transform = `translateX(${lerp(-110, 110, wp).toFixed(2)}%) skewX(-12deg)`;
    const post = t >= at(B.outro) + 0.25;
    els.gfx.style.visibility = post ? 'hidden' : 'visible';
    els.txt.style.visibility = post ? 'hidden' : 'visible';
    els.end.style.visibility = post ? 'visible' : 'hidden';
    const ep = seg(t, at(B.outro) + 0.25, 0.5, ease.emphasized);
    els.ecTitle.style.transform = `translateY(${((1 - ep) * 40).toFixed(1)}px)`;
    els.ecTitle.style.opacity = ep;
    els.ecEn.style.opacity = seg(t, at(B.outro) + 0.4, 0.4);
    const st = seg(t, at(B.end), 0.3, ease.outBack);
    els.stamp.style.opacity = clamp((t - at(B.end)) / 0.04);
    els.stamp.style.transform = `rotate(-6deg) scale(${lerp(2.4, 1, clamp(st)).toFixed(3)})`;

    // 颗粒：每秒 24 次换位（按 t 派生，可复现）
    const g = MK.rng(7 + Math.floor(t * 24));
    els.grain.style.backgroundPosition = `${Math.floor(g() * 256)}px ${Math.floor(g() * 256)}px`;
  }

  /* ---------- 6. 声音：乐谱 ---------- */
  // 打字 tick 的时刻与 typeText 的进度一致：第 k 个字符在进度 (k - 0.5) / n 时出现
  const kickChars = MK.chars(C.kicker);
  const typeTicks = kickChars.map((ch, k) => ({ ch, t: KICK.from + (KICK.dur * (k + 0.5)) / kickChars.length }))
    .filter((x) => x.ch !== ' ')
    .map((x, i) => ({ t: x.t, voice: 'tick', vel: i % 2 ? 0.35 : 0.55 }));
  const SCORE = [
    // 环境底：整段空气声（bed 总线，被底鼓侧链闪避）
    { t: 0, voice: 'air', dur: DURATION, fade: 1.2, vel: 0.6 },
    // HUD 四角依次落位
    ...corners.map((_, i) => ({ t: 0.12 + i * 0.08, voice: 'click', vel: 0.55, pan: i % 2 ? 0.5 : -0.5 })),
    ...typeTicks,
    // 圆环描绘：反向渐强收向落点，最后 0.45 秒加一记上扫呼啸
    { t: at(B.ring), voice: 'reverse', dur: at(B.drop) - at(B.ring), vel: 0.7 },
    { t: at(B.drop) - 0.45, voice: 'whoosh', dur: 0.45, peak: 0.95, vel: 0.8 },
    // 落点：冲击 + 次低频 + 铺底和弦
    { t: at(B.drop), voice: 'impact', vel: 0.9 },
    { t: at(B.drop), voice: 'sub', note: 'A1', dur: 1.2, vel: 0.75 },
    { t: at(B.drop), voice: 'pad', notes: C.sound.chord, dur: at(B.outro) - at(B.drop), attack: 0.25, release: 1.6, vel: 0.7 },
    // 节拍底：落点到转场之间，十六分步进
    MK.audio.pattern({
      bpm: C.bpm, from: at(B.drop) + 0.01, to: at(B.outro), tracks: C.sound.drums,
      voices: { hat: { gain: 0.8 }, hat2: { voice: 'hat', gain: 0.45 }, clap: { gain: 0.9 } },
    }),
    // 副标题
    { t: at(B.sub), voice: 'blip', note: 'E6', vel: 0.7 },
    // 三个节点：声呐定位 + 标签出现时的提示音（音高逐个升高）
    ...B.items.flatMap((b, i) => [
      { t: at(b), voice: 'sonar', note: C.sound.nodes[i], vel: 0.55, pan: i - 1 },
      { t: at(b) + 0.3, voice: 'blip', note: C.sound.nodes[i], vel: 0.6, pan: (i - 1) * 0.5 },
    ]),
    // 上升 → 转场 → 收尾
    { t: at(B.riser), voice: 'riser', dur: at(B.outro) - at(B.riser), vel: 0.8 },
    { t: at(B.outro), voice: 'whoosh', dir: 'down', dur: 0.5, vel: 0.9 },
    { t: at(B.outro), voice: 'kick', vel: 1 },
    { t: at(B.end), voice: 'stamp', vel: 1 },
    { t: at(B.end), voice: 'shimmer', vel: 0.7 },
    { t: at(B.end) + 0.04, voice: 'chime', note: 'E6', vel: 0.55 },
  ];

  /* ---------- 7. 时间轴、协议与控制条 ---------- */
  const markers = [
    { t: 0, label: '开场' }, { t: at(B.kicker), label: '打字' }, { t: at(B.ring), label: '圆环' },
    { t: at(B.drop), label: '落点' }, { t: at(B.sub), label: '副标题' }, { t: at(B.items[0]), label: '节点' },
    { t: at(B.riser), label: '上升' }, { t: at(B.outro), label: '转场' }, { t: at(B.end), label: '收尾' },
  ];
  const tl = MK.timeline({ duration: DURATION, render, markers });
  MK.audio.attach(tl, SCORE);
  MK.expose(tl, { title: '舞台模板', bpm: C.bpm });
  MK.controls(tl, { accent: C.palette.accent });
  MK.start(tl, { t: 0, reduced: at(B.end) + 0.8 });
})();
