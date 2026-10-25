# Tlayout：侧栏与筛选位置、页面撑满、可折叠目录、滚动条统一、移动端菜单

按本方案逐条实施；遇到本方案没覆盖的岔路，停下来写进报告的“待决定”，不要自行决定。

## 0. 背景

- **工作树**：`.worktrees/copy`，分支 `feat/visitor-copy`（PR #6，HEAD 507b96d）。
- **本地服务器**：端口 4326。如果 4326 上已有服务在运行，直接复用。
- **参考**：Design Atlas 的做法见主工作区 `dev/shots/Tlayout/design-atlas-notes.md`（附截图，克隆在 `dev/shots/Tlayout/ref/`）。凡是本方案写“照 Design Atlas”的地方，都以这份笔记中的源码与实测数值为准。
- **文案**：沿用 PR #6 的访客文案规则（`dev/wip/Tcopy/plan.md` 第 0 节），不要引入来源、开发过程之类的说明。

## 1. 案例库 / 巧思库的筛选位置

### 1.1 案例库

- **左侧栏**分两组，从上到下：
  1. 可折叠组 `载体`（第 3 节的 `details` 结构，默认展开）：`全部载体`、`影像视频`、`交互操作台`。
     - 每项右侧显示计数，按钮形式与原来的 `sideButton` 相同（`data-group="carrier"`）。
  2. 普通组 `收藏与工具`：内容不变，即我的收藏、导出收藏、导入收藏、浏览巧思库。
- **工具栏**：
  - 删除载体下拉框；
  - 只保留搜索框，以及第 2 节的排序控件。

### 1.2 巧思库

- **左侧栏**：
  1. 可折叠组 `类型`（默认展开）：`全部类型`，加上 taxonomy.types 的 9 个类型，每项带计数。
  2. 普通组 `收藏与工具`：内容不变。
- **工具栏**，从左到右：
  1. 搜索框；
  2. `载体` 下拉框；
  3. `所属案例` 下拉框；
  4. 第 2 节的排序控件。
- **删除**工具栏里的类型下拉框。

### 1.3 共同规则

- **URL 参数**：继续用 `carrier`、`type`、`case`、`sort`，侧栏与下拉框共用同一份状态，能往返恢复。
- **组合**：侧栏筛选与下拉筛选可以同时生效。
- **计数**：侧栏每项的计数，按“其他筛选条件不变、只改本组取值”来计算。现有 `countBy` 的口径如果与此不同，以本条为准。

## 2. 排序控件与筛选控件区分开

工具栏里的结构：`搜索框`、`筛选下拉框（如有）`、竖分隔线、排序控件。

- **竖分隔线**：1px 宽、24px 高，颜色 `var(--line)`，左右各留 4px 间距。只有工具栏里有筛选下拉框时才出现，所以案例库没有这条线。
- **排序控件**：外层用 `label.sort-control`，里面从左到右依次是：
  1. 上下箭头 SVG：16px，`stroke` 用 `currentColor`，路径为 `M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3`。
  2. 文字 `排序`：12px，颜色 `var(--muted)`。
  3. 一个无边框的 `select`，选项为 `编号`、`名称`。
- **整体样式**：高度与搜索框一致；有 1px `var(--line)` 边框和 `var(--radius)` 圆角，背景 `var(--surface)`。
- `select` 的 `aria-label` 写 `排序方式`。
- **筛选下拉框**：保持现有 `.select` 样式，默认选项分别为 `全部载体`、`全部案例`。

## 3. 侧栏统一：可折叠、只允许纵向滚动

适用于案例库、巧思库、文档中心的 `.lib-side`。

