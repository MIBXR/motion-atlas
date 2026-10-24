import fs from 'node:fs';
const file='dev/wip/T7/parts/main.js';let code=fs.readFileSync(file,'utf8');
const replace=(start,end,content)=>{const a=code.indexOf(start),b=code.indexOf(end,a);if(a<0||b<0)throw new Error(start);code=code.slice(0,a)+content+'\n'+code.slice(b);};
replace('  function makeTerrain(p)', '  const conveyorPoints=', fs.readFileSync('dev/wip/T7/parts/terrain.js','utf8'));
replace('  function trace(', '  function blueprintLayout(', fs.readFileSync('dev/wip/T7/parts/belts.js','utf8'));
code=code.replace('const beltPath=pathInfo(conveyorPoints);','const beltPath=pathInfo(conveyorPoints),oldBeltPath=pathInfo(oldPoints);');
code=code.replace('drawBelt(t,p,pathInfo(oldPoints),false,mapped)','drawBelt(t,p,oldBeltPath,false,mapped)');
fs.writeFileSync(file,code);
