# ADR 0010: Bitmap pixel fonts built with a canvas-threshold pipeline

- Status: accepted
- Date: 2026-10-26

## Context

Text on screen must stay crisp at integer zoom (ADR 0013) and identical across browsers. Web fonts blur under scaling and vary between engines (see the architecture outline, section 3). The text must cover English and accented Brazilian Portuguese.

## Decision

- All UI text uses Phaser `BitmapText` with generated pixel fonts.
- Fonts are built by a script: render a candidate font on a canvas, threshold each glyph to 1 bit, and pack the glyphs into an atlas with the font metrics. The threshold level is 192.
- Candidate source fonts: Jersey 10, Jersey 15, Jersey 20, Jersey 25 and Tiny5. Their license is recorded as OFL in the plan; the license must be verified from the font files before shipping.
- The charset covers ASCII plus the accented characters needed by PT-BR.
- `Text` objects are allowed only for debugging.

## Alternatives

- Web fonts through `Text`: blurs at integer zoom and renders differently per browser.
- Hand-drawn glyph atlas: slow to produce and to change.

## Consequences

- The build step produces atlas files committed under `public/assets/`; the script is idempotent (asset rules).
- Changing the font means regenerating the atlas and checking every screen.
