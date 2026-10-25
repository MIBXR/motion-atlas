# Tcopy 实施与验证报告

工作树：`.worktrees/copy`。分支：`feat/visitor-copy`。基准：`a452ea4b9af1b3026612009521d50588c5bbbb66`，与开始时的本地`origin/main`一致。没有提交、推送、切分支或发布。

案例、分类、侧栏与文案主体及返工1已完成。参数清单豁免字数，地图画面细节按Demo重写，载体说明已同步，舞台字号按用户决定不设下限。本轮没有待决定事项。所有验证结论均来自本工作树本轮执行；未把历史状态当作当前验证。

## 逐节核对表

| 方案 | 项目 | 状态 | 说明 |
| --- | --- | --- | --- |
| 0 | 工作树、分支、基准与本地端口 | 已做 | .worktrees/copy；feat/visitor-copy；HEAD与本地origin/main均为a452ea4；4326 |
| 0 | 访客视角与禁用词 | 已做 | 检查范围内0个非例外命中；允许例外逐条列在下方 |
| 1.1 | 删除industrial-protocol条目、Demo、预览与研究 | 已做 | 指定目录与文件全部删除 |
| 1.2 | 删除派生的5个巧思、Demo与预览 | 已做 | chamfer-panel、text-scramble、conveyor-flow、hold-confirm、scanline-wipe |
| 1.3 | 逐个清除6个id的残留引用 | 已做 | 修改前后均运行grep -rnI；非dev仓库文件最终0行命中；逐行处理清单见下方 |
| 1.3 | 清除patternIds与组合关系 | 已做 | 过滤删除项；构建校验通过；保留条目中没有额外待清理关联 |
| 1.4 | 研究笔记移出站点 | 已做 | git mv到dev/research/；两篇正文未改；docs/research已不存在 |
| 1.5 | 案例字段与巧思sources精简 | 已做 | 案例删除5个字段；巧思sources仅含caseId |
| 2.1 | taxonomy只保留2种载体，删除来源与等级组 | 已做 | video / console；9种巧思类型保留 |
| 2.2 | 全部条目移除showcase | 已做 | 地图video、档案console；17个巧思均有非空载体 |
| 2.3 | 校验规则与双向案例关联 | 已做 | 删除旧字段校验；caseId存在与patternIds反向包含继续检查 |
| 2.4 | 更新Agent摘要和资料包、清理生成物 | 已做 | documents.research与摘要source/evidence均删除；旧条目agent/prompts由build清理 |
| 2.5 | 档案终端39点能量曲线 | 已做 | 数值与方案逐项一致；列表和详情原本都按数组实际长度铺满，无30点假设，绘制公式未改 |
| 2.6 | 文档收录、分组与排序 | 已做 | 24篇：指南5、案例Prompt2、巧思Prompt17；指南按指定顺序；不收录根目录说明和研究 |
| 2.6 | Prompt标题简化 | 已做 | 生成标题仅为条目名称 |
| 2 | 同步所有读取旧字段的调用方 | 已做 | home、library、agent指令生成器与atlas CLI均不再读取删除的taxonomy字段 |
| 3.1 | 侧栏仅收藏与工具4项，删除side-foot | 已做 | 收藏、导出、导入、跳转另一库；保留收藏计数 |
| 3.1 | 工具栏筛选与aria-label | 已做 | 案例：载体；巧思：类型、载体、所属案例；均用select样式 |
| 3.1 | 编号/名称排序与URL | 已做 | 默认order省略；名称用sort=title；source删除；carrier/type/case往返恢复 |
| 3.1 | 卡片与搜索删除来源 | 已做 | 案例卡片只显示载体chip；搜索不再读取来源taxonomy |
| 3.2 | 删除来源章节、evBadge及调用 | 已做 | 详情无SOURCES章节与等级标签 |
| 3.2 | 巧思所属案例标题链接 | 已做 | 沿用现有有效路由cases.html#case/<id>，一行显示所属案例 |
| 3.2 | 画面细节/DETAILS | 已做 | 继续读取observations |
| 3.3 | 文档使用lib-side/side-group/side-list | 已做 | 共享高亮样式；目录无count |
| 3.3 | 文档搜索与移动端开合 | 已做 | field+SVG搜索图标；全部文档（24）；断点与案例库一致为980px |
| 3.3 | 保留正文与本页目录，移除旧侧栏样式 | 已做 | Markdown正文与右侧目录机制保留；docs-side/docs-search/docs-toggle旧规则已删除 |
| 4 | 首页定稿、两张载体卡、导语、页脚与链接 | 已做 | 按C003、C006等指定文本替换；C022及未列出的界面文本保持 |
| 4 | 列表、加载、自适应说明与文档空态 | 已做 | 编号、收藏与工具、清除筛选、正在载入、还没有文档等定稿生效 |
| 5.1–5.2 | 两个案例与17个巧思的访客文案 | 已做 | 直接改entries；开发来源文字删除；只描述画面、作用和使用 |
| 5.3–5.4 | 保留数值、id、结构与数组顺序 | 已做 | 除方案指定结构删除与energy外，数值字段未变；参数清单保留全部时刻 |
| 5.5 | 全部文字长度上限 | 已做 | 返工1按答复豁免migration参数清单；其余文字长度检查0项超限 |
| 5.6–5.7 | Prompt参数与作品名称 | 已做 | Prompt保留设计参数，清除来源和过程措辞；作品与地名保留 |
| 5 | content-diff.md | 已做 | 首轮430个条目字段变化，并附节奏实验室改写；本轮在末尾追加返工1 |
| 6.1 | 五篇指南与README面向使用者改写 | 已做 | 清除来源、内部过程与已删内容；保留播放、定位、导出、检查的用法 |
| 6.2 | 条目结构文档 | 已做 | 按字段、页面位置与用途说明案例和巧思 |
| 6.3 | 渲染管线 | 已做 | 保留运行与视频导出命令、时间轴、声音、加载与检查；去掉测量过程和研究链接 |
| 6.4 | 使用指南两种载体 | 已做 | 筛选与文档中心说明同步；删除来源等级章节 |
| 6.5 | README案例表、两段定稿与计数 | 已做 | 表为案例/载体/时长；build更新2/17/2；巧思类型计数按剩余条目计算 |
| 6.6 | AGENT/CONTRIBUTING字段说明 | 已做 | 移除案例来源、等级和研究资料包说明；巧思仅caseId；其余说明按要求不动 |
| 6.6 | AGENT/CONTRIBUTING中的showcase说明 | 已做 | 返工1按答复删除第三载体示例与速查项，仅保留video和console |
| 6.7 | docs-diff.md | 已做 | 8份文件、37个连续删改区段 |
| 7 | 节奏实验室标记文案 | 已做 | 只改标记的说明和导出文案；保留参数；默认导出最长一句39字 |
| 8.1 | build / check / build:site | 已做 | 按指定顺序执行，均退出0；最终build无待更新生成物 |
| 8.2 | 连续两轮smoke | 已做 | 两次均19/19，使用指定direct-browser预载和4326端口 |
| 8.3 | banned.mjs | 已做 | 63份文件；0命中、6例外 |
| 8.4 | 桌面、手机与前后并排截图 | 已做 | 返工1重做15张并全部打开查看；9张桌面、4张手机、1张改版前、1张并排图 |
| 8.5 | check-filters.mjs | 已做 | 479/479断言；覆盖所有类型×载体×所属案例组合、排序、URL恢复 |
| 8.6 | 逐节报告与待决定 | 已做 | 本文件 |
| 9 | 保护vendor、kit和保留Demo | 已做 | 仅删除指定Demo；1012项Demo/预览文件与基线清单哈希一致 |
| 9 | 不commit、不push、不切分支 | 已做 | 分支与HEAD保持；git mv的2项移动及5份新交付文件暂存，其余过程文件不暂存 |

