import { describe, expect, test } from 'bun:test';
import { intentOf, startCombat } from '../../src/core/combat.ts';
import { emptyProfile, parseProfile, recordWin } from '../../src/core/meta.ts';
import { fallHero, maxHP } from '../../src/core/ops.ts';
import { makeCamp, makeShop, removalPrice } from '../../src/core/rewards.ts';
import { applyRite, riteLevel } from '../../src/core/rites.ts';
import { createRun, deserialize, serialize } from '../../src/core/run.ts';
import type { RunState } from '../../src/core/types.ts';
import { campView } from '../../src/core/views.ts';
import { CAMP, ELITE, ENEMIES, GOLD, HEROES, RITES, SHOP } from '../../src/data/index.ts';
import { combat, ctxOf, PARTY, run } from './helpers.ts';

const at = (rite: number, seed = 1): RunState => applyRite(createRun(seed, PARTY), rite);

describe('Rites (GDD 13.3)', () => {
	test('rite 0 changes nothing; level is clamped to 0-10; old saves read as 0', () => {
		const base = createRun(1, PARTY);
		expect(at(0)).toEqual({ ...base, rite: 0 });
		expect(riteLevel(at(-3))).toBe(0);
		expect(riteLevel(at(42))).toBe(RITES.max);
		const old = JSON.parse(serialize(base)) as Record<string, unknown>;
		delete old.rite;
		const loaded = deserialize(JSON.stringify(old));
		expect(loaded && riteLevel(loaded)).toBe(0);
	});

	test('1: elites +20% HP (only the elite unit)', () => {
		for (const [rite, mul] of [
			[0, 1],
			[1, RITES.eliteHpMul],
		] as const) {
			const s = at(rite);
			startCombat(ctxOf(s), 'EL1', 'elite');
			const [elite, escort] = combat(s).enemies;
			expect(elite?.maxHP).toBe(Math.round(34 * ELITE.hpMul * mul));
			expect(escort?.maxHP).toBe(ENEMIES.ash_acolyte?.hp as number);
		}
	});

	test('2: common enemies deal +7.5% damage; elites and bosses do not', () => {
		const s = at(2);
		startCombat(ctxOf(s), 'EL1', 'elite');
		const [elite, escort] = combat(s).enemies;
		expect(elite?.dmgMul).toBe(ELITE.damageMul);
		expect(escort?.dmgMul).toBe(RITES.commonDamageMul);
		const b = at(2);
		startCombat(ctxOf(b), 'BOSS', 'boss');
		expect(combat(b).enemies[0]?.dmgMul).toBe(1);
		expect(at(1).gold).toBe(GOLD.start);
	});

	test('3: start with 30 gold; 6: heroes start with 2 stress', () => {
		expect(at(3).gold).toBe(RITES.startGold);
		expect(at(5).party.every((h) => h.stress === 0)).toBe(true);
		expect(at(6).party.every((h) => h.stress === RITES.startStress)).toBe(true);
	});

	test('4: boss +20% HP', () => {
		const s = at(4);
		startCombat(ctxOf(s), 'BOSS', 'boss');
		expect(combat(s).enemies[0]?.maxHP).toBe(Math.round(100 * RITES.bossHpMul));
	});

	test('5: Recover heals 20% instead of 30%', () => {
		const s = at(5);
		s.phase = 'rest';
		for (const h of s.party) h.hp = 1;
		const r = run(s, { type: 'restChoose', option: 'recover' }).s;
		for (const h of r.party) expect(h.hp).toBe(1 + Math.floor((maxHP(h) * 20) / 100));
	});

	test('7: shop and camp prices +15%', () => {
		const price = (n: number): number => Math.round(n * RITES.priceMul);
		const a = at(6, 3);
		const b = at(7, 3);
		const shopA = makeShop(structuredClone(a));
		const shopB = makeShop(structuredClone(b));
		for (const [i, o] of shopA.cards.entries())
			expect(shopB.cards[i]?.price).toBe(price(o.price));
		for (const [i, o] of shopA.equipment.entries()) {
			expect(shopB.equipment[i]?.price).toBe(price(o.price));
		}
		expect(removalPrice(b)).toBe(price(SHOP.removalBase));
		const campA = makeCamp(structuredClone(a));
		const campB = makeCamp(structuredClone(b));
		expect(campB.card?.price).toBe(price(campA.card?.price as number));
		expect(campB.service.price).toBe(price(CAMP.servicePrice));
		b.camp = campB;
		b.phase = 'camp';
		expect(campView(b)?.swapPrice).toBe(price(CAMP.swapPrice));
		b.gold = price(CAMP.swapPrice) - 1;
		const swap = run(b, { type: 'campSwap', leave: 'marksman', join: 'arcanist' });
		expect(swap.ev.some((e) => e.type === 'invalid')).toBe(true);
	});

	test('8: every enemy starts combat with 1 Might', () => {
		const s = at(8);
		startCombat(ctxOf(s), 'B3', 'common');
		expect(combat(s).enemies.every((e) => e.fx.might === RITES.enemyMight)).toBe(true);
		const p = at(7);
		startCombat(ctxOf(p), 'B3', 'common');
		expect(combat(p).enemies.every((e) => e.fx.might === 0)).toBe(true);
	});

	test('9: a hero who falls at rite 9 is injured by 35%', () => {
		const s = at(9);
		startCombat(ctxOf(s), 'A1', 'common');
		const c = ctxOf(s);
		fallHero(c, 'marksman');
		const k = combat(s);
		for (const e of [...k.enemies]) e.hp = 1;
		// Win the fight through the core: the last enemy dies to a dot at the start of its action.
		for (const e of k.enemies) e.fx.bleed = 1;
		const r = run(s, { type: 'endTurn' }).s;
		const h = r.party.find((x) => x.id === 'marksman');
		expect(h?.injured).toBe(true);
		expect(h && maxHP(h)).toBe(Math.floor(HEROES.marksman.maxHP * RITES.injuryMaxHPMul));
	});

	test('10: boss phase 2 adds a fourth intent from its phase-1 cycle', () => {
		for (const [enc, key] of [
			['BOSS', 'bell_maw'],
			['BOSS2', 'gilded_penitent'],
		] as const) {
			const s = at(10);
			startCombat(ctxOf(s), enc, 'boss');
			const boss = combat(s).enemies[0];
			if (!boss) throw new Error('no boss');
			boss.phase = 2;
			const ids = [0, 1, 2, 3].map((i) => intentOf({ ...boss, intentIdx: i }).id);
			expect(ids[3]).toBe(RITES.bossExtraIntent[key] as string);
			expect(new Set(ids).size).toBe(4);
			const low = at(9);
			startCombat(ctxOf(low), enc, 'boss');
			const b9 = combat(low).enemies[0];
			if (!b9) throw new Error('no boss');
			b9.phase = 2;
			expect(intentOf({ ...b9, intentIdx: 3 }).id).toBe(intentOf({ ...b9, intentIdx: 0 }).id);
		}
	});
});

describe('Rite unlocks in the profile', () => {
	test('default 0; a win at rite n unlocks n+1, capped at 10, never lowered', () => {
		expect(emptyProfile().unlockedRite).toBe(0);
		expect(parseProfile({}).unlockedRite).toBe(0);
		expect(parseProfile({ unlockedRite: 4 }).unlockedRite).toBe(4);
		expect(parseProfile({ unlockedRite: 99 }).unlockedRite).toBe(RITES.max);
		expect(parseProfile({ unlockedRite: 'x' }).unlockedRite).toBe(0);
		const p = recordWin(emptyProfile(), 0);
		expect(p.unlockedRite).toBe(1);
		expect(recordWin(p, 0).unlockedRite).toBe(1);
		expect(recordWin({ ...p, unlockedRite: 5 }, 2).unlockedRite).toBe(5);
		expect(recordWin(p, 10).unlockedRite).toBe(RITES.max);
	});
});
