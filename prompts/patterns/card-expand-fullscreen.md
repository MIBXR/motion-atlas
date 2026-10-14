# 卡片展开为全屏 · 复用 Prompt

由 [结构化条目](../../entries/patterns/card-expand-fullscreen.json) 自动生成。

## 实现 Prompt

实现“卡片 → 全屏 → 卡片”：卡片静止于右侧（宽 min(44vw, 860px)，16:10），550ms outCubic 浮入；在高光时刻用 600ms inOutCubic 把 left/top/width/height 插值到全屏、圆角 6px→0，停留 3s 期间图片 scale 1→1.07，再 550ms 收回。用同一个展开值驱动：上下渐变压暗层透明度、HUD 文字由墨色变白、卡片说明与引线淡出。所有状态由时间 t 计算，可任意 seek。

## 参数

- **浮入**：550ms outCubic：上移 26px、缩放 0.965→1
- **展开**：600ms inOutCubic
- **停留**：约 3s，Ken Burns 1→1.07
- **收回**：550ms inOutCubic

[打开 Demo](../../demos/patterns/card-expand-fullscreen/index.html) · [在库中查看](../../patterns.html#pattern/card-expand-fullscreen)
