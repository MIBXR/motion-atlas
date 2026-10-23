import fs from 'node:fs';
const file='dev/wip/T7/parts/main.js';let s=fs.readFileSync(file,'utf8');
s=s.replace("let layoutKey='';","let layoutKey='',flowKey='';");
s=s.replace('    fx.clearRect(0,0,w,h);',"    const nextFlowKey=String(p)+(t>=13.6&&t<14||t>=16?t:'idle');\n    const center=machineRect(machines[6],p),snap={x:center.x+center.w/2,y:center.y+center.h/2};\n    if(flowKey!==nextFlowKey){\n    fx.clearRect(0,0,w,h);");
s=s.replace('true);const center=machineRect(machines[6],p),snap={x:center.x+center.w/2,y:center.y+center.h/2};if(t>=13.6','true);if(t>=13.6');
s=s.replace('    for(const{m,el}of machineEls)', '    flowKey=nextFlowKey;\n    }\n    for(const{m,el}of machineEls)');
// Resizing the flow canvas clears its retained pixels.
s=s.replace('makeTerrain(p);blueprintLayout(p);','makeTerrain(p);flowKey=\'\';blueprintLayout(p);');
fs.writeFileSync(file,s);
