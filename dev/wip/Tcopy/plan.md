# Tcopy：精简案例与分类、统一侧栏、全站文案改为面向访客

按本方案逐条实施；遇到本方案没有覆盖的岔路，停下写进报告的“待决定”一节，不要自行决定。

## 0. 背景与原则

- **工作树**：`.worktrees/copy`，分支 `feat/visitor-copy`，基于 origin/main a452ea4。
- **本地服务器端口**：4326，命令 `node scripts/serve.mjs --port 4326`。
- **用户决定**：
  - 删除终末地工业协议案例；
  - 载体只保留“影像视频”“交互操作台”两种；
  - 访客不需要知道来源、参考、证据、开发过程；
  - 筛选放到工具栏的下拉框，不放左侧菜单；
  - 排序只按编号和名称；
  - 文档中心侧栏的样式与案例库一致；
  - 全站文案写给第一次来的访客。
- **文案总规则**（第 4 节是界面文案定稿，第 5、6 节是内容改写规则）：
  - 只说这个东西是什么、画面上发生了什么、怎么用。
  - **一律不出现**：
    - 内部路径，如 `dev/`、`vendor/`、`scripts/` 下的开发脚本路径（命令行使用说明除外）；
    - 任务编号（T4a、T5r 等）；
    - 工具名（Codex、smoke）；
    - 测量过程（“实测”“驱动”“第 N 步”“帧窗”）；
    - 来源与证据（“用户提供”“参考来源”“原版”“上游”“转译”“移植”“证据”“推断”“待核验”）；
    - 免责声明。
- 文案清单在 `dev/wip/Tcopy/copy-inventory.json`，每条带 id。本方案用 `C###` 引用其中的条目。

## 1. 删除内容

1. **删除案例 `industrial-protocol`**，包括：
   - `entries/cases/industrial-protocol.json`
   - `demos/cases/industrial-protocol/`
   - 预览图 `previews/cases/industrial-protocol*`
   - `docs/research/industrial-protocol.md`
2. **删除它派生的 5 个巧思**：`chamfer-panel`、`text-scramble`、`conveyor-flow`、`hold-confirm`、`scanline-wipe`。每个都要删掉：
   - `entries/patterns/<id>.json`
   - `demos/patterns/<id>/`
   - `previews/patterns/<id>*`
3. **清理残留引用**：用 `grep -rn` 在除 `dev/` 外的整个仓库里查找上述 6 个 id，逐个处理。
   - 剩余条目的 `patternIds`、`composition.pairsWellWith`、`composition.conflicts` 里如果引用了被删的巧思，直接去掉这一项。
   - 其他位置的引用（文档、README、脚本中的特例分支）一律删除，并在报告里逐条列出：文件、行号、处理方式。
4. **研究笔记移出站点**：把 `docs/research/archive-os.md`、`docs/research/map-pilgrimage.md` 用 `git mv` 移到 `dev/research/`，移完删除空的 `docs/research/`。
5. **删除条目字段**：
   - 两个案例的 JSON 删除 `source`、`evidence`、`capturedAt`、`research`、`sources`。
   - 巧思的 `sources` 只保留 `[{ "caseId": "<id>" }]`，删除 `observation`、`evidence`、`locator`。

## 2. 分类与数据（`scripts/lib/catalog.mjs` 及其调用方）

1. **taxonomy**：
   - `carriers` 只留 `video: '影像视频'`、`console: '交互操作台'`，删除 `showcase`；
   - 删除 `sources`、`evidence` 两组。
2. **条目的 carriers**：
   - 所有条目删除 `showcase`；
   - `map-pilgrimage` 改为 `["video"]`；
   - `archive-os` 改为 `["console"]`；
   - 巧思的 carriers 去掉 showcase 后若为空，停下报告。
3. **校验**：
   - `CASE_REQUIRED` 去掉 `source`、`evidence`、`sources`；
   - 删除对 source、evidence、research 的校验；
   - 巧思 `sources[].caseId` 必须存在，并且反向包含在对应案例的 patternIds 里，这条保留。
