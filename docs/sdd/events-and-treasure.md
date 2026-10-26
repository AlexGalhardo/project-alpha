# SDD-21 Event and treasure nodes

| Field | Value |
|---|---|
| Status | Implemented in core (`src/core/events.ts`) and view (`EventScene`, `TreasureScene`) on 2026-10-26; review pending |
| Owner | Opus (core implementation), Coordinator (scenes) |
| Phase | ALPHA |
| Depends on | SDD-07 (map and run), SDD-08 (rewards and economy), SDD-11 (save) |
| References | GDD §22.4 (node placement, treasure, six events), GDD P3 (every outcome shown before the choice); `.claude/rules/ip-and-tone.md` (2–4 short paragraphs) |

## 1. Goal

Add two node types to the map: an **event** (a short text with 2–3 choices, every outcome shown) and a **treasure** (gold plus one equipment). Both count as a round and keep the run's fight count.

## 2. Non-goals

- Events in the prototype (GDD §2: prototype has no event node). The `ALPHA.events` flag in `src/data/events.ts` gates them.
- Hidden chance. Random picks are rolled when the event opens, so the preview shows the result.
- New enemies or cards inside events (events may offer existing cards only).
- Events that cost more HP than the party has (the choice is unavailable instead).

## 3. Requirements

- R-1 Event candidates: combat nodes in rows 2, 3, 5, 6 and 8 (`EVENT_MAP.eventRows`). Each candidate becomes an event with seeded chance 0.4 (`EVENT_MAP.eventChance`).
- R-2 Treasure candidates: non-shop nodes in rows 5 and 6 (`EVENT_MAP.treasureRows`). At most one treasure per act, chance 0.35 (`EVENT_MAP.treasureChance`).
- R-3 Every path keeps at least 5 fights (`EVENT_MAP.minFights`). A conversion that would break this is skipped.
- R-4 Every node counts as a round for run length and Embers (SDD-10).
- R-5 Each event has 2 or 3 choices. The last choice is always "Leave" with no effect (`EventDef.choices`). Each choice shows all its effects before it is taken.
- R-6 A choice with a gold cost is unavailable when the party has less gold. A choice that costs HP is unavailable when it would not leave the party alive; it is never silently applied.
- R-7 Treasure: 25 gold (`TREASURE.gold`) and one equipment with odds common 0 %, uncommon 60 %, rare 40 % (`TREASURE.equipmentOdds`).
- R-8 Event text and choice labels live in `src/i18n/` as `event.<id>.title`, `event.<id>.text` (paragraphs joined by `\n`) and `event.<id>.choice1..n`, in EN and PT-BR.

## 4. Design

Files:

- `src/data/events.ts`: `ALPHA`, `EVENT_MAP`, `TREASURE`, `EventEffect` (kinds: `healPctEach`, `healEach`, `stressEach`, `stressH1`, `damageH1`, `damageLowest`, `gold`, `relic`, `equipment`, `cardOffer`, `upgradeRandom`, `upgradeChoose`, `removeChoose`), `EVENTS` (six ids: `ev_weeping_font`, `ev_ossuary_shrine`, `ev_chained_penitent`, `ev_forgotten_armory`, `ev_whispering_choir`, `ev_ember_pilgrim`).
- `src/core/events.ts`: `placeSpecialNodes(s, rows)` (conversion at generation time, using the `map` RNG stream; the chance roll is always drawn so later rows do not shift), `openEvent(s, id?)`, `openTreasure(s)`, `choiceAvailable(s, i)`, `resolveEvent(c, cmd)`, `claimTreasure(c)`, `cardsToChoose`, `minFights`.
- Commands: `eventChoose { index, cardUids? }`, treasure claim. Events: `eventChosen`, `treasureClaimed`.
- `src/scenes/EventScene.ts`, `src/scenes/TreasureScene.ts`: present the text and choices, send commands, never decide outcomes.

Random picks (which relic, which upgrade target, which cards are offered) are drawn with the run RNG when the event opens and stored in the state, so the preview and the result match.

## 5. Acceptance criteria

- AC-1 Given a seed, when the map is generated twice, then the same nodes become events and the same single treasure is placed.
- AC-2 Given any seed in a 300-seed sample, when the map is generated, then every path has at least 5 fights and at most one treasure per act.
- AC-3 Given an event with a gold-cost choice and fewer gold than the cost, when the choice is previewed, then it is unavailable and taking it returns `invalid` with no state change.
- AC-4 Given a choice that deals HP damage, when it would bring the lowest-HP hero to 0 or less, then the choice is unavailable; the state does not change.
- AC-5 Given "Leave" at any event, when chosen, then the state changes only by leaving the node.
- AC-6 Given a treasure with odds `[0, 60, 40]`, when it is claimed over a large seeded sample, then the equipment rarity split is within the expected range (uncommon ≈ 60 %, rare ≈ 40 %, no common).
- AC-7 Given the six event ids, when the i18n test runs, then every id has a title, a text, and at least a `choice1` and `choice2` key in both locales with the same placeholders.

## 6. Edge cases

- Event on the last available row before the boss: the path check (R-3) still holds.
- Empty `cardUids` on `removeChoose` or `upgradeChoose`: the choice must be refused, not applied with zero targets.
- Two events placed on the same path: allowed; each resolves once.
- Save taken on an open event: the event state is part of the run save and resumes identically (SDD-11).
- Event text with a choice that needs a placeholder number: the placeholder is filled from the same value the preview shows.

## 7. Test strategy

- Unit: `tests/unit/events.test.ts` (placement, availability, resolution, treasure).
- Unit: `tests/unit/i18n.test.ts` (key parity, placeholder parity, paragraph count where it applies).
- E2E: not yet. A click-through of an event node is a follow-up.
- Manual: text fit on V4 for the longest event; tone check against `ip-and-tone.md`.

## 8. Verification

```bash
bun test tests/unit/events.test.ts
bun test tests/unit/i18n.test.ts
bun run ci
```

## 9. Open gaps

- No e2e test covers an event or treasure node.
- Event and treasure texts are first drafts; a tone and IP review is open.
