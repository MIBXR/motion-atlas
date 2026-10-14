# 水墨长卷展台 · 手卷式浏览 · 复用 Prompt

由 [结构化条目](../../entries/cases/ink-scroll.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/ink-scroll.md)。

## 实现 Prompt

做一个水墨长卷展台（HTML/CSS/JS + SVG，可 seek）：暗色展室中一幅宽为视口 3.2 倍的米色宣纸手卷（分形噪声纹理），两端木轴。①展开：右轴固定，左轴 2.1s outCubic 向左滑开，纸面用 clip-path 在两轴之间显露；②墨层：远/中/近三层程序化山水（值噪声山脊 + 同一墨色不同透明度的竖向渐变 + 沿山脊的皴笔描边；近层加松树、中层加小舟与飞鸟），视差系数 .35/.6/1.0；每层依次（间隔 0.8s）晕开：径向遮罩从画面中右部外推 + feTurbulence/feDisplacementMap 位移 70→0 + 模糊 6→0（滤镜只在晕开时启用，区域限定为可见窗口）；两条雾带视差 .8/1.1 并缓慢自漂；③题诗：竖排楷体两列自上而下遮罩显现（每列 1.1s），落款与小朱印随后；④平移：镜头自右向左 5.2s inOutCubic；⑤盖章：卷尾朱印 260ms outBack 从 1.35 落到 1、−6°→−2°，红色扩散环与纸面微震；⑥之后可拖动/滚轮/方向键/点击缩略图浏览，镜头临界阻尼跟随。声音默认关闭；减少动态关闭扰动与震动。

## 视频生成 Prompt

A traditional Chinese ink landscape handscroll unrolling in a dim gallery, 1920×1080, 14 seconds. Cream rice paper with subtle texture between two wooden rollers; the left roller glides left to reveal the painting from right to left. Mountain layers appear one by one as if ink were bleeding into wet paper — far pale peaks, mid-ground ridges with a tiny boat and flying birds, then dark near hills with pine trees — with soft horizontal mist bands. A vertical poem in brush calligraphy reveals from top to bottom with a small red seal. The camera slowly pans right-to-left along the scroll with gentle parallax between the layers. At the end a red square seal stamp presses down with a small bounce and a faint red ripple. Calm, elegant, contemplative; monochrome ink with one red accent.

## 负向约束

不要彩色山水与渐变天空；不要从左往右展开或平移；不要无衬线字体；不要快速闪烁与弹跳（盖章除外）；不要使用受版权保护的名画。

## 动效 Token

- **unroll**：2.1s outCubic，自右向左
- **bleed**：每层 1.6s outCubic：遮罩外推 + 湍流位移 70→0 + 模糊 6→0；层间 0.8s
- **brush-text**：每列 1.1s，遮罩自上而下，轻微模糊 1.2→0
- **pan**：5.2s inOutCubic；视差 .35 / .6 / 1.0；雾 .8 / 1.1
- **stamp**：260ms outBack 1.35→1、−6°→−2°；扩散环 0.8s；微震 6px·e^(−14t)
- **browse**：用户浏览用临界阻尼跟随（速率 7）

## 制作约束

- 原创设计语言：山水为程序化生成；王维《终南别业》为公有领域。
- 超宽元素的 SVG 滤镜会被浏览器截断，Demo 只在晕开期间启用滤镜并把区域限制在可见窗口。

## 迁移

- `config.js → span / layers`：长卷宽度倍数；每层的视差、墨色浓度、山高、峰数、晕开时刻与随机种子。
- `config.js → poem / seal`：竖排题诗（建议使用公有领域或自有文本）、落款、印章文字。
- `config.js → timing`：展开、题诗、平移起止与盖章时刻。
- `config.js → palette`：纸色、墨色、印泥色、雾色。
- `换成真实画作`：把各层 SVG 换成分层切好的透明 PNG/WebP（远中近），保持视差与晕开机制。

[打开 Demo](../../demos/cases/ink-scroll/index.html) · [在库中查看](../../cases.html#case/ink-scroll)
