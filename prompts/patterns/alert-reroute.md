# 警示横幅与改道 · 复用 Prompt

由 [结构化条目](../../entries/patterns/alert-reroute.json) 自动生成。

## 实现 Prompt

坐错车时红色警示横幅压下，错误路线打叉，改道路线重新描画。复用地图巡礼的 drawAlert、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、cameraAt、project 与对应 CSS。警示横幅、改道胶囊、错误路线与 X、改道路线、该时段标记标签，以及已完成的持续路线。片段：caseT 44.8→50.3；时长 6.2s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定镜头的实时地图，声音由 score.json 挂接。

## 参数

- **警示**：0.2s
- **错误终点**：1.5s
- **改道**：2.2s
- **时长**：6.2s
- **声音 voice**：blip、whoosh、error、glitch、clack、alarm、beep、stamp

## 动效 Token

- **警示**：0.2s
- **错误终点**：1.5s
- **改道**：2.2s
- **时长**：6.2s

## 迁移

- `复制的函数`：drawAlert、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、cameraAt、project
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。实时地图使用案例 MapLibre 5.6.0、样式 URL、自定义图层与 tilemirror / demmirror 参数。
- `需要的数据`：config.js 的 tracks.alert / routes / markers、stops 与 tracks.camera；paths.js 的 wrong / reroute 与已完成路线几何；横竖安全框判断后的固定镜头。
- `config.js → segments / markers`：caseT 44.8→50.3
- `score.json`：事件 voice：blip、whoosh、error、glitch、clack、alarm、beep、stamp；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/alert-reroute/index.html) · [在库中查看](../../patterns.html#pattern/alert-reroute)
