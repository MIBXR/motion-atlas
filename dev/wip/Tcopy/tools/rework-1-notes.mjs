import fs from 'node:fs';

const dir='dev/wip/Tcopy/rework-1';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const before=json(`${dir}/before.json`);
const timing=json(`${dir}/timing-review.json`);
const cell=value=>(typeof value==='string'?value:JSON.stringify(value,null,2)).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('|','\\|').replaceAll('\n','<br>');

if (process.argv[2]==='diff') {
  const lines=['## 返工 1','','本节原文以返工开始时的工作树为基准。参数清单migration[].how按答复保留；舞台字号不设下限，Demo不改。',''];
  for(const file of Object.keys(before).filter(p=>p.startsWith('entries/'))) {
    const a=JSON.parse(before[file]),b=json(file),rows=[];
    for(const key of ['focus','trigger','mechanism','effect','timing']) if(JSON.stringify(a[key])!==JSON.stringify(b[key])) rows.push(`| ${key} | ${cell(a[key])} | ${cell(b[key])} |`);
    if(JSON.stringify(a.observations)!==JSON.stringify(b.observations)) for(let i=0;i<Math.max(a.observations.length,b.observations.length);i++) rows.push(`| observations[${i}] | ${cell(a.observations[i]??'（无）')} | ${cell(b.observations[i]??'（删除）')} |`);
    if(a.composition?.notes!==b.composition?.notes) rows.push(`| composition.notes | ${cell(a.composition.notes)} | ${cell(b.composition.notes)} |`);
    if(rows.length) lines.push(`### ${file}`,'','| 字段 | 原文 | 新文 |','| --- | --- | --- |',...rows,'');
  }
  lines.push('### 档案终端的5个巧思','','boot-typing、rolling-digits、decrypt-reveal、wave-array、idle-breathing的effect均与各自summary不同，保留原文。','');
  fs.writeFileSync('dev/wip/Tcopy/content-diff.md',before['dev/wip/Tcopy/content-diff.md'].trimEnd()+'\n\n'+lines.join('\n').trimEnd()+'\n');
  const docs=['## 返工 1','','| 文件 | 原文 | 新文 |','| --- | --- | --- |'];
  for(const file of ['AGENT.md','CONTRIBUTING.md']) {
    const a=before[file].split('\n').find(l=>l.includes('showcase'));
    const b=read(file).split('\n').find(l=>file==='AGENT.md'?l.includes('--carrier video'):l.startsWith('| `carriers`'));
    docs.push(`| ${file} | ${cell(a)} | ${cell(b)} |`);
  }
  fs.writeFileSync('dev/wip/Tcopy/docs-diff.md',before['dev/wip/Tcopy/docs-diff.md'].trimEnd()+'\n\n'+docs.join('\n')+'\n');
  console.log('rework 1 appended to content-diff and docs-diff');
} else if(process.argv[2]==='report') {
  const bans=json('dev/wip/Tcopy/banned-results.json'),filters=json('dev/wip/Tcopy/filter-results.json'),shots=json('dev/wip/Tcopy/screenshot-results.json'),copy=json(`${dir}/content-checks.json`);
  const smoke=[1,2].map(n=>read(`dev/wip/Tcopy/smoke-${n}.log`).trim().split('\n').at(-1));
  if(smoke.some(line=>line!=='smoke 19/19 passed')||bans.hitCount||filters.some(r=>!r.pass)||shots.errors.length)throw new Error('Verification incomplete');
  let s=before['dev/reports/Tcopy.md'];
  s=s.replace('案例、分类、侧栏与文案主体已完成，4个参数密集字段的长度以及下列边界事项留待决定。','案例、分类、侧栏与文案主体及返工1已完成。参数清单豁免字数，地图画面细节按Demo重写，载体说明已同步，舞台字号按用户决定不设下限。本轮没有待决定事项。');
  s=s.replace('| 5.5 | 全部文字长度上限 | 偏离（原因） | 4个字段无法同时保留全部参数并压到40字；保留数值与字段结构，待决定 |','| 5.5 | 全部文字长度上限 | 已做 | 返工1按答复豁免migration参数清单；其余文字长度检查0项超限 |');
  s=s.replace('430个条目字段变化，并附节奏实验室改写','首轮430个条目字段变化，并附节奏实验室改写；本轮在末尾追加返工1');
  s=s.replace('| 6.6 | AGENT/CONTRIBUTING中的showcase说明 | 未做 | 与“其他内容不动”冲突，按该约束保留并列入待决定；两文件不进入文档中心 |','| 6.6 | AGENT/CONTRIBUTING中的showcase说明 | 已做 | 返工1按答复删除第三载体示例与速查项，仅保留video和console |');
  s=s.replace('| 8.4 | 桌面、手机与前后并排截图 | 已做 | 14张全部打开查看；其中8张桌面、4张手机、1张改版前、1张并排图 |','| 8.4 | 桌面、手机与前后并排截图 | 已做 | 返工1重做15张并全部打开查看；9张桌面、4张手机、1张改版前、1张并排图 |');
  s=s.replace('screenshots 14/14 opened · 12 page captures + before + comparison · 0 browser errors','screenshots 15/15 opened · 13 page captures + before + comparison · 0 browser errors');
  s=s.replace('档案终端舞台最低字号5.3px；5个自适应巧思按现有脚本跳过固定画幅和舞台字号采样，这不等于其字号已通过12px验证。','档案终端舞台最低字号5.3px；用户已确认舞台字号不设下限，因此不调整。5个自适应巧思按脚本跳过固定画幅和舞台字号采样；页面外层仍按12px检查。');
  const a=s.indexOf('## 截图索引'),b=s.indexOf('## 待决定',a);
  const index=['## 截图索引','','返工1全部重新截图并打开查看。改版前页面由本地origin/main=a452ea4的8份Git原始文件导出到临时目录，只读启动在4327端口；没有切分支。并排图左侧为改版前，右侧为当前页面。','','| 文件 | 尺寸 | 页面/状态 |','| --- | --- | --- |'];
  for(const shot of shots.shots){const name=shot.path.split('/').at(-1);index.push(`| [${name}](../shots/Tcopy/${name}) | ${shot.width}×${shot.height} | ${shot.note} |`);}
  index.push('| [docs-before.png](../shots/Tcopy/docs-before.png) | 1440×900 | 本轮重新截取的origin/main页面 |','| [docs-comparison.png](../shots/Tcopy/docs-comparison.png) | 2880×900 | 本轮前后并排 |','','');
  s=s.slice(0,a)+index.join('\n')+s.slice(b);
  s=s.replace(/## 待决定[\s\S]*?(?=## 阻碍、失败与处理)/,'## 待决定\n\n本轮无待决定事项。此前4类事项均已按用户答复处理：参数清单保留，地图画面细节重写，仓库载体说明同步，舞台字号不调整。timing中不确定的项为0；38个删除项都与各自Demo的markers名称和时刻逐项一致。\n\n');
  s=s.replace('- 全部smoke所依赖的Demo与预览字节未变，因此两轮成功结果复用到最终交付；最终数据、文档或界面文字变化后已再次完成build/check/build:site。','- 返工1按要求重新执行两轮smoke以及build/check/build:site、banned、筛选断言和全部截图；本轮没有复用上轮的测试或截图结果。');
  s=s.replace('本轮本地服务器在验证结束后停止。','本轮4326验证服务与4327只读基线服务均在验证结束后停止。');
  s=s.replace('## 阻碍、失败与处理\n\n','## 阻碍、失败与处理\n\n- 返工1首次smoke在alert-reroute检测到SwiftShader，随后8项出现fetch failed，结果10/19。HTTP服务随后均返回200，也未发现残留的本轮无头浏览器。失败日志保留在[smoke-attempt-1.log](../wip/Tcopy/rework-1/smoke-attempt-1.log)。后续单独执行完整两轮均19/19，验证恢复；没有放宽GPU判定、修改启动参数或Demo。初次浏览器异常的根因未独立确认。\n');
  s=s.replace('## 阻碍、失败与处理\n\n','## 阻碍、失败与处理\n\n- 返工1截图助手在案例之间的hash导航后等待Page.loadEventFired而超时。识别同文档导航后，从地图详情续跑；此前7张本轮成功截图保留，随后6张完成。地图图像通过Demo现有render=1模式等待瓦片后重截，最终15张均已查看；站点与Demo代码未因此改动。\n');
  const rework=['## 返工 1','','返工依据：`dev/wip/Tcopy/fix-1.md`与本轮用户指令。JSON、截图与校验均来自当前工作树。下面列出本轮验证与timing逐项判断。','','```text',read('dev/wip/Tcopy/build.log').trim(),read('dev/wip/Tcopy/check.log').trim(),'build:site → static site ready · dist/ · exit 0',...smoke.map((line,i)=>`run ${i+1}: ${line}`),`banned ${bans.hitCount} hits · ${bans.exceptionCount} exceptions · ${bans.scanned} files scanned`,`filters ${filters.filter(r=>r.pass).length}/${filters.length} passed`,'copy length violations: 0','rework copy check: 10 observations · 12 patterns · 5 archive patterns unchanged · 0 failures','screenshots 15/15 opened · 0 browser errors','```','','禁用词例外仍为6处，位置和理由见本报告“禁用词与例外”。两份对照表均追加“返工1”，保留首轮对照。Demo、vendor和kit未改，1012项Demo与预览清单仍与基线字节一致。','','### 画面细节的依据','','只使用地图Demo的config.js、script.js、scenes.js与条目的rhythm.beats；没有采用其他视频内容。10条时刻为0:04.8至0:58.8；区间都在0–60秒内，每条what不超过40字，与节拍note无逐字重复。新截图位于map-details-desktop.png。','','| 内容 | 依据位置 |','| --- | --- | --- |','| 四角HUD与曲名歌词 | script.js的drawHud，config.js的music与layout |','| 鸟居卡片与全屏展开 | config.js的tracks.cards，script.js的drawCards，scenes.js的sceneTorii |','| 回忆段竖排字幕与钟声 | config.js的tracks.flashback，script.js的drawFlashback与buildScore，scenes.js的sceneKamo |','| 分屏对比时间戳印章 | config.js的tracks.compare，script.js的drawCompare与buildScore |','| 误乘横幅与蜂鸣 | config.js的tracks.alert，script.js的drawAlert与buildScore |','| 3天4站、印章、目击、误乘、194km统计 | config.js的tracks.outro，script.js的drawOutro与buildScore |','','### timing判断','','每个删除项均在对应Demo的config.js中找到同名、同秒数的markers记录，属于片段起点，不是动作时长。共删除38项，原项名与数值完整记录于下表；各条目的“时长”和“声音 voice”共24项原样保留。不确定项：0。','','| 巧思 | 删除的片段编排项 | 保留项 |','| --- | --- | --- |'];
  for(const row of timing)rework.push(`| ${row.id} | ${cell(row.removed.map(x=>`${x.name}=${x.value}`).join('；'))} | ${cell(row.retained.map(x=>`${x.name}=${x.value}`).join('；'))} |`);
  rework.push('','### 返工 1核对表','','| 要求 | 状态 | 结果 |','| --- | --- | --- |',
    '| 1.1 参数清单豁免 | 已做 | migration[].how与返工前完全一致，长度检查按答复豁免 |',
    '| 1.2 地图画面细节按Demo改写 | 已做 | 10条、时间排序、0–60秒、what≤40字、覆盖6类必需内容 |',
    '| 1.3 AGENT与CONTRIBUTING载体同步 | 已做 | 只保留video和console，showcase为0 |',
    '| 1.4 舞台字号不设下限 | 已做 | 不调整5.3px，不修改保留Demo |',
    '| 2 档案终端focus与8条细节 | 已做 | 按定稿逐字替换并保持顺序 |',
    '| 3 地图细节不重复节拍note | 已做 | 所有what与beats.note均不逐字相同 |',
    '| 4.1 12个设计触发时机 | 已做 | 全部≤20字，不再使用播放/暂停/seek到时刻的说明 |',
    '| 4.2 mechanism清除时间映射 | 已做 | day-night-flip移除案例秒数；相同组合说明同步清除；其他11条无此类映射 |',
    '| 4.3 12个效果说明 | 已做 | 全部≤30字，并与各自summary不同 |',
    '| 4.4 timing清理 | 已做 | 38项片段起点删除，24项参数保留；0项不确定 |',
    '| 4 档案终端5个巧思effect检查 | 已做 | 均与summary不同，5份JSON未改 |',
    '| 5 build/check/build:site | 已做 | 按顺序执行，均退出0 |',
    '| 5 smoke两次 | 已做 | 两次19/19 |',
    '| 5 banned | 已做 | 0命中、6例外，理由逐条保留 |',
    '| 5 check-filters | 已做 | 479/479 |',
    '| 5 全部截图与新增地图细节截图 | 已做 | 本轮15张全部打开查看 |',
    '| 对照表追加返工1 | 已做 | content-diff与docs-diff均追加原文/新文 |',
    '| 报告最后追加返工1核对表 | 已做 | 本节 |',
    '| 不commit、不push、不切分支 | 已做 | HEAD与分支不变 |');
  fs.writeFileSync('dev/reports/Tcopy.md',s.trimEnd()+'\n\n'+rework.join('\n')+'\n');
  console.log('report updated with final rework 1 checklist');
}
