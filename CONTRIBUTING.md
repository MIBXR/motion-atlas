# 贡献指南

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
