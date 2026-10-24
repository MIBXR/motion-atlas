import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=f=>{const b=fs.readFileSync(f);return b[0]===255&&b[1]===254?b.subarray(2).toString('utf16le'):b.toString('utf8').replace(/^\uFEFF/,'')};
const json=f=>JSON.parse(read(f)),logs='dev/wip/T7/imagegen',shots='dev/shots/T7/imagegen';
const qa=json(`${shots}/qa.json`),normalized=json(`${logs}/normalized.json`),selected=json(`${logs}/selected-generations.json`),media=json(`${shots}/render/final-media.json`);
const exit=name=>Number(read(`${logs}/${name}.exit`).trim()),smoke=[1,2,3].map(n=>({n,exit:exit(`smoke-${n}`)}));
const errors=read(`${logs}/check.log`).split(/\r?\n/).filter(s=>s.startsWith('- ')),other=errors.filter(s=>!s.includes('字号'));
if(smoke.some(s=>s.exit)||exit('capture')||exit('build')||exit('build-site')||other.length||(!errors.length&&exit('check')))throw new Error('Validation incomplete');
const command='node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --only industrial-protocol --base http://localhost:4325';
const renderer=read(`${logs}/smoke-1.log`).match(/landscape WebGL (.+?) \|/)[1];
fs.writeFileSync(`${logs}/environment.json`,JSON.stringify({command,node:process.execPath,NODE_OPTIONS:process.env.NODE_OPTIONS??null,BROWSER_PATH:process.env.BROWSER_PATH??null,renderer,smoke},null,2));
const use={ground:'静态地面',core:'协议核心',refinery:'精炼炉',assembler:'配件机A/B',crusher:'粉碎机',storage:'仓储箱',planter:'种植机',pylon:'供电桩',operator:'S4中央人物','item-crystal':'晶体/输入','item-part':'配件/输出','item-canister':'罐','item-module':'模块','item-ore':'矿石','item-plate':'合金板'};
const basename=f=>f.replace(/\\/g,'/').split('/').at(-1),rel=f=>f.replace(/^dev\//,'../');
const assetRows=normalized.assets.map(a=>`| ${basename(a.output)} | ${use[a.name]} | ${a.final.width}×${a.final.height} | ${a.final.codec_name} | ${a.name==='ground'?'不透明':`alpha ${a.alpha.min}–${a.alpha.max}`} | ${selected.find(r=>r.name===a.name).attempt-1} |`).join('\n');
const movieRows=media.videos.map(m=>{const v=m.streams.find(s=>s.codec_type==='video'),a=m.streams.find(s=>s.codec_type==='audio');return`| ${m.orient} | ${v.width}×${v.height} | ${m.format.duration}s | ${v.r_frame_rate} / ${v.nb_frames}帧 | ${v.codec_name} / ${a.codec_name} ${a.sample_rate}Hz ${a.channels}ch | ${(Number(m.format.size)/1048576).toFixed(2)} MiB | [文件](${rel(m.file)}) |`}).join('\n');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim(),head=git('rev-parse','HEAD'),tracked=git('diff','--name-only','HEAD').split('\n').filter(Boolean),untracked=git('ls-files','--others','--exclude-standard').split('\n').filter(Boolean);
fs.writeFileSync('dev/reports/T7-files.txt',`Branch: feat/endfield-protocol\nBaseline: ${head}\nNo staging, commit, push or branch switch.\nIgnored evidence: dev/shots/T7/imagegen/\n\nTRACKED MODIFIED (${tracked.length})\n${tracked.join('\n')}\n\nUNTRACKED (${untracked.length})\n${untracked.join('\n')}\n`);
const reps=[['S0',2],['S1',7],['S2',17],['S3',29],['S4',42],['S5',52],['S6',58]].map(([s,t])=>`| ${s} ${t}s | [横屏](../shots/T7/imagegen/after/landscape-${s}-${t.toFixed(3)}.png) | [竖屏](../shots/T7/imagegen/after/portrait-${s}-${t.toFixed(3)}.png) |`).join('\n');
fs.writeFileSync('dev/reports/T7.md',`# T7 终末地 · 集成工业协议

当前交付状态：生图位图升级完成。15张原创素材已按目标尺寸接入；横竖全场景截图与人物呼吸峰值已查看，三组前后对照图完成；原命令smoke连续3次通过；两段全长MP4、ffprobe及每段6帧解码查看完成；capture、build、build:site通过。check退出1，全部${errors.length}项为用户允许的旧24/36px字号下限错误，非字号错误${other.length}。

工作树.worktrees/endfield，分支feat/endfield-protocol，基线${head}。本轮没有暂存、提交、推送或切分支；服务器仅使用4325。脚本目录本轮未修改；复用已批准的GPU探针与临时GPU渲染入口。

## 生图素材

生成工具为内置image_gen.imagegen，未使用外部生成途径。原生输出保存在C:/Users/mibxr/.codex/generated_images/01a166b2-12c7-75b0-ad08-94bf09822c6a/。没有将游戏角色、logo、图标或截图作为生成输入；三段官方视频来源仅用于既有界面观察，不用于生成位图。

最终素材目录：demos/cases/industrial-protocol/assets/gen/。完整逐张用途、提示词（含每次技术参数和全部重生成提示词）、工具、原生及最终尺寸、原始文件路径见[SOURCES.md](../../demos/cases/industrial-protocol/assets/gen/SOURCES.md)。

| 文件 | 用途 | 最终尺寸 | 格式 | 透明度 | 重生成次数 |
| --- | --- | --- | --- | --- | ---: |
${assetRows}

素材合计${normalized.assets.reduce((s,a)=>s+a.bytes,0).toLocaleString('en-US')}字节。方形原生输出1254×1254，人物原生1024×1536。依用户明确授权，FFmpeg只做Lanczos缩放与PNG/WebP格式转换；没有裁切、补绘或改色。地面为无损WebP，解码像素与缩放输入相同；人物解码像素与原图相同。14张PNG均含完全透明区域，人物alpha最大254是原图特征，保持不变。证据：[normalized.json](../wip/T7/imagegen/normalized.json)。

重生成记录：

- core：初版白色桁架为四向结构；重生成1次后为三角桁架，选用第2次生成。
- pylon：初版及第1次重生成仍偏斜视；第2次重生成得到严格俯视投影，选用第3次生成。
- 其余13种素材重生成0次。未见需要继续重生成的多余肢体、文字乱码或明显结构缺陷；地面2×2预览未见明显硬接缝。

所有18次生成原图保留，最终项目只引用15张选定素材。没有超过单张最多3次重生成的限制。最终规格总览：[assets-review.png](../shots/T7/imagegen/assets-review.png)。

## 接入与保持的约束

| 部分 | 当前实现 |
| --- | --- |
| 地面 | ground.webp通过Canvas pattern进入原静态缓存层；只在初始/画幅切换绘制。网格、建造区黄黑边框、边界外压暗及镜头整体变换保留。 |
| 设施 | 8台实体使用7种PNG，按原矩形铺放。黄色角标、方向标、蓝绿状态灯、名牌、横屏Zz、旋转环、容量条、电弧等代码叠层保留；炉口呼吸保留，粉碎机对辊以透明SVG叠层反向旋转。 |
| 蓝图 | 虚影继续使用原SVG线框，image/img数量为0；蓝图纸保持原图解风格。 |
| 人物 | 中央人物替换为原创工程师。外框横(720,150)520×820、竖(202.734,330)394.516×900与替换前一致。等比底部对齐；横屏复用基线可见人物顶部17px留白。背景淡剪影和头像保留。 |
| 呼吸 | 内部图像4秒周期，缩放1±0.01、倾斜±1°；外框不参与变换。37秒=1.01/+1°，39秒=.99/−1°。横屏41/41.2秒呼吸峰值与提示条保持间隔。 |
| 背包 | 12格依次晶体、模块、配件、罐、配件、矿石、罐、模块、矿石、合金板、晶体、合金板。全部数量、稀有度和第3格配件标记保留；输入晶体、输出/收取飞行配件保持对应。 |
| 图片矩形 | 背包横屏64×64、竖屏112×112；输入输出54×54，配方42×42，飞行40×40，均采用原图标矩形。 |
| 预加载 | 15张图片全经MotionKit.preload解码并入缓存，ready之后再启动。两画幅记录均为15张完整图片、8台实体位图、0张虚影位图；页面errors/warnings为0。 |
| 时间线与声音 | 60秒场景、10个标记、资源/生产/收取/升级数值、光标路径、按钮时刻、99事件合成音谱保持；只有获批的人物呼吸替换原局部摆动。 |

预加载、人物矩形/呼吸、物品矩形数据：[qa.json](../shots/T7/imagegen/qa.json)。临时图片拟合调整未改S4外框坐标或UI；素材本身没有再编辑或重生成。

## 前后对照与图像检查

| 场景 | 同时刻横屏前后对照 |
| --- | --- |
| S1 7s | [S1-before-after.png](../shots/T7/imagegen/compare/S1-before-after.png) |
| S3 29s | [S3-before-after.png](../shots/T7/imagegen/compare/S3-before-after.png) |
| S4 42s | [S4-before-after.png](../shots/T7/imagegen/compare/S4-before-after.png) |

替换前原图位于dev/shots/T7/imagegen/before/；替换后48张PNG位于after/，覆盖横竖S0–S6的开始/中点/结束附近、29秒对照点及41/41.2秒呼吸峰值。48张均已查看；主体透明边缘、人物头/手/脚、背包图标未见本次接入引起的明显缺陷。S5半透明详情栏的底图透出属于保留的基线构图，未因位图升级改动。

| 场景代表 | 横屏 | 竖屏 |
| --- | --- | --- |
${reps}

## smoke

三次原命令完全相同：

~~~sh
${command}
~~~

实际node入口${process.execPath}。NODE_OPTIONS=${process.env.NODE_OPTIONS??'null'}，BROWSER_PATH=${process.env.BROWSER_PATH??'null'}；没有附加参数或环境变量。PowerShell仅用重定向保存日志。

| 次数 | 退出码 | 结果 | 日志 |
| --- | ---: | --- | --- |
${smoke.map(s=>`| ${s.n} | ${s.exit} | smoke 1/1 passed；横竖seek、播放、画幅检查通过 | [日志](../wip/T7/imagegen/smoke-${s.n}.log) |`).join('\n')}

三次两画幅均打印硬件renderer：

~~~text
${renderer}
~~~

每次只有2项旧字号警告，未计为失败。详细输出保留，不把警告写为全零。

## 生图版MP4与声音

| 画幅 | 分辨率 | 时长 | 帧率/帧数 | 编码与音轨 | 大小 | 文件 |
| --- | --- | --- | --- | --- | ---: | --- |
${movieRows}

ffprobe确认视频流、音轨和容器均为60.000000秒。每段解码2、15.5、29、42、52、58秒共6帧，合计12帧逐张查看，未见破损、重复分块或新增透明边缘异常。证据：[final-media.json](../shots/T7/imagegen/render/final-media.json)，解码PNG在同目录decoded-final/。

两份WAV为60秒/48kHz/2ch/16bit、99事件；PCM峰值${media.videos[0].wav.peakDb.toFixed(3)}dBFS，削波0，满足≤−1dBFS。音谱未修改。视频使用现有render脚本、JPEG92中间帧、H.264 CRF18/yuv420p与AAC192k；临时GPU导入复用既有D3D11启动参数。

~~~sh
node --import ./dev/wip/T4a/tools/direct-browser.mjs --import ./dev/wip/T7/render-gpu.mjs scripts/render.mjs demos/cases/industrial-protocol/index.html --port 4325 --orient landscape --fps 30 --from 0 --to 60 --format jpeg --audio --out dev/shots/T7/imagegen/render/industrial-protocol-landscape
node --import ./dev/wip/T4a/tools/direct-browser.mjs --import ./dev/wip/T7/render-gpu.mjs scripts/render.mjs demos/cases/industrial-protocol/index.html --port 4325 --orient portrait --fps 30 --from 0 --to 60 --format jpeg --audio --out dev/shots/T7/imagegen/render/industrial-protocol-portrait
~~~

日志：[横屏](../wip/T7/imagegen/render-landscape.log)、[竖屏](../wip/T7/imagegen/render-portrait.log)。生图版在imagegen/render/；原dev/shots/T7/render/保留代码绘制版，不混用规格或证据。

## 预览、构建与交付边界

| 项目 | 实际命令 | 结果 |
| --- | --- | --- |
| capture | node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/capture.mjs --only industrial-protocol --base http://localhost:4325 | 退出${exit('capture')}，captured 1/1，横竖预览已刷新；[日志](../wip/T7/imagegen/capture.log) |
| build | npm.cmd run build | 退出${exit('build')}，9 cases / 38 patterns；[日志](../wip/T7/imagegen/build.log) |
| check | npm.cmd run check | 退出${exit('check')}，${errors.length}项旧字号下限错误，非字号${other.length}；[完整清单](../wip/T7/imagegen/check.log) |
| build:site | npm.cmd run build:site | 退出${exit('build-site')}，static site ready · dist/；[日志](../wip/T7/imagegen/build-site.log) |

字号使用既定设计阶梯，没有为通过旧检查修改字号或check脚本。MotionKit副本与kit源文件一致。构图、坐标、时序及交互保持在批准范围内；本轮没有未解决的非字号验收失败。图像判断覆盖列出的场景截图与12张解码帧，不冒称人工逐帧审看全部3600帧。

改动文件清单：[T7-files.txt](T7-files.txt)。基线${head}；没有暂存、提交、推送或切分支。本轮变更包括源码/parts、15张素材及SOURCES、研究文档、条目与派生资料、双预览、报告与本地验证工具；dev/shots/T7的证据和影片不纳入Git。
`);
fs.writeFileSync(`${logs}/environment.json`,JSON.stringify({command,NODE_OPTIONS:process.env.NODE_OPTIONS??null,BROWSER_PATH:process.env.BROWSER_PATH??null,renderer,smoke},null,2));
console.log(JSON.stringify({assets:normalized.assets.length,screenshots:qa.screenshots.length,smoke,fontErrors:errors.length,nonFont:other.length,videos:media.videos.map(m=>({file:m.file,bytes:m.format.size})),tracked:tracked.length,untracked:untracked.length},null,2));