## 验证结果

```text
build ok · 2 cases · 17 patterns · 0 files updated
check ok · 2 cases · 17 patterns · 18 source files scanned · kit copies 19
npm run build:site → static site ready · dist/ · exit 0
smoke run 1 → smoke 19/19 passed
smoke run 2 → smoke 19/19 passed
banned 0 hits · 6 exceptions · 63 files scanned
filters 479/479 passed
structure 19/19 entries checked · 1012 baseline manifest files byte-identical · 0 failures
screenshots 15/15 opened · 13 page captures + before + comparison · 0 browser errors
git diff --check → exit 0
git diff --cached --check → exit 0
```

最终静态构建位于`dist/`；其中没有`docs/research/`或已删除条目的生成物。截图页面外层没有横向溢出，也没有采样到低于12px的可见文字。文档目录为指南、案例Prompt、巧思Prompt三组；默认指南高亮、搜索、点击切换后手机侧栏收起均正常。900px宽度也按相同断点收起侧栏。

档案终端能量曲线为39点，详情路径从x=0铺到x=1000；列表曲线从x=0铺到x=100。两个绘制点均已使用数组实际长度，不需修改公式。截图同时显示节奏结构标题和能量曲线。

两轮smoke完整输出：[`smoke-1.log`](../wip/Tcopy/smoke-1.log)、[`smoke-2.log`](../wip/Tcopy/smoke-2.log)。GPU条目均报告Intel Iris Xe / D3D11。档案终端舞台最低字号5.3px；用户已确认舞台字号不设下限，因此不调整。5个自适应巧思按脚本跳过固定画幅和舞台字号采样；页面外层仍按12px检查。

