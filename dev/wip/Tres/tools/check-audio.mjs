import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const output = 'dev/shots/Tres/audio', evidence = 'dev/wip/Tres/evidence';
fs.mkdirSync(output, { recursive: true });
const results = [];
for (const slug of ['swiss-motion', 'pixel-rpg']) {
  const args = ['--import', './dev/wip/Tres/tools/gpu-browser.mjs', 'scripts/render.mjs', `http://localhost:4328/demos/styles/player/?style=${slug}`, '--from', '0', '--to', '8', '--audio', '--format', 'jpeg', '--out', `${output}/${slug}`];
  fs.writeFileSync(`${evidence}/render-${slug}-command.json`, JSON.stringify([process.execPath, ...args], null, 2) + '\n');
  const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const log = fs.createWriteStream(`${evidence}/render-${slug}.log`);
  child.stdout.on('data', data => { process.stdout.write(data); log.write(data); });
  child.stderr.on('data', data => { process.stderr.write(data); log.write(data); });
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  await new Promise(resolve => log.end(resolve));
  if (code !== 0) throw new Error(`render ${slug} exit ${code}`);
  const file = `${output}/${slug}.mp4`;
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8' });
  if (probe.status !== 0) throw new Error(probe.stderr);
  const info = JSON.parse(probe.stdout);
  const video = info.streams.find(s => s.codec_type === 'video'), audio = info.streams.find(s => s.codec_type === 'audio');
  if (!video || !audio || Math.abs(Number(info.format.duration) - 8) > .1) throw new Error(`stream / duration mismatch ${slug}`);
  const source = path.resolve('../../dev/shots/Tnew/films-web', `${slug}.mp4`);
  const filter = '[0:a:0]atrim=start=0:end=8,asetpts=PTS-STARTPTS,aformat=channel_layouts=mono,showwavespic=s=1600x240:colors=0x86b7ff[up];[1:a:0]atrim=start=0:end=8,asetpts=PTS-STARTPTS,aformat=channel_layouts=mono,showwavespic=s=1600x240:colors=0xffb565[ours];[up][ours]vstack=inputs=2[v]';
  const wave = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', source, '-i', file, '-filter_complex', filter, '-map', '[v]', '-frames:v', '1', `${output}/${slug}.png`], { encoding: 'utf8' });
  if (wave.status !== 0) throw new Error(wave.stderr);
  results.push({ slug, file, video: { codec: video.codec_name, duration: video.duration, width: video.width, height: video.height }, audio: { codec: audio.codec_name, duration: audio.duration, channels: audio.channels, sampleRate: audio.sample_rate }, duration: Number(info.format.duration), waveform: `${output}/${slug}.png`, waveformTop: 'web Release', waveformBottom: 'Motion Atlas render' });
  fs.writeFileSync(`${evidence}/audio-check.json`, JSON.stringify(results, null, 2) + '\n');
  console.log(`audio check ${slug} video=${video.codec_name} audio=${audio.codec_name} duration=${info.format.duration}s`);
}
