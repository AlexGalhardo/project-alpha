import { describe, expect, test } from 'bun:test';
import { ACT_RULES, CARDS, HEROES } from '../../src/data/index.ts';

// QA playtest 1, P2-8 (docs/reports/2026-10-26-sim-prototype.md): parties without the Shieldbearer
// won 5.8% of 2-act runs. The ally-protecting starters of the other heroes doubled their Block and
// the Confessor got more HP; these values are the ones the simulation accepted.
describe('anti-dominance values (GDD 8.1, 9.3)', () => {
	test('ally-protecting starters give 10 Block (13 upgraded); Sanctuary 5 (8) with its Ward', () => {
		expect(CARDS.arc_ash_veil?.params.block).toBe(10);
		expect(CARDS.arc_ash_veil?.upgrade?.block).toBe(13);
		// Halved back after the Vanguard pass (docs/reports/2026-10-26-sim-confessor.md): with every
		// hero able to act from rank 1, a 10-Block Ward card kept the Confessor in 76% of wins.
		expect(CARDS.cnf_sanctuary?.params.block).toBe(5);
		expect(CARDS.cnf_sanctuary?.upgrade?.block).toBe(8);
	});

	test('Sandbags covers the adjacent hero with 6 Block (7 upgraded)', () => {
		expect(CARDS.bmb_sandbags?.params.blockAdjacent).toBe(6);
		expect(CARDS.bmb_sandbags?.upgrade?.blockAdjacent).toBe(7);
	});

	test('Confessor has 52 max HP', () => {
		expect(HEROES.confessor.maxHP).toBe(52);
	});
});

// GDD 23.1: the Sanctum ships on (replaces the flat 50% heal between acts).
describe('Sanctum switch-on (GDD 23.1, 23.7)', () => {
	test('the Sanctum replaces the flat heal between acts', () => {
		expect(ACT_RULES.sanctum).toBe(true);
	});
});
