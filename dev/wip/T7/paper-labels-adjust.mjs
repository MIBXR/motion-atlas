import fs from 'node:fs';
const js='dev/wip/T7/parts/main.js',css='dev/wip/T7/parts/base.css';
let code=fs.readFileSync(js,'utf8').replace('left:${r.x+r.w/2}px;top:${r.y+r.h/2-(p?70:0)}px','left:${r.x}px;top:${r.y-(p?70:0)}px');
fs.writeFileSync(js,code);
let style=fs.readFileSync(css,'utf8').replace('.blueprint-machine[data-id="furnace"]{z-index:3}','');
style+='\n.blueprint-plant{isolation:isolate}.blueprint-machine{transform:none}\n';
fs.writeFileSync(css,style);
