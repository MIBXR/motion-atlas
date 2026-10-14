# 竖排汉字模糊入场 + 英文打字 · 复用 Prompt

由 [结构化条目](../../entries/patterns/vertical-title-blur.json) 自动生成。

## 实现 Prompt

实现“竖排汉字模糊入场 + 英文打字”标题：汉字 writing-mode: vertical-rl，900 字重，每字独立 span；第 i 个字在 start + i×140ms 开始，500ms outCubic 内 opacity 0→1、filter blur(14px)→0、translateY(-10px)→0。汉字右侧一条 3px 横线 450ms scaleX 0→1，下方英文标题按字符打出（约 45ms/字符），正在出现的前两个字符带 6px 模糊。离场时整组 450ms 模糊到 10px 并淡出。提供字幕变体：白色衬线、字间 300ms、斜体英文副句。全部动画是时间 t 的纯函数。

## 参数

- **字间错峰**：140–160ms（字幕 300ms）
- **单字时长**：500ms outCubic
- **初始模糊**：14px（字幕 10px）
- **英文打字**：约 45ms/字符，前沿 2 字符模糊
- **离场**：450ms 整体模糊 10px + 透明

[打开 Demo](../../demos/patterns/vertical-title-blur/index.html) · [在库中查看](../../patterns.html#pattern/vertical-title-blur)
