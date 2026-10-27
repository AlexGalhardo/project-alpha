# Art Bible

The visual and audio contract of **Ossuary** (repository: `project-alpha`). Every asset, screen and effect in the game follows this file. Numbers live here; the craft rules behind them live in `docs/books/pixel-logic.md` and the `pixel-logic` skill; the pipeline lives in the `alpha-art-assets`, `aseprite-pixel-assets`, `asset-animation`, `inkscape-vector-assets` and `alpha-audio-assets` skills; the rules live in `.claude/rules/assets.md`.

When this file and the GDD disagree on a visual or audio number, this file wins; when they disagree on a rule of play, the GDD wins.

## Contents

1. [Decisions this file implements](#1-decisions-this-file-implements)
2. [Camera and framing](#2-camera-and-framing)
3. [Resolution, scale and grid](#3-resolution-scale-and-grid)
4. [Master palette](#4-master-palette)
5. [Semantic colour tokens](#5-semantic-colour-tokens)
6. [Pixel craft rules](#6-pixel-craft-rules)
7. [Sprite and icon sizes](#7-sprite-and-icon-sizes)
8. [Typography](#8-typography)
9. [Design system: panels, buttons, states](#9-design-system-panels-buttons-states)
10. [Cards](#10-cards)
11. [Screens at 640×360](#11-screens-at-640360)
12. [Feedback, VFX and animation](#12-feedback-vfx-and-animation)
13. [Audio style sheet](#13-audio-style-sheet)
14. [Asset keys](#14-asset-keys)
15. [Prompt templates](#15-prompt-templates)
16. [Prototype asset list](#16-prototype-asset-list)
17. [Open items](#17-open-items)

---

## 1. Decisions this file implements

| Id | Decision (from `docs/brainstorming.md`) | Where |
|---|---|---|
| B28 | Layout space 640×360, rendered at 1920×1080 with `Scale.FIT` and camera zoom 3 (ADR 0015 supersedes the integer-zoom rule) | §3 |
| B36 | Art direction "ash and ember" | §4, §6 |
| B29 | Card in hand: cost, short name, keyword icons, main number, origin/target ranks; 168×120 detail panel on first tap | §10, §11.6 |
| B30 | Input: tap selects + previews, tap a valid target confirms, long press = tooltip, keyboard 1–9 and Space | §9.4, §11 |
| B31 | Accessibility: colour + shape, reduce shake/flash, speed 1x/2x/3x | §5, §12.1 |
| B13 | Boss: one static sprite, 2 phases signalled by flash, shake and text | §12.2 |
| B17 | Stress 0–10 pips; Collapse at 10 | §5, §12.2 |
| B20 | Rarity: 4 tiers, frame shape differs per tier | §10.2 |
| B37 | Prototype audio: 4 loops + about 35 SFX, `ogg` + `mp3` | §13 |
| B38 | Prototype assets are static (no frame animation on characters) | §12 |

---

## 2. Camera and framing

- **Side view, one fixed camera per screen.** No scrolling, no zoom-in, no rotation. Every screen fits 640×360 exactly.
- Combat: heroes on the **left facing right**, enemies on the **right facing left**. Rank 1 of each side is nearest the centre of the screen.
- Light comes from the **upper left** for every sprite, including mirrored enemies (mirror the drawing before shading, never the shaded bitmap).
- Depth is shown by layers, never by perspective: background (desaturated, low contrast) → ground line → units (full contrast) → VFX → UI.
- Camera shake is the only camera motion; it is a code effect (§12.1) and is disabled by the "reduce shake" setting.

---

## 3. Resolution, scale and grid

### 3.1 Base resolution and zoom

Superseded 2026-10-26 by ADR 0015 (developer playtest: fill the viewport, Full HD first, readable text).

| Item | Value |
|---|---|
| Layout space | **640×360** (16:9): every coordinate in this file and in `src/scenes/` |
| Render size | **1920×1080** (Full HD, the primary target) |
| Phaser config | `pixelArt: false`, `scale: { mode: FIT, autoCenter: CENTER_BOTH }`, `width: 1920`, `height: 1080` |
| Camera | Every scene calls `fitCamera(scene)`: `setZoom(3).centerOn(320, 180)`, so the 640×360 layout fills the render |
| Viewport | The game fills the browser (`#game` 100vw × 100dvh); `FIT` letterboxes the 16:9 area inside it |
| Texture sampling | Pixel-art textures (sprites, backgrounds, icons, placeholders, card art) use `NEAREST`; Roboto text renders smooth |
| Letterbox colour | `ink` `#0e0d12` |

Asset resolution: art may arrive at 1×, 2× or 3× its logical size and is always shown at the logical size (`sized()`, `standing()`, `portrait()`, `backdrop()` in `src/view/ui.ts`). Full HD art is 3× (hero 192×240 shown at 64×80, card art 180×120 at 60×40, backgrounds 1920×1080 at 640×360), which is 1:1 on a 1080p screen. The boss at 320×288 shown at 160×144 is 2× rather than 3× (1.5 screen pixels per texel at 1080p), an accepted exception.

| Screen (CSS px) | Scale of the 1920×1080 render |
|---|---|
| 1920×1080 | 1 (1:1, primary) |
| 1366×768 | 0.711 |
| 1280×720 | 0.667 |
| 844×390 (phone landscape) | 0.361 |

### 3.2 Layout grid and spacing

| Token | px | Use |
|---|---|---|
| `grid` | 8 | All screen-level positions and panel sizes are multiples of 8 (exceptions listed per screen) |
| `half` | 4 | Gaps between cards, icons and list rows |
| `space.1` | 2 | Inside icons and frames |
| `space.2` | 4 | Gap between siblings |
| `space.3` | 8 | Panel padding (standard), screen margin |
| `space.4` | 12 | Gap between groups |
| `space.5` | 16 | Gap between panels |
| `space.6` | 24 | Top bar height, large separation |
| `space.7` | 32 | Section separation on menus |
| `margin.screen` | 8 | No interactive element closer than 8 px to a screen edge |
| `padding.panel` | 8 | Standard 9-slice content inset (6 for the compact tooltip) |

### 3.3 Touch targets

Minimum interactive sizes in base px. At zoom 1 (phone) base px = CSS px.

| Class | Minimum | Examples |
|---|---|---|
| Primary | 44×44 (or 96×44 for wide buttons) | End Turn, menu buttons, cards (64×90), unit slots (80×150) |
| Secondary | 44×28 | Speed and Auto toggles, piles (36×44) |
| Tertiary | 24×24 | Settings gear, close buttons, turn-queue portraits (20×20 with 2 px gap, tap area 22×24) |

Targets: 44×44 matches the WCAG 2.2 AAA target size and 24×24 the AA minimum (values from the WCAG 2.2 success criteria 2.5.5 and 2.5.8; not fetched this session).

---

## 4. Master palette

31 colours + transparency. No other colour may appear in any shipped sprite, icon, tile or UI image. No pure black (`#000000`) and no pure white (`#ffffff`).

| Ramp | Key | Hex | Role |
|---|---|---|---|
| Ash (cool neutrals) | `ash0` / `ink` | `#0e0d12` | Darkest ink, outlines on the shadow side, letterbox |
| | `ash1` | `#1b1a22` | Deep shadow, panel background |
| | `ash2` | `#2c2a33` | Shadow, panel fill |
| | `ash3` | `#45424d` | Mid stone, disabled fill |
| | `ash4` | `#6b6772` | Lit stone, muted text, common rarity |
| | `ash5` | `#9a95a0` | Highlight stone, secondary text |
| | `ash6` | `#cfcad2` | Brightest neutral, glints |
| Iron (blue-grey metal) | `iron0` | `#23303a` | Armour shadow |
| | `iron1` | `#3b4c58` | Armour mid |
| | `iron2` | `#66808c` | Armour light, uncommon rarity |
| Bone (parchment, skin, bone) | `bone0` | `#8a7a62` | Bone shadow |
| | `bone1` | `#bfae8c` | Bone mid, parchment |
| | `bone2` | `#e8dcc0` | Primary text, flash colour |
| Ember (fire, UI accent) | `ember0` | `#3a1410` | Ember shadow |
| | `ember1` | `#7a2418` | Coals |
| | `ember2` | `#c2461f` | Flame, burn |
| | `ember3` | `#f08a3a` | Hot flame, energy, focus, legendary |
| Gold (worn gold, UI accent) | `gold0` | `#5a4320` | Gold shadow |
| | `gold1` | `#a07a2c` | Gold mid, frames |
| | `gold2` | `#e0b84a` | Gold light, selection, rare rarity |
| Blood | `blood0` | `#4a0f17` | HP track, deep wounds |
| | `blood1` | `#8e1e2a` | Blood mid |
| | `blood2` | `#d0404a` | HP fill, damage numbers |
| Rift green | `rot0` | `#1d3a24` | Rift shadow |
| | `rot1` | `#3f7a3a` | Rift growth |
| | `rot2` | `#9cd65a` | Rift glow, heal |
| Rift violet | `rift0` | `#2a1a3e` | Rift deep, stress track |
| | `rift1` | `#5b3a8a` | Rift mid |
| | `rift2` | `#9d7ad6` | Rift light, stress, debuff |
| Ward blue | `ward0` | `#2f5c8a` | Block shadow |
| | `ward1` | `#7fb8e0` | Block, shields |

Palette rules:

- **Ramps share inks:** shadows of every ramp may fall into `ash0`–`ash2` and `rift0`; lights may lift into `bone2` or `ash6`. Hue shift: lights warm (towards `bone`/`gold`), shadows cool (towards `ash`/`rift`).
- **Backgrounds** use `ash`, `iron`, `rot0`, `rift0`, `ember0`–`ember1` only; they never use `bone2`, `gold2`, `ember3`, `blood2`, `rot2`, `rift2` or `ward1` (those are reserved for units, UI and VFX, so the foreground always has more contrast and saturation).
- **Rift enemies** carry `rot` and `rift` accents; **the order's heroes** carry `iron`, `bone` and `gold`; both share `ash` and `blood`.
- Palette file: `art-src/palette/master.gpl` (GIMP palette, index 0 = transparent, indices 1–31 in the order of this table). The pixel pipeline snaps every draft to this file (`aseprite-pixel-assets`, "Cleaning AI-generated sprites").

### 4.1 Colour budget per asset

| Asset | Max colours (incl. transparency) |
|---|---|
| Hero, enemy, elite overlay | 16 |
| Boss | 20 |
| Card art (60×40) | 16 |
| Portrait (48×48), queue icon (20×20) | 12 / 8 |
| Item icon (24×24, 16×16) | 10 / 8 |
| Status, intent, action, node icons | 6 |
| UI panel, button, frame | 8 |
| VFX (per animation, all frames) | 8 |
| Background (640×360) | 24 |

---

## 5. Semantic colour tokens

Information is never conveyed by colour alone (`.claude/rules/game-design.md`): every token has a shape.

| Token | Colour | Shape (always present) | Used on |
|---|---|---|---|
| `hp` | fill `blood2`, track `blood0`, frame `ash0` | Horizontal bar with a 1 px notch every 10 HP; heart glyph before the number | Unit HP bar, party strip |
| `block` | `ward1` on `ward0` | Shield glyph with the number inside; overlay segment on the HP bar's right end | Units, intents, cards |
| `stress` | filled `rift2`, empty `rift0` with `ash4` outline | 10 diamond pips (◆) 4×3 px, 1 px gap | Hero status row |
| `energy` | `ember3` core, `gold1` ring | Round orb with a flame notch on top | Energy orb, card cost gem |
| `damage` | `blood2` | Number with a leading "−" and a slash spark; sword glyph on intents/cards | Pop-ups, intents, keyword row |
| `heal` | `rot2` | Number with a leading "+" and a cross glyph | Pop-ups, keyword row |
| `buff` | `gold2` | Upward chevron (▲) on the icon corner | Status icons (might, ward) |
| `debuff` | `rift2` | Downward chevron (▼) on the icon corner | Status icons (weakened, marked, bleed, burn, stunned) |
| `ally` | `gold1` | Square frame on turn-queue portraits | Turn queue |
| `enemy` | `blood1` | Frame with notched corners on turn-queue portraits | Turn queue |
| `rarity.common` | `ash4` | Plain 2 px frame, square corners | Cards, items |
| `rarity.uncommon` | `iron2` | 2 px frame with 3 px clipped (45°) corners | Cards, items |
| `rarity.rare` | `gold2` | 2 px frame with a 3×3 stud on each corner and a small crest on top | Cards, items |
| `rarity.legendary` | `ember3` | Double frame (2 px + 1 px, 1 px gap) with a thorn crown on top; boss drops only | Cards, items |
| `focus` | `ember3` | 3×3 L-shaped corner brackets 2 px outside the element | Keyboard focus |
| `selected` | `gold2` | 2 px outline + raised by 4–16 px (card) or a ▶ marker (list) | Selected card, unit, option |
| `valid target` | `gold2` | Pulsing corner brackets on the slot (2 frames, code) + dotted line from the card | Targeting |
| `invalid` | `ash3` | 1 px diagonal hatch over the element | Disabled, unplayable cards |
| `text.primary` | `bone2` | — | Body text |
| `text.secondary` | `ash5` | — | Labels, footers |
| `text.warning` | `ember3` | Exclamation glyph before the text | Errors, "not enough energy" |

Hero ownership on cards (band colour + glyph, §10.1):

| Hero | Band colour | Glyph (5×5) |
|---|---|---|
| `shieldbearer` | `iron2` | Tower shield |
| `marksman` | `gold2` | Arrowhead |
| `arcanist` | `rift2` | Open eye |
| `confessor` | `bone2` | Candle |
| `bombardier` | `ember3` | Bomb with fuse |

---

## 6. Pixel craft rules

The full craft lives in `docs/books/pixel-logic.md` and the `pixel-logic` skill; this is the project's selection.

| Rule | Value |
|---|---|
| Scale | Integer only; no mixels; no rotated or fractionally scaled sprites in game |
| Outline | Selective, 1 px, outside the silhouette: `ash0` on the side away from the light (bottom and right edges), the material's darkest ramp tone on the lit side (top and left edges); never black; no outline on emissive parts (fire, Rift glow) |
| Light | One light from the upper left; tone from form (normals), never from distance to the edge (no pillow shading) |
| Shading | 3–5 tones per material ramp; form shadow + cast shadow (nearer part darkens the one behind by one tone) |
| Anti-aliasing | Only inside the silhouette, 1 tone, at most half the step length; never on the outer edge |
| Dithering | Forbidden on units, cards and icons; allowed on backgrounds and fog only (checker pattern, 2 tones) |
| Clusters | No orphan pixels except deliberate marks (eyes, glints); clusters of 2+ pixels |
| Lines | One width (1 px); diagonals use regular steps (1:1, 2:1, 3:1); no jaggies |
| Alpha | 0 or 255 only in every sprite, icon and VFX frame |
| Silhouette | The flat-fill silhouette identifies class or enemy family; elites and the boss are larger or carry an overlay, never just recoloured |
| Readability check | Review at 1x on the real combat background and at 4x next to the reference |
| Materials | `metal` (iron/gold ramps, hard steps, 1–2 px glint), `cloth` (low in its ramp, top tone as accent), `skin/bone` (bone ramp, mid-biased), `glow` (ember/rot/rift top tones, unshaded) |

---

## 7. Sprite and icon sizes

All sizes are canvas sizes in base px. The figure fills at least 75% of the canvas height; feet sit on the bottom row of the canvas (the anchor is bottom-centre for units, centre for icons and VFX).

### 7.1 Units

The combat units row (§11.5) has 80 px slots and a 146 px sprite box (y 44–190, feet on y 190).

| Asset | Canvas | Figure height | Entities |
|---|---|---|---|
| Hero | 64×80 | 60–72 | `shieldbearer`, `marksman`, `arcanist`, `confessor`, `bombardier` |
| Enemy, small | 48×48 | 32–44 | `chitter_swarm`, `lantern_leech` |
| Enemy, medium | 64×80 | 56–72 | `husk_penitent`, `ash_acolyte`, `wax_mourner`, `rust_templar` |
| Enemy, medium wide | 80×64 | 44–56 (quadruped) | `graft_hound` |
| Enemy, large | 80×112 | 90–108 | `choir_thing`, `ossified_brute`, `rift_stalker` |
| Elite | Same canvas as the base enemy + overlay `ui.elite_aura` (base + 8 px each side) | — | Elite `rust_templar` (88×96 overlay), elite `ossified_brute` (96×128 overlay) |
| Boss (2 slots) | 160×144 | 130–144 | `bell_maw` |

Elites have no new body art: the elite version is the base sprite + a palette tint in code (shift `iron`/`ash` tones one step towards `ember`, see §12.1) + the `ui.elite_aura` overlay (ember rim, 2-px notched frame of `ember2`/`ember3` drawn behind the sprite) + a crown marker on the HP bar.

### 7.2 Portraits, card art and icons

| Asset | Canvas | Notes |
|---|---|---|
| Portrait, large | 48×48 | Party select, camp, run summary; head and shoulders, facing right |
| Turn-queue portrait | 20×20 | Head only; frame shape from `ally`/`enemy` tokens is drawn by the UI, not in the icon |
| Card art | 60×40 | Its own illustration, never the battle sprite reduced; one per card |
| Item icon | 24×24 | Equipment (weapons and relics) in camp, shop, reward |
| Relic icon, small | 16×16 | Top bar relic slots; a separate drawing, not a downscale |
| Status icon, small | 9×9 | Unit status row, card keyword row |
| Status icon, large | 12×12 | Detail panel, tooltips |
| Intent icon | 12×12 | Above enemies, followed by a Roboto number |
| Action icon (card keyword) | 9×9 | Attack, block, heal, stress, push, pull, draw, energy |
| Map node icon | 24×24 | Combat, elite, rest, shop, boss, current, visited |
| Energy orb | 44×44 | Number drawn by the UI font |
| Rank pip | 5×5 | 3 states: empty, origin, target |
| Stress pip | 4×3 | 2 states: empty, filled |
| Wordmark "Ossuary" | 320×64 (title), 256×52 (menu) | Custom pixel lettering, two separate drawings |

### 7.3 Status and intent icon set

| Status | Icon shape | Colour | Chevron |
|---|---|---|---|
| `block` | Shield | `ward1` | — |
| `might` | Raised fist | `gold2` | ▲ |
| `ward` | Ring with a rune | `bone2` | ▲ |
| `marked` | Crosshair | `ember3` | ▼ |
| `weakened` | Broken blade | `ash5` | ▼ |
| `bleed` | Droplet | `blood2` | ▼ |
| `burn` | Flame | `ember2` | ▼ |
| `stunned` | Spiral | `gold1` | ▼ |

| Intent | Icon shape | Colour | Number shown |
|---|---|---|---|
| `attack` | Sword | `blood2` | Final damage (×n for multi-hit: "6×2") |
| `block` | Shield | `ward1` | Block amount |
| `buff` | ▲ chevron in a circle | `gold2` | — |
| `debuff` | ▼ chevron in a circle | `rift2` | — |
| `stress` | Cracked mask | `rift2` | Stress amount |
| `push_pull` | Double arrow | `ash5` | — |
| `unknown` | "?" in a circle | `ash5` | — |
| `phase` | Bell | `ember3` | — (boss only, shown the turn before the switch) |

---

## 8. Typography

Superseded 2026-10-26 by ADR 0015: the 1-bit bitmap fonts (ADR 0010) are replaced by **Roboto** (SIL OFL 1.1, weights 400–700, self-hosted variable woff2 in `public/fonts/`, `font-display: swap`) for readability. Text is Phaser `Text` rendered at `resolution: 3`, so it stays sharp under the ×3 camera at 1920×1080. The game waits for `document.fonts.load` (3 s timeout, then the system sans-serif) before the Title scene, so text measures with the real font.

| Token | Size (640×360 space) | Weight | Use |
|---|---|---|---|
| `tiny` | 7 px | 400 | Detail-panel body, tooltips, footers, status counts, card owner line |
| `ui` | 9 px | 500 | Buttons, labels, card names, top bar, HP and intent numbers |
| `h2` | 14 px | 700 | Screen titles, energy orb number, damage and heal pop-ups, boss banner |
| `h1` | 20 px | 700 | Victory and Defeat banners |
| `display` | 26 px | 700 | Title wordmark, large numbers |

Rules:

- **API:** `label(scene, x, y, text, token, colour)` in `src/view/ui.ts` returns a `Text`; `setWordWrapWidth`, `setAlign` and `setColor` work as before. Sizes live in `src/view/fonts.ts`.
- **Colour:** `bone2` (primary), `ash5` (secondary), `ember3` (warning) or a semantic token. Text never sits on a busy background without a panel or a dark band.
- **Card names in Title Case.** PT-BR captions that overflow a button drop to `tiny` (Button auto-shrink).
- **Credits:** "Font: Roboto (SIL OFL 1.1)" in the menu credits (`menu.creditsFonts`).
- **Wordmark:** "Ossuary" is set in Roboto `display` until custom lettering exists (§7.2).

---

## 9. Design system: panels, buttons, states

### 9.1 9-slice panels

Every panel is a 24×24 source image cut into a 3×3 grid with **8 px corners**; edges tile, the centre is a flat fill (stretching is safe).

| Key | Fill | Border | Use |
|---|---|---|---|
| `ui.panel_stone` | `ash2` | 1 px `ash0` outside, 1 px `ash4` top-left bevel, 1 px `ash1` bottom-right bevel | Default panel (menus, shop, camp, reward) |
| `ui.panel_inset` | `ash1` | 1 px `ash0`, 1 px `ash3` bottom-right bevel (inverted) | Slots, lists, sunken areas |
| `ui.panel_tooltip` | `ash1` | 1 px `gold1`, corners with a 2×2 `gold2` stud | Detail panel, tooltips (6 px padding) |
| `ui.panel_topbar` | `ash1` | Bottom edge only: 1 px `ash0` + 1 px `gold0` | Top bar (640×24) |

### 9.2 Buttons

Buttons are 9-slice too (16×16 source, 6 px corners). Text: `font.ui` centred, tinted `bone2`.

| State | Visual | Trigger |
|---|---|---|
| Default | `ui.button` fill `iron1`, 1 px `ash0` border, 1 px `iron2` top bevel | — |
| Pressed | Fill `iron0`, bevel inverted, label moves down 1 px | Pointer down (≤ 100 ms response) |
| Selected | Default + 2 px `gold2` outline | Current choice in a group (speed 2x, a tab) |
| Focused | Default + `focus` corner brackets (`ember3`) | Keyboard focus only |
| Disabled | Fill `ash3`, label `ash4`, 1 px diagonal hatch `ash2` | Not available (reason in a tooltip) |
| Danger | Fill `blood1`, bevel `blood2` | Abandon run |

There is **no hover state** (touch first). Mouse users get the same visuals as touch; the cursor does not change appearance.

Sizes: primary 176×44 (menus), 96×44 (End Turn, confirm), secondary 44×28 (toggles), tertiary 24×24 (icons).

### 9.3 Toggles and sliders

| Control | Size | States |
|---|---|---|
| Speed toggle | 44×28 | Label "1x" / "2x" / "3x"; each tap cycles; "2x" and "3x" show the `selected` outline |
| Auto toggle | 44×28 | Label "AUTO"; on = `selected` outline + 2 px `ember3` underline that blinks every 500 ms (code) |
| Switch | 44×24 | Off: knob left on `ash3`; on: knob right on `gold1` + "ON"/"OFF" text |
| Slider | 160×12 track + 24×24 knob | Track `ash1`, fill `gold1`; value in `font.ui` right of the track |
| Segmented | n × 44×24 | Selected segment uses `selected` |

### 9.4 Input feedback (B30)

| Input | Visual response |
|---|---|
| Tap a card | Card rises 16 px, `selected` outline, valid targets get pulsing brackets, the detail panel opens, numbers on targets show the preview |
| Tap a valid target | Confirm: card flies to the target (code tween §12.1), effect plays |
| Tap outside / Esc | Deselect, panel closes |
| Long press (400 ms) | Tooltip for the element (status, intent, relic, keyword) |
| Keyboard 1–9 | Select card n; Tab cycles targets; Enter confirms; Space = End Turn |

---

## 10. Cards

### 10.1 Card anatomy (64×90)

| Zone | Rect (x, y, w, h) inside the card | Content |
|---|---|---|
| Frame | 0, 0, 64, 90 | Rarity frame (§10.2), 2 px |
| Art window | 2, 2, 60, 40 | `card.<id>` art |
| Cost gem | 0, 0, 16, 16 (overlaps frame) | `energy` orb shape with the cost in `font.ui`; an unplayable card shows the gem in `ash3` |
| Name strip | 2, 42, 60, 14 | Short name, `font.ui`, Title Case, left-aligned at x 4; names wider than 58 px use the i18n key `card.<id>.short` |
| Keyword row | 2, 56, 60, 14 | Up to 3 action icons (9×9) each followed by a number (`font.ui` digits), e.g. sword 6, shield 5 |
| Rank row | 2, 70, 60, 10 | Left: 3 origin pips (hero ranks 3-2-1, left to right); right: 4 target pips (enemy ranks 1-2-3-4); pip 5×5, 1 px gap |
| Owner band | 2, 80, 60, 8 | Hero band colour + 5×5 glyph at x 4 (§5) |

Card states: in hand (64×90), selected (raised 16 px, `selected` outline), unplayable (`invalid` hatch over the art and gem), upgraded (a `gold2` "+" after the name, a 1 px `gold1` line under the name strip).

### 10.2 Rarity frames

| Tier | Frame | Extra |
|---|---|---|
| Common | 2 px `ash4`, square corners | — |
| Uncommon | 2 px `iron2`, 3 px 45° clipped corners | — |
| Rare | 2 px `gold2`, square corners | 3×3 `gold1` stud on each corner; 7×3 crest centred on the top edge |
| Legendary | 2 px `ember3` + 1 px `gold2` inner frame with 1 px gap | Thorn crown 15×5 on the top edge; boss drops only |

Item icons use the same tier frames on their 24×24 slot.

---

## 11. Screens at 640×360

Coordinates are `x, y, w, h` in base px, origin top-left. Every screen keeps `margin.screen` (8 px).

### 11.1 Title

| Element | Rect | Notes |
|---|---|---|
| Background | 0, 0, 640, 360 | `bg.title` |
| Wordmark | 160, 96, 320, 64 | `ui.wordmark_title` |
| "Tap to start" | centred, y 232 | `font.ui`, `bone2`, blinks 600 ms on / 400 ms off (code); first tap requests fullscreen and unlocks audio |
| Version | 8, 344 | `font.tiny`, `ash5`, "v0.0.x" |

### 11.2 Main menu

| Element | Rect | Notes |
|---|---|---|
| Background | 0, 0, 640, 360 | `bg.menu` |
| Wordmark | 192, 32, 256, 52 | `ui.wordmark_menu` |
| Continue | 232, 112, 176, 44 | Disabled when there is no save |
| New Expedition | 232, 164, 176, 44 | Opens party select |
| Codex | 232, 216, 176, 44 | Disabled in the prototype ("Alpha") |
| Settings | 232, 268, 176, 44 | — |
| Version, credits | 8, 344 / 560, 344 | `font.tiny` |

### 11.3 Party select (pick 3 of 5)

| Element | Rect | Notes |
|---|---|---|
| Title "Choose your company" | centred, y 12 | `font.h2` |
| Hero cards ×5 | x 24 + i × 120, y 40, 112, 176 | Portrait 48×48 at (32, 8) in the card; name `font.ui`; role line `font.tiny`; 3 signature card icons 24×24 at y 128 |
| Selection marker | Inside a hero card, top-right 16×16 | Number 1–3 = rank order; `selected` outline |
| Rank preview | 200, 232, 240, 56 | 3 slots 48×48 at x 212, 296, 380 (rank 3, 2, 1 left to right) |
| Back | 24, 304, 96, 44 | — |
| Start | 520, 304, 96, 44 | Disabled until 3 heroes are picked |

### 11.4 Map (act of 10 rounds)

| Element | Rect | Notes |
|---|---|---|
| Top bar | 0, 0, 640, 24 | Same as combat (§11.5) without the turn queue: act and round, gold, relics, settings |
| Map area | 16, 32, 608, 256 | `bg.map.act1` |
| Node columns | x = 40 + (round − 1) × 62 for rounds 1–10 | Round 10 boss node is 32×32 at (584, 144) |
| Node rows | y = 88, 152, 216 (3 nodes) or 120, 184 (2 nodes) | 24×24 icons; paths 1 px `ash4` dotted, chosen path `gold2` solid |
| Current node | +4 px pulsing `ember3` ring | Code, 2 frames at 500 ms |
| Party strip | 16, 296, 400, 56 | Per hero (x 16 + i × 136): queue portrait 20×20, HP bar 64×5 and "HP" text, stress pips |
| Legend | 432, 296, 192, 56 | Node icons + names in `font.tiny` |

### 11.5 Combat

Zones (from the layout study, `docs/brainstorming.md` B28):

| Zone | Rect | Share of height |
|---|---|---|
| Top bar | 0, 0, 640, 24 | 6.7% |
| Units row | 0, 24, 640, 198 | 55% (background `bg.combat.act1` behind the whole screen) |
| Action band | 0, 222, 640, 138 | 38.3% |

Top bar:

| Element | Rect | Notes |
|---|---|---|
| Act and round | 8, 4, 142, 16 | "Act 1 · Round 3/10 · Turn 4" in `font.ui` + 10 round dots (6 px; done / current / boss by shape) |
| Enrage warning | 360, 6 | From turn 8: "Enemies enrage in n", from turn 10 "Enraged" (`ember3`); tap = rule tooltip (GDD §5.2) |
| Turn queue | 160, 2, 154, 20 | Up to 7 portraits 20×20, 2 px gap; next actor has a 2 px `gold2` frame and a ▼ marker; `ally` square frame, `enemy` notched frame |
| Gold | 488, 4, 56, 16 | Coin glyph + `font.ui` |
| Relics | 548, 4, 56, 16 | 3 × 16×16; "+n" chip when more |
| Settings | 608, 0, 24, 24 | Opens pause |

Units row (slot width 80, 8 px between hero slots):

| Element | Rect | Notes |
|---|---|---|
| Hero slots | x 16 + i × 88, i = 0..2 (rank 3, 2, 1 left to right), y 24, 80, 198 | Rank 1 is the rightmost hero (x 192) |
| Centre gap | 272, 24, 32, 198 | Targeting lines and pop-ups pass here |
| Enemy slots | x 304 + i × 80, i = 0..3 (rank 1..4 left to right), y 24, 80, 198 | Boss: slots 2–3 merged (384, 24, 160, 198) when alone; with adds, slots 1–2 for the boss |
| Intent strip | slot x, y 24, 80, 20 | Intent icon 12×12 + number `font.ui`, centred; tap = intent tooltip (unit tap zones start at y 44 so the strip keeps its taps) |
| Incoming (heroes) | hero slot, y 24, 80, 20 | Total incoming hit damage from all shown intents: red ▼ + number; stress icon + "+n" when targeted by stress |
| Sprite box | slot x, y 44, 80, 146 | Feet on y 190, centred |
| HP bar | slot x + 8, y 192, 64, 5 | `hp` token; block overlay on the right end |
| HP text | slot centre, y 198 | "68/85" `font.ui` digits |
| Status row | slot x + 4, y 210, 72, 9 | Up to 6 icons 9×9 with 3 px gap; stack count in `font.tiny`; overflow "+n" |
| Stress pips (heroes) | slot x + 8, y 186, 49, 3 | 10 pips 4×3, 1 px gap, above the HP bar |

Action band:

| Element | Rect | Notes |
|---|---|---|
| Energy orb | 12, 236, 44, 44 | "3/3" `font.h2` |
| Draw pile | 64, 236, 36, 44 | Count `font.ui` |
| Exhaust count | 64, 300, 24, 24 | Tap = list |
| Hand | 118, 258, 404, 90 | 6 cards × 64 + 5 gaps × 4; 5 cards centre (340 px); selected card rises 16 px |
| Speed toggle | 534, 230, 44, 28 | §9.3 |
| Auto toggle | 584, 230, 44, 28 | §9.3 |
| Discard pile | 534, 266, 36, 44 | Count `font.ui` |
| End Turn | 534, 312, 96, 44 | Primary button; Space key |

ASCII (1 char ≈ 8 px):

```text
+------------------------------------------------------------------------------+
| Act1 Rnd 3/10 o o o * . . . . . B | [H1][H2][H3][E1][E2][E3][E4] |  $320 R R R G|
+------------------------------------------------------------------------------+
|                                     [x6]     [x9]    [sh5]    [?]            |
|  .-----.  .-----.  .-----.            .-----. .-----. .-----. .-----.        |
|  | H3 >|  | H2 >|  | H1 >|    ---->   |< E1 | |< E2 | |< E3 | |< E4 |        |
|  '-----'  '-----'  '-----'            '-----' '-----' '-----' '-----'        |
|  ======    ======   ======            =====   =====   =====   =====          |
|  52/65     74/74    68/85             28/28   26/26   80/80   32/32          |
+------------------------------------------------------------------------------+
| (3/3)  [12]   .----..----..----..----..----..----.     [2x] [AUTO]           |
|               |2   ||1   ||1   ||2   ||1   ||0   |     [ 0 ] discard         |
|        [ex 0] |Name||Name||Name||Name||Name||Name|     [ END TURN ]          |
+------------------------------------------------------------------------------+
```

### 11.6 Card detail panel (168×120)

Opens on the first tap of a card, unit, status or intent, at 236, 96 (over the centre of the units row); laid out natively, never a scaled card.

| Element | Rect inside the panel | Notes |
|---|---|---|
| Panel | 0, 0, 168, 120 | `ui.panel_tooltip`, padding 6 |
| Cost gem | 6, 6, 16, 16 | — |
| Name | 26, 6, 136, 16 | Full name, `font.ui` |
| Type line | 6, 24, 156, 10 | "Shieldbearer · Attack · Rare", `font.tiny`, `ash5` |
| Body | 6, 36, 156, 60 | 6 lines × 10 px, `font.tiny`, wrapped with `setMaxWidth(156)` |
| Preview | 6, 98, 156, 16 | Result on the selected target, e.g. "→ 12 dmg · Rust Templar 28→16", `font.ui`, numbers in token colours |

### 11.7 Reward

| Element | Rect | Notes |
|---|---|---|
| Panel | 96, 40, 448, 280 | `ui.panel_stone` |
| Title | centred, y 52 | "Spoils", `font.h2` |
| Gold line | 112, 84, 416, 16 | Coin + amount |
| Card choices ×3 | x 216 + i × 72, y 108, 64, 90 | Tap = detail panel; second tap on the same card = take |
| Equipment drop (elite/boss) | 112, 212, 416, 40 | Item icon 24×24 with rarity frame + name + "Equip to…" |
| Skip | 112, 264, 96, 44 | — |
| Continue | 432, 264, 96, 44 | — |

### 11.8 Camp (after every round, B10)

| Element | Rect | Notes |
|---|---|---|
| Panel | 32, 24, 576, 312 | `ui.panel_stone`; background `bg.map.act1` dimmed |
| Party slots ×3 | x 64 + i × 64, y 64, 48, 48 | Rank order; HP and stress under each |
| Bench ×2 | x 288 + i × 64, y 64, 48, 48 | The 2 heroes not in the party |
| Swap button | 432, 64, 144, 44 | "Swap · 30g" (GDD §4.4); select a party hero then a bench hero |
| Offers ×3 | x 64 + i × 176, y 160, 160, 96 | GDD §4.4: 1 card for sale (35 / 55 / 90g by rarity), 1 equipment (50 / 85g), 1 service (12g: "Bind wounds" heals 15% max HP of every hero, or "Vigil" −3 stress on one hero); buy = tap twice |
| Reorder ranks | party slots | Drag or tap two heroes to swap ranks (free) |
| Leave camp | 480, 280, 96, 44 | Back to the map |

### 11.9 Shop node

| Element | Rect | Notes |
|---|---|---|
| Panel | 16, 32, 608, 312 | `ui.panel_stone` |
| Cards ×5 | x 40 + i × 76, y 56, 64, 90 | 3 common, 1 uncommon, 1 rare (GDD §4.6); price under each card (`font.ui`, coin glyph) |
| Equipment ×2 | x 40 + i × 136, y 184, 128, 56 | Icon 24×24 + name + price |
| Card removal | 448, 184, 152, 56 | "Remove a card · 50g", then +25 per removal this run (GDD §4.6) |
| Gold | 528, 8, 104, 16 | In the top bar |
| Leave | 504, 288, 96, 44 | — |

### 11.10 Rest (B15)

| Element | Rect | Notes |
|---|---|---|
| Choice tiles ×3 | x 56 + i × 184, y 80, 160, 176 | `ui.panel_stone`; icon 48×48; title `font.ui`; preview numbers |
| Recover | tile 0 | "+30% max HP, clears injury" with the per-hero result (GDD §4.5) |
| Temper | tile 1 | Upgrade 1 card: opens the deck list; shows before → after |
| Pray | tile 2 | "−5 stress" for every hero |
| Confirm | 272, 288, 96, 44 | Enabled after a choice |

### 11.11 Pause

| Element | Rect | Notes |
|---|---|---|
| Dim | 0, 0, 640, 360 | `ash0` at 70% alpha (UI overlay only; sprites keep 0/255 alpha) |
| Panel | 200, 28, 240, 304 | `ui.panel_stone` |
| Buttons ×6 | 232, 56 + i × 44, 176, 36 | Resume, Speed (1x/2x/3x), Auto (on/off), Settings, Restart run, Main menu (`danger`) |

### 11.12 Settings

| Element | Rect | Notes |
|---|---|---|
| Tabs ×5 | 16, 48 + i × 44, 120, 36 | General, Audio, Display, Accessibility, Controls |
| Content | 144, 48, 480, 296 | `ui.panel_inset`; rows 464×32 with 4 px gap |
| Row | label at x + 8, control right-aligned at x + 456 | Controls from §9.3 |
| Accessibility rows | — | Reduce shake (switch), Reduce flash (switch), Game speed (segmented), Text scale (Alpha), Colourblind mode (Alpha) |
| Back | 16, 304, 96, 44 | — |

### 11.13 Run summary

| Element | Rect | Notes |
|---|---|---|
| Panel | 40, 24, 560, 312 | `ui.panel_stone` |
| Result | centred, y 36 | "The descent ends" / "The bell is silenced", `font.h1` |
| Stats | 64, 88, 256, 160 | Rows `font.ui`: rounds cleared, enemies slain, gold earned, cards taken, highest damage |
| Heroes | 344, 88, 232, 64 | 3 portraits 48×48; fallen heroes get a 1 px `blood1` diagonal |
| Legacy earned | 344, 168, 232, 48 | Currency glyph + amount `font.display` |
| New Expedition | 112, 264, 176, 44 | — |
| Main menu | 352, 264, 176, 44 | — |

---

## 12. Feedback, VFX and animation

### 12.1 Code-driven feedback (prototype, static art)

Characters have no frame animation in the prototype; all motion below is code (tweens, tints, timers) on the scene clock, so it scales with game speed. At speed `s` ∈ {1, 2, 3}, every duration is `t(s) = t(1x) / s` because the presenter sets `time.timeScale`, `tweens.timeScale` and `anims.globalTimeScale` to `s` (`docs/web-research.md` §12.7). Audio is not sped up.

| Effect | Trigger | Parameters at 1x | At 2x | At 3x |
|---|---|---|---|---|
| Lunge | Hero or enemy attacks | Back 2 px in 90 ms (`Quad.easeOut`), forward 8 px towards the target in 50 ms (`Cubic.easeIn`), return in 140 ms (`Quad.easeInOut`) | 45 / 25 / 70 | 30 / 17 / 47 |
| Hit-stop | Contact | Pause both units 60 ms | 30 | 20 |
| Hit flash | Unit takes damage | `setTint(0xe8dcc0)` + `TintModes.FILL` for 70 ms | 35 | 23 |
| Knockback | Unit takes damage | 3 px away from the attacker in 80 ms (`Cubic.easeOut`), back in 120 ms | 40 / 60 | 27 / 40 |
| Shake (unit) | Heavy hit (≥ 25% max HP) | 2 px, 100 ms | 50 | 33 |
| Number pop | Damage, heal, block, stress | Rise 12 px over 600 ms (`Cubic.easeOut`), hold 200 ms, fade 200 ms; `font.h2`; colour from the token | 300 / 100 / 100 | 200 / 67 / 67 |
| Card fly | Card confirmed | From hand to target along a straight line in 180 ms, then the card fades 120 ms to the discard pile | 90 / 60 | 60 / 40 |
| Death | Unit at 0 HP | Flash 80 ms, sink 2 px and fade to alpha 0 in 350 ms (`Quad.easeIn`) | 40 / 175 | 27 / 117 |
| Elite tint | Elite spawns | Constant palette tint (iron/ash tones one step towards ember) + `ui.elite_aura` | — | — |
| Boss phase | `bell_maw` at 50% HP | Screen shake 3 px 300 ms, full-screen `bone2` flash 2 frames (33 ms), banner `font.h1` 1200 ms | 150 / 17 / 600 | 100 / 11 / 400 |
| Collapse (stress 10) | Hero reaches 10 stress | Hero flash `rift2` 120 ms, shake 2 px 200 ms, "COLLAPSE" `font.ui` pop | 60 / 100 | 40 / 67 |

Settings: "Reduce shake" sets every shake to 0 px; "Reduce flash" replaces fills with a 2 px outline blink of the same colour and removes full-screen flashes. Every effect respects `skipAnimations` (tests) and never blocks a rule (the core does not wait on animations).

### 12.2 VFX (prototype)

Frame-animated sprites, anchored at the centre of the target's sprite box unless noted. Alpha 0/255, ≤ 8 colours each.

| Key | Canvas | Frames | fps | Duration at 1x | Palette |
|---|---|---|---|---|---|
| `vfx.hit` | 32×32 | 5 | 20 | 250 ms | `bone2`, `ash6`, `blood2` |
| `vfx.block` | 32×32 | 4 | 16 | 250 ms | `ward0`, `ward1`, `ash6` |
| `vfx.heal` | 32×32 | 6 | 12 | 500 ms | `rot1`, `rot2`, `bone2` |
| `vfx.burn` | 32×32 | 4 | 10 | 400 ms (plays on each burn tick) | `ember1`, `ember2`, `ember3` |
| `vfx.bleed` | 32×32 | 5 | 15 | 333 ms | `blood0`, `blood1`, `blood2` |
| `vfx.stress` | 32×32 | 5 | 12 | 417 ms | `rift0`, `rift1`, `rift2` (cracks over the head) |
| `vfx.collapse` | 48×48 | 8 | 12 | 667 ms | `rift1`, `rift2`, `ash0`, `bone2` |
| `vfx.boss_phase` | 160×144 | 10 | 12 | 833 ms | `ember2`, `ember3`, `gold2`, `bone2` (bell shockwave rings) |

VFX play with the scene's animation time scale, so their duration also divides by the game speed.

### 12.3 Animation rules (Alpha)

Frame animation for characters starts in Alpha. Frames are baked in Aseprite from pose data (`asset-animation` skill); never rotate or scale a bitmap.

| Animation | Frames | Timing | Notes |
|---|---|---|---|
| `idle` | 2–4 | 6–8 fps (125–167 ms per frame, uneven holds: e.g. 160, 120, 160, 120 ms) | Whole-pixel bob of 1 px; cloth one frame late |
| `attack` | 6 | 90, 120, 50, 140, 100, 100 ms | Anticipation, hold, smear (shortest), contact (longest), recovery, settle; damage fires at frame 4 |
| `cast` | 4–6 | 100–140 ms per frame | For skills without a weapon swing |
| `hurt` | 0 (code) | §12.1 | Flash + knockback |
| `death` | 0 (code) | §12.1 | Flash + sink + fade |
| Boss `idle` | 4 | 8 fps | Bell sway 1–2 px |
| UI | — | — | All UI motion is code (tweens), 80–200 ms, `Quad`/`Cubic` easing |

A loop needs at least 3 distinct drawings and never shows the same drawing twice in a row. Tag names are fixed: `idle`, `attack`, `cast`.

---

## 13. Audio style sheet

No voice acting (`.claude/rules/assets.md`). Everything is generated with ElevenLabs after the cost gate, logged in `art-src/audio-log.jsonl`, normalised, and shipped as `ogg` (primary) + `mp3` (fallback) under `public/assets/audio/`. The game must work with audio blocked or missing.

### 13.1 Music (4 loops in the prototype)

| Key | Screen | Genre and instrumentation | BPM | Key / mode | Length | Mood |
|---|---|---|---|---|---|---|
| `music.menu` | Title, menu, party select | Dark ambient, wordless low choir pad, distant bell, cello drone | 60 | D minor | 60 s (generated 2026-10-26); target 90–120 s in Alpha | Solemn, cold |
| `music.map` | Map, camp, shop, rest | Sparse liturgical chant over low strings, soft frame drum | 72 | D Dorian | 60 s (generated 2026-10-26); target 90–120 s in Alpha | Wary travel |
| `music.combat` | Combat | Low string ostinato, industrial percussion (metal hits, chains), muted brass stabs | 104 | D Phrygian | 60 s (generated 2026-10-26); target 90–120 s in Alpha | Tense, steady, no climax |
| `music.boss` | Boss combat | Full choir (wordless), pounding drums, bell tolls on downbeats, distorted low brass | 124 | C# minor | 60 s (generated 2026-10-26); target 90–120 s in Alpha | Dread, urgency |

Loop rules: start and end at the same bar with no reverb tail crossing the seam; a 1-bar musical lead-in is cut off; crossfade between screens 800 ms.

### 13.2 SFX (about 35 in the prototype)

| Category | Keys (`sfx.<category>.<id>`) | Count |
|---|---|---|
| `card` | `draw`, `play`, `exhaust`, `upgrade`, `invalid` | 5 |
| `hit` | `slash`, `blunt`, `pierce`, `fire`, `multi` | 5 |
| `block` | `gain`, `absorb`, `break` | 3 |
| `status` | `marked`, `weakened`, `bleed`, `burn`, `ward`, `stun` | 6 |
| `stress` | `gain`, `collapse`, `relief` | 3 |
| `unit` | `hero_fall`, `enemy_death`, `boss_phase` | 3 |
| `ui` | `tap`, `confirm`, `cancel`, `open`, `close`, `coin`, `end_turn` | 7 |
| `flow` | `victory`, `defeat`, `reward` | 3 |
| **Total** | | **35** (GDD §17.1) |

Each SFX: 0.1–2 s (ElevenLabs maximum is 30 s per generation; `docs/web-research.md` §13.3), dry (no long reverb), no music.

### 13.3 Loudness targets

| Target | Value | Source |
|---|---|---|
| Music, integrated | −16 LUFS (target) | Meta's Quest guidance uses −16 LUFS for standalone apps ([Meta audio loudness](https://developers.meta.com/horizon/documentation/unreal/audio-loudness-meter-overview/)); ASWG-R001 recommends −24 LUFS for console games ([Audio Media International](https://audiomediainternational.com/mobile-loudness-an-adaptive-approach/)). Web/mobile is closer to the louder target; −16 is our choice, to confirm in playtest |
| SFX, peak | ≤ −1 dBTP true peak; loudest hits around −14 LUFS short-term (target) | −1 dBTP ceiling as in EBU R128 ([EBU R128 summary](https://www.merging.com/uploads/assets/Merging_pdfs/FinalCheck/EBU%20R128%20-%20Loudness%20Recommendation.pdf)); the −14 short-term figure is our target, not from a standard |
| Default mix | Music 70%, SFX 100% (sliders in settings) | — |

---

## 14. Asset keys

From `.claude/rules/assets.md`, with the project's entities. Files live in `public/assets/` under the key (dots kept in file names: `hero.shieldbearer.idle.png`).

| Family | Pattern | Prototype keys |
|---|---|---|
| Heroes | `hero.<class>.<pose>` | `hero.{shieldbearer,marksman,arcanist,confessor,bombardier}.idle` |
| Enemies | `enemy.<id>.<pose>` | `enemy.{husk_penitent,chitter_swarm,ash_acolyte,graft_hound,wax_mourner,rust_templar,lantern_leech,choir_thing,ossified_brute,rift_stalker}.idle` |
| Boss | `enemy.<id>.<pose>` | `enemy.bell_maw.idle` |
| Cards | `card.<id>` | 45 card ids from the GDD |
| Icons | `icon.<kind>.<id>` | `icon.status.<status>.{9,12}`, `icon.intent.<intent>`, `icon.action.<action>`, `icon.item.<item>`, `icon.relic.<item>` (16×16), `icon.node.<type>`, `icon.portrait.<hero>` (48×48), `icon.queue.<entity>` (20×20) |
| UI | `ui.<id>` | `ui.panel_stone`, `ui.panel_inset`, `ui.panel_tooltip`, `ui.panel_topbar`, `ui.button`, `ui.frame_common`, `ui.frame_uncommon`, `ui.frame_rare`, `ui.frame_legendary`, `ui.cost_gem`, `ui.energy_orb`, `ui.rank_pip`, `ui.stress_pip`, `ui.hp_bar`, `ui.elite_aura`, `ui.wordmark_title`, `ui.wordmark_menu`, `ui.pile_draw`, `ui.pile_discard`, `ui.pile_exhaust`, `ui.gear` |
| Backgrounds | `bg.<screen>[.<act>]` | `bg.title`, `bg.menu`, `bg.map.act1`, `bg.combat.act1` |
| VFX | `vfx.<id>` | §12.2 |
| Music | `music.<id>` | §13.1 |
| SFX | `sfx.<category>.<id>` | §13.2 |
| Fonts | `font.<token>` | `font.tiny`, `font.ui`, `font.h2`, `font.h1`, `font.display` |

---

## 15. Prompt templates

Rules: never "in the style of" a work, studio or artist; always state canvas size, view, facing, palette limit, light and outline; generation output is a draft that goes through palette snapping and hand cleanup (`aseprite-pixel-assets`). Every call is logged in `art-src/` with prompt, parameters, date and cost.

### 15.1 PixelLab

The game renders at 1920×1080 and every PixelLab asset is generated at its native size, never upscaled: heroes and medium enemies 192×240, small enemies 144×144, wide enemies 240×192, large enemies 240×336, bosses up to 480×432 (Bell-Maw 400×360), card art 180×120, backgrounds 1920×1080. Units come from PixelLab Pro (`/generate-image-v2`, 10 generations each) with a concept-art crop as `style_image` and the master palette as `target_palette`. Card art uses pixflux (`/create-image-pixflux-background`, 1 generation). Scripts: `scripts/assets/pro-units.ts` (units, cards), `scripts/assets/stitch-bg.ts` (backgrounds), `scripts/assets/manifest.ts`.

Unit template (one template for every hero, enemy and boss; `{facing}` is `right` for heroes and `left` for enemies, `{description}` is the per-unit sentence):

```text
2D side-scroller game sprite of a single character in strict side profile, like a fighting game
character seen exactly from the side. The torso, hips and legs are turned 90 degrees in profile,
the head and face are in profile pointing to the {facing} edge of the image, only one shoulder and
the near arm and leg are clearly visible, flat orthographic camera at eye level, the whole body
visible from head to feet, the whole figure fits inside the canvas with a small margin, feet planted
on a flat ground line near the bottom edge of the canvas, facing {facing}. {description}
Grimdark dark fantasy, worn and weathered. Dark tinted outline, single light from the upper left,
muted master palette of ash greys, dark iron, bone, worn gold and deep crimson accents, no pure
black, no pure white. No text, no background, no ground, no shadow, no frame, no other characters.
```

Call parameters: `image_size` = native canvas, `no_background: true`, `style_options: { color_palette: false, outline: true, detail: true, shading: true }`, `style_image` = crop of `references/concept-arts/batle-1.png` (heroes: the knight; enemies: the enemy group), `target_palette` = the 33 master colours. Do not pass a front-facing concept crop as `reference_images`: it pulls the pose to the camera. After generation each file is palette snapped, trimmed to its bounding box and bottom aligned in the canvas (consistent feet baseline, natural scale). Every unit is checked on a contact sheet for facing, side profile, full body and scale; failures are regenerated with a rewritten `{description}` (for example "standing upright and calm, not lunging").

Card art template (pixflux, 180×120, `outline: lineless`, `shading: medium shading`, `detail: highly detailed`, master palette as `color_image`):

```text
Pixel art illustration for a card, wide landscape composition, one clear focal point. {scene}.
Grimdark dark fantasy, cold ash greys, dark iron, bone, ember orange and worn gold, strong value
contrast at the focal point, dark vignette edges, light from the upper left. No border, no frame,
no text, no letters, no stars, no pentagrams, no eight-pointed symbols.
```

Background pieces (Pro, 688×384, the largest 16:9 size the endpoint allows):

```text
{piece: mid = the architecture of the stage, far = distant silhouettes}. Pixel art background piece,
strict side view, flat orthographic camera, grimdark dark fantasy, dark desaturated palette of ash
greys, dark iron and deep crimson, light from the upper left, no characters, no text, no UI, no frame.
```

Backgrounds are composed by `scripts/assets/stitch-bg.ts` into 1920×1080: a far layer (darkened, mirror tiled so seams are continuous), a mid layer (mirror tiled, base on the floor line), a procedural flagstone floor in the bottom 25 % (y 810 to 1080, flat, where units stand), a glow band above the floor line, global grading (desaturate, tint, vignette) and palette snapping. Horizon at 55 % (y 594); the middle 60 % holds no focal subject. Map backgrounds are a procedural top-down slab floor. Outpainting every 1920×1080 with `/inpaint-v3` would cost about 700 generations per background (25 per 512 px window), which is why pieces are composed by code.

Costs measured on the account (generations): Pro unit 10, Pro 688×384 piece 25, inpaint-v3 window 25, pixflux 1, Pro Flash 6 to 9.

Hand-off rule: the generated draft goes through palette snapping and, when needed, hand cleanup (`aseprite-pixel-assets`). Every call is logged in `art-src/pixellab/generation-log.json` with prompt, parameters, concept file used, date and usage.

UI piece:

```text
Pixel art UI {piece}, {W}x{H} px, 9-slice friendly with {8} px corners, flat centre fill.
Dark stone with a 1 px light bevel on the top-left and a 1 px dark bevel on the bottom-right,
{worn gold | ember} accents. At most 8 colours. Transparent outside the shape. No text.
```

Icon:

```text
Pixel art icon, {S}x{S} px, centred, {shape} clearly readable at 1x, 1 px dark outline,
at most {6|10} colours: {token colours}. Transparent background. No text.
```

### 15.2 ElevenLabs

Sound effect (duration set explicitly, 40 credits per second when set; `docs/web-research.md` §13.3):

```text
{Action and material}, {close | room} perspective, dry, no music, no voice, {0.4} seconds.
```

Examples: "Heavy mace striking rusted plate armour, dull metallic crunch, close, dry, no music, no voice, 0.5 seconds." · "Single deep cathedral bell toll with a short cracked overtone, distant, 2.0 seconds, fade out." · "Card slid across rough parchment and slapped on stone, close, dry, 0.3 seconds."

Music loop:

```text
Instrumental loop for a {screen} in a dark fantasy game. {BPM} BPM, {key/mode}.
{Instrumentation from §13.1}. {Mood}. No vocals with words. No melody climax.
{Length} seconds, seamless loop: the end must flow into the start with no reverb tail.
```

---

## 16. Prototype asset list

| Group | Items | Count | Source |
|---|---|---|---|
| Heroes | 5 × `idle` (64×80) | 5 | PixelLab draft + cleanup |
| Enemies | 10 × `idle` (sizes §7.1) | 10 | PixelLab draft + cleanup |
| Boss | `bell_maw` `idle` (160×144) | 1 | PixelLab draft + cleanup |
| Elite overlay | `ui.elite_aura` (2 sizes) | 2 | Hand / script |
| Portraits | 5 × 48×48 | 5 | Script from hero art + cleanup |
| Queue portraits | 5 heroes + 10 enemies + boss, 20×20 | 16 | Hand |
| Card art | 45 × 60×40 (9 per hero) | 45 | PixelLab draft + cleanup |
| Card UI | 4 rarity frames, cost gem, rank pip (3 states), owner glyphs (5) | 13 | Hand |
| Item icons | 8 × 24×24 + relic icons 16×16 for relic-slot items | 8 + up to 8 | PixelLab draft + cleanup |
| Status icons | 8 statuses × 2 sizes (9, 12) | 16 | Hand |
| Intent icons | 8 × 12×12 | 8 | Hand |
| Action icons | 8 × 9×9 | 8 | Hand |
| Map node icons | 7 × 24×24 | 7 | Hand |
| UI panels and buttons | 4 panels, 1 button source, energy orb, HP bar parts (3), stress pip (2), piles (3), gear, toggles (2) | 17 | Hand |
| Wordmark | Title + menu | 2 | Hand |
| Backgrounds | `bg.title`, `bg.menu`, `bg.map.act1`, `bg.combat.act1` (640×360) | 4 | PixelLab draft + cleanup |
| VFX | §12.2 | 8 | Hand (Aseprite) |
| Fonts | 5 atlases | 5 | Generated (no cost) |
| Music | §13.1 | 4 | ElevenLabs |
| SFX | §13.2 | 35 | ElevenLabs |

Totals: about 175 image assets (about 76 through PixelLab: 5 + 10 + 1 + 45 + 8 + 4 backgrounds + up to 2 retries each), 4 music loops, 35 SFX. Cost estimate and the approval go through the cost gate in the PLAN (task 5) using `asset-pricing` research: PixelLab plan prices are not verified (official pricing page unavailable, `docs/web-research.md` §13.2); ElevenLabs API: SFX US$ 0.12/min, music US$ 0.15/min (§13.3).

---

## 17. Open items

| Item | Owner | Due |
|---|---|---|
| Confirm with Roboto at the `tiny` size that 58 px name-strip fits ≥ 9 characters; otherwise set `card.<id>.short` rules | Sonnet agent | First atlas build (PROTOTYPE group 1) |
| Zoom spike on real phones (Safari iOS, Chrome Android) with browser UI visible | Sonnet agent | PROTOTYPE group 1 |
