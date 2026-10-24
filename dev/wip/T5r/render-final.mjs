import fs from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { launch } from '../../../scripts/lib/cdp.mjs';

const output = 'dev/shots/T5r/render';
fs.mkdirSync(output, { recursive: true });
const report = { quality: 'original', fps: 30, duration: 77.6, clips: [] };
const save = () => fs.writeFileSync(`${output}/results.json`, JSON.stringify(report, null, 2) + '\n');
const browser = await launch({ width: 1920, height: 1080 });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4323/demos/cases/archive-os/index.html?render=1&quality=original');
  await page.waitFor('window.__motion?.ready', 30000);
  await page.eval('__motion.ready.then(()=>true)', 120000);
  report.renderer = await page.eval(`(() => {
    const canvas=document.querySelector('iframe').contentDocument.querySelector('#three-scene canvas');
    const gl=canvas.getContext('webgl2'), ext=gl.getExtension('WEBGL_debug_renderer_info');
    return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
  })()`);
  if (/swiftshader|llvmpipe|software|microsoft basic/i.test(report.renderer)) throw new Error(`Hardware adapter returned ${report.renderer}`);
  save();
} finally { await browser.close(); }

for (const orient of ['landscape', 'portrait']) {
  const started = performance.now();
  const destination = `${output}/${orient}`;
  const args = ['--import', './dev/wip/T5r/tools/hardware-browser.mjs', 'scripts/render.mjs',
    'http://localhost:4323/demos/cases/archive-os/index.html?quality=original',
    '--orient', orient, '--fps', '30', '--audio', '--out', destination];
  const log = fs.openSync(`${output}/${orient}.log`, 'w');
  const child = spawn(process.execPath, args, { stdio: ['ignore', log, log] });
  const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
  fs.closeSync(log);
  if (code !== 0) throw new Error(`${orient} render exited ${code}`);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', `${destination}.mp4`], { encoding: 'utf8' });
  if (probe.status !== 0) throw new Error(probe.stderr);
  fs.writeFileSync(`${destination}-ffprobe.json`, probe.stdout);
  const info = JSON.parse(probe.stdout), video = info.streams.find(s => s.codec_type === 'video'), audio = info.streams.find(s => s.codec_type === 'audio');
  const dimensions = orient === 'landscape' ? [1920, 1080] : [1080, 1920];
  if (video.width !== dimensions[0] || video.height !== dimensions[1] || video.r_frame_rate !== '30/1' || Number(video.nb_frames) !== 2328 || video.pix_fmt !== 'yuv420p'
      || audio.sample_rate !== '48000' || audio.channels !== 2 || Math.abs(Number(info.format.duration) - 77.6) > .001) throw new Error(`${orient} MP4 specification differs`);
  const frames = [];
  for (const t of [2, 14, 22.5, 40, 55, 75.6]) {
    const file = `${destination}-F${t}.png`;
    const decoded = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(t), '-i', `${destination}.mp4`, '-frames:v', '1', '-update', '1', file], { encoding: 'utf8' });
    if (decoded.status !== 0) throw new Error(decoded.stderr);
    frames.push({ t, file });
  }
  const clip = { orient, command: [process.execPath, ...args], exitCode: code, elapsedSeconds: (performance.now() - started) / 1000,
    mp4: `${destination}.mp4`, wav: `${destination}.wav`, bytes: fs.statSync(`${destination}.mp4`).size, ffprobe: `${destination}-ffprobe.json`,
    video: { codec: video.codec_name, width: video.width, height: video.height, fps: video.r_frame_rate, frames: Number(video.nb_frames), duration: video.duration, pixelFormat: video.pix_fmt },
    audio: { codec: audio.codec_name, sampleRate: Number(audio.sample_rate), channels: audio.channels, duration: audio.duration }, frames, visualReview: 'pending' };
  report.clips.push(clip); save(); console.log(JSON.stringify(clip));
}
