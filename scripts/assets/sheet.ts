// Contact sheet of generated sprites: bun scripts/assets/sheet.ts <prefix> [scale] [cols] [out]
// Joins public/assets/sprites/<prefix>*.png in name order on a dark grid (no labels; order = sorted file names).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decodePng, encodePng } from './pixellab.ts';

const ROOT = join(import.meta.dir, '..', '..');
const dir = process.env.SHEET_DIR ?? join(ROOT, 'public', 'assets', 'sprites');
const prefix = process.argv[2] ?? '';
const scale = Number(process.argv[3] ?? '3');
const cols = Number(process.argv[4] ?? '6');
const out =
	process.argv[5] ??
	join(ROOT, 'test-results', `contact-sheet-${prefix.replace(/\W+/g, '_') || 'all'}.png`);
const files = readdirSync(dir)
	.filter((f) => f.startsWith(prefix) && f.endsWith('.png'))
	.sort();
if (files.length === 0) throw new Error('no sprites');
const imgs = files.map((f) => decodePng(new Uint8Array(readFileSync(join(dir, f)))));
const cw = Math.max(...imgs.map((i) => i.w)) * scale + 8;
const ch = Math.max(...imgs.map((i) => i.h)) * scale + 8;
const rows = Math.ceil(imgs.length / cols);
const W = cols * cw;
const H = rows * ch;
const d = new Uint8Array(W * H * 4);
for (let i = 0; i < W * H; i++) d.set([0x2c, 0x2a, 0x33, 255], i * 4);
imgs.forEach((im, n) => {
	const ox = (n % cols) * cw + 4;
	const oy = Math.floor(n / cols) * ch + 4 + (ch - 8 - im.h * scale);
	for (let y = 0; y < im.h * scale; y++) {
		for (let x = 0; x < im.w * scale; x++) {
			const s = (Math.floor(y / scale) * im.w + Math.floor(x / scale)) * 4;
			if ((im.d[s + 3] as number) === 0) continue;
			d.set(im.d.subarray(s, s + 4), ((oy + y) * W + ox + x) * 4);
		}
	}
});
mkdirSync(join(ROOT, 'test-results'), { recursive: true });
writeFileSync(out, encodePng({ w: W, h: H, d }));
console.log(out, `${files.length} sprites`, files.join(', '));
