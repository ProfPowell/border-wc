import { test, expect } from '@playwright/test';
test('stitching appends a dashed path', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'stitching'));
  await page.waitForTimeout(120);
  const dash = await page.evaluate(() => {
    const p = document
      .getElementById('bw')
      .querySelector('svg[data-border-wc="stitching"] path');
    return p && p.getAttribute('stroke-dasharray');
  });
  expect(dash).toBeTruthy();
});
