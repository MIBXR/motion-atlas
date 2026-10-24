  const stageEl=$('#stage'),stage=MK.stage({root:stageEl,background:'#0b0c0d'});
  for(const[k,v]of Object.entries(C.tokens))document.documentElement.style.setProperty('--'+k,v);
  const terrain=$('#terrain'),ctx=terrain.getContext('2d'),flow=$('#flow'),fx=flow.getContext('2d'),world=$('#world'),hud=$('#hud');
  const machines=[
    {id:'core',name:'协议核心',x:520,y:430,w:256,h:256,icon:'core'},
    {id:'furnace',name:'精炼炉',x:300,y:700,w:128,h:128,icon:'flame',wake:19},
    {id:'plant',name:'种植机',x:300,y:900,w:128,h:160,icon:'plant'},
    {id:'power',name:'供电桩',x:1560,y:520,w:96,h:96,icon:'power',wake:19.8},
    {id:'b',name:'配件机 · B',x:1460,y:700,w:128,h:128,icon:'gear',wake:19.4},
    {id:'a',name:'配件机 · A',x:1208,y:224,w:128,h:128,icon:'gear',born:14.6},
    {id:'crusher',name:'粉碎机',x:1208,y:416,w:128,h:128,icon:'crusher',born:14.9},
    {id:'box',name:'仓储箱',x:1208,y:608,w:128,h:128,icon:'box',born:15.2}
  ];
  write($('#facilities'), "innerHTML", '<div class="boundary"></div>'+machines.map(m=>`<div class="machine" id="machine-${m.id}">${machineSVG(m)}<div class="machine-edges"></div><div class="machine-scan"></div>${m.id==='core'?'<svg class="core-arrows" viewBox="0 0 290 290" fill="var(--yellow)"><path d="m145 0 10 12h-20zM290 145l-12 10v-20zM145 290l-10-12h20zM0 145l12-10v20z"/></svg>':'<div class="zz">Z<b>z</b></div>'}<div class="machine-name"><i class="status-dot"></i>${m.name}</div></div>`).join(''));
  const machineEls=machines.map(m=>({m,el:$('#machine-'+m.id)}));
  write(hud, "innerHTML", `<div class="build-backing"></div><div class="hud-mode"><i></i><span>探索</span><span>工业</span></div><div class="resources"><div class="resource-count">${icon('diamond',20)}<span class="rolling-digits" id="resource-number"></span><span class="muted">/3460</span></div><span>100 % <span class="power">${icon('power',26)}</span></span></div><div class="build-title"><h1 class="section-title"><span class="prefix">//</span>放置蓝图</h1>${brand()}</div><div class="task"><em></em><span></span></div><div class="keys">${[['W A S D','移动镜头'],['滚轮','镜头缩放'],['R','旋转设备'],['左键','确认放置'],['ESC','取消放置']].map(([key,text],i)=>`<div class="key-row" data-row="${i}">${i===0?`<span class="move-keys">${["W","A","S","D"].map(k=>`<b>${k}</b>`).join("")}</span>`:`<b>${key}</b>`}<span>${text}</span></div>`).join('')}</div><div class="equipment-bar">${['精炼炉','配件机','粉碎机','种植机','供电桩','传送带','分流器','仓储箱'].map((n,i)=>`<div class="equipment-slot"><small>${i+1}</small>${icon(['flame','gear','crusher','plant','power','belt','splitter','box'][i],38)}<span>${n}</span></div>`).join('')}</div><div class="touch-actions">${[['rotate','旋转'],['check','确认'],['close','取消']].map(([ic,n])=>`<button aria-label="${n}">${icon(ic,34)}<span>${n}</span></button>`).join('')}</div><div class="connected"><i></i>产线已连通</div>`);
  write($('#title-scene'), "innerHTML", `<div class="title-lockup"><small>ARKNIGHTS</small><div class="title-main"><strong>ENDFIELD</strong><b>终末地</b></div></div><div class="loading"><div class="loading-top">${brand()}<span>LOADING <b id="loading-number">000</b>%</span></div><div class="loading-line"><i></i></div><p>集成工业系统可将设备的生产串联为自动化产线。</p></div>`);
  const ghostMachines=['a','crusher','box'].map(id=>machines.find(m=>m.id===id));
  write($('#ghost'), "innerHTML", `<div class="ghost-group"><svg viewBox="0 0 512 128" aria-hidden="true">${ghostMachines.map((m,i)=>`<g data-ghost-machine="${m.id}" transform="translate(${i*192} 0)">${machineSVG(m,true)}</g>`).join('')}<g stroke="var(--ghost)" stroke-width="2" fill="#2d8cff47"><path d="M128 44h64v40h-64zM320 44h64v40h-64z"/><path d="m144 52 12 12-12 12m18-24 12 12-12 12m174-24 12 12-12 12m18-24 12 12-12 12" fill="none"/></g></svg></div>`);
  const panel=createPanel($('#panel-host')),operator=createOperator($('#operator-host'));
  const blueprint=$('#blueprint-scene');
  write(blueprint, "innerHTML", `<div class="blueprint-grid"></div><div class="blueprint-plant"></div><div class="blueprint-title"><h1 class="section-title"><span class="prefix">//</span>分享蓝图</h1>${brand()}</div><aside class="blueprint-details"><h2>蓝图详情 / 默认</h2><p>尺寸 18×12</p><h3>设施清单</h3><div class="blueprint-list">${['core','gear','crusher','box','flame','power','belt','plus'].map(n=>`<div>${n==='plus'?'+2':icon(n,48)}</div>`).join('')}</div></aside><div class="blueprint-brand"><div class="wordmark">ENDFIELD</div>${brand()}</div><div class="share-dim"></div><div class="share-dialog"><h2>分享蓝图</h2><div class="share-input"><span>EF01-7KQ2-M9A3-ZT58</span><div class="copy-button" aria-label="复制分享码">${icon('copy',32)}</div></div><div class="share-buttons"><div class="capsule cancel"><span>取消</span>${icon('close',28)}</div><div class="capsule confirm"><span>确认</span>${icon('check',28)}</div></div><div class="copied">已复制</div></div>`);
  write($('#outro'), "innerHTML", `<div class="wordmark">ENDFIELD</div>${brand()}`);
  const cursor=$('#cursor'),ring=$('#press-ring'),reduced=MK.prefersReducedMotion();let layoutKey='',flowKey='';
  function mapped(x,y,p){return p?{x:60+(x-120)*4/7,y:451.714285714+(y-96)*4/7}:{x,y};}
  function machineRect(m,p){const a=mapped(m.x,m.y,p),s=p?4/7:1;if(p&&m.born){a.x-=64*s;a.y+=128*s;}return{x:a.x-m.w*s/2,y:a.y-m.h*s/2,w:m.w*s,h:m.h*s};}
  function makeTerrain(p) {
    const w=p?1080:1920,h=p?1920:1080;
    terrain.width=flow.width=w;terrain.height=flow.height=h;
    const rand=MK.rng(713);
    ctx.fillStyle='#5f7d3a';ctx.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=48)for(let x=0;x<w;x+=48){
      const g=ctx.createRadialGradient(x,y,0,x,y,100);
      g.addColorStop(0,`rgba(111,140,69,${rand()*.8})`);g.addColorStop(1,'rgba(111,140,69,0)');
      ctx.fillStyle=g;ctx.fillRect(x-100,y-100,200,200);
    }
    for(let y=-120;y<h;y+=120)for(let x=-120;x<w;x+=120){
      ctx.beginPath();
      for(let j=0;j<10;j++){const a=j*Math.PI/5,r=48+rand()*24,xx=x+60+Math.cos(a)*r,yy=y+60+Math.sin(a)*r;j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
      ctx.closePath();ctx.fillStyle=rand()>.5?'#57732f':'#7a9850';ctx.globalAlpha=.35;ctx.fill();
    }
    ctx.globalAlpha=1;
    for(let i=0;i<6;i++){
      const x=rand()*w,y=rand()*h;ctx.beginPath();
      for(let j=0;j<12;j++){const a=j/12*Math.PI*2,r=70+rand()*90,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.5;j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
      ctx.closePath();ctx.save();ctx.filter='blur(2px)';ctx.fillStyle='#8a7a5c66';ctx.fill();ctx.filter='none';ctx.clip();
      for(let k=0;k<240;k++){ctx.fillStyle=k%2?'#b09a7344':'#594d3b44';ctx.beginPath();ctx.arc(x+(rand()-.5)*320,y+(rand()-.5)*180,.6+rand()*1.5,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    for(let i=0;i<45000;i++){const x=rand()*w,y=rand()*h;ctx.strokeStyle=rand()>.5?'#c5c98a30':'#233b233a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1+rand()*3,y-2-rand()*5);ctx.stroke();}
    ctx.strokeStyle='#86a35a';ctx.lineWidth=1;
    for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32)for(let i=0;i<6;i++){const xx=x+rand()*32,yy=y+rand()*32,len=3+rand()*3,a=-Math.PI/2+(rand()-.5)*.8;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+Math.cos(a)*len,yy+Math.sin(a)*len);ctx.stroke();}
    for(let i=0;i<700;i++){ctx.fillStyle='#9a9a92';const s=2+rand()*4;ctx.globalAlpha=.3+rand()*.4;ctx.fillRect(rand()*w,rand()*h,s,s*.6);}
    ctx.globalAlpha=1;
    const beltSegments=[...conveyorPoints.slice(1).map((v,i)=>[mapBelt(...conveyorPoints[i],p),mapBelt(...v,p)]),...oldPoints.slice(1).map((v,i)=>[mapped(...oldPoints[i],p),mapped(...v,p)])];
    const blocked=(x,y,r)=>machines.some(m=>{const a=machineRect(m,p);return x>a.x-r&&x<a.x+a.w+r&&y>a.y-r&&y<a.y+a.h+r;})||beltSegments.some(([a,b])=>{const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-a.x-dx*k,y-a.y-dy*k)<(p?24*4/7:24)+r;});
    ctx.save();ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;ctx.shadowBlur=1;ctx.shadowColor='#0009';
    for(let i=0;i<40;i++){const size=6+rand()*8;let x,y;do{x=rand()*w;y=rand()*h;}while(blocked(x,y,size));ctx.fillStyle=i%2?'#a1a299':'#82877b';ctx.beginPath();ctx.moveTo(x-size*.45,y-size*.25);ctx.lineTo(x+size*.2,y-size*.4);ctx.lineTo(x+size*.5,y+size*.15);ctx.lineTo(x-size*.15,y+size*.4);ctx.closePath();ctx.fill();}
    ctx.restore();
    const b=p?{x:60,y:240,w:960,h:940}:{x:120,y:96,w:1680,h:904};
    ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;
    const ss=p?64*4/7:64;
    for(let x=b.x;x<b.x+b.w;x+=ss){ctx.beginPath();ctx.moveTo(x,b.y);ctx.lineTo(x,b.y+b.h);ctx.stroke();}
    for(let y=b.y;y<b.y+b.h;y+=ss){ctx.beginPath();ctx.moveTo(b.x,y);ctx.lineTo(b.x+b.w,y);ctx.stroke();}
    ctx.restore();ctx.fillStyle='#00000026';ctx.fillRect(0,0,w,b.y);ctx.fillRect(0,b.y+b.h,w,h-b.y-b.h);ctx.fillRect(0,b.y,b.x,b.h);ctx.fillRect(b.x+b.w,b.y,w-b.x-b.w,b.h);
    styles($('.boundary').style, {left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px'});
  }

  const conveyorPoints=[[648,430],[840,430],[840,224],[1208,224],[1208,416],[1208,608],[1208,700],[1460,700]],oldPoints=[[520,558],[520,700],[300,700]];
  function pathInfo(points){let length=0;const parts=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!len)continue;parts.push({a,b,len,start:length});length+=len;}return{parts,length};}
  const beltPath=pathInfo(conveyorPoints),oldBeltPath=pathInfo(oldPoints);
  function mapBelt(x,y,p){const a=mapped(x,y,p);if(p){if(y===224){a.x-=64*4/7*clamp((x-840)/368,0,1);a.y+=128*4/7;}else if(x===840&&y>=224&&y<=430){a.y+=128*4/7*(430-y)/206;}else if(x===1208){a.x-=64*4/7;a.y+=128*4/7*clamp((700-y)/92,0,1);}else if(y===700&&x>=1208){a.x-=64*4/7*clamp((1460-x)/252,0,1);}}return a;}
  function pointAt(path,dist,wrap=true){const d=wrap?((dist%path.length)+path.length)%path.length:clamp(dist,0,path.length),s=path.parts.find(v=>d<=v.start+v.len)||path.parts.at(-1),k=(d-s.start)/s.len;return{x:lerp(s.a[0],s.b[0],k),y:lerp(s.a[1],s.b[1],k),angle:Math.atan2(s.b[1]-s.a[1],s.b[0]-s.a[0])};}
  function roundedPath(points,radius){
    const verts=[points[0]];
    for(let i=1;i<points.length-1;i++){
      const a=points[i-1],b=points[i],c=points[i+1],u=Math.hypot(b[0]-a[0],b[1]-a[1]),v=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(radius,u/2,v/2);
      const start=[b[0]-(b[0]-a[0])*r/u,b[1]-(b[1]-a[1])*r/u],end=[b[0]+(c[0]-b[0])*r/v,b[1]+(c[1]-b[1])*r/v];
      verts.push(start);
      for(let j=1;j<=16;j++){const k=j/16,z=1-k;verts.push([z*z*start[0]+2*z*k*b[0]+k*k*end[0],z*z*start[1]+2*z*k*b[1]+k*k*end[1]]);}
    }
    verts.push(points.at(-1));return pathInfo(verts);
  }
  function trace(path,from,to,context=fx){
    context.beginPath();let started=false;
    for(const s of path.parts){const a=Math.max(from,s.start),b=Math.min(to,s.start+s.len);if(a>=b)continue;const k=(a-s.start)/s.len,j=(b-s.start)/s.len,x=lerp(s.a[0],s.b[0],k),y=lerp(s.a[1],s.b[1],k);if(!started){context.moveTo(x,y);started=true;}context.lineTo(lerp(s.a[0],s.b[0],j),lerp(s.a[1],s.b[1],j));}
    context.stroke();
  }
  function drawBelt(t,p,path,building=false,map=mapBelt){
    const s=p?4/7:1,key=p?'portrait':'landscape';
    path.curves??={};
    if(!path.curves[key]){const verts=path.parts.map(v=>v.a).concat([path.parts.at(-1).b]).map(([x,y])=>{const a=map(x,y,p);return[a.x,a.y];});path.curves[key]=roundedPath(verts,20*s);}
    const shape=path.curves[key],n=Math.ceil(path.length/64),ranges=[];
    if(!building||t>=18.5)ranges.push([0,shape.length]);
    else for(let i=0;i<n;i++){const a=i*64/path.length*shape.length,b=Math.min((i+1)*64,path.length)/path.length*shape.length,k=seg(t,16+i*(2.5-.12)/(n-1),.12);if(k>0){ranges.push([a,a+(b-a)*k/2],[b-(b-a)*k/2,b]);}}
    fx.save();fx.lineJoin='round';fx.lineCap='butt';
    if(!building||t>=18.5){
      if(!shape.body){const canvas=document.createElement('canvas');canvas.width=p?1080:1920;canvas.height=p?1920:1080;const paint=canvas.getContext('2d');paint.lineJoin='round';paint.lineCap='butt';for(const[color,width]of[['#8a5a0e',48],['#f2a51c',40]]){paint.strokeStyle=color;paint.lineWidth=width*s;trace(shape,0,shape.length,paint);}shape.body=canvas;}
      fx.drawImage(shape.body,0,0);
    }else for(const[color,width]of[['#8a5a0e',48],['#f2a51c',40]]){fx.strokeStyle=color;fx.lineWidth=width*s;for(const[a,b]of ranges)trace(shape,a,b);}
    const move=t>=18.5?(t-18.5)*80*s:0;
    for(let d=0;d<shape.length;d+=32*s){const pos=((d+move)%shape.length+shape.length)%shape.length;if(building&&t<18.5&&!ranges.some(([a,b])=>pos>=a&&pos<=b))continue;const a=pointAt(shape,pos);fx.save();fx.translate(a.x,a.y);fx.rotate(a.angle);fx.strokeStyle='#fff';fx.lineWidth=3*s;fx.beginPath();fx.moveTo(-7*s,-7*s);fx.lineTo(7*s,0);fx.lineTo(-7*s,7*s);fx.stroke();fx.restore();}
    if(t>=18.5)for(let d=0;d<shape.length;d+=40*s){const a=pointAt(shape,d+move);fx.fillStyle='#f7f7f5';fx.strokeStyle='#17191b';fx.lineWidth=2*s;fx.beginPath();fx.arc(a.x,a.y,12*s,0,Math.PI*2);fx.fill();fx.stroke();fx.strokeRect(a.x-4*s,a.y-4*s,8*s,8*s);}
    fx.restore();
  }

  function blueprintLayout(p){const plant=$('.blueprint-plant');write(plant, "innerHTML", '<svg class="paper-belts" width="100%" height="100%" style="position:absolute;inset:0" aria-hidden="true"></svg>');for(const m of machines){const r=machineRect(m,p);plant.insertAdjacentHTML('beforeend',`<div class="blueprint-machine" data-id="${m.id}" style="left:${r.x}px;top:${r.y-(p?70:0)}px;width:${r.w}px;height:${r.h}px">${icon(m.icon,48)}<span class="blueprint-name">${m.name}</span></div>`);}const make=(points,map)=>points.map(([x,y],i)=>{const a=map(x,y,p);return`${i?'L':'M'}${a.x} ${a.y-(p?70:0)}`;}).join(' '),d=make(conveyorPoints,mapBelt)+' '+make(oldPoints,mapped),v=mapBelt(840,430,p);write($('.paper-belts'), "innerHTML", `<path d="${d}" fill="none" stroke="#ffe400" stroke-width="${p?23:40}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#574b1c99" stroke-width="3" stroke-dasharray="1 15"/><g transform="translate(${v.x} ${v.y-(p?70:0)})"><rect x="-20" y="-20" width="40" height="40" fill="#303337"/><path d="M-10 0H10M2-8l8 8-8 8" fill="none" stroke="white" stroke-width="2"/></g>`);}
  function ghostPosition(t,p){const a=p?{x:540,y:900}:{x:960,y:540},b=p?{x:640,y:720}:{x:1180,y:420},c=p?{x:603.636,y:1020}:{x:1100,y:620},d=p?{x:626.364,y:660}:{x:1150,y:380},k=seg(t,10.6,1.8,E.inOutCubic),u=1-k;return{x:u*u*u*a.x+3*u*u*k*c.x+3*u*k*k*d.x+k*k*k*b.x,y:u*u*u*a.y+3*u*u*k*c.y+3*u*k*k*d.y+k*k*k*b.y};}
  function springGhost(t,p){const dt=1/120;let pos=ghostPosition(10.6,p),vx=0,vy=0;for(let u=10.6;u<t;u+=dt){const h=Math.min(dt,t-u),a=ghostPosition(u+h,p);vx+=(180*(a.x-pos.x)-22*vx)*h;vy+=(180*(a.y-pos.y)-22*vy)*h;pos={x:pos.x+vx*h,y:pos.y+vy*h};}return pos;}
  function moveBezier(a,b,k){const s=E.inOutCubic(clamp(k,0,1)),u=1-s,c={x:lerp(a.x,b.x,.45),y:a.y},d={x:lerp(a.x,b.x,.6),y:b.y};return{x:u*u*u*a.x+3*u*u*s*c.x+3*u*s*s*d.x+s*s*s*b.x,y:u*u*u*a.y+3*u*u*s*c.y+3*u*s*s*d.y+s*s*s*b.y};}
  function cursorAt(t,p){const a=machineRect(machines[5],p),ac={x:a.x+a.w/2,y:a.y+a.h/2},pt=panel.targets(p),ot=operator.targets(p),rotate=p?{x:984,y:1332}:ghostPosition(12.4,p),confirm=p?{x:984,y:1468}:ghostPosition(12.4,p);let point=ghostPosition(Math.min(t,12.4),p);const pop=Math.min(seg(t,50,.4,E.outCubic),1-seg(t,53.2,.4,E.inOutCubic)),mid=p?960:540;const copy={x:p?875:1291,y:mid+((p?878:498)-mid)*pop},accept={x:p?540:1112,y:mid+((p?1064:602)-mid+(t>=53&&t<53.12?2:0))*pop};const route=[{a:12.4,b:13,end:rotate},{a:13.1,b:13.6,end:ghostPosition(12.4,p)},{a:13.8,b:14.4,end:confirm},{a:24,b:24.8,end:ac},{a:31.5,b:32,end:pt.collect},{a:34.5,b:35,end:pt.close},{a:39,b:39.4,end:ot.upgrade},{a:51.2,b:51.6,end:copy},{a:52.6,b:53,end:accept}];for(const r of route){if(t<r.a)break;point=moveBezier(point,r.end,(t-r.a)/(r.b-r.a));}return point;}
  function render(t){
    const p=stage.portrait,w=stage.width,h=stage.height;if(layoutKey!==String(p)){makeTerrain(p);flowKey='';blueprintLayout(p);layoutKey=String(p);}
    const mode=seg(t,5,.25,E.outBack);write(node('.hud-mode i').style, "transform", `translateX(${mode*(p?146:106)}px)`);write(node('.hud-mode span').style, "color", t<5?'#17191b':'#f7f7f5');write(node('.hud-mode span:nth-of-type(2)').style, "color", t>=5?'#17191b':'#f7f7f5');
    const cam=reduced?1:t<6?lerp(1.08,1,seg(t,4,2,E.outCubic)):lerp(1,.86,seg(t,56.6,2.4,E.inOutSine));write(world.style, "transform", `scale(${cam})`);write(world.style, "opacity", String(reduced?Math.min(seg(t,4,2,E.outCubic),1-seg(t,56.6,2.4,E.inOutSine)):1));const panelAmount=Math.min(seg(t,25,p?.4:.5,E.outCubic),1-seg(t,35,.5,E.outCubic));write(world.style, "filter", panelAmount>0?`blur(${panelAmount*4}px)`:'none');
    const nextFlowKey=String(p)+(t>=13.6&&t<14||t>=16?t:'idle');
    const center=machineRect(machines[6],p),snap={x:center.x+center.w/2,y:center.y+center.h/2};
    if(flowKey!==nextFlowKey){
    fx.clearRect(0,0,w,h);drawBelt(t,p,oldBeltPath,false,mapped);if(t>=16)drawBelt(t,p,beltPath,true);if(t>=13.6&&t<14){fx.fillStyle=`rgba(45,140,255,${.25*(1-seg(t,13.6,.4))})`;const ss=p?4/7:1;for(let y=-4;y<4;y++)for(let x=-1;x<1;x++)fx.fillRect(snap.x+x*64*ss,snap.y+y*64*ss,64*ss-1,64*ss-1);}
    flowKey=nextFlowKey;
    }
    for(const{m,el}of machineEls){const r=machineRect(m,p),age=t-(m.born??-100),born=m.born?clamp(age,0,1):1;styles(el.style, {left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px',visibility:age<0?'hidden':'visible',background:age<.8?'transparent':'#2a2d31',borderColor:age<.8?'transparent':'#4a4e53'});write(node('.machine-svg',el).style, "clipPath", m.born&&age<.8?`inset(0 0 ${100*(1-seg(t,m.born+.4,.4))}% 0)`:'none');write(node('.machine-edges',el).style, "opacity", m.born&&age<.8?'1':'0');write(node('.machine-edges',el).style, "clipPath", `inset(0 ${100*(1-seg(t,m.born??0,.4))}% 0 0)`);write(node('.machine-scan',el).style, "opacity", m.born&&age>=.4&&age<.8?'1':'0');write(node('.machine-scan',el).style, "top", 100*seg(t,(m.born??0)+.4,.4)+'%');const active=t>=(m.wake??(m.born?m.born+1:Infinity));write(node('.status-dot',el).style, "display", active?'block':'none');write(node('.machine-name',el).style, "opacity", String(p?(m.born?Math.min(seg(t,m.born,.2),1-seg(t,m.born+1.4,.3)):0):born));if(m.id!=='core'){const zz=node('.zz',el),wake=seg(t,m.wake??Infinity,.4);write(zz.style, "opacity", m.born?'0':String((.8+.2*Math.sin(t*Math.PI*2/1.6))*(1-wake)));write(zz.style, "transform", `translateY(${-24*wake}px)`);}const wr=node('.work-ring',el);write(wr.style, "opacity", active?'1':'0');write(wr.style, "transformOrigin", `${m.w/2}px ${m.h/2}px`);write(wr.style, "transform", `rotate(${active?t*90:0}deg)`);write(node('.corner-marks',el).style, "transformOrigin", `${m.w/2}px ${m.h/2}px`);write(node('.corner-marks',el).style, "transform", m.born?`scale(${seg(t,m.born+.8,.2,E.outBack)})`:'none');renderMachineDetails(m,el,t,active,false,p);}
    const g=node('.ghost-group'),gp=springGhost(Math.min(t,13.6),p),sn=seg(t,13.6,.12,E.outCubic),ss=p?4/7:1;styles(g.style, {left:lerp(gp.x,snap.x,sn)+'px',top:lerp(gp.y,snap.y,sn)+'px',transform:`translate(-50%,-50%) scale(${ss}) rotate(${90*seg(t,13,.25,E.outCubic)}deg)`,opacity:t>=10.6&&t<14.5?'1':'0',filter:t>=14.4?'brightness(8)':'none'});
    ghostMachines.forEach(m=>renderMachineDetails(m,node('[data-ghost-machine="'+m.id+'"]'),t,false,true));
    write(node('.hud-mode').style, "opacity", String(seg(t,4.6,.3,E.outCubic)));const res=node('.resources'),rin=seg(t,5.4,.3,E.outCubic);write(res.style, "opacity", String(rin));write(res.style, "marginTop", (1-rin)*-20+'px');roll(node('#resource-number'),2065,2214,seg(t,20,3,E.outQuad));const bi=seg(t,10,.3,E.outCubic);write(node('.build-title').style, "opacity", String(bi));write(node('.build-title').style, "transform", `translateX(${-40*(1-bi)}px)`);write(node('.task').style, "top", (p?182:112)+(t>=10?64:0)+'px');write(node('.task').style, "opacity", String(seg(t,6.6,.3)));write(node('.build-backing').style, "opacity", String(seg(t,6.6,.3)));write(node('.task em'), "innerHTML", t>=22.5?icon('check',p?28:20):'<svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="currentColor"/></svg>');write(node('.task em').style, "color", t>=22.5?'var(--ok)':'var(--yellow)');write(node('.task span'), "textContent", `搭建一条配件产线　${t>=22.5?'1/1':'0/1'}`);
    nodeList('.key-row').forEach((row,i)=>{const k=seg(t,5.8+i*.06,.3,E.outCubic);write(row.style, "opacity", String(k));write(row.style, "transform", `translateX(${(1-k)*40}px)`);node('b',row).classList.toggle('active',(i===2&&t>=13&&t<13.2)||(i===3&&t>=14.4&&t<14.6));});const bar=seg(t,6.2,.35,E.outCubic);write(node('.equipment-bar').style, "marginBottom", (1-bar)*-60+'px');write(node('.equipment-bar').style, "opacity", String(bar));nodeList('.equipment-slot').forEach((el,i)=>el.classList.toggle('selected',i===1&&t>=10.3));nodeList('.touch-actions button').forEach((b,i)=>{const at=i===0?13:i===1?14.4:-100;write(b.style, "transform", `scale(${t>=at&&t<at+.1?.92:1})`);write(b.style, "background", t>=at&&t<at+.2?'#e9c500':'var(--panel)');});write(node('.touch-actions').style, "opacity", String(seg(t,5.8,.3)));const connected=Math.min(seg(t,22.8,.2,E.outBack),1-seg(t,23.8,.2));write(node('.connected').style, "opacity", String(connected));write(node('.connected').style, "scale", String(.9+.1*connected));write(hud.style, "opacity", String(1-seg(t,56.6,.4)));write(hud.style, "visibility", t<36||t>=48?'visible':'hidden');
    write(node('#title-scene').style, "visibility", t<3.7?'visible':'hidden');const ti=seg(t,.4,.6,E.outCubic);write(node('.title-lockup').style, "opacity", String(ti));write(node('.title-lockup').style, "marginTop", (1-ti)*24+'px');const load=seg(t,1,2.4,E.inOutSine);write(node('#loading-number'), "textContent", String(Math.round(load*100)).padStart(3,'0'));write(node('.loading-line i').style, "width", load*100+'%');
    panel.render(clamp(t,24.9,35.5),p,machineRect(machines[5],p));operator.render(clamp(t,36,48.3),p);write(operator.root.style, "visibility", t>=36.4&&t<48.3?'visible':'hidden');const bp=Math.min(seg(t,49,.6,E.outCubic),1-seg(t,56,.6));write(blueprint.style, "opacity", String(bp));write(blueprint.style, "visibility", t>=49&&t<56.6?'visible':'hidden');const pop=Math.min(seg(t,50,.4,E.outCubic),1-seg(t,53.2,.4,E.inOutCubic));write(node('.share-dim').style, "opacity", String(pop));write(node('.share-dialog').style, "transform", `scaleY(${pop})`);write(node('.share-dialog').style, "visibility", pop>0?'visible':'hidden');write(node('.copied').style, "opacity", t>=51.6&&t<52.4?'1':'0');write(node('.copy-button').style, "background", t>=51.6&&t<51.8?'var(--yellow)':'transparent');write(node('.capsule.confirm').style, "transform", t>=53&&t<53.12?'translateY(2px)':'none');write(node('.capsule.confirm').style, "background", t>=53&&t<53.12?'var(--yellow-deep)':'var(--yellow)');
    const cp=cursorAt(t,p);write(cursor, "innerHTML", p?'':'<svg viewBox="0 0 24 32" width="24" height="32"><path d="M2 1v25l6-7 5 11 5-2-5-10h9z" fill="white" stroke="#17191b" stroke-width="1.5"/></svg>');write(cursor.style, "left", cp.x-(p?28:0)+'px');write(cursor.style, "top", cp.y-(p?28:0)+'px');write(cursor.style, "opacity", t>=10.6&&t<56?'1':'0');const press=[13,14.4,24.9,32,35,39.4,51.6,53].find(v=>t>=v&&t<v+.3),rp=press===undefined?1:(t-press)/.3;write(ring.style, "opacity", press===undefined?'0':String(1-rp));write(ring.style, "left", cp.x-28+'px');write(ring.style, "top", cp.y-28+'px');write(ring.style, "transform", `scale(${1+rp*.6})`);
    const wipe=node('#wipe');let phase=-1,reverse=false;for(const[a,d,r]of[[3.4,.6,false],[36,.8,false],[48,.6,true]])if(t>=a&&t<a+d){phase=(t-a)/d;reverse=r;}if(phase>=0){write(wipe.style, "display", 'block');if(reduced)styles(wipe.style, {width:w+'px',height:h+'px',left:'0',top:'0',transform:'none',opacity:String(Math.sin(phase*Math.PI))});else styles(wipe.style, {width:w*.6+'px',height:h*3+'px',top:-h+'px',left:lerp(reverse?-w*1.2:w*1.6,reverse?w*1.6:-w*1.2,E.inOutCubic(phase))+'px',transform:'rotate(-28deg)',opacity:'1'});}else write(wipe.style, 'display', 'none');write(node('#outro').style, "opacity", String(seg(t,57.4,.4)));write(node('#fade').style, "opacity", String(seg(t,59.4,.6,E.inOutSine)));
  }
  MK.preload([{label:'Google Fonts',run:async()=>{await Promise.all(C.fonts.map(url=>new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=url;link.onload=resolve;link.onerror=reject;document.head.append(link);})));await Promise.all(C.fontSpecs.map(spec=>MK.preload.font(spec,'ENDFIELD 集成工业协议管理员配件机')()));await document.fonts.ready;}}]);
  const tl=MK.timeline({duration:C.duration,render,markers:C.markers});MK.audio.attach(tl,C.score);MK.expose(tl,{title:C.title});MK.controls(tl,{accent:C.tokens.yellow});MK.start(tl,{t:0,reduced:0});
})();
