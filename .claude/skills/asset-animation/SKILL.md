---
name: asset-animation
description: Use when animating any project-alpha asset by code or wiring an animation into the game — adding or changing a pose, idle or attack of a hero or enemy in its character description, baking frames with Aseprite (tags, durations, sheet + JSON atlas), choosing frame counts and timings, exporting for Phaser 4 (`load.aseprite`, `anims.createFromAseprite`), or building code-driven effects such as hit flash, lunge, knockback, shake and death fade. Keeps every character on one timing table and baked pixel frames.
---

# Asset animation (baked frames, Phaser 4)

Frame counts, fps and sizes are fixed in the Art Bible (`docs/art-bible.md`); the numbers
below are the starting playbook until it decides. Phaser APIs: confirm in the official skills
(`animations`, `loading-assets`, `tweens`, `game-object-components`) before using one; this
project is Phaser **4.2.1**. Tooling is Bun + Aseprite only (no Python, no Node).

## Decisions (do not relitigate without a reason)

- **Frames are baked, never interpolated at run time.** A skeletal runtime would be a new
  dependency and a paid editor. Poses are data in the character description; the Aseprite
  Lua renderer bakes them (`aseprite-pixel-assets`).
- **Never rotate or scale a bitmap to animate.** Aseprite has no free rotation in batch
  (90/180/-90 only) and rotated pixels smear. A limb in a new angle is rendered again from
  the description, with shading, outline and clean-up applied to that pose.
- **One timing table** for every character, kept as data next to the descriptions
  (location: to be created, PLAN PROTOTYPE phase).
- **Hurt and death are code**, not drawings: flash, shake, knockback, fade. They work on
  every character at once and need no frames.
- **Side view:** heroes face right, enemies face left. Enemies are the same descriptions
  mirrored before shading; the game never flips a hero to face left.

## Playbook

| Action | Frames | ms per frame | Poses | Notes |
|---|---|---|---|---|
| `idle` | 4 | 260, 200, 260, 200 | rest; chest and head down 1 px; same with cloth and gear caught up; chest back up, cloth still down | Loop. Uneven holds so it breathes instead of ticking. Whole-pixel bob only |
| `attack` | 6 | 90, 120, 50, 140, 100, 100 | anticipation; anticipation hold; smear; contact hold; recovery; settle | Plays once, then idle. Damage fires at the start of frame 4 |
| `cast` (optional) | 4-6 | from the timing table | raise; hold; release; settle | For skills and spells without a weapon swing |
| hurt | code | flash 60-80, hit-stop 50-70 | white fill flash, 3-4 px knockback and back, 2 px shake | No frames |
| death | code | flash 80, fade 350 | flash, sink 2 px, fade out | Leaves what the GDD says it leaves |

Combat is in ranks, so characters do not walk; a rank swap is a code tween of the container.

Principles behind the numbers, at pixel scale:

- **Timing is the animation.** The smear is the shortest frame, the contact the longest:
  speed is felt through the contrast between them.
- **Anticipation** moves against the action (lean back, weapon up) and is held: in a
  turn-based game it is also the telegraph.
- **Squash and stretch** is a 1 px change of height with the feet planted; more reads as
  rubber on a small figure.
- **Overlap**: cloth, plumes and hanging gear follow one frame late; that is why idle has
  four drawings and not two.
- **Smear**: one frame, a bright crescent along the arc of the blade, no outline, drawn in a
  light tone of the weapon.
- **Arcs**: hands travel on curves around the shoulder; pose the hand, let the elbow follow.
- A loop needs at least three distinct drawings and must not show the same one twice in a row.

## Adding or changing an animation

1. Edit the pose data of the character (stance, then per-frame poses for each tag).
2. `idle` comes from the shared timing table; a character may override it.
3. `attack` (and `cast`) is a list of absolute poses timed by the table.
4. Secondary motion (cloth lag, bob, flame flicker) is part of the description, per frame.
5. Rebuild with the Bun build (to be created) and review every frame at 4x, then the loop at 1x.
6. Nothing may leave the cell: the build fails when a frame touches the canvas edge. Shorten
   the reach or shift the hips in that frame; do not grow the canvas.

Easing between hand-authored keys, when you generate in-betweens: quad in/out
`t < .5 ? 2t² : 1 - (-2t + 2)² / 2`, cubic out `1 - (1 - t)³`, back out
`1 + c3 (t - 1)³ + c1 (t - 1)²` with `c1 = 1.70158`, `c3 = c1 + 1`. Sample the curve at the
frame times and round positions to whole pixels.

