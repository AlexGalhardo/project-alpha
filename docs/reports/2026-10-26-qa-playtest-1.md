# QA playtest 1 (2026-10-26)

Tester: QA playtester agent. Build: local `vite build` snapshot of `f17ec92` plus the working tree at about 20:00 (pixel BitmapText-style fonts, 640×360 at integer zoom), served with `vite preview` on port 4180. The live site <https://alpha.lekzera.xyz> was played once (title → combat) and matches this build screen for screen. The render overhaul (FIT scale, Roboto, camera zoom) was **not** in this build: findings marked *(font)* may become moot and must be re-checked on the next build.

Primary viewport 1920×1080 (DPR 1). Secondary: 1366×768, 1280×720, 844×390 at DPR 3. Screenshots are in `test-results/qa/` (gitignored); paths below are relative to that folder.

## How it was played

Playwright (`playwright-core`, Chromium channel) clicking the canvas at the screen position of each interactive object, as a player would: card, then target; End turn; map nodes; Speed and Auto buttons; keyboard (`1`, `Tab`, `Enter`, `Space`, `Esc`); pause and resume; reload mid-combat and Continue. Non-combat choices (reward pick, camp, shop, rest, event) were made with the game's own bot command after a screenshot of each screen.

| Run | Party (rank 1→3) | Mode | Speed | Result | Wall time |
|---|---|---|---|---|---|
| r1 | Shieldbearer, Confessor, Marksman | manual (first playable card) | 1x | Act 1 boss beaten, defeat at Act 2 round 7 elite (23 turns) | 6 min 47 s |
| r2 | Arcanist, Bombardier, Marksman | mix manual/auto | 2x | defeat Act 1 round 7 | 64 s |
| r3 | Confessor, Bombardier, Arcanist | auto | 3x | defeat Act 1 round 7 elite | 28 s |
| r4 | Shieldbearer, Arcanist, Confessor | manual (preview-scored) | 1x | defeat Act 1 round 4 (12-turn fight) | 84 s |
| r5 | Bombardier, Marksman, Confessor | mix | 2x | defeat Act 1 round 5: **combat hit the 60-turn cap** | 131 s |

Plus `bun scripts/sim.ts --runs 200 --acts 2` (2000 runs, greedy bot) for balance numbers. Console errors in all sessions: **0**. Reload mid-combat + Continue restored the identical turn, energy, hand and enemy HP.

## Verdict

The loop works end to end with no crash, no console error and a correct save. Combat rules are readable on paper but **not on screen**: a new player cannot name the enemies, cannot open an intent tooltip, cannot see which enemy will hit which hero for how much, and the enemy phase resolves in about 0.4 s with small pop-ups far above the units, so "why did I take damage?" (GDD §19, P3) fails. Balance has one dominant hero (Shieldbearer in 91.7% of winning parties; parties without him win 5.9%). The camp after every round and screens that show names without effects slow the run without adding decisions.

## Findings

Severity: P1 blocker, P2 major, P3 minor, P4 polish.

### P1

None found. No soft-lock, crash or data loss in 5 runs and the misc session. (An apparent Auto-battle stall in the first r2/r3 attempts was my driver toggling Auto off: `app.auto` persists between combats. Not a game bug.)

### P2

**P2-1 Intent icons cannot be tapped (tooltip unreachable).**
Screen: combat. Steps: tap the 12×12 intent icon above any enemy. Observed: nothing; the click lands on the enemy zone. Screenshot `misc-tap-intent.png`. Expected: GDD §15.3 long-press/tap tooltip for every intent; P3 full information. Cause: `CombatScene.drawEnemy` adds the `zone(x, 24, w, 166)` after `drawIntent`, so the zone is on top of the icon (Phaser `topOnly`). Fix: start the unit zone at the sprite box, `zone(x, 44, w, 146)` (Art Bible §11.5 sprite box y 44–190), for both heroes and enemies, or add the zone before the icons.

