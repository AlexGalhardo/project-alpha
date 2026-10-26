// Full-run bot used by the simulation: the combat policy of GDD 14.1 plus simple macro choices.
import { EQUIPMENT, RULES } from '../data/index.ts';
import { chooseAutoCommand } from './auto.ts';
import { cardDef } from './cards.ts';
import { availableNodes } from './map.ts';
import { maxHP } from './ops.ts';
import { removalPrice } from './rewards.ts';
import type { Command, HeroClass, MapNode, RunState } from './types.ts';

const RARITY_WEIGHT: Record<string, number> = {
	starter: 0,
	common: 1,
	uncommon: 2,
	rare: 3,
	legendary: 4,
};
const DECK_SOFT_CAP = 20;

function hpFraction(s: RunState): number {
	let hp = 0;
	let max = 0;
	for (const h of s.party) {
		hp += h.hp;
		max += maxHP(h);
	}
	return max > 0 ? hp / max : 0;
}

function bestCardIndex(s: RunState, ids: string[]): number {
	let best = -1;
	let bestScore = Number.NEGATIVE_INFINITY;
	ids.forEach((id, i) => {
		const d = cardDef(id);
		const owned = s.deck.filter((x) => x.owner === d.owner).length;
		const score = (RARITY_WEIGHT[d.rarity] ?? 0) * 10 - owned;
		if (score > bestScore) {
			bestScore = score;
			best = i;
		}
	});
	return best;
}

function equipCommand(s: RunState): Command | null {
	for (const item of s.stash) {
		const slot = EQUIPMENT[item]?.slot;
		if (!slot) continue;
		const hero = s.party.find((h) => (slot === 'weapon' ? !h.weapon : !h.relic));
		if (hero) return { type: 'equip', heroId: hero.id, slot, item };
	}
	return null;
}

function hasFreeSlot(s: RunState, item: string): boolean {
	const slot = EQUIPMENT[item]?.slot;
	return s.party.some((h) => (slot === 'weapon' ? !h.weapon : !h.relic));
}

function chooseNode(s: RunState): Command {
	const nodes = availableNodes(s);
	const f = hpFraction(s);
	const rank = (n: MapNode): number => {
		switch (n.type) {
			case 'boss':
				return 100;
			case 'rest':
				return f < 0.7 ? 90 : 20;
			case 'shop':
				return s.gold >= 90 ? 80 : 30;
			case 'elite':
				return f >= 0.75 ? 70 : 10;
			default:
				return 50;
		}
	};
	const best = [...nodes].sort((a, b) => rank(b) - rank(a) || a.index - b.index)[0] as MapNode;
	return { type: 'selectNode', index: best.index };
}

export function chooseBotCommand(s: RunState): Command | null {
	switch (s.phase) {
		case 'combat':
			return chooseAutoCommand(s);
		case 'map':
			return chooseNode(s);
		case 'reward': {
			const r = s.reward;
			if (!r) return null;
			const i = bestCardIndex(s, r.cards);
			const d = i >= 0 ? cardDef(r.cards[i] as string) : null;
			if (!d || (s.deck.length >= DECK_SOFT_CAP && d.rarity === 'common'))
				return { type: 'skipReward' };
			return { type: 'chooseReward', index: i };
		}
		case 'camp': {
			const camp = s.camp;
			if (!camp) return { type: 'campLeave' };
			const eq = equipCommand(s);
			if (eq) return eq;
			if (
				camp.equipment &&
				!camp.equipment.sold &&
				s.gold >= camp.equipment.price &&
				hasFreeSlot(s, camp.equipment.item) &&
				s.stash.length < RULES.stashMax
			) {
				return { type: 'campBuy', offer: 'equipment' };
			}
			if (
				camp.card &&
				!camp.card.sold &&
				s.gold >= camp.card.price + 10 &&
				s.deck.length < DECK_SOFT_CAP
			) {
				return { type: 'campBuy', offer: 'card' };
			}
			if (!camp.service.sold && s.gold >= camp.service.price) {
				if (camp.service.kind === 'bind' && hpFraction(s) < 0.65)
					return { type: 'campBuy', offer: 'service' };
				if (camp.service.kind === 'vigil') {
					const worst = [...s.party].sort((a, b) => b.stress - a.stress)[0];
					if (worst && worst.stress >= 5)
						return { type: 'campBuy', offer: 'service', heroId: worst.id as HeroClass };
				}
			}
			return { type: 'campLeave' };
		}
		case 'shop': {
			const shop = s.shop;
			if (!shop) return { type: 'leaveShop' };
			const eq = equipCommand(s);
			if (eq) return eq;
			const e = shop.equipment.findIndex(
				(o) =>
					!o.sold &&
					s.gold >= o.price &&
					hasFreeSlot(s, o.item) &&
					s.stash.length < RULES.stashMax,
			);
			if (e >= 0) return { type: 'shopBuy', kind: 'equipment', index: e };
			if (s.deck.length < DECK_SOFT_CAP) {
				let best = -1;
				let bestScore = Number.NEGATIVE_INFINITY;
				shop.cards.forEach((o, i) => {
					if (o.sold || s.gold < o.price) return;
					const score =
						(RARITY_WEIGHT[cardDef(o.cardId).rarity] ?? 0) * 10 - o.price / 10;
					if (score > bestScore) {
						bestScore = score;
						best = i;
					}
				});
				if (best >= 0) return { type: 'shopBuy', kind: 'card', index: best };
			}
			if (!shop.removedHere && s.gold >= removalPrice(s) + 20) {
				const dup = s.deck.find(
					(x) =>
						cardDef(x.cardId).rarity === 'starter' &&
						cardDef(x.cardId).type === 'skill' &&
						!x.upgraded,
				);
				if (dup) return { type: 'shopRemoveCard', cardUid: dup.uid };
			}
			return { type: 'leaveShop' };
		}
		case 'rest': {
			const hurt = s.party.some((h) => h.injured) || hpFraction(s) < 0.7;
			if (hurt) return { type: 'restChoose', option: 'recover' };
			if (s.party.some((h) => h.stress >= 6)) return { type: 'restChoose', option: 'pray' };
			const target = [...s.deck]
				.filter((x) => !x.upgraded)
				.sort(
					(a, b) =>
						(RARITY_WEIGHT[cardDef(b.cardId).rarity] ?? 0) -
						(RARITY_WEIGHT[cardDef(a.cardId).rarity] ?? 0),
				)[0];
			if (target) return { type: 'restChoose', option: 'temper', cardUid: target.uid };
			return { type: 'restChoose', option: 'recover' };
		}
		default:
			return null;
	}
}
