// 缓冲计划的“码率”分析：从页面取缓冲计划（每块瓦片最早 / 最晚用到的时刻），按镜像磁盘缓存里的文件大小，
// 算出每秒新出现的瓦片字节数（下载需求）与“前方 N 秒窗口”内要同时留在内存里的瓦片字节数
// node dev/shots/T4/tools/bitrate.mjs [landscape|portrait]
import { launch } from '../../../../scripts/lib/cdp.mjs';
import fs from 'node:fs';
import path from 'node:path';
const orient = process.argv[2] || 'landscape';
const browser = await launch({ width: 640, height: 360 });
let plan, tpl;
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:4321/demos/cases/map-pilgrimage/index.html?embed=1&orient=${orient}&tilemirror=http://localhost:4330`, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 120000);
  plan = await page.eval('window.__bufDebug.plan()');
  tpl = await page.eval('({ ofm: window.__map.getSource("openmaptiles").tiles[0], dem: window.__map.getSource("dem").tiles[0] })');
} finally { await browser.close(); }
const dir = 'dev/shots/T4/tilecache';
const size = (src, z, x, y) => {
  const u = (src === 'dem' ? tpl.dem : tpl.ofm).replace('{z}', z).replace('{x}', x).replace('{y}', y);
  const m = /\/(ofm|dem)\/(.+)$/.exec(new URL(u).pathname);
  const f = path.join(dir, m[1], m[2].replace(/[^\w./-]/g, '_')) + '.bin';
  return fs.existsSync(f) ? fs.statSync(f).size : 0;
};
const rows = plan.map(([src, z, x, y, t0, t1, fast, opt]) => ({ src, z, t0, t1, fast, opt, b: size(src, z, x, y) }));
const MB = (b) => +(b / 1048576).toFixed(1);
const total = rows.reduce((s, r) => s + r.b, 0);
console.log(`${orient}: ${rows.length} 块 · ${MB(total)} MB（缺文件 ${rows.filter((r) => !r.b).length}）`);
const byZ = {};
for (const r of rows) { const k = r.src + ' z' + r.z; byZ[k] = byZ[k] || [0, 0]; byZ[k][0]++; byZ[k][1] += r.b; }
console.log('按缩放：', Object.entries(byZ).sort().map(([k, v]) => `${k}:${v[0]}/${MB(v[1])}MB`).join(' '));
// 每 2 秒新出现的字节（第一次用到）
const bins = [];
for (let t = 0; t < 60; t += 2) bins.push([t, MB(rows.filter((r) => r.t0 >= t && r.t0 < t + 2).reduce((s, r) => s + r.b, 0)), MB(rows.filter((r) => r.t0 >= t && r.t0 < t + 2 && r.fast).reduce((s, r) => s + r.b, 0))]);
console.log('每 2 秒首次用到的字节（MB，其中只在快速帧用到）：', bins.map(([t, a, f]) => `${t}s:${a}${f ? '(' + f + ')' : ''}`).join(' '));
const need = rows.filter((r) => !r.opt);
console.log(`必需 ${need.length} 块 ${MB(need.reduce((s, r) => s + r.b, 0))} MB；可选 ${rows.length - need.length} 块 ${MB(rows.filter((r) => r.opt).reduce((s, r) => s + r.b, 0))} MB`);
console.log('每 2 秒首次用到的必需字节（MB）：', bins.map(([t]) => `${t}s:${MB(need.filter((r) => r.t0 >= t && r.t0 < t + 2).reduce((s, r) => s + r.b, 0))}`).join(' '));
let cum = 0; const cumNeed = []; for (let t = 0; t <= 60; t += 1) { cum = need.filter((r) => r.t0 <= t).reduce((s, r) => s + r.b, 0); cumNeed.push([t, cum]); }
for (const mbps of [10, 20, 50]) { const rate = (mbps * 1e6) / 8; let d = 0; for (const [t, c] of cumNeed) d = Math.max(d, c / rate - t); console.log(`${mbps} Mbps：只算必需瓦片、全程不停顿需要的起播等待 ≈ ${d.toFixed(1)} s`); }
// 窗口内驻留：播放头 T 时，[T-behind, T+ahead] 内要用到的瓦片
for (const ahead of [6, 8, 12]) {
  let peak = [0, 0];
  for (let T = 0; T <= 60; T += 0.5) { const b = rows.filter((r) => r.t1 >= T - 2 && r.t0 <= T + ahead).reduce((s, r) => s + r.b, 0); if (b > peak[1]) peak = [T, b]; }
  console.log(`ahead ${ahead}s：窗口内瓦片字节峰值 ${MB(peak[1])} MB @ T=${peak[0]}`);
}
fs.writeFileSync(`dev/shots/T4/live/plan-${orient}.json`, JSON.stringify(rows));
