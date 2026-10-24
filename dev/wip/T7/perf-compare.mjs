import fs from 'node:fs';
import {launch} from '../../../scripts/lib/cdp.mjs';
const b=await launch({width:1280,height:720}),rows=[];
try{
 const p=await b.newPage();
 for(const orient of ['landscape','portrait'])for(const t of [7,17,30,42,52]){
  const images=['before','after'].map(phase=>'data:image/png;base64,'+fs.readFileSync(`dev/shots/T7/perf/${phase}/${orient}-${t}.png`).toString('base64'));
  const result=await p.eval(`(async()=>{const images=await Promise.all(${JSON.stringify(images)}.map(src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src})));return [1,.25].map(scale=>{const w=images[0].width*scale,h=images[0].height*scale;const pixels=images.map(i=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(i,0,0,w,h);return x.getImageData(0,0,w,h).data});let sum=0,changed=0,max=0;for(let i=0;i<pixels[0].length;i+=4){let diff=false;for(let j=0;j<3;j++){const d=Math.abs(pixels[0][i+j]-pixels[1][i+j]);sum+=d;max=Math.max(max,d);diff||=d>0;}if(diff)changed++;}return{w,h,MAD:sum/(w*h*3*255),changed,max};});})()`);
  rows.push({orient,t,result});console.log(orient,t,JSON.stringify(result));
 }
}finally{await b.close();fs.writeFileSync('dev/shots/T7/perf/consistency.json',JSON.stringify(rows,null,2));}
