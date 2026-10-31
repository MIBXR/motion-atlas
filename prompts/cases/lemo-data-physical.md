# 两条螺旋 · 数据实物化

## 实现 Prompt

制作“两条螺旋 · 数据实物化”：2014—2025年的太阳能和风电装机量叠成铝片与亚克力片，围绕胡桃木表盘形成两条螺旋，太阳能在2021年反超。每片10 GW、每十片一层黄铜，以同年并列和不同材质建立比较，再由特写拉远露出完整装置。画面：IRENA 2026经Our World in Data整理的装机数据；Poly Haven胡桃木纹与工作室HDRI；片、黄铜标记和表盘由three.js生成。运动：同年两组片错半拍堆叠，2025新增片逐片落下，镜头沿螺旋攀升后吊臂拉远到近俯视。声音：96 BPM原配乐，金属与亚克力落片声、玻璃与钟琴、低铜管重拍、Kokoro af_heart旁白。实现文件为film/film.js、film/set.js、film/data.js、film/timeline.js，保留真实数据、素材署名和原片音轨，按1920×1080舞台的原作render(t)逐帧定位。

## 动效 Token

- **源码时间线**：film/timeline.js的T/HIT/BUILD；段落见rhythm.beats。

## 制作约束

- 素材、数据、字体与时间线由原作文件直接驱动。

## 迁移

- `film/film.js`：修改画面、时间线或对应数据；参数位置见该文件。
- `film/set.js`：修改画面、时间线或对应数据；参数位置见该文件。
- `film/data.js`：修改画面、时间线或对应数据；参数位置见该文件。
- `film/timeline.js`：修改画面、时间线或对应数据；参数位置见该文件。

[打开 Demo](../../demos/cases/lemo-data-physical/index.html) · [在库中查看](../../cases.html#case/lemo-data-physical)
