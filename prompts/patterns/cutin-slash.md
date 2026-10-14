# 角色切入斜带 · 复用 Prompt

由 [结构化条目](../../entries/patterns/cutin-slash.json) 自动生成。

## 实现 Prompt

实现角色切入斜带：一条宽度 130%、高度约 36% 的黑色带（rotate −8°）内嵌上下各留 13% 的红色带；红带背景是 repeating-linear-gradient 速度线，backgroundPosition 随时间以 1400px/s 平移；中间放角色眼部特写 SVG。切入：translateX 120%→0，220ms outExpo，同时 60ms 反色闪（mix-blend-mode: difference）与 12px·e^(−10t) 屏幕抖动；停留 1.4s 期间特写 scale 1→1.12；离场：继续向左 translateX 0→−120%，220ms inCubic。文字用剪报拼贴字在切入后 150ms 逐字拍入。

## 参数

- **切入**：220ms outExpo
- **停留**：约 1.3–1.6s
- **离场**：220ms inCubic，同方向继续
- **速度线**：1400px/s
- **缓推**：停留期 +12%

[打开 Demo](../../demos/patterns/cutin-slash/index.html) · [在库中查看](../../patterns.html#pattern/cutin-slash)
