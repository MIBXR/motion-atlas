# 雷达扫描与余辉 · 复用 Prompt

由 [结构化条目](../../entries/patterns/radar-sweep.json) 自动生成。

## 实现 Prompt

在 Canvas 上实现雷达扫描：同心圆、十字线、每 30° 方位刻度（字号按画布缩放换算 ≥12px）；扫描角 = t/周期×2π（从正北顺时针）；用 createConicGradient 在扫描线身后画角宽约 52° 的扇形余辉（从透明到 α0.2）；扫描线 3px 实线；每个目标亮度 I = e^(−1.3×Δt)，Δt 为扫描线离开它的秒数，被扫到时外扩一圈半径随 (1−I) 增大的描边环；未知目标用菱形。提供周期、衰减、余辉角滑杆。

## 参数

- **周期**：4s/圈（可 1.5–8s）
- **余辉**：角宽 50–70°，α 0.18–0.2
- **衰减**：k ≈ 1.3

[打开 Demo](../../demos/patterns/radar-sweep/index.html) · [在库中查看](../../patterns.html#pattern/radar-sweep)
