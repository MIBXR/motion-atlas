$stop-that-shit change -- 按主任务的设计方案重做地图巡礼的 12 个巧思（T4b）：复用案例的实现代码，按指定片段重放，固定画幅、声音齐全。

# 0. 总原则

- 设计已由主任务全部定好，见下文。你只负责照做，不做任何审美、构图、文案或时间上的决定。
- 本方案没写到、又必须做选择的情况：停下来，在最终答复里写明问题和选项。
- 每个巧思的视觉、动效、字号、配色、缓动，一律来自地图巡礼案例 `demos/cases/map-pilgrimage/` 的现有代码：复制函数与 CSS，不重写、不“改进”。
- 事实依据：`dev/shots/T4b/inventory/README.md`（你上一轮整理的清单，含行号、CSS、声音事件表）。
- 工作目录：git 工作树 `.worktrees/patterns`（分支 `feat/patterns-t4b-t5`）。
- 服务器：`node scripts/serve.mjs --port 4322`。不要碰 4321、4323。
- 截图、smoke、capture 一律通过 `node --import ./dev/wip/T4a/tools/direct-browser.mjs …`（无头浏览器绕过系统代理）。
- 不要 commit / push / 切分支。
- 每完成一步，在 `dev/wip/T4b/progress.md` 追加一行。

# 1. 案例的两处改动（先做）

## F1 站名衬底随打字增长

现状：标记标签的底色衬底在打字开始时就是满宽，文字逐字出现。

改为：衬底宽度 = 左右内边距 + 当前已显示子串的实测宽度，每帧随打字增长；打字完成后等于最终宽度。

- 用 `measureText` 或隐藏测量元素计算宽度，并缓存每个前缀的宽度。
- 衬底的出现时刻、颜色、圆角、高度不变。
- 横竖两种画幅、所有标记标签都适用，包括警示段的红色 TAKANOHARA 标签。

## F2 URL 参数 `layers`

只在提供该参数时生效，不影响默认行为、render 和 smoke。

| 取值 | 效果 |
|---|---|
| `layers=map` | 只显示底图：隐藏所有 DOM 覆盖层（HUD、标题、卡片、徽章、托盘、章节、对比、回忆、警示、收尾、标签），隐藏路线与标记的地图图层，关闭颗粒与暗角 |
| `layers=map,routes,markers` | 底图 + 已完成的路线 + 标记圆点（无标签），颗粒与暗角关闭 |

改完后：

- `node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --only map-pilgrimage --strict-fonts --base http://localhost:4322` 连续 2 次通过；
- 重渲地图巡礼两段 MP4（同 T4a 的 8–31 秒片段）到 `dev/shots/T4/render/`，并用 ffprobe 确认；
- 重跑 `capture.mjs --only map-pilgrimage`。

# 2. 巧思的公共结构（12 个都一样）

## 2.1 文件

`demos/patterns/<id>/`：

- `index.html`、`style.css`、`script.js`、`config.js`、`motion-kit.js`（build 同步）；
- `plates/`：底图，WebP，质量 82，横 1920×1080、竖 1080×1920；
- `score.json`：声音事件。

旧 Demo 的代码全部替换，不保留。

## 2.2 时间重映射

`config.js` 定义 `segments: [{ from, to, plate }]`，其中 from / to 是案例时刻。

- 巧思时刻 t 按顺序映射到案例时刻 caseT；巧思时长 = 各段时长之和 + 本方案写明的 hold。
- 复制来的案例绘制函数以 caseT 调用，函数内部逻辑不改。
- HUD 里的坐标、缩放、海拔、时间等数值，用复制来的案例镜头关键帧（`scenes.js`）在 caseT 求值，不需要真实地图。
- 段与段之间的底图切换：新段开始的前 0.4s，新旧两张底图做线性交叉淡化。覆盖层不做淡化，直接按 caseT 呈现。

## 2.3 底图

工具：`dev/wip/T4b/tools/plate.mjs`。

- 用法：`node dev/wip/T4b/tools/plate.mjs <caseT> <orient> <layers> <out.webp>`。
- 打开 `demos/cases/map-pilgrimage/index.html?render=1&t=<caseT>&orient=<orient>&layers=<layers>`，等地图 idle 后截图，转为 WebP。

## 2.4 锚点