4. **生成物**：
   - 删除 `agent/cases/*.json` 中的 `documents.research`；
   - `agent/catalog.json` 的条目摘要删除 `source`、`evidence`；
   - 先跑 build，确认被删条目的生成物（`agent/`、`prompts/`）都已清理。
5. **档案终端的能量曲线**：`entries/cases/archive-os.json` 的 `energy` 改为以下 39 个值（每 2 秒一个采样，与地图巡礼相同）：

   ```
   [0.12,0.18,0.22,0.26,0.3,0.32,0.36,0.4,0.44,0.5,0.6,0.82,0.6,0.52,0.5,0.48,0.5,0.7,0.6,0.55,0.5,0.62,0.56,0.54,0.72,0.66,0.64,0.92,0.8,0.84,0.62,0.78,0.72,0.8,0.74,0.8,0.74,0.7,0.55]
   ```

   查一下 `assets/library.js` 中 energy 的用法（列表卡片 `energyPath`、详情约第 762 行）是否假设长度为 30。若有这种假设，改为按数组实际长度铺满时长，并在报告里说明。
6. **文档分组**（`scripts/lib/catalog.mjs` 约第 136 行）：
   - 文档中心只收录 `docs/*.md` 和生成的 `prompts/**`；
   - 不再收录 README.md、AGENT.md、CONTRIBUTING.md 和 `docs/research/`；
   - 分组与顺序：
     1. `指南`：guide、rhythm、prompting、methodology、pipeline，按这个顺序排列；
     2. `案例 Prompt`：`prompts/cases/`；
     3. `巧思 Prompt`：`prompts/patterns/`。
   - 生成的 Prompt 文档标题由 `# ${e.title} · 复用 Prompt` 改为 `# ${e.title}`，所属分组已经说明了类型。

## 3. 案例库 / 巧思库 / 文档中心 的结构

### 3.1 列表页（`assets/library.js`）

- **侧栏**：只保留“收藏与工具”一组，内含：
  - 我的收藏（带计数）
  - 导出收藏
  - 导入收藏
  - 浏览巧思库 / 浏览案例库
- 删除载体、来源、类型几组侧栏菜单，以及底部的 `.side-foot`。
- **工具栏**：从左到右依次为：
  1. 侧栏开关按钮：文案改为 `收藏与工具`；
  2. 搜索框；
  3. 筛选下拉框：
     - 案例库：
       - `载体`：选项 `全部载体`、`影像视频`、`交互操作台`。
     - 巧思库，从左到右三个：
       - `类型`：选项为 `全部类型`，加上 taxonomy.types 的 9 个；
       - `载体`：同案例库；
       - `所属案例`：选项为 `全部案例`，加上各案例标题。这个就是原来的 `case-filter`，选项文案改掉。
  4. 排序下拉框：选项 `编号`（原 curated，按 order 排序，默认）、`名称`。删除 `能量强 → 弱`。
- **样式**：下拉框用现有 `.select` 样式，每个都加 `aria-label`（即上面的名称）。
- **URL 参数**：
  - 筛选写回 URL 时的参数名沿用 `carrier`、`type`、`case`；
  - 删除 `source` 参数；
  - `sort=curated` 改名为 `sort=order`，默认值不写入 URL。
- **卡片**：
  - 案例卡片删除来源 chip，只保留载体 chip；
  - 搜索文本去掉 `TAX.sources`。

### 3.2 详情页（`assets/library.js`）

- 删除整个“来源与证据 SOURCES”一节（约第 909 行），以及 `evBadge` 和它的全部调用。
- 巧思详情里，原来列出 `sources` 观察的地方（约第 924 行）改为一行：`所属案例：`，后面跟案例标题链接（`cases.html#<caseId>`，与现有的案例链接写法一致）。
- “逐帧观察 OBSERVED”一节改为标题 `画面细节`、英文 `DETAILS`，内容仍取 `observations`（文字在第 5 节改写）。

