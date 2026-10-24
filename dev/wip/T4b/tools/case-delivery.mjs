import fs from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const mode = process.argv[2];
const direct = ['--import', './dev/wip/T4a/tools/direct-browser.mjs'];
async function run(args, log) {
  const stream = fs.createWriteStream(log, { encoding: 'utf8' });
  const child = spawn(process.execPath, [...direct, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  for (const pipe of [child.stdout, child.stderr]) pipe.on('data', (data) => { stream.write(data); process.stdout.write(data); });
  const code = await new Promise((resolve) => child.on('exit', resolve));
  await new Promise((resolve) => stream.end(resolve));
  if (code !== 0) throw new Error(`${args[0]} exited ${code}`);
}
if (mode === 'smoke') {
  for (let n = 1; n <= 2; n++) {
    await run(['scripts/smoke.mjs', '--only', 'map-pilgrimage', '--strict-fonts', '--base', 'http://localhost:4322'], `dev/shots/T4b/case-smoke-${n}.log`);
    fs.appendFileSync('dev/wip/T4b/progress.md', `- 2026-10-22：地图巡礼 strict-fonts smoke 第${n}次通过；dev/shots/T4b/case-smoke-${n}.log。\n`);
  }
} else if (mode === 'render') {
  fs.mkdirSync('dev/shots/T4/render', { recursive: true });
  for (const orient of ['landscape', 'portrait']) {
    await run(['dev/wip/T4b/tools/render-gpu.mjs', 'http://localhost:4322/demos/cases/map-pilgrimage/index.html', '--orient', orient, '--fps', '30', '--from', '8', '--to', '31', '--audio', '--format', 'jpeg', '--out', `dev/shots/T4/render/${orient}-8-31`], `dev/shots/T4b/case-render-${orient}.log`);
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', `dev/shots/T4/render/${orient}-8-31.mp4`], { encoding: 'utf8' });
    if (probe.status !== 0) throw new Error(probe.stderr);
    fs.writeFileSync(`dev/shots/T4b/case-ffprobe-${orient}.json`, probe.stdout);
    fs.appendFileSync('dev/wip/T4b/progress.md', `- 2026-10-22：地图巡礼 ${orient} 8–31s MP4重渲完成，ffprobe已保存 dev/shots/T4b/case-ffprobe-${orient}.json。\n`);
  }
} else if (mode === 'checks') {
  for (const name of ['build', 'check']) {
    await run([`scripts/${name}.mjs`], `dev/shots/T4b/${name}.log`);
    fs.appendFileSync('dev/wip/T4b/progress.md', `- 2026-10-22：预览刷新后的最终 ${name} 通过；dev/shots/T4b/${name}.log。\n`);
  }
} else if (mode === 'capture') {
  await run(['scripts/capture.mjs', '--only', 'map-pilgrimage', '--base', 'http://localhost:4322'], 'dev/shots/T4b/case-capture.log');
  fs.appendFileSync('dev/wip/T4b/progress.md', '- 2026-10-22：地图巡礼横竖预览图已重截；dev/shots/T4b/case-capture.log。\n');
} else {
  throw new Error('Use smoke, render, capture, or checks');
}
