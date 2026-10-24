# 章节主题：标签、强调色与四角框线 · 复用 Prompt

由 [结构化条目](../../entries/patterns/chapter-frame.json) 自动生成。

## 实现 Prompt

章节标签配框线或胶带网点入场，为一段旅程划出章节。复用地图巡礼的 drawChapter、applyStaticLayout 与对应 CSS。drawChapter 的章节标签、框线、四角方块、胶带与网点。片段：caseT 24.2→25.85；caseT 33→33.8；caseT 40.6→44.8；时长 7.05s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **鸭川框线入场**：0s
- **框线退场**：1.65s
- **奈良胶带与网点**：2.45s
- **时长**：7.05s
- **声音 voice**：bell、confirm

## 动效 Token

- **鸭川框线入场**：0s
- **框线退场**：1.65s
- **奈良胶带与网点**：2.45s
- **时长**：7.05s

## 迁移

- `复制的函数`：drawChapter、applyStaticLayout
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。
- `需要的数据`：config.js 的 chapters、tracks.chapter、横竖 layout；案例框线 SVG、胶带 CSS 和半色调画布。
- `config.js → segments / markers`：caseT 24.2→25.85；caseT 33→33.8；caseT 40.6→44.8
- `score.json`：事件 voice：bell、confirm；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/chapter-frame/index.html) · [在库中查看](../../patterns.html#pattern/chapter-frame)
