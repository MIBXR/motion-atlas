# 翻牌与流光 · 复用 Prompt

由 [结构化条目](../../entries/patterns/card-flip-sheen.json) 自动生成。

## 实现 Prompt

实现翻牌与流光：卡片 button 设 transform-style: preserve-3d，内含背面（斜纹 + 稀有度描边发光）与正面（渐变 + 图形 + 名称，预先 rotateY(180deg)），两面 backface-visibility: hidden。第 i 张在 start + i×0.25s（稀有卡再加 0.6s）开始，rotateY = clamp(outBack(p), 0, 1.08)×180°（450ms）；翻开后 300ms 一条 105° 白色流光 600ms 从左扫到右；稀有卡外发光脉冲并 scale 1.08 回落。点击单张卡可重翻。

## 参数

- **翻转**：450ms outBack
- **流光**：600ms，延迟 300ms
- **错峰**：120–250ms
- **稀有停顿**：0.6–0.7s

[打开 Demo](../../demos/patterns/card-flip-sheen/index.html) · [在库中查看](../../patterns.html#pattern/card-flip-sheen)
