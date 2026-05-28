# `<border-wc>`

[![CI](https://github.com/ProfPowell/border-wc/actions/workflows/ci.yml/badge.svg)](https://github.com/ProfPowell/border-wc/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

**[Live site →](https://profpowell.github.io/border-wc/)** — try the [playground](https://profpowell.github.io/border-wc/docs/), read the [API](https://profpowell.github.io/border-wc/docs/api.html), or browse [themed demos](https://profpowell.github.io/border-wc/demos/).

A light-DOM web component for high-touch border effects — seventeen of them,
from lightning bolts and flames to grass, vines, ASCII boxes, barbed wire, and
psychedelic rainbows — the kind of decorative borders that pure CSS can't pull
off. It pairs with vanilla-breeze's CSS-tier `data-border-effect` (spin / pulse
/ march): use the CSS tier for cheap, always-on motion, and reach for
`<border-wc>` when you need SVG/canvas-driven effects. It reads your design
tokens (CSS custom properties) so borders stay on-brand without extra config.

## Install

```bash
npm install @profpowell/border-wc
```

## Usage

```html
<script type="module" src="https://unpkg.com/@profpowell/border-wc"></script>
<border-wc effect="squiggle" color="var(--ink)" animate>
  <blockquote>The shape around the thing is the thing.</blockquote>
</border-wc>
```

## Attributes

| Attribute   | Description                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| `effect`    | One of: `lightning`, `flames`, `glitch`, `grass`, `vines`, `fireflies`, `ascii`, `stitching`, `typewriter`, `barbed-wire`, `rope`, `scallop`, `psychedelic`, `plasma`, `squiggle`, `draw`, `sparks`. |
| `color`     | Stroke/particle color (any CSS color; defaults to `currentColor`).                                   |
| `thickness` | Stroke width in px.                                                                                  |
| `speed`     | Animation duration in ms.                                                                            |
| `radius`    | Corner radius in px (falls back to the host's computed `border-radius`).                             |
| `animate`   | Boolean; when present, plays the entrance/loop animation.                                            |
| `mode`      | Effect-specific placement mode (e.g. `center`).                                                      |
| `motion`    | `auto` \| `reduce` \| `force` — overrides `prefers-reduced-motion`: `reduce` forces static, `force` forces animation, `auto` (default) honors the media query. |

Each attribute can also be set via a matching `--border-wc-*` CSS custom
property (e.g. `--border-wc-color`), which takes precedence over the attribute.

## Attribute binder (no wrapper)

Opt in once and annotate any element — no `<border-wc>` wrapper needed:

```html
<script type="module" src="https://unpkg.com/@profpowell/border-wc/attr"></script>
<article data-border-effect="squiggle">…</article>
```

The binder applies the **extreme** effects (all seventeen) directly to the
element and watches the DOM for added/changed/removed nodes. **Base** values
(`spin`, `pulse`, `march`, …) are owned by vanilla-breeze's CSS and ignored here.
Params come from `--border-wc-*` custom properties (same knobs as the component).

The module auto-scans on import. For programmatic control it also exports
`bindBorderEffects(root = document)` (scan a subtree on demand) and `stopWatching()`
(stop observing future DOM changes).

Part of the "Decorated Layers" family alongside
[vanilla-breeze](https://github.com/ProfPowell) and `bg-wc`.

## License

MIT
