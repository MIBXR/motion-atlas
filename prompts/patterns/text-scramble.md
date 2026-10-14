# 字符解码 · 复用 Prompt

由 [结构化条目](../../entries/patterns/text-scramble.json) 自动生成。

## 实现 Prompt

实现字符解码：输入 text、进度 p、帧号 tick=floor(t×24)。为每个字符预先生成解出阈值 (i/n)×0.7 + rng(seed)×0.3；p ≥ 阈值显示原字符，否则显示字符集（A–Z、0–9、#/%+=<>；中文用同主题汉字集）中由 rng(seed×131 + i×17 + tick×7919) 选出的随机字符，并以强调色显示；未完成时末尾显示黄色块状光标。原文写入 aria-label。所有随机都由种子与帧号决定，可逐帧复现。

## 参数

- **刷新率**：24fps
- **时长**：0.6–1.2s（随长度）
- **阈值分布**：位置 70% + 随机 30%

[打开 Demo](../../demos/patterns/text-scramble/index.html) · [在库中查看](../../patterns.html#pattern/text-scramble)
