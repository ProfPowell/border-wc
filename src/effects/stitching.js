import { roundedRectPath, roundedRectPerimeter } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Dashed-stitch border (denim style) that "sews" itself along the perimeter
// via stroke-dashoffset.
export function createStitching(host, params) {
  const svg = attachOverlaySvg(host, 'stitching');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', params.color === 'currentColor' ? 'currentColor' : params.color);
  path.setAttribute('stroke-width', String(Math.max(2, params.thickness)));
  path.setAttribute('stroke-linecap', 'round');
  // dash + gap pattern; gap larger than dash for the stitched look.
  const dash = Math.max(6, params.thickness * 2);
  path.setAttribute('stroke-dasharray', `${dash} ${dash * 0.7}`);
  svg.appendChild(path);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    path.setAttribute('d', roundedRectPath({ width: r.width, height: r.height, radius, inset }));
    const len = roundedRectPerimeter({ width: r.width, height: r.height, radius, inset }) || 1;
    path.style.transition = 'none';
    path.style.strokeDashoffset = params.reduce ? '0' : String(len);
    if (!params.reduce) {
      void path.getBoundingClientRect();
      path.style.transition = `stroke-dashoffset ${params.speed}ms linear`;
      path.style.strokeDashoffset = '0';
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
