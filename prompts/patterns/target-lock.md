# 阶梯式目标锁定 · 复用 Prompt

由 [结构化条目](../../entries/patterns/target-lock.json) 自动生成。

## 实现 Prompt

实现阶梯式锁定框：四个 18px L 形角（3px 描边）组成的方框，以目标为中心；尺寸按 [240,180,120,80,48] 分档收紧，档位 i = clamp(floor((t−t0)/0.15), 0, 3)，档内 80ms cubic-bezier(.2,.9,.1,1)；同时 rotate 从 45° 线性回到 0°；右上标签在确认前显示 ACQ ■■□□（每 0.35s 多一格），1.4s 后显示 LOCK + 目标编号。点击目标重新锁定。

## 参数

- **档位**：240 → 180 → 120 → 80 → 48 px
- **每档**：snap 80ms，间隔 150ms
- **确认**：1.4–1.6s

[打开 Demo](../../demos/patterns/target-lock/index.html) · [在库中查看](../../patterns.html#pattern/target-lock)
