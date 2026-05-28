// Shared helpers for the effect modules. Each new effect uses either
// attachCanvas (particle / pixel work) or attachOverlaySvg (vector work)
// so the per-effect modules stay small. Existing draw/squiggle/sparks
// are untouched in this PR (refactor in a follow-up).

const SVGNS = 'http://www.w3.org/2000/svg';

// Make the host a positioning context so an absolutely-positioned overlay fits.
function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
  if (cs.display === 'inline') host.style.display = 'block';
}

/**
 * Attach a <canvas> overlay sized to the host, with DPR-aware backing store
 * and a `fit()` helper consumers can call from a ResizeObserver. Returns the
 * canvas, the 2d context, a fit function, and the current host rect.
 */
export function attachCanvas(host, dataAttr) {
  ensurePositioned(host);
  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-border-wc', dataAttr);
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  });
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let dpr = 1;
  let rect = host.getBoundingClientRect();
  const fit = () => {
    rect = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
  };
  fit();
  return {
    canvas,
    ctx,
    fit,
    dpr: () => dpr,
    rect: () => rect,
  };
}

/**
 * Attach a positioned, inset:0, pointer-events:none <svg> overlay to the host
 * with the given `data-border-wc` value. Returns the svg element; the caller
 * appends paths/groups as needed.
 */
export function attachOverlaySvg(host, dataAttr) {
  ensurePositioned(host);
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('data-border-wc', dataAttr);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  Object.assign(svg.style, {
    position: 'absolute',
    inset: '0',
    overflow: 'visible',
    pointerEvents: 'none',
  });
  host.appendChild(svg);
  return svg;
}

export const SVG_NS = SVGNS;

// Inject a <style> tag once, keyed by `key`. Subsequent calls are no-ops.
// Effect modules use this to install per-effect CSS keyframes/rules without
// each instance re-injecting them.
const STYLE_KEYS = new Set();
export function ensureStyles(key, css) {
  if (STYLE_KEYS.has(key)) return;
  const style = document.createElement('style');
  style.setAttribute('data-border-wc-styles', key);
  style.textContent = css;
  document.head.appendChild(style);
  STYLE_KEYS.add(key);
}

// Register the --bwc-angle CSS @property once (no-op if unsupported or already
// registered). Required for smooth conic-gradient rotation in `aurora`.
let ANGLE_REGISTERED = false;
export function ensureAngleProperty() {
  if (ANGLE_REGISTERED) return;
  ANGLE_REGISTERED = true;
  if (typeof CSS === 'undefined' || !CSS.registerProperty) return;
  try {
    CSS.registerProperty({
      name: '--bwc-angle',
      syntax: '<angle>',
      inherits: false,
      initialValue: '0deg',
    });
  } catch (_e) {
    /* already registered */
  }
}
