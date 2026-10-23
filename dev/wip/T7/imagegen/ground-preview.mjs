import fs from 'node:fs';
import {launch} from '../../../../scripts/lib/cdp.mjs';
const files=JSON.parse(fs.readFileSync('dev/wip/T7/imagegen/generations.json','utf8'));
const src='data:image/png;base64,'+fs.readFileSync(files.find(r=>r.name==='ground').path).toString('base64');
const b=await launch({width:1024,height:1024});
try{const p=await b.newPage();const png=await p.eval(`(async()=>{const im=new Image();im.src=${JSON.stringify(src)};await im.decode();const c=document.createElement('canvas');c.width=c.height=1200;const x=c.getContext('2d');for(let y=0;y<2;y++)for(let j=0;j<2;j++)x.drawImage(im,j*600,y*600,600,600);return c.toDataURL('image/png').split(',')[1]})()`);fs.writeFileSync('dev/shots/T7/imagegen/ground-repeat-check.png',Buffer.from(png,'base64'));}finally{await b.close()}
