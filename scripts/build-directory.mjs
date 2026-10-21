// Builds the Astro provider directory and mounts it into the Assistance
// site at site/directory/, served at global.healthmetrics.com/directory/.
//
// Run with `npm run build-directory` after any change to providers.json or
// the directory page. It expects `astro build` to have been run by the npm
// script (see package.json); this script only copies the pieces we serve:
//   dist/index.html  -> site/directory/index.html
//   dist/_astro/     -> site/directory/_astro/
//   dist/logo.png, favicon.png -> site/ root (the page references them
//                                 by absolute path)
// dist/robots.txt and dist/sitemap-*.xml are intentionally NOT copied -
// the Assistance site owns /robots.txt and /sitemap.xml.
import { cp, mkdir, rm, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

await access(root('dist/index.html')).catch(() => {
  throw new Error('dist/index.html missing - run the astro build first (npm run build-directory does both).');
});

await rm(root('site/directory'), { recursive: true, force: true });
await mkdir(root('site/directory'), { recursive: true });

await cp(root('dist/index.html'), root('site/directory/index.html'));
await cp(root('dist/_astro'), root('site/directory/_astro'), { recursive: true });
await cp(root('dist/logo.png'), root('site/logo.png'));
await cp(root('dist/favicon.png'), root('site/favicon.png'));

console.log('Mounted directory build at site/directory/ (plus root logo.png + favicon.png)');
