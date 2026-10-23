import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const records=JSON.parse(fs.readFileSync('dev/wip/T7/imagegen/selected-generations.json','utf8')),results=[];
for(const r of records){
 const s=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,pix_fmt','-of','json',r.path],{encoding:'utf8'})).streams[0];
 const raw=execFileSync('ffmpeg',['-v','error','-i',r.path,'-frames:v','1','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:64*1024*1024});
 let zero=0,partial=0,min=255,max=0,x0=s.width,y0=s.height,x1=-1,y1=-1;
 for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const a=raw[(y*s.width+x)*4+3];min=Math.min(min,a);max=Math.max(max,a);zero+=a===0;partial+=a>0&&a<255;if(a>=128){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}
 const samples=[[0,0],[.05,.5],[.95,.5],[.5,.05],[.5,.95]].map(([x,y])=>({x,y,rgba:[...raw.subarray((Math.floor(y*(s.height-1))*s.width+Math.floor(x*(s.width-1)))*4,(Math.floor(y*(s.height-1))*s.width+Math.floor(x*(s.width-1)))*4+4)]}));
 const item={name:r.name,...s,alpha:{min,max,transparent:zero,partial,bounds128:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}},samples};results.push(item);console.log(JSON.stringify(item));
}
fs.writeFileSync('dev/wip/T7/imagegen/native-inspection.json',JSON.stringify(results,null,2));
