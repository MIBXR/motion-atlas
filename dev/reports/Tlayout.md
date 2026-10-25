# Tlayout 实施与验证报告

工作树：`.worktrees/copy`；分支：`feat/visitor-copy`；HEAD：`507b96d88b2e3c5112edcf790ea17b9d1f359688`。复用 `http://localhost:4326` 的现有服务，没有 commit、push 或暂存操作。

## 逐节核对

| 方案节 | 状态 | 实施与证据 |
| --- | --- | --- |
| 0 背景 | 已做 | 工作树、分支、HEAD 与指定基线一致；HTTP 返回字节与本工作树一致。使用 Design Atlas 技能，参考主工作区 `dev/shots/Tlayout/design-atlas-notes.md` 和 `ref/`，参考提交为 `7b0719a9695f09b1c05281c884ca31d6e685d7f5`。取用的是站点侧栏、菜单与布局机制，没有新增素材或访客来源说明。 |
| 1 筛选位置 | 已做 | 案例库侧栏为载体组与收藏工具；巧思库侧栏为全部类型及 9 个类型。工具栏分别保留搜索＋排序、搜索＋载体＋所属案例＋排序。筛选共用 URL 状态；计数只替换本组值，保留其他筛选、搜索与收藏条件。 |
| 2 排序区分 | 已做 | `label.sort-control` 内含指定路径的 16px SVG、12px「排序」与无边框 select，accessible name 为「排序方式」。桌面巧思库有 1×24px 分隔线及左右各 4px 间距，案例库没有；1050px 以下按第 7 节使用独占排序行。 |
| 3 侧栏统一 | 已做 | 使用默认展开的原生 details/summary；12px SVG mask 加减号、隐藏原生 marker、整行可点、全站键盘焦点样式。收藏工具保持普通组。侧栏仅纵向滚动，长文字换行，计数不收缩。 |
| 4 页面撑满 | 已做 | `.lib`、`.docs` 无宽度上限，外侧 32px、侧栏 228px、列间 32px；文档右列 200px，正文保持 860px 上限并靠左。共享侧栏 margin/top/max-height。详情页使用 `16px 32px 80px`。保留 1240px、980px 断点；首页、实验室、Agent 页面外层宽度规则未改。 |
| 5 滚动条与横滚 | 已做 | 按给定的 `body *` 样式统一内部滚动条，html 保持默认。原有 11 处逐项核查如下；节拍点换行、双向 6px 间距，并删除横向滚轮与跟随逻辑。深浅主题特写均可看清指定 `var(--line)`，没有替换颜色。 |
| 6 移动菜单 | 已做 | 原 980px 断点显示 SVG＋「菜单」，位于主题按钮左侧。固定浮层复用实际侧栏节点，支持目录/全站导航、全部关闭方式及焦点返回。回桌面关闭并还原节点。向下隐藏/向上超过 8px 显示；菜单打开保持页头显示，减少动态时无过渡。旧入口及相关 JS/CSS 已删除。 |
| 7 移动页头 | 已做 | 1050px 以下隐藏示意图，标题 34px/1.15、导语 14px/1.6、页头 padding 18px 0 14px；工具栏按指定行列与 8px gap 排列。390×844 首卡顶部案例库为 502.1875px、巧思库为 554.1875px。 |
| 8 验证 | 偏离（原因） | 构建、筛选、已执行布局断言、截图与原命令两轮 smoke 见下文。案例库自然滚动上限为 672px，无法执行指定的 scrollY=1500 场景；从自然底部向上 100px 的页头恢复与菜单点击已通过。严格坐标验收保留为待决定，没有加空白撑高页面。 |
| 9 范围 | 已做 | 只修改允许的 7 个受跟踪文件，并新增 Tlayout 验证材料、报告与截图。`demos/`、`kit/`、`vendor/`、`entries/` 均无差异；构建生成器报告 0 files updated。原有 Tlayout plan 与 codex 日志未改。 |

## 横向滚动排查

位置按选择器标识；不同文件的同名覆盖一起检查了最终计算样式。

