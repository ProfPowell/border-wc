import { attachLayer } from './_helpers.js';

// Y2K "Aqua" gloss: a vertical color-mix() gradient fill with inset highlight +
// shade, a soft drop shadow, and a glossy top-half highlight overlay. Mutates
// host inline styles directly (capturing prior values for cleanup) and attaches
// one pointer-events:none gloss layer.
export function createAqua(host, params) {
  const hue = params.color && params.color !== 'currentColor' ? params.color : 'oklch(0.62 0.17 240)';
  const radius = Number.isFinite(params.radius) ? params.radius : 18;

  const prev = {
    borderRadius: host.style.borderRadius,
    color: host.style.color,
    textShadow: host.style.textShadow,
    background: host.style.background,
    boxShadow: host.style.boxShadow,
    border: host.style.border,
  };

  host.style.borderRadius = `${radius}px`;
  host.style.color = '#fff';
  host.style.textShadow = '0 1px 1px rgba(0, 0, 0, .35)';
  host.style.background =
    `linear-gradient(180deg, color-mix(in oklch, ${hue}, white 38%), ` +
    `${hue} 48%, color-mix(in oklch, ${hue}, black 22%))`;
  host.style.boxShadow =
    'inset 0 1px 1px rgba(255, 255, 255, .9), ' +
    'inset 0 -10px 18px rgba(0, 0, 0, .25), ' +
    `0 8px 20px color-mix(in oklch, ${hue}, transparent 55%)`;
  host.style.border = `1px solid color-mix(in oklch, ${hue}, black 30%)`;

  const gloss = attachLayer(host, 'aqua-gloss');
  Object.assign(gloss.style, {
    inset: 'auto',
    top: '2px',
    left: '4px',
    right: '4px',
    height: '42%',
    borderRadius: '16px 16px 60% 60% / 16px 16px 30% 30%',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, .75), rgba(255, 255, 255, .05))',
  });

  return () => {
    gloss.remove();
    host.style.borderRadius = prev.borderRadius;
    host.style.color = prev.color;
    host.style.textShadow = prev.textShadow;
    host.style.background = prev.background;
    host.style.boxShadow = prev.boxShadow;
    host.style.border = prev.border;
  };
}
