import { describe, expect, test } from 'bun:test';
import {
	applyMeta,
	bankRun,
	buyNode,
	createRun,
	emptyProfile,
	nextNodeCost,
	parseProfile,
	unlockedCards,
} from '../../src/core';
import { partyPool } from '../../src/core/rewards';
import { HEROES } from '../../src/data';

describe('skill tree v1 (GDD §22.5)', () => {
	test('Embers are banked once per run seed', () => {
		let p = bankRun(emptyProfile(), 42, 17);
		p = bankRun(p, 42, 17);
		expect(p.embers).toBe(17);
		expect(bankRun(p, 43, 5).embers).toBe(22);
	});

	test('nodes are bought in order at 10 / 25 / 45 and never below zero Embers', () => {
		let p = { ...emptyProfile(), embers: 79 };
		expect(nextNodeCost(p, 'marksman')).toBe(10);
		p = buyNode(p, 'marksman');
		p = buyNode(p, 'marksman');
		p = buyNode(p, 'marksman');
		expect(p.nodes.marksman).toBe(2);
		expect(p.embers).toBe(44);
		expect(buyNode({ ...p, embers: 50 }, 'marksman').nodes.marksman).toBe(3);
		expect(nextNodeCost({ ...p, nodes: { ...p.nodes, marksman: 3 } }, 'marksman')).toBeNull();
	});

	test('unlocked cards join only the pool of heroes in the party', () => {
		const p = {
			...emptyProfile(),
			nodes: { ...emptyProfile().nodes, marksman: 1, arcanist: 2 },
		};
		expect(unlockedCards(p)).toEqual(['mrk_ricochet', 'arc_cinder_ward', 'arc_inferno']);
		const run = applyMeta(createRun(1, ['shieldbearer', 'confessor', 'marksman']), p);
		expect(partyPool(run, 'common')).toContain('mrk_ricochet');
		expect(partyPool(run, 'common')).not.toContain('arc_cinder_ward');
	});

	test('veteran start swaps one starter Strike only when node III is owned', () => {
		const party = ['shieldbearer', 'confessor', 'marksman'] as const;
		const base = createRun(7, [...party]);
		const strike = HEROES.marksman.starters[0];
		const count = (s: typeof base, id: string): number =>
			s.deck.filter((c) => c.cardId === id).length;
		const locked = applyMeta(base, emptyProfile(), ['marksman']);
		expect(count(locked, 'mrk_ricochet')).toBe(0);
		const owned = { ...emptyProfile(), nodes: { ...emptyProfile().nodes, marksman: 3 } };
		const vet = applyMeta(base, owned, ['marksman']);
		expect(count(vet, 'mrk_ricochet')).toBe(1);
		expect(count(vet, strike as string)).toBe(count(base, strike as string) - 1);
		expect(count(base, 'mrk_ricochet')).toBe(0);
	});

	test('a corrupt profile parses to safe defaults', () => {
		expect(parseProfile('nope').embers).toBe(0);
		const p = parseProfile({
			embers: -5,
			nodes: { marksman: 9, arcanist: 'x' },
			banked: [1, 'a'],
		});
		expect(p.embers).toBe(0);
		expect(p.nodes.marksman).toBe(3);
		expect(p.nodes.arcanist).toBe(0);
		expect(p.banked).toEqual([1]);
	});
});
