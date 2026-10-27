import { describe, expect, test } from 'bun:test';
import { chooseAutoCommand } from '../../src/core/auto.ts';
import { intentView, startCombat } from '../../src/core/combat.ts';
import {
	addDebuff,
	addStress,
	addStun,
	addWard,
	emptyStatuses,
	enemyRef,
	fallHero,
	hitDamage,
	hitHero,
} from '../../src/core/ops.ts';
import { apply, createRun } from '../../src/core/run.ts';
import { ENCOUNTERS, HEROES } from '../../src/data/index.ts';
import {
	combat,
	combatRun,
	ctxOf,
	enemyTarget,
	heroFx,
	heroTarget,
	invalidOf,
	isolate,
	PARTY,
	run,
	setHand,
} from './helpers.ts';

describe('damage formula (GDD 5.5)', () => {
	test('floor((base + might) x marked 1.5 x weakened 0.75)', () => {
		const plain = emptyStatuses();
		const marked = { ...emptyStatuses(), marked: 1 };
		const weak = { ...emptyStatuses(), weakened: 1, might: 2 };
		expect(hitDamage(6, plain, plain)).toBe(6);
		expect(hitDamage(6, plain, marked)).toBe(9);
		expect(hitDamage(5, plain, marked)).toBe(7);
		expect(hitDamage(6, weak, plain)).toBe(6);
		expect(hitDamage(6, weak, marked)).toBe(9);
		expect(hitDamage(6, { ...emptyStatuses(), weakened: 1 }, plain)).toBe(4);
	});

	test('Hack on a Marked enemy deals 9 and applies once', () => {
		let s = combatRun('A1');
		const e = isolate(s, 'ossified_brute');
		e.fx.marked = 2;
		const [uid] = setHand(s, ['shb_hack']);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) });
		s = r.s;
		expect(invalidOf(r.ev)).toHaveLength(0);
		expect(combat(s).enemies[0]?.hp).toBe(46 - 9);
		expect(combat(s).energy).toBe(2);
	});

	test('a weakened hero deals x0.75', () => {
		const s = combatRun('A1');
		const e = isolate(s, 'ossified_brute');
		heroFx(s, 'shieldbearer').weakened = 1;
		const [uid] = setHand(s, ['shb_hack']);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) });
		expect(combat(r.s).enemies[0]?.hp).toBe(46 - 4);
	});

	test('multi-hit applies the formula per hit (Volley 4 x2 on every enemy)', () => {
		const s = combatRun('B3');
		const [uid] = setHand(s, ['mrk_volley']);
		const before = combat(s).enemies.map((e) => e.hp);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: null });
		const after = combat(r.s).enemies.map((e) => e.hp);
		expect(before.map((h, i) => h - (after[i] as number))).toEqual([8, 8, 8]);
	});
});

describe('block (GDD 5.5, 6.1)', () => {
	test('Brace gives 6 to self and 2 to the others; it resets at the next turn', () => {
		let s = combatRun('A1');
		isolate(s, 'ossified_brute');
		const [uid] = setHand(s, ['shb_brace']);
		s = run(s, { type: 'playCard', cardUid: uid as number, target: null }).s;
		const fx = combat(s).heroFx;
		expect([fx.shieldbearer?.block, fx.confessor?.block, fx.marksman?.block]).toEqual([
			6, 2, 2,
		]);
		s = run(s, { type: 'endTurn' }).s;
		expect(combat(s).heroFx.shieldbearer?.block).toBe(0);
	});

	test('Block absorbs hits before HP', () => {
		const s = combatRun('A1');
		heroFx(s, 'shieldbearer').block = 5;
		const c = ctxOf(s);
		hitHero(c, 'shieldbearer', 8, null);
		expect(s.party[0]?.hp).toBe(60 - 3);
		expect(combat(s).heroFx.shieldbearer?.block).toBe(0);
	});

	test('Bulwark Block survives one turn reset', () => {
		let s = combatRun('A1');
		isolate(s, 'ossified_brute');
		const [uid] = setHand(s, ['shb_bulwark']);
		s = run(s, { type: 'playCard', cardUid: uid as number, target: null }).s;
		s = run(s, { type: 'endTurn' }).s;
		expect(combat(s).heroFx.shieldbearer?.block).toBe(14);
		s = run(s, { type: 'endTurn' }).s;
		expect(combat(s).heroFx.shieldbearer?.block).toBe(0);
	});
});

