/*
 * Motion mechanisms adapted from https://github.com/LBEILC/RhineLabUI
 * Copyright (c) 2026 LBEILC. MIT License; full notice in docs/research/archive-os.md.
 * Original FIELDWORK records, SVG geometry and synthesized score. No reference artwork or audio.
 */
(() => {
  'use strict';
  const MK = window.MotionKit, C = window.CONFIG;
  const { clamp, lerp, seg, ease } = MK;
  const $ = (s) => document.querySelector(s);
  const P = MK.params(), reduced = MK.prefersReducedMotion();
  let events = C.events;
  const stage = MK.stage({ root: '#stage' });
  MK.audio.setMix({ music: 1.6 });
  MK.preload([MK.preload.fonts()]);
  const mod = (n, d) => ((n % d) + d) % d;
  const step = (t, rate = C.timing.orbitRate) => t <= 0 ? 0 : 1 - (1 + rate * t) * Math.exp(-rate * t);
  const fileAt = (s) => C.files[s.col][s.row];
  const arrows = { ArrowUp: 'UP / 上行', ArrowDown: 'DOWN / 下行', ArrowLeft: 'LEFT / 左移', ArrowRight: 'RIGHT / 右移' };
  const ticks = $('#rowTicks');
  ticks.innerHTML = '<i></i>'.repeat(8);
  const tickEls = [...ticks.children];
  $('#category').classList.add('rolling');
  $('#colName').classList.add('rolling');
  const parts = ['#category', '#level', '#fileTitle', '#fileEn', '#timestamp', '#author', '#abstract', '#metrics', '#chart', '.annotation'].map($);
  $('#operator').textContent = C.brand.operator;
  $('.brand > b').textContent = C.brand.name;
  $('.brand > span').textContent = C.brand.sub;
  $('#welcomeName').textContent = C.brand.name;
  $('#welcomeDatabase').textContent = C.brand.sub;
  parts.filter((el) => el.tagName !== 'svg').forEach((el) => el.classList.add('redacted'));

  function derive(events, t) {
    let x = 0, y = 0, col = 0, detail = false;
    const memory = [0, 0, 0, 0, 0];
    const selections = [{ t: C.timing.bootEnd, col: 0, row: 0, x: 0, y: 0, key: '', fromCol: 0, fromRow: 0 }];
    const modes = [], moves = [];
    for (const e of events) {
      if (e.t > t) break;
      if (e.key === 'Enter' && !detail) { detail = true; modes.push({ t: e.t, on: true }); continue; }
      if (e.key === 'Escape' && detail) { detail = false; modes.push({ t: e.t, on: false }); continue; }
      if (detail || !arrows[e.key]) continue;
      const fromCol = col, fromRow = mod(y, 8), previousY = y;
      const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      x += dx; col = mod(x, 5);
      y = dx ? memory[col] + Math.floor((y - memory[col] + 4) / 8) * 8 : y + dy;
      memory[col] = mod(y, 8);
      const sel = { ...e, col, row: mod(y, 8), x, y, dx, dy: y - previousY, fromCol, fromRow };
      selections.push(sel); moves.push(sel);
    }
    let orbitX = 0, orbitY = 0;
    for (const e of moves) {
      orbitX += e.dx * step(t - e.t);
      orbitY += e.dy * step(t - e.t);
    }
    const amount = clamp(modes.reduce((n, e) => n + (e.on ? 1 : -1) * step(t - e.t, C.timing.liftRate), 0));
    return { col, row: mod(y, 8), x, y, selections, modes, moves, orbitX, orbitY, amount, detail };
  }

  const array = $('#array');
  const plates = [];
  const NS = 'http://www.w3.org/2000/svg';
  array.innerHTML = '<defs><linearGradient id="face" x2="0.4" y2="1"><stop stop-color="#fffdf8"/><stop offset="1" stop-color="#d8d7cd"/></linearGradient><linearGradient id="side" x2="1"><stop stop-color="#babaae"/><stop offset="1" stop-color="#e1dfd5"/></linearGradient></defs>';
  for (let i = 0; i < 7 * 13; i++) {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = '<path fill="url(#face)" stroke="#c3c3b7" stroke-width="1" d="M0 0 146-48 146-174 0-126Z"/><path fill="url(#side)" d="M146-48 156-42 156-168 146-174Z"/><path class="cap" fill="#fffdf9" stroke="#e7e5dc" d="M0-126 146-174 156-168 10-120Z"/><path class="tag" d="M15-33 64-49 64-35 15-19Z" fill="#efeee6" stroke="#c8c6bb"/><path d="M15-86 116-120M15-79 84-102" fill="none" stroke="#dad7cd" stroke-width="2"/><ellipse cx="126" cy="-63" rx="4" ry="5" fill="#c5c1b5"/>';
    array.appendChild(g);
    plates.push({ g, cap: g.querySelector('.cap'), tag: g.querySelector('.tag'), c: Math.floor(i / 13), r: i % 13 });
  }
  let L;
  function layout() {
    L = stage.portrait ? { w: 984, h: 700, cx: 450, cy: 440, col: [178, -62], row: [-48, 48], chart: [952, 56] }
      : { w: 1008, h: 510, cx: 455, cy: 350, col: [156, -48], row: [-34, 32], chart: [744, 64] };
    array.setAttribute('viewBox', `0 0 ${L.w} ${L.h}`);
    $('#chart').setAttribute('viewBox', `0 0 ${L.chart[0]} ${L.chart[1]}`);
    $('.read-button > span').textContent = stage.portrait ? '读取' : '读取档案 / READ RECORD';
    const instrument = $('#instrument');
    instrument.setAttribute('viewBox', '0 0 780 620');
  }
  layout(); stage.on('orient', layout);

  function renderArray(s, t) {
    const origin = Math.floor(s.orbitX) - 3;
    const enter = step(t - C.timing.bootEnd + 0.45, C.timing.liftRate);
    for (const p of plates) {
      const c = origin + p.c, logical = mod(c, 5), rowOrbit = s.orbitY;
      const row = Math.floor(rowOrbit) - 5 + p.r;
      const dx = c - s.orbitX, dy = row - rowOrbit;
      let lift = 0, wave = 0;
      s.selections.forEach((e, i) => {
        const end = s.selections[i + 1]?.t ?? Infinity;
        if (e.x === c && e.y === row) lift += 34 * (step(t - e.t, C.timing.liftRate) - step(t - end, C.timing.liftRate));
        const age = t - e.t, d = Math.hypot(row - e.y, 2.2 * (c - e.x));
        if (!reduced && age >= 0 && age < 3.2) {
          const front = age * 8 - d;
          const rise = clamp(age / .2), smooth = rise ** 3 * (10 - 15 * rise + 6 * rise * rise);
          wave += 22.4 * smooth * Math.exp(-1.15 * age) * Math.cos(front * 0.58) * Math.exp(-front * front / (2 * 3.4 ** 2));
        }
      });
      const selected = c === s.x && row === s.y;
      if (selected) lift += 102 * s.amount;
      const age = t - s.selections.at(-1).t;
      const breathe = reduced ? 0 : 3.4 * seg(age, C.timing.idleAfter, 1.5) * (0.6 * Math.sin(t * 2 * Math.PI / 8 + c * 0.8 + row * 0.5) + 0.4 * Math.sin(t * 2 * Math.PI / 13 + row));
      const px = Math.round(L.cx + dx * L.col[0] + dy * L.row[0] - (1 - enter) * 280);
      const py = Math.round(L.cy + dx * L.col[1] + dy * L.row[1] - lift - wave - breathe);
      p.g.setAttribute('transform', `translate(${px} ${py})`);
      p.g.setAttribute('opacity', String(clamp(Math.min((px + 140) / 150, (L.w - px) / 150, (py + 30) / 80, (L.h + 100 - py) / 110))));
      p.cap.setAttribute('fill', selected ? '#b46c3c' : '#fffdf9');
      p.tag.setAttribute('fill', selected ? '#c29a73' : '#efeee6');
      p.g.dataset.file = C.files[logical][mod(row, 8)].id;
    }
  }

  function rolling(el, from, to, p, height) {
    if (from === to || p >= 1) { el.textContent = to; return; }
    el.innerHTML = `<span style="transform:translateY(${-p * height}px);opacity:${1 - p}">${from}</span><span class="next" style="transform:translateY(${(1 - p) * height}px);opacity:${p}">${to}</span>`;
  }
  function numberRoll(from, to, p, direction) {
    const height = stage.portrait ? 72 : 68;
    $('#fileNumber').innerHTML = [...to].map((ch, i) => ch === from[i] || p >= 1 ? `<span>${ch}</span>` : `<span class="digit"><i style="transform:translateY(${-direction * p * height}px)">${from[i]}</i><i style="transform:translateY(${direction * (1 - p) * height}px)">${ch}</i></span>`).join('');
  }
  let contentKey = '';
  function renderFile(s, t) {
    const f = fileAt(s), last = s.selections.at(-1), from = C.files[last.fromCol][last.fromRow];
    const u = clamp((t - last.t) / C.timing.roll);
    const k = Math.floor(u * 48), sample = (n) => n >= 48 ? 1 : 1 - (1 + 10 * n / 48) * Math.exp(-10 * n / 48);
    const p = reduced || !last.key ? 1 : lerp(sample(k), sample(k + 1), u * 48 - k);
    numberRoll(from.id, f.id, p, ['ArrowUp', 'ArrowLeft'].includes(last.key) ? -1 : 1);
    rolling($('#fileTitle'), from.title, f.title, p, stage.portrait ? 72 : 56);
    rolling($('#fileEn'), from.en, f.en, p, stage.portrait ? 44 : 34);
    rolling($('#category'), `${C.columns[last.fromCol].code} / ${C.columns[last.fromCol].name}`, `${C.columns[s.col].code} / ${C.columns[s.col].name}`, p, stage.portrait ? 44 : 31);
    rolling($('#colName'), C.columns[last.fromCol].name, C.columns[s.col].name, p, stage.portrait ? 48 : 34);
    const key = `${f.id}/${stage.orient}`;
    if (key !== contentKey) {
      contentKey = key;
      $('#level').textContent = f.level;
      $('#timestamp').textContent = f.timestamp;
      $('#author').textContent = `复核 / ${f.author}`;
      $('#abstract').textContent = stage.portrait ? f.abstract.split('。')[0] + '。' : f.abstract;
      $('#note').textContent = f.note;
      $('#metrics').innerHTML = f.metrics.map((m) => `<div class="metric"><span>${m.label}</span><p><b>${m.value}</b><em>${m.unit}</em></p></div>`).join('');
      $('#inspectionId').textContent = f.id + ' / ' + f.en;
      const [w, h] = L.chart;
      const pts = f.series.map((v, i) => [4 + i * (w - 8) / (f.series.length - 1), h - 4 - v * (h - 8)]);
      $('#chart').innerHTML = `<path d="M0 4H${w}M0 ${h / 2}H${w}M0 ${h - 4}H${w}" fill="none" stroke="#bfc0b5"/>`
        + `<path d="M${pts.map((v) => v.join(' ')).join(' L')}" fill="none" stroke="#b46c3c" stroke-width="3"/>`
        + pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#b46c3c"/>`).join('');
      $('#chartValue').textContent = f.metrics[0].value;
    }
    $('#arrayCode').textContent = C.columns[s.col].code + ' / ' + C.columns[s.col].en;
    $('#loopState').textContent = `${MK.pad(s.row + 1)} / 08 · ${MK.pad(s.col + 1)} / 05`;
    $('#rowCount').textContent = `${MK.pad(s.row + 1)}/08`;
    const prev = s.selections.at(-2) || last;
    tickEls.forEach((el, i) => {
      const size = lerp(i === prev.row ? 40 : 18, i === s.row ? 40 : 18, seg(t, last.t, 0.4));
      el.style.height = size + 'px'; el.classList.toggle('on', i === s.row);
    });
    const complete = s.moves.length >= 12;
    $('#direction').textContent = t - last.t < 1.8 && last.key ? arrows[last.key] : complete ? 'CYCLE / RETURNED' : 'INDEX / STABLE';
    $('#modeLabel').textContent = complete ? 'TWO CYCLES / ORIGIN VERIFIED' : 'CIRCULAR INDEX / BIDIRECTIONAL';
    $('#stage').dataset.record = f.id;
    $('#stage').dataset.direction = last.key;
  }

  // Monotone Hermite sampling follows the measured decryption knots without overshoot.
  function curve(keys, time) {
    if (time <= keys[0][0]) return keys[0][1];
    if (time >= keys.at(-1)[0]) return keys.at(-1)[1];
    const slope = (i) => (keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]);
    const tangent = (i) => {
      if (!i || i === keys.length - 1) return 0;
      const a = slope(i - 1), b = slope(i);
      if (a * b <= 0) return 0;
      const h0 = keys[i][0] - keys[i - 1][0], h1 = keys[i + 1][0] - keys[i][0];
      return (3 * (h0 + h1)) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b);
    };
    let i = 0; while (time > keys[i + 1][0]) i++;
    const h = keys[i + 1][0] - keys[i][0], p = (time - keys[i][0]) / h;
    return (2 * p ** 3 - 3 * p * p + 1) * keys[i][1] + (p ** 3 - 2 * p * p + p) * h * tangent(i)
      + (-2 * p ** 3 + 3 * p * p) * keys[i + 1][1] + (p ** 3 - p * p) * h * tangent(i + 1);
  }
  const grow = [[34.24, 0], [34.4, .19], [34.64, .57], [34.96, .79], [35.28, .92], [35.6, .973], [36.04, 1]];
  const retract = [[37.72, 1], [37.88, .72], [38, .38], [38.12, .22], [38.24, .14], [38.4, .075], [38.64, .024], [38.84, 0]];
  const reveal = [[38.84, 0], [38.92, .28], [39, .51], [39.16, .74], [39.32, .94], [39.56, 1]];
  function renderDetail(s, t) {
    const mode = s.modes.at(-1), on = mode?.on;
    const alpha = mode ? on ? seg(t, mode.t + .25, .65, ease.outCubic) : 1 - seg(t, mode.t, .4) : 0;
    const browseText = mode ? on ? 1 - seg(t, mode.t, .18) : seg(t, mode.t + .25, .18) : 1;
    const inspectText = mode ? on ? seg(t, mode.t + .25, .18) : 1 - seg(t, mode.t, .18) : 0;
    $('#inspection').style.opacity = alpha;
    $('#inspection').style.pointerEvents = alpha > .5 ? 'auto' : 'none';
    $('.array-frame').style.opacity = (1 - s.amount) * seg(t, C.timing.bootEnd - .4, .8);
    for (const sel of ['.array-caption', '.field-foot', '.navigation']) $(sel).style.opacity = browseText * seg(t, C.timing.bootEnd, .6) * (1 - seg(t, C.outro, .18));
    for (const sel of ['.inspection-heading', '.inspection-caption', '.back-button']) $(sel).style.opacity = inspectText;
    $('.navigation').style.pointerEvents = browseText > .5 ? 'auto' : 'none';
    const dt = mode && on ? t - mode.t - 1 : -1;
    const ref = reduced && on ? 40 : 34.12 + Math.max(-1, dt) * 1.5;
    const clear = curve(reveal, ref);
    $('#instrumentCore').style.filter = `blur(${(1 - clear) * 5}px)`;
    $('#frost').style.clipPath = `inset(${clear * 100}% 0 0 0)`;
    const a = ref < 36.04 ? curve(grow, ref) : curve(retract, ref);
    const range = ref < 36.04 ? [[0, a / 2], [1 - a / 2, 1]] : [[.5 - a / 2, .5 + a / 2], [.5, .5]];
    ['#decodeA', '#decodeB'].forEach((id, i) => {
      const [u, v] = range[i];
      $(id).setAttribute('d', `M${lerp(80, 700, u)} ${lerp(482, 88, u)}L${lerp(80, 700, v)} ${lerp(482, 88, v)}`);
    });
    $('#diagonal').style.opacity = dt >= 0 && ref < 39.56 ? 1 : 0;
    $('#decryptPhase').textContent = ref < 34.24 ? 'ALIGNING' : ref < 36.04 ? 'JOINING' : ref < 37.72 ? 'CONNECTED' : ref < 38.84 ? 'DECODING' : clear < 1 ? 'REVEALING' : 'VERIFIED';
    const revealStart = mode?.t + 1 + (38.84 - 34.12) / 1.5;
    parts.forEach((el, i) => {
      const progress = clamp((t - revealStart) / .95);
      const local = clamp((progress - i / (parts.length - 1) * .22) / .78);
      const r = on && dt >= 0 ? local < .2 ? .4 * (local / .2) ** 2 : 1 - .6 * ((1 - local) / .8) ** (16 / 3) : 1;
      el.style.setProperty('--reveal', String(r));
      if (!el.classList.contains('redacted')) el.style.opacity = on && dt >= 0 ? .14 + .86 * r : 1;
    });
    $('.read-button').style.opacity = 1 - s.amount;
    $('.read-button').style.pointerEvents = s.amount < .1 ? 'auto' : 'none';
  }

  const arcs = [...document.querySelectorAll('.signal-arc')];
  const signalPaths = [100, 72, 42].map((d) => `M${120 - d} ${164 - d}a${Math.SQRT2 * d} ${Math.SQRT2 * d} 0 0 1 ${2 * d} 0`);
  arcs.forEach((el, i) => el.setAttribute('d', signalPaths[i]));
  $('#outro > svg path').setAttribute('d', signalPaths.join(''));
  const accessCounts = [1, 1, 3, 4, 5, 6, 9, 11, 12, 14, 17, 18, 19, 20, 22, 23, 25, 26];
  const typed = (text, frame, start, end) => text.slice(0, frame < start ? 0 : Math.min(text.length, 1 + Math.floor((frame - start) * (text.length - 1) / (end - start))));
  function renderBoot(t) {
    const f = Math.floor((t + 5) * 25 + .00001);
    const exit = seg(t, 21.56, .36, ease.inOutCubic);
    $('#boot').style.opacity = t < 21.92 ? 1 - exit : 0;
    $('#boot').style.pointerEvents = t < 21.92 ? 'auto' : 'none';
    $('#bootFrame').textContent = `FRAME ${String(f).padStart(4, '0')} / 25 FPS`;
    $('.boot-access').style.opacity = t < 14.48 ? 1 : 0;
    const signalOn = f >= 170;
    $('#signal').style.opacity = signalOn ? 1 : 0;
    arcs.forEach((el, i) => {
      const start = 173 + (2 - i) * 4, k = clamp((f - start) / 3);
      el.style.opacity = .12 + .88 * k;
      el.style.strokeDasharray = '1'; el.style.strokeDashoffset = 1 - k;
      el.setAttribute('pathLength', '1');
    });
    $('#signalDot').style.opacity = signalOn && (f >= 188 || f % 4 < 3) ? 1 : .15;
    $('#signal').style.transform = `translateY(${-seg(t, 4.16, 1.5, ease.outCubic) * (stage.portrait ? 40 : 10)}px)`;
    $('#accessText').textContent = f >= 170 && f < 227 ? 'ARCHIVE CONNECTION REQUEST'.slice(0, accessCounts[Math.min(17, f - 170)]) : f < 279 ? 'FIELDWORK / ACCESS GATEWAY' : '';
    $('#accessText').style.opacity = f >= 170 ? 1 : 0;
    let auth = '';
    if (f < 363) {
      auth = typed('IDENTITY VERIFIED', f, 282, 295);
      if (f >= 320) auth += ' / ' + typed('OPERATOR 07', f, 321, 339);
    } else if (f < 421) auth = typed('REQUEST ACCEPTED', f, 367, 389);
    else auth = typed('INDEX PREPARATION', f, 423, 440) + (f >= 449 ? '.'.repeat(Math.min(3, 1 + Math.floor((f - 449) / 4))) : '');
    $('#authText').textContent = auth;
    $('#authText').style.opacity = f >= 281 && f < 487 && ![479, 485, 486].includes(f) ? 1 : 0;
    $('#scan').style.opacity = t >= 14.48 && t < 17.76 ? 1 : 0;
    const sp = seg(t, 14.48, 1.32, ease.outCubic), glitch = [525, 526, 528, 529].includes(f);
    $('#scanRings').setAttribute('transform', `scale(${lerp(6.9, 1, sp) * (glitch ? 1.94 : 1)}) rotate(${(t - 14.48) * 16})`);
    $('#scanRings').style.opacity = glitch ? .32 : seg(t, 14.48, .24);
    const angle = (t - 14.48) * 2.2;
    $('#orbitDot').setAttribute('cx', Math.cos(angle) * 266);
    $('#orbitDot').setAttribute('cy', Math.sin(angle) * 266);
    $('#welcome').style.opacity = t >= 17.76 && t < 21.92 ? 1 : 0;
    const flash = [1, 0, .28, 0, 1, 0, 0][f - 569] || 0;
    $('#welcome').style.background = flash ? `rgba(39,41,34,${flash})` : 'transparent';
    $('#welcomeName').style.opacity = f >= 588 && ![590, 591].includes(f) ? 1 : 0;
    $('#welcomeName').style.clipPath = `inset(0 ${(1 - seg(t, 18.52, .92, ease.outCubic)) * 100}% 0 0)`;
    $('#welcomeDatabase').style.opacity = f >= 626 && ![628, 629, 631, 634].includes(f) ? 1 : 0;
    $('#bootStatus').textContent = t < 1.8 ? 'STANDBY' : t < 4.12 ? 'LINK / NEGOTIATING' : t < 14.48 ? 'IDENTITY / VERIFIED' : t < 17.76 ? 'AUTHORIZATION / SCANNING' : 'DATABASE / ONLINE';
  }

  function render(t) {
    const s = derive(events, t);
    renderBoot(t); renderArray(s, t); renderFile(s, t); renderDetail(s, t);
    const leaveText = 1 - seg(t, C.outro, .18);
    $('.brand').style.opacity = seg(t, C.timing.bootEnd, .6) * leaveText;
    $('.session').style.opacity = seg(t, C.timing.bootEnd, .6) * leaveText;
    $('.dossier').style.opacity = seg(t, C.timing.bootEnd, .8) * leaveText;
    $('.footer').style.opacity = seg(t, C.timing.bootEnd, .6) * leaveText;
    $('#clock').textContent = `09:${MK.pad(41 + Math.floor(t / 60))}:${MK.pad(Math.floor(t) % 60)}`;
    const out = seg(t, C.outro, .8, ease.inOutCubic);
    $('#outro').style.opacity = out;
    [...$('#outro').children].filter((el) => el.tagName !== 'svg').forEach((el) => { el.style.opacity = seg(t, C.outro + .25, .4); });
    $('#outro h2').style.transform = `translateY(${(1 - out) * 36}px)`;
  }

  const switchNotes = { ArrowUp: 'E6', ArrowDown: 'C6', ArrowLeft: 'A5', ArrowRight: 'D6' };
  const switchScore = (e) => [
    { t: e.t, voice: 'chime', note: switchNotes[e.key], decay: .24, ratio: 2.71, index: 1.1, vel: .45, pan: e.key === 'ArrowLeft' ? -.55 : e.key === 'ArrowRight' ? .55 : 0 },
    { t: e.t + .04, voice: 'paper', dur: .23, tone: 2800, vel: .28 },
    { t: e.t + .46, voice: 'blip', note: switchNotes[e.key], vel: .22 },
  ];
  const readScore = (t) => [
    { t, voice: 'chime', note: 'A5', decay: .58, vel: .55 },
    { t: t + 1, voice: 'beep', f: 960, dur: .06, vel: .4 },
    { t: t + 1.12, voice: 'beep', f: 960, dur: .06, vel: .4 },
    { t: t + 3.4, voice: 'glitch', dur: .44, density: 22, bits: 8, vel: .16 },
    { t: t + 4.147, voice: 'whoosh', dur: .48, vel: .3 },
    { t: t + 4.627, voice: 'confirm', f: 640, vel: .45 },
  ];
  const eventScore = (list) => list.flatMap((e, i) => arrows[e.key] ? switchScore(e) : e.key === 'Enter'
    ? readScore(e.t).filter((cue) => cue.t < (list.slice(i + 1).find((x) => x.key === 'Escape')?.t ?? Infinity))
    : [{ t: e.t, voice: 'chime', note: 'D5', decay: .22, vel: .4 }]);
  const SCORE = [
    { t: 0, voice: 'air', dur: C.duration, tone: 1400, vel: .35, fade: 1.2 },
    { t: 4.16, voice: 'pad', notes: ['D3', 'A3', 'E4'], dur: 13.6, attack: .72, vel: .33 },
    { t: 14.48, voice: 'reverse', dur: 1.32, vel: .32 },
    ...[14.48, 15.04, 15.6, 16.16].map((t, i) => ({ t, voice: 'beep', f: 640 + i * 160, dur: .08, vel: .45 })),
    { t: 17.76, voice: 'pad', notes: ['D3', 'A3', 'C#4', 'E4'], dur: 4.2, attack: .3, vel: .5 },
    { t: 18.52, voice: 'confirm', f: 640, steps: [0, 7], vel: .5 },
    { t: 21.92, voice: 'whoosh', dur: .65, vel: .45 },
    { t: 21.92, voice: 'chime', note: 'D5', vel: .48 },
    ...[1.8, 1.96, 2.12, 2.28].map((t, i) => ({ t, voice: 'blip', note: ['D5', 'A5', 'D6', 'E6'][i], vel: .35 })),
    ...[...Array(18)].map((_, i) => ({ t: 1.8 + i / 25, voice: 'tick', vel: .25 })),
    ...[6.28, 7.84, 9.68, 11.92].flatMap((t) => [...Array(12)].map((_, i) => ({ t: t + i / 25, voice: 'tick', vel: .22 }))),
    ...[22, 30, 38, 46, 54].map((t, i) => ({ t, voice: 'pad', notes: [['D3', 'A3', 'C#4', 'E4'], ['B2', 'F#3', 'A3', 'D4'], ['G2', 'D3', 'A3', 'B3'], ['A2', 'E3', 'B3', 'D4'], ['D3', 'A3', 'E4', 'F#4']][i], dur: 8, attack: 1, release: 1, vel: .46 })),
    MK.audio.pattern({ bpm: C.bpm, from: 22, to: 50, tracks: { rim: 'X.......o.......', hat: '....o.......o...' }, voices: { rim: { gain: .28 }, hat: { gain: .18 } } }),
    ...[...Array(19)].map((_, i) => ({ t: 22 + i * 2, voice: 'pluck', note: ['D4', 'E4', 'A4', 'F#4', 'B4', 'A4', 'E4', 'C#4'][i % 8], vel: .3, decay: .7, pan: i % 2 ? .25 : -.25 })),
    { t: 60, voice: 'pad', notes: ['D3', 'A3', 'D4', 'E4', 'F#4'], dur: 2.5, attack: .15, release: .6, vel: .5 },
    { t: 60.1, voice: 'confirm', note: 'D6', steps: [0, 7, 12], vel: .5 },
  ];
  const markers = [{ t: 0, label: '启动待机' }, { t: 1.8, label: '无线链路' }, { t: 6.24, label: '身份验证' }, { t: 14.48, label: '授权扫描' }, { t: 17.76, label: '欢迎' }, { t: 21.92, label: '档案阵列' },
    ...C.events.map((e) => ({ t: e.t, label: arrows[e.key] || (e.key === 'Enter' ? '抽取与解密' : '返回阵列') })), { t: 54.147, label: '自上而下揭示' }, { t: 60, label: '闭环收尾' }].sort((a, b) => a.t - b.t);
  const tl = MK.timeline({ duration: C.duration, render, markers });
  const schedule = MK.audio.attach(tl, [...SCORE, ...eventScore(events)]);
  const seek = tl.seek, play = tl.play;
  function auto() {
    if (events !== C.events) { events = C.events; schedule.set([...SCORE, ...eventScore(events)]); }
  }
  tl.seek = (t) => { auto(); return seek(t); };
  tl.play = () => { auto(); return play(); };

  // Manual input appends timeline events, so controls, seeks and audio keep one clock.
  function input(key) {
    if (P.render || !arrows[key] && !['Enter', 'Escape'].includes(key)) return;
    const now = tl.time < C.timing.bootEnd || tl.time >= C.outro ? C.timing.bootEnd + .3 : tl.time;
    const s = derive(events, now);
    if (s.detail && key !== 'Escape' || !s.detail && key === 'Escape') return;
    events = [...events.filter((e) => e.t <= now), { t: now + .001, key }];
    schedule.set([...SCORE, ...eventScore(events)]);
    seek(now); play();
  }
  addEventListener('keydown', (e) => {
    if (P.render || ![...Object.keys(arrows), 'Enter', 'Escape'].includes(e.key) || e.target.closest('input,textarea,select') || e.target.closest('button:not([data-key]),a')) return;
    e.preventDefault(); e.stopImmediatePropagation(); input(e.key);
  }, true);
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-key]'); if (b) input(b.dataset.key); });
  MK.expose(tl, { title: C.title, bpm: C.bpm });
  MK.controls(tl, { accent: '#b46c3c' });
  MK.start(tl, { t: 0, reduced: 24 });
})();