**P2-2 Enemies are anonymous; tapping a unit does nothing without a selected card.**
Screen: combat. Observed: no enemy name, no trait text (elite has only an orange 2 px frame, `r1-combat-elite.png`), no intent wording (yellow dot, purple "+1", "2x2"). `onUnitTap` returns when no card is selected. Expected: Art Bible §11.6 "opens on the first tap of a card, unit, status or intent". Fix: in `onUnitTap`, when `!this.selected`, open the detail panel for the unit: name, HP, Block, statuses with names, intent sentence (`intent.<id>` + numbers + target name), trait line for elites. Reuse `drawDetail` layout.

**P2-3 Intent → target link is unreadable.**
Screen: combat (`fhd-06-combat.png`, `r1-combat-boss.png`). Observed: every targeted hero gets the same red ▼; with 2+ attackers you cannot tell who hits whom, and the hero marker shows no amount. Expected: P3 "can see everything that will hurt them". Fix: draw the incoming total under each hero's ▼ ("▼ 7", `blood2`, font ui) computed from `view.enemies[].intent.damage`; on tapping an enemy, draw a 1 px dashed line from its intent strip to each target hero. Stress intents: purple ▼ with "+2".

**P2-4 Enemy phase is too fast to follow; pop-ups are small and far from the units.**
Screen: combat. Steps: End turn. Observed: the whole enemy phase including the next draw finishes in about 360 ms at 1x (`burst-enemy-1.png` → `burst-enemy-3.png`); damage pops are drawn at a fixed y = 100 (about 90 px above the heads) in the `ui` font, red on dark blue, fading in 700 ms (`burst-enemy-1.png`: "-2 -3 Bleed 3" barely visible). No lunge; the acting enemy is never highlighted (`enemyAction` events have no position in `eventPos`). Expected: Art Bible §12.1 lunge 90/50/140 ms, hit-stop 60 ms, number pop font h2 rising 12 px over 600 ms + hold 200 ms; GDD §5.7 "≤ 4 s of enemy animations". Fix in `CombatScene.animate`/`popFor`: (a) for `enemyAction`, add `app.ms(350)` delay and a lunge tween on the actor (−2 px/90 ms, +8 px/50 ms, back 140 ms) plus a 2 px `gold2` frame on its turn-queue portrait; (b) pop y = unit sprite top + 16 instead of 100; (c) pop font `h2` with a 1 px `ash0` shadow (Art Bible §8); (d) hold 200 ms before fading.

**P2-5 Card detail panel covers the back-rank heroes; heal part has no preview.**
Screen: combat (`r1-card-selected.png`). Observed: panel at about x 8, y 28, 168×120 base, hides H3/H2 sprites and HP; about 60% of it is empty. Censer Strike preview shows only "Graft Hound 20→15", not the heal on the lowest-HP hero. Expected: Art Bible §11.6 position 236, 96; GDD invariant "toda ação mostra prévia". Fix: place the panel in the centre gap (x 236, y 96) or over the action band left of the hand, height fitted to content (min 64); add preview lines for every event the preview returns (`heal`, `block`, `stress`, `status`), one per line.

**P2-6 Cards: owner line disappears and long names overflow.**
Screens: hand, reward, shop (`r1-shop.png`, `fhd-06-combat.png`). Observed: two-line names (Censer Strike, Pinning Shot, Piercing Bolt, Hold the Line) push the owner line off the card; "Shieldbearer" overflows the 64 px card by about 4 px. The hand never shows the card's rule text; only icons. Expected: Art Bible §10.1 anatomy. Fix in `src/view/cards.ts`: owner as a 1-line footer at a fixed y (card bottom − 14) independent of the name height; names shrink to `tiny` when wider than 56 px instead of wrapping; owner names abbreviated by colour band + class glyph, or use `hero.<id>.short` (≤ 9 chars).

