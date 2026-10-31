# 咖啡杯追逐战 · 1930s 橡皮管卡通

## 实现 Prompt

制作一支1930s 橡皮管卡通时间线影片。苦咖啡杯追赶逃跑的方糖，跨过烤面包机和盘子阶梯，在水槽漩涡边伸长手臂救回方糖；善意让方糖自己跳进杯中，全厨房随爵士乐起舞。物件身体、无关节橡皮管四肢和逐拍呼吸；标题、布景、道具、动作与乐队共同表演。画面构成：暖灰阶与墨黑；角色白比布景更亮，4:3片门居中于16:9画幅。；Shrikhand胖体标题、Limelight副标、IM Fell English SC字幕字卡。；1920×1080输出、1440×1080圆角片门；剧场机位让表情与目的地可见。；Canvas2D角色骨架、缓存水彩布景、胶片划痕与投影抖动。；角色12fps、相机24fps；追拍、伸臂、起跳压扁和全场同步呼吸。；原片热爵士乐队、VSCO/VCSL和MuldjordKit采样、收音机质感旁白及材料拟音。；144BPM，脚步与盘子即乐器；救援后两拍静默，只留放映机声。；片头卡是卷帘，片尾虹膜能被手套抓住，影片本身成为道具。。实现入口为demos/cases/lemo-rubber-hose/film/，MotionKit适配层仅调用并等待原作render(t)，使用原片音轨同步播放。

## 动效 Token

- **卷帘**：film/scenes.js:shotTitle：K.roll=[bar(3,4),bar(4)]；lift=eio×1180，底沿绘制58px卷轴。
- **逐拍呼吸**：film/story.js:q / breath：floor(t×12)/12，cos(beats(q(t))×2π)。
- **起跳与落地**：film/scenes.js:shotLeaving：crouch / hop / launch / plop阶段联动sx、sy；12fps角色采样。

## 制作约束

- 角色四肢保持等宽管状，描边维持屏幕像素宽度。
- 角色用q(t)，相机用连续t。
- 片门内保留伸臂与跳跃轨迹。

## 迁移

- `film/scenes.js:shotTitle`：修改该处的卷帘参数。
- `film/story.js:q / breath`：修改该处的逐拍呼吸参数。
- `film/scenes.js:shotLeaving`：修改该处的起跳与落地参数。

[打开 Demo](../../demos/cases/lemo-rubber-hose/index.html) · [在库中查看](../../cases.html#case/lemo-rubber-hose)
