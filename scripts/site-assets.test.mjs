import test from 'node:test';
import assert from 'node:assert/strict';
import { rewriteURL, rewriteCSS, rewriteHTML } from './lib/site-assets.mjs';

const url = 'https://raw.githubusercontent.com/MIBXR/motion-atlas/' + 'a'.repeat(40) + '/demos/app/font.woff2';
const sources = { assets: { 'demos/app/font.woff2': { url, bytes: 131072 } } };

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
