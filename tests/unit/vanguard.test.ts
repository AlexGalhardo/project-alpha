import { describe, expect, test } from 'bun:test';
import type { HeroClass } from '../../src/core/types.ts';
import { RULES } from '../../src/data/index.ts';
import { combat, combatRun, heroFx, isolate, run } from './helpers.ts';

/** A party without a natural front-liner: the Confessor stands in rank 1. */
const NO_TANK: HeroClass[] = ['confessor', 'marksman', 'arcanist'];

// Vanguard (docs/gdd.md §5.2): a hero who is not a natural front-liner and stands in rank 1 at the
// start of a player turn gains Block.
describe('Vanguard rule', () => {
	test('the rank-1 hero starts every player turn with Vanguard Block; the others do not', () => {
		expect(RULES.vanguardBlock).toBeGreaterThan(0);
		let s = combatRun('A1', NO_TANK);
		const front = combat(s).lineup[0];
		const second = combat(s).lineup[1];
		if (!front || !second) throw new Error('no lineup');
		expect(heroFx(s, front).block).toBe(RULES.vanguardBlock);
		expect(heroFx(s, second).block).toBe(0);
		isolate(s, 'ossified_brute');
		const r = run(s, { type: 'endTurn' });
		s = r.s;
		expect(heroFx(s, front).block).toBe(RULES.vanguardBlock);
		expect(r.ev).toContainEqual({
			type: 'block',
			target: { side: 'hero', id: front },
			amount: RULES.vanguardBlock,
		});
	});

	test('Vanguard follows the rank: after a fall the new rank-1 hero gets it', () => {
		let s = combatRun('A1', NO_TANK);
		isolate(s, 'ossified_brute');
		const k = combat(s);
		const [first, second] = k.lineup;
		if (!first || !second) throw new Error('no lineup');
		k.lineup = [second, first, ...k.lineup.slice(2)];
		s = run(s, { type: 'endTurn' }).s;
		expect(heroFx(s, second).block).toBe(RULES.vanguardBlock);
		expect(heroFx(s, first).block).toBe(0);
	});

	test('Vanguard Block replaces the turn-start reset, it does not stack with kept Block', () => {
		let s = combatRun('A1', NO_TANK);
		isolate(s, 'ossified_brute');
		const front = combat(s).lineup[0];
		if (!front) throw new Error('no lineup');
		heroFx(s, front).block = 30;
		s = run(s, { type: 'endTurn' }).s;
		expect(heroFx(s, front).block).toBe(RULES.vanguardBlock);
	});

	test('a natural front-liner (the Shieldbearer) in rank 1 gets no Vanguard Block', () => {
		const s = combatRun('A1');
		expect(combat(s).lineup[0]).toBe('shieldbearer');
		expect(heroFx(s, 'shieldbearer').block).toBe(0);
	});
});
