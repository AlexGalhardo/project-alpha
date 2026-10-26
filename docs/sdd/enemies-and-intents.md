# SDD-06 Enemies and intents

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet |
| Phase | PROTOTYPE |
| Depends on | SDD-03, SDD-05 |
| References | GDD §10 (intent rules, 10 enemies, encounters, elites, boss), §5.4 (targeting); Art Bible §7.1, §7.3, §12.1 |

## 1. Goal

Implement enemy definitions, fixed intent cycles with a seeded start, intent display data, targeting rules with retargeting, elites (stat multipliers + trait) and the two-phase boss, so the player can always see what will happen before deciding.

## 2. Non-goals

- Utility-AI enemies, hidden intents (forbidden by the invariants).
- Act 2–3 enemies (Alpha/Beta).

## 3. Requirements

- R-1 Enemy data (GDD §10.2): key, HP, Speed, allowed ranks, intent cycle (ordered list of actions).
- R-2 The cycle start index is drawn from the `combat` stream per enemy at combat start; then the cycle advances by one per action.
- R-3 Intent display: icon id, exact numbers after modifiers (Might, Weakened, target Marked), target hero(es); revealed at combat start and at the end of each enemy phase.
- R-4 Targeting rules: `front` (front-most hero in reach), `back` (H3 else front-most), `highest-stress`, `lowest-HP`, `marked` (a Marked hero else front-most), `all`, explicit ranks (e.g. "H1 and H2"). Ties → front-most.
- R-5 Taunt overrides every single-target intent until the start of the next player turn.
- R-6 Retarget: if the target falls or moves before the enemy acts, the intent recomputes by its rule and emits an updated `IntentRevealed` before acting; numbers in the display always equal the damage dealt.
- R-7 Elites (GDD §10.4): HP × 1.75 (round), every damage number × 1.25 (round), trait (Oathwall, Calcified), `elite: true` flag for the view (aura).
- R-8 Boss Bell-Maw: HP 160, Speed 3, ranks E1+E2; phase 2 when HP ≤ 80 checked after each hit; on entering: remove its debuffs, +2 Might, emit `BossPhaseChanged`, replace the current intent with phase 2's first intent immediately.
- R-9 Encounters (GDD §10.3): tables A1–A4, B1–B5, EL1, EL2, BOSS; selection rule in SDD-07.

## 4. Design

- `src/data/enemies.ts`, `src/data/encounters.ts`.
- `src/core/enemies/intent.ts` (`currentIntent`, `advance`, `displayIntent`), `targeting.ts`, `elite.ts`, `boss.ts`.
- Intent ids map to Art Bible icons: `attack`, `block`, `buff`, `debuff`, `stress`, `push_pull`, `unknown`, `phase`.

## 5. Acceptance criteria

- AC-1 Given Graft Hound with start index 1, then its intents are Rend 3 + 3 Bleed → Lunge 7 → Lunge 7 → Rend …
- AC-2 Given Ash Acolyte's Kindle resolved (+1 Might to all enemies), then the next displayed Ash Strike shows 7.
- AC-3 Given Wax Mourner's Dirge and hero stresses 3, 6, 6 in H1, H2, H3, then the target is H2 (highest stress, tie → front-most).
- AC-4 Given Ossified Brute intends Crush 16 on H1 and the Shieldbearer plays Taunt from H1, then the target stays H1; if H1 falls before Crush, then Crush retargets to the new front-most and the displayed number updates before resolving.
- AC-5 Given elite Rust Templar, then HP = 60 (34 × 1.75 = 59.5 → 60) and Cleave = 10 (8 × 1.25); Oathwall gives every other enemy 5 Block when it gains Block.
- AC-6 Given elite Ossified Brute taking a 1-damage hit, then it loses 1 HP (Calcified min 1); a 9-damage hit → 7.
- AC-7 Given Bell-Maw at 85 HP hit for 10, then phase 2 starts after that hit, its debuffs are removed, Might +2, and the displayed intent becomes Peal 5 (+2 = 7) to every hero.
- AC-8 Given any intent displayed with number N against target T, when it resolves without any state change in between, then the damage dealt to T equals N minus T's Block.

## 6. Edge cases

- `back` with only one hero alive targets that hero.
- Rift Stalker's Fade moves to E4 while E4 is occupied: swap.
- An enemy Stunned during its cycle does not advance the cycle (skipped action is not consumed) — decided here; record in GDD if changed.
- Multi-target intents (Cleave H1 and H2) with only one hero alive hit that hero once.
- Boss phase threshold crossed by Burn/Bleed ticks also triggers phase 2.

## 7. Test strategy

- Unit: each enemy cycle; each targeting rule; elite rounding; boss phase transition.
- Property: AC-8 over 200 seeds of random play (displayed = dealt).
- Integration: each encounter table spawns valid ranks.

## 8. Verification

```sh
bun test tests/unit/enemies
bun test tests/integration/intent-honesty.test.ts
```
