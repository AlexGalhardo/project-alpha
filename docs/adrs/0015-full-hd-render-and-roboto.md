# ADR 0015: Full HD render with a ×3 camera, nearest-filtered pixel art and Roboto text

- Status: accepted
- Date: 2026-10-26
- Supersedes: ADR 0010 (bitmap font pipeline), ADR 0013 (Scale.NONE with integer zoom)

## Context

The developer playtest of v0.0.5 found three problems: the game did not fill the browser (integer zoom left wide borders), sprites and backgrounds looked low-resolution and backgrounds were badly framed, and the 1-bit pixel fonts were hard to read. The developer set Full HD (1920×1080) as the primary target and asked for the Google font Roboto everywhere.

## Decision

- Render 1920×1080 with `Phaser.Scale.FIT` and `CENTER_BOTH`; the page gives the game the whole viewport. At 1920×1080 the render is 1:1.
- Keep the 640×360 layout space: every scene calls `fitCamera()` (`setZoom(3).centerOn(320, 180)`). Pointer input goes through the camera, so hit areas did not change.
- `pixelArt: false` so text renders smooth; every pixel-art texture gets `NEAREST` filtering at boot (`BootScene`).
- Text is Phaser `Text` in Roboto (400/500/700) at `resolution: 3`; the 1-bit font builder is removed. Boot waits for the font (3 s timeout).
- Art is size-agnostic: textures are shown at their logical size (`logicalSize`, `sized`, `standing`, `portrait`, `backdrop`), so 3× art is 1:1 at Full HD and 1× placeholders still work.

## Consequences

- Text is readable at every size; PT-BR accents need no headroom rules.
- Other resolutions scale the render by a fraction (1366×768 at 0.711); pixel art is no longer pixel-exact there. Full HD is exact.
- Art budgets move to 3× canvases (Art Bible §3.1, §7). The boss at 2× of its logical size is an accepted exception.
- The screen tour also runs at 1920×1080 (primary) and 1366×768.
