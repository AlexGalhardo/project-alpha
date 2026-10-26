# SDD-05 Status and stress

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet |
| Phase | PROTOTYPE |
| Depends on | SDD-03 |
| References | GDD §6.1 (8 statuses), §7 (stress, Collapse), §4.5 (Pray), §4.4 (Vigil); Art Bible §5, §7.3, §12.1 |

## 1. Goal

Implement the 8 statuses with exact stacking and decay, and the 0–10 stress track with Collapse, sources and relief.

## 2. Non-goals

- Status icons and VFX (Art Bible).
- Relationships, afflictions, virtues (Beta ideas).

## 3. Requirements

- R-1 Statuses and rules exactly as GDD §6.1: Block, Might, Marked, Weakened, Bleed, Burn, Ward, Stunned (enemies only).
- R-2 Timing: Bleed ticks at the start of the owner's turn then −1; Burn ticks at the end of the owner's turn then N = floor(N/2); Marked/Weakened −1 at the end of the owner's turn; Block resets at the start of the owner's turn; Might lasts the combat.
- R-3 Ward N negates the next N applications of Marked, Weakened, Bleed, Burn or Stunned; each negation consumes 1 and emits `StatusNegated`.
- R-4 Stunned: the enemy skips its next action, then is immune to Stun for its following action.
- R-5 All statuses clear at the end of combat (stress does not).
- R-6 Stress: integer 0–10 per hero, persists across rounds, starts at 0 each run.
- R-7 Sources (GDD §7.2): Terror intents +1/+2, Dread N on play, ally falls +2 to each other hero, boss Toll +2 to every hero.
- R-8 Relief: Rest Pray −5 each hero; Camp Vigil −3 one hero (12 gold); Confessor cards; combat won with no fall −1 each hero; Votive Candle −1 at end of combat.
- R-9 Collapse: when a hero's stress reaches 10, add one pending Collapse (−1 energy at the start of the next player turn) and set that hero's stress to 5; several Collapses in one turn stack; energy min 0.
- R-10 Stress gain is clamped at 10 before Collapse resolves; overflow is lost.

## 4. Design

- `src/core/combat/status.ts`: `applyStatus(unit, status, n)`, `tick(unit, phase)`, `clearCombatStatuses(unit)`.
- `src/core/combat/stress.ts`: `gainStress(hero, n)`, `relieveStress(hero, n)`, `resolveCollapses(state)`.
- Events: `StatusChanged{unit, status, from, to}`, `StatusNegated`, `StressChanged{hero, from, to, source}`, `Collapsed{hero}`.

## 5. Acceptance criteria

- AC-1 Given Bleed 3 at turn start, then HP −3 and Bleed 2; after three turns Bleed is 0 and removed.
- AC-2 Given Burn 5 at end of turn, then HP −5 and Burn 2; next end of turn HP −2 and Burn 1; then −1 and 0.
- AC-3 Given Ward 1 and an incoming Marked 2, then Marked stays 0, Ward becomes 0, and one `StatusNegated` is emitted.
- AC-4 Given an enemy Stunned before its action, then it skips that action; given a second Stun applied right after, then it acts normally on its next action.
- AC-5 Given a hero at 9 stress who plays a Dread 2 card, then stress becomes 10 → Collapse → 5, and next turn energy is 2.
- AC-6 Given two heroes collapsing in the same enemy phase, then next turn energy is 1.
- AC-7 Given a won combat with no fall, then every hero's stress −1 (min 0).
- AC-8 Given Pray at rest with stresses 7, 2, 10→5, then they become 2, 0, 0.

## 6. Edge cases

- Stress relief at 0 stays 0; Vigil on a hero at 0 still costs gold (the UI warns; the core allows it).
- Marked and Weakened on the same attacker/target both apply (multiplicative, then floor once).
- Stun on the boss works (no immunity besides the post-skip rule).
- A hero who falls keeps their stress value; they return with it next round.

## 7. Test strategy

- Unit: one test per status rule and each AC; stress clamp and Collapse stacking.
- Property: no status stack is negative; stress always in [0, 10].
- Simulation (SDD-17): "≥ 1 Collapse in ≥ 40% of runs" (GDD §20 #5).

## 8. Verification

```sh
bun test tests/unit/status
bun test tests/unit/stress
```
