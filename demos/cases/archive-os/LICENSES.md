# RhineLabUI 许可、署名与免责声明

本案例移植自 [LBEILC / RhineLabUI](https://github.com/LBEILC/RhineLabUI)，上游提交 `12cc5e4`。

本案例为 RhineLabUI 的移植，属非官方作品；《明日方舟》及莱茵生命相关名称、标志、设定、原片与原片音频采样的权利归各自权利人所有。

## 上游 MIT 许可

MIT License

Copyright (c) 2026 LBEILC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## PR #15 署名

### PR #15 Web optimization extraction

Source: https://github.com/LBEILC/RhineLabUI/pull/15 at `257e939a43460332c836498529de003eb54dbe26`.

Original visuals, scenes, models, animations and original ambient audio: **LBEILC / RhineLabUI**.
PR contributor: **PacificSauryMan**. DSH adaptation, performance optimizations and PR preparation assisted by **OpenAI Codex**, as credited in the original PR.

This extraction adapts only the tested B rendering optimizations into the original Web scene. Source code retains the repository MIT license. No DSH host, installer, native patcher, theme lifecycle, project/session state or publishing workflow is included. Quality presets and model bytes remain unchanged.

Adapted areas: frame-local waveform memoization, coalesced uncaptured hover picking, removal of unused AO depth attachments, visible draw coverage with independent offscreen shadow coverage, shadow reuse, and exactly-zero/settled waveform shortcuts. The original AO kernel and blur remain unchanged. Regression checks are in `scripts/check-pr15-port.mjs` and `scripts/check-pr15-rendering.mjs`.

Measured on RTX 5070 Ti Laptop / ANGLE D3D11, 1920x1080 / DPR 1, original quality (32 AO samples, full-resolution AO, 2048 shadows, DOF 100): three rounds per idle/navigation scene, each with 3s warm-up and approximately 10s sampling. Aggregate RAF FPS is total sample frames / total elapsed time: idle A 4538/30.0010 = 151.26, B 4733/30.0012 = 157.76; navigation A 4446/30.0008 = 148.20, B 4408/30.0064 = 146.90. Idle improved modestly; navigation showed no stable benefit. The invalid occluded initial run was excluded. All six fixed A/B scene PNGs were byte-identical; this does not establish full-time or cross-device equivalence.

The final production cleanup also invalidates the shadow cache on WebGL context restoration. Review-only benchmark injection is excluded from the commit and production bundle. This extraction is independent of the original PR #15, which remains open and unchanged. No deployment configuration is changed.

## MiSans

字体使用 [MiSans 许可全文（PDF）](app/fonts/MiSans-license.pdf)，并保留 [NOTICE.txt](app/fonts/NOTICE.txt)。下列声明原文来自上游 `public/fonts/NOTICE.txt`。

```text
MiSans by Xiaomi / 小米科技有限责任公司
Copyright © 2020-2025 Beijing Xiaomi Mobile Software Co.,Ltd. All Rights Reserved.

Official source: https://hyperos.mi.com/font/download
Archive: https://hyperos.mi.com/font-download/MiSans.zip
The application now uses third-party split webfonts from misans-webfont@4.3.1
(font Version 4.003), distributed with this application for on-demand loading.
Font shards are copied byte-for-byte from that package. CSS family names,
weight mappings and URLs are adapted for the existing interface.
Upstream copyright: Copyright © 2020-2023 Beijing Xiaomi Mobile Software Co.,Ltd. All Rights Reserved.
Upstream project: https://github.com/mobeicanyue/misans-webfont
Package source, integrity and file hashes: misans-webfont-4.3.1/source.json
Upstream README: misans-webfont-4.3.1/UPSTREAM-README.md
Font license: MiSans-license.pdf (retained separately from upstream tooling license).
```

## Rolling Number

下列许可原文来自上游 `public/licenses/rolling-number.txt`；运行时副本见 [rolling-number.txt](app/licenses/rolling-number.txt)。

MIT License

Copyright (c) 2026 Kit Langton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 音频来源与权利

下列说明原文来自上游 `public/audio/README.md`；运行时副本见 [audio/README.md](app/audio/README.md)。

### Observatory / 观测室

三个 Ogg 文件为本项目原创程序编配的同步循环声部，MP3 是带首尾淡变的独立试听版。配乐无原片采样、无外部录音、无人声。

源谱及合成：`scripts/render-audio.mjs`；音效合成：`src/audio.ts`。
生成数据：`score.json`。随项目采用仓库 LICENSE。

#### 逐字输入短音

`typing-preview.wav` 及 `src/typing-samples.ts` 使用用户提供的《明日方舟》特别映像 [莱茵生命：访问] 中约 6.864–6.986 秒的三个短音，各 38ms。`typing-source.json` 保留精确时间、源文件校验与处理参数。原音及其衍生片段的权利归原作者，不纳入上文原创配乐的 MIT 授权声明。

提取脚本：`scripts/extract-typing-audio.mjs`。原片短音仅去直流、做边缘淡变和统一增益，没有变调、变速或合成替换。`reference/typing-original.wav` 为本地对照片段，不属于生产配乐。

## 上游 README 第三方权利说明

以下两段原文来自上游 `README.md` 的“开源许可”一节：

- **《明日方舟》相关内容**：包括《明日方舟》及莱茵生命相关名称、标志、设定、原 PV、原作视觉设计、原片音频采样及其衍生片段，以及这些内容在模型、界面、截图或演示文本中的呈现。相关权利归各自权利人所有，本项目无法代替他们授权。
- **其他第三方资源**：MiSans、Novecento、Rolling Number 及其他第三方字体、依赖或素材继续遵循各自的许可证和版权声明，不因本项目的许可范围扩大而改变；独立许可资源也不会因此成为可自由分发的资源。
