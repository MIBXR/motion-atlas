import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
const spawn = childProcess.spawn;
childProcess.spawn = function(executable, args, options) {
  if (/[/\\](?:msedge|chrome)\.exe$/i.test(executable) && args.includes('--headless=new')) {
    args = [...args, '--no-proxy-server'];
  }
  return spawn.call(this, executable, args, options);
};
syncBuiltinESMExports();
