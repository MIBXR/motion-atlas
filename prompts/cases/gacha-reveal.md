# 抽卡揭示舞台 · 期待与释放 · 复用 Prompt

由 [结构化条目](../../entries/cases/gacha-reveal.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/gacha-reveal.md)。

## 实现 Prompt

做一个“十连抽卡”揭示舞台（HTML/CSS/JS + Canvas，可 seek）：深靛蓝星空背景；稀有度三色 蓝 #4aa8ff / 紫 #b06bff / 金 #ffcf4a。节拍：①按下（0.6s）后 160 个固定种子粒子螺旋内收，角速度随进度加速、半径收缩到 10%，中心光球（双环反向旋转 + 发光核心）随蓄力放大，低频上滑音；②2.1s 预示色：粒子与光球染成最高稀有度色（若为金，先给紫色），弱闪白；③2.55s 升格（仅金）：紫变金、光球抖动并再放大、中闪白；④2.9s 爆发：强闪白、椭圆冲击波、粒子 outExpo 径向飞散；⑤3.2s 十张卡背面朝上从中心旋转放大飞入 5×2 网格（500ms，错峰 70ms，卡背描边为稀有度色）；⑥4.1s 起按位置逐张 rotateY 翻面（450ms outBack，错峰 120ms），翻开后一道斜向流光扫过；⑦金卡最后翻、额外停 0.7s，翻面前竖直光柱升起，翻开后外发光与放大脉冲；⑧7s 显示统计与“再来一次”。提供跳过按钮；结果写在配置中；声音默认关闭；减少动态关闭闪白。

## 视频生成 Prompt

Mobile-game style ten-pull summon reveal, 1920×1080, 9 seconds. Deep indigo starry sky. Glowing particles spiral inward faster and faster toward a pulsing orb with two counter-rotating rings. The orb turns purple — a fake-out — then cracks, shakes and upgrades to gold with a bright flash. A white burst and an elliptical shockwave blow the particles outward. Ten face-down cards with glowing rarity-colored edges spin out from the center into a 5×2 grid, then flip one by one with a slight overshoot and a diagonal light sheen sweeping across each face (blue, purple cards with simple white glyphs). The last card waits an extra beat as a golden light pillar rises, then flips to reveal a gold crown card with a pulsing glow. Satisfying anticipation-and-release rhythm.

## 负向约束

不要一次性同时翻开所有卡；不要省略预示与停顿（会失去期待感）；不要使用真实游戏角色与美术；不要用随机结果制造虚假概率暗示。

## 动效 Token

- **charge**：1.5–2.3s inCubic；粒子角速度随进度 ×4，半径 ×0.1
- **tell**：弱闪白 0.35·e^(−10t)
- **upgrade**：中闪白 0.7·e^(−9t) + 光球抖动 ±4px、放大 0.25
- **burst**：强闪白 e^(−5t)；冲击波 0.8s；粒子 outExpo 1.2s
- **fly**：500ms outCubic，错峰 70ms，旋转 −25°→0，缩放 0.2→1
- **flip**：450ms outBack rotateY 0→180°（最大 194°）；流光 600ms，延迟 300ms
- **gold-pause**：额外 0.7s；光柱提前 0.45s 升起

## 制作约束

- 原创设计语言：卡牌名称与图形原创，无任何游戏素材。
- Demo 结果固定写在 config.js，不涉及真实概率；正式产品需按法规公示概率。

## 迁移

- `config.js → results`：十张卡的稀有度、名称、图形；最高稀有度自动决定预示色与是否升格。
- `config.js → rarityColors`：各稀有度的颜色（贯穿粒子、光球、描边、光柱）。
- `config.js → timing`：蓄力、预示、升格、爆发、飞入、翻牌、金卡停顿、结果的时刻。
- `script.js → GLYPH / GRAD`：卡面图形与渐变；可替换为真实卡面图片。

[打开 Demo](../../demos/cases/gacha-reveal/index.html) · [在库中查看](../../cases.html#case/gacha-reveal)
