# 章节主题：标签、强调色与四角框线

## 实现 Prompt

章节标签配框线或胶带网点入场，为一段旅程划出章节。复用地图巡礼的 drawChapter、applyStaticLayout 与对应 CSS。drawChapter 的章节标签、框线、四角方块、胶带与网点。片段：caseT 24.2→25.85；caseT 33→33.8；caseT 40.6→44.8；时长 7.05s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **时长**：7.05s
- **声音 voice**：bell、confirm

## 动效 Token

- **鸭川框线入场**：0s
- **框线退场**：1.65s
- **奈良胶带与网点**：2.45s
- **时长**：7.05s

## 迁移

- `动效函数`：配置章节标签、标题、框线与胶带。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：设置章节轨道、标题、配色、装饰与横竖布局。
- `config.js → segments / markers`：24.2→25.85/33→33.8/40.6→44.8
- `score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/chapter-frame/index.html) · [在库中查看](../../patterns.html#pattern/chapter-frame)
