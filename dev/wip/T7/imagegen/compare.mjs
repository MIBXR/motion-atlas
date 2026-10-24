import fs from 'node:fs';
import {launch} from '../../../../scripts/lib/cdp.mjs';
const dir='dev/shots/T7/imagegen',out=dir+'/compare';fs.mkdirSync(out,{recursive:true});
const b=await launch({width:1920,height:580,args:['--enable-gpu','--use-angle=d3d11']});
try{const p=await b.newPage();for(const [scene,t]of [['S1',7],['S3',29],['S4',42]]){
 const files=[`${dir}/before/landscape-${scene}.png`,`${dir}/after/landscape-${scene}-${t.toFixed(3)}.png`].map(f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64'));
 const png=await p.eval(`(async()=>{const sources=${JSON.stringify(files)},c=document.createElement('canvas');c.width=1920;c.height=580;const x=c.getContext('2d');x.fillStyle='#17191b';x.fillRect(0,0,1920,580);x.font='20px Arial';x.fillStyle='white';x.fillText('${scene} ${t}s · Before',16,27);x.fillText('${scene} ${t}s · Generated assets',976,27);for(let i=0;i<2;i++){const im=new Image();im.src=sources[i];await im.decode();x.drawImage(im,i*960,40,960,540)}return c.toDataURL('image/png').split(',')[1]})()`);
 fs.writeFileSync(`${out}/${scene}-before-after.png`,Buffer.from(png,'base64'));
}}finally{await b.close()}
