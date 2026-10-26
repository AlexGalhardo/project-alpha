# Asset request: prototype cost gate

Status: **waiting for developer approval**. Nothing in this document has been generated.

Rule (`.claude/rules/assets.md`): before any batch on a paid generator (PixelLab, ElevenLabs), the list and the estimate go to the developer, and the batch waits for approval. Every generation is logged with prompt, parameters, date and cost in `art-src/`.

## 0. Subscription status (read this first)

- The developer reported about 1,600 of 5,000 PixelLab generations used, so about 3,400 remaining (2026-10-26).
- The PixelLab MCP `get_balance` on the same day reported the subscription **expired on 2026-10-25**, with generations frozen until renewal at `pixellab.ai/account` (see `docs/web-research.md` §13.2).
- This divergence must be confirmed before any PixelLab call. The PixelLab batch in this document (357 generations) fits the 3,400 remaining, but it cannot run while the subscription is expired.
- PixelLab plan prices are not verified (the official pricing page did not load). ElevenLabs prices are from the API pricing page (accessed 2026-10-26).

## 1. Conventions used below

- **Tries**: 3 per asset (1 draft + up to 2 retries). Generations = assets × 3.
- **Palette**: every asset uses the master palette and semantic tokens in `docs/art-bible.md` §4–§5. Maximum colours per asset are in §4.1 and are stated per row where they differ.
- **Common character template** (art-bible §15.1). `{W}x{H}` is the canvas, `{description}` is the per-asset line:

```text
Side-view pixel art character, {W}x{H} px canvas, full body, standing ready pose, facing {facing}.
{description}
Dark fantasy, grim and worn. Limited palette of at most 16 colours: cold ash greys, dark iron,
bone and worn gold. No pure black, no pure white. Single light from the upper left.
1 px selective outline, darker on the shadow side. No anti-aliasing on the outer edge, no dithering.
Transparent background. Readable silhouette at 1x.
```

- **Forbidden in every prompt**: "in the style of", any work, studio or artist name, and any name from the IP list in `.claude/rules/ip-and-tone.md`.
- **Tool names**: PixelLab MCP tools as listed in the session (`create_character`, `create_1_direction_object`, `create_image_pixflux`, `create_ui_asset`, `vfx_workbench`). Parameter names are checked at call time; this document states intent, not the exact JSON.

## 2. Heroes (5) — `hero.<class>.idle`, 64×80, facing right

Tool: `create_character` (1 direction, side view). Tries: 3 each. Generations: 15.

| Key | Description line for the template |
|---|---|
| `hero.shieldbearer.idle` | A heavy black riveted plate knight with a tall rectangular shield with a red cross-shaped boss, a jagged sword in the other hand, a short tattered crimson cape. |
| `hero.marksman.idle` | A slim hooded archer in charcoal leather, a narrow angular mask, a long recurve bow held at rest, a quiver of dark arrows on the back. |
| `hero.arcanist.idle` | A tall figure in layered dark violet robes, a faceless metal mask, a spiked staff with a glowing ember rune at its head. |
| `hero.confessor.idle` | A slender priest in ash-white robes, an engraved mask, a lantern-staff with pale green light, a leather satchel on the hip. |
| `hero.bombardier.idle` | A stocky armoured gunner with a riveted iron breathing helmet, ammunition belts across the chest, a short hand cannon held low. |

Palette: at most 16 colours per sprite; accent ramp bone and worn gold (Confessor and Arcanist may use violet or pale green as their signature accent, art-bible §4.1).

## 3. Enemies (10) — `enemy.<id>.idle` (sizes from art-bible §7.1)

Tool: `create_character`. Tries: 3 each. Generations: 30.

| Key | Canvas | Facing | Description line |
|---|---|---|---|
| `enemy.husk_penitent.idle` | 64×80 | left | A gaunt man in a torn penitent's shift, wrapped in cords, a flail of knotted chain in one hand. |
| `enemy.chitter_swarm.idle` | 48×48 | left | A knot of small pale many-legged things fused into one body, a crown of mouths. |
| `enemy.ash_acolyte.idle` | 64×80 | left | A cloaked woman holding a brazier on a chain, ash streaming from her sleeves. |
| `enemy.graft_hound.idle` | 80×64 | left | A quadruped of stitched dog and human parts, a row of extra eyes along the spine. |
| `enemy.wax_mourner.idle` | 64×80 | left | A hooded mourner whose face is a slow wax mask dripping down the chest. |
| `enemy.rust_templar.idle` | 64×80 | left | A hollow knight in rust-eaten plate, helmet fused shut, a broken processional banner used as a spear. |
| `enemy.lantern_leech.idle` | 48×48 | left | A sack-shaped creature with a lantern set in its body, long feeding tendrils. |
| `enemy.choir_thing.idle` | 80×112 | left | A tall throatless figure with open mouths along the arms, bent forward as if singing. |
| `enemy.ossified_brute.idle` | 80×112 | left | A hulking figure of bone grown over bone, a heavy crushing fist, slow and patient. |
| `enemy.rift_stalker.idle` | 80×112 | left | A thin long-limbed shape between folds of dark light, sharp blade-like forelimbs. |

