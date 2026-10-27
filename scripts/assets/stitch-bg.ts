// Builds the 1920x1080 backgrounds from a few natively generated PixelLab Pro pieces, composed by code.
//   bun scripts/assets/stitch-bg.ts [--generate] [--only <key>]
// --generate (needs PIXELLAB_KEY_OVERRIDE) creates the missing pieces in art-src/pixellab/bg-pieces/ and logs them
// (prompt, concept art used, usage) in art-src/pixellab/generation-log.json. Without it only the composition runs.
//
// Why composition and not outpainting: Pro inpaint-v3 windows are 512 px max and cost 25 generations each, so a
// native 1920x1080 would need about 28 windows per background. Instead each stage is layered:
//   far layer  - piece B darkened, mirror tiled in two stacked rows (a mirrored seam is continuous by construction)
//   mid layer  - piece A, mirror tiled, its bottom edge on the floor line
//   floor band - procedural flagstone rows (code, no generation), bottom 25 % of the screen, flat and readable
//   grade      - vertical gradient behind everything, global darkening + slight desaturation, vignette, palette snap
// Map backgrounds are a procedural top-down slab floor with glowing joints (the map is a plan view); no generation.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { apiKey, appendLog, type Img, paletteImage, snap } from './pixellab.ts';
import {
	b64Image,
	CONCEPT_DIR,
	crop,
	type JobResult,
	loadPng,
	PALETTE_HEX,
	ROOT,
	runJob,
	writeImg,
} from './pro-lib.ts';

const PIECES = join(ROOT, 'art-src', 'pixellab', 'bg-pieces');
const OUT = join(ROOT, 'public', 'assets', 'sprites');
const W = 1920;
const H = 1080;
const FLOOR_Y = 810; // top of the floor band: bottom 25 % of the screen
const HORIZON_Y = 594; // 55 %

interface Theme {
	key: string;
	kind: 'stage' | 'map';
	/** Concept art file and crop used as the style reference. */
	concept: string;
	rect: [number, number, number, number];
	mid: string;
	far: string;
	/** Colour of the gradient behind the layers. */
	sky: [number, number, number];
	/** Multiplicative tint applied to the whole composition. */
	tint: [number, number, number];
}

const COMMON =
	'Pixel art background piece, strict side view, flat orthographic camera, grimdark dark fantasy, dark desaturated palette of ash greys, dark iron and deep crimson, light from the upper left, no characters, no text, no UI, no frame.';

const THEMES: Theme[] = [
	{
		key: 'bg.combat.act1',
		kind: 'stage',
		concept: 'batle-3.png',
		rect: [0, 330, 700, 200],
		mid: 'A ruined gothic cathedral nave: collapsed pointed arches, tall broken pillars, hanging chains, a broken altar, rubble at the base, a flat stone floor at the very bottom. The sky between the arches is empty.',
		far: 'Distant gothic arches, buttresses and tall spires fading into haze, no floor, no foreground, everything far away and low contrast.',
		sky: [26, 20, 34],
		tint: [1, 0.92, 0.92],
	},
	{
		key: 'bg.combat.act2',
		kind: 'stage',
		concept: 'batle-5.png',
		rect: [0, 330, 700, 200],
		mid: 'A flooded crypt vault: rows of gilded sarcophagi, dripping stone arches, short stout pillars, a sickly green glow, rubble at the base, a flat stone floor at the very bottom. The space between the arches is empty.',
		far: 'Distant crypt vault arches and rows of tombs fading into green haze, no floor, no foreground, everything far away and low contrast.',
		sky: [14, 26, 28],
		tint: [0.9, 1, 0.95],
	},
	{
		key: 'bg.combat.act3',
		kind: 'stage',
		concept: 'batle-4.png',
		rect: [0, 330, 700, 200],
		mid: 'An iron sepulchre vault: huge curved iron ribs like a ribcage, stone tombs with iron doors, a violet rift light glowing between the ribs, rubble at the base, a flat floor at the very bottom. The space between the ribs is empty.',
		far: 'Distant iron ribs and tomb towers fading into violet haze, no floor, no foreground, everything far away and low contrast.',
		sky: [24, 16, 36],
		tint: [0.95, 0.9, 1],
	},
	{
		key: 'bg.title',
		kind: 'stage',
		concept: 'menu-1.png',
		rect: [700, 60, 900, 500],
		mid: 'A ruined gothic citadel with broken towers and bridges on a cliff, chains hanging from the towers, a dark red moon rising behind, a flat stone overlook at the very bottom. The sky is empty.',
		far: 'A distant range of dark mountains and spires under a dark red moon haze, no floor, no foreground, low contrast.',
		sky: [34, 16, 28],
		tint: [1, 0.9, 0.9],
	},
	{
		key: 'bg.menu',
		kind: 'stage',
		concept: 'menu-2.png',
		rect: [300, 60, 1000, 500],
		mid: 'A vast cathedral hall: tall crimson stained-glass windows, rows of columns, a stone staircase, candles along the walls, a flat stone floor at the very bottom. The space between the columns is empty.',
		far: 'Distant cathedral vault ribs and dark crimson windows fading into haze, no floor, no foreground, low contrast.',
		sky: [30, 14, 22],
		tint: [1, 0.9, 0.9],
	},
	{
		key: 'bg.map.act1',
		kind: 'map',
		concept: 'batle-1.png',
		rect: [0, 560, 700, 120],
		mid: '',
		far: '',
		sky: [26, 20, 30],
		tint: [1, 0.92, 0.92],
	},
	{
		key: 'bg.map.act2',
		kind: 'map',
		concept: 'batle-5.png',
		rect: [0, 560, 700, 120],
		mid: '',
		far: '',
		sky: [14, 24, 24],
		tint: [0.95, 1, 0.9],
	},
	{
		key: 'bg.map.act3',
		kind: 'map',
		concept: 'batle-4.png',
		rect: [0, 560, 700, 120],
		mid: '',
		far: '',
		sky: [22, 16, 32],
		tint: [0.95, 0.9, 1],
	},
];

