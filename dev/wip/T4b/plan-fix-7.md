$stop-that-shit change -- T4b：seekable-timeline 改为去掉底部 HUD 组；四处修改各出效果截图；本轮不做完整验收。

你停得对。决定如下。

# 决定：seekable-timeline 的底部

- 这个巧思不显示底部 HUD 组（NOW PLAYING 块、歌词、步进器）。plan-fix-5 第 2 节里的 Δ 上移规则作废。
- 保留的层：
  - 顶部 HUD：日序、日期、进度线、指南针、坐标、时钟；
  - kix 卡片与引线；
  - MIKAN 徽章；
  - 署名：在控制条上方，右对齐，间距 g（横 12px / 竖 18px）；
  - 控制条：位置与尺寸不变。
- 声音：去掉原来属于步进器的事件（若有），其余不变。

# 本轮只做这些（不做完整验收）

完整验收要等主任务把另一个分支合并进来（会带来 GPU 声明的检测机制），并完成删减与字号调整之后，统一进行。所以本轮**不要**跑：三轮 smoke、全量 smoke、案例 MP4、capture、全部对照重截。

1. 按上面的决定修改 seekable-timeline。
2. 为四处修改各出效果截图（硬件 GL 可以用 `dev/wip/T4b/tools/hardware-browser.mjs`，仅用于截图），横竖都截，存到 `dev/shots/T4b/fix5-effects/`：
   - route S3：t = 9.0、10.4。记录两站屏幕坐标、标签候选的选择结果。
   - seekable-timeline：t = 0.5、2.3、4.5，确认无重叠（复用你的碰撞检测，全段采样）。
   - day-night-flip：t = 0.5、2.0、3.5、5.0、6.5。对 t = 3.5 与案例 caseT 35.8 做地图区域 MAD。
   - film-grain：t = 3.75、6.25。
3. 自己逐张看。有问题按 plan-fix-5 的规则处理；需要决定时停下。
4. 更新报告与 progress。最终答复列出：
   - 截图路径；
   - route 两站坐标；
   - seek 碰撞检测结果；
   - day-night 的 MAD；
   - 任何问题。

不 commit / push / 切分支。结束时停掉服务器和浏览器。