Elites reuse these sprites with a code tint and the `ui.elite_aura` overlay (no extra generation).

## 4. Boss (1) — `enemy.bell_maw.idle`, 160×144

Tool: `create_1_direction_object` (single view). Tries: 3. Generations: 3.

Description line: a cathedral bell grown into a biomechanical mouth, with a rim of teeth of bone, rooted in cracked stone, brass machinery visible on the sides, a dark opening at the front. Palette: bone, worn gold, ember rim. Two phases are shown in code (flash and tint), not with a second sprite.

## 5. Backgrounds (4) — 640×360

Tool: `create_image_pixflux`. Tries: 3 each. Generations: 12. Palette: at most 32 colours, desaturated (art-bible §3.2); no characters.

| Key | Prompt (after the common background line) |
|---|---|
| `bg.title` | A ruined gothic citadel on a cliff under a dark red moon, chains hanging from broken towers, a small stone overlook in the foreground. |
| `bg.menu` | A vast cathedral hall, tall crimson stained-glass windows, a long stone staircase, candles along the walls. |
| `bg.map.act1` | A dark gothic cloister seen from above, corridors and stone arches, a faint red glow under the floor. |
| `bg.combat.act1` | A ruined cathedral nave, collapsed arches, a broken altar at the back, shafts of cold light, ash on the flagstones. |

Common background line: "Pixel art background, 640x360 px, side view, no characters, no text, dark desaturated palette of at most 32 colours, light from the upper left, no anti-aliasing, no dithering."

## 6. UI kit — 17 via PixelLab (`create_ui_asset`), 4 by hand

Tries: 3 each. Generations: 51.

| Key | Canvas | Prompt line |
|---|---|---|
| `ui.panel_stone` | 32×32 (9-slice) | Dark slate stone panel with a 1 px light bevel top-left, ember-orange edge highlight. |
| `ui.panel_inset` | 32×32 (9-slice) | Recessed dark panel with an inner shadow, no highlight. |
| `ui.panel_tooltip` | 32×32 (9-slice) | Small dark tooltip panel with a thin bone border. |
| `ui.panel_topbar` | 32×24 (9-slice) | Top bar strip, dark iron with worn gold seams. |
| `ui.button` | 32×24 (9-slice) | Dark stone button, worn gold rim, flat centre. |
| `ui.frame_common` | 64×88 | Card frame, plain iron border with rivets. |
| `ui.frame_uncommon` | 64×88 | Card frame, iron with chain trim. |
| `ui.frame_rare` | 64×88 | Card frame, iron with a thorned crown crest at the top. |
| `ui.frame_legendary` | 64×88 | Card frame, bone and gold, a bell motif at the top. |
| `ui.cost_gem` | 16×16 | Round energy cost gem, bright blue, dark rim. |
| `ui.energy_orb` | 32×32 | Energy orb, dark ring with a bright inner core. |
| `ui.hp_bar` | 64×6 | Health bar frame and fill, ember red fill. |
| `ui.elite_aura` | 88×96 and 96×128 | Two-pixel notched ember frame behind the sprite. |
| `ui.gear` | 16×16 | Small gear icon, worn gold. |
| `ui.pile_draw` | 24×24 | Stack of face-down cards. |
| `ui.pile_discard` | 24×24 | Stack of cards, one turned up. |
| `ui.pile_exhaust` | 24×24 | Stack of cards with a crack through them. |

By hand or script (no generation cost): `ui.rank_pip`, `ui.stress_pip` (3 states), `ui.wordmark_title`, `ui.wordmark_menu`.

Common UI line: "Pixel art UI {piece}, {W}x{H} px, at most 8 colours, flat centre, dark stone with worn gold accents, transparent outside the shape, no text."

## 7. Icons — 29 via PixelLab (`create_image_pixflux`)

Tries: 3 each.