筛选详情：案例video=1、console=1；巧思10个类型选项（含全部）×3个载体选项×3个所属案例选项，逐次对照MA.patterns自行计算的id和数量。名称排序与编号恢复、默认参数省略、筛选参数往返和旧source/curated参数移除均通过。明细见[`filter-results.json`](../wip/Tcopy/filter-results.json)。

## 禁用词与例外

非例外命中：**0**。例外为词项出现次数，同一注释行可包含多个词项。

| 文件:行:列 | 词项 | 例外理由 |
| --- | --- | --- |
| README.md:93:17 | smoke | README命令行示例中的可执行脚本路径 |
| assets/lab.js:49:34 | dev/ | assets JavaScript注释，不会呈现给访客 |
| assets/lab.js:49:58 | 实测 | assets JavaScript注释，不会呈现给访客 |
| assets/lab.js:202:27 | dev/ | assets JavaScript注释，不会呈现给访客 |
| assets/lab.js:202:46 | 实测 | assets JavaScript注释，不会呈现给访客 |
| assets/lab.js:1023:35 | 驱动 | assets JavaScript注释，不会呈现给访客 |

检查脚本：[`banned.mjs`](../wip/Tcopy/tools/banned.mjs)。结果：[`banned-results.json`](../wip/Tcopy/banned-results.json)。没有把访客文案、模板输出字符串或正文中的命中归入代码例外。

## 残留引用处理清单

下表逐行列出修改前grep命中的仓库文件位置；行号属于a452ea4。dev目录按方案排除，Git元数据、依赖目录和构建目录不视为待维护源码。最终重复检索为0行命中。原始清单：[`references-before.txt`](../wip/Tcopy/references-before.txt)；结果：[`references-after.txt`](../wip/Tcopy/references-after.txt)。

