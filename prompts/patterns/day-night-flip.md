# 昼夜翻转：逐层插值 · 复用 Prompt

由 [结构化条目](../../entries/patterns/day-night-flip.json) 自动生成。

## 实现 Prompt

实现昼夜翻转：为每类图层定义 [白天, 夜晚] 两个颜色（背景/陆地、水、绿地、建筑、道路、道路描边、路线、文字），用 night∈[0,1] 统一插值，0.9–1.2s inOutCubic，过渡中途画面经过灰阶。若是 MapLibre，加载后遍历 style.layers 按 id 关键词归类（water/park/building/highway/casing/railway/boundary），每帧仅在值变化时 setPaintProperty。HUD 的纸色与墨色同步插值。不要用 CSS invert 做整张夜景（会让水比陆地亮）。

## 参数

- **时长**：0.9–1.2s inOutCubic
- **中点**：画面经过灰阶，像“天色渐变”
- **配色**：陆地 #eeebe4→#1b2431，水 #bccdd9→#0d131c，道路 #fff→#2c3648

[打开 Demo](../../demos/patterns/day-night-flip/index.html) · [在库中查看](../../patterns.html#pattern/day-night-flip)
