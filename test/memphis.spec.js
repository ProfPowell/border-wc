import { test, expect } from '@playwright/test';
test('memphis scatters mixed shapes around the perimeter', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'memphis'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="memphis"]');
    return {
      circles: svg.querySelectorAll('circle').length,
      rects: svg.querySelectorAll('rect').length,
      paths: svg.querySelectorAll('path').length,
    };
  });
  // 4 shape kinds cycling: each kind should appear at least a few times.
  expect(r.circles).toBeGreaterThan(2);
  expect(r.rects).toBeGreaterThan(2);
  expect(r.paths).toBeGreaterThan(4);
});
