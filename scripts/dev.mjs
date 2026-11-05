import { createAppBuild } from './build-app.mjs';

const build = await createAppBuild();
await build.watch();
await import('./serve.mjs');
