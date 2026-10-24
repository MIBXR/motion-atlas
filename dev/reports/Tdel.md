# Tdel · 案例与巧思精简

执行依据：`dev/wip/Tdel/plan.md`、`dev/wip/R2/plan-fix-1.md`。删除与引用同步已完成；站点走查完成 16 个页面 / 视口组合，140 项检查全部通过，两组列表 SVG 标签在实际渲染后均 ≥ 12px。`check` 与 `build:site` 由 R2 第 4 步统一记录。

## 删除清单

保留案例：`map-pilgrimage`、`archive-os`、`industrial-protocol`。保留巧思共 22 个：地图巡礼 12 个、档案终端 5 个、工业协议 5 个。

删除案例（6）：`phantom-battle`、`broadcast-pack`、`beat-lyric`、`mission-fui`、`gacha-reveal`、`ink-scroll`。

删除巧思（16）：`alert-state`、`beat-clock`、`card-flip-sheen`、`charge-release`、`cutin-slash`、`impact-pop`、`ink-bleed`、`lower-third`、`radar-sweep`、`ransom-type`、`seal-stamp`、`shape-wipe`、`skew-menu`、`stinger-bars`、`target-lock`、`word-slam`。

| 路径范围 | 删除文件数 | 处理 |
| --- | ---: | --- |
| `demos/cases/<删除案例>/` | 30 | `git rm` |
| `entries/cases/<删除案例>.json` | 6 | `git rm` |
| `docs/research/<删除案例>.md` | 6 | `git rm` |
| `previews/cases/<删除案例>*.jpg` | 6 | `git rm` |
| `demos/patterns/<删除巧思>/` | 32 | `git rm` |
| `entries/patterns/<删除巧思>.json` | 16 | `git rm` |
| `previews/patterns/<删除巧思>*.jpg` | 16 | `git rm` |
| `agent/cases/` 与 `prompts/cases/` 对应生成物 | 12 | build 自动清理 |
| `agent/patterns/` 与 `prompts/patterns/` 对应生成物 | 32 | build 自动清理 |

源码与预览删除共 112 个文件，过期生成物删除 44 个文件。只有计划明确要求 `git rm` 的 112 个删除项被暂存；其余修改及生成物删除未暂存。未提交、推送或切换分支。

## 引用修改清单

| 文件 | 实际修改 |
| --- | --- |
| `README.md` | 删除 6 行案例表；原样应用用户两段最终文字；计数为 3 案例、22 巧思、3 个可渲染案例 Demo、3 篇研究笔记；按保留条目重算巧思类型表并删除被删例子；渲染示例改用地图巡礼；删除 P5 案例列举 |
| `index.html`、`agent.html` | 渲染示例路径改为 `demos/cases/map-pilgrimage/index.html` |
| `scripts/render.mjs` | 用法提示中的示例路径改为地图巡礼，不改渲染逻辑 |
| `assets/library.js` | 两组 hero SVG 标签按实际缩放换算字号，桌面与手机均 ≥ 12px；复用既有 resize 回调 |
| `assets/home.js` | 载体例子删除转播包、节拍字幕、战斗指令、指挥台、抽卡舞台与水墨长卷，不增补替代例子 |
| `docs/guide.md` | 案例计数改为 3；载体代表与证据说明删除被删成员；迁移范围段落原样应用用户最终文字 |
| `docs/pipeline.md` | 迁移范围段落原样应用用户最终文字；渲染与 ffmpeg 示例路径改用地图巡礼；双时钟案例列举删除任务指挥台 |
| `docs/rhythm.md` | 两条论据原样应用用户最终文字并保留 bullet；长按确认句仅删除蓄力释放引用 |
| `docs/methodology.md` | 核验对象列举删除 P5；来源表删除 3 条 P5 资料 |
| `docs/prompting.md` | 删除节拍 MV、水墨长卷两个示例 bullet |
| `entries/patterns/decrypt-reveal.json` | `composition.pairsWellWith` 删除 `card-flip-sheen`，不补替代项 |
| `demos/_template/case/script.js` | 模板说明中的案例计数改为 3 |
| `dev/polish-round-1.md` | 第三节末尾追加指定范围调整原文；T6、T8–T12 状态改为“已删除” |
| `data/catalog.js`、`data/docs.js`、`agent/catalog.json` 与保留条目的资料包 | 由 build 根据当前源码与条目生成 |

