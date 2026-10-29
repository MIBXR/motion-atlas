# 许可与出处

原作《极光与玻璃拟态 · Aurora — Think in Light》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/12-aurora-glass/`。代码、提示词、文档与成片采用 MIT 许可，许可原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `HarmonyOS_Sans_SC_Light.ttf`，Version 1.0 | [华为官方完整归档](https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip) | [HarmonyOS Sans Fonts License Agreement 原文](fonts/HarmonyOS-Sans-LICENSE.txt) |
| `Inter[opsz,wght].ttf`，Version 4.001;git-66647c0bb | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/0b58fb370093f9a9f4ff785d94405710b79de67c/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/Inter-OFL.txt) |
| `Sora[wght].ttf`，Version 2.000 | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/a926665019d3f7f25c8b1212cecbfa871e70de82/ofl/sora/Sora%5Bwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/Sora-OFL.txt) |

## 共享贴图与运行数据

`assets/textures/grain/grain_fine_2048.png` 原样取自上述固定提交的共享贴图，是原作程序化颗粒，按 MIT 许可提供。`film/out/env.json` 是原作 `source/audio.py` 生成的音量包络，按原作 MIT 许可提供。

本案例没有 vendor 包。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/12-aurora-glass.mp4` 以 `ffmpeg -vn -c:a copy` 无损抽取 AAC 音轨，保留原片混音；成片与自制音频采用原作 MIT 许可。配乐生成过程原样保存在 `source/audio.py`，使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）与原作合成器。
