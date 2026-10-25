import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
let s = read('lab.html');
const inv = JSON.parse(read('dev/wip/Tcopy/copy-inventory.json'));
for (const [id, text] of Object.entries({
  C2039: '导出会带上当前节拍、事件、曲线、时长与错峰参数。WAV使用同一套音色，可拖进剪辑软件对拍。',
  C2041: 'JS 代码',
  C2044: 'WAV包含当前节拍器、事件、循环起点与曲线提示音。节拍器保持三级音量，A/B交替按圈切换。曲线跟随节拍时加入提示音。从第0秒导出整数圈，方便循环使用。',
  C2126: '曲线决定性格，时长决定重量，错峰决定层次。开启“跟随节拍”，预览每小节重播。选“落点踩重拍”，最后一个元素在重拍落定。起步有呼啸，每次落定有提示音。',
  C2317: '先用节拍器听速度、拍号与细分，再比较事件吸附前后的差别。把曲线、时长和错峰对齐拍子，导出代码、Prompt或WAV。',
})) {
  const old = inv.find(r => r.id === id).text;
  if (!s.includes(old)) throw new Error('Missing lab copy ' + id);
  s = s.replace(old, text);
}
fs.writeFileSync('lab.html', s);
s = read('assets/lab.js');
s = s.replace('MotionKit（kit/motion-kit.js）· 节奏实验室导出', 'MotionKit · 节奏实验室导出');
s = s.replace("}).join('、') : '（暂无）';", "}).join('。') : '（暂无）';");
const a = s.indexOf('    return `动效节奏约束：'), b = s.indexOf('\n  }', a);
s = s.slice(0, a) + `    return \`动效节奏：\${S.meter}拍，\${S.bpm} BPM。1拍\${ms(c.spb)}ms，1小节\${(c.spb * c.bpb).toFixed(2)}s\${m.unit === 8 ? '，按八分音符计拍' : ''}。首拍偏移\${S.offset}ms，重拍在\${c.o.toFixed(3)}s。网格\${divName(S.div)}，每格\${gridMs}ms。\${swingMs ? \`摇摆\${S.swing}%，反拍推迟\${swingMs}ms。长短比\${ratio}:1。\` : ''}量化强度\${S.strength}%。关键事件：\${evText}。小节重拍放主动作，次强拍放次要强调。反拍放回弹与细节，主动作避免偏离网格几十毫秒。缓动cubic-bezier(\${cv})。曲线：\${S.preset || '自定义'}。单个元素\${S.dur}ms，约\${durBeats}拍。错峰\${S.stag}ms，\${S.count}个元素共\${totalMs()}ms。总时长约\${totBeats}拍。\${S.align === 'land' ? '最后一个元素在小节重拍落定' : '在小节重拍起步'}。节拍底用\${KITS[S.kit].name}音色，分重拍、拍、细分三级音量。事件用\${EVOICES[S.evVoice].name}音。起步配呼啸，落定配短促提示音。减少动态时只保留透明度变化，声音照常。\`;
` + s.slice(b);
fs.writeFileSync('assets/lab.js', s);

s = read('agent.html');
s = s.replace('按载体、类型、证据等级筛选', '按载体与类型筛选');
s = s.replace('、研究笔记', '').replace('研究笔记与文件清单', '文件清单');
s = s.replace('、<code>documents.research</code>', '');
s = s.replaceAll('时间驱动', '按时间播放');
fs.writeFileSync('agent.html', s);
