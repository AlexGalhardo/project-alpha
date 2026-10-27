import { afterEach, describe, expect, test } from 'bun:test';
import { maxHP } from '../../src/core/ops.ts';
import { createRun } from '../../src/core/run.ts';
import type { HeroState, RunState } from '../../src/core/types.ts';
import { ACT_RULES, SANCTUM } from '../../src/data/index.ts';
import { invalidOf, PARTY, run } from './helpers.ts';

const saved = { acts: ACT_RULES.acts, sanctum: ACT_RULES.sanctum };
afterEach(() => {
	ACT_RULES.acts = saved.acts;
	ACT_RULES.sanctum = saved.sanctum;
});

/** A run standing on a reward screen after `act`'s boss (or a normal fight, when boss is false). */
function rewardAfter(act: number, boss: boolean): RunState {
	const s = createRun(1, PARTY);
	s.act = act;
	s.phase = 'reward';
	s.reward = { gold: 0, cards: [], equipmentGained: null, boss };
	for (const h of s.party) {
		h.hp = 1;
		h.injured = true;
	}
	return s;
}

/** Heal the rule gives: 50% of the (un-injured) max HP, on top of the current HP, capped at max. */
function expectedBetweenActHP(h: HeroState): number {
	const max = maxHP({ ...h, injured: false });
	return Math.min(max, h.hp + Math.floor((max * ACT_RULES.betweenActHealPct) / 100));
}

describe('after an act boss with Sanctum off (GDD 22.1)', () => {
	test('skipping the reward heals every hero 50% of max HP and clears injuries, then opens the camp', () => {
		ACT_RULES.sanctum = false;
		const s = rewardAfter(1, true);
		const expected = s.party.map((h) => expectedBetweenActHP(h));
		const r = run(s, { type: 'skipReward' });
		expect(r.s.phase).toBe('camp');
		expect(r.s.camp).not.toBeNull();
		r.s.party.forEach((h, i) => {
			expect(h.injured).toBe(false);
			expect(h.hp).toBe(expected[i] as number);
		});
	});

	test('after the final act boss the run is a victory and no camp opens', () => {
		ACT_RULES.sanctum = false;
		const s = rewardAfter(ACT_RULES.acts, true);
		const r = run(s, { type: 'skipReward' });
		expect(r.s.phase).toBe('victory');
		expect(r.s.camp).toBeNull();
	});
});

describe('after an act boss with Sanctum on (GDD 23.1)', () => {
	test('the boss reward opens the Sanctum: injuries clear, HP is not healed yet, and no camp opens', () => {
		ACT_RULES.sanctum = true;
		const s = rewardAfter(1, true);
		const hpBefore = s.party.map((h) => h.hp);
		const r = run(s, { type: 'skipReward' });
		expect(r.s.phase).toBe('sanctum');
		expect(r.s.camp).toBeNull();
		r.s.party.forEach((h, i) => {
			expect(h.injured).toBe(false);
			expect(h.hp).toBe(hpBefore[i] as number);
		});
	});

	test('Sanctum "heal" brings every hero to full HP and then opens the camp', () => {
		ACT_RULES.sanctum = true;
		const at = run(rewardAfter(1, true), { type: 'skipReward' }).s;
		const r = run(at, { type: 'sanctumChoose', option: 'heal' });
		expect(r.s.phase).toBe('camp');
		for (const h of r.s.party) expect(h.hp).toBe(maxHP(h));
	});

	test('Sanctum "tithe" adds the fixed gold and counts it in the run statistics', () => {
		ACT_RULES.sanctum = true;
		const at = run(rewardAfter(1, true), { type: 'skipReward' }).s;
		const gold = at.gold;
		const goldEarned = at.stats.goldEarned;
		const r = run(at, { type: 'sanctumChoose', option: 'gold' });
		expect(r.s.gold).toBe(gold + SANCTUM.gold);
		expect(r.s.stats.goldEarned).toBe(goldEarned + SANCTUM.gold);
		expect(r.s.phase).toBe('camp');
	});

	test('a Sanctum choice outside the Sanctum phase is refused', () => {
		ACT_RULES.sanctum = true;
		const r = run(createRun(1, PARTY), { type: 'sanctumChoose', option: 'heal' });
		expect(invalidOf(r.ev)).toHaveLength(1);
	});

	test('Sanctum "upgrade" needs exactly the chosen unupgraded cards', () => {
		ACT_RULES.sanctum = true;
		const at = run(rewardAfter(1, true), { type: 'skipReward' }).s;
		const two = at.deck.slice(0, SANCTUM.upgradeCount).map((c) => c.uid);
		const ok = run(at, { type: 'sanctumChoose', option: 'upgrade', cardUids: two });
		expect(ok.s.phase).toBe('camp');
		expect(ok.s.deck.filter((c) => two.includes(c.uid)).every((c) => c.upgraded)).toBe(true);
		const wrongCount = run(at, {
			type: 'sanctumChoose',
			option: 'upgrade',
			cardUids: [two[0] as number],
		});
		expect(invalidOf(wrongCount.ev)).toHaveLength(1);
		expect(wrongCount.s.phase).toBe('sanctum');
	});
});

describe('after a normal fight (GDD 4.4)', () => {
	test('a non-boss reward opens the camp and does not heal or clear injuries', () => {
		ACT_RULES.sanctum = true;
		const s = rewardAfter(1, false);
		const hp = s.party.map((h) => h.hp);
		const r = run(s, { type: 'skipReward' });
		expect(r.s.phase).toBe('camp');
		r.s.party.forEach((h, i) => {
			expect(h.hp).toBe(hp[i] as number);
			expect(h.injured).toBe(true);
		});
	});
});
