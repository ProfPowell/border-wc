import { attachOverlaySvg, SVG_NS, ensureStyles } from './_helpers.js';

const BUNTING_CSS = `
  @keyframes bwc-bunt-sway {
    0%, 100% { transform: rotate(-5deg); }
    50%      { transform: rotate( 5deg); }
  }
`;

const PALETTE = [
  'oklch(0.65 0.22 25)',
  'oklch(0.78 0.16 90)',
  'oklch(0.6 0.16 200)',
  'oklch(0.6 0.18 150)',
];

// Bunting: pennant flags hanging from a quadratic swag along the top edge.
// Each pennant sways with a staggered animation-delay.
export function createBunting(host, params) {
  const svg = attachOverlaySvg(host, 'bunting');
  ensureStyles('bunting', BUNTING_CSS);
  svg.style.overflow = 'visible';
  const dur = Math.max(1800, params.speed * 3);
  const stringColor = params.color === 'currentColor' ? 'oklch(0.3 0.02 50)' : params.color;

  const fit = () => {
    svg.innerHTML = '';
    const r = host.getBoundingClientRect();
    const w = r.width;
    const y0 = -2;
    const sag = 10;
    const N = Math.max(4, Math.round(w / 46));
    const midx = w / 2;

    const swag = document.createElementNS(SVG_NS, 'path');
    swag.setAttribute('d', `M0 ${y0} Q${midx} ${y0 + sag} ${w} ${y0}`);
    swag.setAttribute('fill', 'none');
    swag.setAttribute('stroke', stringColor);
    swag.setAttribute('stroke-width', '1.4');
    svg.appendChild(swag);

    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = u * w;
      const y = y0 + sag * 4 * u * (1 - u);
      const outer = document.createElementNS(SVG_NS, 'g');
      outer.setAttribute('transform', `translate(${x} ${y})`);
      const inner = document.createElementNS(SVG_NS, 'g');
      inner.style.transformBox = 'fill-box';
      inner.style.transformOrigin = 'top center';
      if (!params.reduce && params.animate !== false) {
        inner.style.animation = `bwc-bunt-sway ${dur}ms ease-in-out infinite`;
        inner.style.animationDelay = `-${(u * dur) | 0}ms`;
      }
      const flag = document.createElementNS(SVG_NS, 'path');
      flag.setAttribute('d', 'M-6,0 L6,0 L0,13 Z');
      flag.setAttribute('fill', PALETTE[i % PALETTE.length]);
      inner.appendChild(flag);
      outer.appendChild(inner);
      svg.appendChild(outer);
    }
  };
  fit();

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
  };
}
