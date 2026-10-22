$stop-that-shit change -- 把 Motion Atlas 的档案终端案例（archive-os）改为 RhineLabUI 的忠实移植：原版代码、模型、字体、音频、档案内容原样复用，只做接入 Motion Atlas 时间轴协议所必需的最小改动。

# 0. 总原则（必须遵守）

- 这是**移植**，不是重新设计。所有视觉、排版、字号、文案、动效参数、缓动、音色都以原版为准；你不做任何审美或设计决定。本说明没写到的地方，一律保持原版行为。遇到本说明没覆盖、又必须做选择的情况，停下来，在最终答复里写明问题和选项，不要自己定。
- 原版：`C:/Users/mibxr/AppData/Local/Temp/mmref/RhineLabUI`（只读，不要改它）。上游提交：`12cc5e4`。可运行的原版副本（已装依赖）：`C:/Users/mibxr/AppData/Roaming/Claude/scratch-workspaces/9e36bc74-d352-41a7-b6ca-788357b63e8c/7cffb294-5977-496c-8759-32aaf513ef28/scratch-2026-10-14-be6220/dev/shots/T5/reference-runtime`（同样只读，用于对照）。
- 工作目录是 git 工作树 `.worktrees/archive`（分支 `feat/archive-os-port`）。不要 commit / push / 切分支。
- 本地服务：在本工作树根目录用 `node scripts/serve.mjs --port 4323`；原版对照服务用 4331。不要碰 4321（用户正在用）和 4322。
- 每完成一步，在 `dev/wip/T5r/progress.md` 追加一行（入库）；中途停止时写清现场和下一步。

# 1. 先读

1. 原版：`README.md`（许可与第三方说明一节）、`LICENSE`、`PR15-ATTRIBUTION.md`、`public/audio/README.md`、`public/fonts/NOTICE.txt`、`src/main.ts`、`src/scene.ts`、`src/audio.ts`、`src/boot*.ts`、`src/model-viewer.ts`、`src/viewport-layout.ts`、`scripts/capture-readme.mjs`（它的操作序列是下面时间轴的依据）。
2. 本仓库：
   - `docs/pipeline.md`：舞台、`__motion` 协议、乐谱、预加载；
   - `kit/motion-kit.js`：`audio.attach`、`playVoice`、`sustainedAt`、`renderOffline`、`renderWav`；
   - `scripts/smoke.mjs`、`scripts/check.mjs`、`scripts/capture.mjs`、`scripts/render.mjs`、`scripts/build-static.mjs`。

# 2. 文件结构（照此建立）

```
vendor/rhinelabui/                 上游源码快照（不部署；build-static 只复制固定目录，vendor 本来就不会进 dist）
  UPSTREAM.md                      上游地址、提交 12cc5e4、复制日期、改动清单（每个改动文件 + 原因 + 对应本说明的条目号）
  LICENSE  PR15-ATTRIBUTION.md  README.md
  index.html  package.json  package-lock.json  tsconfig.json  vite.config.ts
  src/  content/
  scripts/render-audio.mjs  scripts/extract-typing-audio.mjs
  licenses/                        从上游 public/ 复制的许可文件：fonts/MiSans-license.pdf、fonts/NOTICE.txt、licenses/rolling-number.txt、audio/README.md
  build.mjs                        本仓库的构建脚本（见第 5 节）
  film/                            本仓库新增的胶片驱动代码（见第 4 节）
demos/cases/archive-os/
  index.html  config.js  script.js  style.css  motion-kit.js(由 build 同步)
  app/                             Vite 构建产物 + 上游 public/ 下的全部运行时资源（字体、GLB、音频、图标、archives/*.txt）
  film-audio.ogg                   整部胶片的原版声音（第 6 节生成）
  LICENSES.md                      汇总许可与免责声明（第 8 节）
```

- 上游 `public/` 的二进制资源只在 `demos/cases/archive-os/app/` 存一份，不在 vendor 里重复。
- 不复制：`art/`、`docs/`、`reference/`、`verification/`、`wallpaper/`，以及部署配置（`vercel.json` 等）。
- 删除旧版 FIELDWORK 实现：`demos/cases/archive-os/` 下旧的 `script.js`、`style.css`、`config.js` 内容全部替换，不保留旧代码。

# 3. 允许对上游源码做的改动（只有这些）

在 vendor 副本里改。每处改动用 `// MOTION-ATLAS:` 注释标出，并登记到 `UPSTREAM.md`。

