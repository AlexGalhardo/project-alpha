# Third-party skills

Curated copy (only `SKILL.md` + references, **without** hooks, settings, agents or example projects), installed on 2026-09-27 and adapted for project-alpha on 2026-10-10. The `gd-*`, `gc-*` and `ccgs-*` skills carry the origin prefix and a **project-alpha** note at the top explaining how they fit this project; in case of conflict, `AGENTS.md`, `.claude/rules/` and `docs/gdd.md` prevail.

| Prefix | Origin | Commit | License | Skills |
|---|---|---|---|---|
| `gd-` | [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | `d4b0e35` | Apache-2.0 | 14: `gd-roguelike`, `gd-rpg`, `gd-procedural-gen`, `gd-save-systems`, `gd-game-ai`, `gd-ai-behavior-trees-utility-ai`, `gd-game-feel`, `gd-game-ui-ux`, `gd-input-systems`, `gd-performance-optimization`, `gd-audio-design`, `gd-prototype-fast`, `gd-create-game-assets`, `gd-steam-publish` |
| `gc-` | [PlayableIntelligence/game-creator](https://github.com/PlayableIntelligence/game-creator) | `4e64b83` | MIT | 4: `gc-game-architecture`, `gc-add-feature`, `gc-review-game`, `gc-game-qa` |
| `ccgs-` | [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) | `7ed2c3e` | MIT | 8: `ccgs-balance-check`, `ccgs-bug-report`, `ccgs-playtest-report`, `ccgs-qa-plan`, `ccgs-perf-profile`, `ccgs-scope-check`, `ccgs-release-checklist`, `ccgs-localize` |
| — | Official Phaser 4 skills for AI agents (Phaser Studio) | not registered | not registered | 25: `actions-and-utilities`, `animations`, `audio-and-sound`, `cameras`, `curves-and-paths`, `data-manager`, `events-system`, `filters-and-postfx`, `game-object-components`, `game-setup-and-config`, `geometry-and-math`, `graphics-and-shapes`, `groups-and-containers`, `input-keyboard-mouse-touch`, `loading-assets`, `particles`, `render-textures`, `scale-and-responsive`, `scenes`, `sprites-and-images`, `text-and-bitmaptext`, `tilemaps`, `time-and-timers`, `tweens`, `v4-new-features` |
| — | `agent-browser` — origin not registered | not registered | not registered | 1 (`agent-browser`) |
| — | `graphify` — origin not registered | not registered | not registered | 1 (`graphify`) |
| — | `grilling` / `grill-me` — origin not registered | not registered | not registered | 2 (`grilling`, `grill-me`) |
| — | [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill) | `e180fc4` | MIT | 1 (`book-to-skill`, installed on 2026-10-10; single file, no `scripts/` or `tools/`; generates skills from a single `SKILL.md`) |
| — | [dietrichgebert/ponytail](https://github.com/dietrichgebert/ponytail) | `9b58c1f` | MIT | 6: `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help` (installed on 2026-10-10; only the `SKILL.md` files from `skills/`, without plugin, hooks or commands; original text, no adaptation) |
| — | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | `2c60614` | MIT | 1 (`karpathy-guidelines`, installed on 2026-10-10; single file, original text) |

Project-owned skills, with no third-party material copied: `alpha-art-assets`, `alpha-audio-assets`, `aseprite-pixel-assets`, `inkscape-vector-assets` and `asset-animation`. The last three (written 2026-10-10, rewritten for project-alpha on 2026-10-26) summarize, in our own words, research and tests done with sources from the previous project, which are not versioned; no excerpt of those sources was transcribed.

"Not registered" means the skill files carry no repository, commit or license; fill it in once the origin is confirmed, do not assume it.

`karpathy-guidelines` and `caveman` are **mandatory at the start of every session** (`AGENTS.md`); `ponytail` is optional. `ponytail-help` mentions plugin updates and environment-variable configuration that do not apply here: the copy is local and does not update itself.

Local adjustments:

- `gd-*`: a project note and, where the original content does not apply to a card roguelite with turn-based combat in ranks, a **Scope here** line (`gd-roguelike`, `gd-rpg`, `gd-game-ai`, `gd-input-systems`, `gd-audio-design`, `gd-steam-publish`, `gd-create-game-assets`). The body was not rewritten; cross-references to skills from the origin repository that are not installed (`physics-tuning`, `level-design`, `camera-systems`, `shader-programming`, `itch-publish`, `phaser-core`, engines) remain and should be ignored.
- `gc-*`: `npm`/`npx` commands replaced by `bun`/`bunx`; the scoreboard widget and third-party instant hosting, the monetization step of the review, and shortcuts to game-creator skills that are not installed were removed.
- `ccgs-*`: config injection via `yaml-helper.sh` and the Bash permission for it were removed; references to CCGS documents that do not exist here were removed (`.claude/docs/automation-modes.md`, `config-resolution.md`, `director-gates.md`, `technical-preferences.md`, `workflow-modes.md`, `effects-map.md`, `code-root-resolution.md`) and replaced with "follow `AGENTS.md`"; the `design/` and `production/` folders are mapped in the project note. `ccgs-release-checklist` has no console items; `ccgs-localize` has no VO or RTL modes (languages: EN and PT-BR); `ccgs-balance-check` uses the headless simulator (`bun run sim`).

Not installed (outside the stack): Unity, Unreal, Godot, Roblox, Three.js, Bevy, Pygame, LÖVE, unrelated genres, and the rest of CCGS (sprints/epics/studio agents). To bring one in: copy the folder, apply the same prefix/note, and register it here.

## Locally generated skills

Generated on 2026-10-10 with `book-to-skill` from the PDFs in the root (single file `SKILL.md`; synthesized summaries, private use — do not publish):

| Skill | Source | Study guide |
|---|---|---|
| `pixel-logic` | *Pixel Logic*, Michael Azzi (2022 ed.) — `pixel-logic.pdf` | `docs/books/pixel-logic.md` |
| `art-of-game-design` | *The Art of Game Design: A Book of Lenses*, Jesse Schell (1st ed.) — `art-of-game-design.pdf` | `docs/books/art-of-game-design.md` |

## Project skills

Written for project-alpha on 2026-10-10 (single file `SKILL.md`, in English):

| Skill | Purpose | Supporting document |
|---|---|---|
| `alpha-art-assets` | Create, regenerate, animate or replace any visual asset: SVG placeholders in Alpha, pixel art via the `pixellab` MCP from Beta onward; specs, palette, keys, approval gates and cleanup checklist | `docs/art-bible.md` (to be defined), skill `pixel-logic` |
| `alpha-audio-assets` | Create or replace music and effects (no voice) via the ElevenLabs API; track and effect list, keys, loops, loudness, formats and budget gate | `docs/sdd/audio.md` (to be defined), skill `audio-and-sound` |

## Removed on 2026-10-10

From the previous project, with no use in a card roguelite with turn-based combat in ranks:

| Skill | Reason |
|---|---|
| `physics-arcade` | The game has no real-time physics; combat is turn-based, with no physics simulation. |
| `physics-matter` | Same: no physics simulation. |
| `gd-physics-tuning` | Timestep/collision tuning does not apply to turn-based combat. |
| `gd-shader-programming` | No custom shaders in scope; effects use the official Phaser 4 filter skills. |
| `gd-phaser-core` | Redundant with the official Phaser 4 skills. |
| `gd-camera-systems` | Fixed camera; the little there is is covered by the official `cameras` skill. |
| `gd-level-design` | Aimed at real-time action levels; combat scenes are defined in `src/data`. |
| `gd-itch-publish` | Publishing on itch.io is not in the plan. |
| `gc-phaser` | Written for Phaser 3; replaced by the official Phaser 4 skills. |
| `gc-game-designer` | Generic arcade-game visual design; art direction lives in the GDD and in `alpha-art-assets`. |
| `gc-design-game` | Visual-polish command from the game-creator pipeline; does not apply to this workflow. |
| `gc-qa-game` | Shortcut command from game-creator; the `gc-game-qa` reference was kept. |
| `gc-improve-game` | Shortcut command from game-creator; use `gc-review-game` and `gc-add-feature`. |
| `gc-game-deploy` | Game-creator's own deploy; the project defines its own build. |
| `gc-monetize-game` | The game has no monetization. |
| `ccgs-launch-checklist` | Overlaps `ccgs-release-checklist`; commercial launch is out of the current scope. |
| `canvas-design` | Generates static posters/art as PNG/PDF; not a game asset pipeline. |
| `find-skills` | Skill-discovery utility, unrelated to the project. |
| `pinguin-art-assets` | Art pipeline of the previous project; replaced by `alpha-art-assets`. |
| `pinguin-audio-assets` | Audio pipeline of the previous project; replaced by `alpha-audio-assets`. |
