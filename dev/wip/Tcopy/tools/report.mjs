import fs from 'node:fs';
const read = p => fs.readFileSync(p,'utf8');
const json = p => JSON.parse(read(p));
const escape = s => String(s).replaceAll('|','\\|');
const banned = json('dev/wip/Tcopy/banned-results.json');
const filters = json('dev/wip/Tcopy/filter-results.json');
const shots = json('dev/wip/Tcopy/screenshot-results.json');
const lengths = json('dev/wip/Tcopy/length-results.json');
const structure = json('dev/wip/Tcopy/structure-results.json');
const checklist = [
  ['0', '工作树、分支、基准与本地端口', '已做', '.worktrees/copy；feat/visitor-copy；HEAD与本地origin/main均为a452ea4；4326'],
  ['0', '访客视角与禁用词', '已做', '检查范围内0个非例外命中；允许例外逐条列在下方'],
  ['1.1', '删除industrial-protocol条目、Demo、预览与研究', '已做', '指定目录与文件全部删除'],
  ['1.2', '删除派生的5个巧思、Demo与预览', '已做', 'chamfer-panel、text-scramble、conveyor-flow、hold-confirm、scanline-wipe'],
  ['1.3', '逐个清除6个id的残留引用', '已做', '修改前后均运行grep -rnI；非dev仓库文件最终0行命中；逐行处理清单见下方'],
  ['1.3', '清除patternIds与组合关系', '已做', '过滤删除项；构建校验通过；保留条目中没有额外待清理关联'],
  ['1.4', '研究笔记移出站点', '已做', 'git mv到dev/research/；两篇正文未改；docs/research已不存在'],
  ['1.5', '案例字段与巧思sources精简', '已做', '案例删除5个字段；巧思sources仅含caseId'],
  ['2.1', 'taxonomy只保留2种载体，删除来源与等级组', '已做', 'video / console；9种巧思类型保留'],
  ['2.2', '全部条目移除showcase', '已做', '地图video、档案console；17个巧思均有非空载体'],
  ['2.3', '校验规则与双向案例关联', '已做', '删除旧字段校验；caseId存在与patternIds反向包含继续检查'],
  ['2.4', '更新Agent摘要和资料包、清理生成物', '已做', 'documents.research与摘要source/evidence均删除；旧条目agent/prompts由build清理'],
  ['2.5', '档案终端39点能量曲线', '已做', '数值与方案逐项一致；列表和详情原本都按数组实际长度铺满，无30点假设，绘制公式未改'],
  ['2.6', '文档收录、分组与排序', '已做', '24篇：指南5、案例Prompt2、巧思Prompt17；指南按指定顺序；不收录根目录说明和研究'],
  ['2.6', 'Prompt标题简化', '已做', '生成标题仅为条目名称'],
  ['2', '同步所有读取旧字段的调用方', '已做', 'home、library、agent指令生成器与atlas CLI均不再读取删除的taxonomy字段'],
  ['3.1', '侧栏仅收藏与工具4项，删除side-foot', '已做', '收藏、导出、导入、跳转另一库；保留收藏计数'],
  ['3.1', '工具栏筛选与aria-label', '已做', '案例：载体；巧思：类型、载体、所属案例；均用select样式'],
  ['3.1', '编号/名称排序与URL', '已做', '默认order省略；名称用sort=title；source删除；carrier/type/case往返恢复'],
  ['3.1', '卡片与搜索删除来源', '已做', '案例卡片只显示载体chip；搜索不再读取来源taxonomy'],
  ['3.2', '删除来源章节、evBadge及调用', '已做', '详情无SOURCES章节与等级标签'],
  ['3.2', '巧思所属案例标题链接', '已做', '沿用现有有效路由cases.html#case/<id>，一行显示所属案例'],
  ['3.2', '画面细节/DETAILS', '已做', '继续读取observations'],
  ['3.3', '文档使用lib-side/side-group/side-list', '已做', '共享高亮样式；目录无count'],
  ['3.3', '文档搜索与移动端开合', '已做', 'field+SVG搜索图标；全部文档（24）；断点与案例库一致为980px'],
  ['3.3', '保留正文与本页目录，移除旧侧栏样式', '已做', 'Markdown正文与右侧目录机制保留；docs-side/docs-search/docs-toggle旧规则已删除'],
  ['4', '首页定稿、两张载体卡、导语、页脚与链接', '已做', '按C003、C006等指定文本替换；C022及未列出的界面文本保持'],
  ['4', '列表、加载、自适应说明与文档空态', '已做', '编号、收藏与工具、清除筛选、正在载入、还没有文档等定稿生效'],
  ['5.1–5.2', '两个案例与17个巧思的访客文案', '已做', '直接改entries；开发来源文字删除；只描述画面、作用和使用'],
  ['5.3–5.4', '保留数值、id、结构与数组顺序', '已做', '除方案指定结构删除与energy外，数值字段未变；参数清单保留全部时刻'],
  ['5.5', '全部文字长度上限', '偏离（原因）', '4个字段无法同时保留全部参数并压到40字；保留数值与字段结构，待决定'],
  ['5.6–5.7', 'Prompt参数与作品名称', '已做', 'Prompt保留设计参数，清除来源和过程措辞；作品与地名保留'],
  ['5', 'content-diff.md', '已做', '430个条目字段变化，并附节奏实验室改写'],
  ['6.1', '五篇指南与README面向使用者改写', '已做', '清除来源、内部过程与已删内容；保留播放、定位、导出、检查的用法'],
  ['6.2', '条目结构文档', '已做', '按字段、页面位置与用途说明案例和巧思'],
  ['6.3', '渲染管线', '已做', '保留运行与视频导出命令、时间轴、声音、加载与检查；去掉测量过程和研究链接'],
  ['6.4', '使用指南两种载体', '已做', '筛选与文档中心说明同步；删除来源等级章节'],
  ['6.5', 'README案例表、两段定稿与计数', '已做', '表为案例/载体/时长；build更新2/17/2；巧思类型计数按剩余条目计算'],
  ['6.6', 'AGENT/CONTRIBUTING字段说明', '已做', '移除案例来源、等级和研究资料包说明；巧思仅caseId；其余说明按要求不动'],
  ['6.6', 'AGENT/CONTRIBUTING中的showcase说明', '未做', '与“其他内容不动”冲突，按该约束保留并列入待决定；两文件不进入文档中心'],
  ['6.7', 'docs-diff.md', '已做', '8份文件、37个连续删改区段'],
  ['7', '节奏实验室标记文案', '已做', '只改标记的说明和导出文案；保留参数；默认导出最长一句39字'],
  ['8.1', 'build / check / build:site', '已做', '按指定顺序执行，均退出0；最终build无待更新生成物'],
  ['8.2', '连续两轮smoke', '已做', '两次均19/19，使用指定direct-browser预载和4326端口'],
  ['8.3', 'banned.mjs', '已做', '63份文件；0命中、6例外'],
  ['8.4', '桌面、手机与前后并排截图', '已做', '14张全部打开查看；其中8张桌面、4张手机、1张改版前、1张并排图'],
  ['8.5', 'check-filters.mjs', '已做', '479/479断言；覆盖所有类型×载体×所属案例组合、排序、URL恢复'],
  ['8.6', '逐节报告与待决定', '已做', '本文件'],
  ['9', '保护vendor、kit和保留Demo', '已做', '仅删除指定Demo；1012项Demo/预览文件与基线清单哈希一致'],
  ['9', '不commit、不push、不切分支', '已做', '分支与HEAD保持；git mv的2项移动及5份新交付文件暂存，其余过程文件不暂存'],
];
const lines = [
  '# Tcopy 实施与验证报告', '',
  '工作树：`.worktrees/copy`。分支：`feat/visitor-copy`。基准：`a452ea4b9af1b3026612009521d50588c5bbbb66`，与开始时的本地`origin/main`一致。没有提交、推送、切分支或发布。', '',
  '案例、分类、侧栏与文案主体已完成，4个参数密集字段的长度以及下列边界事项留待决定。所有验证结论均来自本工作树本轮执行；未把历史状态当作当前验证。', '',
  '## 逐节核对表', '', '| 方案 | 项目 | 状态 | 说明 |', '| --- | --- | --- | --- |',
  ...checklist.map(r=>'| '+r.map(escape).join(' | ')+' |'), '',
  '## 验证结果', '', '```text',
  read('dev/wip/Tcopy/build.log').trim(),
  read('dev/wip/Tcopy/check.log').trim(),
  'npm run build:site → static site ready · dist/ · exit 0',
  'smoke run 1 → '+read('dev/wip/Tcopy/smoke-1.log').trim().split('\n').at(-1),
  'smoke run 2 → '+read('dev/wip/Tcopy/smoke-2.log').trim().split('\n').at(-1),
  `banned ${banned.hitCount} hits · ${banned.exceptionCount} exceptions · ${banned.scanned} files scanned`,
  `filters ${filters.filter(r=>r.pass).length}/${filters.length} passed`,
  `structure ${structure.entries}/19 entries checked · ${structure.baselineFiles} baseline manifest files byte-identical · ${structure.failures.length} failures`,
  'screenshots 14/14 opened · 12 page captures + before + comparison · 0 browser errors',
  'git diff --check → exit 0', 'git diff --cached --check → exit 0', '```', '',
  '最终静态构建位于`dist/`；其中没有`docs/research/`或已删除条目的生成物。截图页面外层没有横向溢出，也没有采样到低于12px的可见文字。文档目录为指南、案例Prompt、巧思Prompt三组；默认指南高亮、搜索、点击切换后手机侧栏收起均正常。900px宽度也按相同断点收起侧栏。', '',
  '档案终端能量曲线为39点，详情路径从x=0铺到x=1000；列表曲线从x=0铺到x=100。两个绘制点均已使用数组实际长度，不需修改公式。截图同时显示节奏结构标题和能量曲线。', '',
  '两轮smoke完整输出：[`smoke-1.log`](../wip/Tcopy/smoke-1.log)、[`smoke-2.log`](../wip/Tcopy/smoke-2.log)。GPU条目均报告Intel Iris Xe / D3D11。档案终端舞台最低字号5.3px；5个自适应巧思按现有脚本跳过固定画幅和舞台字号采样，这不等于其字号已通过12px验证。', '',
  '筛选详情：案例video=1、console=1；巧思10个类型选项（含全部）×3个载体选项×3个所属案例选项，逐次对照MA.patterns自行计算的id和数量。名称排序与编号恢复、默认参数省略、筛选参数往返和旧source/curated参数移除均通过。明细见[`filter-results.json`](../wip/Tcopy/filter-results.json)。', '',
  '## 禁用词与例外', '',
  `非例外命中：**${banned.hitCount}**。例外为词项出现次数，同一注释行可包含多个词项。`, '',
  '| 文件:行:列 | 词项 | 例外理由 |', '| --- | --- | --- |',
  ...banned.exceptions.map(h=>`| ${h.file}:${h.line}:${h.column} | ${escape(h.word)} | ${h.reason} |`), '',
  '检查脚本：[`banned.mjs`](../wip/Tcopy/tools/banned.mjs)。结果：[`banned-results.json`](../wip/Tcopy/banned-results.json)。没有把访客文案、模板输出字符串或正文中的命中归入代码例外。', '',
  '## 残留引用处理清单', '',
  '下表逐行列出修改前grep命中的仓库文件位置；行号属于a452ea4。dev目录按方案排除，Git元数据、依赖目录和构建目录不视为待维护源码。最终重复检索为0行命中。原始清单：[`references-before.txt`](../wip/Tcopy/references-before.txt)；结果：[`references-after.txt`](../wip/Tcopy/references-after.txt)。', '',
  '| 修改前文件:行 | id | 处理方式 |', '| --- | --- | --- |',
];
const removed = ['industrial-protocol','chamfer-panel','text-scramble','conveyor-flow','hold-confirm','scanline-wipe'];
for (const line of read('dev/wip/Tcopy/references-before.txt').split('\n').filter(Boolean)) {
  const m=line.match(/^\.\/(.+?):(\d+):(.*)$/); if(!m) throw new Error('Unknown reference row');
  const [,file,n,text]=m;
  let action;
  if (removed.some(id=>file.includes(id))) action='删除指定条目的整个文件';
  else if (/^(agent|data|prompts)\//.test(file)) action='由build重新生成，删除对应摘要、关系或文档';
  else if(file==='.gitignore') action='删除该案例专用忽略规则';
  else if(file==='README.md') action='删除工业协议案例表行';
  else if(file==='docs/rhythm.md') action='删除长按确认巧思说明段落';
  else throw new Error('Reference action missing: '+file);
  const ids=removed.filter(id=>text.includes(id));
  lines.push(`| ${file}:${n} | ${ids.join('、')} | ${action} |`);
}
lines.push('', '两篇研究文档通过git mv保留全文移至`dev/research/`，不再被文档中心或静态站点构建收录。原研究目录中的工业协议笔记按方案删除。', '',
  '## 截图索引', '', '全部已打开查看。除并排图外均为原尺寸截图，没有裁剪内容。并排图左侧为本地origin/main=a452ea4的改版前页面，右侧为当前页面。', '',
  '| 文件 | 尺寸 | 页面/状态 |', '| --- | --- | --- |');
for (const shot of shots.shots) lines.push(`| [${shot.path.split('/').at(-1)}](../shots/Tcopy/${shot.path.split('/').at(-1)}) | ${shot.width}×${shot.height} | ${shot.note} |`);
lines.push('| [docs-before.png](../shots/Tcopy/docs-before.png) | 1440×900 | 文档中心改版前 |', '| [docs-comparison.png](../shots/Tcopy/docs-comparison.png) | 2880×900 | 文档中心前后并排 |', '',
  '## 待决定', '',
  '1. **4个字段的40字上限**：保留完整数值与数组结构后仍超长。未删掉参数或拆字段；需要决定参数清单是否豁免字数，或允许拆分。具体位置如下。', '',
  '| 文件 | 字段 | 当前字数/上限 |', '| --- | --- | --- |',
  ...lengths.map(v=>`| ${v.file} | ${v.field} | ${v.length}/${v.limit} |`), '',
  '2. **地图画面细节的时间轴**：observations保留的时刻包括1:12–1:20、1:39.35–1:40.6、2:30.5，超出该Demo的60秒；HUD细节还包含首尔与YUI等内容。方案要求不改时间、数值和专名，因此没有把这些内容改成Demo中的时刻和文字。需要决定保留这组画面细节，还是允许按Demo重新整理。', '',
  '3. **仓库说明中的第三载体**：AGENT.md的CLI示例与CONTRIBUTING.md的carriers速查仍有showcase。第6.6节要求除来源、等级字段说明外其他内容不动，因此这两处保留；它们已退出文档中心。需要决定是否允许同步这两处载体说明。', '',
  '4. **档案终端Demo内文字字号**：两轮smoke均报告5.3px，低于会话的12px要求；第9节明确禁止修改保留Demo代码及舞台文字。本轮未调整Demo。需要另行决定是否扩展Demo修改范围。其他自适应巧思没有在smoke里得到舞台字号下限验证。', '',
  '## 阻碍、失败与处理', '',
  '- PowerShell多层引号曾使内联Node命令解析失败，默认文本读取及重定向也出现过显示乱码。改用UTF-8脚本文件、明确编码读取和Git Bash写日志后解决；源文件未发生乱码写入。',
  '- 初版筛选脚本在一个同步任务里密集更新URL，出现URL断言失败。增加操作间隔后479项断言全部通过。原因更像浏览器对密集历史更新的限制，未据此修改站点行为；该原因属于解释，非独立验证结论。',
  '- 辅助截图等待器曾误把aria-busy的完成态写成字符串false，实际完成时属性会被删除。修正等待条件后重新截图，最终14张全部查看。',
  '- 额外结构脚本最初将已去掉_file的生成条目送入文件名校验，产生19条辅助断言错误。改为使用buildAll返回的原始校验结果；最终0失败。',
  '- 最终空白检查发现README与文档对照表有多余文件尾空行，已清除；辅助页面检查的正则转义问题也已修正。最终空白检查与页面检查通过。',
  '- 全部smoke所依赖的Demo与预览字节未变，因此两轮成功结果复用到最终交付；最终数据、文档或界面文字变化后已再次完成build/check/build:site。', '',
  '## 交付位置与Git状态', '',
  '- [条目与实验室对照表](../wip/Tcopy/content-diff.md)',
  '- [文档对照表](../wip/Tcopy/docs-diff.md)',
  '- [禁用词脚本](../wip/Tcopy/tools/banned.mjs)',
  '- [筛选断言脚本](../wip/Tcopy/tools/check-filters.mjs)',
  '- 截图：`dev/shots/Tcopy/`；静态构建：`dist/`。',
  '- HEAD与分支不变。仅git mv移动和上述5份新交付文件暂存；原有Tcopy清单、方案及临时工具/输出不暂存。截图和构建产物保持忽略。',
  '- 本轮本地服务器在验证结束后停止。没有发布。', '');
fs.mkdirSync('dev/reports',{recursive:true});
fs.writeFileSync('dev/reports/Tcopy.md',lines.join('\n'));
console.log('report written · '+lines.length+' lines');