| 位置 | 内容 | 处理 |
| --- | --- | --- |
| `assets/site.css` `.lib-side` | 三页侧栏 | `overflow-y:auto; overflow-x:hidden`，并用 `minmax(0,1fr)` 限制内部网格；侧栏实测 scrollWidth 不超过 clientWidth。 |
| `assets/site.css` `.side-beats` | 竖屏舞台旁的节拍列表 | 改为仅纵向滚动。 |
| `assets/site.css` `.beat-list` | 舞台时间轴下方全部节拍按钮 | 移除横滚、固定单行高度及横向跟随；flex-wrap:wrap，gap:6px，舞台计算使用实际节拍条高度。 |
| `assets/site.css` `.prompt-box pre` | 详情与 Agent 页的 Prompt | 保持 pre-wrap 与断词、纵向高度限制；实际横向溢出为 0。 |
| `assets/docs.css` `.doc-toc` | 文档右侧本页目录 | 改为仅纵向滚动。 |
| `assets/docs.css` `.doc pre` | 文档代码块 | 按允许项保留横向滚动，使用统一滚动条。 |
| `assets/docs.css` `.doc .tbl` | 文档宽表格 | 按允许项保留横向滚动，使用统一滚动条。 |
| `assets/home.css` `.code` | 首页代码示例 | 在允许修改的 site.css 中用 `body .code` 覆盖为换行、仅纵向滚动；未修改 home.css。 |
| `assets/agent.css` `.gen-list` | Agent 条目选择列表 | 在 site.css 中用 `body .gen-list` 覆盖为仅纵向滚动；未修改 agent.css。 |
| `assets/agent.css` `.tbl-wrap` | 命令与资料格式宽表格 | 按宽表格允许项保留横向滚动，使用统一滚动条。 |
| `assets/lab.css` `.q-scroll` | 节拍量化宽表格 | 按宽表格允许项保留横向滚动，使用统一滚动条。 |
| `assets/site.css` `.mobile-menu`（新增） | 移动菜单浮层 | 仅纵向滚动，overscroll-behavior:contain。 |

案例库、巧思库、两个案例详情、guide、pipeline 和一篇案例 Prompt，均在 1440px 与 390px 检查。除文档 pre 和宽表格外，实际横滚容器均为 0。

## 验证结果

构建与脚本均从本工作树根目录运行。布局和截图使用 `scripts/lib/cdp.mjs` 启动本机 Edge，DPR 1，保留浏览器滚动条；测试启动参数只作用于测试进程，没有修改 CDP 公共脚本、代理配置或系统设置。

```text
build ok · 2 cases · 17 patterns · 0 files updated
build.mjs exit=0
check ok · 2 cases · 17 patterns · 18 source files scanned · kit copies 19
check.mjs exit=0
static site ready · dist/
build:site exit=0
filters 1539/1539 passed · sidebar facets, combined filters, contextual counts, sorting, URL reload/back/forward
layout a 15/15 passed
layout b 6/6 passed
layout c 21/21 passed
layout d 16/16 passed
layout e 16/16 passed
layout f 54/54 passed
layout g 2/2 passed
layout h 10/10 passed
layout extra 47/47 passed
layout 187/187 passed · pending 1 strict scroll target
delivery 22/22 passed · HTTP/dist bytes, HEAD/branch/index, protected paths, scope, screenshot files
```

| 断言 | 实际检查 |
| --- | --- |
| a | 三种桌面宽度的主区网格列均严格符合公式；正文保持 860px 上限。 |
| b | 三页侧栏均为 x=32、y=92、width=228，同一视口下三项差值均为 0。 |
| c | 桌面与打开的移动菜单侧栏均为 overflow-x:hidden，scrollWidth≤clientWidth。 |
| d | 1440px、390px 的 archive-os 9 个、map-pilgrimage 19 个节拍按钮全部在容器内，无横滚，wrap 与 gap 均正确。 |
| e | 七个路由、两种宽度的非允许横滚容器为 0，且 Prompt 路由确实加载。 |
| f | 三页菜单、视图切换、筛选/文档变化、四种关闭方式、焦点、滚动恢复、开菜单页头保持显示、断点节点还原与横向宽度通过。案例库的严格 y=1500 子场景未完成，详见待决定。 |
| g | 两个列表首卡 y 均小于 844。 |
| h | 三页 summary 可折叠/展开，键盘 focus-visible 外框有效；切换文档时当前所在组展开。 |
| extra | 已覆盖页面的可见 HTML/SVG 文字≥12px；文档无横向撑开；无侧栏页面仅显示全站导航；减少动态时页头过渡为 0；未捕获运行异常与本地 HTTP 错误均为 0。字号探针不进入 iframe。 |
| delivery | 8 个入口/共享文件的 HTTP、dist 字节与本工作树相同；HEAD/分支/暂存区保持；受保护目录无改动；17 张截图文件存在。 |

桌面测量值（px）：

| 视口宽 | 页面滚动条宽 | 案例/巧思主区 | 文档中间网格列 | 文档正文 |
| ---: | ---: | ---: | ---: | ---: |
| 1440 | 15 | 1101 | 869 | 860 |
| 1920 | 15 | 1581 | 1349 | 860 |
| 2560 | 15 | 2221 | 1989 | 860 |

文档中间网格列用于验证第 8.4(a) 的撑满公式，正文自身遵守第 4 节的 max-width:860px，二者分别测量。

smoke 使用原命令，依次运行两次：

```text
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4326
```

```text
第 1 轮：smoke 19/19 passed · exit=0
第 2 轮：smoke 19/19 passed · exit=0
```

