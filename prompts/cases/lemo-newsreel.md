# 膝盖警报 · 1920s 新闻影片

## 实现 Prompt

制作“膝盖警报 · 1920s 新闻影片”：1926年报纸警告查尔斯顿舞会跳坏膝盖，报纸、地图、九张舞步照片、福特舞会档案和1925年唱片组成一期新闻影片。新闻物件与真实档案按200 BPM剪辑，百叶字卡、划变与光圈连接段落，分屏对决后由历史唱片接管声音。画面：NARA福特电影收藏1924—1927年影像、1926年奥斯汀报纸、1925年Photoplay舞步照、1926年Good Morning书页与Natural Earth州界。运动：报纸旋入、点线地图与抵达星标、舞步发牌和翻页、百叶字卡、光圈和时钟划变；恒定24fps档案影像叠加可复现损伤。声音：200 BPM原爵士与老式舞曲分声道对决、1925年Golden Gate Orchestra唱片、放映机和机械拟音、Kokoro混合男声旁白。实现文件为film/index.html，保留真实数据、素材署名和原片音轨，按1920×1080舞台的原作render(t)逐帧定位。

## 动效 Token

- **源码时间线**：film/index.html的SEC/HIT与composeScene；段落见rhythm.beats。

## 制作约束

- 素材、数据、字体与时间线由原作文件直接驱动。

## 迁移

- `film/index.html`：修改画面、时间线或对应数据；参数位置见该文件。

[打开 Demo](../../demos/cases/lemo-newsreel/index.html) · [在库中查看](../../cases.html#case/lemo-newsreel)