### 3.3 文档中心（`docs.html`、`assets/docs.js`、`assets/docs.css`）

- **结构**：左侧目录改用和案例库相同的侧栏结构与类名，即 `aside.lib-side` 中放 `.side-group`、`h2`、`ul.side-list`：
  - 每个分组是一个 `.side-group`，`h2` 用分组名；
  - 每篇文档是 `.side-list` 里的一个链接，右侧 `.count` 不显示（文档没有计数）；
  - 当前文档的高亮样式与 `.side-list button[aria-pressed="true"]` 相同：在 `site.css` 中给 `.side-list a[aria-current="page"]` 加同样的样式。
- **搜索框**：放在侧栏顶部，用和列表页工具栏相同的 `.field` 结构（放大镜图标 + input），placeholder 为 `搜索文档标题`。
- **移动端**：侧栏开合沿用列表页 `.side-toggle` 的行为与样式，按钮文案为 `全部文档（N）`。
- **其他**：中间正文、右侧“本页目录”保持不变；删除 `docs.css` 中不再使用的 `.docs-side`、`.docs-search` 等旧样式。

## 4. 界面文案定稿（按 id 替换；未列出的界面文案保持不变）

| id | 新文案 |
|---|---|
| C076 / 首页 `<title>` | `Motion Atlas · 动态视觉参考库` |
| C087 | `MOTION ATLAS · 动态视觉参考库` |
| C089 | `拆解影像与界面里的动态设计：每个案例都配节拍表、动效参数、可复用的 Prompt，以及能拖动、逐帧播放的 Demo。` |
| C013 | `TWO CARRIERS` |
| C014 | `两种载体，一套节奏语言` |
| C006 | `只能看的影像：转场、HUD、字幕与镜头都写在时间轴上，可以逐帧导出成视频。` |
| C008 | `可以操作的界面：选择、确认、翻页都有清楚的反馈，随时可以暂停。` |
| C010、C011 | 删除整张卡片；首页载体区按 taxonomy.carriers 渲染，只剩两张卡片 |
| C015 | `HOW A CASE IS BUILT` |
| C016 | `一个案例怎么拆` |
| C018 | `逐帧看画面，记下每个转场、每层信息出现和消失的时刻。` |
| C022 | 不变 |
| C025 | `每个能复用的手法单独成条：怎么触发、什么效果、参数多少、能和谁搭配。` |
| C028 | `实现 Prompt、视频生成 Prompt 和负向约束，配一份改配置就能复用的 Demo。` |
| C030 | `同一份代码可以实时播放、拖动定位，也能逐帧导出成视频。` |
| C003 | `结构化索引、每个条目的完整资料包和命令行工具：检索、读取、导出可运行的 Demo。` |
| C050 等页脚（所有页面） | `MOTION ATLAS · 动态视觉参考库：案例、巧思、节奏、Prompt 与可运行的 Demo。`（删除第二句） |
| C053 等页脚链接“收录方法” | `条目结构`，链接仍指向 methodology |
| C120–C123、C133 | 随侧栏分组删除 |
| C129 | 删除（side-foot） |
| C131 | `编号` |
| C132 | 删除 |
| C136 | `${items.length} 个案例：节拍表、动效参数、可复用 Prompt，以及能拖动逐帧查看的 Demo。` |
| 巧思库导语（`library.js` 中 patterns 分支的 p） | `${items.length} 个巧思：每个都有触发方式、效果、参数、可复制的 Prompt 和独立 Demo。` |
| C137 | `${ICONS.filter}收藏与工具` |
| C147 | `没有符合条件的案例。换个关键词，或清除筛选。`（巧思库对应文案同样改为“清除筛选”） |
| C198 | `正在载入 ${pct}%` |
| C203 | `这个 Demo 按 16:9 显示，内容随画框自适应。` |
| C243、C244 | `DETAILS` / `画面细节` |
| C257–C263 | 随“来源与证据”一节删除 |
| C2356 | `还没有文档。` |
| C2354、C2355 | `搜索文档` / `搜索文档标题` |