// ---------- pixel helpers ----------
const blank = (w: number, h: number): Img => ({ w, h, d: new Uint8Array(w * h * 4) });

function flipH(img: Img): Img {
	const o = blank(img.w, img.h);
	for (let y = 0; y < img.h; y++) {
		for (let x = 0; x < img.w; x++) {
			o.d.set(
				img.d.subarray((y * img.w + x) * 4, (y * img.w + x) * 4 + 4),
				(y * img.w + (img.w - 1 - x)) * 4,
			);
		}
	}
	return o;
}

function flipV(img: Img): Img {
	const o = blank(img.w, img.h);
	for (let y = 0; y < img.h; y++) {
		o.d.set(img.d.subarray(y * img.w * 4, (y + 1) * img.w * 4), (img.h - 1 - y) * img.w * 4);
	}
	return o;
}

/** Alpha-composite src over dst at (ox, oy), clipping to dst. */
function over(dst: Img, src: Img, ox: number, oy: number): void {
	for (let y = 0; y < src.h; y++) {
		const ty = y + oy;
		if (ty < 0 || ty >= dst.h) continue;
		for (let x = 0; x < src.w; x++) {
			const tx = x + ox;
			if (tx < 0 || tx >= dst.w) continue;
			const si = (y * src.w + x) * 4;
			if ((src.d[si + 3] as number) < 128) continue;
			dst.d.set(src.d.subarray(si, si + 4), (ty * dst.w + tx) * 4);
		}
	}
}

/** Mirror tiles `piece` across the full width, centred, each neighbour flipped so seams are continuous. */
function mirrorRow(dst: Img, piece: Img, bottomY: number): void {
	const n = Math.ceil(W / piece.w / 2) + 1;
	const x0 = Math.floor((W - piece.w) / 2);
	const flipped = flipH(piece);
	for (let i = -n; i <= n; i++)
		over(dst, Math.abs(i) % 2 === 0 ? piece : flipped, x0 + i * piece.w, bottomY - piece.h);
}

function grade(img: Img, tint: [number, number, number], darken: number, vignette: number): void {
	const cx = W / 2;
	const cy = H / 2;
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			const i = (y * W + x) * 4;
			const dx = (x - cx) / cx;
			const dy = (y - cy) / cy;
			const v = 1 - vignette * Math.min(1, Math.max(0, dx * dx * 0.7 + dy * dy * 0.5 - 0.15));
			const r = img.d[i] as number;
			const g = img.d[i + 1] as number;
			const b = img.d[i + 2] as number;
			const grey = (r + g + b) / 3;
			const k = darken * v;
			img.d[i] = Math.round((grey * 0.25 + r * 0.75) * k * tint[0]);
			img.d[i + 1] = Math.round((grey * 0.25 + g * 0.75) * k * tint[1]);
			img.d[i + 2] = Math.round((grey * 0.25 + b * 0.75) * k * tint[2]);
			img.d[i + 3] = 255;
		}
	}
}

function darkened(piece: Img, factor: number): Img {
	const o = blank(piece.w, piece.h);
	for (let i = 0; i < piece.d.length; i += 4) {
		o.d[i] = Math.round((piece.d[i] as number) * factor);
		o.d[i + 1] = Math.round((piece.d[i + 1] as number) * factor);
		o.d[i + 2] = Math.round((piece.d[i + 2] as number) * factor);
		o.d[i + 3] = piece.d[i + 3] as number;
	}
	return o;
}