README 巧思类型数按 `entries/patterns/*.json` 的 `types` 逐项累计；同一巧思可属于多类：转场 6、节奏与时序 6、交互反馈 5、文字动效 5、画面构成 5、信息层 HUD 5、质感与后期 2、声音 1、镜头 1。

`dev/polish-round-1.md` 首行原有一段连写的进度表片段，本任务只更新其中对应状态；未扩大范围修复其排版。其他 `dev/` 历史记录未改。

## 构建与引用扫描

`node scripts/build.mjs` 实际输出：

```text
build ok · 3 cases · 22 patterns · 18 files updated
```

构建同时打印并清理全部 44 个过期 Agent / Prompt 生成物，无需手动补删。

删除 ID 全仓扫描：

```bash
git grep -n -E 'phantom-battle|broadcast-pack|beat-lyric|mission-fui|gacha-reveal|ink-scroll|alert-state|beat-clock|card-flip-sheen|charge-release|cutin-slash|impact-pop|ink-bleed|lower-third|radar-sweep|ransom-type|seal-stamp|shape-wipe|skew-menu|stinger-bars|target-lock|word-slam' -- ':!dev'
```

结果：零匹配，退出码 1。`dev/` 的计划、报告与进度记录按用户要求保留相关 ID。

旧计数扫描：

```bash
git grep -n -E '9 个案例|38 个巧思|三十八个巧思|九个案例|38 patterns|9 cases|9 篇研究笔记|9 个完整作品' -- ':!dev'
```

结果：零匹配，退出码 1。`git diff --check` 与 `git diff --cached --check` 均无输出、退出码 0。人工审阅引用修改 diff：13 个既有文件，44 行新增、55 行删除；删除清单与引用修改未涉及 `check.mjs`、`smoke.mjs` 或字号规则。

## 站点走查

脚本：`dev/wip/Tdel/site.mjs`。固定访问 `http://localhost:4322`，直接导入现有 `direct-browser.mjs`，浏览器用 `--enable-gpu --use-angle=d3d11 --ignore-gpu-blocklist` 支持档案终端 iframe。

```bash
node dev/wip/Tdel/site.mjs
node dev/wip/Tdel/site.mjs 1440-map-pilgrimage 390-map-pilgrimage
```

桌面 1440×900、手机 390×844，分别走查首页、案例列表、巧思列表、实验室、地图巡礼详情、档案终端详情、工业协议详情及 corner-hud 详情，共 16 个页面 / 视口组合。详情均在 ready 后暂停到指定时刻：地图 23.6s、档案 39.22s、工业 7s、corner-hud 2.5s。地图还等待当前帧及后一秒缓冲就绪，内部加载 / 缓冲遮罩消失。

证据：`dev/shots/Tdel/site/verification.json`；16 张当前页面截图位于同目录，命名为 `<1440|390>-<home|cases|patterns|lab|map-pilgrimage|archive-os|industrial-protocol|corner-hud>.png`。完整走查的 16 张截图已有逐张审阅记录；本次重跑全部 16 个组合，并重新查看受字号修改影响的 4 张案例 / 巧思列表截图。

实际结果：16/16 页面完成，140/140 项检查通过。所有页面的数据为 3 个案例 / 22 个巧思；首页统计为 3 / 22 / 3，列表分别显示 3 / 22 个保留条目。所有页面外层均无横向溢出，图片无破损，console.error、未捕获异常、HTTP 404、其他 HTTP 错误与未取消的请求失败均为 0。未扩展声音、播放或全屏交互。

档案终端横竖两页记录的 renderer 均为：`ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11 vs_5_0 ps_5_0, D3D11)`。

