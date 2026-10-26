// Event and treasure nodes (docs/gdd.md §22.4). Every number here is ⚖.

/** Alpha feature flags. `events: false` generates the prototype map with no event or treasure node. */
export const ALPHA = { events: true };

export const EVENT_MAP = {
	/** Rows where one combat node may become an event. */
	eventRows: [2, 3, 5, 6, 8],
	eventChance: 0.4,
	/** Rows where one non-shop node may become the act's single treasure. */
	treasureRows: [5, 6],
	treasureChance: 0.35,
	/** Fights (combat or elite) every path must keep before the boss. */
	minFights: 5,
} as const;

export const TREASURE = {
	gold: 25,
	/** Equipment odds in percent: [common, uncommon, rare]. */
	equipmentOdds: [0, 60, 40],
} as const;

/**
 * One effect of an event choice. "each" effects apply to every party hero; `h1` is the hero in rank 1;
 * `lowest` the hero with the lowest HP. Random picks are rolled when the event opens so the preview
 * shows them (no hidden chance, GDD P3).
 */
export type EventEffect =
	| { kind: 'healPctEach'; pct: number }
	| { kind: 'healEach'; amount: number }
	| { kind: 'stressEach'; amount: number }
	| { kind: 'stressH1'; amount: number }
	| { kind: 'damageH1'; amount: number }
	| { kind: 'damageLowest'; amount: number }
	| { kind: 'gold'; amount: number }
	| { kind: 'relic'; rarity: 'common' }
	| { kind: 'equipment'; rarity: 'common' }
	| { kind: 'cardOffer'; rarity: 'uncommon'; count: number }
	| { kind: 'upgradeRandom'; count: number }
	| { kind: 'upgradeChoose'; count: number }
	| { kind: 'removeChoose'; count: number };

export interface EventChoiceDef {
	/** Gold paid to take the choice; it is unavailable when the party cannot pay. */
	cost?: number;
	effects: EventEffect[];
}

export interface EventDef {
	id: string;
	/** The last choice is always "Leave" with no effect. */
	choices: EventChoiceDef[];
}

const LEAVE: EventChoiceDef = { effects: [] };

export const EVENTS: Record<string, EventDef> = {
	ev_weeping_font: {
		id: 'ev_weeping_font',
		choices: [
			{
				effects: [
					{ kind: 'healPctEach', pct: 20 },
					{ kind: 'stressEach', amount: 2 },
				],
			},
			{ effects: [{ kind: 'gold', amount: 40 }] },
			LEAVE,
		],
	},
	ev_ossuary_shrine: {
		id: 'ev_ossuary_shrine',
		choices: [
			{ cost: 30, effects: [{ kind: 'stressEach', amount: -3 }] },
			{
				effects: [
					{ kind: 'relic', rarity: 'common' },
					{ kind: 'stressH1', amount: 2 },
				],
			},
			LEAVE,
		],
	},
	ev_chained_penitent: {
		id: 'ev_chained_penitent',
		choices: [
			{
				effects: [
					{ kind: 'damageH1', amount: 6 },
					{ kind: 'cardOffer', rarity: 'uncommon', count: 3 },
				],
			},
			{ effects: [{ kind: 'upgradeRandom', count: 1 }] },
			LEAVE,
		],
	},
	ev_forgotten_armory: {
		id: 'ev_forgotten_armory',
		choices: [
			{
				effects: [
					{ kind: 'equipment', rarity: 'common' },
					{ kind: 'damageLowest', amount: 8 },
				],
			},
			LEAVE,
		],
	},
	ev_whispering_choir: {
		id: 'ev_whispering_choir',
		choices: [
			{
				effects: [
					{ kind: 'removeChoose', count: 1 },
					{ kind: 'stressEach', amount: 2 },
				],
			},
			LEAVE,
		],
	},
	ev_ember_pilgrim: {
		id: 'ev_ember_pilgrim',
		choices: [
			{ cost: 25, effects: [{ kind: 'upgradeChoose', count: 2 }] },
			{ effects: [{ kind: 'healEach', amount: 10 }] },
			LEAVE,
		],
	},
};

export const EVENT_IDS = Object.keys(EVENTS);
