# 赛事转播图形包 · 踩拍的信息层 · 复用 Prompt

由 [结构化条目](../../entries/cases/broadcast-pack.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/broadcast-pack.md)。

## 实现 Prompt

做一套 24 秒的电竞转播图形包（HTML/CSS/JS，可 seek），120 BPM，所有元素按拍号出入场：配色深蓝 #0a1230 / 青柠 #c6ff3d（主队与系统）/ 青 #29d3ff（客队）/ 品红 #ff2e88（直播与回放状态）/ 白；字体 Bahnschrift 窄体斜体 + 等宽标签；所有图形带 −12°~−18° 斜切。背景是深蓝竞技场（锥形光束、透视网格地板、观众光点）。①第 0 拍色带转场：5 条 34% 宽的斜色带错峰 70ms 在 2 拍内横扫，品牌字母斜切滑入；②第 4 拍左上比分角标 400ms snap 横向展开（赛事条 + 队名色条 + 比分）；③第 8 拍下三分之一：青柠色条 200ms 从下长出 → 深蓝底板 350ms 从左擦出（右端斜切）→ 标签/姓名/职位 80ms 错峰上浮；第 15 拍倒序离场；④第 16 拍数据对比：青柠标题条下落，三行数据每半拍一行从中线展开，左右条形 900ms outQuart 向两侧生长并计数；⑤第 24 拍得分：角标青柠闪烁、比分滚动、巨型斜体“POINT · 队名”250ms outBack 落定、场景震动；⑥第 28 拍色带转场进入回放：品红描边框、REPLAY 标签 2Hz 闪、0.5×、轨迹以半速划过、时间码半速；第 36 拍色带回到直播；⑦第 37 拍底部滚动新闻条上浮；⑧第 42 拍冠军卡：名字回弹、比分胶囊、彩带；⑨第 46 拍色带 + 标志收尾。右下拍点灯每拍闪一次。声音默认关闭；减少动态关闭震动与彩带。

## 视频生成 Prompt

Esports broadcast graphics package, 1920×1080, 24 seconds at 120 BPM, every graphic landing on the beat. Deep navy arena with cone light beams, a glowing perspective grid floor and twinkling crowd dots. Opens with five slanted color bars (lime, cyan, white, magenta, navy) sweeping across the screen in a staggered stinger, revealing an italic condensed logo. A slanted score bug snaps open top-left. A lower third builds in three stages: a lime bar grows, a navy plate wipes out with a slanted edge, then name and role rise in. A match-stats panel unfolds row by row from the center with bars growing outward and numbers counting up. A big italic lime "POINT" slams in with a flash on the score bug. A stinger hides the cut to a magenta-framed slow-motion replay with a glowing lime trajectory and half-speed timecode. A news ticker slides up; a champion card bursts in with confetti. Crisp, energetic, high-contrast, perfectly rhythmic.

## 负向约束

不要让多个事件图形同时出现；不要软绵绵的淡入淡出；不要让转场时长与拍子不一致；不要过多颜色角色；不要真实赛事的商标与选手。

## 动效 Token

- **beat**：120 BPM = 0.5s；所有入场写成拍号
- **stinger**：5 条 34% 宽、−18° 斜切色带，错峰 70ms，2 拍 inOutCubic 横扫
- **bug**：400ms snap 横向展开；比分滚动 400ms
- **lower-third**：色条 200ms → 底板 350ms snap → 文字 300ms，错峰 80ms；离场 140–220ms
- **stats**：每半拍一行；条形 900ms outQuart 从中线生长并计数
- **point**：250ms outBack 1.6→1，−10° 斜切；震动 10px·e^(−8t)
- **replay**：场景速度 ×0.5、降饱和；品红框 + 标签闪烁 2Hz

## 制作约束

- 原创设计语言：赛事名、队伍、选手与数据均为虚构。
- 回放段仅以轨迹示意，实际节目应替换为真实回放素材。
- 所有文字 ≥12px；1920×1080 成片下标签为 12–14px。

## 迁移

- `config.js → bpm / beats`：改 BPM 即整体变速；beats 中每个元素的出场拍号决定节奏结构。
- `config.js → event / teams`：赛事名、阶段、场馆；队伍代码、名称、颜色与比分变化。
- `config.js → lowerThird / stats / ticker`：人物条三行、数据对比行（可带小数）、滚动新闻。
- `config.js → palette`：底色、主客队色与状态色（直播/回放）。
- `style.css`：斜切角度（skewX）、色带宽度、字体与圆角。

[打开 Demo](../../demos/cases/broadcast-pack/index.html) · [在库中查看](../../cases.html#case/broadcast-pack)
