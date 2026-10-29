# 逐张重画：线条沸腾与换纸

## 实现 Prompt

复用来源案例的原作 window.renderAt(t)，按 index.html 内联配置 的 segments 重放0–10秒，全长12.701秒。保留24fps的SCHED曝光表，在一拍一、一拍二和一拍三之间切换；静态形体以D.id%4循环线稿，三帧曝光以D.id%3循环。沿用boil的amp=2.4、scale=70与z=seed*2.371+0.5；纸齿按同一绘制编号从470×310范围取偏移，以multiply、alpha=0.5合成；尘点以v%4轮换、alpha=0.22叠加并翻转。沿用原画面、字体、纸纹和同区间成品音轨，保持1920×1080、24fps，声音默认关闭。 按 index.html 内联 segments 在原有 10 秒之后重放mg-hanazi 原片 1.3–1.834 秒；mg-hanazi 原片 5.8–7.967 秒，总时长 12.701 秒。综艺片按帧号替换照片贴图边缘，以耳朵四帧扭动和三张炸毛轮换形成动作。画面与音轨沿用同一映射，声音默认关闭。

## 参数

- **曝光表**：SCHED=[[0,8,2],[8,24,1],[24,48,2],[48,60,1],[60,108,2],[108,120,3],[120,132,2],[132,168,1],[168,224,2],[224,230,1],[230,240,3]]；24fps。
- **线稿变体**：bv=(D)=>(D.step===3?D.id%3:D.id%4)；boil(pts,seed,amp=2.4,scale=70)；z=seed*2.371+0.5。
- **纸齿换位**：ox=floor(hs(v,51)*470)；oy=floor(hs(v,52)*310)；globalCompositeOperation=multiply；globalAlpha=0.5。
- **尘点轮换**：IMG.dust[v%4]；globalAlpha=0.22；按v%2、v%3翻转。
- **重放时长**：原片0–10秒，巧思总时长12.701秒。
- **追加原片区间**：mg-hanazi 原片 1.3–1.834 秒；mg-hanazi 原片 5.8–7.967 秒；['e11', 'e16', 'e11', 'e6'][ef]
const pick = fm >= 0 && fm < 2 ? 'hL135' : (fm >= 2 && fm < 4) || (fd >= 2 && fd < 4) ? 'hL12' : fd < 2 ? 'hL06' : 'hB' + (Math.floor(tt * 12) % 3);

## 迁移

- `index.html 内联配置 → segments`：设置重放原片的起止时刻，画面与音轨使用同一映射。
- `index.html 内联配置 → markers / reduced`：设置巧思相对时间轴的中文节点与减少动态时刻。

[打开 Demo](../../demos/patterns/cel-line-boil/index.html) · [在库中查看](../../patterns.html#pattern/cel-line-boil)
