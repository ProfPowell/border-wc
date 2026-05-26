import { test, expect } from '@playwright/test';

test('extreme value gets an overlay and a positioning context', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const el = document.getElementById('ex');
    return {
      hasSvg: !!el.querySelector('svg[data-border-wc="squiggle"]'),
      positioned: getComputedStyle(el).position === 'relative',
    };
  });
  expect(r).toEqual({ hasSvg: true, positioned: true });
});

test('base value is ignored (no overlay)', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForTimeout(120);
  const has = await page.evaluate(
    () => !!document.getElementById('base').querySelector('[data-border-wc]')
  );
  expect(has).toBe(false);
});

test('dynamically added node gets bound', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.id = 'late';
    d.setAttribute('data-border-effect', 'draw');
    document.body.appendChild(d);
  });
  await page.waitForTimeout(120);
  const has = await page.evaluate(
    () => !!document.getElementById('late').querySelector('svg[data-border-wc="draw"]')
  );
  expect(has).toBe(true);
});

test('changing the value tears down old overlay and applies the new one', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForTimeout(120);
  await page.evaluate(() =>
    document.getElementById('ex').setAttribute('data-border-effect', 'sparks')
  );
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const el = document.getElementById('ex');
    return {
      svgGone: !el.querySelector('svg[data-border-wc="squiggle"]'),
      hasCanvas: !!el.querySelector('canvas[data-border-wc="sparks"]'),
    };
  });
  expect(r).toEqual({ svgGone: true, hasCanvas: true });
});

test('removing the attribute tears down the overlay', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForTimeout(120);
  await page.evaluate(() =>
    document.getElementById('ex').removeAttribute('data-border-effect')
  );
  await page.waitForTimeout(120);
  const has = await page.evaluate(
    () => !!document.getElementById('ex').querySelector('[data-border-wc]')
  );
  expect(has).toBe(false);
});

test('no console errors during binding', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/test/binder-page.html');
  await page.waitForTimeout(150);
  expect(errors).toEqual([]);
});