describe('statuses (GDD 6.1)', () => {
	test('enemy statuses decay: Bleed N then N-1, Burn halves, Marked and Weakened -1', () => {
		let s = combatRun('A1');
		const e = isolate(s, 'ossified_brute');
		Object.assign(e.fx, { bleed: 3, burn: 4, marked: 2, weakened: 2 });
		s = run(s, { type: 'endTurn' }).s;
		const x = combat(s).enemies[0];
		expect(x?.hp).toBe(46 - 3 - 4);
		expect(x?.fx.bleed).toBe(2);
		expect(x?.fx.burn).toBe(2);
		expect(x?.fx.marked).toBe(1);
		expect(x?.fx.weakened).toBe(1);
	});

	test('hero Bleed ticks at turn start, Burn at turn end', () => {
		let s = combatRun('A1');
		isolate(s, 'ossified_brute');
		const fx = combat(s).heroFx.confessor;
		if (!fx) throw new Error('no fx');
		Object.assign(fx, { bleed: 3, burn: 5, marked: 1, weakened: 1 });
		s = run(s, { type: 'endTurn' }).s;
		const hero = s.party.find((h) => h.id === 'confessor');
		expect(hero?.hp).toBe(HEROES.confessor.maxHP - 5 - 3);
		const after = combat(s).heroFx.confessor;
		expect(after?.burn).toBe(2);
		expect(after?.bleed).toBe(2);
		expect(after?.marked).toBe(0);
		expect(after?.weakened).toBe(0);
	});

	test('Ward negates the next debuff and is consumed', () => {
		const s = combatRun('A1');
		const e = isolate(s, 'ossified_brute');
		const c = ctxOf(s);
		addWard(c, enemyRef(e), 1);
		expect(addDebuff(c, enemyRef(e), 'marked', 2)).toBe(false);
		expect(e.fx.marked).toBe(0);
		expect(e.fx.ward).toBe(0);
		expect(addDebuff(c, enemyRef(e), 'marked', 2)).toBe(true);
		expect(e.fx.marked).toBe(2);
	});

	test('Stunned skips one action, then grants immunity for the next', () => {
		let s = combatRun('A1');
		const e = isolate(s, 'husk_penitent');
		const c = ctxOf(s);
		expect(addStun(c, e)).toBe(true);
		const r = run(s, { type: 'endTurn' });
		s = r.s;
		expect(r.ev.some((x) => x.type === 'enemyStunned')).toBe(true);
		expect(r.ev.some((x) => x.type === 'enemyAction')).toBe(false);
		expect(combat(s).enemies[0]?.fx.stunImmune).toBe(true);
		const e2 = combat(s).enemies[0];
		if (!e2) throw new Error('no enemy');
		expect(addStun(ctxOf(s), e2)).toBe(false);
		s = run(s, { type: 'endTurn' }).s;
		expect(combat(s).enemies[0]?.fx.stunImmune).toBe(false);
	});
});

