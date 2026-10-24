import fs from 'node:fs';
const base='dev/wip/T7/parts/';
fs.writeFileSync('demos/cases/industrial-protocol/script.js',['head.js','machine-art.js','panel.js','operator.js','main.js'].map(f=>fs.readFileSync(base+f,'utf8')).join('\n'));
fs.writeFileSync('demos/cases/industrial-protocol/style.css',['base.css','panel.css','operator.css'].map(f=>fs.readFileSync(base+f,'utf8')).join('\n'));
fs.copyFileSync(base+'config.js','demos/cases/industrial-protocol/config.js');
