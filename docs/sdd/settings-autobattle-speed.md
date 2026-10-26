# SDD-15 Settings, auto battle and game speed

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet (`src/core/ai/autoBattle.ts`); Coordinator (settings storage, speed in the view, HUD toggles) |
| Phase | PROTOTYPE |
| Depends on | SDD-01, SDD-03, SDD-11, SDD-12 |
| References | GDD §14 (auto battle policy, speed), §18.2 (settings), §18.3; Art Bible §9.3, §12.1; B23, B31, K09; `docs/web-research.md` §12.7 (speed gotchas) |

## 1. Goal

Let the developer and players speed up play: an auto battle that issues the same commands as the player using a greedy policy, a 1x/2x/3x speed that only touches presentation, and persistent settings.

## 2. Non-goals

- Smarter AI (lookahead) for auto battle; it is also the simulation's greedy bot (SDD-17).
- Speeds above 3x, slow motion.

## 3. Requirements

- R-1 Auto battle is a pure function `autoBattlePolicy(state): Command | null` in `src/core/ai`; it returns `EndTurn` when no play scores above 0 or energy is 0.
- R-2 Score per legal (card, target) pair (GDD §14.1): `100 × kills + damageDealt + 0.8 × min(blockGained, incomingDamageToThatHero) + 0.8 × min(heal, missingHP) + 2 × stressRelieved − 3 × dreadTaken + 4 × statusStacksApplied`; values come from `preview()`; ties → the card's order in hand, then target rank.
- R-3 Toggle: HUD button, `A` key, Pause and Settings ("Auto battle at combat start"); takes effect between commands; the player can take over at any time.
- R-4 Auto battle never shows a confirmation and never blocks on one.
- R-5 Speed: HUD toggle cycles 1x → 2x → 3x, `S` key, default in Settings; applied as `time.timeScale = tweens.timeScale = anims.globalTimeScale = s` in every scene `create()` (spike: `scene.restart()` resets `tweens.timeScale`).
- R-6 Speed never reaches the core; at 3x non-essential pauses are skipped with a minimum of 50 ms per step (GDD §14.2); audio is not sped up.
- R-7 Settings (GDD §18.2): language, music volume (60), SFX volume (80), default speed (1x), auto at combat start (off), reduce shake (off), reduce flashes (off), fullscreen (off); stored in `ossuary.settings.v1` with a schema version (SDD-11).
- R-8 Reduce shake sets all shakes to 0 px; reduce flashes replaces fills with outline blinks and removes full-screen flashes (Art Bible §12.1).

## 4. Design

- `src/core/ai/autoBattle.ts` (pure), `src/view/speed.ts` (`applySpeed(scene, s)`), `src/view/settings.ts` + `src/platform/storage.ts`.
- Timers in the presenter use `scene.time.delayedCall` and scene tweens only; no `Timeline` (its `timeScale` does not affect its tweens).

## 5. Acceptance criteria

- AC-1 Given 100 seeds played by the auto battle policy at 1x, 2x and 3x, then `hashState` of the final state and the hash of the event list are identical across speeds (GDD §20 #6).
- AC-2 Given a state where a play kills an enemy, then the policy chooses it over any non-killing play.
- AC-3 Given Auto is turned off between two commands, then the next command comes from the player and no command is issued twice.
- AC-4 Given speed 2x, then a 600 ms number pop lasts 300 ms ± 1 frame (scene clock).
- AC-5 Given a scene restart, then the speed is re-applied (tween progress at 3x after 1.5 s within ±5% of 3× the 1x progress).
- AC-6 Given Settings changed and the page reloaded, then all values persist.
- AC-7 Given reduce flashes on and the boss phase change, then no full-screen flash is drawn.

## 6. Edge cases

- Auto on during the enemy phase: it waits; the enemy phase finishes normally.
- Auto with no legal play but energy > 0: `EndTurn`.
- Pause while Auto is on: Auto stops issuing commands until resume.
- Speed change mid-tween: running tweens continue at the new scale (no jump).

## 7. Test strategy

- Unit: policy scoring and ties; settings migration.
- Integration: speed parity (AC-1) runs in CI with 100 seeds.
- Human QA: sections 8, 9, 18 of `docs/qa/human-qa.md`.

## 8. Verification

```sh
bun test tests/unit/ai
bun test tests/integration/speed-parity.test.ts
```
