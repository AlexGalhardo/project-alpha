// Generates the prototype pixel art with the PixelLab REST API v2 (pixflux), then post-processes it.
// Run: PIXELLAB_KEY_OVERRIDE=<key> bun scripts/assets/pixellab.ts [--group heroes|enemies|boss|cards|backgrounds|icons|all]
//        [--only <key>] [--force] [--balance] [--limit N] [--process-only]
// The API key is read from PIXELLAB_KEY_OVERRIDE (wins) or PIXELLAB_API_KEY. It is passed to curl through
// stdin and is never printed, logged or written to disk.
// Idempotent: a key whose raw image and final sprite exist is skipped (use --force to regenerate).
// Output: raw images in art-src/pixellab/raw/, final sprites in public/assets/sprites/<key>.png,
// log in art-src/pixellab/generation-log.json.

import {
	closeSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	openSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32, deflateSync, inflateSync } from 'node:zlib';
import { P } from '../../src/view/palette.ts';

const ROOT = join(import.meta.dir, '..', '..');
const RAW_DIR = join(ROOT, 'art-src', 'pixellab', 'raw');
const OUT_DIR = join(ROOT, 'public', 'assets', 'sprites');
// Icon masters (32x32, API minimum) are the base for the hand pass; they are not game textures.
const ICON_DIR = join(ROOT, 'art-src', 'pixellab', 'icons');
const outDirOf = (job: { group: string }): string => (job.group === 'icons' ? ICON_DIR : OUT_DIR);
const LOG_PATH = join(ROOT, 'art-src', 'pixellab', 'generation-log.json');
const API = 'https://api.pixellab.ai/v2';

// ---------- PNG (decode and encode, no dependencies) ----------
interface Img {
	w: number;
	h: number;
	/** RGBA, 4 bytes per pixel. */
	d: Uint8Array;
}

export function decodePng(buf: Uint8Array): Img {
	const b = Buffer.from(buf);
	if (b.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
	let pos = 8;
	let w = 0;
	let h = 0;
	let depth = 8;
	let ctype = 6;
	let interlace = 0;
	const idat: Buffer[] = [];
	let plte: Buffer | null = null;
	let trns: Buffer | null = null;
	while (pos < b.length) {
		const len = b.readUInt32BE(pos);
		const type = b.toString('ascii', pos + 4, pos + 8);
		const data = b.subarray(pos + 8, pos + 8 + len);
		if (type === 'IHDR') {
			w = data.readUInt32BE(0);
			h = data.readUInt32BE(4);
			depth = data[8] as number;
			ctype = data[9] as number;
			interlace = data[12] as number;
		} else if (type === 'PLTE') plte = Buffer.from(data);
		else if (type === 'tRNS') trns = Buffer.from(data);
		else if (type === 'IDAT') idat.push(Buffer.from(data));
		else if (type === 'IEND') break;
		pos += 12 + len;
	}
	if (interlace !== 0) throw new Error('interlaced PNG not supported');
	const channels = ctype === 6 ? 4 : ctype === 2 ? 3 : ctype === 0 ? 1 : ctype === 4 ? 2 : 1;
	const bpp = Math.max(1, (channels * depth) / 8);
	const stride = Math.ceil((w * channels * depth) / 8);
	const raw = inflateSync(Buffer.concat(idat));
	const pix = Buffer.alloc(stride * h);
	for (let y = 0; y < h; y++) {
		const f = raw[y * (stride + 1)] as number;
		const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
		const cur = pix.subarray(y * stride, (y + 1) * stride);
		const prev = y > 0 ? pix.subarray((y - 1) * stride, y * stride) : null;
		for (let i = 0; i < stride; i++) {
			const a = i >= bpp ? (cur[i - bpp] as number) : 0;
			const up = prev ? (prev[i] as number) : 0;
			const c = prev && i >= bpp ? (prev[i - bpp] as number) : 0;
			let v = src[i] as number;
			if (f === 1) v += a;
			else if (f === 2) v += up;
			else if (f === 3) v += (a + up) >> 1;
			else if (f === 4) {
				const p = a + up - c;
				const pa = Math.abs(p - a);
				const pb = Math.abs(p - up);
				const pc = Math.abs(p - c);
				v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
			}
			cur[i] = v & 255;
		}
	}
	const d = new Uint8Array(w * h * 4);
	const sample = (y: number, x: number, ch: number): number => {
		if (depth === 8) return pix[y * stride + x * channels + ch] as number;
		if (depth === 16) return pix[y * stride + (x * channels + ch) * 2] as number;
		const perByte = 8 / depth;
		const byte = pix[y * stride + Math.floor((x * channels + ch) / perByte)] as number;
		const shift = 8 - depth * (((x * channels + ch) % perByte) + 1);
		return (byte >> shift) & ((1 << depth) - 1);
	};
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const o = (y * w + x) * 4;
			if (ctype === 6) {
				for (let k = 0; k < 4; k++) d[o + k] = sample(y, x, k);
			} else if (ctype === 2) {
				for (let k = 0; k < 3; k++) d[o + k] = sample(y, x, k);
				d[o + 3] = 255;
			} else if (ctype === 3 && plte) {
				const idx = sample(y, x, 0);
				d[o] = plte[idx * 3] as number;
				d[o + 1] = plte[idx * 3 + 1] as number;
				d[o + 2] = plte[idx * 3 + 2] as number;
				d[o + 3] = trns && idx < trns.length ? (trns[idx] as number) : 255;
			} else if (ctype === 0) {
				const v =
					depth === 8 ? sample(y, x, 0) : sample(y, x, 0) * (255 / ((1 << depth) - 1));
				d[o] = d[o + 1] = d[o + 2] = v;
				d[o + 3] = 255;
			} else if (ctype === 4) {
				d[o] = d[o + 1] = d[o + 2] = sample(y, x, 0);
				d[o + 3] = sample(y, x, 1);
			}
		}
	}
	return { w, h, d };
}

