import { test, expect } from '@playwright/test';
test('wave appends a quad-bezier perimeter path', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'wave'));
  await page.waitForTimeout(120);
  const d = await page.evaluate(() => {
    const p = document.getElementById('bw').querySelector('svg[data-border-wc="wave"] path');
    return p && p.getAttribute('d');
  });
  expect(d).toBeTruthy();
  // Wave uses Q (quad bezier) commands — at least a few per edge.
  expect((d.match(/Q/g) || []).length).toBeGreaterThan(8);
});
