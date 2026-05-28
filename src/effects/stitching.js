import { roundedRectSampler, roundedRectPerimeter } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Embroidered cross-stitch border. Discrete `×` marks are placed along the
// perimeter (vs rope's continuous twisted strands), revealing in sequence.
export function createStitching(host, params) {
  const svg = attachOverlaySvg(host, 'stitching');
  const g = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(g);

  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const stroke = Math.max(1.5, params.thickness * 0.8);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    const sampler = roundedRectSampler({ width: r.width, height: r.height, radius, inset });
    const perim = roundedRectPerimeter({ width: r.width, height: r.height, radius, inset }) || 1;
    // Each cross occupies ~size × size; spacing along the path is `step`.
    const size = Math.max(5, params.thickness * 2.4);
    const step = size * 1.6;
    const N = Math.max(8, Math.floor(perim / step));
    g.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const [x, y] = sampler(t);
      const [x2, y2] = sampler((t + 0.001) % 1);
      const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const cross = document.createElementNS(SVG_NS, 'g');
      cross.setAttribute('transform', `translate(${x} ${y}) rotate(${ang})`);
      const half = size / 2;
      for (const [x1, y1, x2b, y2b] of [
        [-half, -half, half, half],
        [-half, half, half, -half],
      ]) {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', String(x1));
        line.setAttribute('y1', String(y1));
        line.setAttribute('x2', String(x2b));
        line.setAttribute('y2', String(y2b));
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', String(stroke));
        line.setAttribute('stroke-linecap', 'round');
        cross.appendChild(line);
      }
      if (!params.reduce) {
        cross.style.opacity = '0';
        cross.style.transition = `opacity 100ms ease-out ${(t * params.speed) | 0}ms`;
      }
      g.appendChild(cross);
    }
    if (!params.reduce) {
      void svg.getBoundingClientRect();
      g.querySelectorAll('g').forEach((c) => (c.style.opacity = '1'));
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
