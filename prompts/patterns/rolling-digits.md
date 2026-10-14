# 滚动数字与文字 · 复用 Prompt

由 [结构化条目](../../entries/patterns/rolling-digits.json) 自动生成。

## 实现 Prompt

实现方向感滚动数字与文字：每个数字位是 height:1em 的 overflow:hidden 窗口，内部上下排列旧字符与新字符，按进度 p（460ms outCubic）平移一格，只有变化的位滚动，并加 sin(pπ)×0.35px 的运动模糊；文字整行替换，旧行沿方向滚出淡出、新行反方向滚入。方向由输入决定（下一项向上、上一项向下）。快速连按时从上一个目标重新起滚，不排队播放中间值。减少动态时直接替换。

## 参数

- **时长**：460ms outCubic
- **运动模糊**：sin(pπ)×0.35px
- **方向**：下一项向上滚，上一项向下滚

[打开 Demo](../../demos/patterns/rolling-digits/index.html) · [在库中查看](../../patterns.html#pattern/rolling-digits)
