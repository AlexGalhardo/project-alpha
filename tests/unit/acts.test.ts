import { afterEach, describe, expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { intentView, startCombat } from '../../src/core/combat.ts';
import { chooseEncounter, markSeen } from '../../src/core/map.ts';
import { apply, createRun, embers } from '../../src/core/run.ts';
import type { Command, RunState } from '../../src/core/types.ts';
import {
	ACT_RULES,
	CARDS,
	ENCOUNTERS,
	ENEMIES,
	HERO_CLASSES,
	HEROES,
} from '../../src/data/index.ts';
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

/** The act count the game ships with; tests that change it restore this. */
const SHIPPED_ACTS = ACT_RULES.acts;

const ACT2_ENEMIES = [
	'vault_warden',
	'bone_lancer',
	'censer_wraith',
	'flesh_organ',
	'gutter_crawler',
	'relic_thief',
	'mirror_saint',
	'hollow_bishop',
	'chain_golem',
	'rot_cherub',
];

function act2Run(enc: string, kind: 'common' | 'elite' | 'boss' = 'common'): RunState {
	const s = createRun(1, PARTY);
	s.act = 2;
	startCombat(ctxOf(s), enc, kind);
	for (const e of combat(s).enemies) e.intentIdx = 0;
	return s;
}

/** Plays the bot to the end; heroes are tough so the run reaches the end of the last act. */
function playTough(seed: number): RunState {
	let s = createRun(seed, PARTY, { heroHpMul: 20 });
	for (let i = 0; i < 100000; i++) {
		const cmd = chooseBotCommand(s);
		if (!cmd) break;
		const r = apply(s, cmd);
		if (invalidOf(r.events).length > 0) throw new Error(`invalid ${JSON.stringify(cmd)}`);
		s = r.state;
	}
	return s;
}

describe('Act 2 data (GDD 22.2, 22.3)', () => {
	test('10 Act 2 enemies, 5 + 5 + 2 elite encounters and the boss exist', () => {
		for (const key of ACT2_ENEMIES) expect(ENEMIES[key]).toBeTruthy();
		const act2 = Object.values(ENCOUNTERS).filter((e) => e.act === 2);
		expect(act2).toHaveLength(13);
		expect(act2.filter((e) => e.pool === 'A')).toHaveLength(5);
		expect(act2.filter((e) => e.pool === 'B')).toHaveLength(5);
		expect(act2.filter((e) => e.pool === 'elite')).toHaveLength(2);
		expect(ENCOUNTERS.BOSS2?.enemies[0]?.key).toBe('gilded_penitent');
		const boss = ENEMIES.gilded_penitent;
		expect(boss).toMatchObject({ hp: 140, speed: 3, size: 2, phase2Hp: 70, phase2Might: 2 });
	});

	test('every Act 2 type shows up in the act pools', () => {
		const used = new Set(
			Object.values(ENCOUNTERS)
				.filter((e) => e.act === 2)
				.flatMap((e) => e.enemies.map((x) => x.key)),
		);
		for (const key of ACT2_ENEMIES) expect(used.has(key)).toBe(true);
	});
});

describe('Act scaling (GDD 4.3 and 22)', () => {
	test('non-boss Act 2 enemies get the act HP and damage multipliers; Act 1 is unchanged', () => {
		const s = act2Run('A2-3');
		const warden = combat(s).enemies[0];
		expect(warden?.key).toBe('vault_warden');
		expect(warden?.maxHP).toBe(Math.round(30 * (1 + ACT_RULES.hpPerAct)));
		if (!warden) throw new Error('no enemy');
		const view = intentView(s, warden);
		expect(view.damage[0]?.perHit).toBe(Math.round(7 * (1 + ACT_RULES.dmgPerAct)));
		const a1 = combatRun('A1');
		expect(combat(a1).enemies[0]?.maxHP).toBe(18);
	});

	test('the Act 2 boss HP is final (140) and scaling does not apply to its damage', () => {
		const s = act2Run('BOSS2', 'boss');
		const boss = combat(s).enemies[0];
		expect(boss?.maxHP).toBe(140);
		expect(boss?.dmgMul).toBe(1);
	});

	test('elites stack the elite and the act multipliers', () => {
		const s = act2Run('EL2-1', 'elite');
		expect(combat(s).enemies[0]?.maxHP).toBe(Math.round(30 * 1.25 * (1 + ACT_RULES.hpPerAct)));
		const g = act2Run('EL2-2', 'elite');
		expect(combat(g).enemies[0]?.maxHP).toBe(Math.round(52 * 1.25 * (1 + ACT_RULES.hpPerAct)));
	});
});

describe('Act 2 enemies and boss', () => {
	test('Gilded Penitent phase 2 at HP <= 70 with +2 Might, new intent cycle', () => {
		const s = act2Run('BOSS2', 'boss');
		const boss = combat(s).enemies[0];
		if (!boss) throw new Error('no boss');
		boss.hp = 74;
		const [uid] = setHand(s, ['mrk_aimed_shot']);
		const r = run(s, {
			type: 'playCard',
			cardUid: uid as number,
			target: enemyTarget(boss.uid),
		});
		const after = combat(r.s).enemies[0];
		expect(r.ev.some((e) => e.type === 'bossPhase')).toBe(true);
		expect(after?.phase).toBe(2);
		expect(after?.fx.might).toBe(2);
		expect(after?.intentIdx).toBe(0);
		const view = intentView(r.s, after ?? boss);
		expect(view.intentId).toBe('scourge');
		expect(view.targets).toEqual(PARTY);
	});

	test('Gilded Penitent phase 1 cycle: Lash 12, Confession +2 stress, Gild 15 Block +1 Might', () => {
		let s = act2Run('BOSS2', 'boss');
		const boss = combat(s).enemies[0];
		if (!boss) throw new Error('no boss');
		expect(intentView(s, boss).intentId).toBe('lash');
		expect(intentView(s, boss).damage[0]?.perHit).toBe(12);
		s = run(s, { type: 'endTurn' }).s;
		const b2 = combat(s).enemies[0];
		expect(b2 && intentView(s, b2).intentId).toBe('confession');
		s = run(s, { type: 'endTurn' }).s;
		s = run(s, { type: 'endTurn' }).s;
		expect(combat(s).enemies[0]?.fx.block).toBe(15);
		expect(combat(s).enemies[0]?.fx.might).toBe(1);
	});

	test('Bone Lancer withdraws to the back; Mirror Saint targets a Marked hero', () => {
		const s = act2Run('B2-3');
		const lancer = combat(s).enemies[0];
		if (!lancer) throw new Error('no lancer');
		lancer.intentIdx = 2;
		const r = run(s, { type: 'endTurn' });
		expect(combat(r.s).enemies[2]?.key).toBe('bone_lancer');
		const t = act2Run('B2-3');
		const saint = combat(t).enemies.find((e) => e.key === 'mirror_saint');
		if (!saint) throw new Error('no saint');
		saint.intentIdx = 2;
		heroFx(t, 'marksman').marked = 1;
		expect(intentView(t, saint).targets).toEqual(['marksman']);
		// Smite 8 x act damage, rounded, then x1.5 on a Marked hero
		const smite = Math.round(8 * (1 + ACT_RULES.dmgPerAct));
		expect(intentView(t, saint).damage[0]?.perHit).toBe(Math.floor(smite * 1.5));
	});

	test('Relic Thief leaves Bleed on the back hero; Rot Cherub aims at the lowest-HP hero', () => {
		const s = act2Run('B2-4');
		const r = run(s, { type: 'endTurn' });
		// Cut hits the back hero (the marksman) and leaves 2 Bleed.
		expect(heroFx(r.s, 'marksman').bleed).toBeGreaterThanOrEqual(2);
		const c = act2Run('A2-3');
		const cherub = combat(c).enemies.find((e) => e.key === 'rot_cherub');
		if (!cherub) throw new Error('no cherub');
		const conf = c.party.find((h) => h.id === 'confessor');
		if (conf) conf.hp = 5;
		expect(intentView(c, cherub).targets).toEqual(['confessor']);
	});
});

describe('Act flow (GDD 22.1)', () => {
	const SHIPPED_SANCTUM = ACT_RULES.sanctum;
	afterEach(() => {
		ACT_RULES.acts = SHIPPED_ACTS;
		ACT_RULES.sanctum = SHIPPED_SANCTUM;
	});

	test('ACTS=2, Sanctum off: the Act 1 boss opens the camp, then a fresh Act 2 map; heroes heal 50% and lose injuries', () => {
		ACT_RULES.acts = 2;
		// The flat heal is the fallback when the Sanctum is off (GDD 23.1).
		ACT_RULES.sanctum = false;
		let s = createRun(5, PARTY, { heroHpMul: 20 });
		let guard = 0;
		while (!(s.phase === 'reward' && s.reward?.boss) && guard++ < 5000) {
			s = apply(s, chooseBotCommand(s) as Command).state;
		}
		expect(s.phase).toBe('reward');
		const h0 = s.party[0];
		if (!h0) throw new Error('no hero');
		h0.hp = 10;
		h0.injured = true;
		s = apply(s, { type: 'skipReward' }).state;
		expect(s.phase).toBe('camp');
		expect(s.act).toBe(1);
		const healed = s.party[0];
		expect(healed?.injured).toBe(false);
		expect(healed?.hp).toBe(10 + Math.floor((HEROES.shieldbearer.maxHP * 20 * 50) / 100));
		s = apply(s, { type: 'campLeave' }).state;
		expect(s.phase).toBe('map');
		expect(s.act).toBe(2);
		expect(s.cursor).toBeNull();
		expect(s.map).toHaveLength(10);
		expect(s.seenEnemies).toEqual([]);
		expect(s.map[9]?.[0]?.type).toBe('boss');
	});

	test('a whole two-act run ends in victory after the Act 2 boss, with Act 2 enemies only in Act 2', () => {
		ACT_RULES.acts = 2;
		const s = playTough(3);
		expect(s.phase).toBe('victory');
		expect(s.act).toBe(2);
		expect(s.bossesWon).toBe(2);
		const ids = s.stats.combats.map((c) => c.id);
		expect(ids.includes('BOSS')).toBe(true);
		expect(ids.includes('BOSS2')).toBe(true);
		expect(ids.indexOf('BOSS')).toBeLessThan(ids.indexOf('BOSS2'));
		const after = ids.slice(ids.indexOf('BOSS') + 1);
		for (const id of after) expect(ENCOUNTERS[id]?.act).toBe(2);
		expect(embers(s)).toBe(2 * s.roundsCleared + 5 * s.elitesWon + 15 * 2);
	});

	test('ACTS=1 keeps the prototype flow: victory right after the first boss reward', () => {
		ACT_RULES.acts = 1;
		const s = playTough(3);
		expect(s.phase).toBe('victory');
		expect(s.act).toBe(1);
		expect(s.bossesWon).toBe(1);
	});

	test('Act 2 encounter selection draws only Act 2 encounters, elites and boss', () => {
		const s = createRun(1, PARTY);
		s.act = 2;
		expect(chooseEncounter(s, 4, 'elite')).toBe('EL2-1');
		expect(chooseEncounter(s, 7, 'elite')).toBe('EL2-2');
		expect(chooseEncounter(s, 10, 'boss')).toBe('BOSS2');
		for (let row = 1; row <= 8; row++) {
			const id = chooseEncounter(s, row, 'combat');
			expect(ENCOUNTERS[id]?.act).toBe(2);
			markSeen(s, id);
		}
	});

	test('old saves without an act count as Act 1', async () => {
		const { deserialize, serialize } = await import('../../src/core/run.ts');
		const s = createRun(1, PARTY);
		const raw = JSON.parse(serialize(s)) as Record<string, unknown>;
		raw.act = undefined;
		const back = deserialize(JSON.stringify(raw));
		expect(back?.act).toBe(1);
	});
});

describe('skill tree cards (GDD 22.5): data and behaviour', () => {
	const NEW = [
		'shb_rampart',
		'shb_riposte',
		'mrk_ricochet',
		'mrk_deadeye',
		'arc_cinder_ward',
		'arc_inferno',
		'cnf_penance',
		'cnf_last_rites',
		'bmb_shrapnel',
		'bmb_flashbang',
	];

	test('10 new cards exist and are in no hero reward pool', () => {
		for (const id of NEW) {
			expect(CARDS[id]).toBeTruthy();
			for (const h of HERO_CLASSES) expect(HEROES[h].pool.includes(id)).toBe(false);
		}
		expect(CARDS.arc_inferno).toMatchObject({ cost: 3, rarity: 'rare', exhaust: true });
	});

	test('Rampart gives 4 Block to every hero (6 upgraded)', () => {
		const s = combatRun('A1');
		isolate(s);
		const [uid] = setHand(s, ['shb_rampart']);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: null });
		expect(PARTY.map((id) => combat(r.s).heroFx[id]?.block)).toEqual([4, 4, 4]);
	});

	test('Riposte deals half own Block + 4 (upgraded +7)', () => {
		const s = combatRun('A1');
		const e = isolate(s);
		heroFx(s, 'shieldbearer').block = 11;
		const [uid] = setHand(s, ['shb_riposte']);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) });
		expect(combat(r.s).enemies[0]?.hp).toBe(46 - (5 + 4));
	});

	test('Ricochet hits two random enemies for 4; Deadeye marks every enemy', () => {
		const s = combatRun('B3');
		const hp0 = combat(s).enemies.reduce((a, e) => a + e.hp, 0);
		const [ric] = setHand(s, ['mrk_ricochet']);
		let r = run(s, { type: 'playCard', cardUid: ric as number, target: null });
		expect(hp0 - combat(r.s).enemies.reduce((a, e) => a + e.hp, 0)).toBe(8);
		const [dead] = setHand(r.s, ['mrk_deadeye']);
		r = run(r.s, { type: 'playCard', cardUid: dead as number, target: null });
		expect(combat(r.s).enemies.every((e) => e.fx.marked === 1)).toBe(true);
	});

	test('Cinder Ward: 6 Block to an ally and 2 Burn on E1', () => {
		const s = combatRun('A1', ['shieldbearer', 'arcanist', 'confessor']);
		const [uid] = setHand(s, ['arc_cinder_ward']);
		const r = run(s, {
			type: 'playCard',
			cardUid: uid as number,
			target: heroTarget('shieldbearer'),
		});
		expect(combat(r.s).heroFx.shieldbearer?.block).toBe(6);
		expect(combat(r.s).enemies[0]?.fx.burn).toBe(2);
	});

	test('Inferno: 6 x3 to each enemy, Dread 3, exhausts', () => {
		let s = combatRun('B3', ['shieldbearer', 'arcanist', 'confessor']);
		for (const e of combat(s).enemies) e.hp = e.maxHP = 100;
		const [uid] = setHand(s, ['arc_inferno']);
		const hp0 = combat(s).enemies.map((e) => e.hp);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: null });
		s = r.s;
		expect(combat(s).enemies.map((e, i) => (hp0[i] as number) - e.hp)).toEqual([18, 18, 18]);
		expect(s.party.find((h) => h.id === 'arcanist')?.stress).toBe(3);
		expect(combat(s).exhaust.some((c) => c.cardId === 'arc_inferno')).toBe(true);
	});

	test('Penance: 6 damage and -1 stress for the owner', () => {
		const s = combatRun('A1');
		const e = isolate(s);
		const c = s.party.find((h) => h.id === 'confessor');
		if (c) c.stress = 4;
		const [uid] = setHand(s, ['cnf_penance']);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: enemyTarget(e.uid) });
		expect(combat(r.s).enemies[0]?.hp).toBe(40);
		expect(r.s.party.find((h) => h.id === 'confessor')?.stress).toBe(3);
	});

	test('Last Rites heals the lowest-HP hero 10 and exhausts', () => {
		const s = combatRun('A1');
		isolate(s);
		const m = s.party.find((h) => h.id === 'marksman');
		if (m) m.hp = 5;
		const [uid] = setHand(s, ['cnf_last_rites']);
		const r = run(s, { type: 'playCard', cardUid: uid as number, target: null });
		expect(r.s.party.find((h) => h.id === 'marksman')?.hp).toBe(15);
		expect(combat(r.s).exhaust.some((c) => c.cardId === 'cnf_last_rites')).toBe(true);
	});

	test('Shrapnel: 3 to each enemy; Flashbang: 2 and 1 Weakened to each', () => {
		const s = combatRun('B3', ['shieldbearer', 'bombardier', 'confessor']);
		const hp0 = combat(s).enemies.map((e) => e.hp);
		const [a] = setHand(s, ['bmb_shrapnel']);
		let r = run(s, { type: 'playCard', cardUid: a as number, target: null });
		expect(combat(r.s).enemies.map((e, i) => (hp0[i] as number) - e.hp)).toEqual([3, 3, 3]);
		const [b] = setHand(r.s, ['bmb_flashbang']);
		r = run(r.s, { type: 'playCard', cardUid: b as number, target: null });
		expect(combat(r.s).enemies.every((e) => e.fx.weakened === 1)).toBe(true);
	});
});
