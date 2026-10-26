import { HEROES, RITES } from '../data';
import { TREE } from '../data/meta';
import type { HeroClass, RunState } from './types';

/** Banked meta-progression, persisted by the view between runs (docs/gdd.md §13, §22.5). */
export interface Profile {
	version: 1;
	embers: number;
	/** Nodes bought per hero, 0–3. */
	nodes: Record<HeroClass, number>;
	/** Run seeds already banked, so a run's Embers are added once. */
	banked: number[];
	/** Highest Rite the player may pick (docs/gdd.md §13.3): highest Rite won + 1, at most 10. */
	unlockedRite: number;
}

const HERO_KEYS = Object.keys(TREE.cards) as HeroClass[];
const MAX_BANKED = 50;

export function emptyProfile(): Profile {
	const nodes = Object.fromEntries(HERO_KEYS.map((h) => [h, 0])) as Record<HeroClass, number>;
	return { version: 1, embers: 0, nodes, banked: [], unlockedRite: 0 };
}

/** Accepts unknown JSON; anything invalid falls back to an empty profile field by field. */
export function parseProfile(data: unknown): Profile {
	const base = emptyProfile();
	if (typeof data !== 'object' || data === null) return base;
	const d = data as Record<string, unknown>;
	const embers = typeof d.embers === 'number' && d.embers >= 0 ? Math.floor(d.embers) : 0;
	const rawNodes = (typeof d.nodes === 'object' && d.nodes !== null ? d.nodes : {}) as Record<
		string,
		unknown
	>;
	for (const h of HERO_KEYS) {
		const n = rawNodes[h];
		base.nodes[h] =
			typeof n === 'number' ? Math.max(0, Math.min(TREE.nodeCosts.length, Math.floor(n))) : 0;
	}
	const banked = Array.isArray(d.banked)
		? d.banked.filter((x): x is number => typeof x === 'number')
		: [];
	const rite =
		typeof d.unlockedRite === 'number' && Number.isFinite(d.unlockedRite)
			? Math.max(0, Math.min(RITES.max, Math.floor(d.unlockedRite)))
			: 0;
	return { ...base, embers, banked: banked.slice(-MAX_BANKED), unlockedRite: rite };
}

/** Adds a finished run's Embers once per seed. */
export function bankRun(p: Profile, seed: number, amount: number): Profile {
	if (p.banked.includes(seed) || amount <= 0) return p;
	return { ...p, embers: p.embers + amount, banked: [...p.banked, seed].slice(-MAX_BANKED) };
}

/** A victory at `rite` unlocks the next Rite (never lowers what is already unlocked). */
export function recordWin(p: Profile, rite: number): Profile {
	const next = Math.min(RITES.max, Math.floor(rite) + 1);
	return next > p.unlockedRite ? { ...p, unlockedRite: next } : p;
}

export function nextNodeCost(p: Profile, hero: HeroClass): number | null {
	return TREE.nodeCosts[p.nodes[hero]] ?? null;
}

export function buyNode(p: Profile, hero: HeroClass): Profile {
	const cost = nextNodeCost(p, hero);
	if (cost === null || p.embers < cost) return p;
	return { ...p, embers: p.embers - cost, nodes: { ...p.nodes, [hero]: p.nodes[hero] + 1 } };
}

/** Cards added to the reward pools by owned nodes I and II. */
export function unlockedCards(p: Profile): string[] {
	return HERO_KEYS.flatMap((h) => TREE.cards[h].slice(0, Math.min(2, p.nodes[h])));
}

export function canVeteran(p: Profile, hero: HeroClass): boolean {
	return p.nodes[hero] >= 3;
}

/**
 * Applies meta options to a fresh run: unlocked cards join the reward pools, and each veteran
 * hero swaps its first starter Strike for card A. Pure: returns a new state.
 */
export function applyMeta(state: RunState, p: Profile, veteran: HeroClass[] = []): RunState {
	const s: RunState = structuredClone(state);
	s.unlocked = unlockedCards(p);
	for (const hero of veteran) {
		if (!canVeteran(p, hero) || !s.party.some((h) => h.id === hero)) continue;
		const strike = HEROES[hero].starters[0];
		const card = s.deck.find((c) => c.owner === hero && c.cardId === strike);
		if (card) card.cardId = TREE.cards[hero][0];
	}
	return s;
}
