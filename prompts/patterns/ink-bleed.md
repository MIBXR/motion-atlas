# 墨晕显影 · 复用 Prompt

由 [结构化条目](../../entries/patterns/ink-bleed.json) 自动生成。

## 实现 Prompt

实现墨晕显影：SVG 中定义 mask（userSpaceOnUse），里面是一个填充径向渐变的全幅矩形，渐变两个色标的 offset 随时间从 0 外推到 1.25（outCubic，约 2s），矩形应用 filter：feTurbulence(fractalNoise, baseFrequency .018, 3 octaves) → feDisplacementMap(scale 由 90 降到 18) → feGaussianBlur(stdDeviation 由 4 降到 0)。被遮罩内容是墨色竖向渐变的山形 + 山脊描边。提供扩散时长与扰动强度滑杆；减少动态时直接显示。

## 参数

- **扩散**：1.6–2.2s outCubic
- **位移**：90 → 18（或 0）
- **模糊**：4–6 → 0

[打开 Demo](../../demos/patterns/ink-bleed/index.html) · [在库中查看](../../patterns.html#pattern/ink-bleed)