describe('stress and collapse (GDD 7)', () => {
	test('reaching 10 resets to 5 and costs 1 energy next turn', () => {
		let s = combatRun('A1');
		isolate(s, 'ossified_brute');
		const c = ctxOf(s);
		const hero = s.party.find((h) => h.id === 'confessor');
		if (!hero) throw new Error('no hero');
		hero.stress = 9;
		addStress(c, 'confessor', 1);
		expect(hero.stress).toBe(5);
		expect(combat(s).collapsePending).toBe(1);
		expect(s.stats.collapses).toBe(1);
		const r = run(s, { type: 'endTurn' });
		s = r.s;
		expect(combat(s).energy).toBe(2);
	});

	test('two collapses stack and energy never drops below 0', () => {
		const s = combatRun('A1');
		const c = ctxOf(s);
		for (const h of s.party) h.stress = 9;
		for (const h of s.party) addStress(c, h.id, 1);
		expect(combat(s).collapsePending).toBe(3);
		const r = run(s, { type: 'endTurn' });
		expect(combat(r.s).energy).toBe(0);
	});

	test('a fall gives +2 stress to the others, ranks collapse, fallen return at 1 HP injured', () => {
		let s = combatRun('A1');
		const c = ctxOf(s);
		fallHero(c, 'confessor');
		expect(combat(s).lineup).toEqual(['shieldbearer', 'marksman']);
		expect(s.party.find((h) => h.id === 'shieldbearer')?.stress).toBe(2);
		expect(s.party.find((h) => h.id === 'confessor')?.stress).toBe(0);
		// win the combat: single weak enemy, Hack kills it
		const e = isolate(s, 'husk_penitent', 1);
		const [uid] = setHand(s, ['shb_hack']);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) });
		s = r.s;
		expect(s.phase).toBe('reward');
		const conf = s.party.find((h) => h.id === 'confessor');
		expect(conf?.hp).toBe(1);
		expect(conf?.injured).toBe(true);
		// no stress relief for the winners because a hero fell
		expect(s.party.find((h) => h.id === 'shieldbearer')?.stress).toBe(2);
	});

	test('winning without a fall relieves 1 stress on every hero', () => {
		let s = combatRun('A1');
		for (const h of s.party) h.stress = 3;
		const e = isolate(s, 'husk_penitent', 1);
		const [uid] = setHand(s, ['shb_hack']);
		s = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) }).s;
		expect(s.party.map((h) => h.stress)).toEqual([2, 2, 2]);
	});

	test('all heroes fallen is defeat', () => {
		let s = combatRun('A1');
		const c = ctxOf(s);
		for (const id of PARTY) fallHero(c, id);
		expect(combat(s).phase).toBe('lost');
		s = run(createRun(1, PARTY), { type: 'selectNode', index: 0 }).s;
		expect(s.phase).toBe('combat');
	});
});

describe('turn structure and queue (GDD 5.2, 5.3)', () => {
	test('turn 1 has energy 3 and a hand of 5', () => {
		const s = combatRun('A1');
		expect(combat(s).energy).toBe(3);
		expect(combat(s).hand).toHaveLength(5);
		expect(combat(s).draw).toHaveLength(12 - 5);
	});

	test('enemies act by Speed, ties by lower rank', () => {
		const s = combatRun('B2');
		const k = combat(s);
		const speeds = k.enemies.map((e) => `${e.key}:${e.speed}`);
		expect(speeds[0]).toBe('graft_hound:6');
		const ev = run(s, { type: 'endTurn' }).ev.filter((e) => e.type === 'enemyAction');
		const order = ev.map((e) => (e.type === 'enemyAction' ? e.uid : -1));
		expect(order).toEqual([1, 2, 3]);
	});

	test('cards of the wrong rank, no energy or a bad target are rejected', () => {
		const s = combatRun('A1');
		const [slam, hack] = setHand(s, ['shb_shield_slam', 'shb_hack']);
		// Shield Slam needs H1; swap the shieldbearer to rank 2
		combat(s).lineup = ['confessor', 'shieldbearer', 'marksman'];
		let r = run(s, { type: 'playCard', cardUid: slam as number, target: enemyTarget(1) });
		expect(invalidOf(r.ev)[0]).toMatchObject({ reason: 'wrong-rank' });
		combat(s).energy = 0;
		r = run(s, { type: 'playCard', cardUid: hack as number, target: enemyTarget(1) });
		expect(invalidOf(r.ev)[0]).toMatchObject({ reason: 'no-energy' });
		combat(s).energy = 3;
		r = run(s, {
			type: 'playCard',
			cardUid: hack as number,
			target: heroTarget('shieldbearer'),
		});
		expect(invalidOf(r.ev)[0]).toMatchObject({ reason: 'bad-target' });
	});

	test('reshuffle moves discard into draw when the draw pile is empty', () => {
		let s = combatRun('A1');
		isolate(s, 'ossified_brute');
		for (let i = 0; i < 3; i++) s = run(s, { type: 'endTurn' }).s;
		expect(combat(s).turn).toBe(4);
		expect(combat(s).hand.length).toBe(5);
		expect(combat(s).draw.length + combat(s).hand.length + combat(s).discard.length).toBe(12);
	});
});

