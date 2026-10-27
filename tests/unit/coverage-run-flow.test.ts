import { describe, expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { Command, RunState } from '../../src/core/types.ts';
import { CAMP, HEROES } from '../../src/data/index.ts';
import { invalidOf, PARTY, run } from './helpers.ts';

function at<T>(xs: readonly T[], i: number): T {
	const v = xs[i];
	if (v === undefined) throw new Error(`missing index ${i}`);
	return v;
}

function atPhase(seed: number, phase: RunState['phase']): RunState {
	let s = createRun(seed, PARTY);
	for (let i = 0; i < 400 && s.phase !== phase; i++) {
		s = apply(s, chooseBotCommand(s) as Command).state;
	}
	if (s.phase !== phase) throw new Error(`seed ${seed} never reached ${phase}`);
	return s;
}

describe('map node choice (GDD 4.2)', () => {
	test('only nodes reachable from the current position can be entered', () => {
		const s = createRun(1, PARTY);
		const offered = at(s.map, 0).map((n) => n.index);
		const unreachable = [0, 1, 2, 3, 4, 5, 6].find((i) => !offered.includes(i));
		expect(unreachable).toBeDefined();
		const r = run(s, { type: 'selectNode', index: unreachable as number });
		expect(invalidOf(r.ev)).toHaveLength(1);
		expect(r.s.cursor).toBeNull();
	});

	test('a node choice outside the map phase is refused', () => {
		const s = atPhase(6, 'camp');
		const r = run(s, { type: 'selectNode', index: 0 });
		expect(invalidOf(r.ev)).toHaveLength(1);
		expect(r.s.phase).toBe('camp');
	});
});

describe('camp swap (GDD 4.4)', () => {
	test('a swap costs gold, can happen once per camp visit, and brings the new hero in at full HP with 0 stress and starter cards', () => {
		const s = atPhase(6, 'camp');
		s.gold = 200;
		s.camp = { ...(s.camp as NonNullable<RunState['camp']>), swapped: false };
		const first = run(s, { type: 'campSwap', leave: 'marksman', join: 'bombardier' });
		expect(invalidOf(first.ev)).toHaveLength(0);
		expect(first.s.gold).toBe(200 - CAMP.swapPrice);
		const bomb = first.s.party.find((h) => h.id === 'bombardier');
		expect(bomb?.hp).toBe(bomb?.baseMax);
		expect(bomb?.stress).toBe(0);
		expect(first.s.deck.filter((c) => c.owner === 'bombardier')).toHaveLength(
			HEROES.bombardier.starters.length,
		);

		const again = run(first.s, { type: 'campSwap', leave: 'confessor', join: 'arcanist' });
		expect(invalidOf(again.ev)).toHaveLength(1);
	});

	test('swap is refused without enough gold, and when the joining hero is already in the party', () => {
		const s = atPhase(6, 'camp');
		s.gold = CAMP.swapPrice - 1;
		s.camp = { ...(s.camp as NonNullable<RunState['camp']>), swapped: false };
		const poor = run(s, { type: 'campSwap', leave: 'marksman', join: 'bombardier' });
		expect(invalidOf(poor.ev)).toHaveLength(1);
		expect(poor.s.party.map((h) => h.id)).toEqual(PARTY);

		s.gold = 200;
		const dup = run(s, { type: 'campSwap', leave: 'marksman', join: 'confessor' });
		expect(invalidOf(dup.ev)).toHaveLength(1);
		expect(dup.s.party.map((h) => h.id)).toEqual(PARTY);
	});

	test('the leaving hero keeps no cards in the deck and their equipment goes to the stash', () => {
		const s = atPhase(6, 'camp');
		s.gold = 200;
		s.camp = { ...(s.camp as NonNullable<RunState['camp']>), swapped: false };
		const leaving = at(
			s.party,
			s.party.findIndex((h) => h.id === 'marksman'),
		);
		leaving.weapon = 'eq_hunters_lens';
		leaving.relic = null;
		s.stash = [];
		const r = run(s, { type: 'campSwap', leave: 'marksman', join: 'arcanist' });
		expect(r.s.deck.filter((c) => c.owner === 'marksman')).toHaveLength(0);
		expect(r.s.stash).toEqual(['eq_hunters_lens']);
	});
});

describe('shop card removal (GDD 4.6)', () => {
	function shopWith(gold: number, removals: number): RunState {
		const s = createRun(1, PARTY);
		s.phase = 'shop';
		s.shop = { cards: [], equipment: [], removalsAtVisit: removals, removedHere: false };
		s.gold = gold;
		s.removals = removals;
		return s;
	}

	test('one removal per visit; the first removal of a run costs 50 gold and shrinks the deck', () => {
		const s = shopWith(200, 0);
		const before = s.deck.length;
		const r = run(s, { type: 'shopRemoveCard', cardUid: at(s.deck, 0).uid });
		expect(r.s.deck.length).toBe(before - 1);
		expect(r.s.gold).toBe(150);
		expect(r.s.removals).toBe(1);
		const again = run(r.s, { type: 'shopRemoveCard', cardUid: at(r.s.deck, 0).uid });
		expect(invalidOf(again.ev)).toHaveLength(1);
		expect(again.s.deck.length).toBe(before - 1);
	});

	test('a removal after two earlier ones costs 100 (50 + 25 per removal); too little gold is refused', () => {
		const s = shopWith(200, 2);
		const ok = run(s, { type: 'shopRemoveCard', cardUid: at(s.deck, 0).uid });
		expect(ok.s.gold).toBe(100);
		const poor = shopWith(90, 2);
		const broke = run(poor, { type: 'shopRemoveCard', cardUid: at(poor.deck, 0).uid });
		expect(invalidOf(broke.ev)).toHaveLength(1);
		expect(broke.s.deck.length).toBe(poor.deck.length);
	});
});