标签、引线等锚在地图点上的覆盖层：按底图时刻在案例里求出屏幕坐标，写进 `config.js` 的 `anchors`（横竖各一套）。巧思运行时直接用这些坐标，不投影。

## 2.5 实时地图（只用于 route-draw-marker、alert-reroute、day-night-flip）

- MapLibre 版本、样式 URL、自定义图层、路线几何（`paths.js` 的相关段）、配色与昼夜代码，全部从案例复制。
- 镜头固定，参数见各巧思。
- `MotionKit.preload` 等固定镜头下 `idle` 且所有可见瓦片加载完后才 ready。
- 支持 URL 参数 `tilemirror` / `demmirror`，用法同案例。

## 2.6 颗粒与暗角

每个巧思都复制案例的颗粒纹理与暗角层（inventory 中 film-grain 一节的行号），参数不变。底图本身不带颗粒。

## 2.7 声音

`score.json` 的生成规则：

1. 取 inventory 里该巧思“触发的声音事件”表中的事件，保留全部参数；
2. 只保留 t 落在某个片段 `[from, to)` 内的事件；
3. 把 t 换算成巧思时刻。

各巧思另有补充规则的，以该巧思说明为准。

用 `MotionKit.audio.attach(tl, score)` 挂接。不加背景音乐。

## 2.8 画幅与字号

- 竖屏使用案例的 `[data-orient="portrait"]` CSS 与竖屏底图 / 锚点。
- 字号来自案例，已满足横 ≥ 24px、竖 ≥ 36px。
- 若某处因复制方式不同导致字号低于下限：停下报告，不要自己调。

## 2.9 标记点

每个片段的开始都是一个 marker，label 用本方案给出的文字。

## 2.10 旧 Demo 中案例里没有的功能，一律删除

- split-compare-stamp 的手动拖动分割线；
- collect-counter 的 +1 / 重置按钮与头像扩散外圈；
- alert-reroute 的绿色 BACK ON ROUTE 胶囊；
- seekable-timeline 的 MOVE / TYPE / COUNT 轨道、帧数与代码面板；
- film-grain 的扫描线、闪烁与参数面板。

# 3. 十二个巧思

时刻都是案例时刻；“hold”指在前一段末尾的 caseT 上静止的秒数。

## 3.1 corner-hud（四角信息 HUD）

- **层**：只显示 `drawHud()` 的部件：日序、日期与进度线、指南针、坐标 / 海拔 / 缩放、时钟、NOW PLAYING 与歌词、步进器、比例尺、署名。不含 MIKAN 徽章、印章托盘、标题、卡片、标记、路线。

| 段 | from → to | 底图（caseT, layers=map） | marker |
|---|---|---|---|
| A | 7.0 → 13.6 | 10.4 | 顶部 HUD 入场 |
| B | 35.8 → 42.4 | 41.0 | 跨天 |

- **结尾**：hold 0.6s。
- **声音**：click、kick、sub（按 2.7）。

## 3.2 vertical-title-blur（竖排标题模糊入场）

- **层**：`drawIntro()`、`drawLocTitle()`、`drawFlashback()`（含回忆插画画布与竖排字幕），以及 `drawOutro()` 中的 fin.（不含统计行）。

| 段 | from → to | 底图 | marker |
|---|---|---|---|
| A | 3.8 → 8.0 | 5.95, layers=map | 片名 |
| B | 17.9 → 21.6 | 19.7, layers=map | 地点标题 |
| C | 25.5 → 29.6 | 无底图（回忆插画全屏覆盖）；段首 0.4s 从 B 的底图交叉淡化 | 回忆竖排字幕 |
| D | 57.9 → 60.0 | 58.0, layers=map,routes,markers | fin. |

- **声音**：key、tick、bell、shimmer、sub。

## 3.3 route-draw-marker（路线描画与站点标记）

- **实时地图，固定镜头**：
  - 镜头框住关西机场 KIX、京都站、JR 奈良站、奈良公园四个标记的外包框，四边各留舞台尺寸的 12%；
  - bearing 0、pitch 0；
  - 横竖各算一套。
- **图层**：只显示路线、标记与标记标签，不显示 HUD 等覆盖层。