| 修改前文件:行 | id | 处理方式 |
| --- | --- | --- |
| .gitignore:19 | industrial-protocol | 删除该案例专用忽略规则 |
| agent/cases/industrial-protocol.json:4 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:6 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:321 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:322 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:324 | chamfer-panel | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:325 | text-scramble | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:326 | conveyor-flow | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:327 | hold-confirm | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:328 | scanline-wipe | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:351 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:356 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:357 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:360 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:361 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:363 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:366 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:371 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:376 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:381 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:386 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:391 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:396 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:401 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:406 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:411 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:416 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:421 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:426 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:431 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:436 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:441 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:446 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:451 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:456 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:461 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:466 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:471 | industrial-protocol | 删除指定条目的整个文件 |
| agent/cases/industrial-protocol.json:476 | industrial-protocol | 删除指定条目的整个文件 |
| agent/catalog.json:145 | industrial-protocol | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:174 | chamfer-panel | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:175 | text-scramble | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:176 | conveyor-flow | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:177 | hold-confirm | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:178 | scanline-wipe | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:181 | industrial-protocol | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:593 | chamfer-panel | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:605 | industrial-protocol | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:608 | text-scramble | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:609 | scanline-wipe | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:610 | hold-confirm | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:612 | chamfer-panel | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:616 | text-scramble | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:629 | industrial-protocol | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:632 | chamfer-panel | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:633 | scanline-wipe | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:636 | text-scramble | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:640 | conveyor-flow | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:654 | industrial-protocol | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:657 | chamfer-panel | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:658 | hold-confirm | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:660 | conveyor-flow | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:664 | hold-confirm | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:676 | industrial-protocol | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:679 | chamfer-panel | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:680 | conveyor-flow | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:682 | hold-confirm | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:686 | scanline-wipe | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:699 | industrial-protocol | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:702 | chamfer-panel | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:703 | text-scramble | 由build重新生成，删除对应摘要、关系或文档 |
| agent/catalog.json:705 | scanline-wipe | 由build重新生成，删除对应摘要、关系或文档 |
| agent/patterns/chamfer-panel.json:4 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:6 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:50 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:51 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:52 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:58 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:63 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:69 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:74 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:75 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:79 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:81 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:84 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:89 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/chamfer-panel.json:94 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:4 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:6 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:52 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:53 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:59 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:64 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:70 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:75 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:76 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:80 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:82 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:85 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:90 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/conveyor-flow.json:95 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:4 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:6 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:50 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:51 | conveyor-flow | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:57 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:62 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:68 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:73 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:74 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:78 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:80 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:83 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:88 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/hold-confirm.json:93 | hold-confirm | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:4 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:6 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:46 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:47 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:53 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:58 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:64 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:69 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:70 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:74 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:76 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:79 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:84 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/scanline-wipe.json:89 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:4 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:6 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:52 | chamfer-panel | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:53 | scanline-wipe | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:60 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:65 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:71 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:76 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:77 | industrial-protocol | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:81 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:83 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:86 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:91 | text-scramble | 删除指定条目的整个文件 |
| agent/patterns/text-scramble.json:96 | text-scramble | 删除指定条目的整个文件 |
| data/catalog.js:2 | industrial-protocol、chamfer-panel、text-scramble、conveyor-flow、hold-confirm、scanline-wipe | 由build重新生成，删除对应摘要、关系或文档 |
| data/docs.js:2 | industrial-protocol、chamfer-panel、text-scramble、conveyor-flow、hold-confirm、scanline-wipe | 由build重新生成，删除对应摘要、关系或文档 |
| docs/research/industrial-protocol.md:15 | industrial-protocol | 删除指定条目的整个文件 |
| docs/rhythm.md:109 | hold-confirm | 删除长按确认巧思说明段落 |
| entries/cases/industrial-protocol.json:2 | industrial-protocol | 删除指定条目的整个文件 |
| entries/cases/industrial-protocol.json:107 | industrial-protocol | 删除指定条目的整个文件 |
| entries/cases/industrial-protocol.json:108 | industrial-protocol | 删除指定条目的整个文件 |
| entries/cases/industrial-protocol.json:109 | chamfer-panel、text-scramble、conveyor-flow、hold-confirm、scanline-wipe | 删除指定条目的整个文件 |
| entries/cases/industrial-protocol.json:114 | industrial-protocol | 删除指定条目的整个文件 |
| entries/patterns/chamfer-panel.json:2 | chamfer-panel | 删除指定条目的整个文件 |
| entries/patterns/chamfer-panel.json:46 | text-scramble | 删除指定条目的整个文件 |
| entries/patterns/chamfer-panel.json:47 | scanline-wipe | 删除指定条目的整个文件 |
| entries/patterns/chamfer-panel.json:48 | hold-confirm | 删除指定条目的整个文件 |
| entries/patterns/chamfer-panel.json:54 | chamfer-panel | 删除指定条目的整个文件 |
| entries/patterns/chamfer-panel.json:59 | industrial-protocol | 删除指定条目的整个文件 |
| entries/patterns/conveyor-flow.json:2 | conveyor-flow | 删除指定条目的整个文件 |
| entries/patterns/conveyor-flow.json:48 | chamfer-panel | 删除指定条目的整个文件 |
| entries/patterns/conveyor-flow.json:49 | hold-confirm | 删除指定条目的整个文件 |
| entries/patterns/conveyor-flow.json:55 | conveyor-flow | 删除指定条目的整个文件 |
| entries/patterns/conveyor-flow.json:60 | industrial-protocol | 删除指定条目的整个文件 |
| entries/patterns/hold-confirm.json:2 | hold-confirm | 删除指定条目的整个文件 |
| entries/patterns/hold-confirm.json:46 | chamfer-panel | 删除指定条目的整个文件 |
| entries/patterns/hold-confirm.json:47 | conveyor-flow | 删除指定条目的整个文件 |
| entries/patterns/hold-confirm.json:53 | hold-confirm | 删除指定条目的整个文件 |
| entries/patterns/hold-confirm.json:58 | industrial-protocol | 删除指定条目的整个文件 |
| entries/patterns/scanline-wipe.json:2 | scanline-wipe | 删除指定条目的整个文件 |
| entries/patterns/scanline-wipe.json:42 | chamfer-panel | 删除指定条目的整个文件 |
| entries/patterns/scanline-wipe.json:43 | text-scramble | 删除指定条目的整个文件 |
| entries/patterns/scanline-wipe.json:49 | scanline-wipe | 删除指定条目的整个文件 |
| entries/patterns/scanline-wipe.json:54 | industrial-protocol | 删除指定条目的整个文件 |
| entries/patterns/text-scramble.json:2 | text-scramble | 删除指定条目的整个文件 |
| entries/patterns/text-scramble.json:48 | chamfer-panel | 删除指定条目的整个文件 |
| entries/patterns/text-scramble.json:49 | scanline-wipe | 删除指定条目的整个文件 |
| entries/patterns/text-scramble.json:56 | text-scramble | 删除指定条目的整个文件 |
| entries/patterns/text-scramble.json:61 | industrial-protocol | 删除指定条目的整个文件 |
| prompts/cases/industrial-protocol.md:3 | industrial-protocol | 删除指定条目的整个文件 |
| prompts/cases/industrial-protocol.md:43 | industrial-protocol | 删除指定条目的整个文件 |
| prompts/patterns/chamfer-panel.md:3 | chamfer-panel | 删除指定条目的整个文件 |
| prompts/patterns/chamfer-panel.md:15 | chamfer-panel | 删除指定条目的整个文件 |
| prompts/patterns/conveyor-flow.md:3 | conveyor-flow | 删除指定条目的整个文件 |
| prompts/patterns/conveyor-flow.md:15 | conveyor-flow | 删除指定条目的整个文件 |
| prompts/patterns/hold-confirm.md:3 | hold-confirm | 删除指定条目的整个文件 |
| prompts/patterns/hold-confirm.md:15 | hold-confirm | 删除指定条目的整个文件 |
| prompts/patterns/scanline-wipe.md:3 | scanline-wipe | 删除指定条目的整个文件 |
| prompts/patterns/scanline-wipe.md:14 | scanline-wipe | 删除指定条目的整个文件 |
| prompts/patterns/text-scramble.md:3 | text-scramble | 删除指定条目的整个文件 |
| prompts/patterns/text-scramble.md:15 | text-scramble | 删除指定条目的整个文件 |
| README.md:23 | industrial-protocol | 删除工业协议案例表行 |

