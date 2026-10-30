# Ink Press 接入与保真说明

复刻范围为默认 `ink-press` 主题，作品来源与固定版本见[条目 JSON](../../../entries/cases/ink-press.json)。

## 相对原作的删改

| 文件 | 删改内容 | 原因 |
| --- | --- | --- |
| `src/workbench.ts`、`src/themes/manifest.tsx` | 不收录这两个文件，其余 `film/src/` 文件原字节保留。 | 工作台接入清单，与成片无关。 |
| `template/THEMES.md`、`template/themes/ui.cjs`、`template/scripts/build-palette-assets.cjs` | 不收录。 | 其他主题预设的制作工具。 |
| `source/remotion.config.ts` | 添加 `Config.setPublicDir('../assets')`。 | 静态素材路径接入。 |
| `source/package.json`、`source/package-lock.json` | 添加 `@remotion/player@4.0.484` 与 `esbuild@0.28.2`，scripts 使用 `film/src/index.ts` 并提供 build、dev、render、audio。 | 路径改写与浏览器打包。 |

作品、截图、音效与运行库的许可见 [LICENSES.md](LICENSES.md)。

## 适配层

`film/entry.tsx` 导出 `mountInk(el)`，以 React `createRoot`、`flushSync` 和 Remotion `Thumbnail` 按帧渲染 `ThemedFilm` 的 `ink-press` 主题；时长 1085 帧、30fps、1920×1080。定位按 `Math.round(t * 30)` 取整，限制在 0–1084 帧，等待舞台内全部图片 `decode()` 与两次 `requestAnimationFrame` 后完成。

`staticFile` 读取 `window.remotion_staticBase`；挂载前用 `new URL('../assets', import.meta.url).pathname` 设置本条目素材基址并去掉末尾斜线。带 `render` 参数时，适配层设置 `window.process.env.NODE_ENV = 'production'` 与 `window.remotion_puppeteerTimeout = 30000`，使 `getRemotionEnvironment` 返回 `isRendering: true`，发牌场景开头画正式渲染的拉丝金属背景；不带时沿用上游实时预览的纯色替身，与上游 Player / Studio 一致。Thumbnail 内部 `audioEnabled: false`、`initiallyMuted: true`，声音由 MotionKit 音轨播放。

`index.html` 使用 `MotionKit.load.prepare` 预载样式、打包模块、27 张 PNG 与音轨，再以 `MotionKit.mountFilm` 接入横屏舞台、逐帧步进、11 个镜头标记、纸底 `#f2eee6` 与琥珀强调色 `#955905`。音轨来自固定上游工程的 `AiflPromo` AAC 渲染。

`?embed` 隐藏控制条，`?render` 关闭自动播放和声音，`?t=秒` 定位；减少动态时暂停在 35.5 秒。

## 已接受差异

字体使用系统字体，本库与参考渲染在同一台机器上取得一致；跨平台字形不同。

参考视频使用 JPEG 中间帧与 H.264 编码，本库截图为 PNG；文字边缘、阴影与拉丝纹理存在压缩和浏览器栅格化差异，14 帧 SSIM 均达到 0.97。

实时播放不带 `render` 时，发牌镜头开头的金属台面为上游自带的纯色替身；截图、逐帧渲染与预览图使用 `render` 参数，与正式渲染一致。上游 `SceneFlyIn.tsx` 的注释说明，程序渐变平面在 CSS `zoom` 变化时可能来不及栅格化，纯色替身用于实时预览。

## 与原片对照结果

固定提交参考 MP4 按帧号取 PNG，本库在 1920×1080、DPR 1 下使用 `?embed=1&render=1&t=帧号/30` 定位截图；ffmpeg `ssim` 的 All 结果如下。

| 帧号 | 时刻（秒） | SSIM |
| --- | --- | --- |
| 40 | 1.333333 | 0.995401 |
| 150 | 5.000000 | 0.990584 |
| 248 | 8.266667 | 0.996162 |
| 300 | 10.000000 | 0.981846 |
| 330 | 11.000000 | 0.990757 |
| 420 | 14.000000 | 0.992637 |
| 515 | 17.166667 | 0.986803 |
| 592 | 19.733333 | 0.991622 |
| 672 | 22.400000 | 0.987211 |
| 830 | 27.666667 | 0.987128 |
| 912 | 30.400000 | 0.996816 |
| 980 | 32.666667 | 0.990857 |
| 1000 | 33.333333 | 0.990486 |
| 1070 | 35.666667 | 0.986470 |

14 帧全部通过，最低 0.981846，最高 0.996816。上游与本条目 `npm run audio` 生成的 AAC 音轨均为 36.224025 秒，画面为 1085 帧、36.166667 秒。

公开成片为 1280×720、30fps、1085 帧，放大到 1920×1080 与本库同帧并排；14 帧的文案、截图内容、镜头和元素组合一致，差异为：

- 40、330、420、515、592、672、830、1070 帧的等宽字幕、副标与数字字形不同，公开片使用无衬线等宽字形，本机系统回退为带衬线等宽字形。
- 公开片经 720p 编码与放大后，页面小字、阴影、拉丝背景和细线更软，300 帧的金属纹理最明显。

在带 GPU 的浏览器中，不带 `render` 实时播放发牌镜头画面连续。

31–36 秒开启声音后，90 次时间轴帧回调的音轨时刻偏差最大 0.077966 秒；暂停后音轨停止且时刻不变，暂停与播放中的 seek 均跟随目标时刻，1.5 倍速时音轨 `playbackRate` 同为 1.5，偏差 0.056753 秒。结尾 riser、impact、sparkle 分别沿原音轨在 31.5、32.666667、33.5 秒对应画面动作。
