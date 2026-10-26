// Offers: card rewards, equipment drops, camp and shop stock (GDD 4.4, 4.6, 11).
import {
	CAMP,
	CARD_REWARD,
	CARDS,
	EQUIPMENT,
	EQUIPMENT_DROP,
	HEROES,
	RULES,
	SHOP,
} from '../data/index.ts';
import { cardDef } from './cards.ts';
import { pick, rand, randInt } from './rng.ts';
import type { CampState, CardInst, GameEvent, Rarity, RunState, ShopState } from './types.ts';

type Tier = 'common' | 'uncommon' | 'rare';

export function newCard(s: RunState, cardId: string, upgraded = false): CardInst {
	const d = cardDef(cardId);
	const inst: CardInst = { uid: s.nextUid, cardId, upgraded, owner: d.owner };
	s.nextUid += 1;
	return inst;
}

/** Non-starter cards of the party heroes, by rarity. */
export function partyPool(s: RunState, rarity: Tier): string[] {
	const out: string[] = [];
	for (const h of s.party) {
		for (const id of HEROES[h.id].pool) {
			if (CARDS[id]?.rarity === rarity) out.push(id);
		}
	}
	// Skill-tree unlocks (docs/gdd.md §22.5) join the pool of their owner while it is in the party.
	for (const id of s.unlocked ?? []) {
		const card = CARDS[id];
		if (card?.rarity === rarity && s.party.some((h) => h.id === card.owner)) out.push(id);
	}
	return out;
}

function rollTier(s: RunState, odds: readonly number[], pity = 0): Tier {
	const rare = (odds[2] ?? 0) + pity;
	const common = Math.max(0, (odds[0] ?? 0) - pity);
	const unc = odds[1] ?? 0;
	const r = rand(s, 'meta') * (common + unc + rare);
	if (r < common) return 'common';
	if (r < common + unc) return 'uncommon';
	return 'rare';
}

const ORDER: Tier[] = ['common', 'uncommon', 'rare'];

function pickCard(s: RunState, tier: Tier, taken: string[]): string | null {
	const tiers = [tier, ...ORDER.filter((t) => t !== tier)];
	for (const t of tiers) {
		const pool = partyPool(s, t).filter((id) => !taken.includes(id));
		if (pool.length > 0) return pick(s, 'meta', pool);
	}
	return null;
}

/** GDD 11.2. Boss: 3 distinct rares. Updates the rare pity counter for combat and elite offers. */
export function makeCardOffer(s: RunState, kind: 'common' | 'elite' | 'boss'): string[] {
	const out: string[] = [];
	for (let i = 0; i < CARD_REWARD.count; i++) {
		const tier: Tier =
			kind === 'boss'
				? 'rare'
				: rollTier(
						s,
						kind === 'elite' ? CARD_REWARD.elite : CARD_REWARD.combat,
						s.rarePity,
					);
		const id = pickCard(s, tier, out);
		if (id) out.push(id);
	}
	if (kind !== 'boss') {
		const hasRare = out.some((id) => CARDS[id]?.rarity === 'rare');
		s.rarePity = hasRare ? 0 : Math.min(CARD_REWARD.pityMax, s.rarePity + CARD_REWARD.pityStep);
	}
	return out;
}

export function ownedItems(s: RunState): string[] {
	const out = [...s.stash];
	for (const h of s.party) {
		if (h.weapon) out.push(h.weapon);
		if (h.relic) out.push(h.relic);
	}
	return out;
}

export function rollEquipment(
	s: RunState,
	odds: readonly number[],
	exclude: string[] = [],
): string | null {
	const owned = [...ownedItems(s), ...exclude];
	const tier = rollTier(s, odds);
	const tiers: Tier[] = [tier, ...ORDER.filter((t) => t !== tier)];
	for (const t of tiers) {
		const pool = Object.values(EQUIPMENT)
			.filter((e) => e.rarity === t && !owned.includes(e.key))
			.map((e) => e.key);
		if (pool.length > 0) return pick(s, 'meta', pool);
	}
	return null;
}

export function addToStash(s: RunState, item: string, ev: GameEvent[]): boolean {
	if (s.stash.length >= RULES.stashMax) {
		ev.push({ type: 'equipmentGained', item, kept: false });
		return false;
	}
	s.stash.push(item);
	ev.push({ type: 'equipmentGained', item, kept: true });
	return true;
}

function tierOf(r: Rarity): Tier {
	return r === 'uncommon' || r === 'rare' ? r : 'common';
}

export function makeCamp(s: RunState): CampState {
	const cardId = pickCard(s, rollTier(s, CARD_REWARD.combat), []);
	const item = rollEquipment(s, EQUIPMENT_DROP.camp);
	const vigil = rand(s, 'meta') < CAMP.vigilChance;
	return {
		card: cardId
			? { cardId, price: CAMP.cardPrice[tierOf(cardDef(cardId).rarity)], sold: false }
			: null,
		equipment: item
			? {
					item,
					price: CAMP.equipmentPrice[tierOf(EQUIPMENT[item]?.rarity ?? 'common')],
					sold: false,
				}
			: null,
		service: { kind: vigil ? 'vigil' : 'bind', price: CAMP.servicePrice, sold: false },
		swapped: false,
	};
}

export function makeShop(s: RunState): ShopState {
	const cards: ShopState['cards'] = [];
	const taken: string[] = [];
	for (const tier of ORDER) {
		const n = SHOP.cardCounts[tier];
		for (let i = 0; i < n; i++) {
			const id = pickCard(s, tier, taken);
			if (!id) continue;
			taken.push(id);
			const [lo, hi] = SHOP.cardPrice[tierOf(cardDef(id).rarity)];
			cards.push({ cardId: id, price: randInt(s, 'meta', lo, hi), sold: false });
		}
	}
	const equipment: ShopState['equipment'] = [];
	const exclude: string[] = [];
	for (let i = 0; i < SHOP.equipmentCount; i++) {
		const item = rollEquipment(s, EQUIPMENT_DROP.shop, exclude);
		if (!item) continue;
		exclude.push(item);
		equipment.push({
			item,
			price: SHOP.equipmentPrice[tierOf(EQUIPMENT[item]?.rarity ?? 'common')],
			sold: false,
		});
	}
	return { cards, equipment, removalsAtVisit: s.removals, removedHere: false };
}

export function removalPrice(s: RunState): number {
	return SHOP.removalBase + SHOP.removalStep * s.removals;
}
