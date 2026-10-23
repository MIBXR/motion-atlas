# 终末地 · 集成工业协议 · 复用 Prompt

由 [结构化条目](../../entries/cases/industrial-protocol.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/industrial-protocol.md)。

## 实现 Prompt

按60秒时间轴制作《明日方舟：终末地》集成工业系统界面影片，横1920×1080、竖1080×1920，MotionKit.stage固定舞台，render(t)纯函数。0–4黑底ENDFIELD/终末地字标和加载线；4–10草地俯视工地、黄黑建造边界、模式/资源/任务/设备栏HUD；10–24放置512px蓝图：配件机A128+传送带64+粉碎机128+传送带64+仓储箱128，三次贝塞尔光标跟随、13s旋转90°、13.6s吸附、14.4s确认，三台依14.6/14.9/15.2s线框扫描成形，铺带连核心→A→粉碎→仓储→B，18.5s起80px/s运料；24–36配件机浅色半透明面板，背包、输入输出、2秒生产进度、32s全部收取，两件弧线飞入背包20→22；36–48浅灰干员页，中央外套剪影、右侧亮黄斜带、等级20→21与属性滚动、四技能描黄环；48–56蓝图纸与贯屏白色分享弹窗，复制EF01-7KQ2-M9A3-ZT58并确认；56–60回工地拉远、右下字标、淡黑。统一ink#17191b/paper#e8e9e8/yellow#ffe400/belt#f2a51c/ghost#2d8cff，品牌五段彩条。字体Barlow Semi Condensed与Noto Sans SC经MotionKit.preload；字号按本条目横竖阶梯。竖屏重排为触控圆钮、底部设备面板与干员信息卡、下方蓝图详情；界面DOM/CSS，设施内联自绘SVG，地形物料Canvas固定种子。MotionKit.audio合成音谱同轴，sound:true；13s click gain.9。减少动态时仅镜头和扫带改淡入淡出。界面复刻自游戏，未使用游戏美术素材。

## 视频生成 Prompt

A 60-second Arknights: Endfield integrated industrial UI film in landscape 1920×1080 and portrait 1080×1920. Black ENDFIELD title and loading line, overhead grassy industrial site with lemon-yellow hazard border, industrial HUD, blue three-machine blueprint placement and construction, orange conveyors with moving materials, translucent accessory-machine production and collection panel, pale operator screen with a coat silhouette and yellow level-up band, blueprint-paper sharing modal, industrial-site pullback and fade to black. Recreate the referenced interface layout and interaction with original geometric SVG/Canvas assets, OFL Barlow Semi Condensed and Noto Sans SC fonts, and synchronized synthesized interface sounds. No game screenshots or official character, icon, or font assets.

## 负向约束

不使用游戏截图、角色立绘、官方图标或官方字体文件；不把60秒设计时序标为原游戏动效实测；不加入规格外的界面文案、场景或构图。

## 动效 Token

- **loading**：1.0–3.4s 0→100%，easeInOutSine
- **hud**：4.6/5.4/5.8/6.2/6.6s入场；模式5.0s切换，0.25s easeOutBack
- **blueprint**：512px三设备蓝图；13.0s旋转90°/0.25s，13.6s吸附/0.12s；弹簧180/22
- **construction**：14.6/14.9/15.2s起，每台1.0s；线框0.4s、扫描0.4s、角标0.2s
- **conveyor**：64px/段，0.12s/段铺设；18.5s起80px/s，物料间隔0.5s
- **production**：25.5–31.0s，2.0s/轮；第三轮停75%；32.1s起飞行0.4s/枚，间隔0.15s
- **upgrade**：39.6–40.4s填经验；40.4–40.8s等级20→21；40.8–42.0s属性滚动
- **share**：50.0–50.4s条带展开；51.6s复制，53.0s确认，53.2–53.6s收起
- **outro**：56.6–59.0s镜头1→0.86；57.4s字标；59.4–60.0s淡黑

## 制作约束

- 界面复刻自游戏，未使用游戏美术素材。
- 版式、交互、动效、配色、字体风格照真实游戏；不复制游戏角色立绘、官方图标、官方字体文件，也不截取游戏画面使用。
- 设备、地形、图标全部SVG/Canvas自绘；人物用剪影；字体为Google Fonts上的OFL字体。
- 60秒场景时序、设备数量、尺寸和数值来自本案例设计规格，没有将这些参数标为原游戏动效的测量值。
- 本地参考视频、抽帧与联系表仅供样式核对，不纳入仓库。

## 迁移

- `config.js → tokens / brand / fontSizes`：全案色值、五段彩条、横竖字号与Google Fonts配置。
- `config.js → machines / blueprint`：已有设施、三设备蓝图、512px总长、64px网格、建造时刻与产线顺序。
- `config.js → markers / scenes / score`：60秒场景、十个标记与合成声音事件。

[打开 Demo](../../demos/cases/industrial-protocol/index.html) · [在库中查看](../../cases.html#case/industrial-protocol)
