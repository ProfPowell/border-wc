import { test, expect } from '@playwright/test';
test('barbed-wire appends svg overlay with wire and barbs', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'barbed-wire'));
  await page.waitForTimeout(120);
  const counts = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="barbed-wire"]');
    return { svg: !!svg, paths: svg ? svg.querySelectorAll('path').length : 0 };
  });
  expect(counts.svg).toBe(true);
  expect(counts.paths).toBeGreaterThan(2);
});
