import { describe, expect, test } from 'bun:test';
import { intentView } from '../../src/core/combat.ts';
import { combatView } from '../../src/core/views.ts';
import { RULES } from '../../src/data/index.ts';
import { combat, combatRun, isolate, run } from './helpers.ts';

// GDD 5.2: from combat turn 10 every enemy gains +1 Might at the start of each turn, so the
// intents shown during that turn already include it; the turn cap is 30.
describe('enrage and turn cap (GDD 5.2)', () => {
	test('rule values', () => {
		expect(RULES.enrageTurn).toBe(10);
		expect(RULES.enrageMight).toBe(1);
		expect(RULES.turnCap).toBe(30);
	});

	test('no enrage before turn 10', () => {
		const s = combatRun();
		isolate(s, 'ossified_brute', 999);
		combat(s).turn = 8;
		const r = run(s, { type: 'endTurn' });
		const k = combat(r.s);
		expect(k.turn).toBe(9);
		expect(k.enemies[0]?.fx.might).toBe(0);
	});

	test('turn 10 start: every enemy +1 Might, shown in the intent and as an event', () => {
		const s = combatRun();
		isolate(s, 'ossified_brute', 999);
		combat(s).turn = 9;
		const r = run(s, { type: 'endTurn' });
		const k = combat(r.s);
		const after = k.enemies[0];
		if (!after) throw new Error('enemy missing');
		expect(k.turn).toBe(10);
		expect(after.fx.might).toBe(1);
		expect(
			r.ev.some((ev) => ev.type === 'status' && ev.status === 'enraged' && ev.amount === 1),
		).toBe(true);
		// The intent revealed for turn 10 includes the new Might (no unseen damage, P3).
		const shown = intentView(r.s, after).damage[0]?.perHit ?? 0;
		after.fx.might = 0;
		const base = intentView(r.s, after).damage[0]?.perHit ?? 0;
		expect(base).toBeGreaterThan(0);
		expect(shown).toBe(base + 1);
		expect(combatView(r.s)?.enraged).toBe(true);
	});

	test('it stacks every turn after 10', () => {
		const s = combatRun();
		const e = isolate(s, 'ossified_brute', 999);
		combat(s).turn = 10;
		e.fx.might = 1;
		const r = run(s, { type: 'endTurn' });
		expect(combat(r.s).enemies[0]?.fx.might).toBe(2);
	});

	test('the view warns before enrage', () => {
		const s = combatRun();
		combat(s).turn = 8;
		const v = combatView(s);
		expect(v?.enraged).toBe(false);
		expect(v?.enrageTurn).toBe(10);
	});

	test('reaching turn 30 loses the combat', () => {
		const s = combatRun();
		isolate(s, 'ossified_brute', 999);
		combat(s).turn = 30;
		const r = run(s, { type: 'endTurn' });
		expect(r.ev.some((ev) => ev.type === 'combatLost')).toBe(true);
	});
});
