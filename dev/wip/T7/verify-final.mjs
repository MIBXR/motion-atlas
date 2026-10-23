import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out='dev/shots/T7/render',result={videos:[]};
fs.mkdirSync(`${out}/decoded-final`,{recursive:true});
for(const orient of ['landscape','portrait']){
 const file=`${out}/industrial-protocol-${orient}.mp4`;
 const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,duration,nb_frames,sample_rate,channels','-show_entries','format=duration,size','-of','json',file],{encoding:'utf8'}));
 const frames=[];
 for(const t of [2,15.5,29,42,52,58]){
  const image=`${out}/decoded-final/${orient}-${t.toFixed(3)}.png`;
  execFileSync('ffmpeg',['-y','-loglevel','error','-ss',String(t),'-i',file,'-frames:v','1','-update','1',image]);frames.push(image);
 }
 const wav=fs.readFileSync(`${out}/industrial-protocol-${orient}.wav`);
 let dataOffset=0,dataSize=0,channels=0,sampleRate=0,bits=0;
 for(let offset=12;offset+8<=wav.length;){const id=wav.toString('ascii',offset,offset+4),size=wav.readUInt32LE(offset+4);if(id==='fmt '){channels=wav.readUInt16LE(offset+10);sampleRate=wav.readUInt32LE(offset+12);bits=wav.readUInt16LE(offset+22);}if(id==='data'){dataOffset=offset+8;dataSize=size;break;}offset+=8+size+(size%2);}
 let peak=0,clipped=0;for(let i=dataOffset;i<dataOffset+dataSize;i+=2){const value=Math.abs(wav.readInt16LE(i));peak=Math.max(peak,value);if(value>=32767)clipped++;}
 const audio={channels,sampleRate,bits,duration:dataSize/(sampleRate*channels*bits/8),peakDb:20*Math.log10(peak/32768),clipped};
 const video=info.streams.find(s=>s.codec_type==='video'),sound=info.streams.find(s=>s.codec_type==='audio');
 const expected=orient==='portrait'?[1080,1920]:[1920,1080];
 if(video.width!==expected[0]||video.height!==expected[1]||video.nb_frames!=='1800'||video.r_frame_rate!=='30/1'||+video.duration!==60||!sound||audio.peakDb>-1||audio.clipped)throw new Error(`Video or audio validation failed: ${orient}`);
 result.videos.push({orient,file,...info,wav:audio,decoded:frames});
}
fs.writeFileSync(`${out}/final-media.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