| 巧思 t | 内容（按案例对应时刻的实现播放） |
|---|---|
| 0.0 | kix 标记入场（案例 1.5 → 1.95） |
| 0.6 | haruka 路线描画 + 车头（案例 14.6 → 17.05） |
| 2.6 | kyoto 标记入场（案例 16.6 → 17.05） |
| 3.6 | naraLine 路线描画 + 车头（案例 37.4 → 39.85） |
| 5.6 | jrNara 标记入场（案例 39.4 → 39.85）；同时 walk1 圆点路线描画（案例 39.4 → 41.25） |
| 7.0 | naraPark 标记入场（案例 40.8 → 41.25） |
| 7.5 → 9.0 | hold：完成态，所有路线为持续层样式 |

- **marker**：0 机场、0.6 描画、3.6 第二段、5.6 步行。
- **声音**：每个动作取案例对应时刻窗口内、inventory 本巧思声音表里的事件（whoosh、clack、chime、blip、tick、sonar），平移到上表时刻。

## 3.4 day-night-flip（昼夜切换）

- **实时地图，固定镜头**：等于案例在 caseT 34.5 的镜头（中心、缩放、bearing、pitch 全取案例值），含 3D 建筑。
- **层**：地图 + HUD（同 3.1 的部件范围），用来展示配色在 HUD 上的联动。

| 巧思 t | 内容 |
|---|---|
| 0.0 → 1.5 | 白天：dayNight 值取 0 |
| 1.5 → 2.5 | 昼 → 夜，按案例 32.8 → 33.8 的实现与缓动 |
| 2.5 → 4.5 | 夜 |
| 4.5 → 5.4 | 夜 → 昼，按案例 36.6 → 37.5 |
| 5.4 → 7.0 | 白天 |

- **HUD 数值**：固定为案例 34.5 时的值；时钟按案例走时规则随巧思时间前进。
- **marker**：0 白天、1.5 入夜、4.5 天亮。
- **声音**：取案例 [32.3, 34.3) 与 [36.1, 38.0) 内、本巧思声音表里的事件（reverse、whoosh、chime、shimmer、sub），分别平移到 1.5 与 4.5 对应的位置（偏移 = 巧思切换起点 − 案例切换起点）。

## 3.5 card-expand-fullscreen（卡片展开全屏）

- **层**：inari 标记、引线（`drawLeader()`）、卡片（`drawCards()`，含照片插画画布与其颗粒）。
- **段**：唯一一段 A 18.4 → 24.6；底图为 caseT 20.4，layers=map；锚点按 2.4。
- **结尾**：hold 0.4s。
- **marker**：18.4 出卡、21.0 展开、23.8 收回。三个 marker 都在同一段内，换算成巧思时刻。
- **声音**：shutter、paper、whoosh、impact。

## 3.6 chapter-frame（章节框线）

- **层**：只显示 `drawChapter()`。

| 段 | from → to | 底图（layers=map） | marker |
|---|---|---|---|
| A | 24.2 → 25.85 | 24.6 | 鸭川框线入场 |
| B | 33.0 → 33.8 | 24.6 | 框线退场 |
| C | 40.6 → 44.8 | 41.0 | 奈良胶带与网点 |

- **结尾**：hold 0.4s。
- **声音**：riser、bell、confirm。

## 3.7 split-compare-stamp（分屏对比与时间戳盖章）

- **层**：只显示 `drawCompare()`（含两侧插画画布与盖章）。
- **段**：A 29.0 → 33.4；底图为 caseT 24.6，layers=map（对比画面入场前和退场后露出）。
- **结尾**：hold 0.4s。
- **marker**：29.0 分屏、30.65 盖章。
- **声音**：whoosh、stamp、sub。

## 3.8 collect-counter（收集计数与印章）

- **层**：MIKAN 徽章、印章托盘、步进器（步进器取自 `drawHud()`，只渲染它一个部件）。

| 段 | from → to | 底图（layers=map） | marker |
|---|---|---|---|
| A | 8.1 → 8.9 | 10.4 | 徽章出现 |
| B | 12.6 → 14.0 | 10.4 | ×1 + 关空 |
| C | 19.2 → 20.4 | 20.4 | ×2 + 京都 |
| D | 41.8 → 43.0 | 41.0 | ×3 + 奈良 |
| E | 51.2 → 52.6 | 51.6 | ×4 + 大阪 |

- **结尾**：hold 0.6s。
- **声音**：confirm、stamp、sparkle。

