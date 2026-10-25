import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 1440, height: 900, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const resume = process.argv.includes('--resume');
const mapOnly = process.argv.includes('--map-only');
const previous = resume || mapOnly ? JSON.parse(fs.readFileSync(mapOnly ? 'dev/wip/Tcopy/screenshot-results.json' : 'dev/wip/Tcopy/rework-1/screenshots-attempt-1.json', 'utf8')) : null;
const shots = previous?.shots || [], checks = previous?.checks || [], errors = [];
const base = 'http://localhost:4326';
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  page.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') errors.push(p.args.map(a => a.value ?? a.description).join(' ')); });
  async function open(url, width = 1440, height = 900) {
    await page.viewport(width, height);
    const target = base + '/' + url;
    const current = await page.eval('location.href');
    if (current.split('#')[0] === target.split('#')[0] && current !== target) await page.send('Page.navigate', { url: target });
    else await page.goto(target, 45000);
    await page.eval('document.fonts.ready');
    await page.waitFor('document.querySelector(".site-footer")');
  }
  async function shoot(name, note) {
    await page.eval('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
    const path = 'dev/shots/Tcopy/' + name + '.png';
    await page.screenshot(path);
    const shot = { path, note, ...await page.eval('({url: location.href, width: innerWidth, height: innerHeight})') };
    const previousShot = shots.findIndex(s => s.path === path);
    if (previousShot < 0) shots.push(shot); else shots[previousShot] = shot;
    const check = await page.eval(`(() => {
      const small = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('.sr-only')) continue;
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        if (!r.width || !r.height || cs.visibility !== 'visible' || cs.display === 'none') continue;
        let scale = 1;
        if (el instanceof SVGGraphicsElement) { const m = el.getScreenCTM(); if (m) scale = Math.hypot(m.c, m.d); }
        else for (let e = el; e; e = e.parentElement) { const tf = getComputedStyle(e).transform; if (tf !== 'none') { const m = new DOMMatrixReadOnly(tf); scale *= Math.hypot(m.m21, m.m22); } }
        const size = parseFloat(cs.fontSize) * scale;
        if (size > 0 && size < 11.99) small.push({ text: el.textContent.slice(0,80), size });
      }
      return { overflow: document.documentElement.scrollWidth > innerWidth + 1, small, sidebarOpen: document.querySelector('.lib-side')?.classList.contains('open') };
    })()`);
    const previousCheck = checks.findIndex(c => c.shot === name);
    if (previousCheck < 0) checks.push({ shot: name, ...check }); else checks[previousCheck] = { shot: name, ...check };
    console.log('saved ' + name + ' · overflow=' + check.overflow + ' · small=' + check.small.length);
  }
  if (!resume && !mapOnly) {
  for (const [url, name, note] of [
    ['index.html', 'home-desktop', '首页'], ['cases.html', 'cases-desktop', '案例库'],
    ['patterns.html', 'patterns-desktop', '巧思库'], ['docs.html', 'docs-after', '文档中心改版后'],
    ['lab.html', 'lab-desktop', '节奏实验室'], ['agent.html', 'agent-desktop', 'Agent工作流'],
  ]) {
    await open(url);
    if (name === 'home-desktop') await page.waitFor('document.querySelector("#monImg")?.complete && Number(getComputedStyle(document.querySelector("#monImg")).opacity) > .99');
    await shoot(name, note);
  }
  await open('cases.html#case/archive-os');
  await page.waitFor('document.querySelector("#scrubber")?.dataset.ready === "1" && !document.querySelector("#stage-frame")?.hasAttribute("aria-busy")', 60000);
  await page.eval('(async () => { const m = document.getElementById("demo-frame").contentWindow.__motion; await m.ready; m.pause(); await m.seek(35); m.pause(); })()', 60000);
  await page.waitFor('document.querySelector("#scrub-svg .e-line")');
  await page.eval('(() => { const h = [...document.querySelectorAll(".note-sec h2")].find(h => h.textContent.startsWith("节奏结构")); scrollTo({top: scrollY + h.getBoundingClientRect().top - 158, behavior:"instant"}); })()');
  await shoot('archive-rhythm-desktop', '档案终端详情，节奏结构与39点能量曲线');
  checks.push(await page.eval('({archiveEnergyPoints: MA.cases.find(c=>c.id==="archive-os").energy.length, curve: document.querySelector("#scrub-svg .e-line").getAttribute("d"), layout: document.querySelector(".detail").dataset.layout})'));
  }
  await open('cases.html#case/map-pilgrimage');
  await page.waitFor('document.querySelector("#demo-frame")?.getAttribute("src")?.startsWith("demos/cases/map-pilgrimage/")');
  await page.eval('(() => { const frame = document.getElementById("demo-frame"), url = new URL(frame.src); url.searchParams.set("render", "1"); url.searchParams.set("autoplay", "0"); frame.src = url.href; })()');
  await page.waitFor('document.getElementById("demo-frame")?.contentWindow?.location.search.includes("render=1") && document.getElementById("demo-frame")?.contentWindow?.__motion', 60000);
  await page.waitFor('document.querySelector("#scrubber")?.dataset.ready === "1" && !document.querySelector("#stage-frame")?.hasAttribute("aria-busy")', 60000);
  await page.eval('(async () => { const m = document.getElementById("demo-frame").contentWindow.__motion; await m.ready; m.pause(); await m.seek(30.8); m.pause(); })()', 60000);
  await page.eval('(() => { const h = [...document.querySelectorAll(".note-sec h2")].find(h => h.textContent.startsWith("画面细节")); scrollTo({top: scrollY + h.getBoundingClientRect().top - 138, behavior:"instant"}); })()');
  await shoot('map-details-desktop', '地图巡礼详情，画面细节与分屏印章');
  checks.push(await page.eval('({mapObservations: MA.cases.find(c=>c.id==="map-pilgrimage").observations, rendered: [...document.querySelectorAll(".obs-table tr")].map(tr=>tr.textContent)})'));
  if (!mapOnly) {
  await open('patterns.html#pattern/rolling-digits');
  await page.waitFor('document.querySelector("#scrubber")?.dataset.ready === "1" && !document.querySelector("#stage-frame")?.hasAttribute("aria-busy")');
  await page.eval('(async () => { const m = document.getElementById("demo-frame").contentWindow.__motion; await m.ready; m.pause(); await m.seek(2.2); m.pause(); })()');
  await shoot('pattern-detail-desktop', '滚动数字巧思详情');
  checks.push(await page.eval('({caseLinks: [...document.querySelectorAll(".notes > p a")].map(a=>[a.textContent,a.getAttribute("href")]), removedSections: [...document.querySelectorAll(".note-sec h2")].some(h=>/SOURCES/.test(h.textContent))})'));
  await open('cases.html', 390, 844);
  await shoot('cases-mobile-collapsed', '案例库，收藏与工具收起');
  await page.eval('document.querySelector(".side-toggle").click()');
  await shoot('cases-mobile-expanded', '案例库，收藏与工具展开');
  await open('docs.html', 390, 844);
  await shoot('docs-mobile-collapsed', '文档中心，侧栏收起');
  await page.eval('document.querySelector(".side-toggle").click()');
  await shoot('docs-mobile-expanded', '文档中心，侧栏展开');
  checks.push(await page.eval('({docGroups: [...document.querySelectorAll("#docNav h2")].map(h=>h.textContent), docs: MA_DOCS.map(d=>[d.path,d.group]), active: document.querySelector("#docNav [aria-current]")?.textContent})'));
  await page.eval('document.querySelector("#docQ").value="条目结构";document.querySelector("#docQ").dispatchEvent(new Event("input",{bubbles:true}))');
  checks.push(await page.eval('({searchResults:[...document.querySelectorAll("#docNav a")].map(a=>a.textContent)})'));
  await page.eval('document.querySelector("#docNav a").click()');
  await page.waitFor('document.querySelector("#doc h1")?.textContent === "条目结构"');
  checks.push(await page.eval('({afterDocClick: {heading:document.querySelector("#doc h1").textContent, expanded:document.querySelector(".side-toggle").getAttribute("aria-expanded"), visible:getComputedStyle(document.querySelector(".lib-side")).display}})'));
  await open('docs.html', 900, 900);
  checks.push(await page.eval('({tablet: {columns:getComputedStyle(document.querySelector(".docs")).gridTemplateColumns, sideHidden:getComputedStyle(document.querySelector(".lib-side")).display === "none", buttonVisible:getComputedStyle(document.querySelector(".side-toggle")).display !== "none", overflow:document.documentElement.scrollWidth > innerWidth + 1}})'));
  }
} catch (error) {
  errors.push(error.stack);
} finally {
  await browser.close();
}
fs.writeFileSync('dev/wip/Tcopy/screenshot-results.json', JSON.stringify({shots, checks, errors}, null, 2) + '\n');
console.log(`screenshots ${shots.length} saved · ${errors.length} browser errors`);
if (errors.length || checks.some(c => c.overflow || c.small?.length)) process.exitCode = 1;
