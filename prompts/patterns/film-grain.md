# 可复现的胶片颗粒与暗角 · 复用 Prompt

由 [结构化条目](../../entries/patterns/film-grain.json) 自动生成。

## 实现 Prompt

叠加可复现的胶片颗粒：预生成 6 帧 320×180 灰度噪声（固定种子），放在全屏 canvas 上（image-rendering: pixelated，mix-blend-mode: overlay，pointer-events: none），每帧显示 frames[floor(t×12) % 6]，透明度常态 0.07–0.12、回忆段 0.2；加 0.3–0.45 的径向暗角、可选 1px/3px 扫描线；亮度闪烁 ±4% 用 rng(帧号) 计算而不是 Math.random()。提供强度/fps/暗角/扫描线/闪烁五个滑杆。

## 参数

- **强度**：常态 0.07–0.12，回忆 0.15–0.25（overlay）
- **换帧**：12fps，6 帧循环
- **暗角**：0.3–0.45
- **闪烁**：±4% 亮度

[打开 Demo](../../demos/patterns/film-grain/index.html) · [在库中查看](../../patterns.html#pattern/film-grain)
