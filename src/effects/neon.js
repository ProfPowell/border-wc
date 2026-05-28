import { roundedRectPath } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

let UID = 0;

// Crisp stroked rounded-rect path wearing a feGaussianBlur+feMerge filter.
// The merged blur layers stack to give a thick halo without the blurry edge
// of a single drop-shadow. SMIL animates stdDeviation for the pulse so we
// don't need per-frame JS.
export function createNeon(host, params) {
  const svg = attachOverlaySvg(host, 'neon');
  const id = `bwc-neon-${++UID}`;

  const defs = document.createElementNS(SVG_NS, 'defs');
  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');
  const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '6');
  blur.setAttribute('result', 'blur');
  const merge = document.createElementNS(SVG_NS, 'feMerge');
  for (let i = 0; i < 3; i++) {
    const n = document.createElementNS(SVG_NS, 'feMergeNode');
    n.setAttribute('in', 'blur');
    merge.appendChild(n);
  }
  const src = document.createElementNS(SVG_NS, 'feMergeNode');
  src.setAttribute('in', 'SourceGraphic');
  merge.appendChild(src);
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', params.color === 'currentColor' ? '#ff2bd6' : params.color);
  path.setAttribute('stroke-width', String(Math.max(2, params.thickness)));
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('filter', `url(#${id})`);
  svg.appendChild(path);

  const fit = () => {
    const r = host.getBoundingClientRect();
    path.setAttribute(
      'd',
      roundedRectPath({
        width: r.width,
        height: r.height,
        radius: resolveRadius(host, params),
        inset: params.thickness / 2,
      })
    );
  };
  fit();

  if (!params.reduce && params.animate !== false) {
    const anim = document.createElementNS(SVG_NS, 'animate');
    anim.setAttribute('attributeName', 'stdDeviation');
    anim.setAttribute('values', '4;10;4');
    anim.setAttribute('dur', `${Math.max(800, params.speed)}ms`);
    anim.setAttribute('repeatCount', 'indefinite');
    blur.appendChild(anim);
  }

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
  };
}
