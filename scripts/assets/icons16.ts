// Reduces the 32x32 icon masters to 16x16 (integer 2x2 reduction) for the node and item icons.
// Run: bun scripts/assets/icons16.ts   (then: bun scripts/assets/pixellab.ts --manifest)
// Block rule: a 16x16 pixel is opaque when at least 2 of its 4 source pixels are opaque, or when 1 is and
// it is dark (it belongs to a 1 px outline). Its colour is the most frequent opaque colour; ties go to the
// darker one so outlines stay continuous. Output: public/assets/sprites/<key>.png (16x16).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decodePng, encodePng } from './pixellab.ts';

const ROOT = join(import.meta.dir, '..', '..');
const SRC = join(ROOT, 'art-src', 'pixellab', 'icons');
const OUT = join(ROOT, 'public', 'assets', 'sprites');

function lum(r: number, g: number, b: number): number {
	return 0.3 * r + 0.59 * g + 0.11 * b;
}

const keys = readdirSync(SRC)
	.filter((f) => /^icon\.(node|item)\..+\.png$/.test(f))
	.map((f) => f.replace(/\.png$/, ''))
	.sort();
mkdirSync(OUT, { recursive: true });
for (const key of keys) {
	const img = decodePng(new Uint8Array(readFileSync(join(SRC, `${key}.png`))));
	if (img.w !== 32 || img.h !== 32) throw new Error(`${key}: expected a 32x32 master`);
	const d = new Uint8Array(16 * 16 * 4);
	for (let y = 0; y < 16; y++) {
		for (let x = 0; x < 16; x++) {
			const px: [number, number, number][] = [];
			for (const [dx, dy] of [
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1],
			] as [number, number][]) {
				const i = ((y * 2 + dy) * 32 + x * 2 + dx) * 4;
				if ((img.d[i + 3] as number) > 0)
					px.push([img.d[i] as number, img.d[i + 1] as number, img.d[i + 2] as number]);
			}
			if (px.length === 0) continue;
			const first = px[0] as [number, number, number];
			if (px.length === 1 && lum(...first) > 70) continue;
			const count = new Map<string, number>();
			for (const p of px) count.set(p.join(','), (count.get(p.join(',')) ?? 0) + 1);
			let best = first;
			let bestN = 0;
			for (const [k, n] of count) {
				const c = k.split(',').map(Number) as [number, number, number];
				if (n > bestN || (n === bestN && lum(...c) < lum(...best))) {
					best = c;
					bestN = n;
				}
			}
			d.set([best[0], best[1], best[2], 255], (y * 16 + x) * 4);
		}
	}
	writeFileSync(join(OUT, `${key}.png`), encodePng({ w: 16, h: 16, d }));
	console.log(`done ${key}`);
}
if (!existsSync(SRC)) throw new Error('no icon masters');
