# 蓄力—预示—爆发 · 复用 Prompt

由 [结构化条目](../../entries/patterns/charge-release.json) 自动生成。

## 实现 Prompt

实现蓄力—预示—爆发：Canvas 中 140 个固定种子粒子，按下后进度 c=inCubic((t−press)/(burst−press))，粒子角度 a0+(t−press)×w×(1+3c)、半径 r0×(1−0.92c) 螺旋内收；中心光球（发光环 + 核心）缩放 0.25+1.1c；tell 时刻把颜色变量设为最高稀有度色（若为最高级先给次一级）并 0.35 闪白，upgrade 时刻升格、光球 ±4px 抖动并再放大 0.25、0.7 闪白；burst 时刻 1.0 闪白（e^(−5t) 衰减）、椭圆冲击波、粒子 outExpo 径向飞散 1.2s。提供 ★3/★4/★5 切换。

## 参数

- **蓄力**：1.3–2.3s inCubic
- **预示→爆发**：0.8–0.9s（含 0.45s 升格）
- **闪白**：0.35 / 0.7 / 1.0 三档

[打开 Demo](../../demos/patterns/charge-release/index.html) · [在库中查看](../../patterns.html#pattern/charge-release)
