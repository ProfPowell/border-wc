import { test, expect } from '@playwright/test';
test('bunting appends a swag path + per-pennant flags', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'bunting'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="bunting"]');
    // 1 swag path + N flag paths.
    const paths = svg.querySelectorAll('path');
    return {
      total: paths.length,
      hasSwag: !!Array.from(paths).find((p) => (p.getAttribute('d') || '').startsWith('M0')),
    };
  });
  expect(r.total).toBeGreaterThan(4);
  expect(r.hasSwag).toBe(true);
});
