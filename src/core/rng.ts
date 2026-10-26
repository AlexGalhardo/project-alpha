import type { RngStream, RunState } from './types.ts';

/** mulberry32 step: returns [value in [0,1), next state]. Pure. */
export function mulberry32(state: number): [number, number] {
	const s = (state + 0x6d2b79f5) | 0;
	let t = Math.imul(s ^ (s >>> 15), 1 | s);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** Seed of a named stream derived from the run seed (streams never share state). */
export function streamSeed(seed: number, stream: RngStream): number {
	const salt: Record<RngStream, number> = {
		map: 0x9e3779b9,
		meta: 0x85ebca6b,
		combat: 0xc2b2ae35,
	};
	return (seed ^ salt[stream]) | 0;
}

export function rand(s: Pick<RunState, 'rng'>, stream: RngStream): number {
	const [v, next] = mulberry32(s.rng[stream]);
	s.rng[stream] = next;
	return v;
}

/** Integer in [lo, hi] inclusive. */
export function randInt(
	s: Pick<RunState, 'rng'>,
	stream: RngStream,
	lo: number,
	hi: number,
): number {
	return lo + Math.floor(rand(s, stream) * (hi - lo + 1));
}

export function pick<T>(s: Pick<RunState, 'rng'>, stream: RngStream, items: readonly T[]): T {
	return items[Math.floor(rand(s, stream) * items.length)] as T;
}

/** Fisher-Yates in place. */
export function shuffle<T>(s: Pick<RunState, 'rng'>, stream: RngStream, items: T[]): void {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(rand(s, stream) * (i + 1));
		const tmp = items[i] as T;
		items[i] = items[j] as T;
		items[j] = tmp;
	}
}
