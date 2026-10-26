// Run state, the command dispatcher (`apply`) and persistence (GDD 4, 11, 13.1, 18.1).
import { ACT_RULES, CAMP, EMBERS, EQUIPMENT, GOLD, HEROES, REST, RULES } from '../data/index.ts';
import { cardDef } from './cards.ts';
import { endTurn, playCard, startCombat } from './combat.ts';
import { claimTreasure, openEvent, openTreasure, resolveEvent } from './events.ts';
import { chooseEncounter, generateMap, markSeen } from './map.ts';
import { type Ctx, maxHP } from './ops.ts';
import { addToStash, makeCamp, makeShop, newCard, removalPrice } from './rewards.ts';
import { streamSeed } from './rng.ts';
import type {
	ApplyResult,
	Command,
	GameEvent,
	HeroClass,
	HeroState,
	RunOptions,
	RunState,
} from './types.ts';

export function createRun(seed: number, party: HeroClass[], options: RunOptions = {}): RunState {
	if (party.length !== RULES.partySize || new Set(party).size !== party.length) {
		throw new Error('party must be 3 distinct heroes');
	}
	const opts: Required<RunOptions> = {
		enemyHpMul: options.enemyHpMul ?? 1,
		enemyDmgMul: options.enemyDmgMul ?? 1,
		heroHpMul: options.heroHpMul ?? 1,
	};
	const s: RunState = {
		version: 1,
		act: 1,
		seed,
		options: opts,
		rng: {
			map: streamSeed(seed, 'map'),
			meta: streamSeed(seed, 'meta'),
			combat: streamSeed(seed, 'combat'),
		},
		phase: 'map',
		party: party.map((id) => {
			const base = Math.max(1, Math.round(HEROES[id].maxHP * opts.heroHpMul));
			return {
				id,
				baseMax: base,
				hp: base,
				stress: 0,
				injured: false,
				weapon: null,
				relic: null,
			};
		}),
		deck: [],
		nextUid: 1,
		gold: GOLD.start,
		stash: [],
		map: [],
		cursor: null,
		currentNode: null,
		seenEnemies: [],
		removals: 0,
		rarePity: 0,
		roundsCleared: 0,
		elitesWon: 0,
		bossesWon: 0,
		combat: null,
		reward: null,
		camp: null,
		shop: null,
		stats: { collapses: 0, combats: [], goldEarned: 0, falls: 0 },
	};
	for (const id of party) for (const c of HEROES[id].starters) s.deck.push(newCard(s, c));
	s.map = generateMap(s);
	return s;
}

export function embers(s: RunState): number {
	return (
		EMBERS.perRound * s.roundsCleared +
		EMBERS.perElite * s.elitesWon +
		EMBERS.perBoss * s.bossesWon
	);
}

function invalid(c: Ctx, reason: string): void {
	c.ev.push({ type: 'invalid', reason });
}

function enterCamp(c: Ctx): void {
	c.s.camp = makeCamp(c.s);
	c.s.phase = 'camp';
}

function heroIndex(s: RunState, id: HeroClass): number {
	return s.party.findIndex((h) => h.id === id);
}

function hasStashRoom(s: RunState, n = 1): boolean {
	return s.stash.length + n <= RULES.stashMax;
}

function selectNode(c: Ctx, index: number): void {
	const s = c.s;
	if (s.phase !== 'map') {
		invalid(c, 'not-on-map');
		return;
	}
	const row = (s.cursor ? s.cursor.row : 0) + 1;
	const available = s.cursor
		? (s.map[s.cursor.row - 1]?.[s.cursor.index]?.next ?? [])
		: (s.map[0] ?? []).map((n) => n.index);
	if (!available.includes(index)) {
		invalid(c, 'node-not-available');
		return;
	}
	const node = s.map[row - 1]?.[index];
	if (!node) {
		invalid(c, 'no-such-node');
		return;
	}
	s.cursor = { row, index };
	s.currentNode = { row, index, type: node.type };
	c.ev.push({ type: 'nodeEntered', row, index, nodeType: node.type });
	if (node.type === 'shop') {
		s.shop = makeShop(s);
		s.phase = 'shop';
	} else if (node.type === 'rest') {
		s.phase = 'rest';
	} else if (node.type === 'event') {
		openEvent(s);
	} else if (node.type === 'treasure') {
		openTreasure(s);
	} else {
		const enc = chooseEncounter(s, row, node.type);
		markSeen(s, enc);
		startCombat(c, enc, node.type === 'combat' ? 'common' : node.type);
	}
}

