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

## 新增一个案例

1. **条目结构**：按[条目结构](docs/methodology.md)整理节拍、分层、参数、Prompt和Demo。
2. **Demo**：在 `demos/cases/<id>/` 建 `index.html`、`style.css`、`script.js`、`config.js`。
   - 内容（文案、配色、时刻表）全部放进 `config.js`。
   - 画面写成 `render(t)`，用 `MotionKit.timeline` 包装并 `MotionKit.expose()`；`<script src="motion-kit.js">` 引用同目录副本，条目里设 `"kit": true`，构建会自动同步。
   - 遵守 `?embed`、`?render`、`?t=` 参数；画面文字按设计需要决定字号；图标用 SVG；支持减少动态；声音默认关闭。
3. **条目**：写 `entries/cases/<id>.json`。必填：`id`、`title`、`carriers`、`summary`、`prompt`、`demo`、`composition`。建议填写：`rhythm.beats`、`energy`、`layers`、`tokens`、`interaction`、`videoPrompt`、`negativePrompt`、`migration`、`patternIds`、`previewAt`。
4. **巧思**：把案例里每个“触发 → 结果”的技巧写成 `entries/patterns/<pid>.json` 与 `demos/patterns/<pid>/index.html`（顶部 `CONFIG` 块），在巧思的`sources`里只写`{ caseId }`，并把 `<pid>` 加进案例的 `patternIds`。
5. **构建与预览图**：

```bash
node scripts/build.mjs
node scripts/serve.mjs --port 4321      # 另开终端
node scripts/capture.mjs --only <id>
node scripts/build.mjs                  # 让站点数据带上新预览图
```

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

- 代码零依赖（地图 Demo 例外：MapLibre 从固定版本 CDN 加载）。
- 注释写“为什么”，不写“做了什么”。
- Prompt 写数字，不写形容词：曲线、时长、错峰、缩放幅度、像素。
- 不提交第三方素材；游戏专有名词替换为原创名称。
