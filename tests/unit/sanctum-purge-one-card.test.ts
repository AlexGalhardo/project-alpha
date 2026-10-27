import { afterEach, expect, test } from 'bun:test';
import { createRun } from '../../src/core/run.ts';
import type { RunState } from '../../src/core/types.ts';
import { ACT_RULES } from '../../src/data/index.ts';
import { invalidOf, PARTY, run } from './helpers.ts';

const saved = ACT_RULES.sanctum;
afterEach(() => {
	ACT_RULES.sanctum = saved;
});

// docs/gdd.md §23.1 lists Purge (remove 2 cards) as needing "2 cards in the deck".
// sanctumChoose computes need = min(removeCount, eligible.length), so with one card in the deck
// Purge removes that card instead of being unavailable. Expected: Purge is refused with fewer
test('Purge with a one-card deck is refused (GDD 23.1 needs 2 cards)', () => {
	ACT_RULES.sanctum = true;
	const s: RunState = createRun(1, PARTY);
	s.phase = 'sanctum';
	s.deck = s.deck.slice(0, 1);
	const only = s.deck[0];
	expect(only).toBeDefined();
	const r = run(s, { type: 'sanctumChoose', option: 'remove', cardUids: [only?.uid ?? -1] });
	expect(invalidOf(r.ev)).toHaveLength(1);
	expect(r.s.deck).toHaveLength(1);
});
