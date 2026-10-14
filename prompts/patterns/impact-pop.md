# 冲击字弹出 · 复用 Prompt

由 [结构化条目](../../entries/patterns/impact-pop.json) 自动生成。

## 实现 Prompt

实现命中冲击字：记录命中时刻 h，s = t − h。0–60ms 全屏白色 difference 反色闪；目标 translateX 40·e^(−6s)、旋转 8·e^(−6s)、前 100ms brightness(3)；屏幕抖动幅度为所有命中的 22·e^(−12s) 之和，位移取 sin(93t)、cos(71t)。80ms 后冲击字（白字、5px 黑描边 paint-order: stroke、8px 黑色硬投影；暴击用黄色）在 260ms 内 outBack 从 2.6 倍缩到 1、角度从 −30° 回到 −10°；背后白色 14 角星芒 300ms outExpo 扩张并淡出；停留 0.9s 后 180ms 放大淡出。减少动态时只保留文字。

## 参数

- **反色闪**：60ms
- **抖动**：22px·e^(−12t)
- **文字**：延迟 80ms，260ms outBack，2.6→1，−10°
- **停留/离场**：0.9s / 180ms

[打开 Demo](../../demos/patterns/impact-pop/index.html) · [在库中查看](../../patterns.html#pattern/impact-pop)