export function encodePng(img: Img): Uint8Array {
	const { w, h, d } = img;
	const raw = Buffer.alloc((w * 4 + 1) * h);
	for (let y = 0; y < h; y++)
		Buffer.from(d.buffer, d.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
	const chunk = (t: string, data: Buffer): Buffer => {
		const out = Buffer.alloc(12 + data.length);
		out.writeUInt32BE(data.length, 0);
		out.write(t, 4, 'ascii');
		data.copy(out, 8);
		out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)) >>> 0, 8 + data.length);
		return out;
	};
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(w, 0);
	ihdr.writeUInt32BE(h, 4);
	ihdr[8] = 8;
	ihdr[9] = 6;
	return new Uint8Array(
		Buffer.concat([
			Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
			chunk('IHDR', ihdr),
			chunk('IDAT', deflateSync(raw)),
			chunk('IEND', Buffer.alloc(0)),
		]),
	);
}

// ---------- post-processing (palette snap, transparency, exact canvas) ----------
const PALETTE: [number, number, number][] = Object.values(P).map((c) => [
	(c >> 16) & 255,
	(c >> 8) & 255,
	c & 255,
]);

function nearest(r: number, g: number, b: number): [number, number, number] {
	let best = PALETTE[0] as [number, number, number];
	let bd = Number.POSITIVE_INFINITY;
	for (const p of PALETTE) {
		const dr = p[0] - r;
		const dg = p[1] - g;
		const db = p[2] - b;
		const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db; // weighted RGB (green counts most)
		if (dist < bd) {
			bd = dist;
			best = p;
		}
	}
	return best;
}

/** Corner flood fill for images that came back opaque: makes the connected background transparent. */
function floodBackground(img: Img): void {
	const { w, h, d } = img;
	const corner = [d[0], d[1], d[2]] as number[];
	const same = (i: number): boolean =>
		Math.abs((d[i] as number) - (corner[0] as number)) < 24 &&
		Math.abs((d[i + 1] as number) - (corner[1] as number)) < 24 &&
		Math.abs((d[i + 2] as number) - (corner[2] as number)) < 24;
	const seen = new Uint8Array(w * h);
	const stack: number[] = [];
	for (const [x, y] of [
		[0, 0],
		[w - 1, 0],
		[0, h - 1],
		[w - 1, h - 1],
	] as [number, number][])
		stack.push(y * w + x);
	while (stack.length) {
		const p = stack.pop() as number;
		if (seen[p] || !same(p * 4)) continue;
		seen[p] = 1;
		const x = p % w;
		const y = Math.floor(p / w);
		if (x > 0) stack.push(p - 1);
		if (x < w - 1) stack.push(p + 1);
		if (y > 0) stack.push(p - w);
		if (y < h - 1) stack.push(p + w);
	}
	for (let p = 0; p < w * h; p++) if (seen[p]) d[p * 4 + 3] = 0;
}