## Tags and atlas

The Lua renderer writes one `.aseprite` per character with one tag per animation and the
duration on each frame. The build exports one strip and one atlas per character:

```sh
aseprite -b hero.templar.aseprite --sheet hero.templar.png --data hero.templar.json \
  --format json-array --sheet-type horizontal --list-tags --filename-format {frame}
```

Keys follow `.claude/rules/assets.md`: the atlas is `hero.<class>` or `enemy.<id>`, and its
tag names are the `<pose>` part (`hero.templar.idle` = atlas `hero.templar`, tag `idle`).

What Phaser 4.2.1 does with it (read in the source, not run in this research):

- Frames must be named `0..n`; `json-array` and `json-hash` both load.
- The per-frame duration of Aseprite is used as is.
- `createFromAseprite` never sets `repeat`: ask for the loop when playing. Aseprite's
  `repeat` field is ignored.
- The animation key is the tag name and is **global**: two characters with a tag `idle`
  collide. Create the animations on the sprite, or pass a target, or rename on load.

```ts
// preload
this.load.aseprite('hero.templar', 'assets/hero.templar.png', 'assets/hero.templar.json');
// create: animations owned by this sprite, so tag names of other characters do not collide
const sprite = this.add.sprite(x, y, 'hero.templar');
this.anims.createFromAseprite('hero.templar', undefined, sprite);
sprite.play({ key: 'idle', repeat: -1 });
sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sprite.play({ key: 'idle', repeat: -1 }));
```

## Code-driven effects (Phaser 4)

```ts
// hit flash: no shader. setTintFill() does not exist in Phaser 4
sprite.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
this.time.delayedCall(70, () => sprite.clearTint().setTintMode(Phaser.TintModes.MULTIPLY));
```

- Lunge of a melee attack, in sync with the frames: back 2 px during anticipation
  (`Quad.easeOut`), forward 6-8 px towards the enemy side on the smear (`Cubic.easeIn`),
  return during recovery (`Quad.easeInOut`). Tween the container, never the logic position.
- Hit-stop 50-70 ms on the contact frame (pause both animations), flash 60-80 ms, knockback
  3-4 px away from the attacker `Cubic.easeOut` 80 ms and back 120 ms, shake 2 px for 100 ms.
  A turn-based game takes the long end of what action games use.
- Death: flash, then alpha to 0 over 350 ms with `Quad.easeIn` while sinking 2 px.
- Everything must respect `skipAnimations` (tests), auto battle and the 1x/2x/3x speed
  setting; no rule may wait on an animation, and speed never changes the logical result.

## Consistency and regression

- Shared timing table, one palette, one renderer: a character added to the descriptions gets
  idle for free.
- Deterministic generation: seeded values, sorted output, no timestamps. Aseprite exports are
  byte-stable, so a golden test can compare hashes of the decoded RGBA of each sheet.
- Tag names are fixed: `idle`, `attack`, and `cast` where used.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Paper puppet | Limbs rotate rigidly, nothing overlaps | Lean and bob the chest, lag cloth, swap or hide parts, add a smear |
| Jitter in idle | Sub-pixel offsets rounding differently per part | Whole-pixel bob; move groups together |
| Attack has no weight | Even timing | Shorten the smear, hold anticipation and contact |
| Loop pops | First and last frame equal, or durations uneven by accident | Four distinct drawings; check the strip |
| Animation never loops in game | `createFromAseprite` leaves `repeat` at 0 | `play({ key, repeat: -1 })` |
| Wrong character animates | Global animation key from the tag name | Create on the sprite |
| Flash does nothing | Phaser 3 habit | `setTint(...).setTintMode(Phaser.TintModes.FILL)` |
| Enemy lit from the wrong side | Shaded sprite flipped in game | Mirror the description before shading |

## Checklist

- [ ] Poses changed in the description; rebuilt with the Bun build.
- [ ] Every frame reviewed at 4x and the loop judged at 1x speed.
- [ ] No frame touches the canvas edge; feet stay on the anchor row.
- [ ] Atlas has tags `idle` and `attack` (and `cast` if used), frames named `0..n`, durations from the timing table.
- [ ] Effects in code respect `skipAnimations`, auto battle and game speed, and never block rules.
