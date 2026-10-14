# 斜切指令菜单 · 复用 Prompt

由 [结构化条目](../../entries/patterns/skew-menu.json) 自动生成。

## 实现 Prompt

实现斜切指令菜单：每项是一个按钮，内部两层 clip-path 斜切多边形——白色板与向右下偏移 10px/8px 的黑色影子，上面是 26–64px 超粗标签与小字中文；各项静止角度错落（如 −4°, 2°, −2°, 3°, −5°）。选中时用 160ms cubic-bezier(.2,.9,.1,1) 把 translateX 0→26px、rotate 加 −7°、scale 1→1.18，板与影子黑白互换、文字反白；选中项影子位移叠加 sin(31t)·3px 与 cos(27t)·3px 的抖动。悬停、聚焦、↑/↓ 都会选中。减少动态时关闭抖动。

## 参数

- **切换**：160ms snap（cubic-bezier(.2,.9,.1,1)）
- **选中形变**：scale 1.18 · rotate −7° · 右移 26px
- **影子抖动**：±3px，31Hz / 27Hz
- **静止角度**：−5° ~ +3° 错落

[打开 Demo](../../demos/patterns/skew-menu/index.html) · [在库中查看](../../patterns.html#pattern/skew-menu)
