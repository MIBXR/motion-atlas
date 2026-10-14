# 全局告警态切换 · 复用 Prompt

由 [结构化条目](../../entries/patterns/alert-state.json) 自动生成。

## 实现 Prompt

实现全局告警态：定义状态表 nominal/caution/alert，每个包含 main/dim/bg/panel 颜色、闪烁 Hz（0/1/2）、边缘辉光强度（0/8/26）、数据抖动幅度；切换时用 400ms inOutCubic 把颜色插值写入 :root 的 CSS 变量，所有组件只读变量；状态标签按 floor(t×Hz×2)%2 方波闪烁；ALERT 时全屏 inset box-shadow 以 2Hz 正弦脉冲；数据卡片的目标值与抖动随状态改变。提供 1/2/3 快捷键与按钮，减少动态时关闭闪烁与脉冲。

## 参数

- **颜色**：400ms inOutCubic
- **闪烁**：NOMINAL 0 · CAUTION 1Hz · ALERT 2Hz
- **辉光**：CAUTION 静态 8px · ALERT 26px 2Hz 脉冲

[打开 Demo](../../demos/patterns/alert-state/index.html) · [在库中查看](../../patterns.html#pattern/alert-state)
