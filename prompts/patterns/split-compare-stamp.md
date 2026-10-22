# 分屏对比与时间戳盖章 · 复用 Prompt

由 [结构化条目](../../entries/patterns/split-compare-stamp.json) 自动生成。

## 实现 Prompt

旧明信片与今日实景左右对比，分割线划过后盖上时间戳。复用地图巡礼的 drawCompare、mountScene、sceneCanvas、paintScene 与对应 CSS。drawCompare 的两侧插画、分割线、边框与时间戳印章。片段：caseT 29→33.4；时长 4.8s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **分屏**：0s
- **盖章**：1.65s
- **时长**：4.8s
- **声音 voice**：whoosh、stamp、sub

## 动效 Token

- **分屏**：0s
- **盖章**：1.65s
- **时长**：4.8s

## 迁移

- `复制的函数`：drawCompare、mountScene、sceneCanvas、paintScene
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。
- `需要的数据`：config.js 的 tracks.compare 与横竖 layout；scenes.js 的 postcard / photo 两侧画布。
- `config.js → segments / markers`：caseT 29→33.4
- `score.json`：事件 voice：whoosh、stamp、sub；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/split-compare-stamp/index.html) · [在库中查看](../../patterns.html#pattern/split-compare-stamp)