function snap(img: Img, wantTransparent: boolean): Img {
	if (wantTransparent) {
		let opaque = true;
		for (let i = 3; i < img.d.length; i += 4) if ((img.d[i] as number) < 250) opaque = false;
		if (opaque) floodBackground(img);
	}
	const d = img.d;
	for (let i = 0; i < d.length; i += 4) {
		if ((d[i + 3] as number) < 128) {
			d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0;
			continue;
		}
		const [r, g, b] = nearest(d[i] as number, d[i + 1] as number, d[i + 2] as number);
		d[i] = r;
		d[i + 1] = g;
		d[i + 2] = b;
		d[i + 3] = 255;
	}
	return img;
}

/** Crop or pad to the exact canvas: centred horizontally, bottom aligned (units) or centred (others). */
function fitCanvas(img: Img, w: number, h: number, bottomAligned: boolean): Img {
	if (img.w === w && img.h === h) return img;
	const out = new Uint8Array(w * h * 4);
	const ox = Math.floor((w - img.w) / 2);
	const oy = bottomAligned ? h - img.h : Math.floor((h - img.h) / 2);
	for (let y = 0; y < img.h; y++) {
		for (let x = 0; x < img.w; x++) {
			const tx = x + ox;
			const ty = y + oy;
			if (tx < 0 || ty < 0 || tx >= w || ty >= h) continue;
			out.set(
				img.d.subarray((y * img.w + x) * 4, (y * img.w + x) * 4 + 4),
				(ty * w + tx) * 4,
			);
		}
	}
	return { w, h, d: out };
}

function upscale(img: Img, k: number): Img {
	const out = new Uint8Array(img.w * k * img.h * k * 4);
	for (let y = 0; y < img.h * k; y++) {
		for (let x = 0; x < img.w * k; x++) {
			out.set(
				img.d.subarray(
					(Math.floor(y / k) * img.w + Math.floor(x / k)) * 4,
					(Math.floor(y / k) * img.w + Math.floor(x / k)) * 4 + 4,
				),
				(y * img.w * k + x) * 4,
			);
		}
	}
	return { w: img.w * k, h: img.h * k, d: out };
}

// ---------- asset list ----------
type Group = 'heroes' | 'enemies' | 'boss' | 'backgrounds' | 'cards' | 'icons';

interface Job {
	key: string;
	group: Group;
	prompt: string;
	/** Size requested from the API (pixflux: 16..400). */
	gen: [number, number];
	/** Final canvas. When larger than `gen` it is an integer nearest-neighbour upscale. */
	final: [number, number];
	facing?: 'east' | 'west';
	transparent: boolean;
	outline: string;
	shading: string;
	detail: string;
	view: string | null;
	note?: string;
}

const CHAR_COMMON =
	'Dark fantasy, grim and worn. Limited palette: cold ash greys, dark iron, bone and worn gold. No pure black, no pure white. Single light from the upper left. 1 px selective outline, no dithering. Readable silhouette.';

const heroes: [string, string][] = [
	[
		'shieldbearer',
		'A heavy black riveted plate knight with a tall rectangular shield with a red cross-shaped boss, a jagged sword in the other hand, a short tattered crimson cape.',
	],
	[
		'marksman',
		'A slim hooded archer in charcoal leather, a narrow angular mask, a long recurve bow held at rest, a quiver of dark arrows on the back.',
	],
	[
		'arcanist',
		'A tall figure in layered dark violet robes, a faceless metal mask, a spiked staff with a glowing ember rune at its head.',
	],
	[
		'confessor',
		'A slender priest in ash-white robes, an engraved mask, a lantern-staff with pale green light, a leather satchel on the hip.',
	],
	[
		'bombardier',
		'A stocky armoured gunner with a riveted iron breathing helmet, ammunition belts across the chest, a short hand cannon held low.',
	],
];

