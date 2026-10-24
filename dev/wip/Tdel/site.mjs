import fs from 'node:fs';
import path from 'node:path';
import '../T4a/tools/direct-browser.mjs';
import { launch } from '../../../scripts/lib/cdp.mjs';

const base = 'http://localhost:4322';
const out = 'dev/shots/Tdel/site';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const frame = 'document.getElementById("demo-frame")';
const motion = `${frame}.contentWindow.__motion`;
const only = new Set(process.argv.slice(2));
const jobs = [
  { name: 'home', url: '/' },
  { name: 'cases', url: '/cases.html', count: 3 },
  { name: 'patterns', url: '/patterns.html', count: 22 },
  { name: 'lab', url: '/lab.html' },
  { name: 'map-pilgrimage', url: '/cases.html', kind: 'case', at: 23.6 },
  { name: 'archive-os', url: '/cases.html', kind: 'case', at: 39.22 },
  { name: 'industrial-protocol', url: '/cases.html', kind: 'case', at: 7 },
  { name: 'corner-hud', url: '/patterns.html', kind: 'pattern', at: 2.5 },
];

function siteProbe() {
  const fonts = [];
  for (const el of document.querySelectorAll('body *')) {
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (!text) continue;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (cs.visibility !== 'visible' || cs.display === 'none' || r.width < 2 || r.height < 2) continue;
    let opacity = 1, scale = 1;
    for (let parent = el; parent; parent = parent.parentElement) {
      const s = getComputedStyle(parent);
      opacity *= parseFloat(s.opacity);
      if (!(el instanceof SVGGraphicsElement) && s.transform !== 'none') {
        const m = new DOMMatrixReadOnly(s.transform);
        scale *= Math.hypot(m.m21, m.m22);
      }
    }
    if (opacity < 0.05) continue;
    if (el instanceof SVGGraphicsElement) {
      const m = el.getScreenCTM();
      if (m) scale = Math.hypot(m.c, m.d);
    }
    fonts.push({ px: +(parseFloat(cs.fontSize) * scale).toFixed(3), text: text.slice(0, 70), tag: el.tagName, className: el.getAttribute('class') });
  }
  return {
    viewport: [innerWidth, innerHeight],
    documentWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    minSiteFont: Math.min(...fonts.map((f) => f.px)),
    textElements: fonts.length,
    smallText: fonts.filter((f) => f.px < 11.999),
    heading: document.querySelector('h1')?.innerText,
    counts: { cases: window.MA?.cases.length, patterns: window.MA?.patterns.length },
    stats: document.querySelector('#stats')?.innerText,
    homeCards: document.querySelectorAll('#caseGrid .card').length,
    listCards: document.querySelectorAll('#grid .card').length,
    listTitles: [...document.querySelectorAll('#grid .card-title a')].map((a) => a.innerText),
    resultCount: document.querySelector('#result-count')?.innerText,
    brokenImages: [...document.images].filter((img) => img.complete && img.currentSrc && !img.naturalWidth).map((img) => img.currentSrc),
  };
}

function gpuProbe() {
  const renderers = new Set();
  function visit(doc) {
    for (const canvas of doc.querySelectorAll('canvas')) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) continue;
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      if (debug) renderers.add(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
    }
    for (const iframe of doc.querySelectorAll('iframe')) if (iframe.contentDocument) visit(iframe.contentDocument);
  }
  visit(document);
  return [...renderers];
}

const check = (result, ok, label) => result.checks.push({ ok: !!ok, label });
const report = only.size
  ? JSON.parse(fs.readFileSync(path.join(out, 'verification.json'), 'utf8'))
  : { base, command: 'node dev/wip/Tdel/site.mjs', viewportSizes: [[1440, 900], [390, 844]], pages: [] };
