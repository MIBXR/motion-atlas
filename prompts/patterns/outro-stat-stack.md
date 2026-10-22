# 结尾数据堆叠与计数 · 复用 Prompt

由 [结构化条目](../../entries/patterns/outro-stat-stack.json) 自动生成。

## 实现 Prompt

收尾时统计数字逐行堆叠，最后以 fin. 收束。复用地图巡礼的 drawOutro、blurIn 与对应 CSS。drawOutro 的统计行、数值计数与 fin.。片段：caseT 55.6→60；时长 5.2s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **统计**：0.65s
- **fin.**：2.4s
- **时长**：5.2s
- **声音 voice**：blip、tick、bell、shimmer、sub

## 动效 Token

- **统计**：0.65s
- **fin.**：2.4s
- **时长**：5.2s

## 迁移

- `复制的函数`：drawOutro、blurIn
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。
- `需要的数据`：config.js 的 tracks.outro 与横竖 layout；58s 底图包含已完成路线和标记圆点。
- `config.js → segments / markers`：caseT 55.6→60
- `score.json`：事件 voice：blip、tick、bell、shimmer、sub；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/outro-stat-stack/index.html) · [在库中查看](../../patterns.html#pattern/outro-stat-stack)
