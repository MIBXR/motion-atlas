$stop-that-shit change hash=allow -- 资源库第二阶段 B1：原样收录 lemo-opuscar，24 个可运行样片接入逐帧播放器，资源库新增「代码片风格」（按本方案逐条实施，不自行发挥）。

# 0. 背景与原则

- 用户要求把 lemo-opuscar 的 59 种风格全部收录，并把样片忠实移植为可运行 Demo。
  - 实测：补上 Release `assets` 里的 demo 包后，24 个样片可以直接在浏览器就绪；
  - 另有 17 个缺字体或素材，18 个需要上游的构建步骤。
  - 本阶段 B1 收录全部 59 种风格的文档与源码，把 **24 个就绪样片**接入播放器。其余 35 个先展示海报与成片链接，在 B2 / B3 补齐，本阶段不碰。
- **原样收录**：上游文件逐字节复制，不改写。唯一的派生物是从成片提取的音轨（第 1.3 节），它的来源与改动写进清单和页面署名。
- 本文写死了结构、文案、参数与校验。遇到岔路时停下，写进报告的“待决定”一节。
- 前置：第一阶段（`dev/wip/Tres/plan-a.md`）已完成，并通过主任务验收（提交 1d5935a；主任务另外修过 `assets/resources.js`：正文去掉 frontmatter 与重复的一级标题，`.doc-path` 不再重复 repo 名）。本方案在它的基础上扩展，复用其中的：
  - `vendor-resources.mjs`
  - `UPSTREAM.json`
  - `buildResources()`
  - `resources.html`
  - `assets/resources.js`
  - `MAMarkdown`
- 事实依据（主工作区，只读）：
  - `dev/shots/Tnew/inventory.md` 第 2 节：许可原文、CREDITS；
  - `dev/shots/Tnew/survey/lemo-contract.md`：页面契约；
  - `dev/shots/Tnew/survey2/lemo-runtime.json`、`lemo-runtime.md`：每片状态、实际请求的文件、两个 Release 的资产对照。
- 上游：
  - 克隆：`dev/shots/Tnew/refs/2-lemo-opuscar/`（git 会报 bad object HEAD，提交号用下面的值）；
  - demo 包：`dev/shots/Tnew/survey2/packs/`。
  - 仓库：https://github.com/lemomo-ai/lemo-opuscar
  - 提交：`3961ddb3d24d8876e0e2754f7790d66908acee51`
- 工作树 `.worktrees/resources`，服务器端口 4328。不 commit、不 push、不切分支。

# 1. 收录

## 1.1 状态表 `scripts/lemo-status.json`（新，手写数据文件）

- 由 `lemo-runtime.json` 转写，覆盖除 `_` 开头外的 59 个 slug，按 slug 排序。格式：

  ```json
  {
    "<slug>": {
      "status": "ready",
      "film": "<films Release 中该样片的资产文件名>",
      "web": "<web Release 中该样片的资产文件名>"
    }
  }
  ```

- `status` 只能取三个值：`ready`、`needs-assets`、`needs-build`。
  - 映射规则：lemo-runtime 的“就绪”→ `ready`，“仍缺素材”→ `needs-assets`，“仍需构建”→ `needs-build`（city-symphony 归 `needs-build`）。
  - 写完后核对计数：24 / 17 / 18，不符就停下。
- 某个 slug 在 Release 里找不到资产时，对应字段写 `null`，并在报告中列出。

## 1.2 `scripts/vendor-resources.mjs` 增加 `lemo-opuscar`

**用法**

```
node scripts/vendor-resources.mjs lemo-opuscar <克隆目录> --commit <sha> --packs <demo 包目录> --web <web 成片目录> [--fetched YYYY-MM-DD]
```

**目标目录**：`resources/lemo-opuscar/`

**从克隆收录**

- 根目录下全部文件。
- `styles/**`、`core/**`、`tools/**`、`docs/**`。

**排除**：`.git/`、`.github/`、`styleboard/`（上游画廊站点，约 16 MB）、`plugin/`（Claude Code 插件安装壳）。excluded 照此写。

**从 demo 包收录**

- 对每个 `ready` 样片，取 `lemo-runtime.json` 中记录的、返回 2xx 的同源请求文件。
- 只收克隆里没有的那部分，从对应的 `demo-<slug>.tar` 中取出，放到同一相对路径。
- 解包前先 `tar -tf`。含绝对路径或 `..` 的条目拒绝，并停下报告。
- 非 `ready` 样片本阶段不收包内文件。