## 3.9 alert-reroute（错车警示与改道）

- **实时地图，固定镜头**：等于案例在 caseT 46.475 的镜头。
  - 求出 wrong 与 reroute 两条路线全部点的屏幕坐标；
  - 若有点落在舞台内缩 8% 的安全框之外，改用能框住这两条路线外包框、四边留 15% 的镜头，bearing 与 pitch 保持案例值。
  - 横竖分别判断。
- **层**：`drawAlert()`、错误路线、X 终点、改道路线、该时段可见的标记与标签（含 F1 修复后的红色标签）、案例在该时段已完成的持续路线。不含 HUD。
- **段**：A 44.8 → 50.3。
- **结尾**：hold 0.7s。
- **marker**：45.0 警示、46.3 错误终点、47.0 改道。
- **声音**：error、glitch、blip、whoosh、alarm、clack、beep、stamp。

## 3.10 outro-stat-stack（收尾统计堆叠）

- **层**：只显示 `drawOutro()`，统计行与 fin. 都要。
- **段**：A 55.6 → 60.0；底图为 caseT 58.0，layers=map,routes,markers。
- **结尾**：hold 0.8s。
- **marker**：56.25 统计、58.0 fin.。
- **声音**：whoosh、blip、tick、bell、shimmer、sub。

## 3.11 seekable-timeline（可拖动的时间轴）

- **层**：
  - 底图为 caseT 13.0，layers=map；
  - 覆盖层：HUD（同 3.1）、kix 卡片与引线、MIKAN 徽章；
  - 舞台底部加一条控制条：复制案例 2093–2120 行的浮动控制条结构与样式，放在舞台内底边，左右边距与 HUD 一致；在 render 模式下也显示。
  - 控制条的进度 = (caseT − 12.0) / (16.6 − 12.0)。
- **巧思 t → caseT 的拖动曲线**（分段，缓动为 easeInOutCubic；“播放”段为线性 1 倍速）：

| 巧思 t | caseT | 方式 |
|---|---|---|
| 0.0 → 2.0 | 12.0 → 14.0 | 播放 |
| 2.0 → 2.6 | 14.0 → 12.6 | 倒拖 |
| 2.6 → 3.4 | 12.6 → 13.4 | 播放 |
| 3.4 → 3.9 | 13.4 → 15.5 | 前跳 |
| 3.9 → 5.0 | 15.5 → 16.6 | 播放 |
| 5.0 → 5.6 | 16.6 → 13.0 | 倒拖 |
| 5.6 → 7.0 | 13.0 → 14.4 | 播放 |

- **声音**：
  - 只在“播放”段内，取案例 caseT 窗口里属于 HUD / 卡片 / 徽章的事件（corner-hud、card-expand-fullscreen、collect-counter 三个巧思声音表的并集），平移到巧思时刻；
  - 每个“倒拖”和“前跳”段的开头加一个 `tick` 事件，参数取 inventory 中 tick 事件的第一组参数。
- **marker**：0 播放、2.0 倒拖、3.4 前跳、5.0 再倒拖。

## 3.12 film-grain（胶片颗粒）

- **层**：颗粒与暗角（2.6），加下面三种底。

| 段 | 内容 | 时长 | marker |
|---|---|---|---|
| A | 底图 caseT 10.4（layers=map）上的舞台颗粒 | 2.5s，底图从 scale 1.00 线性推到 1.04 | 地图上的颗粒 |
| B | kix 卡片照片画布全屏显示（按案例照片画布的绘制函数，在 caseT 13.5 的状态下放大到舞台尺寸，保持宽高比、居中裁切），带案例的照片颗粒 | 2.5s，同样从 1.00 推到 1.04 | 照片颗粒 |
| C | 回忆插画画布全屏（caseT 27.56 状态），带案例回忆画布的颗粒 | 2.5s，同样推进 | 插画颗粒 |

- 段间交叉淡化 0.4s。
- **声音**：vinyl 两次：t=0 时增益乘 0.5；t=5.0（段 C 开头）时为原参数。

# 4. 条目与资料（每个巧思）

更新 `entries/patterns/<id>.json`：

- 标题不变。
- 一句话描述用下面的文字：

