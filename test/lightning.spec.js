import { test, expect } from '@playwright/test';
test('lightning appends an SVG with feGaussianBlur filter + bolt paths', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'lightning'));
  await page.waitForTimeout(150);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="lightning"]');
    if (!svg) return null;
    return {
      hasBlur: !!svg.querySelector('filter feGaussianBlur'),
      paths: svg.querySelectorAll('g path').length,
    };
  });
  expect(r.hasBlur).toBe(true);
  expect(r.paths).toBeGreaterThanOrEqual(4);
});
