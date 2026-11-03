import { test, expect } from '@playwright/test';

// `ants` sets an inline animation on its top path only when motion is allowed.
const animated = (selector) => (page) =>
  page.evaluate((s) => {
    const paths = document.querySelectorAll(`${s} path`);
    return [...paths].some((p) => p.style.animation);
  }, selector);
const hostAnimated = animated('#bw');
const boundAnimated = animated('#bound');

async function mountAnts(page) {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => {
    const host = document.getElementById('bw');
    host.setAttribute('animate', '');
    host.setAttribute('effect', 'ants');
  });
  await expect.poll(() => hostAnimated(page)).toBe(true);
}

test('VB data-motion-reduced stops a running effect, and removing it resumes', async ({ page }) => {
  await mountAnts(page);
  await page.evaluate(() => document.documentElement.setAttribute('data-motion-reduced', ''));
  await expect.poll(() => hostAnimated(page)).toBe(false);
  await page.evaluate(() => document.documentElement.removeAttribute('data-motion-reduced'));
  await expect.poll(() => hostAnimated(page)).toBe(true);
});

test('data-motion-reduced present at load keeps the effect static', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-motion-reduced', '');
    const host = document.getElementById('bw');
    host.setAttribute('animate', '');
    host.setAttribute('effect', 'ants');
  });
  await expect.poll(() => page.locator('#bw path').count()).toBeGreaterThan(0);
  expect(await hostAnimated(page)).toBe(false);
});

test('motion="force" wins over data-motion-reduced', async ({ page }) => {
  await mountAnts(page);
  await page.evaluate(() => {
    document.getElementById('bw').setAttribute('motion', 'force');
    document.documentElement.setAttribute('data-motion-reduced', '');
  });
  await page.waitForTimeout(150);
  expect(await hostAnimated(page)).toBe(true);
});

test('a live prefers-reduced-motion change stops a running effect', async ({ page }) => {
  await mountAnts(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => hostAnimated(page)).toBe(false);
});

test('binder follows data-motion-reduced on an applied element', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(async () => {
    const el = document.createElement('div');
    el.id = 'bound';
    el.setAttribute('animate', '');
    el.setAttribute('data-border-effect', 'ants');
    document.body.append(el);
    await import('/src/data-border-effect.js');
  });
  await expect.poll(() => boundAnimated(page)).toBe(true);
  await page.evaluate(() => document.documentElement.setAttribute('data-motion-reduced', ''));
  await expect.poll(() => boundAnimated(page)).toBe(false);
});

test('disconnected hosts stop listening for motion changes', async ({ page }) => {
  await mountAnts(page);
  const applied = await page.evaluate(async () => {
    const host = document.getElementById('bw');
    let count = 0;
    host.addEventListener('border-wc:effect-applied', () => count++);
    host.remove();
    document.documentElement.setAttribute('data-motion-reduced', '');
    await new Promise((r) => setTimeout(r, 100));
    return count;
  });
  expect(applied).toBe(0);
});
