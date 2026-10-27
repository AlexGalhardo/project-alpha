import { expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { CombatView, Command, RunState } from '../../src/core/types.ts';
import { combatView } from '../../src/core/views.ts';
import { PARTY } from './helpers.ts';

// GDD P3: what the player is shown before ending the turn is what happens. For every living hero,
// the HP lost during end of turn must equal the damage the intents show (after the hero's Block),
// plus the Bleed the hero carries or the intents apply (Bleed ignores Block and ticks at the start
// of the next player turn), plus the hero's current Burn (ignores Block, ticks at the end of the
// player turn). Sampled from bot runs across Acts 1–3.

const PER_ACT = 17;
const ACTS = [1, 2, 3] as const;

/** Player-turn states (one per turn) sampled from bot runs, until PER_ACT per act. */
function sampleStates(): { act: number; s: RunState; view: CombatView }[] {
	const counts = new Map<number, number>(ACTS.map((a) => [a, 0]));
	const out: { act: number; s: RunState; view: CombatView }[] = [];
	for (let seed = 1; seed <= 400; seed++) {
		if (ACTS.every((a) => (counts.get(a) ?? 0) >= PER_ACT)) break;
		let s = createRun(seed, PARTY);
		let lastKey = '';
		for (let i = 0; i < 4000 && s.phase !== 'victory' && s.phase !== 'defeat'; i++) {
			const view = combatView(s);
			if (view && view.phase === 'player') {
				const key = `${s.act ?? 1}:${s.cursor?.row ?? 0}:${view.turn}`;
				const act = s.act ?? 1;
				if (key !== lastKey && (counts.get(act) ?? PER_ACT) < PER_ACT) {
					lastKey = key;
					counts.set(act, (counts.get(act) ?? 0) + 1);
					out.push({ act, s, view });
				}
			}
			s = apply(s, chooseBotCommand(s) as Command).state;
		}
	}
	return out;
}

/** Predicted HP loss for one hero from what the view shows, in end-of-turn order. */
function predictedLoss(view: CombatView, heroId: string): number {
	const hero = view.heroes.find((h) => h.id === heroId);
	if (!hero) return 0;
	let block = hero.status.block;
	let hits = 0;
	let bleed = hero.status.bleed;
	for (const e of view.enemies) {
		for (const d of e.intent?.damage ?? []) {
			if (d.target !== heroId) continue;
			for (let i = 0; i < d.hits; i++) {
				const absorbed = Math.min(block, d.perHit);
				block -= absorbed;
				hits += d.perHit - absorbed;
			}
		}
		for (const debuff of e.intent?.debuffs ?? []) {
			// Debuffs apply to the intent's target heroes; the shown text is "bleed N".
			const m = /^bleed (\d+)$/.exec(debuff);
			if (m && e.intent?.targets.includes(heroId as never)) bleed += Number(m[1]);
		}
	}
	// Bleed ticks N, then N-1 (GDD 6.1): the tick this turn is the total shown.
	return hits + bleed + hero.status.burn;
}

test('for 50+ sampled player turns across Acts 1–3, the shown intents predict the HP each hero loses', () => {
	const samples = sampleStates();
	for (const act of ACTS) {
		expect(samples.filter((x) => x.act === act).length).toBeGreaterThan(0);
	}
	expect(samples.length).toBeGreaterThanOrEqual(50);
	const checked: string[] = [];
	const mismatches: string[] = [];
	for (const { act, s, view } of samples) {
		const after = apply(s, { type: 'endTurn' }).state;
		for (const h of view.heroes) {
			const hpAfter = after.party.find((x) => x.id === h.id)?.hp ?? 0;
			if (hpAfter <= 0) continue;
			const lost = h.hp - hpAfter;
			const want = predictedLoss(view, h.id);
			checked.push(`act ${act} ${h.id}`);
			if (lost !== want)
				mismatches.push(
					`act ${act} ${h.id} seed-turn ${view.turn} predicted ${want} lost ${lost}`,
				);
		}
	}
	expect(checked.length).toBeGreaterThan(50);
	expect(mismatches).toEqual([]);
});
