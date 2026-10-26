# SDD-12 UI, HUD and input

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Coordinator (`src/scenes`, `src/view`) |
| Phase | PROTOTYPE |
| Depends on | SDD-01, SDD-14, SDD-16 |
| References | GDD §15 (flow, HUD, controls), §18.3; Art Bible §3 (zoom, grid, targets), §5 (tokens), §8 (fonts), §9 (design system), §10 (cards), §11 (screens), §12.1 (feedback); B29, B30; ADR 0013 |

## 1. Goal

Build every screen of the prototype at 640×360 exactly as the Art Bible lays it out, with one input model for touch, mouse and keyboard, no hover dependence, visible state for everything the rules require, and a presenter that animates core events at the chosen speed.

## 2. Non-goals

- Deckbuilder, codex, skill tree screens (Alpha).
- Rules in the view: the view never computes damage, legality or targets; it asks the core (`legalCommands`, `preview`).

## 3. Requirements

- R-1 Scenes: Boot, Title, Menu, PartySelect, Map, Combat, Reward, Camp, Shop, Rest, Pause (overlay, `launch`), Settings (overlay), Summary (GDD §15.1). Game state lives in the app controller, not in scenes (SDD-01).
- R-2 Layout: every element at the Art Bible §11 rectangles; zoom per ADR 0013; letterbox `ink`.
- R-3 Always visible in combat: turn queue, every enemy intent with number and target marker, HP, Block, statuses, stress pips, energy, pile counts (invariants).
- R-4 Input model (GDD §15.3): tap card = select + detail panel + previews on valid targets; tap valid target = confirm; tap card again / empty space / `Esc` = cancel; long press 400 ms or right click = tooltip; optional drag; keys `1`–`9`, `0`, `Tab`/arrows, `Enter`, `Space`, `A`, `S`, `Esc`.
- R-5 Every input gets visual feedback within 100 ms.
- R-6 No hover state anywhere; tooltips and the detail panel open by tap/long press.
- R-7 Detail panel 168×120 (Art Bible §11.6): full text, From/Target pips, live preview from `preview()`.
- R-8 Presenter: consumes `DomainEvent[]` in order, plays code feedback (Art Bible §12.1) and VFX with durations scaled by game speed; input other than Pause/Auto/Speed is blocked while it animates; `skipAnimations` consumes events instantly.
- R-9 Text only through `BitmapText` and `t(key)` (SDD-14); no string literal shown to the player in `src/scenes` or `src/view`.
- R-10 Colour is never the only carrier: every token has its shape (Art Bible §5).
- R-11 Touch targets: primary ≥ 44×44, secondary ≥ 44×28, tertiary ≥ 24×24 base px (Art Bible §3.3).
- R-12 Placeholders (ADR 0014) render every key until art exists; swapping art changes no scene code.

## 4. Design

- `src/view/presenter.ts` (event queue → animations), `src/view/components/{CardView,UnitView,IntentView,TurnQueue,EnergyOrb,Pile,DetailPanel,Button,Toggle,Panel9}.ts`.
- `src/view/input.ts`: one dispatcher mapping pointer/keyboard to intents (`select`, `confirm`, `cancel`, `tooltip`, `endTurn`, `toggleAuto`, `cycleSpeed`, `pause`).
- `src/view/layout.ts`: the Art Bible rectangles as constants.

## 5. Acceptance criteria

- AC-1 Given the combat scene at 640×360, then a screenshot test at zoom 1 matches the Art Bible zones (top bar 24 px, units row 198 px, action band 138 px) within 0 px.
- AC-2 Given a card tap, then within 100 ms the card rises 16 px, the detail panel opens and every valid target shows its preview number.
- AC-3 Given a tap on an invalid target, then nothing is played and the selection stays.
- AC-4 Given keyboard only, then a full combat can be played (select, target, confirm, end turn, pause).
- AC-5 Given a long press of 400 ms on a status icon, then its tooltip opens and no command is issued.
- AC-6 Given a scan of `src/scenes` and `src/view`, then no player-facing string literal exists (lint test with an allowlist for debug).
- AC-7 Given `skipAnimations`, then a combat with the greedy policy completes in under 2 s of wall time.
- AC-8 Given deuteranopia simulation, then intents, statuses and rarities stay distinguishable (human QA CB-29, AX-01).

## 6. Edge cases

- Hand of 10 cards: cards overlap in the 404 px hand area with a fan; the selected card is drawn on top.
- Boss with adds: slot layout per Art Bible §11.5.
- Window resize mid-animation: zoom recalculates; tweens continue in base coordinates.
- Long PT-BR names: short name on the card; full name only in the panel.

## 7. Test strategy

- Unit: input dispatcher mapping; layout constants equal Art Bible values.
- Playwright smoke (end of phase): screenshots of each screen at V1 and V4; card play by touch and keyboard.
- Human QA: sections 2–13, 18–22 of `docs/qa/human-qa.md`.

## 8. Verification

```sh
bun test tests/unit/view
bunx playwright test tests/smoke
```
