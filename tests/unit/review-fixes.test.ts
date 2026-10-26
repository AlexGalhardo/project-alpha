import { describe, expect, test } from 'bun:test';
import { intentView } from '../../src/core/combat.ts';
import { makeCamp, makeShop } from '../../src/core/rewards.ts';
import { createRun } from '../../src/core/run.ts';
import { CAMP, CARDS, ENEMIES, EQUIPMENT, SHOP } from '../../src/data/index.ts';
import { combat, combatRun, enemyTarget, isolate, PARTY, run, setHand } from './helpers.ts';

// Regressions for the 2026-10-26 core review against GDD 4-14.
describe('core review fixes', () => {
	test('a boss phase change during its pre-action Bleed tick ends that action (GDD 10.5)', () => {
		const s = combatRun('BOSS', PARTY, 1, 'boss');
		const boss = combat(s).enemies[0];
		if (!boss) throw new Error('no boss');
		boss.hp = 52;
		boss.fx.bleed = 5;
		boss.intentIdx = 1;
		const r = run(s, { type: 'endTurn' });
		const after = combat(r.s).enemies[0];
		if (!after) throw new Error('boss gone');
		expect(after.phase).toBe(2);
		expect(r.ev.some((e) => e.type === 'enemyAction' && e.uid === boss.uid)).toBe(false);
		expect(after.intentIdx).toBe(0);
		expect(intentView(r.s, after).intentId).toBe('peal');
	});

	test('boss phase 2 keeps Stunned', () => {
		const s = combatRun('BOSS', PARTY, 1, 'boss');
		const boss = combat(s).enemies[0];
		if (!boss) throw new Error('no boss');
		boss.hp = 54;
		boss.fx.stunned = true;
		const [uid] = setHand(s, ['mrk_aimed_shot']);
		const r = run(s, {
			type: 'playCard',
			cardUid: uid as number,
			target: enemyTarget(boss.uid),
		});
		expect(combat(r.s).enemies[0]?.phase).toBe(2);
		expect(combat(r.s).enemies[0]?.fx.stunned).toBe(true);
	});

	test('Powder Keg explodes even when the triggering hit kills its carrier', () => {
		let s = combatRun('B3', ['shieldbearer', 'confessor', 'bombardier']);
		const first = combat(s).enemies[0];
		if (!first) throw new Error('no enemy');
		first.keg = 10;
		first.hp = 3;
		const hpBefore = combat(s).enemies[1]?.hp as number;
		const [hack] = setHand(s, ['shb_hack']);
		s = run(s, { type: 'playCard', cardUid: hack as number, target: enemyTarget(first.uid) }).s;
		expect(combat(s).enemies.some((e) => e.uid === first.uid)).toBe(false);
		expect(hpBefore - (combat(s).enemies[0]?.hp as number)).toBe(10);
	});

	test('Bulwark keeps only its own Block through the reset', () => {
		let s = combatRun('A1');
		isolate(s, 'ossified_brute');
		const [bulwark, stance] = setHand(s, ['shb_bulwark', 'shb_iron_stance']);
		s = run(s, { type: 'playCard', cardUid: bulwark as number, target: null }).s;
		s = run(s, { type: 'playCard', cardUid: stance as number, target: null }).s;
		expect(combat(s).heroFx.shieldbearer?.block).toBe(18);
		s = run(s, { type: 'endTurn' }).s;
		expect(combat(s).heroFx.shieldbearer?.block).toBe(14);
	});

	test('camp equipment priced by the rarity actually picked after fallback', () => {
		const s = createRun(1, PARTY);
		s.stash = Object.values(EQUIPMENT)
			.filter((e) => e.rarity === 'common' || e.rarity === 'uncommon')
			.map((e) => e.key);
		const camp = makeCamp(s);
		const item = camp.equipment?.item as string;
		expect(EQUIPMENT[item]?.rarity).toBe('rare');
		expect(camp.equipment?.price).toBe(CAMP.equipmentPrice.rare);
	});

	test('shop cards priced by the rarity actually picked after fallback', () => {
		const counts = SHOP.cardCounts as { rare: number };
		const saved = counts.rare;
		counts.rare = 6;
		try {
			const shop = makeShop(createRun(1, PARTY));
			for (const o of shop.cards) {
				const rarity = CARDS[o.cardId]?.rarity as 'common' | 'uncommon' | 'rare';
				const [lo, hi] = SHOP.cardPrice[rarity];
				expect(o.price).toBeGreaterThanOrEqual(lo);
				expect(o.price).toBeLessThanOrEqual(hi);
			}
		} finally {
			counts.rare = saved;
		}
	});

	test('enemy self-heal emits an enemyHeal event', () => {
		const s = combatRun('A1');
		const e = isolate(s, 'lantern_leech');
		e.hp = 5;
		const r = run(s, { type: 'endTurn' });
		expect(r.ev).toContainEqual({ type: 'enemyHeal', uid: e.uid, amount: 5 });
	});

	test('Lantern Leech Lure applies 2 Marked so it survives one decay', () => {
		const lure = ENEMIES.lantern_leech?.intents.find((i) => i.id === 'lure');
		expect(lure?.effects).toContainEqual({ kind: 'status', status: 'marked', amount: 2 });
	});
});
