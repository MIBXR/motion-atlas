// 网络观察：打开页面并播放，记录瓦片请求的起止；卡住时列出未完成的请求
import { launch } from '../../../../scripts/lib/cdp.mjs';
const [url, secs = '90'] = process.argv.slice(2);
const browser = await launch({ width: 1280, height: 720 });
const reqs = new Map();
const t0 = Date.now();
try {
  const page = await browser.newPage();
  await page.send('Network.enable');
  const on = (m, fn) => page.on(m, fn);
  on('Network.requestWillBeSent', (p) => { if (/openfreemap|elevation/.test(p.request.url)) reqs.set(p.requestId, { url: p.request.url.replace(/^https:\/\/[^/]+/, ''), t: (Date.now() - t0) / 1000 }); });
  on('Network.loadingFinished', (p) => { const r = reqs.get(p.requestId); if (r) { r.done = (Date.now() - t0) / 1000; r.bytes = p.encodedDataLength; } });
  on('Network.loadingFailed', (p) => { const r = reqs.get(p.requestId); if (r) { r.failed = p.errorText; r.done = (Date.now() - t0) / 1000; } });
  on('Network.responseReceived', (p) => { const r = reqs.get(p.requestId); if (r) { r.status = p.response.status; r.proto = p.response.protocol; r.cache = p.response.fromDiskCache; } });
  await page.goto(url, 60000);
  const end = Date.now() + Number(secs) * 1000;
  while (Date.now() < end) {
    await new Promise((r) => setTimeout(r, 5000));
    const all = [...reqs.values()], pending = all.filter((r) => !r.done);
    const b = await page.eval('window.__buffer ? { t: +window.__motion.time.toFixed(2), until: window.__buffer.bufferedUntil, stalled: window.__buffer.stalled, loads: window.__buffer.loads } : null').catch(() => null);
    console.log(((Date.now() - t0) / 1000).toFixed(0).padStart(4), 'reqs', all.length, 'done', all.length - pending.length, 'pending', pending.length, 'failed', all.filter((r) => r.failed).length, JSON.stringify(b));
  }
  const pending = [...reqs.values()].filter((r) => !r.done);
  console.log('pending:', pending.slice(0, 12).map((r) => `${r.url} since ${r.t.toFixed(1)}s status=${r.status} ${r.proto}`).join('\n  '));
  const done = [...reqs.values()].filter((r) => r.done && !r.failed);
  const d = done.map((r) => r.done - r.t).sort((a, b) => a - b);
  console.log('durations p50', d[Math.floor(d.length / 2)]?.toFixed(2), 'p90', d[Math.floor(d.length * 0.9)]?.toFixed(2), 'max', d[d.length - 1]?.toFixed(2), 'protocols', [...new Set(done.map((r) => r.proto))].join(','));
} finally { await browser.close(); }
