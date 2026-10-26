# ADR 0013: Scale.NONE with integer zoom snapped to device pixels, base 640×360

- Status: superseded by ADR 0015 (2026-10-26)
- Date: 2026-10-26

## Context

Pixel art must stay on whole-pixel scaling (the integer-scale rule). Phaser's `FIT` scales by fractions. The base resolution is 640×360 (GDD §1.6, B28). The zoom spike (2026-10-26) showed that the invariant is an integer number of device pixels per game pixel, not CSS pixels.

## Decision

- Game config: `pixelArt: true`, `scale.mode = Phaser.Scale.NONE`, logical size 640×360.
- Zoom is computed as `max(1, floor(fit × devicePixelRatio)) / devicePixelRatio` and recomputed on `resize` with `game.scale.setZoom()`.
- The page centers the canvas with CSS (letterbox). The spike showed that at zoom 1 Phaser does not write `canvas.style`, so layout code reads `getBoundingClientRect()`.
- The integer-zoom mode of Phaser 4 (`MAX_ZOOM` / `setMaxZoom()`, documented in the local `scale-and-responsive` skill) is not used as the primary path because it ignores the device-pixel rule; behaviour with `FIT` and fractional DPR is still under test.
- Open question Q-ZOOM: check on real phones with browser UI visible before the Art Bible fixes sizes.

## Alternatives

- `Scale.FIT`: fractional scaling breaks the pixel art rule.
- A fixed 1920×1080 canvas: makes pixel art blurry and bigger than needed.

## Consequences

- Layout uses logical coordinates; the view converts pointer events with the current zoom.
- Changing the base resolution changes the Art Bible and every atlas, so it is a major decision.
