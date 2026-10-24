import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {launch} from '../../../scripts/lib/cdp.mjs';
const output='dev/shots/T5r/clarity';fs.mkdirSync(output,{recursive:true});
function orange(file){
  const r=spawnSync('ffmpeg',['-loglevel','error','-i',file,'-vf','crop=1100:700:0:250','-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],{maxBuffer:4*1024*1024});
  if(r.status!==0)throw new Error(r.stderr.toString());
  let n=0;for(let i=0;i<r.stdout.length;i+=3)if(r.stdout[i]-r.stdout[i+1]>15&&r.stdout[i+1]-r.stdout[i+2]>10)n++;
  return n;
}
const browser=await launch({width:1920,height:1080});
const skipWarm=process.argv.includes('--skip-warm');
const quality=process.argv.includes('--performance')?'performance':'original';
try{
  const page=await browser.newPage();
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`(() => {
    ${skipWarm?"if(window!==top)window.__filmSkipRender=true;":""}
    if(!globalThis.WebGL2RenderingContext)return;
    const P=WebGL2RenderingContext.prototype,create=P.createProgram,use=P.useProgram;
    globalThis.__gpuDiag={programs:[],used:new Set};
    P.createProgram=function(){const p=create.call(this);__gpuDiag.programs.push({gl:this,p});return p;};
    P.useProgram=function(p){__gpuDiag.used.add(p);return use.call(this,p);};
  })()`});
  await page.goto('http://localhost:4323/demos/cases/archive-os/index.html?render=1&quality='+quality);
  await page.waitFor('window.__motion',30000);
  if(skipWarm)await page.waitFor('Array.isArray(window.__filmDriver?.log)',30000);
  else await page.eval('__motion.ready.then(()=>true)',120000);
  const result={skipWarm,quality,referenceOrange:orange('dev/shots/T5r/parity/landscape-40-reference.png'),frames:[]};
  for(const t of [40,40+1/60,40+2/60]){
    await page.eval(`document.querySelector('iframe').contentWindow.__gpuDiag.used.clear()`);
    await page.eval(`__motion.seek(${t})`,60000);
    const file=`${output}/F${t.toFixed(4)}.png`;await page.screenshot(file);
    const uniforms=await page.eval(`(()=>{
      const w=document.querySelector('iframe').contentWindow,d=w.__gpuDiag,out=[];
      for(const [id,{gl,p}]of d.programs.entries()){
        if(!d.used.has(p)||!gl.getProgramParameter(p,gl.LINK_STATUS))continue;
        const values={};for(const name of ['archiveQuality','archiveClarity','roughness','transmission','thickness']){
          const loc=gl.getUniformLocation(p,name);if(loc!==null)values[name]=gl.getUniform(p,loc);
        }
        if('archiveQuality'in values)out.push({id,values});
      }
      return{uniforms:out,decryption:w.__filmApp.stats().decryption};
    })()`);
    result.frames.push({t,orange:orange(file),...uniforms});
  }
  fs.writeFileSync(`${output}/result-${quality}-${skipWarm?'cold':'warm'}.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
  assert.ok(result.frames[0].orange>=result.referenceOrange*.5,'First seek frame hides the original orange rings');
}finally{await browser.close();}
