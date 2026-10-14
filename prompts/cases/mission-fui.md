# 任务指挥台 · 荧光 FUI · 复用 Prompt

由 [结构化条目](../../entries/cases/mission-fui.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/mission-fui.md)。

## 实现 Prompt

做一个荧光 FUI 任务指挥台（HTML/CSS/JS + Canvas，可 seek）：黑底 #05080b，荧光青 #5ff3ff 单色系统，全等宽字体。三栏布局：左侧目标列表（编号/类型/距离）与锁定信息框；中间正方形雷达 Canvas（4 道同心圆、十字线、每 10° 刻度、每 30° 三位数方位、扫描线 4 秒一圈、身后 0.9rad 锥形渐变余辉、目标亮度 = e^(−1.3×扫描离开后的秒数)、被扫到时外扩环、未知目标用菱形、速度矢量）；右侧双轨遥测示波器、4 条系统条、逐行打字的事件日志；顶栏任务名、告警态标签、UTC 时钟；底部命令行。面板细描边 + 两个对角角标，全屏淡扫描线纹理。锁定：括号从 240px 按 240→180→120→80→48 分四档阶梯收紧（每档 snap 80ms、间隔 150ms）并从 45° 旋正，1.6 秒后标签由 ACQ ■■□□ 变为 LOCK，数据逐项打字。告警态：一个变量驱动全部 CSS 颜色（400ms 插值）、状态标签闪烁（0/1/2Hz）、边缘内发光（ALERT 2Hz 脉冲）、波形幅度与锯齿、系统条波动。点击目标锁定，1/2/3 切换状态；声音默认关闭；减少动态关闭闪烁；Canvas 文字按缩放保证 ≥12px。

## 视频生成 Prompt

Sci-fi mission control FUI, 1920×1080, 20 seconds, monospace typography, near-black background with a single phosphor cyan color. Three-panel layout: a contact list on the left, a large circular radar in the center with concentric rings, bearing ticks and a sweeping line trailing a soft cone of afterglow — blips flare when the sweep passes and fade like phosphor; telemetry oscilloscope traces, status bars and a typing event log on the right. Thin outlined panels with corner brackets, faint scanlines. A target gets locked: square brackets snap tighter in four mechanical steps while rotating upright, then a "LOCK" tag appears. The whole interface shifts to amber CAUTION with a 1Hz blinking status, then to red ALERT with a 2Hz pulse, jagged waveforms and a glowing pulsing screen edge, before calming back to cyan. Precise, cinematic, no clutter.

## 负向约束

不要多色霓虹混用；不要无意义的随机数字雨；不要让组件各自独立判断状态；不要平滑缩放的锁定框；不要高频（>3Hz）闪烁。

## 动效 Token

- **sweep**：周期 4s；余辉 0.9rad 锥形渐变（α .18）；目标亮度 e^(−1.3Δt)
- **lock**：240→180→120→80→48px，每档 snap 80ms、间隔 150ms，45°→0°；确认 1.6s
- **state**：颜色 400ms inOutCubic；闪烁 0 / 1Hz / 2Hz；ALERT 边缘辉光 2Hz 脉冲
- **log**：每行 600ms 打字；最新行高亮 1.5s
- **boot**：面板裁切展开 1.2s snap

## 制作约束

- 原创设计语言：任务、目标与数据均为虚构。
- ALERT 闪烁为 2Hz，低于常见光敏阈值；正式产品仍应提供关闭选项。

## 迁移

- `config.js → states`：每个告警态的主色/暗色/底色/面板色与闪烁频率；可增加新状态。
- `config.js → contacts`：目标的极坐标（半径比例、方位角）、径向/角速度与类型。
- `config.js → radar`：扫描周期、环数、量程、余辉衰减。
- `config.js → log / autopilot`：日志文本与时刻；自动演示的锁定与状态切换。
- `style.css`：面板角标、扫描线纹理、字体与栏宽。

[打开 Demo](../../demos/cases/mission-fui/index.html) · [在库中查看](../../cases.html#case/mission-fui)
