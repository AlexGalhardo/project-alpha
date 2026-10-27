# Coherence audit: docs, rules and skills (2026-10-26)

Scope: `AGENTS.md`, `README.md`, `.claude/rules/*.md`, the project skills `alpha-*`, `docs/gdd.md`, `docs/art-bible.md`, `docs/sdd/*.md` and `docs/how-to-play.md`, checked against the code at commit `fcb2201`.

Method: a search for terms from superseded decisions (bitmap and pixel fonts, `Scale.NONE`, integer zoom, the 480×270 base, the old project name, "web build only"), then a read of each hit.

## Findings

| File | Stale text | Fix |
|---|---|---|
| `README.md` | "Web build only; Electron and Android at the end of Beta" | Web, Windows and Android builds from the same code |
| `docs/gdd.md` (open questions) | Q-ZOOM: integer zoom on phones | Resolved by ADR 0015 |
| `docs/sdd/architecture.md` | `main.ts` config: `pixelArt`, `Scale.NONE`, zoom module | 1920×1080, `Scale.FIT`, camera zoom 3 |
| `docs/art-bible.md` §decisions, §11, open items | `Scale.NONE` + integer zoom; Jersey 10 numbers and atlas | ADR 0015 wording; Roboto |
| `AGENTS.md` | Release step had no desktop/Android commands | Commands and ADR 0016 added |

`.claude/rules/*.md` were already current (native 1080p art, facing rule, FIT scaling).

## Blockers

None.

## Not checked

- Every project skill line by line: only the `alpha-*` skills were searched for stale terms.
- Third-party skills under `.claude/skills/` (Phaser, game design): they describe external tools and were not changed.
