import { test, expect } from '@playwright/test';
test('stitching appends discrete cross-stitch marks', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'stitching'));
  await page.waitForTimeout(120);
  const lineCount = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="stitching"]');
    return svg ? svg.querySelectorAll('g line').length : 0;
  });
  // Each cross is two <line> elements; perimeter renders many crosses.
  expect(lineCount).toBeGreaterThan(8);
  expect(lineCount % 2).toBe(0);
});
