import { ensureStyles } from './_helpers.js';

const FILMSTRIP_CSS = `
  [data-border-wc="filmstrip-bar"] {
    position: absolute; left: 0; right: 0;
    height: var(--bwc-bar-h, 16px);
    pointer-events: none;
    background-color: var(--bwc-film-bg, oklch(0.16 0.01 60));
    background-image: radial-gradient(circle at 9px center,
      var(--bwc-sprocket, oklch(0.97 0.01 80)) 0 3.4px,
      transparent 3.6px);
    background-size: 18px var(--bwc-bar-h, 16px);
    background-repeat: repeat-x;
  }
`;

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
}

// Filmstrip: two bars top + bottom with sprocket-hole pattern punched by a
// radial-gradient. The host's body is left untouched — only the bars are
// added on top, like film leader passing over the content.
export function createFilmstrip(host, params) {
  ensurePositioned(host);
  ensureStyles('filmstrip', FILMSTRIP_CSS);
  const filmBg = params.color === 'currentColor' ? 'oklch(0.16 0.01 60)' : params.color;
  const barH = Math.max(10, params.thickness * 4 + 6);
  const mk = (edge) => {
    const b = document.createElement('div');
    b.setAttribute('data-border-wc', 'filmstrip-bar');
    b.style.setProperty('--bwc-bar-h', `${barH}px`);
    b.style.setProperty('--bwc-film-bg', filmBg);
    if (edge === 'top') {
      b.style.top = '0';
      b.style.bottom = 'auto';
    } else {
      b.style.bottom = '0';
      b.style.top = 'auto';
    }
    host.appendChild(b);
    return b;
  };
  const top = mk('top');
  const bottom = mk('bottom');
  return () => {
    top.remove();
    bottom.remove();
  };
}