1. **虚拟时钟**：
   - 新增 `vendor/rhinelabui/film/clock-shim.js`，在 `app/index.html` 中作为第一个同步脚本加载，早于应用包。
   - 它替换 `performance.now`、`Date.now`、`new Date()`（无参）、`requestAnimationFrame` / `cancelAnimationFrame`、`setTimeout` / `clearTimeout`、`setInterval` / `clearInterval` 和 `Math.random`。
   - **实时模式**：虚拟时间跟随真实时间。
   - **驱动模式**：由外部 `__clock.step()` 推进。每步固定 1/60 秒（16.6667ms）；按到期顺序执行定时器，再执行一轮 RAF 回调。
   - `Date` 的纪元固定为 `2026-01-01T00:00:00Z` 加虚拟时间。
   - `Math.random` 用 mulberry32，种子 `0x5EED`，每次页面加载时重置。
2. **跳过渲染开关**：
   - 在 `scene.ts`、`model-viewer.ts` 等所有调用 `renderer.render` / composer 渲染的地方，加 `if (window.__filmSkipRender) return;` 形式的门控。
   - 门控只跳过 GPU 绘制，状态更新照常进行。
3. **胶片模式入口**：URL 参数 `?film=1` 时：
   - 跳过进入页 / 点击开始；
   - 不注册 service worker、不显示 PWA 更新提示、不启用壁纸宿主；
   - 应用自身的音频不出声：AudioContext 不创建，或主输出增益为 0；
   - 由第 4 节的驱动器控制。

   没有 `?film=1` 时，应用行为与上游完全一致。
4. **音频可离线渲染**：
   - 重构 `audio.ts`，让所有发声都经过一个统一入口；
   - 时间基准改为可注入的 `now()`，代替直接读 `context.currentTime`；
   - AudioContext 可以注入，以便注入 OfflineAudioContext，供第 6 节使用。

   合成算法、采样、配乐、音量、声像一律不改。
5. **资源路径**：Vite `base: './'`，所有资源用相对路径，保证在 `demos/cases/archive-os/app/` 子目录下可用。
6. **画质参数**：URL 参数 `?quality=performance|original|high|ultra` 映射到上游已有的画质预设，默认 `original`。

除以上六条外，不得修改上游的任何视觉、布局、CSS、文案、动效参数或交互逻辑。

# 4. 胶片驱动与 Motion Atlas 协议

## 4.1 外层页面 `demos/cases/archive-os/index.html`

- 用 `MotionKit.stage()`，支持横 1920×1080 与竖 1080×1920。
- 舞台内放一个同源 iframe，宽高恰好等于舞台尺寸，src 为 `app/index.html?film=1&quality=<q>`。原版自己的 viewport-layout 会据此进入桌面布局或竖屏（portrait）布局，这正是我们要的。
- 外层页面不叠加任何自己的 UI、文字或装饰。

## 4.2 `window.__motion`（用 MotionKit 的 timeline + expose）

- `duration`、`markers` 见第 4.4 节。
- **seek(t)**：
  - t 先量化到 1/60 网格：`k = round(t*60)`。
  - **向前**（k ≥ 当前步数，且当前是“干净的胶片状态”）：设 `__filmSkipRender = true`，逐步 `__clock.step()` 到 k−1，在步进过程中按时间表派发输入；再关闭跳过，执行第 k 步，渲染一帧。
  - **向后**，或当前状态被用户手动操作过：重新加载 iframe（资源走缓存），再从 0 按上述方式推进到 k。期间通过 MotionKit 发送 `motion:loading`。
  - 连续的 seek 请求合并，只处理最后一个目标。
- **play**：按真实时间累积，每满 1/60 秒执行一步（渲染）。实时播放与 seek 走同一网格，所以同一时刻的画面一致。
- **pause**：停止步进。
- **暂停时用户直接操作 iframe**（键盘、鼠标、触摸）：
  - 切到驱动器的“手动”状态：时钟改为实时模式，应用自身的实时音效打开（受站点声音开关控制），用户可以使用原版的全部功能；
  - 之后的 play 或 seek 一律走“向后”路径重建胶片状态。
- **画幅切换**：重新加载另一尺寸的 iframe，并 seek 到当前时刻。
- **preload**：
  - 把应用的加载进度（字体、两个 GLB、`film-audio.ogg` 解码、首帧着色器编译）汇报给 `MotionKit.preload`；
  - 首帧渲染完成后才 ready。

## 4.3 输入派发

- 键盘输入：向 iframe 的 document 派发 `KeyboardEvent`（keydown + keyup），key 与 code 与真实按键一致。
- 点击：对目标元素派发 pointerdown / pointerup / click，目标按上游的 `data-*` 选择器取。
- 拖拽：在查看器画布中心派发 pointer 事件，见下表。

