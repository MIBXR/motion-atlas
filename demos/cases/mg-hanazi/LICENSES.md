# 许可与出处

原作《综艺花字 · 喵呜日记 EP.07》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/18-hanazi/`。代码、提示词、文档与成片采用 MIT 许可，原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `AlimamaShuHeiTi-Bold.ttf`，Version 1.005;beta | [官方完整文件或归档](https://fonts.alibabadesign.com/AlimamaShuHeiTi/AlimamaShuHeiTi-Bold.zip) | [阿里妈妈数黑体法律声明 原文](fonts/AlimamaShuHeiTi-LICENSE.txt) |
| `DouyinSansBold.ttf`，Version 1.01 | [官方完整文件或归档](https://raw.githubusercontent.com/bytedance/fonts/327565b61501d7a6d4902ed6ce417a7bd2ae54e6/DouyinSans/DouyinSansBold.ttf) | [SIL OFL 1.1 原文](fonts/DouyinSans-OFL.txt) |
| `LXGWMarkerGothic-Regular.ttf`，Version 1.004 | [官方完整文件或归档](https://github.com/lxgw/LxgwMarkerGothic/releases/download/v1.004/LxgwMarkerGothic-v1.004.zip) | [SIL OFL 1.1 原文](fonts/LXGWMarkerGothic-OFL.txt) |
| `LuckiestGuy-Regular.ttf`，Version 1.001 | [官方完整文件或归档](https://raw.githubusercontent.com/google/fonts/9862abc066c9b83bf84c3e8ed1fc2d8d48f9bbf0/apache/luckiestguy/LuckiestGuy-Regular.ttf) | [Apache 2.0 原文](fonts/LuckiestGuy-LICENSE.txt) |
| `ResourceHanRoundedCN-Heavy.ttf`，0.990 | [官方完整文件或归档](https://github.com/CyanoHao/Resource-Han-Rounded/releases/download/v0.990/RHR-CN-0.990.7z) | [SIL OFL 1.1 原文](fonts/ResourceHanRounded-OFL.txt) |
| `ZCOOLKuaiLe-Regular.ttf`，Version 2.001 | [官方完整文件或归档](https://raw.githubusercontent.com/google/fonts/9862abc066c9b83bf84c3e8ed1fc2d8d48f9bbf0/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf) | [SIL OFL 1.1 原文](fonts/ZCOOLKuaiLe-OFL.txt) |

字体声明取自原作 `assets/fonts/fonts.css`，仅保留实际使用的家族与字重并改写 URL。

## 共享素材

- `assets/white_dof.jpg`、`grey_r2.jpg`、`tux_r1.jpg`、`white_ear*.png` 与 `hero_*.png` 原样取自[固定提交的猫咪画面](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/demos/18-hanazi/assets/)，制作脚本保存在 `source/assets/`。原照片按[原作 README 的素材许可说明](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/README.zh-CN.md#许可)为 CC0 或公有领域，景深、耳朵替换帧、抠图与炸毛加工采用原作 MIT 许可。
- `assets/textures/grain/grain_fine_2048.png`：[固定提交中的程序化颗粒](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/assets/textures/grain/grain_fine_2048.png)，原作 MIT 许可。

本案例没有 vendor 包。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/18-hanazi.mp4` 以 `ffmpeg -vn -c:a copy` 无损抽取 AAC 音轨，保留原片混音；成片与原作自制音频采用 MIT 许可。配乐生成脚本原样保存在 `source/audio.py`，使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）与原作合成器。
