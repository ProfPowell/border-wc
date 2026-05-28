import { defineConfig } from 'vite';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Product-site + themed-demos multi-page build. Mirrors bg-wc's vite.site.config.js
// pattern (root index redirect + docs/* + demos/*). Bare imports (vanilla-breeze,
// @profpowell/code-block, @profpowell/browser-window) resolve from node_modules.

const demoPages = existsSync('demos')
  ? readdirSync('demos')
      .filter((f) => f.endsWith('.html'))
      .map((f) => `demos/${f}`)
  : [];
const input = Object.fromEntries(
  ['index.html', 'docs/index.html', 'docs/api.html', ...demoPages]
    .filter((f) => existsSync(f))
    .map((f) => [f.replace(/[/.]/g, '_'), f])
);

// vanilla-breeze lazily imports its optional Pagefind search bundle from an
// absolute path that doesn't exist here. Stub it so dev + build don't 404.
const PAGEFIND_ID = '/pagefind/pagefind.js';
const pagefindStub = {
  name: 'border-wc:pagefind-stub',
  resolveId(id) {
    if (id === PAGEFIND_ID) return '\0pagefind-stub';
    return null;
  },
  load(id) {
    if (id === '\0pagefind-stub')
      return 'export default {}; export const search = () => ({ results: [] });';
    return null;
  },
};

// vanilla-breeze fetches its theme CSS and lucide icon SVGs from `/vb/...` at
// runtime. Serve them from node_modules in dev and emit them as assets at build.
const VB_DIR = 'node_modules/vanilla-breeze/dist/cdn';
const VB_BUILD_ICONS = [
  'palette',
  'sun',
  'moon',
  'monitor',
  'contrast',
  'sliders',
  'type',
  'check',
  'chevron-down',
  'chevron-up',
  'x',
  'circle',
];
const vbAssets = {
  name: 'border-wc:vb-assets',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const t = req.url && req.url.match(/^\/vb\/themes\/([\w-]+\.css)(?:\?.*)?$/);
      const i = req.url && req.url.match(/^\/vb\/icons\/([\w-]+)\/([\w-]+\.svg)(?:\?.*)?$/);
      try {
        if (t) {
          res.setHeader('Content-Type', 'text/css');
          return res.end(readFileSync(join(VB_DIR, 'themes', t[1])));
        }
        if (i) {
          res.setHeader('Content-Type', 'image/svg+xml');
          return res.end(readFileSync(join(VB_DIR, 'icons', i[1], i[2])));
        }
      } catch {
        /* fall through to 404 */
      }
      next();
    });
  },
  generateBundle() {
    const themes = join(VB_DIR, 'themes');
    if (existsSync(themes)) {
      for (const f of readdirSync(themes)) {
        if (f.endsWith('.css')) {
          this.emitFile({
            type: 'asset',
            fileName: `vb/themes/${f}`,
            source: readFileSync(join(themes, f)),
          });
        }
      }
    }
    const lucide = join(VB_DIR, 'icons', 'lucide');
    if (existsSync(lucide)) {
      for (const name of VB_BUILD_ICONS) {
        const file = join(lucide, `${name}.svg`);
        if (existsSync(file)) {
          this.emitFile({
            type: 'asset',
            fileName: `vb/icons/lucide/${name}.svg`,
            source: readFileSync(file),
          });
        }
      }
    }
  },
};

export default defineConfig({
  root: '.',
  base: './',
  plugins: [pagefindStub, vbAssets],
  build: {
    outDir: 'dist-site',
    emptyOutDir: true,
    rollupOptions: { input },
  },
  server: { open: '/docs/index.html' },
});