const FLOORS: Record<string, { slab: [number, number, number]; glow: [number, number, number] }> = {
	'bg.combat.act1': { slab: [62, 54, 62], glow: [210, 80, 40] },
	'bg.combat.act2': { slab: [44, 58, 54], glow: [90, 180, 120] },
	'bg.combat.act3': { slab: [52, 48, 68], glow: [160, 100, 240] },
	'bg.title': { slab: [60, 46, 50], glow: [220, 80, 50] },
	'bg.menu': { slab: [60, 44, 50], glow: [220, 90, 60] },
	'bg.map.act1': { slab: [62, 54, 62], glow: [210, 80, 40] },
	'bg.map.act2': { slab: [48, 58, 54], glow: [220, 180, 80] },
	'bg.map.act3': { slab: [52, 48, 68], glow: [160, 100, 240] },
};

let seed = 1;
const rnd = (): number => {
	seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
	return seed / 4294967296;
};

function rect(
	img: Img,
	x0: number,
	y0: number,
	w: number,
	h: number,
	c: [number, number, number],
): void {
	for (let y = Math.max(0, y0); y < Math.min(img.h, y0 + h); y++) {
		for (let x = Math.max(0, x0); x < Math.min(img.w, x0 + w); x++)
			img.d.set([c[0], c[1], c[2], 255], (y * img.w + x) * 4);
	}
}

const shade = (c: [number, number, number], k: number): [number, number, number] => [
	Math.min(255, c[0] * k),
	Math.min(255, c[1] * k),
	Math.min(255, c[2] * k),
];

/** Flat stage floor: rows of slabs whose height grows toward the viewer, running bond joints, embers. */
function stageFloor(img: Img, key: string): void {
	const f = FLOORS[key] as { slab: [number, number, number]; glow: [number, number, number] };
	seed = 7 + key.length;
	let y = FLOOR_Y;
	let row = 0;
	let h = 20;
	while (y < H) {
		const rh = Math.min(h, H - y);
		const w = Math.round(h * 4.2);
		const off = row % 2 === 0 ? 0 : Math.round(w / 2);
		for (let x = -off; x < W; x += w) {
			rect(img, x, y, w, rh, shade(f.slab, 0.85 + rnd() * 0.3));
			rect(img, x, y, w, 2, shade(f.slab, 1.25));
			rect(img, x, y + rh - 2, w, 2, shade(f.slab, 0.55));
			rect(img, x, y, 2, rh, shade(f.slab, 0.5));
			if (rnd() < 0.35) {
				const cx = x + Math.floor(rnd() * w);
				for (let k = 0; k < 6 + Math.floor(rnd() * 14); k++)
					rect(
						img,
						cx + k,
						y + 4 + Math.floor(rnd() * (rh - 8)),
						1,
						1,
						shade(f.slab, 0.45),
					);
			}
		}
		y += rh;
		h = Math.round(h * 1.22);
		row++;
	}
	for (let i = 0; i < 90; i++) {
		const ex = Math.floor(rnd() * W);
		const ey = FLOOR_Y + 10 + Math.floor(rnd() * (H - FLOOR_Y - 12));
		rect(img, ex, ey, 2, 2, shade(f.glow, 0.7 + rnd() * 0.5));
	}
}

/** Top-down map floor: square slabs with offset rows, glowing joints in places. */
function mapFloor(img: Img, key: string): void {
	const f = FLOORS[key] as { slab: [number, number, number]; glow: [number, number, number] };
	seed = 11 + key.length;
	const s = 96;
	for (let row = 0; row * s < H; row++) {
		const off = row % 2 === 0 ? 0 : s / 2;
		for (let x = -off; x < W; x += s) {
			const y = row * s;
			rect(img, x, y, s, s, shade(f.slab, 0.85 + rnd() * 0.3));
			rect(img, x, y, s, 3, shade(f.slab, 0.45));
			rect(img, x, y, 3, s, shade(f.slab, 0.45));
			rect(img, x + 3, y + 3, s - 3, 2, shade(f.slab, 1.2));
			if (rnd() < 0.18) rect(img, x, y, s, 3, shade(f.glow, 0.55));
			if (rnd() < 0.18) rect(img, x, y, 3, s, shade(f.glow, 0.55));
			if (rnd() < 0.4) {
				const cx = x + 10 + Math.floor(rnd() * (s - 30));
				const cy = y + 10 + Math.floor(rnd() * (s - 30));
				for (let k = 0; k < 8 + Math.floor(rnd() * 22); k++)
					rect(img, cx + k, cy + Math.floor(k / 3), 1, 1, shade(f.slab, 0.4));
			}
		}
	}
}

// ---------- generation ----------
type PieceName = 'mid' | 'far';
const piecePath = (t: Theme, p: PieceName): string => join(PIECES, `${t.key}.${p}.png`);

