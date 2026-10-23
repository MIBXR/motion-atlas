import fs from 'node:fs';
import path from 'node:path';
import {launch} from '../../../scripts/lib/cdp.mjs';
const refs=path.resolve('../../dev/shots/T7/refs'),out='dev/shots/T7/compare';
const data=f=>'data:image/'+(/\.png$/.test(f)?'png':'jpeg')+';base64,'+fs.readFileSync(f).toString('base64');
const sets=[
 ['S2-blueprint',[12,16,20].map(t=>({title:`S2 ${t}s`,left:`dev/shots/T7/fix9-layout/landscape-S2-${t.toFixed(3)}.png`,right:path.join(refs,'frames/03/000043.350.jpg')}))],
 ['S3-machine-panel',[{title:'S3 29s',left:'dev/shots/T7/render/industrial-protocol-landscape/frame-00871.jpg',right:path.join(refs,'frames/03/000045.583.jpg')}]],
 ['S4-operator',[{title:'S4 44s',left:'dev/shots/T7/render/industrial-protocol-landscape/frame-01321.jpg',right:path.join(refs,'sheets/01-02.jpg')}]]
];
const b=await launch({width:1280,height:720,args:['--enable-gpu','--use-angle=d3d11']});
try{const p=await b.newPage();for(const[name,rows]of sets){
 const sources=rows.map(r=>({...r,left:data(r.left),right:data(r.right)}));
 const png=await p.eval(`(async()=>{const rows=${JSON.stringify(sources)},c=document.createElement('canvas');c.width=1920;c.height=rows.length*580;const x=c.getContext('2d');x.fillStyle='#17191b';x.fillRect(0,0,c.width,c.height);x.fillStyle='white';x.font='20px Arial';for(let i=0;i<rows.length;i++){const r=rows[i],y=i*580;x.fillText(r.title+' · implementation',16,y+27);x.fillText('Local reference',976,y+27);for(const [j,src]of [r.left,r.right].entries()){const im=new Image();im.src=src;await im.decode();const k=Math.min(960/im.width,540/im.height);x.drawImage(im,j*960+(960-im.width*k)/2,y+40+(540-im.height*k)/2,im.width*k,im.height*k);}}return c.toDataURL('image/png').split(',')[1]})()`);
 fs.writeFileSync(`${out}/${name}.png`,Buffer.from(png,'base64'));console.log(`${out}/${name}.png`);
}}finally{await b.close()}
