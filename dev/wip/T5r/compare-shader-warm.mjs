import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const rollback = process.argv.includes('--rollback');
const output = rollback ? 'dev/shots/T5r/shader-rollback-parity' : 'dev/shots/T5r/shader-warm-parity';
fs.mkdirSync(output, { recursive: true });
const decode = file => {
  const r = spawnSync('ffmpeg', ['-v','error','-i',file,'-vf','scale=64:36:flags=area','-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1']);
  if (r.status) throw new Error(r.stderr.toString());
  return r.stdout;
};
const result = [];
for (const mode of rollback ? ['hardware'] : ['software', 'hardware']) for (const t of [23.28, 36, 50]) {
  const before = `dev/shots/T5r/shader-warm-baseline-${mode}/seek-${t}.png`;
  const after = rollback ? `dev/shots/T5r/shader-after-rollback-gpu/seek-${t}.png` : `dev/shots/T5r/shader-warm-post-${mode}/seek-${t}.png`;
  const a = decode(before), b = decode(after);
  let difference = 0;
  for (let i=0;i<a.length;i++) difference += Math.abs(a[i]-b[i]);
  const file = `${output}/${mode}-${t}.png`;
  const r = spawnSync('ffmpeg', ['-y','-v','error','-i',before,'-i',after,'-filter_complex','hstack=inputs=2','-frames:v','1','-update','1',file]);
  if(r.status)throw new Error(r.stderr.toString());
  result.push({ mode, t, before, after, image: file, mad255: difference/a.length });
}
fs.writeFileSync(`${output}/results.json`, JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
