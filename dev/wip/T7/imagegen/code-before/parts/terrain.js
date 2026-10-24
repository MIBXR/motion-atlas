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
    Object.assign($('.boundary').style,{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px'});
  }
