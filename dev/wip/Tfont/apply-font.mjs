import fs from 'node:fs';

const patterns = ['corner-hud', 'vertical-title-blur', 'route-draw-marker', 'day-night-flip', 'card-expand-fullscreen', 'chapter-frame', 'split-compare-stamp', 'collect-counter', 'alert-reroute', 'outro-stat-stack', 'seekable-timeline', 'film-grain'];
const apply = process.argv.includes('--apply');
const fonts = {
  '.mk-label .mk-en': [18, 33], '.mk-label em': [18, 33], '.card .cd-cap b': [21, 39], '.card .cd-cap span': [18, 33],
  '.fb-tag': [18, 33], '.fb-vtext': [84, 78], '.fb-en': [23, 36], '.fb-caption': [20, 36], '.cmp-label': [18, 33], '.cmp-stamp': [31, 39],
  '.it-cjk': [161, 133], '.it-en': [61, 61], '.it-sub': [18, 33], '.lt-cjk': [115, 116], '.lt-en': [38, 44], '.lt-sub': [20, 36],
  '.dc-row': [134, 133], '.dc-date': [18, 33], '.ct-chip': [18, 33], '.ct-title': [25, 42], '.al-title': [31, 44], '.al-detail': [18, 33], '.al-chip': [18, 33],
  '.ts-text': [18, 33], '.ts-sub': [18, 33], '.nt-text': [33, 61], '.nt-sign': [18, 33], '.hd-title': [29, 44], '.hd-title small': [20, 36],
  '.hd-date': [18, 33], '.hud-geo': [18, 33], '.hud-clock': [50, 72], '.hc-tz': [18, 33], '.st-label': [18, 33], '.bd-label': [18, 33], '.bd-n': [24, 44],
  '.np-head': [18, null], '.np-track': [21, 39], '.np-lyric': [29, 42], '.np-sub': [20, 36], '.attrib': [18, 33],
  '.ou-stats b': [92, 94], '.ou-stats span': [18, 33], '.ou-fin': [77, 83], '.ou-fin small': [20, 36], '.ou-credits': [18, 33],
  '.veil-tag': [18, 33], '.rt-tag': [18, 33], '.sc-text': [18, 33], '.ld-k': [18, 33], '.ld-p': [18, 33], '.ld-t': [27, 44], '.buffering': [18, 33],
};
const oldFonts = {
  '.mk-label .mk-en': [24, 36], '.mk-label em': [24, 36], '.card .cd-cap b': [26, 38], '.card .cd-cap span': [24, 36],
  '.fb-tag': [24, 36], '.fb-vtext': [92, 104], '.fb-en': [36, 44], '.fb-caption': [30, 36], '.cmp-label': [24, 36], '.cmp-stamp': [44, 52],
  '.it-cjk': [160, 168], '.it-en': [96, 76], '.it-sub': [24, 36], '.lt-cjk': [132, 140], '.lt-en': [48, 52], '.lt-sub': [26, 36],
  '.dc-row': [156, 176], '.dc-date': [24, 36], '.ct-chip': [24, 36], '.ct-title': [30, 40], '.al-title': [36, 48], '.al-detail': [24, 36], '.al-chip': [24, 36],
  '.ts-text': [26, 38], '.ts-sub': [24, 36], '.nt-text': [40, 54], '.nt-sign': [24, 36], '.hd-title': [32, 48], '.hd-title small': [24, 36],
  '.hd-date': [24, 36], '.hud-geo': [24, 36], '.hud-clock': [66, 88], '.hc-tz': [24, 36], '.st-label': [24, 36], '.bd-label': [24, 36], '.bd-n': [30, 40],
  '.np-head': [24, null], '.np-track': [26, 36], '.np-lyric': [40, 46], '.np-sub': [28, 36], '.attrib': [24, 36],
  '.ou-stats b': [96, 96], '.ou-stats span': [24, 36], '.ou-fin': [80, 88], '.ou-fin small': [24, 36], '.ou-credits': [24, 36],
  '.veil-tag': [24, 36], '.rt-tag': [24, 36], '.sc-text': [24, 36], '.ld-k': [24, 36], '.ld-p': [24, 36], '.ld-t': [36, 48], '.buffering': [24, 36],
};
const boxes = [
  { selectors: ['.mk-label', '.mk-label.is-node'], font: '.mk-label .mk-en' },
  { selectors: ['.mk-label, .rt-tag'], font: '.mk-label .mk-en' },
  { selectors: ['.rt-tag', '.rt-tag svg'], font: '.rt-tag', icon: ['.rt-tag svg'] },
  { selectors: ['.card .cd-cap'], font: '.card .cd-cap b' },
  { selectors: ['.fb-tag'], font: '.fb-tag' },
  { selectors: ['.cmp-label', '.cmp-a .cmp-label', '.cmp-b .cmp-label'], font: '.cmp-label' },
  { selectors: ['.cmp-stamp'], font: '.cmp-stamp' },
  { selectors: ['.ct-chip'], font: '.ct-chip' },
  { selectors: ['.chapter-tag'], font: '.ct-title' },
  { selectors: ['.al-bar', '.al-icon'], font: '.al-title', icon: ['.al-icon'] },
  { selectors: ['.al-chip', '.al-chip svg'], font: '.al-chip', icon: ['.al-chip svg'] },
  { selectors: ['.toast', '.ts-icon', '.ts-icon svg'], font: '.ts-text', icon: ['.ts-icon', '.ts-icon svg'] },
  { selectors: ['.note'], font: '.nt-text' },
  { selectors: ['.badge', '.bd-avatar', '.bd-avatar svg'], font: '.bd-n', icon: ['.bd-avatar', '.bd-avatar svg'] },
  { selectors: ['.buffering', '.buffering svg'], font: '.buffering', icon: ['.buffering svg'] },
  { selectors: ['.ld-box', '.ld-bar'], font: '.ld-t' },
];
const round = (n) => Math.round(n * 2) / 2;
const scalePx = (s, k) => s.replace(/(-?\d*\.?\d+)px/g, (_, n) => `${round(Number(n) * k)}px`);
const fontKeys = Object.keys(fonts).sort((a, b) => b.length - a.length);
const fontRole = (selector) => fontKeys.find((key) => selector === key || selector.endsWith(' ' + key));
const changes = [];
function save(file, next, original = fs.readFileSync(file, 'utf8')) {
  if (next === original) return;
  changes.push(file);
  if (apply) fs.writeFileSync(file, next, 'utf8');
}
function caseCss(source) {
  const rules = [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  let out = source;
  const publicBoxes = [];
  for (const [full, rawSelector, rawBody] of rules) {
    const selector = rawSelector.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!selector || selector.startsWith('@')) continue;
    const portrait = selector.includes('[data-orient="portrait"]');
    const orient = portrait ? 1 : 0;
    const plain = selector.replace(/\[data-orient="(?:landscape|portrait)"\]\s*/g, '');
    const role = fontRole(plain);
    let body = rawBody;
    if (role && fonts[role][orient] !== null) {
      const size = fonts[role][orient];
      const k = size / oldFonts[role][orient];
      body = body.replace(/(font-size\s*:\s*)\d+(?:\.\d+)?px/g, `$1${size}px`);
      body = body.replace(/(\bfont\s*:\s*[^;]*?)(\d+(?:\.\d+)?)px/g, (_, start) => start + size + 'px');
      body = body.replace(/(line-height\s*:\s*)(\d+(?:\.\d+)?)px/g, (_, start, n) => start + round(Number(n) * k) + 'px');
    }
    const box = boxes.find((item) => item.selectors.includes(plain));
    if (box) {
      const k = fonts[box.font][orient] / oldFonts[box.font][orient];
      const icon = box.icon?.includes(plain);
      const properties = ['padding(?:-[a-z]+)?', 'gap', 'column-gap', 'row-gap', 'height', 'border-radius', 'border(?:-(?:left|right|top|bottom))?(?:-width)?', 'stroke-width'];
      if (icon) properties.push('width');
      const property = new RegExp(`((?:^|;)\\s*(?:${properties.join('|')})\\s*:\\s*)([^;]+)`, 'g');
      const replacement = body.replace(property, (_, start, value) => start + scalePx(value, k));
      if (!selector.includes('[data-orient=')) {
        const declarations = [...rawBody.matchAll(property)].filter((m) => /px/.test(m[2]));
        if (declarations.length) publicBoxes.push({ plain, box, declarations });
      }
      body = replacement;
    }
    out = out.replace(full, rawSelector + '{' + body + '}');
  }
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const overrides = publicBoxes.map(({ plain, box, declarations }) => {
    const k = fonts[box.font][1] / oldFonts[box.font][1];
    const selectors = plain.split(/,\s*/);
    const effective = declarations.filter((m) => {
      const name = m[1].replace(/^;\s*/, '').trim().split(':')[0].trim();
      return !rules.some(([, selector, body]) => selectors.some((s) => selector.trim() === `[data-orient="portrait"] ${s}`) && new RegExp(`(?:^|;)\\s*${name}\\s*:`).test(body));
    });
    if (!effective.length) return '';
    return `${selectors.map((s) => `[data-orient="portrait"] ${s}`).join(', ')} { ${effective.map((m) => `${m[1].replace(/^;\s*/, '').trim()}${scalePx(m[2], k)};`).join(' ')} }`;
  }).filter(Boolean);
  out = out.replace(' *  3. 字号下限：横屏 24px、竖屏 36px。', ' *  3. 舞台字号按设计决定，不设下限。');
  out = out.replace('；字号 ≥ 36px', '');
  return out.trimEnd() + newline + overrides.join(newline) + newline;
}
const caseStylePath = 'demos/cases/map-pilgrimage/style.css';
const caseStyle = fs.readFileSync(caseStylePath, 'utf8');
const nextCaseStyle = caseCss(caseStyle);
save(caseStylePath, nextCaseStyle, caseStyle);
for (const id of patterns) {
  const file = `demos/patterns/${id}/style.css`;
  const source = fs.readFileSync(file, 'utf8');
  const base = source.replace(/\r\n/g, '\n');
  const oldBase = caseStyle.replace(/\r\n/g, '\n').trimEnd();
  if (!base.startsWith(oldBase)) throw new Error(`${file}: case CSS prefix differs`);
  const tail = base.slice(oldBase.length);
  const next = nextCaseStyle.replace(/\r\n/g, '\n').trimEnd() + tail;
  save(file, source.includes('\r\n') ? next.replace(/\n/g, '\r\n') : next, source);
}
for (const file of ['demos/cases/map-pilgrimage/script.js', ...patterns.map((id) => `demos/patterns/${id}/script.js`)]) {
  const source = fs.readFileSync(file, 'utf8');
  let next = source.replace("const { x, y } = stampXY(i), r = L.stamps.r;", "const { x, y } = stampXY(i), r = L.stamps.r, stampScale = portrait() ? 0.917 : 0.75;");
  next = next.replace("class: 'stamp', transform: `translate(${x} ${y})`", "class: 'stamp', transform: `translate(${x} ${y + r * (1 - stampScale)}) scale(${stampScale})`");
  next = next.replace("attr(st.g, 'transform', `translate(${x} ${y})`);", "const stampScale = portrait() ? 0.917 : 0.75;\n      attr(st.g, 'transform', `translate(${x} ${y + L.stamps.r * (1 - stampScale)}) scale(${stampScale})`);");
  if (next === source) throw new Error(`${file}: stamp code not found`);
  if (file.includes('/seekable-timeline/')) {
    const start = next.indexOf('    style.textContent=`', next.indexOf('function buildSeekBar'));
    const end = next.indexOf('`+`', start);
    if (start < 0 || end < 0) throw new Error('seekable control CSS not found');
    const block = next.slice(start, end);
    const split = block.indexOf('      [data-orient="portrait"]');
    if (split < 0) throw new Error('seekable portrait control CSS not found');
    const scaled = scalePx(block.slice(0, split), .75) + scalePx(block.slice(split), 11 / 12);
    next = next.slice(0, start) + scaled + next.slice(end);
  }
  save(file, next, source);
}
const generator = 'dev/wip/T4b/tools/patterns.mjs';
const generatorSource = fs.readFileSync(generator, 'utf8');
save(generator, generatorSource.replace("const k=(orient==='landscape'?24:36)/13;", "const k=(orient==='landscape'?18:33)/13;"), generatorSource);