两篇研究文档通过git mv保留全文移至`dev/research/`，不再被文档中心或静态站点构建收录。原研究目录中的工业协议笔记按方案删除。

## 截图索引

返工1全部重新截图并打开查看。改版前页面由本地origin/main=a452ea4的8份Git原始文件导出到临时目录，只读启动在4327端口；没有切分支。并排图左侧为改版前，右侧为当前页面。

| 文件 | 尺寸 | 页面/状态 |
| --- | --- | --- |
| [home-desktop.png](../shots/Tcopy/home-desktop.png) | 1440×900 | 首页 |
| [cases-desktop.png](../shots/Tcopy/cases-desktop.png) | 1440×900 | 案例库 |
| [patterns-desktop.png](../shots/Tcopy/patterns-desktop.png) | 1440×900 | 巧思库 |
| [docs-after.png](../shots/Tcopy/docs-after.png) | 1440×900 | 文档中心改版后 |
| [lab-desktop.png](../shots/Tcopy/lab-desktop.png) | 1440×900 | 节奏实验室 |
| [agent-desktop.png](../shots/Tcopy/agent-desktop.png) | 1440×900 | Agent工作流 |
| [archive-rhythm-desktop.png](../shots/Tcopy/archive-rhythm-desktop.png) | 1440×900 | 档案终端详情，节奏结构与39点能量曲线 |
| [map-details-desktop.png](../shots/Tcopy/map-details-desktop.png) | 1440×900 | 地图巡礼详情，画面细节与分屏印章 |
| [pattern-detail-desktop.png](../shots/Tcopy/pattern-detail-desktop.png) | 1440×900 | 滚动数字巧思详情 |
| [cases-mobile-collapsed.png](../shots/Tcopy/cases-mobile-collapsed.png) | 390×844 | 案例库，收藏与工具收起 |
| [cases-mobile-expanded.png](../shots/Tcopy/cases-mobile-expanded.png) | 390×844 | 案例库，收藏与工具展开 |
| [docs-mobile-collapsed.png](../shots/Tcopy/docs-mobile-collapsed.png) | 390×844 | 文档中心，侧栏收起 |
| [docs-mobile-expanded.png](../shots/Tcopy/docs-mobile-expanded.png) | 390×844 | 文档中心，侧栏展开 |
| [docs-before.png](../shots/Tcopy/docs-before.png) | 1440×900 | 本轮重新截取的origin/main页面 |
| [docs-comparison.png](../shots/Tcopy/docs-comparison.png) | 2880×900 | 本轮前后并排 |