const enemies: [string, [number, number], string][] = [
	[
		'husk_penitent',
		[64, 80],
		'A gaunt man in a torn penitent shift, wrapped in cords, a flail of knotted chain in one hand.',
	],
	[
		'chitter_swarm',
		[48, 48],
		'A knot of small pale many-legged things fused into one body, a crown of mouths.',
	],
	[
		'ash_acolyte',
		[64, 80],
		'A cloaked woman holding a brazier on a chain, ash streaming from her sleeves.',
	],
	[
		'graft_hound',
		[80, 64],
		'A quadruped of stitched dog and human parts, a row of extra eyes along the spine.',
	],
	[
		'wax_mourner',
		[64, 80],
		'A hooded mourner whose face is a slow wax mask dripping down the chest.',
	],
	[
		'rust_templar',
		[64, 80],
		'A hollow knight in rust-eaten plate, helmet fused shut, a broken processional banner used as a spear.',
	],
	[
		'lantern_leech',
		[48, 48],
		'A sack-shaped creature with a lantern set in its body, long feeding tendrils.',
	],
	[
		'choir_thing',
		[80, 112],
		'A tall throatless figure with open mouths along the arms, bent forward as if singing.',
	],
	[
		'ossified_brute',
		[80, 112],
		'A hulking figure of bone grown over bone, a heavy crushing fist, slow and patient.',
	],
	[
		'rift_stalker',
		[80, 112],
		'A thin long-limbed shape between folds of dark light, sharp blade-like forelimbs.',
	],
];

const BG_COMMON =
	'Pixel art background, side view, no characters, no text, dark desaturated palette, light from the upper left, no dithering.';
const backgrounds: [string, string][] = [
	[
		'bg.title',
		'A ruined gothic citadel on a cliff under a dark red moon, chains hanging from broken towers, a small stone overlook in the foreground.',
	],
	[
		'bg.menu',
		'A vast cathedral hall, tall crimson stained-glass windows, a long stone staircase, candles along the walls.',
	],
	[
		'bg.map.act1',
		'A dark gothic cloister seen from above, corridors and stone arches, a faint red glow under the floor.',
	],
	[
		'bg.combat.act1',
		'A ruined cathedral nave, collapsed arches, a broken altar at the back, shafts of cold light, ash on the flagstones.',
	],
];

const CARD_COMMON =
	'Pixel art illustration, one clear focal point, cold ash greys, dark iron, bone, ember orange and worn gold, light from the upper left, dark vignette edges, no dithering, no border, no stars, no pentagrams, no eight-pointed symbols, no animals unless named, no text.';
