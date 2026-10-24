# 四角信息 HUD · 复用 Prompt

由 [结构化条目](../../entries/patterns/corner-hud.json) 自动生成。

## 实现 Prompt

日序、坐标、时钟、歌词与步进器钉在四角，数值随镜头与时间持续更新，中央留给地图。复用地图巡礼的 drawHud、cameraAt、clockAt、stepAtX、ruleX 与对应 CSS。仅 drawHud 的日序、日期、规尺、指南针、坐标、海拔、缩放、时钟、歌词、步进器、比例尺和署名。片段：caseT 7→13.6；caseT 35.8→42.4；时长 13.8s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **顶部 HUD 入场**：0s
- **跨天**：6.6s
- **时长**：13.8s
- **声音 voice**：click、kick、sub

## 动效 Token

- **顶部 HUD 入场**：0s
- **跨天**：6.6s
- **时长**：13.8s

## 迁移

- `复制的函数`：drawHud、cameraAt、clockAt、stepAtX、ruleX
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。
- `需要的数据`：config.js 的 tracks.camera / clock / day / progress / lyrics、stepper 与横竖 layout。
- `config.js → segments / markers`：caseT 7→13.6；caseT 35.8→42.4
- `score.json`：事件 voice：click、kick、sub；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/corner-hud/index.html) · [在库中查看](../../patterns.html#pattern/corner-hud)