**清单（`UPSTREAM.json`）**

- `files` 的每项多一个字段 `origin`，取值：
  - `"git"`
  - `"pack:demo-<slug>.tar"`
  - `"film-audio:web/<文件名>"`
- `license` 照抄：

  ```
  代码与文档 MIT；样片成片与静帧 CC BY 4.0（署名 LemoLab，附仓库链接，注明改动）；第三方素材见各 demo/CREDITS；game-show、paper-lantern、news-package 的配音不在 CC BY 4.0 范围内，不得复用
  ```

- `notice` 由两部分组成：
  1. 克隆中 `README.md` 第 363–373 行，逐行原文，去掉空行后组成数组；
  2. 末尾追加一行：

     ```
     Motion Atlas 的改动：audio/*.ogg 为上游 web Release 成片的音轨，转码为 Ogg Opus 128 kbps；未收录 game-show、paper-lantern、news-package 的音轨（含不可复用的配音）。
     ```

## 1.3 音轨（派生物）

**下载**：把 web Release 中 59 个样片的成片下载到 `dev/shots/Tnew/films-web/`（主工作区，已被忽略）：

```
gh release download web -R lemomo-ai/lemo-opuscar --pattern '<web 文件名>' --dir dev/shots/Tnew/films-web
```

- 按 `lemo-status.json` 的 `web` 字段逐个下载。中断就重跑。
- 不下载 films Release。

**提取**：vendor 脚本对每个 slug 执行（`game-show`、`paper-lantern`、`news-package` 除外）：

```
ffmpeg -v error -i <mp4> -vn -map 0:a:0 -c:a libopus -b:a 128k -ar 48000 -ac 2 resources/lemo-opuscar/audio/<slug>.ogg
```

ffmpeg 的查找方式同 `scripts/render.mjs` 的 `findFfmpeg()`。

**核对**：对每个成片，用 ffprobe 读成片时长与 `style.json.dur`，差值写进报告。

- 差值 > 0.1 s 的，音轨照样提取，并在报告里单列。
- 不要裁剪或平移音轨。

## 1.3a 忽略规则

`.gitignore` 中的通配规则可能挡住收录文件。第一阶段已把 `dist/` 改为只匹配仓库根的 `/dist/`。本阶段再做以下修改：

- 把 `renders/`、`frames/` 改为 `/renders/`、`/frames/`；
- 在文件末尾追加：

  ```
  !resources/**/*.mp4
  !resources/**/*.mov
  !resources/**/*.webm
  !resources/**/*.log
  ```

收录完成后运行 `git ls-files --others --ignored --exclude-standard resources`，输出必须为空。若仍有文件被忽略，停下并报告清单。

本仓库已设 `git config core.longpaths true`。

## 1.4 运行

```
node scripts/vendor-resources.mjs lemo-opuscar dev/shots/Tnew/refs/2-lemo-opuscar --commit 3961ddb3d24d8876e0e2754f7790d66908acee51 --packs dev/shots/Tnew/survey2/packs --web dev/shots/Tnew/films-web --fetched 2026-10-24
```

（克隆、包、成片目录以主工作区为基准，写成绝对路径。）打印总文件数、总字节，以及 git / pack / film-audio 三类各自的字节数。

# 2. 逐帧播放器 `demos/styles/player/`

新增三个文件：`index.html`、`player.js`、`player.css`。结构照 `demos/cases/archive-os/`（iframe + MotionKit 舞台 + 整片音轨挂到时间轴），先读 `demos/cases/archive-os/script.js` 再动手。

## 2.1 页面与舞台

- `index.html` 依次加载：
  - `../../../kit/motion-kit.js`；
  - `player.css`；
  - `player.js`。
- URL 参数：
  - `style=<slug>`：必填。缺失或不在 `lemo-status.json` 的 ready 集合内时，舞台中央显示 `未知或不可运行的样片：<slug>`，不暴露 `__motion`。
  - kit 的通用参数（`render`、`embed`、`orient`、`t`）照常由 kit 处理。
- 播放器需要样片元数据，但不加载 `data/resources.js`。它 fetch 两个文件：
  - `../../../resources/lemo-opuscar/styles/<slug>/style.json`；
  - `../../../scripts/lemo-status.json`。

  因此 `scripts/build-static.mjs` 要把 `scripts/lemo-status.json` 复制到 `dist/scripts/lemo-status.json`：只复制这一个文件，不复制整个 `scripts/`。
