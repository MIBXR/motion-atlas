# 警示横幅与改道

## 实现 Prompt

坐错车时红色警示横幅压下，错误路线打叉，改道路线重新描画。复用地图巡礼的 drawAlert、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、cameraAt、project 与对应 CSS。警示横幅、改道胶囊、错误路线与 X、改道路线、该时段标记标签，以及已完成的持续路线。片段：caseT 44.8→50.3；时长 6.2s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定镜头的实时地图，声音由 score.json 挂接。

## 参数

- **时长**：6.2s
- **声音 voice**：blip、whoosh、error、glitch、clack、alarm、beep、stamp

## 动效 Token

- **警示**：0.2s
- **错误终点**：1.5s
- **改道**：2.2s
- **时长**：6.2s

## 迁移

- `动效函数`：配置警示、改道提示、路线与标签。
- `依赖`：配置MapLibre 5.6.0、样式、图层与地图镜像。
- `需要的数据`：设置警示轨道、错误路线、地图与横竖布局。
- `config.js → segments / markers`：44.8→50.3
- `score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/alert-reroute/index.html) · [在库中查看](../../patterns.html#pattern/alert-reroute)
