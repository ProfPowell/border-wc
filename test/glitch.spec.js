import { test, expect } from '@playwright/test';
test('glitch appends an SVG with three colored paths', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'glitch'));
  await page.waitForTimeout(120);
  const n = await page.evaluate(
    () => document.getElementById('bw').querySelectorAll('svg[data-border-wc="glitch"] path').length
  );
  expect(n).toBe(3);
});
