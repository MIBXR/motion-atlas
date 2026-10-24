import fs from 'node:fs';
const { launch } = await import(process.argv[3] || '../../../scripts/lib/cdp.mjs');
const browser=await launch();
const rows=[];
try {
  for(let i=0;i<30;i++) {
    const page=await browser.newPage();
    await page.goto('http://localhost:4321/demos/patterns/card-expand-fullscreen/index.html?render=1');
    await page.waitFor('window.__motion');
    const ok=await Promise.race([page.send('Page.close').then(()=>true),new Promise(r=>setTimeout(()=>r(false),1500))]);
    rows.push({i,ok,closed:page.ws.readyState===3});
    if(!ok)break;
  }
  const page=await browser.newPage();
  const pending=page.send('Runtime.evaluate',{expression:'new Promise(()=>{})',awaitPromise:true}).then(()=>false,error=>/页面连接已关闭/.test(error.message));
  await new Promise(r=>setTimeout(r,50));
  page.ws.close();
  const ok=await Promise.race([pending,new Promise(r=>setTimeout(()=>r(false),1500))]);
  rows.push({i:'disconnect-with-pending-command',ok,closed:page.ws.readyState===3});
}finally{await browser.close();}
const tag=process.argv[2]||'final';
fs.writeFileSync(`dev/shots/T13/cdp-close-${tag}.json`,JSON.stringify(rows,null,2)+'\n');
console.log(`${rows.filter(x=>x.ok).length}/${rows.length} close requests resolved`,JSON.stringify(rows.at(-1)));
if(rows.some(x=>!x.ok))process.exitCode=1;
