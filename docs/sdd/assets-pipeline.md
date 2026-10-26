# SDD-16 Assets pipeline

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Coordinator (`scripts/assets/`, `src/view/placeholders.ts`) |
| Phase | STRUCTURE (placeholders, fonts) / PROTOTYPE (art, audio) |
| Depends on | SDD-12, SDD-13, SDD-14 |
| References | Art Bible (all), `.claude/rules/assets.md`, skills `alpha-art-assets`, `aseprite-pixel-assets`, `asset-animation`, `alpha-audio-assets`; ADR 0010 (bitmap fonts), 0014 (procedural placeholders) |

## 1. Goal

Produce, validate and publish every visual, font and audio asset under the Art Bible keys and sizes, with procedural placeholders first, a Bun-only font pipeline, and a cost gate for generated art and audio.

## 2. Non-goals

- Final art direction decisions (Art Bible).
- Frame animation for characters (Alpha).

## 3. Requirements

- R-1 Keys and sizes: every asset key and canvas size from the Art Bible §7, §14; files in `public/assets/` named by key.
- R-2 Placeholders (ADR 0014): `src/view/placeholders.ts` draws every key procedurally with the same size and shape+colour token; a missing file falls back to its placeholder.
- R-3 Palette: every shipped image uses only the 31 master colours + transparency; alpha 0/255; colour budget per asset type (Art Bible §4.1).
- R-4 Fonts (ADR 0010): `scripts/assets/fonts.ts` (Bun + `playwright-core` headless Chromium, no new dependency) renders each glyph of Jersey 10/15/20/25 and Tiny5 at native size on a canvas, thresholds alpha at 192 to 1-bit, packs glyphs with 1 px padding, and writes `public/assets/fonts/<token>.png` + BMFont `.xml`; charset per Art Bible §8; OFL licence files shipped.
- R-5 Art: PixelLab drafts (cost gate first) → palette snap and cleanup in Aseprite (Lua, batch) → validators → publish; prompts from Art Bible §15; every generation logged in `art-src/` (prompt, parameters, date, cost).
- R-6 Audio: ElevenLabs (cost gate first) → normalise to Art Bible §13.3 targets → `ogg` + `mp3` → publish; log in `art-src/audio-log.jsonl`.
- R-7 Generation scripts are idempotent: an existing key is skipped unless `--force`.
- R-8 Manifest: `public/assets/manifest.json` lists keys, files, sizes and type; the Preload scene loads from it.
- R-9 `references/` is never copied, traced or shipped.

## 4. Design

```text
scripts/assets/
├── fonts.ts        canvas-192 BMFont generator (playwright-core)
├── validate.ts     size per key, palette, alpha, colour budget, manifest consistency
├── manifest.ts     builds manifest.json from public/assets/
└── audio-check.ts  duration, format pair, loudness report (ffmpeg if available; otherwise "not assessed")
art-src/
├── palette/master.gpl
├── aseprite/scripts/*.lua
└── logs/ (generation logs)
```

## 5. Acceptance criteria

- AC-1 Given the placeholder set, then every key in the manifest renders at its Art Bible size with no file present.
- AC-2 Given `bun scripts/assets/fonts.ts`, then each atlas PNG has exactly 2 colours (white, transparent) and the XML lists every charset glyph.
- AC-3 Given a sprite with a colour outside the master palette or a partial alpha pixel, then `validate.ts` fails with the key and pixel coordinates.
- AC-4 Given a key whose PNG size differs from the Art Bible, then `validate.ts` fails.
- AC-5 Given a second run of a generation script, then no paid call is made for existing keys.
- AC-6 Given every audio key, then both `.ogg` and `.mp3` exist and durations match within 50 ms.

## 6. Edge cases

- Glyphs absent from a source font (Jersey lacks `¤¦¬±²³µ¹¼½¾`): reported; build fails only if a dictionary uses them (SDD-14 AC-3).
- Placeholder and final asset both present: the final asset wins.
- ffmpeg not installed: loudness check reports "NOT ASSESSED" instead of passing silently.

## 7. Test strategy

- Unit: validators on fixture images; manifest builder.
- Script checks in `bun run ci` once assets exist (validate only, no generation).
- Human review at 1x on the real background (Art Bible §6).

## 8. Verification

```sh
bun scripts/assets/fonts.ts
bun scripts/assets/validate.ts
bun scripts/assets/manifest.ts
```