两列表的 hero SVG 标签在页面创建及已有 resize 回调中按实际屏幕缩放换算 font-size，保留其他样式与位置。1440px 桌面为 12.000068px，390px 手机为 12.000717px；同页动态改宽至 800px 为 12.000148px。两列表三宽度共 6 项独立字号检查通过，四张受影响列表截图无裁切或碰撞。证据 dev/shots/R2/closeout/screenshots.json。其余站点界面仍按 ≥ 12px 检查；iframe 内 Demo 字号按 R2 字号表验收。

走查中另外记录两项观察：

- 首次对首页连续调用默认平滑滚动时，`scrollTo(0,1440)` 的 CDP 执行超过 60s，关闭页面也未返回。只关闭核实属于本轮走查的浏览器后，将自动走查滚动指定为 `behavior:'instant'`，随后完成所有页面。失败记录保留于 `verification-initial.json`，未据此断言业务故障的具体原因。
- 两个地图详情初始 URL 带非零 `t=23.6` 时，宿主 ready 已返回，但截图仍显示内部“MAP PRELOAD / 缓冲开头 20%”。观察记录与失败图保留于 `verification-before-ready-gate.json` 和 `*-map-pilgrimage-initial-seek-url.png`。按正常入口从 0 启动、ready 后再 seek，并增加实际缓冲 / 遮罩条件后，两页分别通过 10/10。源码的开头 gate 与实时缓冲窗口可能在非零初始时刻发生冲突，此为代码结合现象的推断，尚未修改或进一步诊断该业务路径。

人工查看 `390-industrial-protocol.png` 还显示：旧自适应工业协议 Demo 在手机详情的 16:9 iframe 内只显示顶部导航与数值，主体产线位于可视区外。外层页面检查通过，但该旧 Demo 的手机布局仍有限制；按 T7 后续规划保留，未在本次删除任务中重做。

## 统一验收结果

- 正常入口站点走查：16/16 页面与视口组合，140/140 检查通过。两种视口分别为 1440×900 与 390×844，覆盖首页、案例列表、巧思列表、实验室、三个案例详情及 corner-hud 详情；本次重新查看受影响的 4 张列表截图，其余页面视觉证据沿用已完成的逐张审阅。
- 数据、列表与首页统计符合 3 cases / 22 patterns / 3 research；外层没有横向溢出，图片没有破损。
- 当前正常入口的 console.error、未捕获异常、HTTP 404、其他 HTTP 错误与未取消的请求失败均为 0。档案终端两种视口均为 Intel Iris Xe / D3D11 renderer。
- 两组 hero SVG 实际字号均 ≥ 12px，桌面 / 手机四项检查全部通过；只调整字号，未变更其他样式。
- 最终 build：3 cases · 22 patterns；check 退出码 0。npm run build:site 退出码 0，输出 static site ready · dist/，其内部 build 为 3 cases · 22 patterns · 0 files updated。
- dist 共 1146 个文件，路径及文本内容均无被删 ID。证据 dev/shots/R2/dist-verification.json。

站点原始证据：dev/shots/Tdel/site/verification.json；当前截图同目录。最终构建日志：dev/shots/R2/closeout-build.log、closeout-check.log、closeout-build-site.log。本次完整走查日志：dev/shots/R2/closeout-site.log。

## 已观察到的限制与执行阻碍

- 初次自动走查在平滑滚动阶段发生 CDP 超时。走查脚本改为显式 instant 滚动后完成，未修改页面源码；首轮记录保留为 verification-initial.json。
- 地图详情初始 URL 带非零 t=23.6 时，宿主 ready 已返回，内部画面仍停在预载 20%。保留失败截图与 verification-before-ready-gate.json。正常入口从 0 启动、ready 后 seek，并等待实际 buffer 与内部遮罩后，横竖地图均通过。开头 gate 与非零缓冲窗口冲突是结合代码与现象的原因判断，本任务未修改缓冲机制。
- 390 手机详情中的既有工业协议仍使用 16:9 iframe，自适应 Demo 主体产线位于可视区外；外层站点无溢出。独立 1080×1920 自适应视口截图保存在 dev/shots/R2/industrial-protocol-portrait.png；这不是固定竖屏构图。T7 重做保持另行规划。
- dev/polish-round-1.md 首行原有连写进度表只按指定范围更新状态，未扩展排版清理。
