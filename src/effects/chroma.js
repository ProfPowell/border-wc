import { ensureStyles } from './_helpers.js';

// Eight directional 1px (or thickness-scaled) shadows in three colors. Drift
// keyframe permutes the colors so the chromatic offset oscillates without
// rotating the element. We mutate host.style.boxShadow (capturing the prior
// value so cleanup restores it).
const CHROMA_CSS = `
  [data-border-wc-chroma] {
    animation: bwc-chroma-drift var(--bwc-chroma-dur, 1.6s) ease-in-out infinite;
  }
  @keyframes bwc-chroma-drift {
    0%, 100% { box-shadow: var(--bwc-shadow-a); }
    50%      { box-shadow: var(--bwc-shadow-b); }
  }
`;

function buildShadow(t, c1, c2, c3) {
  return [
    `0 ${t}px 0 0 ${c1}`,
    `0 ${-t}px 0 0 ${c2}`,
    `${t}px 0 0 0 ${c1}`,
    `${-t}px 0 0 0 ${c2}`,
    `${t}px ${-t}px 0 0 ${c3}`,
    `${-t}px ${t}px 0 0 ${c3}`,
    `${t}px ${t}px 0 0 ${c1}`,
    `${-t}px ${-t}px 0 0 ${c2}`,
  ].join(', ');
}

export function createChroma(host, params) {
  ensureStyles('chroma', CHROMA_CSS);

  const colors = (params.color || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const [R, G, B] = [
    colors[0] && colors[0] !== 'currentColor' ? colors[0] : 'rgba(255, 80, 120, 0.85)',
    colors[1] || 'rgba(80, 200, 255, 0.85)',
    colors[2] || 'rgba(255, 200, 0, 0.65)',
  ];
  const t = Math.max(1, params.thickness);
  const a = buildShadow(t, R, G, B);
  const b = buildShadow(t + 1, G, B, R);

  const prevShadow = host.style.boxShadow || '';
  const prevAnim = host.style.animation || '';
  host.style.setProperty('--bwc-shadow-a', a);
  host.style.setProperty('--bwc-shadow-b', b);
  host.style.setProperty('--bwc-chroma-dur', `${Math.max(800, params.speed * 2)}ms`);
  host.style.boxShadow = a;
  host.setAttribute('data-border-wc-chroma', '');
  if (params.reduce || params.animate === false) host.style.animation = 'none';

  return () => {
    host.removeAttribute('data-border-wc-chroma');
    host.style.boxShadow = prevShadow;
    host.style.animation = prevAnim;
    host.style.removeProperty('--bwc-shadow-a');
    host.style.removeProperty('--bwc-shadow-b');
    host.style.removeProperty('--bwc-chroma-dur');
  };
}