async function generatePiece(t: Theme, p: PieceName, key: string): Promise<boolean> {
	const c = loadPng(join(CONCEPT_DIR, t.concept));
	const style = crop(c, t.rect[0], t.rect[1], t.rect[2], t.rect[3]);
	const prompt = `${p === 'mid' ? t.mid : t.far} ${COMMON}`;
	const size = { width: 688, height: 384 };
	const date = new Date().toISOString();
	const body = {
		description: prompt,
		image_size: size,
		style_image: {
			image: b64Image(style),
			size: { width: style.w, height: style.h },
			usage_description:
				'pixel size, shading, outline and mood only; do not copy the subject',
		},
		style_options: { color_palette: false, outline: true, detail: true, shading: true },
		target_palette: { colors: PALETTE_HEX, name: 'Ossuary master palette' },
	};
	const r: JobResult = await runJob('/generate-image-v2', body, key);
	const entry = {
		key: `${t.key}.${p}`,
		endpoint: '/generate-image-v2',
		prompt,
		params: {
			image_size: size,
			style_concept: t.concept,
			style_crop: t.rect,
			palette: 'master 33',
			composition: 'see scripts/assets/stitch-bg.ts',
		},
		date,
		httpStatus: r.status,
		jobId: r.jobId,
		usage: r.usage,
	};
	if (!r.ok) {
		appendLog({ ...entry, status: 'failed', error: r.error });
		console.error(`Failed ${t.key}.${p}: ${r.error?.slice(0, 140)}`);
		if (r.stop) throw new Error('stop');
		return false;
	}
	appendLog({ ...entry, status: 'ok' });
	writeImg(piecePath(t, p), r.images[0] as Img);
	const gens = (r.usage as { generations?: number } | null)?.generations ?? '?';
	console.log(`piece ${t.key}.${p} (${gens} generations)`);
	return true;
}

// ---------- composition ----------
function darkenRows(img: Img, y0: number, rows: number, from: number): void {
	for (let y = 0; y < rows; y++) {
		const k = from + ((1 - from) * y) / rows;
		for (let x = 0; x < W; x++) {
			const i = ((y0 + y) * W + x) * 4;
			img.d[i] = Math.round((img.d[i] as number) * k);
			img.d[i + 1] = Math.round((img.d[i + 1] as number) * k);
			img.d[i + 2] = Math.round((img.d[i + 2] as number) * k);
		}
	}
}

function compose(t: Theme): boolean {
	const img = blank(W, H);
	if (t.kind === 'map') {
		mapFloor(img, t.key);
		grade(img, t.tint, 1.15, 0.3);
	} else {
		if (!existsSync(piecePath(t, 'mid')) || !existsSync(piecePath(t, 'far'))) return false;
		const mid = snap(loadPng(piecePath(t, 'mid')), false);
		const far = darkened(snap(loadPng(piecePath(t, 'far')), false), 0.6);
		const wallTop = FLOOR_Y + 24 - mid.h;
		// Far layer: two stacked rows (the second flipped vertically so the seam is continuous) behind the mid layer.
		for (let y = 0; y < H; y++) {
			const k = 0.5 + 0.9 * (y / H);
			for (let x = 0; x < W; x++)
				img.d.set([t.sky[0] * k, t.sky[1] * k, t.sky[2] * k, 255], (y * W + x) * 4);
		}
		mirrorRow(img, far, wallTop + 60);
		mirrorRow(img, mid, FLOOR_Y + 24);
		stageFloor(img, t.key);
		const g = (FLOORS[t.key] as { glow: [number, number, number] }).glow;
		for (let y = 0; y < 160; y++) {
			const a = 0.16 * (1 - y / 160);
			for (let x = 0; x < W; x++) {
				const i = ((FLOOR_Y - 140 + y) * W + x) * 4;
				for (let c = 0; c < 3; c++)
					img.d[i + c] = Math.min(255, (img.d[i + c] as number) + (g[c] as number) * a);
			}
		}
		darkenRows(img, FLOOR_Y, 26, 0.45);
		darkenRows(img, wallTop, 40, 0.5);
		grade(img, t.tint, 1, 0.6);
	}
	snap(img, false);
	writeImg(join(OUT, `${t.key}.png`), img);
	console.log(`composed ${t.key} ${W}x${H}`);
	return true;
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;
	const generate = args.includes('--generate');
	const key = generate ? apiKey() : '';
	for (const t of THEMES) {
		if (only && t.key !== only) continue;
		if (generate && t.kind === 'stage') {
			try {
				for (const p of ['mid', 'far'] as PieceName[]) {
					if (!existsSync(piecePath(t, p))) await generatePiece(t, p, key);
				}
			} catch {
				console.error(
					'Stopped: the API refused the request (auth, credits or rate limit).',
				);
				return;
			}
		}
		if (!compose(t)) console.log(`skipped ${t.key}: pieces missing (run with --generate)`);
	}
}

if (import.meta.main) await main();
