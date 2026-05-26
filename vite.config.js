import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: { entry: 'src/border-wc.js', formats: ['es'], fileName: () => 'border-wc.js' },
  },
  server: { open: '/demos/index.html' },
});
