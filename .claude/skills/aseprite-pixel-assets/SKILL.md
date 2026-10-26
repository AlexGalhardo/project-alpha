---
name: aseprite-pixel-assets
description: Use when creating, changing, cleaning or exporting any pixel-art asset of project-alpha by script — Lua run in Aseprite batch mode under `art-src/aseprite/` (character renderer, card art, icons, UI, palette), Aseprite command-line exports (sheets, JSON atlases, tags, palette conversion), normalising AI-generated sprites to the master palette, or publishing pixel art to `public/assets/`. Encodes the pixel craft as rules (ramps, one light, form and cast shadow, selective outline, materials, clusters) and the verified API and CLI behaviour of Aseprite 1.3.
---

# Aseprite pixel assets (Lua + CLI)

Craft rules come from the `pixel-logic` skill; this skill is how they are executed by code.
Sizes, palette and frame counts live in the Art Bible (`docs/art-bible.md`). `.claude/rules/assets.md`
and the Art Bible win over anything here.

"Programmatic" means reproducible by script, not purely procedural: hand-placed marks and
pixel maps in data are welcome where a formula gives a poor shape.

## Pipeline layout

Tooling is **Bun + Aseprite only** (no Python, no Node). Lua runs inside Aseprite batch mode;
everything around it (build, validation, review sheets, publishing) is a Bun script.

| Piece | Role | Status |
|---|---|---|
| `art-src/aseprite/scripts/*.lua` | Palette loader, renderer, one script per asset family (characters, card art, icons, UI) | a criar (PLAN, fase PROTÓTIPO) |
| Character descriptions in data (JSON) | Parts, poses and timings read by the Lua renderer | a criar (PLAN, fase PROTÓTIPO) |
| `bun scripts/assets/...` | Build (calls `aseprite -b`), validators, review sheets, publish to `public/assets/` | a criar (PLAN, fase PROTÓTIPO) |

Binary: path from the `ASEPRITE` environment variable. The trial cannot save or run scripts;
never work around it. Never commit the binary or its source.

## Size contract

Canvas size per asset key is defined in the Art Bible; the publish step refuses any size that
is not listed there. Placeholders use the same sizes and keys (`.claude/rules/assets.md`).

## Craft encoded in the renderer

One description per character (primitives with depth), one renderer for all of them:

1. **Visibility at pixel centres.** The nearest primitive owns the pixel. No supersampling,
   no partial alpha: alpha is 0 or 255.
2. **Tone from the light, not from the edge.** `v = N . L`, `L` from the top-left and a
   little towards the viewer. The tone index comes from `v`; shading that follows the
   outline inwards is pillow shading and is never produced.
3. **Materials are ramps plus a model** (master palette):
   - `metal`: few hard steps, last tone reserved for a 1-2 px glint where `N . H` peaks,
     reflected light lifts the deepest shadow by one tone.
   - `cloth`: soft, sits low in its ramp; the top tone is a small accent. Folds and stains
     are marks, not gradients.
   - `skin` (also bone): mid-biased, no glint.
   - `glow` (fire, coals, lenses): unshaded, hottest inside, no outline, casts no shadow.
   - flat colour and flat emissive, for single-colour details.
4. **Hue-shifted ramps.** Shadows fall into shared violet inks, lights drift warm; a ramp
   has 3-6 tones and two neighbours must differ visibly at 1x.
5. **Cast shadow.** A nearer part of another group, one or two pixels towards the light,
   takes one tone away (two for big occluders such as heads and shields).
6. **Separation only where needed.** Between two parts of different groups, the back pixel
   becomes the darkest tone of its own ramp when the two tones are too close at 1x.
   Coloured line, never black, never everywhere.
7. **Selective outline.** 1 px outside the silhouette: darkest ink on the shadow side, the
   material's line colour on the lit side. Nothing around emissive parts.
8. **Clusters.** A pixel whose four neighbours all have another tone joins the majority tone
   of its own group (marks and separation lines are protected).
9. **Budget.** Colour limit per sprite from the Art Bible (about 16 including transparency),
   across all frames; the build fails otherwise. Nothing may touch the canvas edge except
   the outline.

Dithering is not used on characters. Anti-aliasing is not used on the outer edge.

### Side view and facing

- Combat is side view: heroes in ranks on the left **face right**; enemies on the right
  **face left**.
- Draw each character once, facing right. Enemies are the same description mirrored
  **before shading**, so the light stays top-left on both sides. Never mirror a shaded bitmap.
- Proportions for small sprites: big head, wide torso, short legs; face features shifted
  towards the facing side; near arm in front, far arm behind and one tone darker.
- Keep readability first: weapons against the background, not over the body; light on dark.
- Card art, portraits and icons are separate drawings with their own canvases, never the
  battle sprite scaled.

### Isometric tiles

Only if the Art Bible ever adds an isometric map (not planned): follow `pixel-logic`
(2-pixel stairs, lineless diamonds, tiles on a grid). Combat backgrounds are side-view
layers with less contrast and saturation than the characters.

## Aseprite Lua API (verified, batch mode)

