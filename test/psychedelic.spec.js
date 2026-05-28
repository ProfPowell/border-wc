import { test, expect } from '@playwright/test';
test('psychedelic appends an SVG with a gradient-stroked path', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'psychedelic'));
  await page.waitForTimeout(120);
  const stroke = await page.evaluate(() => {
    const p = document
      .getElementById('bw')
      .querySelector('svg[data-border-wc="psychedelic"] path');
    return p && p.getAttribute('stroke');
  });
  expect(stroke).toMatch(/^url\(#psyc-/);
});
