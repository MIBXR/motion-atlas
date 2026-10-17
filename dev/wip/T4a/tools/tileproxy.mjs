// 瓦片镜像 + 网络模拟（只用于验证）：node dev/shots/T4/tools/tileproxy.mjs --port 4330 --mbps 50 --latency 40
//   /ofm/<路径> → https://tiles.openfreemap.org/<路径>
//   /dem/<路径> → https://s3.amazonaws.com/elevation-tiles-prod/<路径>
// 第一次请求从源站取回并存盘（dev/shots/T4/tilecache），之后从磁盘读；响应按设定的带宽（全局令牌桶）与首字节延迟发送，
// 用来在本机复现“普通网络 / 10Mbps”这类可重复的条件（本机浏览器经系统代理访问 OpenFreeMap 时延迟极不稳定）。
// 运行时可改：GET /__set?mbps=10&latency=40 ；GET /__stats 查看请求数与字节数。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const port = Number(get('--port', 4330));
let mbps = Number(get('--mbps', 50)), latency = Number(get('--latency', 40));
const dir = path.resolve(here, '../tilecache');
fs.mkdirSync(dir, { recursive: true });
const ORIGIN = { ofm: 'https://tiles.openfreemap.org/', dem: 'https://s3.amazonaws.com/elevation-tiles-prod/' };
const stats = { requests: 0, bytes: 0, fromOrigin: 0, errors: 0 };
// 令牌桶：所有响应共享带宽
let tokens = 0, last = Date.now();
const take = async (n) => {
  for (;;) {
    const now = Date.now();
    tokens = Math.min((mbps * 1e6) / 8 * 0.25, tokens + ((now - last) / 1000) * ((mbps * 1e6) / 8));
    last = now;
    if (tokens >= n) { tokens -= n; return; }
    await new Promise((r) => setTimeout(r, 5));
  }
};
const inflight = new Map();
async function fetchOrigin(kind, rest, file) {
  if (inflight.has(file)) return inflight.get(file);
  const p = (async () => {
    const r = await fetch(ORIGIN[kind] + rest);
    const buf = Buffer.from(await r.arrayBuffer());
    const meta = { status: r.status, type: r.headers.get('content-type') || 'application/octet-stream' };
    if (r.ok) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, buf); fs.writeFileSync(file + '.meta', JSON.stringify(meta)); }
    stats.fromOrigin++;
    return { buf, meta };
  })().finally(() => inflight.delete(file));
  inflight.set(file, p);
  return p;
}
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__set') { if (u.searchParams.has('mbps')) mbps = Number(u.searchParams.get('mbps')); if (u.searchParams.has('latency')) latency = Number(u.searchParams.get('latency')); res.end(JSON.stringify({ mbps, latency })); return; }
  if (u.pathname === '/__stats') { res.end(JSON.stringify({ ...stats, mbps, latency })); return; }
  const m = /^\/(ofm|dem)\/(.+)$/.exec(u.pathname);
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!m) { res.writeHead(404); res.end(); return; }
  const [, kind, rest] = m;
  const file = path.join(dir, kind, rest.replace(/[^\w./-]/g, '_')) + '.bin'; // 加后缀：避免“planet”文件与“planet/…”目录冲突
  stats.requests++;
  try {
    let buf, meta;
    if (fs.existsSync(file) && fs.existsSync(file + '.meta')) { buf = fs.readFileSync(file); meta = JSON.parse(fs.readFileSync(file + '.meta', 'utf8')); }
    else ({ buf, meta } = await fetchOrigin(kind, rest, file));
    // tilejson 与样式里的绝对地址也改写到镜像
    if (/json/.test(meta.type)) buf = Buffer.from(buf.toString('utf8').split(ORIGIN.ofm).join(`http://localhost:${port}/ofm/`).split(ORIGIN.dem).join(`http://localhost:${port}/dem/`));
    await new Promise((r) => setTimeout(r, latency));
    res.writeHead(meta.status, { 'Content-Type': meta.type, 'Content-Length': buf.length, 'Cache-Control': 'public, max-age=86400' });
    for (let i = 0; i < buf.length; i += 16384) { const c = buf.subarray(i, i + 16384); await take(c.length); res.write(c); }
    res.end();
    stats.bytes += buf.length;
  } catch (err) {
    stats.errors++;
    res.writeHead(502); res.end(String(err && err.message));
  }
}).listen(port, () => console.log(`tile proxy http://localhost:${port}/ · ${mbps} Mbps · ${latency} ms · cache ${dir}`));