- **可折叠组**：用原生 `details.side-group > summary`，照 Design Atlas。
  - `summary` 用原来 `h2` 的字体：12px 等宽、`letter-spacing: .2em`、`var(--muted)`、全大写样式。右侧放一个 12px 图标：收起时为加号，展开时为减号，用 CSS 遮罩或内联 SVG 实现。
  - 隐藏原生三角标记：`list-style: none`，并处理 `::-webkit-details-marker`。
  - `summary` 的可点击区域占满整行。键盘聚焦时有 `:focus-visible` 外框，外框沿用全站的焦点样式。
  - 不做高度动画。
- **普通组**：`收藏与工具` 仍是 `div.side-group > h2`，不可折叠。
- **滚动**：
  - `.lib-side` 设置 `overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;`。
  - 侧栏里的按钮和链接文字设置 `white-space: normal; overflow-wrap: anywhere;`，计数设置 `flex: none`。
  - 结果：侧栏任何时候都不能横向滚动或横向拖动。

## 4. 页面撑满（照 Design Atlas）

- **`.lib`**（`assets/site.css` 第 96 行）：
  - 删除 `max-width: 1680px`，改为 `margin: 0`；
  - `grid-template-columns: 228px minmax(0, 1fr)`；
  - `gap: 32px`；
  - `padding: 0 32px 80px`。
- **`.lib-side`**：
  - `margin: 24px 0`（替代原来 `.lib` 的上内边距）；
  - `top: calc(var(--header-h) + 24px)`；
  - `max-height: calc(100svh - var(--header-h) - 48px)`。
- **列表主区 `section`**：上内边距 24px，保证页头与侧栏顶端对齐。
- **`.docs`**（`assets/docs.css` 第 2 行）：
  - 删除 `max-width: 1560px`，改为 `margin: 0`；
  - `grid-template-columns: 228px minmax(0, 1fr) 200px`；
  - `gap: 32px`；
  - `padding: 0 32px`；
  - 删除 `.docs > .lib-side { margin-top: 24px; }` 这类单独的偏移，改由第 4 节统一的 `.lib-side` 规则决定。
  - 正文 `.doc` 保持 `max-width: 860px` 以便阅读，位置在中间列内靠左。
- **对齐验收**：同一视口下，案例库侧栏与文档中心侧栏的左边缘 x、顶边 y、宽度三项相差都必须为 0。
- **`.detail`**（第 150 行）：删除 `max-width: 1920px`，`padding` 改为 `16px 32px 80px`。
- **其余页面**：首页、节奏实验室、Agent 工作流的宽度不改。
- **断点**：原有的 `@media (max-width: 1240px)`、`(max-width: 980px)` 断点保持；在这些断点内，以上数值改为对应的新数值。

## 5. 滚动条统一

- **范围**：页面本身的滚动条（`html`）保持浏览器默认。其余所有内部滚动容器统一样式，写在 `assets/site.css`：

  ```css
  body * { scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
  body *::-webkit-scrollbar { width: 6px; height: 6px; }
  body *::-webkit-scrollbar-track { background: transparent; }
  body *::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }
  body *::-webkit-scrollbar-thumb:hover { background: var(--muted); }
  ```

  若 `var(--line)` 在深色或浅色主题下的对比度不足（在截图里看不清滚动条），停下报告，不要另选颜色。

- **详情页的节拍点列表**：即舞台时间轴下方那一排节拍按钮，所在容器见 `assets/library.js` 中渲染 `节拍点` 与 beats 按钮的位置。
  - 改为 `flex-wrap: wrap`，去掉横向滚动（`overflow-x`），全部节拍都显示出来；
  - 行间距与列间距都是 6px。
- **排查其他横向滚动**：在 `assets/*.css` 中逐条检查 `overflow-x: auto/scroll` 和 `overflow: auto`（即可能出现横向滚动的位置），把检查结果按“位置 | 内容 | 处理”列进报告。处理规则如下：
  - 文档中的代码块 `pre` 和宽表格：允许横向滚动，用上面的滚动条样式；
  - 其他容器：改为换行或纵向滚动，不允许横向滚动。

