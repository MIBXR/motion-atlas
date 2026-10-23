import { launch } from '../../../scripts/lib/cdp.mjs';
import fs from 'node:fs';

const orientation = process.argv[2] || 'landscape';
const front = process.argv.includes('--front');
const browser = await launch({ width: 1280, height: 720, args: ['--no-proxy-server'] });
const label = `${orientation}-${front ? 'front' : 'baseline'}`;
try {
  const page = await browser.newPage();
  await page.viewport(...(orientation === 'portrait' ? [720, 1280] : [1280, 720]));
  await page.goto(`http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&orient=${orientation}`);
  await page.waitFor('window.__motion');
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)');
  if (front) await page.send('Page.bringToFront');
  const D = await page.eval('window.__motion.duration');
  const sweep = await page.eval(`(() => {
    const m = window.__motion, start = performance.now();
    m.pause(); for (let t = 0; t <= ${D}; t += 0.2) m.seek(t); m.seek(${D});
    return { start, end: performance.now(), hidden: document.hidden, visibility: document.visibilityState };
  })()`);
  const start = await page.eval(`(async () => {
    const m = window.__motion;
    window.__timing = { motion: [], raf: [], visibility: [] };
    const state = window.__timing;
    state.off = m.on((t, playing) => { if (playing) state.motion.push({ now: performance.now(), t, hidden: document.hidden, visibility: document.visibilityState }); });
    let active = true;
    state.stopRaf = () => { active = false; };
    function frame(stamp) { if (!active) return; state.raf.push({ stamp, now: performance.now(), t: m.time, hidden: document.hidden }); requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
    state.visibilityHandler = () => state.visibility.push({ now: performance.now(), hidden: document.hidden, visibility: document.visibilityState });
    document.addEventListener('visibilitychange', state.visibilityHandler);
    await m.seek(0); await m.play();
    return { t: m.time, now: performance.now(), hidden: document.hidden, visibility: document.visibilityState };
  })()`);
  const timer = await page.eval('new Promise(r => { const start = performance.now(); setTimeout(() => r({ start, end: performance.now() }), 1500); })');
  const finish = await page.eval(`(() => {
    const m = window.__motion, state = window.__timing;
    const result = { t: m.time, now: performance.now(), hidden: document.hidden, visibility: document.visibilityState,
      motion: state.motion, raf: state.raf, visibilityChanges: state.visibility };
    m.pause(); state.off(); state.stopRaf(); document.removeEventListener('visibilitychange', state.visibilityHandler);
    return result;
  })()`);
  const diffs = finish.raf.slice(1).map((v, i) => v.now - finish.raf[i].now);
  const result = { label, D, sweep, start, timer, finish, summary: {
    advance: finish.t - start.t, realElapsed: finish.now - start.now,
    rafCount: finish.raf.length, rafDeltas: diffs, motionCount: finish.motion.length,
  } };
  const file = new URL(`./smoke-timing-${label}.json`, import.meta.url);
  fs.writeFileSync(file, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ label, sweepMs: sweep.end - sweep.start, start, timer, summary: result.summary, file: file.pathname }));
} finally { await browser.close(); }
