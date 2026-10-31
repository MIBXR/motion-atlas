# 五秒宇航员 · 微游戏快闪

## 实现 Prompt

制作见习宇航员在蜡笔、水墨、终端、孔版、像素、蓝图与瑞士排版微游戏中受训，失去两条命后在混合风格Boss关完成降落。 一词口令、动作、结果组成微游戏单元；速度阶梯同时改变音乐、关卡长度、舞台停留、口令时长和角色帧率。 第一轮8fps角色、第二轮12fps、Boss的运动连续更新；24fps镜头与引线火星贯穿全片，失败关保留半速回放。 Canvas2D各媒介渲染器与WebGL2材质着色器，统一电视舞台、角色、口令和引线计时器。 字体：Titan One、Lilita One、VT323、Architects Daughter、Gochi Hand、Inter；Silkscreen 400/700。 声音：原创放克配乐，MuldjordKit鼓CC BY 4.0、Salamander钢琴CC BY 3.0、VSCO/VCSL/Karoryfer/FreePats采样CC0；Kokoro am_fenrir与af_bella。 实现沿用lemo-microgame的film/源码、素材与时间表。

## 动效 Token

- **五项加速**：film/timeline.js:SEGS；film/film.js:R2 / tvInDur / tvOutDur / hold；film/g_crayon.js等8fps、g_pixel.js等12fps、g_boss.js的lt连续运动。
- **口令**：film/hud.js:command，.12秒由1.9→.92，接.08秒回1；hold=.75或.64秒，.22秒缩至.3倍角标。

## 迁移

- `film/timeline.js`：修改关卡、节拍、速度和口令。
- `film/g_*.js / film/hud.js / film/film.js`：修改各媒介任务、口令表现、转场与命数；声音使用source/timeline.json同表制作。

[打开 Demo](../../demos/cases/lemo-microgame/index.html) · [在库中查看](../../cases.html#case/lemo-microgame)