- 舞台：只有横屏 1920×1080，`orients` 只给 landscape，整体等比缩放（kit 的 stage 默认行为）。

## 2.2 iframe 与就绪

- iframe 的 src 为 `../../../resources/lemo-opuscar/styles/<slug>/demo/index.html`。
  - 尺寸 1920×1080，边框 0，铺满舞台。
  - 不加任何 URL 参数。
- 就绪等待：
  - 每 100 ms 检查一次 `iframe.contentWindow.READY === true`，最长 180 秒。
  - 作为 kit 预加载任务登记，进度文案为 `载入样片 <cn>`。
  - 超时则舞台显示 `样片未能在 180 秒内就绪`，`tl.ready` 按 kit 预加载失败的语义处理。
- 时长：
  - 取 `contentWindow.DUR`；
  - 若它不是正数，改用 `style.json.dur`，并 `console.warn('DUR fallback', slug)`。
- 标题：`<cn> · <en>`。

## 2.3 render 的串行化

`render(t)` 不能重入：

- 同一时刻只能有一次 `contentWindow.render(t)` 在执行；如果它返回 Promise，就 await。
- 渲染进行中又来了新的 t，只记住最新的那个；当前这次完成后立即渲染它，中间值丢弃。
- `seek(t)` 返回的 Promise，要等“t 这一帧”真正画完才 resolve。若中途被更新的 seek 取代，就在最终那一帧画完后 resolve。
- 实时播放由 kit 的时间轴驱动。画不过来时跳帧，不累积。

## 2.4 音轨

- 若 `../../../resources/lemo-opuscar/audio/<slug>.ogg` 存在，就 fetch 并 decode，然后按 archive-os 的方式，作为从 t = 0 开始的整段 sample 挂到时间轴上：`MotionKit.audio.attach`，用法照 archive-os。
- 若返回 404，则静音，不报错。

## 2.5 smoke 支持

- 在 `scripts/smoke.mjs` 中新增参数 `--gpu`：它让所有通过 `--url` 添加的任务都按 `renderer: 'gpu'` 处理，即使用同一套 GPU 启动参数与软件渲染拒绝规则。
- 不改 smoke 的其他行为。

# 3. 数据（`buildResources()` 扩展）

`RES` 增加 `styles` 字段：

```js
styles: {
  upstream: { repo, url, commit, fetchedAt, license, notice },
  items: [{
    slug, num, en, cn,
    categoryCn, categoryEn,
    film, line, lineCn, uses,
    frameSec, dur,                 // style.json 原样
    status,                        // lemo-status.json
    audio,                         // audio/<slug>.ogg 是否存在
    poster:  'resources/lemo-opuscar/styles/<slug>/poster.jpg',
    dir:     'resources/lemo-opuscar/styles/<slug>',
    docs:    ['STYLE.md', 'DEMO.md', 'demo/CREDITS'],   // 只列实际存在的
    player:  'demos/styles/player/?style=<slug>',       // 仅 ready，否则为 null
    filmUrl: 'https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/<film>',  // film 为 null 时为 null
    treeUrl: 'https://github.com/lemomo-ai/lemo-opuscar/tree/3961ddb3d24d8876e0e2754f7790d66908acee51/styles/<slug>'
  }]
}
```

- `items` 按 `num` 的数值升序排列；排除 `_` 开头的目录。
- README 计数块在 `**N 条视频提示词**` 之前插入 `**59 种代码片风格**`，分隔符同现有。
- `agent/catalog.json` 的 `resources` 中加入：

  ```json
  "styles": {
    "count": 59,
    "ready": 24,
    "path": "resources/lemo-opuscar/styles/",
    "player": "demos/styles/player/?style=<slug>",
    "license": "<license>"
  }
  ```

# 4. 校验（`scripts/check.mjs`）

- R1 / R2 扩展到 `resources/lemo-opuscar/`。
- **R6**：
  - `lemo-status.json` 的键恰好等于 `resources/lemo-opuscar/styles/` 下不以 `_` 开头的目录集合；
  - status 计数为 24 / 17 / 18。
