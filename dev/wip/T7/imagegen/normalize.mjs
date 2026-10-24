import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const workDir = 'dev/wip/T7/imagegen';
const outputDir = 'demos/cases/industrial-protocol/assets/gen';
const records = JSON.parse(fs.readFileSync(`${workDir}/selected-generations.json`, 'utf8'));
const requestedNames = new Set(process.argv.slice(2));
const uses = {
  ground: '静态地面贴图', core: '协议核心', refinery: '精炼炉', assembler: '配件机A/B',
  crusher: '粉碎机', storage: '仓储箱', planter: '种植机', pylon: '供电桩', operator: 'S4原创人物',
  'item-crystal': '背包/输入晶体', 'item-part': '背包/输出配件', 'item-canister': '背包罐',
  'item-module': '背包模块', 'item-ore': '背包矿石', 'item-plate': '背包合金板'
};
const probe = file => JSON.parse(execFileSync('ffprobe', [
  '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,pix_fmt',
  '-of', 'json', file
], {encoding: 'utf8'})).streams[0];
const decode = (file, filter) => execFileSync('ffmpeg', [
  '-v', 'error', '-i', file, ...(filter ? ['-vf', filter] : []),
  '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'
], {maxBuffer: 64 * 1024 * 1024});
const alphaStats = raw => {
  let min = 255, max = 0, transparent = 0, partial = 0, opaque = 0;
  for (let i = 3; i < raw.length; i += 4) {
    const alpha = raw[i];
    min = Math.min(min, alpha);
    max = Math.max(max, alpha);
    transparent += alpha === 0;
    partial += alpha > 0 && alpha < 255;
    opaque += alpha === 255;
  }
  return {min, max, transparent, partial, opaque};
};

const results = [];
for (const record of records) {
  const output = path.join(outputDir, record.target);
  const native = probe(record.path);
  const [width, height] = record.requested;
  const ground = record.name === 'ground';
  const filter = `scale=${width}:${height}:flags=lanczos,format=${ground ? 'bgra' : 'rgba'}`;
  const args = ['-v', 'error', '-y', '-i', record.path, '-vf', filter, '-frames:v', '1',
    ...(ground ? ['-c:v', 'libwebp', '-lossless', '1', '-compression_level', '6', '-quality', '100']
      : ['-c:v', 'png', '-pix_fmt', 'rgba']), output];
  if (!requestedNames.size || requestedNames.has(record.name)) execFileSync('ffmpeg', args);
  const final = probe(output);
  const raw = decode(output);
  const alpha = alphaStats(raw);
  if (final.width !== width || final.height !== height) throw new Error(`${record.target}: incorrect dimensions`);
  if (!ground && (final.pix_fmt !== 'rgba' || !alpha.transparent || !alpha.max)) {
    throw new Error(`${record.target}: real alpha not preserved`);
  }
  let decodedPixelsMatchScaledSource;
  if (ground || record.name === 'operator') {
    decodedPixelsMatchScaledSource = raw.equals(decode(record.path, filter));
    if (!decodedPixelsMatchScaledSource) throw new Error(`${record.target}: decoded pixel mismatch`);
  }
  const result = {name: record.name, source: record.path, output: output.replaceAll('\\', '/'),
    native, final, alpha, bytes: fs.statSync(output).size, selectedAttempt: record.attempt,
    regenerations: record.attempt - 1, ffmpegArguments: args, decodedPixelsMatchScaledSource};
  results.push(result);
  console.log(JSON.stringify({file: record.target, ...final, alpha, bytes: result.bytes, decodedPixelsMatchScaledSource}));
}

fs.rmSync(path.join(outputDir, 'ground.png'), {force: true});
fs.writeFileSync(`${workDir}/normalized.json`, JSON.stringify({
  generationTool: 'image_gen.imagegen', normalizationTool: execFileSync('ffmpeg', ['-version'], {encoding: 'utf8'}).split('\n')[0],
  normalization: 'Lanczos resize; lossless WebP for ground; RGBA PNG for facilities, inventory items and operator.',
  originalsPreserved: true, assets: results
}, null, 2) + '\n');

const sourceText = `# 生图素材来源

生成工具：内置 image_gen.imagegen。生成日期：2026-10-23 至 2026-10-24。没有使用任何游戏截图、角色、图标或 logo 作为输入参考。所有图片均由下列完整提示词独立生成。

本目录保存 15 张最终素材。FFmpeg 仅执行 Lanczos 尺寸缩放及 PNG/WebP 格式转换；地面为 2048×2048 无损 WebP，设施为 512×512 RGBA PNG，物品为 128×128 RGBA PNG，人物为 1024×1536 RGBA PNG。未裁切、补绘或合成画面。14 张 PNG 均经解码确认同时存在完全透明像素与可见像素；地面保持不透明。地面 WebP 解码像素与缩放后输入完全相同，人物解码像素与原生尺寸输入完全相同。人物原图及成品的 Alpha 最大值均为 254。

原生输出（含全部重生成版本）保留在 C:/Users/mibxr/.codex/generated_images/01a166b2-12c7-75b0-ad08-94bf09822c6a/。下列提示词逐字记录每次生成输入；尺寸要求与实际原生尺寸分别列示。core 重生成 1 次，选用第 2 次生成；pylon 重生成 2 次，选用第 3 次生成；其余素材重生成 0 次。

| 最终文件 | 用途 | 原生尺寸 | 最终尺寸 | 最终像素格式 | 透明像素数 | 重生成次数 |
| --- | --- | --- | --- | --- | ---: | ---: |
${records.map((r, i) => {
  const n = results[i];
  return `| ${r.target} | ${uses[r.name]} | ${n.native.width}×${n.native.height} | ${n.final.width}×${n.final.height} | ${n.final.pix_fmt} | ${n.alpha.transparent} | ${r.attempt - 1} |`;
}).join('\n')}

${records.map((r, i) => {
  const n = results[i];
  const attempts = r.history || [{attempt: r.attempt, path: r.path, prompt: r.prompt}];
  return `## ${r.target}

- 用途：${uses[r.name]}
- 生成工具：image_gen.imagegen
- 原生尺寸：${n.native.width}×${n.native.height}，${n.native.pix_fmt}
- 最终尺寸：${n.final.width}×${n.final.height}，${n.final.pix_fmt}
- 处理：FFmpeg ${r.name === 'ground' ? 'Lanczos 缩放，libwebp 无损编码（lossless=1）' : r.name === 'operator' ? '原生尺寸 RGBA PNG 编码，解码像素保持相同' : 'Lanczos 缩放，RGBA PNG 编码'}
- Alpha 实测：最小 ${n.alpha.min}，最大 ${n.alpha.max}；完全透明 ${n.alpha.transparent} 像素，半透明 ${n.alpha.partial} 像素，完全不透明 ${n.alpha.opaque} 像素
- 选定版本：第 ${r.attempt} 次生成；重生成 ${r.attempt - 1} 次

${attempts.map(a => `### 第 ${a.attempt} 次生成${a.attempt === r.attempt ? '（选定）' : ''}

原图：${a.path}

完整提示词（含技术参数）：

~~~text
${a.prompt}
~~~`).join('\n\n')}`;
}).join('\n\n')}
`;
fs.writeFileSync(`${outputDir}/SOURCES.md`, sourceText);