**P2-7 Camp and shop show names without effects.**
Screen: camp (`r1-camp.png`). Observed: "Card for sale: Pinning Shot 35 gold" and "Equipment: Heavy Pavise 50 gold" with no effect text, no owner; swap buttons do not say what the swap does to the deck. Expected: GDD §19 "every coin feeds a decision" — the player cannot decide without the effect. Fix: render the card with `drawCard` (as in the shop) and the equipment description line (as in the shop's Notched Blade row); swap button sub-line "deck: −4 Marksman cards, +4 Arcanist cards".

**P2-8 Dominant hero: Shieldbearer.**
Data (sim, 2000 runs, 2 acts): Shieldbearer is in 91.7% of winning parties; parties without him win 5.9% (target ≥ 25%); Marksman/Arcanist/Bombardier present in winning parties 39–44% with win rates 18–21%. Playtests agree: all 3 parties without Shieldbearer died by Act 1 round 7 (r2, r3, r5). Expected: rule game-design.md "estratégia dominante é defeito de prioridade alta". Proposal (double/halve rule, needs `bun run sim` before/after and a report): give one starter card of each back-rank hero a defensive line (e.g. Marksman Sidestep 5 → 10 Block; Bombardier gets "Smoke: 6 Block to H1"), or let the first rank-1 hero of any class take Taunt from a common card. Not changed here (balance is outside QA scope).

**P2-9 60-turn stalemate ends the run.**
Run r5 (Bombardier/Marksman/Confessor, manual): encounter B2 (Graft Hound + 2 Lantern Leech) lasted 60 turns and counted as a loss; hero HP went 24/13/44 → 51/36 because the leeches' Drain heals them and the Confessor kept healing. At 1x a human would spend about 30 minutes in this fight. Expected: GDD §5.7 common 3–6 turns. Fix options: lower `turnCap` in `src/data/economy.ts` from 60 to 20 and add an "enrage" (+1 Might to every enemy each turn after turn 10, shown as a status), so the stall is visible and solvable; or cap Drain self-heal at 50% of damage dealt.

**P2-10 Pixel font draws "m" as a solid box.** *(font)*
Every screen: "Marks■an", "E■bers", "Main ■enu", "Te■per", "Leave ca■p" (`r1-summary.png`, `r1-rest.png`). Rite arrows ◀ ▶ also render as boxes (`fhd-03-party.png`). Probably moot with Roboto; re-check on the next build.

### P3

**P3-1 Credits overlap the Credits button and stack.**
Menu, tap Credits (`misc-credits.png`). `MenuScene.showCredits` draws a toast at y 300, on the Credits button (y 296–328); each tap adds another copy; no art/audio credits (PixelLab, ElevenLabs). Fix: a small panel scene (or overlay) with font, engine, art and audio lines and a Back button; place any toast at y 340.

**P3-2 Tap on empty space does not cancel the selected card.**
Combat: select a card, tap the stage between units (320, 230). Card stays selected (`cancel-tap-empty.png`). Expected GDD §15.3. Fix: a full-stage background zone at depth −1 whose `pointerup` clears `selected` and refreshes.

**P3-3 Rite selector targets are 5×10 px.**
Party select (`fhd-03-party.png`): `party-rite-down/up` hit areas are the glyph size. Expected Art Bible §3.3 tertiary 24×24. Fix: use `Button` 24×24 with the arrow as caption.

**P3-4 Rest hides the party state.**
Rest (`r1-rest.png`): Recover/Temper/Pray chosen without seeing HP, injuries or stress. Fix: the map's bottom party strip (portrait, HP bar, stress pips) at y 300 on the rest screen; show "+x HP" preview per hero for Recover.

**P3-5 Event screen: empty middle and numbered buttons.**
Event (`r1-event.png`): about 100 px (base) of empty panel between text and choices; choices are "1/2/3" buttons with the action in a separate line; "the first hero" instead of the hero's name. Fix: choice buttons with the verb as caption ("Free him", 176×28) and the outcome line beside; resolve "first hero"/"lowest-HP hero" to the actual name in the outcome line; vertical-centre the block or add the event illustration slot.

**P3-6 Summary tells no story.**
Summary (`r1-summary.png`): stats only, with a 60 px gap under the subtitle. GDD §19 "story machine". Fix: list the party with fate per hero (fell at A2R7, collapsed 2×), the killer encounter, and the best card played.

**P3-7 Title text over busy art.**
Title (`fhd-01-title.png`): the 3-line premise sits over the castle with no panel; Art Bible §8 "Text never sits on a background without a panel or a 1 px ash0 shadow". Fix: ash0 panel at 60% alpha behind the paragraph, or the shadow.

**P3-8 Combat lengths over target for a human.**
Manual r1 (first-playable policy): Act 1 commons 4–9 turns, boss 12, Act 2 elite 23. Greedy-bot sim: common median 4, p90 7; elite median 6, p90 11; boss median 9, p90 13. The bot is within target, so the gap is decision quality; the readability fixes above (P2-2..P2-5) should close part of it.

### P4

- Party select: R1/R2/R3 labels are set only by pick order; no way to reorder without deselecting all (add Rank buttons as in camp).
- Settings volumes cycle by tapping (60 → 80 …) with no visible range; use the Art Bible §9.3 slider.
- Legacy: node rows (▲ vs −) do not explain state; show "owned / next / locked" and the card text of Rampart etc.
- Stress pips under heroes are 1 px purple dashes, hard to see at 1080p (`fhd-06-combat.png`); Art Bible asks 4×3 pips.
- Draw/Discard/Exhaust are plain text, not tappable piles (GDD §5.3 "contents viewable").
- Phone 844×390 DPR 3: game is 640×360 CSS with 102 px side bars (`vp-phone-combat.png`); expected until the FIT overhaul lands.

## Fun and feel suggestions

Ranked by impact / effort. All keep guaranteed hits, visible intents, previews and no hover.

| # | Suggestion | Impact | Effort |
|---|---|---|---|
| 1 | Paced enemy phase: each enemy steps forward, its intent icon flashes, hit pop on the hero at h2 size, 300–450 ms per enemy at 1x (P2-4). Turns damage from "numbers changed" into a beat the player feels. | high | low |
| 2 | Incoming-damage number on each hero ("▼7", after Block "▼7 → 1") updated live as Block cards are previewed. Makes every Block card a visible decision. | high | low |
| 3 | Unit info panel on tap (P2-2) with the intent written out ("Bite: 2 damage ×2 to Shieldbearer"). | high | low |
| 4 | Kill/lethal preview: when the selected card would kill, outline the target in `blood2` and show "†" in the preview line. Rewards planning. | medium | low |
| 5 | Merge camp into the map screen as a side panel (shown only when something is affordable or a hero is stressed); skip the extra screen otherwise. Saves 10 taps per act. | medium | medium |
| 6 | Turn-limit enrage after turn 10 (P2-9) as a visible status, so stalls become a tension ramp instead of a 60-turn grind. | medium | low |
| 7 | Back-rank heroes get one defensive starter line (P2-8) so non-Shieldbearer parties are a real choice; test with `bun run sim`. | high | medium |
| 8 | Summary "story card": who fell, who collapsed, the killing blow (P3-6). Feeds "one more run". | medium | low |
| 9 | End-turn button pulses `ember3` when energy is 0 or no card is playable; pulses `blood2` if a hero will fall to the shown intents. | medium | low |
| 10 | Short hit-stop (60 ms) and 2 px knockback on the target for player attacks (Art Bible §12.1), already specified, not yet visible. | medium | low |

## Not checked

Audio by ear, Safari/Firefox, real phones, slow network, WebGL off, colour-blind modes, PT-BR text fit on every screen (the i18n tables have all 495 keys in both locales; only `Auto`, `Elite`, `Confessor`, `Inferno` and the title are identical, which is correct).