- **R7**：除 game-show、paper-lantern、news-package 外，每个 slug 都有 `audio/<slug>.ogg`；这三个 slug 都没有。
- **R8**：每个 ready 样片 `demo/index.html` 的同源依赖都存在。实现方式：对 `lemo-runtime.json` 记录的请求路径做静态比对。为此把这份记录精简成 `scripts/lemo-runtime-files.json`（只含 ready 样片：`{slug: [相对 styles/<slug>/ 或 core/ 的路径...]}`），check 读它来比对。

# 5. 资源库页面

## 5.1 切换

两段切换改为三段，依次为：

1. `视频提示词 703`：`#videos`
2. `代码片风格 59`：`#styles`
3. `Skills 7`：`#skills`

## 5.2 列表 `#styles`

- 筛选参数：`#styles?cat=<categoryCn>&status=<ready|needs-assets|needs-build>&q=&sort=<num|name>`。
- **侧栏**：
  - `类别`：`全部类别`，然后按 `categoryCn` 首次出现顺序列出（顺序以 num 升序为准），每项带计数；
  - `状态`：`全部`、`可逐帧播放`（ready）、`待补素材`（needs-assets）、`待构建`（needs-build）；
  - `.side-foot`：`<b>●</b> SOURCE · lemomo-ai/lemo-opuscar<br>代码 MIT · 成片与静帧 CC BY 4.0 · LemoLab`。
- **工具栏**：
  - 搜索框：placeholder 为 `搜索风格、样片名、一句话…`，匹配 cn、en、film、lineCn、line；
  - 排序：`编号`（num）、`名称`（cn，按 `localeCompare('zh')`）。
- **结果行**：左 `共 N 种`，右 `可逐帧播放 24 种，其余先看成片`。
- **卡片**（结构同视频卡片），链接到 `#style/<slug>`：
  - `.card-media`：poster.jpg，16:9 cover。
  - `.card-index`：`<num> / <categoryCn>`。
  - `.card-body`：
    1. h3：cn；
    2. 一行 en，等宽字体，muted 色；
    3. p：lineCn，最多 2 行；
    4. chips：
       - 《film》用 `.chip`；
       - `<dur 取整>s` 用 `.chip`；
       - 状态：ready 为 `.chip.accent` 的 `可逐帧播放`，needs-assets 为 `.chip` 的 `待补素材`，needs-build 为 `.chip` 的 `待构建`。

## 5.3 详情 `#style/<slug>` 与 `#style/<slug>/<doc>`

容器 `.res-detail`，最大宽 1440px。从上到下：

1. **返回链接**：`← 代码片风格`。
2. **eyebrow**：`<num> · <categoryCn> · <categoryEn>`。
3. **h1**：cn；其下一行 en，等宽字体，muted 色。
4. **介绍段落**：p 为 lineCn；再一个 p 为 line，muted 色。
5. **操作行**（`.btn`）：
   - `成片 ↗`：filmUrl；为 null 时不显示；
   - `上游目录 ↗`：treeUrl；
   - `样片源码`：链接 `<dir>/demo/index.html`，新标签打开。
6. **播放区**：

   **ready**

   - 16:9 容器（宽 100%，圆角 `var(--radius)`，1px `var(--line)` 边框）里放 iframe，src 为 `<player>&embed=1`。
   - 容器下方是控制条，高 44px，从左到右：
     1. 播放 / 暂停按钮，用 `Site.ICONS.play` / `pause`；
     2. 时间文本 `m:ss.s / m:ss.s`，等宽 13px；
     3. 拖动条 `input[type=range]`，step 为 1/30 s，撑满剩余宽度；
     4. 声音按钮。
   - 控制条通过 `iframe.contentWindow.__motion` 实现：
     - play / pause / seek / time；
     - 播放时每帧刷新时间与拖动条。
   - 声音按钮照 `assets/library.js` 的做法：
     - 默认关闭，按钮文案为 `声音关`；
     - 点击时向 iframe `postMessage({ type: 'motion:sound', on: <下一状态> })`；
     - 监听 iframe 回报的 `motion:sound` 消息，据此更新文案：`on` 为真时显示 `声音开`。
   - 加载中：容器中央显示 `载入中 xx%`，xx 取自 `__motion.progress`。
   - 首帧：就绪后 seek 到 `frameSec`，显示的是海报那一帧。

   **非 ready**

   - 16:9 容器里放 poster.jpg（cover）。
   - 其下放提示块，样式同 Skill 页的上游声明块：
     - needs-assets：`这个样片缺少上游构建时下载的字体或素材，暂时不能在浏览器里逐帧播放，将在后续补齐。先看成片：`
     - needs-build：`这个样片依赖上游的预处理步骤（Python / Node 构建），暂时不能在浏览器里逐帧播放，将在后续补齐。先看成片：`
     - 两种文案末尾都接 `成片 ↗` 链接；filmUrl 为 null 时去掉“先看成片：”及其后的链接。
