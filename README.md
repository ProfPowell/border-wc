# `<border-wc>`

[![CI](https://github.com/ProfPowell/border-wc/actions/workflows/ci.yml/badge.svg)](https://github.com/ProfPowell/border-wc/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

**[Live site →](https://profpowell.github.io/border-wc/)** — try the [playground](https://profpowell.github.io/border-wc/docs/), read the [API](https://profpowell.github.io/border-wc/docs/api.html), or browse [themed demos](https://profpowell.github.io/border-wc/demos/).

A light-DOM web component for high-touch border effects — thirty-four of them,
from conic-gradient auroras and chromatic-aberration outlines to neon glow,
chase-light marquees, ASCII boxes, barbed wire, and psychedelic rainbows — the
kind of decorative borders that pure CSS can't pull off (and a few that
finally can, thanks to `@property`, `mask-composite`, and `offset-path`). It
pairs with vanilla-breeze's CSS-tier `data-border-effect` (spin / pulse /
march): use the CSS tier for cheap, always-on motion, and reach for
`<border-wc>` when you need SVG- or composited-CSS-driven effects. It reads
your design tokens (CSS custom properties) so borders stay on-brand without
extra config.

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
| `effect`    | One of: `aurora`, `barber`, `chroma`, `wings`, `ants`, `lightning`, `neon`, `glitch`, `hud`, `ascii`, `stitching`, `typewriter`, `barbed-wire`, `rope`, `scallop`, `scoop`, `zigzag`, `wave`, `deco`, `memphis`, `opart`, `brutalist`, `aqua`, `psychedelic`, `plasma`, `gooey`, `sparks`, `marquee`, `washi`, `filmstrip`, `ticket`, `bunting`, `squiggle`, `draw`. |
| `color`     | Stroke/particle color (any CSS color; defaults to `currentColor`).                                   |
| `thickness` | Stroke width in px.                                                                                  |
| `speed`     | Animation duration in ms.                                                                            |
| `radius`    | Corner radius in px (falls back to the host's computed `border-radius`).                             |
| `animate`   | Boolean; when present, plays the entrance/loop animation.                                            |
| `mode`      | Effect-specific variant (e.g. `synthwave` on `neon`).                                                |
| `motion`    | `auto` \| `reduce` \| `force` — overrides `prefers-reduced-motion`: `reduce` forces static, `force` forces animation, `auto` (default) honors the media query and vanilla-breeze's root `data-motion-reduced`, and re-applies if either changes. |
| `trigger`   | When `draw` reveals: `time` (default) or `scroll`.                                                   |
| `eager`     | Boolean; applies on connect instead of waiting until the host nears the viewport.                    |

Each attribute can also be set via a matching `--border-wc-*` CSS custom
property (e.g. `--border-wc-color`), which takes precedence over the attribute.

## Methods and events

- `refresh()` re-reads attributes and custom properties and re-applies the effect.
- `border-wc:effect-applied` fires after an effect mounts (`detail.effect`).
- `border-wc:error` fires if an effect throws while mounting (`detail.error`).

## Tooling

The package ships TypeScript declarations and a
[Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/) at
`@profpowell/border-wc/custom-elements.json`, for editor completion and docs
tools. Importing either entry point on a server is a no-op, so SSR frameworks
can bundle them; effects apply once the code runs in a browser.

## Attribute binder (no wrapper)

Opt in once and annotate any element — no `<border-wc>` wrapper needed:

```html
<script type="module" src="https://unpkg.com/@profpowell/border-wc/attr"></script>
<article data-border-effect="squiggle">…</article>
```

The binder applies the **extreme** effects (all thirty-four) directly to the
element and watches the DOM for added/changed/removed nodes. **Base** values
(`spin`, `pulse`, `march`, `hue-cycle`, `breathe`, `trace`) are owned by vanilla-breeze's CSS and ignored here.
Params come from `--border-wc-*` custom properties (same knobs as the component).

The module auto-scans on import. For programmatic control it also exports
`bindBorderEffects(root = document)` (scan a subtree on demand) and `stopWatching()`
(stop observing future DOM changes).

Part of the "Decorated Layers" family alongside
[vanilla-breeze](https://vanilla-breeze.com) and `bg-wc`.

## License

MIT
