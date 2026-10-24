import fs from 'node:fs';
import path from 'node:path';

const dir = 'resources/lemo-opuscar', evidence = 'dev/wip/Tres/evidence';
const manifest = JSON.parse(fs.readFileSync(`${dir}/UPSTREAM.json`, 'utf8'));
const status = JSON.parse(fs.readFileSync('scripts/lemo-status.json', 'utf8'));
const durations = JSON.parse(fs.readFileSync(`${evidence}/lemo-durations.json`, 'utf8'));
const ignored = fs.readFileSync(`${evidence}/lemo-ignored-files.txt`, 'utf8').trim().split(/\r?\n/);
const rules = fs.readFileSync(`${evidence}/lemo-ignore-rules.txt`, 'utf8').trim().split(/\r?\n/);
const smoke = fs.readFileSync(`${evidence}/smoke-existing.log`, 'utf8');
const passed = smoke.split(/\r?\n/).filter(line => line.startsWith('✓ '));
const failed = smoke.split(/\r?\n/).filter(line => line.startsWith('✗ '));
const groups = Object.fromEntries(['git', 'pack', 'film-audio'].map(origin => {
  const files = manifest.files.filter(f => f.origin.split(':')[0] === origin);
  return [origin, { count: files.length, bytes: files.reduce((n, f) => n + f.bytes, 0) }];
}));
let totalBytes = 0, totalFiles = 0;
function measure(directory) {
  for (const entry of fs.readdirSync(path.toNamespacedPath(path.resolve(directory)), { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) measure(file);
    else { totalFiles++; totalBytes += fs.statSync(path.toNamespacedPath(path.resolve(file))).size; }
  }
}
measure(dir);
const manifestBytes = fs.statSync(`${dir}/UPSTREAM.json`).size;
const rootIgnoreEqual = fs.readFileSync(`${dir}/.gitignore`).equals(fs.readFileSync('../../dev/shots/Tnew/refs/2-lemo-opuscar/.gitignore'));
const audio = fs.readdirSync(`${dir}/audio`).filter(f => f.endsWith('.ogg'));
const summary = { stoppedAt: '1.3a', ignoredCount: ignored.length, matchedRule: [...new Set(rules.map(line => line.split('\t')[0]))], rootIgnoreEqual, groups, manifestBytes, totalFiles, totalBytes, audioCount: audio.length, smoke: { interrupted: true, passedRows: passed.length, failedRows: failed.length, finalResult: null }, timestamp: new Date().toISOString() };
fs.writeFileSync(`${evidence}/lemo-stop-summary.json`, JSON.stringify(summary, null, 2) + '\n');
const checklist = [
  ['0', '指定工作树、只读参考、无 commit / push / 分支切换', '已做', '起点 feat/resources @ 5a4f287；参考克隆未修复、未运行其构建脚本。主工作区只写 films-web。'],
  ['1.1', '59 个 slug、排序、状态映射与 city-symphony', '已做', '静态状态表已转写并核对 24 / 17 / 18。'],
  ['1.1', 'films / web 资产映射与 null 清单', '已做', '两份 Release 元数据已取得；59 个 slug 两侧均有同名 mp4，无 null 项。'],
  ['1.2', 'vendor CLI、根文件与四个指定目录、excluded', '已做', 'vendor 已实际完成；未收录 .git、.github、styleboard、plugin；根目录仅取文件。'],
  ['1.2', 'ready 的同源 2xx 依赖、仅补克隆缺少部分', '已做', '24 个 ready，411 个逐片记录路径；仅补入 84 个文件，全部来自对应 demo tar。'],
  ['1.2', '解包前 tar -tf 与绝对路径 / .. 拒绝', '已做', '24 个包均先列清单；收录过程未触发不安全路径拒绝。'],
  ['1.2', 'UPSTREAM origin、license、notice', '已做', '清单含三类 origin；README 363–373 行非空原文及规定追加声明。'],
  ['1.3', '仅下载 web Release 的 59 个样片', '已做', '主工作区 films-web 共 59 片，按 Release 名称下载；未下载 films Release。'],
  ['1.3', '规定参数提取音轨，排除三段配音', '已做', '56 条 .ogg；game-show、paper-lantern、news-package 未提取；没有裁剪或平移。'],
  ['1.3', 'ffprobe 时长与 style.json.dur 比对', '已做', '59 片均已测量；绝对差 > 0.1 秒的为 0。'],
  ['1.3a', '根 ignore 的 renders / frames 锚定与四条例外', '已做', '仅实施方案指定的变更。'],
  ['1.3a', 'git ls-files --others --ignored --exclude-standard resources 输出为空', '偏离（原因）', '实际输出 84 个文件；均受原样收录的 .gitignore 第 99 行影响。按要求停下，完整清单见下文。'],
  ['1.4', '绝对路径执行 vendor，输出分组体积', '已做', '执行记录 vendor-lemo.log；收录清单 2266 文件，212611699 字节。'],
  ['2.1', '三个播放器文件、加载顺序与两份元数据 fetch', '已做', '源文件已写；player.js 通过语法检查，未浏览器验收。'],
  ['2.1', '无效 style 提示、无 __motion、固定 landscape 舞台', '已做', '已实现；未实际测试。'],
  ['2.1', 'dist/scripts 仅复制 lemo-status.json', '已做', '构建脚本已修改；尚未运行构建。'],
  ['2.2', '无参数上游 iframe、100 ms READY 轮询、180 秒预加载', '已做', '已实现指定进度标签与超时文本；未实际测试。'],
  ['2.2', 'DUR / style.dur 回退与 cn · en 标题', '已做', '已实现；未实际测试。'],
  ['2.3', 'render 串行化、保留最新帧、seek 完成语义', '已做', '单个 drain Promise 实现；尚无浏览器并发验证，不能认定验收通过。'],
  ['2.4', '音频 fetch / decode / attach、404 静音', '已做', '按 archive-os 的整段 sample 写法实现；未验证实际播放及离线输出。'],
  ['2.5', 'smoke 仅新增 --gpu 对 URL 任务的 renderer', '已做', '该脚本仅一处改动，未改阈值或其他逻辑；样片 smoke 未启动。'],
  ['3', 'buildResources 的 styles schema 与 num 排序', '已做', '生成函数已扩展；生成物未刷新。'],
  ['3', 'README 计数块与 agent/catalog.json styles', '已做', '生成逻辑已修改；实际计数块和 agent 数据尚未重新生成。'],
  ['3', 'data/resources.js 与其他构建生成物', '未做', '在 ignore 闸口停止，未运行 scripts/build.mjs。'],
  ['4', 'R1 / R2 覆盖 lemo', '已做', '通过 RESOURCE_DIRS 扩展；尚未执行 check。'],
  ['4', 'R6 状态键集合与 24 / 17 / 18', '已做', '检查代码已写；尚未执行 check。'],
  ['4', 'R7 音轨存在与三个例外', '已做', '检查代码已写；尚未执行 check。'],
  ['4', 'R8 精简 ready 请求清单及存在检查', '已做', 'lemo-runtime-files.json 及检查代码已写；尚未执行 check。'],
  ['5.1', '三段资源切换与顺序', '已做', '页面源代码已改；未构建或打开页面验收。'],
  ['5.2', '类别 / 状态侧栏、来源文字、查询路由', '已做', '已实现首次出现类别顺序及计数；未浏览器测试。'],
  ['5.2', '搜索五字段、编号 / 中文名排序、结果行', '已做', '已实现规定文案与逻辑；未浏览器测试。'],
  ['5.2', '海报、索引、cn / en / lineCn 与 chips 卡片', '已做', '已实现；未截图验证。'],
  ['5.3.1–5', '详情返回、eyebrow、标题、介绍与三个操作', '已做', '已实现；未浏览器测试。'],
  ['5.3.6', 'ready 播放区、44px 控制条、加载进度和首帧', '已做', '已实现；嵌入模式由外层控件启动播放；未实际测试。'],
  ['5.3.6', '播放 / 暂停 / seek / time / sound 消息', '已做', '已实现；未验证真实交互或声音回报。'],
  ['5.3.6', '非 ready 海报和两类提示', '已做', '已实现规定文案及 filmUrl 为空时的处理；未浏览器测试。'],
  ['5.3.7–8', '文档 chips、Markdown 链接、CREDITS、doc-path', '已做', '已实现；未执行 118 份文档 fetch 或阅读视图测试。'],
  ['5.3.9', 'LemoLab 署名与音轨例外文案', '已做', '已实现；未查看渲染结果。'],
  ['5.4', '移动端侧栏、390px 时间格式、range 最小 120px', '已做', '已实现；未执行溢出与最终字号检查。'],
  ['6', 'docs/resources.md 三个指定位置', '已做', '表格行、更新命令、播放与音轨一节已写。'],
  ['6', 'README 外部资源表格指定行', '已做', '仅在指定位置插入该行；计数块等待构建。'],
  ['7.1', 'build → check → build:site 与三个 dist 路径', '未做', '停止条件命中，未开始这组验收。'],
  ['7.2', 'git 与 tar 条目全量逐字节独立核对', '未做', 'verify-lemo.mjs 已准备，未执行；不能报告不一致数为 0。'],
  ['7.3', '4328 静态服务', '已做', '新启动遇到 EADDRINUSE；现有服务返回本工作树 assets/resources.js 与 lemo-status.json 的精确字节，已复用。'],
  ['7.4', '既有条目 smoke 一次，必须 25/25', '未做', '原命令启动过一次；触发停止条件后终止该次进程树，没有最终 25/25 结果。部分结果见下文。'],
  ['7.5', '24 样片 GPU smoke 连续两次 24/24', '未做', '驱动脚本已准备，未运行。'],
  ['7.6', '24 片 GPU 忠实度、MAD、拼图、逐张查看', '未做', 'fidelity.mjs 已准备，未运行；没有 MAD 或看图观察。'],
  ['7.7', '两段带声音 MP4、ffprobe 与波形拼图', '未做', '未运行 render.mjs，未生成 MP4 或波形。'],
  ['7.8', 'check-pages (a)–(l)', '未做', '已添加 (h)–(l) 及交互断言，脚本通过语法检查；没有执行本轮检查。'],
  ['7.9', '九张页面截图与逐张查看', '未做', '截图任务已加入 check-pages；本轮截图未生成。'],
  ['7.10', '总字节、三类字节与前十大文件', '已做', '按本次 UPSTREAM 和实际目录文件大小汇总，见体积表。'],
  ['7.11', '本报告及待决定', '已做', '包含完整停止清单，明确标注未验证项。'],
  ['8', '允许修改范围与 Git 边界', '已做', '工作区变更位于允许范围；未修改 cases / patterns / entries / kit / vendor，未暂存、commit、push 或切分支。'],
];
const lines = [
  '# 资源库第二阶段 B1 执行报告', '',
  '**当前状态：在方案第 1.3a 节停止，B1 尚未完成验收。**', '',
  '指定命令 `git ls-files --others --ignored --exclude-standard resources` 实际输出 84 个文件。全部是本次从 ready 样片包补入的 TTF 字体，命中的规则均为 `resources/lemo-opuscar/.gitignore:99:styles/*/demo/**/*.ttf`。这份 `.gitignore` 已与参考克隆逐字节单独比对，一致。仓库根的四条媒体 / log 例外不包含 TTF，且内层 `.gitignore` 的规则继续生效。', '',
  '按用户原文“若仍有文件被忽略，停下并报告清单”，没有增加额外忽略例外、改写上游文件或执行 `git add -f`。已启动的既有 smoke 在停止条件命中后结束；之后只进行阻碍定位、体积汇总与报告写入，没有继续构建或页面验收。', '',
  '播放器、生成器、校验和页面源码已写入，但 `data/resources.js` 尚未包含 styles 字段。静态检查表明页面源码已依赖该字段，因此当前快照仍是未构建的工作中状态，不能作为可演示或可发布的完整交付。该判断来自源码与生成物状态，尚未由浏览器验证。', '',
  '## 逐节核对', '',
  '“已做”指该项列出的文件或动作已落地；涉及界面和运行语义时，以证据列所写的“未验证”为准，不表示通过验收。', '',
  '| 方案 | 项目 | 状态 | 实际证据 / 限制 |', '| --- | --- | --- | --- |',
  ...checklist.map(row => '| ' + row.join(' | ') + ' |'), '',
  '## 收录与逐字节核对', '',
  '- `UPSTREAM.json.files`：2266 项；git 2126、pack 84、film-audio 56。清单记录每项 path / bytes / sha256 / origin。',
  '- 独立全量 git / tar 字节核对尚未执行；一致数、不一致数均未得到本轮测量值。清单中的 SHA256 由写入过程产生，不能替代独立核对。',
  '- 为确认停止原因，已单独将收录的根 `.gitignore` 与参考克隆比对：逐字节一致。',
  '- Release 资产缺失字段：无；59 个 slug 的 film / web 均非 null。',
  '- [vendor 输出](../wip/Tres/evidence/vendor-lemo.log)、[停止汇总](../wip/Tres/evidence/lemo-stop-summary.json)。', '',
  '## Smoke 结果', '',
  '本次既有条目原命令：', '',
  '```', 'node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4328', '```', '',
  `只启动一次；在停止条件命中后终止本次专用 Node / headless 浏览器进程树。日志已有 ${passed.length} 个通过条目、${failed.length} 个失败条目，没有最终 smoke 25/25 passed 行；该次结果不完整。现有 4328 服务未停止。`, '',
  '```text', ...passed, ...failed, 'smoke 25/25：未完成（按 1.3a 停止）', '24 样片 GPU smoke 第一次：未运行', '24 样片 GPU smoke 第二次：未运行', '```', '',
  '[本次既有 smoke 日志](../wip/Tres/evidence/smoke-existing.log)。尚未测量样片 readyMs / 单帧渲染耗时，也未遇到可据此归类的样片时间推进失败。', '',
  '## 忠实度 MAD', '',
  'fidelity.mjs 已写，未运行；没有生成对照图或执行逐张目视检查。下表不得解读为忠实度通过。', '',
  '| ready slug | MAD（0–255） | 当前状态 |', '| --- | --- | --- |',
  ...Object.entries(status).filter(([, s]) => s.status === 'ready').map(([slug]) => `| ${slug} | 未测 | 按 1.3a 停止 |`), '',
  'MAD > 12 的清单与差异观察：尚未取得测量和图像，无法判断。', '',
  '## 音轨与时长差值', '',
  '59 个 web 成片已用 ffprobe 读取 format.duration，并与参考克隆的 style.json.dur 比较。差值 = web 成片时长 − style.json.dur；绝对差 > 0.1 秒的为 0。56 条音轨按规定参数转码，没有裁剪或平移。三条配音例外未提取。', '',
  '| slug | style dur（秒） | web 时长（秒） | 差值（秒） | 音轨 |', '| --- | ---: | ---: | ---: | --- |',
  ...durations.map(d => `| ${d.slug} | ${d.styleDur.toFixed(3)} | ${d.filmDur.toFixed(3)} | ${d.delta.toFixed(3)} | ${fs.existsSync(`${dir}/audio/${d.slug}.ogg`) ? '已提取' : '未收录（配音例外）'} |`), '',
  '[时长测量 JSON](../wip/Tres/evidence/lemo-durations.json)。swiss-motion / pixel-rpg 的 0–8 秒含声音 MP4 和 showwavespic 对照尚未生成，音画对齐未验证。', '',
  '## Check-pages 与页面截图', '',
  '本轮未运行 check-pages。(a)–(g) 的第一阶段历史结果不计为本轮通过；(h)–(l) 已增加到脚本，但尚无结果。', '',
  '| 断言 | 本轮结果 |', '| --- | --- |',
  ...['(a) 视频 703 / 首屏 48 / 控制台', '(b) 视频三个筛选', '(c) 703 份 prompt fetch', '(d) 五条详情和复制', '(e) 七个 Skill 的全部 Markdown 和站内资源', '(f) 三篇 docs 的像素一致', '(g) 原三处 390px 溢出', '(h) 风格 59 / ready 24 / 搜索排序类别', '(i) frameSec / 播放 / 50% 拖动 / 声音', '(j) backrooms 海报与 needs-build 文案', '(k) 118 份 STYLE.md / DEMO.md', '(l) 两处移动端溢出、时间格式与 range 宽度'].map(label => `| ${label} | 未运行 |`), '',
  '九张截图索引（均未生成，也未查看）：', '',
  '| 预期文件（dev/shots/Tres/） | 路由 | 状态 |', '| --- | --- | --- |',
  ...[
    ['1440-styles.png', '#styles'], ['1440-styles-ready.png', '#styles?status=ready'], ['1440-style-swiss-motion.png', '#style/swiss-motion'],
    ['1440-style-pictogram-motion.png', '#style/pictogram-motion'], ['1440-style-backrooms.png', '#style/backrooms'],
    ['1440-style-swiss-demo.png', '#style/swiss-motion/DEMO.md'], ['1440-style-swiss-credits.png', '#style/swiss-motion/demo/CREDITS'],
    ['390-styles.png', '#styles'], ['390-style-swiss-motion.png', '#style/swiss-motion'],
  ].map(([file, route]) => `| ${file} | ${route} | 未生成 |`), '',
  '## 体积', '',
  '| 来源 | 文件数 | 字节 |', '| --- | ---: | ---: |',
  ...Object.entries(groups).map(([origin, value]) => `| ${origin} | ${value.count} | ${value.bytes} |`),
  `| 收录内容小计 | ${manifest.files.length} | ${manifest.files.reduce((n, f) => n + f.bytes, 0)} |`,
  `| UPSTREAM.json（本地清单） | 1 | ${manifestBytes} |`,
  `| 实际目录合计 | ${totalFiles} | ${totalBytes} |`, '',
  '| 前 10 大文件（相对 resources/lemo-opuscar/） | 字节 | origin |', '| --- | ---: | --- |',
  ...manifest.files.toSorted((a, b) => b.bytes - a.bytes).slice(0, 10).map(f => `| ${f.path} | ${f.bytes} | ${f.origin} |`), '',
  '主工作区 films-web 的 59 个原成片为参考下载，Release 清单合计 521845656 字节，不属于 resources 目录体积。', '',
  '## 阻碍及处理', '',
  '1. Windows 的 python 命令解析到应用商店别名。本轮所需流程使用 Node / FFmpeg / ffprobe，未调用该别名；没有安装依赖或修改系统 PATH。',
  '2. 初次检查的 PowerShell 文本读取显示编码问题，以及一段临时检查命令出现字符串转义语法错误；已改用 Node UTF-8 读取和文件脚本，未影响收录来源文件。',
  '3. whiteboard 的 web 下载遇到代理连接中断。按下载脚本重跑，按大小复用已完成文件，补齐剩余项；已解决。',
  '4. 新起 4328 服务遇到 EADDRINUSE。现有服务对本工作树两个已更新文件返回 200，返回字节与磁盘一致；复用现有服务，未重启或停止它；已解决。',
  '5. 收录后 ignore 检查输出 84 个字体。当前未解决，按方案停下。这是未继续构建与完整验收的原因。', '',
  '## 待决定', '',
  '需要决定如何同时保留上游 `.gitignore` 的原字节和原路径，并使 84 个必需字体进入最终收录。当前方案规定的根 ignore 修改无法满足这两个条件。', '',
  '可选处理是允许对本次最终收录文件进行范围明确的 `git add -f`（不提交、不推送），让所需字体进入索引；这会改变暂存区状态。另一类处理需要修改方案对上游 `.gitignore` 存放位置或作用方式的要求。当前未选择、未执行任何一种。', '',
  '决定之后仍需完成 build / check / build:site、独立字节核对、完整既有 smoke、两次 24 样片 GPU smoke、MAD 与目视检查、两段音画抽查、check-pages 和截图；当前不能宣称 B1 验收通过。', '',
  '## 被忽略文件完整清单', '',
  '[原命令输出](../wip/Tres/evidence/lemo-ignored-files.txt) · [逐项匹配规则](../wip/Tres/evidence/lemo-ignore-rules.txt)', '',
  '```text', ...ignored, '```', '',
];
fs.mkdirSync('dev/reports', { recursive: true });
fs.writeFileSync('dev/reports/Tres-b1.md', lines.join('\n'));
console.log(JSON.stringify(summary, null, 2));
console.log('报告已写入 dev/reports/Tres-b1.md');
