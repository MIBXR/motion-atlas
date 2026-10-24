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
  let art = '', defs = '', overlay = '';

  if (m.id === 'furnace') {
    const gid = `machine-mouth-${m.id}${ghost ? '-ghost' : ''}`;
    defs = `<radialGradient id="${gid}"><stop offset="0" stop-color="#ffd08a"/><stop offset=".38" stop-color="#ff8a2a"/><stop offset=".76" stop-color="#ed6520"/><stop offset="1" stop-color="#6f341c"/></radialGradient>`;
    overlay = center(circle(x, y, 24, `url(#${gid})`, line, 1, 'class="machine-furnace-mouth"'));
    art = center(circle(x, y, 27, dark, edge, 2)
      + circle(x, y, 24, ghost ? panel : `url(#${gid})`, line, 1, 'class="machine-furnace-mouth"'))
      + [-1, 1].map(side => Array.from({ length: 5 }, (_, i) => path(`M${x + side * (32 + i * 4)} ${y - 16}v32`, line, 2)).join('')).join('');
  } else if (m.id === 'a' || m.id === 'b') {
    const teeth = Array.from({ length: 32 }, (_, i) => {
      const a = i * Math.PI / 16, r = i % 4 === 0 || i % 4 === 3 ? 21 : 17;
      return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(3)} ${(Math.sin(a) * r).toFixed(3)}`;
    }).join(' ') + 'Z';
    overlay = center(`<g transform="translate(${x} ${y})"><g class="machine-gear-rotor">${path(teeth, line, 2)}${circle(0, 0, 7, 'none', line, 2)}</g></g>`);
    art = center(circle(x, y, 24, dark, edge, 1)
      + `<g transform="translate(${x} ${y})"><g class="machine-gear-rotor">${path(teeth, line, 2)}${circle(0, 0, 7, 'none', line, 2)}</g></g>`)
      + slats(x - 26, y - 40, 3, 52, 5) + slats(x - 26, y + 30, 3, 52, 5);
  } else if (m.id === 'crusher') {
    art = center([-18, 18].map((dx, i) => {
      const cuts = Array.from({ length: 6 }, (_, j) => {
        const a = j * Math.PI / 3;
        return path(`M${(Math.cos(a) * 6).toFixed(3)} ${(Math.sin(a) * 6).toFixed(3)}L${(Math.cos(a) * 18).toFixed(3)} ${(Math.sin(a) * 18).toFixed(3)}`, line, 2);
      }).join('');
      return `<g transform="translate(${x + dx} ${y})"><g class="machine-cut-rotor machine-cut-${i ? 'right' : 'left'}">${circle(0, 0, 18, ghost ? dark : 'none', line, 2)}${cuts}${circle(0, 0, 4, ghost ? solid : 'none', line, 1)}</g></g>`;
    }).join(''));
    overlay = art;
  } else if (m.id === 'box') {
    art = center([0, 1, 2, 3].map(i => {
      const sx = x - 27 + (i % 2) * 30, sy = y - 31 + Math.floor(i / 2) * 30;
      return `<rect x="${sx}" y="${sy}" width="24" height="24" fill="${dark}" stroke="${line}" stroke-width="1"/>`
        + slats(sx + 4, sy + 8, 2, 16, 8);
    }).join(''))
      + `<rect x="${w * .4 - 12}" y="${h - 23}" width="${w * .6}" height="6" fill="${ghost ? panel : accent}" stroke="${ghost ? line : 'none'}" stroke-width="1"/>`;
    overlay = `<rect x="${w * .4 - 12}" y="${h - 23}" width="${w * .6}" height="6" fill="${accent}"/>`;
  } else if (m.id === 'plant') {
    art = center([-20, 0, 20].map(dy => `<rect x="${x - 37}" y="${y + dy - 7}" width="74" height="14" fill="${dark}" stroke="${edge}" stroke-width="1"/>`
      + [-24, -12, 0, 12, 24].map(dx => circle(x + dx, y + dy, 1.5, ghost ? panel : '#7bd88f', ghost ? line : 'none', ghost ? 1 : 0)).join('')).join(''));
  } else if (m.id === 'power') {
    art = center(`<rect x="${x - 8}" y="${y - 28}" width="16" height="56" fill="${dark}" stroke="${line}" stroke-width="1"/>`
      + path(`M${x} ${y - 42}l10 14-10 14-10-14Z`, line, 2, dark)
      + path(`M${x} ${y - 11}l-5 13h7l-4 11`, line, 1))
      + Array.from({ length: 3 }, (_, i) => `<path class="machine-power-arc" data-arc="${i}" fill="none" stroke="${line}" stroke-width="1" opacity=".9"/>`).join('');
    overlay = Array.from({ length: 3 }, (_, i) => `<path class="machine-power-arc" data-arc="${i}" fill="none" stroke="${line}" stroke-width="1" opacity=".9"/>`).join('');
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
  const source = {core:'core',furnace:'refinery',a:'assembler',b:'assembler',crusher:'crusher',box:'storage',plant:'planter',power:'pylon'}[m.id];
  const base = ghost
    ? `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="${panel}" stroke="${edge}" stroke-width="2"/>` + path(`M${x} 6V${h - 6}M6 ${y}H${w - 6}`, seam, 1) + art
    : `<g class="${m.id==='core'?'machine-bitmap':'machine-center-icon'}"><image class="machine-bitmap" href="${bitmaps[source]}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/></g>` + overlay;
  return `<svg class="machine-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible" data-machine-art="${m.id}" data-ghost="${ghost}" aria-hidden="true"><defs>${defs}</defs><g class="machine-art-frame">`
    + base
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
