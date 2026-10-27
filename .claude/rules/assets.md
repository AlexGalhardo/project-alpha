# Asset rules

## Visual

- Pixel art follows the `pixel-logic` skill, `docs/books/pixel-logic.md` and `docs/art-bible.md` (base resolution, scale, palette, outline, animation).
- The canvas is FIT-scaled to the viewport (B40). Pixel textures use nearest filtering. Art is generated at native 1080p size: 3× the logical size (a 64×80 logical slot is 192×240 art). Art is never upscaled. Backgrounds are native 1920×1080, composed from generated pieces by `scripts/assets/stitch-bg.ts`. Units use one shared prompt template: side view; heroes face east (right), enemies face west (left). No mixels, no antialiasing on the outer edge of a pixel sprite.
- A placeholder (SVG or rectangle) uses the **same dimensions and keys** as the final art. Swapping a placeholder for a sprite never touches logic.
- Shared master palette defined in the Art Bible; no pure black.
- The silhouette identifies heroes and enemies. Allies and enemies are never told apart by color alone.
- Output from a generator (PixelLab or other) is a draft: manual cleanup and a 1x review on the real background before it enters the game.

## Audio

- Only sound effects and music, via ElevenLabs. No voice acting.
- Seamless loops; normalized volume; `ogg` primary, `mp3` fallback.
- The game works with audio blocked or missing (browser autoplay policy).

## Generation

- **Cost gate:** before any batch generation (PixelLab or ElevenLabs), present the list and the estimate to the developer and wait for approval.
- Every generation is logged (prompt, parameters, date, cost) in `art-src/`.
- Generation scripts are idempotent: they do not regenerate what already exists.

## Organization

- Keys: `hero.<class>.<pose>`, `enemy.<id>.<pose>`, `card.<id>`, `icon.<kind>.<id>` (including `icon.portrait.<hero>` 48×48 and `icon.queue.<id>` 20×20), `ui.<id>`, `bg.<screen>[.<act>]` (e.g. `bg.title`, `bg.combat.act1`), `vfx.<id>`, `music.<id>`, `sfx.<category>.<id>`. Sizes per key: `docs/art-bible.md`.
- Game files live in `public/assets/`; sources and logs in `art-src/`.
- `references/` is third-party material, local only: never copy, crop, trace or ship it.
