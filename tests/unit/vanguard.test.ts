import { describe, expect, test } from 'bun:test';
import { playableReason } from '../../src/core/cards.ts';
import { newCard } from '../../src/core/rewards.ts';
import type { HeroClass } from '../../src/core/types.ts';
import { combatView } from '../../src/core/views.ts';
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

	test('a non-tank in rank 1 may play its cards from any rank', () => {
		const s = combatRun('A1', ['marksman', 'confessor', 'arcanist']);
		combat(s).energy = 3;
		expect(RULES.vanguardAnyRank).toBe(true);
		// Aimed Shot is From H2-3; the Marksman stands in rank 1.
		expect(playableReason(s, newCard(s, 'mrk_aimed_shot'))).toBeNull();
	});

	test('outside Vanguard the From rule still applies', () => {
		const s = combatRun('A1');
		combat(s).energy = 3;
		// Shield Slam is From H1 only; the Shieldbearer in rank 2 cannot play it.
		combat(s).lineup = ['confessor', 'shieldbearer', 'marksman'];
		expect(playableReason(s, newCard(s, 'shb_shield_slam'))).toBe('wrong-rank');
		combat(s).lineup = ['shieldbearer', 'confessor', 'marksman'];
		expect(playableReason(s, newCard(s, 'shb_shield_slam'))).toBeNull();
	});

	test('the combat view marks the hero who has Vanguard', () => {
		const s = combatRun('A1', NO_TANK);
		const v = combatView(s);
		expect(v?.heroes.map((h) => h.vanguard)).toEqual([true, false, false]);
		const t = combatView(combatRun('A1'));
		expect(t?.heroes.every((h) => !h.vanguard)).toBe(true);
	});
});
