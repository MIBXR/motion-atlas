// 零依赖的 Chromium/Edge DevTools 协议客户端：启动无头浏览器、打开页面、执行脚本、截图。
// 需要 Node.js ≥ 22（内置 WebSocket）以及本机已安装的 Edge / Chrome / Chromium。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CANDIDATES = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
].filter(Boolean);

export function findBrowser() {
  const hit = CANDIDATES.find((p) => fs.existsSync(p));
  if (!hit) throw new Error('未找到 Edge/Chrome。请设置环境变量 BROWSER_PATH 指向浏览器可执行文件。');
  return hit;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, method = 'GET') {
  const res = await fetch(url, { method });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}`);
  return res.json();
}

class Page {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.waiters = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        this.waiters = this.waiters.filter((w) => !(w.method === msg.method && (w.resolve(msg.params), true)));
        for (const fn of this.listeners[msg.method] || []) fn(msg.params);
      }
    });
    this.listeners = {};
  }
  on(method, fn) {
    (this.listeners[method] ||= []).push(fn);
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  once(method, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const w = { method, resolve };
      this.waiters.push(w);
      setTimeout(() => { this.waiters = this.waiters.filter((x) => x !== w); reject(new Error(`等待 ${method} 超时`)); }, timeout);
    });
  }
  async viewport(width, height, dpr = 1) {
    await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: width < 600 });
  }
  async goto(url, timeout = 30000) {
    const loaded = this.once('Page.loadEventFired', timeout);
    await this.send('Page.navigate', { url });
    await loaded;
  }
  /** 执行表达式并等待 Promise；返回值需可 JSON 序列化 */
  async eval(expression, timeout = 60000) {
    const r = await Promise.race([
      this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }),
      sleep(timeout).then(() => { throw new Error('脚本执行超时：' + expression.slice(0, 80)); }),
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  }
  async waitFor(expression, timeout = 30000, interval = 100) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      if (await this.eval(`!!(${expression})`)) return true;
      await sleep(interval);
    }
    throw new Error('等待条件超时：' + expression);
  }
  async screenshot(file, { format = 'png', quality = 90 } = {}) {
    const r = await this.send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? quality : undefined, captureBeyondViewport: false });
    const buf = Buffer.from(r.data, 'base64');
    if (file) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, buf); }
    return buf;
  }
}

export async function launch({ width = 1600, height = 900, port = 9300 + Math.floor(Math.random() * 500) } = {}) {
  const exe = findBrowser();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'motion-atlas-cdp-'));
  const proc = spawn(exe, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`, '--hide-scrollbars', '--mute-audio', '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--force-color-profile=srgb',
    '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist', 'about:blank',
  ], { stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try { await getJSON(`${base}/json/version`); break; } catch { await sleep(100); }
  }
  async function newPage() {
    let target;
    try { target = await getJSON(`${base}/json/new?about:blank`, 'PUT'); }
    catch { target = await getJSON(`${base}/json/new?about:blank`); }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
    const page = new Page(ws);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    await page.viewport(width, height);
    return page;
  }
  async function close() {
    try { proc.kill(); } catch { /* 已退出 */ }
    await sleep(300);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* Windows 可能仍占用 */ }
  }
  return { newPage, close, exe };
}
