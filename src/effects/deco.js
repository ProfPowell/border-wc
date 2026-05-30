import { roundedRectPath } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Art Deco: double stroked perimeter + radiating sunburst fans at each corner.
export function createDeco(host, params) {
  const svg = attachOverlaySvg(host, 'deco');
  const gold = params.color === 'currentColor' ? '#c8a86b' : params.color;
  const t = Math.max(1, params.thickness);

  const outer = document.createElementNS(SVG_NS, 'path');
  const inner = document.createElementNS(SVG_NS, 'path');
  for (const p of [outer, inner]) {
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', gold);
  }
  outer.setAttribute('stroke-width', String(t));
  inner.setAttribute('stroke-width', String(t * 0.6));
  inner.setAttribute('opacity', '0.85');
  svg.appendChild(outer);
  svg.appendChild(inner);

  const fans = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(fans);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    outer.setAttribute(
      'd',
      roundedRectPath({ width: r.width, height: r.height, radius, inset: t / 2 })
    );
    inner.setAttribute(
      'd',
      roundedRectPath({
        width: r.width,
        height: r.height,
        radius: Math.max(0, radius - 4),
        inset: t / 2 + 5,
      })
    );

    fans.innerHTML = '';
    const m = Math.max(10, t * 4);
    const baseLen = m * 1.2;
    const corner = (cx, cy, a0) => {
      for (let i = 0; i < 5; i++) {
        const a = ((a0 + (i * 90) / 4) * Math.PI) / 180;
        const len = baseLen + (i % 2 ? 4 : 0);
        const ln = document.createElementNS(SVG_NS, 'line');
        ln.setAttribute('x1', String(cx));
        ln.setAttribute('y1', String(cy));
        ln.setAttribute('x2', String(cx + Math.cos(a) * len));
        ln.setAttribute('y2', String(cy + Math.sin(a) * len));
        ln.setAttribute('stroke', gold);
        ln.setAttribute('stroke-width', String(Math.max(1, t * 0.7)));
        ln.setAttribute('stroke-linecap', 'round');
        fans.appendChild(ln);
      }
    };
    corner(m, m, 0);
    corner(r.width - m, m, 90);
    corner(r.width - m, r.height - m, 180);
    corner(m, r.height - m, 270);
  };
  fit();

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
  };
}
