import { roundedRectPath } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

export function createGlitch(host, params) {
  const svg = attachOverlaySvg(host, 'glitch');
  const channels = [
    { color: '#ff2b6a', el: document.createElementNS(SVG_NS, 'path') },
    { color: '#2bff8a', el: document.createElementNS(SVG_NS, 'path') },
    { color: '#2bb9ff', el: document.createElementNS(SVG_NS, 'path') },
  ];
  for (const c of channels) {
    c.el.setAttribute('fill', 'none');
    c.el.setAttribute('stroke', c.color);
    c.el.setAttribute('stroke-width', String(params.thickness));
    c.el.style.mixBlendMode = 'screen';
    svg.appendChild(c.el);
  }

  const fit = () => {
    const r = host.getBoundingClientRect();
    const d = roundedRectPath({
      width: r.width,
      height: r.height,
      radius: resolveRadius(host, params),
      inset: params.thickness / 2,
    });
    channels.forEach((c) => c.el.setAttribute('d', d));
  };
  fit();

  let timer = 0;
  function shuffle() {
    channels.forEach((c) => {
      const dx = (Math.random() - 0.5) * 6;
      const dy = (Math.random() - 0.5) * 6;
      c.el.setAttribute('transform', `translate(${dx} ${dy})`);
    });
  }
  shuffle();
  if (!params.reduce) {
    timer = setInterval(shuffle, Math.max(100, params.speed / 6));
  }

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    clearInterval(timer);
    ro.disconnect();
    svg.remove();
  };
}
