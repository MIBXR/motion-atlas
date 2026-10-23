(() => {
  'use strict';
  const MK=MotionKit,C=window.CONFIG,E=MK.ease,{clamp,lerp}=MK;
  const seg=(t,start,duration,ease=E.linear)=>ease(clamp((t-start)/duration,0,1));
  const $=(s,r=document)=>r.querySelector(s);
  const written=new WeakMap();
  function write(object,key,value){const next=String(value);let values=written.get(object);if(!values)written.set(object,values=new Map());if(values.get(key)!==next){object[key]=next;values.set(key,next);}}
  function styles(style,values){for(const[key,value]of Object.entries(values))write(style,key,value);}
  function attribute(el,key,value){const next=String(value);if(el.getAttribute(key)!==next)el.setAttribute(key,next);}
  const nodes=new WeakMap();
  function node(selector,root=document){let cache=nodes.get(root);if(!cache)nodes.set(root,cache=new Map());if(!cache.has(selector))cache.set(selector,root.querySelector(selector));return cache.get(selector);}
  function nodeList(selector,root=document){let cache=nodes.get(root);if(!cache)nodes.set(root,cache=new Map());const key='all:'+selector;if(!cache.has(key))cache.set(key,root.querySelectorAll(selector));return cache.get(key);}
  const brand=()=>`<div class="brand" aria-hidden="true">${C.brand.map(c=>`<i style="background:${c}"></i>`).join('')}</div>`;
  const paths={
    gear:'M20 4h8l2 7 6 3 7-2 4 7-5 5v7l5 5-4 7-7-2-6 3-2 7h-8l-2-7-6-3-7 2-4-7 5-5v-7l-5-5 4-7 7 2 6-3zM32 27a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    crystal:'M24 3 40 17 33 43H15L8 17zM24 3v40M8 17h32M15 43l9-26 9 26',box:'M5 13 24 4l19 9v25l-19 9-19-9zM5 13l19 10 19-10M24 23v24',
    module:'M8 8h32v32H8zM16 16h16v16H16zM16 2v6M32 2v6M16 40v6M32 40v6M2 16h6M2 32h6M40 16h6M40 32h6',can:'M12 11q12-10 24 0v28q-12 9-24 0zM12 11q12 10 24 0M12 32q12 10 24 0',
    close:'M12 12l24 24M36 12 12 36',warehouse:'M4 20 24 4l20 16v24H4zM16 44V26h16v18',chevrons:'M6 12l12 12L6 36M24 12l12 12-12 12',check:'M8 25 19 36 41 12',arrow:'M6 24h34M27 11l13 13-13 13',copy:'M17 5h25v29H17zM8 14H5v29h25v-3',rotate:'M10 18a16 16 0 1 1 0 16M10 7v13h13',
    power:'M26 3 12 27h12l-3 18 17-26H25z',flame:'M26 3c0 14 14 18 14 29a16 16 0 0 1-32 0c0-9 9-13 10-23l8 10z',plant:'M24 44V23M24 31C5 33 5 12 7 8c20-2 20 19 17 23zM24 24C24 5 40 5 43 7c0 19-19 17-19 17z',belt:'M4 12h40v24H4zM10 18l6 6-6 6M23 18l6 6-6 6M36 18l6 6-6 6',splitter:'M5 24h16V10h20M21 24v14h20M33 3l8 7-8 7M33 31l8 7-8 7',core:'M24 4 44 42H4zM24 12 36 36H12zM24 4v18M4 42l16-14M44 42 28 28',crusher:'M6 6h36v12L29 32v12H19V32L6 18zM12 12l8 8 8-8 8 8',diamond:'M24 4 44 24 24 44 4 24z'
  };
  function icon(name,size=48){return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path${name==='gear'?' transform="translate(2 0) scale(.9)"':''} d="${paths[name]||paths.module}"/></svg>`;}
  function roll(el,from,to,k){
    const a=String(from).padStart(String(to).length,'0'),b=String(to);
    write(el,'innerHTML',Array.from(b,(v,i)=>`<span><b>${a[i]}<br>${v}</b></span>`).join(''));
    for(const span of el.children)write(span.firstElementChild.style,'transform',`translateY(${-clamp(k,0,1)*50}%)`);
    attribute(el,'aria-label',String(Math.round(lerp(from,to,clamp(k,0,1)))));
  }

function machineSVG(m, ghost = false) {
  const w = m.w, h = m.h, x = w / 2, y = h / 2;
  const edge = ghost ? '#2d8cff' : '#1f2225';
  const seam = ghost ? '#2d8cff' : '#3d4247';
  const panel = ghost ? '#2d8cff47' : '#2e3236';
  const line = ghost ? '#2d8cff' : '#e8eaea';
  const accent = ghost ? '#2d8cff' : '#ffe400';
  const dark = ghost ? '#2d8cff47' : '#1f2225';
  const lamp = ghost ? '#2d8cff' : '#4aa8ff';
  const solid = ghost ? '#2d8cff47' : '#e8eaea';
  const path = (d, stroke = line, width = 1, fill = 'none', extra = '') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
  const circle = (cx, cy, r, fill = dark, stroke = line, width = 1, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
  const slats = (sx, sy, count, length, spacing) => Array.from({ length: count }, (_, i) => path(`M${sx} ${sy + i * spacing}h${length}`, line, 2)).join('');
  const center = content => `<g class="machine-center-icon">${content}</g>`;
  let art = '', defs = '';

  if (m.id === 'furnace') {
    const gid = `machine-mouth-${m.id}${ghost ? '-ghost' : ''}`;
    defs = `<radialGradient id="${gid}"><stop offset="0" stop-color="#ffd08a"/><stop offset=".38" stop-color="#ff8a2a"/><stop offset=".76" stop-color="#ed6520"/><stop offset="1" stop-color="#6f341c"/></radialGradient>`;
    art = center(circle(x, y, 27, dark, edge, 2)
      + circle(x, y, 24, ghost ? panel : `url(#${gid})`, line, 1, 'class="machine-furnace-mouth"'))
      + [-1, 1].map(side => Array.from({ length: 5 }, (_, i) => path(`M${x + side * (32 + i * 4)} ${y - 16}v32`, line, 2)).join('')).join('');
  } else if (m.id === 'a' || m.id === 'b') {
    const teeth = Array.from({ length: 32 }, (_, i) => {
      const a = i * Math.PI / 16, r = i % 4 === 0 || i % 4 === 3 ? 21 : 17;
      return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(3)} ${(Math.sin(a) * r).toFixed(3)}`;
    }).join(' ') + 'Z';
    art = center(circle(x, y, 24, dark, edge, 1)
      + `<g transform="translate(${x} ${y})"><g class="machine-gear-rotor">${path(teeth, line, 2)}${circle(0, 0, 7, 'none', line, 2)}</g></g>`)
      + slats(x - 26, y - 40, 3, 52, 5) + slats(x - 26, y + 30, 3, 52, 5);
  } else if (m.id === 'crusher') {
    art = center([-18, 18].map((dx, i) => {
      const cuts = Array.from({ length: 6 }, (_, j) => {
        const a = j * Math.PI / 3;
        return path(`M${(Math.cos(a) * 6).toFixed(3)} ${(Math.sin(a) * 6).toFixed(3)}L${(Math.cos(a) * 18).toFixed(3)} ${(Math.sin(a) * 18).toFixed(3)}`, line, 2);
      }).join('');
      return `<g transform="translate(${x + dx} ${y})"><g class="machine-cut-rotor machine-cut-${i ? 'right' : 'left'}">${circle(0, 0, 18, dark, line, 2)}${cuts}${circle(0, 0, 4, solid, line, 1)}</g></g>`;
    }).join(''));
  } else if (m.id === 'box') {
    art = center([0, 1, 2, 3].map(i => {
      const sx = x - 27 + (i % 2) * 30, sy = y - 31 + Math.floor(i / 2) * 30;
      return `<rect x="${sx}" y="${sy}" width="24" height="24" fill="${dark}" stroke="${line}" stroke-width="1"/>`
        + slats(sx + 4, sy + 8, 2, 16, 8);
    }).join(''))
      + `<rect x="${w * .4 - 12}" y="${h - 23}" width="${w * .6}" height="6" fill="${ghost ? panel : accent}" stroke="${ghost ? line : 'none'}" stroke-width="1"/>`;
  } else if (m.id === 'plant') {
    art = center([-20, 0, 20].map(dy => `<rect x="${x - 37}" y="${y + dy - 7}" width="74" height="14" fill="${dark}" stroke="${edge}" stroke-width="1"/>`
      + [-24, -12, 0, 12, 24].map(dx => circle(x + dx, y + dy, 1.5, ghost ? panel : '#7bd88f', ghost ? line : 'none', ghost ? 1 : 0)).join('')).join(''));
  } else if (m.id === 'power') {
    art = center(`<rect x="${x - 8}" y="${y - 28}" width="16" height="56" fill="${dark}" stroke="${line}" stroke-width="1"/>`
      + path(`M${x} ${y - 42}l10 14-10 14-10-14Z`, line, 2, dark)
      + path(`M${x} ${y - 11}l-5 13h7l-4 11`, line, 1))
      + Array.from({ length: 3 }, (_, i) => `<path class="machine-power-arc" data-arc="${i}" fill="none" stroke="${line}" stroke-width="1" opacity=".9"/>`).join('');
  } else if (m.id === 'core') {
    const r = Math.min(w, h) * .33;
    const vertices = radius => [-90, 30, 150].map(a => [x + Math.cos(a * Math.PI / 180) * radius, y + Math.sin(a * Math.PI / 180) * radius]);
    const outer = vertices(r), inner = vertices(r * .6);
    const triangle = points => points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(3)} ${py.toFixed(3)}`).join(' ') + 'Z';
    art = path(triangle(outer), line, 6) + path(triangle(inner), line, 6)
      + path(outer.map(([px, py]) => `M${px.toFixed(3)} ${py.toFixed(3)}L${x} ${y}`).join(' '), line, 6)
      + circle(x, y, 30, 'none', accent, 8)
      + path(`M${x} ${y - 20}l20 20-20 20-20-20Z`, line, 1, solid);
  }

  const arrows = `M${x} 5l-5 10h10Z M${w - 5} ${y}l-10-5v10Z M${x} ${h - 5}l-5-10h10Z M5 ${y}l10-5v10Z`;
  const corners = `M14 2H2v12 M${w - 14} 2h12v12 M${w - 2} ${h - 14}v12h-12 M14 ${h - 2}H2v-12`;
  return `<svg class="machine-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible" data-machine-art="${m.id}" data-ghost="${ghost}" aria-hidden="true"><defs>${defs}</defs><g class="machine-art-frame">`
    + `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="${panel}" stroke="${edge}" stroke-width="${ghost ? 2 : 6}"/>`
    + path(`M${x} 6V${h - 6}M6 ${y}H${w - 6}`, seam, 1)
    + art
    + path(arrows, ghost ? line : 'none', ghost ? 1 : 0, solid, 'class="machine-edge-arrows"')
    + path(corners, accent, 3, 'none', 'class="corner-marks"')
    + circle(w - 17, 17, 5, 'none', lamp, 2, 'class="machine-lamp-halo" opacity=".3"')
    + circle(w - 17, 17, 3, ghost ? panel : lamp, ghost ? line : 'none', ghost ? 1 : 0, 'class="machine-lamp"')
    + circle(x, y, Math.min(w, h) * .36, 'none', line, 1, 'class="work-ring" stroke-dasharray="70 156" opacity="0"')
    + '</g></svg>';
}

function renderMachineDetails(m, el, t, active, ghost = false, portrait = false) {
  const wake = m.wake === undefined ? Number(active) : seg(t, m.wake, .3);
  let color = ghost ? C.tokens.ghost : active ? C.tokens.ok : C.tokens.zz;
  if (portrait && !ghost && m.wake !== undefined && wake < 1) {
    color = `rgb(${[1, 3, 5].map(i => Math.round(lerp(parseInt(C.tokens.zz.slice(i, i + 2), 16), parseInt(C.tokens.ok.slice(i, i + 2), 16), wake))).join(',')})`;
  }
  nodeList('.machine-center-icon',el).forEach(icon => attribute(icon, 'opacity', portrait && !ghost ? .7 + .3 * wake : 1));
  nodeList('.machine-lamp',el).forEach(lamp => attribute(lamp, 'fill', ghost ? '#2d8cff47' : color));
  nodeList('.machine-lamp-halo',el).forEach(halo => attribute(halo, 'stroke', color));
  nodeList('.machine-furnace-mouth',el).forEach(mouth => attribute(mouth, 'opacity', String(active ? .72 + .28 * Math.sin(t * Math.PI * 2 / .8) : .45)));
  nodeList('.machine-gear-rotor',el).forEach(gear => attribute(gear, 'transform', `rotate(${active ? t * 180 : 0})`));
  const period = C.machineArt?.crusherPeriod;
  const roll = active && period ? t * 360 / period : 0;
  nodeList('.machine-cut-left',el).forEach(rotor => attribute(rotor, 'transform', `rotate(${roll})`));
  nodeList('.machine-cut-right',el).forEach(rotor => attribute(rotor, 'transform', `rotate(${-roll})`));
  const tick = Math.floor(t / .3);
  const seed = n => {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return v - Math.floor(v);
  };
  nodeList('.machine-power-arc',el).forEach((arc, i) => {
    const points = Array.from({ length: 7 }, (_, j) => {
      const a = (i * 120 - 18 + j * 12) * Math.PI / 180;
      const r = Math.min(m.w, m.h) * .36 + (seed(tick * 131 + i * 17 + j) - .5) * 8;
      return `${j ? 'L' : 'M'}${(m.w / 2 + Math.cos(a) * r).toFixed(3)} ${(m.h / 2 + Math.sin(a) * r).toFixed(3)}`;
    }).join(' ');
    attribute(arc, 'd', points);
  });
}

function createPanel(host) {
  const root = document.createElement('section');
  root.id = 'machine-panel';
  attribute(root, 'aria-label', '配件机生产面板');
  const items = [
    ['crystal', 45, 'white'], ['module', 29, 'gold'], ['gear', 20, 'purple'], ['can', 21, 'white'],
    ['gear', 2, 'purple'], ['box', 50, 'gold'], ['can', 1, 'purple'], ['module', 1, 'white'],
    ['crystal', 11, 'gold'], ['crystal', 20, 'purple'], ['crystal', 10, 'purple'], ['box', 19, 'white'],
  ];
  const num = (name, value) => `<span class="mp-number" data-number="${name}"><span>${value}</span><span>${value}</span></span>`;
  write(root, "innerHTML", `<div class="mp-dimmer"></div><div class="mp-pane">
    <header class="mp-header"><span class="mp-header-icon">${icon('gear', 48)}</span><h2>配件机</h2><i></i><p>耗电功率值: 20</p></header>
    <div class="mp-warehouse">${icon('warehouse', 36)}</div><div class="mp-close" aria-label="关闭">${icon('close', 36)}</div>
    <div class="mp-toggle"><b>开</b><span>关</span></div>
    <div class="mp-mini-actions"><span>移动</span><i></i><span>收纳</span></div>
    <div class="mp-bag-title"><h3>背包</h3><span>容量 24/35</span></div>
    <div class="mp-bag-grid">${items.map(([name, count, rarity], i) => `<div class="mp-item mp-rarity-${rarity}${i === 2 ? ' mp-accessory' : ''}" aria-label="${i === 2 ? '配件' : '背包物品'}"><div class="mp-item-icon">${icon(name, 64)}</div>${num(`bag-${i}`, count)}<i class="mp-rarity"></i><i class="mp-item-flash"></i></div>`).join('')}</div>
    <div class="mp-drop"><b>四号谷地仓库｜全部</b><p>将物品拖入该区域，可展开并存放入仓库</p></div>
    <div class="mp-machine-visual"><svg viewBox="0 0 360 250" fill="none" aria-label="配件机正视线框示意图"><g stroke="currentColor" stroke-width="2"><path d="M83 26h194l24 22v158l-24 22H83l-24-22V48z"/><path d="M93 26v202m174-202v202M59 74h242M59 174h242M112 51h136v145H112z"/><path d="M133 68h94v110h-94zM180 68v110M133 122h94M112 196l21-18m115 18-21-18M35 90h24m242 0h24M35 158h24m242 0h24"/><path d="M152 94l28-16 28 16v36l-28 16-28-16zM152 94l28 16 28-16m-28 16v36"/><path stroke="var(--yellow-deep)" stroke-width="5" d="M59 58V42h22m198 0h22v16M59 192v16h22m198 0h22v-16"/></g></svg></div>
    <div class="mp-slot mp-input"><span class="mp-slot-icon">${icon('crystal', 54)}</span>${num('input', 9)}<small>晶体</small></div>
    <div class="mp-slot mp-output"><span class="mp-slot-icon">${icon('gear', 54)}</span>${num('output', 0)}<small>配件</small><i class="mp-output-flash"></i></div>
    <svg class="mp-flow" viewBox="0 0 700 240" fill="none" aria-hidden="true"><path d="M46 126h173m262 0h173" stroke="currentColor" stroke-width="2"/><path d="m205 118 12 8-12 8m435-16 12 8-12 8" stroke="currentColor" stroke-width="2"/></svg>
    <div class="mp-cycle"><i></i><i></i><span>2秒</span></div>
    <div class="mp-recipe-title">当前自动生产中的配方</div>
    <div class="mp-recipe"><span>${icon('crystal', 42)}</span><i>${icon('arrow', 24)}</i><b>${icon('chevrons', 28)} 2秒</b><i>${icon('arrow', 24)}</i><span>${icon('gear', 42)}</span></div>
    <div class="mp-collect"><i></i><span>全部收取</span><b>${icon('warehouse', 30)}</b></div>
    <div class="mp-progress"><i></i></div><div class="mp-producing">${icon('chevrons', 20)}<span>生产中</span></div>
    <div class="mp-flying">${icon('gear', 40)}</div><div class="mp-flying">${icon('gear', 40)}</div>
  </div>`);
  host.appendChild(root);
  const pane = root.querySelector('.mp-pane');
  const dimmer = root.querySelector('.mp-dimmer');
  const progress = root.querySelector('.mp-progress i');
  const outputFlash = root.querySelector('.mp-output-flash');
  const bagFlash = root.querySelector('.mp-accessory .mp-item-flash');
  const collect = root.querySelector('.mp-collect');
  const flights = [...root.querySelectorAll('.mp-flying')];
  const numbers = Object.fromEntries([...root.querySelectorAll('[data-number]')].map(el => [el.dataset.number, el]));
  const dots = [...root.querySelectorAll('.mp-cycle i')];
  function roll(el, before, after, q) {
    write(el.children[0], "textContent", before);
    write(el.children[1], "textContent", after);
    write(el.children[0].style, "transform", `translateY(${-100 * q}%)`);
    write(el.children[1].style, "transform", `translateY(${100 - 100 * q}%)`);
  }
  function sequence(name, initial, events, t) {
    let before = initial, after = initial, q = 1;
    for (const [time, next] of events) {
      if (t < time) break;
      before = after; after = next; q = seg(t, time, .18, E.outCubic);
    }
    roll(numbers[name], before, after, q);
  }
  function targets(p) {
    return p ? { collect: { x: 540, y: 1088 }, close: { x: 1020, y: 748 } } : { collect: { x: 1388, y: 680 }, close: { x: 1570, y: 218 } };
  }
  function render(t, p, deviceRect) {
    const visible = t >= 25 && t < 35.5;
    write(root.style, "display", visible ? 'block' : 'none');
    const open = seg(t, 25, p ? .4 : .5, E.outCubic);
    const close = seg(t, 35, .5, E.outCubic);
    const active = open * (1 - close);
    const x = p ? 0 : 300, y = p ? 700 : 170, w = p ? 1080 : 1320, h = p ? 1220 : 730;
    let px = x, py = y, sx = 1, sy = 1;
    if (p && t < 35) py = y + 1220 * (1 - open);
    else {
      px = lerp(deviceRect.x, x, active); py = lerp(deviceRect.y, y, active);
      sx = lerp(deviceRect.w / w, 1, active); sy = lerp(deviceRect.h / h, 1, active);
    }
    write(pane.style, "transform", `translate(${px}px,${py}px) scale(${sx},${sy})`);
    write(pane.style, "opacity", String(clamp(active * 5, 0, 1)));
    write(dimmer.style, "opacity", String(active));
    const elapsed = clamp(t - 25.5, 0, 5.5), cycle = elapsed % 2 / 2;
    write(progress.style, "width", `${100 * cycle}%`);
    dots.forEach((dot, i) => { write(dot.style, "opacity", cycle >= i * .5 ? '1' : '.3'); });
    sequence('input', 9, [[27.5, 8], [29.5, 7]], t);
    sequence('output', 0, [[27.5, 1], [29.5, 2], [32.1, 1], [32.25, 0]], t);
    sequence('bag-2', 20, [[32.5, 21], [32.65, 22]], t);
    const flashAt = (time, duration = .15) => t >= time && t < time + duration ? 1 - (t - time) / duration : 0;
    write(outputFlash.style, "opacity", String(Math.max(flashAt(27.5), flashAt(29.5))));
    write(bagFlash.style, "opacity", String(Math.max(flashAt(32.5), flashAt(32.65))));
    const pressed = t >= 32 && t < 32.12;
    write(collect.style, "background", pressed ? 'var(--yellow-deep)' : 'var(--yellow)');
    write(collect.style, "transform", `translateY(${pressed ? 2 : 0}px)`);
    const from = p ? { x: 930, y: 194 } : { x: 1148, y: 276 };
    const to = p ? { x: 644, y: 576 } : { x: 312, y: 264 };
    flights.forEach((el, i) => {
      const q = seg(t, 32.1 + i * .15, .4, E.inOutCubic);
      const x = (1 - q) ** 2 * from.x + 2 * (1 - q) * q * (from.x + to.x) / 2 + q ** 2 * to.x;
      const y = (1 - q) ** 2 * from.y + 2 * (1 - q) * q * (Math.min(from.y, to.y) - (p ? 180 : 180)) + q ** 2 * to.y;
      write(el.style, "display", q > 0 && q < 1 ? 'grid' : 'none');
      write(el.style, "transform", `translate(${x - 24}px,${y - 24}px) rotate(${q * 180}deg)`);
    });
  }
  return { root, render, targets };
}

function createOperator(host) {
  const svg = (content, size = 48, view = '0 0 48 48') => `<svg width="${size}" height="${size}" viewBox="${view}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
  const shapes = [
    '<path d="M11 35 34 12m-20 2 21 21M25 9l14 14M9 25l14 14"/><path d="m29 10 9 9-7 1-3-3z"/>',
    '<path d="M24 39S7 29 7 18c0-11 13-12 17-3 4-9 17-8 17 3 0 11-17 21-17 21Z"/><path d="M12 24h7l3-8 5 16 4-8h5"/>',
    '<path d="m24 6 15 6v12c0 10-15 18-15 18S9 34 9 24V12Z"/><path d="M24 14v18m-9-9h18"/>',
    '<path d="m25 4-13 23h11l-1 17 14-25H25Z"/>',
  ];
  const skillShapes = [
    '<path d="m30 7-17 20h12l-7 14 18-21H24Z"/>',
    '<circle cx="24" cy="24" r="8"/><path d="m24 5 5 9 10 1-4 9 4 9-10 1-5 9-5-9-10-1 4-9-4-9 10-1Z"/>',
    '<path d="m24 7 17 28H7Z"/><circle cx="24" cy="26" r="6"/><path d="M24 7v9m17 19-9-5M7 35l9-5"/>',
    '<path d="M9 24c0-8 7-15 15-15m15 15c0 8-7 15-15 15"/><path d="m17 5 7 4-6 6m13 28-7-4 6-6"/><circle cx="24" cy="24" r="7"/>',
  ];
  const star = svg('<path d="m24 5 5.8 11.7 12.9 1.9-9.4 9.1 2.2 12.9L24 34.5l-11.5 6.1 2.2-12.9-9.4-9.1 12.9-1.9Z" fill="currentColor" stroke="none"/>', 21);
  const silhouette = (background = false) => `<svg class="${background ? 'op-shadow-person' : 'op-person'}" viewBox="0 0 520 820" aria-hidden="true" fill="currentColor">
    <path d="M225 18c-27 9-42 29-45 62l-3 58 38 35 73-1 39-40-2-52c-3-37-19-57-51-63Z"/>
    <g class="op-hair"><path d="m182 71-29 77 27-13-7 49 37-51 4-49Zm135 1 34 77-28-16 9 54-40-55-4-48Z"/></g>
    <path d="m227 144-7 34-57 24-36 91-25 122 28 8 44-109 35-63 100 1 37 68 39 96 30-9-29-117-38-87-57-25-8-34Z"/>
    <path d="m109 405-11 22-14 9-12 27 13-7 8-15 2 24 8 3 7-25 11-18 10-13Zm272-1 11 19 17 11 15 28-13-5-10-15-2 24-8 2-8-25-13-17Z"/>
    <path d="m210 236-14 143 19 137h92l18-136-16-144Z"/>
    <g class="op-coat-tail"><path d="m190 320-37 89-34 202 91-36 47-174 39 174 93 37-36-203-36-89-16 53-44 23-48-24Z"/></g>
    <path d="m217 493 1 155-13 125 41 4 17-128 7-113 6 112 10 129 43-4-7-127-15-153Z"/>
    <path d="m205 760-6 37-25 13v10h78l-3-59Zm79 0-1 60h75v-10l-28-13-4-36Z"/>
    <path class="op-silhouette-detail" d="m224 185 35 27 34-27m-34 29-3 181m-45 10-22 129m116-129 26 131M224 637h21m43 0h26" fill="none" stroke-width="3"/>
  </svg>`;
  const avatar = (i) => `<div class="op-avatar${i === 0 ? ' selected' : ''}" style="--avatar-bg:${['#a8afb1', '#c8b4a5', '#aabbb9', '#b9b7c7', '#c5c2ac', '#a6b9c9'][i]}">${svg(`<path d="M15 20c0-16 18-19 19-2l-2 9-15 1Z" fill="currentColor" stroke="none"/><path d="m17 28-9 8-3 12h40l-5-12-9-8Z" fill="currentColor" stroke="none"/>`, 48)}</div>`;
  const labels = ['攻击', '生命', '防御', '源石技艺'];
  const root = document.createElement('section');
  root.className = 'operator-scene'; root.id = 'operator-scene';
  write(root, "innerHTML", `
    <div class="op-paper"></div>${silhouette(true)}
    <svg class="op-floor" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true"><path d="M370 990C635 875 1155 860 1500 1000" fill="none" stroke="#c8cacb" stroke-width="1"/></svg>
    <div class="op-section-label"><span>//</span> 干员</div>
    <div class="op-avatar-tabs">${Array.from({ length: 6 }, (_, i) => avatar(i)).join('')}</div>
    <button class="op-close" aria-label="关闭干员界面">${svg('<path d="m12 12 24 24m0-24L12 36"/>', 32)}</button>
    ${silhouette()}
    <svg class="op-yellow-band" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true"><polygon class="op-band-landscape" points="1440,0 1920,0 1920,1080 1640,1080" fill="var(--yellow)"/><polygon class="op-band-portrait" points="720,0 1080,0 1080,1220 900,1220" fill="var(--yellow)"/></svg>
    <div class="op-outline-word"><svg class="op-outline-ink" aria-hidden="true"><text class="op-outline-text" x="0" y="0">ENDFIELD</text></svg></div>
    <div class="op-band-shine"></div>
    <div class="op-level">
      <div class="op-level-roll"><div class="op-level-old">20</div><div class="op-level-new">21</div></div>
      <div class="op-level-caption">LEVEL/40</div>
      <div class="op-experience"><div></div></div>
      <button class="op-upgrade" aria-label="等级提升"><span>等级提升</span>${svg('<path d="m18 11 13 13-13 13"/>', 28)}</button>
    </div>
    <div class="op-info">
      <div class="op-name">管理员</div><div class="op-stars">${star.repeat(6)}</div>
      <div class="op-attributes">${labels.map((s, i) => `<div class="op-stat">${svg(shapes[i], 36)}<div class="op-stat-label">${s}</div><div class="op-stat-value" data-stat="${i}"><span class="op-stat-old">${[342, 2341, 326, 35][i]}</span><span class="op-stat-new"></span></div></div>`).join('')}</div>
      <div class="op-skills">${skillShapes.map((s, i) => `<div class="op-skill">${svg(s, 40)}<svg class="op-skill-ring" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="34" pathLength="100" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90 36 36)"/></svg></div>`).join('')}</div>
      <div class="op-info-buttons"><button>查看详情</button><button>装备</button></div>
    </div>
    <div class="op-level-toast">等级提升　<span>20</span><svg width="38" height="22" viewBox="0 0 38 22" aria-hidden="true"><path d="M2 11h31M24 2l10 9-10 9" fill="none" stroke="currentColor" stroke-width="2"/></svg><strong>21</strong></div>`);
  host.append(root);
  const oldLevel = root.querySelector('.op-level-old');
  const newLevel = root.querySelector('.op-level-new');
  const exp = root.querySelector('.op-experience > div');
  const toast = root.querySelector('.op-level-toast');
  const shine = root.querySelector('.op-band-shine');
  const band = root.querySelector('.op-yellow-band');
  const person = root.querySelector('.op-person');
  const outline = root.querySelector('.op-outline-text');
  const textContext = document.createElement('canvas').getContext('2d');
  const upgrade = root.querySelector('.op-upgrade');
  const statEls = Array.from(root.querySelectorAll('.op-stat-value'));
  const rings = Array.from(root.querySelectorAll('.op-skill-ring circle'));
  const tails = root.querySelectorAll('.op-coat-tail');
  const hair = root.querySelectorAll('.op-hair');
  function render(t, p) {
    attribute(band, 'viewBox', p ? '0 0 1080 1920' : '0 0 1920 1080');
    attribute(person, 'viewBox', p ? '72 17 352 803' : '0 0 520 820');
    textContext.font = `700 ${p ? 150 : 160}px "Barlow Semi Condensed"`;
    textContext.letterSpacing = p ? '3px' : '3.2px';
    const ink = textContext.measureText('ENDFIELD');
    const textX = (ink.actualBoundingBoxRight - ink.actualBoundingBoxLeft) / 2;
    const textY = (ink.actualBoundingBoxDescent - ink.actualBoundingBoxAscent) / 2;
    attribute(outline, 'transform', `translate(60 ${p ? 340 : 460}) rotate(-90) translate(${-textX} ${-textY})`);
    const roll = seg(t, 40.4, .4, E.outBack);
    const height = p ? 210 : 242;
    write(oldLevel.style, "transform", `translateY(${-roll * height}px)`);
    write(newLevel.style, "transform", `translateY(${(1 - roll) * height}px)`);
    const values = [342, 2341, 326, 35];
    const ends = [358, 2420, 335, 35];
    const statProgress = seg(t, 40.8, 1.2, E.outCubic);
    statEls.forEach((el, i) => {
      const value = lerp(values[i], ends[i], statProgress);
      const integer = Math.floor(value), fraction = value - integer, row = p ? 96 : 64;
      write(el.children[0], "textContent", integer);
      write(el.children[1], "textContent", integer + 1);
      write(el.children[0].style, "transform", `translateY(${-fraction * row}px)`);
      write(el.children[1].style, "transform", `translateY(${(1 - fraction) * row}px)`);
    });
    let experience = .7 + .3 * seg(t, 39.6, .8, E.inOutCubic);
    if (t >= 40.8) experience = .12 * seg(t, 40.8, 1.2, E.outCubic);
    write(exp.style, "width", `${experience * 100}%`);
    const press = t >= 39.4 && t < 39.52;
    write(upgrade.style, "background", press ? 'var(--yellow-deep)' : 'var(--yellow)');
    write(upgrade.style, "transform", `translateY(${press ? 2 : 0}px)`);
    const toastOpacity = seg(t, 41, .2, E.outCubic) * (1 - seg(t, 42.4, .2, E.inOutCubic));
    write(toast.style, "opacity", toastOpacity);
    write(toast.style, "transform", `translate(-50%, calc(-50% + ${lerp(-16, 0, seg(t, 41, .2, E.outCubic))}px))`);
    const shineP = seg(t, 40.4, .4, E.outCubic);
    write(shine.style, "opacity", t >= 40.4 && t < 40.8 ? Math.sin(shineP * Math.PI) : 0);
    write(shine.style, "top", `${lerp(-180, p ? 1220 : 1080, shineP)}px`);
    rings.forEach((ring, i) => { write(ring.style, "strokeDashoffset", 100 * (1 - seg(t, 43 + i * .4, .6, E.outCubic))); });
    const sway = Math.sin((t - 36) * Math.PI / 2) * 2;
    tails.forEach((el) => { attribute(el, 'transform', `rotate(${sway} 260 380)`); });
    hair.forEach((el) => { attribute(el, 'transform', `rotate(${-sway} 260 90)`); });
  }
  function targets(p) { return { upgrade: p ? { x: 870, y: 1120 } : { x: 1630, y: 600 } }; }
  return { root, render, targets };
}

  const stageEl=$('#stage'),stage=MK.stage({root:stageEl,background:'#0b0c0d'});
  for(const[k,v]of Object.entries(C.tokens))document.documentElement.style.setProperty('--'+k,v);
  const terrain=$('#terrain'),ctx=terrain.getContext('2d'),flow=$('#flow'),fx=flow.getContext('2d'),world=$('#world'),hud=$('#hud');
  const machines=[
    {id:'core',name:'协议核心',x:520,y:430,w:256,h:256,icon:'core'},
    {id:'furnace',name:'精炼炉',x:300,y:700,w:128,h:128,icon:'flame',wake:19},
    {id:'plant',name:'种植机',x:300,y:900,w:128,h:160,icon:'plant'},
    {id:'power',name:'供电桩',x:1560,y:520,w:96,h:96,icon:'power',wake:19.8},
    {id:'b',name:'配件机 · B',x:1460,y:700,w:128,h:128,icon:'gear',wake:19.4},
    {id:'a',name:'配件机 · A',x:1208,y:224,w:128,h:128,icon:'gear',born:14.6},
    {id:'crusher',name:'粉碎机',x:1208,y:416,w:128,h:128,icon:'crusher',born:14.9},
    {id:'box',name:'仓储箱',x:1208,y:608,w:128,h:128,icon:'box',born:15.2}
  ];
  write($('#facilities'), "innerHTML", '<div class="boundary"></div>'+machines.map(m=>`<div class="machine" id="machine-${m.id}">${machineSVG(m)}<div class="machine-edges"></div><div class="machine-scan"></div>${m.id==='core'?'<svg class="core-arrows" viewBox="0 0 290 290" fill="var(--yellow)"><path d="m145 0 10 12h-20zM290 145l-12 10v-20zM145 290l-10-12h20zM0 145l12-10v20z"/></svg>':'<div class="zz">Z<b>z</b></div>'}<div class="machine-name"><i class="status-dot"></i>${m.name}</div></div>`).join(''));
  const machineEls=machines.map(m=>({m,el:$('#machine-'+m.id)}));
  write(hud, "innerHTML", `<div class="build-backing"></div><div class="hud-mode"><i></i><span>探索</span><span>工业</span></div><div class="resources"><div class="resource-count">${icon('diamond',20)}<span class="rolling-digits" id="resource-number"></span><span class="muted">/3460</span></div><span>100 % <span class="power">${icon('power',26)}</span></span></div><div class="build-title"><h1 class="section-title"><span class="prefix">//</span>放置蓝图</h1>${brand()}</div><div class="task"><em></em><span></span></div><div class="keys">${[['W A S D','移动镜头'],['滚轮','镜头缩放'],['R','旋转设备'],['左键','确认放置'],['ESC','取消放置']].map(([key,text],i)=>`<div class="key-row" data-row="${i}">${i===0?`<span class="move-keys">${["W","A","S","D"].map(k=>`<b>${k}</b>`).join("")}</span>`:`<b>${key}</b>`}<span>${text}</span></div>`).join('')}</div><div class="equipment-bar">${['精炼炉','配件机','粉碎机','种植机','供电桩','传送带','分流器','仓储箱'].map((n,i)=>`<div class="equipment-slot"><small>${i+1}</small>${icon(['flame','gear','crusher','plant','power','belt','splitter','box'][i],38)}<span>${n}</span></div>`).join('')}</div><div class="touch-actions">${[['rotate','旋转'],['check','确认'],['close','取消']].map(([ic,n])=>`<button aria-label="${n}">${icon(ic,34)}<span>${n}</span></button>`).join('')}</div><div class="connected"><i></i>产线已连通</div>`);
  write($('#title-scene'), "innerHTML", `<div class="title-lockup"><small>ARKNIGHTS</small><div class="title-main"><strong>ENDFIELD</strong><b>终末地</b></div></div><div class="loading"><div class="loading-top">${brand()}<span>LOADING <b id="loading-number">000</b>%</span></div><div class="loading-line"><i></i></div><p>集成工业系统可将设备的生产串联为自动化产线。</p></div>`);
  const ghostMachines=['a','crusher','box'].map(id=>machines.find(m=>m.id===id));
  write($('#ghost'), "innerHTML", `<div class="ghost-group"><svg viewBox="0 0 512 128" aria-hidden="true">${ghostMachines.map((m,i)=>`<g data-ghost-machine="${m.id}" transform="translate(${i*192} 0)">${machineSVG(m,true)}</g>`).join('')}<g stroke="var(--ghost)" stroke-width="2" fill="#2d8cff47"><path d="M128 44h64v40h-64zM320 44h64v40h-64z"/><path d="m144 52 12 12-12 12m18-24 12 12-12 12m174-24 12 12-12 12m18-24 12 12-12 12" fill="none"/></g></svg></div>`);
  const panel=createPanel($('#panel-host')),operator=createOperator($('#operator-host'));
  const blueprint=$('#blueprint-scene');
  write(blueprint, "innerHTML", `<div class="blueprint-grid"></div><div class="blueprint-plant"></div><div class="blueprint-title"><h1 class="section-title"><span class="prefix">//</span>分享蓝图</h1>${brand()}</div><aside class="blueprint-details"><h2>蓝图详情 / 默认</h2><p>尺寸 18×12</p><h3>设施清单</h3><div class="blueprint-list">${['core','gear','crusher','box','flame','power','belt','plus'].map(n=>`<div>${n==='plus'?'+2':icon(n,48)}</div>`).join('')}</div></aside><div class="blueprint-brand"><div class="wordmark">ENDFIELD</div>${brand()}</div><div class="share-dim"></div><div class="share-dialog"><h2>分享蓝图</h2><div class="share-input"><span>EF01-7KQ2-M9A3-ZT58</span><div class="copy-button" aria-label="复制分享码">${icon('copy',32)}</div></div><div class="share-buttons"><div class="capsule cancel"><span>取消</span>${icon('close',28)}</div><div class="capsule confirm"><span>确认</span>${icon('check',28)}</div></div><div class="copied">已复制</div></div>`);
  write($('#outro'), "innerHTML", `<div class="wordmark">ENDFIELD</div>${brand()}`);
  const cursor=$('#cursor'),ring=$('#press-ring'),reduced=MK.prefersReducedMotion();let layoutKey='',flowKey='';
  function mapped(x,y,p){return p?{x:60+(x-120)*4/7,y:451.714285714+(y-96)*4/7}:{x,y};}
  function machineRect(m,p){const a=mapped(m.x,m.y,p),s=p?4/7:1;if(p&&m.born){a.x-=64*s;a.y+=128*s;}return{x:a.x-m.w*s/2,y:a.y-m.h*s/2,w:m.w*s,h:m.h*s};}
  function makeTerrain(p) {
    const w=p?1080:1920,h=p?1920:1080;
    terrain.width=flow.width=w;terrain.height=flow.height=h;
    const rand=MK.rng(713);
    ctx.fillStyle='#5f7d3a';ctx.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=48)for(let x=0;x<w;x+=48){
      const g=ctx.createRadialGradient(x,y,0,x,y,100);
      g.addColorStop(0,`rgba(111,140,69,${rand()*.8})`);g.addColorStop(1,'rgba(111,140,69,0)');
      ctx.fillStyle=g;ctx.fillRect(x-100,y-100,200,200);
    }
    for(let y=-120;y<h;y+=120)for(let x=-120;x<w;x+=120){
      ctx.beginPath();
      for(let j=0;j<10;j++){const a=j*Math.PI/5,r=48+rand()*24,xx=x+60+Math.cos(a)*r,yy=y+60+Math.sin(a)*r;j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
      ctx.closePath();ctx.fillStyle=rand()>.5?'#57732f':'#7a9850';ctx.globalAlpha=.35;ctx.fill();
    }
    ctx.globalAlpha=1;
    for(let i=0;i<6;i++){
      const x=rand()*w,y=rand()*h;ctx.beginPath();
      for(let j=0;j<12;j++){const a=j/12*Math.PI*2,r=70+rand()*90,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.5;j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
      ctx.closePath();ctx.save();ctx.filter='blur(2px)';ctx.fillStyle='#8a7a5c66';ctx.fill();ctx.filter='none';ctx.clip();
      for(let k=0;k<240;k++){ctx.fillStyle=k%2?'#b09a7344':'#594d3b44';ctx.beginPath();ctx.arc(x+(rand()-.5)*320,y+(rand()-.5)*180,.6+rand()*1.5,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    for(let i=0;i<45000;i++){const x=rand()*w,y=rand()*h;ctx.strokeStyle=rand()>.5?'#c5c98a30':'#233b233a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1+rand()*3,y-2-rand()*5);ctx.stroke();}
    ctx.strokeStyle='#86a35a';ctx.lineWidth=1;
    for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32)for(let i=0;i<6;i++){const xx=x+rand()*32,yy=y+rand()*32,len=3+rand()*3,a=-Math.PI/2+(rand()-.5)*.8;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+Math.cos(a)*len,yy+Math.sin(a)*len);ctx.stroke();}
    for(let i=0;i<700;i++){ctx.fillStyle='#9a9a92';const s=2+rand()*4;ctx.globalAlpha=.3+rand()*.4;ctx.fillRect(rand()*w,rand()*h,s,s*.6);}
    ctx.globalAlpha=1;
    const beltSegments=[...conveyorPoints.slice(1).map((v,i)=>[mapBelt(...conveyorPoints[i],p),mapBelt(...v,p)]),...oldPoints.slice(1).map((v,i)=>[mapped(...oldPoints[i],p),mapped(...v,p)])];
    const blocked=(x,y,r)=>machines.some(m=>{const a=machineRect(m,p);return x>a.x-r&&x<a.x+a.w+r&&y>a.y-r&&y<a.y+a.h+r;})||beltSegments.some(([a,b])=>{const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-a.x-dx*k,y-a.y-dy*k)<(p?24*4/7:24)+r;});
    ctx.save();ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;ctx.shadowBlur=1;ctx.shadowColor='#0009';
    for(let i=0;i<40;i++){const size=6+rand()*8;let x,y;do{x=rand()*w;y=rand()*h;}while(blocked(x,y,size));ctx.fillStyle=i%2?'#a1a299':'#82877b';ctx.beginPath();ctx.moveTo(x-size*.45,y-size*.25);ctx.lineTo(x+size*.2,y-size*.4);ctx.lineTo(x+size*.5,y+size*.15);ctx.lineTo(x-size*.15,y+size*.4);ctx.closePath();ctx.fill();}
    ctx.restore();
    const b=p?{x:60,y:240,w:960,h:940}:{x:120,y:96,w:1680,h:904};
    ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;
    const ss=p?64*4/7:64;
    for(let x=b.x;x<b.x+b.w;x+=ss){ctx.beginPath();ctx.moveTo(x,b.y);ctx.lineTo(x,b.y+b.h);ctx.stroke();}
    for(let y=b.y;y<b.y+b.h;y+=ss){ctx.beginPath();ctx.moveTo(b.x,y);ctx.lineTo(b.x+b.w,y);ctx.stroke();}
    ctx.restore();ctx.fillStyle='#00000026';ctx.fillRect(0,0,w,b.y);ctx.fillRect(0,b.y+b.h,w,h-b.y-b.h);ctx.fillRect(0,b.y,b.x,b.h);ctx.fillRect(b.x+b.w,b.y,w-b.x-b.w,b.h);
    styles($('.boundary').style, {left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px'});
  }

  const conveyorPoints=[[648,430],[840,430],[840,224],[1208,224],[1208,416],[1208,608],[1208,700],[1460,700]],oldPoints=[[520,558],[520,700],[300,700]];
  function pathInfo(points){let length=0;const parts=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!len)continue;parts.push({a,b,len,start:length});length+=len;}return{parts,length};}
  const beltPath=pathInfo(conveyorPoints),oldBeltPath=pathInfo(oldPoints);
  function mapBelt(x,y,p){const a=mapped(x,y,p);if(p){if(y===224){a.x-=64*4/7*clamp((x-840)/368,0,1);a.y+=128*4/7;}else if(x===840&&y>=224&&y<=430){a.y+=128*4/7*(430-y)/206;}else if(x===1208){a.x-=64*4/7;a.y+=128*4/7*clamp((700-y)/92,0,1);}else if(y===700&&x>=1208){a.x-=64*4/7*clamp((1460-x)/252,0,1);}}return a;}
  function pointAt(path,dist,wrap=true){const d=wrap?((dist%path.length)+path.length)%path.length:clamp(dist,0,path.length),s=path.parts.find(v=>d<=v.start+v.len)||path.parts.at(-1),k=(d-s.start)/s.len;return{x:lerp(s.a[0],s.b[0],k),y:lerp(s.a[1],s.b[1],k),angle:Math.atan2(s.b[1]-s.a[1],s.b[0]-s.a[0])};}
  function roundedPath(points,radius){
    const verts=[points[0]];
    for(let i=1;i<points.length-1;i++){
      const a=points[i-1],b=points[i],c=points[i+1],u=Math.hypot(b[0]-a[0],b[1]-a[1]),v=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(radius,u/2,v/2);
      const start=[b[0]-(b[0]-a[0])*r/u,b[1]-(b[1]-a[1])*r/u],end=[b[0]+(c[0]-b[0])*r/v,b[1]+(c[1]-b[1])*r/v];
      verts.push(start);
      for(let j=1;j<=16;j++){const k=j/16,z=1-k;verts.push([z*z*start[0]+2*z*k*b[0]+k*k*end[0],z*z*start[1]+2*z*k*b[1]+k*k*end[1]]);}
    }
    verts.push(points.at(-1));return pathInfo(verts);
  }
  function trace(path,from,to,context=fx){
    context.beginPath();let started=false;
    for(const s of path.parts){const a=Math.max(from,s.start),b=Math.min(to,s.start+s.len);if(a>=b)continue;const k=(a-s.start)/s.len,j=(b-s.start)/s.len,x=lerp(s.a[0],s.b[0],k),y=lerp(s.a[1],s.b[1],k);if(!started){context.moveTo(x,y);started=true;}context.lineTo(lerp(s.a[0],s.b[0],j),lerp(s.a[1],s.b[1],j));}
    context.stroke();
  }
  function drawBelt(t,p,path,building=false,map=mapBelt){
    const s=p?4/7:1,key=p?'portrait':'landscape';
    path.curves??={};
    if(!path.curves[key]){const verts=path.parts.map(v=>v.a).concat([path.parts.at(-1).b]).map(([x,y])=>{const a=map(x,y,p);return[a.x,a.y];});path.curves[key]=roundedPath(verts,20*s);}
    const shape=path.curves[key],n=Math.ceil(path.length/64),ranges=[];
    if(!building||t>=18.5)ranges.push([0,shape.length]);
    else for(let i=0;i<n;i++){const a=i*64/path.length*shape.length,b=Math.min((i+1)*64,path.length)/path.length*shape.length,k=seg(t,16+i*(2.5-.12)/(n-1),.12);if(k>0){ranges.push([a,a+(b-a)*k/2],[b-(b-a)*k/2,b]);}}
    fx.save();fx.lineJoin='round';fx.lineCap='butt';
    if(!building||t>=18.5){
      if(!shape.body){const canvas=document.createElement('canvas');canvas.width=p?1080:1920;canvas.height=p?1920:1080;const paint=canvas.getContext('2d');paint.lineJoin='round';paint.lineCap='butt';for(const[color,width]of[['#8a5a0e',48],['#f2a51c',40]]){paint.strokeStyle=color;paint.lineWidth=width*s;trace(shape,0,shape.length,paint);}shape.body=canvas;}
      fx.drawImage(shape.body,0,0);
    }else for(const[color,width]of[['#8a5a0e',48],['#f2a51c',40]]){fx.strokeStyle=color;fx.lineWidth=width*s;for(const[a,b]of ranges)trace(shape,a,b);}
    const move=t>=18.5?(t-18.5)*80*s:0;
    for(let d=0;d<shape.length;d+=32*s){const pos=((d+move)%shape.length+shape.length)%shape.length;if(building&&t<18.5&&!ranges.some(([a,b])=>pos>=a&&pos<=b))continue;const a=pointAt(shape,pos);fx.save();fx.translate(a.x,a.y);fx.rotate(a.angle);fx.strokeStyle='#fff';fx.lineWidth=3*s;fx.beginPath();fx.moveTo(-7*s,-7*s);fx.lineTo(7*s,0);fx.lineTo(-7*s,7*s);fx.stroke();fx.restore();}
    if(t>=18.5)for(let d=0;d<shape.length;d+=40*s){const a=pointAt(shape,d+move);fx.fillStyle='#f7f7f5';fx.strokeStyle='#17191b';fx.lineWidth=2*s;fx.beginPath();fx.arc(a.x,a.y,12*s,0,Math.PI*2);fx.fill();fx.stroke();fx.strokeRect(a.x-4*s,a.y-4*s,8*s,8*s);}
    fx.restore();
  }

  function blueprintLayout(p){const plant=$('.blueprint-plant');write(plant, "innerHTML", '<svg class="paper-belts" width="100%" height="100%" style="position:absolute;inset:0" aria-hidden="true"></svg>');for(const m of machines){const r=machineRect(m,p);plant.insertAdjacentHTML('beforeend',`<div class="blueprint-machine" data-id="${m.id}" style="left:${r.x}px;top:${r.y-(p?70:0)}px;width:${r.w}px;height:${r.h}px">${icon(m.icon,48)}<span class="blueprint-name">${m.name}</span></div>`);}const make=(points,map)=>points.map(([x,y],i)=>{const a=map(x,y,p);return`${i?'L':'M'}${a.x} ${a.y-(p?70:0)}`;}).join(' '),d=make(conveyorPoints,mapBelt)+' '+make(oldPoints,mapped),v=mapBelt(840,430,p);write($('.paper-belts'), "innerHTML", `<path d="${d}" fill="none" stroke="#ffe400" stroke-width="${p?23:40}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#574b1c99" stroke-width="3" stroke-dasharray="1 15"/><g transform="translate(${v.x} ${v.y-(p?70:0)})"><rect x="-20" y="-20" width="40" height="40" fill="#303337"/><path d="M-10 0H10M2-8l8 8-8 8" fill="none" stroke="white" stroke-width="2"/></g>`);}
  function ghostPosition(t,p){const a=p?{x:540,y:900}:{x:960,y:540},b=p?{x:640,y:720}:{x:1180,y:420},c=p?{x:603.636,y:1020}:{x:1100,y:620},d=p?{x:626.364,y:660}:{x:1150,y:380},k=seg(t,10.6,1.8,E.inOutCubic),u=1-k;return{x:u*u*u*a.x+3*u*u*k*c.x+3*u*k*k*d.x+k*k*k*b.x,y:u*u*u*a.y+3*u*u*k*c.y+3*u*k*k*d.y+k*k*k*b.y};}
  function springGhost(t,p){const dt=1/120;let pos=ghostPosition(10.6,p),vx=0,vy=0;for(let u=10.6;u<t;u+=dt){const h=Math.min(dt,t-u),a=ghostPosition(u+h,p);vx+=(180*(a.x-pos.x)-22*vx)*h;vy+=(180*(a.y-pos.y)-22*vy)*h;pos={x:pos.x+vx*h,y:pos.y+vy*h};}return pos;}
  function moveBezier(a,b,k){const s=E.inOutCubic(clamp(k,0,1)),u=1-s,c={x:lerp(a.x,b.x,.45),y:a.y},d={x:lerp(a.x,b.x,.6),y:b.y};return{x:u*u*u*a.x+3*u*u*s*c.x+3*u*s*s*d.x+s*s*s*b.x,y:u*u*u*a.y+3*u*u*s*c.y+3*u*s*s*d.y+s*s*s*b.y};}
  function cursorAt(t,p){const a=machineRect(machines[5],p),ac={x:a.x+a.w/2,y:a.y+a.h/2},pt=panel.targets(p),ot=operator.targets(p),rotate=p?{x:984,y:1332}:ghostPosition(12.4,p),confirm=p?{x:984,y:1468}:ghostPosition(12.4,p);let point=ghostPosition(Math.min(t,12.4),p);const pop=Math.min(seg(t,50,.4,E.outCubic),1-seg(t,53.2,.4,E.inOutCubic)),mid=p?960:540;const copy={x:p?875:1291,y:mid+((p?878:498)-mid)*pop},accept={x:p?540:1112,y:mid+((p?1064:602)-mid+(t>=53&&t<53.12?2:0))*pop};const route=[{a:12.4,b:13,end:rotate},{a:13.1,b:13.6,end:ghostPosition(12.4,p)},{a:13.8,b:14.4,end:confirm},{a:24,b:24.8,end:ac},{a:31.5,b:32,end:pt.collect},{a:34.5,b:35,end:pt.close},{a:39,b:39.4,end:ot.upgrade},{a:51.2,b:51.6,end:copy},{a:52.6,b:53,end:accept}];for(const r of route){if(t<r.a)break;point=moveBezier(point,r.end,(t-r.a)/(r.b-r.a));}return point;}
  function render(t){
    const p=stage.portrait,w=stage.width,h=stage.height;if(layoutKey!==String(p)){makeTerrain(p);flowKey='';blueprintLayout(p);layoutKey=String(p);}
    const mode=seg(t,5,.25,E.outBack);write(node('.hud-mode i').style, "transform", `translateX(${mode*(p?146:106)}px)`);write(node('.hud-mode span').style, "color", t<5?'#17191b':'#f7f7f5');write(node('.hud-mode span:nth-of-type(2)').style, "color", t>=5?'#17191b':'#f7f7f5');
    const cam=reduced?1:t<6?lerp(1.08,1,seg(t,4,2,E.outCubic)):lerp(1,.86,seg(t,56.6,2.4,E.inOutSine));write(world.style, "transform", `scale(${cam})`);write(world.style, "opacity", String(reduced?Math.min(seg(t,4,2,E.outCubic),1-seg(t,56.6,2.4,E.inOutSine)):1));const panelAmount=Math.min(seg(t,25,p?.4:.5,E.outCubic),1-seg(t,35,.5,E.outCubic));write(world.style, "filter", panelAmount>0?`blur(${panelAmount*4}px)`:'none');
    const nextFlowKey=String(p)+(t>=13.6&&t<14||t>=16?t:'idle');
    const center=machineRect(machines[6],p),snap={x:center.x+center.w/2,y:center.y+center.h/2};
    if(flowKey!==nextFlowKey){
    fx.clearRect(0,0,w,h);drawBelt(t,p,oldBeltPath,false,mapped);if(t>=16)drawBelt(t,p,beltPath,true);if(t>=13.6&&t<14){fx.fillStyle=`rgba(45,140,255,${.25*(1-seg(t,13.6,.4))})`;const ss=p?4/7:1;for(let y=-4;y<4;y++)for(let x=-1;x<1;x++)fx.fillRect(snap.x+x*64*ss,snap.y+y*64*ss,64*ss-1,64*ss-1);}
    flowKey=nextFlowKey;
    }
    for(const{m,el}of machineEls){const r=machineRect(m,p),age=t-(m.born??-100),born=m.born?clamp(age,0,1):1;styles(el.style, {left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px',visibility:age<0?'hidden':'visible',background:age<.8?'transparent':'#2a2d31',borderColor:age<.8?'transparent':'#4a4e53'});write(node('.machine-svg',el).style, "clipPath", m.born&&age<.8?`inset(0 0 ${100*(1-seg(t,m.born+.4,.4))}% 0)`:'none');write(node('.machine-edges',el).style, "opacity", m.born&&age<.8?'1':'0');write(node('.machine-edges',el).style, "clipPath", `inset(0 ${100*(1-seg(t,m.born??0,.4))}% 0 0)`);write(node('.machine-scan',el).style, "opacity", m.born&&age>=.4&&age<.8?'1':'0');write(node('.machine-scan',el).style, "top", 100*seg(t,(m.born??0)+.4,.4)+'%');const active=t>=(m.wake??(m.born?m.born+1:Infinity));write(node('.status-dot',el).style, "display", active?'block':'none');write(node('.machine-name',el).style, "opacity", String(p?(m.born?Math.min(seg(t,m.born,.2),1-seg(t,m.born+1.4,.3)):0):born));if(m.id!=='core'){const zz=node('.zz',el),wake=seg(t,m.wake??Infinity,.4);write(zz.style, "opacity", m.born?'0':String((.8+.2*Math.sin(t*Math.PI*2/1.6))*(1-wake)));write(zz.style, "transform", `translateY(${-24*wake}px)`);}const wr=node('.work-ring',el);write(wr.style, "opacity", active?'1':'0');write(wr.style, "transformOrigin", `${m.w/2}px ${m.h/2}px`);write(wr.style, "transform", `rotate(${active?t*90:0}deg)`);write(node('.corner-marks',el).style, "transformOrigin", `${m.w/2}px ${m.h/2}px`);write(node('.corner-marks',el).style, "transform", m.born?`scale(${seg(t,m.born+.8,.2,E.outBack)})`:'none');renderMachineDetails(m,el,t,active,false,p);}
    const g=node('.ghost-group'),gp=springGhost(Math.min(t,13.6),p),sn=seg(t,13.6,.12,E.outCubic),ss=p?4/7:1;styles(g.style, {left:lerp(gp.x,snap.x,sn)+'px',top:lerp(gp.y,snap.y,sn)+'px',transform:`translate(-50%,-50%) scale(${ss}) rotate(${90*seg(t,13,.25,E.outCubic)}deg)`,opacity:t>=10.6&&t<14.5?'1':'0',filter:t>=14.4?'brightness(8)':'none'});
    ghostMachines.forEach(m=>renderMachineDetails(m,node('[data-ghost-machine="'+m.id+'"]'),t,false,true));
    write(node('.hud-mode').style, "opacity", String(seg(t,4.6,.3,E.outCubic)));const res=node('.resources'),rin=seg(t,5.4,.3,E.outCubic);write(res.style, "opacity", String(rin));write(res.style, "marginTop", (1-rin)*-20+'px');roll(node('#resource-number'),2065,2214,seg(t,20,3,E.outQuad));const bi=seg(t,10,.3,E.outCubic);write(node('.build-title').style, "opacity", String(bi));write(node('.build-title').style, "transform", `translateX(${-40*(1-bi)}px)`);write(node('.task').style, "top", (p?182:112)+(t>=10?64:0)+'px');write(node('.task').style, "opacity", String(seg(t,6.6,.3)));write(node('.build-backing').style, "opacity", String(seg(t,6.6,.3)));write(node('.task em'), "innerHTML", t>=22.5?icon('check',p?28:20):'<svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="currentColor"/></svg>');write(node('.task em').style, "color", t>=22.5?'var(--ok)':'var(--yellow)');write(node('.task span'), "textContent", `搭建一条配件产线　${t>=22.5?'1/1':'0/1'}`);
    nodeList('.key-row').forEach((row,i)=>{const k=seg(t,5.8+i*.06,.3,E.outCubic);write(row.style, "opacity", String(k));write(row.style, "transform", `translateX(${(1-k)*40}px)`);node('b',row).classList.toggle('active',(i===2&&t>=13&&t<13.2)||(i===3&&t>=14.4&&t<14.6));});const bar=seg(t,6.2,.35,E.outCubic);write(node('.equipment-bar').style, "marginBottom", (1-bar)*-60+'px');write(node('.equipment-bar').style, "opacity", String(bar));nodeList('.equipment-slot').forEach((el,i)=>el.classList.toggle('selected',i===1&&t>=10.3));nodeList('.touch-actions button').forEach((b,i)=>{const at=i===0?13:i===1?14.4:-100;write(b.style, "transform", `scale(${t>=at&&t<at+.1?.92:1})`);write(b.style, "background", t>=at&&t<at+.2?'#e9c500':'var(--panel)');});write(node('.touch-actions').style, "opacity", String(seg(t,5.8,.3)));const connected=Math.min(seg(t,22.8,.2,E.outBack),1-seg(t,23.8,.2));write(node('.connected').style, "opacity", String(connected));write(node('.connected').style, "scale", String(.9+.1*connected));write(hud.style, "opacity", String(1-seg(t,56.6,.4)));write(hud.style, "visibility", t<36||t>=48?'visible':'hidden');
    write(node('#title-scene').style, "visibility", t<3.7?'visible':'hidden');const ti=seg(t,.4,.6,E.outCubic);write(node('.title-lockup').style, "opacity", String(ti));write(node('.title-lockup').style, "marginTop", (1-ti)*24+'px');const load=seg(t,1,2.4,E.inOutSine);write(node('#loading-number'), "textContent", String(Math.round(load*100)).padStart(3,'0'));write(node('.loading-line i').style, "width", load*100+'%');
    panel.render(clamp(t,24.9,35.5),p,machineRect(machines[5],p));operator.render(clamp(t,36,48.3),p);write(operator.root.style, "visibility", t>=36.4&&t<48.3?'visible':'hidden');const bp=Math.min(seg(t,49,.6,E.outCubic),1-seg(t,56,.6));write(blueprint.style, "opacity", String(bp));write(blueprint.style, "visibility", t>=49&&t<56.6?'visible':'hidden');const pop=Math.min(seg(t,50,.4,E.outCubic),1-seg(t,53.2,.4,E.inOutCubic));write(node('.share-dim').style, "opacity", String(pop));write(node('.share-dialog').style, "transform", `scaleY(${pop})`);write(node('.share-dialog').style, "visibility", pop>0?'visible':'hidden');write(node('.copied').style, "opacity", t>=51.6&&t<52.4?'1':'0');write(node('.copy-button').style, "background", t>=51.6&&t<51.8?'var(--yellow)':'transparent');write(node('.capsule.confirm').style, "transform", t>=53&&t<53.12?'translateY(2px)':'none');write(node('.capsule.confirm').style, "background", t>=53&&t<53.12?'var(--yellow-deep)':'var(--yellow)');
    const cp=cursorAt(t,p);write(cursor, "innerHTML", p?'':'<svg viewBox="0 0 24 32" width="24" height="32"><path d="M2 1v25l6-7 5 11 5-2-5-10h9z" fill="white" stroke="#17191b" stroke-width="1.5"/></svg>');write(cursor.style, "left", cp.x-(p?28:0)+'px');write(cursor.style, "top", cp.y-(p?28:0)+'px');write(cursor.style, "opacity", t>=10.6&&t<56?'1':'0');const press=[13,14.4,24.9,32,35,39.4,51.6,53].find(v=>t>=v&&t<v+.3),rp=press===undefined?1:(t-press)/.3;write(ring.style, "opacity", press===undefined?'0':String(1-rp));write(ring.style, "left", cp.x-28+'px');write(ring.style, "top", cp.y-28+'px');write(ring.style, "transform", `scale(${1+rp*.6})`);
    const wipe=node('#wipe');let phase=-1,reverse=false;for(const[a,d,r]of[[3.4,.6,false],[36,.8,false],[48,.6,true]])if(t>=a&&t<a+d){phase=(t-a)/d;reverse=r;}if(phase>=0){write(wipe.style, "display", 'block');if(reduced)styles(wipe.style, {width:w+'px',height:h+'px',left:'0',top:'0',transform:'none',opacity:String(Math.sin(phase*Math.PI))});else styles(wipe.style, {width:w*.6+'px',height:h*3+'px',top:-h+'px',left:lerp(reverse?-w*1.2:w*1.6,reverse?w*1.6:-w*1.2,E.inOutCubic(phase))+'px',transform:'rotate(-28deg)',opacity:'1'});}else write(wipe.style, 'display', 'none');write(node('#outro').style, "opacity", String(seg(t,57.4,.4)));write(node('#fade').style, "opacity", String(seg(t,59.4,.6,E.inOutSine)));
  }
  MK.preload([{label:'Google Fonts',run:async()=>{await Promise.all(C.fonts.map(url=>new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=url;link.onload=resolve;link.onerror=reject;document.head.append(link);})));await Promise.all(C.fontSpecs.map(spec=>MK.preload.font(spec,'ENDFIELD 集成工业协议管理员配件机')()));await document.fonts.ready;}}]);
  const tl=MK.timeline({duration:C.duration,render,markers:C.markers});MK.audio.attach(tl,C.score);MK.expose(tl,{title:C.title});MK.controls(tl,{accent:C.tokens.yellow});MK.start(tl,{t:0,reduced:0});
})();
