---
name: alpha-art-assets
description: "Use when creating, regenerating, animating, cleaning or replacing any visual asset of project-alpha (character sprite of any class or enemy, boss, card art, tile, prop, portrait, skill/item icon, VFX, UI) or when touching art-src/, public/assets/, the asset keys, or the generation scripts. Entry point of the art pipeline: decides the medium, routes to the specialised skills (aseprite-pixel-assets, inkscape-vector-assets, asset-animation, pixel-logic) and keeps every asset on the same size, palette, facing and key contract."
---

# project-alpha — art assets

Read first: `docs/gdd.md` (art direction) and `.claude/rules/assets.md`.
Numbers (base resolution, cell sizes, palette, formats): to be defined in the Art Bible
(`docs/art-bible.md`, not created yet). Until then, no fixed size or color applies through this skill;
if any number appears here, it is provisional and the Art Bible prevails.

## Route

| Task | Skill |
|---|---|
| Pixel craft, review of any pixel art | `pixel-logic` |
| Pixel art by script (Aseprite Lua/CLI), cleaning AI output | `aseprite-pixel-assets` |
| SVG placeholders (same size and key as the final art), Inkscape CLI | `inkscape-vector-assets` |
| Poses, idle/attack, atlases, Phaser 4 animation and effects | `asset-animation` |
| Aesthetic and readability decisions | `art-of-game-design` (lentes de estética) |

## Pipeline

1. **Describe** the asset once: class or card, silhouette, palette role, frame list.
2. **Produce** it by hand, by script, or as a generator draft (only through the cost gate below).
3. **Normalise** anything that did not come from a script: canvas, anchor, alpha 0/255,
   master palette, colour count (`aseprite-pixel-assets`).
4. **Review** at 1x on the real background, next to the other side of the battle.
5. **Publish** to `public/assets/` under the asset keys. A missing asset never blocks the game.

Generated output is a draft. Hand cleanup and the 1x review are mandatory before it enters the game.

## Facing and perspective

Side view only: party in ranks on the left, enemy rows on the right (see GDD). One drawing per
character facing its side; the engine mirrors when needed. Never generate 8 directions for
combat units. The projection and any tile rule are defined in the Art Bible.

## Asset keys

From `.claude/rules/assets.md`:

| Kind | Key |
|---|---|
| Unit animation | `unit.<class>.<anim>.<dir>` |
| Tile | `tile.<act>.<terrain>` |
| Icon | `icon.<kind>.<id>` |
| Portrait | `portrait.<id>` |
| VFX | `vfx.<id>` |
| Music | `music.<id>` |
| Sound effect | `sfx.<category>.<id>` |

Keys are stable and identical across every art set.

## Rules

1. **Cost gate:** before any batch on a paid generator (PixelLab, ElevenLabs), show the list
   and the estimate to the developer and wait for approval. Pilot one asset first.
2. **Logging:** every generation is logged in `art-src/` (prompt, parameters, date, result path),
   rejected ones included.
3. **Scripts are idempotent:** they do not regenerate what already exists.
4. **Tokens only in `.env`.** Never commit, print or paste an API token.
5. **IP:** no names, symbols, heraldry or recognisable silhouettes of existing works, in prompts,
   file names, keys or pixels (`.claude/rules/ip-and-tone.md`). Never "in the style of" a work or artist.
6. No art dependency or external tool is added without asking.
7. `references/` is third-party study material: never copy, crop, trace or ship it.

## Review checklist (every asset, whatever its origin)

- [ ] Canvas and anchor match the Art Bible; the anchor is the same in every frame.
- [ ] Only master-palette colours; colour count within the Art Bible limit; no pure black; alpha 0 or 255.
- [ ] One light direction; shadow follows the form; outline is tinted, not black.
- [ ] No orphan pixels, jaggies, banding or accidental dithering.
- [ ] Silhouette reads as its class in a flat fill.
- [ ] Allies and enemies are not told apart by colour alone.
- [ ] Nothing resembles a protected design.
- [ ] Seen in the game at 1x on its real background.
