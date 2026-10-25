import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ASSET_THRESHOLD, assetSources, rewriteURL, rewriteCSS, rewriteHTML } from './lib/site-assets.mjs';

const url = 'https://raw.githubusercontent.com/MIBXR/motion-atlas/' + 'a'.repeat(40) + '/demos/app/font.woff2';
const sources = { assets: { 'demos/app/font.woff2': { url, bytes: 131072 } } };

test('new large media is automatically pinned; small media and executable code stay local', () => {
  const temporary = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temporary, 'motion-atlas-assets-test-'));
  try {
    fs.mkdirSync(path.join(root, 'demos'));
    for (const [name, bytes] of [['model.glb', ASSET_THRESHOLD], ['small.png', ASSET_THRESHOLD - 1], ['runtime.js', ASSET_THRESHOLD]]) fs.writeFileSync(path.join(root, 'demos', name), Buffer.alloc(bytes));
    const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    git(['init', '--quiet']);
    git(['add', '.']);
    git(['-c', 'user.name=Asset Test', '-c', 'user.email=assets@example.invalid', 'commit', '--quiet', '-m', 'Media fixture']);
    const result = assetSources(root, ['demos']);
    assert.deepEqual(Object.keys(result.assets), ['demos/model.glb']);
    assert.equal(result.assets['demos/model.glb'].url, `https://raw.githubusercontent.com/MIBXR/motion-atlas/${result.commit}/demos/model.glb`);
    fs.writeFileSync(path.join(root, 'demos/model.glb'), 'changed');
    assert.throws(() => assetSources(root, ['demos']), /Commit the source/);
  } finally {
    assert.equal(path.dirname(fs.realpathSync(root)), temporary);
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('media paths resolve relative to each document and preserve query and hash', () => {
  assert.equal(rewriteURL('../font.woff2?v=2#face', 'demos/app/assets/site.css', sources), url + '?v=2#face');
  for (const value of ['small.png', 'https://tiles.example/tile', 'data:image/png;base64,AA', '#icon']) assert.equal(rewriteURL(value, 'index.html', sources), value);
});

test('CSS and HTML rewrite fonts and media without modifying inline programs', () => {
  assert.equal(rewriteCSS('@font-face{src:url(../font.woff2)}', 'demos/app/assets/site.css', sources), `@font-face{src:url("${url}")}`);
  const input = '<html><head><style>i{background:url(font.woff2)}</style><script>const sample="<img src=\'font.woff2\'>";</script></head><body><img src="font.woff2"></body></html>';
  const output = rewriteHTML(input, 'demos/app/index.html', sources);
  assert.ok(output.includes('<script src="../../assets/asset-runtime.js"></script>'));
  assert.ok(output.includes(`<img src="${url}">`));
  assert.ok(output.includes('<script>const sample="<img src=\'font.woff2\'>";</script>'));
});
