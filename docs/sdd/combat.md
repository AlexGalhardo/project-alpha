# SDD-03 Combat

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet |
| Phase | PROTOTYPE |
| Depends on | SDD-01, SDD-02, SDD-04, SDD-05, SDD-06 |
| References | GDD §5 (combat rules), §5.5 (formulas), §5.6 (falling), §5.7 (duration), §19; `.claude/rules/game-design.md` (invariants) |

## 1. Goal

Implement the combat loop in the pure core: board with 3 hero ranks and up to 4 enemy ranks, team turn with one hand, energy, enemy phase in turn-queue order, guaranteed hits with exact previews, damage/Block/heal formulas, falling and injury, victory and defeat.

## 2. Non-goals

- Card list and pile rules (SDD-04), status ticking details (SDD-05), enemy intent cycles and targeting (SDD-06).
- Any animation or timing (the view does that from events).

## 3. Requirements

- R-1 Board: heroes `H1` (front) to `H3`; enemies `E1` (front) to `E4`; the boss occupies `E1+E2`; each unit occupies its ranks exclusively; empty ranks collapse forward after a death or fall (GDD §5.1).
- R-2 Start of player turn, in this order: hero Block → 0 (unless a "keep Block" effect), start-of-turn statuses tick, energy = 3 − pending Collapses (min 0), draw 5 (GDD §5.2).
- R-3 Player phase: any legal `PlayCard` while energy ≥ cost; `EndTurn` ends it. Cards of fallen heroes and cards whose owner stands outside **From** are illegal.
- R-4 End turn: discard hand except Retain; end-of-turn statuses tick for heroes.
- R-5 Enemy phase: turn queue = living enemies sorted by Speed descending, ties → lower rank first; each enemy, in order: its Block → 0, then performs its revealed intent, then its end-of-action ticks.
- R-6 After the enemy phase every living enemy reveals its next intent (SDD-06); then a new player turn starts.
- R-7 Damage: `hitDamage = floor((base + attackerMight) × (target.Marked ? 1.5 : 1) × (attacker.Weakened ? 0.75 : 1))`; Block absorbs first; Bleed and Burn ignore Block; multi-hit applies per hit (GDD §5.5).
- R-8 Healing never exceeds max HP; fallen heroes cannot be healed (except Rekindle).
- R-9 No randomness decides whether an attack hits; there is no hit, dodge or crit chance anywhere (invariant).
- R-10 A hero at 0 HP falls: removed from its rank (collapse), cards unplayable, each other hero +2 stress (GDD §5.6). All party heroes fallen → `RunLost`.
- R-11 All enemies dead → `CombatWon`, then rewards (SDD-08). Fallen heroes return next round at 1 HP with Injury −25% max HP (floor), not stacking.
- R-12 Every `PlayCard` has an exact `preview` (SDD-01 R-5) listing per target: hitDamage, Block absorbed, resulting HP/Block, statuses applied.
- R-13 Events emitted (minimum): `TurnStarted`, `CardDrawn`, `EnergyChanged`, `CardPlayed`, `DamageDealt`, `BlockGained`, `Healed`, `StatusChanged`, `UnitMoved`, `HeroFell`, `EnemyDied`, `IntentRevealed`, `EnemyActed`, `TurnEnded`, `CombatWon`, `RunLost`.

## 4. Design

- `src/core/combat/turn.ts` (phases), `damage.ts` (formulas), `board.ts` (ranks, collapse, push/pull/swap), `fall.ts`.
- Numbers (energy 3, draw 5, +2 stress on fall, −25% injury) live in `src/data/rules.ts` (ADR 0008).
- `CombatState { heroes, enemies, piles, energy, turn, phase, pendingCollapses, queue }`.

## 5. Acceptance criteria

- AC-1 Given a hero with Might 2 attacking a Marked enemy with base 6 while Weakened, when the hit resolves, then hitDamage = floor((6 + 2) × 1.5 × 0.75) = 9.
- AC-2 Given an enemy with 5 Block taking a 9-damage hit, then Block becomes 0 and HP drops by 4; given Bleed 3 on a unit with 10 Block, then HP drops by 3 and Block stays 10.
- AC-3 Given enemies with Speeds 2 (E1), 6 (E2), 2 (E3), when the queue is built, then the order is E2, E1, E3.
- AC-4 Given a pending Collapse, when the next player turn starts, then energy is 2; with 4 pending, energy is 0.
- AC-5 Given H2 falls, then H3 moves to H2's rank, H2's cards are unplayable, and each remaining hero gains 2 stress.
- AC-6 Given all three heroes at 0 HP, then exactly one `RunLost` event is emitted and no further turn starts.
- AC-7 Given a combat won with a fallen hero, when the next round starts, then that hero has HP 1 and max HP = floor(original × 0.75); a second fall keeps −25% (no stacking).
- AC-8 Given 1000 random legal plays over 50 seeds, then `preview(S, C)` equals `apply(S, C).events` for every play.
- AC-9 Given a target that moves before an enemy acts, then the intent retargets by its rule and an `IntentRevealed` (updated) event precedes the action.

## 6. Edge cases

- The last enemy dies from Burn at the end of the hero turn: combat ends before the enemy phase.
- A hero falls during the enemy phase while other enemies still have intents targeting it: intents retarget (SDD-06).
- Push into an occupied rank swaps the two units; Push beyond E4 does nothing more (no error).
- The boss occupies two ranks: Push/Pull on the boss does nothing; Splash next to the boss hits the adjacent unit once.
- Energy never goes negative; costs of 0 are playable with 0 energy.
- Healing a hero at full HP emits `Healed` with amount 0 only if the preview showed it (consistency), otherwise no event.

## 7. Test strategy

- Unit (test-first): formulas (AC-1, AC-2), queue (AC-3), Collapse energy (AC-4), fall/collapse ranks (AC-5, AC-6, AC-7).
- Property: preview = apply (AC-8); no event value is NaN or negative HP.
- Integration: full Act 1 combats with the greedy policy for 100 seeds; zero thrown errors.
- Simulation: duration targets (GDD §5.7) checked in SDD-17, not in unit tests.

## 8. Verification

```sh
bun test tests/unit/combat
bun test tests/integration/combat.test.ts
bun run sim -- --seeds 100 --policy greedy
```
