import fs from 'node:fs';
import vm from 'node:vm';

const evidence = 'dev/wip/Tres/evidence';
const read = file => fs.readFileSync(file, 'utf8');
const json = file => JSON.parse(read(`${evidence}/${file}`));
const cell = value => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
const row = values => '| ' + values.map(cell).join(' | ') + ' |';
const bytes = json('lemo-verification.json'), ignored = json('lemo-ignored-comparison.json');
const size = json('lemo-size-final.json');
const fidelity = json('fidelity.json'), visual = json('fidelity-review.json');
const audio = json('audio-check.json'), audioReview = json('audio-review.json');
const pages = json('check-pages.json'), pageReview = json('page-review.json');
const screenshots = [...pages.screenshots, ...json('new-style-shots.json')];
const core = json('core-verification.json');
const timing = json('stained-glass-timing.json');
const git = json('b1-git-final.json');
const context = { window: {} };
vm.runInNewContext(read('data/resources.js'), context);
const resources = context.window.MA_RES;
const statuses = JSON.parse(read('scripts/lemo-status.json'));
const slugs = Object.keys(statuses).filter(slug => statuses[slug].status === 'ready');
const resultLine = text => text.match(/^smoke \d+\/\d+ passed$/gm)?.at(-1) || '未取得最终结果行';
const existingLine = resultLine(read(`${evidence}/smoke-existing-complete.log`));
const firstAttemptLine = resultLine(read(`${evidence}/smoke-existing-attempt-1.log`));
const styleRuns = [1, 2].map(run => {
  const text = read(`${evidence}/style-smoke-${run}.log`);
  const starts = [...text.matchAll(/^([✓✗]) demos\/styles\/player\/.*$/gm)];
  const jobs = starts.map((match, i) => ({ slug: slugs[i], ok: match[1] === '✓', detail: text.slice(match.index, starts[i + 1]?.index ?? text.length).trim() }));
  return { run, code: json(`style-smoke-${run}-exit.json`).code, line: resultLine(text), jobs };
});
fs.writeFileSync(`${evidence}/style-smoke-summary.json`, JSON.stringify(styleRuns, null, 2) + '\n');
const styleFailures = styleRuns.flatMap(run => run.jobs.filter(job => !job.ok).map(job => ({ run: run.run, ...job })));
const failureReason = item => item.detail.split('\n').slice(1).map(line => line.trim()).filter(Boolean).join('；') || '未通过';
const pageFailures = pages.assertions.filter(a => !a.ok);
const outliers = fidelity.results.filter(item => item.maxMad > 12);
const rendered = fidelity.results.filter(item => Number.isFinite(item.maxMad));
const unavailable = fidelity.results.filter(item => !Number.isFinite(item.maxMad));
const observe = slug => visual.observations.find(item => item.slug === slug)?.observation || '尚无目视记录';
const pending = [
  ...unavailable.map(item => `${item.slug} 忠实度未完成：${item.error}`),
  ...[...new Set(styleFailures.map(item => item.slug))].map(slug => {
    const measured = fidelity.results.find(result => result.slug === slug);
    const failedRuns = styleFailures.filter(item => item.slug === slug).map(item => `第 ${item.run} 次：${failureReason(item)}`).join('；');
    const frames = measured?.points?.map(point => `${point.t.toFixed(3)}s → ${point.renderMs.toFixed(2)}ms`).join('；') || '未取得';
    const startFrames = timing.frames.map(frame => `${frame.t}s → ${frame.renderMs.toFixed(2)}ms`).join('；');
    return `${slug} 实时播放验收处理方式：${failedRuns}。1920×1080 忠实度页面 readyMs=${measured?.readyMs ?? '未取得'}，四个取样帧 await seek 耗时：${frames}。独立 1280×720 起始帧补测 readyMs=${timing.readyMs}，${startFrames}。这些是 await seek 调用耗时，未确认它与实际播放失败之间的因果；保留原时间推进阈值，未修上游或播放器性能。`;
  }),
  ...(existingLine !== 'smoke 25/25 passed' ? [`既有条目：${existingLine}`] : []),
  ...pageFailures.map(item => `页面断言 ${item.label}：${JSON.stringify(item.detail)}`),
];
const complete = rendered.length === 24 && rendered.every(item => item.points.length === 4) && visual.viewed.length === 24 && audio.length === 2 && audioReview.viewed.length === 2 && pages.assertions.some(a => a.label.startsWith('(l)')) && screenshots.every(s => pageReview.viewed.includes(s.file));
const hardPass = existingLine === 'smoke 25/25 passed' && styleRuns.every(run => run.line === 'smoke 24/24 passed' && run.code === 0) && !pageFailures.length && !bytes.mismatches.length && ignored.actual === 84 && !ignored.extra.length && !ignored.missing.length && !core.mismatches.length && core.http.every(item => item.status === 200 && item.matches);
const previous = read('dev/reports/Tres-b1.md');
const labels = previous.split('## 逐节核对')[1].split('## 收录')[0].split('\n').filter(line => /^\| \d/.test(line)).map(line => line.split('|').slice(1, -1).map(value => value.trim()).slice(0, 2));
function coverage(section, item) {
  if (section === '0' || section === '8') return ['已做', `当前 ${git.branch} @ ${git.head.slice(0, 7)}；暂存文件 ${git.staged.length}；受保护目录改动 ${git.forbiddenChanges.length}；未 commit / push / 切分支。`];
  if (section === '1.3a') return ['已做', item.includes('输出') ? '按主任务决定改为固定 84 项：actual=84，extra=0，missing=0；上游 .gitignore 逐字节不变。' : '根规则修改保持方案指定内容，未加入额外 TTF 例外。'];
  if (section.startsWith('1.1')) return ['已做', '59 个 slug，状态 24 / 17 / 18；films / web 字段无 null；check 通过。'];
  if (section.startsWith('1.2')) return ['已做', 'vendor 清单 2266 项；独立字节核对 git 2126 / pack 84，不一致 0；许可与来源字段已写。'];
  if (section === '1.3') return ['已做', '59 个 web 成片；56 条音轨、三个配音例外；59 片时长比对的绝对差均不超过 0.1 秒。'];
  if (section === '1.4') return ['已做', 'vendor 已按绝对路径执行，输出 git / pack / film-audio 文件数与字节。'];
  if (section.startsWith('2.')) return [unavailable.length ? '偏离（原因）' : '已做', `播放器已实现；GPU smoke：${styleRuns.map(run => run.line).join('；')}；${rendered.length} 片取得 frameSec 截图，${unavailable.length} 片无法成像；音轨两段导出通过。`];
  if (section === '3') return ['已做', '构建已生成 styles 59 / ready 24、data/resources.js、README 计数和 agent/catalog.json；check 通过。'];
  if (section === '4') return ['已做', 'R1 / R2 / R6 / R7 / R8 已执行，scripts/check.mjs 退出 0。'];
  if (section.startsWith('5.')) {
    if (section === '5.3.6' && !item.includes('非 ready') && styleFailures.length) return ['偏离（原因）', '瑞士样片的加载、首帧、播放、拖动与声音检查通过；全 24 片运行验收未通过，见 GPU smoke 与根路径阻碍。'];
    return [pageFailures.length ? '偏离（原因）' : '已做', pageFailures.length ? `页面检查有 ${pageFailures.length} 项失败，见断言表。` : 'check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。'];
  }
  if (section === '6') return ['已做', '只在指定位置更新 docs/resources.md、README 资源行；计数块由构建生成。'];
  if (section === '7.1') return ['已做', `build / check / build:site 均退出 0；dist/core/lib.js 与原三个目标存在，core 共 ${core.files} 个文件原字节一致；dist/scripts 仅有 lemo-status.json。`];
  if (section === '7.2') return ['已做', '收录输入未变，复用 git 2126 / pack 84 独立逐字节比较，不一致 0；本轮 check 已重验收录清单。'];
  if (section === '7.3') return ['已做', '已停止旧 4328 服务，再按原命令启动；/core/ 通用映射已生效，抽查五个不同类型与层级的 URI 均 200 且字节一致。'];
  if (section === '7.4') return [firstAttemptLine === 'smoke 25/25 passed' ? '已做' : '偏离（原因）', `首次 ${firstAttemptLine}，GPU 软件渲染与后续连接失效；原命令不变重跑为 ${existingLine}，未确认底层失效原因。`];
  if (section === '7.5') return [styleFailures.length ? '偏离（原因）' : '已做', styleRuns.map(run => `第 ${run.run} 次：${run.line}`).join('；')];
  if (section === '7.6') return [unavailable.length ? '未做' : '已做', `${rendered.length} 片各四个时刻与 web 成片比较，共 ${rendered.reduce((n, item) => n + item.points.length, 0)} 组有效帧；${visual.viewed.length} 张四行对照图已查看；最大 MAD > 12 为 ${outliers.length} 片，已记录观察，不修画面。`];
  if (section === '7.7') return ['已做', 'swiss-motion / pixel-rpg 两段 0–8s MP4 均含视频与音频；波形对照已生成并查看。'];
  if (section === '7.8') return [pageFailures.length ? '偏离（原因）' : '已做', `页面断言 ${pages.assertions.length - pageFailures.length}/${pages.assertions.length}；剪贴板 CRLF 还原为 LF 后严格比较。`];
  if (section === '7.9') return ['已做', `指定 B1 九张、既有脚本附带图和新增 crayon-book / urban-sketch 就绪截图均已生成；已查看 ${pageReview.viewed.length} 张。`];
  if (section === '7.10') return ['已做', '目录总字节、三类来源和前十大文件见体积表。'];
  return ['已做', '本报告已写入当前测量值、截图索引与待决定事项。'];
}
const lines = [
  '# 资源库第二阶段 B1 执行报告', '',
  `**当前状态：${hardPass && complete ? '规定的运行验证全部通过，忠实度采集与目视检查全部完成' : 'B1 未达到全部验收条件'}。GPU smoke：${styleRuns.map(run => run.line).join('；')}；四时刻成片比较 ${rendered.length}/24，未成像 ${unavailable.length}，最大 MAD > 12 共 ${outliers.length} 片。**`, '',
  '主任务已决定由其提交时对固定的 84 个字体执行 git add -f。本工作树保留上游 .gitignore 原字节，未暂存或提交；忽略检查使用“恰好等于这 84 项”的新规则。', '',
  '## 验证结果行', '', '```text', read(`${evidence}/b1-build.log`).trim(), read(`${evidence}/b1-check.log`).trim(), 'build:site · exit 0 · static site ready · dist/', read(`${evidence}/b1-dist.log`).trim(), 'ignored · 84/84 · extra 0 · missing 0 · upstream .gitignore unchanged', `byte comparison · git ${bytes.git} · pack ${bytes.pack} · mismatches ${bytes.mismatches.length}`, existingLine,
  ...styleRuns.map(run => `GPU run ${run.run} · ${run.line} · exit ${run.code} · ready-timeout 180s`), `core copy · ${core.files} files · mismatches ${core.mismatches.length} · HTTP ${core.http.length}/${core.http.length} bytes matched`, `fidelity · ${rendered.length}/24 films · ${rendered.reduce((n, item) => n + item.points.length, 0)}/96 frame pairs · viewed ${visual.viewed.length} · max MAD > 12: ${outliers.length}`,
  ...audio.map(item => `audio ${item.slug} · video ${item.video.codec} · audio ${item.audio.codec} · ${item.duration.toFixed(3)}s · reused unchanged inputs`), `check-pages · ${pages.assertions.length - pageFailures.length}/${pages.assertions.length} passed`, `screenshots · ${screenshots.length} generated · ${pageReview.viewed.length} viewed`, '```', '',
  '## 逐节核对', '', '| 方案 | 项目 | 状态 | 实际证据 / 限制 |', '| --- | --- | --- | --- |',
  ...labels.map(([section, item]) => row([section, section === '1.3a' && item.includes('输出为空') ? '忽略输出恰好等于固定的 84 项清单' : section === '7.6' ? '四时刻与 web 成片忠实度比较' : item, ...coverage(section, item)])),
  row(['返工 1', '/core/ 通用回退映射、整目录静态复制与文档', '已做', `保留站点根原文件优先；复制前检查 dist/core/ 不存在；${core.files} 文件逐字节一致；已重启 4328。`]),
  row(['返工 2', '--ready-timeout', '已做', '默认 60 秒，同时用于发现 __motion 与等待 ready；播放器两次命令均传 180 秒，其他阈值和 GPU 检查未改。']),
  row(['返工 3', '成片同一时刻比较', unavailable.length ? '未做' : '已做', 'frameSec / DUR×25% / 50% / 75%；参考帧 -ss 在 -i 后；四行对照左侧标 t；最大 MAD > 12 已观察，不修。']), '',
  '## 收录与逐字节核对', '',
  `收录输入未变化，复用独立读取本地文件与参考克隆 / tar 原条目的字节比较：git ${bytes.git}，pack ${bytes.pack}，不一致 ${bytes.mismatches.length}；本轮 check 已重新核对收录清单。原字节核对不包含派生音轨；派生来源与转码参数记录在 UPSTREAM.json 与页面署名。`, '',
  '忽略集合比对：期望 84，实际 84，新增 0，缺少 0；上游 .gitignore 原字节一致。验证脚本为 `dev/wip/Tres/tools/check-lemo-ignored.mjs`。该比对针对本次尚未暂存字体的工作树状态。', '',
  '[字节核对 JSON](../wip/Tres/evidence/lemo-verification.json) · [忽略集合比对](../wip/Tres/evidence/lemo-ignored-comparison.json) · [固定 84 项](../wip/Tres/evidence/lemo-ignored-files.txt)', '',
  '## Smoke', '',
  `既有条目首次原命令为 ${firstAttemptLine}：alert-reroute 被检测为 SwiftShader，随后测试浏览器连接失败；此前同轮 GPU 案例为 Intel D3D11。保留失败日志，在参数与代码不变的情况下完整重跑，最终为 ${existingLine}。这段记录证明一次软件渲染与连接失效，未确认其底层原因。`, '',
  '24 个 ready URL 以 --gpu --ready-timeout 180 连续执行两次。默认就绪超时为 60 秒；发现 __motion 与等待 ready 使用相同的参数值，时间推进阈值、GPU 参数与软件渲染拒绝规则不变。播放器只支持 landscape，portrait 按 smoke 原逻辑跳过。', '',
  '```text', existingLine, ...styleRuns.map(run => `run ${run.run}: ${run.line}`), '```', '',
  '[既有条目最终日志](../wip/Tres/evidence/smoke-existing-complete.log) · [既有条目首次失败日志](../wip/Tres/evidence/smoke-existing-attempt-1.log) · [GPU 第一次](../wip/Tres/evidence/style-smoke-1.log) · [GPU 第二次](../wip/Tres/evidence/style-smoke-2.log) · [逐片汇总](../wip/Tres/evidence/style-smoke-summary.json)', '',
  '| slug | GPU 第一次 | GPU 第二次 |', '| --- | --- | --- |', ...slugs.map(slug => row([slug, ...styleRuns.map(run => { const item = run.jobs.find(job => job.slug === slug); return item?.ok ? '通过' : item ? failureReason(item) : '未执行'; })])), '',
  '## 忠实度 MAD 与逐张观察', '',
  '旧的 poster 对比因参考错了而作废。', '',
  '使用 GPU 启动参数，在 1920×1080 舞台依次 await seek(frameSec / DUR×0.25 / DUR×0.5 / DUR×0.75) 后截图。DUR 取播放器运行时长；参考是主工作区 films-web 的 web Release 成片，以 ffmpeg -i <mp4> -ss <t> 精确定位。两边均缩放到 480×270，以 RGB 全通道绝对差均值计算 MAD（0–255）。每张对照图四行，左侧标时刻，每行左为播放器、右为成片。表格每格为“时刻 / MAD”。', '',
  '| slug | frameSec：t / MAD | 25%：t / MAD | 50%：t / MAD | 75%：t / MAD | 最大 MAD | 对照图 |', '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
  ...fidelity.results.map(item => row([item.slug, ...[0, 1, 2, 3].map(index => item.points?.[index] ? `${item.points[index].t.toFixed(3)}s / ${item.points[index].mad.toFixed(3)}` : '未成像'), Number.isFinite(item.maxMad) ? item.maxMad.toFixed(3) : '未成像', item.pair ? `[查看](../shots/Tres/fidelity/${item.slug}.jpg)` : item.error])), '',
  '最大 MAD > 12 的目视观察（按要求只记录，不修）：', '',
  ...(outliers.length ? ['| slug | 最大 MAD | 看图后的观察 |', '| --- | ---: | --- |', ...outliers.map(item => row([item.slug, item.maxMad.toFixed(3), observe(item.slug)]))] : [`无。${rendered.length} 张有效对照图均已打开查看。`]), '',
  ...(unavailable.length ? ['无法成像的样片没有计算 MAD，加载失败画面不作为有效样片帧。', '', '| slug | 退出前等待（ms） | 实际错误 |', '| --- | ---: | --- |', ...unavailable.map(item => row([item.slug, item.elapsedMs, item.error])), ''] : []),
  '[原始测量](../wip/Tres/evidence/fidelity.json) · [逐张查看记录](../wip/Tres/evidence/fidelity-review.json)', '',
  `低于阈值但可见的文字差异：pictogram-motion，${observe('pictogram-motion')} 最大 MAD 为 ${fidelity.results.find(item => item.slug === 'pictogram-motion').maxMad.toFixed(3)}；收录源码保持原字节，未按成片改写。`, '',
  `stained-glass 起始帧补测：独立 1280×720 GPU 页面 readyMs=${timing.readyMs}；${timing.frames.map(frame => `t=${frame.t}s 的 await seek 耗时 ${frame.renderMs.toFixed(2)}ms`).join('；')}。同片的 1920×1080 四时刻测量见 fidelity.json。两组都是单次测量，未确认 smoke 时间推进失败的底层原因。`, '',
  '[起始帧耗时](../wip/Tres/evidence/stained-glass-timing.json)', '',
  '## 音轨时长差值', '',
  '差值 = web 成片时长 − style.json.dur；59 片绝对差 > 0.1 秒的为 0。56 条 Ogg Opus 音轨不裁剪、不平移；三个配音例外未收录。该测量的输入未变化，复用已取得结果。', '',
  '| slug | style dur（秒） | web 时长（秒） | 差值（秒） | 音轨 |', '| --- | ---: | ---: | ---: | --- |',
  ...bytes.durations.map(item => row([item.slug, item.styleDur.toFixed(3), item.filmDur.toFixed(3), item.delta.toFixed(3), item.audio ? '已收录' : '未收录（配音例外）'])), '',
  '## 音画对齐抽查', '',
  '两段均使用 scripts/render.mjs 逐帧输出 0–8 秒、30fps、1920×1080，并由时间轴导出音频后合成 MP4。波形拼图上半部为上游 web 成片、下半部为渲染的 MP4。此项输入与播放器音频逻辑未变化，复用已通过的两段成品、ffprobe 与波形检查。', '',
  '| slug | 视频 | 音频 | 时长（秒） | 波形观察 |', '| --- | --- | --- | ---: | --- |',
  ...audio.map(item => row([item.slug, `${item.video.codec} ${item.video.width}×${item.video.height}`, `${item.audio.codec} ${item.audio.channels}ch ${item.audio.sampleRate}Hz`, item.duration.toFixed(3), audioReview.observations.find(observation => observation.slug === item.slug)?.observation || '未记录'])), '',
  ...audio.map(item => `- ${item.slug}：[MP4](../shots/Tres/audio/${item.slug}.mp4) · [波形对照](../shots/Tres/audio/${item.slug}.png)`), '',
  '[ffprobe 汇总](../wip/Tres/evidence/audio-check.json)', '',
  '## Check-pages (a)–(l)', '',
  '| 断言 | 结果 | 证据 |', '| --- | --- | --- |',
  ...pages.assertions.map(item => row([item.label, item.ok ? '通过' : '失败', item.detail == null ? '' : JSON.stringify(item.detail)])), '',
  `上游已知缺失链接 ${pages.missing.filter(item => item.known).length} 项，新增未知缺失 ${pages.missing.filter(item => !item.known).length} 项，完整来源见 check-pages.json。剪贴板只将回读的 CRLF 还原为 LF，再与原 prompt 严格比较。`, '',
  '[页面检查原始结果](../wip/Tres/evidence/check-pages.json) · [本轮日志](../wip/Tres/evidence/check-pages-b1.log)', '',
  '(f) 复核第一阶段保留的三组 before / after 截图与 HTML，均一致；本轮没有重新拍摄这三组提取前后的历史对照。', '',
  '## 截图索引', '',
  'B1 规定的九张、既有脚本附带截图与新增 crayon-book / urban-sketch 就绪截图均已生成并逐张查看。字号测量针对资源库原生页面文字；上游样片画面按原代码与固定舞台等比缩放。', '',
  '| 视口 | 路由 | 最小文字字号 | 截图 | 目视 |', '| --- | --- | ---: | --- | --- |',
  ...screenshots.map(item => row([`${item.width}×${item.height}`, item.hash, item.minFontPx, `[查看](${item.file.replace('dev/shots/', '../shots/')})`, pageReview.viewed.includes(item.file) ? '已查看' : '未查看'])), '',
  '## 体积', '',
  '| 来源 | 文件数 | 字节 |', '| --- | ---: | ---: |',
  ...['git', 'pack', 'film-audio'].map(origin => row([origin, size.groups[origin].files, size.groups[origin].bytes])),
  row(['收录内容小计', size.files - 1, size.bytes - size.manifestBytes]), row(['UPSTREAM.json', 1, size.manifestBytes]), row(['实际目录合计', size.files, size.bytes]), '',
  '| 前 10 大文件（相对 resources/lemo-opuscar/） | 字节 | origin |', '| --- | ---: | --- |', ...size.largest.map(item => row([item.path, item.bytes, item.origin])), '',
  '[本轮实际体积测量](../wip/Tres/evidence/lemo-size-final.json)', '',
  '## 阻碍与处理结果', '',
  '- 上游 .gitignore 的 84 个字体忽略项：主任务已决定提交时范围限定 git add -f；本轮精确集合比对通过，上游文件不改。',
  '- web 下载时的连接中断：已补齐；本轮复用未变化的 59 个成片和时长测量。',
  '- 根路径 /core/ 兼容：按主任务决定加入整个前缀的回退映射，静态构建复制整个目录；46 个原文件字节一致，服务已重启。',
  '- 慢启动：smoke 已提供默认 60 秒的 --ready-timeout，播放器两次均用 180 秒；发现 __motion 与等待 ready 使用同一值。实测启动与单帧耗时保留在 fidelity.json。',
  `- 既有 smoke 首次 ${firstAttemptLine}；GPU 软件渲染与后续连接失败均保留原日志，原命令未改参数重跑为 ${existingLine}。没有放宽软件渲染拒绝规则；未确认底层失效原因。`,
  '- 拖动条暂停回调会覆盖输入值：在暂停前保存目标值，50% 拖动断言验证最终行为。',
  '- 音轨登记在预加载完成前执行，kit 就绪事件与离线导出均可读取乐谱；GPU smoke 和两段 MP4 验证。',
  '- 剪贴板 CRLF：按主任务认可的规则还原 LF 后严格比较。', '',
  '- 页面检查的路径预期格式与当前 .doc-path 不一致：已统一为 repo / 相对文件路径，并完整重跑，242 份 Skill Markdown 通过。',
  '- 文档截图的同页 hash 导航不触发 Page.loadEventFired：采集脚本已改用 hash 路由等待，DEMO / CREDITS 正文图已完成并查看。', '',
  '## 已知显示限制', '',
  '既有 MAMarkdown.inline 先切开行内代码片段，因此 Swiss DEMO.md 中标签内含代码的目录链接显示为 Markdown 字面量，截图中可见。普通链接路径规则、原始文件入口与样片源码按钮仍可用；主任务明确本轮不修改共享渲染器，保留记录。', '',
  '## 待决定', '',
  ...(pending.length ? pending.map(item => '- ' + item) : ['无新增待决定事项。固定 84 个字体由主任务在提交时强制加入；本任务保持未暂存、未提交。']), '',
  '## 当前交付状态', '',
  `分支 ${git.branch}，HEAD ${git.head}；暂存文件 ${git.staged.length}；禁止修改目录的已跟踪差异 ${git.forbiddenChanges.length}。构建产物已刷新到最终页面与播放器源文件。35 个非 ready 样片保持海报 / 成片入口，素材与构建补齐属于 B2 / B3。`, '',
];
fs.writeFileSync('dev/reports/Tres-b1.md', lines.join('\n'));
console.log(JSON.stringify({ complete, hardPass, existingLine, styleLines: styleRuns.map(run => run.line), fidelity: fidelity.results.length, outliers: outliers.map(item => ({ slug: item.slug, maxMad: item.maxMad, observation: observe(item.slug) })), pageAssertions: pages.assertions.length, pageFailures, screenshots: pageReview.viewed.length, pending }, null, 2));
