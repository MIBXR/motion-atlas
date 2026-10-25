import fs from 'node:fs';
const inv = JSON.parse(fs.readFileSync('dev/wip/Tcopy/copy-inventory.json', 'utf8'));
const seen = new Set(), violations = [];
for (const r of inv.filter(r => r.category === 'content' && r.file.startsWith('entries/') && fs.existsSync(r.file))) {
  const field = r.block.split(' / ')[2];
  const key = r.file + ':' + field;
  if (seen.has(key)) continue;
  seen.add(key);
  let v = JSON.parse(fs.readFileSync(r.file, 'utf8'));
  for (const k of field.replace(/\[(\d+)\]/g, '.$1').split('.')) v = v?.[k];
  if (typeof v !== 'string' || /^(id|demo|carriers|types|patternIds|sources|source|evidence|capturedAt|research)/.test(field)) continue;
  if (/^(prompt|videoPrompt|negativePrompt)$/.test(field)) continue;
  if (/^migration\[\d+\]\.how$/.test(field)) continue;
  let limit;
  if (field === 'summary') limit = 60;
  else if (/^rhythm\.beats\[\d+\]\.note$/.test(field)) limit = 30;
  else if (/^(?:useCases|avoid|constraints|interaction)\[\d+\]$|^(?:observations\[\d+\]\.what|layers\[\d+\]\.role|migration\[\d+\]\.how)$/.test(field)) limit = 40;
  const units = limit ? [v] : v.split(/[。！？\n]/).filter(Boolean);
  for (const t of units) if ([...t].length > (limit || 40)) violations.push({ id: r.id, file: r.file, field, length: [...t].length, limit: limit || 40, text: t });
}
fs.writeFileSync('dev/wip/Tcopy/length-results.json', JSON.stringify(violations, null, 2) + '\n');
for (const v of violations) console.log(`${v.file}:${v.field} ${v.length}/${v.limit} ${v.text}`);
console.log('copy length violations: ' + violations.length);
