import { readParams, reducedMotion } from './params.js';
import { EFFECTS, styleHost } from './registry.js';

const IO_ROOT_MARGIN = '200px';

class BorderWC extends HTMLElement {
  static get observedAttributes() {
    return ['effect', 'color', 'thickness', 'speed', 'radius', 'animate', 'mode', 'motion'];
  }
  #cleanup = null;
  #token = 0;
  #observer = null;
  // Tracks whether the host is currently in (or near) the viewport. Attribute
  // changes while off-screen are deferred — the IO callback re-applies on the
  // next intersection.
  #intersecting = false;

  get effect() {
    return this.getAttribute('effect');
  }
  set effect(v) {
    v == null ? this.removeAttribute('effect') : this.setAttribute('effect', String(v));
  }

  connectedCallback() {
    styleHost(this);
    this.#setupVisibility();
  }
  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
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
    try {
      this.#cleanup?.();
    } catch {}
    this.#cleanup = null;
  }

  async #apply() {
    this.#teardown();
    const name = this.effect;
    if (!name || !EFFECTS[name]) return; // unknown/base value → no-op (CSS tier handles spin/pulse/etc.)
    const token = ++this.#token;
    let create;
    try {
      create = await EFFECTS[name]();
    } catch {
      return;
    }
    if (token !== this.#token || !this.isConnected) return;
    const params = { ...readParams(this), reduce: reducedMotion(this) };
    try {
      this.#cleanup = create(this, params) || null;
      this.dispatchEvent(new CustomEvent('border-wc:effect-applied', { detail: { effect: name } }));
    } catch (err) {
      this.dispatchEvent(new CustomEvent('border-wc:error', { detail: { error: err } }));
    }
  }
}

if (!customElements.get('border-wc')) customElements.define('border-wc', BorderWC);
export { BorderWC };
