// Param resolution: CSS custom property (--border-wc-*) → attribute → default.
// A value that does not parse as a number falls through to the next source.
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function readParams(host) {
  const cs = getComputedStyle(host);
  const cssVar = (n) => cs.getPropertyValue(n).trim();
  const pick = (varName, attr, def, parse = (x) => x) => {
    for (const raw of [cssVar(varName) || null, host.getAttribute(attr)]) {
      if (raw == null) continue;
      const value = parse(raw);
      if (!Number.isNaN(value)) return value;
    }
    return def;
  };
  return {
    color: pick('--border-wc-color', 'color', 'currentColor'),
    thickness: pick('--border-wc-thickness', 'thickness', 2, parseFloat),
    speed: pick('--border-wc-speed', 'speed', 1000, parseFloat),
    radius: pick('--border-wc-radius', 'radius', null, parseFloat),
    animate: host.hasAttribute('animate'),
    mode: host.getAttribute('mode') || 'center',
  };
}
export function reducedMotion(host) {
  const m = host.getAttribute('motion');
  if (m === 'reduce') return true;
  if (m === 'force') return false;
  return (
    matchMedia(REDUCED_MOTION_QUERY).matches ||
    document.documentElement.hasAttribute('data-motion-reduced')
  );
}

// Notifies when the page-level motion preference may have changed: the media
// query, or vanilla-breeze's root data-motion-reduced attribute. One shared pair
// of listeners serves every subscriber. Returns an unsubscribe function.
const motionListeners = new Set();
let stopMotionWatch = null;
export function onMotionChange(listener) {
  motionListeners.add(listener);
  if (!stopMotionWatch) {
    const notify = () => motionListeners.forEach((fn) => fn());
    const query = matchMedia(REDUCED_MOTION_QUERY);
    const root = new MutationObserver(notify);
    query.addEventListener('change', notify);
    root.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion-reduced'],
    });
    stopMotionWatch = () => {
      query.removeEventListener('change', notify);
      root.disconnect();
    };
  }
  return () => {
    motionListeners.delete(listener);
    if (!motionListeners.size) {
      stopMotionWatch();
      stopMotionWatch = null;
    }
  };
}
// Corner radius to use: explicit param, else the host's computed border-radius (px).
export function resolveRadius(host, params) {
  if (Number.isFinite(params.radius)) return params.radius;
  const r = parseFloat(getComputedStyle(host).borderTopLeftRadius);
  return Number.isFinite(r) ? r : 0;
}
