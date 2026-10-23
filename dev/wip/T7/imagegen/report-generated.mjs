import fs from 'node:fs';
const file='dev/reports/T7.md',old=fs.readFileSync(file,'utf8'),records=JSON.parse(fs.readFileSync('dev/wip/T7/imagegen/selected-generations.json','utf8'));
const section=`# T7 终末地 · 集成工业协议

当前生图升级状态：15种原创素材已有选定原生版本，已保存到demos/cases/industrial-protocol/assets/gen/。尚未接入页面，未把代码绘制版验收结果作为生图版通过。精确尺寸/格式归一化、人物呼吸缩放幅度和背包格位映射等待用户答复。

## 生图素材

工具为内置image_gen.imagegen。默认原图保存于C:/Users/mibxr/.codex/generated_images/01a166b2-12c7-75b0-ad08-94bf09822c6a/，选定原图已复制到案例assets/gen/。没有向生图工具提供任何现有游戏角色、logo、图标或截图作为参考；提示词使用用户给定文本，仅追加尺寸、透明通道及俯视几何等技术约束。

逐张用途、完整提示词、尺寸、生成工具和重生成记录：[SOURCES.md](../../demos/cases/industrial-protocol/assets/gen/SOURCES.md)。素材检查总览：[assets-review.png](../shots/T7/imagegen/assets-review.png)。

| 当前文件 | 实际尺寸 | 最终目标 | 重生成次数 |
| --- | --- | --- | ---: |
${records.map(r=>`| ${r.file} | ${r.size.width}×${r.size.height} | ${r.target} ${r.requested.join('×')} | ${r.attempt-1} |`).join('\n')}

原生方形图实际均为1254×1254，提示中的512/128/2048像素尺寸未被工具采用。operator.png原生1024×1536符合目标。14张透明素材均为RGBA且存在alpha=0区域；地面为不透明RGB。当前ground.png尚未转换成ground.webp，其他方形图尚未缩放至最终尺寸。没有改用其他生成途径。

重生成：core初版为四向桁架，第1次重生成改正为三角形；pylon初版及第1次重生成仍为斜视，第2次重生成改正为正交俯视。其他素材未重生成。人物未见多余肢体或文字乱码；地面2×2重复预览未见明显接缝：[平铺检查](../shots/T7/imagegen/ground-repeat-check.png)。

替换前截图已经保存：

| 场景 | 横屏替换前 | 竖屏替换前 |
| --- | --- | --- |
${['S1','S3','S4'].map(s=>`| ${s} | [截图](../shots/T7/imagegen/before/landscape-${s}.png) | [截图](../shots/T7/imagegen/before/portrait-${s}.png) |`).join('\n')}

替换后截图及前后拼图未生成，因为页面尚未接入。人物矩形基线为横屏(720,150)520×820，竖屏(202.734,330)394.516×900；记录在before/boxes.json。

待答复的三项：

1. 是否允许FFmpeg仅做目标尺寸缩放和PNG/WebP格式转换，保留画面内容及透明通道。
2. 4秒周期、±1°倾斜之外，呼吸缩放是否采用1.00±0.01。
3. 背包六种素材是否按已提出的12格映射使用，数量与输入输出逻辑不变。

本轮生图版的smoke、MP4重渲、ffprobe/解码、capture、build/check/build:site均尚未执行。以下保留的是基线65578a0代码绘制版的验收记录，不代表位图升级已通过。

## 代码绘制版基线验收

`;
fs.writeFileSync(file,section+old.replace(/^# T7[^\n]*\n+/,'').replace(/^交付状态：本轮验收完成。/,'基线交付状态：代码绘制版验收完成。'));
console.log('Image-generation status and sources recorded; integration remains pending.');
