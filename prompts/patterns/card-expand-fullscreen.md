# 卡片展开为全屏 · 复用 Prompt

由 [结构化条目](../../entries/patterns/card-expand-fullscreen.json) 自动生成。

## 实现 Prompt

照片卡片由引线牵出，展开到全屏停留，再收回原位。复用地图巡礼的 drawCards、drawLeader、drawMarkers、measureMarkerLabels、mountScene、sceneCanvas、paintScene 与对应 CSS。inari 标记、引线、照片卡片、全屏展开与收回。片段：caseT 18.4→24.6；时长 6.6s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **出卡**：0s
- **展开**：2.6s
- **收回**：5.4s
- **时长**：6.6s
- **声音 voice**：shutter、paper、whoosh、impact

## 动效 Token

- **出卡**：0s
- **展开**：2.6s
- **收回**：5.4s
- **时长**：6.6s

## 迁移

- `复制的函数`：drawCards、drawLeader、drawMarkers、measureMarkerLabels、mountScene、sceneCanvas、paintScene
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。
- `需要的数据`：config.js 的 inari、tracks.cards 与 expand、横竖 layout；20.4s 底图对应的横竖屏幕锚点；scenes.js 的 torii 照片画布。
- `config.js → segments / markers`：caseT 18.4→24.6
- `score.json`：事件 voice：shutter、paper、whoosh、impact；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/card-expand-fullscreen/index.html) · [在库中查看](../../patterns.html#pattern/card-expand-fullscreen)
