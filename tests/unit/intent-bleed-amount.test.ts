import { expect, test } from 'bun:test';
import { chooseBotCommand } from '../../src/core/bot.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type { Command, RunState } from '../../src/core/types.ts';
import { combatView } from '../../src/core/views.ts';
import { PARTY } from './helpers.ts';

// BUG (found by coverage-views P3 check): an enemy intent that applies Bleed shows the status
// name only (IntentView.debuffs = ["bleed"]). The HP lost to the Bleed tick at the start of the
// next turn is not shown, so the preview is not what happens (GDD P3). Seed 9's graft hound
// shows "bleed" and then costs the party 3 extra HP. Expected: the amount is visible on the intent.

test('a shown Bleed debuff carries its amount (seed 9, graft hound "rend")', () => {
	let s: RunState = createRun(9, PARTY);
	for (let i = 0; i < 400 && s.phase !== 'combat'; i++) {
		s = apply(s, chooseBotCommand(s) as Command).state;
	}
	const hound = combatView(s)?.enemies.find((e) => e.key === 'graft_hound');
	expect(hound?.intent?.debuffs).toBeDefined();
	expect(hound?.intent?.debuffs.join(' ')).toMatch(/bleed\D*\d/i);
});
