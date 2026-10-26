import { afterEach, describe, expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { intentOf, intentView, startCombat } from '../../src/core/combat.ts';
import { chooseEncounter, markSeen } from '../../src/core/map.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { Command, RunState } from '../../src/core/types.ts';
import { ACT_RULES, ENCOUNTERS, ENEMIES } from '../../src/data/index.ts';
import { combat, ctxOf, enemyTarget, invalidOf, PARTY, run, setHand } from './helpers.ts';

const SHIPPED_ACTS = ACT_RULES.acts;

const ACT3_ENEMIES = [
	'iron_mourner',
	'grave_cur',
	'ash_cantor',
	'bronze_scribe',
	'hollow_choir',
	'sepulchre_knight',
	'wax_saint',
	'chain_wraith',
	'marrow_butcher',
	'rift_spawn',
];

function act3Run(enc: string, kind: 'common' | 'elite' | 'boss' = 'common'): RunState {
	const s = createRun(1, PARTY);
	s.act = 3;
	startCombat(ctxOf(s), enc, kind);
	for (const e of combat(s).enemies) e.intentIdx = 0;
	return s;
}

describe('Act 3 data (GDD 23)', () => {
	test('10 Act 3 enemies, 5 + 5 encounters, 2 elites and the final boss', () => {
		for (const k of ACT3_ENEMIES) expect(ENEMIES[k]).toBeDefined();
		const act3 = Object.values(ENCOUNTERS).filter((e) => e.act === 3);
		expect(act3.filter((e) => e.pool === 'A')).toHaveLength(5);
		expect(act3.filter((e) => e.pool === 'B')).toHaveLength(5);
		expect(act3.filter((e) => e.pool === 'elite').map((e) => e.id)).toEqual(['EL3-1', 'EL3-2']);
		expect(ENCOUNTERS.BOSS3?.enemies).toEqual([{ key: 'rift_mother' }]);
		const used = new Set(
			act3
				.filter((e) => e.pool === 'A' || e.pool === 'B')
				.flatMap((e) => e.enemies.map((x) => x.key)),
		);
		for (const k of ACT3_ENEMIES) expect(used.has(k)).toBe(true);
	});

	test('Act 3 selection draws only Act 3 encounters, elites and the final boss', () => {
		const s = createRun(1, PARTY);
		s.act = 3;
		expect(chooseEncounter(s, 4, 'elite')).toBe('EL3-1');
		expect(chooseEncounter(s, 7, 'elite')).toBe('EL3-2');
		expect(chooseEncounter(s, 10, 'boss')).toBe('BOSS3');
		for (let row = 1; row <= 8; row++) {
			const id = chooseEncounter(s, row, 'combat');
			expect(ENCOUNTERS[id]?.act).toBe(3);
			markSeen(s, id);
		}
	});

	test('act scaling: Act 3 non-boss enemies get two steps of the act multipliers', () => {
		const s = act3Run('A3-2');
		const mourner = combat(s).enemies[0];
		const base = ENEMIES.iron_mourner?.hp as number;
		expect(mourner?.maxHP).toBe(Math.round(base * (1 + 2 * ACT_RULES.hpPerAct)));
		expect(mourner?.dmgMul).toBeCloseTo(1 + 2 * ACT_RULES.dmgPerAct);
	});
});

describe('The Rift Mother: three phases (GDD 23.4)', () => {
	test('HP is final; phase 2 at <= 110 and phase 3 at <= 55, +2 Might each, new cycles', () => {
		let s = act3Run('BOSS3', 'boss');
		const boss = combat(s).enemies[0];
		if (!boss) throw new Error('no boss');
		expect(boss.maxHP).toBe(160);
		expect(boss.size).toBe(2);
		expect(intentOf(boss).id).toBe('embrace');
		boss.hp = 114;
		const [a] = setHand(s, ['mrk_aimed_shot']);
		let r = run(s, { type: 'playCard', cardUid: a as number, target: enemyTarget(boss.uid) });
		s = r.s;
		expect(r.ev).toContainEqual({ type: 'bossPhase', uid: boss.uid, phase: 2 });
		let b = combat(s).enemies[0];
		expect(b?.phase).toBe(2);
		expect(b?.fx.might).toBe(2);
		expect(intentView(s, b ?? boss).intentId).toBe('rend_the_veil');
		(b as { hp: number }).hp = 60;
		const [c] = setHand(s, ['mrk_aimed_shot']);
		r = run(s, { type: 'playCard', cardUid: c as number, target: enemyTarget(boss.uid) });
		s = r.s;
		expect(r.ev).toContainEqual({ type: 'bossPhase', uid: boss.uid, phase: 3 });
		b = combat(s).enemies[0];
		expect(b?.phase).toBe(3);
		expect(b?.fx.might).toBe(4);
		expect(intentView(s, b ?? boss).intentId).toBe('unmaking');
	});

	test('one big hit from phase 1 to <= 55 goes through phase 2 into phase 3', () => {
		const s = act3Run('BOSS3', 'boss');
		const boss = combat(s).enemies[0];
		if (!boss) throw new Error('no boss');
		boss.hp = 60;
		const [a] = setHand(s, ['mrk_aimed_shot']);
		const r = run(s, { type: 'playCard', cardUid: a as number, target: enemyTarget(boss.uid) });
		const phases = r.ev
			.filter((e) => e.type === 'bossPhase')
			.map((e) => e.type === 'bossPhase' && e.phase);
		expect(phases).toEqual([2, 3]);
		expect(combat(r.s).enemies[0]?.fx.might).toBe(4);
	});
});

describe('Three-act flow (GDD 23.1)', () => {
	afterEach(() => {
		ACT_RULES.acts = SHIPPED_ACTS;
	});

	test('ACTS=3 ships; a tough run reaches the Act 3 boss and ends in victory after it', () => {
		expect(SHIPPED_ACTS).toBe(3);
		let s = createRun(3, PARTY, { heroHpMul: 20 });
		for (let i = 0; i < 150000; i++) {
			const cmd = chooseBotCommand(s);
			if (!cmd) break;
			const r = apply(s, cmd as Command);
			if (invalidOf(r.events).length > 0) throw new Error(`invalid ${JSON.stringify(cmd)}`);
			s = r.state;
		}
		expect(s.phase).toBe('victory');
		expect(s.act).toBe(3);
		expect(s.bossesWon).toBe(3);
		const ids = s.stats.combats.map((c) => c.id);
		const after = ids.slice(ids.indexOf('BOSS2') + 1);
		expect(after.at(-1)).toBe('BOSS3');
		for (const id of after) expect(ENCOUNTERS[id]?.act).toBe(3);
		// The legendary is given once; later bosses roll another item instead of a duplicate.
		const owned = [...s.stash, ...s.party.flatMap((h) => [h.weapon, h.relic])];
		expect(owned.filter((x) => x === 'eq_bell_clapper').length).toBeLessThanOrEqual(1);
	});
});

describe('boss equipment across acts', () => {
	test('a later boss does not give a second Bell Clapper', () => {
		const s = createRun(1, PARTY);
		s.act = 2;
		s.stash = ['eq_bell_clapper'];
		startCombat(ctxOf(s), 'BOSS2', 'boss');
		const boss = combat(s).enemies[0];
		if (!boss) throw new Error('no boss');
		boss.hp = 1;
		boss.fx.bleed = 1;
		const r = run(s, { type: 'endTurn' }).s;
		expect(r.phase).toBe('reward');
		expect(r.stash.filter((x) => x === 'eq_bell_clapper')).toHaveLength(1);
		expect(r.reward?.equipmentGained).not.toBe('eq_bell_clapper');
	});
});
