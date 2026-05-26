import { readParams, reducedMotion } from './params.js';
import { EFFECTS, styleHost } from './registry.js';

class BorderWC extends HTMLElement {
  static get observedAttributes() {
    return ['effect', 'color', 'thickness', 'speed', 'radius', 'animate', 'mode', 'motion'];
  }
  #cleanup = null;
  #token = 0;

  get effect() {
    return this.getAttribute('effect');
  }
  set effect(v) {
    v == null ? this.removeAttribute('effect') : this.setAttribute('effect', String(v));
  }

  connectedCallback() {
    styleHost(this);
    this.#apply();
  }
  disconnectedCallback() {
    this.#teardown();
  }
  attributeChangedCallback() {
    if (this.isConnected) this.#apply();
  }
  refresh() {
    this.#apply();
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