```lua
local spr = Sprite(32, 40, ColorMode.INDEXED)
spr:setPalette(pal)            -- a fresh batch sprite has 256 black entries
spr.transparentColor = 0
local layer = spr:newLayer(); layer.name = "body"
spr:newEmptyFrame(2); spr.frames[2].duration = 0.2      -- seconds
spr:newCel(layer, 2, image, Point(0, 0))
local tag = spr:newTag(1, 4); tag.name = "idle"          -- aniDir, repeats also exist
spr:saveAs(path .. ".aseprite"); spr:saveCopyAs(path .. ".png")
```

- Draw into plain Lua grids and write once with `Image:drawPixel`; `Image:pixels()` and
  `Image.bytes` are the fast paths for reading.
- `json.decode` returns read-only userdata proxies: you cannot add fields, `#` on an object
  counts its keys, and `pairs` works. Copy into plain tables first.
- `io.open`, `app.fs`, `app.params` (from `--script-param k=v`) work. `os.exit` is blocked.
- Commands need `ui=false`. `app.command.Outline`, `ColorQuantization`, `ChangePixelFormat`,
  `app.useTool{tool="line", ...}` and `app.transaction` work in batch.
- There is no free-angle rotation: `Rotate` does 90/180/-90 only, 45 is a silent no-op.
  A turned limb is drawn from the description, never rotated as a bitmap.
- Linked cels: `app.command.NewFrame{content="cellinked"}` or `app.range` + `LinkCels()`;
  passing the same `Image` to two `newCel` calls makes copies.
- Output is deterministic: same script, same bytes.

## Aseprite CLI (verified option order)

Filters go **before** the file, transforms and outputs **after** it; a misplaced option is
ignored without a message.

```sh
# atlas Phaser reads: frames named 0..n, tags listed, one strip per character
aseprite -b hero.templar.aseprite --sheet hero.templar.png --data hero.templar.json \
  --format json-array --sheet-type horizontal --list-tags --filename-format {frame}
# one tag only: the filter comes first
aseprite -b --tag attack hero.templar.aseprite --sheet attack.png --data attack.json --format json-array
# 4x review copy: scale after the file, before the output
aseprite -b hero.templar.png --scale 4 --save-as hero.templar@4x.png
# snap an RGB PNG to the master palette: exactly this order
aseprite -b draft.png --palette palette.gpl --dithering-algorithm none --color-mode indexed --save-as clean.png
```

- `frameTags[].direction` is `forward`, `reverse` or `pingpong`; `repeat` appears only when
  it is not 0, as a string.
- `--sheet-type packed` merges identical frames by itself: do not use it for animation strips
  whose frame index matters.
- On Windows the executable is a GUI program: run it from Bun with `Bun.spawnSync` and read
  stdout/stderr from the pipe.

## Failure handling

A Lua error exits with -1, but a missing input file and an unknown option still exit 0, and an
error can be printed without file and line. The Bun build therefore checks three things: exit
code, absence of `FAILED:`/`.lua:<n>:` in the output, and a final `done: <script>` line that
every Lua script prints last.

## Cleaning AI-generated sprites (when the cost gate allowed generating)

1. Find the true pixel size first (drafts are often upscaled or off-grid); crop to the cell.
2. Alpha to 0 or 255 with a hard threshold (128) before anything else.
3. Snap to the master palette by nearest colour: `ChangePixelFormat{format="indexed",
   dithering="none", fitCriteria="rgb", ui=false}` after `setPalette` — only `"rgb"` is plain
   nearest colour; the default criterion differs on many pixels, unknown strings are accepted
   silently and partial alpha becomes opaque.
4. Cut to the colour budget by merging the tones two ramps share; never by dithering.
5. Re-anchor the feet, redo the outline (renderer rules 6-7), run the validators, then retouch
   by hand in Aseprite what the 1x review shows (face, weapon, hands).

## Validators (Bun, a criar)

Size per key; every colour in the master palette; colour budget per sprite and across the
frames of its atlas; alpha only 0 or 255; character anchors (feet on the sole row, centred,
figure filling most of the height); orphan pixels (no 4-neighbour of the same colour, accents
excepted) under a small share per frame; atlas JSON has the expected tags and frame names
`0..n`.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Flat doll | Tone bands by height or by edge distance | Tone from normals; far side darker; cast shadows |
| Washed out | Cloth mapped high in the ramp | Keep the base tone low; top tone as accent |
| Parts melt together | Same tone on two parts | Different groups, or change one material |
| Noise | Random pixels, single-pixel marks | Clusters of 2+; hand-placed marks; orphan pass |
| Figure too small | Realistic proportions | Big head, wide torso, short legs |
| Weapon unreadable | Drawn over the body in a close tone | Hold it against the background |
| Light flips on enemies | Bitmap mirrored after shading | Mirror the description before shading |
| Build passes, files stale | Aseprite failed quietly | `done:` line check; empty generated folders first |
| Colour budget exceeded | One ramp too many | Share inks; use flat colours; drop a material |

## Checklist

- [ ] Changed a script or a description, not an output; rebuilt with the Bun build.
- [ ] Validators pass.
- [ ] Reviewed at 1x on the real combat background and at 4x next to the reference; every animated frame seen.
- [ ] Silhouette identifies the class or enemy in a flat fill.
- [ ] Hero faces right, enemy faces left, light top-left on both.
- [ ] Published to `public/assets/` under its key and seen in the game.