## 4.4 时间轴（胶片时刻 F；E 为开场结束、档案阵列可操作的时刻）

- **开场**：F = 0 对应上游开场序列的第一帧（白底），开场按上游原样播放，不加速、不裁剪。
- **E 的测定**：在驱动模式下实测应用 `mode` 首次变为 `archive` 的步数，换算成秒，再向上取整到 0.1s。预计约 20.4s。
- 下表时刻都相对 E。“预期选中”一栏是我的推算；若实测不同，以实测为准，并在报告里列出。**不要改动作序列**。

| 时刻 | 动作 | 预期选中 / 结果 |
|---|---|---|
| E+0.0 | 保持 | X-001（第 03 / 05 列 机构档案，01 / 08） |
| E+2.4 | ArrowDown | X-006 |
| E+3.4 | ArrowDown | X-013 |
| E+4.4 | ArrowRight | 第 04 列 能量研究 |
| E+5.4 | ArrowRight | 第 05 列 特别项目 |
| E+6.4 | ArrowRight | 第 01 列 工程研究（横向循环 05→01） |
| E+7.4 | ArrowUp | 第 01 列 08 / 08（纵向循环 01→08） |
| E+8.4 | ArrowUp | 07 / 08 |
| E+9.4 | ArrowDown | 08 / 08 |
| E+10.4 | ArrowDown | 01 / 08（纵向循环 08→01） |
| E+11.4 | ArrowLeft | 第 05 列（横向循环 01→05） |
| E+11.75 | ArrowLeft | 第 04 列（快速连按） |
| E+12.8 | ArrowLeft | 第 03 列，回到记忆的 X-013 |
| E+13.8 | ArrowUp | X-006 |
| E+14.8 | ArrowUp | X-001 |
| E+16.4 | Enter | 打开 X-001，抽取 → 对角解密 → 正文揭示 |
| E+23.9 | 点击 `[data-tab="notes"]` | 研究记录页签 |
| E+26.4 | 点击第三个页签（访问日志，选择器按上游实际） | 访问日志 |
| E+28.9 | 点击第一个页签（概述） | 概述 |
| E+30.4 | 点击 `[data-action="model-viewer"]` | 打开 360° 查看器 |
| E+32.1 | 点击 `[data-viewer="frosted"]` | 磨砂 |
| E+33.8 | 点击 `[data-viewer="clear"]` | 清晰 |
| E+35.5 | 点击 `[data-viewer="explode"]` | 拆解档案（六组结构） |
| E+37.3 → E+38.3 | 拖拽旋转 | 从画布中心起，40 步，每步间隔 25ms；每步 x += 舞台宽 × 6/1600，y += 舞台高 × 1/900（与上游 capture-readme 在 1600×900 下的 6px / 1px 等比）；E+38.3 抬起 |
| E+38.9 | 点击 `[data-viewer="reset"]` | 复位视角 |
| E+39.75 | 点击 `[data-viewer="assemble"]` | 一键重组 |
| E+41.55 | 点击 `[data-viewer="close"]` | 关闭查看器 |
| E+42.0 | Escape | 返回档案阵列 |
| E+45.0 | 结束 | duration = E + 45.0 |

- **标记点**（label 原样使用）：

  | 时刻 | label |
  |---|---|
  | 0 | 开场 |
  | E | 档案阵列 |
  | E+2.4 | 四向浏览 |
  | E+16.4 | 读取与解密 |
  | E+23.9 | 页签 |
  | E+30.4 | 360° 查看器 |
  | E+35.5 | 拆解 |
  | E+39.75 | 重组 |
  | E+42.0 | 返回 |

- 竖屏使用同一张时间表。拖拽起点用竖屏查看器画布的中心，位移按竖屏舞台宽高同样换算。

# 5. 构建

`vendor/rhinelabui/build.mjs`：

1. 依赖：在 `vendor/rhinelabui/` 执行 `npm ci`。若网络失败，复制对照副本的 `node_modules`。node_modules 已被 .gitignore 忽略。
2. 用 Vite 构建：`base: './'`，`outDir: demos/cases/archive-os/app`，`publicDir: false`，`emptyOutDir: false`。构建前删除 `app/` 下上一次的 Vite 产物（index.html 与带哈希的 js/css），**不动** `app/` 下的运行时资源。
3. 运行时资源从上游 `public/` 一次性复制到 `app/`。脚本提供 `--sync-assets` 选项来做这一步。
4. 构建后打印产物清单与总大小。