if (only.size) (report.followupCommands ||= []).push(`node dev/wip/Tdel/site.mjs ${[...only].join(' ')}`);
fs.mkdirSync(out, { recursive: true });
const save = () => fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
const browser = await launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
try {
  for (const [width, height] of report.viewportSizes) {
    for (const job of jobs) {
      const result = { name: `${width}-${job.name}`, checks: [], errors: [], httpErrors: [], failedRequests: [] };
      if (only.size && !only.has(result.name)) continue;
      const previous = report.pages.findIndex((p) => p.name === result.name);
      if (previous < 0) report.pages.push(result);
      else report.pages[previous] = result;
      console.log(`start ${result.name}`);
      const page = await browser.newPage();
      await page.viewport(width, height);
      await page.send('Network.enable');
      page.on('Runtime.exceptionThrown', (p) => result.errors.push({ type: 'uncaught', text: p.exceptionDetails.exception?.description || p.exceptionDetails.text }));
      page.on('Runtime.consoleAPICalled', (p) => {
        if (p.type === 'error') result.errors.push({ type: 'console.error', text: p.args.map((a) => a.value ?? a.description).join(' ') });
      });
      page.on('Network.responseReceived', (p) => {
        if (p.response.status >= 400) result.httpErrors.push({ status: p.response.status, url: p.response.url });
      });
      page.on('Network.loadingFailed', (p) => {
        if (!p.canceled) result.failedRequests.push({ requestId: p.requestId, error: p.errorText });
      });
      try {
        const orient = width < 600 ? 'portrait' : 'landscape';
        result.url = `${base}${job.url}${job.kind ? `#${job.kind}/${job.name}?orient=${orient}` : ''}`;
        await page.goto(result.url, 120000);
        await page.waitFor('window.Site && window.MA && document.querySelector(".site-nav")');
        await page.eval('document.fonts.ready.then(() => true)');
        if (job.kind) {
          await page.waitFor(`${frame} && ${motion}`, 120000);
          await page.eval(`Promise.resolve(${motion}.ready).then(() => true)`, 180000);
          await page.waitFor('document.querySelector("#scrubber").dataset.ready === "1"');
          result.demo = await page.eval(`(async () => { const m=${motion}; m.pause(); await m.seek(${job.at}); return {time:m.time,playing:m.playing,orient:m.orient,orients:m.orients}; })()`, 180000);
          if (job.name === 'map-pilgrimage') {
            await page.waitFor(`${frame}.contentWindow.__buffer?.bufferedUntil >= ${job.at + 1} && !${frame}.contentDocument.querySelector('.loading.on,.buffering.on')`, 180000);
            result.buffer = await page.eval(`${frame}.contentWindow.__buffer`);
            check(result, true, '地图当前帧及后一秒已缓冲，内部加载与缓冲遮罩消失');
          }
          await page.waitFor('!document.querySelector(".stage-loading").classList.contains("show")');
          check(result, !result.demo.playing && Math.abs(result.demo.time - job.at) < 0.01, '详情 Demo 就绪并暂停到指定时刻');
          const title = await page.eval(`window.MA.${job.kind === 'case' ? 'cases' : 'patterns'}.find((e) => e.id === ${JSON.stringify(job.name)}).title`);
          check(result, await page.eval('document.querySelector(".detail-head h1").innerText') === title, '详情展示所选保留条目');
          if (job.name === 'archive-os') {
            result.renderers = await page.eval(`(${gpuProbe.toString()})()`);
            check(result, result.renderers.length && result.renderers.every((r) => !/swiftshader|llvmpipe|software|microsoft basic render/i.test(r)), '档案 iframe 使用硬件 GPU');
          }
        } else if (job.name === 'lab') await page.waitFor('window.__lab && document.querySelector("#transport")');
        else await page.waitFor(job.name === 'home' ? 'document.querySelectorAll("#caseGrid .card").length === 3' : `document.querySelectorAll("#grid .card").length === ${job.count}`);

        const extent = await page.eval('Math.max(0, document.documentElement.scrollHeight - innerHeight)');
        for (let y = 0; y < extent; y += Math.floor(height * 0.8)) {
          await page.eval(`scrollTo({top:${y},behavior:'instant'})`);
          await sleep(100);
        }
        await page.eval("scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
        await sleep(250);
        await page.waitFor('[...document.images].every((img) => !img.currentSrc || img.complete)', 15000);
        await page.eval("scrollTo({top:0,behavior:'instant'})");
        await sleep(300);
        result.site = await page.eval(`(${siteProbe.toString()})()`);
        check(result, result.site.counts.cases === 3 && result.site.counts.patterns === 22, '站点数据为 3 个案例、22 个巧思');
        check(result, !!result.site.heading, '页面标题有可见内容');
        check(result, !result.site.overflow, '页面无横向溢出');
        check(result, result.site.textElements > 0 && result.site.minSiteFont >= 11.999, '站点实际渲染文字至少 12px（不含 iframe 内 Demo）');
        check(result, result.site.brokenImages.length === 0, '页面图片已加载且无破损');
        if (job.name === 'home') {
          check(result, result.site.homeCards === 3, '首页展示 3 个保留案例卡片');
          check(result, /3.*22.*3/.test(result.site.stats), '首页可见统计为 3 / 22 / 3');
        }
        if (job.count) check(result, result.site.listCards === job.count && result.site.listTitles.length === job.count, `列表展示全部 ${job.count} 个保留条目`);
        result.screenshot = path.join(out, `${result.name}.png`).replaceAll('\\', '/');
        await page.screenshot(result.screenshot);
        await sleep(200);
        check(result, result.errors.length === 0, '无 console.error 或未捕获异常');
        check(result, !result.httpErrors.some((r) => r.status === 404), 'Network 响应无 404');
      } catch (error) {
        result.errors.push({ type: 'verification', text: error.stack });
        check(result, false, error.message);
      } finally {
        save();
        const closed = await Promise.race([page.send('Page.close').then(() => true), sleep(5000).then(() => false)]);
        if (!closed) {
          result.errors.push({ type: 'cleanup', text: 'Page.close did not complete within 5 seconds' });
          check(result, false, '关闭当前走查页面超时');
          save();
          throw new Error(`${result.name}: Page.close timeout`);
        }
      }
      console.log(`${result.name} ${result.checks.filter((c) => c.ok).length}/${result.checks.length} checks · ${result.errors.length} errors · ${result.httpErrors.filter((r) => r.status === 404).length} HTTP 404`);
    }
  }
} finally {
  await browser.close();
}
const checks = report.pages.flatMap((p) => p.checks);
report.summary = { pages: report.pages.length, expectedPages: 16, checks: checks.length, passed: checks.filter((c) => c.ok).length, failures: checks.filter((c) => !c.ok) };
save();
console.log(`site ${report.summary.pages}/16 pages · ${report.summary.passed}/${report.summary.checks} checks`);
if (report.summary.pages !== 16 || report.summary.failures.length) process.exitCode = 1;
