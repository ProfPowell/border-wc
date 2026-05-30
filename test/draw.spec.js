import { test, expect } from '@playwright/test';
test('draw appends an SVG stroke and emits draw-complete', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const done = page.evaluate(() => new Promise((res) => {
    const el = document.getElementById('bw');
    el.addEventListener('border-wc:draw-complete', () => res(true), { once: true });
    el.setAttribute('speed', '120');
    el.setAttribute('effect', 'draw');
  }));
  await page.waitForTimeout(50);
  const hasSvg = await page.evaluate(() => !!document.getElementById('bw').querySelector('svg[data-border-wc="draw"]'));
  expect(hasSvg).toBe(true);
  expect(await done).toBe(true);
});

test('draw stroke animation actually runs over `speed` ms (not instantly)', async ({ page }) => {
  // Regression: an earlier impl let the ResizeObserver's initial-observe
  // callback (and rAF-collapse) clobber the transition, so draw-complete
  // fired at ~10ms regardless of `speed`. Verify the elapsed time matches.
  await page.goto('/test/test-page.html');
  const SPEED = 400;
  const elapsed = await page.evaluate((speed) => new Promise((res) => {
    const el = document.getElementById('bw');
    el.setAttribute('animate', '');
    el.setAttribute('speed', String(speed));
    el.setAttribute('effect', 'draw');
    const t0 = performance.now();
    el.addEventListener('border-wc:draw-complete', () => res(performance.now() - t0), { once: true });
  }), SPEED);
  // Should be ≈ SPEED ms (allow generous slack for rAF + paint scheduling).
  expect(elapsed).toBeGreaterThan(SPEED * 0.7);
  expect(elapsed).toBeLessThan(SPEED * 2.5);
});

test('draw trigger="scroll" attaches the bwc-scroll class (when supported)', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const r = await page.evaluate(async () => {
    const el = document.getElementById('bw');
    el.setAttribute('trigger', 'scroll');
    el.setAttribute('animate', '');
    el.setAttribute('effect', 'draw');
    await new Promise((r) => setTimeout(r, 150));
    const path = el.querySelector('svg[data-border-wc="draw"] path');
    return {
      supported: CSS.supports('animation-timeline', 'view()'),
      hasScrollClass: !!path && path.classList.contains('bwc-scroll'),
      dashoffset: path && path.style.strokeDashoffset,
      dasharray: path && path.style.strokeDasharray,
    };
  });
  // Chromium supports scroll-driven animations; the path should opt into the class.
  if (r.supported) {
    expect(r.hasScrollClass).toBe(true);
    // Initial offset = path length (un-drawn), revealed by the scroll-driven keyframes.
    expect(parseFloat(r.dashoffset)).toBeGreaterThan(0);
    expect(parseFloat(r.dasharray)).toBeGreaterThan(0);
  } else {
    // Unsupported engines fall through to fully-drawn — no class, dashoffset 0.
    expect(r.hasScrollClass).toBe(false);
  }
});

test('draw replay (refresh) re-runs the animation', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const result = await page.evaluate(() => new Promise((res) => {
    const el = document.getElementById('bw');
    el.setAttribute('animate', '');
    el.setAttribute('speed', '300');
    el.setAttribute('effect', 'draw');
    // Wait for first animation to complete, then refresh and time the second.
    el.addEventListener('border-wc:draw-complete', () => {
      const t0 = performance.now();
      el.addEventListener('border-wc:draw-complete', () => res({ replayElapsed: performance.now() - t0 }), { once: true });
      el.refresh();
    }, { once: true });
  }));
  expect(result.replayElapsed).toBeGreaterThan(300 * 0.7);
  expect(result.replayElapsed).toBeLessThan(300 * 2.5);
});
