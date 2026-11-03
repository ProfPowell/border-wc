export type BorderEffect =
  | 'aurora'
  | 'barber'
  | 'chroma'
  | 'wings'
  | 'ants'
  | 'lightning'
  | 'neon'
  | 'glitch'
  | 'hud'
  | 'ascii'
  | 'stitching'
  | 'typewriter'
  | 'barbed-wire'
  | 'rope'
  | 'scallop'
  | 'scoop'
  | 'zigzag'
  | 'wave'
  | 'deco'
  | 'memphis'
  | 'opart'
  | 'brutalist'
  | 'aqua'
  | 'psychedelic'
  | 'plasma'
  | 'gooey'
  | 'sparks'
  | 'marquee'
  | 'washi'
  | 'filmstrip'
  | 'ticket'
  | 'bunting'
  | 'squiggle'
  | 'draw';

export interface BorderEffectAppliedDetail {
  effect: BorderEffect;
}

export interface BorderErrorDetail {
  error: unknown;
}

export class BorderWC extends HTMLElement {
  effect: BorderEffect | (string & {}) | null;
  /** Re-reads attributes and custom properties, then re-applies the effect. */
  refresh(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'border-wc': BorderWC;
  }
  interface HTMLElementEventMap {
    'border-wc:effect-applied': CustomEvent<BorderEffectAppliedDetail>;
    'border-wc:error': CustomEvent<BorderErrorDetail>;
  }
}
