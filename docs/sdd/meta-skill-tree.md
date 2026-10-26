# SDD-20 Meta skill tree v1 and Legacy screen

| Field | Value |
|---|---|
| Status | Implemented in core and view (2026-10-26); review pending |
| Owner | Sonnet (core), Coordinator (view and scene) |
| Phase | ALPHA |
| Depends on | SDD-10 (Embers tally), SDD-11 (save), SDD-04 (card pools) |
| References | GDD §22.5 (tree v1, new cards, costs), §13 (Embers), B21; `.claude/rules/game-design.md` (options, not raw power) |

## 1. Goal

Let the player spend banked Embers on a per-hero skill tree in a Legacy screen on the main menu. Nodes only add options: a card in the reward pool, a card for the Veteran start. Nothing carries raw stats between runs.

## 2. Non-goals

- Stat bonuses of any kind (HP, damage, energy, stress) between runs.
- Refunds, respec, or reordering nodes.
- Rites (Beta) and the difficulty ladder.
- Changing the run save format (the profile is a separate store).

## 3. Requirements

- R-1 Each hero has one branch of 3 nodes, bought in order. Costs are `TREE.nodeCosts = [10, 25, 45]` (`src/data/meta.ts`).
- R-2 Node I unlocks card A, node II unlocks card B, both in that hero's reward pool. Node III unlocks the Veteran start for that hero.
- R-3 Veteran start: at party select, a hero with node III starts with card A in place of one starter Strike. GDD §22.5 says the player may choose; the current build applies it to every eligible picked hero with no choice (gap, see §9).
- R-4 Banked Embers are added once per run seed (`bankRun`). Re-saving the same summary never adds Embers twice.
- R-5 The profile is stored under the key `ossuary.profile.v1`, separate from the run save. A corrupt or missing profile loads as empty, field by field.
- R-6 Buying a node with too few Embers, or past node III, changes nothing.

## 4. Design

Files:

- `src/data/meta.ts`: `TREE` (costs, cards per hero: shieldbearer `shb_rampart`/`shb_riposte`, marksman `mrk_ricochet`/`mrk_deadeye`, arcanist `arc_cinder_ward`/`arc_inferno`, confessor `cnf_penance`/`cnf_last_rites`, bombardier `bmb_shrapnel`/`bmb_flashbang`).
- `src/core/meta.ts`:
  - `Profile { version: 1; embers; nodes: Record<HeroClass, 0..3>; banked: number[] }`.
  - `emptyProfile()`, `parseProfile(unknown)`.
  - `bankRun(p, seed, amount)`: pure; keeps the last 50 seeds.
  - `nextNodeCost(p, hero)`, `buyNode(p, hero)`: pure; returns `p` unchanged when unaffordable or full.
  - `unlockedCards(p)`: cards from owned nodes I and II.
  - `canVeteran(p, hero)`: node III owned.
  - `applyMeta(state, p, veteran[])`: returns a new `RunState`; sets `s.unlocked`; swaps the first starter Strike of each eligible veteran hero for card A.
- `src/view/profile.ts`: `loadProfile()` / `saveProfile()` on `ossuary.profile.v1` through `src/platform/storage`.
- `src/scenes/LegacyScene.ts`: shows Embers, the three nodes per hero, buy buttons, and a locked/owned/buy state per node. Saves through `saveProfile`.
- `src/scenes/SummaryScene.ts`: calls `bankRun(loadProfile(), seed, embers)` and saves.
- `src/scenes/PartyScene.ts`: calls `applyMeta` with every picked hero that has node III. The label key `party.veteran` exists but no toggle is drawn yet.

Strings: `legacy.*`, `menu.legacy`, `party.veteran` in `src/i18n/en.ts` and `pt-BR.ts`. Card names and texts for the 10 new cards are in `card.<id>`.

## 5. Acceptance criteria

- AC-1 Given an empty profile, when `buyNode` is called for a hero with 10 Embers, then `embers` is 0 and that hero has 1 node. When it is called again with 0 Embers, then nothing changes.
- AC-2 Given a profile with node I for a hero, when a new run starts, then `unlockedCards` contains that hero's card A and not card B.
- AC-3 Given node III for a hero, when `applyMeta` runs with that hero in `veteran`, then the first starter Strike of that hero is card A in the new run. Without node III, the deck is unchanged.
- AC-4 Given a run seed already in `banked`, when `bankRun` is called again with that seed, then the profile is unchanged.
- AC-5 Given the stored text `not json`, when `loadProfile` runs, then it returns `emptyProfile()`.
- AC-6 Given `embers: -4` or `nodes.marksman: 9` in stored data, when `parseProfile` runs, then embers is 0 and marksman's node count is clamped to 0..3.
- AC-7 Given a finished run, when the summary is shown, then the profile in storage gains the run's Embers exactly once.

## 6. Edge cases

- Same seed played twice: the second run banks nothing (R-4).
- A veteran hero that has fallen before the first combat: the swap still applies to the deck; the hero's cards grey out in combat as usual.
- Buying node III with exactly 45 Embers leaves 0.
- Profile written by a future version: `parseProfile` does not check `version`; it reads the v1 fields. Decide before Beta whether a newer version must be left untouched.

## 7. Test strategy

- Unit: `tests/unit/meta.test.ts` covers AC-1 to AC-6 with pure functions.
- Unit: `tests/unit/run.test.ts` covers the tally rules (SDD-10).
- E2E: `tests/e2e/legacy.spec.ts` ("Legacy: banked Embers buy skill-tree nodes and persist") buys nodes with banked Embers and checks they persist across reload. It does not yet cover the Veteran start or AC-7 through a played run.
- Manual: option wording and layout on V4 (human QA items for Legacy).

## 8. Verification

```bash
bun test tests/unit/meta.test.ts
bun test tests/unit/run.test.ts
bunx playwright test tests/e2e/legacy.spec.ts --project=desktop-1280x720
bun run ci
```

## 9. Open gaps

- R-3 choice: the Veteran start is applied without a player choice (PartyScene). GDD §22.5 expects the player to pick the swap. Route to the coordinator.
- AC-7 through a full run is not covered by e2e yet.