在 `package.json` 的 scripts 加 `"build:archive": "node vendor/rhinelabui/build.mjs"`。站点构建（`npm run build:site`）不依赖它，产物已入库。

# 6. 声音

1. 新增 `vendor/rhinelabui/film/render-audio.mjs`：
   - 用无头浏览器打开 `app/index.html?film=1&audio=offline`；
   - 应用在该模式下把音频输出注入一个长度为 duration 的 OfflineAudioContext；
   - 以驱动模式（跳过渲染）跑完整部胶片，`now()` 等于胶片时刻，所以每个声音都排在它在胶片里的时刻；
   - 然后 `startRendering()`，编码为 48kHz 双声道 WAV，再用 ffmpeg 转成 `demos/cases/archive-os/film-audio.ogg`（libvorbis，q=6）。
   - ffmpeg 路径的找法同 `scripts/render.mjs` 的 `findFfmpeg()`。
2. 这条音轨包含原版的全部声音：三轨配乐、交互音效、开场音、逐字输入短音，与原版的增益和声像一致。
3. **kit 改动**（只允许这两处，写进报告）：
   - 在 `MotionKit.audio.dsp` 加 `sample(ctx, out, when, buffer, { offset = 0, gain = 1 })`：创建 AudioBufferSourceNode，连接、启动，并登记到当前声部记录。这样暂停和跳转能停掉它。
   - `sustainedAt` 支持函数音色：事件带 `resume: true` 与 `dur` 时，同样按 offset 从中途恢复。
   - 改完运行 `node scripts/build.mjs` 同步全部 kit 副本，并跑全量 smoke 确认其他 Demo 不受影响。
4. 外层页面用 `MotionKit.audio.attach(tl, score)` 挂一份乐谱。乐谱只有一个事件：`{ t: 0, voice: fn, dur: duration, resume: true, bus: 'music'（若有该总线，否则 'sfx'） }`。fn 用 `dsp.sample` 播放解码后的 `film-audio.ogg`，并带上 offset。
   - 这样播放、暂停、跳转、`renderWav` 导出都走 kit 的统一路径。
   - 主链路的限幅（-1 dBFS 天花板）照常生效。
5. 站点声音开关：
   - 关闭时 kit 静音；
   - 手动操作状态下，同时关闭应用自身的 sound 与 music 偏好；
   - 打开时恢复。

# 7. 字号检查豁免

原版字号照原样保留，不放大。

- 在 `entries/cases/archive-os.json` 加字段 `"fontFloor": "reference"`。
- `scripts/check.mjs` 遇到该字段：该 Demo 目录的字号不计错误，只输出一行说明：“archive-os：字号沿用参考作品（RhineLabUI）”。
- `scripts/smoke.mjs` 遇到该字段：
  - `--strict-fonts` 下也不因字号失败；
  - 输出写成“字号沿用参考（最小 Npx）”；
  - N 用 iframe 内文档实测：遍历 iframe document 中所有可见文本元素的计算字号，乘以舞台缩放比。
- 除这两处外，不要改 scripts/。

# 8. 许可、署名与条目

1. `demos/cases/archive-os/LICENSES.md`，内容包括：
   - 上游 MIT 许可全文（Copyright (c) 2026 LBEILC）与 PR15 署名；
   - MiSans 许可（链接到 `app/` 内的 PDF）与 `NOTICE.txt`；
   - rolling-number 许可；
   - 上游 README 中“《明日方舟》相关内容”和“其他第三方资源”两段的原文；
   - 一句免责声明：“本案例为 RhineLabUI 的移植，属非官方作品；《明日方舟》及莱茵生命相关名称、标志、设定、原片与原片音频采样的权利归各自权利人所有。”
2. `entries/cases/archive-os.json` 按下面改：
   - title：`莱茵生命档案终端`；en：`Rhine Lab Archive Terminal`；
   - 简介一句：`RhineLabUI 的完整移植：白底开场、五列循环档案阵列、对角解密、360° 查看器与结构拆解，原版模型、字体与配乐。`
   - sources：上游仓库、LICENSE、PR15-ATTRIBUTION.md、参考 PV（https://www.bilibili.com/video/BV1rr4y1b7sz/）；
   - 节拍、标记、技术要点等字段：只写从上游源码与实测得到的事实（时长、缓动、阻尼、帧率），每条注明来源文件；
   - 其余字段沿用现有结构，删掉所有 FIELDWORK 的描述。
