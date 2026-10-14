# 长按确认 · 复用 Prompt

由 [结构化条目](../../entries/patterns/hold-confirm.json) 自动生成。

## 实现 Prompt

实现长按确认按钮：切角深色按钮，右侧黄黑危险斜纹；按下（pointerdown 或聚焦后空格/回车，忽略 repeat）记录开始时刻，松开记录结束；进度 = clamp((min(end, t) − start)/1.2s)，松开过早时以 300ms outCubic 回落到 0；当 (end ?? t) − start ≥ 1.2s − 1e-6 时在 start+1.2s 锁定完成：标签变为 DEPLOYED，盖下倾斜 −8° 的绿色描边印章（350ms outBack 1.5→1）。上方配一个同步的圆环进度。按钮 aria-describedby 指向“需按住 1.2 秒”的说明。

## 参数

- **时长**：1.2s 线性
- **回落**：300ms outCubic
- **完成印章**：350ms outBack，1.5→1，−8°

[打开 Demo](../../demos/patterns/hold-confirm/index.html) · [在库中查看](../../patterns.html#pattern/hold-confirm)
