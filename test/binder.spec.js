import { test, expect } from '@playwright/test';

// True once the binder's initial scan has applied the #ex overlay — i.e. the
// binder has definitely run, so absence assertions elsewhere are meaningful.
const exBound = () => !!document.getElementById('ex').querySelector('[data-border-wc]');

test('extreme value gets an overlay and a positioning context', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForFunction(
    () => !!document.getElementById('ex').querySelector('svg[data-border-wc="squiggle"]')
  );
  const positioned = await page.evaluate(
    () => getComputedStyle(document.getElementById('ex')).position === 'relative'
  );
  expect(positioned).toBe(true);
});

test('base value is ignored (no overlay)', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForFunction(exBound);
  const has = await page.evaluate(
    () => !!document.getElementById('base').querySelector('[data-border-wc]')
  );
  expect(has).toBe(false);
});

test('dynamically added node gets bound', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForFunction(exBound);
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.id = 'late';
    d.setAttribute('data-border-effect', 'draw');
    document.body.appendChild(d);
  });
  await page.waitForFunction(
    () => !!document.getElementById('late')?.querySelector('svg[data-border-wc="draw"]')
  );
});

test('changing the value tears down old overlay and applies the new one', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForFunction(
    () => !!document.getElementById('ex').querySelector('svg[data-border-wc="squiggle"]')
  );
  await page.evaluate(() =>
    document.getElementById('ex').setAttribute('data-border-effect', 'sparks')
  );
  await page.waitForFunction(() => {
    const el = document.getElementById('ex');
    return (
      !el.querySelector('svg[data-border-wc="squiggle"]') &&
      !!el.querySelector('canvas[data-border-wc="sparks"]')
    );
  });
});

test('removing the attribute tears down the overlay', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForFunction(exBound);
  await page.evaluate(() => document.getElementById('ex').removeAttribute('data-border-effect'));
  await page.waitForFunction(
    () => !document.getElementById('ex').querySelector('[data-border-wc]')
  );
});

test('removing the node tears down its overlay (cleanup runs)', async ({ page }) => {
  await page.goto('/test/binder-page.html');
  await page.waitForFunction(exBound);
  await page.evaluate(() => {
    const el = document.getElementById('ex');
    window.__removed = el; // keep a ref to the now-detached node
    el.remove();
  });
  await page.waitForFunction(() => !window.__removed.querySelector('[data-border-wc]'));
});

test('no console errors during binding', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/test/binder-page.html');
  await page.waitForFunction(exBound);
  expect(errors).toEqual([]);
});
