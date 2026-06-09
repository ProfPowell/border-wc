// Neo-Brutalism: a thick solid border with a hard (no-blur) offset box-shadow
// and a flat accent fill, plus a press-in translate on hover. Like chroma, this
// mutates host inline styles directly and captures the prior values so cleanup
// restores them exactly.
export function createBrutalist(host, params) {
  const ink = params.color && params.color !== 'currentColor' ? params.color : '#1a1a1a';
  const accent = '#ffd23f';
  const bw = Math.max(3, params.thickness);
  const off = Math.round(bw * 2.5);
  const radius = Number.isFinite(params.radius) ? params.radius : 4;

  // Capture prior inline values so cleanup is non-destructive.
  const prev = {
    border: host.style.border,
    borderRadius: host.style.borderRadius,
    background: host.style.background,
    boxShadow: host.style.boxShadow,
    transition: host.style.transition,
    color: host.style.color,
    transform: host.style.transform,
  };

  host.style.border = `${bw}px solid ${ink}`;
  host.style.borderRadius = `${radius}px`;
  host.style.background = accent;
  host.style.color = ink;
  host.style.boxShadow = `${off}px ${off}px 0 0 ${ink}`;
  host.style.transition = params.reduce ? '' : 'transform .14s ease, box-shadow .14s ease';
  host.setAttribute('data-border-wc-brutalist', '');

  const enter = () => {
    host.style.transform = `translate(${-bw}px, ${-bw}px)`;
    host.style.boxShadow = `${off + bw}px ${off + bw}px 0 0 ${ink}`;
  };
  const leave = () => {
    host.style.transform = prev.transform;
    host.style.boxShadow = `${off}px ${off}px 0 0 ${ink}`;
  };
  host.addEventListener('pointerenter', enter);
  host.addEventListener('pointerleave', leave);

  return () => {
    host.removeEventListener('pointerenter', enter);
    host.removeEventListener('pointerleave', leave);
    host.removeAttribute('data-border-wc-brutalist');
    host.style.border = prev.border;
    host.style.borderRadius = prev.borderRadius;
    host.style.background = prev.background;
    host.style.boxShadow = prev.boxShadow;
    host.style.transition = prev.transition;
    host.style.color = prev.color;
    host.style.transform = prev.transform;
  };
}
