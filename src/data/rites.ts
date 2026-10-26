// Difficulty ladder "Rites" (docs/gdd.md §13.3). Cumulative: rite n applies every rule of level <= n. ⚖

/** Level at which each rule turns on (the GDD table row). */
export const RITE_LEVEL = {
	eliteHp: 1,
	commonDamage: 2,
	startGold: 3,
	bossHp: 4,
	recoverHeal: 5,
	startStress: 6,
	prices: 7,
	enemyMight: 8,
	injury: 9,
	bossIntent: 10,
} as const;

export const RITES = {
	max: 10,
	eliteHpMul: 1.2,
	commonDamageMul: 1.15,
	startGold: 30,
	bossHpMul: 1.2,
	recoverHealPct: 20,
	startStress: 2,
	priceMul: 1.15,
	enemyMight: 1,
	injuryMaxHPMul: 0.65,
	/**
	 * Phase-1 intent each boss adds to its phase-2 cycle at rite 10: Bell-Maw's Clapper adds a heavy
	 * single hit between the area attacks; the Gilded Penitent's Gild adds Block and Might to outlast.
	 */
	bossExtraIntent: { bell_maw: 'clapper', gilded_penitent: 'gild' } as Record<string, string>,
} as const;
