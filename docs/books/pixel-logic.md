# Pixel Logic applied to project-alpha

Operational summary of *Pixel Logic* (Michael Azzi, 2022) for this game: a roguelite deckbuilder in side view, heroes in ranks against enemies, cards and HUD in pixel art. The full book knowledge (rules, decision tables, chapter checklists, glossary) is in the skill [`.claude/skills/pixel-logic/SKILL.md`](../../.claude/skills/pixel-logic/SKILL.md). The game's numeric values (base resolution, sizes, hex palette, fps) live in `docs/art-bible.md`; this document says **how to decide**, the Art Bible says **the value chosen**.

## When to use

| Situation | What to read |
|---|---|
| Creating or generating a sprite, icon, card or UI piece | Skill: *Core rules* + the *Decision rules* table for the choice at hand |
| Writing a prompt for PixelLab | Skill: *Workflow*; state screen, perspective, outline and color budget |
| Reviewing an asset (hand-made or generated) | Skill: *Checklist* of each relevant chapter; name defects with the book's terms |
| Animation question | Skill: chapter 9 (Animation) |

## The 8 core rules (summary)

1. Total control: every pixel is intentional; scale only by whole numbers; no mixels or rotated pixels.
2. Consistent lines: a single thickness (normally 1 px); regular diagonal steps; no jaggies.
3. No banding or pillow shading.
4. Antialiasing sparingly, only inside the sprite.
5. Small palettes with hue shift (light toward yellow, shadow toward purple); about 16 colors per sprite; no pure black.
6. Readability first: clear silhouette, 1 main color + 1 contrast color, test at 1x on the real background.
7. (Isometric; does not apply to side-view combat; relevant only if an isometric map exists.)
8. Animation lives in key frames: loops with at least 3 frames; sub-pixels only in in-betweens, never on the face.

## Application to this genre

- **Side-view combat in ranks (Darkest Dungeon / Slay the Spire style):** heroes on the left facing right, enemies on the right facing left. One single angle (3/4 profile) for all units, checked side by side.
- **Sprite size:** size by the smallest detail that identifies the class (weapon, helmet, hood). The silhouette alone must identify class and faction. Elite enemies and bosses are bigger, not just recolored.
- **Outline:** sprites move over varied backgrounds, so use a dark colored outline (not pure black) or a shaded outline. Selective outline only for elements over always-dark backgrounds (UI panels).
- **Cards:** card art is its own illustration in a fixed frame, not a shrunken battle sprite. Battle sprite, portrait, icon and card art of the same entity have different proportions and are drawn separately.
- **Status and intent icons:** must read at 1x at the smallest size in the Art Bible; shape + color, never color alone.
- **Backgrounds:** less contrast and saturation than units, to separate planes. Dithering is allowed in backgrounds and skies, forbidden on units.
- **Prototype without animation:** static sprites need a "ready to act" pose with readable weapon and direction. When animation exists: a 2-extreme idle 1 px apart; an attack with a short anticipation (player action) and a 1-frame smear.
- **AI output (PixelLab):** a draft. Check pixel scale, color count, palette lock to the master palette, outline and silhouette; clean by hand.

## Quick review checklist

- [ ] Screen and integer scale per the Art Bible
- [ ] Color count within the limit; master palette; no `#000000`
- [ ] No mixels, jaggies, banding or pillow shading
- [ ] Silhouette identifies the class or enemy at 1x and blurred
- [ ] Correct contrast against the act's real background
- [ ] Key and dimensions equal to the placeholder's
