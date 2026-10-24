import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const oldCatalog = JSON.parse(execFileSync('git', ['show', 'HEAD:agent/catalog.json'], { encoding: 'utf8' }));
const catalog = JSON.parse(fs.readFileSync('agent/catalog.json', 'utf8'));
const versionText = [...catalog.cases, ...catalog.patterns].map((b) => `${b.bundle}:${b.bundleSha256}`).sort().join('\n');
const derived = crypto.createHash('sha256').update(versionText).digest('hex');
assert.equal(derived, catalog.contentVersion);
const oldBundle = JSON.parse(execFileSync('git', ['show', 'HEAD:agent/cases/industrial-protocol.json'], { encoding: 'utf8' }));
const bundle = JSON.parse(fs.readFileSync('agent/cases/industrial-protocol.json', 'utf8'));
const removed = oldBundle.files.filter((f) => !bundle.files.some((current) => current.path === f.path));
const currentSource = fs.readFileSync('scripts/lib/catalog.mjs', 'utf8');
const result = {
  previousContentVersion: oldCatalog.contentVersion, contentVersion: catalog.contentVersion,
  versionUsesOnlyCaseAndPatternBundles: derived === catalog.contentVersion,
  removedBaselineManifestEntries: removed.map((f) => ({ path: f.path, exists: fs.existsSync(f.path) })),
  baselineIgnoredDirectory: execFileSync('git', ['check-ignore', 'demos/cases/industrial-protocol/assets/gen/_v1/SOURCES.md'], { encoding: 'utf8' }).trim(),
  counts: catalog.counts, resources: catalog.resources,
  versionInputExpression: currentSource.split('\n').find((line) => line.includes('const versionText =')).trim(),
};
assert.equal(removed.length, 16);
assert.ok(removed.every((f) => f.path.startsWith('demos/cases/industrial-protocol/assets/gen/_v1/') && !fs.existsSync(f.path)));
fs.writeFileSync('dev/wip/Tres/evidence/catalog-result.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ versionUsesOnlyCaseAndPatternBundles: true, removedAbsentIgnoredEntries: removed.length, videoCount: catalog.resources.videos.count, skillCount: catalog.resources.skills.length }));
