# Motion Atlas · 影像与操作台参考库

面向**按时间线播放的影像视频、交互操作台与展示台**的参考库。每个案例都拆成镜头、信息层、文字、转场与声音轨道，附节拍表、能量曲线、动效 Token、可复用 Prompt，以及可以拖动、跳拍、逐帧渲染成视频的零依赖 Demo。

**在线浏览：[Motion Atlas](https://motion-atlas.mibxranime.chatgpt.site)**

<!-- counts:start -->
**2 个案例**　·　**17 个巧思**　·　**2 个可逐帧渲染的影像 Demo**
<!-- counts:end -->

![地图巡礼 Demo 截图](previews/cases/map-pilgrimage.jpg)

## 收录边界

本库收录以时间线为载体的作品：作品掌握节奏，按时间线播放；即使可以交互，也是在时间线上分支。每个时间驱动的 Demo 都能逐帧渲染成视频。

**收录**
- 影像视频：片头、宣传片、旅行影像、数据短片等
- 交互操作台与展示台：带自动驾驶时间轴的终端、档案界面、展会展示
- 能从案例中单独借用的转场、节奏、文字动效、画面构成、信息层、质感、声音与镜头巧思

**不收录**
- 网站与网页应用，包括其中的页面动效和微交互。这类设计收录在 Web Atlas。

**判定**
1. 最终形态是视频，或是带时间轴、按时间线播放的操作台／展示台：收录，即使它运行在浏览器里。
2. 最终形态是网站或网页应用：不收录。
3. 仍难判断时，设想把它逐帧导出为视频。核心价值仍在，收录；价值依赖重排、滚动阅读和观看者自己的节奏，不收录。
4. 同一来源在两种载体上都有价值时，只收录时间线部分，条目本身保持完整。
5. 主题相同、表现形式不同的作品可以分别出现在两个库里，各自是独立条目，互不引用。
6. 画幅不是判据：原作即使是固定画幅，复刻时也可以调整或拓展。各判据冲突时，以“谁掌握时间”为准。例如一个固定画幅、但完全由观看者拖拽操作、没有时间线的网页光照演示，不属于本库。

## 收录内容

### 案例

| 案例 | 载体 | 时长 |
| --- | --- | --- |
| [地图巡礼 · 游戏过场式旅行影像](demos/cases/map-pilgrimage/) | 影像视频 | 60s |
| [莱茵生命档案终端](demos/cases/archive-os/) | 交互操作台 | 77.6s |

地图巡礼是一支 60 秒的旅行影像：从上海飞抵关西机场，走访京都伏见稻荷、鸭川、奈良公园与大阪道顿堀，横屏、竖屏两套构图。莱茵生命档案终端是一个可以操作的档案界面：开机、浏览档案阵列、读取档案、查看 3D 模型与四向翻阅，横屏构图。

两个案例都整体等比缩放，配有合成乐谱，Demo 可以拖动、跳拍、逐帧导出成视频。地图巡礼的 12 个巧思使用固定舞台与乐谱；档案终端的 5 个巧思为自适应布局。

### 巧思

从案例里拆出来的单个技巧，每条都有触发、结果、参数、组合关系（骨架 / 支撑 / 点睛）、减少动态策略与独立 Demo：

| 类型 | 数量 | 例子 |
| --- | --- | --- |
| 转场 | 5 | 卡片展开为全屏、昼夜逐层插值 |
| 节奏与时序 | 5 | 可seek时间轴、空闲呼吸 |
| 交互反馈 | 4 | 滚动数字、阵列选择波浪 |
| 文字动效 | 4 | 竖排模糊标题、终端逐字开机 |
| 画面构成 | 4 | 四角HUD、章节框线、分屏对比盖章 |
| 信息层HUD | 4 | 路线描绘、收集计数 |
| 质感与后期 | 2 | 胶片颗粒、磨砂转清 |
| 声音 / 镜头 | 1 / 1 | 打字音、路线跟随镜头 |

## 快速开始

需要 Node.js 22+ 与本机的 Edge 或 Chrome（截图、渲染、取帧脚本用），无需安装依赖。

```bash
node scripts/serve.mjs --port 4321
```

打开 <http://localhost:4321/>：

- **案例库 / 巧思库**：筛选、收藏（可导出 JSON 备份）、内嵌 Demo、首屏刻度条与节拍点、加载进度、声音开关、全屏与三段 Prompt；支持固定画幅的 Demo 可切换横竖构图并保持当前时刻。
- **节奏实验室**：用多音色节拍器、拍号 / 细分 / 摇摆练节拍，以 A/B 对比、打拍录入、首拍偏移与量化强度理解吸附；曲线、时长和错峰可对齐拍子，导出 CSS 变量、MotionKit 乐谱代码、Prompt 与 WAV。
- **文档中心**：指南、节奏方法、Prompt写法、条目结构、渲染管线与全部Prompt。
- **Agent 工作流**：资料格式、CLI 与指令生成器。

## 复用

```bash
# 检索、查看、导出
node scripts/atlas.mjs search "转场 地图" --limit 5
node scripts/atlas.mjs show map-pilgrimage --source
node scripts/atlas.mjs export split-compare-stamp --out ../my-demo

# 逐帧渲染（PATH 上有 ffmpeg 时自动合成 MP4）
node scripts/render.mjs demos/cases/map-pilgrimage/index.html --fps 30
# 固定画幅案例：竖屏成片，同时导出同一乐谱的音轨
node scripts/render.mjs demos/cases/archive-os/index.html --orient portrait --fps 30 --audio
```

每个案例 Demo 的内容都集中在 `config.js`，巧思 Demo 集中在 `index.html` 顶部的 `CONFIG` 块：改文案、配色、时刻表即可迁移，时间结构与动效参数保持不变。

## 目录

```text
entries/            案例与巧思条目（唯一内容源）
demos/              可运行 Demo；按时间播放的 Demo 遵守 render(t) 协议
kit/motion-kit.js   共享运行时：固定画幅、时间轴、缓动、节拍、合成乐谱、预加载、控制条
docs/               指南与使用方法
prompts/ agent/ data/   由 entries 生成（勿手改）
previews/           Demo 实际截图
scripts/            本地播放、构建、检查、截图、视频导出与命令行工具
```

## 维护命令

| 命令 | 作用 |
| --- | --- |
| `node scripts/build.mjs` | 同步 kit 副本，生成站点数据、Prompt 文档、Agent 资料包与本文件的计数 |
| `npm run build:site` | 使用 `--site` 生成发布站点到 `dist/`；≥128 KiB 的媒体从固定 Git 提交的 GitHub 地址加载 |
| `npm run build:local` | 生成包含全部素材的 `dist/`，供完整本地分发 |
| `node scripts/capture.mjs` | 重新截取预览图（需先启动本地服务器） |
| `node scripts/frames.mjs <video>` | 参考视频取帧，生成带时间码的接触表 |

新增条目的流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，给 Agent 的说明见 [AGENT.md](AGENT.md)。

发布前先运行 `npm run build`，提交并推送源码，再运行 `npm run build:site`（等同于 `node scripts/build-static.mjs --site`）。站点配置见 `.openai/hosting.json`。发布包中的 `assets/asset-sources.js` 自动记录本次提交和大素材地址；新增的大图、音视频、字体与模型会自动纳入，JS、CSS 和小素材随站点部署。源码和完整本地包保留原始素材。

发布模式的 `MotionAtlasAssets.resolve(url)` 负责素材地址解析，兼容现有图片、字体和 `fetch` 加载；MotionKit 继续负责预加载、缓存、进度与就绪通知。外部地图瓦片及其他未列入清单的请求沿用原地址。发布模式需要联网访问 GitHub 素材。
