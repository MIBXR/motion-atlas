# 终端逐字开机序列

## 实现 Prompt

实现当前案例的约 21.92 秒终端开场：直接复用 bootMotion、bootLogoTrack、扫描轨道、BootSequence 与字形。以 floor((t+5)×25+0.00001) 取原片帧，权限帧 170–187 依 1,1,3,4,5,6,9,11,12,14,17,18,19,20,22,23,25,26 揭字；标志使用帧 229–264 的同一条轮廓前后端与 0.25→26 线宽，保留 RHINE·LAB。身份帧 282–339 保留 ID CONFIRMED : JOYCE MOORE；随后 REQUEST RECEIVED、START PROCESSING 及 449/453/457 帧的省略号，再在 14.48 秒进入扫描、17.76 秒进入欢迎。声音引用 ../../cases/archive-os/audio/film-audio.ogg，仅播放 0–21.92 秒，默认关闭。字体引用 ../../cases/archive-os/film/app/fonts/；render(t) 可任意 seek；减少动态时停在 20.5 秒欢迎画面。 在原有 21.92 秒之后依次重放mg-hud 原片 0.2–2.4 秒；mg-hud 原片 7.05–8.7 秒；全部重放总时长 25.77 秒。HUD 以字符速率增加可见子串，坐标使用34字符每秒，末尾方块光标按2.5Hz闪烁。参数沿用：export function typed(t, t0, str, cps = 90) {
  return str.slice(0, Math.floor((t - t0) * cps + 1e-6));
  const ty = typed(t, K.coords, coord, 34);
    if (blink(t, 2.5) || ty.length < coord.length) T('█', CX - cw / 2 + TW(ty, { s: 26, w: 500, ls: 2 }) + 6, CY + hh + 63, { s: 22, c: CYA });
原有段的画面和时序保持原样，新增段沿用同区间原片音轨，声音默认关闭。

## 视频生成 Prompt

制作 21.92 秒、25fps 帧表驱动的 RHINE LAB 开场。1.8 秒逐字出现 ACCESS PERMISSION REQUIRED，4.16 秒起沿一条共享轮廓描绘标志并移动，6.28 秒起确认 JOYCE MOORE 身份，9.68 秒起请求、11.92 秒起处理，14.48 秒扫描、17.76 秒欢迎，21.56 秒开始缩小失焦并于 21.92 秒结束。字形、材质色彩、轮廓轨迹与声音均使用当前 archive-os 文件。

## 负向约束

不要双独立圆环，不要均匀每字间隔，不要 LUMEN、K. ARLEN 或 ANALYSIS OS 请求文案，不要方波替代逐字采样，不要添加块状闪烁光标或 180ms 反色闪，不要跨目录依赖案例。

## 参数

- **权限**：1.8s 开始，2.48s 揭完；4.08s 隐藏
- **标志**：4.16s 显示；帧 229–264 沿单轮廓描绘，随后移向左侧
- **身份**：6.28–8.56s；请求 9.68–10.56s；处理 11.92–13.28s
- **扫描与欢迎**：14.48s 扫描；17.76s 欢迎；21.56–21.92s 缩小、失焦并淡出
- **总时长**：25.77 秒
- **日志逐字光标参数**：export function typed(t, t0, str, cps = 90) {
  return str.slice(0, Math.floor((t - t0) * cps + 1e-6));
  const ty = typed(t, K.coords, coord, 34);
    if (blink(t, 2.5) || ty.length < coord.length) T('█', CX - cw / 2 + TW(ty, { s: 26, w: 500, ls: 2 }) + 6, CY + hh + 63, { s: 22, c: CYA });

[打开 Demo](../../demos/patterns/boot-typing/index.html) · [在库中查看](../../patterns.html#pattern/boot-typing)
