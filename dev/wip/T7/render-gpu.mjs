import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
const spawn=childProcess.spawn;
childProcess.spawn=function(executable,args,options){
 if(/[/\\](?:msedge|chrome)\.exe$/i.test(executable)&&args.includes('--headless=new')){
  args=args.filter(arg=>arg!=='--use-angle=swiftshader');
  args.splice(args.length-1,0,'--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist');
  console.log(`Render browser: ${executable}; ANGLE=d3d11`);
 }
 return spawn.call(this,executable,args,options);
};
syncBuiltinESMExports();
