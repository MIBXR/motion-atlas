# 三段式下三分之一 · 复用 Prompt

由 [结构化条目](../../entries/patterns/lower-third.json) 自动生成。

## 实现 Prompt

实现三段式下三分之一：左侧 14px 强调色竖条 scaleY 0→1（200ms，transform-origin 底部）；右侧深色底板 clip-path: polygon(0 0, P% 0, calc(P% − 28px) 100%, 0 100%)，P 在 350ms 内以 cubic-bezier(.2,.9,.1,1) 从 0 到 100（延迟 150ms）；标签（12px 等宽强调色）、姓名（超粗斜体）、职位（宽字距）三行 80ms 错峰上浮 14px；右上角一个品红“LIVE”胶囊回弹出现。离场倒序：文字 140ms → 底板 220ms → 色条 180ms。入场与离场时刻用 BPM 拍号计算。

## 参数

- **色条**：200ms outCubic
- **底板**：350ms snap，延迟 150ms
- **文字**：300ms outCubic，错峰 80ms
- **离场**：约入场的 60%，倒序

[打开 Demo](../../demos/patterns/lower-third/index.html) · [在库中查看](../../patterns.html#pattern/lower-third)