## 待决定

本轮无待决定事项。此前4类事项均已按用户答复处理：参数清单保留，地图画面细节重写，仓库载体说明同步，舞台字号不调整。timing中不确定的项为0；38个删除项都与各自Demo的markers名称和时刻逐项一致。

## 阻碍、失败与处理

- 返工1截图助手在案例之间的hash导航后等待Page.loadEventFired而超时。识别同文档导航后，从地图详情续跑；此前7张本轮成功截图保留，随后6张完成。地图图像通过Demo现有render=1模式等待瓦片后重截，最终15张均已查看；站点与Demo代码未因此改动。
- 返工1首次smoke在alert-reroute检测到SwiftShader，随后8项出现fetch failed，结果10/19。HTTP服务随后均返回200，也未发现残留的本轮无头浏览器。失败日志保留在[smoke-attempt-1.log](../wip/Tcopy/rework-1/smoke-attempt-1.log)。后续单独执行完整两轮均19/19，验证恢复；没有放宽GPU判定、修改启动参数或Demo。初次浏览器异常的根因未独立确认。
- PowerShell多层引号曾使内联Node命令解析失败，默认文本读取及重定向也出现过显示乱码。改用UTF-8脚本文件、明确编码读取和Git Bash写日志后解决；源文件未发生乱码写入。
- 初版筛选脚本在一个同步任务里密集更新URL，出现URL断言失败。增加操作间隔后479项断言全部通过。原因更像浏览器对密集历史更新的限制，未据此修改站点行为；该原因属于解释，非独立验证结论。
- 辅助截图等待器曾误把aria-busy的完成态写成字符串false，实际完成时属性会被删除。修正等待条件后重新截图，最终14张全部查看。
- 额外结构脚本最初将已去掉_file的生成条目送入文件名校验，产生19条辅助断言错误。改为使用buildAll返回的原始校验结果；最终0失败。
- 最终空白检查发现README与文档对照表有多余文件尾空行，已清除；辅助页面检查的正则转义问题也已修正。最终空白检查与页面检查通过。
- 返工1按要求重新执行两轮smoke以及build/check/build:site、banned、筛选断言和全部截图；本轮没有复用上轮的测试或截图结果。

