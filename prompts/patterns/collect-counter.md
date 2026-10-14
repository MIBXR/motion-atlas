# 收集计数徽章与图鉴托盘 · 复用 Prompt

由 [结构化条目](../../entries/patterns/collect-counter.json) 自动生成。

## 实现 Prompt

实现收集计数徽章：右上角白色胶囊（头像 + 12px 等宽标签 + 粗体 ×N），计数由事件时刻列表推导；最近一次事件后经过 k 秒时，数字在 300ms 内从下方滚入、徽章 scale(1 + 0.14·e^(-7k))、头像外圈 2px 强调色环放大并淡出。下方图鉴托盘 N 个 3:4 槽位，空位为虚线 + 问号，事件发生时依次 420ms outBack 填入缩略图与名字并换成强调色描边。徽章 role=status 播报当前数量，提供手动 +1 与重置按钮。

## 参数

- **数字滚入**：300ms outCubic
- **回弹**：幅度 0.14，衰减系数 7（约 0.5s 收敛）
- **槽位点亮**：420ms outBack，缩放 0.9→1

[打开 Demo](../../demos/patterns/collect-counter/index.html) · [在库中查看](../../patterns.html#pattern/collect-counter)
