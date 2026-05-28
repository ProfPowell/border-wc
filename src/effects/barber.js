import { resolveRadius } from '../params.js';
import { ensureStyles } from './_helpers.js';

// Scrolling-diagonal-stripe border. A repeating-linear-gradient is animated
// via background-position; mask-composite punches out the center so only the
// stripes at the perimeter show. Three preset palettes via params.mode.
const BARBER_CSS = `
  [data-border-wc="barber"] {
    position: absolute; inset: 0; pointer-events: none;
    border-radius: var(--bwc-radius, 12px);
    padding: var(--bwc-thickness, 2px);
    background:
      repeating-linear-gradient(var(--bwc-angle, 45deg),
        var(--bwc-c1) 0 var(--bwc-stripe),
        var(--bwc-c2) var(--bwc-stripe) calc(var(--bwc-stripe) * 2));
    background-size: 200% 200%;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  @keyframes bwc-barber-march { to { background-position: 200% 200%; } }
`;

const PRESETS = {
  warning: { c1: '#000', c2: '#ffd400', angle: '45deg', stripe: '14px' },
  candy: { c1: '#ec4899', c2: '#ffffff', angle: '-45deg', stripe: '10px' },
  racing: { c1: '#000', c2: '#ffffff', angle: '0deg', stripe: '16px' },
};

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
}

export function createBarber(host, params) {
  ensurePositioned(host);
  ensureStyles('barber', BARBER_CSS);

  const preset = PRESETS[params.mode] || PRESETS.warning;
  const colors = (params.color || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const c1 = colors[0] && colors[0] !== 'currentColor' ? colors[0] : preset.c1;
  const c2 = colors[1] || preset.c2;
  const radius = resolveRadius(host, params);

  const el = document.createElement('div');
  el.setAttribute('data-border-wc', 'barber');
  el.style.setProperty('--bwc-c1', c1);
  el.style.setProperty('--bwc-c2', c2);
  el.style.setProperty('--bwc-angle', preset.angle);
  el.style.setProperty('--bwc-stripe', preset.stripe);
  el.style.setProperty('--bwc-radius', `${radius}px`);
  el.style.setProperty('--bwc-thickness', `${params.thickness}px`);
  host.appendChild(el);

  if (!params.reduce && params.animate !== false) {
    el.style.animation = `bwc-barber-march ${Math.max(600, params.speed)}ms linear infinite`;
  }

  return () => el.remove();
}
