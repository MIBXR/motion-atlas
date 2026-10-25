import fs from 'node:fs';
import { launch, click, goto } from './browser.mjs';

const base = 'http://localhost:4326';
const results = [], measurements = [], pending = [], errors = [], httpFailures = [];
const browser = await launch({ width: 1440, height: 900 });
const page = await browser.newPage();
page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
await page.send('Network.enable');
page.on('Network.responseReceived', p => { if (p.response.status >= 400 && p.response.url.startsWith(base)) httpFailures.push([p.response.status, p.response.url]); });
function check(section, name, actual, expected = true) {
  results.push({ section, name, pass: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
}
async function load(route, width = 1440, height = 900) {
  await page.viewport(width, height);
  await goto(page, `${base}/${route}`);
  await page.waitFor('document.querySelector(".nav-toggle") && (document.querySelector("#grid .card") || document.querySelector("#doc h1") || document.querySelector("#beat-list button"))');
  await page.eval('document.fonts.ready');
  await page.eval('new Promise(r => setTimeout(r, 100))');
}
async function scroll(y) {
  await page.eval(`scrollTo({ top: ${y}, behavior: 'instant' }); new Promise(r => setTimeout(r, 250))`);
}
async function escape() {
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
}
const overflowProbe = `(() => [...document.body.querySelectorAll('*')].filter(el => {
  const cs = getComputedStyle(el);
  if (!['auto', 'scroll'].includes(cs.overflowX) || el.scrollWidth <= el.clientWidth + 1) return false;
  if (el.matches('.doc pre')) return false;
  if (el.matches('.tbl, .tbl-wrap, .q-scroll') && el.querySelector('table')) return false;
  return true;
}).map(el => ({ tag: el.tagName, id: el.id, class: el.className, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth })))()`;
const fontProbe = `(() => [...document.body.querySelectorAll('*')].flatMap(el => {
  if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return [];
  let size = parseFloat(getComputedStyle(el).fontSize);
  if (el instanceof SVGTextContentElement) { const m = el.getScreenCTM(); size *= Math.hypot(m.c, m.d); }
  return size < 11.999 ? [{ text: el.textContent.trim().slice(0, 80), size }] : [];
}))()`;
try {
  for (const width of [1440, 1920, 2560]) {
    const sides = [];
    for (const kind of ['cases', 'patterns', 'docs']) {
      await load(`${kind}.html`, width);
      const m = await page.eval(`(() => {
        const layout = document.querySelector('.lib, .docs'), side = document.querySelector('.lib-side');
        const columns = getComputedStyle(layout).gridTemplateColumns.split(' ').map(parseFloat);
        const r = side.getBoundingClientRect();
        const article = document.querySelector('.doc');
        return { width: innerWidth, viewport: document.documentElement.clientWidth, scrollbar: innerWidth - document.documentElement.clientWidth,
          columns, mainWidth: article ? columns[1] : document.querySelector('.lib > section').getBoundingClientRect().width,
          articleWidth: article?.getBoundingClientRect().width, articleMax: article && getComputedStyle(article).maxWidth,
          side: { x: r.x, y: r.y, width: r.width, overflowX: getComputedStyle(side).overflowX, scrollWidth: side.scrollWidth, clientWidth: side.clientWidth } };
      })()`);
      measurements.push({ kind, ...m });
      const expected = width - m.scrollbar - 64 - 228 - 32 - (kind === 'docs' ? 232 : 0);
      check('a', `${kind} ${width} main column (${m.mainWidth} / ${expected})`, Math.abs(m.mainWidth - expected) <= 1);
      if (kind === 'docs') {
        check('a', `docs ${width} article max width`, m.articleMax, '860px');
        check('a', `docs ${width} article inside middle column`, Math.abs(m.articleWidth - Math.min(860, m.mainWidth)) <= 1);
      }
      sides.push([m.side.x, m.side.y, m.side.width]);
      check('c', `${kind} ${width} sidebar overflow-x`, m.side.overflowX, 'hidden');
      check('c', `${kind} ${width} sidebar has no horizontal overflow`, m.side.scrollWidth <= m.side.clientWidth);
      check('extra', `${kind} ${width} visible text >= 12px`, await page.eval(fontProbe), []);
    }
    check('b', `${width} cases/patterns/sidebar exact alignment`, sides[1], sides[0]);
    check('b', `${width} cases/docs/sidebar exact alignment`, sides[2], sides[0]);
  }

  for (const width of [1440, 390]) for (const id of ['archive-os', 'map-pilgrimage']) {
    await load(`cases.html#case/${id}`, width, width === 390 ? 844 : 900);
    await page.waitFor('document.querySelector(".stage-frame") && !document.querySelector(".stage-frame").hasAttribute("aria-busy")');
    const beats = await page.eval(`(() => {
      const box = document.querySelector('#beat-list'), r = box.getBoundingClientRect(), buttons = [...box.querySelectorAll('button')];
      return { clientWidth: box.clientWidth, scrollWidth: box.scrollWidth, wrap: getComputedStyle(box).flexWrap, gap: getComputedStyle(box).gap,
        count: buttons.length, expected: MA.cases.find(c => c.id === '${id}').rhythm.beats.length,
        outside: buttons.filter(b => { const q = b.getBoundingClientRect(); return !q.width || !q.height || q.left < r.left - 1 || q.right > r.right + 1 || q.top < r.top - 1 || q.bottom > r.bottom + 1; }).map(b => b.textContent) };
    })()`);
    measurements.push({ id, width, beats });
    check('d', `${id} ${width} beat list no horizontal overflow`, beats.scrollWidth <= beats.clientWidth);
    check('d', `${id} ${width} all beat buttons present`, beats.count, beats.expected);
    check('d', `${id} ${width} all beat buttons inside container`, beats.outside, []);
    check('d', `${id} ${width} wrap and gaps`, [beats.wrap, beats.gap], ['wrap', '6px']);
  }

  const prompt = await page.eval('MA.cases[0].id');
  const routes = ['cases.html', 'patterns.html', 'cases.html#case/archive-os', 'cases.html#case/map-pilgrimage',
    'docs.html#doc/docs/guide.md', 'docs.html#doc/docs/pipeline.md', `docs.html#doc/prompts/cases/${prompt}.md`];
  for (const width of [1440, 390]) for (const route of routes) {
    await load(route, width, width === 390 ? 844 : 900);
    if (route.includes('prompts/')) check('e', `${width} Prompt route loaded`, await page.eval('document.querySelector("#doc .doc-path").textContent.includes("prompts/")'));
    check('e', `${route} ${width} unauthorized horizontal scrollers`, await page.eval(overflowProbe), []);
    check('extra', `${route} ${width} document no horizontal overflow`, await page.eval('document.documentElement.scrollWidth <= document.documentElement.clientWidth'));
    check('extra', `${route} ${width} visible text >= 12px`, await page.eval(fontProbe), []);
  }

  for (const kind of ['cases', 'patterns', 'docs']) {
    await load(`${kind}.html`, 390, 844);
    const sideId = await page.eval('document.querySelector(".lib-side").id');
    check('f', `${kind} menu button SVG and label`, await page.eval('document.querySelector(".nav-toggle").textContent.trim() === "菜单" && !!document.querySelector(".nav-toggle svg")'));
    if (kind !== 'docs') {
      const y = await page.eval('document.querySelector("#grid .card").getBoundingClientRect().y');
      check('g', `${kind} first card y=${y} < 844`, y < 844);
    }
    await click(page, '.nav-toggle');
    check('f', `${kind} menu visible and default directory`, await page.eval('!document.querySelector("#mobile-menu").hidden && document.querySelector("[data-view=page]").getAttribute("aria-pressed") === "true" && !!document.querySelector(".menu-page .lib-side")'));
    check('f', `${kind} all menu details open`, await page.eval('[...document.querySelectorAll(".menu-page details")].every(d => d.open)'));
    check('f', `${kind} sidebar node reused`, await page.eval(`document.querySelector('.menu-page .lib-side').id === '${sideId}' && document.querySelectorAll('.lib-side').length === 1`));
    check('c', `${kind} mobile sidebar no horizontal overflow`, await page.eval('getComputedStyle(document.querySelector(".lib-side")).overflowX === "hidden" && document.querySelector(".lib-side").scrollWidth <= document.querySelector(".lib-side").clientWidth'));
    check('extra', `${kind} mobile menu no unauthorized scrollers`, await page.eval(overflowProbe), []);
    await click(page, '[data-view="site"]');
    check('f', `${kind} site navigation visible`, await page.eval('!document.querySelector(".menu-site").hidden && document.querySelectorAll(".menu-site .site-nav a").length === 6'));
    await click(page, '[data-view="page"]');
    const action = kind === 'docs' ? '#docNav a[data-p="docs/rhythm.md"]' : kind === 'cases' ? '[data-group="carrier"][data-value="console"]' : '[data-group="type"][data-value="rhythm"]';
    await click(page, action);
    await page.waitFor('document.querySelector("#mobile-menu").hidden');
    check('f', `${kind} selection closes menu`, await page.eval('document.querySelector("#mobile-menu").hidden && document.querySelector(".nav-toggle").getAttribute("aria-expanded") === "false"'));
    check('f', `${kind} focus returns to menu`, await page.eval('document.activeElement === document.querySelector(".nav-toggle")'));
    if (kind === 'docs') {
      await page.waitFor('document.querySelector("#doc .doc-path").textContent.includes("docs/rhythm.md")');
      check('f', 'docs selection changes document', await page.eval('document.querySelector("#doc .doc-path").textContent.includes("docs/rhythm.md")'));
    } else {
      const m = await page.eval(`({ ids: [...document.querySelectorAll('#grid .card-title a')].map(a => a.hash.split('/').pop()), expected: MA.${kind}.filter(p => p.${kind === 'cases' ? 'carriers' : 'types'}.includes('${kind === 'cases' ? 'console' : 'rhythm'}')).map(p => p.id) })`);
      check('f', `${kind} selection changes results`, m.ids, m.expected);
    }
    await load(`${kind}.html`, 390, 844);
    await scroll(1500);
    const down = await page.eval('scrollY');
    measurements.push({ kind, mobileScrollRequested: 1500, mobileScrollReached: down });
    if (down < 1500) pending.push({ item: '8.4(f)', page: kind, requested: 1500, actual: down, reason: 'Natural page height does not permit scrollY=1500; tested upward recovery from the natural bottom.' });
    check('f', `${kind} header hides while scrolling down past 80`, await page.eval('scrollY > 80 && document.querySelector(".site-header").classList.contains("is-hidden")'));
    await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 600, deltaX: 0, deltaY: -100 });
    await page.waitFor('!document.querySelector(".site-header").classList.contains("is-hidden")');
    await page.eval('new Promise(r => setTimeout(r, 250))');
    check('f', `${kind} upward scroll restores header`, await page.eval(`scrollY <= ${down - 8} && document.querySelector('.site-header').getBoundingClientRect().y === 0`));
    await click(page, '.nav-toggle');
    check('f', `${kind} menu clickable after scrolling`, await page.eval('!document.querySelector("#mobile-menu").hidden'));
    await scroll(down);
    check('f', `${kind} open menu keeps header visible`, await page.eval('!document.querySelector(".site-header").classList.contains("is-hidden")'));
    await escape();
    check('f', `${kind} Escape closes menu and restores focus`, await page.eval('document.querySelector("#mobile-menu").hidden && document.activeElement === document.querySelector(".nav-toggle")'));
    await click(page, '.nav-toggle');
    await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 5, y: 75, button: 'left', clickCount: 1 });
    await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 5, y: 75, button: 'left', clickCount: 1 });
    check('f', `${kind} outside click closes menu and restores focus`, await page.eval('document.querySelector("#mobile-menu").hidden && document.activeElement === document.querySelector(".nav-toggle")'));
    await click(page, '.nav-toggle');
    await click(page, '.nav-toggle');
    check('f', `${kind} button toggles menu closed`, await page.eval('document.querySelector("#mobile-menu").hidden'));
    await scroll(0);
    await click(page, '.nav-toggle');
    await page.viewport(1440, 900);
    await page.waitFor('document.querySelector("#mobile-menu").hidden && document.querySelector(".lib > .lib-side, .docs > .lib-side")');
    check('f', `${kind} desktop restores sidebar as first element`, await page.eval('document.querySelector(".lib, .docs").firstElementChild.classList.contains("lib-side") && document.querySelectorAll(".lib-side").length === 1'));
    check('f', `${kind} desktop restores site navigation`, await page.eval('!!document.querySelector(".site-header > .site-nav")'));
    await page.viewport(390, 844);
    await page.waitFor('!!document.querySelector(".menu-page .lib-side") && !!document.querySelector(".menu-site .site-nav")');
    check('f', `${kind} mobile document <= 390px`, await page.eval('document.documentElement.scrollWidth <= 390'));
  }

  for (const kind of ['cases', 'patterns', 'docs']) {
    await load(`${kind}.html`, 1440);
    const selector = '.lib-side details:first-of-type > summary';
    await click(page, selector);
    check('h', `${kind} summary collapses`, await page.eval('!document.querySelector(".lib-side details").open'));
    await click(page, selector);
    check('h', `${kind} summary expands`, await page.eval('document.querySelector(".lib-side details").open'));
    await page.eval('document.querySelector(".lib-side summary").focus()');
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    check('h', `${kind} summary keyboard focus ring`, await page.eval('document.activeElement.matches("summary:focus-visible") && getComputedStyle(document.activeElement).outlineStyle !== "none"'));
    if (kind === 'docs') {
      const promptPath = await page.eval('MA_DOCS.find(d => d.group !== MA_DOCS[0].group).path');
      await page.eval(`document.querySelector('#docNav a[data-p="${promptPath}"]').closest('details').open = false; location.hash = '#doc/${promptPath}'`);
      await page.waitFor(`document.querySelector('#docNav a[data-p="${promptPath}"]').getAttribute('aria-current') === 'page'`);
      check('h', 'current document group opens on navigation', await page.eval('document.querySelector("#docNav a[aria-current=page]").closest("details").open'));
    }
  }
  for (const route of ['index.html', 'lab.html', 'agent.html', 'cases.html#case/archive-os']) {
    await page.viewport(390, 844);
    await page.goto(`${base}/${route}`);
    await page.waitFor('document.querySelector(".nav-toggle")');
    await click(page, '.nav-toggle');
    check('extra', `${route} site-only mobile menu`, await page.eval('document.querySelector(".menu-views").hidden && !document.querySelector(".menu-site").hidden && !document.querySelector(".menu-page .lib-side")'));
    await escape();
  }
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  check('extra', 'reduced motion disables header transition', await page.eval('parseFloat(getComputedStyle(document.querySelector(".site-header")).transitionDuration) === 0'));
  check('extra', 'runtime exceptions', errors, []);
  check('extra', 'local HTTP failures', httpFailures, []);
} catch (error) {
  results.push({ section: 'completion', name: 'script completion', pass: false, error: error.stack });
} finally {
  fs.writeFileSync('dev/wip/Tlayout/layout-results.json', JSON.stringify({ browser: browser.exe, results, measurements, pending }, null, 2) + '\n');
  await browser.close();
}
for (const section of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'extra']) {
  const items = results.filter(r => r.section === section);
  console.log(`layout ${section} ${items.filter(r => r.pass).length}/${items.length} passed`);
}
const passed = results.filter(r => r.pass).length;
console.log(`layout ${passed}/${results.length} passed · pending ${pending.length} strict scroll target`);
for (const r of results.filter(r => !r.pass)) console.error(JSON.stringify(r));
if (passed !== results.length) process.exitCode = 1;
