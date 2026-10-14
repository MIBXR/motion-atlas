# 扫描线换页 · 复用 Prompt

由 [结构化条目](../../entries/patterns/scanline-wipe.json) 自动生成。

## 实现 Prompt

实现扫描线换页：内容容器内叠放各页；切换时 x 以 500ms inOutQuart 从 0→1，新页 clip-path: inset(0 calc((1−x)×100%) 0 0)、旧页 clip-path: inset(0 0 0 calc(x×100%))，其余页隐藏；一条 3px 黄色竖线位于 left: x×100%，带 0 0 26px 7px 的黄色外发光，左侧跟随 18% 宽的淡黄拖影；新页卡片在扫描过半后以 cubic-bezier(.2,.9,.1,1) 320ms 错峰 60ms 上浮 18px→0。

## 参数

- **扫描**：500ms inOutQuart
- **卡片**：扫描过半后 320ms snap，错峰 60ms

[打开 Demo](../../demos/patterns/scanline-wipe/index.html) · [在库中查看](../../patterns.html#pattern/scanline-wipe)
