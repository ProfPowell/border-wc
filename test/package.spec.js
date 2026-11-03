import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { EXTREME } from '../src/registry.js';

const json = (f) => JSON.parse(readFileSync(f, 'utf8'));
const pkg = json('package.json');

let packed;
test.beforeAll(() => {
  execSync('npx vite build', { stdio: 'pipe' });
  execSync('npx cem analyze', { stdio: 'pipe' });
  const out = execSync('npm pack --dry-run --json --ignore-scripts', { stdio: 'pipe' });
  packed = JSON.parse(out)[0].files.map((f) => f.path);
});

// Every path a consumer can resolve must be in the tarball.
test('tarball contains every file package.json points at', () => {
  const targets = new Set([pkg.main, pkg.module, pkg.customElements, 'README.md', 'LICENSE']);
  for (const value of Object.values(pkg.exports)) {
    if (typeof value === 'string') targets.add(value.replace(/^\.\//, ''));
    else for (const t of Object.values(value)) targets.add(t.replace(/^\.\//, ''));
  }
  for (const target of targets) expect(packed, target).toContain(target);
});

test('published metadata links back to the project', () => {
  expect(pkg.repository?.url).toContain('ProfPowell/border-wc');
  expect(pkg.homepage).toContain('profpowell.github.io/border-wc');
  expect(pkg.bugs?.url).toContain('ProfPowell/border-wc');
});

test('manifest module paths exist in the tarball', () => {
  const manifest = json('custom-elements.json');
  expect(manifest.modules.length).toBeGreaterThan(0);
  for (const mod of manifest.modules) expect(packed, mod.path).toContain(mod.path);
});

test('manifest describes the public element API', () => {
  const decl = json('custom-elements.json')
    .modules.flatMap((m) => m.declarations ?? [])
    .find((d) => d.tagName === 'border-wc');
  const attrs = Object.fromEntries(decl.attributes.map((a) => [a.name, a]));
  for (const name of [
    'effect',
    'color',
    'thickness',
    'speed',
    'radius',
    'animate',
    'mode',
    'motion',
    'trigger',
    'eager',
  ]) {
    expect(attrs[name]?.description, name).toBeTruthy();
  }
  for (const effect of EXTREME) expect(attrs.effect.type.text).toContain(`'${effect}'`);
  expect(decl.events.map((e) => e.name)).toEqual(
    expect.arrayContaining(['border-wc:effect-applied', 'border-wc:error'])
  );
});

test('type declarations list every effect', () => {
  expect(existsSync('border-wc.d.ts')).toBe(true);
  const types = readFileSync('border-wc.d.ts', 'utf8');
  for (const effect of EXTREME) expect(types).toContain(`'${effect}'`);
});
