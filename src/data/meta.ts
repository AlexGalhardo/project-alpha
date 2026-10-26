import type { HeroClass } from '../core/types';

/** Skill tree v1 (docs/gdd.md §22.5): one branch of 3 nodes per hero, bought in order. ⚖ */
export const TREE = {
	nodeCosts: [10, 25, 45] as const,
	/** Card A (node I, also the Veteran-start card of node III) and card B (node II). */
	cards: {
		shieldbearer: ['shb_rampart', 'shb_riposte'],
		marksman: ['mrk_ricochet', 'mrk_deadeye'],
		arcanist: ['arc_cinder_ward', 'arc_inferno'],
		confessor: ['cnf_penance', 'cnf_last_rites'],
		bombardier: ['bmb_shrapnel', 'bmb_flashbang'],
	} satisfies Record<HeroClass, readonly [string, string]>,
} as const;