## 交付位置与Git状态

- [条目与实验室对照表](../wip/Tcopy/content-diff.md)
- [文档对照表](../wip/Tcopy/docs-diff.md)
- [禁用词脚本](../wip/Tcopy/tools/banned.mjs)
- [筛选断言脚本](../wip/Tcopy/tools/check-filters.mjs)
- 截图：`dev/shots/Tcopy/`；静态构建：`dist/`。
- HEAD与分支不变。仅git mv移动和上述5份新交付文件暂存；原有Tcopy清单、方案及临时工具/输出不暂存。截图和构建产物保持忽略。
- 本轮4326验证服务与4327只读基线服务均在验证结束后停止。没有发布。

## 返工 1

返工依据：`dev/wip/Tcopy/fix-1.md`与本轮用户指令。JSON、截图与校验均来自当前工作树。下面列出本轮验证与timing逐项判断。

```text
build ok · 2 cases · 17 patterns · 0 files updated
check ok · 2 cases · 17 patterns · 18 source files scanned · kit copies 19
build:site → static site ready · dist/ · exit 0
run 1: smoke 19/19 passed
run 2: smoke 19/19 passed
banned 0 hits · 6 exceptions · 63 files scanned
filters 479/479 passed
copy length violations: 0
rework copy check: 10 observations · 12 patterns · 5 archive patterns unchanged · 0 failures
screenshots 15/15 opened · 0 browser errors
```

禁用词例外仍为6处，位置和理由见本报告“禁用词与例外”。两份对照表均追加“返工1”，保留首轮对照。Demo、vendor和kit未改，1012项Demo与预览清单仍与基线字节一致。

### 画面细节的依据

只使用地图Demo的config.js、script.js、scenes.js与条目的rhythm.beats；没有采用其他视频内容。10条时刻为0:04.8至0:58.8；区间都在0–60秒内，每条what不超过40字，与节拍note无逐字重复。新截图位于map-details-desktop.png。

| 内容 | 依据位置 |
| --- | --- | --- |
| 四角HUD与曲名歌词 | script.js的drawHud，config.js的music与layout |
| 鸟居卡片与全屏展开 | config.js的tracks.cards，script.js的drawCards，scenes.js的sceneTorii |
| 回忆段竖排字幕与钟声 | config.js的tracks.flashback，script.js的drawFlashback与buildScore，scenes.js的sceneKamo |
| 分屏对比时间戳印章 | config.js的tracks.compare，script.js的drawCompare与buildScore |
| 误乘横幅与蜂鸣 | config.js的tracks.alert，script.js的drawAlert与buildScore |
| 3天4站、印章、目击、误乘、194km统计 | config.js的tracks.outro，script.js的drawOutro与buildScore |

### timing判断

每个删除项均在对应Demo的config.js中找到同名、同秒数的markers记录，属于片段起点，不是动作时长。共删除38项，原项名与数值完整记录于下表；各条目的“时长”和“声音 voice”共24项原样保留。不确定项：0。

