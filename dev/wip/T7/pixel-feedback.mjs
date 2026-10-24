import fs from 'node:fs';
import path from 'node:path';
import { launch } from '../../../scripts/lib/cdp.mjs';

const out = path.resolve('dev/shots/T7/diagnostic');
const arg = process.argv.indexOf('--file');
const requested = arg >= 0 ? path.resolve(process.argv[arg + 1]) : null;
const cases = (requested ? [[path.basename(requested), requested]] : [
  ['bad-screenshot', path.join(out, 'bad-screenshot.png')],
  ['fresh-surface', path.join(out, 'portrait-panel-30-surface.png')],
  ['fresh-world-blur', path.join(out, 'portrait-panel-30-world-blur.png')],
  ['history-surface', path.join(out, 'history/portrait-panel-30-surface.png')],
  ['history-world-blur', path.join(out, 'history/portrait-panel-30-world-blur.png')]
]).map(([name, file]) => ({ name, file, data: 'data:image/png;base64,' + fs.readFileSync(file).toString('base64') }));
const browser = await launch({ width: 1080, height: 1920, args: ['--no-proxy-server'] });
let result;
try {
  const page = await browser.newPage();
  result = await page.eval(`(async () => {
    const cases = ${JSON.stringify(cases)};
    const results = [];
    for (const item of cases) {
      const image = new Image(); image.src = item.data; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width=image.naturalWidth; canvas.height=image.naturalHeight;
      const ctx=canvas.getContext('2d', { willReadFrequently:true }); ctx.drawImage(image,0,0);
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      const compare = offset => {
        let delta=0, exact=0, samples=0;
        for(let y=0;y<900;y+=4) for(let x=0;x<canvas.width;x+=8) {
          const a=(y*canvas.width+x)*4,b=((y+offset)*canvas.width+x)*4;
          const d=Math.abs(pixels[a]-pixels[b])+Math.abs(pixels[a+1]-pixels[b+1])+Math.abs(pixels[a+2]-pixels[b+2]);
          delta+=d; exact+=d===0?1:0; samples++;
        }
        return { offset, samples, meanRGBAbsoluteDelta:delta/(samples*3), exactPixelFraction:exact/samples };
      };
      const offsets=Array.from({length:15},(_,i)=>compare(946+i));
      results.push({ name:item.name, file:item.file, width:canvas.width,height:canvas.height,at953:offsets.find(r=>r.offset===953),best:offsets.reduce((a,b)=>a.meanRGBAbsoluteDelta<b.meanRGBAbsoluteDelta?a:b),offsets });
    }
    return results;
  })()`);
} finally { await browser.close(); }
result = result.map(item => ({
  ...item,
  threshold: { maximumMeanRGBAbsoluteDelta: 1, minimumExactPixelFraction: 0.99 },
  repeatedTile: item.at953.meanRGBAbsoluteDelta <= 1 && item.at953.exactPixelFraction >= 0.99,
  pass: !(item.at953.meanRGBAbsoluteDelta <= 1 && item.at953.exactPixelFraction >= 0.99)
}));
fs.writeFileSync(path.join(out,requested ? `pixel-feedback-${path.basename(requested)}.json` : 'pixel-feedback.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.map(({name,at953,best,repeatedTile,pass})=>({name,at953,best,repeatedTile,pass})),null,2));
if (requested && result.some(item => item.repeatedTile)) process.exitCode=1;
