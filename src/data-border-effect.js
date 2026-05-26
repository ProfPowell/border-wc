// Opt-in binder: applies border-wc's extreme effects to any element annotated
// with data-border-effect="squiggle|draw|sparks". Base values (spin/pulse/…)
// are vanilla-breeze CSS and ignored here. Importing this module auto-scans
// the document and watches for changes. Mirrors @profpowell/gl-wc/data-bg.
import { EFFECTS, EXTREME, styleHost } from './registry.js';
import { readParams, reducedMotion } from './params.js';

// el → { value, cleanup, token }. WeakMap so detached nodes are collectable.
const bound = new WeakMap();
let observer = null;

// First extreme value in the (space-separated) attribute, else null.
function extremeValue(el) {
  const raw = el.getAttribute('data-border-effect');
  if (!raw) return null;
  for (const v of raw.trim().split(/\s+/)) {
    if (EXTREME.includes(v)) return v;
  }
  return null;
}

function teardown(el) {
  const prev = bound.get(el);
  if (!prev) return;
  try {
    prev.cleanup?.();
  } catch {
    /* effect cleanup is best-effort */
  }
  bound.delete(el);
}

async function applyTo(el) {
  const value = extremeValue(el);
  const prev = bound.get(el);
  if (prev && prev.value === value) return; // unchanged (applied or load in flight)
  teardown(el);
  if (!value) return; // base / unknown / removed → no-op

  // Claim the slot synchronously so a racing change can invalidate this run.
  const token = {};
  bound.set(el, { value, cleanup: null, token });

  let create;
  try {
    create = await EFFECTS[value]();
  } catch {
    if (bound.get(el)?.token === token) bound.delete(el); // clear so the same value can retry
    return;
  }
  const cur = bound.get(el);
  if (!cur || cur.token !== token || !el.isConnected) return; // superseded mid-load

  styleHost(el);
  const params = { ...readParams(el), reduce: reducedMotion(el) };
  try {
    cur.cleanup = create(el, params) || null;
  } catch {
    /* effect threw on apply; leave element unstyled */
  }
}

// Scan a subtree and (re)bind every annotated element.
export function bindBorderEffects(root = document) {
  if (root.nodeType === 1 && root.hasAttribute('data-border-effect')) applyTo(root);
  root.querySelectorAll?.('[data-border-effect]').forEach(applyTo);
}

// Stop watching for future DOM changes. Does NOT tear down already-applied
// effects — those clean up when their elements are removed or their value
// changes (while the observer is still connected).
export function stopWatching() {
  observer?.disconnect();
  observer = null;
}

function eachAnnotated(node, fn) {
  if (node.nodeType !== 1) return;
  if (node.hasAttribute('data-border-effect')) fn(node);
  node.querySelectorAll?.('[data-border-effect]').forEach(fn);
}

function startWatching() {
  if (observer) return;
  observer = new MutationObserver((records) => {
    for (const rec of records) {
      if (rec.type === 'attributes') {
        applyTo(rec.target);
      } else {
        rec.addedNodes.forEach((n) => eachAnnotated(n, applyTo));
        rec.removedNodes.forEach((n) => eachAnnotated(n, teardown));
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-border-effect'],
  });
}

function init() {
  bindBorderEffects();
  startWatching();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