原始输出保存在 `dev/wip/Tlayout/smoke-1.log`、`smoke-2.log`。两轮均包含 2 个案例与 17 个巧思，均没有改写原命令、缩小条目范围或改变时间步长。JS 语法检查、受跟踪改动的 git diff --check 与新文件的 UTF-8/LF/行尾空白检查也通过。

机器可读明细在 `dev/wip/Tlayout/filter-results.json`、`layout-results.json`、`delivery-results.json`、`screenshot-index.json`。验证脚本为 `dev/wip/Tcopy/tools/check-filters.mjs`、`dev/wip/Tlayout/tools/check-layout.mjs`、`screenshots.mjs`；没有引入依赖或测试框架。

## 截图索引

17 张均已打开查看；截图为实际页面或指定区域裁切，没有替换内容。链接相对本报告。

| 内容 | 路径 |
| --- | --- |
| 案例库 1440 | [cases-1440.png](../shots/Tlayout/cases-1440.png) |
| 巧思库 1440 | [patterns-1440.png](../shots/Tlayout/patterns-1440.png) |
| 文档中心 1440 | [docs-1440.png](../shots/Tlayout/docs-1440.png) |
| 案例库 2560 | [cases-2560.png](../shots/Tlayout/cases-2560.png) |
| 巧思库 2560 | [patterns-2560.png](../shots/Tlayout/patterns-2560.png) |
| 文档中心 2560 | [docs-2560.png](../shots/Tlayout/docs-2560.png) |
| archive-os 节拍区 1440 | [archive-os-beats-1440.png](../shots/Tlayout/archive-os-beats-1440.png) |
| map-pilgrimage 节拍区 1440 | [map-pilgrimage-beats-1440.png](../shots/Tlayout/map-pilgrimage-beats-1440.png) |
| 巧思工具栏特写 1440 | [patterns-toolbar-1440.png](../shots/Tlayout/patterns-toolbar-1440.png) |
| 案例库首屏 390 | [cases-390.png](../shots/Tlayout/cases-390.png) |
| 案例库目录菜单 390 | [cases-menu-390.png](../shots/Tlayout/cases-menu-390.png) |
| 巧思库首屏 390 | [patterns-390.png](../shots/Tlayout/patterns-390.png) |
| 文档中心目录菜单 390 | [docs-menu-390.png](../shots/Tlayout/docs-menu-390.png) |
| 菜单全站导航 390 | [site-nav-390.png](../shots/Tlayout/site-nav-390.png) |
| 上滚后页头恢复 390 | [header-returned-390.png](../shots/Tlayout/header-returned-390.png) |
| 深色侧栏滚动条，1440×420 | [docs-scrollbar-dark.png](../shots/Tlayout/docs-scrollbar-dark.png) |
| 浅色侧栏滚动条，1440×420 | [docs-scrollbar-light.png](../shots/Tlayout/docs-scrollbar-light.png) |

## 遇到的阻碍及处理

- PowerShell 内联 Node 引号解析、补丁工具的同路径删除再新增限制，改用文件脚本/分步补丁后解决，没有遗留文件损坏。
- 筛选测试一次性高速调用 replaceState 触发浏览器节流；恢复每组 200ms 的交互间隔。URL 初始数量的硬编码也改为按 MA 数据独立计算，1539 条通过。
- 228px 侧栏的搜索框固有尺寸撑出内部网格，已用 minmax(0,1fr) 限制；所有侧栏宽度断言通过。
- CDP 同文档 hash 导航不触发 loadEventFired，已区分该路径；断点测试等待真实节点还原，不在 media query 事件到达前取样。
- 截图的 captureBeyondViewport 模式会隐藏滚动条，已关闭该选项；移动端视口外的懒加载图片不会全部载入，截图只等待视口内图片。两主题滚动条与 17 张截图均已实际核看。
- 全局减少动态规则覆盖页头的 transition 时长，已明确禁用页头过渡，计算样式断言通过。

## 待决定与限制

1. **案例库严格 scrollY=1500 验收**：390×844、现有两个案例的自然滚动上限为 672px。已实测从 672px 向上 100px 后页头可见、菜单可点；巧思库与文档中心均在 1500px 完成同一检查。是否接受案例库的自然底部替代验收，待用户决定；本次没有增高或注入测试内容。
2. **Demo 字号探针输出**：原命令报告 archive-os 横竖画幅的最小字号均为 5.3px。该 Demo 源码未改，本次不进入禁止修改的 demos/kit 范围处理；是否另开字号修复任务，待用户决定。站点外壳与文档的字号检查不包括 iframe，不能据此声称 Demo 全部满足 12px。

验证环境为本机 Edge 无头浏览器的桌面/移动视口模拟，未做手机真机、Firefox 或 Safari 核验。smoke 对 boot-typing、rolling-digits、decrypt-reveal、wave-array、idle-breathing 执行 seek/play，但按原脚本跳过画幅与字号检查；这些跳过项没有被计作本次字号通过证据。
