# 四角信息 HUD

## 实现 Prompt

日序、坐标、时钟、歌词与步进器钉在四角，数值随镜头与时间持续更新，中央留给地图。复用地图巡礼的 drawHud、cameraAt、clockAt、stepAtX、ruleX 与对应 CSS。仅 drawHud 的日序、日期、规尺、指南针、坐标、海拔、缩放、时钟、歌词、步进器、比例尺和署名。片段：caseT 7→13.6；caseT 35.8→42.4；时长 13.8s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **时长**：13.8s
- **声音 voice**：click、kick、sub

## 动效 Token

- **顶部 HUD 入场**：0s
- **跨天**：6.6s
- **时长**：13.8s

## 迁移

- `动效函数`：配置镜头、时钟、步进器与规尺函数。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：设置日序、日期、进度、歌词、步进器与横竖布局。
- `mechanism/config.js → segments / markers`：7→13.6/35.8→42.4
- `mechanism/score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/corner-hud/index.html) · [在库中查看](../../patterns.html#pattern/corner-hud)