const cards: [string, string][] = [
	['shb_hack', 'Heavy sword cut across a plated shoulder'],
	['shb_brace', 'Shield raised, feet braced on stone'],
	['shb_hold_the_line', 'Shield wall at a broken gate'],
	['shb_shield_slam', 'Shield edge driving into a face'],
	['shb_iron_stance', 'Armoured figure planted, sparks at the boots'],
	['shb_shove', 'Shield hitting a body, dust burst'],
	['shb_bulwark', 'A tall shield wall of riveted iron'],
	['shb_vow_of_iron', 'Gauntlet raised with a vow scroll'],
	['shb_last_bastion', 'A line of shields lit from behind'],
	['mrk_aimed_shot', 'Bow drawn, arrow on target'],
	['mrk_sidestep', 'Hooded archer stepping aside, cloak trailing'],
	['mrk_mark_prey', 'Crosshair sigil painted on a figure'],
	['mrk_piercing_bolt', 'Bolt passing through two figures in a line'],
	['mrk_quick_draw', 'Arrow nocked in one motion'],
	['mrk_pinning_shot', 'Arrow pinning a cloak to a wall'],
	['mrk_volley', 'Many arrows arcing over a field'],
	['mrk_hunters_focus', 'Narrowed eye through a lens'],
	['mrk_killshot', 'A single heavy crossbow bolt piercing a cracked iron helm, ember sparks, dark nave'],
	['arc_ember_bolt', 'Small glowing ember flying from a staff'],
	['arc_ash_veil', 'Ash cloud forming a veil around an ally'],
	['arc_rift_spark', 'Spark jumping between cracks in the air'],
	['arc_burn_hex', 'Jagged glowing ember cracks spreading across a stone floor, an irregular scorch mark with a curse-like tangle of lines, no star, no hexagram, no pentagram, no geometric symbol, no letters'],
	['arc_channel', 'Hands gathering light over a staff'],
	['arc_cinder_lance', 'Lance of ember driving forward'],
	['arc_firestorm', 'Column of fire across a field'],
	['arc_unseal', 'A broken wax seal on an ancient tome, violet light leaking from the crack'],
	['arc_rift_rupture', 'A rupture of violet light in the air'],
	['cnf_censer_strike', 'Swinging censer leaving a smoke arc'],
	['cnf_sanctuary', 'Pale circle of light around a figure'],
	['cnf_mend', 'Hands stitching a wound with thread of light'],
	['cnf_absolve', 'Dark marks lifting from a body like smoke'],
	['cnf_litany', 'Open book with rising lines of light'],
	['cnf_rebuke', 'Lantern thrust forward against a dark form'],
	['cnf_mass_mend', 'Several figures lit by one bright cross'],
	['cnf_steadfast_hymn', 'Choir of mouths singing around a shield'],
	['cnf_rekindle', 'Fallen figure rising in a ring of embers'],
	['bmb_grapeshot', 'Cannon spraying shot over two targets'],
	['bmb_sandbags', 'Sandbags stacked in a battlement'],
	['bmb_shell', 'Shell arcing toward a line of enemies'],
	['bmb_incendiary', 'Fire bursting from a shell'],
	['bmb_reload', 'Ammunition being loaded into a cannon'],
	['bmb_concussion_round', 'Shockwave ring from an impact'],
	['bmb_barrage', 'Three bursts in a diagonal'],
	['bmb_powder_keg', 'Keg with a fuse, tied to a stake'],
	['bmb_siege_mortar', 'Mortar firing upward, bright flash'],
];

const ICON_COMMON =
	'Pixel art icon, centred, shape clearly readable at small size, 1 px dark outline, few colours, transparent background, no text.';
