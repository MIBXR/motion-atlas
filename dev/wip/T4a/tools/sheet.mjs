// 用 ffmpeg 把多张图拼成网格：node sheet.mjs out.jpg --cols 2 --w 960 a.png b.png ...
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const cols = Number(get('--cols', 2)), w = Number(get('--w', 960)), label = args.includes('--label') ? (args.splice(args.indexOf('--label'), 1), true) : false;
const [out, ...imgs] = args;
const FF = process.env.FFMPEG || path.join(process.env.LOCALAPPDATA, 'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe');
const n = imgs.length, rows = Math.ceil(n / cols);
const ins = imgs.flatMap((f) => ['-i', f]);
let fc = '';
imgs.forEach((f, i) => {
  const name = path.basename(f).replace(/\.\w+$/, '');
  fc += `[${i}]scale=${w}:-2,pad=iw:ih+${label ? 34 : 0}:0:${label ? 34 : 0}:black${label ? `,drawtext=fontfile=sheetfont.ttf:text='${name}':x=10:y=6:fontsize=22:fontcolor=yellow` : ''}[v${i}];`;
});
// 补齐空格
const total = rows * cols;
// 空位由 xstack 的 fill 填黑
const layout = [];
for (let i = 0; i < total; i++) {
  const c = i % cols, r = Math.floor(i / cols);
  layout.push(`${c === 0 ? '0' : Array.from({ length: c }, () => 'w0').join('+')}_${r === 0 ? '0' : Array.from({ length: r }, () => 'h0').join('+')}`);
}
fc += Array.from({ length: n }, (_, i) => `[v${i}]`).join('') + `xstack=inputs=${n}:layout=${layout.slice(0, n).join('|')}:fill=black`;
fs.copyFileSync('C:/Windows/Fonts/consola.ttf','sheetfont.ttf');
const r = spawnSync(FF, ['-y', '-loglevel', 'error', ...ins, '-filter_complex', fc, '-q:v', '3', out], { stdio: 'inherit' });
fs.rmSync('sheetfont.ttf',{force:true});
if (r.status === 0) console.log('saved', out); else process.exit(1);
