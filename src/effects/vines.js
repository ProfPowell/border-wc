import { roundedRectPath, roundedRectPerimeter, roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

export function createVines(host, params) {
  const svg = attachOverlaySvg(host, 'vines');
  const vine = document.createElementNS(SVG_NS, 'path');
  vine.setAttribute('fill', 'none');
  vine.setAttribute('stroke', params.color === 'currentColor' ? '#2f6b2a' : params.color);
  vine.setAttribute('stroke-width', String(Math.max(2, params.thickness)));
  vine.setAttribute('stroke-linecap', 'round');
  svg.appendChild(vine);
  const leaves = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(leaves);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    vine.setAttribute('d', roundedRectPath({ width: r.width, height: r.height, radius, inset }));
    const len = roundedRectPerimeter({ width: r.width, height: r.height, radius, inset }) || 1;
    const sampler = roundedRectSampler({
      width: r.width,
      height: r.height,
      radius,
      inset,
    });
    vine.style.transition = 'none';
    vine.style.strokeDasharray = String(len);
    vine.style.strokeDashoffset = params.reduce ? '0' : String(len);
    leaves.innerHTML = '';
    const LEAF_COUNT = 14;
    for (let i = 0; i < LEAF_COUNT; i++) {
      const t = i / LEAF_COUNT;
      const [x, y] = sampler(t);
      const [x2, y2] = sampler((t + 0.001) % 1);
      const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const leaf = document.createElementNS(SVG_NS, 'path');
      leaf.setAttribute('d', 'M0 0 q6 -4 12 0 q-6 4 -12 0 z');
      leaf.setAttribute('fill', '#4a9c44');
      leaf.setAttribute('transform', `translate(${x} ${y}) rotate(${ang + 90})`);
      leaf.style.opacity = params.reduce ? '1' : '0';
      leaf.style.transition = `opacity 200ms linear ${(t * params.speed).toFixed(0)}ms`;
      leaves.appendChild(leaf);
    }
  };
  fit();

  if (!params.reduce) {
    // Force reflow before starting transition (same fix as draw.js).
    void vine.getBoundingClientRect();
    vine.style.transition = `stroke-dashoffset ${params.speed}ms ease-out`;
    vine.style.strokeDashoffset = '0';
    requestAnimationFrame(() => {
      leaves.querySelectorAll('path').forEach((l) => (l.style.opacity = '1'));
    });
  }

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
  };
}
