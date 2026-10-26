---
name: inkscape-vector-assets
description: "Use when creating, changing or rendering SVG placeholders of project-alpha — stand-in art for characters, enemies, card art, icons and UI that uses the same canvas size and asset key as the final pixel art, authored by code, optionally rasterised with the Inkscape 1.4 CLI. Covers the placeholder contract (`.claude/rules/assets.md`), SVG authoring rules that keep placeholders readable and crisp at integer scale, the verified Inkscape CLI recipes and the validators. Not for final art: the game ships pixel art only."
---

# Inkscape vector assets (SVG placeholders)

Scope: **placeholders only.** The game ships pixel art (`AGENTS.md`, `.claude/rules/assets.md`).
A placeholder exists so the game is playable before the final sprite; swapping it for the
sprite must never touch game logic. Final art goes through `alpha-art-assets` and
`aseprite-pixel-assets`. Project rules win over this file: `.claude/rules/assets.md`,
`.claude/rules/ip-and-tone.md`, Art Bible (`docs/art-bible.md`).

Placeholders are written by code (a Bun script emits the SVG text), never drawn by hand, so a
rebuild gives the same bytes. Generator and validators: `bun scripts/assets/...`, to be created
(PLAN, PROTOTYPE phase). Tooling is Bun + Inkscape only (no Python, no Node).

## Placeholder contract

- **Same canvas size and same key as the final asset** (sizes from the Art Bible). One logical
  pixel = one SVG unit: `width`, `height` and `viewBox` equal the final sprite size in pixels,
  no `transform` on the root.
- Same anchor as the final sprite: feet on the bottom row, centred.
- Side view: heroes **face right**; enemies **face left** (mirror the geometry, not a shaded
  image, so the light stays top-left).
- Only colours of the master palette. No `<image>`, `<text>`, `<filter>`, gradients, `style`
  blocks or external references. No black (`#000000`).
- The silhouette already identifies class or enemy family (weapon, helm, hood, size). Ally
  and enemy differ by shape, never only by colour.
- Card art, portrait and icon placeholders have their own canvases, as in the final set.

## Keeping a placeholder crisp at integer scale

The browser rasterises an SVG when the texture is created (Phaser `load.svg`), so:

- Load it at its final size (`width`/`height` in the loader config) and let the game scale
  by whole numbers like any sprite; never let the browser scale it.
- Put every edge on whole units (coordinates and widths in integers) and prefer
  `shape-rendering="crispEdges"` in the browser. Inkscape ignores that attribute; when a
  PNG is needed, export with `export-png-antialias:0` (hard edges, clip paths included).
- Few masses, big head, strong gesture: a placeholder is read at 1x.

## Inkscape CLI (verified, Inkscape 1.4.2 on Windows)

Use `inkscape.com` (console wrapper), never `inkscape.exe`. Path from the `INKSCAPE`
environment variable; call it from Bun with `Bun.spawn` and feed stdin.

- **One process for many files.** Start-up costs 3-4 s; `--shell` fed through stdin exports at
  about 0.4 s per file against about 4.5 s with one process per file, byte-identical output:

```text
file-open:C:/abs/in.svg; export-type:png; export-area-page; export-width:32; export-png-antialias:0; export-filename:C:/abs/out.png; export-do; file-close
quit
```

- **Options persist inside a session**, across `file-close`/`file-open`: every job sets every
  option it depends on (`export-type`, `export-width`, `export-area-page`, `export-id`,
  `export-png-antialias`).
- Do not pass `--batch-process`: not needed, three times slower, GTK noise.
- `--actions` on the command line dies at the 32,767-character Windows limit; use `--shell`
  or `--actions-file=FILE`.
- `export-id:NAME; export-id-only` exports one group; `export-area:x0:y0:x1:y1` uses a
  top-left origin, y down, whatever the man page says.
- Background is transparent by default.
- Verified to render: `clip-path`, `<use xlink:href>` (also plain `href`), `<symbol>`,
  `paint-order="stroke"`, `vector-effect="non-scaling-stroke"`.
- Never write `export-filename:-` in shell mode: it hangs.

## Isometric construction

Only if the Art Bible ever adds an isometric map (not planned): follow `pixel-logic`.

## Validators (Bun, to be created)

Fail on: root size or `viewBox` different from the Art Bible size for that key; a key with no
matching final-asset entry; a colour outside the palette; `<image>`, `<text>`, `<filter>`,
gradient or `style` element; non-integer coordinates or stroke widths; a figure that does not
end on the anchor row or is cut by the canvas.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Blurry in game | Browser scaled the SVG, or edges off whole units | Load at final size; integer coordinates; scale in the game |
| Swap to sprite breaks layout | Placeholder size or anchor differs from the final asset | Same size, key and anchor as in the Art Bible |
| Class unreadable | Only colour differs | Distinct silhouette per class and enemy family |
| Light flips on enemies | Shaded image mirrored | Mirror the geometry |
| Export hangs or is slow | `export-filename:-`, `--batch-process`, one process per file | Shell mode, file output |
| Different result next build | Random values, unordered output, timestamps | Seeded values, sorted output, no dates in files |

## Checklist

- [ ] Changed the generator, not an output file; rebuilt with the Bun script.
- [ ] Validators pass; size, key and anchor equal the final asset's.
- [ ] Seen at 1x in the game on the real combat background.
- [ ] Hero faces right, enemy faces left; ally and enemy differ by more than colour.
- [ ] No name, symbol or silhouette of an existing work (`.claude/rules/ip-and-tone.md`).
