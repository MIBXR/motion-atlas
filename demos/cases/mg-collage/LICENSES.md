# 许可与出处

原作《拼贴剪贴 · NOGGIN Quarterly》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/06-collage/`。代码、提示词、文档与成片采用 MIT 许可，原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `AlimamaShuHeiTi-Bold.ttf`，Version 1.005;beta | [官方完整文件或归档](https://fonts.alibabadesign.com/AlimamaShuHeiTi/AlimamaShuHeiTi-Bold.zip) | [阿里妈妈数黑体法律声明 原文](fonts/AlimamaShuHeiTi-LICENSE.txt) |
| `Anton-Regular.ttf`，Version 2.116; ttfautohint (v1.8.3) | [官方完整文件或归档](https://raw.githubusercontent.com/google/fonts/9862abc066c9b83bf84c3e8ed1fc2d8d48f9bbf0/ofl/anton/Anton-Regular.ttf) | [SIL OFL 1.1 原文](fonts/Anton-OFL.txt) |
| `BebasNeue-Regular.ttf`，Version 2.000 | [官方完整文件或归档](https://raw.githubusercontent.com/google/fonts/9862abc066c9b83bf84c3e8ed1fc2d8d48f9bbf0/ofl/bebasneue/BebasNeue-Regular.ttf) | [SIL OFL 1.1 原文](fonts/BebasNeue-OFL.txt) |
| `IBMPlexMono-Medium.ttf`，Version 2.3 | [官方完整文件或归档](https://raw.githubusercontent.com/google/fonts/9862abc066c9b83bf84c3e8ed1fc2d8d48f9bbf0/ofl/ibmplexmono/IBMPlexMono-Medium.ttf) | [SIL OFL 1.1 原文](fonts/IBMPlexMono-OFL.txt) |
| `NotoSansSC-VF.ttf`，Version 2.004;hotconv 1.0.118;makeotfexe 2.5.65603 | [官方完整文件或归档](https://raw.githubusercontent.com/notofonts/noto-cjk/f8d157532fbfaeda587e826d4cd5b21a49186f7c/Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf) | [SIL OFL 1.1 原文](fonts/NotoSansSC-OFL.txt) |
| `NotoSerifSC-VF.ttf`，Version 2.003;hotconv 1.1.1;makeotfexe 2.6.0 | [官方完整文件或归档](https://raw.githubusercontent.com/notofonts/noto-cjk/f8d157532fbfaeda587e826d4cd5b21a49186f7c/Serif/Variable/TTF/Subset/NotoSerifSC-VF.ttf) | [SIL OFL 1.1 原文](fonts/NotoSerifSC-OFL.txt) |

字体声明取自原作 `assets/fonts/fonts.css`，仅保留实际使用的家族与字重并改写 URL。

## 共享素材

- `assets/textures/grain/grain_film35_2048.png`、`dust/dust_01_3840x2160.png`、`dust/dust_03_3840x2160.png`、`washi/washi_solid_12.png`、`washi/washi_solid_14.png` 原样取自[固定提交的共享纹理](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/assets/textures/)，原作 MIT 许可。
- `assets/gen/p_face.png`、`p_jaw.png`、`p_lid.png`：原作脚本 `source/work/prep.py` 从 `cdv_man_standing_petit` 老照片制作；`space_wedge.png` 与 `earth.png` 从 NASA 太空影像制作；`bird_hawk.png`、`rose_*.png`、`bfly_*.png`、`manicule.png` 从 Audubon、Redouté、蝴蝶图谱与手指版画制作。素材来自[固定提交的原作成品](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/demos/06-collage/assets/gen/)，原照片与版画按[原作 README 的素材许可说明](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/README.zh-CN.md#许可)为 CC0 或公有领域，原作剪贴加工采用 MIT。
- `assets/gen/news_a.png`、`news_b.png` 来自 1854 年 New-York Daily Tribune 公有领域报纸；`page_kraft.jpg` 和 `page_red.jpg` 由原作脚本读取 ambientCG [Paper006](https://ambientcg.com/view?id=Paper006)、[Paper001](https://ambientcg.com/view?id=Paper001) 与程序化油墨制作，纸纹采用 [CC0](https://docs.ambientcg.com/license/)。`rocket.png`、`flame0.png`、`flame1.png` 与 `layout.json` 由同一原作脚本生成，MIT 许可。
- `source/assets/sfx/` 保存原作 `audio.py` 使用的 `scissors.wav`、`pages.wav`、`tape.wav`、`crumple.wav`、`clear.wav`、`cough.wav`；该脚本将这些 Foley 标注为 Wikimedia Commons 公有领域录音。

本案例没有 vendor 包。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/06-collage.mp4` 以 `ffmpeg -vn -c:a copy` 无损抽取 AAC 音轨，保留原片混音；成片与原作自制音频采用 MIT 许可。配乐生成脚本原样保存在 `source/audio.py`，使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）与原作合成器。
