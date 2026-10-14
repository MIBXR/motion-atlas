# 异形遮罩转场 · 复用 Prompt

由 [结构化条目](../../entries/patterns/shape-wipe.json) 自动生成。

## 实现 Prompt

实现异形遮罩转场：全屏 SVG（viewBox="-50 -50 100 100"，preserveAspectRatio="xMidYMid slice"，pointer-events none）内放一个黑色路径（16 角星：外径 50、内径 21）。tIn 开始 380ms inQuad 把 scale 0→3.2，同时 rotate 90°/s；在完全覆盖时切换底下的场景；随后 300ms outCubic 把 scale 3.2→0 释放。提供锯齿、斜切、圆三种可替换形状。减少动态时不旋转。

## 参数

- **吞没**：380ms inQuad
- **释放**：300–320ms outCubic
- **旋转**：90°/s
- **覆盖倍数**：约 3.2（随形状尖角深度调整）

[打开 Demo](../../demos/patterns/shape-wipe/index.html) · [在库中查看](../../patterns.html#pattern/shape-wipe)