## 6. 移动端：页头菜单浮层（照 Design Atlas）

1. **按钮**：沿用现有的移动端导航按钮（`assets/site.js` 中 `renderShell()` 生成的“打开导航”按钮），改成三横线 SVG 加文字 `菜单`。
   - 位置：页头右侧，在主题按钮左边。
   - `aria-controls` 指向浮层，`aria-expanded` 随开合切换。
   - 只在原来显示移动端导航按钮的断点下出现。
2. **浮层**：
   - 定位：`position: fixed; top: calc(var(--header-h) + 8px); left: 12px; right: 12px;`；
   - 高度：`max-height: calc(100svh - var(--header-h) - 16px)`；
   - 滚动：`overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;`；
   - 外观：背景 `var(--surface)`，1px `var(--line)` 边框，圆角 `var(--radius)`，阴影 `0 12px 32px rgba(0, 0, 0, .28)`。
3. **内容**：
   - **有侧栏的页面**（案例库、巧思库、文档中心）：浮层顶部是两个切换按钮 `本页目录` 和 `全站导航`，默认显示 `本页目录`。
     - `本页目录` 视图：把页面上的 `.lib-side` 节点整体移入浮层，打开时所有 `details` 都展开。
     - `全站导航` 视图：显示原来移动端导航里的页面链接。
   - **没有侧栏的页面**（首页、节奏实验室、Agent 工作流、详情页）：不显示两个切换按钮，只显示全站导航。
4. **桌面端**：浮层只在移动端断点使用。回到桌面宽度时，把 `.lib-side` 移回原来的位置（在 `.lib` 的第一项，文档中心是 `.docs` 的第一项），同时关闭浮层。
5. **关闭方式**：
   - 再次点 `菜单`；
   - 按 Esc；
   - 点浮层之外的区域；
   - 在 `本页目录` 中点了筛选项（案例库、巧思库）或文档链接（文档中心）后自动关闭，以便看到结果。

   关闭后焦点回到 `菜单` 按钮。
6. **页头自动隐藏**：仅在移动端断点生效。
   - 向下滚动、且 `scrollY > 80` 时，给页头加 `is-hidden`，页头向上平移移出视口（`transform: translateY(-100%)`，过渡 .2s）；
   - 向上滚动超过 8px 时，移除 `is-hidden`；
   - 浮层打开时页头始终显示。
   - 用户开启“减少动态”（`prefers-reduced-motion`）时不做过渡。
7. **删除旧入口**：
   - 删除列表工具栏里的 `.side-toggle` 按钮（`收藏与工具`）；
   - 删除文档中心的 `全部文档（N）` 开合按钮及相关 JS/CSS。

## 7. 移动端列表页头精简（照 Design Atlas）

在 `@media (max-width: 1050px)` 下：

- 隐藏 `.lib-head` 里的示意图 `.hero-art`，包括图下的注释。
- `.lib-head h1`：`34px / 1.15`；`.lib-head p`（导语）：`14px / 1.6`；整个页头 `padding: 18px 0 14px`。
- 导语中如有强制换行的 `<br>`，在该断点下隐藏，让文字自然折行。
- 工具栏改为网格布局，网格间距 8px：
  - 第一行：搜索框独占；
  - 第二行：两个筛选下拉框各占一列（巧思库）；
  - 第三行：排序控件独占。
  - 案例库：第一行搜索，第二行排序。
- 验收标准：390×844 视口下，案例库与巧思库首屏能看到第一张卡片的预览图顶部，即卡片顶边 y < 844。

## 8. 验证（在本工作树根目录执行）

1. 构建与检查：
   - `node scripts/build.mjs`
   - `node scripts/check.mjs`：退出码必须为 0
   - `npm run build:site`
2. 冒烟测试，原命令跑 2 次，两次都必须 19/19：

   ```
   node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4326
   ```

