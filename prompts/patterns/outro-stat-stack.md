# 结尾数据堆叠与计数

## 实现 Prompt

收尾时统计数字逐行堆叠，最后以 fin. 收束。复用地图巡礼的 drawOutro、blurIn 与对应 CSS。drawOutro 的统计行、数值计数与 fin.。片段：caseT 55.6→60；时长 5.2s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **时长**：5.2s
- **声音 voice**：blip、tick、bell、shimmer、sub

## 动效 Token

- **统计**：0.65s
- **fin.**：2.4s
- **时长**：5.2s

## 迁移

- `动效函数`：配置统计行、数值计数与fin.入场。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：设置收尾与横竖布局；58s底图显示完成路线和标记。
- `mechanism/config.js → segments / markers`：55.6→60
- `mechanism/score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/outro-stat-stack/index.html) · [在库中查看](../../patterns.html#pattern/outro-stat-stack)
