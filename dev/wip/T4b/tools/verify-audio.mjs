import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from '../../../../scripts/lib/cdp.mjs';
import { IDS } from './scores-entries.mjs';

function pcmStats(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Expected RIFF/WAVE');
  let format, data;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const kind = buffer.toString('ascii', offset, offset + 4), size = buffer.readUInt32LE(offset + 4);
    if (kind === 'fmt ') format = { encoding: buffer.readUInt16LE(offset + 8), channels: buffer.readUInt16LE(offset + 10), sampleRate: buffer.readUInt32LE(offset + 12), bitsPerSample: buffer.readUInt16LE(offset + 22) };
    if (kind === 'data') data = buffer.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + (size % 2);
  }
  if (format?.encoding !== 1 || format.bitsPerSample !== 16 || !data) throw new Error('Expected 16-bit PCM WAV from MotionKit');
  let peak = 0, clipped = 0;
  for (let offset = 0; offset < data.length; offset += 2) {
    const amplitude = Math.abs(data.readInt16LE(offset) / 32768);
    peak = Math.max(peak, amplitude);
    if (amplitude >= 0.999) clipped++;
  }
  const frames = data.length / (format.channels * 2);
  return { ...format, frames, duration: frames / format.sampleRate, peak, peakDb: peak ? 20 * Math.log10(peak) : null, clipped };
}

export async function verifyAudio({ browser, base = 'http://localhost:4322', ids = IDS, orient = 'landscape', output = 'dev/shots/T4b/audio' }) {
  fs.mkdirSync(output, { recursive: true });
  const report = { base, orient, sampleRate: 48000, items: [], errors: [] };
  for (const id of ids) {
    const item = { id, checks: [], exceptions: [], console: [] };
    report.items.push(item);
    const check = (name, pass, detail) => item.checks.push({ name, pass, detail });
    let page;
    try {
      const score = JSON.parse(fs.readFileSync(`demos/patterns/${id}/score.json`, 'utf8'));
      page = await browser.newPage();
      page.on('Runtime.exceptionThrown', (event) => item.exceptions.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text));
      page.on('Runtime.consoleAPICalled', (event) => {
        if (['warning', 'error'].includes(event.type)) item.console.push({ type: event.type, text: event.args.map((arg) => arg.value ?? arg.description ?? '').join(' ') });
      });
      await page.viewport(...(orient === 'portrait' ? [1080, 1920] : [1920, 1080]));
      const url = new URL(`/demos/patterns/${id}/index.html`, base);
      url.searchParams.set('render', '1'); url.searchParams.set('orient', orient); url.searchParams.set('t', '0');
      await page.goto(url.href, 60000);
      await page.waitFor('window.__motion && typeof window.__motion.seek === "function"', 30000);
      await page.eval('Promise.resolve(__motion.ready).then(() => true)', 120000);
      const state = await page.eval(`(() => {
        __motion.pause();
        return { duration: __motion.duration, configuredDuration: CONFIG.duration, hasAudio: !!__motion.audio, events: __motion.audio?.events(0, __motion.duration), registeredVoices: Object.keys(MotionKit.audio.meta) };
      })()`);
      item.duration = state.duration;
      check('audio attached', state.hasAudio);
      check('full configured duration', state.duration === state.configuredDuration, { runtime: state.duration, config: state.configuredDuration });
      const expected = score.filter((event) => event.t >= 0 && event.t < state.duration).map(({ t, voice }) => ({ t, voice })).sort((a, b) => a.t - b.t);
      check('runtime event times and voices exactly match score.json', JSON.stringify(state.events) === JSON.stringify(expected), { expectedCount: expected.length, runtimeCount: state.events?.length });
      check('all event voices registered', score.every((event) => state.registeredVoices.includes(event.voice)), [...new Set(score.filter((event) => !state.registeredVoices.includes(event.voice)).map((event) => event.voice))]);
      item.events = state.events;
      const audio = await page.eval('__motion.audio.renderWav({from:0,to:__motion.duration,sampleRate:48000})', 120000);
      const wav = Buffer.from(audio.base64, 'base64');
      item.wav = `${output}/${id}${orient === 'portrait' ? '-portrait' : ''}.wav`;
      fs.writeFileSync(item.wav, wav);
      const { base64, ...api } = audio;
      item.api = api;
      item.pcm = pcmStats(wav);
      check('WAV contains full duration', Math.abs(item.pcm.duration - state.duration) <= 1 / 48000, { pcm: item.pcm.duration, runtime: state.duration });
      check('WAV sample rate', item.pcm.sampleRate === 48000, item.pcm.sampleRate);
      check('API peak <= -1 dBFS', audio.peakDb <= -1, audio.peakDb);
      check('PCM peak <= -1 dBFS', item.pcm.peakDb !== null && item.pcm.peakDb <= -1, item.pcm.peakDb);
      check('API clipping samples = 0', audio.clipped === 0, audio.clipped);
      check('PCM clipping samples = 0', item.pcm.clipped === 0, item.pcm.clipped);
      check('no runtime exceptions', item.exceptions.length === 0, item.exceptions);
      console.log(`${id}: ${item.pcm.duration}s / ${expected.length} events / PCM ${item.pcm.peakDb?.toFixed(3)} dBFS / clips ${item.pcm.clipped}`);
    } catch (error) {
      item.error = error.stack;
      report.errors.push({ id, error: error.message });
      console.error(`${id}: ${error.message}`);
    } finally {
      if (page) await page.send('Page.close');
    }
  }
  const checks = report.items.flatMap((item) => item.checks);
  report.summary = { patterns: report.items.length, wavs: report.items.filter((item) => item.wav).length, events: report.items.reduce((count, item) => count + (item.events?.length || 0), 0), checks: checks.length, passed: checks.filter((check) => check.pass).length, failed: checks.filter((check) => !check.pass).length, errors: report.errors.length };
  const result = `${output}/verification${orient === 'portrait' ? '-portrait' : ''}.json`;
  fs.writeFileSync(result, JSON.stringify(report, null, 2) + '\n');
  fs.appendFileSync('dev/wip/T4b/progress.md', `${new Date().toISOString()} Audio QA: ${report.summary.wavs}/${report.summary.patterns} WAVs, ${report.summary.passed}/${report.summary.checks} checks passed, ${report.summary.errors} errors; ${result}.\n`);
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
  const browser = await launch({ width: 1920, height: 1080, args: ['--use-angle=d3d11'] });
  try {
    const report = await verifyAudio({ browser, base: option('--base', 'http://localhost:4322'), ids: option('--only', IDS.join(',')).split(','), orient: option('--orient', 'landscape') });
    console.log(JSON.stringify(report.summary));
    if (report.summary.failed || report.summary.errors) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