7. **文档切换**：
   - 一排 `.chip` 按钮，对应 docs 中实际存在的文件，标签为：
     - `STYLE.md` → `风格规范`
     - `DEMO.md` → `样片说明`
     - `demo/CREDITS` → `素材署名`
   - 当前文档用 `.chip.accent`。默认 `STYLE.md`，路由为 `#style/<slug>/<doc>`。
8. **文档正文**：`article.doc`。
   - `.md` 用 `MAMarkdown.render`；`link` 规则同 plan-a 第 4.7 节，只是把“本 Skill 目录”换成 `<dir>`，站内 `.md` 改指向 `#style/<slug>/<相对 dir 的路径>`。
   - CREDITS 是纯文本，用 `<pre>` 原样显示。
   - 页面顶部加 `.doc-path`：左 `lemo-opuscar / styles/<slug>/<doc>`，右 `原始文件`。
9. **署名**：`.side-foot` 样式，链接 LemoLab 仓库。
   - 一般情况：

     ```
     《<film>》© LemoLab · CC BY 4.0 · 来源 lemomo-ai/lemo-opuscar @ 3961ddb · 改动：音轨取自 web 版成片并转码为 Ogg Opus；第三方素材见「素材署名」
     ```

   - audio 为 false 时，“改动”部分改为 `未收录音轨（含不可复用的配音）`。

## 5.4 移动端

规则同 plan-a 第 4.8 节。另外，390 宽视口下控制条的时间文本改为 `m:ss`，拖动条最小宽 120px。

# 6. 文档

**`docs/resources.md`**

- 在表格中 skills 两行之前插入一行：

  ```
  | `resources/lemo-opuscar/` | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 59 种代码片风格：风格规范、样片说明、样片源码与素材；24 个样片可在站内逐帧播放 | 代码与文档 MIT；成片与静帧 CC BY 4.0（LemoLab）；三段配音不可复用 |
  ```

- 在 `## 更新` 一节中补充 lemo 的命令（同第 1.4 节，路径写成占位符）。
- 新增一节：

  ```markdown
  ## 代码片风格的播放与音轨

  可运行的样片由 `demos/styles/player/` 载入：播放器在 iframe 里打开上游的 `demo/index.html`，等待 `window.READY`，再按时间调用上游的 `window.render(t)`，所以画面就是上游代码画出的画面。上游的成片音轨由离线混音生成、不在仓库里，资源库从上游 web Release 的成片中提取音轨（Ogg Opus 128 kbps）挂到时间轴上；game-show、paper-lantern、news-package 的音轨含有上游声明不可复用的配音，未收录。状态表在 `scripts/lemo-status.json`：ready 为可运行，needs-assets 缺上游构建时下载的字体或素材，needs-build 依赖上游预处理。
  ```

**`README.md`**：在「外部资源」表格的“视频提示词”行之后插入：

```
| 代码片风格 | 59 种风格的规范、样片说明与样片源码；24 个样片可在站内逐帧播放 | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 代码与文档 MIT；成片与静帧 CC BY 4.0（LemoLab） |
```

# 7. 验证（在本工作树根目录，用以下原命令）

1. 依次执行，check 必须退出 0：
   - `node scripts/build.mjs`
   - `node scripts/check.mjs`
   - `npm run build:site`
   - 然后确认 `dist/resources/lemo-opuscar/`、`dist/demos/styles/player/`、`dist/scripts/lemo-status.json` 都存在。
2. 逐字节核对 lemo：
   - origin 为 git 的文件对比克隆；
   - origin 为 pack 的文件对比 tar 中的条目；
   - 不一致数必须为 0。
3. 启动服务器：`node scripts/serve.mjs --port 4328`。
4. 现有条目 smoke，原命令跑 1 次，必须 25/25：

   ```
   node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4328
   ```

