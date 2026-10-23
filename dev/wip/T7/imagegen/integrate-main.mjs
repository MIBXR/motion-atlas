import fs from 'node:fs';
const file='dev/wip/T7/parts/main.js';let code=fs.readFileSync(file,'utf8');
const begin=code.indexOf('    const rand=MK.rng(713);'),end=code.indexOf('    const b=p?{x:60,y:240',begin);
code=code.slice(0,begin)+"    ctx.fillStyle=ctx.createPattern(MK.preload.cache.get(bitmaps.ground),'repeat');\n    ctx.fillRect(0,0,w,h);\n"+code.slice(end);
code=code.replace("background:age<.8?'transparent':'#2a2d31',borderColor:age<.8?'transparent':'#4a4e53'","background:'transparent',borderColor:'transparent'");
code=code.replace("  MK.preload([{label:'Google Fonts'","  MK.preload(Object.values(bitmaps).map(MK.preload.image));\n  MK.preload([{label:'Google Fonts'");
code=code.replace('MK.start(tl,{t:0,reduced:0});','tl.ready.then(()=>MK.start(tl,{t:0,reduced:0}));');
fs.writeFileSync(file,code);
