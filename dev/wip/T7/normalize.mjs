import fs from 'node:fs';
const files=fs.readdirSync('dev/wip/T7/parts').filter(f=>/\.(js|css)$/.test(f)).map(f=>'dev/wip/T7/parts/'+f).concat(['demos/cases/industrial-protocol/index.html','entries/cases/industrial-protocol.json','docs/research/industrial-protocol.md','dev/reports/T7.md']);
for(const file of files){const text=fs.readFileSync(file,'utf8');fs.writeFileSync(file,text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'));}
