import fs from 'node:fs';
const dir='dev/wip/T7/parts/';
const acorn={};new Function('exports','module',process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'])(acorn,{exports:acorn});
for(const f of ['head.js','machine-art.js','panel.js','operator.js','main.js']){
 let s=fs.readFileSync(dir+f,'utf8');
 // Parse fragments inside their enclosing function.
 const prefix=f==='head.js'?'':f==='main.js'?'(()=>{':'(()=>{';
 const suffix=f==='head.js'?'})();':f==='main.js'?'':'})();';
 const full=prefix+s+suffix,tree=acorn.parse(full,{ecmaVersion:'latest'}),edits=[];
 const text=n=>full.slice(n.start,n.end);
 const visit=n=>{
  if(!n||typeof n!=='object')return;
  let replacement;
  if(n.type==='AssignmentExpression'&&n.operator==='='&&n.left.type==='MemberExpression'){
   const a=n.left;
   if(a.object.type==='MemberExpression'&&a.object.property.name==='style')replacement=`write(${text(a.object)}, ${JSON.stringify(a.property.name)}, ${text(n.right)})`;
   else if(['textContent','innerHTML'].includes(a.property.name))replacement=`write(${text(a.object)}, ${JSON.stringify(a.property.name)}, ${text(n.right)})`;
  }
  if(n.type==='CallExpression'&&n.callee.type==='MemberExpression'){
   if(n.callee.property.name==='setAttribute')replacement=`attribute(${text(n.callee.object)}, ${n.arguments.map(text).join(', ')})`;
   if(text(n.callee)==='Object.assign'&&n.arguments[0].type==='MemberExpression'&&n.arguments[0].property.name==='style')replacement=`styles(${n.arguments.map(text).join(', ')})`;
  }
  if(replacement){edits.push([n.start-prefix.length,n.end-prefix.length,replacement]);return;}
  for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);
 };
 visit(tree);
 for(const[a,b,v]of edits.sort((a,b)=>b[0]-a[0]))s=s.slice(0,a)+v+s.slice(b);
 fs.writeFileSync(dir+f,s);
}
let head=fs.readFileSync(dir+'head.js','utf8');
head=head.replace('  const brand=',`  const written=new WeakMap();
  function write(object,key,value){const next=String(value);let values=written.get(object);if(!values)written.set(object,values=new Map());if(values.get(key)!==next){object[key]=next;values.set(key,next);}}
  function styles(style,values){for(const[key,value]of Object.entries(values))write(style,key,value);}
  function attribute(el,key,value){const next=String(value);if(el.getAttribute(key)!==next)el.setAttribute(key,next);}
  const nodes=new WeakMap();
  function node(selector,root=document){let cache=nodes.get(root);if(!cache)nodes.set(root,cache=new Map());if(!cache.has(selector))cache.set(selector,root.querySelector(selector));return cache.get(selector);}
  function nodeList(selector,root=document){let cache=nodes.get(root);if(!cache)nodes.set(root,cache=new Map());const key='all:'+selector;if(!cache.has(key))cache.set(key,root.querySelectorAll(selector));return cache.get(key);}
  const brand=`);
const start=head.indexOf('  function roll(');
head=head.slice(0,start)+`  function roll(el,from,to,k){
    const a=String(from).padStart(String(to).length,'0'),b=String(to);
    write(el,'innerHTML',Array.from(b,(v,i)=>\`<span><b>\${a[i]}<br>\${v}</b></span>\`).join(''));
    for(const span of el.children)write(span.firstElementChild.style,'transform',\`translateY(\${-clamp(k,0,1)*50}%)\`);
    attribute(el,'aria-label',String(Math.round(lerp(from,to,clamp(k,0,1)))));
  }
`;
fs.writeFileSync(dir+'head.js',head);
let main=fs.readFileSync(dir+'main.js','utf8');
const begin=main.indexOf('const center=el=>'),end=main.indexOf('const route=',begin);
main=main.slice(0,begin)+`const pop=Math.min(seg(t,50,.4,E.outCubic),1-seg(t,53.2,.4,E.inOutCubic)),mid=p?960:540;const copy={x:p?875:1291,y:mid+((p?878:498)-mid)*pop},accept={x:p?540:1112,y:mid+((p?1064:602)-mid+(t>=53&&t<53.12?2:0))*pop};`+main.slice(end);
main=main.replace("center($('.copy-button'))",'copy').replace("center($('.capsule.confirm'))",'accept');
const renderStart=main.indexOf('  function render(t){'),renderEnd=main.indexOf('  MK.preload');
main=main.slice(0,renderStart)+main.slice(renderStart,renderEnd).replace(/\$\(/g,'node(').replace(/document.querySelectorAll\(/g,'nodeList(')+main.slice(renderEnd);
main=main.replace('panel.render(t,p,','panel.render(clamp(t,24.9,35.5),p,').replace('operator.render(t,p)','operator.render(clamp(t,36,48.3),p)');
main=main.replace('`rotate(${t*90}deg)`','`rotate(${active?t*90:0}deg)`');
main=main.replace("else write(wipe.style, \"cssText\", 'display:none')","else write(wipe.style, 'display', 'none')");
// The retained terrain canvas and CSS boundary are only invalidated on orientation changes.
main=main.replace('function trace(path,from,to){','function trace(path,from,to,context=fx){');
const traceStart=main.indexOf('  function trace('),traceEnd=main.indexOf('  function drawBelt(',traceStart);
main=main.slice(0,traceStart)+main.slice(traceStart,traceEnd).replace(/fx\./g,'context.')+main.slice(traceEnd);
const body="for(const[color,width]of[['#8a5a0e',48],['#f2a51c',40]]){fx.strokeStyle=color;fx.lineWidth=width*s;for(const[a,b]of ranges)trace(shape,a,b);}";
main=main.replace(body,`if(!building||t>=18.5){
      if(!shape.body){const canvas=document.createElement('canvas');canvas.width=p?1080:1920;canvas.height=p?1920:1080;const paint=canvas.getContext('2d');paint.lineJoin='round';paint.lineCap='butt';for(const[color,width]of[['#8a5a0e',48],['#f2a51c',40]]){paint.strokeStyle=color;paint.lineWidth=width*s;trace(shape,0,shape.length,paint);}shape.body=canvas;}
      fx.drawImage(shape.body,0,0);
    }else ${body}`);
fs.writeFileSync(dir+'main.js',main);
let art=fs.readFileSync(dir+'machine-art.js','utf8').replace(/el.querySelectorAll\(([^)]+)\)/g,'nodeList($1,el)');
fs.writeFileSync(dir+'machine-art.js',art);
let op=fs.readFileSync(dir+'operator.js','utf8');
op=op.replace('  function render(t, p) {','  let inkKey,ink;\n  function render(t, p) {');
op=op.replace('    textContext.font =',"    const key=String(p)+document.fonts.status;\n    if(inkKey!==key){\n    textContext.font =");
op=op.replace("    const ink = textContext.measureText('ENDFIELD');","    ink = textContext.measureText('ENDFIELD');inkKey=key;\n    }");
fs.writeFileSync(dir+'operator.js',op);
