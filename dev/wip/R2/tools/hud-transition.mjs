import fs from 'node:fs';
import {launch} from '../../../../scripts/lib/cdp.mjs';
import {directEntry,seekIdle} from '../../T4b/tools/plate.mjs';

directEntry();
const output='dev/shots/R2/hud-transition';
fs.mkdirSync(output,{recursive:true});
const caseLandscape=process.argv.includes('--case-landscape');
const times=[.5,1.75,2,2.25,4.75,5,5.25,6.5];
const ranges=[[32.8,33.8],[36.6,37.5],[47.6,48.6],[54.6,55.5]];
const cases=ranges.flatMap(([start,end])=>[start,(start+end)/2,end]);
const report=caseLandscape?JSON.parse(fs.readFileSync(`${output}/verification.json`,'utf8')):{command:process.argv.join(' '),execArgv:process.execArgv,base:'http://localhost:4322',formula:'clamp(abs(n - 0.5) / 0.25, 0, 1)',items:[]};
if(caseLandscape){report.items=report.items.filter(x=>x.kind!=='case'||x.orient!=='landscape');report.caseLandscapeCommand=[...process.execArgv,...process.argv].join(' ');}
const readState=(caseT)=>`(() => {
  const t=${caseT},clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
  const track=(window.CASE_CONFIG||window.CONFIG).tracks.night;
  let n=track.at(-1).v;
  if(t<=track[0].t)n=track[0].v;
  else for(let i=0;i<track.length-1;i++){const a=track[i],b=track[i+1];if(t<=b.t){n=a.v+(b.v-a.v)*ease(clamp((t-a.t)/(b.t-a.t)));break;}}
  const root=__motion.stage.root,stageBox=root.getBoundingClientRect();
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const styles=e=>{
    const c=getComputedStyle(e);let opacity=1,shown=true;
    const ancestors=[];
    for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const s=getComputedStyle(p);opacity*=Number(s.opacity);if(s.display==='none'||s.visibility==='hidden')shown=false;ancestors.push({tag:p.tagName,id:p.id,className:p.getAttribute('class'),opacity:s.opacity,display:s.display,visibility:s.visibility});}
    return {text:e.textContent.trim(),opacity:Number(c.opacity),effectiveOpacity:opacity,shown:shown&&opacity>.001,color:c.color,backgroundColor:c.backgroundColor,fill:c.fill,stroke:c.stroke,fontSize:c.fontSize,box:rect(e),ancestors};
  };
  const selectors=['.hud-top','.hud-bottom','#hudgfx','.hud-rule','.hud-day','.hd-date','.hg-coord','.hg-elev','.hc-time','.hc-tz','.compass','.rl-base','.rl-fill','.rl-head','.stepper-g','.np','.np-head','.np-track','.np-lyric','.np-sub','.scale','.sc-text','.attrib'];
  const elements=Object.fromEntries(selectors.map(s=>[s,[...root.querySelectorAll(s)].map(styles)]));
  const attrib=[...root.querySelectorAll('.attrib')].map(e=>{
    const state=styles(e),r=e.getBoundingClientRect(),points=[[r.x+1,r.y+r.height/2],[r.x+r.width/2,r.y+r.height/2],[r.right-1,r.y+r.height/2]];
    return {...state,insideHud:!!e.closest('.hud'),insideStage:r.left>=stageBox.left-.1&&r.top>=stageBox.top-.1&&r.right<=stageBox.right+.1&&r.bottom<=stageBox.bottom+.1,hitTest:points.map(([x,y])=>({x,y,elements:document.elementsFromPoint(x,y).map(p=>({tag:p.tagName,id:p.id,className:p.getAttribute('class')}))}))};
  });
  const gl=__map.painter.context.gl,ext=gl.getExtension('WEBGL_debug_renderer_info');
  return {caseT:t,actualT:__motion.time,n,a:clamp(Math.abs(n-.5)/.25),stageNight:Number(getComputedStyle(root).getPropertyValue('--night')),stage:{width:__motion.stage.width,height:__motion.stage.height,scale:__motion.stage.scale},renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),elements,attribution:attrib};
})()`;

const browser=await launch({width:1920,height:1080,args:['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist']});
try {
  for(const kind of ['pattern','case'])for(const orient of ['landscape','portrait']) {
    if(caseLandscape&&(kind!=='case'||orient!=='landscape'))continue;
    const page=await browser.newPage();
    await page.viewport(...(orient==='portrait'?[1080,1920]:[1920,1080]),1);
    const demo=kind==='pattern'?'patterns/day-night-flip':'cases/map-pilgrimage';
    await page.goto(`http://localhost:4322/demos/${demo}/index.html?render=1&orient=${orient}`,60000);
    await page.waitFor('window.__motion && window.__map',30000);
    await page.eval('Promise.resolve(__motion.ready).then(()=>true)',60000);
    await page.eval('__motion.pause()');
    for(const t of kind==='pattern'?times:cases) {
      const caseT=kind==='case'?t:t<4.5?31.3+t:36.6+t-4.5;
      const idle=await seekIdle(page,t),state=await page.eval(readState(caseT));
      if(state.stage.scale!==1)throw new Error(`Expected native stage: ${JSON.stringify(state.stage)}`);
      if(/swiftshader|llvmpipe|software/i.test(state.renderer))throw new Error(`Software renderer: ${state.renderer}`);
      const file=`${output}/${kind}-${orient}-${Number(t.toFixed(6))}.png`;
      await page.screenshot(file);
      const item={kind,orient,t,file,idle,...state};
      report.items.push(item);
      fs.writeFileSync(`${output}/verification.json`,JSON.stringify(report,null,2)+'\n');
      console.log(JSON.stringify({kind,orient,t,caseT,n:state.n,a:state.a,topOpacity:state.elements['.hud-top'][0]?.effectiveOpacity,bottomOpacity:state.elements['.hud-bottom'][0]?.effectiveOpacity,attribution:state.attribution.map(a=>({shown:a.shown,opacity:a.effectiveOpacity,insideStage:a.insideStage,insideHud:a.insideHud})),renderer:state.renderer,file}));
    }
    await page.send('Page.close');
  }
} finally {await browser.close();}
console.log(`Captured ${report.items.length} HUD transition images; visual inspection is required.`);
