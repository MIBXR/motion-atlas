# 许可与出处

原作《ISOPOLIS — Let the City Grow（让城市自己生长）》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`。代码、提示词、文档和成片按 MIT 许可发布，许可原文见 [LICENSE](LICENSE)。

## 字体

本作品使用 HarmonyOS Sans SC 字体。

| 字体与字重 | 官方完整文件与版本 | 许可原文 |
| --- | --- | --- |
| HarmonyOS Sans SC，500、700 | [华为官方 HarmonyOS-Sans.zip](https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip)，取 `HarmonyOS_Sans_SC_Medium.ttf`、`HarmonyOS_Sans_SC_Bold.ttf`，字体版本均为 1.0 | HarmonyOS Sans Fonts License Agreement，[HarmonyOS-Sans-LICENSE.txt](fonts/HarmonyOS-Sans-LICENSE.txt) |
| JetBrains Mono，可变字重，画面用 500 | [Google Fonts：JetBrainsMono[wght].ttf](https://raw.githubusercontent.com/google/fonts/6e4b84c976cadb3c49a40fd9a1c203e4f7fcf2da/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf)，字体版本 2.211，提交 `6e4b84c976cadb3c49a40fd9a1c203e4f7fcf2da` | SIL OFL 1.1，[JetBrainsMono-OFL.txt](fonts/JetBrainsMono-OFL.txt) |
| Unbounded，可变字重，画面用 800 | [Google Fonts：Unbounded[wght].ttf](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/unbounded/Unbounded%5Bwght%5D.ttf)，字体版本 1.701，提交 `8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5` | SIL OFL 1.1，[Unbounded-OFL.txt](fonts/Unbounded-OFL.txt) |

完整原始可变字体保存在 `fonts/`，`assets/fonts/Unbounded-800-static.ttf` 由 Unbounded 在 `wght=800` 实例化，命令见 [fidelity.md](fidelity.md)。

## 固定版本库

| 包 | 来源 | 实际文件 | 许可 |
| --- | --- | --- | --- |
| three 0.186.1 | [npm registry 原始 tarball](https://registry.npmjs.org/three/-/three-0.186.1.tgz) | `vendor/three@0.186.1/` 中的模块、几何体、环境、后处理及其导入依赖 | MIT，[原文](vendor/three@0.186.1/LICENSE) |
| opentype.js 2.0.0 | [npm registry 原始 tarball](https://registry.npmjs.org/opentype.js/-/opentype.js-2.0.0.tgz) | `vendor/opentype.js@2.0.0/dist/opentype.mjs` | MIT，[原文](vendor/opentype.js@2.0.0/LICENSE) |

本片的模型、材质和着色器由原作代码生成。

## 配乐

配乐由原作 `source/audio.py` 使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）合成。`audio/film.m4a` 从固定提交的 `videos/03-isometric.mp4` 无损抽取 AAC 音轨，保留原片混音。

```bash
ffmpeg -i ../../sources/mg-styles-15/videos/03-isometric.mp4 -vn -c:a copy demos/cases/mg-isometric/audio/film.m4a
```
