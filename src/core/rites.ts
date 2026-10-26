// Difficulty ladder "Rites" (docs/gdd.md §13.3): the level lives on the run; each rule is read where
// it applies (combat start, prices, rest, injury) through these helpers.
import { RITE_LEVEL, RITES } from '../data/index.ts';
import type { RunState } from './types.ts';

export type RiteRule = keyof typeof RITE_LEVEL;

/** Rite of a run, 0 for saves made before Rites existed. */
export function riteLevel(s: Pick<RunState, 'rite'>): number {
	return s.rite ?? 0;
}

export function riteOn(s: Pick<RunState, 'rite'>, rule: RiteRule): boolean {
	return riteLevel(s) >= RITE_LEVEL[rule];
}

/** Sets a fresh run's Rite and applies the start-of-run rules (gold, stress). Pure. */
export function applyRite(state: RunState, rite: number): RunState {
	const s: RunState = structuredClone(state);
	s.rite = Math.max(0, Math.min(RITES.max, Math.floor(rite)));
	if (riteOn(s, 'startGold')) s.gold = RITES.startGold;
	if (riteOn(s, 'startStress')) for (const h of s.party) h.stress = RITES.startStress;
	return s;
}

/** Shop and camp price after the Rite surcharge. */
export function ritePrice(s: Pick<RunState, 'rite'>, base: number): number {
	return riteOn(s, 'prices') ? Math.round(base * RITES.priceMul) : base;
}
