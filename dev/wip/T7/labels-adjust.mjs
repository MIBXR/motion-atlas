import fs from 'node:fs';
const js='dev/wip/T7/parts/main.js',css='dev/wip/T7/parts/base.css';
let code=fs.readFileSync(js,'utf8');
code=code.replace("Object.assign(el.style,{left:r.x+r.w/2+'px',top:r.y+r.h/2+'px'", "Object.assign(el.style,{left:r.x+'px',top:r.y+'px'");
fs.writeFileSync(js,code);
let style=fs.readFileSync(css,'utf8').replace('#machine-furnace{z-index:3}#machine-plant{z-index:2}','');
style+='\n.machine{transform:none}.machine-name{z-index:10}\n';
fs.writeFileSync(css,style);