| 巧思 | 描述 |
|---|---|
| corner-hud | 日序、坐标、时钟、歌词与步进器钉在四角，数值随镜头与时间持续更新，中央留给地图。 |
| vertical-title-blur | 竖排大字从模糊中显影，配副标题与逐字打字；片名、地点、回忆字幕与收尾共用一套入场。 |
| route-draw-marker | 路线按进度描画，车头沿线前进，站点标记弹入并打出双语站名。 |
| day-night-flip | 地图配色与 HUD 强调色一起在昼夜之间过渡，交代时间的流逝。 |
| card-expand-fullscreen | 照片卡片由引线牵出，展开到全屏停留，再收回原位。 |
| chapter-frame | 章节标签配框线或胶带网点入场，为一段旅程划出章节。 |
| split-compare-stamp | 旧明信片与今日实景左右对比，分割线划过后盖上时间戳。 |
| collect-counter | 每到一站计数滚动加一，印章落进托盘，步进器同步前进。 |
| alert-reroute | 坐错车时红色警示横幅压下，错误路线打叉，改道路线重新描画。 |
| outro-stat-stack | 收尾时统计数字逐行堆叠，最后以 fin. 收束。 |
| seekable-timeline | 所有画面都是时间 t 的函数，拖动、倒退、跳转都能得到同一帧。 |
| film-grain | 动态胶片颗粒与暗角覆盖地图、照片和插画，统一整片的质感。 |

- 节拍与 marker 来自 `config.js`。
- Token 取案例 CSS 变量的实际值。
- `sources`：指向 map-pilgrimage，`locator` 写本方案的 caseT 片段。
- 声音说明：列出 voice 名。
- 迁移字段：列出复制的函数名、依赖与需要的数据（镜头关键帧、路线几何）。
- 删除旧条目中描述了已删除功能的文字。

# 5. 验证

## 5.1 对照

对每个巧思的每个片段，横竖两种画幅各取三个时刻：段首 +0.2、段中点、段尾 −0.2。

- 截巧思画面，与案例在对应 caseT 的截图左右拼接，存 `dev/shots/T4b/parity/<id>/<orient>-<t>.png`。案例截图可复用 inventory 里已有的，没有就新截。
- 逐张检查：覆盖层的位置、文字、形态必须与案例一致；底图与地图图层的差异不算。
- 不一致就修，修不了写明原因。

## 5.2 smoke

`node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --only corner-hud,vertical-title-blur,route-draw-marker,day-night-flip,card-expand-fullscreen,chapter-frame,split-compare-stamp,collect-counter,alert-reroute,outro-stat-stack,seekable-timeline,film-grain --strict-fonts --base http://localhost:4322`

- 连续 3 次全部通过；
- 日志用 UTF-8 存 `dev/shots/T4b/smoke-{1,2,3}.log`；
- 不放宽阈值和超时。

## 5.3 其他

- `node scripts/capture.mjs --only <12 个 id> --base http://localhost:4322`。
- `node scripts/build.mjs`、`node scripts/check.mjs`：通过，且这 12 个目录没有字号警告。
- 全量 smoke 一次：`node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --strict-fonts --base http://localhost:4322`，通过。
- 声音：每个巧思用 `__motion.audio.renderWav()` 导出，检查不削波、峰值 ≤ −1 dBFS，事件时刻与 `score.json` 一致。

# 6. 报告

写 `dev/reports/T4b.md`：

- 照本方案逐条执行的对照表：条目、做了什么、证据路径、偏离及原因；
- F1、F2 的改动与验证；
- 每个巧思的时长、片段、底图文件、对照图索引；
- smoke / check / build 结果；
- 遗留问题。

# 7. 允许修改的文件

- `demos/patterns/<12 个 id>/`；
- `entries/patterns/<12 个 id>.json`；
- `previews/patterns/<12 个 id>*.jpg`；
- `demos/cases/map-pilgrimage/`：只限 F1、F2；
- `previews/cases/map-pilgrimage*.jpg`；
- `dev/reports/T4b.md`、`dev/wip/T4b/`、`dev/shots/T4b/`；
- build 生成物。

kit/、scripts/、站点页面与其他 Demo 一律不改。结束时停掉你启动的服务器与浏览器。

# 8. 最终答复

- 逐条对照摘要（偏离项单列）；
- 改动的文件；
- 验证数字；
- 报告路径；
- 每个巧思横竖各 1 张代表对照图路径；
- 需要我决定的问题。
