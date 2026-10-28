# 贡献指南

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

## 收录原则

- **案例驱动**：不把 skill 或教程的文字直接搬进库。找出其中真实的 Demo 或作品，忠实复刻后收录；没有现成作品、但能实践的，自己做一个作为真实案例收录。
- **忠实复刻**：直接复用原作的代码、美术、字体、音频、品牌内容与文案，不简化，不臆造替代场景、插画或配色。附原作许可证，写清出处与署名。验收时在相同视口下与原作并排截图对照。
- **语言**：网页上的说明文字一律用中文。保留原语言的只有被复刻作品本身的原文，以及作为素材收录的 skill、prompt 原文。
- **声音**：新做的作品不用 AI 合成声音。用一条连续的公开音乐打底（如 Incompetech / Kevin MacLeod，CC BY 4.0），在 3–4 个关键节点放短音效（如 Kenney.nl，CC0），音量压在音乐之下。复刻作品沿用原作声音。

## 新增一个案例

1. **条目结构**：按[条目结构](docs/methodology.md)整理节拍、分层、参数、Prompt和Demo。
2. **Demo**：在 `demos/cases/<id>/` 建 `index.html`、`style.css`、`script.js`、`config.js`。
   - 内容（文案、配色、时刻表）全部放进 `config.js`。
   - 画面写成 `render(t)`，用 `MotionKit.timeline` 包装并 `MotionKit.expose()`；`<script src="motion-kit.js">` 引用同目录副本，条目里设 `"kit": true`，构建会自动同步。
   - 遵守 `?embed`、`?render`、`?t=` 参数；画面文字按设计需要决定字号；图标用 SVG；支持减少动态；声音默认关闭。
   - 复刻已有作品时，保留原作的文件结构与代码，只改写资源路径，再加一层适配脚本接上 `MotionKit` 的时间轴、参数与控制条。路径改写与适配写进 `fidelity.md`，原作、字体、库与音频的出处和许可写进 `LICENSES.md`。
3. **条目**：写 `entries/cases/<id>.json`。必填：`id`、`title`、`carriers`、`summary`、`prompt`、`demo`、`composition`。建议填写：`rhythm.beats`、`energy`、`layers`、`tokens`、`interaction`、`videoPrompt`、`negativePrompt`、`migration`、`patternIds`、`previewAt`。
4. **巧思**：把案例里每个“触发 → 结果”的技巧写成 `entries/patterns/<pid>.json` 与 `demos/patterns/<pid>/index.html`（顶部 `CONFIG` 块），在巧思的`sources`里只写`{ caseId }`，并把 `<pid>` 加进案例的 `patternIds`。
5. **构建与预览图**：

```bash
node scripts/build.mjs
node scripts/serve.mjs --port 4321      # 另开终端
node scripts/capture.mjs --only <id>
node scripts/build.mjs                  # 让站点数据带上新预览图
```

## 资源库

- 没有可复刻作品源码、用于制作视频的 skill 或工具，可以作为资源收录到 `entries/resources/<id>.json`。
- 有真实案例的，要用 `relatedEntries` 关联到对应案例或巧思；暂无案例时保留空数组。
- 效果图必须标明“作者产出，未复刻”，每张保留原 URL 与许可说明，不把静帧描述为动态效果。
- skill 原文快照按固定提交保存在 `agent-skills/<id>/`，保持原语言、原字节，并附许可。
- 条目填写归库理由、工作流、适用与避用、上游版本、安装方式和盘点证据。运行 `node scripts/build.mjs` 生成站点数据、`agent/resources.json` 和资源包，不手改生成物。

## 条目字段速查

| 字段 | 说明 |
| --- | --- |
| `carriers` | `video` 影像视频 / `console` 交互操作台，可多选 |
| `timeline` | Demo 是否暴露 `window.__motion` |
| `rhythm` | `{ duration, bpm?, beats: [{ t, label, note }] }` |
| `energy` | 0–1 等间隔采样的能量曲线 |
| `tokens` | `{ palette: [], type: '', motion: [{ name, value }] }` |
| `migration` | `[{ field, how }]`：改哪个配置项、怎么改 |
| `previewAt` | 截预览图的时刻（秒） |

巧思额外有 `types`、`mechanism`、`trigger`、`effect`、`timing`、`accessibility`、`composition.role / pairsWellWith / conflicts`。

## 风格约定

- 第三方库按固定版本放进案例的 `vendor/`，附许可证；地图 Demo 的 MapLibre 从固定版本 CDN 加载。
- 注释写“为什么”，不写“做了什么”。
- Prompt 写数字，不写形容词：曲线、时长、错峰、缩放幅度、像素。
- 第三方素材（画面、字体、音乐、贴图）附许可证后可以提交，出处写进案例的 `LICENSES.md`。资源库的作者效果图按“资源库”一节记录来源与许可。