| 巧思 | 删除的片段编排项 | 保留项 |
| --- | --- | --- |
| corner-hud | 顶部 HUD 入场=0s；跨天=6.6s | 时长=13.8s；声音 voice=click、kick、sub |
| vertical-title-blur | 片名=0s；地点标题=4.2s；回忆竖排字幕=7.9s；fin.=12s | 时长=14.1s；声音 voice=key、tick、bell、shimmer、sub |
| route-draw-marker | 机场=0s；描画=0.6s；第二段=4s；步行=7.2s | 时长=10.6s；声音 voice=sonar、whoosh、clack、blip、chime、tick |
| day-night-flip | 白天=0s；入夜=1.5s；天亮=4.5s | 时长=7s；声音 voice=whoosh、sub、reverse、chime |
| card-expand-fullscreen | 出卡=0s；展开=2.6s；收回=5.4s | 时长=6.6s；声音 voice=shutter、paper、whoosh、impact |
| chapter-frame | 鸭川框线入场=0s；框线退场=1.65s；奈良胶带与网点=2.45s | 时长=7.05s；声音 voice=bell、confirm |
| split-compare-stamp | 分屏=0s；盖章=1.65s | 时长=4.8s；声音 voice=whoosh、stamp、sub |
| collect-counter | 徽章出现=0s；×1 + 关空=0.8s；×2 + 京都=2.2s；×3 + 奈良=3.4s；×4 + 大阪=4.6s | 时长=6.6s；声音 voice=confirm、stamp、sparkle |
| alert-reroute | 警示=0.2s；错误终点=1.5s；改道=2.2s | 时长=6.2s；声音 voice=blip、whoosh、error、glitch。clack、alarm、beep、stamp。 |
| outro-stat-stack | 统计=0.65s；fin.=2.4s | 时长=5.2s；声音 voice=blip、tick、bell、shimmer、sub |
| seekable-timeline | 播放=0s；倒拖=2s；前跳=3.4s；再倒拖=5s | 时长=7s；声音 voice=shutter、paper、confirm、stamp、sparkle、tick |
| film-grain | 地图上的颗粒=0s；照片颗粒=2.5s；插画颗粒=5s | 时长=7.5s；声音 voice=vinyl |

### 返工 1核对表

| 要求 | 状态 | 结果 |
| --- | --- | --- |
| 1.1 参数清单豁免 | 已做 | migration[].how与返工前完全一致，长度检查按答复豁免 |
| 1.2 地图画面细节按Demo改写 | 已做 | 10条、时间排序、0–60秒、what≤40字、覆盖6类必需内容 |
| 1.3 AGENT与CONTRIBUTING载体同步 | 已做 | 只保留video和console，showcase为0 |
| 1.4 舞台字号不设下限 | 已做 | 不调整5.3px，不修改保留Demo |
| 2 档案终端focus与8条细节 | 已做 | 按定稿逐字替换并保持顺序 |
| 3 地图细节不重复节拍note | 已做 | 所有what与beats.note均不逐字相同 |
| 4.1 12个设计触发时机 | 已做 | 全部≤20字，不再使用播放/暂停/seek到时刻的说明 |
| 4.2 mechanism清除时间映射 | 已做 | day-night-flip移除案例秒数；相同组合说明同步清除；其他11条无此类映射 |
| 4.3 12个效果说明 | 已做 | 全部≤30字，并与各自summary不同 |
| 4.4 timing清理 | 已做 | 38项片段起点删除，24项参数保留；0项不确定 |
| 4 档案终端5个巧思effect检查 | 已做 | 均与summary不同，5份JSON未改 |
| 5 build/check/build:site | 已做 | 按顺序执行，均退出0 |
| 5 smoke两次 | 已做 | 两次19/19 |
| 5 banned | 已做 | 0命中、6例外，理由逐条保留 |
| 5 check-filters | 已做 | 479/479 |
| 5 全部截图与新增地图细节截图 | 已做 | 本轮15张全部打开查看 |
| 对照表追加返工1 | 已做 | content-diff与docs-diff均追加原文/新文 |
| 报告最后追加返工1核对表 | 已做 | 本节 |
| 不commit、不push、不切分支 | 已做 | HEAD与分支不变 |
