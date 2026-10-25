# 空闲呼吸

## 实现 Prompt

实现空闲呼吸：记录最后一次输入时刻；强度 = clamp((t − last − 2.5) / 1.5)；第 i 个元素位移 = 强度 × A × (0.6·sin(2πt/8 + 1.3i) + 0.4·sin(2πt/13 + 0.7i))，A 取元素高度的 2–3%；任何输入立即让强度归零（或在 300ms 内渐退）；prefers-reduced-motion 时完全关闭。附一个空闲计量条与呼吸曲线可视化便于调参。

## 参数

- **阈值**：2.5s 后开始，1.5s 渐入
- **周期**：8s 与 13s，权重 0.6 / 0.4
- **幅度**：约元素高度的 2–3%（Demo 14px 为演示放大）
- **退出**：任何输入立即开始渐退

[打开 Demo](../../demos/patterns/idle-breathing/index.html) · [在库中查看](../../patterns.html#pattern/idle-breathing)
