// 仅供MP4导出；测试与预览按条目的renderer声明选择浏览器。
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
const spawn = childProcess.spawn;
childProcess.spawn = function (executable, args, options) {
  if (/[/\\](?:msedge|chrome)\.exe$/i.test(executable) && args.includes('--headless=new')) {
    args = args.filter(arg => !arg.startsWith('--use-angle=') && arg !== '--enable-unsafe-swiftshader');
    args.push('--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--no-proxy-server');
  }
  return spawn.call(this, executable, args, options);
};
syncBuiltinESMExports();
