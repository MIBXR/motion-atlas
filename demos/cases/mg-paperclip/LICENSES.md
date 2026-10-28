# 许可与出处

原作《贴纸科普 · How Many Elements Hide in a Phone?》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/19-paperclip/`。代码、提示词、文档与成片采用 MIT 许可，许可原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `AlibabaPuHuiTi-3-105-Heavy.ttf`，Version 3.01 | [阿里官方完整归档](https://fonts.alibabadesign.com/AlibabaPuHuiTi-3.zip) | [阿里巴巴普惠体 3.0 法律声明原文](fonts/AlibabaPuHuiTi-LICENSE.md) |
| `AlibabaPuHuiTi-3-65-Medium.ttf`，Version 3.01 | [阿里官方完整归档](https://fonts.alibabadesign.com/AlibabaPuHuiTi-3.zip) | [阿里巴巴普惠体 3.0 法律声明原文](fonts/AlibabaPuHuiTi-LICENSE.md) |
| `AlibabaPuHuiTi-3-85-Bold.ttf`，Version 3.01 | [阿里官方完整归档](https://fonts.alibabadesign.com/AlibabaPuHuiTi-3.zip) | [阿里巴巴普惠体 3.0 法律声明原文](fonts/AlibabaPuHuiTi-LICENSE.md) |
| `Inter[opsz,wght].ttf`，Version 4.001;git-66647c0bb | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/0b58fb370093f9a9f4ff785d94405710b79de67c/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/Inter-OFL.txt) |

阿里官方字体入口为 [fonts.alibabagroup.com](https://fonts.alibabagroup.com/)，完整归档取其中的 Medium 500、Bold 700、Heavy 900；法律声明取官网链接的[官方原文](https://www.yuque.com/yiguang-wkqc2/hgpff0/nus9wiinq4aeiegy/markdown?attachment=true)。

## 固定版本库

| 包与版本 | npm registry 原始 tarball | 实际文件与许可 |
| --- | --- | --- |
| d3 7.9.0 | [d3-7.9.0.tgz](https://registry.npmjs.org/d3/-/d3-7.9.0.tgz) | `vendor/d3@7.9.0/dist/d3.min.js`；ISC，[原文](vendor/d3@7.9.0/LICENSE) |
| topojson-client 3.1.0 | [topojson-client-3.1.0.tgz](https://registry.npmjs.org/topojson-client/-/topojson-client-3.1.0.tgz) | `vendor/topojson-client@3.1.0/dist/topojson-client.min.js`；ISC，[原文](vendor/topojson-client@3.1.0/LICENSE) |

## 照片贴纸与地图

`assets/stickers/` 的七张照片贴纸和尺寸数据、`assets/countries-110m.json` 原样取自固定提交的 `demos/19-paperclip/assets/`。根据原仓库 [README.zh-CN.md 的许可一节](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/README.zh-CN.md#许可)，片中照片采用 CC0 或公有领域许可；贴纸加工脚本与自制图形按原作 MIT 许可发布。世界边界为 [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) 的公有领域数据，按 [world-atlas](https://github.com/topojson/world-atlas) TopoJSON 格式提供。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/19-paperclip.mp4` 以 `ffmpeg -vn -c:a copy` 无损抽取 AAC 音轨，保留原片混音；成片与自制音频采用原作 MIT 许可。配乐生成过程原样保存在 `source/audio.py`，使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）与原作合成器。