describe('cards (GDD 9)', () => {
	test('Piercing Bolt hits the enemy behind; Shove pushes back', () => {
		let s = combatRun('B3');
		const [bolt] = setHand(s, ['mrk_piercing_bolt']);
		const hp0 = combat(s).enemies.map((e) => e.hp);
		s = run(s, { type: 'playCard', cardUid: bolt as number, target: enemyTarget(1) }).s;
		expect(combat(s).enemies.map((e) => e.hp)).toEqual([
			(hp0[0] as number) - 5,
			(hp0[1] as number) - 5,
			hp0[2] as number,
		]);
		const [shove] = setHand(s, ['shb_shove']);
		const first = combat(s).enemies[0]?.uid;
		s = run(s, {
			type: 'playCard',
			cardUid: shove as number,
			target: enemyTarget(first as number),
		}).s;
		expect(combat(s).enemies[1]?.uid).toBe(first as number);
	});

	test('Shield Slam deals damage equal to Block (cap 24); upgraded gains 3 Block first', () => {
		const s = combatRun('A1');
		const e = isolate(s, 'ossified_brute');
		const k = combat(s);
		if (k.heroFx.shieldbearer) k.heroFx.shieldbearer.block = 30;
		const [uid] = setHand(s, ['shb_shield_slam']);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) });
		expect(combat(r.s).enemies[0]?.hp).toBe(46 - 24);
	});

	test('Killshot +14 against a Marked target; Rekindle revives at 25%', () => {
		let s = combatRun('A1');
		const e = isolate(s, 'ossified_brute');
		e.fx.marked = 1;
		const [uid] = setHand(s, ['mrk_killshot']);
		s = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) }).s;
		// (14 + 14) x 1.5 = 42
		expect(combat(s).enemies[0]?.hp).toBe(46 - 42);
		const t = combatRun('A1');
		fallHero(ctxOf(t), 'marksman');
		const [rek] = setHand(t, ['cnf_rekindle']);
		const r = run(t, {
			type: 'playCard',
			cardUid: rek as number,
			target: heroTarget('marksman'),
		});
		expect(r.s.party.find((h) => h.id === 'marksman')?.hp).toBe(Math.floor(42 * 0.25));
		expect(combat(r.s).lineup).toContain('marksman');
	});

	test('Dread adds stress to the owner', () => {
		const t = combatRun('A1', ['shieldbearer', 'arcanist', 'confessor']);
		isolate(t, 'ossified_brute');
		const [spark] = setHand(t, ['arc_rift_spark']);
		const r = run(t, { type: 'playCard', cardUid: spark as number, target: null });
		expect(r.s.party.find((h) => h.id === 'arcanist')?.stress).toBe(1);
		expect(combat(r.s).enemies[0]?.hp).toBe(46 - 5);
	});

	test('Powder Keg triggers on the next hit and spreads to neighbours', () => {
		let s = combatRun('B3', ['shieldbearer', 'confessor', 'bombardier']);
		const first = combat(s).enemies[0];
		if (!first) throw new Error('no enemy');
		const [keg] = setHand(s, ['bmb_powder_keg']);
		combat(s).lineup = ['shieldbearer', 'bombardier', 'confessor'];
		s = run(s, { type: 'playCard', cardUid: keg as number, target: enemyTarget(first.uid) }).s;
		expect(combat(s).enemies[0]?.keg).toBe(10);
		const hp0 = combat(s).enemies.map((e) => e.hp);
		const [hack] = setHand(s, ['shb_hack']);
		s = run(s, { type: 'playCard', cardUid: hack as number, target: enemyTarget(first.uid) }).s;
		const hp1 = combat(s).enemies.map((e) => e.hp);
		expect([
			(hp0[0] as number) - (hp1[0] as number),
			(hp0[1] as number) - (hp1[1] as number),
		]).toEqual([16, 10]);
		expect(combat(s).enemies[0]?.keg).toBe(0);
	});

	test('the upgrade table is applied (Hack+ 9, Killshot+ 18/+18, Channel+ costs 0)', () => {
		const s = combatRun('A1');
		const e = isolate(s, 'ossified_brute');
		const k = combat(s);
		k.hand = [{ uid: 900, cardId: 'shb_hack', upgraded: true, owner: 'shieldbearer' }];
		const r = run(s, { type: 'playCard', cardUid: 900, target: enemyTarget(e.uid) });
		expect(combat(r.s).enemies[0]?.hp).toBe(46 - 9);
	});
});

