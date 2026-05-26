import { test, expect } from '@playwright/test';
test('embedded perimeter computes a rounded-rect path', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const d = await page.evaluate(async () => {
    const m = await import('/src/perimeter.js');
    return m.roundedRectPath({ width: 100, height: 100, radius: 10 });
  });
  expect(d).toMatch(/A10 10 0 0 1/);
});
