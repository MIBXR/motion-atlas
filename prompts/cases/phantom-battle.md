# 怪盗动势 · P5 式战斗指令与总攻过场 · 复用 Prompt

由 [结构化条目](../../entries/cases/phantom-battle.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/phantom-battle.md)。

## 实现 Prompt

做一段 P5 式“战斗指令 + 总攻过场”（HTML/CSS/JS，可 seek，约 17 秒）：只用红 #d7141a、黑 #0b0b0c、白，背景是红底 + 半色调网点 + 旋转 −14° 的黑色斜带。①指令：四个按钮按角度环绕黑色剪影角色（白描边 + 红色偏移影），每个按钮是斜切多边形白底 + 黑色偏移影子 + 几何按键符号（△○×□）+ 超粗标签；选中项 160ms snap 放大 1.2、扭转 −6°、黑白反转，白影子以 31/27Hz 抖动 ±3px；右下是斜切黑底的队伍 HP/SP 卡片。②选择攻击 → 旋转准星锁定敌人 → 命中：差值混合反色闪 80ms、屏幕抖动 22px·e^(−12t)、敌人后坐；WEAK 冲击字（白字黑描边 + 黑色硬投影）从 2.6 倍 outBack 落定并倾斜 −10°。③1 MORE：旋转 −8° 的黑带内嵌红带，从右 220ms outExpo 切入，内有横向流动速度线与眼部特写缓推，剪报字（每个字母独立底色/字体/角度/大小，固定种子）以 30ms 错峰从 2.2 倍拍入，1.3 秒后整条向左离场。④HOLD UP 巨型剪报字 + 敌人眩晕；⑤压暗询问 ALL-OUT ATTACK / GO FOR IT?；⑥黑色 16 角星旋转放大吞没（380ms inQuad）后在白底总攻画面中缩回：黑色剪影带拖尾冲刺，红色斜切按 0.22 秒节拍闪现，拟声词轮替；⑦反色一帧进入收尾：红色放射背景旋转，白色斜切漫画格推入，原创标语逐字拍入；⑧结算：白色斜切板从左滑入，数值行 120ms 错峰。所有动画是时间 t 的纯函数；WASD/Enter 可交互；声音默认关闭；prefers-reduced-motion 关闭抖动与闪光。

## 视频生成 Prompt

Stylish JRPG battle UI cutscene in a red, black and white palette, 1920×1080, 17 seconds, inspired by rebellious punk collage design (original characters only). A red background with halftone dots and a tilted black slab; a black silhouette hero with a white outline and red offset shadow stands among four tilted command plates (triangle, circle, cross, square glyphs). The cursor snaps between commands: the selected plate enlarges, twists and inverts to black with a jittering white shadow. Attack: a spinning reticle locks on a spiky masked enemy, a hard inverted flash and camera shake, the word "WEAK" slams in tilted with thick black outline. A diagonal black-and-red band slices in from the right with streaking speed lines and a close-up of narrow eyes, while ransom-note letters (each a different font, color block and angle) stamp in one by one reading "1 MORE!". "HOLD UP!" stamps across the screen. A black 16-point star spins outward to swallow the frame, then shrinks to reveal a white stage where black silhouettes dash with motion trails and red diagonal slashes flash on the beat. A finishing comic panel slides in over a rotating red sunburst with a collage tagline. Ends on a white slanted results plate sliding in from the left. Snappy, high-contrast, jazz-funk energy.

## 负向约束

不要使用原作角色、标志、字体图像、台词或音乐；不要出现水平垂直的“正经”版式；不要渐变光晕、毛玻璃或霓虹；不要慢速淡入；不要每个字母同一种样式；不要让抖动与闪光在减少动态时出现。

## 动效 Token

- **menu-select**：160ms snap：放大 1.18–1.2、扭转 −6°~−7°、右移 26px；影子抖动 ±3px（31/27Hz）
- **hit**：反色闪 60–80ms；抖动 22px·e^(−12t)；目标后坐 40px·e^(−6t)
- **impact-text**：260ms outBack：2.6→1，倾斜 −10°；停留约 0.9s
- **cut-in**：切入 220ms outExpo，停留约 1.3s，离场 220ms inCubic；速度线 1400px/s
- **ransom-slam**：每字 220ms outBack：2.2→1，角度回弹，错峰 30–40ms
- **shape-wipe**：吞没 380ms inQuad → 换场 → 释放 300ms outCubic；旋转 90°/s
- **frenzy-beat**：红切每 220ms 一次，350ms 衰减

## 制作约束

- 证据等级为“公开资料推断”：本会话无法实机录制《女神异闻录5》，所有时长与缓动为本地拟合，请用实机录像逐帧核对（方法见 docs/methodology.md）。
- 不使用 ATLUS/SEGA 的角色、标志、字体图像、台词与音乐；角色、敌人、标语与队伍名均为原创。
- “CURTAIN CALL / 怪盗谢幕”等文案为原创，不复用原作结算台词。
- 反色闪与抖动存在光敏风险：减少动态时关闭，正式作品建议提供关闭选项。

## 迁移

- `config.js → palette`：主红、深红、黑、白与按键辅助色。
- `config.js → commands`：指令标签、中文、按键、几何符号与环绕角度（度）。
- `config.js → party / enemy`：队伍名称、HP/SP、头像色；敌人名称与等级。
- `config.js → text`：冲击字、切入字、HOLD UP、询问、收尾标语与结算行。
- `config.js → beats`：每个事件的时刻：调这里即可改整场战斗的节奏。
- `index.html → svg`：角色、敌人与漫画格剪影；替换为你的角色立绘或剪影。

[打开 Demo](../../demos/cases/phantom-battle/index.html) · [在库中查看](../../cases.html#case/phantom-battle)
