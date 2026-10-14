# 色带转场 Stinger · 复用 Prompt

由 [结构化条目](../../entries/patterns/stinger-bars.json) 自动生成。

## 实现 Prompt

实现色带 stinger：全屏 overflow:hidden 容器内放 5 条 width 34%、top/bottom −20%、transform: skewX(−18deg) 的色带（品牌色依次排列，最后一条深色），每条 left 在 2 拍内以 inOutCubic 从 −60% 走到 160%，错峰 70ms；在转场 50% 时刻切换底下的场景；标志在 35% 处 outBack 弹出、62% 处缩回。时长按 BPM 计算。

## 参数

- **长度**：2 拍（120 BPM = 1s）
- **错峰**：70ms/条
- **切换点**：转场 50%
- **标志**：35%–62% 区间，outBack 弹出

[打开 Demo](../../demos/patterns/stinger-bars/index.html) · [在库中查看](../../patterns.html#pattern/stinger-bars)
