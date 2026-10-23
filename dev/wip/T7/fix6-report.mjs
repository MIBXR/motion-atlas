import fs from 'node:fs';
const qa=JSON.parse(fs.readFileSync('dev/shots/T7/fix6-zz/checks.json','utf8'));
const commands=['archive-os','day-night-flip'].map(id=>`node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --only ${id} --base http://localhost:4325`);
fs.writeFileSync('dev/wip/T7/fix6-env.json',JSON.stringify({commands,cwd:process.cwd(),node:process.execPath,NODE_OPTIONS:process.env.NODE_OPTIONS??null,BROWSER_PATH:process.env.BROWSER_PATH??null,browser:qa.browser,renderer:qa.renderer},null,2));
const old=fs.readFileSync('dev/reports/T7.md','utf8'),perf=old.slice(old.indexOf('## 保留的性能优化证据'));
const fmt=r=>`(${r.x.toFixed(3)}, ${r.y.toFixed(3)}) ${r.w.toFixed(3)}×${r.h.toFixed(3)}`;
const intersection=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return{x,y,w:Math.min(a.x+a.w,b.x+b.w)-x,h:Math.min(a.y+a.h,b.y+b.h)-y}};
const names={'machine-plant':'种植机','machine-furnace':'精炼炉','machine-power':'供电桩','machine-b':'配件机B'};
const checks=qa.checks.find(c=>c.t===7).zz;
const pairs=checks.flatMap(z=>z.names.map(n=>({zz:names[z.id],rect:z.rect,name:names[n.id],nameRect:n.rect,intersection:intersection(z.rect,n.rect)})));
const table=pairs.map(p=>`| ${p.zz} / ${p.name} | ${fmt(p.rect)} | ${fmt(p.nameRect)} | ${fmt(p.intersection)} |`).join('\n');
fs.writeFileSync('dev/reports/T7.md',`# T7 终末地 · 集成工业协议

当前状态：smoke/capture的GPU后备探针已按授权修改，archive-os与day-night-flip各一次smoke均通过。竖屏Zz按设施中心(+28,-36)、字号0.8倍实施后，S1/S2仍存在名牌相交并跨出自身设施右边框，已按“若仍相交，停下报告实测矩形”停止。T7三次smoke、MP4、capture及构建未执行，尚未完成交付。

工作树.worktrees/endfield，分支feat/endfield-protocol；没有暂存、提交、推送或切分支。scripts只修改smoke.mjs与capture.mjs的GPU后备探针。服务仅使用4325。

## 探针改动与两项专项回归

页面及同源iframe中已有WebGL Canvas时，保留现有读取方式。没有找到时创建未挂入DOM的1×1 HTML Canvas，取得webgl上下文，读取WEBGL_debug_renderer_info.UNMASKED_RENDERER_WEBGL；finally释放WEBGL_lose_context并调用canvas.remove()。四个软件渲染判定关键词swiftshader、llvmpipe、software、microsoft basic render保持不变。没有改启动参数、计时阈值或字体检查。

实际回归命令：

~~~sh
${commands.join('\n')}
~~~

NODE_OPTIONS与BROWSER_PATH均未设置。PowerShell末尾仅使用输出重定向保存日志。环境见[fix6-env.json](../wip/T7/fix6-env.json)。

| 条目 | 结果 | 范围 | 日志 |
| --- | --- | --- | --- |
| archive-os | 退出0，smoke 1/1 passed | 横竖0–77.6秒seek及播放检查通过；字号按条目参考豁免 | [日志](../wip/T7/fix6-archive-os-smoke.log) |
| day-night-flip | 退出0，smoke 1/1 passed | 横竖0–7秒seek及播放检查通过；最小字号24/36px | [日志](../wip/T7/fix6-day-night-flip-smoke.log) |

两项的横竖smoke均打印硬件renderer：

~~~text
${qa.renderer}
~~~

以上验证了既有GPU条目的路径没有回归；T7原命令及capture的后备分支尚未完成命令级验收，不能用这两项替代。

## 竖屏Zz实测与停止原因

CSS为left:calc(50% + 28px)、top:calc(50% - 36px)，实测字号33.6px（42×0.8）。横屏(+8,-28)规则不变。已重截并逐张查看S1 4.5/7/9.7秒及S2 10.5/12/16/17/20/23.7秒共9张，页面异常0。

下表为7秒、1080×1920舞台、镜头scale=1的实测矩形，格式为(左,顶) 宽×高，单位px。Zz矩形合并父元素与错位小写z；相交名牌使用其实际DOM矩形。

| Zz / 相交名牌 | Zz矩形 | 名牌矩形 | 交集矩形 |
| --- | --- | --- | --- |
${table}

当前定位下，绝对定位元素的自动宽度使Z/z分行，合并矩形高度约67.188px。没有自行增加定宽、禁止换行或挪动名牌。即使仅查看上方Z字，种植机/精炼炉名牌与配件机B/供电桩名牌的遮挡仍可从截图直接看到。

| 7秒设施 | 设施框 | Zz矩形 | 状态 |
| --- | --- | --- | --- |
${checks.map(z=>`| ${names[z.id]||z.id} | ${fmt(z.facility)} | ${fmt(z.rect)} | ${z.ownFrameCrossing?'Zz超出自身设施框':'在框内'} |`).join('\n')}

其他设施矩形相交数为0；精炼炉、种植机、配件机B的Zz横跨自身右边框，供电桩Zz位于框外。种植机保持待机，S2末仍与精炼炉名牌相交。未自行放宽验收条件或再次改动给定坐标。

原始每时刻数据：[checks.json](../shots/T7/fix6-zz/checks.json)。

| 截图 |
| --- |
${qa.screenshots.map(f=>`| [${f.split('/').at(-1)}](../shots/T7/fix6-zz/${f.split('/').at(-1)}) |`).join('\n')}

## 验收状态

| 项目 | 当前结果 |
| --- | --- |
| 两项既有GPU条目复测 | 各1次通过，硬件renderer已打印 |
| T7原命令smoke第1/2/3次 | 均未执行：先触发Zz相交即停条件 |
| 两段60秒/30fps带音轨MP4 | 未重渲，未ffprobe与解码抽6帧 |
| capture | 未执行 |
| build / check / build:site | 未执行；不以旧结果替代本轮 |

dev/shots/T7/render/industrial-protocol-landscape.mp4和industrial-protocol-portrait.mp4仍为更早版本，未覆盖，不作为本轮交付。最新源码所需的成片规格尚未验证。派生catalog/agent数据尚未build同步renderer声明。

继续交付前需要主任务解决Zz给定位置与名牌/边框的冲突。本轮结束于用户明确的相交停止条件。

以下保留性能优化快照证据，测于软件环境且早于本轮Zz位置；不能冒充当前GPU性能或新位置的一致性验收。

${perf}`);
let doc=fs.readFileSync('docs/research/industrial-protocol.md','utf8').replace('竖屏偏移(-40,+10)，字号33.6px','竖屏相对设施中心偏移(+28,-36)，字号33.6px');
doc=doc.slice(0,doc.indexOf('## 验证记录'))+`## 验证记录

| 检查 | 当前状态与证据 |
| --- | --- |
| 性能优化 | 保留静态层缓存、DOM去重和无逐帧布局读取。软件环境的性能快照同步render平均1.658→0.584ms；不冒充GPU复测。 |
| GPU探针 | smoke/capture在无已有WebGL Canvas时创建1×1离屏Canvas读取真实renderer，并释放上下文、移除Canvas。四个软件判定关键词不变。 |
| 既有GPU条目复测 | archive-os、day-night-flip各一次smoke通过；横竖均打印Intel Iris Xe/D3D11硬件renderer。日志位于dev/wip/T7/fix6-*-smoke.log。 |
| 竖屏Zz | 9张S1/S2截图逐张查看。中心(+28,-36)、33.6px已落实，但种植机/精炼炉名牌与配件机B/供电桩名牌仍相交，部分标记跨自身设施右边框。矩形见dev/shots/T7/fix6-zz/checks.json及报告。 |
| T7 smoke | 因Zz相交触发用户停止条件，三次均未执行，不复用旧结果。 |
| 预览、构建、成片 | capture、build/check/build:site、最新横竖60秒/30fps带音轨MP4、ffprobe及6帧解码均未执行；旧MP4不作为本轮交付。 |
| 音谱 | 音谱未改，已有WAV60秒/48kHz/2ch、99事件、峰值−3.2352dBFS、削波0证据有效；不替代新MP4音轨验证。 |

完整报告、实测矩形、命令和截图索引见本地dev/reports/T7.md。
`;
fs.writeFileSync('docs/research/industrial-protocol.md',doc);
fs.appendFileSync('dev/wip/T7/progress.md','\n- 2026-10-23：中心(+28,-36)的竖屏Zz完成9张S1/S2重截并逐张查看；种植机/精炼炉名牌与配件机B/供电桩名牌仍相交，部分Zz跨自身设施右边框。按用户明确条件停止，T7三次smoke、MP4、capture与构建均未执行；两项既有GPU回归已通过，报告含双方与交集实测矩形。\n');
console.log(table);
console.log(checks.map(z=>({id:z.id,rect:z.rect,facility:z.facility})));
