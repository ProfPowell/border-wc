import { test, expect } from '@playwright/test';
test('zigzag appends a single sawtooth stroked path', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'zigzag'));
  await page.waitForTimeout(120);
  const result = await page.evaluate(() => {
    const p = document.getElementById('bw').querySelector('svg[data-border-wc="zigzag"] path');
    return p && { d: p.getAttribute('d'), stroke: p.getAttribute('stroke') };
  });
  expect(result).toBeTruthy();
  // Sawtooth perimeter produces many L commands.
  expect((result.d.match(/L/g) || []).length).toBeGreaterThan(20);
});
