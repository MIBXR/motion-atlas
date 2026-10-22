  const plateRoot = $('#plates');
  const plates = new Map();
  stageEl.dataset.pattern = PC.id;
  let patternBar = null;
  let attributionOrient = null;
  let tl;

  function segmentAt(t) {
    let selected = PC.segments[0];
    for (const segment of PC.segments) if (t >= segment.start) selected = segment;
    return selected;
  }
  function caseTime(t) {
    const s = segmentAt(t), p = clamp((t-s.start)/s.duration);
    return +lerp(s.from,s.to,s.mode === 'drag' ? ease.inOutCubic(p) : p).toFixed(6);
  }
  function platePath(segment, orient = O) {
    return segment.plate == null ? null : `plates/${orient}-${segment.plate}-${segment.layers.replaceAll(',','-')}.webp`;
  }
  function maskPattern() {
    stageEl.appendChild(el.attrib);
    attributionOrient = null;
    const hud = ['corner-hud','day-night-flip','seekable-timeline'].includes(PC.id);
    const allowed = new Set(['plates','grain']);
    if (isLive) allowed.add('map');
    if (PC.id === 'day-night-flip') allowed.add('wash');
    if (hud) ['hudgfx'].forEach(id=>allowed.add(id));
    if (PC.id === 'collect-counter') ['badge','hudgfx'].forEach(id=>allowed.add(id));
    if (PC.id === 'seekable-timeline') ['cards','geo','badge'].forEach(id=>allowed.add(id));
    if (PC.id === 'vertical-title-blur') ['intro','loc','flashback','outro'].forEach(id=>allowed.add(id));
    if (PC.id === 'card-expand-fullscreen') ['cards','geo','labels'].forEach(id=>allowed.add(id));
    if (PC.id === 'chapter-frame') ['chapter','decor'].forEach(id=>allowed.add(id));
    if (PC.id === 'split-compare-stamp') allowed.add('compare');
    if (PC.id === 'alert-reroute') ['geo','labels','alert'].forEach(id=>allowed.add(id));
    if (PC.id === 'route-draw-marker') ['geo','labels'].forEach(id=>allowed.add(id));
    if (PC.id === 'outro-stat-stack') allowed.add('outro');
    for(const child of stageEl.children) {
      const keep = child === el.attrib || allowed.has(child.id) || child.classList.contains('vignette') ||
        (hud && (child.classList.contains('hud') || child.classList.contains('hud-fade') || child.classList.contains('attrib'))) ||
        (['outro-stat-stack','vertical-title-blur'].includes(PC.id) && child.classList.contains('outro-bg')) || child === patternBar;
      child.classList.toggle('pattern-off', !keep);
    }
    tagEls.forEach(tag=>tag.el.classList.add('pattern-off'));
    G.stamps.forEach(st=>st.g.classList.toggle('pattern-off',PC.id!=='collect-counter'));
    if(PC.id==='seekable-timeline') {
      $('.hud-bottom').classList.add('pattern-off');
      $('.hud-fade.bottom').classList.add('pattern-off');
      G.stepGroup.classList.add('pattern-off');
    }
    if (PC.id === 'collect-counter') {
      [...hudgfx.children].forEach(e=>e.classList.toggle('pattern-off',!e.classList.contains('stamp') && e!==G.stepGroup));
    }
    if (['card-expand-fullscreen','seekable-timeline'].includes(PC.id)) {
      const stop = PC.id==='card-expand-fullscreen' ? 'inari' : 'kix';
      cardEls.forEach(ce=>ce.el.classList.toggle('pattern-off',ce.c.stop!==stop));
      markerEls.forEach((me,i)=>{me.el.classList.toggle('pattern-off',me.m.stop!==stop || PC.id==='seekable-timeline');G.nodes[i].g.classList.toggle('pattern-off',me.m.stop!==stop || PC.id==='seekable-timeline');});
      G.heads.filter(Boolean).forEach(g=>g.classList.add('pattern-off'));
    }
  }
  function renderPlates(t) {
    const s=segmentAt(t), i=PC.segments.indexOf(s), prev=PC.segments[Math.max(0,i-1)];
    currentPlateT=s.plate;
    const alpha=i===0 ? 1 : clamp((t-s.start)/.4);
    for(const [key,img] of plates) {
      const now=key===platePath(s), before=i>0 && key===platePath(prev);
      img.style.opacity=now?(i>0 && prev.plate==null?String(alpha):'1'):before?String(1-alpha):'0';
      img.style.zIndex=now?'1':'2';
      if(now && before) {img.style.opacity='1';img.style.zIndex='1';}
      if(PC.id==='film-grain')img.style.transform=`scale(${1+.04*clamp((t-s.start)/2.5)})`;
    }
    if(PC.id==='film-grain')renderFilm(t,s,alpha);
  }
  function drawPatternMarkers(t,cam,ui,activeCard) {
    const route=PC.id==='route-draw-marker';
    const alert=PC.id==='alert-reroute' && por();
    const avoid=L.avoid;
    const saidaijiMin=S.saidaiji.minZoom,takanoharaMin=S.takanohara.minZoom;
    if(route)L.avoid=[];
    if(alert)S.saidaiji.minZoom=S.takanohara.minZoom=0;
    try {
      return drawMarkers(t,cam,ui,activeCard);
    } finally {
      if(route)L.avoid=avoid;
      if(alert) {
        S.saidaiji.minZoom=saidaijiMin;
        S.takanohara.minZoom=takanoharaMin;
      }
    }
  }
  function drawPatternAttribution(t) {
    const index=PC.segments.indexOf(segmentAt(t));
    const hidden=PC.id==='film-grain' ? index>0 : PC.id==='vertical-title-blur' && index===2;
    el.attrib.classList.toggle('pattern-attrib-hidden',hidden);
    if(PC.id==='seekable-timeline' && patternBar && attributionOrient!==O) {
      const scale=stage.scale||1,gap=por()?18:12;
      const bar=patternBar.getBoundingClientRect();
      const lineHeight=el.attrib.getBoundingClientRect().height/scale;
      const barTop=(bar.top-stageEl.getBoundingClientRect().top)/scale;
      sty(el.attrib,'top',`${barTop-gap-lineHeight}px`);
      attributionOrient=O;
    }
  }
  function drawPattern(t,{cam=cameraAt(t),night=valueAt(T.night,t),hudT=t,grainT=t,geo:drawGeo=true}={}) {
    O=stage.orient;
__CASE_CONTEXT__
    const id=PC.id;
    if(id==='vertical-title-blur') {
      drawIntro(t);drawLocTitle(t,over);drawFlashback(t,fbItem,fbVis);drawOutro(t);
    }
    if(id==='chapter-frame')drawChapter(t,ch,chDef,chK,fbVis,cmpVis);
    if(id==='split-compare-stamp')drawCompare(t,cmpItem,cmpVis);
    if(['corner-hud','day-night-flip','collect-counter','seekable-timeline'].includes(id))drawHud(hudT,cam,night,over,fbVis,cmpVis);
    if(['card-expand-fullscreen','seekable-timeline'].includes(id)) {
      const active=drawCards(t,cam,accent,chDef,expandF);
      drawMarkers(t,cam,1-over,active);drawLeader();
    }
    if(id==='outro-stat-stack')drawOutro(t);
    if(id==='alert-reroute')drawAlert(t);
    if(drawGeo && ['route-draw-marker','alert-reroute'].includes(id)) {
      drawRoutesSVG(t,cam,1-over,accent);drawPatternMarkers(t,cam,1-over,null);
    }
    drawGrain(grainT,fbVis,night,cmpVis);
    return {cam,night,accent,over,fbVis,cmpVis};
  }
  function drawGrain(t,fbVis,night,cmpVis) {
__CASE_GRAIN__
  }
  function render(t) {
    if(isLive)return renderLive(t);
    renderPlates(t);
    const caseT=PC.id==='film-grain' ? [10.4,13.5,27.56][PC.segments.indexOf(segmentAt(t))] : caseTime(t);
    const result=drawPattern(caseT,{grainT:PC.id==='film-grain'?t:caseT});
    drawPatternAttribution(t);
    if(patternBar) {
      patternBar.querySelector('input').value=String(caseT);
      patternBar.querySelector('output').textContent=`${MK.pad(caseT/60)}:${MK.pad(caseT%60)}`;
      patternBar.toggleAttribute('data-playing',tl?.playing || false);
      patternBar.querySelector('[data-act="toggle"]').setAttribute('aria-label',tl?.playing?'暂停':'播放');
    }
    return result && null;
  }
  const filmFrames=[];
  function renderFilm(t,s,alpha) {
    const index=PC.segments.indexOf(s);
    filmFrames.forEach((frame,i)=>{
      const segmentIndex=i+1;
      frame.style.opacity=segmentIndex===index?'1':segmentIndex===index-1?String(1-alpha):'0';
      frame.style.zIndex=segmentIndex===index?'1':'2';
      frame.style.transform=`scale(${1+.04*clamp((t-(segmentIndex*2.5))/2.5)})`;
    });
  }
  function buildFilm() {
    for(const [kind,style] of [['window','photo'],['kamo','illustration']]) {
      const cv=document.createElement('canvas');cv.width=W;cv.height=H;
      const source=sceneCanvas(kind,style,W,H);
      let sx=0,sy=0,sw=source.width,sh=source.height;
      if(style==='photo') {
        const card=T.cards.find(card=>card.stop==='kix'),box=L.card;
        const zoom=1.04+0.012*seg(13.5,card.t,card.until-card.t,ease.linear);
        const scale=Math.max(box.w/source.width,box.h/source.height)*zoom;
        sw=box.w/scale;sh=box.h/scale;
        sx=(source.width-sw)/2;sy=(source.height-sh)/2;
      }
      const cover=Math.max(W/sw,H/sh);
      cv.getContext('2d').drawImage(source,sx,sy,sw,sh,(W-sw*cover)/2,(H-sh*cover)/2,sw*cover,sh*cover);
      cv.className='plate';plateRoot.appendChild(cv);filmFrames.push(cv);
    }
  }
  async function preloadPlates() {
    for(const s of PC.segments)for(const orient of ['landscape','portrait']) {
      const src=platePath(s,orient);if(!src || plates.has(src))continue;
      const img=new Image();img.className='plate';img.src=src;img.dataset.orient=orient;
      await img.decode();plates.set(src,img);plateRoot.appendChild(img);
    }
    for(const [key,img] of plates)img.style.display=img.dataset.orient===O?'block':'none';
  }
  function buildSeekBar() {
    if(PC.id!=='seekable-timeline')return;
    const accent=C.palette.accent, ICON=MK.icons;
    const bar=document.createElement('div');bar.className='mk-controls';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','播放控制');
    bar.innerHTML=`
      <button type="button" data-act="toggle" aria-label="播放"><span class="mk-i mk-i-play">${ICON.play}</span><span class="mk-i mk-i-pause">${ICON.pause}</span></button>
      <button type="button" data-act="restart" aria-label="从头播放"><span class="mk-i">${ICON.restart}</span></button>
      <input type="range" min="12" max="16.6" step="0.01" value="12" aria-label="时间">
      <output></output>
      <button type="button" data-act="orient" aria-label="切换为竖屏" hidden><span class="mk-i mk-i-land">${ICON.landscape}</span><span class="mk-i mk-i-port">${ICON.portrait}</span></button>
      <button type="button" data-act="sound" aria-label="开启声音" aria-pressed="false"><span class="mk-i mk-i-on">${ICON.soundOn}</span><span class="mk-i mk-i-off">${ICON.soundOff}</span></button>`;
    const style=document.createElement('style');
    style.textContent=`__CONTROL_CSS__`+`\n.mk-controls{position:absolute!important;left:64px!important;right:64px!important;bottom:30px!important;transform:none!important;max-width:none!important}.mk-controls input{max-width:none!important}[data-orient="portrait"] .mk-controls{left:56px!important;right:56px!important;bottom:34px!important}`;
    document.head.appendChild(style);stageEl.appendChild(bar);patternBar=bar;
    const orientButton=bar.querySelector('[data-act="orient"]');
    orientButton.hidden=false;
    const syncOrient=()=>{bar.dataset.orient=O;orientButton.setAttribute('aria-label',O==='portrait'?'切换为横屏 1920×1080':'切换为竖屏 1080×1920');};
    syncOrient();stage.on('orient',syncOrient);
    A.on('change',()=>{bar.dataset.sound=A.state;const sound=bar.querySelector('[data-act="sound"]');sound.setAttribute('aria-pressed',String(A.enabled));sound.setAttribute('aria-label',A.enabled?'关闭声音':'开启声音');});
    bar.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.act==='toggle')tl.toggle();
      if(b.dataset.act==='restart'){tl.seek(0);tl.play();}
      if(b.dataset.act==='sound'){A.toggle();bar.dataset.sound=A.state;}
      if(b.dataset.act==='orient')stage.toggleOrient();
    });
    bar.querySelector('input').addEventListener('input',e=>{
      tl.pause();const v=Number(e.target.value);
      const s=PC.segments.find(s=>v>=Math.min(s.from,s.to) && v<=Math.max(s.from,s.to));
      let p=(v-s.from)/(s.to-s.from);
      if(s.mode==='drag')p=p<.5 ? Math.cbrt(p/4) : 1-Math.cbrt((1-p)/4);
      tl.seek(s.start+p*s.duration);
    });
  }
  function startPattern() {
    maskPattern();buildSeekBar();
    tl=MK.timeline({duration:PC.duration,render,markers:PC.markers});
    const scoreTask=fetch('score.json').then(r=>r.json()).then(score=>A.attach(tl,score));
    MK.preload([
      {label:'document.fonts.ready',run:()=>MK.preload.fonts()()},
      {label:'案例场景与固定底图',run:async()=>{
        MAP.scenes=true;layout(O);maskPattern();
        if(PC.id==='film-grain')buildFilm();
        if(isLive)await initPatternMap();else await preloadPlates();
        measureMarkerLabels();
      }},
      {label:'案例声音事件',run:()=>scoreTask},
    ],{timeout:120000});
    MK.expose(tl,{title:PC.id,fps:30,bpm:C.meta.bpm});
    if(PC.id!=='seekable-timeline')MK.controls(tl,{accent:C.palette.accent});
    stage.on('orient',()=>{
      maskPattern();
      if(PC.id==='film-grain') {
        filmFrames.forEach(frame=>frame.remove());filmFrames.length=0;buildFilm();
      }
      for(const img of plates.values())img.style.display=img.dataset.orient===O?'block':'none';
      tl.seek(tl.time);
    });
    MK.start(tl,{t:0,reduced:0});
  }