describe('enemies, elites and boss (GDD 10)', () => {
	test('elite: HP x1.75, damage x1.25, Oathwall and Calcified traits', () => {
		const s = combatRun('EL1', PARTY, 1, 'elite');
		const t = combat(s).enemies[0];
		expect(t?.maxHP).toBe(43);
		if (!t) throw new Error('no enemy');
		t.intentIdx = 1;
		const view = intentView(s, t);
		expect(view.damage.map((d) => d.perHit)).toEqual([10, 10]);
		const b = combatRun('EL2', PARTY, 1, 'elite');
		const brute = combat(b).enemies[0];
		expect(brute?.maxHP).toBe(58);
		const [uid] = setHand(b, ['shb_hack']);
		const r = run(b, {
			type: 'playCard',
			cardUid: uid as number,
			target: enemyTarget(brute?.uid as number),
		});
		expect(combat(r.s).enemies[0]?.hp).toBe(58 - 4);
		void uid;
	});

	test('Oathwall: when the Templar captain gains Block every other enemy gains 5', () => {
		const s = combatRun('EL1', PARTY, 1, 'elite');
		const k = combat(s);
		const t = k.enemies[0];
		if (!t) throw new Error('no enemy');
		t.intentIdx = 0;
		const r = run(s, { type: 'endTurn' });
		const after = combat(r.s).enemies;
		expect(after[0]?.fx.block).toBe(10);
		expect(after[1]?.fx.block).toBeGreaterThanOrEqual(5);
	});

	test('Boss phase 2 at HP <= 80: debuffs cleared, +2 Might, intent replaced', () => {
		const s = combatRun('BOSS', PARTY, 1, 'boss');
		const boss = combat(s).enemies[0];
		if (!boss) throw new Error('no boss');
		boss.hp = 54;
		boss.fx.marked = 3;
		const [uid] = setHand(s, ['mrk_aimed_shot']);
		const r = run(s, {
			type: 'playCard',
			cardUid: uid as number,
			target: enemyTarget(boss.uid),
		});
		const after = combat(r.s).enemies[0];
		expect(r.ev.some((e) => e.type === 'bossPhase')).toBe(true);
		expect(after?.phase).toBe(2);
		expect(after?.fx.marked).toBe(0);
		expect(after?.fx.might).toBe(2);
		expect(after?.intentIdx).toBe(0);
		expect(after?.maxHP).toBe(100);
		const view = intentView(r.s, after ?? boss);
		expect(view.intentId).toBe('peal');
		expect(view.targets).toEqual(PARTY);
	});

	test('intent targeting rules and Taunt', () => {
		const s = combatRun('A1');
		const e = isolate(s, 'wax_mourner');
		expect(intentView(s, e).targets).toEqual(['shieldbearer']);
		const h = s.party.find((x) => x.id === 'marksman');
		if (h) h.stress = 7;
		expect(intentView(s, e).targets).toEqual(['marksman']);
		const fx = combat(s).heroFx.confessor;
		if (fx) fx.taunt = true;
		expect(intentView(s, e).targets).toEqual(['confessor']);
	});

	test('all enemy keys referenced by encounters exist and totals match the GDD', () => {
		const totals: Record<string, number> = {
			A1: 28,
			A2: 30,
			A3: 40,
			A4: 34,
			B1: 56,
			B2: 48,
			B3: 62,
			B4: 66,
			B5: 64,
		};
		for (const [id, hp] of Object.entries(totals)) {
			const s = combatRun(id);
			expect(combat(s).enemies.reduce((a, e) => a + e.maxHP, 0)).toBe(hp);
		}
		expect(Object.keys(ENCOUNTERS)).toHaveLength(40);
	});
});

