import type { EquipmentDef } from '../core/types.ts';

/** GDD 12.2. Effects are implemented by key in `src/core/equipment.ts`. */
export const EQUIPMENT: Record<string, EquipmentDef> = {
	eq_notched_blade: { key: 'eq_notched_blade', slot: 'weapon', rarity: 'common' },
	eq_heavy_pavise: { key: 'eq_heavy_pavise', slot: 'weapon', rarity: 'common' },
	eq_bone_reliquary: { key: 'eq_bone_reliquary', slot: 'relic', rarity: 'common' },
	eq_ember_focus: { key: 'eq_ember_focus', slot: 'weapon', rarity: 'uncommon' },
	eq_votive_candle: { key: 'eq_votive_candle', slot: 'relic', rarity: 'uncommon' },
	eq_iron_rosary: { key: 'eq_iron_rosary', slot: 'relic', rarity: 'uncommon' },
	eq_hunters_lens: { key: 'eq_hunters_lens', slot: 'weapon', rarity: 'rare' },
	eq_bell_clapper: { key: 'eq_bell_clapper', slot: 'relic', rarity: 'legendary' },
};

export const EQUIPMENT_NUMBERS = {
	notchedBladeBonus: 1,
	paviseBlockBonus: 2,
	reliquaryMaxHP: 6,
	emberFocusBurn: 2,
	votiveStressRelief: 1,
	rosaryBlock: 6,
	lensMarked: 2,
	clapperStressThreshold: 7,
	clapperEnergy: 1,
} as const;
