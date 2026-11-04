import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:5180', trace: 'on-first-retry' },
  webServer: [
    {
      command: 'npx vite --port 5180',
      url: 'http://localhost:5180/test/test-page.html',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      // The built site: script timing differs from the dev server's.
      command:
        'npm run site:build && npx vite preview --config vite.site.config.js --port 5181 --strictPort',
      url: 'http://localhost:5181/docs/index.html',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
