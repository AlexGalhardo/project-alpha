// Event and treasure nodes (docs/gdd.md §22.4): map placement, entry rolls and outcomes.
import {
	EQUIPMENT,
	EVENT_IDS,
	EVENT_MAP,
	EVENTS,
	type EventEffect,
	RULES,
	TREASURE,
} from '../data/index.ts';
import type { Ctx } from './ops.ts';
import { maxHP } from './ops.ts';
import { addToStash, ownedItems, partyPool, rollEquipment } from './rewards.ts';
import { pick, rand } from './rng.ts';
import type { Command, EventState, HeroState, MapNode, RunState } from './types.ts';

const isFight = (n: MapNode): boolean => n.type === 'combat' || n.type === 'elite';

/** Fewest fights (combat or elite) on any path from row 1 to the boss. */
export function minFights(rows: MapNode[][]): number {
	let below = new Map<number, number>();
	for (let r = rows.length - 1; r >= 0; r--) {
		const here = new Map<number, number>();
		for (const n of rows[r] as MapNode[]) {
			const next = n.next.length > 0 ? Math.min(...n.next.map((j) => below.get(j) ?? 0)) : 0;
			here.set(n.index, (isFight(n) ? 1 : 0) + next);
		}
		below = here;
	}
	return Math.min(...below.values());
}

/** Seeded conversion of some combat nodes into events and at most one into a treasure. */
export function placeSpecialNodes(s: Pick<RunState, 'rng'>, rows: MapNode[][]): void {
	const convert = (row: number, to: 'event' | 'treasure', chance: number): boolean => {
		// The chance roll is always drawn so later rows do not shift when a row has no candidate.
		if (rand(s, 'map') >= chance) return false;
		const candidates = (rows[row - 1] ?? []).filter((n) => n.type === 'combat');
		if (candidates.length === 0) return false;
		const node = pick(s, 'map', candidates);
		node.type = to;
		if (minFights(rows) >= EVENT_MAP.minFights) return true;
		node.type = 'combat';
		return false;
	};
	for (const row of EVENT_MAP.eventRows) convert(row, 'event', EVENT_MAP.eventChance);
	let treasure = false;
	for (const row of EVENT_MAP.treasureRows) {
		if (!treasure) treasure = convert(row, 'treasure', EVENT_MAP.treasureChance);
	}
}

function unowned(s: RunState, filter: (key: string) => boolean): string[] {
	const owned = ownedItems(s);
	return Object.values(EQUIPMENT)
		.filter((e) => filter(e.key) && !owned.includes(e.key))
		.map((e) => e.key);
}

/** Opens an event (a seeded unseen one when `id` is omitted) and rolls every random outcome now. */
export function openEvent(s: RunState, id?: string): void {
	const seen = s.seenEvents ?? [];
	const fresh = EVENT_IDS.filter((x) => !seen.includes(x));
	const eventId = id ?? pick(s, 'meta', fresh.length > 0 ? fresh : EVENT_IDS);
	const def = EVENTS[eventId];
	if (!def) throw new Error(`unknown event ${eventId}`);
	const state: EventState = { id: eventId, item: null, cards: [], upgradeUids: [] };
	for (const effect of def.choices.flatMap((c) => c.effects)) {
		if (effect.kind === 'relic' || effect.kind === 'equipment') {
			const slot = effect.kind === 'relic' ? 'relic' : null;
			const pool = unowned(
				s,
				(k) =>
					EQUIPMENT[k]?.rarity === effect.rarity &&
					(!slot || EQUIPMENT[k]?.slot === slot),
			);
			state.item = pool.length > 0 ? pick(s, 'meta', pool) : null;
		} else if (effect.kind === 'cardOffer') {
			const pool = [...partyPool(s, effect.rarity)];
			while (state.cards.length < effect.count && pool.length > 0) {
				const id = pick(s, 'meta', pool);
				state.cards.push(id);
				pool.splice(pool.indexOf(id), 1);
			}
		} else if (effect.kind === 'upgradeRandom') {
			const pool = s.deck.filter((c) => !c.upgraded).map((c) => c.uid);
			while (state.upgradeUids.length < effect.count && pool.length > 0) {
				const uid = pick(s, 'meta', pool);
				state.upgradeUids.push(uid);
				pool.splice(pool.indexOf(uid), 1);
			}
		}
	}
	s.event = state;
	s.seenEvents = [...seen, eventId];
	s.phase = 'event';
}

export function openTreasure(s: RunState): void {
	s.treasure = { gold: TREASURE.gold, item: rollEquipment(s, TREASURE.equipmentOdds) };
	s.phase = 'treasure';
}

/** Cards the choice asks the player to pick (0 when it needs none). */
export function cardsToChoose(s: RunState, effect: EventEffect): number {
	if (effect.kind === 'removeChoose') return Math.min(effect.count, s.deck.length);
	if (effect.kind === 'upgradeChoose')
		return Math.min(effect.count, s.deck.filter((c) => !c.upgraded).length);
	return 0;
}

