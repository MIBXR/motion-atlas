import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const gpuArgs = ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--no-proxy-server'];
const browser = await launch({ width: 1280, height: 720, args: gpuArgs });
try {
  const page = await browser.newPage(), started = Date.now();
  await page.goto('http://localhost:4328/demos/styles/player/?style=stained-glass&render=1', 45000);
  await page.waitFor('window.__motion', 180000);
  await page.eval('window.__motion.ready.then(() => true)', 180000);
  const readyMs = Date.now() - started, frames = [];
  for (const t of [0, 0.1]) {
    frames.push(await page.eval(`(async () => {
      const m = window.__motion; m.pause(); const start = performance.now();
      await m.seek(${t});
      return { t: m.time, renderMs: performance.now() - start };
    })()`, 180000));
  }
  const result = { slug: 'stained-glass', viewport: [1280, 720], gpuArgs, readyMs, frames };
  fs.writeFileSync('dev/wip/Tres/evidence/stained-glass-timing.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