3. `docs/research/archive-os.md` 全文重写为移植记录：
   - 上游架构概述；
   - 改动清单（同 `UPSTREAM.md`）；
   - 胶片驱动原理；
   - 声音生成方法；
   - 许可；
   - 验证记录。
   删掉旧的 FIELDWORK 内容。

# 9. 验证（全部要做，结果写进报告）

1. **逐拍对照**：
   - 原版对照副本在 4331 上运行，用同样的动作序列，在真实时间下由 Playwright / CDP 驱动；移植版则 seek 到同一时刻。
   - 时刻：F = 2、6、10、14、18、E+1、E+4.9、E+12.0、E+20、E+25、E+31.5、E+36.5、E+40.5、E+43。
   - 两种画幅都要截：横屏视口 1920×1080，竖屏 1080×1920。
   - 输出左右拼接的对照图到 `dev/shots/T5r/parity/<orient>-<F>.png`，并计算 64×36 缩略后的平均绝对差。
   - 你逐张看。除时钟数字、噪点与景深的随机纹理外，布局、文字、模型位置、选中项必须一致；不一致要修，修不了的写明原因。
2. **seek 确定性**：
   - 20 个时刻，分别从 0、从 duration、从随机时刻跳来；
   - iframe 内 DOM 状态（mode、选中档案、页签、查看器状态）必须全部一致；
   - 画布截图在 64×36 缩略后的平均绝对差 < 2/255。
3. **性能**（报告里给出数字）：
   - 向前 seek 的推进速度，单位为倍实时；
   - 从结尾 seek 回 F = 30 的耗时，要求 ≤ 6s；
   - 首次 ready 时间与下载总量。
4. **smoke**：`node scripts/smoke.mjs --only archive-os --strict-fonts --base http://localhost:4323` 连续 3 次通过，UTF-8 日志存到 `dev/shots/T5r/smoke-{1,2,3}.log`。
   - 若无头软件渲染太慢导致播放检查失败：实时预览在检测到软件 GL 时自动用 `quality=performance`（上游自带预设，不算改视觉）。
   - 不要放宽 smoke 的阈值或超时。
5. **全量回归**：kit 改动后，`node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --strict-fonts --base http://localhost:4323` 全部通过。
6. **其余检查**：
   - `node scripts/build.mjs`、`node scripts/check.mjs`、`npm run build:site` 通过；
   - 确认 `dist/` 含 `demos/cases/archive-os/app/` 且不含 `vendor/`。
7. **预览图**：`node scripts/capture.mjs --only archive-os --base http://localhost:4323`。
8. **MP4**：
   - 渲染横竖两段带音轨的 MP4 到 `dev/shots/T5r/render/`，画质 `original`。
   - 先尝试硬件 GPU：参照 `dev/wip/T4a/tools/direct-browser.mjs` 写一个 `--import` 适配器，加 `--enable-gpu --use-angle=d3d11 --ignore-gpu-blocklist`；确认 WebGL renderer 字符串是真实显卡后再用。不行就用软件渲染，并记录耗时。
   - 用 ffprobe 确认规格，并解码抽 6 帧查看。
9. **手动模式**：
   - 暂停后用真实键盘切档、按 Enter 解密、打开查看器，确认原版交互全部可用、有声音；
   - 再按 play，确认回到胶片状态。

# 10. 报告

写 `dev/reports/T5r.md`，包含：

- 照本说明逐条执行的对照表：条目号、做了什么、证据路径；若有偏离，写明原因；
- 上游改动清单；
- 实测的 E 与各步选中结果；
- 对照截图索引；
- 各项验证数据；
- 两段 MP4；
- 遗留问题。

# 11. 允许修改的文件

- `vendor/rhinelabui/`（新增）；
- `demos/cases/archive-os/`；
- `entries/cases/archive-os.json`、`docs/research/archive-os.md`、`previews/cases/archive-os*.jpg`；
- `kit/motion-kit.js`：只限第 6.3 节两处；
- `scripts/check.mjs`、`scripts/smoke.mjs`：只限第 7 节；
- `package.json`：只限加 `build:archive`；
- `dev/reports/T5r.md`、`dev/wip/T5r/`、`dev/shots/T5r/`；
- build 生成物：data/、agent/、prompts/ 及各 Demo 的 motion-kit.js 副本。

其他文件一律不改。结束时停掉你启动的所有服务器和浏览器进程。

# 12. 最终答复必须列出

- 逐条执行对照表的摘要（偏离项单列）；
- 改动的文件；
- 实测 E 与 duration；
- 验证结果（数字）；
- 报告路径；
- 代表性对照图（横竖各 3 张）；
- MP4 路径；
- 需要我决定的问题。
