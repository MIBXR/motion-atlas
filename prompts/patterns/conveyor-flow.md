# 产线流动 · 复用 Prompt

由 [结构化条目](../../entries/patterns/conveyor-flow.json) 自动生成。

## 实现 Prompt

实现产线流动：在 SVG 中为每条连接生成正交折线路径（M x1 y1 H mx−r Q … V … Q … H x2），先画 14px 灰色底，再画 2px 黑色 6/10 虚线带纹；每帧带纹 strokeDashoffset = −t×v；每条带放 n 个旋转 45° 的小方块，位置 = path.getPointAtLength(L×(((t×v/L + i/n) % 1 + 1) % 1))。节点为切角白盒 + 编码 + 计数 + 闪烁绿灯。提供速度与物料数滑杆；SVG 文字按缩放换算保证 ≥12px。

## 参数

- **速度**：90px/s（加速 150px/s）
- **密度**：每条带 4–5 个物料
- **圆角**：14–16px

[打开 Demo](../../demos/patterns/conveyor-flow/index.html) · [在库中查看](../../patterns.html#pattern/conveyor-flow)
