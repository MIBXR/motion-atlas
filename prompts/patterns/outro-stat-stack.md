# 结尾数据堆叠与计数 · 复用 Prompt

由 [结构化条目](../../entries/patterns/outro-stat-stack.json) 自动生成。

## 实现 Prompt

实现片尾数据堆叠：左侧垂直列表，每行“大号数字（DIN 类 800 字重，34–86px，等宽数字）+ 12px 等宽标签（字距 .22em）”；第 i 行在 t0 + i×320ms 以 450ms 上移 14px 淡入，数字 900ms outQuart 从 0 计数到目标值（支持“×”前缀与“ km”后缀、千分位）。最后一行下方用衬线体写“标题 — fin.”，逐字 60ms 错峰模糊入场，再淡入署名与 12px 致谢。背景保留淡化的完整路线。

## 参数

- **行错峰**：320ms
- **计数**：900ms outQuart，千分位格式
- **fin.**：逐字 500ms，错峰 60ms，模糊 12px

[打开 Demo](../../demos/patterns/outro-stat-stack/index.html) · [在库中查看](../../patterns.html#pattern/outro-stat-stack)
