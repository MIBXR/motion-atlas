# 昼夜翻转：逐层插值 · 复用 Prompt

由 [结构化条目](../../entries/patterns/day-night-flip.json) 自动生成。

## 实现 Prompt

地图配色与 HUD 强调色一起在昼夜之间过渡，交代时间的流逝。复用地图巡礼的 dayNight、valueAt、cameraAt、drawHud、clockAt、classify、setPaint 与对应 CSS。地图、3D 建筑、HUD 与案例暖色 wash；镜头固定为案例 34.5s，HUD 与昼夜值按 caseT 31.3→35.8、36.6→39.1 求值。片段：caseT 31.3→35.8；caseT 36.6→39.1；固定镜头 caseT 34.5，全部 HUD 按片段求值；时长 7s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定镜头的实时地图，声音由 score.json 挂接。

## 参数

- **白天**：0s
- **入夜**：1.5s
- **天亮**：4.5s
- **时长**：7s
- **声音 voice**：whoosh、sub、reverse、chime

## 动效 Token

- **白天**：0s
- **入夜**：1.5s
- **天亮**：4.5s
- **时长**：7s

## 迁移

- `复制的函数`：dayNight、valueAt、cameraAt、drawHud、clockAt、classify、setPaint
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。实时地图使用案例 MapLibre 5.6.0、样式 URL、自定义图层与 tilemirror / demmirror 参数。
- `需要的数据`：config.js 的 map / mapPalette、tracks.night / camera / clock、HUD 轨道与横竖 layout；固定镜头为案例 34.5s。
- `config.js → segments / markers`：caseT 31.3→35.8；caseT 36.6→39.1；固定镜头 caseT 34.5，全部 HUD 按片段求值
- `score.json`：事件 voice：whoosh、sub、reverse、chime；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/day-night-flip/index.html) · [在库中查看](../../patterns.html#pattern/day-night-flip)
