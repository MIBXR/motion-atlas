import fs from 'node:fs';
process.env.BROWSER_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const { launch } = await import('../../../scripts/lib/cdp.mjs');

const out = 'dev/shots/T5r/focus-chrome';
fs.mkdirSync(out, { recursive: true });
const browser = await launch({ width: 1920, height: 1080 });
const result = { points: [], errors: [] };
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', event => result.errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  result.browser = await page.send('Browser.getVersion');
  await page.goto('http://localhost:4323/demos/cases/archive-os/index.html?render=1&quality=original', 120000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('__motion.ready.then(() => true)', 120000);
  async function realKey(key, code, windowsVirtualKeyCode) {
    for (const type of ['keyDown','keyUp']) await page.send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode,nativeVirtualKeyCode:windowsVirtualKeyCode});
  }
  for (const time of [50, 64.1]) {
    await page.eval(`__motion.seek(${time})`, 60000);
    const focus = () => page.eval(`(() => {
      const win=document.querySelector('iframe').contentWindow, element=win.document.activeElement;
      const style=win.getComputedStyle(element), rect=element.getBoundingClientRect();
      return { tag:element.tagName,id:element.id,classes:element.className,ariaLabel:element.getAttribute('aria-label'),focused:element.matches(':focus'),focusVisible:element.matches(':focus-visible'),outline:style.outline,outlineWidth:style.outlineWidth,outlineStyle:style.outlineStyle,outlineColor:style.outlineColor,boxShadow:style.boxShadow,rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},stats:win.__filmApp.stats() };
    })()`);
    const baseline = await focus();
    await page.eval(`document.querySelector('iframe').contentWindow.focus()`);
    await realKey('a','KeyA',65);
    const before = await focus();
    await page.screenshot(`${out}/${time}-before.png`);
    const invocation = await page.eval(`(() => {
      const win=document.querySelector('iframe').contentWindow, element=win.document.activeElement;
      let optionRead=false;
      element.focus({preventScroll:true,get focusVisible(){optionRead=true;return false;}});
      return {optionRead,sameActiveElement:element===win.document.activeElement,focusVisible:element.matches(':focus-visible')};
    })()`);
    const after = await focus();
    await page.screenshot(`${out}/${time}-after.png`);
    let refocus;
    if (after.focusVisible) {
      refocus = await page.eval(`(() => {
        const win=document.querySelector('iframe').contentWindow, element=win.document.activeElement;
        element.blur();element.focus({preventScroll:true,focusVisible:false});
        return {sameActiveElement:element===win.document.activeElement,focusVisible:element.matches(':focus-visible'),outline:win.getComputedStyle(element).outline};
      })()`);
      await page.screenshot(`${out}/${time}-refocus.png`);
    }
    const keyboardBefore=await focus();
    await realKey(time===50?'+':'ArrowDown',time===50?'Equal':'ArrowDown',time===50?187:40);
    await new Promise(resolve=>setTimeout(resolve,250));
    const keyboardAfter=await focus();
    const keyboard={key:time===50?'+':'ArrowDown',sameFocusTarget:keyboardAfter.tag===keyboardBefore.tag&&keyboardAfter.id===keyboardBefore.id,before:{selected:keyboardBefore.stats.selected,requestedDistance:keyboardBefore.stats.viewer?.requestedDistance},after:{selected:keyboardAfter.stats.selected,requestedDistance:keyboardAfter.stats.viewer?.requestedDistance},focusVisible:keyboardAfter.focusVisible};
    result.points.push({time,baseline,before,invocation,after,refocus,keyboard});
  }
} catch(error) {
  result.error=error.stack||error.message;
  process.exitCode=1;
} finally {
  await browser.close();
  fs.writeFileSync(`${out}/result.json`,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({browser:result.browser,errors:result.errors,error:result.error,points:result.points.map(point=>({time:point.time,tag:point.before.tag,id:point.before.id,baseline:{focusVisible:point.baseline.focusVisible,outline:point.baseline.outline},before:{focusVisible:point.before.focusVisible,outline:point.before.outline},invocation:point.invocation,after:{focusVisible:point.after.focusVisible,outline:point.after.outline},refocus:point.refocus,keyboard:point.keyboard}))},null,2));
}
