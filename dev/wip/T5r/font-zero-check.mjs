import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';
const browser = await launch({ width: 1280, height: 720 });
const result = { points: [], errors: [] };
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', event => result.errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  await page.goto('http://localhost:4323/demos/cases/archive-os/index.html?render=1&orient=landscape', 120000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('__motion.ready.then(()=>true)', 120000);
  for (const time of [22,50,64.1]) {
    await page.eval(`__motion.seek(${time})`,60000);
    const text = await page.eval(`(() => {
      const iframe=document.querySelector('iframe'),doc=iframe.contentDocument,win=doc.defaultView,out=[];
      const opacityOf=element=>{let opacity=1;for(let node=element;node;node=node.parentElement)opacity*=parseFloat(win.getComputedStyle(node).opacity);return opacity;};
      const box=rect=>({x:rect.x,y:rect.y,width:rect.width,height:rect.height});
      for(const element of doc.querySelectorAll('*')) {
        const style=win.getComputedStyle(element),rect=element.getBoundingClientRect();
        if(parseFloat(style.fontSize)>0||style.display==='none'||style.visibility!=='visible'||rect.width<1||rect.height<1||rect.right<=0||rect.left>=win.innerWidth||rect.bottom<=0||rect.top>=win.innerHeight||opacityOf(element)<.05)continue;
        for(const node of element.childNodes)if(node.nodeType===3&&node.textContent.trim()) {
          const range=doc.createRange();range.selectNodeContents(node);
          out.push({tag:element.tagName,id:element.id,className:element.className,text:node.textContent.trim(),fontSize:style.fontSize,elementRect:box(rect),textRect:box(range.getBoundingClientRect()),textRects:[...range.getClientRects()].map(box)});
        }
      }
      return out;
    })()`);
    result.points.push({time,text});
  }
} finally {
  await browser.close();
  fs.writeFileSync('dev/shots/T5r/font-zero.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}
