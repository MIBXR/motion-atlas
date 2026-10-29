# 卡片展开为全屏

## 实现 Prompt

照片卡片由引线牵出，展开到全屏停留，再收回原位。复用地图巡礼的 drawCards、drawLeader、drawMarkers、measureMarkerLabels、mountScene、sceneCanvas、paintScene 与对应 CSS。inari 标记、引线、照片卡片、全屏展开与收回。片段：caseT 18.4→24.6；时长 6.6s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **时长**：6.6s
- **声音 voice**：shutter、paper、whoosh、impact

## 动效 Token

- **出卡**：0s
- **展开**：2.6s
- **收回**：5.4s
- **时长**：6.6s

## 迁移

- `动效函数`：配置卡片、引线、场景绘制与镜头。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：设置20.4s底图锚点、鸟居照片、卡片与展开轨道、横竖布局。
- `mechanism/config.js → segments / markers`：18.4→24.6
- `mechanism/score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/card-expand-fullscreen/index.html) · [在库中查看](../../patterns.html#pattern/card-expand-fullscreen)
