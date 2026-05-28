// Demos hub entry. Loads the site infrastructure so the hub carries the same
// header + theme-picker as the gallery/docs pages, plus border-wc and
// browser-window. Implements the full overlay UX from bg-wc:
//   - lazy mount/unmount iframes (IntersectionObserver, rootMargin '0px')
//   - click -> unmount others + force-reload this + toggleMaximize
//   - background scroll-lock while any browser-window is maximized
//   - remount currently-visible tiles after overlay close
import 'vanilla-breeze';
import 'vanilla-breeze/css';
import '../src/border-wc.js';
import '@profpowell/browser-window';
import '../docs/prefer-dark.js';

function mountDemo(win) {
  const src = win?.dataset.demoSrc;
  if (src && win.getAttribute('src') !== src) win.setAttribute('src', src);
}
function unmountDemo(win) {
  if (win?.hasAttribute('src')) win.removeAttribute('src');
}

// On overlay open, free contexts: unmount every OTHER tile and force-reload
// this one so the overlay opens with a guaranteed-fresh state.
document.addEventListener('click', (e) => {
  const open = e.target.closest('.bw-open');
  if (!open) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  const win = open.closest('.bw-card')?.querySelector('browser-window');
  if (win && typeof win.toggleMaximize === 'function') {
    e.preventDefault();
    document.querySelectorAll('.bw-card browser-window').forEach((w) => {
      if (w !== win) unmountDemo(w);
    });
    unmountDemo(win);
    mountDemo(win);
    win.toggleMaximize();
  }
});

// Mount tiles only while strictly visible.
const demoObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const win = e.target.querySelector('browser-window');
      if (e.isIntersecting) mountDemo(win);
      else if (!win?.classList.contains('browser-window-maximized')) unmountDemo(win);
    }
  },
  { rootMargin: '0px' }
);
document.querySelectorAll('.bw-card').forEach((card) => demoObserver.observe(card));

function remountVisibleNow() {
  const vh = window.innerHeight;
  for (const card of document.querySelectorAll('.bw-card')) {
    const r = card.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) mountDemo(card.querySelector('browser-window'));
  }
}

// Scroll-lock while overlay is open + remount visible after close.
const docEl = document.documentElement;
let savedOverflow = null;
let wasOverlayOpen = false;
function syncScrollLock() {
  const anyOpen = !!document.querySelector('browser-window.browser-window-maximized');
  if (anyOpen && savedOverflow === null) {
    savedOverflow = docEl.style.overflow;
    docEl.style.overflow = 'hidden';
  } else if (!anyOpen && savedOverflow !== null) {
    docEl.style.overflow = savedOverflow;
    savedOverflow = null;
  }
  if (wasOverlayOpen && !anyOpen) remountVisibleNow();
  wasOverlayOpen = anyOpen;
}
new MutationObserver(syncScrollLock).observe(document.body, {
  subtree: true,
  attributes: true,
  attributeFilter: ['class'],
});
