# 剪报拼贴字 · 复用 Prompt

由 [结构化条目](../../entries/patterns/ransom-type.json) 自动生成。

## 实现 Prompt

实现剪报拼贴字组件 ransom(el, text, seed)：用固定种子随机数为每个字符生成 span，独立设置配色组合（[黑,白]、[白,黑]、[红,白]、[白,红]、[黑,红]、[米,黑]）、字体（Arial Black / Georgia / Courier New / Impact / Bahnschrift / 中文黑体 / 宋体）、字重 600/900、旋转 ±9°、缩放 0.86–1.24、上下偏移 ±0.08em，内边距 .05em .12em；空格为 .35em 空白。入场时每个字母 220ms outBack 从 2.2 倍缩回、角度从 2 倍回到目标，错峰 35ms。整句写进容器 aria-label，字母 aria-hidden。

## 参数

- **入场**：每字 220ms outBack，2.2→1
- **错峰**：30–35ms
- **旋转**：±9°
- **缩放**：0.86–1.24

[打开 Demo](../../demos/patterns/ransom-type/index.html) · [在库中查看](../../patterns.html#pattern/ransom-type)
