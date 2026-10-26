import type { EncounterDef, EnemyDef, IntentDef } from '../core/types.ts';

const atk = (
	id: string,
	amount: number,
	hits?: number,
	target: IntentDef['target'] = 'front',
): IntentDef => ({
	id,
	target,
	effects: [{ kind: 'damage', amount, hits }],
});

/** GDD 10.2 and 10.5. Intent cycles are in order. */
export const ENEMIES: Record<string, EnemyDef> = {
	husk_penitent: {
		key: 'husk_penitent',
		hp: 18,
		speed: 2,
		size: 1,
		intents: [
			atk('flail', 5),
			atk('flail', 5),
			{ id: 'mutter', target: 'front', effects: [{ kind: 'stress', amount: 1 }] },
		],
	},
	chitter_swarm: {
		key: 'chitter_swarm',
		hp: 10,
		speed: 5,
		size: 1,
		intents: [atk('bite', 2, 2)],
	},
	ash_acolyte: {
		key: 'ash_acolyte',
		hp: 22,
		speed: 3,
		size: 1,
		intents: [
			{ id: 'kindle', target: 'front', effects: [{ kind: 'mightAllEnemies', amount: 1 }] },
			atk('ash_strike', 6),
			atk('ash_strike', 6),
		],
	},
	graft_hound: {
		key: 'graft_hound',
		hp: 20,
		speed: 6,
		size: 1,
		intents: [
			atk('lunge', 7),
			{
				id: 'rend',
				target: 'front',
				effects: [
					{ kind: 'damage', amount: 3 },
					{ kind: 'status', status: 'bleed', amount: 3 },
				],
			},
			atk('lunge', 7),
		],
	},
	wax_mourner: {
		key: 'wax_mourner',
		hp: 16,
		speed: 1,
		size: 1,
		intents: [
			{ id: 'dirge', target: 'highestStress', effects: [{ kind: 'stress', amount: 2 }] },
			atk('drip', 4, undefined, 'lowestHP'),
			{ id: 'dirge', target: 'highestStress', effects: [{ kind: 'stress', amount: 2 }] },
		],
	},
	rust_templar: {
		key: 'rust_templar',
		hp: 34,
		speed: 2,
		size: 1,
		intents: [
			{ id: 'raise_shield', target: 'front', effects: [{ kind: 'selfBlock', amount: 10 }] },
			atk('cleave', 8, undefined, 'frontTwo'),
			atk('cleave', 8, undefined, 'frontTwo'),
		],
	},
	lantern_leech: {
		key: 'lantern_leech',
		hp: 14,
		speed: 4,
		size: 1,
		intents: [
			{
				id: 'drain',
				target: 'lowestHP',
				effects: [
					{ kind: 'damage', amount: 5 },
					{ kind: 'selfHeal', amount: 5 },
				],
			},
			{
				id: 'lure',
				target: 'back',
				effects: [{ kind: 'status', status: 'marked', amount: 1 }],
			},
			{
				id: 'drain',
				target: 'lowestHP',
				effects: [
					{ kind: 'damage', amount: 5 },
					{ kind: 'selfHeal', amount: 5 },
				],
			},
		],
	},
	choir_thing: {
		key: 'choir_thing',
		hp: 26,
		speed: 1,
		size: 1,
		intents: [
			{
				id: 'shriek',
				target: 'all',
				effects: [
					{ kind: 'stress', amount: 1 },
					{ kind: 'status', status: 'weakened', amount: 1 },
				],
			},
			{ id: 'hum', target: 'front', effects: [{ kind: 'wardAllEnemies', amount: 1 }] },
			{
				id: 'shriek',
				target: 'all',
				effects: [
					{ kind: 'stress', amount: 1 },
					{ kind: 'status', status: 'weakened', amount: 1 },
				],
			},
		],
	},
	ossified_brute: {
		key: 'ossified_brute',
		hp: 46,
		speed: 1,
		size: 1,
		intents: [
			{ id: 'gather', target: 'front', effects: [{ kind: 'telegraph' }] },
			atk('crush', 16),
			{
				id: 'shove',
				target: 'front',
				effects: [{ kind: 'damage', amount: 6 }, { kind: 'swapFrontHeroes' }],
			},
		],
	},
	rift_stalker: {
		key: 'rift_stalker',
		hp: 30,
		speed: 7,
		size: 1,
		intents: [
			{
				id: 'fade',
				target: 'front',
				effects: [{ kind: 'selfBlock', amount: 12 }, { kind: 'moveToBack' }],
			},
			atk('ambush', 11, undefined, 'back'),
			atk('rake', 4, 2, 'back'),
		],
	},
	bell_maw: {
		key: 'bell_maw',
		hp: 100,
		speed: 3,
		size: 2,
		fixedStart: true,
		phase2Hp: 50,
		intents: [
			{
				id: 'toll',
				target: 'all',
				effects: [{ kind: 'stress', amount: 2 }],
			},
			atk('clapper', 14),
			{
				id: 'resonance',
				target: 'front',
				effects: [
					{ kind: 'selfBlock', amount: 15 },
					{ kind: 'selfMight', amount: 1 },
				],
			},
		],
		phase2Intents: [
			atk('peal', 5, undefined, 'all'),
			atk('swallow', 18, undefined, 'highestStress'),
			{ id: 'toll', target: 'all', effects: [{ kind: 'stress', amount: 2 }] },
		],
	},
};

