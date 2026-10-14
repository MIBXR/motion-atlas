# 节拍动态字幕 · Kinetic Lyric MV · 复用 Prompt

由 [结构化条目](../../entries/cases/beat-lyric.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/beat-lyric.md)。

## 实现 Prompt

做一支 30 秒的节拍动态字幕 MV（HTML/CSS/JS，可 seek），96 BPM、12 小节：把歌词写成拍号表 {beat, text, style, hold}，所有视觉事件都换算成拍。①倒数：1·2·3·4 每拍一个等宽数字；②拍入（slam）：英文大写超粗窄体占满画面，每拍硬切出现，120ms outExpo 从 1.5 倍落定、−3° 回正，反拍上弹 2%；③遮罩上升（rise）：中文超粗黑体在 overflow:hidden 容器中 250ms 从下方升起，按 hold 拍停留后向上离场；④堆叠网格（stack）：2×4 描边格子逐拍点亮一个词，第 5 小节起隔格反色；⑤Build：“UP”按八分音符叠加，每次放大 12%、旋转、散点位置，旧的留下衰减残影，斜条纹闪随进度加密；⑥Drop：巨型词铺满，每拍在四色间轮换底与字，底鼓震动 + 纵向拉伸；⑦结尾卡。配色四种纯色轮换（炭黑/信号红/电蓝/米白），每段新色块 350ms 从左擦入；镜头每拍缩放脉冲 2.2%；军鼓拍（2、4 拍）100° 斜条纹 difference 闪。HUD：标题 + 段名、BAR/BEAT 计数、四格拍点、底部频谱条（底鼓/镲片确定性包络）。内置 WebAudio 合成鼓点并用 120ms 前瞻调度对齐画面。减少动态关闭闪光与震动。

## 视频生成 Prompt

Kinetic typography lyric video, 1920×1080, 30 seconds at 96 BPM, every change locked to the beat. Flat solid color fields cycling between charcoal, signal red, electric blue and off-white, each new section wiping in from the left. Huge condensed uppercase words slam onto the screen exactly on each beat — no fades, just a quick settle from 150% to 100% — and bob slightly on the offbeat. Bold Chinese characters rise from behind an invisible baseline mask. A 2×4 outlined grid fills one word per beat, then cells invert in a checker rhythm. A build-up stacks the word "UP" on eighth notes, growing and rotating with fading echoes while diagonal stripes flash faster and faster. The drop: a giant word fills the frame, background and text colors swap every beat with a camera punch on each kick. Minimal HUD with bar/beat counter and four beat squares, a small spectrum at the bottom. Tight, musical, graphic.

## 负向约束

不要淡入淡出；不要让词的出现时间偏离拍点；不要所有层同时用同一频率运动；不要渐变和照片背景；不要超过四种主色。

## 动效 Token

- **beat**：96 BPM = 625ms；十六分音符 156ms
- **slam**：出现瞬间 1.5→1，120ms outExpo；hold 拍后硬切
- **offbeat**：+0.5 拍上弹 2%，e^(−10·Δ) 回落
- **rise**：遮罩内 250ms outCubic 上升，200ms inCubic 离场
- **cam-pulse**：每拍 1 + 0.022·e^(−8·frac)（Drop 0.06 + 14px 震动）
- **section-wipe**：新色块 350ms inOutQuart 从左擦入
- **audio**：前瞻 120ms 调度到 AudioContext

## 制作约束

- 原创歌词与合成鼓点，无真实音乐授权问题；接入真实歌曲时需按歌曲 BPM 与拍点重写 lyrics 表。
- Drop 段每拍换色属于高强度闪烁，正式发布应提供关闭选项。

## 迁移

- `config.js → bpm / bars`：速度与小节数；时长自动计算。
- `config.js → lyrics`：拍号表：beat（可为 .5）、text、style（count/slam/rise/stack/build/giant）、hold；stack 用 cell 指定格子。
- `config.js → sections`：每段起始小节、底色/字色/强调色；strobe 数组用于 Drop 每拍换色。
- `config.js → pattern`：十六步鼓点字符串（x 触发）、低音、Build/Drop 起止拍。
- `接真实歌曲`：用 <audio> 播放并以 audio.currentTime 作为 t；按歌曲 BPM 与第一拍偏移（offset）重写 lyrics。

[打开 Demo](../../demos/cases/beat-lyric/index.html) · [在库中查看](../../cases.html#case/beat-lyric)
