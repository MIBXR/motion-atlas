# 逃跑的面包 · 1920s 默片

## 实现 Prompt

制作《逃跑的面包 · 1920s 默片》这样的代码影片：面包店学徒追着滚下坡的面包，连锁事故把瓜弹到警察头上；面包最终停在饥饿女孩脚边，学徒将它掰成两半，光圈收在女孩的眨眼上。固定远景让因果喜剧完整发生；追逐和温情分别使用不同抽帧、放映闪烁和老化强度，字幕卡与光圈承担叙事标点。Canvas2D灰调人物与布景经原作WebGL2墨线重绘、银盐胶片后处理和灰尘划痕，投在4:3幕门与剧院帘布中。Old Standard TT常规/斜体/粗体、Playfair Display可变常规/斜体、Playfair Display SC 700/900；居中的默片插入字卡。动作按16fps抽样，追逐按18fps；胶片闪烁、颗粒和片门漂移按24fps更新，温情段推到儿童视线高度。原片无旁白，立式钢琴与手风琴作簧风琴，配合放映机电机、启动与片尾甩片声。实现使用demos\cases\lemo-silent-film\film\film.js, demos\cases\lemo-silent-film\film\timeline.js, demos\cases\lemo-silent-film\film\shots.js, demos\cases\lemo-silent-film\film\cardspecs.js。

## 动效 Token

- **分段质感**：film/film.js:LOOK/renderFilm；fps16/18、crank1/1.35/1.3；ta=floor(t×fps)/fps，frame=floor(t×24)。
- **光圈与字卡**：film/film.js:irisAt；film/engine/cards.js:intertitle/iris；film/cardspecs.js保存插入字卡文案。

## 制作约束

- 画面由上游render(t)直接绘制，按原作帧率定位。
- 修改字幕或场景文案后按source中的字体流程重建相同字重和字符子集。
- 声音使用原片混音，修改事件时同步更新声音制作文件。

## 迁移

- `film/film.js`：按原作数据与函数修改故事内容、画面和物件。
- `film/timeline.js`：按原作数据与函数修改时间表、镜头和节拍。

[打开 Demo](../../demos/cases/lemo-silent-film/index.html) · [在库中查看](../../cases.html#case/lemo-silent-film)
