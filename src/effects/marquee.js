import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, ensureStyles, SVG_NS } from './_helpers.js';

const MARQUEE_CSS = `
  @keyframes bwc-marquee-chase {
    0%, 100% { opacity: 0.2; }
    10%      { opacity: 1; }
    20%      { opacity: 0.2; }
  }
`;

// Round "bulbs" around the perimeter, with a chase-light wave traveling
// around. Each bulb gets a staggered animation-delay (-t * duration) so the
// 0%→10%→20% pulse window cycles through them in order. mode=chase is
// sequential, sparkle is random, random is arrhythmic.
export function createMarquee(host, params) {
  ensureStyles('marquee', MARQUEE_CSS);
  const svg = attachOverlaySvg(host, 'marquee');
  const color = params.color === 'currentColor' ? '#fff7d6' : params.color;
  svg.style.filter = `drop-shadow(0 0 ${params.thickness * 2}px ${color})`;

  const fit = () => {
    svg.innerHTML = '';
    const r = host.getBoundingClientRect();
    const sampler = roundedRectSampler({
      width: r.width,
      height: r.height,
      radius: resolveRadius(host, params),
      inset: params.thickness / 2,
    });
    const perim = 2 * (r.width + r.height);
    const bulbR = Math.max(3, params.thickness * 1.2);
    const N = Math.max(10, Math.floor(perim / (bulbR * 4)));
    const dur = Math.max(800, params.speed);
    const mode = params.mode || 'chase';
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const [x, y] = sampler(t);
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', String(x));
      c.setAttribute('cy', String(y));
      c.setAttribute('r', String(bulbR));
      c.setAttribute('fill', color);
      if (params.reduce || params.animate === false) {
        c.setAttribute('opacity', '1');
      } else {
        const delay =
          mode === 'sparkle'
            ? Math.random() * dur
            : mode === 'random'
              ? t * dur * (1 + Math.random())
              : t * dur;
        c.style.animation = `bwc-marquee-chase ${dur}ms linear infinite`;
        c.style.animationDelay = `-${delay.toFixed(0)}ms`;
      }
      svg.appendChild(c);
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
