# 路线描画与标记脉冲 · 复用 Prompt

由 [结构化条目](../../entries/patterns/route-draw-marker.json) 自动生成。

## 实现 Prompt

路线按进度描画，车头沿线前进，站点标记弹入并打出双语站名。复用地图巡礼的 cameraAt、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、project、routeP、pointAt 与对应 CSS。三个固定镜头中的路线、车头、标记圆点与双语标签；jrNara minZoom=13；镜头间使用案例纸色转场。片段：kix: caseT 1.5→2.35；haruka: caseT 14.6→17.05；kyoto: caseT 16.6→17.45；naraLine: caseT 37.4→39.85；jrNara: caseT 39.4→40.25；walk1: caseT 39.4→41.25；naraPark: caseT 40.8→41.65；时长 10.6s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定镜头的实时地图，声音由 score.json 挂接。

## 参数

- **机场**：0s
- **描画**：0.6s
- **第二段**：4s
- **步行**：7.2s
- **时长**：10.6s
- **声音 voice**：sonar、whoosh、clack、blip、chime、tick

## 动效 Token

- **机场**：0s
- **描画**：0.6s
- **第二段**：4s
- **步行**：7.2s
- **时长**：10.6s

## 迁移

- `复制的函数`：cameraAt、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、project、routeP、pointAt
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。实时地图使用案例 MapLibre 5.6.0、样式 URL、自定义图层与 tilemirror / demmirror 参数。
- `需要的数据`：config.js 的 stops、tracks.routes / markers、tracks.camera；paths.js 的 haruka / naraLine / walk1 几何；横竖 S1 / S2 / S3 固定镜头。
- `config.js → segments / markers`：kix: caseT 1.5→2.35；haruka: caseT 14.6→17.05；kyoto: caseT 16.6→17.45；naraLine: caseT 37.4→39.85；jrNara: caseT 39.4→40.25；walk1: caseT 39.4→41.25；naraPark: caseT 40.8→41.65
- `score.json`：事件 voice：sonar、whoosh、clack、blip、chime、tick；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/route-draw-marker/index.html) · [在库中查看](../../patterns.html#pattern/route-draw-marker)
