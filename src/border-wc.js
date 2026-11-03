import { onMotionChange, readParams, reducedMotion } from './params.js';
import { EFFECTS, styleHost } from './registry.js';

const IO_ROOT_MARGIN = '200px';

/**
 * Light-DOM web component for high-touch border effects.
 *
 * @customElement border-wc
 * @attr {string} effect - Effect name. Unknown values are a no-op, so vanilla-breeze base values stay CSS-only.
 * @attr {string} color - Stroke or particle color: any CSS color. Default `currentColor`.
 * @attr {number} thickness - Stroke width in px. Default 2.
 * @attr {number} speed - Animation duration in ms. Default 1000.
 * @attr {number} radius - Corner radius in px. Default: the host's computed border-radius.
 * @attr {boolean} animate - Plays the effect's entrance or loop animation.
 * @attr {string} mode - Effect-specific variant, such as `synthwave` on `neon`.
 * @attr {'auto' | 'reduce' | 'force'} motion - `reduce` forces static, `force` forces animation, `auto` follows prefers-reduced-motion and vanilla-breeze's data-motion-reduced.
 * @attr {'time' | 'scroll'} trigger - When the `draw` effect reveals: on a timer or as the host scrolls into view.
 * @attr {boolean} eager - Applies on connect instead of waiting until the host nears the viewport.
 * @fires {CustomEvent<{effect: string}>} border-wc:effect-applied - An effect was mounted.
 * @fires {CustomEvent<{error: unknown}>} border-wc:error - An effect threw while mounting.
 * @slot - Content the border is drawn around.
 */
class BorderWC extends (globalThis.HTMLElement ?? class {}) {
  static get observedAttributes() {
    return [
      'effect',
      'color',
      'thickness',
      'speed',
      'radius',
      'animate',
      'mode',
      'motion',
      'trigger',
    ];
  }
  #cleanup = null;
  #token = 0;
  #observer = null;
  // Tracks whether the host is currently in (or near) the viewport. Attribute
  // changes while off-screen are deferred — the IO callback re-applies on the
  // next intersection.
  #intersecting = false;
  #stopMotionWatch = null;
  #appliedReduce = null;

  get effect() {
    return this.getAttribute('effect');
  }
  set effect(v) {
    v == null ? this.removeAttribute('effect') : this.setAttribute('effect', String(v));
  }

  connectedCallback() {
    styleHost(this);
    this.#stopMotionWatch = onMotionChange(() => {
      if (this.#intersecting && reducedMotion(this) !== this.#appliedReduce) this.#apply();
    });
    this.#setupVisibility();
  }
  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
    this.#stopMotionWatch?.();
    this.#stopMotionWatch = null;
    this.#intersecting = false;
    this.#teardown();
  }
  attributeChangedCallback() {
    if (!this.isConnected) return;
    if (this.#intersecting) this.#apply();
    // Off-screen: IO will fire #apply when the host scrolls back into view.
  }
  refresh() {
    this.#apply();
  }

  #setupVisibility() {
    // `eager` opts out of lazy init for above-the-fold or always-visible uses.
    if (this.hasAttribute('eager') || typeof IntersectionObserver === 'undefined') {
      this.#intersecting = true;
      this.#apply();
      return;
    }
    this.#observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        const inView = entry.isIntersecting;
        if (inView && !this.#intersecting) {
          this.#intersecting = true;
          this.#apply();
        } else if (!inView && this.#intersecting) {
          this.#intersecting = false;
          this.#teardown();
        }
      },
      { rootMargin: IO_ROOT_MARGIN }
    );
    this.#observer.observe(this);
  }

  #teardown() {
    this.#token++; // Invalidates any load still in flight.
    try {
      this.#cleanup?.();
    } catch {}
    this.#cleanup = null;
  }

  async #apply() {
    this.#teardown();
    const name = this.effect;
    if (!name || !Object.hasOwn(EFFECTS, name)) return; // unknown/base value → no-op (CSS tier handles spin/pulse/etc.)
    const token = ++this.#token;
    let create;
    try {
      create = await EFFECTS[name]();
    } catch {
      return;
    }
    if (token !== this.#token || !this.isConnected) return;
    const params = { ...readParams(this), reduce: reducedMotion(this) };
    this.#appliedReduce = params.reduce;
    try {
      this.#cleanup = create(this, params) || null;
      this.dispatchEvent(new CustomEvent('border-wc:effect-applied', { detail: { effect: name } }));
    } catch (err) {
      this.dispatchEvent(new CustomEvent('border-wc:error', { detail: { error: err } }));
    }
  }
}

// Importing on a server is a no-op, so SSR frameworks can bundle this module.
if (globalThis.customElements && !customElements.get('border-wc'))
  customElements.define('border-wc', BorderWC);
export { BorderWC };
