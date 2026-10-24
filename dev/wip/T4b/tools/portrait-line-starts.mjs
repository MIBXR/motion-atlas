import fs from 'node:fs';
import vm from 'node:vm';

const ids=['map-pilgrimage','corner-hud','vertical-title-blur','route-draw-marker','day-night-flip','card-expand-fullscreen','chapter-frame','split-compare-stamp','collect-counter','alert-reroute','outro-stat-stack','seekable-timeline','film-grain'];
const readConfig=id=>{const context={window:{}};const dir=id==='map-pilgrimage'?'cases':'patterns';vm.runInNewContext(fs.readFileSync(`demos/${dir}/${id}/config.js`,'utf8'),context);return context.window.CONFIG;};
const source=readConfig('map-pilgrimage');
const sourceText=fs.readFileSync('demos/cases/map-pilgrimage/config.js','utf8').split(/\r?\n/);
const textSources=[];
function inventory(value,key='CONFIG') {
  if(typeof value==='string'&&/[·→]/.test(value))textSources.push({field:key,text:value,file:'demos/cases/map-pilgrimage/config.js',line:sourceText.findIndex(line=>line.includes(value))+1});
  else if(value&&typeof value==='object')for(const [child,item]of Object.entries(value))inventory(item,`${key}.${child}`);
}
inventory(source);
textSources.push({field:'drawHud el.elev',text:'ALT … M · Z … / ELEV … M · Z …',file:'demos/cases/map-pilgrimage/script.js',kind:'dynamic template'});
textSources.push({field:'drawHud empty lyric',text:'♪ · · ·',file:'demos/cases/map-pilgrimage/script.js',kind:'dynamic placeholder'});
for(const [index,text]of ['SHANGHAI → KANSAI','KYOTO · NARA · OSAKA','10.01 – 10.03'].entries())textSources.push({field:`intro portrait line ${index+1}`,text,file:'demos/cases/map-pilgrimage/script.js',kind:'approved manual line'});
const caseTimes=new Set([0,60]);
const add=t=>{if(Number.isFinite(t)&&t>=0&&t<=60)caseTimes.add(Math.round(t*1e6)/1e6);};
for(let t=0;t<=60;t+=.5)add(t);
function boundaries(value) {
  if(!value||typeof value!=='object')return;
  for(const [key,item]of Object.entries(value)) {
    if(['t','until','t0','t1'].includes(key)&&typeof item==='number'){add(item-.001);add(item);add(item+.001);}
    else if(typeof item==='object')boundaries(item);
  }
}
boundaries(source.tracks);
function prefixes(text,start,duration) {
  if(!/[·→]/.test(text))return;
  const count=Array.from(text).length;
  for(let i=0;i<count;i++)add(start+duration*(i+.5)/count+.000001);
  add(start);add(start+duration);
}
for(const marker of source.tracks.markers)prefixes(source.stops[marker.stop].name,marker.t+.12,.5);
for(const chapter of source.tracks.chapter)prefixes(source.chapters[chapter.key].title,chapter.t+.25,.7);
for(const alert of source.tracks.alert)prefixes(alert.detail,alert.t+.3,.9);
for(const lyric of source.music.lyrics)prefixes(lyric.text,lyric.t,.8);
for(const t of [3.8,4,4.75,5.7,5.75,5.85,6,6.2,6.3,7.3,7.9,8.2])add(t);
const caseSamples=[...caseTimes].sort((a,b)=>a-b);
const inverseEase=p=>p<.5?Math.cbrt(p/4):1-Math.cbrt((1-p)/4);
const plans=ids.map(id=>{
  const config=readConfig(id),duration=id==='map-pilgrimage'?config.meta.duration:config.duration;
  const times=new Set([0,duration]);
  const put=t=>{if(t>=0&&t<=duration)times.add(Math.round(t*1e6)/1e6);};
  if(id==='map-pilgrimage')caseSamples.forEach(put);
  else {
    for(const segment of config.segments) {
      for(const offset of [0,.001,.2,segment.duration/2,Math.max(0,segment.duration-.2),segment.duration])put(segment.start+offset);
      if(id!=='film-grain'&&id!=='route-draw-marker'&&id!=='day-night-flip')for(const caseT of caseSamples) {
        const p=(caseT-segment.from)/(segment.to-segment.from);
        if(p>=0&&p<=1)put(segment.start+segment.duration*(segment.mode==='drag'?inverseEase(p):p));
      }
    }
    for(const marker of config.markers||[])put(marker.t);
    for(const action of config.actions||[])for(const caseT of caseSamples)if(caseT>=action.from&&caseT<=action.to)put(action.at+caseT-action.from);
  }
  return{id,duration,url:`http://localhost:4322/demos/${id==='map-pilgrimage'?'cases':'patterns'}/${id}/index.html?render=1&orient=portrait`,times:[...times].sort((a,b)=>a-b)};
});
const plan={createdAt:new Date().toISOString(),mode:'portrait',stage:[1080,1920],viewport:[720,1280],browserPath:'Original CDP default GL via direct-browser only; no hardware-browser or ANGLE override. Preview viewport uses the unchanged1080x1920 logical stage and original software-preview conditions; Range coordinates are divided by stage.scale.',subtitle:'Manual three portrait lines; original parent opacity reveal from5.7 to6.2 with outCubic is unchanged. No per-line delay or new typeText timing.',textSources,sampling:'Every source delimiter-text typeText prefix threshold, event boundaries ±.001, every source .5s, and pattern segment/marker boundaries. Source case samples are remapped through each ordinary/seek segment; route action clocks are remapped independently. Film/day-night use segment sampling because source texts are fixed.',plans};
fs.writeFileSync('dev/wip/T4b/portrait-line-starts-plan.json',JSON.stringify(plan,null,2)+'\n');
if(!process.argv.includes('--run')) {
  console.log(JSON.stringify({mode:'plan only; no browser',sources:textSources.length,pages:plans.length,samples:plans.reduce((n,p)=>n+p.times.length,0)}));
} else {
  const nodeOptions=process.env.NODE_OPTIONS||'';
  if(/hardware-browser|d3d11|--use-angle/i.test([...process.execArgv,nodeOptions].join('\n')))throw new Error('This audit requires the default GL path; remove hardware-browser / ANGLE overrides.');
  const {directEntry,openBrowser}=await import('./plate.mjs');
  directEntry();
  const browser=await openBrowser();
  const outputDir='dev/shots/T4b/portrait-lines';
  fs.mkdirSync(outputDir,{recursive:true});
  const recheck=process.argv.includes('--recheck-geometry')?JSON.parse(fs.readFileSync(outputDir+'/before-transform-normalization.json','utf8')):null;
  const recheckKeys=new Set((recheck?.findings||[]).map(f=>`${f.id}:${f.t}`));
  const runPlans=recheck?plans.map(p=>({...p,times:p.times.filter(t=>recheckKeys.has(`${p.id}:${t}`))})).filter(p=>p.times.length):plans;
  const result={started:new Date().toISOString(),execArgv:process.execArgv,nodeOptions,browserPath:plan.browserPath,plans:'dev/wip/T4b/portrait-line-starts-plan.json',lineNormalization:'Character centers are inverse-rotated by cumulative CSS rotation; nowrap text has one line. Source text and transforms are not modified.',plannedSources:textSources.length,plannedPages:runPlans.length,plannedSamples:runPlans.reduce((sum,page)=>sum+page.times.length,0),renderers:[],pages:[],samples:[],subtitleChecks:[],findings:[],errors:[]};
  const resultFile=outputDir+(recheck?'/geometry-recheck.json':'/result.json');
  const save=()=>fs.writeFileSync(resultFile,JSON.stringify(result,null,2)+'\n');
  const probe=`(()=>{
    const stage=document.querySelector('#stage'),sr=stage.getBoundingClientRect(),scale=window.__motion.stage.scale||1;
    const visible=e=>{let opacity=1;for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden')return false;opacity*=Number(c.opacity);}return opacity>.001;};
    const selectors='.it-sub,.lt-sub,.lt-en,.hd-date,.hg-elev,.mk-label,.rt-tag,.cd-cap b,.fb-tag,.cmp-label,.cmp-stamp,.ts-text,.ts-sub,.nt-sign,.al-detail,.ou-stats li span,.ou-credits p,.attrib,.np-lyric-text,.np-track';
    const roots=new Set([...stage.querySelectorAll(selectors)]);
    for(const element of stage.querySelectorAll('*'))for(const node of element.childNodes)if(node.nodeType===Node.TEXT_NODE&&/[·→]/.test(node.textContent)&&!element.closest(selectors))roots.add(element);
    const rows=[];
    for(const root of roots){
      if(!visible(root)||!/[·→]/.test(root.textContent))continue;
      const computed=getComputedStyle(root);
      let angle=0;
      for(let element=root;element&&element!==document.documentElement;element=element.parentElement){const transform=getComputedStyle(element).transform;if(transform!=='none'){const matrix=new DOMMatrix(transform);angle+=Math.atan2(matrix.b,matrix.a);}}
      const cos=Math.cos(angle),sin=Math.sin(angle),nowrap=computed.whiteSpace.includes('nowrap');
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),lines=[];
      for(let node;node=walker.nextNode();){
        if(!visible(node.parentElement))continue;
        for(let offset=0;offset<node.textContent.length;offset++){
          const char=node.textContent[offset];if(/\\s/.test(char))continue;
          const range=document.createRange();range.setStart(node,offset);range.setEnd(node,offset+1);
          const r=range.getBoundingClientRect();if(!r.width||!r.height||r.right<sr.left||r.left>sr.right||r.bottom<sr.top||r.top>sr.bottom)continue;
          const cx=(r.x+r.width/2-sr.x)/scale,cy=(r.y+r.height/2-sr.y)/scale;
          const x=cos*cx+sin*cy,y=-sin*cx+cos*cy;
          let line=nowrap?lines[0]:lines.find(line=>Math.abs(line.y-y)<1);if(!line){line={y,chars:[]};lines.push(line);}line.chars.push({char,x});
        }
      }
      const rendered=lines.sort((a,b)=>a.y-b.y).map(line=>({y:line.y,text:line.chars.sort((a,b)=>a.x-b.x).map(c=>c.char).join('')}));
      const selector=root.id?'#'+root.id:root.tagName.toLowerCase()+'.'+[...root.classList].join('.');
      rows.push({selector,text:root.innerText||root.textContent,lines:rendered,badLines:rendered.filter(line=>/^[·→]/.test(line.text)),cumulativeRotationRadians:angle,whiteSpace:computed.whiteSpace,typography:{fontSize:computed.fontSize,letterSpacing:computed.letterSpacing,lineHeight:computed.lineHeight,color:computed.color}});
    }return rows;
  })()`;
  try {
    const page=await browser.newPage();await page.viewport(...plan.viewport,1);
    let activeId=null,activeT=null;
    page.on('Runtime.exceptionThrown',event=>result.errors.push({id:activeId,t:activeT,error:event.exceptionDetails?.exception?.description||event.exceptionDetails?.text}));
    for(const target of runPlans) {
      activeId=target.id;activeT=null;
      const observed=new Map(),pageResult={id:target.id,url:target.url,planned:target.times.length,completed:0,observedTexts:[]};
      result.pages.push(pageResult);
      try {
        await page.goto(target.url,60000);await page.send('Page.bringToFront');await page.waitFor('window.__motion',30000);await page.eval('Promise.resolve(__motion.ready).then(()=>true)',120000);await page.eval('__motion.pause()');
        const renderer=await page.eval(`(()=>{const gl=window.__map?.painter?.context?.gl;if(!gl)return null;const extension=gl.getExtension('WEBGL_debug_renderer_info');return extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);})()`);
        result.renderers.push({id:target.id,renderer});
      for(const t of target.times){
        activeT=t;
        try {
        const frame=await page.eval(`(async()=>{await __motion.seek(${t});await new Promise(resolve=>requestAnimationFrame(resolve));return {time:__motion.time,rows:${probe}};})()`,60000);
        if(Math.abs(frame.time-t)>.000001)throw new Error(`Requested ${t}, DOM timeline is ${frame.time}`);
        const rows=frame.rows,found=[];
        result.samples.push({id:target.id,t,actualT:frame.time,parts:rows.length});pageResult.completed++;
        for(const row of rows) {
          const key=row.selector+'|'+row.text;
          const known=observed.get(key);
          if(known)known.lastT=t;else observed.set(key,{selector:row.selector,text:row.text,lines:row.lines,typography:row.typography,firstT:t,lastT:t});
        }
        const subtitle=rows.find(row=>row.selector==='p.it-sub');
        if(subtitle&&['map-pilgrimage','vertical-title-blur'].includes(target.id)) {
          const entry={id:target.id,t,...subtitle,matchesGivenLines:JSON.stringify(subtitle.lines.map(line=>line.text))===JSON.stringify(['SHANGHAI→KANSAI','KYOTO·NARA·OSAKA','10.01–10.03'])};
          result.subtitleChecks.push(entry);
          if(!entry.matchesGivenLines)found.push({...entry,issue:'subtitle-lines-differ-from-given-three-lines'});
        }
        found.push(...rows.filter(row=>row.badLines.length).map(row=>({id:target.id,t,...row,issue:'separator-at-visible-line-start'})));
        if(found.length) {
          const screenshot=`${outputDir}/${target.id}/portrait-${t}.png`;
          const captured=found.map(finding=>({...finding,url:target.url,actualT:frame.time,screenshot,screenshotSaved:false}));
          result.findings.push(...captured);
          await page.screenshot(screenshot);
          captured.forEach(finding=>finding.screenshotSaved=true);
        }
        }catch(error){result.errors.push({id:target.id,t,url:target.url,error:error.message});}
        if(pageResult.completed>0&&pageResult.completed%25===0){pageResult.observedTexts=[...observed.values()];save();console.log(`${target.id}: ${pageResult.completed}/${target.times.length}, t=${t}, findings=${result.findings.length}`);}
      }
      }catch(error){result.errors.push({id:target.id,url:target.url,error:error.message});}
      pageResult.observedTexts=[...observed.values()];save();
      fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：竖屏分隔符审查${target.id}完成${pageResult.completed}/${target.times.length}采样，发现仅记录未改文案；清单已保存。\n`);
      console.log(`${target.id}: ${pageResult.completed}/${target.times.length} portrait samples; findings ${result.findings.filter(f=>f.id===target.id).length}`);
    }
  }finally{
    await browser.close();result.ended=new Date().toISOString();
    save();
  }
  if(recheck) {
    const key=row=>`${row.id}:${row.t}`;
    const completed=new Set(result.samples.map(key));
    const samples=new Map(recheck.samples.map(row=>[key(row),row]));
    result.samples.forEach(row=>samples.set(key(row),row));
    const merged={...recheck,ended:result.ended,lineNormalization:result.lineNormalization,geometryRecheck:{file:resultFile,started:result.started,ended:result.ended,samples:result.samples.length,reason:'The earlier screen-y grouping falsely split rotated stamp/note text into one-character lines.'},samples:[...samples.values()],findings:[...recheck.findings.filter(row=>!completed.has(key(row))),...result.findings],errors:[...recheck.errors,...result.errors]};
    for(const page of result.pages) {
      const previous=merged.pages.find(p=>p.id===page.id);
      const observed=new Map(previous.observedTexts.map(row=>[row.selector+'|'+row.text,row]));
      for(const row of page.observedTexts){const old=observed.get(row.selector+'|'+row.text);observed.set(row.selector+'|'+row.text,{...row,firstT:Math.min(old?.firstT??row.firstT,row.firstT),lastT:Math.max(old?.lastT??row.lastT,row.lastT)});}
      previous.observedTexts=[...observed.values()];
    }
    fs.writeFileSync(outputDir+'/result.json',JSON.stringify(merged,null,2)+'\n');
  }
  console.log(JSON.stringify({samples:result.samples.length,findings:result.findings.length,errors:result.errors.length}));
  if(result.findings.length||result.errors.length)process.exitCode=1;
}
