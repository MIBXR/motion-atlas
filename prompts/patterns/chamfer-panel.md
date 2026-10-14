# 切角工业面板 · 复用 Prompt

由 [结构化条目](../../entries/patterns/chamfer-panel.json) 自动生成。

## 实现 Prompt

实现切角工业面板：clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% − var(--cut)), calc(100% − var(--cut)) 100%, 0 100%, 0 var(--cut))，标准 --cut 14px；变体：深色反色模块（右上黄色三角角标、底部 12px 黄黑 −45° 危险斜纹）、文件夹标签切口（顶边 46% 处 16px 台阶）。四角放 14×14 十字注册标记（两条 2px 线），标题下方加 1px/8px 刻度尺。入场：--cut 从 134px 以 cubic-bezier(.2,.9,.1,1) 450ms 收拢到 14px 并上移 24px→0，面板错峰 120ms，附件在其后错峰出现。

## 参数

- **切角**：标准 12–16px；入场从 +120px 收拢
- **入场**：450ms snap，面板错峰 120ms
- **附件**：注册标记/刻度/角标在面板就位后 250ms 起错峰 40ms 出现

[打开 Demo](../../demos/patterns/chamfer-panel/index.html) · [在库中查看](../../patterns.html#pattern/chamfer-panel)