| Group | Items | Canvas | Generations |
|---|---|---|---|
| Status | `icon.status.block`, `might`, `ward`, `marked`, `weakened`, `bleed`, `burn`, `stunned` (8) | 12×12 | 24 |
| Intent | `icon.intent.attack`, `block`, `buff`, `debuff`, `stress`, `push_pull`, `unknown`, `phase` (8) | 12×12 | 24 |
| Node | `icon.node.combat`, `elite`, `shop`, `rest`, `boss` (5) | 24×24 | 15 |
| Equipment | `icon.item.eq_notched_blade`, `eq_heavy_pavise`, `eq_bone_reliquary`, `eq_ember_focus`, `eq_votive_candle`, `eq_iron_rosary`, `eq_hunters_lens`, `eq_bell_clapper` (8) | 24×24 (relics also 16×16 by script) | 24 |

Shapes and colours of status and intent icons come from art-bible §7.3 (shield, raised fist, ring with rune, crosshair, broken blade, droplet, flame, spiral; sword, shield, chevrons, cracked mask, double arrow, question mark, bell). The 9×9 and 16×16 variants are produced by hand from the 12×12 and 24×24 masters.

Common icon line: "Pixel art icon, {S}x{S} px, centred, {shape} clearly readable at 1x, 1 px dark outline, at most 6 colours, transparent background, no text."

## 8. Card art — 45 at 60×40 (`create_image_pixflux`)

Tries: 3 each. Generations: 135. Palette: at most 16 colours; no border, no text (the frame is `ui.frame_*`).

Common card line: "Pixel art illustration, 60x40 px, one clear focal point, at most 16 colours from cold ash greys, dark iron, bone, ember orange, worn gold, light from the upper left, dark vignette edges, no anti-aliasing, no dithering, no border, no text."

| Id | Card | Scene (focal point) |
|---|---|---|
| shb_hack | Hack | Heavy sword cut across a plated shoulder |
| shb_brace | Brace | Shield raised, feet braced on stone |
| shb_hold_the_line | Hold the Line | Shield wall at a broken gate |
| shb_shield_slam | Shield Slam | Shield edge driving into a face |
| shb_iron_stance | Iron Stance | Armoured figure planted, sparks at the boots |
| shb_shove | Shove | Shield hitting a body, dust burst |
| shb_bulwark | Bulwark | A tall shield wall of riveted iron |
| shb_vow_of_iron | Vow of Iron | Gauntlet raised with a vow scroll |
| shb_last_bastion | Last Bastion | A line of shields lit from behind |
| mrk_aimed_shot | Aimed Shot | Bow drawn, arrow on target |
| mrk_sidestep | Sidestep | Hooded archer stepping aside, cloak trailing |
| mrk_mark_prey | Mark Prey | Crosshair sigil painted on a figure |
| mrk_piercing_bolt | Piercing Bolt | Bolt passing through two figures in a line |
| mrk_quick_draw | Quick Draw | Arrow nocked in one motion |
| mrk_pinning_shot | Pinning Shot | Arrow pinning a cloak to a wall |
| mrk_volley | Volley | Many arrows arcing over a field |
| mrk_hunters_focus | Hunter's Focus | Narrowed eye through a lens |
| mrk_killshot | Killshot | Arrow piercing a marked sigil |
| arc_ember_bolt | Ember Bolt | Small glowing ember flying from a staff |
| arc_ash_veil | Ash Veil | Ash cloud forming a veil around an ally |
| arc_rift_spark | Rift Spark | Spark jumping between cracks in the air |
| arc_burn_hex | Burn Hex | Hex sigil burning on the ground |
| arc_channel | Channel | Hands gathering light over a staff |
| arc_cinder_lance | Cinder Lance | Lance of ember driving forward |
| arc_firestorm | Firestorm | Column of fire across a field |
| arc_unseal | Unseal | A seal breaking open with light inside |
| arc_rift_rupture | Rift Rupture | A rupture of violet light in the air |
| cnf_censer_strike | Censer Strike | Swinging censer leaving a smoke arc |
| cnf_sanctuary | Sanctuary | Pale circle of light around a figure |
| cnf_mend | Mend | Hands stitching a wound with thread of light |
| cnf_absolve | Absolve | Dark marks lifting from a body like smoke |
| cnf_litany | Litany | Open book with rising lines of light |
| cnf_rebuke | Rebuke | Lantern thrust forward against a dark form |
| cnf_mass_mend | Mass Mend | Several figures lit by one bright cross |
| cnf_steadfast_hymn | Steadfast Hymn | Choir of mouths singing around a shield |
| cnf_rekindle | Rekindle | Fallen figure rising in a ring of embers |
| bmb_grapeshot | Grapeshot | Cannon spraying shot over two targets |
| bmb_sandbags | Sandbags | Sandbags stacked in a battlement |
| bmb_shell | Shell | Shell arcing toward a line of enemies |
| bmb_incendiary | Incendiary | Fire bursting from a shell |
| bmb_reload | Reload | Ammunition being loaded into a cannon |
| bmb_concussion_round | Concussion Round | Shockwave ring from an impact |
| bmb_barrage | Barrage | Three bursts in a diagonal |
| bmb_powder_keg | Powder Keg | Keg with a fuse, tied to a stake |
| bmb_siege_mortar | Siege Mortar | Mortar firing upward, bright flash |