function afterReward(c: Ctx): void {
	const s = c.s;
	const boss = s.reward?.boss ?? false;
	s.reward = null;
	if (boss && (s.act ?? 1) >= ACT_RULES.acts) {
		s.phase = 'victory';
		return;
	}
	if (boss) healBetweenActs(s);
	enterCamp(c);
}

/** GDD 22.1: after an act boss every hero heals and loses any injury. */
function healBetweenActs(s: RunState): void {
	for (const h of s.party) {
		h.injured = false;
		h.hp = Math.min(
			maxHP(h),
			h.hp + Math.floor((maxHP(h) * ACT_RULES.betweenActHealPct) / 100),
		);
	}
}

/** Starts the next act's map once the camp after the previous act's boss is left. */
function startNextAct(s: RunState): void {
	s.act = (s.act ?? 1) + 1;
	s.map = generateMap(s);
	s.cursor = null;
	s.currentNode = null;
	s.seenEnemies = [];
}

function campBuy(c: Ctx, cmd: Extract<Command, { type: 'campBuy' }>): void {
	const s = c.s;
	const camp = s.camp;
	if (s.phase !== 'camp' || !camp) {
		invalid(c, 'not-in-camp');
		return;
	}
	if (cmd.offer === 'card') {
		const o = camp.card;
		if (!o || o.sold) {
			invalid(c, 'sold-out');
			return;
		}
		if (s.gold < o.price) {
			invalid(c, 'not-enough-gold');
			return;
		}
		s.gold -= o.price;
		o.sold = true;
		s.deck.push(newCard(s, o.cardId));
		c.ev.push({ type: 'bought', what: o.cardId, price: o.price });
	} else if (cmd.offer === 'equipment') {
		const o = camp.equipment;
		if (!o || o.sold) {
			invalid(c, 'sold-out');
			return;
		}
		if (s.gold < o.price) {
			invalid(c, 'not-enough-gold');
			return;
		}
		if (!hasStashRoom(s)) {
			invalid(c, 'stash-full');
			return;
		}
		s.gold -= o.price;
		o.sold = true;
		addToStash(s, o.item, c.ev);
		c.ev.push({ type: 'bought', what: o.item, price: o.price });
	} else {
		const o = camp.service;
		if (o.sold) {
			invalid(c, 'sold-out');
			return;
		}
		if (s.gold < o.price) {
			invalid(c, 'not-enough-gold');
			return;
		}
		if (o.kind === 'vigil') {
			const h = cmd.heroId ? s.party.find((x) => x.id === cmd.heroId) : undefined;
			if (!h) {
				invalid(c, 'hero-required');
				return;
			}
			h.stress = Math.max(0, h.stress - CAMP.vigilStress);
		} else {
			for (const h of s.party) {
				h.hp = Math.min(maxHP(h), h.hp + Math.floor((maxHP(h) * CAMP.bindHealPct) / 100));
			}
		}
		s.gold -= o.price;
		o.sold = true;
		c.ev.push({ type: 'bought', what: `service.${o.kind}`, price: o.price });
	}
}

function campSwap(c: Ctx, cmd: Extract<Command, { type: 'campSwap' }>): void {
	const s = c.s;
	const camp = s.camp;
	if (s.phase !== 'camp' || !camp) {
		invalid(c, 'not-in-camp');
		return;
	}
	if (camp.swapped) {
		invalid(c, 'already-swapped');
		return;
	}
	if (s.gold < CAMP.swapPrice) {
		invalid(c, 'not-enough-gold');
		return;
	}
	const i = heroIndex(s, cmd.leave);
	if (i < 0 || heroIndex(s, cmd.join) >= 0 || !HEROES[cmd.join]) {
		invalid(c, 'bad-swap');
		return;
	}
	const leaving = s.party[i] as HeroState;
	const items = [leaving.weapon, leaving.relic].filter((x): x is string => !!x);
	if (!hasStashRoom(s, items.length)) {
		invalid(c, 'stash-full');
		return;
	}
	for (const it of items) s.stash.push(it);
	s.deck = s.deck.filter((x) => x.owner !== cmd.leave);
	const base = Math.max(1, Math.round(HEROES[cmd.join].maxHP * s.options.heroHpMul));
	s.party[i] = {
		id: cmd.join,
		baseMax: base,
		hp: base,
		stress: 0,
		injured: false,
		weapon: null,
		relic: null,
	};
	for (const cid of HEROES[cmd.join].starters) s.deck.push(newCard(s, cid));
	s.gold -= CAMP.swapPrice;
	camp.swapped = true;
	c.ev.push({ type: 'swapped', leave: cmd.leave, join: cmd.join });
}

