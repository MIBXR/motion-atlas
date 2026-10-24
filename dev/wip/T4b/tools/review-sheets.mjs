import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const oi=process.argv.indexOf('--only'),only=oi<0?null:process.argv[oi+1].split(',');
const rows=JSON.parse(fs.readFileSync('dev/shots/T4b/parity/index.json','utf8')).rows.filter(r=>!only||only.includes(r.id));
const sheets=[];
for(const id of [...new Set(rows.map(r=>r.id))])for(const orient of ['landscape','portrait']){
  const frames=rows.filter(r=>r.id===id&&r.orient===orient).sort((a,b)=>a.segment-b.segment||a.t-b.t);
  const dir=`dev/shots/T4b/parity/review/${id}`;fs.mkdirSync(dir,{recursive:true});
  for(let i=0;i<frames.length;i+=3){
    const part=frames.slice(i,i+3),file=`${dir}/${orient}-${i/3+1}.jpg`;
    const filters=part.map((_,j)=>`[${j}:v]scale=iw/2:ih/2[a${j}]`).join(';')+';'+part.map((_,j)=>`[a${j}]`).join('')+`vstack=inputs=${part.length}`;
    const r=spawnSync('ffmpeg',['-y','-loglevel','error',...part.flatMap(f=>['-i',f.file]),'-filter_complex',filters,'-frames:v','1','-q:v','2',file],{encoding:'utf8'});
    if(r.status!==0)throw new Error(r.stderr);
    sheets.push({id,orient,file,frames:part.map(r=>({t:r.t,caseT:r.caseT,file:r.file,current:r.current,note:r.note||null,actionStates:r.actionStates||null}))});
  }
}
fs.writeFileSync(`dev/shots/T4b/parity/review/${only?'index-'+only.join(','):'index'}.json`,JSON.stringify(sheets,null,2)+'\n');
console.log(JSON.stringify({sheets:sheets.length,frames:rows.length}));