3. 筛选断言：更新 `dev/wip/Tcopy/tools/check-filters.mjs`，使其适配新的控件位置（侧栏按钮 + 下拉框），全部通过。另外补充：
   - 侧栏计数口径的断言（第 1.3 节）；
   - URL 往返断言。
4. 布局断言：新建 `dev/wip/Tlayout/tools/check-layout.mjs`，用 `scripts/lib/cdp.mjs` 启动浏览器。
   - (a) 视口宽 1440、1920、2560 时，案例库 `.lib` 主区宽度 = 视口宽度 − 滚动条宽度 − 64 − 228 − 32，误差 ≤ 1px；巧思库、文档中心同理（文档中心再减去 200 + 32）。
   - (b) 案例库、巧思库、文档中心三页侧栏的 x、y、宽度一致（同一视口宽度下比较）。
   - (c) 三页侧栏：计算样式 `overflow-x` 为 `hidden`，且 `scrollWidth <= clientWidth`。
   - (d) 详情页 archive-os 与 map-pilgrimage 的节拍点容器：`scrollWidth <= clientWidth`；全部节拍按钮都可见（`getBoundingClientRect` 在容器内）。
   - (e) 遍历 `body` 下所有元素，找出 `scrollWidth > clientWidth + 1` 且计算样式 `overflow-x` 为 `auto` 或 `scroll` 的元素，除第 5 节允许的 `pre` 和宽表格外，数量为 0。在案例库、巧思库、两个详情页、文档中心三篇（guide、pipeline、一篇 Prompt）上分别检查。
   - (f) 视口 390×844，案例库、巧思库、文档中心逐页检查：
     - 点 `菜单` → 浮层出现，`本页目录` 中有侧栏内容；
     - 点一个筛选项或文档 → 浮层关闭，结果相应变化；
     - 滚动到 y=1500，再向上滚 100px → 页头可见，`菜单` 可点；
     - 按 Esc 可关闭浮层；
     - 横向不能滚动：`document.documentElement.scrollWidth <= 390`。
   - (g) 视口 390×844：案例库、巧思库的第一张卡片顶边 y < 844。
   - (h) 视口 1440：summary 可以折叠和展开；文档中心当前文档所在的组保持展开。
5. 截图：存 `dev/shots/Tlayout/`，每张都要打开看。
   - 1440 与 2560 宽：案例库、巧思库、文档中心。
   - 1440 宽：
     - archive-os 详情页，节拍点区域；
     - map-pilgrimage 详情页，节拍点区域；
     - 巧思库工具栏特写（要能看到分隔线与排序控件）。
   - 390 宽：
     - 案例库首屏；
     - 案例库打开菜单（本页目录）；
     - 巧思库首屏；
     - 文档中心打开菜单；
     - 打开菜单并切到全站导航；
     - 滚动后页头重新出现。
   - 深色与浅色主题各截一张侧栏滚动条特写：用文档中心，把视口高度调小，直到侧栏出现滚动条。
6. 报告 `dev/reports/Tlayout.md`，内容包括：
   - 逐节核对表：每节标明“已做 / 偏离（原因）/ 未做”；
   - 第 5 节的横向滚动排查表；
   - 各项断言结果；
   - smoke 结果行；
   - 截图索引；
   - 待决定事项。

## 9. 范围

- **允许修改**：
  - `assets/site.css`、`assets/site.js`、`assets/library.js`；
  - `assets/docs.css`、`assets/docs.js`、`docs.html`；
  - `cases.html`、`patterns.html`（如需）；
  - `dev/wip/Tcopy/tools/check-filters.mjs`；
  - `dev/wip/Tlayout/**`、`dev/reports/Tlayout.md`；
  - 构建生成物。
- **不改**：`demos/`、`kit/`、`vendor/`、`entries/`。
- 不 commit，不 push。
- **最终答复**：列出各项断言与 smoke 的结果行、截图路径和待决定事项。
