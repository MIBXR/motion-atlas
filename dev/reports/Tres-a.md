# 资源库第一阶段实施报告

工作树：.worktrees/resources；分支：feat/resources；基线：4ec9308bfb47ee2a6581649bdf53e09e10933790。

资源收录与实现已完成；严格剪贴板回读验收尚未通过，具体平台行为与待决定项见下文。

未 commit、未 push、未切分支；demos/、entries/、kit/、vendor/ 没有修改。lemo-opuscar 未收录、未修改。初始已有的 dev/wip/Tres/plan-a.md 与 codex-a 日志保留。

## 第 1–6 节核对

| 方案项 | 状态 | 结果 |
| --- | --- | --- |
| 1.1 .gitattributes | 已做 | 末尾 resources/** -text，收录文件不做文本换行转换。 |
| 1.2 CLI 名称、commit、可选 fetched | 已做 | vendor-resources.mjs 接受三个固定名称；默认本地当天日期；三次实跑均明确传入 2026-10-24。 |
| 1.2 固定目录与 excluded | 已做 | opus-videos 与 agent-anime-skill 仅排除 .git/；garden-skills 排除 .git/、.github/、website/；清单内 excluded 文案照方案。 |
| 1.2 清空、相对路径、逐字节复制与长路径 | 已做 | 固定目标位于 resources/ 后清空；fs.cpSync 与命名空间路径复制；1137 个上游文件实测一致。 |
| 1.2 UPSTREAM 字段与格式 | 已做 | 三份清单字段齐全，JSON 2 空格缩进、末尾换行。 |
| 1.2 files 排序、bytes、sha256、自身排除 | 已做 | path 升序、正斜杠、逐文件字节数与 SHA256；不包含 UPSTREAM.json 自身；R2 通过。 |
| 1.2 license、notice 与 README/LICENSE | 已做 | 按方案原文写入许可与声明；上游 README、现有 LICENSE 随原文件收录，未改写原文。agent-anime-skill 上游未附 LICENSE。 |
| 1.2 三次指定提交、日期及统计输出 | 已做 | 707 / 423 / 7 文件，1675403 / 5485564 / 43774 字节；提交与日期见下表。 |
| 1.3 静态构建复制 resources | 已做 | build-static.mjs 目录列表包含 resources；dist/resources 实际 1140 文件。 |
| 2.1 buildResources 与 data/resources.js | 已做 | buildAll 生成 window.MA_RES；703 条视频与恰好 7 个指定 Skill。 |
| 2.1 视频字段原文映射 | 已做 | title 缺失为 null；author/URL/remake/category/tags/poster/added 按方案映射；未放入全文 prompt。 |
| 2.1 partial 判定与报错 | 已做 | none 496、part 5、post 202；无对应声明时构建抛错。 |
| 2.1 excerpt 规则 | 已做 | 折叠空白、去首尾空白、Array.from 截前 200 字；截断时加省略号。 |
| 2.1 视频排序 | 已做 | added 降序，同日 slug 升序。 |
| 2.1 Skill 发现与排除 | 已做 | 递归寻找 SKILL.md，排除 references/assets/templates 路径中的入口。 |
| 2.1 frontmatter name / description | 已做 | 解析包裹引号与 > / \| 块标量；当前七份 description 均非空。 |
| 2.1 Skill 字段、文件列表与排序 | 已做 | 上游字段按方案截取；文件路径相对 Skill 目录、含 bytes 并排序；garden-skills 在前，repo 内按 id。 |
| 2.1 恰好指定七 Skill | 已做 | beautiful-article、gpt-image-2、kb-retriever、motion-showreel、web-design-engineer、web-video-presentation、ai-handdrawn-video；R4 通过。 |
| 2.2 README 计数块 | 已做 | 现有三项之后追加 703 条视频提示词、7 个 Skill，分隔符一致。 |
| 2.2 Agent resources 字段 | 已做 | 位于 counts 后，视频数据/目录/许可与七个 Skill 路径、许可完整。 |
| 2.2 resources 不计入 contentVersion | 已做 | 独立复算确认版本输入仍只有案例与巧思资料包摘要；基线生成物差异见下文。 |
| 2.2 docs/resources.md 自动收入文档中心 | 已做 | 已由 build 写入 data/docs.js。 |
| 3 R1 | 已做 | 三目录清单与全部必需字段、名称检查通过。 |
| 3 R2 | 已做 | 清单内存在性、bytes、sha256，以及目录无清单外文件全部通过。 |
| 3 R3 | 已做 | JSON slug 与 703 份 prompt Markdown 双向核对通过。 |
| 3 R4 | 已做 | 指定七 Skill、无重复、description 非空检查通过。 |
| 3 R5 | 已做 | resources.js 已纳入现有生成物重建一致性检查；check 退出 0。 |
| 4.1 先提取共享渲染器 | 已做 | render/resolve 及原辅助实现位于 markdown.js，对外 MAMarkdown；docs.js 调用共享 render。 |
| 4.1 opts.link、默认行为与图片路径 | 已做 | 可选链接回调沿递归传递；图片仍用原解析规则；原默认渲染行为已比较。 |
| 4.1 加载顺序与三篇零像素差 | 已做 | markdown.js 先于 docs.js；三对 1440×900 PNG 字节一致，差异像素 0，基线六图均已查看。 |
| 4.2 页面结构、元信息与加载顺序 | 已做 | resources.html 使用指定 title/description、三份 CSS、body data-page、壳与四份脚本顺序。 |
| 4.2 复用类、颜色及字号 | 已做 | 复用 lib/docs/card 等现有类；新颜色均来自 CSS 变量；11 个截图视图 DOM 文本最小字号均 12px。 |
| 4.2 NAV 与页脚 | 已做 | site.js 只改 NAV，在巧思库后插入资源库；页脚代码未修改。 |
| 4.3 列表、视频、Skill 及文件 hash 路由 | 已做 | 视频与 Skill 入口均已打开；242 份 Skill Markdown 阅读视图全部加载。 |
| 4.3 replaceState、筛选及滚动恢复 | 已做 | 筛选/搜索/排序写回 hash；独立检查恢复 #videos?cat=3d&sort=author、96 张卡及 620px 滚动。 |
| 4.4 布局、页头与切换 | 已做 | 指定文案、无 heroArt，视频 703 / Skills 7 两段切换，当前段 aria-current。 |
| 4.4 侧栏分组、标签、完整度及条件计数 | 已做 | 四类、13 个原文标签按频次、三种完整度及 side-foot；逐步筛选结果 117、33、23，与 MA_RES 独立计算一致。 |
| 4.4 工具栏、搜索、排序及结果文案 | 已做 | 移动筛选、原文 placeholder、author/title/excerpt 子串搜索、added/author 排序；搜索与 URL 检查通过。 |
| 4.4 卡片结构与失败图片处理 | 已做 | 16:9 封面、三位序号、标题回退、作者、三行摘要、tags/partial chips；整卡链接。 |
| 4.4 48 张分页与重置 | 已做 | 首轮 48、追加后 96、筛选变化重置 48，均通过。 |
| 4.5 视频详情八项内容 | 已做 | 返回、日期分类、标题、chips、操作、封面、Markdown 正文及来源说明；5 条详情均有 Prompt h2 与代码块。 |
| 4.5 JSON 原文缓存、Site.copy 与回读 | 偏离（原因） | 五条写入参数均与 JSON 原文严格相等；Windows 原生 API 把 LF 转 CRLF，回读严格相等仅 1/5；尚未获准调整验收规则。 |
| 4.5 外链、封面失败隐藏与正文失败文案 | 已做 | 原帖/复刻新标签与 noopener，null 无复刻按钮；正文失败文案与封面错误隐藏已实现。 |
| 4.6 Skill 列表 | 已做 | 页头切换、来源分组、搜索、SKILL 占位、四行说明、文件数及许可 chips；来源 6/1 实测通过。 |
| 4.7 顶部信息、许可和原样声明 | 已做 | 最大宽 1440px；上游提交链接与许可；ai-handdrawn-video 两行声明原样显示，截图已查看。 |
| 4.7 三栏、文件树、字节数与高亮 | 已做 | 沿用 docs 网格与断点；按路径分组、根为 /，非 Markdown 直链带字节数，当前文件高亮。 |
| 4.7 正文、链接分流与 doc-path | 已做 | 242 份 Markdown 均打开，353 次站内链接/图片引用、253 个唯一 URL；3 个已知上游 404，无其他 404。 |
| 4.7 本页目录 | 已做 | 同 docs 的 heading 目录及滚动观察，截图中的目录与当前文件匹配。 |
| 4.8 移动端 | 已做 | ≤900px 筛选展开；Skill 阅读复用 docs 断点；390×844 三处 scrollWidth 都为 390。 |
| 5.1 资源文档指定全文 | 已做 | docs/resources.md 按方案全文写入，更新命令与署名保留。 |
| 5.2(1) README 案例指定替换 | 已做 | 表格与三段说明按方案替换。 |
| 5.2(2) README 外部资源小节 | 已做 | 放在“收录内容”末尾、下个二级标题之前。 |
| 5.2(3) 其余 FIELDWORK / 17s | 已做 | 指定替换之后检索无其他匹配，未额外改写 README。 |
| 5.3 AGENT.md 指定句子 | 已做 | 放在“检索”条目描述 catalog.json 的段落之后，未使用文件末尾回退。 |
| 6.1 构建、check、静态构建及 dist 数量 | 已做 | 依次执行均退出 0；dist/resources 为 1140 = 1137 + 3。 |
| 6.2 独立逐字节核对 | 已做 | 1137 一致、0 不一致、0 缺失、0 额外；逐文件独立计算上游与收录 SHA256。 |
| 6.3 4328 服务器 | 已做 | 逐字节核对后按原命令启动，仅使用 4328。 |
| 6.4 收录后连续两次 smoke | 已做 | 在收录与构建完成之后重跑，均为 smoke 25/25 passed，执行脚本退出 0。 |
| 6.5 check-pages (a)–(g) | 偏离（原因） | 所有断言均已执行；4 个复制严格回读断言失败，其余通过，脚本退出 1。 |
| 6.6 十一张截图逐张打开 | 已做 | 8 张 1440×900、3 张 390×844，实际尺寸核对且每张均已打开查看。 |
| 6.7 分项报告、证据及待决定 | 已做 | 本报告记录最终实测状态，已删除已解决阻碍。 |

## 收录与逐字节核对

| 名称 | 提交 | fetchedAt | 文件数 | 原文件字节数 |
| --- | --- | --- | ---: | ---: |
| opus-videos | 92aee2f586ac0715cb3cbcb6384834f98a33383d | 2026-10-24 | 707 | 1675403 |
| garden-skills | 7a6d5a72e4f44bb4cc0c23c01b3d97205c723b68 | 2026-10-24 | 423 | 5485564 |
| agent-anime-skill | c643fe2409322d9d879c55e173d18ef876e7221d | 2026-10-24 | 7 | 43774 |

收录文件合计 1137 个、7204741 字节，另有 3 份 UPSTREAM.json。所有 resources/ 文件只由 vendor-resources.mjs 写入。

| 名称 | SHA256 一致 | 不一致 | 缺失 | 额外 |
| --- | ---: | ---: | ---: | ---: |
| opus-videos | 707 | 0 | 0 | 0 |
| garden-skills | 423 | 0 | 0 | 0 |
| agent-anime-skill | 7 | 0 | 0 | 0 |
| 合计 | 1137 | 0 | 0 | 0 |

执行：node dev/wip/Tres/tools/verify-vendor.mjs，退出 0。证据：[vendor-comparison.json](../wip/Tres/evidence/vendor-comparison.json)。

## 构建与静态产物

在本工作树根目录、已核实的 Git Bash 中按顺序执行：

1. node scripts/build.mjs：退出 0，3 cases / 22 patterns / 5 files updated。
2. node scripts/check.mjs：退出 0，22 source files scanned / kit copies 25，含 R1–R5。
3. npm run build:site：退出 0，static site ready · dist/。
4. dist/resources/：实际 1140 文件，预期 1140；退出 0。
5. 上游逐文件 SHA256 核对：退出 0。
6. node scripts/serve.mjs --port 4328：启动成功。
7. 下述两次 smoke、check-pages、截图与报告。

环境入口为显式定位的 C:/Program Files/Git/bin/bash.exe；实际 Bash 5.2.37、GNU tar 1.35，node 解析到 /c/nvm4w/nodejs/node；本任务未使用 Python、未打 tar 包、未发布。

构建前 25 个 kit 副本与源文件逐字节相同，没有触发 Demo 同步写入。dist 数量证据：[dist-count.json](../wip/Tres/evidence/dist-count.json)。

## 收录之后的两次 smoke

原命令保持不变，在收录、构建、逐字节核对与服务器启动之后连续执行：

```
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4328
```

第 1 次：退出 0，结果行：

```
smoke 25/25 passed
```

完整日志：[smoke-after-vendor-1.log](../wip/Tres/evidence/smoke-after-vendor-1.log)。

第 2 次：退出 0，结果行：

```
smoke 25/25 passed
```

完整日志：[smoke-after-vendor-2.log](../wip/Tres/evidence/smoke-after-vendor-2.log)。

资源库未加入 smoke 条目。档案终端输出的既有 5.3px 情况按用户要求不处理。

## check-pages 全部断言

执行：node dev/wip/Tres/tools/check-pages.mjs；退出 1。

| 断言 | 结果 | 实测详情 |
| --- | --- | --- |
| (a) 视频列表无控制台错误 | PASS | [] |
| (a) 共 703 条 | PASS | 通过 |
| (a) 首屏 48 张卡 | PASS | 通过 |
| (b) cat=3d | PASS | {"actual":117,"expected":117} |
| (b) tag=shader | PASS | {"actual":33,"expected":33} |
| (b) full=post | PASS | {"actual":23,"expected":23} |
| (c) 703 份提示词文件全部 200 | PASS | {"count":703,"failed":[]} |
| (d) 0xcodez-474136 · Prompt h2 / 代码块 | PASS | 通过 |
| (d) 0xcodez-474136 · 复制原文 | FAIL | {"originalLength":700,"copiedLength":708,"equalAfterCRLFToLF":true} |
| (d) charliie-334026 · Prompt h2 / 代码块 | PASS | 通过 |
| (d) charliie-334026 · 复制原文 | PASS | {"originalLength":35,"copiedLength":35,"equalAfterCRLFToLF":true} |
| (d) 0xlangeai-597929 · Prompt h2 / 代码块 | PASS | 通过 |
| (d) 0xlangeai-597929 · 复制原文 | FAIL | {"originalLength":106,"copiedLength":110,"equalAfterCRLFToLF":true} |
| (d) ajith-io-615243 · Prompt h2 / 代码块 | PASS | 通过 |
| (d) ajith-io-615243 · 复制原文 | FAIL | {"originalLength":319,"copiedLength":322,"equalAfterCRLFToLF":true} |
| (d) 0xlangeai-178533 · Prompt h2 / 代码块 | PASS | 通过 |
| (d) 0xlangeai-178533 · 复制原文 | FAIL | {"originalLength":22,"copiedLength":24,"equalAfterCRLFToLF":true} |
| (e) 所有 Skill Markdown 阅读视图与站内链接/图片 | PASS | {"skills":7,"markdownCount":242,"linkCount":353,"uniqueURLs":253,"known404":3,"unexpected404":[]} |
| (f) Markdown 提取前后 guide · 1440×900 | PASS | {"differingPixels":0,"documentHTMLIdentical":true} |
| (f) Markdown 提取前后 pipeline · 1440×900 | PASS | {"differingPixels":0,"documentHTMLIdentical":true} |
| (f) Markdown 提取前后 archive-os · 1440×900 | PASS | {"differingPixels":0,"documentHTMLIdentical":true} |
| (g) 390×844 #videos | PASS | {"scrollWidth":390} |
| (g) 390×844 #video/0xcodez-474136 | PASS | {"scrollWidth":390} |
| (g) 390×844 #skill/motion-showreel | PASS | {"scrollWidth":390} |
| 分页追加 48 张 | PASS | 通过 |
| 详情返回恢复筛选、分页与滚动位置 | PASS | {"saved":{"hash":"#videos","scroll":620,"cards":96,"detail":"#video/0xcodez-474136"},"restored":{"hash":"#videos","scroll":620,"cards":96}} |
| 移动端筛选按钮展开侧栏 | PASS | 通过 |
| 筛选变化重置为 48 张 | PASS | 通过 |
| 搜索、作者排序与 replaceState 筛选 URL | PASS | {"expected":3,"actual":3,"ordered":true,"hash":"#videos?cat=3d&q=shader&sort=author"} |
| Skill 来源 agent-anime-skill | PASS | 通过 |
| Skill 来源 garden-skills | PASS | 通过 |
| 界面字号 1440 #videos | PASS | {"minFontPx":12} |
| 界面字号 1440 #videos?cat=3d | PASS | {"minFontPx":12} |
| 界面字号 1440 #video/0xcodez-474136 | PASS | {"minFontPx":12} |
| 界面字号 1440 #video/0xlangeai-597929 | PASS | {"minFontPx":12} |
| 界面字号 1440 #skills | PASS | {"minFontPx":12} |
| 界面字号 1440 #skill/motion-showreel | PASS | {"minFontPx":12} |
| 界面字号 1440 #skill/ai-handdrawn-video | PASS | {"minFontPx":12} |
| 界面字号 1440 #skill/web-video-presentation/references/CHAPTER-CRAFT.md | PASS | {"minFontPx":12} |
| 界面字号 390 #videos | PASS | {"minFontPx":12} |
| 界面字号 390 #video/0xcodez-474136 | PASS | {"minFontPx":12} |
| 界面字号 390 #skill/motion-showreel | PASS | {"minFontPx":12} |
| 资源页全程无 JavaScript 控制台错误 | PASS | [] |

主结果：[check-pages.json](../wip/Tres/evidence/check-pages.json)。筛选结果为 117 → 33 → 23；703 个 prompt 全部 HTTP 200。七个 Skill 的 242 份 Markdown 均打开，353 次站内链接/图片引用，253 个唯一 URL，已知上游 404 为 3 个，其他 404 为 0。全程 JavaScript 控制台错误为 0。

详情返回的额外独立检查实际恢复了 #videos?cat=3d&sort=author、96 张卡及 620px 滚动，证据：[navigation-restoration.json](../wip/Tres/evidence/navigation-restoration.json)。

## 剪贴板原文核对

| slug | 类型 | 写入参数等于 JSON | 原长度 / 回读长度 | 严格回读 | 仅 CRLF→LF 后 |
| --- | --- | --- | --- | --- | --- |
| 0xcodez-474136 | none | true | 700 / 708 | false | true |
| charliie-334026 | part | true | 35 / 35 | true | true |
| 0xlangeai-597929 | post | true | 106 / 110 | false | true |
| ajith-io-615243 | none | true | 319 / 322 | false | true |
| 0xlangeai-178533 | post | true | 22 / 24 | false | true |

五条按钮写入参数均与 JSON 原文严格相等。包含换行的四条在 Windows 原生剪贴板回读时 LF 转为 CRLF；其余字符及尾部换行未丢失。最小复现 Site.copy("a\nb") 回读 "a\r\nb"，严格断言失败；直接调用原生 Clipboard API 同样如此，且 Site.copy 未进入回退路径。

证据：[clipboard-minimal.json](../wip/Tres/evidence/clipboard-minimal.json)、[clipboard-boundaries.json](../wip/Tres/evidence/clipboard-boundaries.json)、[prompt-copy-boundaries.json](../wip/Tres/evidence/prompt-copy-boundaries.json)。探针转发真实 Clipboard API，没有模拟剪贴板输出；未修改资源原文、页面复制逻辑或 Site.copy。

[W3C Clipboard API 规范](https://www.w3.org/TR/clipboard-apis/)要求按平台惯例规范化换行；[Chromium 剪贴板文档](https://chromium.googlesource.com/chromium/src.git/+/HEAD/ui/base/clipboard/)明确说明 Windows 文本会在换行中带回车。目前仍保留方案中的逐字符严格断言，没有自行把还原 CRLF 的结果记作通过。

## Markdown 提取零像素差

比较的是第 4.1 节提取渲染器前后保存的完整 1440×900 截图；随后才增加资源库导航及资源文档。没有裁切或掩盖导航区域。

| 文档 | 提取前 | 提取后 | 差异像素 |
| --- | --- | --- | ---: |
| docs/guide.md | [前](../shots/Tres/docs-before-guide.png) | [后](../shots/Tres/docs-after-guide.png) | 0 |
| docs/pipeline.md | [前](../shots/Tres/docs-before-pipeline.png) | [后](../shots/Tres/docs-after-pipeline.png) | 0 |
| prompts/cases/archive-os.md | [前](../shots/Tres/docs-before-archive-os.png) | [后](../shots/Tres/docs-after-archive-os.png) | 0 |

三对 PNG 字节完全一致，article HTML 也一致；六张图均已打开查看。本轮 check-pages 的 (f) 再次比较通过。

## 上游缺失文件清单

本轮实际 HTTP 404 如下，均对应 inventory 已列明的缺失，不计入失败；没有补写、删除或改写上游链接。

| 已知上游缺失路径 | HTTP | 引用位置 |
| --- | --- | --- |
| resources/skills/garden-skills/demo/web-design-engineer-demo/README.md | 404 | web-design-engineer/README.md；web-design-engineer/README.zh-CN.md |
| resources/skills/garden-skills/skills/web-video-presentation/references/PRINCIPLES.md | 404 | web-video-presentation/README.md；web-video-presentation/README.zh-CN.md |
| resources/skills/garden-skills/skills/web-video-presentation/references/PATTERNS.md | 404 | web-video-presentation/README.md；web-video-presentation/README.zh-CN.md |

inventory 另外列出的未附带项为 demo/web-design-engineer-demo/ 目录、website/gpt-image2-website/LICENSE、website/gpt-image2-website/public/case/ 中的案例图片、dist/prompt/claude-design-system-prompt.md；其中 website/ 整体不收录。它们没有在本轮七个 Skill 正文链接中额外产生新的 404。

## 截图索引

以下 11 张均已逐张打开查看，PNG 实际尺寸与要求一致；桌面/移动端布局与文字均可读，三处移动端文档宽度实测为 390。

| 截图 | 路由 | 实际尺寸 / 查看 |
| --- | --- | --- |
| [1440-videos.png](../shots/Tres/1440-videos.png) | #videos | 1440×900；已打开查看；最小字号 12px |
| [1440-videos-3d.png](../shots/Tres/1440-videos-3d.png) | #videos?cat=3d | 1440×900；已打开查看；最小字号 12px |
| [1440-video-title.png](../shots/Tres/1440-video-title.png) | #video/0xcodez-474136 | 1440×900；已打开查看；最小字号 12px |
| [1440-video-post.png](../shots/Tres/1440-video-post.png) | #video/0xlangeai-597929 | 1440×900；已打开查看；最小字号 12px |
| [1440-skills.png](../shots/Tres/1440-skills.png) | #skills | 1440×900；已打开查看；最小字号 12px |
| [1440-skill-motion-showreel.png](../shots/Tres/1440-skill-motion-showreel.png) | #skill/motion-showreel | 1440×900；已打开查看；最小字号 12px |
| [1440-skill-ai-handdrawn-video.png](../shots/Tres/1440-skill-ai-handdrawn-video.png) | #skill/ai-handdrawn-video | 1440×900；已打开查看；最小字号 12px |
| [1440-skill-chapter-craft.png](../shots/Tres/1440-skill-chapter-craft.png) | #skill/web-video-presentation/references/CHAPTER-CRAFT.md | 1440×900；已打开查看；最小字号 12px |
| [390-videos.png](../shots/Tres/390-videos.png) | #videos | 390×844；已打开查看；最小字号 12px |
| [390-video-title.png](../shots/Tres/390-video-title.png) | #video/0xcodez-474136 | 390×844；已打开查看；最小字号 12px |
| [390-skill-motion-showreel.png](../shots/Tres/390-skill-motion-showreel.png) | #skill/motion-showreel | 390×844；已打开查看；最小字号 12px |

查看记录：[screenshot-review.json](../wip/Tres/evidence/screenshot-review.json)。

## 生成物与边界

agent/cases/industrial-protocol.json 的基线清单含本工作树中不存在、且已被 Git 忽略的 assets/gen/_v1/ 下 16 个文件记录。按原构建规则重建后，这些不存在的记录不再进入生成资料包，导致 contentVersion 从 c17ca94f5360cd2743996071ead92181a825a40ab5b5f1eeea8398c0299662a3 变为 38681a12b64127f11e5ac0a10507951bfe79a2e0079d59bd324ba550ea347d40。没有修改 Demo 文件或扩大构建规则。

独立复算确认 contentVersion 仍仅取案例/巧思资料包摘要，resources 不在版本输入中。证据：[catalog-result.json](../wip/Tres/evidence/catalog-result.json)。这项变化属于已允许的构建生成物同步。

## 阻碍

当前仅有复制回读的验收规则未决：原生 Windows Clipboard API 规范化 LF 为 CRLF，主检查的四个严格相等断言失败；资源内容和复制调用参数均未被改写。

## 待决定

是否允许仅在验收中把回读的 CRLF 还原为 LF，再严格比较其余字符与尾部换行？当前未取得这一调整的明确答复，因此保留严格断言及退出码 1。原文与应用复制实现保持不变。
