import { describe, expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { apply, createRun, preview } from '../../src/core/run.ts';
import type { Command, GameEvent, RunState } from '../../src/core/types.ts';
import { combatView } from '../../src/core/views.ts';
import { RULES } from '../../src/data/index.ts';
import { combat, combatRun, PARTY } from './helpers.ts';

/** Bot-plays from a new run until the first combat's player phase. */
function firstCombat(seed: number): RunState {
	let s = createRun(seed, PARTY);
	for (let i = 0; i < 400 && s.phase !== 'combat'; i++) {
		s = apply(s, chooseBotCommand(s) as Command).state;
	}
	if (s.phase !== 'combat') throw new Error(`seed ${seed} never reached combat`);
	return s;
}

describe('combat view: enrage (GDD 5.2)', () => {
	test('enemies are not enraged before the enrage turn and are from it on', () => {
		const s = combatRun('A1');
		const k = combat(s);
		k.turn = RULES.enrageTurn - 1;
		expect(combatView(s)?.enraged).toBe(false);
		k.turn = RULES.enrageTurn;
		expect(combatView(s)?.enraged).toBe(true);
		expect(combatView(s)?.enrageTurn).toBe(RULES.enrageTurn);
	});
});

describe('combat view: boss (GDD 10.5)', () => {
	test('the boss starts in phase 1 and occupies two ranks', () => {
		const s = combatRun('BOSS', PARTY, 1, 'boss');
		const boss = combatView(s)?.enemies[0];
		expect(boss?.phase).toBe(1);
		expect(boss?.size).toBe(2);
	});
});

describe('combat view: intents (GDD 10.1)', () => {
	test('every shown intent with damage names living heroes as targets, one damage entry per target', () => {
		const s = combatRun('A1');
		const view = combatView(s);
		const alive = new Set(view?.heroes.map((h) => h.id));
		for (const e of view?.enemies ?? []) {
			if (!e.intent) continue;
			for (const d of e.intent.damage) {
				expect(alive.has(d.target)).toBe(true);
				expect(d.hits).toBeGreaterThan(0);
				expect(d.perHit).toBeGreaterThanOrEqual(0);
			}
		}
	});
});

describe('preview equals the real result (GDD P3)', () => {
	const seeds = Array.from({ length: 20 }, (_, i) => i + 1);

	test('for 20 seeded first combats, every playable card and target previews exactly what applies', () => {
		let checked = 0;
		for (const seed of seeds) {
			const s = firstCombat(seed);
			for (const card of combatView(s)?.hand ?? []) {
				if (!card.playable) continue;
				const targets = card.autoTarget ? [null] : card.validTargets;
				for (const target of targets) {
					const cmd: Command = { type: 'playCard', cardUid: card.uid, target };
					const shown = preview(s, cmd);
					const real = apply(s, cmd);
					expect(shown.state).toEqual(real.state);
					expect(shown.events).toEqual(real.events);
					checked++;
				}
			}
		}
		expect(checked).toBeGreaterThan(20);
	});

	test('for 20 seeded first combats, the hits the intents show are the hits that land at end of turn', () => {
		let compared = 0;
		for (const seed of seeds) {
			const s = firstCombat(seed);
			const view = combatView(s);
			if (!view) continue;
			const predicted = new Map<string, number>();
			for (const e of view.enemies) {
				for (const d of e.intent?.damage ?? []) {
					predicted.set(d.target, (predicted.get(d.target) ?? 0) + d.perHit * d.hits);
				}
			}
			const r = apply(s, { type: 'endTurn' });
			for (const h of s.party) {
				const hits = hitsOn(r.events, h.id);
				expect(hits).toBe(predicted.get(h.id) ?? 0);
				compared++;
			}
		}
		expect(compared).toBeGreaterThan(20);
	});
});

/** HP lost to enemy hits on one hero, from the end-of-turn events (not counting Bleed ticks). */
function hitsOn(events: GameEvent[], heroId: string): number {
	return events.reduce((sum, ev) => {
		if (ev.type !== 'hit' || ev.target.side !== 'hero' || ev.target.id !== heroId) return sum;
		return sum + ev.hpLost;
	}, 0);
}
