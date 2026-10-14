# 路线描画与标记脉冲 · 复用 Prompt

由 [结构化条目](../../entries/patterns/route-draw-marker.json) 自动生成。

## 实现 Prompt

在【地图/示意图】上实现路线描画：路线点集按累计弧长截断到进度 p（inOutQuad），航线用二次贝塞尔弧（控制点沿垂线偏移 bend×距离）+ 9/7 虚线，地面路线先画 9px 白色描边再画 4px 强调色；描画期间在截断点显示白底黑边头部圆点。标记：16px 白底黑边圆点内嵌强调色，450ms outBack 从 0.6 缩放回弹出现；右侧等宽标签 550ms 打字，汉字随后淡入；两个 1.5px 脉冲环每 2 秒放大到 2.6 倍并淡出，相位相差半周期。接真实地图时把路线放进 MapLibre GeoJSON line 图层。

## 参数

- **描画**：按段时长 inOutQuad；航线约 3s、地面 2.5–3.5s
- **标记回弹**：450ms outBack，缩放 0.6→1
- **脉冲**：周期 2s，两环相位差 0.5，最大 2.6×
- **标签**：打字 550ms，汉字 +600ms 淡入

[打开 Demo](../../demos/patterns/route-draw-marker/index.html) · [在库中查看](../../patterns.html#pattern/route-draw-marker)
