# 可逐帧定位的时间轴 · 复用 Prompt

由 [结构化条目](../../entries/patterns/seekable-timeline.json) 自动生成。

## 实现 Prompt

所有画面都是时间 t 的函数，拖动、倒退、跳转都能得到同一帧。复用地图巡礼的 render、drawHud、drawCards、drawLeader、cameraAt、clockAt、controls 与对应 CSS。HUD、kix 卡片与引线、MIKAN 徽章，以及舞台内随 caseT 更新的复制控制条。片段：caseT 12→14；caseT 14→12.6；caseT 12.6→13.4；caseT 13.4→15.5；caseT 15.5→16.6；caseT 16.6→13；caseT 13→14.4；时长 7s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **播放**：0s
- **倒拖**：2s
- **前跳**：3.4s
- **再倒拖**：5s
- **时长**：7s
- **声音 voice**：shutter、paper、confirm、stamp、sparkle、tick

## 动效 Token

- **播放**：0s
- **倒拖**：2s
- **前跳**：3.4s
- **再倒拖**：5s
- **时长**：7s

## 迁移

- `复制的函数`：render、drawHud、drawCards、drawLeader、cameraAt、clockAt、controls
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。
- `需要的数据`：config.js 的 HUD / kix 卡片 / mascot 轨道、tracks.camera 与横竖 layout；13s 底图屏幕锚点；七段拖动曲线和复制的控制条结构 / CSS。
- `config.js → segments / markers`：caseT 12→14；caseT 14→12.6；caseT 12.6→13.4；caseT 13.4→15.5；caseT 15.5→16.6；caseT 16.6→13；caseT 13→14.4
- `score.json`：事件 voice：shutter、paper、confirm、stamp、sparkle、tick；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/seekable-timeline/index.html) · [在库中查看](../../patterns.html#pattern/seekable-timeline)