5. 24 个播放器的 smoke，连续 2 次，必须 24/24。命令（`--url` 每个 ready slug 一个）：

   ```
   node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4328 --gpu --url http://localhost:4328/demos/styles/player/?style=<slug> …
   ```

   - 某片因时间推进不足而失败时，记录它的 readyMs 与单帧渲染耗时，**不要**改 smoke 的阈值，写进“待决定”。
6. **忠实度检查**（脚本放 `dev/wip/Tres/tools/fidelity.mjs`，用 GPU 启动参数）：
   - 对 24 个 ready 样片，打开 `demos/styles/player/?style=<slug>&render=1`，seek 到 `frameSec`，截取舞台 1920×1080。
   - 与上游 `poster.jpg` 比较：都缩放到 480×270，计算平均绝对差（0–255）。
   - 拼对照图 `dev/shots/Tres/fidelity/<slug>.jpg`（左为播放器，右为 poster），每张都打开看。
   - 报告表格列出每片的 MAD。
   - MAD > 12 的单列出来，并写一句看图后观察到的差异（例如“字体回退”“缺图”“时刻偏移”），不要修。
7. **音画对齐抽查**：用 `scripts/render.mjs` 渲染两段 MP4，带声音：
   - `swiss-motion` 0–8 s；
   - `pixel-rpg` 0–8 s。

   再用 ffprobe 确认两路都存在、时长约 8 s。另外截取上游 web 成片同一时段的音频波形，与我们渲染出的 MP4 的波形拼图对照：`dev/shots/Tres/audio/<slug>.png`，用 ffmpeg 的 `showwavespic` 生成。
8. **页面检查**：在 `dev/wip/Tres/tools/check-pages.mjs` 中增加以下断言：
   - (h) `#styles`：结果为 `共 59 种`；点 `状态 / 可逐帧播放` 后为 24。
   - (i) 打开 `#style/swiss-motion`：
     - 播放器就绪后时间文本显示 frameSec；
     - 点播放 2 秒后，time 增加 ≥ 1.5 s；
     - 拖动条拖到 50% 后，time 与 DUR/2 的差 ≤ 0.05 s。
   - (j) 打开 `#style/backrooms`（needs-build）：显示海报和 needs-build 提示文案。
   - (k) 59 个风格的 STYLE.md、DEMO.md 全部能 fetch 到 200。
   - (l) 390×844 视口下，`#styles` 与 `#style/swiss-motion` 的 `scrollWidth` ≤ 390。

   原有 (a)–(g) 一并重跑。
9. **截图**：存 `dev/shots/Tres/`，每张都打开看。
   - 1440×900：
     - `#styles`
     - `#styles?status=ready`
     - `#style/swiss-motion`（播放器就绪后）
     - `#style/pictogram-motion`
     - `#style/backrooms`
     - `#style/swiss-motion/DEMO.md`
     - `#style/swiss-motion/demo/CREDITS`
   - 390×844：
     - `#styles`
     - `#style/swiss-motion`
10. **体积**：报告 `resources/lemo-opuscar/` 的总字节，按 git / pack / film-audio 三类分开，并列出前 10 大文件。
11. **报告** `dev/reports/Tres-b1.md`：
    - 逐节核对表，每条写“已做”“偏离（原因）”或“未做”；
    - 逐字节核对结果；
    - smoke 结果行；
    - 忠实度 MAD 表；
    - 音轨时长差值表；
    - check-pages 断言结果；
    - 截图索引；
    - 体积；
    - “待决定”一节。

# 8. 允许修改

**脚本**

- `scripts/vendor-resources.mjs`、`scripts/lib/catalog.mjs`、`scripts/build.mjs`、`scripts/check.mjs`、`scripts/build-static.mjs`
- `scripts/smoke.mjs`：只加 `--gpu`
- `scripts/lemo-status.json`（新）、`scripts/lemo-runtime-files.json`（新）

**收录内容与生成物**

- `resources/lemo-opuscar/**`：只能由 vendor 脚本写入
- `data/resources.js` 与其他构建生成物

**页面**

- `demos/styles/player/**`（新）
- `assets/resources.js`、`assets/resources.css`

**文档**

- `docs/resources.md`、`README.md`：只改第 6 节规定的位置

**过程文件**

- `dev/wip/Tres/**`、`dev/shots/Tres/**`、`dev/reports/Tres-b1.md`
- 主工作区的 `dev/shots/Tnew/films-web/`

不改 `demos/cases`、`demos/patterns`、`entries/`、`kit/`、`vendor/`。不 commit、不 push、不切分支。
