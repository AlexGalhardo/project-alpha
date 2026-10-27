import { describe, expect, test } from 'bun:test';
import { CARDS, HEROES } from '../../src/data/index.ts';

// QA playtest 1, P2-8 (docs/reports/2026-10-26-sim-prototype.md): parties without the Shieldbearer
// won 5.8% of 2-act runs. The ally-protecting starters of the other heroes doubled their Block and
// the Confessor got more HP; these values are the ones the simulation accepted.
describe('anti-dominance values (GDD 8.1, 9.3)', () => {
	test('ally-protecting starters give 10 Block (13 upgraded)', () => {
		for (const id of ['arc_ash_veil', 'cnf_sanctuary']) {
			expect(CARDS[id]?.params.block).toBe(10);
			expect(CARDS[id]?.upgrade?.block).toBe(13);
		}
	});

	test('Sandbags covers the adjacent hero with 6 Block (7 upgraded)', () => {
		expect(CARDS.bmb_sandbags?.params.blockAdjacent).toBe(6);
		expect(CARDS.bmb_sandbags?.upgrade?.blockAdjacent).toBe(7);
	});

	test('Confessor has 52 max HP', () => {
		expect(HEROES.confessor.maxHP).toBe(52);
	});
});
