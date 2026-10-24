import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='demos/cases/industrial-protocol/assets/gen',records=JSON.parse(fs.readFileSync('dev/wip/T7/imagegen/selected-generations.json','utf8'));
const use={ground:'静态地面贴图',core:'协议核心',refinery:'精炼炉',assembler:'配件机A/B',crusher:'粉碎机',storage:'仓储箱',planter:'种植机',pylon:'供电桩',operator:'S4原创人物','item-crystal':'背包/输入晶体','item-part':'背包/输出配件','item-canister':'背包罐','item-module':'背包模块','item-ore':'背包矿石','item-plate':'背包合金板'};
fs.mkdirSync(dir,{recursive:true});
for(const r of records){r.file=r.name+'.png';r.target=r.name==='ground'?'ground.webp':r.file;r.requested=r.name==='ground'?[2048,2048]:r.name==='operator'?[1024,1536]:r.name.startsWith('item-')?[128,128]:[512,512];r.size=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,pix_fmt','-of','json',r.path],{encoding:'utf8'})).streams[0];fs.copyFileSync(r.path,`${dir}/${r.file}`);}
let md='# 生图素材来源\n\n生成工具：内置 image_gen.imagegen。生成日期：2026-10-23至2026-10-24。没有使用任何游戏截图、角色、图标或logo作为输入参考。所有图片均由下列提示词独立生成。\n\n当前保存的是工具原生输出。方形原图实际为1254×1254，人物为1024×1536；指定尺寸及ground.webp格式尚待技术归一化确认。页面尚未接入这些素材。原图保留在Codex默认generated_images目录。\n\n| 当前文件 | 最终目标文件 | 用途 | 实际尺寸 | 目标尺寸 | 重生成次数 |\n| --- | --- | --- | --- | --- | ---: |\n';
md+=records.map(r=>`| ${r.file} | ${r.target} | ${use[r.name]} | ${r.size.width}×${r.size.height} | ${r.requested.join('×')} | ${r.attempt-1} |`).join('\n')+'\n';
for(const r of records){md+=`\n## ${r.file}\n\n- 用途：${use[r.name]}\n- 生成工具：image_gen.imagegen\n- 实际尺寸：${r.size.width}×${r.size.height}，${r.size.pix_fmt}\n- 默认原图：${r.path}\n- 选定版本：第${r.attempt}次生成\n\n完整提示词（含技术参数）：\n\n~~~text\n${r.prompt}\n~~~\n`;
 if(r.history)md+=`\n重生成原因：${r.reason}\n\n`+r.history.slice(0,-1).map(h=>`第${h.attempt}次生成原图：${h.path}\n\n~~~text\n${h.prompt}\n~~~\n`).join('\n');}
fs.writeFileSync(`${dir}/SOURCES.md`,md);
fs.writeFileSync('dev/wip/T7/imagegen/selected-generations.json',JSON.stringify(records,null,2));
console.log(records.map(r=>({file:r.file,size:r.size,regenerations:r.attempt-1})));