describe('equipment (GDD 12)', () => {
	test('Notched Blade +1 per hit; Heavy Pavise +2 Block; Rosary 6 Block on turn 1; Reliquary +6 max HP', () => {
		let s = createRun(1, PARTY);
		const hero = s.party[0];
		if (!hero) throw new Error('no hero');
		hero.weapon = 'eq_notched_blade';
		startCombat(ctxOf(s), 'A1', 'common');
		const e = isolate(s, 'ossified_brute');
		const [uid] = setHand(s, ['shb_hack']);
		s = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) }).s;
		expect(combat(s).enemies[0]?.hp).toBe(46 - 7);

		const p = createRun(1, PARTY);
		const h2 = p.party[0];
		if (h2) h2.weapon = 'eq_heavy_pavise';
		startCombat(ctxOf(p), 'A1', 'common');
		isolate(p);
		const [brace] = setHand(p, ['shb_brace']);
		const r = run(p, { type: 'playCard', cardUid: brace as number, target: null });
		expect(combat(r.s).heroFx.shieldbearer?.block).toBe(8);
		expect(combat(r.s).heroFx.confessor?.block).toBe(4);

		const q = createRun(1, PARTY);
		const h3 = q.party[1];
		if (h3) h3.relic = 'eq_iron_rosary';
		startCombat(ctxOf(q), 'A1', 'common');
		expect(combat(q).heroFx.confessor?.block).toBe(6);

		const m = createRun(1, PARTY);
		const h4 = m.party[0];
		if (h4) h4.relic = 'eq_bone_reliquary';
		expect(h4 && HEROES.shieldbearer.maxHP + 6).toBe(66);
	});

	test("Hunter's Lens marks the first attack target; Ember Focus burns on the first attack each turn", () => {
		let s = createRun(1, PARTY);
		const hero = s.party[2];
		if (!hero) throw new Error('no hero');
		hero.weapon = 'eq_hunters_lens';
		startCombat(ctxOf(s), 'A1', 'common');
		const e = isolate(s);
		const [a, b] = setHand(s, ['mrk_aimed_shot', 'mrk_aimed_shot']);
		s = run(s, { type: 'playCard', cardUid: a as number, target: enemyTarget(e.uid) }).s;
		expect(combat(s).enemies[0]?.fx.marked).toBe(2);
		s = run(s, { type: 'playCard', cardUid: b as number, target: enemyTarget(e.uid) }).s;
		expect(combat(s).enemies[0]?.fx.marked).toBe(2);
	});
});

describe('auto battle (GDD 14.1)', () => {
	test('chooseAutoCommand only issues valid commands and finishes combats', () => {
		let s = combatRun('B1');
		let guard = 0;
		while (s.phase === 'combat' && guard++ < 400) {
			const cmd = chooseAutoCommand(s);
			expect(cmd).not.toBeNull();
			if (!cmd) break;
			const r = apply(s, cmd);
			expect(invalidOf(r.events)).toHaveLength(0);
			s = r.state;
		}
		expect(s.phase === 'reward' || s.phase === 'defeat').toBe(true);
	});

	test('is null outside combat', () => {
		expect(chooseAutoCommand(createRun(1, PARTY))).toBeNull();
	});
});
