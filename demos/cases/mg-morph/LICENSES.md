# 许可与出处

原作《形状变形 · morphe. — One Shape, Every Story》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/08-morph/`。代码、提示词、文档与成片采用 MIT 许可，许可原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `HarmonyOS_Sans_SC_Medium.ttf`，Version 1.0 | [华为官方完整归档](https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip) | [HarmonyOS Sans Fonts License Agreement 原文](fonts/HarmonyOS-Sans-LICENSE.txt) |
| `IBMPlexMono-Medium.ttf`，Version 2.3 | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/01d5d9f05246fb7090a8403b81257535cb1a088b/ofl/ibmplexmono/IBMPlexMono-Medium.ttf) | [SIL OFL 1.1 原文](fonts/IBMPlexMono-OFL.txt) |
| `Outfit-SemiBold.ttf`，Version 1.100;gftools[0.9.27] | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/outfit/Outfit%5Bwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/Outfit-OFL.txt) |
| `Outfit[wght].ttf`，Version 1.100;gftools[0.9.27] | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/outfit/Outfit%5Bwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/Outfit-OFL.txt) |

`Outfit-SemiBold.ttf` 由完整可变字体在 `wght=600` 实例化；命令见 [fidelity.md](fidelity.md)。`film/glyphs.json` 的字形轮廓由原作 `source/tools/glyphs.py` 从 Outfit 提取，沿用 Outfit 的 SIL OFL 1.1。

## 共享贴图

`assets/textures/paper/Paper001_4K_color.jpg` 原样取自上述固定提交的共享贴图；源纹理为 [ambientCG Paper001](https://ambientcg.com/view?id=Paper001)，采用 [CC0](https://docs.ambientcg.com/license/)。

本案例没有 vendor 包。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/08-morph.mp4` 以 `ffmpeg -vn -c:a copy` 无损抽取 AAC 音轨，保留原片混音；成片与自制音频采用原作 MIT 许可。配乐生成过程原样保存在 `source/audio.py`，使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）与原作合成器。
