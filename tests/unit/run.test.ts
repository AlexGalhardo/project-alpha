import { describe, expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { chooseEncounter, generateMap, markSeen } from '../../src/core/map.ts';
import { makeCardOffer, makeShop, removalPrice } from '../../src/core/rewards.ts';
import { rand } from '../../src/core/rng.ts';
import { apply, createRun, deserialize, embers, preview, serialize } from '../../src/core/run.ts';
import type { Command, HeroClass, RunState } from '../../src/core/types.ts';
import { combatView, currentScreen, mapView } from '../../src/core/views.ts';
import {
	ALPHA,
	CARD_IDS,
	CARDS,
	ENCOUNTER_RULES,
	ENEMIES,
	HERO_CLASSES,
	HEROES,
} from '../../src/data/index.ts';
import { invalidOf, PARTY, run } from './helpers.ts';

function playOut(seed: number, party: HeroClass[]): { s: RunState; steps: number } {
	let s = createRun(seed, party);
	let steps = 0;
	for (; steps < 50000; steps++) {
		const cmd = chooseBotCommand(s);
		if (!cmd) break;
		const r = apply(s, cmd);
		if (invalidOf(r.events).length > 0) {
			throw new Error(
				`invalid ${JSON.stringify(cmd)} in ${s.phase}: ${JSON.stringify(invalidOf(r.events))}`,
			);
		}
		s = r.state;
	}
	return { s, steps };
}

function trios(): HeroClass[][] {
	const out: HeroClass[][] = [];
	for (let a = 0; a < 5; a++) {
		for (let b = a + 1; b < 5; b++) {
			for (let c = b + 1; c < 5; c++) {
				out.push([HERO_CLASSES[a], HERO_CLASSES[b], HERO_CLASSES[c]] as HeroClass[]);
			}
		}
	}
	return out;
}

describe('data integrity (GDD 8, 9)', () => {
	test('45 cards, 9 per hero, starters are 4 cards with the first twice', () => {
		expect(CARD_IDS).toHaveLength(55);
		expect(HERO_CLASSES.flatMap((h) => HEROES[h].pool)).toHaveLength(45);
		for (const id of HERO_CLASSES) {
			const h = HEROES[id];
			expect(h.pool).toHaveLength(9);
			expect(h.starters).toHaveLength(4);
			expect(h.starters[0]).toBe(h.starters[1]);
			for (const c of h.pool) expect(CARDS[c]?.owner).toBe(id);
			const rar = h.pool.map((c) => CARDS[c]?.rarity);
			expect(rar.filter((r) => r === 'rare')).toHaveLength(1);
			expect(rar.filter((r) => r === 'uncommon')).toHaveLength(2);
		}
		expect(Object.keys(ENEMIES)).toHaveLength(22);
	});

	test('upgrade table spot checks', () => {
		const up = (id: string): Record<string, number | undefined> => ({
			...CARDS[id]?.params,
			...CARDS[id]?.upgrade,
		});
		expect(up('shb_brace')).toMatchObject({ block: 9, blockAllies: 3 });
		expect(up('mrk_killshot')).toMatchObject({ damage: 18, bonus: 18 });
		expect(up('bmb_shell')).toMatchObject({ damage: 15, splash: 6 });
		expect(up('cnf_rekindle')).toMatchObject({ pct: 40 });
		expect(CARDS.arc_channel?.upgradedCost).toBe(0);
	});
});

describe('map (GDD 4.2)', () => {
	test('row sizes, node types, reachability and non-crossing edges for 300 seeds', () => {
		for (let seed = 1; seed <= 300; seed++) {
			const s = createRun(seed, PARTY);
			const m = s.map;
			expect(m).toHaveLength(10);
			expect(m[0]).toHaveLength(2);
			expect(m[1]).toHaveLength(3);
			expect(m[2]).toHaveLength(2);
			expect([2, 3]).toContain(m[3]?.length ?? 0);
			expect(m[4]).toHaveLength(3);
			expect(m[5]).toHaveLength(2);
			expect([2, 3]).toContain(m[6]?.length ?? 0);
			expect(m[7]).toHaveLength(3);
			expect(m[8]).toHaveLength(2);
			expect(m[9]).toHaveLength(1);
			const count = (r: number, t: string): number =>
				(m[r] ?? []).filter((n) => n.type === t).length;
			expect(count(3, 'elite')).toBe(1);
			expect(count(6, 'elite')).toBe(1);
			expect(count(4, 'shop')).toBe(1);
			expect(count(7, 'shop')).toBe(1);
			expect(count(8, 'rest')).toBe(1);
			expect(count(8, 'shop')).toBe(1);
			expect(m[9]?.[0]?.type).toBe('boss');
			for (let r = 0; r < 9; r++) {
				const row = m[r] ?? [];
				const nxt = m[r + 1] ?? [];
				const incoming = new Set<number>();
				for (const n of row) {
					expect(n.next.length).toBeGreaterThanOrEqual(1);
					expect(n.next.length).toBeLessThanOrEqual(2);
					for (const j of n.next) {
						expect(Math.abs(j - n.index)).toBeLessThanOrEqual(1);
						expect(j).toBeLessThan(nxt.length);
						incoming.add(j);
					}
				}
				expect(incoming.size).toBe(nxt.length);
				for (const a of row) {
					for (const b of row) {
						if (a.index < b.index)
							for (const ja of a.next)
								for (const jb of b.next) expect(ja <= jb).toBe(true);
					}
				}
			}
		}
	});

	test('the same seed gives the same map; different seeds differ', () => {
		const a = generateMap({ rng: { map: 5, meta: 0, combat: 0 } });
		const b = generateMap({ rng: { map: 5, meta: 0, combat: 0 } });
		const c = generateMap({ rng: { map: 6, meta: 0, combat: 0 } });
		expect(a).toEqual(b);
		expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
	});

	// Measured on the GDD 4.2 prototype map: event nodes (GDD 22.4) remove fights and are off here.
	function coverage(): number {
		let eligible = 0;
		let complete = 0;
		const events = ALPHA.events;
		ALPHA.events = false;
		for (let seed = 1; seed <= 1500; seed++) {
			const s = createRun(seed, PARTY);
			let idx = Math.floor(rand(s, 'meta') * (s.map[0]?.length ?? 1));
			let combats = 0;
			for (let row = 1; row <= 8; row++) {
				const node = s.map[row - 1]?.[idx];
				if (!node) throw new Error('bad path');
				if (node.type === 'combat' || node.type === 'elite') {
					combats++;
					markSeen(s, chooseEncounter(s, row, node.type));
				}
				idx = node.next[Math.floor(rand(s, 'meta') * node.next.length)] as number;
			}
			if (combats >= 6) {
				eligible++;
				if (s.seenEnemies.length === 10) complete++;
			}
		}
		ALPHA.events = events;
		expect(eligible).toBeGreaterThan(1000);
		return complete / eligible;
	}

	test('encounter selection: strict tiers cover all 10 types on >= 70% of random paths with >= 6 combats', () => {
		expect(ENCOUNTER_RULES.offTierWeight).toBe(0);
		expect(coverage()).toBeGreaterThanOrEqual(0.7);
	});

	test('encounter selection: letting the other tier compete (weight 0.8) reaches >= 95%', () => {
		ENCOUNTER_RULES.offTierWeight = 0.8;
		try {
			expect(coverage()).toBeGreaterThanOrEqual(0.95);
		} finally {
			ENCOUNTER_RULES.offTierWeight = 0;
		}
	});
});

describe('determinism and purity', () => {
	test('same seed and the same commands give the same state (JSON equal)', () => {
		const a = playOut(7, PARTY).s;
		const b = playOut(7, PARTY).s;
		expect(serialize(a)).toBe(serialize(b));
		const c = playOut(8, PARTY).s;
		expect(serialize(a)).not.toBe(serialize(c));
	});

	test('apply never mutates its input; preview equals apply', () => {
		let s = createRun(3, PARTY);
		for (let i = 0; i < 400; i++) {
			const cmd = chooseBotCommand(s);
			if (!cmd) break;
			const before = serialize(s);
			const p = preview(s, cmd);
			const r = apply(s, cmd);
			expect(serialize(s)).toBe(before);
			expect(serialize(p.state)).toBe(serialize(r.state));
			expect(p.events).toEqual(r.events);
			s = r.state;
		}
	});

	test('serialize / deserialize round trip; corrupt or unknown saves give null', () => {
		const s = playOut(2, PARTY).s;
		expect(deserialize(serialize(s))).toEqual(s);
		expect(deserialize('{"version":1')).toBeNull();
		expect(deserialize('42')).toBeNull();
		expect(deserialize(JSON.stringify({ ...s, version: 2 }))).toBeNull();
		expect(
			deserialize(
				JSON.stringify({
					...s,
					deck: [{ uid: 1, cardId: 'nope', upgraded: false, owner: 'marksman' }],
				}),
			),
		).toBeNull();
	});

	test('a save taken in the middle of a combat resumes identically', () => {
		let s = createRun(9, PARTY);
		for (let i = 0; i < 30 && s.phase !== 'combat'; i++)
			s = apply(s, chooseBotCommand(s) as Command).state;
		s = apply(s, chooseBotCommand(s) as Command).state;
		const loaded = deserialize(serialize(s)) as RunState;
		const next = chooseBotCommand(s) as Command;
		expect(serialize(apply(loaded, next).state)).toBe(serialize(apply(s, next).state));
	});
});

describe('Act 1 integration (bot)', () => {
	test('200 seeds over all 10 compositions finish without an invalid command', () => {
		const all = trios();
		let wins = 0;
		for (let seed = 1; seed <= 200; seed++) {
			const party = all[seed % all.length] as HeroClass[];
			const { s } = playOut(seed, party);
			expect(['victory', 'defeat']).toContain(s.phase);
			expect(currentScreen(s)).toBe('summary');
			if (s.phase === 'victory') wins++;
			expect(embers(s)).toBe(2 * s.roundsCleared + 5 * s.elitesWon + 15 * s.bossesWon);
		}
		expect(wins).toBeGreaterThan(0);
	}, 60000);

	test('views match the phase', () => {
		let s = createRun(4, PARTY);
		expect(currentScreen(s)).toBe('map');
		expect(mapView(s)?.available).toHaveLength(2);
		for (let i = 0; i < 10 && s.phase !== 'combat'; i++)
			s = apply(s, chooseBotCommand(s) as Command).state;
		expect(currentScreen(s)).toBe('combat');
		const v = combatView(s);
		expect(v?.hand).toHaveLength(5);
		expect(v?.queue.length).toBe(v?.enemies.length);
		expect(v?.hand.every((c) => c.playable === (c.reason === null))).toBe(true);
	});
});

describe('economy (GDD 4.4-4.6, 11)', () => {
	test('start gold 50; combat gold 10-16; reward offers 3 distinct cards', () => {
		const s = createRun(5, PARTY);
		expect(s.gold).toBe(50);
		const offer = makeCardOffer(s, 'common');
		expect(offer).toHaveLength(3);
		expect(new Set(offer).size).toBe(3);
		for (const id of offer) expect(PARTY).toContain(CARDS[id]?.owner as HeroClass);
	});

	test('rare pity: +2 points per offer without a rare, max +20, reset on a rare', () => {
		const s = createRun(11, PARTY);
		let last = 0;
		let sawReset = false;
		for (let i = 0; i < 200; i++) {
			const offer = makeCardOffer(s, 'common');
			const hasRare = offer.some((id) => CARDS[id]?.rarity === 'rare');
			if (hasRare) {
				expect(s.rarePity).toBe(0);
				sawReset = true;
			} else {
				expect(s.rarePity).toBe(Math.min(20, last + 2));
			}
			last = s.rarePity;
		}
		expect(sawReset).toBe(true);
	});

	test('boss reward is 3 distinct rares', () => {
		const s = createRun(1, PARTY);
		const offer = makeCardOffer(s, 'boss');
		expect(offer).toHaveLength(3);
		expect(offer.every((id) => CARDS[id]?.rarity === 'rare')).toBe(true);
	});

	test('shop stock: 3 common, 1 uncommon, 1 rare, prices in range; removal price grows by 25', () => {
		for (let seed = 1; seed <= 50; seed++) {
			const s = createRun(seed, PARTY);
			const shop = makeShop(s);
			expect(shop.cards).toHaveLength(5);
			const by = (r: string): number[] =>
				shop.cards.filter((o) => CARDS[o.cardId]?.rarity === r).map((o) => o.price);
			expect(by('common')).toHaveLength(3);
			for (const p of by('common')) expect(p >= 40 && p <= 48).toBe(true);
			for (const p of by('uncommon')) expect(p >= 62 && p <= 75).toBe(true);
			for (const p of by('rare')) expect(p >= 110 && p <= 130).toBe(true);
			expect(shop.equipment.length).toBe(2);
		}
		const s = createRun(1, PARTY);
		expect(removalPrice(s)).toBe(50);
		s.removals = 2;
		expect(removalPrice(s)).toBe(100);
	});

	test('camp: buying spends gold, sold items cannot be bought twice; leaving returns to the map', () => {
		let s = createRun(6, PARTY);
		for (let i = 0; i < 200 && s.phase !== 'camp'; i++)
			s = apply(s, chooseBotCommand(s) as Command).state;
		expect(s.phase).toBe('camp');
		s.gold = 500;
		const offer = s.camp?.card;
		expect(offer).toBeTruthy();
		const r = run(s, { type: 'campBuy', offer: 'card' });
		expect(r.s.gold).toBe(500 - (offer?.price ?? 0));
		expect(r.s.deck.length).toBe(s.deck.length + 1);
		const again = run(r.s, { type: 'campBuy', offer: 'card' });
		expect(invalidOf(again.ev)).toHaveLength(1);
		const swap = run(again.s, { type: 'campSwap', leave: 'marksman', join: 'bombardier' });
		expect(invalidOf(swap.ev)).toHaveLength(0);
		expect(swap.s.party.map((h) => h.id)).toEqual(['shieldbearer', 'confessor', 'bombardier']);
		expect(swap.s.deck.filter((c) => c.owner === 'marksman')).toHaveLength(0);
		expect(swap.s.deck.filter((c) => c.owner === 'bombardier')).toHaveLength(4);
		const left = run(swap.s, { type: 'campLeave' });
		expect(left.s.phase).toBe('map');
	});

	test('rest: Recover heals 30% of max HP and clears injury; Pray -5 stress', () => {
		let s = createRun(1, PARTY);
		s.phase = 'rest';
		const h0 = s.party[0];
		if (!h0) throw new Error('no hero');
		h0.hp = 10;
		h0.injured = true;
		h0.stress = 8;
		const r = run(s, { type: 'restChoose', option: 'recover' });
		const h = r.s.party[0];
		expect(h?.injured).toBe(false);
		expect(h?.hp).toBe(10 + Math.floor(60 * 0.3));
		s = createRun(1, PARTY);
		s.phase = 'rest';
		const hp = s.party[0];
		if (hp) hp.stress = 8;
		const p = run(s, { type: 'restChoose', option: 'pray' });
		expect(p.s.party[0]?.stress).toBe(3);
		expect(p.s.phase).toBe('camp');
	});

	test('equip moves items between stash and hero slots and rejects the wrong slot', () => {
		let s = createRun(1, PARTY);
		s.stash = ['eq_notched_blade', 'eq_bone_reliquary'];
		let r = run(s, {
			type: 'equip',
			heroId: 'shieldbearer',
			slot: 'weapon',
			item: 'eq_notched_blade',
		});
		s = r.s;
		expect(s.party[0]?.weapon).toBe('eq_notched_blade');
		expect(s.stash).toEqual(['eq_bone_reliquary']);
		r = run(s, {
			type: 'equip',
			heroId: 'shieldbearer',
			slot: 'weapon',
			item: 'eq_bone_reliquary',
		});
		expect(invalidOf(r.ev)).toHaveLength(1);
		r = run(s, {
			type: 'equip',
			heroId: 'shieldbearer',
			slot: 'relic',
			item: 'eq_bone_reliquary',
		});
		expect(r.s.party[0]?.relic).toBe('eq_bone_reliquary');
		r = run(r.s, { type: 'equip', heroId: 'shieldbearer', slot: 'weapon', item: null });
		expect(r.s.stash).toContain('eq_notched_blade');
	});

	test('victory grants the legendary item and 15 embers for the boss', () => {
		let s = createRun(1, PARTY);
		s = { ...s, roundsCleared: 9, bossesWon: 0 };
		expect(embers({ ...s, roundsCleared: 10, bossesWon: 1, elitesWon: 1 })).toBe(20 + 5 + 15);
	});
});
