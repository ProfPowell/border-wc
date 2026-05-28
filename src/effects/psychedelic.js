import { roundedRectPath, roundedRectPerimeter } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Psychedelic: rainbow-hue stroked path with a continuously shifting hue
// rotation and an offset dash that "marches" around the perimeter.
export function createPsychedelic(host, params) {
  const svg = attachOverlaySvg(host, 'psychedelic');
  const defs = document.createElementNS(SVG_NS, 'defs');
  const grad = document.createElementNS(SVG_NS, 'linearGradient');
  const gradId = `psyc-${Math.random().toString(36).slice(2, 9)}`;
  grad.setAttribute('id', gradId);
  grad.setAttribute('x1', '0%');
  grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%');
  grad.setAttribute('y2', '100%');
  const stops = [
    '#ff2bd6',
    '#ff7a2b',
    '#ffe22b',
    '#2bff7a',
    '#2bbcff',
    '#7a2bff',
    '#ff2bd6',
  ];
  stops.forEach((c, i) => {
    const s = document.createElementNS(SVG_NS, 'stop');
    s.setAttribute('offset', `${(i / (stops.length - 1)) * 100}%`);
    s.setAttribute('stop-color', c);
    grad.appendChild(s);
  });
  defs.appendChild(grad);
  svg.appendChild(defs);

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', `url(#${gradId})`);
  path.setAttribute('stroke-width', String(Math.max(2, params.thickness)));
  path.setAttribute('stroke-linecap', 'round');
  const dash = Math.max(8, params.thickness * 3);
  path.setAttribute('stroke-dasharray', `${dash} ${dash * 0.5}`);
  svg.appendChild(path);

  let len = 1;
  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    path.setAttribute('d', roundedRectPath({ width: r.width, height: r.height, radius, inset }));
    len = roundedRectPerimeter({ width: r.width, height: r.height, radius, inset }) || 1;
  };
  fit();

  let raf = 0;
  const start = performance.now();
  function frame(now) {
    if (params.reduce) return;
    const t = (now - start) / 1000;
    path.style.strokeDashoffset = String(-((t * (1500 / params.speed) * len) % len));
    svg.style.filter = `hue-rotate(${(t * 60) % 360}deg)`;
    raf = requestAnimationFrame(frame);
  }
  if (!params.reduce) raf = requestAnimationFrame(frame);

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    svg.remove();
  };
}
