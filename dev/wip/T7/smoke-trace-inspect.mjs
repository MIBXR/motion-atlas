import fs from 'node:fs';
const events = JSON.parse(fs.readFileSync(new URL('./smoke-timing-trace-portrait.json', import.meta.url), 'utf8')).traceEvents;
const threads = new Map(events.filter(e => e.name === 'thread_name').map(e => [`${e.pid}/${e.tid}`, e.args.name]));
const top = events.filter(e => e.dur > 30000).sort((a, b) => b.dur - a.dur).slice(0, 55);
console.log(JSON.stringify(top.map(e => ({ name: e.name, thread: threads.get(`${e.pid}/${e.tid}`), pid: e.pid, tid: e.tid, ts: e.ts, durationMs: e.dur / 1000, args: e.args })), null, 2));