for (const file of ['demos/_template/case/style.css', 'demos/_template/pattern/index.html']) {
  const source = fs.readFileSync(file, 'utf8');
  let next = source.replace(/([^{}]+)\{([^{}]*)\}/g, (full, selector, body) => {
    const portrait = selector.includes('[data-orient="portrait"]');
    const oriented = /\[data-orient="(?:landscape|portrait)"\]/.test(selector);
    const k = portrait ? 11 / 12 : .75;
    if (!oriented) return full;
    let result = body.replace(/(font-size\s*:\s*)(\d+(?:\.\d+)?)px/g, (_, start, n) => start + Number((Number(n) * k).toFixed(5)) + 'px');
    const normalized = selector.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\[data-orient="(?:landscape|portrait)"\]\s*/g, '').trim();
    if (['.label', '.endcard', '.endcard .ec-stamp', '.stamp'].includes(normalized)) result = result.replace(/((?:padding|border(?:-(?:left|right|top|bottom))?(?:-width)?|border-radius|gap|margin-top)\s*:\s*)([^;]+)/g, (_, start, value) => start + scalePx(value, k));
    if (normalized === '.hud .brand img') result = scalePx(result, k);
    return selector + '{' + result + '}';
  });
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  if (file.endsWith('/case/style.css')) {
    next = next.replace(/ \*  3\. 字号下限：[^\r\n]+/, ' *  3. 舞台字号按设计决定，不设下限。');
    next += newline + '[data-orient="landscape"] .label { padding: 7.5px 12px 9px; border-left-width: 3px; }' + newline
      + '[data-orient="landscape"] .hud .brand { gap: 10.5px; }' + newline
      + '[data-orient="portrait"] .hud .brand { gap: 13px; }' + newline
      + '[data-orient="landscape"] .endcard .ec-stamp { border-width: 3px; }' + newline
      + '[data-orient="portrait"] .endcard .ec-stamp { border-width: 3.5px; }' + newline;
  } else {
    next = next.replace('    - 字号下限：横屏 24px、竖屏 36px。层级：背景 → 图形 → 文字 → HUD。', '    - 舞台字号按设计决定，不设下限。层级：背景 → 图形 → 文字 → HUD。');
    next = next.replace('  </style>', '    [data-orient="landscape"] .stamp { border-width: 4.5px; }' + newline + '    [data-orient="portrait"] .stamp { border-width: 5.5px; }' + newline + '  </style>');
  }
  save(file, next, source);
}
console.log(JSON.stringify({ apply, files: changes }, null, 2));