function shopBuy(c: Ctx, cmd: Extract<Command, { type: 'shopBuy' }>): void {
	const s = c.s;
	const shop = s.shop;
	if (s.phase !== 'shop' || !shop) {
		invalid(c, 'not-in-shop');
		return;
	}
	if (cmd.kind === 'card') {
		const o = shop.cards[cmd.index];
		if (!o || o.sold) {
			invalid(c, 'sold-out');
			return;
		}
		if (s.gold < o.price) {
			invalid(c, 'not-enough-gold');
			return;
		}
		s.gold -= o.price;
		o.sold = true;
		s.deck.push(newCard(s, o.cardId));
		c.ev.push({ type: 'bought', what: o.cardId, price: o.price });
	} else {
		const o = shop.equipment[cmd.index];
		if (!o || o.sold) {
			invalid(c, 'sold-out');
			return;
		}
		if (s.gold < o.price) {
			invalid(c, 'not-enough-gold');
			return;
		}
		if (!hasStashRoom(s)) {
			invalid(c, 'stash-full');
			return;
		}
		s.gold -= o.price;
		o.sold = true;
		addToStash(s, o.item, c.ev);
		c.ev.push({ type: 'bought', what: o.item, price: o.price });
	}
}

function restChoose(c: Ctx, cmd: Extract<Command, { type: 'restChoose' }>): void {
	const s = c.s;
	if (s.phase !== 'rest') {
		invalid(c, 'not-resting');
		return;
	}
	if (cmd.option === 'recover') {
		for (const h of s.party) {
			h.injured = false;
			h.hp = Math.min(maxHP(h), h.hp + Math.floor((maxHP(h) * REST.recoverHealPct) / 100));
		}
	} else if (cmd.option === 'temper') {
		const card = s.deck.find((x) => x.uid === cmd.cardUid);
		if (!card || card.upgraded) {
			invalid(c, 'cannot-upgrade');
			return;
		}
		card.upgraded = true;
		c.ev.push({ type: 'upgraded', cardUid: card.uid });
	} else {
		for (const h of s.party) h.stress = Math.max(0, h.stress - REST.prayStress);
	}
	s.roundsCleared += 1;
	enterCamp(c);
}

function equip(c: Ctx, cmd: Extract<Command, { type: 'equip' }>): void {
	const s = c.s;
	if (s.phase === 'combat' || s.phase === 'victory' || s.phase === 'defeat') {
		invalid(c, 'cannot-equip-now');
		return;
	}
	const h = s.party.find((x) => x.id === cmd.heroId);
	if (!h) {
		invalid(c, 'no-such-hero');
		return;
	}
	const current = cmd.slot === 'weapon' ? h.weapon : h.relic;
	if (cmd.item === null) {
		if (!current) {
			invalid(c, 'slot-empty');
			return;
		}
		if (!hasStashRoom(s)) {
			invalid(c, 'stash-full');
			return;
		}
		s.stash.push(current);
		if (cmd.slot === 'weapon') h.weapon = null;
		else h.relic = null;
		return;
	}
	const at = s.stash.indexOf(cmd.item);
	if (at < 0) {
		invalid(c, 'not-in-stash');
		return;
	}
	if (EQUIPMENT[cmd.item]?.slot !== cmd.slot) {
		invalid(c, 'wrong-slot');
		return;
	}
	s.stash.splice(at, 1);
	if (current) s.stash.push(current);
	if (cmd.slot === 'weapon') h.weapon = cmd.item;
	else h.relic = cmd.item;
	// Max HP can change with the relic; never leave HP above the new maximum.
	h.hp = Math.min(h.hp, maxHP(h));
}

