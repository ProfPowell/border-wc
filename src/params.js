// Param resolution: CSS custom property (--border-wc-*) → attribute → default.
export function readParams(host) {
  const cs = getComputedStyle(host);
  const cssVar = (n) => cs.getPropertyValue(n).trim();
  const pick = (varName, attr, def, parse = (x) => x) => {
    const v = cssVar(varName);
    if (v) return parse(v);
    const a = host.getAttribute(attr);
    return a != null ? parse(a) : def;
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
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
// Corner radius to use: explicit param, else the host's computed border-radius (px).
export function resolveRadius(host, params) {
  if (Number.isFinite(params.radius)) return params.radius;
  const r = parseFloat(getComputedStyle(host).borderTopLeftRadius);
  return Number.isFinite(r) ? r : 0;
}
