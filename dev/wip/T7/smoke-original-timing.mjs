import fs from 'node:fs';
const source = fs.readFileSync(new URL('../../../scripts/smoke.mjs', import.meta.url), 'utf8');
const front = process.argv.includes('--timing-front');
const trace = process.argv.includes('--timing-trace');
const tag = trace ? 'trace' : front ? 'front' : 'probe';
const instrumented = source
  .replaceAll("from './lib/", "from '../../../scripts/lib/")
  .replace('return { page, errors, hasMotion };', `${front ? "await page.send('Page.bringToFront');" : ''} return { page, errors, hasMotion };`)
  .replace('const D = await page.eval', `${trace ? "const traceEvents = []; page.on('Tracing.dataCollected', value => traceEvents.push(...value.value)); await page.send('Tracing.start', { categories: 'devtools.timeline,v8,blink,cc,gpu,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });" : ''} const D = await page.eval`)
  .replace("const m = window.__motion; await m.seek(0); await m.play(); return m.time;", `const m = window.__motion;
    const state = window.__timing = { start: performance.now(), motion: [], raf: [], visible: [], heartbeat: [], longtasks: [] };
    state.timer = setInterval(() => state.heartbeat.push(performance.now()), 25);
    state.observer = new PerformanceObserver(list => state.longtasks.push(...list.getEntries().map(v => ({ start: v.startTime, duration: v.duration }))));
    state.observer.observe({ type: "longtask", buffered: false });
    state.off = m.on((t, playing) => { if (playing) state.motion.push({ t, now: performance.now(), hidden: document.hidden }); });
    state.active = true;
    const probe = stamp => { if (!state.active) return; state.raf.push({ stamp, now: performance.now(), t: m.time, hidden: document.hidden }); requestAnimationFrame(probe); };
    requestAnimationFrame(probe);
    state.listener = () => state.visible.push({ now: performance.now(), hidden: document.hidden });
    document.addEventListener("visibilitychange", state.listener);
    await m.seek(0); await m.play(); return m.time;`.replace(/\r?\n\s*/g, ' '))
  .replace("await page.eval('window.__motion.pause()');", `const timing = await page.eval('(() => { const state = window.__timing, m = window.__motion; const result = { orient: m.orient, start: state.start, end: performance.now(), time: m.time, hidden: document.hidden, visibility: document.visibilityState, motion: state.motion, raf: state.raf, visibilityChanges: state.visible, heartbeat: state.heartbeat, longtasks: state.longtasks }; state.active = false; state.off(); clearInterval(state.timer); state.observer.disconnect(); document.removeEventListener("visibilitychange", state.listener); return result; })()');
  const fs = await import('node:fs');
  fs.writeFileSync(new URL('./smoke-original-timing-${tag}-' + timing.orient + '.json', import.meta.url), JSON.stringify(timing, null, 2) + '\\n');
  console.log('TIMING', JSON.stringify({ orient: timing.orient, time: timing.time, elapsed: timing.end - timing.start, hidden: timing.hidden, visibility: timing.visibility, frames: timing.raf.length, firstRafDelay: timing.raf[0]?.now - timing.start, heartbeat: timing.heartbeat, longtasks: timing.longtasks }));
  await page.eval('window.__motion.pause()');
  ${trace ? "const traceDone = page.once('Tracing.tracingComplete'); await page.send('Tracing.end'); await traceDone; fs.writeFileSync(new URL('./smoke-timing-trace-' + timing.orient + '.json', import.meta.url), JSON.stringify({ traceEvents }));" : ''}`);
const file = new URL('./smoke-original-timing-generated.mjs', import.meta.url);
fs.writeFileSync(file, instrumented);
await import(file.href);
