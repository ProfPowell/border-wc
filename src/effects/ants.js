import { roundedRectPath } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS, ensureStyles } from './_helpers.js';

const ANTS_CSS = `
  @keyframes bwc-ants-march { to { stroke-dashoffset: -32; } }
`;

// Marching ants — the classic selection-marquee border. Animated
// stroke-dashoffset on a stroked rounded-rect, with a white underlay so the
// dashes read on any background.
export function createAnts(host, params) {
  const svg = attachOverlaySvg(host, 'ants');
  ensureStyles('ants', ANTS_CSS);
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const t = Math.max(1, params.thickness);

  const under = document.createElementNS(SVG_NS, 'path');
  const top = document.createElementNS(SVG_NS, 'path');
  for (const el of [under, top]) {
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke-width', String(t));
    el.setAttribute('stroke-dasharray', '8 8');
    el.setAttribute('stroke-linecap', 'butt');
  }
  under.setAttribute('stroke', '#fff');
  under.setAttribute('stroke-dashoffset', '8');
  top.setAttribute('stroke', color);
  svg.appendChild(under);
  svg.appendChild(top);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const d = roundedRectPath({ width: r.width, height: r.height, radius, inset: t / 2 });
    under.setAttribute('d', d);
    top.setAttribute('d', d);
  };
  fit();

  if (!params.reduce && params.animate !== false) {
    top.style.animation = `bwc-ants-march ${Math.max(500, params.speed)}ms linear infinite`;
  }
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
  };
}
