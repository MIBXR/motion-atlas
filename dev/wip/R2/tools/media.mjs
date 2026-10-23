import fs from 'node:fs';
import {spawn, spawnSync} from 'node:child_process';

const directory = 'dev/shots/R2/render';
fs.mkdirSync(directory, {recursive: true});
const resume = process.argv.includes('--resume');
const rows = resume ? JSON.parse(fs.readFileSync(`${directory}/verification.json`, 'utf8')) : [];
for (const row of rows) row.pass = row.width === (row.orient === 'landscape' ? 1920 : 1080)
  && row.height === (row.orient === 'landscape' ? 1080 : 1920) && row.frameRate === '30/1'
  && row.frames === 690 && Math.abs(row.duration - 23) < 0.001 && row.videoCodec === 'h264'
  && row.audioCodec === 'aac' && row.sampleRate === 48000 && row.channels === 2;
for (const orient of resume ? ['portrait'] : ['landscape', 'portrait']) {
  const output = `${directory}/map-pilgrimage-${orient}-8-31`;
  const args = ['dev/wip/R2/tools/run.mjs', `render-${orient}`, '--import', './dev/wip/T4b/tools/hardware-browser.mjs',
    'scripts/render.mjs', 'http://localhost:4322/demos/cases/map-pilgrimage/index.html', '--orient', orient,
    '--fps', '30', '--from', '8', '--to', '31', '--audio', '--format', 'jpeg', '--out', output];
  const child = spawn(process.execPath, args, {stdio: 'inherit'});
  const code = await new Promise(resolve => child.on('exit', resolve));
  if (code !== 0) throw new Error(`${orient} render exited ${code}`);
  const result = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', output + '.mp4'], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message);
  fs.writeFileSync(`${directory}/ffprobe-${orient}.json`, result.stdout);
  const probe = JSON.parse(result.stdout);
  const video = probe.streams.find(stream => stream.codec_type === 'video');
  const audio = probe.streams.find(stream => stream.codec_type === 'audio');
  const [width, height] = orient === 'landscape' ? [1920, 1080] : [1080, 1920];
  const pass = video.width === width && video.height === height && video.r_frame_rate === '30/1'
    && Number(video.nb_frames) === 690 && Math.abs(Number(probe.format.duration) - 23) < 0.001
    && video.codec_name === 'h264' && audio?.codec_name === 'aac'
    && Number(audio.sample_rate) === 48000 && audio.channels === 2;
  rows.push({orient, file: output + '.mp4', pass, width: video.width, height: video.height,
    frameRate: video.r_frame_rate, frames: Number(video.nb_frames), duration: Number(probe.format.duration),
    videoCodec: video.codec_name, pixelFormat: video.pix_fmt, audioCodec: audio?.codec_name,
    sampleRate: Number(audio?.sample_rate), channels: audio?.channels});
  fs.writeFileSync(`${directory}/verification.json`, JSON.stringify(rows, null, 2) + '\n');
  console.log(JSON.stringify(rows.at(-1)));
  if (!pass) throw new Error(`${orient} ffprobe validation failed`);
}
