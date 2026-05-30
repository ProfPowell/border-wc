import { test, expect } from '@playwright/test';

test('washi default (corners) appends 4 strips with multiply blend', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'washi'));
  await page.waitForTimeout(150);
  const result = await page.evaluate(() => {
    const root = document
      .getElementById('bw')
      .querySelector('[data-border-wc="washi"]');
    const strips = root ? root.querySelectorAll('.bwc-strip') : [];
    const blend = strips[0] ? getComputedStyle(strips[0]).mixBlendMode : null;
    return { count: strips.length, blend };
  });
  expect(result.count).toBe(4);
  expect(result.blend).toBe('multiply');
});

test('washi mode="corner" → 2 strips, "top" → 1, "scatter" honors --washi-count', async ({
  page,
}) => {
  await page.goto('/test/test-page.html');
  const counts = await page.evaluate(async () => {
    const el = document.getElementById('bw');
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    el.setAttribute('effect', 'washi');
    el.setAttribute('mode', 'corner');
    await wait(120);
    const c1 = el.querySelectorAll('[data-border-wc="washi"] .bwc-strip').length;
    el.setAttribute('mode', 'top');
    await wait(120);
    const c2 = el.querySelectorAll('[data-border-wc="washi"] .bwc-strip').length;
    el.style.setProperty('--washi-count', '5');
    el.setAttribute('mode', 'scatter');
    await wait(120);
    const c3 = el.querySelectorAll('[data-border-wc="washi"] .bwc-strip').length;
    return [c1, c2, c3];
  });
  expect(counts).toEqual([2, 1, 5]);
});

test('washi fray torn installs the shared filter <svg> exactly once', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const result = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const el = document.getElementById('bw');
    el.setAttribute('effect', 'washi');
    await wait(150);
    // Mount a second host to confirm the filter is shared, not duplicated.
    const el2 = document.createElement('border-wc');
    el2.setAttribute('effect', 'washi');
    el2.style.cssText = 'display:block;width:200px;height:120px';
    document.body.appendChild(el2);
    await wait(150);
    const stripFilter = getComputedStyle(
      el.querySelector('[data-border-wc="washi"] .bwc-strip')
    ).filter;
    const filters = document.querySelectorAll('filter#bwc-washi-fray').length;
    return { stripFilter, filters };
  });
  expect(result.stripFilter).toContain('bwc-washi-fray');
  expect(result.filters).toBe(1);
});

test('--border-wc-color re-tints --pat-a on washi strips', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const pa = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const el = document.getElementById('bw');
    el.style.setProperty('--border-wc-color', 'rgb(255, 0, 128)');
    el.setAttribute('effect', 'washi');
    await wait(150);
    const strip = el.querySelector('[data-border-wc="washi"] .bwc-strip');
    return strip ? strip.style.getPropertyValue('--pat-a').trim() : null;
  });
  expect(pa).toBe('rgb(255, 0, 128)');
});

test('cleanup: removing effect leaves no washi root + shared filter survives', async ({
  page,
}) => {
  await page.goto('/test/test-page.html');
  const result = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const el = document.getElementById('bw');
    el.setAttribute('effect', 'washi');
    await wait(150);
    el.removeAttribute('effect');
    await wait(80);
    return {
      hasRoot: !!el.querySelector('[data-border-wc="washi"]'),
      filterStillThere: !!document.querySelector('filter#bwc-washi-fray'),
    };
  });
  expect(result.hasRoot).toBe(false);
  expect(result.filterStillThere).toBe(true);
});
