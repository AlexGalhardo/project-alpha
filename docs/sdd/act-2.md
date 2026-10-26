# SDD-22 Act 2 content

| Field | Value |
|---|---|
| Status | Data present in `src/data/enemies.ts` and `src/data/economy.ts` (2026-10-26); behaviour under review; Sonnet implementing the remainder |
| Owner | Sonnet (data and core), Coordinator (scene flow) |
| Phase | ALPHA |
| Depends on | SDD-06 (enemies and intents), SDD-07 (map and run), SDD-09 (heroes and equipment) |
| References | GDD §22.1 (run flow), §22.2 (ten enemies), §22.3 (encounters, elites, boss), §4.3 (act scaling); Art Bible §7 (enemy sprites, Alpha), `.claude/rules/ip-and-tone.md` |

## 1. Goal

Make Act 2 playable: a second act with ten new enemies, the Gilded Penitent boss, elite and normal encounter tables, and the act transition with a partial heal. Victory is Act 2's boss.

## 2. Non-goals

- Acts 3 and beyond (Beta).
- New heroes or hero variants (Alpha variants are a separate spec).
- New art. Act 2 enemies use placeholder sprites until the Alpha art batch.
- Balance of Act 2 numbers beyond the GDD values (balance pass: `scripts/sim.ts`, SDD-17).

## 3. Requirements

- R-1 Between acts every hero heals 50 % of max HP and loses injuries (`ACT_RULES.betweenActHealPct = 50`).
- R-2 Act 2 non-boss enemies scale: HP × 1.5, damage × 1.3, rounded (`ACT_RULES.hpPerAct`, `dmgPerAct`, GDD §4.3).
- R-3 The ten enemies of GDD §22.2 exist with their keys, names, ranks, HP, speed and intent cycles: `vault_warden`, `bone_lancer`, `censer_wraith`, `flesh_organ`, `gutter_crawler`, `relic_thief`, `mirror_saint`, `hollow_bishop`, `chain_golem`, `rot_cherub`.
- R-4 Encounters: tier A `A2-1`…`A2-5`, tier B `B2-1`…`B2-5`, elite row 4 `EL2-1`, elite row 7 `EL2-2`, boss `BOSS2` (row 10), per GDD §22.3.
- R-5 Boss `gilded_penitent`: HP 140, speed 3, phase 2 at HP ≤ 70 with +2 Might on entering. Phase 1 cycle: Lash 12 → Confession → Gild. Phase 2: Scourge 6 to every hero → Lash 16 → Confession.
- R-6 Victory is the Act 2 boss (`ACT_RULES.acts` set to 2 for Alpha). Before Alpha, the prototype flag keeps Act 1 as the end of the run (GDD §22.1).
- R-7 Intent ids used by Act 2 are the 25 in GDD §22.2–22.3; `shove` already exists with the same meaning.
- R-8 Display: every new enemy, the boss and each intent have `enemy.<key>.name`/`lore`, `boss.<key>.name`/`epilogue`/`phase2`, and `intent.<id>` in EN and PT-BR.

## 4. Design

Files:

- `src/data/enemies.ts`: the ten enemies, the boss, the encounter ids, elites (`EL2`).
- `src/data/economy.ts`: `ACT_RULES` (`acts`, `betweenActHealPct`, `hpPerAct`, `dmgPerAct`).
- `src/core/run.ts`: `startNextAct(s)` increments `s.act`, regenerates the map, clears the cursor. Called after the Act 1 boss reward when `s.act < ACT_RULES.acts`. Victory when the boss of the last act is defeated (`run.ts` boss branch).
- `src/core/map.ts`: encounter selection per tier, now including `A2`/`B2`/`EL2` ids for act 2.
- i18n: `enemy.*`, `boss.gilded_penitent.*`, `intent.*`, `act.transition` ("The descent continues. Act {act}.").

## 5. Acceptance criteria

- AC-1 Given an Act 1 boss reward taken, when the next node is entered, then `s.act` is 2, the map is regenerated and the party has 50 % of max HP healed with no injuries (rounding not specified in GDD §22.1; decide and test).
- AC-2 Given an Act 2 non-boss enemy, when combat starts, then its HP is `round(base × 1.5)` and its damage is `round(base × 1.3)`.
- AC-3 Given the ten enemy keys, when the data test runs, then each key exists, its intent cycle matches GDD §22.2, and no key is missing from i18n.
- AC-4 Given the boss at HP ≤ 70, when the boss acts, then phase 2 starts, +2 Might is applied to the boss, and phase 2's intent cycle replaces phase 1's.
- AC-5 Given the Act 2 boss defeated, when the reward resolves, then the run ends in victory (not a new act).
- AC-6 Given `ACT_RULES.acts` = 1, when the Act 1 boss is defeated, then the run ends as in the prototype.

## 6. Edge cases

- The Act 1 boss reward: GDD §22.1 puts the camp before the Act 2 map. `run.ts:444` calls `startNextAct` right after a boss in act 1; whether the camp opens first is not verified.
- Hollow Bishop's "highest-stress" and Chain Golem's "Shove swaps H1 and H2" depend on the party state at the moment the intent resolves; the intent is shown with its target before the player acts.
- Withdraw (bone_lancer) moves the enemy to row E4; if row E4 is occupied, the move is expected to be refused (not verified).
- Gilded Penitent phase 2 at exactly HP 70: the switch happens (≤ 70).
- Elite Oathwall and Calcified traits on EL2 enemies follow the elite rules of SDD-06.

## 7. Test strategy

- Unit: encounter tables and enemy data (`tests/unit/combat.test.ts`, `tests/unit/run.test.ts`). Act 2 cases to add: AC-1, AC-2, AC-4, AC-5.
- E2E: `tests/e2e/full-act.spec.ts` covers Act 1 only; an Act 2 bot run is a follow-up.
- Balance: `bun run sim` before and after, with a report in `docs/reports/` (rules in `.claude/rules/game-design.md`).
- Manual: Act 2 enemy legibility on V4 (placeholders).

## 8. Verification

```bash
bun test tests/unit/combat.test.ts
bun test tests/unit/run.test.ts
bun test tests/unit/i18n.test.ts
bun run sim
bun run ci
```

## 9. Current state and gaps

- `ACT_RULES.acts` is 2 in `src/data/economy.ts`. GDD §22.1 says prototype builds use `ACTS = 1` and Alpha sets 2. The code is on Alpha behaviour now. Decide with the coordinator whether the prototype build should keep 1.
- The boss phase-2 banner for the Penitent uses `boss.gilded_penitent.phase2` ("THE GILT SPLITS"). Scenes must read the per-boss key; the generic `boss.phase2` remains as fallback.
- No Act 2 e2e test yet.
