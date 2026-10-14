# BPM 节拍时钟与前瞻调度 · 复用 Prompt

由 [结构化条目](../../entries/patterns/beat-clock.json) 自动生成。

## 实现 Prompt

实现 BPM 节拍时钟：spb = 60/bpm，beat = (t − offset)/spb，提供 at(beat)、beatOf(t)、pulse(t, k) = e^(−k·frac(beat))、quantize(t, div)。界面：一个随拍脉冲的圆（小节首拍变强调色）、16 步网格高亮当前步、BAR/BEAT/STEP 与 ms/拍 读数、BPM 滑杆（修改后按相对位置重算时长）。声音：生成十六分音符事件表（底鼓/军鼓/镲片字符串 “x...”），每帧把 [t, t+120ms) 的事件以 delay = 事件时刻 − t 调度给 WebAudio，拖动后重置游标，循环时提前排入下一圈。

## 参数

- **拍长**：60 / BPM 秒（110 BPM ≈ 545ms）
- **脉冲衰减**：k = 6–10
- **前瞻**：100–150ms

[打开 Demo](../../demos/patterns/beat-clock/index.html) · [在库中查看](../../patterns.html#pattern/beat-clock)
