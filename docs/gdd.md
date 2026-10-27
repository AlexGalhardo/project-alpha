# Ossuary — Game Design Document

- Working title: **Ossuary** (trademark and domain not verified: open question Q-NAME-CHECK). Repository: `project-alpha`.
- Version: 0.1 (2026-10-26). Owner: coordinator session. Source of every decision: [`docs/brainstorming.md`](brainstorming.md) (ids `Bxx`, `Kxx`). Research: [`docs/web-research.md`](web-research.md) (`WR §n`).
- Companion documents: [`docs/art-bible.md`](art-bible.md) (look, pixel specs, UI layout, audio style), [`docs/glossary.md`](glossary.md) (one word per concept), `docs/sdd/` (engineering specs, task 4).
- Numbers marked ⚖ are balance values: change them only with a simulation report (`.claude/rules/game-design.md`). Every number lives in `src/data/` in code.

## Contents

1. [Vision](#1-vision)
2. [Scope by phase](#2-scope-by-phase)
3. [Core loops](#3-core-loops)
4. [Run, act, map and rounds](#4-run-act-map-and-rounds)
5. [Combat rules](#5-combat-rules)
6. [Statuses and keywords](#6-statuses-and-keywords)
7. [Stress](#7-stress)
8. [Heroes](#8-heroes)
9. [Cards](#9-cards)
10. [Enemies, elites and boss](#10-enemies-elites-and-boss)
11. [Rewards and economy](#11-rewards-and-economy)
12. [Equipment](#12-equipment)
13. [Meta-progression and difficulty](#13-meta-progression-and-difficulty)
14. [Auto battle and game speed](#14-auto-battle-and-game-speed)
15. [Screens, flow, HUD and controls](#15-screens-flow-hud-and-controls)
16. [Narrative and tone](#16-narrative-and-tone)
17. [Audio design](#17-audio-design)
18. [Save, settings and accessibility](#18-save-settings-and-accessibility)
19. [Fun principles and heuristics](#19-fun-principles-and-heuristics)
20. [Prototype acceptance and playtest questions](#20-prototype-acceptance-and-playtest-questions)
21. [Open questions](#21-open-questions)

## 1. Vision

### 1.1 Pitch

A roguelite deckbuilder with RPG progression, in pixel art, for the web first. You command a party of 3 condemned heroes on a descent into **the Rift**, a growing biomechanical wound beneath the cathedral-fortress of a ruined militant order. Cards decide **what** happens; ranks decide **who acts and who is hit**. Every victory costs HP, stress or a hero.

### 1.2 Pillars (B01)

| # | Pillar | Means | Test question for any feature |
|---|---|---|---|
| P1 | Cards + position | Each card declares the rank it is played from and the ranks it reaches; push, pull and swap change the board. | Does this make a rank or a card choice matter more? |
| P2 | A party that pays the price | HP, stress, injuries and falls persist inside a run. | Does this make the player weigh a cost? |
| P3 | Full information per turn | Hits are guaranteed; intents, turn order and result previews are always visible. | Can the player see everything that will hurt them before deciding? |

### 1.3 Player fantasy (B02)

"I am the commander of a doomed expedition. I chose these three, I keep them standing, and I decide who bleeds today."

### 1.4 Essential experience

Tense, readable turns where the right answer exists but costs something; a run that tells a short grim story through who fell, who cracked under stress and what was sacrificed.

### 1.5 Theme and tone (B33, B34, `.claude/rules/ip-and-tone.md`)

- Theme: *faith as armor against the unknown, and its cost*.
- Tone: grimdark gothic-military meets biomechanical horror. Dry, short, no parody humour, violence suggested rather than shown.
- Inspirations give tone and structure only; no names, symbols, heraldry or silhouettes from other works.

### 1.6 Fixed constraints (K01–K12)

Web first (Phaser 4.2.1, Bun, TypeScript), pixel art on a 640×360 logical layout, drawn through a ×3 camera on a 1920×1080 canvas and FIT-scaled to the viewport (B28, B40), Roboto UI text (B40), English default with PT-BR localization, 5 heroes, 10 rounds per act with a boss at round 10, auto battle and game speed 1x/2x/3x from the prototype, static art in the prototype, Electron and Android only at the end of the Beta.

## 2. Scope by phase

| Content | Prototype | Alpha | Beta | 1.0 RC |
|---|---|---|---|---|
| Acts | Act 1 | Acts 1–2 | Acts 1–3 + final boss | same, polished |
| Heroes | 5 (party of 3) | 5 + 1 variant each | 5 + 2 variants each | same |
| Cards | 45 (9 per hero) | ~75 | ~110 | same |
| Enemies | 10 + 2 elite variants + 1 boss | 20 + 4 elites + 2 bosses | 30 + 6 elites + 4 bosses | same |
| Equipment | 8 | 20 | 32 | same |
| Node types | combat, elite, rest, shop, boss + camp | + event, treasure | same | same |
| Meta | Embers tallied only | skill tree, unlocks | difficulty ladder (10 Rites) | same |
| Art | static sprites, code-driven feedback, ~8 VFX | animations (idle, attack, hit) | polish, all VFX | same |
| Platforms | web | web | web + Electron + Android | + Steam build |

Scope rule: anything not in a column is out for that phase and goes to `docs/brainstorming.md` (B38).

## 3. Core loops

### 3.1 Combat turn (seconds)

```text
start of player turn → statuses tick, Block resets, draw 5, energy = 3
→ read intents and turn queue → select card → preview → choose target → confirm
→ repeat until energy 0 or "End turn" → discard hand
→ enemies act in queue order → end-of-turn ticks → next turn
```

### 3.2 Round (minutes)

```text
map: choose 1 of 2–3 nodes in the next row → resolve node (combat / elite / rest / shop / boss)
→ rewards → camp (swap hero, buy 1 of 3 offers) → next row
```

### 3.3 Run (≈ 20–30 min per act at 1x, B24)

```text
main menu → party select (3 of 5, set ranks) → Act 1 rounds 1–10 → boss → (Alpha: Act 2 …)
→ run summary → Embers banked → back to menu
```

### 3.4 Meta (between runs, Alpha)

Embers → skill tree branches and unlocks (options, not raw power, B21–B22).

## 4. Run, act, map and rounds

### 4.1 Definitions

| Term | Definition |
|---|---|
| Run | One attempt from party select to victory or party wipe. |
| Act | 10 rounds. The game ships 3 acts (§23.1); between acts the Sanctum offers one recovery (§23.1, §23.6). |
| Round | One map node. Round number = map row (1–10). Every node counts (B09). |
| Combat turn | One player turn + one enemy turn inside a combat. |

### 4.2 Map generation (B08, B12) ⚖

Seeded by the run seed. Rows 1–10, nodes per row and node types:

| Row | Nodes | Types |
|---|---|---|
| 1 | 2 | combat, combat |
| 2 | 3 | combat ×3 |
| 3 | 2 | combat, combat |
| 4 | 2–3 | **elite** ×1, combat ×1–2 |
| 5 | 3 | combat ×2, shop ×1 |
| 6 | 2 | combat, combat |
| 7 | 2–3 | **elite** ×1, combat ×1–2 |
| 8 | 3 | combat ×2, shop ×1 (only if row 5 shop was not on the chosen path is irrelevant: both rows always have one) |
| 9 | 2 | rest, shop |
| 10 | 1 | boss |

Edge rules:

- Node *i* of row *r* connects to 1–2 nodes of row *r+1* with index *i* or *i±1*; edges never cross.
- Every node is reachable from row 1 and reaches row 10.
- Hover-free: the full map is visible from the start; the current row is highlighted.

Resulting path: 7 combats + up to 2 elites + 1–2 shops + 1 rest + 1 boss. Elites are always optional (a combat sibling exists). Every path has at least 6 fights before the boss: rows 1, 2, 3 and 6 are combat-only and rows 4 and 7 are combat or elite; the map validator asserts this minimum (SDD-07).

### 4.3 Encounter selection ⚖

- Encounters come from two pools: **Tier A** (rows 1–3) and **Tier B** (rows 4–8) (§10.3).
- Selection rule: pick the encounter of the row's tier (rows 1–3 Tier A, rows 4–8 Tier B) with the most enemy types the run has not seen yet, weighting types that appear in few encounters higher; ties → seeded pick. Measured: 72.6% of paths with ≥ 6 combats see all 10 types by row 8 (4,000 seeds, `docs/reports/2026-10-26-sim-prototype.md`). Decision 2026-10-26: keep the difficulty ramp of strict tiers over full coverage; `ENCOUNTER_RULES.offTierWeight` = 0.8 would reach ≥ 95% but puts Tier B fights in rows 1–3 (B11 relaxed).
- Act scaling for Acts 2–3 (Alpha/Beta): enemy HP × (1 + 0.5 × (act − 1)), enemy damage × (1 + 0.3 × (act − 1)), rounded.

### 4.4 Camp (B10) ⚖

Opens after every round except the boss, including after rest and shop nodes. One screen, no travel:

| Offer | Price (gold) | Notes |
|---|---|---|
| Swap a hero | 30 | One swap per camp visit. Choose 1 of the 2 heroes not in the party; they join at full HP and 0 stress with their 4 starter cards; the leaving hero's cards leave the deck and their equipment goes to the stash. |
| Card for sale (1) | common 35 / uncommon 55 / rare 90 | Drawn from the party heroes' pools. Rarity odds 65 / 30 / 5 (common / uncommon / rare). |
| Equipment for sale (1) | common 50 / uncommon 85 / rare 140 | Odds 60 / 40 (common / uncommon). Rare appears only as a fallback when every common and uncommon item is owned. A full stash (6) blocks buying. |
| Service (1 of 2, seeded) | 12 | "Bind wounds": heal 15% max HP of every hero; or "Vigil": −3 stress on one hero. |
| Reorder ranks | free | Drag heroes between ranks 1–3. |

The player may buy any subset they can afford; "Leave camp" continues. With a full stash (6), buying equipment and unequipping are blocked (§12.1).

### 4.5 Rest (row 9, B15) ⚖

Exclusive choice of one:

| Option | Effect |
|---|---|
| Recover | Each hero first loses any injury (max HP restored), then heals 30% of the restored max HP (rounded down) (SDD-08 AC-6). |
| Temper | Upgrade 1 card. |
| Pray | Each hero −5 stress. |

### 4.6 Shop node ⚖

| Stock | Count | Price (gold) |
|---|---|---|
| Cards (party heroes) | 5 (3 common, 1 uncommon, 1 rare) | common 40–48, uncommon 62–75, rare 110–130 (seeded in range) |
| Equipment | 2 | common 55, uncommon 90, rare 140 |
| Card removal | 1 per visit | 50 + 25 × removals already bought this run |

## 5. Combat rules

### 5.1 Board

- Heroes: 3 ranks, H1 (front, nearest enemies) to H3 (back), on the left facing right.
- Enemies: up to 4 ranks, E1 (front) to E4, on the right facing left. The boss occupies E1+E2.
- A unit occupies exactly one rank (boss: two). Empty ranks collapse forward when a unit dies or falls.

### 5.2 Turn structure (B03) ⚖

| Step | Rule |
|---|---|
| Start of player turn | Hero Block → 0; start-of-turn statuses tick (Bleed); energy = 3 (−1 per Collapse pending, min 0); draw 5. |
| Player phase | Play cards in any order while energy allows. Cards of fallen heroes are unplayable (greyed). |
| End turn | Button or `Space`. Unplayed cards go to discard. End-of-turn statuses tick for heroes (Burn, Marked/Weakened decay). |
| Enemy phase | Enemy Block → 0 at the start of each enemy's own action; each enemy performs its intent in **turn-queue order**; end-of-action ticks per enemy. |
| New intents | At the end of the enemy phase every living enemy reveals its next intent (§10.1). |

Turn queue: enemies sorted by **Speed** descending, ties → lower rank first. The queue is always visible (top bar).

**Enrage and turn cap ⚖.** From combat turn 10, at the start of each player turn every enemy gains +1 Might (shown as the "Enraged" warning in the top bar, announced from turn 8). It is applied before the player acts, so the intents on screen already include it (P3). A combat that reaches turn 30 counts as a loss. Why: a stalemate (for example two Lantern Leeches draining against a healer) used to run to a 60-turn cap and end the run after about 30 minutes at 1x (QA playtest 1, P2-9); enrage turns the stall into visible, rising pressure.

### 5.3 Cards, energy and piles ⚖

| Rule | Value |
|---|---|
| Energy per turn | 3 (B07) |
| Draw per turn | 5 |
| Hand limit | 10; extra draws stay in the draw pile |
| Piles | draw, hand, discard, exhaust; draw pile order hidden, contents viewable sorted by name |
| Reshuffle | When drawing from an empty draw pile, shuffle discard into draw (seeded) |
| Starting deck | 4 cards per party hero = 12 (§9.2) |

### 5.4 Ranks and targeting (B04)

- Each card has **From** (hero ranks it can be played from) and **Target** (enemy ranks, ally, self, all).
- If the owner stands outside From, the card is unplayable this turn (shown with a rank icon in red + cross shape).
- Movement keywords: **Push N** (enemy moves N ranks back, swapping), **Pull N** (forward), **Swap** (hero swaps with the adjacent hero named on the card).
- Enemies declare targets by rule (§10.1); heroes never choose which hero is attacked except via Taunt.

### 5.5 Damage, block and healing (formulas) ⚖

```text
hitDamage = floor( (base + attackerMight) × (target.Marked ? 1.5 : 1) × (attacker.Weakened ? 0.75 : 1) )
absorbed  = min(target.Block, hitDamage); target.Block -= absorbed; target.HP -= hitDamage - absorbed
heal      = min(amount, maxHP - HP)        // healing never exceeds max HP; fallen heroes cannot be healed
```

- Hits are guaranteed; there are no hit, dodge or critical chances (invariant).
- Multi-hit attacks ("4 ×2") apply the formula per hit.
- Bleed and Burn ignore Block.
- The **preview** shows `hitDamage` per target after all modifiers, and the resulting HP/Block, before confirmation.

### 5.6 Falling, injury and defeat (B16) ⚖

| Event | Rule |
|---|---|
| Hero HP reaches 0 | Hero **falls**: removed from rank (ranks collapse), their cards become unplayable, each other hero +2 stress. |
| End of combat | Fallen heroes return for the next round at **1 HP** with an **Injury**: max HP −25% (floor) until a Rest "Recover". They return to their original rank after combat; rank swaps made during combat do not persist. |
| Second fall while injured | Same rule; injury does not stack (still −25%). |
| All party heroes fallen | Run over (defeat). |
| All enemies dead | Combat won → rewards (§11). |

### 5.7 Combat duration target (B24) ⚖

- Common combat: 3–6 combat turns; elite: 5–7; boss: 7–10.
- Player turn at 1x: ~20–30 s of thinking + ≤ 4 s of enemy animations.
- Tuning knob order when combats run long: enemy HP first, then card damage (double/halve rule).

## 6. Statuses and keywords

### 6.1 Statuses (9) ⚖

| Status | Applies to | Effect | Decay |
|---|---|---|---|
| Block N | all | Absorbs N damage from hits. | Resets to 0 at the start of the owner's turn. |
| Might N | all | +N damage per hit. | Lasts the combat. |
| Marked N | all | Takes ×1.5 hit damage. | −1 at the end of the owner's turn. |
| Weakened N | all | Deals ×0.75 hit damage. | −1 at the end of the owner's turn. |
| Bleed N | all | Loses N HP at the start of the owner's turn. | Then N −1. |
| Burn N | all | Loses N HP at the end of the owner's turn. | Then N = floor(N / 2). |
| Ward N | all | Negates the next N debuff applications (Marked, Weakened, Bleed, Burn, Stunned). | −1 per negation. |
| Enraged | enemies (combat-wide) | From combat turn 10, +1 Might at the start of each player turn (§5.2). | Lasts the combat. |
| Stunned | enemies only | Its next intent is skipped and consumed; the cycle advances. Immune to Stun until its next performed action. | When the skipped intent is consumed. |

Status icons pair a color with a distinct shape (Art Bible). Stacks show as a number in the icon corner.

### 6.2 Keywords

| Keyword | Meaning |
|---|---|
| Exhaust | After play, goes to the exhaust pile for the rest of the combat. |
| Power | Stays in play for the combat after being played (its effect is ongoing). |
| Dread N | When played, the owner gains N stress. |
| Push N / Pull N | Moves the target enemy N ranks back / forward. |
| Swap | Owner swaps rank with the adjacent hero (behind if not specified). |
| Splash N | Each enemy adjacent to the target takes N damage (formula applies). |
| Taunt | Until your next turn, enemy single-target intents retarget to this hero. |

## 7. Stress

### 7.1 Rules (B17) ⚖

| Rule | Value |
|---|---|
| Range | 0–10 per hero, shown as 10 pips |
| Persistence | Carries between rounds; reset to 0 at the start of a run |
| Collapse | When a hero reaches 10: the party gets **−1 energy at the start of the next player turn**, and that hero's stress becomes 5. Multiple collapses in one turn stack (min energy 0). |

### 7.2 Sources and relief ⚖

| Source | Stress |
|---|---|
| Enemy intents with "Terror" | +1 to +2 (listed per enemy) |
| Card with Dread N | +N to the card's owner |
| An ally falls | +2 to each other hero |
| Boss "Toll" | +2 to every hero |

| Relief | Stress |
|---|---|
| Rest: Pray | −5 every hero |
| Camp: Vigil (12 gold) | −3 one hero |
| Confessor cards | −1 to −3 (§9.3) |
| Combat won without any hero falling | −1 every hero |

## 8. Heroes

### 8.1 Roster (B35) ⚖

| Key | Class | Role | Ranks (From, typical) | Max HP | Identity |
|---|---|---|---|---|---|
| `shieldbearer` | Shieldbearer | tank | H1 | 60 | Block, Taunt, protects allies |
| `marksman` | Marksman | single-target damage | H2–H3 | 42 | Marked, precision, reach any rank |
| `arcanist` | Arcanist | area damage | H2–H3 | 38 | Burn, area hits, pays in stress (Dread) |
| `confessor` | Confessor | support/healer | H2–H3 | 52 | Heal, Ward, stress relief |
| `bombardier` | Bombardier | artillery | H3 | 48 | Splash, back-rank hits, Stun |

Anti-dominance pass ⚖ (QA playtest 1, P2-8): parties without the Shieldbearer won 5.8% of 2-act runs. Confessor 44 → 52 HP; Ash Veil and Sanctuary 5 → 10 Block (13 upgraded); Sandbags gives the adjacent hero 3 → 6 Block. Result and method: `docs/reports/2026-10-26-sim-prototype.md`.

Party: choose 3 of 5 in Party select and assign ranks H1–H3 (B02). Default suggestion for the first run: Shieldbearer (H1), Confessor (H2), Marksman (H3).

Personal names and backstories: open question Q-HERO (owner coordinator, GDD v0.2, due 2026-11-02). Class names above are final for the prototype (generic, IP-checked against `.claude/rules/ip-and-tone.md`).

### 8.2 Hero data model

`id`, `classKey`, `maxHP`, `HP`, `stress`, `injured`, `rank`, `equipment.weapon`, `equipment.relic`, `cardPool[]` (9 card ids), `starterCards[]` (4 ids).

## 9. Cards

### 9.1 Anatomy (B29)

| Field | Rule |
|---|---|
| Cost | 0–3 energy |
| Type | Attack, Skill, Power |
| Rarity | starter, common, uncommon, rare, legendary (legendary: boss rewards only, none in the prototype pool) |
| Owner | one hero class |
| From / Target | ranks (§5.4) |
| Text | ≤ 12 words, keywords as icons + bold word |
| Upgrade (`+`) | Formula below; shown as a green number in the detail panel |

Upgrade values: the `+` column of §9.3 is authoritative. The formula below is only a guideline for designing new cards: each damage/Block/heal value: +3 if base ≥ 6, else +2; each status stack +1; costs never change unless the table says so.

Card value guideline ⚖ (for designing new cards): 1 energy ≈ 6 damage ≈ 5 Block ≈ 5 heal ≈ 2 stacks of Marked/Weakened ≈ 3 Burn. Area hit = single value × 0.6 per enemy. Each Dread point refunds ≈ +2 damage. Power cards: payback in ≤ 3 turns.

### 9.2 Starter decks

Each hero brings 4 cards: Strike ×2, Guard ×1, Signature ×1 (the three `starter` rows per hero below; the first one is the ×2 card). Party deck = 12 cards.

### 9.3 Prototype card list (45) ⚖

Notation: `E1–2` enemy ranks; `any` any enemy; `ally` any hero; `self` owner; `all` all enemies; `+` = upgraded values.

**Shieldbearer** (`shb_`)

| Id | Name | Cost | Type | Rarity | From | Target | Effect | + |
|---|---|---|---|---|---|---|---|---|
| shb_hack | Hack | 1 | Attack | starter ×2 | H1–2 | E1–2 | 6 damage | 9 |
| shb_brace | Brace | 1 | Skill | starter | any | self + allies | 6 Block to self, 2 Block to each other hero | 9 / 3 |
| shb_hold_the_line | Hold the Line | 1 | Skill | starter | H1 | self | 5 Block; Taunt | 8 |
| shb_shield_slam | Shield Slam | 1 | Attack | common | H1 | E1 | Damage equal to own Block (max 24) | gain 3 Block first |
| shb_iron_stance | Iron Stance | 0 | Skill | common | any | self | 4 Block; Exhaust | 7 |
| shb_shove | Shove | 1 | Attack | common | H1–2 | E1 | 5 damage; Push 1 | 8 |
| shb_bulwark | Bulwark | 2 | Skill | uncommon | any | self | 14 Block; this Block does not reset next turn | 18 |
| shb_vow_of_iron | Vow of Iron | 1 | Power | uncommon | any | self | At the start of your turn gain 3 Block | 5 |
| shb_last_bastion | Last Bastion | 2 | Skill | rare | any | all heroes | 10 Block to each hero; Dread 2; Exhaust | 14 |

**Marksman** (`mrk_`)

| Id | Name | Cost | Type | Rarity | From | Target | Effect | + |
|---|---|---|---|---|---|---|---|---|
| mrk_aimed_shot | Aimed Shot | 1 | Attack | starter ×2 | H2–3 | any | 6 damage | 9 |
| mrk_sidestep | Sidestep | 1 | Skill | starter | any | self | 5 Block; Swap (behind) | 8 |
| mrk_mark_prey | Mark Prey | 1 | Skill | starter | H2–3 | any | 3 damage; 2 Marked | 3 Marked |
| mrk_piercing_bolt | Piercing Bolt | 1 | Attack | common | H2–3 | any | 5 damage to target and to the enemy one rank behind | 7 |
| mrk_quick_draw | Quick Draw | 0 | Attack | common | H2–3 | any | 3 damage; draw 1 | 5 |
| mrk_pinning_shot | Pinning Shot | 1 | Attack | common | H2–3 | any | 4 damage; 2 Weakened | 6 |
| mrk_volley | Volley | 2 | Attack | uncommon | H2–3 | all | 4 damage ×2 to each enemy | 5 ×2 |
| mrk_hunters_focus | Hunter's Focus | 1 | Power | uncommon | any | self | First hit each turn against a Marked enemy +5 damage (owner's own attacks only) | +7 |
| mrk_killshot | Killshot | 2 | Attack | rare | H2–3 | any | 14 damage; +14 if Marked; Exhaust | 18 / +18 |

**Arcanist** (`arc_`)

| Id | Name | Cost | Type | Rarity | From | Target | Effect | + |
|---|---|---|---|---|---|---|---|---|
| arc_ember_bolt | Ember Bolt | 1 | Attack | starter ×2 | H2–3 | any | 7 damage | 10 |
| arc_ash_veil | Ash Veil | 1 | Skill | starter | any | ally | 10 Block | 13 |
| arc_rift_spark | Rift Spark | 2 | Attack | starter | H2–3 | all | 5 damage to each enemy; Dread 1 | 7 |
| arc_burn_hex | Burn Hex | 1 | Skill | common | H2–3 | any | 4 Burn | 6 |
| arc_channel | Channel | 1 | Skill | common | any | self | Next turn +2 energy; Exhaust | cost 0 |
| arc_cinder_lance | Cinder Lance | 1 | Attack | common | H2–3 | E1 | 10 damage | 14 |
| arc_firestorm | Firestorm | 2 | Attack | uncommon | H2–3 | all | 8 damage to each enemy; Dread 2 | 11 |
| arc_unseal | Unseal | 0 | Skill | uncommon | any | self | Draw 2; Dread 1 | draw 3 |
| arc_rift_rupture | Rift Rupture | 3 | Attack | rare | H2–3 | any | 30 damage; Dread 3; Exhaust | 40 |

**Confessor** (`cnf_`)

| Id | Name | Cost | Type | Rarity | From | Target | Effect | + |
|---|---|---|---|---|---|---|---|---|
| cnf_censer_strike | Censer Strike | 1 | Attack | starter ×2 | H1–3 | E1–2 | 5 damage; heal the lowest-HP hero 2 | 7 / 3 |
| cnf_sanctuary | Sanctuary | 1 | Skill | starter | any | ally | 10 Block; Ward 1 | 13 |
| cnf_mend | Mend | 1 | Skill | starter | any | ally | Heal 6 | 9 |
| cnf_absolve | Absolve | 1 | Skill | common | any | ally | Remove all debuffs; −2 stress | −3 stress |
| cnf_litany | Litany | 1 | Skill | common | any | all heroes | 3 Block and −1 stress to each hero | 5 Block |
| cnf_rebuke | Rebuke | 1 | Attack | common | H1–3 | E1–2 | 4 damage; 2 Weakened | 6 |
| cnf_mass_mend | Mass Mend | 2 | Skill | uncommon | any | all heroes | Heal 5 each hero; Exhaust | 8 |
| cnf_steadfast_hymn | Steadfast Hymn | 1 | Power | uncommon | any | self | At the start of your turn the lowest-HP hero gains 4 Block | 6 |
| cnf_rekindle | Rekindle | 2 | Skill | rare | any | fallen hero | Fallen hero rises at 25% max HP, no injury from this fall; Exhaust | 40% |

**Bombardier** (`bmb_`)

| Id | Name | Cost | Type | Rarity | From | Target | Effect | + |
|---|---|---|---|---|---|---|---|---|
| bmb_grapeshot | Grapeshot | 1 | Attack | starter ×2 | H2–3 | E1 + E2 | 4 damage to each | 6 |
| bmb_sandbags | Sandbags | 1 | Skill | starter | any | self | 6 Block to self; 6 Block to the adjacent hero | 9 / 7 |
| bmb_shell | Shell | 2 | Attack | starter | H3 | E2–4 | 11 damage; Splash 4 | 15 / 6 |
| bmb_incendiary | Incendiary | 1 | Attack | common | H2–3 | any | 3 damage and 3 Burn to target and adjacent enemies | 4 / 4 |
| bmb_reload | Reload | 0 | Skill | common | any | self | Draw 1; each hit of this hero's next attack card this turn +4 damage | +6 |
| bmb_concussion_round | Concussion Round | 2 | Attack | common | H2–3 | any | 6 damage; Stun | 9 |
| bmb_barrage | Barrage | 3 | Attack | uncommon | H3 | random | 6 damage ×3, each to a random enemy (seeded) | 8 ×3 |
| bmb_powder_keg | Powder Keg | 1 | Skill | uncommon | H2–3 | any | Plant a Keg: next time that enemy is hit, it and adjacent enemies take 10 (hit formula; does not chain) | 14 |
| bmb_siege_mortar | Siege Mortar | 3 | Attack | rare | H3 | all | 18 damage to each enemy; Dread 2; Exhaust | 24 |

## 10. Enemies, elites and boss

### 10.1 Intent rules

- Each enemy has a fixed **intent cycle**; the boss starts at its first intent; other enemies start at a seeded index. The next intent is revealed at the end of the enemy phase (and at combat start).
- An intent shows: icon (shape + color), exact number(s) after modifiers, and target marker on the hero(es).
- Default targeting: the front-most hero in reach. Variants: `back` (H3, else front-most), `highest-stress`, `lowest-HP`, `marked` (a Marked hero, else front-most), `all`.
- If the target moves or falls before the enemy acts, the intent retargets by the same rule; the displayed intent updates immediately.
- A Stunned enemy's skipped intent is consumed and the cycle advances. Stun immunity lasts until its next performed action.

### 10.2 Act 1 enemies (10) ⚖

| Key | Name | Ranks | HP | Speed | Intent cycle (in order) |
|---|---|---|---|---|---|
| husk_penitent | Husk Penitent | E1–2 | 18 | 2 | Flail 5 → Flail 5 → Mutter: +1 stress (front) |
| chitter_swarm | Chitter Swarm | E1–3 | 10 | 5 | Bite 2 ×2 (front) |
| ash_acolyte | Ash Acolyte | E2–3 | 22 | 3 | Kindle: +1 Might to all enemies → Ash Strike 6 → Ash Strike 6 |
| graft_hound | Graft Hound | E1–2 | 20 | 6 | Lunge 7 (front) → Rend 3 + 3 Bleed (front) → Lunge 7 |
| wax_mourner | Wax Mourner | E3–4 | 16 | 1 | Dirge: +2 stress (highest-stress) → Drip 4 (lowest-HP) → Dirge |
| rust_templar | Rust Templar | E1 | 34 | 2 | Raise Shield: 10 Block → Cleave 8 to H1 and H2 → Cleave 8 to H1 and H2 |
| lantern_leech | Lantern Leech | E2–4 | 14 | 4 | Drain 5, heals itself 5 (lowest-HP) → Lure: 2 Marked (back) → Drain |
| choir_thing | Choir-Thing | E4 | 26 | 1 | Shriek: +1 stress and 1 Weakened to every hero → Hum: 1 Ward to every enemy → Shriek |
| ossified_brute | Ossified Brute | E1–2 | 46 | 1 | Gather (telegraph "Crush next") → Crush 16 (front) → Shove 6, swaps H1 and H2 |
| rift_stalker | Rift Stalker | E2–4 | 30 | 7 | Fade: 12 Block, moves to E4 → Ambush 11 (back) → Rake 4 ×2 (back) |

### 10.3 Encounters ⚖

| Id | Pool | Enemies (rank order E1→E4) | Total HP |
|---|---|---|---|
| A1 | Tier A | husk_penitent, chitter_swarm | 28 |
| A2 | Tier A | graft_hound, chitter_swarm | 30 |
| A3 | Tier A | husk_penitent, ash_acolyte | 40 |
| A4 | Tier A | husk_penitent, wax_mourner | 34 |
| A5 | Tier A | chitter_swarm, lantern_leech | 24 |
| A6 | Tier A | husk_penitent, choir_thing | 44 |
| B1 | Tier B | rust_templar, ash_acolyte | 56 |
| B2 | Tier B | graft_hound, lantern_leech, lantern_leech | 48 |
| B3 | Tier B | husk_penitent, husk_penitent, choir_thing | 62 |
| B4 | Tier B | ossified_brute, chitter_swarm, chitter_swarm | 66 |
| B5 | Tier B | husk_penitent, rift_stalker, wax_mourner | 64 |
| EL1 | Elite, row 4 | rust_templar (elite), ash_acolyte | 65 |
| EL2 | Elite, row 7 | ossified_brute (elite), wax_mourner | 74 |
| BOSS | Row 10 | bell_maw (E1+E2) | 100 |

### 10.4 Elites (B12) ⚖

Elite = base enemy with: HP × 1.25 (round; was 1.75 before the 2026-10-26 balance pass), every damage number × 1.25 (round; damage only, not stress), a gold frame/aura (no new sprite) and one trait:

| Elite | Trait |
|---|---|
| rust_templar (elite) — "Templar Captain" | *Oathwall*: whenever it gains Block, every other enemy gains 5 Block. |
| ossified_brute (elite) — "Calcified Brute" | *Calcified*: takes −2 damage per hit (min 1). |

### 10.5 Boss: Bell-Maw (B13) ⚖

A cathedral bell grown into a biomechanical mouth, rooted in the Rift. Occupies E1+E2, HP 100 (was 160 before the 2026-10-26 balance pass), Speed 3.

| Phase | Trigger | Intent cycle |
|---|---|---|
| 1 | start | Toll: +2 stress to every hero → Clapper 14 (front) → Resonance: 15 Block and +1 Might |
| 2 | HP ≤ 50 (checked after each hit) | On entering: removes its debuffs, +2 Might, screen flash + shake + text "THE BELL CRACKS"; cycle: Peal 5 to every hero → Swallow 18 (highest-stress) → Toll |

Phase change happens immediately; the current intent is replaced by phase 2's first intent and shown before the player continues.

## 11. Rewards and economy

### 11.1 Gold ⚖

| Source | Gold |
|---|---|
| Run start | 50 |
| Combat won | 10 + seeded 0–6 (10–16) |
| Elite won | 28 + seeded 0–8 (28–36) |
| Boss won | 75 |

Expected Act 1 income on a typical path (7 combats, 1 elite): ≈ 50 + 91 + 32 = 173 before the boss. Expected spend: 1 shop visit (~80–130) + 2–3 camp purchases (~60–90). Gold must feel scarce: the player should afford about half of what they want (tuning target).

### 11.2 Card rewards ⚖

After every won combat: choose 1 of 3 cards from the party heroes' pools (no duplicates in one offer), or skip.

| Source | Common | Uncommon | Rare |
|---|---|---|---|
| Combat | 65% | 30% | 5% |
| Elite | 40% | 45% | 15% |
| Boss | — | — | 100% (3 rares) |

Pity: each offer without a rare raises the rare chance by +2 percentage points (max +20); reset when a rare is offered.

### 11.3 Equipment drops ⚖

| Source | Drop |
|---|---|
| Elite | 1 equipment: common 50%, uncommon 40%, rare 10% |
| Boss | 1 legendary equipment |
| Camp / shop | for sale (§4.4, §4.6) |

After the boss reward is taken, the run ends in victory.

## 12. Equipment

### 12.1 Rules (B19)

- 2 slots per hero: **weapon** (modifies that hero's card numbers) and **relic** (passive effect). Any hero can equip any item.
- Equip, unequip and reorder ranks at any time outside combat (map, reward, camp, shop, rest); unequipped items wait in the stash (max 6). Equipping from a full stash is allowed because it never grows the stash; buying or unequipping into a full stash is blocked. Reward equipment that does not fit in a full stash is lost.

### 12.2 Prototype items (8) ⚖

| Key | Name | Slot | Rarity | Effect |
|---|---|---|---|---|
| eq_notched_blade | Notched Blade | weapon | common | Owner's attacks +1 damage per hit |
| eq_heavy_pavise | Heavy Pavise | weapon | common | Owner's Block values +2 |
| eq_bone_reliquary | Bone Reliquary | relic | common | Owner +6 max HP |
| eq_ember_focus | Ember Focus | weapon | uncommon | Owner's first attack card each turn also applies 2 Burn to every enemy it hits |
| eq_votive_candle | Votive Candle | relic | uncommon | Owner −1 stress at the end of each combat |
| eq_iron_rosary | Iron Rosary | relic | uncommon | Owner gains 6 Block after the turn-1 Block reset (lasts through the first enemy phase) |
| eq_hunters_lens | Hunter's Lens | weapon | rare | Owner's first attack card each combat applies 2 Marked to every enemy it hits |
| eq_bell_clapper | Bell Clapper | relic | legendary | Once per turn, if any hero has ≥ 7 stress at the start of the turn, gain 1 energy |

## 13. Meta-progression and difficulty

### 13.1 Embers (legacy currency, B22) ⚖

`embers = 2 × roundsCleared + 5 × elitesWon + 15 × bossesWon`. Granted on victory and on defeat. Prototype: shown in the run summary and stored, not spendable.

Name "Embers" is provisional (open question Q-LEGACY-NAME).

### 13.2 Skill tree (Alpha, B21)

Per hero: 3 branches × 4 nodes, each node 10/20/35/50 Embers. Nodes only **add options**: a new card to the pool, a card variant, a starter-deck swap, or a hero variant. No flat stat bonuses (rule: options, not raw power).

### 13.3 Difficulty ladder "Rites" (Beta, B27) ⚖

Unlocked one at a time by winning at the previous Rite; cumulative.

| Rite | Rule |
|---|---|
| 1 | Elites +20% HP |
| 2 | Common enemies deal +7.5% damage (⚖ tweaked 2026-10-26 from +15% after sim-rites report) |
| 3 | Start the run with 30 gold |
| 4 | Boss +20% HP |
| 5 | Rest "Recover" heals 20% instead of 30% |
| 6 | Heroes start the run with 2 stress |
| 7 | Shop and camp prices +15% |
| 8 | Every enemy starts combat with 1 Might |
| 9 | Injury is −35% max HP |
| 10 | Boss phase 2 adds a fourth intent to its cycle |

Rite 10 fourth intents (taken from phase 1, appended to the phase-2 cycle): Bell-Maw adds Clapper 14 (front); Gilded Penitent adds Gild (15 Block, +1 Might). Rite 9's injury applies to falls taken at that Rite. Unlock: a victory at Rite n unlocks Rite n + 1 (stored in the meta profile).

Prototype: no Rites; dev-only multipliers (enemy HP, enemy damage, hero HP) exist for simulation (`bun run sim`).

## 14. Auto battle and game speed

### 14.1 Auto battle (B23)

- Toggle on the combat HUD and in Pause/Settings. Takes effect between commands; the player can take over at any time.
- It issues the **same commands** as the player through the core. It never changes rules or randomness: a seed played by auto battle gives the same result at any game speed.
- Policy (greedy, one card at a time): score each playable (card, target) pair and play the best until no card scores above 0 or energy is 0. Playing a Power card adds a flat +6 to its score.

```text
score = 100 × (kills an enemy) + damageDealt + 0.8 × min(blockGained, incomingDamageToThatHero)
      + 0.8 × min(heal, missingHP) + 2 × stressRelieved − 3 × dreadTaken + 4 × statusStacksApplied
```

- The same policy is the "greedy" bot of the simulation (`docs/sdd/`, task 4).

### 14.2 Game speed (K09)

| Speed | Effect (presentation only) |
|---|---|
| 1x | Base timings (Art Bible §feedback timings). |
| 2x | All tweens, timers and animation playback × 2. |
| 3x | × 3 and non-essential pauses skipped (min 50 ms per step). |

Speed is set in the combat HUD (cycles 1x → 2x → 3x) and in Settings (default speed). The core never reads it.

## 15. Screens, flow, HUD and controls

### 15.1 Screen flow

```text
Boot/Load → Title ("tap to begin": unlocks audio + optional fullscreen)
→ Main menu: Continue (if save) | New run | Settings | Credits
→ Party select (3 of 5, ranks) → Map → [Combat → Reward] | Rest | Shop | Boss
→ Camp (after each round except boss) → Map … → Run summary (victory/defeat, Embers) → Main menu
Pause (any time in a run): Resume | Settings | Abandon run (confirm) | Main menu (saves)
```

### 15.2 Combat HUD (layout in Art Bible)

| Zone | Content |
|---|---|
| Top bar | Round "Round 4/10", turn queue (enemy portraits by speed), gold, equipment stash button, Pause |
| Units row | Heroes H1–H3 and enemies E1–E4; per unit: sprite, HP bar + number, Block shield + number, status icons, stress pips (heroes), intent icon + number + target marker (enemies) |
| Action band | Hand (up to 10, fanned), energy orb "3/3", draw/discard/exhaust piles with counts, Auto toggle, Speed toggle, End turn |
| Detail panel | 168×120 on first tap of a card: full text, From/Target diagram, live preview numbers |

### 15.3 Controls (B30)

| Input | Action |
|---|---|
| Tap/click card | Select + open detail panel + show preview on valid targets |
| Tap/click valid target | Confirm play |
| Tap card again / tap empty space / `Esc` | Cancel selection |
| Long-press (400 ms) / right-click | Tooltip for any icon, status, intent or keyword |
| Drag card onto target (optional) | Play |
| Keys `1`–`9`, `0` | Select hand card 1–10 |
| `Tab` / arrows | Cycle valid targets |
| `Enter` | Confirm |
| `Space` | End turn |
| `A` | Toggle auto battle |
| `S` | Cycle speed |
| `Esc` (nothing selected) | Pause |

Every input gets visual feedback within 100 ms.

## 16. Narrative and tone

### 16.1 Premise (B34)

The Order of the Pale Bell guarded a cathedral-fortress built over a fissure in the world. The fissure woke. Now it is **the Rift**: a wound of bone, wax and machinery that grows downward and outward. The Order is broken; its last commander (the player) sends parties of three into the Rift to cut out its heart before it reaches the city above. Each run is one descent. No one is promised a return.

Proper nouns introduced here (Order of the Pale Bell, the Rift, Bell-Maw) must pass the web check in `.claude/rules/ip-and-tone.md` before public use (owner: coordinator, due 2026-11-02, tracked with Q-NAME-CHECK).

### 16.2 Text budget (B33)

| Text | Length | Phase |
|---|---|---|
| Intro | 3 short lines over the title art | Prototype |
| Enemy lore | 1–2 lines | Prototype |
| Card / item description | ≤ 12 words rules + optional 1-line flavour | Prototype |
| Boss epilogue | 2–3 lines on victory | Prototype |
| Events | 2–4 paragraphs + 2–3 choices | Alpha |

All player-facing text lives in `src/i18n/` (EN default, PT-BR).

## 17. Audio design

### 17.1 Prototype list (B37)

| Key | Content |
|---|---|
| `music.menu` | Slow, cold, choir pad + low strings, loop |
| `music.map` | Sparse, uneasy, bell motif, loop |
| `music.combat` | Steady tension, war drums + cello ostinato, loop |
| `music.boss` | Bell-driven, heavier percussion, loop |
| `sfx.card.*` | draw, play, exhaust, upgrade, invalid (5) |
| `sfx.hit.*` | slash, blunt, pierce, fire, multi (5) |
| `sfx.block.*` | gain, absorb, break (3) |
| `sfx.status.*` | marked, weakened, bleed, burn, ward, stun (6) |
| `sfx.stress.*` | gain, collapse, relief (3) |
| `sfx.unit.*` | hero fall, enemy death, boss phase (3) |
| `sfx.ui.*` | tap, confirm, cancel, open, close, coin, end turn (7) |
| `sfx.flow.*` | victory, defeat, reward (3) |

Total ≈ 35 SFX + 4 loops. Style sheet and loudness targets: Art Bible. The game must work with audio blocked or missing.

## 18. Save, settings and accessibility

### 18.1 Save (B26)

- Autosave to `localStorage` when entering a round and at the start of every player turn. One run slot + meta profile.
- Save has a schema version; older saves migrate; an unknown/corrupt save is offered as "start new run" (never crash).
- Resuming restores the start of the current player turn. The run seed is fixed, so reloading does not reroll anything.

### 18.2 Settings

| Setting | Values | Default |
|---|---|---|
| Language | English, Português (Brasil) | browser language if PT, else English |
| Music volume | 0–100 | 60 |
| SFX volume | 0–100 | 80 |
| Default game speed | 1x / 2x / 3x | 1x |
| Auto battle at combat start | off / on | off |
| Reduce screen shake | off / on | off |
| Reduce flashes | off / on | off |
| Fullscreen | off / on | off |

### 18.3 Accessibility (B31)

Prototype: information never by color alone (color + shape/pattern), no turn timers, reduce shake/flash, speed control, all actions reachable by keyboard. Alpha: UI text scale and colorblind-tested palette.

## 19. Fun principles and heuristics

| Principle | Concrete check in this game | Lens |
|---|---|---|
| Toy first | Playing Hack on a Husk with the number pop, shake and SFX feels good with no goal | #15 Toy |
| Meaningful choice per turn | At least 2 reasonable plays each turn; one is never always best | #32 |
| Risk you choose | Elites are optional; Dread cards trade stress for power | #33 Triangularity |
| Full information | The player can always explain why they took damage | #56 Transparency |
| Interest curve | Rounds 1–3 teach, 4 spikes (elite), 5–6 breathe (shop), 7 spikes, 8 build, 9 rest, 10 climax | #61 |
| Endogenous value | Gold, stress and HP each change a decision on the map, at camp or in combat | #5 |
| Short sessions | One act fits in 20–30 min; save at every turn | #39 Time |
| Story machine | Runs produce retellable moments: "the Confessor collapsed, Rekindle saved the Shieldbearer" | #65 |

Smells to watch (playtests and simulations): a card picked > 60% of the time, a hero never picked, a combat that runs past 8 turns, players ignoring camp, stress never reaching 10.

## 20. Prototype acceptance and playtest questions

The prototype is a success when a new player completes or fails Act 1 and wants another run. Measurable criteria:

| # | Criterion | Target |
|---|---|---|
| 1 | Act 1 time at 1x | 20–30 min (median of 5 playtests) |
| 2 | Common combat length | 3–6 turns (simulation median, greedy bot) |
| 3 | Greedy-bot Act 1 win rate | 35–60% over 1000 seeds |
| 4 | Party composition | every hero appears in ≥ 15% of winning bot parties across all 10 compositions |
| 5 | Stress | ≥ 1 Collapse in ≥ 40% of runs |
| 6 | Speed parity | identical end state at 1x/2x/3x for 100 seeds |

Playtest questions: Did you understand why you took damage? Which hero did you miss when you swapped? Did the camp offers matter? When did you feel the run turning?

## 21. Open questions

| Id | Question | Owner | Due |
|---|---|---|---|
| Q-NAME-CHECK | Trademark/domain check for "Ossuary" and the proper nouns of §16.1 | Developer | 2026-11-02 |
| Q-HERO | Personal names and 2-line backstories for the 5 heroes | Coordinator | 2026-11-02 |
| Q-LEGACY-NAME | Final name of the legacy currency (provisional "Embers") | Coordinator | 2026-11-02 |
| Q-ZOOM | Resolved by ADR 0015: 1920×1080 internal canvas, FIT scaling, camera zoom 3 | Coordinator | 2026-10-26 |
| Q-BALANCE-1 | First simulation pass on every ⚖ value of §5–§12 | Coordinator | end of prototype group "combat core" |

## 22. Alpha content (specified 2026-10-26, coordinator)

Everything here is ⚖ and enters behind the same rules as §4–§14. Act scaling of §4.3 applies to Act 2 enemies (HP × 1.5, damage × 1.3, rounded); boss HP below is final, not scaled.

### 22.1 Run flow with two acts

- After the Act 1 boss reward the camp opens, then the Act 2 map starts at row 1. Between acts every hero heals 50% of max HP and loses any injury.
- Victory = Act 2 boss defeated. The prototype flag `ACTS = 1` keeps the old flow; Alpha sets `ACTS = 2`.

### 22.2 Act 2 enemies (10)

| Key | Name | Ranks | HP | Speed | Intent cycle |
|---|---|---|---|---|---|
| vault_warden | Vault Warden | E1 | 30 | 2 | Shield Bash 7 (front) → Brace: 8 Block → Shield Bash 7 |
| bone_lancer | Bone Lancer | E1–2 | 22 | 4 | Pierce 6 to H1 and H2 → Pierce 6 to H1 and H2 → Withdraw: moves to E4 |
| censer_wraith | Censer Wraith | E2–4 | 18 | 5 | Choke 4 (lowest-HP) → Smoke: 1 Weakened to every hero |
| flesh_organ | Flesh Organ | E4 | 28 | 1 | Hymn: +1 Might to all enemies → Drone: +1 stress to every hero → Hymn |
| gutter_crawler | Gutter Crawler | E1–3 | 12 | 6 | Gnaw 3 ×2 (front) |
| relic_thief | Relic Thief | E2–3 | 20 | 7 | Cut 5 + 2 Bleed (back) → Cut 5 + 2 Bleed (back) → Vanish: 10 Block |
| mirror_saint | Mirror Saint | E3–4 | 24 | 3 | Reflect: 12 Block → Glare: 2 Marked (back) → Smite 8 (marked) |
| hollow_bishop | Hollow Bishop | E2–3 | 26 | 2 | Sermon: +2 stress (highest-stress) → Rebuke 6 (front) → Sermon |
| chain_golem | Chain Golem | E1–2 | 52 | 1 | Wind-up (telegraph) → Chain Sweep 10 to H1 and H2 → Shove 6, swaps H1 and H2 |
| rot_cherub | Rot Cherub | E2–4 | 16 | 6 | Spit 4 + 2 Bleed (lowest-HP) → Spit 4 + 2 Bleed (lowest-HP) → Hover: 6 Block |

### 22.3 Act 2 encounters, elites and boss

| Id | Pool | Enemies (E1→E4) |
|---|---|---|
| A2-1 | Tier A | gutter_crawler, gutter_crawler |
| A2-2 | Tier A | bone_lancer, censer_wraith |
| A2-3 | Tier A | vault_warden, rot_cherub |
| A2-4 | Tier A | gutter_crawler, relic_thief |
| A2-5 | Tier A | vault_warden, flesh_organ |
| B2-1 | Tier B | vault_warden, hollow_bishop, censer_wraith |
| B2-2 | Tier B | chain_golem, rot_cherub |
| B2-3 | Tier B | bone_lancer, mirror_saint, flesh_organ |
| B2-4 | Tier B | relic_thief, relic_thief, hollow_bishop |
| B2-5 | Tier B | chain_golem, gutter_crawler, mirror_saint |
| EL2-1 | Elite row 4 | vault_warden (elite, Oathwall), censer_wraith |
| EL2-2 | Elite row 7 | chain_golem (elite, Calcified), flesh_organ |
| BOSS2 | Row 10 | gilded_penitent (E1+E2) |

Boss **Gilded Penitent** (`gilded_penitent`): a giant reliquary-statue of a kneeling saint, gold leaf over rot. HP 140, Speed 3, phase 2 at HP ≤ 70 with +2 Might on entering.

| Phase | Intent cycle |
|---|---|
| 1 | Lash 12 (front) → Confession: +2 stress to every hero → Gild: 15 Block and +1 Might |
| 2 | Scourge 6 to every hero → Lash 16 (highest-stress) → Confession |

### 22.4 Event and treasure nodes

Map changes (Acts 1 and 2 in Alpha): in rows 2, 3, 5, 6 and 8 one combat node becomes an **event** with seeded chance 40%; in rows 5–6 one non-shop node becomes a **treasure** with seeded chance 35% (at most 1 treasure per act). Every node still counts as a round; each path keeps ≥ 5 combats.

Treasure: 25 gold + 1 equipment (uncommon 60%, rare 40%).

Events show every outcome before the choice (no hidden chance, P3):

| Id | Name | Choices (all outcomes shown) |
|---|---|---|
| ev_weeping_font | The Weeping Font | Drink: heal 20% max HP each hero, +2 stress each · Fill vials: +40 gold · Leave |
| ev_ossuary_shrine | Ossuary Shrine | Offer 30 gold: −3 stress each hero · Take a bone: gain a random common relic, +2 stress to the H1 hero · Leave |
| ev_chained_penitent | Chained Penitent | Free him: H1 hero loses 6 HP, choose 1 of 3 uncommon cards · Take his chain: upgrade 1 random card · Leave |
| ev_forgotten_armory | Forgotten Armory | Search: gain 1 common equipment, the lowest-HP hero loses 8 HP · Leave |
| ev_whispering_choir | Whispering Choir | Listen: remove 1 card (choose), +2 stress each hero · Leave |
| ev_ember_pilgrim | Ember Pilgrim | Trade: pay 25 gold, upgrade 2 cards (choose) · Share the fire: heal 10 HP each hero · Leave |
| ev_drowned_reliquary | Drowned Reliquary | Dive: H1 hero loses 8 HP, gain 1 common equipment · Pull the chain: the lowest-HP hero loses 5 HP, +35 gold · Leave |
| ev_bone_cartographer | Bone Cartographer | Buy a map: pay 35 gold, choose 1 of 3 uncommon cards · Sell him a page: remove 1 card (choose), +25 gold · Leave |
| ev_ashen_vigil | Ashen Vigil | Keep watch: H1 hero +3 stress, heal 15% max HP each hero · Sleep by the ashes: heal 10 HP each hero, +1 stress each · Leave |
| ev_flagellant_procession | Flagellant Procession | Walk with them: +3 stress each hero, upgrade 2 cards (choose) · Give alms: pay 20 gold, −2 stress each hero · Leave |
| ev_gravewright | The Gravewright | Bury a memory: the lowest-HP hero loses 6 HP, remove 1 card (choose) · Buy a relic: pay 45 gold, gain the common relic · Leave |
| ev_sealed_grille | Sealed Grille | Confess: H1 hero −5 stress and loses 6 HP · Listen at the grille: upgrade 2 random cards (shown), +1 stress each hero · Leave |

### 22.5 Skill tree v1 (Embers, B21)

Per hero one branch of 3 nodes, bought in order with banked Embers in a new **Legacy** screen (main menu). Nodes add options only.

| Node | Cost | Effect |
|---|---|---|
| I | 10 | Unlock card A in the hero's reward pool |
| II | 25 | Unlock card B in the hero's reward pool |
| III | 45 | Option "Veteran start": at party select the player may replace one starter Strike of this hero with card A |

New cards (10) ⚖:

| Id | Hero | Name | Cost | Type | Rarity | From | Target | Effect | + |
|---|---|---|---|---|---|---|---|---|---|
| shb_rampart | Shieldbearer | Rampart | 1 | Skill | common | H1 | all heroes | 4 Block to each hero | 6 |
| shb_riposte | Shieldbearer | Riposte | 1 | Attack | uncommon | H1 | E1 | Damage equal to half own Block + 4 | +7 |
| mrk_ricochet | Marksman | Ricochet | 1 | Attack | common | H2–3 | random | 4 damage ×2, each to a random enemy | 6 ×2 |
| mrk_deadeye | Marksman | Deadeye | 1 | Skill | uncommon | H2–3 | all | 1 Marked to every enemy | 2 Marked |
| arc_cinder_ward | Arcanist | Cinder Ward | 1 | Skill | common | any | ally | 6 Block to an ally; 2 Burn to E1 | 9 / 3 |
| arc_inferno | Arcanist | Inferno | 3 | Attack | rare | H2–3 | all | 6 damage ×3 to each enemy; Dread 3; Exhaust | 8 ×3 |
| cnf_penance | Confessor | Penance | 1 | Attack | common | H1–3 | E1–2 | 6 damage; owner −1 stress | 9 |
| cnf_last_rites | Confessor | Last Rites | 1 | Skill | uncommon | any | lowest-HP hero | Heal 10; Exhaust | 14 |
| bmb_shrapnel | Bombardier | Shrapnel | 1 | Attack | common | H2–3 | all | 3 damage to each enemy | 5 |
| bmb_flashbang | Bombardier | Flashbang | 1 | Attack | uncommon | H2–3 | all | 2 damage and 1 Weakened to each enemy | 3 / 2 |

Card A / card B per hero, in table order: Shieldbearer rampart/riposte, Marksman ricochet/deadeye, Arcanist cinder_ward/inferno, Confessor penance/last_rites, Bombardier shrapnel/flashbang.

## 23. Act 3 and the final boss (1.0 content, specified 2026-10-26)

Everything here is ⚖. Numbers below are the shipped data after the act-balance pass of 2026-10-26 (Act 3 HP × 0.75 and damage × 0.65 of the first draft, final boss 160 HP, Sanctum on): a 3-act run wins 21.3%, and Act 3 is the hardest act (clear 48.5% vs Act 2 61.4% and Act 1 71.4%; `docs/reports/2026-10-26-sim-act-balance.md`).

### 23.1 Run flow with three acts

- `ACT_RULES.acts = 3` ships. After the Act 2 boss reward the camp opens, then the Act 3 map starts at row 1; between acts every hero heals 50% of max HP and loses any injury (§22.1).
- **Sanctum** (between acts, replaces the flat 50% heal when `ACT_RULES.sanctum` is on): after every non-final boss reward, every hero loses any injury, then the player takes exactly **one** of four recoveries, then the camp opens as before:

  | Option | Effect | Needs |
  |---|---|---|
  | Rest | Every hero to full HP | — |
  | Purge | Remove 2 cards of your choice from the deck | 2 cards in the deck |
  | Temper | Upgrade 2 cards of your choice | 2 cards not upgraded yet (or as many as remain) |
  | Tithe | +60 gold | — |

  Command: `sanctumChoose { option: 'heal' | 'remove' | 'upgrade' | 'gold', cardUids? }` (`SANCTUM` in `src/data/economy.ts`). Phase `sanctum`, screen key `sanctum`, scene key `Sanctum`.
- Victory = Act 3 boss defeated; the run summary shows the final epilogue (`boss.rift_mother.epilogue`).
- Act scaling (§4.3, `ACT_RULES`): non-boss enemies get HP × (1 + 0.2 × (act − 1)) and damage × (1 + 0.1 × (act − 1)), so Act 3 is HP × 1.4 and damage × 1.2. Boss HP is final.
- Setting: **the Iron Sepulchre**, the vault under the cathedral where the Rift was first sealed and where it is born again.

### 23.2 Act 3 enemies (10)

| Key | Name | Ranks | HP | Speed | Intent cycle |
|---|---|---|---|---|---|
| iron_mourner | Iron Mourner | E1 | 27 | 2 | Toll-Hammer 6 (front) → Brace: 10 Block → Toll-Hammer 6 + 1 stress (front) |
| grave_cur | Grave Cur | E1–2 | 18 | 7 | Snap 3 ×2 (front) → Rend 3 + 3 Bleed (lowest-HP) → Snap 3 ×2 |
| ash_cantor | Ash Cantor | E3–4 | 16 | 3 | Lament: +2 stress (highest-stress) → Kindle: +1 Might to all enemies → Ember 4 (back) |
| bronze_scribe | Bronze Scribe | E2–3 | 20 | 4 | Mark the Name: 2 Marked (front) → Etch 5 (marked) → Seal: 1 Ward to every enemy |
| hollow_choir | Hollow Choir | E4 | 22 | 1 | Dirge: +1 stress to every hero → Hush: 1 Weakened to every hero → Dirge |
| sepulchre_knight | Sepulchre Knight | E1 | 36 | 2 | Wind-up (telegraph) → Execution 12 (front) → Iron Wall: 14 Block |
| wax_saint | Wax Saint | E2–4 | 15 | 5 | Drip 3 + 2 Bleed (lowest-HP) → Mend Wax: heals itself 8 → Drip |
| chain_wraith | Chain Wraith | E2–3 | 16 | 6 | Drag 3, swaps H1 and H2 (front) → Lash 4 to H1 and H2 → Fade: 8 Block, moves to E4 |
| marrow_butcher | Marrow Butcher | E1–2 | 24 | 4 | Cleave 5 to H1 and H2 → Frenzy: +2 Might → Cleave 5 to H1 and H2 |
| rift_spawn | Rift Spawn | E1–3 | 8 | 6 | Bite 2 ×2 (front) |

### 23.3 Act 3 encounters and elites

| Id | Pool | Enemies (E1→E4) |
|---|---|---|
| A3-1 | Tier A | rift_spawn, rift_spawn, ash_cantor |
| A3-2 | Tier A | iron_mourner, wax_saint |
| A3-3 | Tier A | grave_cur, bronze_scribe |
| A3-4 | Tier A | marrow_butcher, hollow_choir |
| A3-5 | Tier A | grave_cur, chain_wraith |
| B3-1 | Tier B | sepulchre_knight, bronze_scribe, ash_cantor |
| B3-2 | Tier B | iron_mourner, chain_wraith, hollow_choir |
| B3-3 | Tier B | marrow_butcher, grave_cur, wax_saint |
| B3-4 | Tier B | sepulchre_knight, rift_spawn, rift_spawn |
| B3-5 | Tier B | marrow_butcher, bronze_scribe, hollow_choir |
| EL3-1 | Elite row 4 | iron_mourner (elite, Oathwall), wax_saint |
| EL3-2 | Elite row 7 | sepulchre_knight (elite, Calcified), ash_cantor |
| BOSS3 | Row 10 | rift_mother (E1+E2) |

### 23.4 Final boss: the Rift Mother

The Rift Mother (`rift_mother`, "A Mãe da Fenda"): the wound itself grown a body, a cathedral-sized mass of bone, wax and machinery cradled in the sepulchre's iron ribs. Occupies E1+E2, HP 160 (final), Speed 3. She is the only enemy with **three phases** (allowed for the final boss only). Each phase change clears her debuffs, grants +2 Might and replaces the current intent with the new phase's first intent, shown before the player continues (§10.5); one hit that crosses both thresholds enters phase 3 directly (both banners play).

| Phase | Trigger | Intent cycle |
|---|---|---|
| 1 | start | Embrace 9 (front) → Wail: +2 stress to every hero → Coil: 15 Block |
| 2 | HP ≤ 110 | Rend the Veil 4 to every hero → Devour 12 (highest-stress) → Wail |
| 3 | HP ≤ 55 | Unmaking: 5 to every hero and +1 stress each → Devour 13 (lowest-HP) → Heartbeat: heals 15, 10 Block |

Rite 10 (§13.3) adds Embrace to her phase-2 and phase-3 cycles.

### 23.5 Epilogue (text budget §16.2)

Three short paragraphs on the victory summary: the Rift closes from the inside; the sepulchre falls silent and the Order seals it with the party's names; the last line keeps the run-based tone (the cathedral bell rings once, and no one rings it).

### 23.6 Sanctum screen (for the UI owner)

- Scene `Sanctum` (session maps the `sanctum` screen to it). Backdrop `bg.menu` dimmed 0.6, music `music.map`.
- Title (h2, gold2) "Sanctum" and one line (tiny, ash5): "Injuries are healed. Choose one blessing." Keys `sanctum.title`, `sanctum.text`.
- Four option tiles in one row (x 40 + i × 144, y 96, 128 × 160 in 640×360 space), each with a shape + colour icon (Rest: cross, rot2; Purge: X, blood2; Temper: anvil bar, gold2; Tithe: coin circle, gold2), a name (`sanctum.heal|remove|upgrade|gold`, ui) and the exact outcome under it (`sanctum.<option>Text`, tiny, wrapped to 116): e.g. "Every hero to full HP (Shieldbearer 34 → 60 …)" — the preview shows the real numbers.
- Tap a tile to select (gold frame), tap again or press its button to confirm; keys 1–4 select, Enter confirms. Purge and Temper open the existing card picker twice (second pick excludes the first; Temper lists only cards not upgraded); Back cancels without spending the choice.
- After the command the scene goes to Camp (`goNext`). Test ids: `sanctum-heal`, `sanctum-remove`, `sanctum-upgrade`, `sanctum-gold`, picker prefix `sanctum-card`.
- Shipped on (2026-10-26): `ACT_RULES.sanctum = true` with `SanctumScene` (e2e `tests/e2e/sanctum.spec.ts`). Picker titles `sanctum.pickRemove|pickUpgrade` ("Temper: choose card 1 of 2"); Back in the picker cancels the whole choice. With the Act 3 damage at 0.55 and the P2-8 hero changes, a 3-act run won 27.4% (200 runs per party, seed 1); Act 3 tuning continues in §23.7.

### 23.7 Tuning with the Sanctum (sim, 2026-10-26)

`bun run sim -- --runs 400 --seed 1` with the Sanctum on and the Act 1–2 changes committed the same day (turn-limit enrage, Rite 2 tweak, P2-8 buffs). Act clear rates are of the runs that entered the act:

| Act 3 damage (× first draft) | Win | Act 1 | Act 2 | Act 3 |
|---|---|---|---|---|
| 0.55 | 27.8% | 71.4% | 61.4% | 63.5% |
| **0.65 (shipped)** | **21.3%** | 71.4% | 61.4% | **48.5%** |
| 0.75 | 15.4% | 71.4% | 61.4% | 35.3% |

Act 2 already clears about 60%, so no Act 2 change was needed. At 0.65 every goal holds: the run wins 18–35% and Act 3 is the hardest act. Shared intent ids were split so each id has one meaning: Act 3 uses `choir_dirge`, `cur_rend`, `chain_lash`, `wraith_fade`, `wax_drip`, and the Rift Mother's phase-3 Devour is `devour_weakest`.
