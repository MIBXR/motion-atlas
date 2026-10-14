# 工业协议 · 终末地式设施操作台 · 复用 Prompt

由 [结构化条目](../../entries/cases/industrial-protocol.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/industrial-protocol.md)。

## 实现 Prompt

做一个“工业协议”风格的设施操作台（HTML/CSS/JS，可 seek）：米灰底 #e6e6e1 + 40px 细网格，面板 #f4f4f0，石墨 #1d1f22，安全黄 #ffd400 只表示“当前/进行中/警示”，完成用绿色。字体：Bahnschrift/DIN 类窄体 + 等宽编码 + 中文黑体。布局：石墨黑顶栏（三角徽记 + 终端名 + 4 个页签 + 资源计数，右下切角，当前页签下方 4px 黄色指示条以 350ms snap 移动）、左侧子菜单（右下切角，当前项反黑 + 右侧黄条）、中央内容（对角切角）、右侧详情（对角切角 + 四角十字注册标记）、底栏（危险斜纹 + 坐标 + 滚动日志 + 时钟）。①启动：三角徽记 + 标题字符解码（24fps 随机字符，按位置逐个解出）+ 24 段进度条（当前段黄色，带随机跳变）→ 加载层自下而上裁切退场，各区块以 cubic-bezier(.2,.9,.1,1) 420ms 从各自边缘错峰装配，资源数字计数。②产线：SVG 节点图（切角白盒、几何图标、编码、名称、OUTPUT/min、闪烁指示灯），节点间是带圆角的正交传送带（灰色粗底 + 黑色虚线带纹按速度推进），物料方块按 (t×速度/长度 + i/数量) mod 1 沿路径取点。③选择设备：四角黄色括号 outBack 回弹；右侧名称解码、深色蓝图 8 条浅蓝线框（pathLength=1）错峰 70ms 描出、三项 10 格分段条依次填充。④按住部署：按住时黄色从左线性填满 1.2s，松开过早 300ms 回落，满格锁定为 DEPLOYED 并盖下倾斜绿色印章，相关产线加速。⑤换页：3px 黄色发光扫描线 500ms inOutQuart 从左扫到右，线左新页、线右旧页（两侧 clip-path），新页标题解码、卡片 snap 错峰上浮。SVG 文字按实际缩放换算保证 ≥12px；声音默认关闭；减少动态停在完成态。

## 视频生成 Prompt

Industrial sci-fi management terminal UI, 1920×1080, 16 seconds. Off-white industrial panels with chamfered 45-degree corners, graphite black header bar, a single safety-yellow accent, crosshair registration marks, tick rulers and yellow-black hazard stripes, a thin engineering grid background. A triangle emblem appears and a monospace title decodes from random characters while a 24-segment progress bar fills. The loader slices away upward and UI modules snap into place from their edges with mechanical precision. A production-line node graph runs: small black square items flow along orthogonal conveyor belts between machine nodes with blinking green lamps. A machine is selected with yellow corner brackets popping in; on the right a dark blueprint panel draws light-blue wireframe lines one by one and segmented meters fill. A long-press button fills with yellow from left to right and a green "DEPLOYED" stamp slams down at an angle. Then a glowing yellow scanline sweeps across the content area revealing a new page of dark operator cards. Precise, mechanical, calm; no glow overload; no neon.

## 负向约束

不要赛博朋克霓虹与紫粉渐变；不要圆润的消费级卡片与大阴影；不要让黄色泛滥成背景色；不要弹性夸张的动画；不要使用原作的标志、角色、术语与美术。

## 动效 Token

- **snap**：cubic-bezier(.2,.9,.1,1)：装配 420ms、页签指示 350ms、卡片 320ms
- **assemble-stagger**：顶栏 → 侧栏（60ms/项）→ 内容 → 详情 → 底栏，约 0.1s 递进
- **scramble**：24fps 随机字符刷新，阈值 = 位置×0.7 + 随机×0.3，时长 0.6–1.2s
- **conveyor**：物料 90px/s（部署后 150px/s），每条带 4 个，带纹同速
- **blueprint**：8 条线框各 450ms inOutCubic，错峰 70ms
- **hold**：1.2s 线性填充，松开 300ms 回落；完成印章 350ms outBack
- **scanline**：500ms inOutQuart，3px 黄线 + 外发光

## 制作约束

- 证据等级为“公开资料推断”：未实机录制《明日方舟：终末地》，动效时长为本地拟合；请按 docs/methodology.md 用实机录像核验后更新。
- 不使用鹰角网络/GRYPHLINE 的标志、角色、术语（如源石、AIC 等）与美术；设施、干员与资源名称均为原创。
- 产线图为示意，不包含真实游戏的配方与数值。

## 迁移

- `config.js → brand / palette`：终端名称、站点代码、版本号；纸色、面板、石墨、灰、细线、安全黄、警示与完成色。
- `config.js → tabs`：模块页签（英文 + 中文）与每个模块的子菜单。
- `config.js → machines / links`：产线节点（坐标、编码、名称、产量、图标）与连接关系，传送带路径自动生成。
- `config.js → operators / resources`：卡片内容与顶栏资源计数。
- `config.js → holdDuration / autopilot`：长按确认时长；自动演示事件（选择、按住、换页）的时刻。
- `style.css → --cut`：切角尺寸；改成 0 即得到直角版本。

[打开 Demo](../../demos/cases/industrial-protocol/index.html) · [在库中查看](../../cases.html#case/industrial-protocol)
