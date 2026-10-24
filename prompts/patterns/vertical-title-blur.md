# 竖排汉字模糊入场 + 英文打字 · 复用 Prompt

由 [结构化条目](../../entries/patterns/vertical-title-blur.json) 自动生成。

## 实现 Prompt

竖排大字从模糊中显影，配副标题与逐字打字；片名、地点、回忆字幕与收尾共用一套入场。复用地图巡礼的 drawIntro、drawLocTitle、drawFlashback、drawOutro、blurIn、typeIn、mountScene、paintScene 与对应 CSS。片名、地点标题、全屏回忆插画与竖排字幕，以及 drawOutro 的 fin.。片段：caseT 3.8→8；caseT 17.9→21.6；caseT 25.5→29.6；caseT 57.9→60；时长 14.1s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **片名**：0s
- **地点标题**：4.2s
- **回忆竖排字幕**：7.9s
- **fin.**：12s
- **时长**：14.1s
- **声音 voice**：key、tick、bell、shimmer、sub

## 动效 Token

- **片名**：0s
- **地点标题**：4.2s
- **回忆竖排字幕**：7.9s
- **fin.**：12s
- **时长**：14.1s

## 迁移

- `复制的函数`：drawIntro、drawLocTitle、drawFlashback、drawOutro、blurIn、typeIn、mountScene、paintScene
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。
- `需要的数据`：config.js 的 meta、tracks.locTitle / flashback / outro、横竖 layout；scenes.js 的回忆插画。
- `config.js → segments / markers`：caseT 3.8→8；caseT 17.9→21.6；caseT 25.5→29.6；caseT 57.9→60
- `score.json`：事件 voice：key、tick、bell、shimmer、sub；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/vertical-title-blur/index.html) · [在库中查看](../../patterns.html#pattern/vertical-title-blur)
