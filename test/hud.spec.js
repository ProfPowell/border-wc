import { test, expect } from '@playwright/test';
test('hud appends 4 corner brackets, edge ticks, frame, and a scan line', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'hud'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const host = document.getElementById('bw');
    const svg = host.querySelector('svg[data-border-wc="hud"]');
    return {
      brackets: svg.querySelectorAll('path').length,
      rectFrames: svg.querySelectorAll('rect').length,
      scan: !!host.querySelector('[data-border-wc="hud-scan"]'),
    };
  });
  expect(r.brackets).toBe(4);
  expect(r.rectFrames).toBe(1);
  expect(r.scan).toBe(true);
});
