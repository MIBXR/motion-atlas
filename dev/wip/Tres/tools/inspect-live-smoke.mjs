import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const pid = Number(process.argv[2]);
const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process -Filter 'ParentProcessId = ${pid}' | Select-Object -ExpandProperty CommandLine`], { encoding: 'utf8' });
const ports = [...result.stdout.matchAll(/--remote-debugging-port=(\d+)/g)].map(match => Number(match[1]));
const snapshots = [];
for (const port of ports) {
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
  for (const target of targets.filter(t => t.type === 'page' && t.url.includes('/demos/styles/player/'))) {
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
    const expression = `(() => ({ href: location.href, progress: window.__motion?.progress, time: window.__motion?.time, frames: [...document.querySelectorAll('iframe')].map(frame => {
      const w = frame.contentWindow;
      return { href: w.location.href, ready: w.READY === true, dur: w.DUR, render: typeof w.render, fontsStatus: w.document.fonts.status, fonts: [...w.document.fonts].map(f => ({ family: f.family, status: f.status })), failedResources: w.performance.getEntriesByType('resource').filter(r => r.responseStatus >= 400).map(r => ({ url: r.name, status: r.responseStatus })), resources: w.performance.getEntriesByType('resource').map(r => ({ url: r.name, status: r.responseStatus, bytes: r.encodedBodySize })) };
    }) }))()`;
    const value = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('live inspection timeout')), 3000);
      ws.addEventListener('message', event => { const message = JSON.parse(String(event.data)); if (message.id === 1) { clearTimeout(timer); resolve(message.result); } });
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
    });
    ws.close();
    snapshots.push({ port, ...value.result?.value });
  }
}
fs.appendFileSync('dev/wip/Tres/evidence/style-smoke-live.jsonl', JSON.stringify({ time: new Date().toISOString(), snapshots }) + '\n');
console.log(JSON.stringify(snapshots, null, 2));
