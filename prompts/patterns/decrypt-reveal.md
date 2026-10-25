# 对角解密与磨砂转清

## 实现 Prompt

实现“解密揭示”：左侧玻璃卡（圆角 16px、半透明暖白、内含 SVG 结构图），其上覆盖 backdrop-filter: blur(9px) 的磨砂层；两条信号色对角线（SVG，non-scaling-stroke）用 stroke-dasharray 142 在 450ms 内合拢，停留约 1.1s 后 350ms 收束；磨砂层用 clip-path: inset(p% 0 0 0) 在 1.3s 内自上而下切掉，并有一条渐变高光沿切口移动；右侧文档每个文本块（标题、分类、四项元数据、摘要）内置一条黑色遮挡条，transform-origin 右侧、scaleX 1→0，每条 420ms、按阅读顺序错峰 80ms。正文始终在 DOM 中可读；减少动态时直接显示完成态。

## 参数

- **对角线**：合拢 450ms inOutCubic，约 1.1s 后收束 350ms
- **转清**：1.3s inOutCubic，自上而下
- **遮挡条**：每条 420ms，错峰 80ms，从标题到摘要

[打开 Demo](../../demos/patterns/decrypt-reveal/index.html) · [在库中查看](../../patterns.html#pattern/decrypt-reveal)
