# 警示横幅与改道 · 复用 Prompt

由 [结构化条目](../../entries/patterns/alert-reroute.json) 自动生成。

## 实现 Prompt

实现“警示 + 改道”：红色通栏（#e5483b，带 1px/3px 横向扫描纹理）从左 380ms clip-path 擦入，内容为 SVG 警示图标 + 粗体字距 .14em 的标题 + 12px 等宽说明（打字）；画面同时叠加 18% 红色 multiply 闪光并在 350ms 内衰减。地图上错误路线画红、末端弹出 ×；下方黑色胶囊“REROUTING”带 SVG 双左箭头，省略号每 333ms 加一点。改道路线用强调色重新描出；恢复时胶囊变绿、图标换成对勾并回弹，错误路线 600ms 降至 35% 透明度。

## 参数

- **横幅擦入**：380ms outCubic
- **红色闪光**：18% → 0，约 350ms 衰减
- **胶囊省略号**：每 333ms 增加一个点
- **错误路线淡化**：600ms 降到 35%

[打开 Demo](../../demos/patterns/alert-reroute/index.html) · [在库中查看](../../patterns.html#pattern/alert-reroute)
