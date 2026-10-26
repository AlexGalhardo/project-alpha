# SDD-11 Save and versioning

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet (`src/core/save.ts`: serialize, validate, migrate); Coordinator (`src/platform/storage.ts`) |
| Phase | PROTOTYPE |
| Depends on | SDD-01, SDD-02 |
| References | GDD §18.1 (save), §18.2 (settings); B26; ADR 0011 |

## 1. Goal

Never lose a run: autosave the run state when entering a round and at the start of every player turn, resume exactly at the start of that turn, migrate old saves, and survive corrupt saves, private windows, full quotas and two open tabs.

## 2. Non-goals

- Cloud saves, multiple run slots, mid-animation saves.

## 3. Requirements

- R-1 Keys in `localStorage`: `ossuary.run.v1` (one run slot), `ossuary.profile.v1` (meta, SDD-10), `ossuary.settings.v1` (SDD-15). The `v1` suffix is the key family; the schema version lives inside.
- R-2 Run save = `{ schemaVersion, gameVersion, savedAt (ISO, from platform), seed, state }`; `state` includes the RNG streams, so resuming replays nothing.
- R-3 Checkpoints: on `RoundEntered` and on `TurnStarted` (player); never mid-turn. Resume shows the start of the saved turn.
- R-4 Load path: parse JSON → validate shape at the boundary → migrate `vN → vN+1 → … → current` with pure functions → hand to the core. Unknown, corrupt or future-version saves never throw to the player: they are offered as "start new run", and a future-version save is never overwritten.
- R-5 Storage errors (private mode, quota): the game keeps running, shows a warning once, retries on the next checkpoint.
- R-6 Two tabs: each tab writes a `ownerTabId` + heartbeat key; a tab that sees another live owner switches to read-only and shows "This run is open in another tab".
- R-7 Settings and profile have their own schema versions and migrations.

## 4. Design

```typescript
// src/core/save.ts (pure)
export const SCHEMA_VERSION = 1;
export function serialize(state: RunState, meta: { gameVersion: string; savedAt: string }): string;
export function parseSave(raw: string): { ok: true; state: RunState } | { ok: false; reason: 'corrupt' | 'future' | 'invalid' };
export const MIGRATIONS: Readonly<Record<number, (old: unknown) => unknown>>; // from version n to n+1

// src/platform/storage.ts (effects)
export function writeRun(json: string): 'ok' | 'quota' | 'unavailable';
export function readRun(): string | null;
```

## 5. Acceptance criteria

- AC-1 Given a save at the start of turn 3, when the page reloads, then the combat resumes at the start of turn 3 with the same hand, energy, intents and RNG state (`hashState` equal).
- AC-2 Given a v1 save fixture and a future v2 schema, when loaded under v2, then the migration produces a state that validates and plays.
- AC-3 Given a corrupted save (truncated JSON), then the menu shows "Continue" disabled with a message, and "New run" works; no exception reaches the console as uncaught.
- AC-4 Given a save with `schemaVersion` greater than current, then it is not loaded and not overwritten.
- AC-5 Given `localStorage.setItem` throwing `QuotaExceededError`, then the game continues and shows one warning.
- AC-6 Given the run open in tab A, when tab B opens it, then tab B is read-only and never writes.
- AC-7 Given save/load round-trip over 100 random states, then `parseSave(serialize(s))` deep-equals `s`.

## 6. Edge cases

- Saving during the boss phase change: checkpoint is at turn start, so the phase is already in the state.
- Clock skew: `savedAt` is informational only; never used in logic.
- Very old fixture versions are kept in `tests/fixtures/saves/` forever.

## 7. Test strategy

- Unit: serialize/parse round-trip, migrations, validation (core).
- Integration: platform storage with a fake `Storage` (quota, unavailable, two tabs).
- E2E smoke: reload mid-combat (Playwright, end of phase).
- Human QA: section 20 of `docs/qa/human-qa.md`.

## 8. Verification

```sh
bun test tests/unit/save
bun test tests/integration/storage.test.ts
```
