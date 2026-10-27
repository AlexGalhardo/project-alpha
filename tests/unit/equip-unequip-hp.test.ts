import { expect, test } from 'bun:test';
import { maxHP } from '../../src/core/ops.ts';
import { apply, createRun } from '../../src/core/run.ts';
import { PARTY } from './helpers.ts';

function at<T>(xs: readonly T[], i: number): T {
	const v = xs[i];
	if (v === undefined) throw new Error(`missing index ${i}`);
	return v;
}

// BUG (found by coverage-run-rules): run.ts equip() returns early when unequipping
// (item === null), before the clamp `h.hp = Math.min(h.hp, maxHP(h))` that the item path has.
// Expected: HP never stays above the new max after a relic that gave max HP is removed.
// Keep failing until src/core/run.ts is fixed; do not weaken this test.
test('BUG: unequipping a max-HP relic clamps HP to the new maximum', () => {
	const s = createRun(1, PARTY);
	s.stash = [];
	at(s.party, 0).relic = 'eq_bone_reliquary';
	at(s.party, 0).hp = maxHP(at(s.party, 0));
	const without = maxHP({ ...at(s.party, 0), relic: null });
	const r = apply(s, { type: 'equip', heroId: 'shieldbearer', slot: 'relic', item: null });
	expect(at(r.state.party, 0).hp).toBeLessThanOrEqual(without);
});
