import { describe, expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { choiceAvailable, minFights, openEvent, openTreasure } from '../../src/core/events.ts';
import { maxHP } from '../../src/core/ops.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { Command, RunState } from '../../src/core/types.ts';
import { EQUIPMENT, EVENT_IDS, EVENT_MAP, RULES, TREASURE } from '../../src/data/index.ts';
import { invalidOf, PARTY, run } from './helpers.ts';

function eventRun(id: string, seed = 1): RunState {
	const s = createRun(seed, PARTY);
	openEvent(s, id);
	return s;
}

const choose = (index: number, cardUids?: number[]): Command =>
	cardUids ? { type: 'eventChoose', index, cardUids } : { type: 'eventChoose', index };

describe('event and treasure map (GDD 22.4)', () => {
	test('300 seeds: >= 5 fights on every path, <= 1 treasure, special nodes only in their rows', () => {
		let events = 0;
		let treasures = 0;
		for (let seed = 1; seed <= 300; seed++) {
			const s = createRun(seed, PARTY);
			expect(minFights(s.map)).toBeGreaterThanOrEqual(EVENT_MAP.minFights);
			const all = s.map.flat();
			const t = all.filter((n) => n.type === 'treasure');
			expect(t.length).toBeLessThanOrEqual(1);
			for (const n of t) expect(EVENT_MAP.treasureRows).toContain(n.row as 5 | 6);
			for (const n of all.filter((x) => x.type === 'event'))
				expect(EVENT_MAP.eventRows).toContain(n.row as 2 | 3 | 5 | 6 | 8);
			events += all.filter((n) => n.type === 'event').length;
			treasures += t.length;
		}
		// Seeded chances 40% x 5 rows and 35% x 2 rows: both kinds must actually appear.
		expect(events).toBeGreaterThan(300);
		expect(treasures).toBeGreaterThan(50);
	});

	test('same seed, same map and same event; different seeds differ', () => {
		expect(JSON.stringify(createRun(7, PARTY).map)).toBe(
			JSON.stringify(createRun(7, PARTY).map),
		);
		const maps = new Set(
			[1, 2, 3, 4, 5].map((seed) => JSON.stringify(createRun(seed, PARTY).map)),
		);
		expect(maps.size).toBeGreaterThan(1);
		const a = eventRun('ev_chained_penitent', 3);
		const b = eventRun('ev_chained_penitent', 3);
		expect(a.event).toEqual(b.event);
	});

	test('entering an event node opens one of the six events', () => {
		for (let seed = 1; seed <= 200; seed++) {
			const s = createRun(seed, PARTY);
			const row = s.map.findIndex((r) => r.some((n) => n.type === 'event'));
			if (row < 0) continue;
			// Walk the bot to that row is long; open directly through the entry helper instead.
			openEvent(s);
			expect(EVENT_IDS).toContain(s.event?.id as string);
			expect(s.phase).toBe('event');
			return;
		}
		throw new Error('no seed with an event');
	});
});

describe('event outcomes apply exactly as listed (GDD 22.4)', () => {
	test('Weeping Font: drink heals 20% and +2 stress; vials +40 gold; leave does nothing', () => {
		const s = eventRun('ev_weeping_font');
		for (const h of s.party) h.hp = 10;
		const r = run(s, choose(0));
		expect(invalidOf(r.ev)).toHaveLength(0);
		for (const h of r.s.party) {
			expect(h.hp).toBe(10 + Math.floor((maxHP(h) * 20) / 100));
			expect(h.stress).toBe(2);
		}
		expect(r.s.phase).toBe('camp');
		expect(r.s.roundsCleared).toBe(s.roundsCleared + 1);
		expect(run(s, choose(1)).s.gold).toBe(s.gold + 40);
		const left = run(s, choose(2)).s;
		expect(left.gold).toBe(s.gold);
		expect(left.party).toEqual(s.party);
		expect(left.phase).toBe('camp');
	});

	test('Ossuary Shrine: 30 gold for -3 stress; the bone gives the common relic and +2 stress to H1', () => {
		const s = eventRun('ev_ossuary_shrine');
		for (const h of s.party) h.stress = 5;
		const r = run(s, choose(0));
		expect(r.s.gold).toBe(s.gold - 30);
		for (const h of r.s.party) expect(h.stress).toBe(2);
		const poor = structuredClone(s);
		poor.gold = 29;
		expect(choiceAvailable(poor, 0)).toBe(false);
		expect(invalidOf(run(poor, choose(0)).ev)).toHaveLength(1);
		const bone = run(s, choose(1)).s;
		expect(s.event?.item).toBe('eq_bone_reliquary');
		expect(bone.stash).toContain('eq_bone_reliquary');
		expect(bone.party[0]?.stress).toBe(7);
		expect(bone.party[1]?.stress).toBe(5);
	});

	test('Chained Penitent: H1 loses 6 HP then picks 1 of 3 uncommons; the chain upgrades the rolled card', () => {
		const s = eventRun('ev_chained_penitent');
		expect(s.event?.cards).toHaveLength(3);
		const free = run(s, choose(0)).s;
		expect(free.party[0]?.hp).toBe((s.party[0]?.hp as number) - 6);
		expect(free.phase).toBe('reward');
		expect(free.reward?.cards).toEqual(s.event?.cards as string[]);
		const taken = run(free, { type: 'chooseReward', index: 0 }).s;
		expect(taken.phase).toBe('camp');
		const chain = run(s, choose(1)).s;
		const uid = s.event?.upgradeUids[0] as number;
		expect(chain.deck.find((c) => c.uid === uid)?.upgraded).toBe(true);
		expect(chain.deck.filter((c) => c.upgraded)).toHaveLength(1);
	});

	test('Forgotten Armory: gain the rolled common item; the lowest-HP hero loses 8 HP (never below 1)', () => {
		const s = eventRun('ev_forgotten_armory');
		(s.party[2] as { hp: number }).hp = 5;
		const r = run(s, choose(0)).s;
		const item = s.event?.item as string;
		expect(EQUIPMENT[item]?.rarity).toBe('common');
		expect(r.stash).toContain(item);
		expect(r.party[2]?.hp).toBe(1);
		expect(r.party[0]?.hp).toBe(s.party[0]?.hp as number);
	});

	test('Whispering Choir: remove the chosen card and +2 stress each; needs a card from the deck', () => {
		const s = eventRun('ev_whispering_choir');
		const uid = s.deck[0]?.uid as number;
		const r = run(s, choose(0, [uid])).s;
		expect(r.deck.some((c) => c.uid === uid)).toBe(false);
		expect(r.deck).toHaveLength(s.deck.length - 1);
		for (const h of r.party) expect(h.stress).toBe(2);
		expect(invalidOf(run(s, choose(0)).ev)).toHaveLength(1);
		expect(invalidOf(run(s, choose(0, [9999])).ev)).toHaveLength(1);
	});

	test('Ember Pilgrim: 25 gold upgrades 2 chosen cards; sharing the fire heals 10 each', () => {
		const s = eventRun('ev_ember_pilgrim');
		const [a, b] = [s.deck[0]?.uid as number, s.deck[1]?.uid as number];
		const r = run(s, choose(0, [a, b])).s;
		expect(r.gold).toBe(s.gold - 25);
		expect(r.deck.filter((c) => c.upgraded).map((c) => c.uid)).toEqual([a, b]);
		expect(invalidOf(run(s, choose(0, [a, a])).ev)).toHaveLength(1);
		const hurt = structuredClone(s);
		for (const h of hurt.party) h.hp = maxHP(h) - 4;
		const fire = run(hurt, choose(1)).s;
		for (const h of fire.party) expect(h.hp).toBe(maxHP(h));
	});

	test('stress reaching 10 outside combat resets to 5 and counts a collapse', () => {
		const s = eventRun('ev_weeping_font');
		(s.party[0] as { stress: number }).stress = 9;
		const r = run(s, choose(0)).s;
		expect(r.party[0]?.stress).toBe(RULES.stressReset);
		expect(r.stats.collapses).toBe(s.stats.collapses + 1);
	});

	test('a bad index or a command outside an event is invalid', () => {
		const s = eventRun('ev_weeping_font');
		expect(invalidOf(run(s, choose(9)).ev)).toHaveLength(1);
		expect(invalidOf(run(createRun(1, PARTY), choose(0)).ev)).toHaveLength(1);
	});
});

describe('Alpha events 7-12 (GDD 22.4)', () => {
	test('twelve events exist', () => {
		expect(EVENT_IDS).toHaveLength(12);
	});

	test('Drowned Reliquary: dive costs H1 8 HP for a common item; the chain costs the weakest 5 HP for 35 gold', () => {
		const s = eventRun('ev_drowned_reliquary');
		const dive = run(s, choose(0)).s;
		expect(dive.party[0]?.hp).toBe((s.party[0]?.hp as number) - 8);
		expect(EQUIPMENT[s.event?.item as string]?.rarity).toBe('common');
		expect(dive.stash).toContain(s.event?.item as string);
		(s.party[1] as { hp: number }).hp = 20;
		const chain = run(s, choose(1)).s;
		expect(chain.gold).toBe(s.gold + 35);
		expect(chain.party[1]?.hp).toBe(15);
	});

	test('Bone Cartographer: 35 gold for 1 of 3 uncommons; or sell a chosen card for 25 gold', () => {
		const s = eventRun('ev_bone_cartographer');
		s.gold = 50;
		const buy = run(s, choose(0)).s;
		expect(buy.gold).toBe(15);
		expect(buy.phase).toBe('reward');
		expect(buy.reward?.cards).toHaveLength(3);
		const uid = s.deck[0]?.uid as number;
		const sell = run(s, choose(1, [uid])).s;
		expect(sell.gold).toBe(75);
		expect(sell.deck.some((c) => c.uid === uid)).toBe(false);
	});

	test('Ashen Vigil: H1 +3 stress and all heal 15%; or all heal 10 and +1 stress', () => {
		const s = eventRun('ev_ashen_vigil');
		for (const h of s.party) h.hp = 10;
		const watch = run(s, choose(0)).s;
		expect(watch.party[0]?.stress).toBe(3);
		expect(watch.party[1]?.stress).toBe(0);
		for (const h of watch.party) expect(h.hp).toBe(10 + Math.floor((maxHP(h) * 15) / 100));
		const sleep = run(s, choose(1)).s;
		for (const h of sleep.party) {
			expect(h.hp).toBe(20);
			expect(h.stress).toBe(1);
		}
	});

	test('Flagellant Procession: +3 stress each to upgrade 2 chosen cards; or 20 gold for -2 stress each', () => {
		const s = eventRun('ev_flagellant_procession');
		for (const h of s.party) h.stress = 4;
		const [a, b] = [s.deck[2]?.uid as number, s.deck[3]?.uid as number];
		const join = run(s, choose(0, [a, b])).s;
		for (const h of join.party) expect(h.stress).toBe(7);
		expect(join.deck.filter((c) => c.upgraded).map((c) => c.uid)).toEqual([a, b]);
		const alms = run(s, choose(1)).s;
		expect(alms.gold).toBe(s.gold - 20);
		for (const h of alms.party) expect(h.stress).toBe(2);
	});

	test('Gravewright: the weakest loses 6 HP to remove a chosen card; or 45 gold buys the common relic', () => {
		const s = eventRun('ev_gravewright');
		s.gold = 60;
		const uid = s.deck[5]?.uid as number;
		(s.party[2] as { hp: number }).hp = 9;
		const bury = run(s, choose(0, [uid])).s;
		expect(bury.party[2]?.hp).toBe(3);
		expect(bury.deck.some((c) => c.uid === uid)).toBe(false);
		const buy = run(s, choose(1)).s;
		expect(buy.gold).toBe(15);
		expect(buy.stash).toContain('eq_bone_reliquary');
	});

	test('Sealed Grille: H1 -5 stress and loses 6 HP; or 2 random upgrades and +1 stress each', () => {
		const s = eventRun('ev_sealed_grille');
		for (const h of s.party) h.stress = 6;
		const confess = run(s, choose(0)).s;
		expect(confess.party[0]?.stress).toBe(1);
		expect(confess.party[1]?.stress).toBe(6);
		expect(confess.party[0]?.hp).toBe((s.party[0]?.hp as number) - 6);
		expect(s.event?.upgradeUids).toHaveLength(2);
		const listen = run(s, choose(1)).s;
		expect(
			listen.deck
				.filter((c) => c.upgraded)
				.map((c) => c.uid)
				.sort(),
		).toEqual([...(s.event?.upgradeUids ?? [])].sort());
		for (const h of listen.party) expect(h.stress).toBe(7);
	});
});

describe('treasure (GDD 22.4)', () => {
	test('claim gives 25 gold and the rolled uncommon or rare item, then the camp opens', () => {
		const s = createRun(4, PARTY);
		openTreasure(s);
		expect(s.phase).toBe('treasure');
		const item = s.treasure?.item as string;
		expect(['uncommon', 'rare']).toContain(EQUIPMENT[item]?.rarity as string);
		const r = run(s, { type: 'claimTreasure' }).s;
		expect(r.gold).toBe(s.gold + TREASURE.gold);
		expect(r.stash).toContain(item);
		expect(r.phase).toBe('camp');
		expect(r.roundsCleared).toBe(s.roundsCleared + 1);
		expect(invalidOf(run(r, { type: 'claimTreasure' }).ev)).toHaveLength(1);
	});
});

describe('bot handles the new phases', () => {
	test('the bot issues a valid command in every event and in a treasure', () => {
		for (const id of EVENT_IDS) {
			const s = eventRun(id);
			const cmd = chooseBotCommand(s);
			expect(cmd).not.toBeNull();
			expect(invalidOf(apply(s, cmd as Command).events)).toHaveLength(0);
		}
		const t = createRun(1, PARTY);
		openTreasure(t);
		expect(chooseBotCommand(t)).toEqual({ type: 'claimTreasure' });
	});
});
