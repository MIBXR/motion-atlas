import '../../T4a/tools/direct-browser.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const out = path.join(root, 'dev/wip/Tres/evidence/diag-sg');
const argv = process.argv.slice(2);
const option = (name) => argv.includes(name) ? argv[argv.indexOf(name) + 1] : null;
const styles = option('--style')?.split(',') || ['stained-glass', 'swiss-motion'];
const cases = [
  { id: 'smoke', scan: 'unawaited', width: 1280, height: 720, render: true },
  { id: 'a-no-scan', scan: 'none', width: 1280, height: 720, render: true },
  { id: 'b-await-scan', scan: 'awaited', width: 1280, height: 720, render: true },
  { id: 'c-1920', scan: 'unawaited', width: 1920, height: 1080, render: true },
  { id: 'd-no-render', scan: 'unawaited', width: 1280, height: 720, render: false },
].filter(c => !option('--case') || option('--case').split(',').includes(c.id));
const smoke = fs.readFileSync(path.join(root, 'scripts/smoke.mjs'), 'utf8');
const gpuProbe = smoke.match(/const GPU_PROBE = `([\s\S]*?)`;/)[1];
fs.mkdirSync(out, { recursive: true });
const save = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');

function installRealmProbe() {
  const probe = window.__sgRealm = { origin: performance.timeOrigin, raf: [], longtasks: [] };
  probe.observer = new PerformanceObserver(list => {
    for (const e of list.getEntries()) probe.longtasks.push(e.toJSON());
  });
  probe.observer.observe({ type: 'longtask' });
  probe.start = () => {
    const tick = timestamp => {
      probe.raf.push({ timestamp, callbackAt: performance.now() });
      probe.rafId = requestAnimationFrame(tick);
    };
    probe.rafId = requestAnimationFrame(tick);
  };
  probe.stop = () => {
    cancelAnimationFrame(probe.rafId);
    for (const e of probe.observer.takeRecords()) probe.longtasks.push(e.toJSON());
    probe.observer.disconnect();
    return { origin: probe.origin, raf: probe.raf, longtasks: probe.longtasks };
  };
}

const install = `(() => {
  const frame = document.querySelector('iframe');
  (${installRealmProbe.toString()})();
  frame.contentWindow.eval(${JSON.stringify(`(${installRealmProbe.toString()})();`)});
  const d = window.__sg = { renders: [], phase: 'scan', timeline: [] };
  const original = frame.contentWindow.render;
  frame.contentWindow.render = function(...args) {
    const call = { id: d.renders.length, t: args[0], phase: d.phase, start: performance.now() };
    d.renders.push(call);
    const result = original.apply(this, args);
    call.returned = performance.now();
    call.async = !!result && typeof result.then === 'function';
    if (call.async) result.then(() => { call.end = performance.now(); }, error => {
      call.end = performance.now(); call.error = String(error);
    });
    else call.end = call.returned;
    return result;
  };
  window.__motion.on((time, playing) => {
    if (d.phase === 'play') d.timeline.push({ at: performance.now(), time, playing });
  });
  return { parentOrigin: performance.timeOrigin, iframeOrigin: frame.contentWindow.performance.timeOrigin,
    iframe: frame.src, parentViewport: [innerWidth, innerHeight],
    iframeViewport: [frame.contentWindow.innerWidth, frame.contentWindow.innerHeight],
    visibility: document.visibilityState, longtaskSupported: PerformanceObserver.supportedEntryTypes.includes('longtask') };
})()`;

function profileSummary(profile, startUs, endUs) {
  const nodes = new Map(profile.nodes.map(n => [n.id, n]));
  const parents = new Map();
  for (const node of profile.nodes) for (const child of node.children || []) parents.set(child, node.id);
  const totals = new Map();
  let cursor = profile.startTime, sampledUs = 0, count = 0;
  for (let i = 0; i < (profile.samples || []).length; i++) {
    const next = cursor + profile.timeDeltas[i];
    const duration = Math.max(0, Math.min(next, endUs) - Math.max(cursor, startUs));
    cursor = next;
    if (!duration) continue;
    sampledUs += duration;
    count++;
    let id = profile.samples[i], leaf = true;
    while (id !== undefined) {
      const n = nodes.get(id), f = n.callFrame;
      const key = JSON.stringify([f.functionName, f.url, f.lineNumber, f.columnNumber]);
      const row = totals.get(key) || { function: f.functionName || '(anonymous)', file: f.url || '(V8/native)',
        line: f.lineNumber < 0 ? null : f.lineNumber + 1, column: f.columnNumber < 0 ? null : f.columnNumber + 1,
        selfMs: 0, inclusiveMs: 0, samples: 0 };
      row.inclusiveMs += duration / 1000;
      if (leaf) { row.selfMs += duration / 1000; row.samples++; }
      totals.set(key, row);
      id = parents.get(id);
      leaf = false;
    }
  }
  const rows = [...totals.values()];
  return { startUs, endUs, sampledMs: sampledUs / 1000, samples: count,
    top10Self: rows.filter(r => r.selfMs > 0).sort((a, b) => b.selfMs - a.selfMs).slice(0, 10),
    top10Inclusive: rows.filter(r => !['(root)', '(idle)', '(program)'].includes(r.function))
      .sort((a, b) => b.inclusiveMs - a.inclusiveMs).slice(0, 10) };
}

