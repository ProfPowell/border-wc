import { test, expect } from '@playwright/test';
test('vines appends an SVG overlay with a stroked path and leaves', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'vines'));
  await page.waitForTimeout(120);
  const counts = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="vines"]');
    return { svg: !!svg, paths: svg ? svg.querySelectorAll('path').length : 0 };
  });
  expect(counts.svg).toBe(true);
  expect(counts.paths).toBeGreaterThanOrEqual(2);
});
