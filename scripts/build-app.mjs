import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'site/client');

function runtimeDelivery(result) {
  if (result.errors.length) return;
  const outputs = new Set(Object.keys(result.metafile.outputs).map(file => path.resolve(root, file)));
  for (const file of fs.readdirSync(output, { withFileTypes: true })) {
    const absolute = path.join(output, file.name);
    if (file.isFile() && file.name !== 'LICENSES.txt' && (!outputs.has(absolute) || (file.name.endsWith('.css') && file.name !== 'main.css'))) fs.unlinkSync(absolute);
  }
  const packages = [...new Set(Object.keys(result.metafile.inputs).map(file => file.replaceAll('\\', '/').match(/^node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]).filter(Boolean))].sort();
  const licenses = packages.map(name => {
    const directory = path.join(root, 'node_modules', name);
    const metadata = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
    const license = fs.readdirSync(directory).find(file => /^licen[sc]e(?:\.md|\.txt)?$/i.test(file));
    const text = license ? fs.readFileSync(path.join(directory, license), 'utf8') : `Package license declaration: ${JSON.stringify(metadata.license)}\n${typeof metadata.repository === 'string' ? metadata.repository : metadata.repository?.url || metadata.homepage}\nThe published package does not include a license file.`;
    return `${metadata.name} ${metadata.version}\n\n${text}`;
  });
  licenses.push('Arc UI · df3a600\n\n' + fs.readFileSync(path.join(root, 'site/app/arc/LICENSE'), 'utf8'));
  fs.writeFileSync(path.join(output, 'LICENSES.txt'), (licenses.join('\n\n---\n\n') + '\n').replaceAll('\r\n', '\n'), 'utf8');
}

function siteData(name) {
  const scope = { window: {} };
  const files = name === 'documents' ? ['docs'] : ['cases', 'patterns', 'materials'];
  for (const file of files) vm.runInNewContext(fs.readFileSync(path.join(root, 'data', file + '.js'), 'utf8'), scope);
  const data = name === 'documents'
    ? { documents: scope.window.MA_DOCS, links: scope.window.MA_DOC_LINKS }
    : scope.window.MA;
  const result = name === 'entry-ids' ? Object.fromEntries(['cases', 'patterns', 'materials'].map(kind => [kind, data[kind].map(entry => entry.id)])) : data;
  return 'export default ' + JSON.stringify(result) + ';';
}

export async function createAppBuild() {
  return esbuild.context({
    absWorkingDir: root,
    entryPoints: { main: 'site/app/main.jsx' },
    outdir: 'site/client',
    bundle: true,
    splitting: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    minify: true,
    metafile: true,
    legalComments: 'linked',
    alias: { '@': path.join(root, 'site/app/arc') },
    loader: { '.module.css': 'local-css' },
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{
      name: 'atlas-data',
      setup(build) {
        build.onResolve({ filter: /^atlas:(catalog|documents|entry-ids)$/ }, args => ({ path: args.path.slice(6), namespace: 'atlas-data' }));
        build.onLoad({ filter: /.*/, namespace: 'atlas-data' }, args => ({
          contents: siteData(args.path),
          loader: 'js',
          watchFiles: (args.path === 'documents' ? ['docs'] : ['cases', 'patterns', 'materials']).map(name => path.join(root, 'data', name + '.js')),
        }));
      },
    }, { name: 'runtime-delivery', setup(build) { build.onEnd(runtimeDelivery); } }],
  });
}

export async function buildApp() {
  const build = await createAppBuild();
  try { await build.rebuild(); } finally { await build.dispose(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildApp();
