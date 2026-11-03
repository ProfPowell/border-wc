import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const goto = (page) => page.goto('/test/test-page.html');

test('removing effect while its module loads leaves nothing mounted', async ({ page }) => {
  await goto(page);
  await page.evaluate(async () => {
    const host = document.createElement('border-wc');
    host.id = 'race';
    host.setAttribute('eager', '');
    document.body.append(host);
    host.setAttribute('effect', 'ants');
    host.removeAttribute('effect');
  });
  await page.waitForTimeout(150);
  expect(await page.locator('#race [data-border-wc]').count()).toBe(0);
});

for (const name of ['constructor', 'toString', '__proto__']) {
  test(`effect="${name}" is an unknown effect, not an error`, async ({ page }) => {
    await goto(page);
    const errored = await page.evaluate(async (n) => {
      const host = document.getElementById('bw');
      let fired = false;
      host.addEventListener('border-wc:error', () => (fired = true));
      host.setAttribute('effect', n);
      await new Promise((r) => setTimeout(r, 100));
      return fired;
    }, name);
    expect(errored).toBe(false);
  });
}

test('non-numeric thickness and speed fall back to defaults', async ({ page }) => {
  await goto(page);
  const params = await page.evaluate(async () => {
    const { readParams } = await import('/src/params.js');
    const el = document.createElement('div');
    el.setAttribute('thickness', 'wide');
    el.setAttribute('speed', 'fast');
    document.body.append(el);
    return readParams(el);
  });
  expect(params.thickness).toBe(2);
  expect(params.speed).toBe(1000);
});

test('binder: element removed mid-load can be bound again', async ({ page }) => {
  await goto(page);
  const mounted = await page.evaluate(async () => {
    const { bindBorderEffects, stopWatching } = await import('/src/data-border-effect.js');
    stopWatching();
    const el = document.createElement('div');
    el.setAttribute('data-border-effect', 'ants');
    document.body.append(el);
    bindBorderEffects(el);
    el.remove();
    await new Promise((r) => setTimeout(r, 100));
    document.body.append(el);
    bindBorderEffects(el);
    await new Promise((r) => setTimeout(r, 100));
    return !!el.querySelector('[data-border-wc]');
  });
  expect(mounted).toBe(true);
});

test('modules can be imported without a DOM (SSR)', () => {
  for (const file of ['./src/border-wc.js', './src/data-border-effect.js']) {
    expect(() =>
      execFileSync('node', ['--input-type=module', '-e', `await import('${file}')`], {
        stdio: 'pipe',
      })
    ).not.toThrow();
  }
});
