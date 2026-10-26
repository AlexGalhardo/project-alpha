/** Balance numbers of GDD 4-7, 11 and 13. Change only with a simulation report. */
export const RULES = {
	energy: 3,
	draw: 5,
	handMax: 10,
	stressMax: 10,
	stressReset: 5,
	fallStressToOthers: 2,
	winStressRelief: 1,
	injuryMaxHPMul: 0.75,
	fallenReturnHP: 1,
	markedMul: 1.5,
	weakenedMul: 0.75,
	turnCap: 30,
	// From this combat turn every enemy gains enrageMight Might at the start of each turn (GDD 5.2).
	enrageTurn: 10,
	enrageMight: 1,
	stashMax: 6,
	partySize: 3,
	rows: 10,
} as const;

export const GOLD = {
	start: 50,
	combatBase: 10,
	combatRange: 6,
	eliteBase: 28,
	eliteRange: 8,
	boss: 75,
} as const;

export const CARD_REWARD = {
	count: 3,
	// [common, uncommon, rare] in percent
	combat: [65, 30, 5],
	elite: [40, 45, 15],
	pityStep: 2,
	pityMax: 20,
} as const;

export const EQUIPMENT_DROP = {
	// [common, uncommon, rare] in percent
	elite: [50, 40, 10],
	shop: [50, 40, 10],
	camp: [60, 40, 0],
} as const;

export const CAMP = {
	swapPrice: 30,
	cardPrice: { common: 35, uncommon: 55, rare: 90 },
	// Rare only appears when every common and uncommon item is owned (fallback); priced as in the shop.
	equipmentPrice: { common: 50, uncommon: 85, rare: 140 },
	servicePrice: 12,
	bindHealPct: 15,
	vigilStress: 3,
	/** Chance that the seeded service is Vigil rather than Bind wounds. */
	vigilChance: 0.5,
} as const;

export const REST = {
	recoverHealPct: 30,
	prayStress: 5,
} as const;

export const SHOP = {
	cardCounts: { common: 3, uncommon: 1, rare: 1 },
	cardPrice: { common: [40, 48], uncommon: [62, 75], rare: [110, 130] },
	equipmentCount: 2,
	equipmentPrice: { common: 55, uncommon: 90, rare: 140 },
	removalBase: 50,
	removalStep: 25,
} as const;

export const EMBERS = { perRound: 2, perElite: 5, perBoss: 15 } as const;

/** GDD 4.2: nodes per row and node types. A range means seeded between min and max. */
export const MAP_LAYOUT: { nodes: [number, number]; types: string[] }[] = [
	{ nodes: [2, 2], types: ['combat', 'combat'] },
	{ nodes: [3, 3], types: ['combat', 'combat', 'combat'] },
	{ nodes: [2, 2], types: ['combat', 'combat'] },
	{ nodes: [2, 3], types: ['elite', 'combat', 'combat?'] },
	{ nodes: [3, 3], types: ['combat', 'combat', 'shop'] },
	{ nodes: [2, 2], types: ['combat', 'combat'] },
	{ nodes: [2, 3], types: ['elite', 'combat', 'combat?'] },
	{ nodes: [3, 3], types: ['combat', 'combat', 'shop'] },
	{ nodes: [2, 2], types: ['rest', 'shop'] },
	{ nodes: [1, 1], types: ['boss'] },
];

/** GDD 4.3. Weight of an encounter from the other tier when choosing by novelty (0 = tiers are strict). */
export const ENCOUNTER_RULES = { offTierWeight: 0 };

/** Edge generation (GDD 4.2): chance a node gets a second edge, and tries before the fallback layout. */
export const MAP_RULES = { secondEdgeChance: 0.45, edgeAttempts: 300 } as const;

/** GDD 4.3 and 22.1. `acts` is 1 for the prototype flow and 2 for Alpha (Alpha ships both acts). */
export const ACT_RULES = {
	acts: 3,
	/** Share of max HP every hero heals between acts (injuries are cleared too). */
	betweenActHealPct: 50,
	/** Added per act after the first, for non-boss enemies (HP x1.2, damage x1.1 in Act 2). */
	hpPerAct: 0.2,
	dmgPerAct: 0.1,
};
