import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: {
        'border-wc': 'src/border-wc.js',
        'data-border-effect': 'src/data-border-effect.js',
      },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
  },
  server: { open: '/demos/index.html' },
});
