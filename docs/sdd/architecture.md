# SDD-01 Architecture

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Coordinator (layers and wiring); Sonnet (`src/core`, `src/data`); Haiku (`src/i18n`) |
| Phase | STRUCTURE |
| Depends on | — |
| References | GDD §3, §14; ADR 0005 (command/event core), 0006 (PRNG), 0007 (immutability), 0008 (data modules), 0009 (i18n), 0012 (layer boundary test), 0013 (scale) |

## 1. Goal

Fix the layers, the file layout and the single data flow of the game: the player (or the auto battle policy) issues a **command**, the pure core returns a **new state and a list of events**, the view animates the events. Nothing else changes game state.

## 2. Non-goals

- No ECS, no game state inside Phaser scenes or the Phaser registry.
- No networking, no server.
- No new dependency (Immer, i18n libraries, lint plugins).

## 3. Requirements

- R-1 `src/core/` is pure and deterministic: it imports only `src/core/**` and `src/data/**`; no `phaser`, DOM, `Math.random`, `Date`, `performance.now`, timers, or `src/i18n` (ADR 0012).
- R-2 The only state transition is `apply(state, command): { state, events }`.
- R-3 State is immutable from the outside (ADR 0007): `apply` never mutates its input. Inside `apply`, helpers may mutate a private working copy (`Ctx`, made with `structuredClone`) that is returned as the new state.
- R-4 `legalCommands(state)` lists every command the player may issue; `apply` rejects any other command with a `CommandRejected` event and an unchanged state.
- R-5 `preview(state, command)` returns the events `apply` would emit, without changing anything; the UI preview is built from it.
- R-6 Events carry final values (damage after modifiers, resulting HP, ids); the view never recomputes a rule.
- R-7 The core returns text **ids**, never text; `src/i18n` turns ids into strings in the view.
- R-8 Game speed, animation and audio never reach the core (GDD §14.2).
- R-9 The app controller owns the current state, persists it (SDD-11) and feeds events to the presenter in order; input is blocked while the presenter animates, except Pause and Auto toggles.

## 4. Design

### 4.1 Layout and ownership

```text
src/
├── main.ts              Phaser.Game config (pixelArt, Scale.NONE, 640×360, zoom from platform/zoom.ts)
├── core/                Sonnet  pure rules (current files on 2026-10-26: types, rng, ops, cards, combat, map, rewards)
│   ├── types.ts         RunState, CombatState, HeroState, Enemy, Command, DomainEvent unions
│   ├── rng.ts           seeded PRNG + streams (SDD-02)
│   ├── ops.ts           shared helpers over a working copy (Ctx): damage, Block, statuses, heal
│   ├── cards.ts         card values, targets, playability, resolution (SDD-04)
│   ├── combat.ts        turn, queue, intents, enemy phase, falling (SDD-03, SDD-05, SDD-06)
│   ├── map.ts           map generation, encounter selection (SDD-07)
│   ├── rewards.ts       gold, card offers, pity, drops, camp, rest, shop (SDD-08)
│   ├── apply.ts         apply(state, cmd) -> { state, events }, legalCommands(), preview() (to add)
│   ├── ai.ts            autoBattlePolicy(), sim policies (SDD-15, SDD-17) (to add)
│   └── save.ts          serialize / migrate / validate (SDD-11) (to add)
├── data/                Sonnet  cards, economy, enemies, equipment, heroes (+ index)
├── i18n/                Haiku   en.ts (source), pt-BR.ts (typed as en)
├── scenes/              Coordinator  Boot, Title, Menu, PartySelect, Map, Combat, Reward, Camp, Shop, Rest, Pause, Settings, Summary
├── view/                Coordinator  presenter, components (CardView, UnitView, IntentView, HUD), placeholders, palette, ui
└── platform/            Coordinator  storage (localStorage), zoom, audio unlock, fullscreen, clock
tests/
├── unit/                bun test: core rules, data integrity, i18n parity, layer boundary
├── integration/         whole runs by seed, save round-trip, speed parity
├── smoke/               Playwright smoke (`boot.spec.ts`; config recreated in STRUCTURE)
└── e2e/                 Playwright flows (end of phase)
scripts/                 ci.ts, release.ts, sim.ts (Sonnet), assets/* (Coordinator)
```

