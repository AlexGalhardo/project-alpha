import { expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { Command, RunState } from '../../src/core/types.ts';
import { combatView } from '../../src/core/views.ts';
import { PARTY } from './helpers.ts';

// Regression (found by p3-invariant-acts, Act 3, fixed): the Sepulchre Knight's Execution shows 21 on the
// Shieldbearer, but the hit lands for 15 before Block (predicted 17 after the 4 Block, 11 lost).
// The shown damage is higher than the damage dealt, so the preview overstates a hit (GDD P3).
// The cause is not isolated yet (the Shieldbearer is Marked; an earlier enemy's Kindle is also in
// the same turn). Fixed: Marked decays at the end of the player turn, before the hit; the view now
// projects the enemy phase (src/core/combat.ts projectEnemyPhase).
test("the Sepulchre Knight's shown Execution damage is the damage it deals (seed 1, Act 3, turn 3)", () => {
	let s: RunState = createRun(1, PARTY);
	for (let i = 0; i < 4000; i++) {
		const v = combatView(s);
		if (
			s.phase === 'combat' &&
			v?.phase === 'player' &&
			v.turn === 3 &&
			(s.act ?? 1) === 3 &&
			v.enemies.some((e) => e.key === 'sepulchre_knight')
		)
			break;
		s = apply(s, chooseBotCommand(s) as Command).state;
	}
	const view = combatView(s);
	expect(view?.enemies.map((e) => e.key)).toContain('sepulchre_knight');
	const shieldbearer = view?.heroes.find((h) => h.id === 'shieldbearer');
	const block = shieldbearer?.status.block ?? 0;
	const shown = (view?.enemies ?? [])
		.flatMap((e) => e.intent?.damage ?? [])
		.filter((d) => d.target === 'shieldbearer')
		.reduce((n, d) => n + d.perHit * d.hits, 0);
	const before = shieldbearer?.hp ?? 0;
	const after =
		apply(s, { type: 'endTurn' }).state.party.find((h) => h.id === 'shieldbearer')?.hp ?? 0;
	expect(before - after).toBe(Math.max(0, shown - block));
});
