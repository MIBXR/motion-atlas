import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';
const browser = await launch({width:390,height:844});
const tag=process.argv[2]||'final';
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/lab.html');
  await page.waitFor('window.__lab');
  const results=[];
  for(const id of ['offsetV','strengthV','durV','stagV']) {
    if(!await page.eval(`!!document.getElementById('${id}')`))continue;
    await page.eval(`(() => {const e=document.getElementById('${id}'),r=e.getBoundingClientRect();scrollTo({top:scrollY+r.y-(innerHeight-40),behavior:'instant'});})()`);
    await page.eval('new Promise(r=>setTimeout(r,250))');
    const state=await page.eval(`(() => {const e=document.getElementById('${id}'),a=e.getBoundingClientRect(),b=document.querySelector('.to-top').getBoundingClientRect();return {id:'${id}',scrollY,overlap:a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top,buttonShown:document.querySelector('.to-top').classList.contains('show'),readout:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},button:{left:b.left,right:b.right,top:b.top,bottom:b.bottom}}})()`);
    results.push(state);
    await page.screenshot(`dev/shots/T13/site/lab-readout-${tag}-${id}.png`);
  }
  fs.writeFileSync(`dev/shots/T13/site/lab-overlap-${tag}.json`,JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results));
  const p=await page.eval(`(() => {const r=document.querySelector('.to-top').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});
  await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});
  await page.waitFor('scrollY===0');
  console.log('回顶按钮真实点击通过');
  if(results.some(x=>x.buttonShown&&x.overlap))process.exitCode=1;
}finally {await browser.close();}
