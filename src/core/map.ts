// Map generation (GDD 4.2) and encounter selection (GDD 4.3).
import { ALPHA, ENCOUNTER_RULES, ENCOUNTERS, MAP_LAYOUT, MAP_RULES } from '../data/index.ts';
import { placeSpecialNodes } from './events.ts';
import { pick, rand, randInt, shuffle } from './rng.ts';
import type { MapNode, NodeType, RunState } from './types.ts';

type Edge = [number, number];

function validEdges(edges: Edge[], b: number): boolean {
	for (const [i1, j1] of edges) {
		for (const [i2, j2] of edges) if (i1 < i2 && j1 > j2) return false;
	}
	for (let j = 0; j < b; j++) if (!edges.some((e) => e[1] === j)) return false;
	return true;
}

function fallbackEdges(a: number, b: number): Edge[] {
	const edges: Edge[] = [];
	for (let i = 0; i < a; i++) edges.push([i, Math.min(b - 1, Math.floor((i * b) / a))]);
	for (let j = 0; j < b; j++) {
		if (edges.some((e) => e[1] === j)) continue;
		const i = Math.min(a - 1, j);
		edges.push([i, j]);
	}
	return edges;
}

/** Non-crossing edges from `a` nodes to `b` nodes; node i reaches i-1, i, i+1; every node has in and out edges. */
export function makeEdges(s: Pick<RunState, 'rng'>, a: number, b: number): Edge[] {
	for (let attempt = 0; attempt < MAP_RULES.edgeAttempts; attempt++) {
		const edges: Edge[] = [];
		for (let i = 0; i < a; i++) {
			const cand = [i - 1, i, i + 1].filter((j) => j >= 0 && j < b);
			const n = cand.length > 1 && rand(s, 'map') < MAP_RULES.secondEdgeChance ? 2 : 1;
			const first = Math.floor(rand(s, 'map') * cand.length);
			const chosen = new Set<number>([cand[first] as number]);
			if (n === 2) {
				const other = cand[(first + 1) % cand.length] as number;
				chosen.add(other);
			}
			for (const j of chosen) edges.push([i, j]);
		}
		if (validEdges(edges, b)) return edges;
	}
	return fallbackEdges(a, b);
}

export function generateMap(s: Pick<RunState, 'rng'>): MapNode[][] {
	const rows: MapNode[][] = [];
	MAP_LAYOUT.forEach((layout, r) => {
		const count = randInt(s, 'map', layout.nodes[0], layout.nodes[1]);
		const types = layout.types
			.filter((t) => !t.endsWith('?'))
			.concat(layout.types.filter((t) => t.endsWith('?')).map((t) => t.slice(0, -1)));
		const base = types.slice(0, count) as NodeType[];
		while (base.length < count) base.push('combat');
		shuffle(s, 'map', base);
		rows.push(base.map((type, index) => ({ row: r + 1, index, type, next: [] })));
	});
	for (let r = 0; r < rows.length - 1; r++) {
		const row = rows[r] as MapNode[];
		const nxt = rows[r + 1] as MapNode[];
		for (const [i, j] of makeEdges(s, row.length, nxt.length)) {
			(row[i] as MapNode).next.push(j);
		}
		for (const n of row) n.next.sort((x, y) => x - y);
	}
	// Drawn after the edges so the base layout of a seed is the same with or without events.
	if (ALPHA.events) placeSpecialNodes(s, rows);
	return rows;
}

/**
 * Encounter that adds the most enemy types the run has not seen (GDD 4.3). Candidates are the common
 * encounters of both tiers, but one from the other tier than the row's (A rows 1-3, B rows 4-8) counts
 * ENCOUNTER_RULES.offTierWeight (0 = never chosen). A type found in few encounters counts more (it may
 * not come again). Ties prefer the row's own tier, then a seeded pick.
 */
export function chooseEncounter(s: RunState, row: number, type: NodeType): string {
	const act = s.act ?? 1;
	if (type === 'boss') return act === 2 ? 'BOSS2' : 'BOSS';
	if (type === 'elite') {
		if (act === 2) return row <= 4 ? 'EL2-1' : 'EL2-2';
		return row <= 4 ? 'EL1' : 'EL2';
	}
	const own = row <= 3 ? 'A' : 'B';
	const pool = Object.values(ENCOUNTERS).filter(
		(e) =>
			(e.act ?? 1) === act &&
			(e.pool === 'A' || e.pool === 'B') &&
			(ENCOUNTER_RULES.offTierWeight > 0 || e.pool === own),
	);
	const typesOf = (id: string): Set<string> =>
		new Set((ENCOUNTERS[id]?.enemies ?? []).map((x) => x.key));
	const supply = (key: string): number => pool.filter((e) => typesOf(e.id).has(key)).length;
	const novelty = (id: string): number => {
		let n = 0;
		for (const k of typesOf(id)) if (!s.seenEnemies.includes(k)) n += 1 / supply(k);
		return ENCOUNTERS[id]?.pool === own ? n : n * ENCOUNTER_RULES.offTierWeight;
	};
	const best = Math.max(...pool.map((e) => novelty(e.id)));
	let ties = pool.filter((e) => Math.abs(novelty(e.id) - best) < 1e-9);
	const inTier = ties.filter((e) => e.pool === own);
	if (inTier.length > 0) ties = inTier;
	return pick(
		s,
		'meta',
		ties.map((e) => e.id),
	);
}

export function markSeen(s: RunState, encounterId: string): void {
	for (const slot of ENCOUNTERS[encounterId]?.enemies ?? []) {
		if (!s.seenEnemies.includes(slot.key)) s.seenEnemies.push(slot.key);
	}
}

/** Nodes that can be selected now (empty unless the run is on the map). */
export function availableNodes(s: RunState): MapNode[] {
	if (s.phase !== 'map') return [];
	if (!s.cursor) return s.map[0] ?? [];
	const cur = s.map[s.cursor.row - 1]?.[s.cursor.index];
	const nextRow = s.map[s.cursor.row] ?? [];
	return nextRow.filter((n) => cur?.next.includes(n.index));
}
