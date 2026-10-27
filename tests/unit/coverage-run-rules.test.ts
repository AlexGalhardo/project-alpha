import { describe, expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { maxHP } from '../../src/core/ops.ts';
import { addToStash } from '../../src/core/rewards.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { Command, GameEvent, RunState } from '../../src/core/types.ts';
import { CAMP, REST, RULES } from '../../src/data/index.ts';
import { invalidOf, PARTY, run } from './helpers.ts';

function at<T>(xs: readonly T[], i: number): T {
	const v = xs[i];
	if (v === undefined) throw new Error(`missing index ${i}`);
	return v;
}

/** Bot-plays until the run reaches `phase` (the real flow, not a hand-built state). */
function atPhase(seed: number, phase: RunState['phase']): RunState {
	let s = createRun(seed, PARTY);
	for (let i = 0; i < 400 && s.phase !== phase; i++) {
		s = apply(s, chooseBotCommand(s) as Command).state;
	}
	if (s.phase !== phase) throw new Error(`seed ${seed} never reached ${phase}`);
	return s;
}

describe('camp services (GDD 4.4)', () => {
	test('vigil costs 12 gold, needs a chosen hero, and removes 3 stress from that hero only', () => {
		const s = atPhase(6, 'camp');
		s.gold = 100;
		s.camp = {
			...(s.camp as NonNullable<RunState['camp']>),
			service: { kind: 'vigil', price: 12, sold: false },
		};
		at(s.party, 0).stress = 5;
		at(s.party, 1).stress = 5;
		const missing = run(s, { type: 'campBuy', offer: 'service' });
		expect(invalidOf(missing.ev)).toHaveLength(1);
		expect(missing.s.gold).toBe(100);
		const r = run(s, { type: 'campBuy', offer: 'service', heroId: at(s.party, 0).id });
		expect(at(r.s.party, 0).stress).toBe(5 - CAMP.vigilStress);
		expect(at(r.s.party, 1).stress).toBe(5);
		expect(r.s.gold).toBe(88);
	});

	test('bind wounds heals every hero by 15% of max HP, rounded down, never above max', () => {
		const s = atPhase(6, 'camp');
		s.gold = 100;
		s.camp = {
			...(s.camp as NonNullable<RunState['camp']>),
			service: { kind: 'bind', price: 12, sold: false },
		};
		for (const h of s.party) h.hp = 1;
		const r = run(s, { type: 'campBuy', offer: 'service' });
		for (const [i, h] of r.s.party.entries()) {
			const before = at(s.party, i);
			const max = maxHP(before);
			expect(h.hp).toBe(Math.min(max, 1 + Math.floor((max * CAMP.bindHealPct) / 100)));
		}
	});

	test('a full stash (6) blocks buying camp equipment; with room the item goes to the stash', () => {
		const s = atPhase(6, 'camp');
		s.gold = 500;
		s.camp = {
			...(s.camp as NonNullable<RunState['camp']>),
			equipment: { item: 'eq_notched_blade', price: 50, sold: false },
		};
		s.stash = ['a', 'b', 'c', 'd', 'e', 'f'];
		const blocked = run(s, { type: 'campBuy', offer: 'equipment' });
		expect(invalidOf(blocked.ev)).toHaveLength(1);
		expect(blocked.s.gold).toBe(500);
		expect(blocked.s.stash).toHaveLength(6);

		s.stash = [];
		const bought = run(s, { type: 'campBuy', offer: 'equipment' });
		expect(bought.s.stash).toEqual(['eq_notched_blade']);
		expect(bought.s.gold).toBe(450);
	});

	test('reorder ranks is free: the new order becomes the party order', () => {
		const s = atPhase(6, 'camp');
		const before = s.gold;
		const r = run(s, { type: 'reorder', order: ['confessor', 'marksman', 'shieldbearer'] });
		expect(r.s.party.map((h) => h.id)).toEqual(['confessor', 'marksman', 'shieldbearer']);
		expect(r.s.gold).toBe(before);
	});
});

describe('shop equipment (GDD 4.6, 12.1)', () => {
	function shopState(stash: string[], gold: number): RunState {
		const s = createRun(1, PARTY);
		s.phase = 'shop';
		s.shop = {
			cards: [],
			equipment: [{ item: 'eq_notched_blade', price: 55, sold: false }],
			removalsAtVisit: 0,
			removedHere: false,
		};
		s.stash = stash;
		s.gold = gold;
		return s;
	}

	test('a full stash blocks shop equipment; with room the item is bought once, then sold out', () => {
		const full = run(shopState(['a', 'b', 'c', 'd', 'e', 'f'], 200), {
			type: 'shopBuy',
			kind: 'equipment',
			index: 0,
		});
		expect(invalidOf(full.ev)).toHaveLength(1);
		expect(full.s.gold).toBe(200);

		const first = run(shopState([], 200), { type: 'shopBuy', kind: 'equipment', index: 0 });
		expect(first.s.stash).toEqual(['eq_notched_blade']);
		expect(first.s.gold).toBe(145);
		const second = run(first.s, { type: 'shopBuy', kind: 'equipment', index: 0 });
		expect(invalidOf(second.ev)).toHaveLength(1);
		expect(second.s.gold).toBe(145);
	});
});

describe('rest (GDD 4.5)', () => {
	function restState(): RunState {
		const s = createRun(1, PARTY);
		s.phase = 'rest';
		at(s.party, 0).injured = true;
		at(s.party, 0).hp = 1;
		at(s.party, 1).hp = 1;
		at(s.party, 0).stress = 7;
		return s;
	}

	test('Recover clears injury first, then heals 30% of the restored max HP (rounded down)', () => {
		const s = restState();
		const r = run(s, { type: 'restChoose', option: 'recover' });
		const cleared = { ...at(s.party, 0), injured: false };
		const max0 = maxHP(cleared);
		expect(at(r.s.party, 0).injured).toBe(false);
		expect(at(r.s.party, 0).hp).toBe(
			Math.min(max0, 1 + Math.floor((max0 * REST.recoverHealPct) / 100)),
		);
		expect(at(r.s.party, 1).hp).toBe(
			Math.min(
				maxHP(at(s.party, 1)),
				1 + Math.floor((maxHP(at(s.party, 1)) * REST.recoverHealPct) / 100),
			),
		);
		expect(r.s.phase).toBe('camp');
	});

	test('Pray removes 5 stress per hero and never goes below 0', () => {
		const r = run(restState(), { type: 'restChoose', option: 'pray' });
		expect(at(r.s.party, 0).stress).toBe(2);
		expect(at(r.s.party, 1).stress).toBe(0);
	});

	test('Temper refuses a card that is already upgraded or does not exist', () => {
		const s = restState();
		const card = at(s.deck, 0);
		const once = run(s, { type: 'restChoose', option: 'temper', cardUid: card.uid });
		expect(once.s.deck.find((c) => c.uid === card.uid)?.upgraded).toBe(true);
		const again = run(s, { type: 'restChoose', option: 'temper', cardUid: 999999 });
		expect(invalidOf(again.ev)).toHaveLength(1);
		const twice = run(once.s, { type: 'restChoose', option: 'temper', cardUid: card.uid });
		expect(invalidOf(twice.ev)).toHaveLength(1);
	});

	test('a rest choice outside the rest node is refused', () => {
		const s = createRun(1, PARTY);
		const r = run(s, { type: 'restChoose', option: 'pray' });
		expect(invalidOf(r.ev)).toHaveLength(1);
	});
});

describe('equipment and stash (GDD 12.1)', () => {
	function withStash(stash: string[]): RunState {
		const s = createRun(1, PARTY);
		s.stash = stash;
		return s;
	}

	test('a relic cannot go in the weapon slot', () => {
		const r = run(withStash(['eq_iron_rosary']), {
			type: 'equip',
			heroId: 'shieldbearer',
			slot: 'weapon',
			item: 'eq_iron_rosary',
		});
		expect(invalidOf(r.ev)).toHaveLength(1);
		expect(r.s.stash).toEqual(['eq_iron_rosary']);
	});

	test('equipping over a weapon returns the old one to the stash', () => {
		const s = withStash(['eq_notched_blade']);
		at(s.party, 0).weapon = 'eq_heavy_pavise';
		const r = run(s, {
			type: 'equip',
			heroId: 'shieldbearer',
			slot: 'weapon',
			item: 'eq_notched_blade',
		});
		expect(at(r.s.party, 0).weapon).toBe('eq_notched_blade');
		expect(r.s.stash).toEqual(['eq_heavy_pavise']);
	});

	test('unequipping with a full stash is refused; with room the item returns to the stash', () => {
		const s = withStash(['a', 'b', 'c', 'd', 'e', 'f']);
		at(s.party, 0).weapon = 'eq_notched_blade';
		const blocked = run(s, {
			type: 'equip',
			heroId: 'shieldbearer',
			slot: 'weapon',
			item: null,
		});
		expect(invalidOf(blocked.ev)).toHaveLength(1);
		expect(at(blocked.s.party, 0).weapon).toBe('eq_notched_blade');

		s.stash = [];
		const freed = run(s, { type: 'equip', heroId: 'shieldbearer', slot: 'weapon', item: null });
		expect(at(freed.s.party, 0).weapon).toBeNull();
		expect(freed.s.stash).toEqual(['eq_notched_blade']);
	});

	test('equipment cannot be changed during combat', () => {
		const s = withStash(['eq_notched_blade']);
		s.phase = 'combat';
		const r = run(s, {
			type: 'equip',
			heroId: 'shieldbearer',
			slot: 'weapon',
			item: 'eq_notched_blade',
		});
		expect(invalidOf(r.ev)).toHaveLength(1);
		expect(r.s.stash).toEqual(['eq_notched_blade']);
	});
});

describe('stash capacity (GDD 12.1)', () => {
	test('a full stash refuses the item and records it as not kept', () => {
		const stash = ['a', 'b', 'c', 'd', 'e', 'f'];
		const ev: GameEvent[] = [];
		expect(addToStash({ stash } as unknown as RunState, 'eq_notched_blade', ev)).toBe(false);
		expect(ev).toEqual([{ type: 'equipmentGained', item: 'eq_notched_blade', kept: false }]);
		expect(stash).toHaveLength(6);
		expect(RULES.stashMax).toBe(6);
	});
});