function traceSummary(events, playMs) {
  const begin = events.find(e => e.name === 'diag-sg-play-start');
  const end = events.find(e => e.name === 'diag-sg-play-end');
  if (!begin || !end) throw new Error('Missing playback trace marks');
  const main = events.filter(e => e.pid === begin.pid && e.tid === begin.tid && e.ph === 'X' && e.dur &&
    e.ts < end.ts && e.ts + e.dur > begin.ts);
  const taskRow = e => ({ name: e.name, pid: e.pid, tid: e.tid,
    startMs: (e.ts - begin.ts) / 1000, durationMs: e.dur / 1000, args: e.args });
  const gpuTasks = events.filter(e => e.name === 'GPUTask' && e.ph === 'X' &&
    e.args?.data?.renderer_pid === begin.pid && e.ts < end.ts && e.ts + e.dur > begin.ts);
  const sums = new Map();
  for (const e of main) {
    const overlap = Math.max(0, Math.min(e.ts + e.dur, end.ts) - Math.max(e.ts, begin.ts)) / 1000;
    const row = sums.get(e.name) || { name: e.name, count: 0, overlapMs: 0, maxMs: 0 };
    row.count++;
    row.overlapMs += overlap;
    row.maxMs = Math.max(row.maxMs, e.dur / 1000);
    sums.set(e.name, row);
  }
  return { pid: begin.pid, tid: begin.tid, startUs: begin.ts, endUs: end.ts,
    performanceToTraceUs: begin.ts - playMs * 1000,
    eventsByInclusiveMs: [...sums.values()].sort((a, b) => b.overlapMs - a.overlapMs),
    longest10: main.sort((a, b) => b.dur - a.dur).slice(0, 10).map(taskRow),
    mainLongtasksTop10: main.filter(e => e.name === 'RunTask' && e.dur >= 50000)
      .sort((a, b) => b.dur - a.dur).slice(0, 10).map(taskRow),
    gpuTasksTop10: gpuTasks.sort((a, b) => b.dur - a.dur).slice(0, 10).map(taskRow) };
}

function realmSummary(realm, origin, start, end) {
  const offset = realm.origin - origin;
  const raf = realm.raf.map(r => ({ timestampMs: r.timestamp + offset - start, callbackMs: r.callbackAt + offset - start }))
    .filter(r => r.callbackMs >= 0 && r.callbackMs <= end - start);
  const gaps = raf.slice(1).map((r, i) => r.timestampMs - raf[i].timestampMs);
  const tasks = realm.longtasks.map(t => ({ ...t, startMs: t.startTime + offset - start }))
    .filter(t => t.startMs < end - start && t.startMs + t.duration > 0);
  return { raf, rafCount: raf.length, maxRafGapMs: gaps.length ? Math.max(...gaps) : null,
    firstRafMs: raf[0]?.callbackMs ?? null, lastRafMs: raf.at(-1)?.callbackMs ?? null,
    longtasks: tasks, top10Longtasks: [...tasks].sort((a, b) => b.duration - a.duration).slice(0, 10) };
}

