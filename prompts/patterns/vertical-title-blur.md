# 竖排汉字模糊入场 + 英文打字

## 实现 Prompt

竖排大字从模糊中显影，配副标题与逐字打字；片名、地点、回忆字幕与收尾共用一套入场。复用地图巡礼的 drawIntro、drawLocTitle、drawFlashback、drawOutro、blurIn、typeIn、mountScene、paintScene 与对应 CSS。片名、地点标题、全屏回忆插画与竖排字幕，以及 drawOutro 的 fin.。片段：caseT 3.8→8；caseT 17.9→21.6；caseT 25.5→29.6；caseT 57.9→60；时长 14.1s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **时长**：14.1s
- **声音 voice**：key、tick、bell、shimmer、sub

## 动效 Token

- **片名**：0s
- **地点标题**：4.2s
- **回忆竖排字幕**：7.9s
- **fin.**：12s
- **时长**：14.1s

## 迁移

- `动效函数`：配置片名、地名、回忆、收尾的模糊与打字入场。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：设置片名、地点、回忆字幕、收尾与横竖布局。
- `config.js → segments / markers`：3.8→8/17.9→21.6/25.5→29.6/57.9→60
- `score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/vertical-title-blur/index.html) · [在库中查看](../../patterns.html#pattern/vertical-title-blur)
