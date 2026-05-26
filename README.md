# `<border-wc>`

A light-DOM web component for high-touch border effects — squiggle, draw-on,
sparks — the kind of decorative borders that pure CSS can't pull off. It pairs
with vanilla-breeze's CSS-tier `data-border-effect` (spin / pulse / march): use
the CSS tier for cheap, always-on motion, and reach for `<border-wc>` when you
need SVG/canvas-driven effects. It reads your design tokens (CSS custom
properties) so borders stay on-brand without extra config.

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
| `effect`    | Border effect: `squiggle`, `draw`, or `sparks`.                                                      |
| `color`     | Stroke/particle color (any CSS color; defaults to `currentColor`).                                   |
| `thickness` | Stroke width in px.                                                                                  |
| `speed`     | Animation duration in ms.                                                                            |
| `radius`    | Corner radius in px (falls back to the host's computed `border-radius`).                             |
| `animate`   | Boolean; when present, plays the entrance/loop animation.                                            |
| `mode`      | Effect-specific placement mode (e.g. `center`).                                                      |
| `motion`    | `auto` \| `reduce` \| `force` — overrides `prefers-reduced-motion`: `reduce` forces static, `force` forces animation, `auto` (default) honors the media query. |

Each attribute can also be set via a matching `--border-wc-*` CSS custom
property (e.g. `--border-wc-color`), which takes precedence over the attribute.

Part of the "Decorated Layers" family alongside
[vanilla-breeze](https://github.com/ProfPowell) and `bg-wc`.

## License

MIT
