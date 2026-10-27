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
				// 2 so one stack survives the end-of-player-turn decay and still amplifies the next enemy phase.
				effects: [{ kind: 'status', status: 'marked', amount: 2 }],
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
		phase2Might: 2,
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

	// ---- Act 2 (docs/gdd.md 22.2). HP and damage are scaled by ACT_RULES at combat start. ----
	vault_warden: {
		key: 'vault_warden',
		hp: 30,
		speed: 2,
		size: 1,
		intents: [
			atk('shield_bash', 7),
			{ id: 'brace', target: 'front', effects: [{ kind: 'selfBlock', amount: 8 }] },
			atk('shield_bash', 7),
		],
	},
	bone_lancer: {
		key: 'bone_lancer',
		hp: 22,
		speed: 4,
		size: 1,
		intents: [
			atk('pierce', 6, undefined, 'frontTwo'),
			atk('pierce', 6, undefined, 'frontTwo'),
			{ id: 'withdraw', target: 'front', effects: [{ kind: 'moveToBack' }] },
		],
	},
	censer_wraith: {
		key: 'censer_wraith',
		hp: 18,
		speed: 5,
		size: 1,
		intents: [
			atk('choke', 4, undefined, 'lowestHP'),
			{
				id: 'smoke',
				target: 'all',
				effects: [{ kind: 'status', status: 'weakened', amount: 1 }],
			},
		],
	},
	flesh_organ: {
		key: 'flesh_organ',
		hp: 28,
		speed: 1,
		size: 1,
		intents: [
			{ id: 'hymn', target: 'front', effects: [{ kind: 'mightAllEnemies', amount: 1 }] },
			{ id: 'drone', target: 'all', effects: [{ kind: 'stress', amount: 1 }] },
			{ id: 'hymn', target: 'front', effects: [{ kind: 'mightAllEnemies', amount: 1 }] },
		],
	},
	gutter_crawler: {
		key: 'gutter_crawler',
		hp: 12,
		speed: 6,
		size: 1,
		intents: [atk('gnaw', 3, 2)],
	},
	relic_thief: {
		key: 'relic_thief',
		hp: 20,
		speed: 7,
		size: 1,
		intents: [
			{
				id: 'cut',
				target: 'back',
				effects: [
					{ kind: 'damage', amount: 5 },
					{ kind: 'status', status: 'bleed', amount: 2 },
				],
			},
			{
				id: 'cut',
				target: 'back',
				effects: [
					{ kind: 'damage', amount: 5 },
					{ kind: 'status', status: 'bleed', amount: 2 },
				],
			},
			{ id: 'vanish', target: 'front', effects: [{ kind: 'selfBlock', amount: 10 }] },
		],
	},
	mirror_saint: {
		key: 'mirror_saint',
		hp: 24,
		speed: 3,
		size: 1,
		intents: [
			{ id: 'reflect', target: 'front', effects: [{ kind: 'selfBlock', amount: 12 }] },
			{
				id: 'glare',
				target: 'back',
				effects: [{ kind: 'status', status: 'marked', amount: 2 }],
			},
			atk('smite', 8, undefined, 'marked'),
		],
	},
	hollow_bishop: {
		key: 'hollow_bishop',
		hp: 26,
		speed: 2,
		size: 1,
		intents: [
			{ id: 'sermon', target: 'highestStress', effects: [{ kind: 'stress', amount: 2 }] },
			atk('rebuke', 6),
			{ id: 'sermon', target: 'highestStress', effects: [{ kind: 'stress', amount: 2 }] },
		],
	},
	chain_golem: {
		key: 'chain_golem',
		hp: 52,
		speed: 1,
		size: 1,
		intents: [
			{ id: 'wind_up', target: 'front', effects: [{ kind: 'telegraph' }] },
			atk('chain_sweep', 10, undefined, 'frontTwo'),
			{
				id: 'shove',
				target: 'front',
				effects: [{ kind: 'damage', amount: 6 }, { kind: 'swapFrontHeroes' }],
			},
		],
	},
	rot_cherub: {
		key: 'rot_cherub',
		hp: 16,
		speed: 6,
		size: 1,
		intents: [
			{
				id: 'spit',
				target: 'lowestHP',
				effects: [
					{ kind: 'damage', amount: 4 },
					{ kind: 'status', status: 'bleed', amount: 2 },
				],
			},
			{
				id: 'spit',
				target: 'lowestHP',
				effects: [
					{ kind: 'damage', amount: 4 },
					{ kind: 'status', status: 'bleed', amount: 2 },
				],
			},
			{ id: 'hover', target: 'front', effects: [{ kind: 'selfBlock', amount: 6 }] },
		],
	},
	// Act 2 boss (docs/gdd.md 22.3): HP is final, not scaled by act.
	gilded_penitent: {
		key: 'gilded_penitent',
		hp: 110,
		speed: 3,
		size: 2,
		fixedStart: true,
		phase2Hp: 55,
		phase2Might: 2,
		intents: [
			atk('lash', 12),
			{ id: 'confession', target: 'all', effects: [{ kind: 'stress', amount: 2 }] },
			{
				id: 'gild',
				target: 'front',
				effects: [
					{ kind: 'selfBlock', amount: 15 },
					{ kind: 'selfMight', amount: 1 },
				],
			},
		],
		phase2Intents: [
			atk('scourge', 6, undefined, 'all'),
			atk('lash', 16, undefined, 'highestStress'),
			{ id: 'confession', target: 'all', effects: [{ kind: 'stress', amount: 2 }] },
		],
	},
	// Act 3, the Iron Sepulchre (docs/gdd.md §23.2). Act scaling applies to all but the boss.
	iron_mourner: {
		key: 'iron_mourner',
		hp: 27,
		speed: 2,
		size: 1,
		intents: [
			atk('toll_hammer', 9),
			{ id: 'brace', target: 'front', effects: [{ kind: 'selfBlock', amount: 10 }] },
			{
				id: 'toll_hammer',
				target: 'front',
				effects: [
					{ kind: 'damage', amount: 9 },
					{ kind: 'stress', amount: 1 },
				],
			},
		],
	},
	grave_cur: {
		key: 'grave_cur',
		hp: 18,
		speed: 7,
		size: 1,
		intents: [
			atk('snap', 4, 2),
			{
				id: 'cur_rend',
				target: 'lowestHP',
				effects: [
					{ kind: 'damage', amount: 4 },
					{ kind: 'status', status: 'bleed', amount: 3 },
				],
			},
			atk('snap', 4, 2),
		],
	},
	ash_cantor: {
		key: 'ash_cantor',
		hp: 16,
		speed: 3,
		size: 1,
		intents: [
			{ id: 'lament', target: 'highestStress', effects: [{ kind: 'stress', amount: 2 }] },
			{ id: 'kindle', target: 'front', effects: [{ kind: 'mightAllEnemies', amount: 1 }] },
			atk('ember', 6, undefined, 'back'),
		],
	},
	bronze_scribe: {
		key: 'bronze_scribe',
		hp: 20,
		speed: 4,
		size: 1,
		intents: [
			{
				id: 'mark_the_name',
				target: 'front',
				effects: [{ kind: 'status', status: 'marked', amount: 2 }],
			},
			atk('etch', 8, undefined, 'marked'),
			{ id: 'seal', target: 'front', effects: [{ kind: 'wardAllEnemies', amount: 1 }] },
		],
	},
	hollow_choir: {
		key: 'hollow_choir',
		hp: 22,
		speed: 1,
		size: 1,
		intents: [
			{ id: 'choir_dirge', target: 'all', effects: [{ kind: 'stress', amount: 1 }] },
			{
				id: 'hush',
				target: 'all',
				effects: [{ kind: 'status', status: 'weakened', amount: 1 }],
			},
			{ id: 'choir_dirge', target: 'all', effects: [{ kind: 'stress', amount: 1 }] },
		],
	},
	sepulchre_knight: {
		key: 'sepulchre_knight',
		hp: 36,
		speed: 2,
		size: 1,
		intents: [
			{ id: 'wind_up', target: 'front', effects: [{ kind: 'telegraph' }] },
			atk('execution', 18),
			{ id: 'iron_wall', target: 'front', effects: [{ kind: 'selfBlock', amount: 14 }] },
		],
	},
	wax_saint: {
		key: 'wax_saint',
		hp: 15,
		speed: 5,
		size: 1,
		intents: [
			{
				id: 'wax_drip',
				target: 'lowestHP',
				effects: [
					{ kind: 'damage', amount: 5 },
					{ kind: 'status', status: 'bleed', amount: 2 },
				],
			},
			{ id: 'mend_wax', target: 'front', effects: [{ kind: 'selfHeal', amount: 8 }] },
			{
				id: 'wax_drip',
				target: 'lowestHP',
				effects: [
					{ kind: 'damage', amount: 5 },
					{ kind: 'status', status: 'bleed', amount: 2 },
				],
			},
		],
	},
	chain_wraith: {
		key: 'chain_wraith',
		hp: 16,
		speed: 6,
		size: 1,
		intents: [
			{
				id: 'drag',
				target: 'front',
				effects: [{ kind: 'damage', amount: 5 }, { kind: 'swapFrontHeroes' }],
			},
			atk('chain_lash', 6, undefined, 'frontTwo'),
			{
				id: 'wraith_fade',
				target: 'front',
				effects: [{ kind: 'selfBlock', amount: 8 }, { kind: 'moveToBack' }],
			},
		],
	},
	marrow_butcher: {
		key: 'marrow_butcher',
		hp: 24,
		speed: 4,
		size: 1,
		intents: [
			atk('cleave', 7, undefined, 'frontTwo'),
			{ id: 'frenzy', target: 'front', effects: [{ kind: 'selfMight', amount: 2 }] },
			atk('cleave', 7, undefined, 'frontTwo'),
		],
	},
	rift_spawn: {
		key: 'rift_spawn',
		hp: 8,
		speed: 6,
		size: 1,
		intents: [atk('bite', 3, 2)],
	},
	// Final boss (docs/gdd.md §23.4): the only enemy with three phases. HP is final.
	rift_mother: {
		key: 'rift_mother',
		hp: 100,
		speed: 3,
		size: 2,
		fixedStart: true,
		phase2Hp: 66,
		phase2Might: 2,
		phase3Hp: 33,
		phase3Might: 2,
		intents: [
			atk('embrace', 12),
			{ id: 'wail', target: 'all', effects: [{ kind: 'stress', amount: 2 }] },
			{ id: 'coil', target: 'front', effects: [{ kind: 'selfBlock', amount: 15 }] },
		],
		phase2Intents: [
			atk('rend_the_veil', 5, undefined, 'all'),
			atk('devour', 15, undefined, 'highestStress'),
			{ id: 'wail', target: 'all', effects: [{ kind: 'stress', amount: 2 }] },
		],
		phase3Intents: [
			{
				id: 'unmaking',
				target: 'all',
				effects: [
					{ kind: 'damage', amount: 6 },
					{ kind: 'stress', amount: 1 },
				],
			},
			atk('devour_weakest', 16, undefined, 'lowestHP'),
			{
				id: 'heartbeat',
				target: 'front',
				effects: [
					{ kind: 'selfHeal', amount: 8 },
					{ kind: 'selfBlock', amount: 10 },
				],
			},
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

	// ---- Act 2 (docs/gdd.md 22.3) ----
	'A2-1': {
		id: 'A2-1',
		act: 2,
		pool: 'A',
		enemies: [{ key: 'gutter_crawler' }, { key: 'gutter_crawler' }],
	},
	'A2-2': {
		id: 'A2-2',
		act: 2,
		pool: 'A',
		enemies: [{ key: 'bone_lancer' }, { key: 'censer_wraith' }],
	},
	'A2-3': {
		id: 'A2-3',
		act: 2,
		pool: 'A',
		enemies: [{ key: 'vault_warden' }, { key: 'rot_cherub' }],
	},
	'A2-4': {
		id: 'A2-4',
		act: 2,
		pool: 'A',
		enemies: [{ key: 'gutter_crawler' }, { key: 'relic_thief' }],
	},
	'A2-5': {
		id: 'A2-5',
		act: 2,
		pool: 'A',
		enemies: [{ key: 'vault_warden' }, { key: 'flesh_organ' }],
	},
	'B2-1': {
		id: 'B2-1',
		act: 2,
		pool: 'B',
		enemies: [{ key: 'vault_warden' }, { key: 'hollow_bishop' }, { key: 'censer_wraith' }],
	},
	'B2-2': {
		id: 'B2-2',
		act: 2,
		pool: 'B',
		enemies: [{ key: 'chain_golem' }, { key: 'rot_cherub' }],
	},
	'B2-3': {
		id: 'B2-3',
		act: 2,
		pool: 'B',
		enemies: [{ key: 'bone_lancer' }, { key: 'mirror_saint' }, { key: 'flesh_organ' }],
	},
	'B2-4': {
		id: 'B2-4',
		act: 2,
		pool: 'B',
		enemies: [{ key: 'relic_thief' }, { key: 'relic_thief' }, { key: 'hollow_bishop' }],
	},
	'B2-5': {
		id: 'B2-5',
		act: 2,
		pool: 'B',
		enemies: [{ key: 'chain_golem' }, { key: 'gutter_crawler' }, { key: 'mirror_saint' }],
	},
	'EL2-1': {
		id: 'EL2-1',
		act: 2,
		pool: 'elite',
		enemies: [{ key: 'vault_warden', elite: 'oathwall' }, { key: 'censer_wraith' }],
	},
	'EL2-2': {
		id: 'EL2-2',
		act: 2,
		pool: 'elite',
		enemies: [{ key: 'chain_golem', elite: 'calcified' }, { key: 'flesh_organ' }],
	},
	BOSS2: { id: 'BOSS2', act: 2, pool: 'boss', enemies: [{ key: 'gilded_penitent' }] },
	// Act 3 (docs/gdd.md §23.3).
	'A3-1': {
		id: 'A3-1',
		act: 3,
		pool: 'A',
		enemies: [{ key: 'rift_spawn' }, { key: 'rift_spawn' }, { key: 'ash_cantor' }],
	},
	'A3-2': {
		id: 'A3-2',
		act: 3,
		pool: 'A',
		enemies: [{ key: 'iron_mourner' }, { key: 'wax_saint' }],
	},
	'A3-3': {
		id: 'A3-3',
		act: 3,
		pool: 'A',
		enemies: [{ key: 'grave_cur' }, { key: 'bronze_scribe' }],
	},
	'A3-4': {
		id: 'A3-4',
		act: 3,
		pool: 'A',
		enemies: [{ key: 'marrow_butcher' }, { key: 'hollow_choir' }],
	},
	'A3-5': {
		id: 'A3-5',
		act: 3,
		pool: 'A',
		enemies: [{ key: 'grave_cur' }, { key: 'chain_wraith' }],
	},
	'B3-1': {
		id: 'B3-1',
		act: 3,
		pool: 'B',
		enemies: [{ key: 'sepulchre_knight' }, { key: 'bronze_scribe' }, { key: 'ash_cantor' }],
	},
	'B3-2': {
		id: 'B3-2',
		act: 3,
		pool: 'B',
		enemies: [{ key: 'iron_mourner' }, { key: 'chain_wraith' }, { key: 'hollow_choir' }],
	},
	'B3-3': {
		id: 'B3-3',
		act: 3,
		pool: 'B',
		enemies: [{ key: 'marrow_butcher' }, { key: 'grave_cur' }, { key: 'wax_saint' }],
	},
	'B3-4': {
		id: 'B3-4',
		act: 3,
		pool: 'B',
		enemies: [{ key: 'sepulchre_knight' }, { key: 'rift_spawn' }, { key: 'rift_spawn' }],
	},
	'B3-5': {
		id: 'B3-5',
		act: 3,
		pool: 'B',
		enemies: [{ key: 'marrow_butcher' }, { key: 'bronze_scribe' }, { key: 'hollow_choir' }],
	},
	'EL3-1': {
		id: 'EL3-1',
		act: 3,
		pool: 'elite',
		enemies: [{ key: 'iron_mourner', elite: 'oathwall' }, { key: 'wax_saint' }],
	},
	'EL3-2': {
		id: 'EL3-2',
		act: 3,
		pool: 'elite',
		enemies: [{ key: 'sepulchre_knight', elite: 'calcified' }, { key: 'ash_cantor' }],
	},
	BOSS3: { id: 'BOSS3', act: 3, pool: 'boss', enemies: [{ key: 'rift_mother' }] },
};

/** GDD 10.4 */
export const ELITE = {
	hpMul: 1.25,
	damageMul: 1.25,
	calcifiedReduction: 1,
	oathwallBlock: 5,
};
