import { roundedRectPath } from '../perimeter.js';
import { resolveRadius } from '../params.js';

const SVGNS = 'http://www.w3.org/2000/svg';
let uid = 0;

export function createSquiggle(host, params) {
  const id = `bw-sq-${++uid}`;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('data-border-wc', 'squiggle');
  Object.assign(svg.style, {
    position: 'absolute',
    inset: '0',
    overflow: 'visible',
    pointerEvents: 'none',
  });
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.innerHTML =
    `<defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="1" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter></defs>`;
  const path = document.createElementNS(SVGNS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', params.color);
  path.setAttribute('stroke-width', String(params.thickness));
  path.setAttribute('filter', `url(#${id})`);
  svg.appendChild(path);
  host.appendChild(svg);
  const turb = svg.querySelector('feTurbulence');

  const fit = () => {
    const rect = host.getBoundingClientRect();
    path.setAttribute(
      'd',
      roundedRectPath({
        width: rect.width,
        height: rect.height,
        radius: resolveRadius(host, params),
        inset: params.thickness / 2,
      })
    );
  };
  fit();

  let raf = 0;
  if (params.animate && !params.reduce) {
    let seed = 1;
    let last = 0;
    const loop = (now) => {
      if (now - last > params.speed / 8) {
        turb.setAttribute('seed', String((seed = (seed + 1) % 100)));
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    svg.remove();
  };
}