/** GDD 10.3 (rank order E1 to E4) and 10.4 (elites). */
export const ENCOUNTERS: Record<string, EncounterDef> = {
	A1: { id: 'A1', pool: 'A', enemies: [{ key: 'husk_penitent' }, { key: 'chitter_swarm' }] },
	A2: { id: 'A2', pool: 'A', enemies: [{ key: 'graft_hound' }, { key: 'chitter_swarm' }] },
	A3: { id: 'A3', pool: 'A', enemies: [{ key: 'husk_penitent' }, { key: 'ash_acolyte' }] },
	A4: { id: 'A4', pool: 'A', enemies: [{ key: 'husk_penitent' }, { key: 'wax_mourner' }] },
	A5: { id: 'A5', pool: 'A', enemies: [{ key: 'chitter_swarm' }, { key: 'lantern_leech' }] },
	A6: { id: 'A6', pool: 'A', enemies: [{ key: 'husk_penitent' }, { key: 'choir_thing' }] },
	B1: { id: 'B1', pool: 'B', enemies: [{ key: 'rust_templar' }, { key: 'ash_acolyte' }] },
	B2: {
		id: 'B2',
		pool: 'B',
		enemies: [{ key: 'graft_hound' }, { key: 'lantern_leech' }, { key: 'lantern_leech' }],
	},
	B3: {
		id: 'B3',
		pool: 'B',
		enemies: [{ key: 'husk_penitent' }, { key: 'husk_penitent' }, { key: 'choir_thing' }],
	},
	B4: {
		id: 'B4',
		pool: 'B',
		enemies: [{ key: 'ossified_brute' }, { key: 'chitter_swarm' }, { key: 'chitter_swarm' }],
	},
	B5: {
		id: 'B5',
		pool: 'B',
		enemies: [{ key: 'husk_penitent' }, { key: 'rift_stalker' }, { key: 'wax_mourner' }],
	},
	EL1: {
		id: 'EL1',
		pool: 'elite',
		enemies: [{ key: 'rust_templar', elite: 'oathwall' }, { key: 'ash_acolyte' }],
	},
	EL2: {
		id: 'EL2',
		pool: 'elite',
		enemies: [{ key: 'ossified_brute', elite: 'calcified' }, { key: 'wax_mourner' }],
	},
	BOSS: { id: 'BOSS', pool: 'boss', enemies: [{ key: 'bell_maw' }] },
};

/** GDD 10.4 */
export const ELITE = {
	hpMul: 1.25,
	damageMul: 1.25,
	calcifiedReduction: 2,
	oathwallBlock: 5,
};
