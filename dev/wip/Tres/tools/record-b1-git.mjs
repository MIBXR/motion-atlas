import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}
const lines = text => text ? text.split(/\r?\n/) : [];
const result = {
  branch: git(['branch', '--show-current']), head: git(['rev-parse', 'HEAD']),
  staged: lines(git(['diff', '--cached', '--name-only'])),
  changed: lines(git(['diff', '--name-only'])),
  forbiddenChanges: lines(git(['diff', '--name-only', '--', 'demos/cases', 'demos/patterns', 'entries', 'kit', 'vendor', 'assets/markdown.js'])),
};
git(['diff', '--check']);
const distMatches = {};
for (const file of ['assets/resources.js', 'assets/resources.css', 'demos/styles/player/index.html', 'demos/styles/player/player.js', 'demos/styles/player/player.css', 'scripts/lemo-status.json']) {
  distMatches[file] = fs.readFileSync(file).equals(fs.readFileSync('dist/' + file));
}
result.distMatches = distMatches;
fs.writeFileSync('dev/wip/Tres/evidence/b1-git-final.json', JSON.stringify(result, null, 2) + '\n');
if (result.staged.length || result.forbiddenChanges.length || Object.values(distMatches).some(match => !match)) throw new Error('Unexpected final state: ' + JSON.stringify(result));
console.log(JSON.stringify({ branch: result.branch, head: result.head, staged: result.staged.length, forbiddenChanges: result.forbiddenChanges.length, distMatches }, null, 2));
