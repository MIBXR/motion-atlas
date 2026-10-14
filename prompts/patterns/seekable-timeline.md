# 可逐帧定位的时间轴 · 复用 Prompt

由 [结构化条目](../../entries/patterns/seekable-timeline.json) 自动生成。

## 实现 Prompt

用“时间轴纯函数”组织这段动效：定义 CONFIG.tracks（每条轨道是按时间排列的事件/关键帧），写 render(t) 只根据 t 计算全部 DOM/Canvas 状态（进度用 clamp((t-start)/dur) 再套缓动；关键帧之间插值），禁止 setTimeout、CSS animation 与 Math.random()（改用固定种子随机数，颗粒按 floor(t×fps) 选帧）。用 timeline 控制播放/暂停/seek，并暴露 window.__motion = { duration, markers, seek(t)→Promise, play, pause, on(fn) }；支持 ?embed 隐藏控制条、?render=1 关闭自动播放（seek 等待异步资源完成）、?t=秒 直接定位；空格/方向键控制播放与跳转。

## 参数

- **协议**：window.__motion = { duration, markers, seek(t)→Promise, play, pause, on }
- **URL**：?embed 隐藏控制条 · ?render 关闭自动播放 · ?t=秒 定位
- **渲染**：node scripts/render.mjs <url> --fps 30 → PNG 序列（有 ffmpeg 时合成 MP4）

[打开 Demo](../../demos/patterns/seekable-timeline/index.html) · [在库中查看](../../patterns.html#pattern/seekable-timeline)