## 9. VFX (8) — `vfx.<id>` via `vfx_workbench`

Tries: 3 each. Generations: 24 (one job per effect; frame counts and canvases from art-bible §12.2).

| Key | Canvas | Frames |
|---|---|---|
| `vfx.hit` | 32×32 | 5 |
| `vfx.block` | 32×32 | 4 |
| `vfx.heal` | 32×32 | 6 |
| `vfx.burn` | 32×32 | 4 |
| `vfx.bleed` | 32×32 | 5 |
| `vfx.stress` | 32×32 | 5 |
| `vfx.collapse` | 48×48 | 8 |
| `vfx.boss_phase` | 160×144 | 10 |

Prompt line: "Pixel art effect, {W}x{H} px, {frames} frames, transparent background, at most 8 colours from the palette tokens listed in art-bible §12.2, no anti-aliasing, centred on the target."

## 10. Music (4 loops) — ElevenLabs music API

Tries: 3 each (one take per try). Billed per minute at US$ 0.15 (`docs/web-research.md` §13.3).

| Key | Screen | BPM | Key / mode | Length | Takes (3) | Minutes billed (3 takes) | Prompt line |
|---|---|---|---|---|---|---|---|
| `music.menu` | Title, menu, party | 60 | D minor | 90 s | 3 | 4.5 | Dark ambient, wordless low choir pad, distant bell, cello drone, solemn, no vocals with words, seamless loop. |
| `music.map` | Map, camp, shop, rest | 72 | D Dorian | 90 s | 3 | 4.5 | Sparse liturgical chant over low strings, soft frame drum, wary travel, seamless loop. |
| `music.combat` | Combat | 104 | D Phrygian | 120 s | 3 | 6.0 | Low string ostinato, industrial percussion with metal hits and chains, muted brass stabs, tense and steady, no climax, seamless loop. |
| `music.boss` | Boss | 124 | C# minor | 120 s | 3 | 6.0 | Wordless full choir, pounding drums, bell tolls on the downbeat, distorted low brass, dread, seamless loop. |

Total: 21 minutes for 3 takes each, US$ 3.15 at the most. If each loop is accepted on the first take, 7 minutes, US$ 1.05.

## 11. SFX (35 keys) — ElevenLabs sound effects

Tries: 3 each (105 takes). Duration set per key, 40 credits per second when set (`docs/web-research.md` §13.3). Average take length assumed 1.5 s.

