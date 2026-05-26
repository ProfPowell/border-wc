import { test, expect } from '@playwright/test';
test('toRGBA resolves oklch and named to rgb', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const out = await page.evaluate(async () => {
    const { toRGBA } = await import('/src/color.js');
    return { ok: toRGBA('oklch(62% .1 230)'), named: toRGBA('rebeccapurple') };
  });
  expect(out.ok).toMatch(/^rgb/);
  expect(out.named).toMatch(/^rgb/);
});
