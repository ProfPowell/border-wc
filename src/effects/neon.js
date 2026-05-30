import { roundedRectPath } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS, ensureStyles } from './_helpers.js';

let UID = 0;

const SYNTHWAVE_CSS = `
  @keyframes bwc-neon-synth-scan {
    from { transform: translateY(-100%); }
    to   { transform: translateY(400%); }
  }
  [data-border-wc="neon-scan"] {
    position: absolute; left: 0; right: 0;
    height: 26%; top: 0;
    pointer-events: none;
    background: linear-gradient(180deg,
      transparent,
      oklch(0.85 0.18 200 / .22),
      transparent);
  }
`;

const SYNTH_STOPS = [
  ['0%', 'oklch(0.85 0.18 200)'], // cyan
  ['50%', 'oklch(0.8 0.2 330)'], // magenta
  ['100%', 'oklch(0.85 0.18 60)'], // orange
];

// Crisp stroked rounded-rect path wearing a feGaussianBlur+feMerge halo. SMIL
// animates stdDeviation for the pulse — no per-frame JS.
//
// mode="synthwave" swaps the solid stroke for a multi-stop linearGradient,
// widens the bloom, and adds a sweeping horizontal scanline overlay. The
// user's `color` is intentionally ignored in this mode (the palette is the
// look) — set mode="center" (default) to get colorable neon.
export function createNeon(host, params) {
  const svg = attachOverlaySvg(host, 'neon');
  const id = `bwc-neon-${++UID}`;
  const synthwave = params.mode === 'synthwave';
  if (synthwave) ensureStyles('neon-synth', SYNTHWAVE_CSS);

  const defs = document.createElementNS(SVG_NS, 'defs');
  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');
  const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', synthwave ? '10' : '6');
  blur.setAttribute('result', 'blur');
  const merge = document.createElementNS(SVG_NS, 'feMerge');
  for (let i = 0; i < (synthwave ? 4 : 3); i++) {
    const n = document.createElementNS(SVG_NS, 'feMergeNode');
    n.setAttribute('in', 'blur');
    merge.appendChild(n);
  }
  const src = document.createElementNS(SVG_NS, 'feMergeNode');
  src.setAttribute('in', 'SourceGraphic');
  merge.appendChild(src);
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);

  let strokeRef;
  if (synthwave) {
    const gradId = `bwc-neon-grad-${UID}`;
    const grad = document.createElementNS(SVG_NS, 'linearGradient');
    grad.setAttribute('id', gradId);
    grad.setAttribute('x1', '0%');
    grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%');
    grad.setAttribute('y2', '100%');
    for (const [offset, color] of SYNTH_STOPS) {
      const stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', offset);
      stop.setAttribute('stop-color', color);
      grad.appendChild(stop);
    }
    defs.appendChild(grad);
    strokeRef = `url(#${gradId})`;
  } else {
    strokeRef = params.color === 'currentColor' ? '#ff2bd6' : params.color;
  }
  svg.appendChild(defs);

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', strokeRef);
  path.setAttribute('stroke-width', String(Math.max(2, params.thickness)));
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('filter', `url(#${id})`);
  svg.appendChild(path);

  const fit = () => {
    const r = host.getBoundingClientRect();
    path.setAttribute(
      'd',
      roundedRectPath({
        width: r.width,
        height: r.height,
        radius: resolveRadius(host, params),
        inset: params.thickness / 2,
      })
    );
  };
  fit();

  if (!params.reduce && params.animate !== false) {
    const anim = document.createElementNS(SVG_NS, 'animate');
    anim.setAttribute('attributeName', 'stdDeviation');
    anim.setAttribute('values', synthwave ? '6;14;6' : '4;10;4');
    anim.setAttribute('dur', `${Math.max(800, params.speed)}ms`);
    anim.setAttribute('repeatCount', 'indefinite');
    blur.appendChild(anim);
  }

  let scan = null;
  if (synthwave) {
    scan = document.createElement('div');
    scan.setAttribute('data-border-wc', 'neon-scan');
    if (!params.reduce && params.animate !== false) {
      scan.style.animation = `bwc-neon-synth-scan ${Math.max(2400, params.speed * 3)}ms linear infinite`;
    }
    host.appendChild(scan);
  }

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
    if (scan) scan.remove();
  };
}
