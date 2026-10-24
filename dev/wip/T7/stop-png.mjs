const version=await fetch('http://127.0.0.1:9423/json/version').then(r=>r.json());
const ws=new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
ws.send(JSON.stringify({id:1,method:'Browser.close'}));
await new Promise(resolve=>ws.addEventListener('close',resolve,{once:true}));