const icons: [string, number, string, string?][] = [
	[
		'icon.status.block',
		32,
		'a shield',
		'API minimum is 32x32: 12x12 master to be redrawn by hand',
	],
	[
		'icon.status.might',
		32,
		'a raised fist',
		'API minimum is 32x32: 12x12 master to be redrawn by hand',
	],
	[
		'icon.status.ward',
		32,
		'a ring with a rune',
		'API minimum is 32x32: 12x12 master to be redrawn by hand',
	],
	[
		'icon.status.marked',
		32,
		'a crosshair',
		'API minimum is 32x32: 12x12 master to be redrawn by hand',
	],
	[
		'icon.status.weakened',
		32,
		'a broken blade',
		'API minimum is 32x32: 12x12 master to be redrawn by hand',
	],
	[
		'icon.status.bleed',
		32,
		'a blood droplet',
		'API minimum is 32x32: 12x12 master to be redrawn by hand',
	],
	['icon.status.burn', 32, 'a flame', 'API minimum is 32x32: 12x12 master to be redrawn by hand'],
	[
		'icon.status.stunned',
		32,
		'a spiral',
		'API minimum is 32x32: 12x12 master to be redrawn by hand',
	],
	[
		'icon.node.combat',
		32,
		'two crossed swords',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.node.elite',
		32,
		'a horned skull',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.node.shop',
		32,
		'a coin purse',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.node.rest',
		32,
		'a campfire',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.node.boss',
		32,
		'a bell with teeth',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.item.eq_notched_blade',
		32,
		'a notched short sword',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.item.eq_heavy_pavise',
		32,
		'a heavy tower shield',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.item.eq_bone_reliquary',
		32,
		'a bone reliquary box',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.item.eq_ember_focus',
		32,
		'a glowing ember crystal on a rod',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.item.eq_votive_candle',
		32,
		'a votive candle',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.item.eq_iron_rosary',
		32,
		'an iron rosary',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.item.eq_hunters_lens',
		32,
		'a hunter lens monocle',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
	[
		'icon.item.eq_bell_clapper',
		32,
		'a bronze bell clapper',
		'API minimum is 32x32: kept as 32x32 master (24x24 by hand)',
	],
];

function buildJobs(): Job[] {
	const jobs: Job[] = [];
	for (const [id, desc] of heroes) {
		jobs.push({
			key: `hero.${id}.idle`,
			group: 'heroes',
			prompt: `Side-view pixel art character, full body, standing ready pose, facing right. ${desc} ${CHAR_COMMON}`,
			gen: [64, 80],
			final: [64, 80],
			facing: 'east',
			transparent: true,
			outline: 'selective outline',
			shading: 'medium shading',
			detail: 'medium detail',
			view: 'side',
		});
	}
	for (const [id, size, desc] of enemies) {
		jobs.push({
			key: `enemy.${id}.idle`,
			group: 'enemies',
			prompt: `Side-view pixel art creature, full body, standing, facing left. ${desc} ${CHAR_COMMON}`,
			gen: size,
			final: size,
			facing: 'west',
			transparent: true,
			outline: 'selective outline',
			shading: 'medium shading',
			detail: 'medium detail',
			view: 'side',
		});
	}
	jobs.push({
		key: 'enemy.bell_maw.idle',
		group: 'boss',
		prompt: `Front view pixel art boss monster, fills the canvas. A cathedral bell grown into a biomechanical mouth, with a rim of teeth of bone, rooted in cracked stone, brass machinery visible on the sides, a dark opening at the front. Palette: bone, worn gold, ember rim. ${CHAR_COMMON}`,
		gen: [160, 144],
		final: [160, 144],
		transparent: true,
		outline: 'selective outline',
		shading: 'medium shading',
		detail: 'highly detailed',
		view: 'side',
	});
	for (const [key, desc] of backgrounds) {
		jobs.push({
			key,
			group: 'backgrounds',
			prompt: `${desc} ${BG_COMMON}`,
			gen: [320, 180],
			final: [640, 360],
			transparent: false,
			outline: 'lineless',
			shading: 'medium shading',
			detail: 'highly detailed',
			view: null,
			note: 'generated at 320x180 (API max 400x400) and upscaled 2x nearest to 640x360',
		});
	}
	for (const [id, scene] of cards) {
		jobs.push({
			key: `card.${id}`,
			group: 'cards',
			prompt: `${scene}. ${CARD_COMMON}`,
			gen: [60, 40],
			final: [60, 40],
			transparent: false,
			outline: 'lineless',
			shading: 'medium shading',
			detail: 'medium detail',
			view: null,
		});
	}
	for (const [key, size, shape, note] of icons) {
		jobs.push({
			key,
			group: 'icons',
			prompt: `${ICON_COMMON} The icon shows ${shape}.`,
			gen: [size, size],
			final: [size, size],
			transparent: true,
			outline: 'single color outline',
			shading: 'basic shading',
			detail: 'low detail',
			view: null,
			note,
		});
	}
	return jobs;
}

// ---------- API access through curl ----------
function apiKey(): string {
	const key = process.env.PIXELLAB_KEY_OVERRIDE || process.env.PIXELLAB_API_KEY;
	if (!key) {
		console.error(
			'PIXELLAB_KEY_OVERRIDE (or PIXELLAB_API_KEY) is not set. Nothing was generated.',
		);
		process.exit(1);
	}
	return key;
}

interface HttpResult {
	status: number;
	json: unknown;
}

// curl is used instead of fetch because Bun's TLS store rejects the local certificate chain.
// The key travels only through curl's stdin config; it is never written to a file or logged.
async function http(
	method: 'GET' | 'POST',
	path: string,
	body: unknown,
	key: string,
): Promise<HttpResult> {
	const dir = mkdtempSync(join(tmpdir(), 'ossuary-pl-'));
	try {
		const outFile = join(dir, 'out.json');
		const args = [
			'curl',
			'-sS',
			'-K',
			'-',
			'-X',
			method,
			'-o',
			outFile,
			'-w',
			'%{http_code}',
			'--max-time',
			'240',
		];
		if (body !== undefined) {
			const bodyFile = join(dir, 'body.json');
			writeFileSync(bodyFile, JSON.stringify(body));
			args.push('--data-binary', `@${bodyFile}`);
		}
		args.push(`${API}${path}`);
		const config = `header = "Authorization: Bearer ${key}"\nheader = "Content-Type: application/json"\n`;
		const proc = Bun.spawn(args, { stdin: new Blob([config]), stdout: 'pipe', stderr: 'pipe' });
		const status = Number((await new Response(proc.stdout).text()).trim());
		const code = await proc.exited;
		if (code !== 0) {
			const err = (await new Response(proc.stderr).text()).slice(0, 200);
			throw new Error(`curl exited with ${code}: ${err}`);
		}
		const text = readFileSync(outFile, 'utf8');
		let json: unknown = text;
		try {
			json = JSON.parse(text);
		} catch {
			/* keep the text */
		}
		return { status, json };
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

function paletteImage(): { type: 'base64'; base64: string; format: 'png' } {
	const w = PALETTE.length;
	const d = new Uint8Array(w * 4);
	for (const [i, c] of PALETTE.entries()) d.set([c[0], c[1], c[2], 255], i * 4);
	return {
		type: 'base64',
		base64: Buffer.from(encodePng({ w, h: 1, d })).toString('base64'),
		format: 'png',
	};
}

// ---------- log ----------
interface LogEntry {
	key: string;
	endpoint: string;
	prompt: string;
	params: Record<string, unknown>;
	date: string;
	status: 'ok' | 'failed';
	httpStatus: number;
	usage?: unknown;
	jobId?: string;
	note?: string;
	error?: string;
}

/** Read-modify-write of the log under a lock file, so parallel runs do not lose entries. */
function appendLog(entry: LogEntry): void {
	mkdirSync(join(ROOT, 'art-src', 'pixellab'), { recursive: true });
	const lock = `${LOG_PATH}.lock`;
	for (let i = 0; ; i++) {
		try {
			closeSync(openSync(lock, 'wx'));
			break;
		} catch {
			if (i > 400) rmSync(lock, { force: true });
			Bun.sleepSync(25);
		}
	}
	try {
		const log: LogEntry[] = existsSync(LOG_PATH)
			? (JSON.parse(readFileSync(LOG_PATH, 'utf8')) as LogEntry[])
			: [];
		log.push(entry);
		writeFileSync(
			LOG_PATH,
			`${JSON.stringify(log, null, 2)}
`,
		);
	} finally {
		rmSync(lock, { force: true });
	}
}

// ---------- generation ----------
function findBase64(v: unknown): string | null {
	if (!v || typeof v !== 'object') return null;
	const o = v as Record<string, unknown>;
	if (typeof o.base64 === 'string') return o.base64;
	for (const k of Object.keys(o)) {
		const r = findBase64(o[k]);
		if (r) return r;
	}
	return null;
}

async function generate(
	job: Job,
	key: string,
	palette: ReturnType<typeof paletteImage>,
): Promise<{ ok: boolean; stop: boolean }> {
	const endpoint = '/create-image-pixflux';
	const body: Record<string, unknown> = {
		description: job.prompt,
		image_size: { width: job.gen[0], height: job.gen[1] },
		no_background: job.transparent,
		outline: job.outline,
		shading: job.shading,
		detail: job.detail,
		text_guidance_scale: 8,
		color_image: palette,
	};
	if (job.view) body.view = job.view;
	if (job.facing) body.direction = job.facing;
	const { color_image: _palette, ...loggedParams } = body;
	const date = new Date().toISOString();
	let res = await http('POST', endpoint, body, key);
	let jobId: string | undefined;
	let usage = (res.json as { usage?: unknown } | null)?.usage;
	if (res.status === 202 && res.json && typeof res.json === 'object') {
		jobId = (res.json as { background_job_id?: string }).background_job_id;
		for (let i = 0; i < 120 && jobId; i++) {
			await Bun.sleep(3000);
			res = await http('GET', `/background-jobs/${jobId}`, undefined, key);
			const st = (res.json as { status?: string }).status;
			if (st === 'completed' || st === 'failed' || res.status >= 400) break;
		}
		usage = (res.json as { usage?: unknown } | null)?.usage ?? usage;
	}
	const b64 = res.status >= 200 && res.status < 300 ? findBase64(res.json) : null;
	if (!b64) {
		const errorText = (
			typeof res.json === 'string' ? res.json : JSON.stringify(res.json)
		).slice(0, 300);
		appendLog({
			key: job.key,
			endpoint,
			prompt: job.prompt,
			params: { ...loggedParams, color_image: 'master palette (33 colours)' },
			date,
			status: 'failed',
			httpStatus: res.status,
			jobId,
			error: errorText,
		});
		console.error(`Failed ${job.key}: HTTP ${res.status} ${errorText.slice(0, 120)}`);
		return { ok: false, stop: [401, 402, 429].includes(res.status) };
	}
	mkdirSync(RAW_DIR, { recursive: true });
	writeFileSync(join(RAW_DIR, `${job.key}.png`), Buffer.from(b64, 'base64'));
	appendLog({
		key: job.key,
		endpoint,
		prompt: job.prompt,
		params: { ...loggedParams, color_image: 'master palette (33 colours)' },
		date,
		status: 'ok',
		httpStatus: res.status,
		usage,
		jobId,
		note: job.note,
	});
	return { ok: true, stop: false };
}

function processJob(job: Job): void {
	const raw = readFileSync(join(RAW_DIR, `${job.key}.png`));
	let img = decodePng(new Uint8Array(raw));
	img = snap(img, job.transparent);
	const bottom = job.group === 'heroes' || job.group === 'enemies' || job.group === 'boss';
	const scale = job.final[0] / job.gen[0];
	if (scale > 1) img = upscale(img, scale);
	img = fitCanvas(img, job.final[0], job.final[1], bottom);
	mkdirSync(outDirOf(job), { recursive: true });
	writeFileSync(
		join(outDirOf(job), `${job.key}.png`),
		img.d.length ? encodePng(img) : new Uint8Array(),
	);
}

/** manifest.json: basenames (no .png) of every sprite whose file exists with the exact final canvas size. */
function writeManifest(): number {
	const keys: string[] = [];
	for (const job of buildJobs()) {
		if (job.group === 'icons') continue;
		const f = join(OUT_DIR, `${job.key}.png`);
		if (!existsSync(f)) continue;
		const img = decodePng(new Uint8Array(readFileSync(f)));
		if (img.w === job.final[0] && img.h === job.final[1]) keys.push(job.key);
	}
	keys.sort();
	mkdirSync(OUT_DIR, { recursive: true });
	writeFileSync(
		join(OUT_DIR, 'manifest.json'),
		`${JSON.stringify(keys, null, 2)}
`,
	);
	return keys.length;
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const arg = (k: string): string | undefined => {
		const i = args.indexOf(k);
		return i >= 0 ? args[i + 1] : undefined;
	};
	const group = arg('--group') ?? 'all';
	const only = arg('--only');
	const limit = Number(arg('--limit') ?? '100000');
	const force = args.includes('--force');
	const processOnly = args.includes('--process-only');

	if (args.includes('--manifest')) {
		console.log(`manifest.json: ${writeManifest()} sprites`);
		return;
	}

	if (args.includes('--balance')) {
		const r = await http('GET', '/balance', undefined, apiKey());
		console.log(`HTTP ${r.status}`, JSON.stringify(r.json));
		return;
	}

	const key = processOnly ? '' : apiKey();
	const palette = paletteImage();
	let generated = 0;
	let skipped = 0;
	let failed = 0;
	for (const job of buildJobs()) {
		if (group !== 'all' && job.group !== group) continue;
		if (only && job.key !== only) continue;
		const rawPath = join(RAW_DIR, `${job.key}.png`);
		const outPath = join(outDirOf(job), `${job.key}.png`);
		if (!force && existsSync(rawPath) && existsSync(outPath)) {
			skipped++;
			continue;
		}
		if (force || !existsSync(rawPath)) {
			if (processOnly) continue;
			if (generated >= limit) break;
			const r = await generate(job, key, palette);
			if (r.stop) {
				console.error(
					`Stopped at ${job.key}: the API refused the request (auth, credits or rate limit).`,
				);
				break;
			}
			if (!r.ok) {
				failed++;
				continue;
			}
			generated++;
		}
		processJob(job);
		writeManifest();
		console.log(`done ${job.key}`);
		await Bun.sleep(300);
	}
	console.log(
		`generated ${generated}, skipped ${skipped}, failed ${failed}, manifest ${writeManifest()} sprites`,
	);
}

if (import.meta.main) await main();
