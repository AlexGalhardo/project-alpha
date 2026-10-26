// Map generation (GDD 4.2) and encounter selection (GDD 4.3).
import { ENCOUNTERS, ENEMIES, MAP_LAYOUT } from '../data/index.ts';
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
	for (let attempt = 0; attempt < 300; attempt++) {
		const edges: Edge[] = [];
		for (let i = 0; i < a; i++) {
			const cand = [i - 1, i, i + 1].filter((j) => j >= 0 && j < b);
			const n = cand.length > 1 && rand(s, 'map') < 0.45 ? 2 : 1;
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
	return rows;
}

/** Encounter with the most enemy types the run has not seen; ties are a seeded pick. */
export function chooseEncounter(s: RunState, row: number, type: NodeType): string {
	if (type === 'boss') return 'BOSS';
	if (type === 'elite') return row <= 4 ? 'EL1' : 'EL2';
	const poolKey = row <= 3 ? 'A' : 'B';
	const pool = Object.values(ENCOUNTERS).filter((e) => e.pool === poolKey);
	const novelty = (id: string): number => {
		const enc = ENCOUNTERS[id];
		const keys = new Set((enc?.enemies ?? []).map((x) => x.key));
		let n = 0;
		for (const k of keys) if (!s.seenEnemies.includes(k) && ENEMIES[k]) n += 1;
		return n;
	};
	const best = Math.max(...pool.map((e) => novelty(e.id)));
	const ties = pool.filter((e) => novelty(e.id) === best).map((e) => e.id);
	return pick(s, 'meta', ties);
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
