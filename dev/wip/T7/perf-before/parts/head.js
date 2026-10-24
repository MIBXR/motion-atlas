(() => {
  'use strict';
  const MK=MotionKit,C=window.CONFIG,E=MK.ease,{clamp,lerp}=MK;
  const seg=(t,start,duration,ease=E.linear)=>ease(clamp((t-start)/duration,0,1));
  const $=(s,r=document)=>r.querySelector(s);
  const brand=()=>`<div class="brand" aria-hidden="true">${C.brand.map(c=>`<i style="background:${c}"></i>`).join('')}</div>`;
  const paths={
    gear:'M20 4h8l2 7 6 3 7-2 4 7-5 5v7l5 5-4 7-7-2-6 3-2 7h-8l-2-7-6-3-7 2-4-7 5-5v-7l-5-5 4-7 7 2 6-3zM32 27a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    crystal:'M24 3 40 17 33 43H15L8 17zM24 3v40M8 17h32M15 43l9-26 9 26',box:'M5 13 24 4l19 9v25l-19 9-19-9zM5 13l19 10 19-10M24 23v24',
    module:'M8 8h32v32H8zM16 16h16v16H16zM16 2v6M32 2v6M16 40v6M32 40v6M2 16h6M2 32h6M40 16h6M40 32h6',can:'M12 11q12-10 24 0v28q-12 9-24 0zM12 11q12 10 24 0M12 32q12 10 24 0',
    close:'M12 12l24 24M36 12 12 36',warehouse:'M4 20 24 4l20 16v24H4zM16 44V26h16v18',chevrons:'M6 12l12 12L6 36M24 12l12 12-12 12',check:'M8 25 19 36 41 12',arrow:'M6 24h34M27 11l13 13-13 13',copy:'M17 5h25v29H17zM8 14H5v29h25v-3',rotate:'M10 18a16 16 0 1 1 0 16M10 7v13h13',
    power:'M26 3 12 27h12l-3 18 17-26H25z',flame:'M26 3c0 14 14 18 14 29a16 16 0 0 1-32 0c0-9 9-13 10-23l8 10z',plant:'M24 44V23M24 31C5 33 5 12 7 8c20-2 20 19 17 23zM24 24C24 5 40 5 43 7c0 19-19 17-19 17z',belt:'M4 12h40v24H4zM10 18l6 6-6 6M23 18l6 6-6 6M36 18l6 6-6 6',splitter:'M5 24h16V10h20M21 24v14h20M33 3l8 7-8 7M33 31l8 7-8 7',core:'M24 4 44 42H4zM24 12 36 36H12zM24 4v18M4 42l16-14M44 42 28 28',crusher:'M6 6h36v12L29 32v12H19V32L6 18zM12 12l8 8 8-8 8 8',diamond:'M24 4 44 24 24 44 4 24z'
  };
  function icon(name,size=48){return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path${name==='gear'?' transform="translate(2 0) scale(.9)"':''} d="${paths[name]||paths.module}"/></svg>`;}
  function roll(el,from,to,k){const a=String(from).padStart(String(to).length,'0'),b=String(to);el.innerHTML=Array.from(b,(v,i)=>`<span><b style="transform:translateY(${-clamp(k,0,1)*50}%)">${a[i]}<br>${v}</b></span>`).join('');el.setAttribute('aria-label',String(Math.round(lerp(from,to,clamp(k,0,1)))));}
