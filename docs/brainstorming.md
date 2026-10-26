# Brainstorming

Record of the design brainstorming for project-alpha: every decision taken, the options rejected, the ideas parked for later phases, the ideas discarded, and the questions still open. The GDD (`docs/gdd.md`) is written from this file; when they disagree, the most recent dated decision wins and the other file is fixed.

## Purpose and method

- **Goal:** turn the research (`docs/web-research.md`), the developer's references (`docs/research/developer-references.md`) and the kickoff constraints into explicit design decisions before the GDD.
- **Method:** interactive session with the developer using `AskUserQuestion`, one question at a time, 2–4 multiple-choice options, the recommended option first, no chat text between questions. Started 2026-10-26.
- **Question bank:** built from the research and the developer's references, then reviewed against the fixed constraints. Questions already answered by `.claude/rules/` (guaranteed hits, visible intents, visible turn order, no voice acting) were removed from the bank.
- **Scope guard:** when an idea grows the scope too much, a smaller version is offered and the full version goes to [Ideas out of scope](#ideas-out-of-scope).
- **How to append:** add a row to [Decisions](#decisions) with the next id (`B21`, `B22`...), and move any question it closes out of [Open questions](#open-questions).

## Fixed constraints

From the kickoff prompt and later direct answers of the developer. These are not up for discussion in the brainstorming.

| # | Constraint | Source |
|---|---|---|
| K01 | Genre: roguelite + deckbuilding + RPG mechanics (skill tree, character stats, equipment, item rarity, elite enemies, bosses) | Kickoff prompt |
| K02 | Theme: dark fantasy, grimdark tone; inspiration in tone only, never in names, symbols or silhouettes (`.claude/rules/ip-and-tone.md`) | Kickoff prompt |
| K03 | Art style: pixel art | Kickoff prompt |
| K04 | Engine: Phaser 4 (pinned 4.2.1) | Kickoff prompt; `package.json` |
| K05 | Main inspirations: Darkest Dungeon 1 and 2, Slay the Spire 1 and 2 | Kickoff prompt |
| K06 | Web first; desktop (Electron) and Android (Capacitor) only at the end of Beta | Kickoff prompt |
| K07 | Prototype has 5 heroes | Developer answer, 2026-10-26 |
| K08 | A **round** is one encounter/node of the run; 10 rounds per act; boss at round 10; 10 distinct enemies across the first 10 rounds | Kickoff prompt (task 5); developer answer, 2026-10-26 |
| K09 | Auto battle and game speed 2x/3x from the prototype, in settings/pause and on the combat UI | Kickoff prompt (task 5) |
| K10 | Prototype assets are static (no animation); some combat VFX, items, UI, menu and HUD assets; sound assets; cost estimate before generating | Kickoff prompt (task 5) |
| K11 | Version line: 0.0.x Alpha, 0.1.x Beta, 1.0.0 stable | Kickoff prompt; `docs/adrs/0002-release-format.md` |
| K12 | All repository content in English | Developer decision, 2026-10-26 |

## Decisions

Source column: `WR §n` = `docs/web-research.md` section; `DR` = `docs/research/developer-references.md`; `Dev` = direct answer of the developer in the session.

| Id | Topic | Decision | Rejected options | Rationale | Source |
|---|---|---|---|---|---|
| B01 | Pillars | Cards + position: the card decides **what** happens, the rank decides **who** acts and who is hit | Pure deckbuilding without ranks; stress/RPG-first | Joins the Slay the Spire card core with Darkest Dungeon positioning; ranks add decisions without a grid | WR §2, §7.1, §7.3; Dev |
| B02 | Party | Roster of 5 heroes; the player takes 3 per run, chosen in the start menu; a hero can be swapped at the camp after each round (costs gold) | All 5 on the field; pick 4 of 5 | 3 on the field matches the developer's battle concepts and keeps the screen readable; the swap keeps the other 2 heroes relevant during the run | DR (3 heroes vs 3–5 enemies); Dev |
| B03 | Turn structure | Team turn with a single hand: the player plays any hero's cards until energy runs out; then enemies act in queue order; the turn queue shows the enemy order | Per-hero turns in the queue (Darkest Dungeon style); hybrid (one card per hero per turn) | Keeps Slay the Spire deckbuilding; the visible queue satisfies the turn-order rule | WR §7.1; `.claude/rules/game-design.md`; Dev |
| B04 | Ranks | 3 hero ranks, up to 4 enemy ranks; every card declares origin rank(s) and target rank(s); push/pull effects move units | Target-only ranks; no ranks | Position becomes a card constraint and a target rule; push/pull creates position play | WR §2, §7.3; Dev |
| B05 | Deck | Single deck; every card is owned by a hero; a fallen hero's cards are unplayable until the hero returns; swapping a hero swaps their cards | One mini-deck per hero; fallen hero's cards leave the run | One deck keeps deckbuilding simple; unplayable cards give a fall weight without destroying the deck | DR (grimoire filtered by hero); Dev |
| B06 | Resource | Energy only (no mana, no cooldowns) | Energy + mana; energy + cooldowns | One economy to balance; the developer's references overlapped mana, energy and cooldowns | WR §7.1; DR (contradiction #9); Dev |
| B07 | Starting values | 3 energy, draw 5, hand limit 10, all to be tuned by simulation | 4 energy / draw 5; 5 energy / draw 6 | Most tested pair in the genre; numbers change only with `bun run sim` before/after | WR §7.1 (energy 3, draw 5, hand limit 10); Dev |
| B08 | Map | Act = 10 rows with 2–3 nodes per row; row 9 = rest (+ shop), row 10 = boss | Linear with forks every 2–3 rounds; pure linear | Route choice without a large map UI; fixed rows mirror how Slay the Spire fixes treasure/rest/boss floors | WR §7.2 (17 floors, fixed floors 9/15/16); Dev |
| B09 | What counts as a round | Every node is a round (combat, elite, rest, shop); about 7 combats per act carry the 10 enemy types | Only combats are rounds; every round is a combat | Keeps "10 rounds per act" literal and makes route choice spend rounds | Dev |
| B10 | Camp | Quick camp screen after every round: hero swap (gold) + 3 items; the full shop (cards, card removal, relics) is a map node | Swap only at the shop node; no swap | The swap must be reachable every round; the full shop stays a route decision | Dev |
| B11 | Enemies per fight | 1–2 enemies in rounds 1–3, up to 4 later; each combat introduces a new enemy type until all 10 have appeared | Always 3–5; always 3 | Gradual introduction (interest curve); 10 types fit about 7 combats | `docs/books/art-of-game-design.md` (interest curve); Dev |
| B12 | Elites | Optional elite node in rounds 4 and 7 beside a normal fight (0–2 elites per run, by choice) | 20% of combat nodes; mandatory elite in round 5 | Risk is a choice, not a roll; fixed rows keep simulation stable | WR §7.2, §9.1 (elite rewards); Dev |
| B13 | Boss (round 10) | Single static sprite, 2 phases by intent pattern (switch at 50% HP), signalled by flash, shake and text | 3 phases with sprite swaps; boss + renewable adds | Fits static prototype assets; phases read through intents | DR (boss concept with phases); Dev |
| B14 | Prototype node types | Combat, elite, rest, shop, boss; events and treasure in Alpha | All 7 types; combat + rest only | Events need bilingual writing and art; the prototype validates combat and economy | WR §7.2 (7 node types); Dev |
| B15 | Rest | Exclusive choice: heal about 30% party HP, **or** upgrade 1 card, **or** relieve stress | Heal and upgrade together; heal only | Opportunity cost is the decision; stress relief gives the stress system a counterplay | WR §7.2 (rest heals 30% or upgrades); Dev |
| B16 | Hero at 0 HP | The hero falls (their cards become unplayable), returns next round at 1 HP with an injury (−max HP) until a rest; all 3 heroes down = run over | Death's Door (next hit kills); death for the rest of the run | Punishment without irreversible loss in a 10-round act | WR §7.3 (Death's Door); Dev |
| B17 | Stress (prototype) | 0–10 pips; some cards and intents add stress; at 10 → **Collapse**: −1 energy next turn, stress resets to 5 | Postpone to Alpha; full Darkest Dungeon II stress (banter, meltdown, relationships) | Validates the grim layer early with one simple effect; short scale reads on small screens | WR §7.4 (DD2 stress 0–10); Dev |
| B18 | In-run progression | Card reward after combat: pick 1 of 3 from the heroes on the field, or skip; elites and the boss drop equipment with rarity; levels and the skill tree are meta-progression | Level-up with tree points inside the run; relics only | 3-card rewards are the genre standard; keeps run-time progression to cards and gear | WR §9.3 (3 cards per reward); Dev |
| B19 | Equipment | 2 slots per hero: weapon (modifies that hero's card numbers) and relic (passive); about 8 items in the prototype | 1 slot per hero; 6 slots from the developer's hero screens; relics only | Keeps the declared RPG pillar with the smallest scope | K01; DR (6-slot hero screen); Dev |
| B20 | Rarity | 4 tiers: common, uncommon, rare, legendary (legendary is boss-only); frame **shape** differs per tier, plus colour | 3 tiers; 5 tiers from the concepts | Rarity readable without colour (rule: never colour only); few frames, as in Slay the Spire | WR §5.3, §9.3; `.claude/rules/game-design.md`; Dev |
| B21 | Skill tree | Meta-progression, Alpha: 3 short branches × 3–4 nodes per hero, paid with the legacy currency; nodes unlock cards and hero variants (options, not raw power); not in the prototype | Full tree from the developer's concepts; no tree; in-run levels with tree points | Keeps the RPG pillar with bounded scope; 5 heroes multiply the cost of every node | DR (skill-tree-1); `.claude/rules/game-design.md` (meta gives options); Dev |
| B22 | Meta-progression | Every run, won or lost, grants a legacy currency (name in the GDD) spent on tree branches, new cards in the pool and hero variants; no stat bonuses; the prototype only tallies it | Permanent radial tree with stat bonuses; nothing until Alpha | A lost run still moves the player forward; options instead of power, as the Darkest Dungeon II Altar of Hope does | WR §8.1; DR (skill-tree-3); Dev |
| B23 | Auto battle | Toggle at any time; a greedy one-step AI plays the turn; the player takes over between commands; HUD button plus a pause/settings option; the same AI is the simulation bot | Whole-combat only, no takeover; also picks routes and rewards | One policy issues the same commands as the player, so there is no second rule path; doubles as the balancing bot | K09; Dev |
| B24 | Duration at 1x | Act 20–30 min; common combat 3–6 turns; full 3-act run 60–90 min | Act 40–60 min with 5–8-turn combats; act 10–15 min | Fits a web session per act; measured by simulation and playtest | WR §11 (session length); Dev |
| B25 | Run structure | 3 acts × 10 rounds; prototype = Act 1; Alpha = Acts 1–2; Beta = Act 3 + final boss | One act for the whole game; 3 acts from the prototype | Slay the Spire's 3-act shape, built one act per phase | WR §7.2; K08; Dev |
| B26 | Save | Autosave on entering a round and at every turn; `localStorage`, versioned with migrations; resume at turn start; seed fixed (no save scumming) | Save only per round; no save in the prototype | A closed browser tab must not lose the run; a fixed seed keeps reloads from rerolling outcomes | Dev |
| B27 | Difficulty | Base mode + a 10-level cumulative ladder unlocked by wins (Beta); the prototype has developer-only multipliers for simulation | Fixed easy/normal/hard modes; à la carte modifiers | Cumulative ladder as in Slay the Spire (StS2 has 10 levels); needs a calibrated base first | WR §8.2, §8.3; Dev |
| B28 | Base resolution | 640×360; `Scale.NONE` + integer zoom snapped to device pixels (to confirm in the zoom spike) | 480×270; 960×540 | 3 + 4 unit slots of 80 px, 64×90 cards and 44 CSS px primary touch targets at zoom 1 on a phone; ×2 at 1280×720, ×3 at 1920×1080 | WR §3.2, §12.3, §12.7; Dev |
| B29 | Card in hand | Shows cost, short name, keyword icons, main number and origin/target ranks; the first tap opens a 168×120 detail panel with the full text and the result preview | Full text always on the card; icons only | Card text is too small on a phone at zoom 1; the detail panel is laid out natively, never a scaled card | WR §5.3, §5.4; Dev |
| B30 | Input | Tap = select + preview; tap a valid target = confirm; long press = tooltip; drag optional; keyboard 1–9 selects a card, Space = end turn | Single tap confirms; drag only | No hover on touch; the preview before confirmation is an invariant | WR §5.4; `.claude/rules/game-design.md`; Dev |
| B31 | Accessibility | Prototype: colour + shape, no turn timer, reduce shake/flash option, speed 1x/2x/3x; Alpha: text scale and colourblind mode | Only colour + shape | Cheap with the event-driven presenter; speed already exists (K09) | `.claude/rules/game-design.md`; Dev |
| B32 | Business model | Free on the web until Beta (demo/public playtest); premium on Steam and Android later; no microtransactions | Free with donations; free-to-play with a store | Matches the tone and the scope; meta never sells power | K06; `docs/adrs/0003-ci-cd-vercel.md` (Hobby plan is non-commercial); Dev |
| B33 | Narrative | The world through fragments: short intro, 1–2 lines of lore per enemy and item, events of 2–4 paragraphs (Alpha), an epilogue per boss; no spoken narrator; dry, dark tone | Chaptered campaign; no story text | Low writing cost per item; no voice acting by rule | WR §4; `.claude/rules/ip-and-tone.md`; Dev |
| B34 | Premise | "Expedition to the Rift": a ruined militant-religious order sends parties of 3 into the Rift, a growing biomechanical wound beneath its cathedral-fortress; each run is a descent. Own vocabulary only | Imperial war setting; open-world campaign | Gives the run a reason (descent), a place (the Rift) and the 3-hero party; uses generic tropes allowed by the IP rule | `.claude/rules/ip-and-tone.md`; Dev |
| B35 | Heroes | Keep the 5 roles from the concepts: tank (rank 1), arcanist, healer/support, artillery, marksman; original generic class names; no "Inquisitor" or "Emperor" | Names from the hero screen (Dreadguard, Blood Huntress, Void Inquisitor); new roles | Roles already drawn by the developer; names avoid IP-sensitive terms | DR (concepts 23–27, contradiction #8 and #9); Dev |
| B36 | Art direction "ash and ember" | Base: cold ash greys, stone, dark iron; UI accents: ember orange + worn gold; the Rift: sickly green + violet; backgrounds desaturated, units higher contrast; single light from the upper left | Saturated high-fantasy palette; the developer's concept palette as is | Separates planes and factions by value and hue, not only colour; matches the pixel-art lighting rule | WR §3.2; `docs/books/pixel-logic.md`; Dev |
| B37 | Prototype audio | 4 music loops (menu, map, combat, boss) + about 35 SFX; no voice; `ogg` + `mp3` | 2 loops + 15 SFX; SFX only | Each screen has its own loop; SFX carry combat feedback with static art; generation goes through the cost gate | WR §4, §13.3; `.claude/rules/assets.md`; Dev |
| B38 | Phase scope | Prototype = playable Act 1 (5 heroes, 10 enemies, boss, about 45 cards, about 8 items, auto battle + 2x/3x, static assets + a few VFX); Alpha = Acts 1–2, events, treasure, skill tree, meta, animations; Beta = Act 3, difficulty ladder, polish, Electron + Android; 1.0 RC = final QA + Steam | Prototype as a single battle; all three acts in Alpha | Prototype answers "is it fun?" with one full act before committing to content | K06–K10; Dev |
| B39 | Name | "Ossuary" (web search clean; trademark and domain **not verified**; verify before any public use); the repository stays `project-alpha` until then | "Blightwake"; "DARKEON" | Low-risk single word; public use waits for the checks | Name candidates (session scratch); Dev |

## Ideas out of scope

Ideas kept for later phases. "Smaller version" is what entered the prototype instead, when there is one.

### Alpha

| Idea | Origin | Smaller version now |
|---|---|---|
| Events and treasure nodes | WR §7.2 | B14: not in the prototype |
| Act 2 (Act 3 and the final boss in Beta) | WR §7.2; B25 | One act in the prototype |
| Skill tree with 3 short branches × 3–4 nodes per hero (B21) | DR (skill-tree-1) | B18: no tree in the prototype |
| Spending the legacy currency (tree, cards in the pool, hero variants) (B22) | DR (skill-tree-3) | Prototype only tallies the currency |
| Text scale and colourblind mode (B31) | Brainstorm | Colour + shape, reduce shake/flash, speed in the prototype |
| Card removal with increasing cost (75 +25 in Slay the Spire) | WR §9.2 | Shop node in the prototype; cost curve to simulate |
| Gold anchor normal : elite : boss ≈ 1 : 2 : 7 | WR §9.1 | Calibrate by simulation |
| Six status effects (poison, weakness, marked, burn, strength, rupture) | DR (concepts) | Reduced set in the prototype (to define in the GDD) |
| Chain attack that hits several enemies | DR (batle-2) | — |
| Curse cards in the deck; emergency card with a curse | DR (concept 09) | — |
| Short text per event (2–4 paragraphs) and a sound stinger on critical events | WR §4 | — |
| Clickable exhaust counter | WR §5.1 | — |
| Large card preview beside the hand; tooltip that flips to the left | DR (wireframe-10) | Native 168×120 detail panel on first tap (B29) |
| Settings screen by categories; screen-shake toggle; UI scale | DR (menu-settings, wireframe-8) | Pause with continue, settings, restart, menu |
| Deck grimoire with hero filter, card collection with search, card inspector, 30-card deck limit | DR (deckbuilding-menu, wireframe-9) | — |
| Hero detail screen with stats and skills | DR (hero-*-menu, wireframe-13) | — |
| Combat backgrounds: cathedral, swamp, necropolis, battlefield, forest, citadel, forge | DR (concepts 01–09) | A few backgrounds for the first 10 rounds |
| Layered parallax backgrounds | WR §3.2 | — |
| Impact sparks and hit effects | DR (concepts) | Some combat VFX in the prototype (K10) |
| Card play/discard animation; flash and shake on impact | gd-game-feel | Code-driven flash/shake allowed with static art |
| Save that survives closing the tab; warning when the same run is open in two tabs; language switch mid-run | QA plan | — |

### Beta

| Idea | Origin | Note |
|---|---|---|
| Resolution test at 10 stress with the chance shown | WR §7.4 | B17 uses a fixed Collapse instead |
| Rarity pity (offset) in rewards | WR §9.3 | Needs simulation data |
| Hero relationships with affinity | WR §7.4 | Optional layer |
| Cumulative 10-level difficulty ladder unlocked by wins (B27) | WR §8.2 | Needs a calibrated base; Slay the Spire's own name is not used; prototype has developer-only multipliers |
| Act 3 and the final boss (B25) | WR §7.2 | — |
| Daily seed | WR §11 | Needs injected RNG (already planned) and a sharing layer |
| Team pact tree | DR (skill-tree-2) | Needs a hero-bond mechanic |
| Armoury with current vs selected comparison | DR (shop-menu-2) | Depends on more equipment |
| Reliquary with life pacts; trading life for a relic | DR (shop-menu-3) | Frustration risk; review after simulation |
| Elemental resistances (physical, fire, ice, poison, void) | DR | High balancing cost |
| Class synergy keywords | DR (deckbuilding-menu) | Needs class cards |
| Team screen with formation | DR (hero-menu, wireframe-10) | — |
| Deck auto-sort and deck metrics (average cost, curve) | DR | Comfort for advanced players |
| Ash rain and background fog; animated menu portal and particles; illustrated menu parallax | DR (concepts, menu-3) | Animation cost without gameplay gain |
| Pause on tab switch | QA plan | — |
| Electron (desktop/Steam) and Capacitor (Android) builds | K06 | End of Beta |

### Post-1.0

| Idea | Origin | Note |
|---|---|---|
| Optional difficulty modifiers à la carte | WR §8.3 | Only after the base ladder |
| Card corruption in hand with purification | DR (concept 05) | New mechanic, high balancing cost |
| Chaptered campaign | Brainstorm bank | Large writing scope |
| Named final boss from the concepts | DR (concept 10) | Name and concept go through IP review |

## Discarded ideas

| Idea | Origin | Reason |
|---|---|---|
| Spoken narrator | WR §4 | Rule: no voice acting (`.claude/rules/assets.md`) |
| Dodge percentage ("25% DODGE") | DR (batle-5, hero-archer) | Violates guaranteed hits (`.claude/rules/game-design.md`) |
| 20% chance to apply a condition on a card | DR (wireframe-11) | Hidden-feeling chance on effects; revisit only with a new hit decision |
| Mana stat and mana bar | DR (batle-3, batle-5) | B06: energy is the only card resource |
| Life as a general pact currency | DR (shop-menu-3) | Duplicates the gold economy |
| 4- or 8-direction sprites | WR §13.2 | Side view: one drawing per character, mirrored for enemies |
| Card hover state | DR | No hover on touch; long press instead |
| UI coordinates authored at 1920×1080 | DR (wireframes) | UI is authored at the pixel-art base resolution |
| 960×540 art production | DR (ChatGPT) | Too much art per sprite; base resolution is 640×360 (B28) |
| Throne-room and portal menu variants | DR (menu-2, menu-3) | One menu direction in the prototype |
| Name "DARKEON" | DR; name candidates | Name already used by a roguelite on itch.io |
| Elite as 20% of combat nodes | Brainstorm bank | B12: elites are a fixed-row choice |
| Three-phase boss with sprite swaps | Brainstorm bank | B13: two intent phases with static art |

## Open questions

Owner `Dev` = the developer decides; `Coord` = the coordinating agent drafts in the GDD, the developer approves. All were raised on 2026-10-26; the due point is the GDD (task 3) unless noted.

| Id | Question | Recommendation on the table | Owner | Raised |
|---|---|---|---|---|
| Q-ENEMY | The 10 enemy types of Act 1 and their move sets (2–3 moves each) | Draft in the GDD from primitive effects; one new type per combat (B11) | Coord | 2026-10-26 |
| Q-BOSS | Boss concept for round 10 and its two intent patterns | Draft in the GDD within B13 and B34 (the Rift) | Coord | 2026-10-26 |
| Q-HERO | The 5 heroes: class names, rank preference, starting cards per hero (about 45 cards in total, B38) | Draft in the GDD within B35; names go through the IP rule and a web search | Coord | 2026-10-26 |
| Q-CAMP | The camp's 3 items per visit and the hero-swap gold cost | Draft in the GDD; numbers by simulation | Coord | 2026-10-26 |
| Q-ITEMS | The ~8 prototype equipment items (weapon + relic slots) and rarity weights | Draft in the GDD; start from 50/33/17 (WR §9.3) | Coord | 2026-10-26 |
| Q-LEGACY-NAME | Name of the legacy currency (B22) | Own vocabulary, checked against the IP rule | Coord | 2026-10-26 |
| Q-NAME-CHECK | Trademark and domain checks for "Ossuary" (B39) | Verify before any public use (store page, domain, social accounts) | Dev | 2026-10-26 |
| Q-ZOOM | `Scale.NONE` + integer zoom snapped to device pixels: behaviour on real phones with the browser UI visible (B28) | Confirm in the zoom spike before the Art Bible fixes sizes | Coord | 2026-10-26 |

### Closed questions

| Id | Question | Closed by |
|---|---|---|
| Q-RES | Base resolution | B28 |
| Q-CARD | How much text a card shows in hand | B29 |
| Q-NAME | Game name | B39 (checks pending in Q-NAME-CHECK) |
| Q-CLASS | Hero and class names; handling of "Inquisitor"/"Emperor" | B35 (names drafted in Q-HERO) |
| Q-PILLAR | Player fantasy and pillar statement | B01, B34 |
| Q-NARR | How narrative appears | B33 |
| Q-LEGACY | Does anything carry across runs when a hero falls? | B22 (legacy currency on every run; no stat bonuses) |
| Q-META | What meta-progression unlocks | B21, B22 |
| Q-DIFF | Difficulty selection | B27 |
| Q-AUTO | Auto battle semantics | B23 |
| Q-TIME | Target duration of an act and turns per normal combat | B24 |
| Q-SAVE | When the game saves | B26 |
| Q-A11Y | Minimum accessibility in the prototype | B31 |
| Q-BIZ | Business model | B32 |
| Q-AUDIO | Prototype audio scope and budget | B37 (budget estimate goes in the PLAN, behind the cost gate) |
