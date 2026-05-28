import { test, expect } from '@playwright/test';
test('ascii appends an SVG overlay with text characters', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'ascii'));
  await page.waitForTimeout(120);
  const counts = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="ascii"]');
    return { svg: !!svg, n: svg ? svg.querySelectorAll('text').length : 0 };
  });
  expect(counts.svg).toBe(true);
  expect(counts.n).toBeGreaterThanOrEqual(8);
});
