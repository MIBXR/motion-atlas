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
  function trace(path,from,to){
    fx.beginPath();let started=false;
    for(const s of path.parts){const a=Math.max(from,s.start),b=Math.min(to,s.start+s.len);if(a>=b)continue;const k=(a-s.start)/s.len,j=(b-s.start)/s.len,x=lerp(s.a[0],s.b[0],k),y=lerp(s.a[1],s.b[1],k);if(!started){fx.moveTo(x,y);started=true;}fx.lineTo(lerp(s.a[0],s.b[0],j),lerp(s.a[1],s.b[1],j));}
    fx.stroke();
  }
  function drawBelt(t,p,path,building=false,map=mapBelt){
    const s=p?4/7:1,key=p?'portrait':'landscape';
    path.curves??={};
    if(!path.curves[key]){const verts=path.parts.map(v=>v.a).concat([path.parts.at(-1).b]).map(([x,y])=>{const a=map(x,y,p);return[a.x,a.y];});path.curves[key]=roundedPath(verts,20*s);}
    const shape=path.curves[key],n=Math.ceil(path.length/64),ranges=[];
    if(!building||t>=18.5)ranges.push([0,shape.length]);
    else for(let i=0;i<n;i++){const a=i*64/path.length*shape.length,b=Math.min((i+1)*64,path.length)/path.length*shape.length,k=seg(t,16+i*(2.5-.12)/(n-1),.12);if(k>0){ranges.push([a,a+(b-a)*k/2],[b-(b-a)*k/2,b]);}}
    fx.save();fx.lineJoin='round';fx.lineCap='butt';
    for(const[color,width]of[['#8a5a0e',48],['#f2a51c',40]]){fx.strokeStyle=color;fx.lineWidth=width*s;for(const[a,b]of ranges)trace(shape,a,b);}
    const move=t>=18.5?(t-18.5)*80*s:0;
    for(let d=0;d<shape.length;d+=32*s){const pos=((d+move)%shape.length+shape.length)%shape.length;if(building&&t<18.5&&!ranges.some(([a,b])=>pos>=a&&pos<=b))continue;const a=pointAt(shape,pos);fx.save();fx.translate(a.x,a.y);fx.rotate(a.angle);fx.strokeStyle='#fff';fx.lineWidth=3*s;fx.beginPath();fx.moveTo(-7*s,-7*s);fx.lineTo(7*s,0);fx.lineTo(-7*s,7*s);fx.stroke();fx.restore();}
    if(t>=18.5)for(let d=0;d<shape.length;d+=40*s){const a=pointAt(shape,d+move);fx.fillStyle='#f7f7f5';fx.strokeStyle='#17191b';fx.lineWidth=2*s;fx.beginPath();fx.arc(a.x,a.y,12*s,0,Math.PI*2);fx.fill();fx.stroke();fx.strokeRect(a.x-4*s,a.y-4*s,8*s,8*s);}
    fx.restore();
  }
