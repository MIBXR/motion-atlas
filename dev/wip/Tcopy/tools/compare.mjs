import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';
const browser = await launch();
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4326/docs.html');
  const png = await page.eval(`(async () => {
    const load = src => new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;});
    const [before,after] = await Promise.all(['docs-before.png','docs-after.png'].map(n=>load('/dev/shots/Tcopy/'+n)));
    const canvas=document.createElement('canvas');canvas.width=before.width+after.width;canvas.height=Math.max(before.height,after.height);
    const context=canvas.getContext('2d');context.drawImage(before,0,0);context.drawImage(after,before.width,0);
    return canvas.toDataURL('image/png').split(',')[1];
  })()`);
  fs.writeFileSync('dev/shots/Tcopy/docs-comparison.png', Buffer.from(png,'base64'));
  console.log('comparison saved · 2880×900 · left origin/main a452ea4 · right current');
} finally { await browser.close(); }
