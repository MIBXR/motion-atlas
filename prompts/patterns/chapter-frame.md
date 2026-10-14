# 章节主题：标签、强调色与四角框线 · 复用 Prompt

由 [结构化条目](../../entries/patterns/chapter-frame.json) 自动生成。

## 实现 Prompt

实现章节主题切换：标签色块（强调色底、白色 12px 等宽、字距 .24em）用 clip-path 350ms 从左擦出，旁边标题打字 700ms，再弹出一个 SVG 小图标；全局 CSS 变量 --accent 用 400ms 从默认色插值到章节色，路线、卡片描边、标签与框线都读取它；沿屏幕内缘（inset 8–20px）描一圈 3px 框线，stroke-dashoffset 800ms inOutCubic 从周长到 0，四角 14px 方块 120ms 错峰 outBack 弹出。离开时 500ms 淡出，颜色 600ms 回默认。

## 参数

- **色块擦出**：350ms outCubic（clip-path）
- **强调色**：入 400ms / 出 600ms
- **框线描出**：800ms inOutCubic
- **四角方块**：300ms outBack，错峰 120ms

[打开 Demo](../../demos/patterns/chapter-frame/index.html) · [在库中查看](../../patterns.html#pattern/chapter-frame)
