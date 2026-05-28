import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Scallop border: half-circle bumps placed along the perimeter, each rotated
// to the outward normal. Bumps pop in sequence around the path.
export function createScallop(host, params) {
  const svg = attachOverlaySvg(host, 'scallop');
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const g = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(g);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    const sampler = roundedRectSampler({ width: r.width, height: r.height, radius, inset });
    const perim = 2 * (r.width + r.height);
    const bumpR = Math.max(6, params.thickness * 1.5);
    const N = Math.max(8, Math.floor(perim / (bumpR * 2)));
    g.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const [x, y] = sampler(t);
      const [x2, y2] = sampler((t + 0.001) % 1);
      const tx = x2 - x;
      const ty = y2 - y;
      const ang = (Math.atan2(ty, tx) * 180) / Math.PI;
      const bump = document.createElementNS(SVG_NS, 'path');
      bump.setAttribute('d', `M -${bumpR} 0 A ${bumpR} ${bumpR} 0 0 1 ${bumpR} 0 Z`);
      bump.setAttribute('fill', color);
      bump.setAttribute('transform', `translate(${x} ${y}) rotate(${ang + 180})`);
      if (!params.reduce) {
        bump.style.opacity = '0';
        bump.style.transition = `opacity 80ms ease-out ${(t * params.speed) | 0}ms`;
      }
      g.appendChild(bump);
    }
    if (!params.reduce) {
      void svg.getBoundingClientRect();
      g.querySelectorAll('path').forEach((p) => (p.style.opacity = '1'));
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