## 5. 条目内容改写规则（两个案例 + 17 个巧思）

**范围**：清单中 `category=content`、页面为 cases 或 patterns、且属于保留条目的全部文字。被删条目的不用管。

**规则**：

1. **视角**：读者是来学动态设计的访客。用现在时描述画面上发生了什么、为什么好用。
2. **删掉**：第 0 节列出的所有内部和来源信息，包括“来源：……”这类整句。删掉后句子不通顺的，重写这一句，不要留残句。
3. **保留且不改动**：
   - 时间、时长、缓动、颜色、尺寸、数量等事实数值；
   - id、字段结构、数组顺序。
4. **不新增事实**：只能删减和改写原有信息，不能编造新的数值或行为。
5. **长度上限**：
   - 节拍说明 `rhythm.beats[].note`：≤ 30 字；
   - `summary`：≤ 60 字；
   - 列表项（useCases、avoid、constraints、interaction、observations.what、layers.role、migration.how）：每项 ≤ 40 字；
   - 其他段落：每句 ≤ 40 字。
6. **Prompt 字段**（prompt、videoPrompt、negativePrompt）：
   - 仍然是“照着做出这个画面”的指令；
   - 只删掉来源与过程性措辞（如“原版”“上游”“实测”“移植自”）；
   - 不缩短其中的设计参数。
7. **专有名词**：作品名（莱茵生命、RhineLab、地名）是内容，保留。
8. **示例**：节拍 `t=35` 的原文“驱动实测第2100步首次进入 detail，即 A=35.0s，原版自然读取 X-001。来源：dev/shots/T5r/opening.”，应改为“自动打开第一份档案 X-001，进入详情页。”

**产物**：

- 直接修改条目 JSON。
- 生成对照表 `dev/wip/Tcopy/content-diff.md`：按条目、字段列出 `原文 | 新文`。

## 6. 文档改写规则

**范围**：

- `docs/guide.md`、`docs/rhythm.md`、`docs/prompting.md`、`docs/methodology.md`、`docs/pipeline.md`；
- README.md；
- AGENT.md 中面向使用者的部分。

**规则**：

1. 套用第 5 节的规则 1–4。
2. **`docs/methodology.md`**：
   - 标题改为 `# 条目结构`；
   - 内容改为说明一个案例、一个巧思由哪些部分组成，各字段在页面上的位置和用途；
   - 删除证据等级、来源分类、收录流程中的内部步骤。
3. **`docs/pipeline.md`**：
   - 保留“如何播放、拖动、逐帧导出视频、检查”的使用说明与命令；
   - 删除开发过程记录、任务编号、字号下限历史等。
4. **`docs/guide.md`**：引用“三种载体”“来源”“证据”的地方，按新的分类改写。
5. **README.md**：
   - 计数块交给 build 处理；
   - 案例表删除工业协议行和“证据”列，列改为 `案例 | 载体 | 时长`；
   - 案例表下方的说明段落替换为以下两段：

     ```
     地图巡礼是一支 60 秒的旅行影像：从上海飞抵关西机场，走访京都伏见稻荷、鸭川、奈良公园与大阪道顿堀，横屏、竖屏两套构图。莱茵生命档案终端是一个可以操作的档案界面：开机、浏览档案阵列、读取档案、查看 3D 模型与四向翻阅，横屏构图。

     两个案例都整体等比缩放，配有合成乐谱，Demo 可以拖动、跳拍、逐帧导出成视频。地图巡礼的 12 个巧思使用固定舞台与乐谱；档案终端的 5 个巧思为自适应布局。
     ```

   - 其他段落中出现第 0 节禁止项的，按规则改写。