/** Whether choice `index` of the open event can be taken now (gold, items and cards available). */
export function choiceAvailable(s: RunState, index: number): boolean {
	const ev = s.event;
	const choice = ev ? EVENTS[ev.id]?.choices[index] : undefined;
	if (!ev || !choice) return false;
	if ((choice.cost ?? 0) > s.gold) return false;
	return choice.effects.every((e) => {
		if (e.kind === 'relic' || e.kind === 'equipment') return ev.item !== null;
		if (e.kind === 'cardOffer') return ev.cards.length > 0;
		if (e.kind === 'upgradeRandom') return ev.upgradeUids.length > 0;
		if (e.kind === 'removeChoose' || e.kind === 'upgradeChoose') return cardsToChoose(s, e) > 0;
		return true;
	});
}

function addStressOutside(s: RunState, h: HeroState, n: number): void {
	h.stress = Math.max(0, h.stress + n);
	// No combat to lose energy in: reaching the cap still resets the hero and counts as a collapse.
	if (n > 0 && h.stress >= RULES.stressMax) {
		h.stress = RULES.stressReset;
		s.stats.collapses += 1;
	}
}

function lowestHero(s: RunState): HeroState | undefined {
	return [...s.party].sort((a, b) => a.hp - b.hp)[0];
}

/**
 * Applies choice `index` of the open event. Returns where the run goes next, or null when the command
 * is invalid (an `invalid` event is pushed and nothing changes).
 */
export function resolveEvent(
	c: Ctx,
	cmd: Extract<Command, { type: 'eventChoose' }>,
): 'camp' | 'reward' | null {
	const s = c.s;
	const ev = s.event;
	const bad = (reason: string): null => {
		c.ev.push({ type: 'invalid', reason });
		return null;
	};
	if (s.phase !== 'event' || !ev) return bad('not-in-event');
	const choice = EVENTS[ev.id]?.choices[cmd.index];
	if (!choice) return bad('bad-index');
	if (!choiceAvailable(s, cmd.index)) return bad('choice-unavailable');
	const uids = cmd.cardUids ?? [];
	for (const e of choice.effects) {
		const need = cardsToChoose(s, e);
		if (need === 0) continue;
		const ok =
			uids.length === need &&
			new Set(uids).size === need &&
			uids.every((u) => {
				const card = s.deck.find((x) => x.uid === u);
				return card && (e.kind !== 'upgradeChoose' || !card.upgraded);
			});
		if (!ok) return bad('bad-cards');
	}

	s.gold -= choice.cost ?? 0;
	let next: 'camp' | 'reward' = 'camp';
	for (const e of choice.effects) {
		switch (e.kind) {
			case 'healPctEach':
				for (const h of s.party)
					h.hp = Math.min(maxHP(h), h.hp + Math.floor((maxHP(h) * e.pct) / 100));
				break;
			case 'healEach':
				for (const h of s.party) h.hp = Math.min(maxHP(h), h.hp + e.amount);
				break;
			case 'stressEach':
				for (const h of s.party) addStressOutside(s, h, e.amount);
				break;
			case 'stressH1': {
				const h = s.party[0];
				if (h) addStressOutside(s, h, e.amount);
				break;
			}
			case 'damageH1':
			case 'damageLowest': {
				// Outside combat nobody falls: HP stops at 1.
				const h = e.kind === 'damageH1' ? s.party[0] : lowestHero(s);
				if (h) h.hp = Math.max(1, h.hp - e.amount);
				break;
			}
			case 'gold':
				s.gold += e.amount;
				break;
			case 'relic':
			case 'equipment':
				if (ev.item) addToStash(s, ev.item, c.ev);
				break;
			case 'cardOffer':
				s.reward = { gold: 0, cards: [...ev.cards], equipmentGained: null, boss: false };
				next = 'reward';
				break;
			case 'upgradeRandom':
				for (const card of s.deck)
					if (ev.upgradeUids.includes(card.uid)) card.upgraded = true;
				break;
			case 'upgradeChoose':
				for (const card of s.deck) if (uids.includes(card.uid)) card.upgraded = true;
				break;
			case 'removeChoose':
				s.deck = s.deck.filter((card) => !uids.includes(card.uid));
				break;
		}
	}
	c.ev.push({ type: 'eventChosen', id: ev.id, index: cmd.index });
	s.event = null;
	return next;
}

export function claimTreasure(c: Ctx): boolean {
	const s = c.s;
	const t = s.treasure;
	if (s.phase !== 'treasure' || !t) {
		c.ev.push({ type: 'invalid', reason: 'no-treasure' });
		return false;
	}
	s.gold += t.gold;
	s.stats.goldEarned += t.gold;
	if (t.item) addToStash(s, t.item, c.ev);
	c.ev.push({ type: 'treasureClaimed', gold: t.gold, item: t.item });
	s.treasure = null;
	return true;
}
