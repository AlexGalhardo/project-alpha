import { expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { Command, RunState } from '../../src/core/types.ts';
import { combatView } from '../../src/core/views.ts';
import { PARTY } from './helpers.ts';

// Regression (found by p3-invariant-acts, fixed): an intent's damage is computed from the attacker's Might at
// view time. Enemies resolve in queue order, so an earlier enemy's Kindle (+1 Might to every
// enemy) raises a later enemy's hit after the preview was drawn. Seed 1, Act 1, combat row 4,
// turn 2: the Rust Templar's Cleave shows 10 on the Shieldbearer (4 Block), so 6 is predicted, but
// the Ash Acolyte's Kindle runs first and the hit lands for 11, so 7 HP is lost.
// GDD P3: what is shown equals what happens. Fixed: combatView takes intent damage from a projection
// of the enemy phase (src/core/combat.ts projectEnemyPhase), so queue-order Might is included.
test('the damage an intent shows is the damage it deals after earlier enemies resolve (seed 1, row 4, turn 2)', () => {
	let s: RunState = createRun(1, PARTY);
	for (let i = 0; i < 4000; i++) {
		const v = combatView(s);
		if (s.phase === 'combat' && v?.phase === 'player' && v.turn === 2 && s.cursor?.row === 4)
			break;
		s = apply(s, chooseBotCommand(s) as Command).state;
	}
	const view = combatView(s);
	expect(view?.enemies.map((e) => e.key)).toContain('rust_templar');
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
