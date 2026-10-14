# 逐词重拍 · 复用 Prompt

由 [结构化条目](../../entries/patterns/word-slam.json) 自动生成。

## 实现 Prompt

实现逐词重拍：词表 [{b: 拍号, w: 词}]，当前词 = b ≤ 当前拍的最后一个；出现瞬间以 120ms outExpo 从 scale 1.5、rotate −3° 落定到 1、0°；进入该词 0.5 拍后加一个 −2% 的上弹并以 e^(−10Δ) 回落；每小节首拍在两组 [底色, 字色] 间切换；完全不使用淡入淡出（硬切）。底部 4 格拍点指示当前拍。

## 参数

- **落定**：120ms outExpo，1.5→1
- **反拍**：+0.5 拍上弹 2%
- **换色**：每小节首拍

[打开 Demo](../../demos/patterns/word-slam/index.html) · [在库中查看](../../patterns.html#pattern/word-slam)
