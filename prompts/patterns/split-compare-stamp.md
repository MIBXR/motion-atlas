# 分屏对比与时间戳盖章 · 复用 Prompt

由 [结构化条目](../../entries/patterns/split-compare-stamp.json) 自动生成。

## 实现 Prompt

实现分屏对比：两张构图对齐的图片叠放，上层（过去）用 clip-path: inset(0 X% 0 0) 控制可见宽度；分割线 3px 白色带阴影与圆形把手，700ms outQuart 从左边滑到 50%；左右各有 12px 等宽深色标签（如 POSTCARD · 1930s / REAL · 2026）在各自画面出现后淡入；380ms 后一枚 3px 白色描边、等宽粗体的时间戳以 outBack 从 1.45 缩到 1 并旋转 -4° 盖下。动画结束后分割线可拖动、可用方向键调整（role=slider）。

## 参数

- **分割线**：700ms outQuart，停在 50%
- **盖章**：380ms outBack，1.45→1，-4°
- **标签**：各自 300ms 淡入

[打开 Demo](../../demos/patterns/split-compare-stamp/index.html) · [在库中查看](../../patterns.html#pattern/split-compare-stamp)
