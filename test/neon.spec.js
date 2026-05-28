import { test, expect } from '@playwright/test';
test('neon appends an SVG with a feGaussianBlur+feMerge filter', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'neon'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="neon"]');
    if (!svg) return null;
    return {
      hasBlur: !!svg.querySelector('filter feGaussianBlur'),
      hasMerge: !!svg.querySelector('filter feMerge'),
      hasFiltered: !!svg.querySelector('path[filter]'),
    };
  });
  expect(r).toEqual({ hasBlur: true, hasMerge: true, hasFiltered: true });
});
