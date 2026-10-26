# SDD-04 Cards and deck

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet (core + `src/data/cards.ts`); Haiku (card text in `src/i18n`) |
| Phase | PROTOTYPE |
| Depends on | SDD-01, SDD-02 |
| References | GDD §5.3, §5.4, §6.2 (keywords), §9 (cards, 45-card list, upgrade formula, value guideline); Art Bible §10 |

## 1. Goal

Model cards as data, the single deck with per-hero ownership, the four piles, draw/reshuffle, keywords, From/Target ranks and upgrades, so that the 45 prototype cards of GDD §9.3 are playable and previewable.

## 2. Non-goals

- Card art and layout (Art Bible §10, SDD-12).
- Deckbuilder screen, collection (Alpha).
- Legendary cards in the pool (none in the prototype).

## 3. Requirements

- R-1 A card definition is data: `id`, `owner` (hero class), `cost` 0–3, `type` (Attack, Skill, Power), `rarity` (starter, common, uncommon, rare, legendary), `from` (hero ranks), `target` (enemy ranks, ally, self, all heroes, all enemies, fallen hero, random), `effects[]` (primitives), `keywords[]`, `upgrade` (explicit overrides or the formula).
- R-2 Effect primitives cover the 45 cards: `damage`, `damageEqualToBlock`, `multiHit`, `block`, `blockOthers`, `heal`, `applyStatus`, `removeDebuffs`, `stress`, `draw`, `energyNextTurn`, `push`, `pull`, `swap`, `splash`, `taunt`, `plantKeg`, `revive`, `persistBlock`, `powerTrigger`.
- R-3 The run deck is a list of card instances (`uid`, `id`, `upgraded`); each instance belongs to its owner hero; the starting deck is 4 cards per party hero (12) (GDD §9.2).
- R-4 Piles: draw (order hidden; viewable sorted by name), hand (limit 10; extra draws stay in draw), discard, exhaust; Powers leave the hand into a `powers` zone for the combat.
- R-5 Drawing from an empty draw pile shuffles the discard into it with the `combat` stream; if both are empty, the draw stops silently.
- R-6 A card is playable iff: owner not fallen, owner's rank ∈ `from`, energy ≥ cost, a valid target exists.
- R-7 Keywords: Exhaust, Retain, Power, Dread N, Push N, Pull N, Swap, Splash N, Taunt (GDD §6.2) with the exact semantics of the GDD.
- R-8 Upgrade: explicit `+` values from GDD §9.3 when listed; otherwise the formula (+3 if base ≥ 6 else +2; status stacks +1; cost unchanged).
- R-9 Equipment modifiers (SDD-09) apply when computing card numbers; the detail panel and preview show the modified numbers.
- R-10 Swapping a hero removes all of the leaving hero's card instances from every pile and adds the incoming hero's 4 starters (GDD §4.4).
- R-11 Data integrity: 45 cards, 9 per hero, 3 starters per hero (one ×2), every effect primitive known, every id has i18n name, short name and text keys.

## 4. Design

- `src/data/cards.ts`: `export const CARDS: Readonly<Record<CardId, CardDef>>` (ids `shb_*`, `mrk_*`, `arc_*`, `cnf_*`, `bmb_*`).
- `src/core/combat/piles.ts`, `src/core/cards/effects.ts` (one resolver per primitive), `src/core/cards/playable.ts`.
- i18n keys: `card.<id>.name`, `card.<id>.short` (≤ 58 px in `font.ui`), `card.<id>.text` (≤ 12 words + keyword tokens).

## 5. Acceptance criteria

- AC-1 Given a new run with Shieldbearer, Confessor, Marksman, then the deck has 12 instances: 2 Hack, Brace, Hold the Line, 2 Censer Strike, Sanctuary, Mend, 2 Aimed Shot, Sidestep, Mark Prey.
- AC-2 Given 9 cards in hand and a "draw 2" effect, then the hand has 10 and one card stays on top of the draw pile.
- AC-3 Given an empty draw pile and 6 cards in discard, when drawing 5, then discard is shuffled (seeded) into draw and 5 are drawn; given both empty, then no error and no draw.
- AC-4 Given Marksman in H1, then Aimed Shot (`from` H2–3) is not in `legalCommands`.
- AC-5 Given Shield Slam with 14 Block on the owner, then the preview shows 14 damage; with 30 Block, 24 (cap).
- AC-6 Given an Exhaust card is played, then it is in the exhaust pile and not reshuffled until the combat ends.
- AC-7 Given Hack upgraded, then damage is 9 (explicit `+`); given a card with base 4 and no explicit `+`, then upgraded damage is 6.
- AC-8 Given a camp swap Marksman → Bombardier, then no `mrk_*` instance remains and 4 `bmb_*` starters are in the deck.
- AC-9 Given the data integrity test, then it finds exactly 45 cards, 9 per hero, and no missing i18n key in EN or PT-BR.

## 6. Edge cases

- Retain cards stay in hand across turns and count toward the 10 limit.
- A Power played twice stacks its trigger (two Vow of Iron → +6 Block per turn).
- Random-target cards (Barrage) use the `combat` stream per hit; the preview shows "random" and a range, the only preview that is not a single number (still no hit chance).
- Powder Keg on an enemy that dies before being hit: the keg is removed with no effect.
- Rekindle with no fallen hero: no valid target, so unplayable.

## 7. Test strategy

- Unit: one test per effect primitive; piles; playability; upgrade.
- Data integrity: counts, ids, i18n keys, value-guideline lint (cost vs effect within ±50% of GDD §9.1 guideline, warning only).
- Property: no card play leaves a negative pile count or a duplicated `uid`.

## 8. Verification

```sh
bun test tests/unit/cards
bun test tests/unit/data-integrity.test.ts
```
