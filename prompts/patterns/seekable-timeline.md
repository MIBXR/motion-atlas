# 可逐帧定位的时间轴

## 实现 Prompt

所有画面都是时间 t 的函数，拖动、倒退、跳转都能得到同一帧。复用地图巡礼的 render、drawHud、drawCards、drawLeader、cameraAt、clockAt、controls 与对应 CSS。顶部 HUD（日序、日期、进度线、指南针、坐标、海拔、缩放与时钟）、kix 卡片与引线、MIKAN 徽章、控制条上方右对齐的署名，以及舞台内随 caseT 更新的复制控制条。片段：caseT 12→14；caseT 14→12.6；caseT 12.6→13.4；caseT 13.4→15.5；caseT 15.5→16.6；caseT 16.6→13；caseT 13→14.4；时长 7s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **时长**：7s
- **声音 voice**：shutter、paper、confirm、stamp、sparkle、tick

## 动效 Token

- **播放**：0s
- **倒拖**：2s
- **前跳**：3.4s
- **再倒拖**：5s
- **时长**：7s

## 迁移

- `动效函数`：配置HUD、卡片、引线、镜头、时钟与控制条。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：设置顶部HUD、kix卡片与MIKAN；13s底图配七段拖动。
- `config.js → segments / markers`：12→14/14→12.6/12.6→13.4/13.4→15.5/15.5→16.6/16.6→13/13→14.4
- `score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/seekable-timeline/index.html) · [在库中查看](../../patterns.html#pattern/seekable-timeline)
