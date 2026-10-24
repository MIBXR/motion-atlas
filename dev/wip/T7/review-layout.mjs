import fs from 'node:fs';
import {launch} from '../../../scripts/lib/cdp.mjs';
const dir='dev/shots/T7/fix9-layout',qa=JSON.parse(fs.readFileSync(`${dir}/checks.json`,'utf8'));
const b=await launch({width:1280,height:720,args:['--enable-gpu','--use-angle=d3d11']});
try{const p=await b.newPage();for(const orient of ['landscape','portrait']){
 const files=qa.screenshots.filter(f=>f.includes('/'+orient));
 for(let i=0;i<files.length;i+=4){const subset=files.slice(i,i+4).map(f=>({name:f.split('/').at(-1),src:'data:image/png;base64,'+fs.readFileSync(f).toString('base64')}));
  const data=await p.eval(`(async()=>{const files=${JSON.stringify(subset)},w=${orient==='portrait'?540:960},h=${orient==='portrait'?960:540},c=document.createElement('canvas');c.width=w*2;c.height=(h+30)*Math.ceil(files.length/2);const x=c.getContext('2d');x.fillStyle='#17191b';x.fillRect(0,0,c.width,c.height);x.fillStyle='white';x.font='18px Arial';for(let i=0;i<files.length;i++){const im=new Image();im.src=files[i].src;await im.decode();const xx=i%2*w,yy=Math.floor(i/2)*(h+30);x.fillText(files[i].name,xx+12,yy+22);x.drawImage(im,xx,yy+30,w,h);}return c.toDataURL('image/png').split(',')[1]})()`);
  fs.writeFileSync(`${dir}/review-${orient}-${i/4+1}.png`,Buffer.from(data,'base64'));
 }
}}finally{await b.close()}
