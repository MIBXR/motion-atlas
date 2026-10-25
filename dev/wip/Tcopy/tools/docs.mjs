import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const write = (p, s) => fs.writeFileSync(p, s);
let s = read('docs/guide.md');
s = s.replace('影像视频、交互操作台、交互展示台', '影像视频与交互操作台');
s = s.replace('3 个完整作品：可按载体、来源、证据等级筛选', '2 个完整作品：可按载体筛选');
s = s.replace('指南、方法、研究笔记与全部 Prompt', '指南、案例 Prompt 与巧思 Prompt');
s = s.replace('## 三种载体', '## 两种载体').replace('代表：档案终端、工业协议控制台。', '代表：莱茵生命档案终端。');
s = s.replace(/^- \*\*交互展示台.*\n/m, '');
s = s.replace('一个案例可以同时属于多种载体：例如“档案终端”既能作为可操作的界面，也能被自动驾驶的时间轴录成视频。', '地图巡礼属于影像视频，档案终端属于交互操作台。两者都可以按时间轴播放与导出视频。');
s = s.replace(/^- \*\*档案终端\*\*：.*$/m, '- **档案终端**：77.6 秒的莱茵生命档案界面，五类各八份记录。上下翻档、左右切列均首尾循环，并记住各列选择；使用方向键或按钮、Enter 读取、Escape 返回。拖动刻度条会恢复预设演示。');
s = s.replace(/^终末地工业协议.*\n/m, '档案终端的5个巧思使用自适应布局，不显示横竖画幅切换按钮。声音通过共享运行时控制。\n');
s = s.replace(/## 证据等级[\s\S]*?(?=## 本地运行)/, '');
s = s.replace(/^\| `node scripts\/smoke.mjs`.*\n/m, '');
s = s.replace(/舞台字号按设计决定，不设下限；网站界面 ≥ 12px。/g, '网站界面文字≥12px。');
s = s.replaceAll('时间驱动的 Demo', '按时间播放的Demo').replace('逐帧渲染时间驱动的 Demo', '逐帧导出Demo视频');
s = s.replace('指南、方法与研究笔记', '指南与使用方法');
write('docs/guide.md', s);

s = read('docs/rhythm.md').replace(/^长按确认（hold-confirm）.*\n/m, '');
s = s.replaceAll('由同一个音乐时钟驱动', '跟随同一个音乐时钟').replaceAll('由用户驱动', '随用户操作展开');
write('docs/rhythm.md', s);

s = read('docs/prompting.md');
s = s.replace(/^- 工业协议控制台：.*\n/m, '');
s = s.replace('动态视频 / 可操作控制台 / 展示台', '影像视频 / 交互操作台');
write('docs/prompting.md', s);

write('docs/methodology.md', `# 条目结构

案例描述一个完整作品，巧思描述一种“触发 → 效果”的手法。两者都配有参数、Prompt和可运行的Demo。

## 案例

| 内容 | 字段 | 页面位置与用途 |
| --- | --- | --- |
| 名称与简介 | \`title\`、\`subtitle\`、\`summary\` | 列表卡片和详情页开头，说明作品是什么 |
| 载体与标签 | \`carriers\`、\`tags\` | 工具栏筛选与详情标签，区分影像视频和交互操作台 |
| 设计重点 | \`focus\` | 概述，说明画面如何组织 |
| 节拍与能量 | \`rhythm.beats\`、\`energy\` | 节奏结构与舞台刻度条，定位事件并查看起伏 |
| 视觉与声音 | \`composition\`、\`tokens\` | 构成与动效参数，查看颜色、字体、版式、时长和缓动 |
| 画面分层 | \`layers\` | 画面分层，理解镜头、信息、文字与声音如何叠加 |
| 画面细节 | \`observations\` | 画面细节，按时刻或内容查看具体变化 |
| 操作与状态 | \`interaction\` | 交互与状态，了解播放、暂停、定位和手动操作 |
| Prompt | \`prompt\`、\`videoPrompt\`、\`negativePrompt\` | Prompt标签，可复制实现指令、视频指令与负向约束 |
| 复用设置 | \`migration\` | 迁移指南，了解可调整的内容与参数 |
| 适用范围 | \`useCases\`、\`avoid\`、\`constraints\` | 适用与边界，判断是否适合自己的作品 |
| 关联巧思 | \`patternIds\` | 关联巧思，打开各手法的说明和独立Demo |

节拍包含时间\`t\`、名称\`label\`与画面说明\`note\`。点击节拍时间，可在Demo中定位到相应画面。能量曲线使用0–1的等间隔采样，铺满作品时长。

## 巧思

| 内容 | 字段 | 页面位置与用途 |
| --- | --- | --- |
| 名称与简介 | \`title\`、\`summary\` | 列表卡片与详情标题，快速认识手法 |
| 类型与载体 | \`types\`、\`carriers\` | 工具栏筛选和详情标签 |
| 机制、触发与效果 | \`mechanism\`、\`trigger\`、\`effect\` | 机制，说明怎么开始、画面怎么变化 |
| 动效参数 | \`timing\` | 参数表，查看时长、缓动、错峰和幅度 |
| 实现指令 | \`prompt\` | 可复用Prompt，复制后替换内容与品牌 |
| 组合 | \`composition\` | 组合，查看骨架、支撑、点睛职责及搭配关系 |
| 可访问性 | \`accessibility\` | 可访问性，了解减少动态与键盘操作 |
| 所属案例 | \`sources[].caseId\` | 详情末尾的案例标题链接，打开完整作品 |

巧思的\`sources\`只存\`caseId\`。对应案例的\`patternIds\`包含该巧思，形成双向关联。

## Demo与Prompt

详情页上方是Demo舞台、播放按钮、刻度条和节拍点。拖动定位，或用播放与跳拍查看动作。详情正文列出参数，文档中心则将指令分为“案例Prompt”和“巧思Prompt”。

使用方法见[使用指南](guide.md)，节拍与曲线见[节奏方法](rhythm.md)，指令写法见[Prompt写法](prompting.md)，视频导出见[渲染管线](pipeline.md)。
`);

s = read('docs/pipeline.md');
s = s.replace(/^地图巡礼、莱茵生命档案终端与地图巡礼的 12 个巧思.*$/m, '地图巡礼、莱茵生命档案终端与地图巡礼的12个巧思使用固定舞台、预加载与乐谱。档案终端的5个巧思使用自适应布局与即时音效。');
s = s.replace(/^舞台字号按设计决定.*\n/m, '网站界面文字≥12px。缩放后可在页面中检查实际字号。\n');
s = s.replace(/（压力测试：[^）]*）/, '');
s = s.replaceAll('实测暂停后 ≤ 60ms 输出为数字静音、活跃声部 0。', '暂停后≤60ms输出为数字静音，活跃声部为0。');
s = s.replace('（实测与整段渲染同一区间的 RMS 相差 ≤ 0.1 dB）', '（与整段导出的同一区间RMS相差≤0.1 dB）');
s = s.replace('实测排程间隔误差 0.00ms（相对锚点按样本精度计算）', '排程间隔误差0.00ms，按样本精度对齐锚点');
s = s.replace('实现、采样规则与实测范围见 [地图研究笔记](research/map-pilgrimage.md)。', '');
const start = s.indexOf('**站点开启声音的做法（实测结论）**'), end = s.indexOf('## 七、URL 参数', start);
s = s.slice(0, start) + '**开启声音**：点击声音按钮即可开启。若显示“待启用”，点击舞台或再次点击声音按钮。嵌入页面使用`allow="autoplay"`，通过`motion:sound`接收开关状态。画幅按钮只在Demo支持多种画幅时显示，切换后保持当前时刻。\n\n' + s.slice(end);
s = s.replace('## 十、检查、冒烟与预览图', '## 十、检查与预览图');
s = s.replace(/^\| `node scripts\/smoke.mjs.*\n/m, '');
s = s.replace(/^条目设置 `"renderer": "gpu"` 时，smoke 与 capture.*$/m, '条目设置`"renderer": "gpu"`时，预览图工具使用GPU并输出WebGL renderer。若使用SwiftShader、llvmpipe、Software或Microsoft Basic Render，则检查失败。');
s = s.replaceAll('舞台字号按设计决定，不设下限；网站界面 ≥ 12px', '网站界面文字≥12px');
s = s.replace('（档案终端、工业协议）', '（档案终端）');
s = s.replaceAll('时间驱动的 Demo', '按时间播放的Demo').replaceAll('由时间轴每帧与一个 40ms 定时器共同驱动', '由时间轴每帧与一个40ms定时器共同调度');
s = s.replaceAll('未迁移的旧 Demo', '自适应Demo').replaceAll('旧版自适应 Demo（未迁移）', '自适应Demo').replaceAll('未迁移的 Demo', '自适应Demo').replaceAll('迁移到乐谱后即可导出声音', '挂接乐谱后即可导出声音');
write('docs/pipeline.md', s);

s = read('README.md');
s = s.replace('Motion Atlas · 多媒体动态视觉参考库', 'Motion Atlas · 动态视觉参考库').replace('影像视频、交互操作台、交互展示台', '影像视频与交互操作台');
const tableStart = s.indexOf('| 案例 |'), tableEnd = s.indexOf('### 巧思', tableStart);
s = s.slice(0, tableStart) + `| 案例 | 载体 | 时长 |
| --- | --- | --- |
| [地图巡礼 · 游戏过场式旅行影像](demos/cases/map-pilgrimage/) | 影像视频 | 60s |
| [莱茵生命档案终端](demos/cases/archive-os/) | 交互操作台 | 77.6s |

地图巡礼是一支 60 秒的旅行影像：从上海飞抵关西机场，走访京都伏见稻荷、鸭川、奈良公园与大阪道顿堀，横屏、竖屏两套构图。莱茵生命档案终端是一个可以操作的档案界面：开机、浏览档案阵列、读取档案、查看 3D 模型与四向翻阅，横屏构图。

两个案例都整体等比缩放，配有合成乐谱，Demo 可以拖动、跳拍、逐帧导出成视频。地图巡礼的 12 个巧思使用固定舞台与乐谱；档案终端的 5 个巧思为自适应布局。

` + s.slice(tableEnd);
const patterns = fs.readdirSync('entries/patterns').map(f => JSON.parse(read('entries/patterns/' + f)));
const count = type => patterns.filter(p => p.types.includes(type)).length;
const typesStart = s.indexOf('| 类型 |'), typesEnd = s.indexOf('## 快速开始', typesStart);
s = s.slice(0, typesStart) + `| 类型 | 数量 | 例子 |
| --- | --- | --- |
| 转场 | ${count('transition')} | 卡片展开为全屏、昼夜逐层插值 |
| 节奏与时序 | ${count('rhythm')} | 可seek时间轴、空闲呼吸 |
| 交互反馈 | ${count('feedback')} | 滚动数字、阵列选择波浪 |
| 文字动效 | ${count('type-motion')} | 竖排模糊标题、终端逐字开机 |
| 画面构成 | ${count('composition')} | 四角HUD、章节框线、分屏对比盖章 |
| 信息层HUD | ${count('hud')} | 路线描绘、收集计数 |
| 质感与后期 | ${count('texture')} | 胶片颗粒、磨砂转清 |
| 声音 / 镜头 | ${count('sound')} / ${count('camera')} | 打字音、路线跟随镜头 |

` + s.slice(typesEnd);
s = s.replace('指南、节奏方法、Prompt 写法、渲染管线、收录方法、3 篇研究笔记与全部 Prompt', '指南、节奏方法、Prompt写法、条目结构、渲染管线与全部Prompt');
s = s.replace('指南、方法与研究笔记', '指南与使用方法');
s = s.replace('scripts/            serve / build / check / smoke / capture / shot / render / frames / atlas', 'scripts/            本地播放、构建、检查、截图、视频导出与命令行工具');
s = s.replace(/舞台字号按设计决定，不设下限；网站界面 ≥ 12px。/g, '网站界面文字≥12px。');
s = s.replace('，`--strict-fonts` 将字号警告计为失败', '；`--strict-fonts`为兼容参数，不影响结果');
s = s.replace(/## 证据与版权[\s\S]*$/, '');
s = s.replaceAll('时间驱动', '按时间播放');
write('README.md', s);

s = read('AGENT.md');
s = s.replace('、研究笔记（`documents.research`）', '');
s = s.replace(/^3\. \*\*注意证据等级\*\*.*\n/m, '');
write('AGENT.md', s);
s = read('CONTRIBUTING.md');
s = s.replace(/^1\. \*\*研究\*\*：.*$/m, '1. **条目结构**：按[条目结构](docs/methodology.md)整理节拍、分层、参数、Prompt和Demo。');
s = s.replace('、`source`、`evidence`', '').replace('、`composition`、`sources`', '、`composition`').replace('、`research`。', '。');
s = s.replace('在巧思的 `sources` 里写 `{ caseId, evidence }`', '在巧思的`sources`里只写`{ caseId }`');
s = s.replace(/^\| `(source|evidence)`.*\n/gm, '');
write('CONTRIBUTING.md', s);