### 4.2 Data flow

```text
input (tap / key)            autoBattlePolicy(state)
        └──────────► Command ◄───────────┘
                       │  app.dispatch(cmd)
                       ▼
     core.apply(state, cmd) → { state', events[] }        pure, seeded
                       │
     app: keep state', autosave if checkpoint, hand events to the presenter
                       ▼
     view/presenter: animate events in order at game speed s (tweens, tints, VFX, SFX)
                       ▼
     queue empty → unlock input or ask the policy for the next command
```

### 4.3 Core signatures

```typescript
export type Command =
  | { readonly kind: 'StartRun'; readonly seed: number; readonly party: readonly HeroId[] }
  | { readonly kind: 'ChooseNode'; readonly nodeId: NodeId }
  | { readonly kind: 'PlayCard'; readonly cardUid: CardUid; readonly target: TargetRef }
  | { readonly kind: 'EndTurn' }
  | { readonly kind: 'TakeReward'; readonly choice: RewardChoice }
  | { readonly kind: 'Buy'; readonly offerId: OfferId }
  | { readonly kind: 'RestChoice'; readonly option: 'recover' | 'temper' | 'pray'; readonly cardUid?: CardUid }
  | { readonly kind: 'SwapHero'; readonly out: HeroId; readonly in: HeroId }
  | { readonly kind: 'ReorderRanks'; readonly order: readonly HeroId[] }
  | { readonly kind: 'Equip'; readonly hero: HeroId; readonly itemUid: ItemUid }
  | { readonly kind: 'LeaveNode' };

export function apply(state: RunState, cmd: Command): { readonly state: RunState; readonly events: readonly DomainEvent[] };
export function legalCommands(state: RunState): readonly Command[];
export function preview(state: RunState, cmd: Command): readonly DomainEvent[];
```

## 5. Acceptance criteria

- AC-1 Given any file in `src/core/`, when the layer boundary test runs, then it fails on an import of `phaser`, `src/scenes`, `src/view`, `src/platform` or `src/i18n`, and on any use of `Math.random`, `Date`, `performance.now`, `setTimeout`, `setInterval`.
- AC-2 Given a state S and a legal command C, when `apply(S, C)` runs, then S is deep-equal to a snapshot taken before the call (no mutation).
- AC-3 Given a state S and a command not in `legalCommands(S)`, when `apply` runs, then it returns S unchanged and exactly one `CommandRejected` event.
- AC-4 Given S and a legal C, when `preview(S, C)` and `apply(S, C)` run, then the preview events equal the apply events.
- AC-5 Given the same seed and the same command list, when replayed twice, then the final state hashes are equal (SDD-02).
- AC-6 Given a running combat, when the speed changes between 1x, 2x and 3x, then no core function is called with a speed value (static check: no `speed` symbol in `src/core`).

## 6. Edge cases

- A command arrives while the presenter is animating: the app queues it (player input) or ignores duplicates within 100 ms (double tap).
- `legalCommands` on a terminal state (victory, defeat) returns only navigation commands.
- Events for a unit that died earlier in the same batch: the presenter skips animations for removed units but still applies HUD changes.

## 7. Test strategy

- Unit: layer boundary test (AC-1), immutability (AC-2), rejection (AC-3).
- Property: preview equals apply over random legal commands from 200 seeds (AC-4).
- Integration: replay determinism (AC-5) in `tests/integration/`.
- Review: every PR touching `src/core` is reviewed for R-1..R-7.

## 8. Verification

```sh
bun test tests/unit
bun test tests/integration
bun run ci
```
