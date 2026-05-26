import { roundedRectPath, roundedRectPerimeter } from '../perimeter.js';
import { resolveRadius } from '../params.js';

const SVGNS = 'http://www.w3.org/2000/svg';

export function createDraw(host, params) {
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('data-border-wc', 'draw');
  Object.assign(svg.style, { position: 'absolute', inset: '0', overflow: 'visible', pointerEvents: 'none' });
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  const path = document.createElementNS(SVGNS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', params.color);
  path.setAttribute('stroke-width', String(params.thickness));
  svg.appendChild(path);
  host.appendChild(svg);

  let raf = 0;
  let currentOnEnd = null;
  const render = (animateIn) => {
    if (currentOnEnd) {
      path.removeEventListener('transitionend', currentOnEnd);
      currentOnEnd = null;
    }
    const rect = host.getBoundingClientRect();
    const inset = params.thickness / 2;
    const radius = resolveRadius(host, params);
    path.setAttribute('d', roundedRectPath({ width: rect.width, height: rect.height, radius, inset }));
    const len = roundedRectPerimeter({ width: rect.width, height: rect.height, radius, inset }) || 1;
    path.style.transition = 'none';
    path.style.strokeDasharray = String(len);
    if (!animateIn || params.reduce) {
      path.style.strokeDashoffset = '0';
      host.dispatchEvent(new CustomEvent('border-wc:draw-complete', { detail: {} }));
      return;
    }
    path.style.strokeDashoffset = String(len);
    raf = requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${params.speed}ms linear`;
      path.style.strokeDashoffset = '0';
    });
    const onEnd = (e) => {
      if (e.propertyName !== 'stroke-dashoffset') return;
      host.dispatchEvent(new CustomEvent('border-wc:draw-complete', { detail: {} }));
      path.removeEventListener('transitionend', onEnd);
      if (currentOnEnd === onEnd) currentOnEnd = null;
    };
    currentOnEnd = onEnd;
    path.addEventListener('transitionend', onEnd);
  };
  render(true);
  const ro = new ResizeObserver(() => render(false));
  ro.observe(host);
  return () => {
    cancelAnimationFrame(raf);
    if (currentOnEnd) path.removeEventListener('transitionend', currentOnEnd);
    ro.disconnect();
    svg.remove();
  };
}