6. **AGENT.md、CONTRIBUTING.md**：
   - 它们不再进入文档中心，但仍在仓库里；
   - 只把其中关于来源、证据字段的说明改为与新的字段结构一致（删除 source、evidence、sources 的说明）；
   - 其他内容不动。
7. **产物**：`dev/wip/Tcopy/docs-diff.md`，按文件列出删改的段落（`原文 | 新文`）。

## 7. 节奏实验室

清单中 `page=lab`、标记含 `wordy`、`internal` 或 `provenance` 的条目，按第 5 节的规则 1–5 改写；其他控件文案不动。对照表并入 `content-diff.md` 的末尾一节。

## 8. 验证（在本工作树根目录执行）

1. 依次执行：
   - `node scripts/build.mjs`
   - `node scripts/check.mjs`：必须退出 0
   - `npm run build:site`
2. 用 `node scripts/serve.mjs --port 4326` 启动服务，然后运行：

   ```
   node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4326
   ```

   要求 19/19 全部通过（2 个案例 + 17 个巧思）。连续跑 2 次。
3. **禁用词检查**，脚本写在 `dev/wip/Tcopy/tools/banned.mjs`：
   - **检查范围**：
     - `entries/**`
     - `assets/*.js`、`assets/*.css`、根目录 `*.html`
     - `docs/*.md`
     - `data/*.js`
     - `prompts/**`
     - README.md
   - **禁用词**：
     - 开发信息类：`dev/`、`T4a`、`T4b`、`T5r`、`T7`、`T13`、`Codex`、`smoke`、`实测`、`驱动`、`帧窗`
     - 来源与证据类：`用户提供`、`参考来源`、`原版`、`上游`、`转译`、`移植`、`证据`、`推断`、`待核验`
     - 已删除功能类：`策展`、`能量强`、`展示台`、`showcase`、`industrial-protocol`，以及第 1 节的 5 个巧思 id
   - **允许的例外**：代码标识符与注释（`assets/*.js` 中的注释和变量名不算），以及 README 中命令行示例里的路径。例外要逐条列出理由。
   - **通过标准**：其余命中数为 0。
4. **截图**：存到 `dev/shots/Tcopy/`，每张都要打开查看。
   - 1440×900：首页、案例库、巧思库、案例详情（archive-os，滚动到节奏结构一节，要看到能量曲线）、巧思详情（任选一个）、文档中心、节奏实验室、Agent 工作流。
   - 390×844：案例库、文档中心（侧栏收起和展开各一张）。
   - 前后对比：文档中心改版前（origin/main）与改版后，1440×900 各截一张，拼成一张并排图。
5. **筛选断言**，脚本写在 `dev/wip/Tcopy/tools/check-filters.mjs`：
   - 案例库：载体选 `交互操作台` 时结果为 1，选 `影像视频` 时为 1；
   - 巧思库：每个类型和载体选项下，结果数与按 `MA.patterns` 自行计算的数一致；
   - 排序选 `名称` 后顺序正确；
   - URL 参数可以往返恢复。
6. **报告** `dev/reports/Tcopy.md`，内容包括：
   - 逐节核对表（每一条写“已做”“偏离（原因）”或“未做”）；
   - 第 1 节的残留引用处理清单；
   - smoke 结果行；
   - 禁用词检查结果；
   - 筛选断言结果；
   - 截图索引；
   - 待决定事项。

## 9. 范围

- **允许修改**：除 `vendor/`、`kit/` 和 `demos/` 下保留条目的 Demo 代码以外的仓库文件。其中 `demos/` 只删除第 1 节列出的那些。
- **不得修改**：保留条目 Demo 里的文字（Demo 舞台内的文字）。如果发现其中有内部信息，列入“待决定”。
- 不 commit、不 push、不切分支。

**最终答复**列出：

- 各项验证的结果行；
- 禁用词命中及例外；
- 待决定事项；
- 两份对照表的路径。
