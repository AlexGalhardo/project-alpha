import { afterEach, describe, expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { maxHP } from '../../src/core/ops.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { Command, RunState } from '../../src/core/types.ts';
import { ACT_RULES, SANCTUM } from '../../src/data/index.ts';
import { invalidOf, PARTY, run } from './helpers.ts';

const SHIPPED = ACT_RULES.sanctum;

/** A run standing on the Act 1 boss reward (the bot plays up to it with tough heroes). */
function atBossReward(): RunState {
	let s = createRun(5, PARTY, { heroHpMul: 20 });
	for (let i = 0; i < 5000 && !(s.phase === 'reward' && s.reward?.boss); i++) {
		s = apply(s, chooseBotCommand(s) as Command).state;
	}
	if (!(s.phase === 'reward' && s.reward?.boss)) throw new Error('no boss reward');
	return s;
}

function inSanctum(): RunState {
	const s = atBossReward();
	for (const h of s.party) {
		h.hp = 10;
		h.injured = true;
	}
	return run(s, { type: 'skipReward' }).s;
}

const choose = (option: 'heal' | 'remove' | 'upgrade' | 'gold', cardUids?: number[]): Command =>
	cardUids ? { type: 'sanctumChoose', option, cardUids } : { type: 'sanctumChoose', option };

describe('Sanctum between acts (GDD 23.1)', () => {
	afterEach(() => {
		ACT_RULES.sanctum = SHIPPED;
	});

	test('after a non-final boss reward the Sanctum opens and injuries are cleared', () => {
		ACT_RULES.sanctum = true;
		const s = inSanctum();
		expect(s.phase).toBe('sanctum');
		for (const h of s.party) {
			expect(h.injured).toBe(false);
			expect(h.hp).toBe(10);
		}
	});

	test('heal: every hero to full HP, then the camp opens and leaving starts the next act', () => {
		ACT_RULES.sanctum = true;
		const s = run(inSanctum(), choose('heal')).s;
		for (const h of s.party) expect(h.hp).toBe(maxHP(h));
		expect(s.phase).toBe('camp');
		const next = run(s, { type: 'campLeave' }).s;
		expect(next.act).toBe(2);
		expect(next.phase).toBe('map');
	});

	test('gold: +60', () => {
		ACT_RULES.sanctum = true;
		const s = inSanctum();
		expect(run(s, choose('gold')).s.gold).toBe(s.gold + SANCTUM.gold);
	});

	test('remove: exactly 2 distinct deck cards', () => {
		ACT_RULES.sanctum = true;
		const s = inSanctum();
		const [a, b] = [s.deck[0]?.uid as number, s.deck[1]?.uid as number];
		const r = run(s, choose('remove', [a, b])).s;
		expect(r.deck).toHaveLength(s.deck.length - 2);
		expect(r.deck.some((c) => c.uid === a || c.uid === b)).toBe(false);
		expect(invalidOf(run(s, choose('remove', [a])).ev)).toHaveLength(1);
		expect(invalidOf(run(s, choose('remove', [a, a])).ev)).toHaveLength(1);
		expect(invalidOf(run(s, choose('remove', [a, 99999])).ev)).toHaveLength(1);
	});

	test('upgrade: 2 chosen cards that are not upgraded yet', () => {
		ACT_RULES.sanctum = true;
		const s = inSanctum();
		const fresh = s.deck.filter((c) => !c.upgraded);
		const [a, b] = [fresh[0]?.uid as number, fresh[1]?.uid as number];
		const r = run(s, choose('upgrade', [a, b])).s;
		expect(r.deck.filter((c) => c.uid === a || c.uid === b).every((c) => c.upgraded)).toBe(
			true,
		);
		const done = s.deck.find((c) => c.upgraded);
		if (done) expect(invalidOf(run(s, choose('upgrade', [a, done.uid])).ev)).toHaveLength(1);
	});

	test('the Sanctum is only between acts: after the last boss the run ends in victory', () => {
		ACT_RULES.sanctum = true;
		const acts = ACT_RULES.acts;
		ACT_RULES.acts = 1;
		try {
			const s = run(atBossReward(), { type: 'skipReward' }).s;
			expect(s.phase).toBe('victory');
		} finally {
			ACT_RULES.acts = acts;
		}
	});

	test('a command outside the Sanctum is invalid; the bot picks a valid option', () => {
		ACT_RULES.sanctum = true;
		expect(invalidOf(run(createRun(1, PARTY), choose('gold')).ev)).toHaveLength(1);
		const s = inSanctum();
		const cmd = chooseBotCommand(s);
		expect(cmd?.type).toBe('sanctumChoose');
		expect(invalidOf(apply(s, cmd as Command).events)).toHaveLength(0);
	});

	test('with the flag off the old flow stays: 50% heal and the camp', () => {
		ACT_RULES.sanctum = false;
		const s = inSanctum();
		expect(s.phase).toBe('camp');
	});
});
