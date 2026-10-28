# 许可与出处

原作《KONSTRUKTION · 20 Beats（二十拍构成）》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`。代码、提示词、文档和成片按 MIT 许可发布，许可原文见 [LICENSE](LICENSE)。

## 字体

| 字体与字重 | 官方完整文件 | 许可原文 |
| --- | --- | --- |
| Poppins Black，900 | [Google Fonts：Poppins-Black.ttf](https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Black.ttf) | SIL OFL 1.1，[Poppins-OFL.txt](fonts/Poppins-OFL.txt) |
| Poppins SemiBold，600 | [Google Fonts：Poppins-SemiBold.ttf](https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-SemiBold.ttf) | SIL OFL 1.1，[Poppins-OFL.txt](fonts/Poppins-OFL.txt) |
| Noto Sans SC，可变字重 100–900，画面使用 700 | [Noto CJK 官方仓库：NotoSansSC-VF.ttf](https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf) | SIL OFL 1.1，[NotoSansSC-OFL.txt](fonts/NotoSansSC-OFL.txt) |

字体以官方完整原始文件保存，未转换格式。`fonts/fonts.css` 保留原作对应家族的 `@font-face` 声明，仅修改资源 URL。

## 共享纹理

`shared/assets/textures/paper/Paper001_4K_color.jpg` 与 `shared/assets/textures/grain/grain_fine_2048.png` 原样取自上述固定提交的 `assets/textures/`。根据原仓库 [README.zh-CN.md 的许可一节](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/README.zh-CN.md#许可)，第三方纸张纹理按 CC0 或公有领域提供，项目自制文件按 MIT 许可提供。

## 配乐

配乐由原作 `audio.py` 使用 VCSL 乐器采样（CC0）合成，`audio/film.m4a` 从原片 `videos/09-bauhaus.mp4` 无损抽取 AAC 音轨。原片及其自制音频采用上述 MIT 许可。VCSL 官方来源：[Versilian Community Sample Library](https://github.com/sgossner/VCSL)。

本案例没有 vendor 包。