function dispatch(c: Ctx, cmd: Command): void {
	const s = c.s;
	switch (cmd.type) {
		case 'selectNode':
			selectNode(c, cmd.index);
			return;
		case 'playCard':
			if (s.phase !== 'combat' || !s.combat) {
				invalid(c, 'not-in-combat');
				return;
			}
			playCard(c, cmd.cardUid, cmd.target);
			return;
		case 'endTurn':
			if (s.phase !== 'combat' || !s.combat) {
				invalid(c, 'not-in-combat');
				return;
			}
			endTurn(c);
			return;
		case 'chooseReward': {
			if (s.phase !== 'reward' || !s.reward) {
				invalid(c, 'no-reward');
				return;
			}
			const id = s.reward.cards[cmd.index];
			if (!id) {
				invalid(c, 'bad-index');
				return;
			}
			s.deck.push(newCard(s, id));
			afterReward(c);
			return;
		}
		case 'skipReward':
			if (s.phase !== 'reward' || !s.reward) {
				invalid(c, 'no-reward');
				return;
			}
			afterReward(c);
			return;
		case 'campBuy':
			campBuy(c, cmd);
			return;
		case 'campSwap':
			campSwap(c, cmd);
			return;
		case 'campLeave':
			if (s.phase !== 'camp') {
				invalid(c, 'not-in-camp');
				return;
			}
			s.camp = null;
			s.phase = 'map';
			if (s.currentNode?.type === 'boss' && (s.act ?? 1) < ACT_RULES.acts) startNextAct(s);
			return;
		case 'shopBuy':
			shopBuy(c, cmd);
			return;
		case 'shopRemoveCard': {
			const shop = s.shop;
			if (s.phase !== 'shop' || !shop) {
				invalid(c, 'not-in-shop');
				return;
			}
			if (shop.removedHere) {
				invalid(c, 'already-removed');
				return;
			}
			const price = removalPrice(s);
			if (s.gold < price) {
				invalid(c, 'not-enough-gold');
				return;
			}
			const at = s.deck.findIndex((x) => x.uid === cmd.cardUid);
			if (at < 0) {
				invalid(c, 'no-such-card');
				return;
			}
			s.deck.splice(at, 1);
			s.gold -= price;
			s.removals += 1;
			shop.removedHere = true;
			c.ev.push({ type: 'removed', cardUid: cmd.cardUid });
			return;
		}
		case 'leaveShop':
			if (s.phase !== 'shop') {
				invalid(c, 'not-in-shop');
				return;
			}
			s.shop = null;
			s.roundsCleared += 1;
			enterCamp(c);
			return;
		case 'restChoose':
			restChoose(c, cmd);
			return;
		case 'eventChoose': {
			const next = resolveEvent(c, cmd);
			if (!next) return;
			s.roundsCleared += 1;
			if (next === 'reward') s.phase = 'reward';
			else enterCamp(c);
			return;
		}
		case 'claimTreasure':
			if (!claimTreasure(c)) return;
			s.roundsCleared += 1;
			enterCamp(c);
			return;
		case 'equip':
			equip(c, cmd);
			return;
		case 'reorder': {
			if (s.phase === 'combat') {
				invalid(c, 'cannot-reorder-now');
				return;
			}
			const ids = s.party.map((h) => h.id);
			const same =
				cmd.order.length === ids.length && ids.every((id) => cmd.order.includes(id));
			if (!same) {
				invalid(c, 'bad-order');
				return;
			}
			s.party = cmd.order.map((id) => s.party[heroIndex(s, id)] as HeroState);
			return;
		}
		default:
			invalid(c, 'unknown-command');
			return;
	}
}

export function apply(state: RunState, command: Command): ApplyResult {
	const s = structuredClone(state);
	const ev: GameEvent[] = [];
	const before = s.phase;
	dispatch({ s, ev }, command);
	if (before !== s.phase) {
		if (s.phase === 'victory') ev.push({ type: 'victory', embers: embers(s) });
		if (s.phase === 'defeat') ev.push({ type: 'defeat', embers: embers(s) });
	}
	return { state: s, events: ev };
}

export function preview(state: RunState, command: Command): ApplyResult {
	return apply(state, command);
}

// ---- persistence ----
export function serialize(state: RunState): string {
	return JSON.stringify(state);
}

export function deserialize(text: string): RunState | null {
	try {
		const v: unknown = JSON.parse(text);
		if (typeof v !== 'object' || v === null) return null;
		const o = v as Partial<RunState>;
		if (
			o.version !== 1 ||
			typeof o.seed !== 'number' ||
			!Array.isArray(o.party) ||
			!Array.isArray(o.deck)
		)
			return null;
		if (!Array.isArray(o.map) || typeof o.phase !== 'string' || typeof o.rng !== 'object')
			return null;
		for (const id of o.party.map((h) => (h as HeroState).id)) if (!HEROES[id]) return null;
		for (const cardInst of o.deck) {
			try {
				cardDef(cardInst.cardId);
			} catch {
				return null;
			}
		}
		if (o.act === undefined) o.act = 1;
		return o as RunState;
	} catch {
		return null;
	}
}
