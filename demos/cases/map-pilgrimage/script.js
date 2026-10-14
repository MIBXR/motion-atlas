/*
 * 地图巡礼 · 渲染器
 * render(t) 只依赖时间 t：读取 config.js 的各条轨道，计算镜头、昼夜、HUD、路线、卡片和转场。
 * 因此既能实时播放，也能被站点刻度条拖动，或被 scripts/render.mjs 逐帧渲染成视频。
 */
(() => {
  'use strict';
  const MK = window.MotionKit;
  const C = window.CONFIG;
  const T = C.tracks;
  const P = MK.params();
  const { clamp, lerp, seg, env, ease } = MK;
  const $ = (s, r = document) => r.querySelector(s);
  const stage = $('#stage');
  const W = () => stage.clientWidth;
  const H = () => stage.clientHeight;
  const narrow = () => W() < 760;
  const DUR = C.meta.duration;
  const sfx = MK.sound();

  /* ---------- 颜色 ---------- */
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mixRGB = (a, b, p) => a.map((v, i) => Math.round(lerp(v, b[i], p)));
  const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const PAL = Object.fromEntries(Object.entries(C.palette).map(([k, v]) => [k, hex(v)]));
  const WHITE = [255, 255, 255];
  const DARK = [10, 12, 16];

  /* ---------- 时间工具 ---------- */
  const valueAt = (list, t, key = 'v', e = ease.inOutCubic) => {
    if (t <= list[0].t) return list[0][key];
    for (let i = 0; i < list.length - 1; i++) {
      const a = list[i], b = list[i + 1];
      if (t <= b.t) return lerp(a[key], b[key], e(MK.invLerp(a.t, b.t, t)));
    }
    return list[list.length - 1][key];
  };
  const stepAt = (list, t) => { let cur = null; for (const it of list) if (t >= it.t) cur = it; return cur; };
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const clockAt = (t) => {
    const L = T.clock;
    let i = 0;
    while (i < L.length - 1 && t >= L[i + 1].t) i++;
    const a = L[i], b = L[i + 1];
    if (!b) return a.time;
    const m = lerp(toMin(a.time), toMin(b.time), MK.invLerp(a.t, b.t, t));
    return `${MK.pad(m / 60)}:${MK.pad(m % 60)}`;
  };

  /* ---------- 素材（真实照片优先，缺省时用程序化画面） ---------- */
  const mediaCache = {};
  const seedOf = (s) => Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  function sceneURL(scene, style = 'photo', portrait = false) {
    const key = `${scene}|${style}|${portrait}`;
    if (!mediaCache[key]) {
      const c = window.paintScene(scene, style, portrait ? 900 : 1600, portrait ? 1200 : 1000, seedOf(scene));
      mediaCache[key] = c.toDataURL('image/jpeg', 0.88);
    }
    return mediaCache[key];
  }
  const stopURL = (stop, style = 'photo', portrait = false, override) =>
    (style === 'photo' && (override || stop.media)) || sceneURL(stop.scene || 'lake', style, portrait);

  /* ---------- 地图（MapLibre + OpenFreeMap；失败则退回网格） ---------- */
  let map = null;
  let cam = T.camera[0];
  const loadScript = (src, ms) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = res; s.onerror = () => rej(new Error('load ' + src));
    document.head.appendChild(s);
    setTimeout(() => rej(new Error('timeout ' + src)), ms);
  });
  async function initMap() {
    if (new URLSearchParams(location.search).has('nomap')) throw new Error('nomap');
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = C.map.css;
    document.head.appendChild(link);
    await loadScript(C.map.lib, 9000);
    map = new window.maplibregl.Map({
      container: 'map', style: C.map.style, center: cam.center, zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing,
      interactive: false, attributionControl: false, fadeDuration: 0, maxPitch: 75,
    });
    await new Promise((res, rej) => {
      map.once('load', res);
      setTimeout(() => rej(new Error('map timeout')), 25000);
    });
    try { map.setProjection({ type: 'globe' }); } catch (e) { /* 旧版本不支持地球投影 */ }
    for (const l of map.getStyle().layers) if (l.type === 'symbol') map.setLayoutProperty(l.id, 'visibility', 'none');
    map.addLayer({
      id: 'bld3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 12.5,
      paint: {
        'fill-extrusion-color': '#e2ddd3',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.88,
      },
    });
    for (const l of map.getStyle().layers) {
      const key = classify(l);
      if (key && COLOR_PROP[l.type]) mapLayers.push({ id: l.id, prop: COLOR_PROP[l.type], key });
    }
    addRouteLayers();
  }

  // 昼夜底图配色：逐图层插值（比整体反色更真实：夜里水面比陆地更暗）
  const MAP_PAL = {
    bg: ['#eeebe4', '#1b2431'], water: ['#bccdd9', '#0d131c'], green: ['#dde4d3', '#121b1e'], ice: ['#f4f3ef', '#151c26'],
    landuse: ['#e8e4db', '#151b25'], building: ['#d9d3c7', '#1c2433'], aero: ['#e3dfd6', '#19202c'], casing: ['#d3cdc2', '#0b1017'],
    road: ['#ffffff', '#2c3648'], rail: ['#b3ada2', '#3b4659'], boundary: ['#a7a298', '#3e495b'], extrusion: ['#e2ddd2', '#232c3c'],
  };
  const COLOR_PROP = { background: 'background-color', fill: 'fill-color', line: 'line-color', 'fill-extrusion': 'fill-extrusion-color' };
  const mapLayers = [];
  function classify(l) {
    const id = l.id;
    if (l.type === 'background') return 'bg';
    if (id === 'bld3d') return 'extrusion';
    if (/water/.test(id)) return 'water';
    if (/park|wood/.test(id)) return 'green';
    if (/ice|glacier/.test(id)) return 'ice';
    if (/landuse/.test(id)) return 'landuse';
    if (id === 'building') return 'building';
    if (/aeroway/.test(id)) return 'aero';
    if (/casing/.test(id)) return 'casing';
    if (/railway/.test(id)) return 'rail';
    if (/boundary/.test(id)) return 'boundary';
    if (/highway|road|tunnel/.test(id)) return 'road';
    return null;
  }
  const paintCache = new Map();
  function setPaint(id, prop, value) {
    const k = id + '|' + prop, v = JSON.stringify(value);
    if (paintCache.get(k) === v) return;
    paintCache.set(k, v);
    map.setPaintProperty(id, prop, value);
  }
  function applyMapPalette(n) {
    for (const l of mapLayers) setPaint(l.id, l.prop, css(mixRGB(hex(MAP_PAL[l.key][0]), hex(MAP_PAL[l.key][1]), Math.round(n * 200) / 200)));
  }

  // 路线放进 GL 图层：俯仰角很大时也能正确裁切与透视
  const EMPTY = { type: 'FeatureCollection', features: [] };
  function addRouteLayers() {
    for (const r of routes) {
      map.addSource('rt-' + r.id, { type: 'geojson', data: EMPTY });
      const layout = { 'line-cap': r.style === 'dash' ? 'butt' : 'round', 'line-join': 'round' };
      if (r.style === 'rail') {
        map.addLayer({ id: `rt-${r.id}-casing`, type: 'line', source: 'rt-' + r.id, layout, paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.9 } });
      }
      const paint = { 'line-color': '#16171a', 'line-width': r.style === 'dash' ? 2 : r.style === 'alert' ? 4.2 : 3.6 };
      if (r.style === 'dash') paint['line-dasharray'] = [3, 2.5];
      map.addLayer({ id: 'rt-' + r.id, type: 'line', source: 'rt-' + r.id, layout, paint });
    }
    map.addSource('rt-heads', { type: 'geojson', data: EMPTY });
    map.addLayer({ id: 'rt-heads', type: 'circle', source: 'rt-heads', paint: { 'circle-radius': 5, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#16171a' } });
  }
  const routeData = new Map();
  function setRoute(id, coords) {
    const key = coords.length + ':' + (coords.length ? coords[coords.length - 1].join(',') : '');
    if (routeData.get(id) === key) return;
    routeData.set(id, key);
    map.getSource(id).setData(coords.length > 1 ? { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } } : EMPTY);
  }
  const merc = ([lng, lat]) => [(lng + 180) / 360, (1 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / Math.PI) / 2];
  function project(ll) {
    if (map) { const p = map.project(ll); return [p.x, p.y]; }
    const ws = 512 * 2 ** cam.zoom, m = merc(ll), c = merc(cam.center);
    return [(m[0] - c[0]) * ws + W() / 2, (m[1] - c[1]) * ws + H() / 2];
  }

  /* ---------- 路线几何 ---------- */
  const S = C.stops;
  function arc(a, b, bend, n = 72) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    const cx = mx - dy * bend, cy = my + dx * bend;
    return Array.from({ length: n + 1 }, (_, i) => {
      const k = i / n, u = 1 - k;
      return [u * u * a[0] + 2 * u * k * cx + k * k * b[0], u * u * a[1] + 2 * u * k * cy + k * k * b[1]];
    });
  }
  function smooth(pts, n = 14) {
    if (pts.length < 3) return pts;
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  const routes = T.routes.map((r) => {
    const pts = r.path ? smooth(r.path) : arc(S[r.from].lngLat, S[r.to].lngLat, r.bend || 0.15);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { ...r, pts, cum, len: cum[cum.length - 1] };
  });
  function partial(r, p) {
    if (p >= 1) return r.pts;
    const target = r.len * p, out = [r.pts[0]];
    for (let i = 1; i < r.pts.length; i++) {
      if (r.cum[i] < target) { out.push(r.pts[i]); continue; }
      const k = (target - r.cum[i - 1]) / (r.cum[i] - r.cum[i - 1] || 1);
      out.push([lerp(r.pts[i - 1][0], r.pts[i][0], k), lerp(r.pts[i - 1][1], r.pts[i][1], k)]);
      break;
    }
    return out;
  }
  const pathD = (pts) => pts.map((p, i) => { const [x, y] = project(p); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join('');

  /* ---------- 构建 DOM ---------- */
  const svg = $('#routes');
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, cls) => { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); svg.appendChild(e); return e; };
  const leader = mk('path', 'r-leader');
  const routeEls = routes.map((r) => ({
    casing: r.style === 'rail' ? mk('path', 'r-casing') : null,
    line: mk('path', r.style === 'dash' ? 'r-dash' : r.style === 'alert' ? 'r-alert' : 'r-rail'),
    head: mk('circle', 'r-head'),
    x: r.style === 'alert' ? mk('path', 'r-x') : null,
  }));
  routeEls.forEach((e) => e.head.setAttribute('r', 5));

  const markerEls = {};
  for (const m of T.markers) {
    const s = S[m.stop];
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = '<i class="mk-ring"></i><i class="mk-ring"></i><span class="mk-dot"></span><span class="mk-label"><span class="mk-text"></span><em></em></span>';
    el.querySelector('em').textContent = s.cjk;
    $('#markers').appendChild(el);
    markerEls[m.stop] = { el, m, full: `${s.name} · ${s.code}`, text: el.querySelector('.mk-text'), em: el.querySelector('em'), rings: el.querySelectorAll('.mk-ring') };
  }

  const cardEls = T.cards.map((c) => {
    const stop = S[c.stop];
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = '<div class="cd-media"><img alt=""></div><div class="cd-cap"><b></b><span></span></div>';
    el.querySelector('img').src = stopURL(stop, 'photo', c.portrait, c.media);
    el.querySelector('b').textContent = c.caption;
    $('#cards').appendChild(el);
    return { el, c, stop, img: el.querySelector('img'), cap: el.querySelector('.cd-cap'), time: el.querySelector('.cd-cap span') };
  });

  const fb = $('#flashback');
  const cmp = $('#compare');
  const intro = $('#intro');
  const loc = $('#loc');
  const dayc = $('#daycard');
  const splitChars = (el, text) => { el.innerHTML = ''; return MK.chars(text).map((ch) => { const s = document.createElement('span'); s.textContent = ch; el.appendChild(s); return s; }); };

  const introCJK = splitChars($('.it-cjk', intro), C.meta.titleCJK);
  const introEN = splitChars($('.it-en', intro), C.meta.titleEN);
  $('.it-sub', intro).textContent = C.meta.subline;

  $('.hd-total').textContent = MK.pad(C.meta.totalDays);
  $('.hc-tz').textContent = C.meta.tz;
  $('.bd-label').textContent = C.mascot.label;
  $('.np-title').textContent = C.music.title;
  $('.np-artist').textContent = C.music.artist;
  $('.attrib').textContent = C.map.attribution;
  $('.ou-handle').textContent = C.meta.handle;

  const stepper = $('.stepper');
  stepper.innerHTML = '<i class="st-fill"></i>' + C.stepper.map((id) => `<li>${S[id].name}</li>`).join('');
  const stepLis = stepper.querySelectorAll('li');
  const stepFill = stepper.querySelector('.st-fill');

  const collect = $('.collect');
  collect.innerHTML = T.collect.map(() => '<div class="cl-slot"><img alt=""><b></b></div>').join('');
  const slots = [...collect.children].map((el, i) => {
    const it = T.collect[i];
    el.querySelector('img').src = stopURL(S[it.stop], 'photo', true);
    el.querySelector('b').textContent = it.label;
    return { el, it, img: el.querySelector('img'), b: el.querySelector('b') };
  });

  const outro = $('.outro');
  const O = T.outro;
  $('.ou-stats', outro).innerHTML = O.stats.map((s) => `<li><b></b><span>${s.label}</span></li>`).join('');
  const statEls = [...outro.querySelectorAll('.ou-stats li')];
  const finChars = splitChars($('.ou-fin-text', outro), O.fin);
  $('.ou-credits', outro).innerHTML = O.credits.map((c) => `<p>${c}</p>`).join('');

  /* ---------- 颗粒（预生成 6 帧，按时间选帧，保证可复现） ---------- */
  const grainCanvas = $('#grain');
  const gctx = grainCanvas.getContext('2d');
  const grainFrames = Array.from({ length: 6 }, (_, k) => {
    const r = MK.rng(100 + k);
    const img = gctx.createImageData(320, 180);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    return img;
  });

  /* ---------- 通用：逐字模糊入场 ---------- */
  function blurIn(spans, t, start, step, dur = 0.5, from = 14) {
    spans.forEach((s, i) => {
      const p = seg(t, start + i * step, dur, ease.outCubic);
      s.style.opacity = p;
      s.style.filter = p < 1 ? `blur(${(1 - p) * from}px)` : 'none';
      s.style.transform = `translateY(${(1 - p) * -10}px)`;
    });
  }
  // 打字：前沿 2 个字符带模糊
  function typeIn(spans, t, start, dur) {
    const n = spans.length, head = clamp((t - start) / dur) * (n + 2);
    spans.forEach((s, i) => {
      const k = clamp(head - i);
      s.style.opacity = k;
      s.style.filter = k > 0 && k < 1 ? `blur(${(1 - k) * 6}px)` : 'none';
    });
  }
  const show = (el, v) => { el.style.opacity = v; el.style.visibility = v > 0.001 ? 'visible' : 'hidden'; };

  /* ---------- 地点标题 ---------- */
  let locKey = '';
  let locCJK = [], locEN = [];

  /* ---------- 渲染 ---------- */
  function render(t) {
    const w = W(), h = H();

    // 镜头
    cam = MK.keyframes(T.camera, t);
    if (map) map.jumpTo({ center: cam.center, zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing });
    else {
      const cell = 80 * 2 ** (cam.zoom % 1), ws = 512 * 2 ** cam.zoom, c = merc(cam.center);
      const fbk = $('#fallback');
      fbk.style.backgroundSize = `${cell}px ${cell}px`;
      fbk.style.backgroundPosition = `${(-c[0] * ws + w / 2) % cell}px ${(-c[1] * ws + h / 2) % cell}px`;
    }

    // 昼夜与画面上的覆盖程度（全屏图片时 HUD 变白）
    const night = valueAt(T.night, t);
    let over = 0;
    for (const ce of cardEls) if (ce.c.expand) {
      const ex = ce.c.expand;
      over = Math.max(over, seg(t, ex.t, 0.6, ease.inOutCubic) * (1 - seg(t, ex.t + 0.6 + ex.hold, 0.55, ease.inOutCubic)));
    }
    const fbItem = T.flashback.find((f) => t >= f.t - 0.3 && t <= f.until + 0.4);
    const fbVis = fbItem ? env(t, fbItem.t, fbItem.until, 0.28, 0.32) : 0;
    const cmpItem = T.compare.find((c) => t >= c.t - 0.5 && t <= c.until + 0.6);
    const cmpVis = cmpItem ? env(t, cmpItem.t, cmpItem.until, 0.45, 0.55) : 0;
    over = Math.max(over, fbVis, cmpVis);

    const paper = mixRGB(PAL.paper, PAL.nightPaper, night);
    const ink = mixRGB(mixRGB(PAL.ink, PAL.nightInk, night), WHITE, over);
    stage.style.setProperty('--paper', css(paper));
    stage.style.setProperty('--ink', css(ink));
    stage.style.setProperty('--muted', css(ink, 0.64));
    stage.style.setProperty('--line', css(ink, 0.24));
    stage.style.setProperty('--surface', css(mixRGB(paper, DARK, over), 0.9));
    document.body.style.background = css(paper);
    if (map) {
      applyMapPalette(night);
      $('#map').style.background = css(paper);
    } else {
      $('#fallback').style.filter = night > 0.001 ? `invert(${night}) hue-rotate(${180 * night}deg) brightness(${1 - 0.08 * night})` : 'none';
    }

    // 章节：强调色、标签、四角框线
    const ch = T.chapter.find((c) => t >= c.t - 0.1 && t <= c.until + 0.6);
    const chDef = ch && C.chapters[ch.key];
    const chVis = ch ? env(t, ch.t, ch.until, 0.5, 0.5) : 0;
    const accent = chDef ? mixRGB(PAL.accent, hex(chDef.accent), env(t, ch.t, ch.until, 0.4, 0.6)) : PAL.accent;
    stage.style.setProperty('--accent', css(accent));
    const tag = $('.chapter-tag');
    show(tag, chVis * (1 - Math.max(fbVis, cmpVis)));
    $('#scrim').style.opacity = over * (1 - fbVis);
    if (ch) {
      $('.ct-chip').textContent = chDef.tag;
      $('.ct-chip').style.clipPath = `inset(0 ${(1 - seg(t, ch.t, 0.35, ease.outCubic)) * 100}% 0 0)`;
      $('.ct-title').textContent = MK.typeText(chDef.title, seg(t, ch.t + 0.25, 0.7, ease.linear));
    }
    const frame = $('#frame');
    show(frame, chVis * (1 - fbVis));
    if (ch) {
      const fw = frame.clientWidth, fh = frame.clientHeight, per = 2 * (fw + fh);
      const fp = seg(t, ch.t + 0.1, 0.8, ease.inOutCubic);
      const line = $('.fr-line', frame);
      line.setAttribute('d', `M0 0H${fw}V${fh}H0Z`);
      line.style.strokeDasharray = per;
      line.style.strokeDashoffset = per * (1 - fp);
      frame.querySelectorAll('.fr-c').forEach((c, i) => { const k = seg(t, ch.t + 0.2 + i * 0.12, 0.3, ease.outBack); c.style.transform = `scale(${k})`; });
    }

    // 路线：真实底图用 GL 图层，退回模式用 SVG
    if (map) {
      const heads = [];
      routes.forEach((r) => {
        const p = seg(t, r.t0, r.t1 - r.t0, ease.inOutQuad);
        const pts = t >= r.t0 ? partial(r, p) : [];
        setRoute('rt-' + r.id, pts);
        let op = 1;
        if (r.style === 'alert') op = 1 - 0.65 * seg(t, r.t1 + 1.0, 0.6);
        const color = r.style === 'dash' ? css(mixRGB(PAL.ink, PAL.nightInk, night)) : r.style === 'alert' ? css(PAL.alert) : css(accent);
        setPaint('rt-' + r.id, 'line-color', color);
        setPaint('rt-' + r.id, 'line-opacity', Math.round(op * 100) / 100);
        if (r.style === 'rail') setPaint(`rt-${r.id}-casing`, 'line-color', css(paper));
        if (t >= r.t0 && t <= r.t1 + 0.3 && pts.length) heads.push({ type: 'Feature', geometry: { type: 'Point', coordinates: pts[pts.length - 1] } });
      });
      const hk = 'heads:' + heads.map((f) => f.geometry.coordinates.join(',')).join('|');
      if (routeData.get('rt-heads') !== hk) { routeData.set('rt-heads', hk); map.getSource('rt-heads').setData({ type: 'FeatureCollection', features: heads }); }
      setPaint('rt-heads', 'circle-color', css(paper));
      setPaint('rt-heads', 'circle-stroke-color', css(mixRGB(PAL.ink, PAL.nightInk, night)));
    }
    routes.forEach((r, i) => {
      const e = routeEls[i];
      const p = seg(t, r.t0, r.t1 - r.t0, ease.inOutQuad);
      const vis = t >= r.t0 ? 1 : 0;
      let op = vis;
      if (r.style === 'alert') op *= 1 - 0.65 * seg(t, r.t1 + 1.0, 0.6);
      if (map) {
        e.line.setAttribute('d', '');
        if (e.casing) e.casing.setAttribute('d', '');
        e.head.style.opacity = 0;
        if (e.x) {
          const [xx, yy] = project(r.pts[r.pts.length - 1]);
          e.x.setAttribute('d', `M${xx - 7} ${yy - 7}L${xx + 7} ${yy + 7}M${xx + 7} ${yy - 7}L${xx - 7} ${yy + 7}`);
          e.x.style.opacity = seg(t, r.t1, 0.3, ease.outBack) * op * (1 - over);
        }
        return;
      }
      const d = vis ? pathD(partial(r, p)) : '';
      e.line.setAttribute('d', d);
      e.line.style.opacity = op * (1 - over);
      if (e.casing) { e.casing.setAttribute('d', d); e.casing.style.opacity = op * 0.85 * (1 - over); }
      const drawing = t >= r.t0 && t <= r.t1 + 0.3;
      if (drawing) {
        const pts = partial(r, p), [hx, hy] = project(pts[pts.length - 1]);
        e.head.setAttribute('cx', hx); e.head.setAttribute('cy', hy);
      }
      e.head.style.opacity = drawing ? 1 - over : 0;
      if (e.x) {
        const [xx, yy] = project(r.pts[r.pts.length - 1]);
        const xk = seg(t, r.t1, 0.3, ease.outBack) * op;
        e.x.setAttribute('d', `M${xx - 7} ${yy - 7}L${xx + 7} ${yy + 7}M${xx + 7} ${yy - 7}L${xx - 7} ${yy + 7}`);
        e.x.style.opacity = xk * (1 - over);
      }
    });

    // 标记
    for (const id in markerEls) {
      const me = markerEls[id];
      const k = seg(t, me.m.t, 0.45, ease.outBack);
      const [x, y] = project(S[id].lngLat);
      me.el.style.transform = `translate(${x}px, ${y}px) scale(${0.6 + 0.4 * clamp(k, 0, 1.2)})`;
      me.el.style.opacity = clamp(k) * (1 - over);
      me.text.textContent = MK.typeText(me.full, seg(t, me.m.t + 0.15, 0.55, ease.linear));
      me.em.style.opacity = seg(t, me.m.t + 0.6, 0.3);
      me.rings.forEach((rg, j) => {
        const f = (((t - me.m.t) / 2 + j * 0.5) % 1 + 1) % 1;
        rg.style.transform = `scale(${1 + f * 2.6})`;
        rg.style.opacity = t > me.m.t ? (1 - f) * 0.7 : 0;
      });
    }

    // 卡片（含展开为全屏）
    let leaderD = '';
    for (const ce of cardEls) {
      const c = ce.c;
      const vis = t >= c.t - 0.05 && t <= c.until + 0.5;
      show(ce.el, vis ? 1 : 0);
      if (!vis) continue;
      const pin = seg(t, c.t, 0.55, ease.outCubic);
      const pout = seg(t, c.until - 0.4, 0.4, ease.inCubic);
      let cw, chh, cx, cy;
      if (narrow()) { cw = w - 32; chh = c.portrait ? cw * 0.9 : cw * 0.62; cx = 16; cy = h * 0.36; }
      else if (c.portrait) { cw = Math.min(w * 0.26, 440); chh = cw * 1.33; cx = w - cw - w * 0.06; cy = (h - chh) / 2 - 10; }
      else { cw = Math.min(w * 0.44, 860); chh = cw * 0.62; cx = w - cw - w * 0.035; cy = (h - chh) / 2 - 10; }
      let f = 0, kb = 0;
      if (c.expand) {
        const ex = c.expand;
        f = seg(t, ex.t, 0.6, ease.inOutCubic) * (1 - seg(t, ex.t + 0.6 + ex.hold, 0.55, ease.inOutCubic));
        kb = seg(t, ex.t, 0.6 + ex.hold + 0.55, ease.linear);
      }
      const L = lerp(cx, 0, f), Tp = lerp(cy, 0, f), Wd = lerp(cw, w, f), Hd = lerp(chh, h, f);
      ce.el.style.left = `${L}px`; ce.el.style.top = `${Tp}px`;
      ce.el.style.width = `${Wd}px`; ce.el.style.height = `${Hd}px`;
      ce.el.style.opacity = pin * (1 - pout);
      ce.el.style.transform = `translateY(${(1 - pin) * 26 - pout * 18}px) scale(${0.965 + 0.035 * pin})`;
      ce.el.style.zIndex = f > 0 ? 5 : 1;
      const media = ce.el.querySelector('.cd-media');
      media.style.borderRadius = `${6 * (1 - f)}px`;
      media.style.setProperty('--card-ring', chDef && !f ? css(accent) : 'transparent');
      ce.img.style.transform = `scale(${1 + 0.07 * kb})`;
      ce.cap.style.opacity = (1 - f) * seg(t, c.t + 0.3, 0.4);
      ce.time.textContent = `${clockAt(c.t)} ${C.meta.tz}`;
      if (f < 0.05 && !narrow()) {
        const [mx, my] = project(ce.stop.lngLat);
        if (mx < cx - 20) leaderD = `M${mx + 12} ${my}L${cx - 6} ${cy + chh / 2}`;
      }
      // 全屏照片时以 HUD 层级显示
      ce.el.style.opacity = pin * (1 - pout);
    }
    leader.setAttribute('d', leaderD);

    // 回忆
    show(fb, fbVis);
    if (fbItem) {
      const im = $('img', fb);
      const src = sceneURL(fbItem.scene, 'illustration');
      if (im.getAttribute('src') !== src) im.src = src;
      im.style.transform = `scale(${1.06 - 0.06 * seg(t, fbItem.t, fbItem.until - fbItem.t, ease.linear)})`;
      $('.fb-tag', fb).textContent = fbItem.tag;
      const vEl = $('.fb-vtext', fb);
      if (vEl.dataset.text !== fbItem.vtext) { vEl.dataset.text = fbItem.vtext; splitChars(vEl, fbItem.vtext); }
      blurIn([...vEl.children], t, fbItem.t + 0.5, 0.3, 0.45, 10);
      $('.fb-en', fb).textContent = MK.typeText(fbItem.en, seg(t, fbItem.t + 0.9, fbItem.en.length * 0.035, ease.linear));
      $('.fb-caption', fb).textContent = fbItem.caption;
      $('.fb-caption', fb).style.opacity = seg(t, fbItem.t + 0.4, 0.4);
    }

    // 分屏对比
    show(cmp, cmpVis);
    if (cmpItem) {
      const [rImg, lImg] = cmp.querySelectorAll('img');
      const rs = sceneURL(cmpItem.scene, 'photo'), ls = sceneURL(cmpItem.scene, 'postcard');
      if (rImg.getAttribute('src') !== rs) rImg.src = rs;
      if (lImg.getAttribute('src') !== ls) lImg.src = ls;
      const dx = seg(t, cmpItem.t + 0.55, 0.7, ease.outQuart) * 50;
      $('.cmp-left', cmp).style.clipPath = `inset(0 ${100 - dx}% 0 0)`;
      $('.cmp-divider', cmp).style.left = `${dx}%`;
      $('.cmp-divider', cmp).style.opacity = dx > 0.2 ? 1 : 0;
      const [rl, ll] = cmp.querySelectorAll('.cmp-label');
      rl.textContent = cmpItem.right; ll.textContent = cmpItem.left;
      rl.style.opacity = seg(t, cmpItem.t + 0.35, 0.3);
      ll.style.opacity = seg(t, cmpItem.t + 0.9, 0.3);
      const st = $('.cmp-stamp', cmp);
      st.textContent = cmpItem.stamp;
      const sk = seg(t, cmpItem.t + 1.4, 0.38, ease.outBack);
      st.style.opacity = clamp(sk * 3);
      st.style.transform = `rotate(-4deg) scale(${1.45 - 0.45 * sk})`;
    }

    // 片名
    const introVis = t < 8.2 ? 1 - seg(t, 7.2, 0.6, ease.inCubic) : 0;
    show(intro, introVis);
    if (introVis > 0) {
      intro.style.filter = t > 7.2 ? `blur(${seg(t, 7.2, 0.6) * 10}px)` : 'none';
      blurIn(introCJK, t, 4.0, 0.14, 0.55, 16);
      $('.it-rule', intro).style.transform = `scaleX(${seg(t, 4.45, 0.45, ease.outCubic)})`;
      typeIn(introEN, t, 4.7, 0.9);
      $('.it-sub', intro).style.opacity = seg(t, 5.6, 0.5);
    }

    // 地点标题
    const lt = T.locTitle.find((l) => t >= l.t - 0.05 && t <= l.t + l.dur + 0.5);
    show(loc, lt ? env(t, lt.t, lt.t + lt.dur, 0.2, 0.45) : 0);
    if (lt) {
      const s = S[lt.stop];
      if (locKey !== lt.stop) {
        locKey = lt.stop;
        locCJK = splitChars($('.lt-cjk', loc), s.cjk);
        locEN = splitChars($('.lt-en', loc), `${s.name} · ${s.place}`);
      }
      blurIn(locCJK, t, lt.t, 0.16, 0.5, 14);
      $('.lt-rule', loc).style.transform = `scaleX(${seg(t, lt.t + 0.15, 0.4, ease.outCubic)})`;
      typeIn(locEN, t, lt.t + 0.3, 0.8);
    }

    // 大号日序
    const dc = T.dayCard.find((d) => t >= d.t - 0.05 && t <= d.t + d.dur + 0.4);
    show(dayc, dc ? env(t, dc.t, dc.t + dc.dur, 0.3, 0.35) : 0);
    if (dc) {
      $('.dc-num', dayc).innerHTML = `<i style="transform:translateY(${(1 - seg(t, dc.t + 0.15, 0.45, ease.outCubic)) * 100}%)">${MK.pad(dc.n)}</i>`;
      $('.dc-day', dayc).style.transform = `translateX(${(1 - seg(t, dc.t, 0.4, ease.outCubic)) * -24}px)`;
      $('.dc-date', dayc).textContent = (C.days.find((d) => d.n === dc.n) || {}).date || '';
      $('.dc-date', dayc).style.opacity = seg(t, dc.t + 0.4, 0.4);
    }

    // HUD 顶部
    const hudIn = seg(t, 7.6, 0.8, ease.outCubic);
    const hudOut = seg(t, 50.4, 0.8);
    const top = $('.hud-top');
    top.style.opacity = hudIn * (1 - fbVis);
    top.style.transform = `translateY(${(1 - hudIn) * -12}px)`;
    $('.hud-day').style.opacity = 1 - hudOut * 0.75;
    const dayIt = stepAt(T.day, t);
    const dayN = dayIt ? dayIt.n : 0;
    const dayK = dayIt ? seg(t, dayIt.t, 0.46, ease.outCubic) : 1;
    $('.hd-n').innerHTML = `<span style="display:inline-block;transform:translateY(${(1 - dayK) * 60}%);opacity:${dayK}">${MK.pad(dayN)}</span>`;
    $('.hd-date').textContent = (C.days.find((d) => d.n === dayN) || C.days[0]).date;
    $('.hg-coord').textContent = `${Math.abs(cam.center[1]).toFixed(4)}°${cam.center[1] >= 0 ? 'N' : 'S'} ${Math.abs(cam.center[0]).toFixed(4)}°${cam.center[0] >= 0 ? 'E' : 'W'}`;
    const near = Object.values(S).reduce((a, s) => (Math.hypot(s.lngLat[0] - cam.center[0], s.lngLat[1] - cam.center[1]) < Math.hypot(a.lngLat[0] - cam.center[0], a.lngLat[1] - cam.center[1]) ? s : a));
    $('.hg-elev').textContent = `ELEV ${near.elev || 0} M · Z ${cam.zoom.toFixed(1)}`;
    $('.hc-time').textContent = clockAt(t);
    const prog = valueAt(T.progress, t);
    $('.hud-rule-fill').style.width = `${(prog / (C.stepper.length - 1)) * 100}%`;

    // 徽章计数
    const badge = $('.badge');
    const cnt = stepAt(T.counter, t);
    const badgeVis = seg(t, 8.2, 0.6) * (1 - hudOut);
    show(badge, badgeVis * (1 - fbVis));
    const bk = cnt ? t - cnt.t : 9;
    badge.style.transform = `scale(${1 + 0.14 * Math.exp(-bk * 7) * (bk < 0.8 ? 1 : 0)})`;
    $('.bd-n').innerHTML = `<span style="display:inline-block;transform:translateY(${(1 - seg(bk, 0, 0.3, ease.outCubic)) * 70}%)">×${cnt ? cnt.n : 0}</span>`;

    // 收集托盘
    const trayVis = seg(t, 12.4, 0.5) * (1 - hudOut) * (1 - over);
    show(collect, trayVis);
    slots.forEach((s) => {
      const k = seg(t, s.it.t, 0.4, ease.outBack);
      s.el.classList.toggle('on', t >= s.it.t);
      s.img.style.opacity = clamp(k);
      s.b.style.opacity = clamp(k);
      s.el.style.transform = `scale(${t >= s.it.t ? 0.9 + 0.1 * clamp(k, 0, 1.3) : 1})`;
    });

    // 警示横幅
    const al = T.alert.find((a) => t >= a.t - 0.05 && t <= a.until + 0.4);
    const alertEl = $('.alert');
    show(alertEl, al ? 1 - seg(t, al.until, 0.35) : 0);
    if (al) {
      $('.al-bar').style.clipPath = `inset(0 ${(1 - seg(t, al.t, 0.38, ease.outCubic)) * 100}% 0 0)`;
      $('.al-title').textContent = al.title;
      $('.al-detail').textContent = MK.typeText(al.detail, seg(t, al.t + 0.3, 0.9, ease.linear));
      const chip = $('.al-chip');
      chip.style.opacity = seg(t, al.t + 0.55, 0.25);
      chip.style.transform = `translateX(${(1 - seg(t, al.t + 0.55, 0.3, ease.outCubic)) * -16}px)`;
      $('.al-chip-text').textContent = al.chip + '.'.repeat(Math.max(0, Math.floor((t - al.t) * 3)) % 4);
    }

    // 便签与通知
    const ts = T.toast.find((x) => t >= x.t - 0.05 && t <= x.until + 0.4);
    const toast = $('.toast');
    const tv = ts ? env(t, ts.t, ts.until, 0.35, 0.3) : 0;
    show(toast, tv);
    toast.style.transform = `translateX(${(1 - tv) * 40}px)`;
    if (ts) $('.ts-text').textContent = ts.text;
    const nt = T.note.find((x) => t >= x.t - 0.05 && t <= x.until + 0.4);
    const note = $('.note');
    const nin = nt ? seg(t, nt.t, 0.5, ease.outBack) : 0, nout = nt ? seg(t, nt.until, 0.35, ease.inCubic) : 0;
    show(note, nt ? clamp(nin) * (1 - nout) : 0);
    if (nt) {
      note.style.transform = `translateY(${(1 - clamp(nin)) * 30 + nout * 20}px) rotate(${4 - 2 * nout}deg) scale(${0.9 + 0.1 * nin})`;
      $('.nt-text').textContent = nt.text;
      $('.nt-sign').textContent = nt.sign;
    }

    // 底部：正在播放、歌词、步进器
    const bottom = $('.hud-bottom');
    bottom.style.opacity = seg(t, 1.2, 0.8) * (1 - fbVis);
    $('.np').style.opacity = 1 - hudOut;
    const ly = stepAt(C.music.lyrics, t);
    $('.np-lyric').textContent = ly ? MK.typeText(ly.text, seg(t, ly.t, 0.7, ease.linear)) : '···';
    $('.np-sub').textContent = ly ? ly.sub : '';
    $('.np-sub').style.opacity = ly ? seg(t, ly.t + 0.4, 0.4) : 0;
    $('.np-eq').querySelectorAll('rect').forEach((r, i) => {
      const hh = 3 + 12 * (0.5 + 0.5 * Math.sin(t * (6 + i * 1.9) + i * 1.3));
      r.setAttribute('y', 16 - hh); r.setAttribute('height', hh);
    });
    stepper.style.opacity = hudIn;
    stepLis.forEach((li, i) => li.classList.toggle('on', prog >= i - 0.02));
    stepFill.style.width = `calc((100% - clamp(60px, 9vw, 180px)) * ${prog / (C.stepper.length - 1)})`;
    if (narrow()) stepFill.style.width = `calc(75% * ${prog / (C.stepper.length - 1)})`;

    // 结尾统计
    const ov = seg(t, O.t, 0.5);
    show(outro, ov);
    if (ov > 0) {
      statEls.forEach((li, i) => {
        const s = O.stats[i];
        const st0 = O.t + 0.3 + i * 0.32;
        const k = seg(t, st0, 0.45, ease.outCubic);
        li.style.opacity = k;
        li.style.transform = `translateY(${(1 - k) * 14}px)`;
        li.querySelector('b').textContent = `${s.prefix || ''}${MK.count(0, s.value, seg(t, st0, 0.9, ease.outQuart))}${s.suffix || ''}`;
      });
      blurIn(finChars, t, O.t + 2.1, 0.06, 0.5, 12);
      $('.ou-credits', outro).style.opacity = seg(t, O.t + 2.9, 0.5);
    }

    // 颗粒
    const fi = ((Math.floor(t * 12) % grainFrames.length) + grainFrames.length) % grainFrames.length;
    gctx.putImageData(grainFrames[fi], 0, 0);
    grainCanvas.style.opacity = 0.07 + 0.08 * fbVis + 0.03 * night;

    if (map && P.render) {
      return new Promise((res) => {
        let done = false;
        const fin = () => { if (!done) { done = true; res(); } };
        map.once('idle', fin);
        map.triggerRepaint();
        setTimeout(fin, 8000);
      });
    }
    return null;
  }

  /* ---------- 声音提示（只在正向播放时触发） ---------- */
  const cues = [];
  T.markers.forEach((m) => cues.push({ t: m.t, fn: () => sfx.tone({ f: 1320, d: 0.06, type: 'triangle', g: 0.12 }) }));
  T.cards.forEach((c) => {
    cues.push({ t: c.t, fn: () => sfx.noise({ d: 0.25, g: 0.06, lp: 2600, hp: 500 }) });
    if (c.expand) cues.push({ t: c.expand.t, fn: () => sfx.noise({ d: 0.5, g: 0.08, lp: 1800, hp: 200 }) });
  });
  T.counter.forEach((c) => cues.push({ t: c.t, fn: () => { sfx.tone({ f: 988, d: 0.09, g: 0.14 }); sfx.tone({ f: 1480, d: 0.14, g: 0.12, delay: 0.08 }); } }));
  T.alert.forEach((a) => cues.push({ t: a.t, fn: () => { sfx.tone({ f: 420, d: 0.14, type: 'square', g: 0.08 }); sfx.tone({ f: 420, d: 0.14, type: 'square', g: 0.08, delay: 0.2 }); } }));
  T.compare.forEach((c) => cues.push({ t: c.t + 1.4, fn: () => { sfx.tone({ f: 90, d: 0.22, g: 0.3, slide: -40 }); sfx.noise({ d: 0.08, g: 0.1, lp: 1200 }); } }));
  T.dayCard.forEach((d) => cues.push({ t: d.t, fn: () => sfx.tone({ f: 660, d: 0.3, type: 'sine', g: 0.12, slide: 220 }) }));
  [4.0, 4.14, 4.28, 4.42].forEach((x) => cues.push({ t: x, fn: () => sfx.tone({ f: 2400, d: 0.03, type: 'square', g: 0.03 }) }));
  O.stats.forEach((s, i) => cues.push({ t: O.t + 0.3 + i * 0.32, fn: () => sfx.tone({ f: 880 + i * 110, d: 0.07, g: 0.08 }) }));

  /* ---------- 启动 ---------- */
  const markers = [
    { t: 0, label: '开场 · 夜间地球' }, { t: 4.0, label: '片名' }, { t: 8.2, label: '航线' },
    { t: 11.6, label: '抵达杭州' }, { t: 15.8, label: '卡片→全屏' }, { t: 20.6, label: '章节框线' },
    { t: 21.6, label: '回忆' }, { t: 25.2, label: '分屏对比' }, { t: 29.4, label: '入夜 · 便签' },
    { t: 31.0, label: '铁路' }, { t: 33.0, label: 'DAY 02' }, { t: 38.1, label: '警示改道' },
    { t: 41.6, label: 'DAY 03' }, { t: 44.3, label: '上海' }, { t: 51.0, label: '结尾统计' },
  ];
  const tl = MK.timeline({ duration: DUR, render, markers });
  let prev = 0;
  tl.on((t, playing) => {
    if (playing && t > prev && t - prev < 0.5) for (const c of cues) if (c.t > prev && c.t <= t) c.fn();
    prev = t;
  });
  MK.controls(tl, { sound: sfx, accent: C.palette.accent });

  const start = () => {
    MK.expose(tl, { title: '地图巡礼', fps: 30, sound: sfx, mapMode: map ? 'maplibre' : 'fallback' });
    const reduce = MK.prefersReducedMotion();
    if (P.t != null) tl.seek(P.t);
    else tl.seek(reduce ? 13.2 : 0);
    if (P.autoplay && !reduce) tl.play();
  };
  window.addEventListener('resize', () => tl.seek(tl.time));

  initMap()
    .catch(() => { map = null; stage.classList.add('no-map'); })
    .finally(start);
})();
