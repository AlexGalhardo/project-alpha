# Asset rules

## Visual

- Pixel art follows the `pixel-logic` skill, `docs/books/pixel-logic.md` and `docs/art-bible.md` (base resolution, scale, palette, outline, animation).
- Scale is always integer (`pixelArt: true`, `roundPixels: true`). No fractional scale, no mixels, no antialiasing on the outer edge.
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

- Keys: `hero.<class>.<pose>`, `enemy.<id>.<pose>`, `card.<id>`, `icon.<kind>.<id>`, `ui.<id>`, `bg.<act>.<id>`, `vfx.<id>`, `music.<id>`, `sfx.<category>.<id>`.
- Game files live in `public/assets/`; sources and logs in `art-src/`.
- `references/` is third-party material, local only: never copy, crop, trace or ship it.
