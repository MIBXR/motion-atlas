import fs from 'node:fs';
import assert from 'node:assert/strict';
import { launch } from '../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 640, height: 360 });
try {
  const page = await browser.newPage();
  await page.eval(fs.readFileSync('kit/motion-kit.js', 'utf8'));
  const result = await page.eval(`(async () => {
    const direct = new OfflineAudioContext(2, 48000, 48000);
    const buffer = direct.createBuffer(2, 96000, 48000);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) data[i] = i < 24000 ? 0 : 0.25;
    }
    const source = MotionKit.audio.dsp.sample(direct, direct.destination, 0, buffer, { offset: 0.5, gain: 0.5 });
    const raw = await direct.startRendering();
    const offsets = [];
    const fn = (ctx, out, when, p) => {
      offsets.push(p.offset || 0);
      const data = ctx.createBuffer(2, 8 * ctx.sampleRate, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) data.getChannelData(ch).fill(0.25);
      MotionKit.audio.dsp.sample(ctx, out, when, data, { offset: p.offset || 0 });
    };
    const score = [{ t: 0, voice: fn, dur: 8, resume: true, bus: 'music' }];
    const resumed = await MotionKit.audio.renderOffline(score, 0.5, { from: 3 });
    const noResume = await MotionKit.audio.renderOffline([{ ...score[0], resume: false }], 0.5, { from: 3 });
    const strings = await MotionKit.audio.renderOffline([{ t: 0, voice: 'air', dur: 8 }], 0.5, { from: 3 });
    return {
      sourceIsBufferSource: source instanceof AudioBufferSourceNode,
      directLeft: raw.getChannelData(0)[1000],
      directRight: raw.getChannelData(1)[1000],
      functionOffsets: offsets,
      resumedPeak: resumed.peak,
      resumedRms: resumed.rms,
      noResumePeak: noResume.peak,
      stringResumeRms: strings.rms,
    };
  })()`);
  assert.equal(result.sourceIsBufferSource, true);
  assert.equal(result.directLeft, 0.125);
  assert.equal(result.directRight, 0.125);
  assert.deepEqual(result.functionOffsets, [1]);
  assert.ok(result.resumedRms > 0);
  assert.equal(result.noResumePeak, 0);
  assert.ok(result.stringResumeRms > 0);
  fs.mkdirSync('dev/shots/T5r', { recursive: true });
  fs.writeFileSync('dev/shots/T5r/audio-kit-check.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
