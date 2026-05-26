import { test, expect } from '@playwright/test';
test('embedded perimeter computes a rounded-rect path', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const d = await page.evaluate(async () => {
    const m = await import('/src/perimeter.js');
    return m.roundedRectPath({ width: 100, height: 100, radius: 10 });
  });
  expect(d).toMatch(/A10 10 0 0 1/);
});

test('embedded copy is synced with VB Phase 2 (segment core + shape builders)', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const r = await page.evaluate(async () => {
    const m = await import('/src/perimeter.js');
    return {
      hasGenerics: typeof m.tracePath === 'function' && typeof m.traceSampler === 'function',
      polygon: m.tracePath(m.polygonShape([[0, 0], [100, 0], [50, 100]])),
      circleLen: m.traceLength(m.circleShape({ cx: 50, cy: 50, r: 50 })),
      ellipse: m.tracePath(m.ellipseShape({ cx: 50, cy: 50, rx: 50, ry: 25 })),
    };
  });
  expect(r.hasGenerics).toBe(true);
  expect(r.polygon).toMatch(/^M0 0/);
  expect(r.polygon).toMatch(/Z$/);
  expect(Math.abs(r.circleLen - 2 * Math.PI * 50)).toBeLessThan(1e-6);
  expect(r.ellipse).toMatch(/A50 25 0 0 1/);
});