async function run(style, test) {
  const key = `${style}-${test.id}`;
  const launchOptions = { width: test.width, height: test.height,
    args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] };
  const url = new URL('http://localhost:4328/demos/styles/player/');
  url.searchParams.set('style', style);
  if (test.render) url.searchParams.set('render', '1');
  url.searchParams.set('orient', 'landscape');
  console.log(`START ${key}`);
  const browser = await launch(launchOptions);
  try {
    const page = await browser.newPage();
    await page.viewport(test.width, test.height);
    const errors = [], events = [];
    page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
    page.on('Runtime.consoleAPICalled', p => {
      if (p.type === 'error') errors.push(p.args.map(a => a.value ?? a.description).join(' '));
      if (p.args[0]?.value === '__diag-sg-scan') console.log(key, ...p.args.slice(1).map(a => a.value));
    });
    page.on('Tracing.dataCollected', p => events.push(...p.value));
    await page.send('Page.addScriptToEvaluateOnNewDocument', {
      source: "addEventListener('motion:ready', e => { window.__smokeReady = e.detail; });",
    });
    const navigationStart = Date.now();
    await page.goto(url.href, 45000);
    const hasMotion = await page.eval(`new Promise(r => { let n = 0; const iv = setInterval(() => {
      if (window.__motion || ++n >= 1800) { clearInterval(iv); r(!!window.__motion); }
    }, 100); })`, 180000);
    if (!hasMotion) throw new Error('Missing __motion');
    await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 180000);
    const readyMs = Date.now() - navigationStart;
    const gpu = await page.eval(gpuProbe);
    const version = await page.send('Browser.getVersion');
    const environment = await page.eval(install);
    const duration = await page.eval('window.__motion.duration');
    const scan = await page.eval(`(async () => {
      const m = window.__motion, d = window.__sg, start = performance.now();
      m.pause();
      let seeks = 0;
      if (${JSON.stringify(test.scan)} !== 'none') {
        for (let t = 0; t <= ${duration}; t += 0.2) {
          ${test.scan === 'awaited' ? 'await m.seek(t);' : 'm.seek(t);'} seeks++;
          if (${JSON.stringify(test.scan)} === 'awaited' && seeks % 25 === 0)
            console.debug('__diag-sg-scan', seeks, t, performance.now() - start);
        }
        ${test.scan === 'awaited' ? 'await m.seek(m.duration);' : 'm.seek(m.duration);'} seeks++;
      }
      return { start, end: performance.now(), seeks };
    })()`, 600000);
    const reset = await page.eval(`(async () => {
      window.__sg.phase = 'reset'; const start = performance.now();
      await window.__motion.seek(0);
      return { start, end: performance.now(), time: window.__motion.time };
    })()`, 180000);
    await page.send('Profiler.enable');
    await page.send('Profiler.setSamplingInterval', { interval: 1000 });
    await page.send('Profiler.start');
    await page.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,toplevel',
      transferMode: 'ReportEvents' });
    const start = await page.eval(`(async () => {
      const d = window.__sg, m = window.__motion;
      d.phase = 'play';
      window.__sgRealm.start(); document.querySelector('iframe').contentWindow.__sgRealm.start();
      performance.mark('diag-sg-play-start'); d.start = performance.now();
      await m.play();
      return { at: d.start, time: m.time };
    })()`);
    const timer = await page.eval(`new Promise(resolve => {
      const scheduledAt = performance.now();
      setTimeout(() => resolve({ scheduledAt, firedAt: performance.now() }), 1500);
    })`, 180000);
    const read = await page.eval(`(() => {
      const d = window.__sg; d.end = performance.now();
      performance.mark('diag-sg-play-end');
      return { at: d.end, time: window.__motion.time };
    })()`);
    await page.eval(`window.__sg.phase = 'pause'; window.__motion.pause(); true`);
    const { profile } = await page.send('Profiler.stop');
    const tracingComplete = page.once('Tracing.tracingComplete', 60000);
    await page.send('Tracing.end');
    await tracingComplete;
    const data = await page.eval(`new Promise(resolve => setTimeout(() => {
      const d = window.__sg;
      resolve({ start: d.start, end: d.end, origin: performance.timeOrigin, renders: d.renders,
        timeline: d.timeline, parent: window.__sgRealm.stop(),
        iframe: document.querySelector('iframe').contentWindow.__sgRealm.stop() });
    }, 0))`);
    const trace = traceSummary(events, data.start);
    const profileStart = trace.startUs;
    const profileEnd = trace.endUs;
    const calls = data.renders.filter(r => r.start < data.end && (r.end ?? Infinity) > data.start)
      .map(r => ({ ...r, startMs: r.start - data.start, endMs: r.end === undefined ? null : r.end - data.start,
        syncMs: r.returned - r.start, durationMs: r.end === undefined ? null : r.end - r.start }));
    const result = { style, case: test, measuredAt: new Date().toISOString(), url: url.href,
      browser: { exe: browser.exe, version, launchOptions, preload: 'dev/wip/T4a/tools/direct-browser.mjs', gpu },
      environment, readyMs, duration, scan, reset, start, timer, read,
      elapsedMs: read.at - start.at, timerDelayMs: timer.firedAt - timer.scheduledAt,
      smokePass: read.time > start.time + 0.5, errors,
      parent: realmSummary(data.parent, data.origin, data.start, data.end),
      iframe: realmSummary(data.iframe, data.origin, data.start, data.end),
      renders: { calls, allPhases: data.renders, timeline: data.timeline,
        count: calls.length, totalSyncMs: calls.reduce((n, c) => n + c.syncMs, 0),
        maxSyncMs: calls.length ? Math.max(...calls.map(c => c.syncMs)) : null },
      profile: profileSummary(profile, profileStart, profileEnd), trace };
    save(`${key}.profile.json`, profile);
    save(`${key}.trace.json`, { traceEvents: events });
    save(`${key}.json`, result);
    console.log(JSON.stringify({ key, time: read.time, elapsedMs: result.elapsedMs,
      smokePass: result.smokePass, parentRaf: result.parent.rafCount, iframeRaf: result.iframe.rafCount,
      longtasks: result.parent.longtasks.length, renderCalls: calls.length,
      maxRenderMs: result.renders.maxSyncMs, errors }));
  } finally {
    await browser.close();
  }
}

for (const style of styles) for (const test of cases) await run(style, test);
