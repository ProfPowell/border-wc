import { test, expect } from '@playwright/test';
test('reduced motion: draw renders fully drawn immediately (no animation)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/test/test-page.html');
  const completed = await page.evaluate(() => new Promise((res) => {
    const el = document.getElementById('bw');
    let got = false;
    el.addEventListener('border-wc:draw-complete', () => { got = true; res(true); }, { once: true });
    el.setAttribute('effect', 'draw');
    setTimeout(() => res(got), 100); // under reduce, draw-complete should fire ~immediately
  }));
  expect(completed).toBe(true);
});
