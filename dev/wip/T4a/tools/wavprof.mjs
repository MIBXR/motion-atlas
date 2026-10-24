// WAV 响度曲线：每 step 秒的 RMS / 峰值（dBFS），并画成文本条形图
import fs from 'node:fs';
const [file, stepArg] = process.argv.slice(2);
const step = Number(stepArg || 1);
const b = fs.readFileSync(file);
const ch = b.readUInt16LE(22), sr = b.readUInt32LE(24);
let o = 12; while (b.toString('ascii', o, o + 4) !== 'data') o += 8 + b.readUInt32LE(o + 4);
const data = o + 8, n = b.readUInt32LE(o + 4) / 2 / ch;
const db = (x) => (x > 0 ? 20 * Math.log10(x) : -99);
for (let t = 0; t < n / sr; t += step) {
  let s = 0, p = 0, c = 0;
  for (let i = Math.floor(t * sr); i < Math.min(n, Math.floor((t + step) * sr)); i++) for (let k = 0; k < ch; k++) { const v = b.readInt16LE(data + (i * ch + k) * 2) / 32768; s += v * v; p = Math.max(p, Math.abs(v)); c++; }
  const r = db(Math.sqrt(s / c));
  console.log(t.toFixed(1).padStart(5), 'rms', r.toFixed(1).padStart(6), 'pk', db(p).toFixed(1).padStart(6), '█'.repeat(Math.max(0, Math.round((r + 40) / 1.2))));
}
