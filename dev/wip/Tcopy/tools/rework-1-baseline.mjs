import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = 'dev/wip/Tcopy/rework-1/baseline-site';
const files = ['docs.html','assets/site.css','assets/site.js','assets/docs.css','assets/docs.js','assets/favicon.svg','data/docs.js','scripts/serve.mjs'];
for (const file of files) {
  fs.mkdirSync(dir+'/'+file.split('/').slice(0,-1).join('/'),{recursive:true});
  fs.writeFileSync(dir+'/'+file,execFileSync('git',['show','origin/main:'+file],{maxBuffer:30_000_000}));
}
console.log('Read-only baseline exported from '+execFileSync('git',['rev-parse','origin/main'],{encoding:'utf8'}).trim());