| Category | Key | Prompt (short) | Seconds per take |
|---|---|---|---|
| card | `sfx.card.draw` | Card slid from a stack over parchment, dry | 0.3 |
| card | `sfx.card.play` | Card slapped onto stone, close, dry | 0.4 |
| card | `sfx.card.exhaust` | Card torn and thrown into a dark pile | 0.6 |
| card | `sfx.card.upgrade` | Metal click with a rising chime, short | 0.6 |
| card | `sfx.card.invalid` | Dull wooden knock, rejected | 0.3 |
| hit | `sfx.hit.slash` | Blade cutting through cloth and flesh, close | 0.5 |
| hit | `sfx.hit.blunt` | Heavy mace hitting rusted plate, dull crunch | 0.5 |
| hit | `sfx.hit.pierce` | Bolt punching through wood with a short whistle | 0.5 |
| hit | `sfx.hit.fire` | Burst of fire with a hiss | 0.6 |
| hit | `sfx.hit.multi` | Three rapid metal knocks | 0.8 |
| block | `sfx.block.gain` | Shield being raised, metallic slide | 0.5 |
| block | `sfx.block.absorb` | Blow stopped by shield, short ring | 0.4 |
| block | `sfx.block.break` | Shield cracking, splintering | 0.6 |
| status | `sfx.status.marked` | Sharp metal click, sigil lock | 0.4 |
| status | `sfx.status.weakened` | Low sagging tone, air leaking | 0.6 |
| status | `sfx.status.bleed` | Wet drip with a faint hiss | 0.5 |
| status | `sfx.status.burn` | Crackle of fire, short | 0.6 |
| status | `sfx.status.ward` | Soft bell-like shimmer | 0.5 |
| status | `sfx.status.stun` | Dull thud with a ringing overtone | 0.6 |
| stress | `sfx.stress.gain` | Low breath tightening into a tremor | 0.8 |
| stress | `sfx.stress.collapse` | Cracked glass and a heavy fall, dark | 1.2 |
| stress | `sfx.stress.relief` | Long exhale with a soft chime | 0.8 |
| unit | `sfx.unit.hero_fall` | Armour hitting stone, a bell-like echo | 1.2 |
| unit | `sfx.unit.enemy_death` | Brittle collapse, bones scattering | 0.9 |
| unit | `sfx.unit.boss_phase` | Deep cathedral bell crack followed by a shockwave | 2.0 |
| ui | `sfx.ui.tap` | Small wooden tick | 0.2 |
| ui | `sfx.ui.confirm` | Two-note low chime | 0.4 |
| ui | `sfx.ui.cancel` | Falling single note | 0.3 |
| ui | `sfx.ui.open` | Stone panel sliding open | 0.5 |
| ui | `sfx.ui.close` | Stone panel closing | 0.5 |
| ui | `sfx.ui.coin` | Few coins clinking | 0.4 |
| ui | `sfx.ui.end_turn` | Heavy iron bell tap | 0.8 |
| flow | `sfx.flow.victory` | Bell chord, short and grim | 2.0 |
| flow | `sfx.flow.defeat` | Low sustained drone falling away | 2.0 |
| flow | `sfx.flow.reward` | Rising three-note sting, dry | 1.0 |

Common SFX line: "{action}, close perspective, dry, no music, no voice, {seconds} seconds." Total duration at 3 takes: 105 takes × 1.5 s = 158 s, which is 6,300 credits or about US$ 0.32.

## 12. Totals

| Group | Assets | Tries | PixelLab generations | ElevenLabs |
|---|---|---|---|---|
| Heroes | 5 | 3 | 15 | — |
| Enemies | 10 | 3 | 30 | — |
| Boss | 1 | 3 | 3 | — |
| Backgrounds | 4 | 3 | 12 | — |
| UI kit (PixelLab part) | 17 | 3 | 51 | — |
| Icons (PixelLab part) | 29 | 3 | 87 | — |
| Card art | 45 | 3 | 135 | — |
| VFX | 8 | 3 | 24 | — |
| **PixelLab subtotal** | | | **357** | |
| Music | 4 loops | 3 takes | — | 21 min, US$ 3.15 (at most); US$ 1.05 if accepted first take |
| SFX | 35 keys | 3 takes | — | 105 takes, ~158 s, 6,300 credits (~US$ 0.32) |

Remaining PixelLab quota reported by the developer: about 3,400 of 5,000. The PixelLab subtotal is about 10.5% of that. Hand and script work (rank pips, stress pips, wordmarks, relic icons, portraits, queue portraits, panels, piles, VFX clean-up) has no generation cost.

Price estimate (for the approval only, no purchase is made by this document):

- ElevenLabs: music and SFX about US$ 0.32 + up to US$ 3.15 in API usage, or 6,300 + music credits on a subscription (Starter, US$ 6/month in the FAQ, US$ 1 in the table: conflict noted in `docs/web-research.md` §13.3).
- PixelLab: subscription price not verified (third-party estimate US$ 10–12/month for the entry plan).

## 13. Approval

Choose one (tick the boxes). Anything not ticked stays as a placeholder.

- [ ] Approve all: PixelLab 357 generations (after the subscription is confirmed active), ElevenLabs music 3 takes per loop and SFX 3 takes per key.
- [ ] Approve heroes + enemies + boss only (PixelLab 48 generations).
- [ ] Approve music and SFX only (ElevenLabs, no PixelLab).
- [ ] Approve card art only (PixelLab 135 generations).
- [ ] Approve nothing: keep all placeholders (`docs/art-bible.md` placeholder rule, ADR 0014).
- [ ] Approve with changes: write the changes in the developer's note; the coordinator updates this document before any call.

Before any PixelLab call, confirm the subscription status at `pixellab.ai/account` (section 0). The approval is recorded in `docs/brainstorming.md` after the decision.
