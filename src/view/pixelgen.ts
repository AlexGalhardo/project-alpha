import { P } from './palette';

// shortcut: code-drawn unit sprites (3-tone ramps, one light from the upper left, 1 px dark
// outline, docs/art-bible.md §6) while the PixelLab subscription is blocked; replace with the
// generated and hand-cleaned sprites under the same keys when the cost-gate batch runs.

type Ramp = readonly [number, number, number];

const R = {
	ash: [P.ash1, P.ash3, P.ash4],
	stone: [P.ash2, P.ash4, P.ash5],
	iron: [P.iron0, P.iron1, P.iron2],
	bone: [P.bone0, P.bone1, P.bone2],
	skin: [P.bone0, P.bone1, P.bone1],
	ember: [P.ember0, P.ember1, P.ember2],
	flame: [P.ember2, P.ember3, P.bone2],
	gold: [P.gold0, P.gold1, P.gold2],
	blood: [P.blood0, P.blood1, P.blood2],
	rot: [P.rot0, P.rot1, P.rot2],
	rift: [P.rift0, P.rift1, P.rift2],
	ward: [P.ward0, P.ward0, P.ward1],
	shadow: [P.ash1, P.ash1, P.ash1],
	eye: [P.rot2, P.rot2, P.rot2],
} as const satisfies Record<string, Ramp>;

type RampKey = keyof typeof R;

class Pix {
	readonly cells: (RampKey | null)[];

	constructor(
		readonly w: number,
		readonly h: number,
	) {
		this.cells = new Array(w * h).fill(null);
	}

	set(x: number, y: number, r: RampKey): void {
		const xi = Math.round(x);
		const yi = Math.round(y);
		if (xi < 0 || yi < 0 || xi >= this.w || yi >= this.h) return;
		this.cells[yi * this.w + xi] = r;
	}

	get(x: number, y: number): RampKey | null {
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
		return this.cells[y * this.w + x] ?? null;
	}

	rect(x: number, y: number, w: number, h: number, r: RampKey): this {
		for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, r);
		return this;
	}

	ellipse(cx: number, cy: number, rx: number, ry: number, r: RampKey): this {
		for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
			for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
				const dx = (x - cx) / rx;
				const dy = (y - cy) / ry;
				if (dx * dx + dy * dy <= 1) this.set(x, y, r);
			}
		}
		return this;
	}

	/** Filled polygon (even-odd), points as [x, y] pairs. */
	poly(points: [number, number][], r: RampKey): this {
		const ys = points.map((p) => p[1]);
		for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
			for (let x = 0; x < this.w; x++) {
				let inside = false;
				for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
					const [xi, yi] = points[i] as [number, number];
					const [xj, yj] = points[j] as [number, number];
					if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
						inside = !inside;
				}
				if (inside) this.set(x, y, r);
			}
		}
		return this;
	}

	line(x0: number, y0: number, x1: number, y1: number, r: RampKey, thick = 1): this {
		const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
		for (let s = 0; s <= steps; s++) {
			const x = x0 + ((x1 - x0) * s) / steps;
			const y = y0 + ((y1 - y0) * s) / steps;
			this.rect(
				Math.round(x - (thick - 1) / 2),
				Math.round(y - (thick - 1) / 2),
				thick,
				thick,
				r,
			);
		}
		return this;
	}

	mirror(): this {
		for (let y = 0; y < this.h; y++) {
			for (let x = 0; x < this.w / 2; x++) {
				const a = y * this.w + x;
				const b = y * this.w + (this.w - 1 - x);
				const tmp = this.cells[a] ?? null;
				this.cells[a] = this.cells[b] ?? null;
				this.cells[b] = tmp;
			}
		}
		return this;
	}

	/** Light from the upper left: edges facing it take the light tone, edges facing away the dark one. */
	toRGBA(): Uint8ClampedArray {
		const out = new Uint8ClampedArray(this.w * this.h * 4);
		const put = (i: number, c: number): void => {
			out[i * 4] = (c >> 16) & 255;
			out[i * 4 + 1] = (c >> 8) & 255;
			out[i * 4 + 2] = c & 255;
			out[i * 4 + 3] = 255;
		};
		for (let y = 0; y < this.h; y++) {
			for (let x = 0; x < this.w; x++) {
				const r = this.get(x, y);
				const i = y * this.w + x;
				if (r === null) {
					const n = [
						this.get(x - 1, y),
						this.get(x + 1, y),
						this.get(x, y - 1),
						this.get(x, y + 1),
					];
					if (n.some((v) => v !== null && v !== 'shadow')) put(i, P.ash0);
					continue;
				}
				const ramp = R[r];
				const lit = this.get(x - 1, y) !== r || this.get(x, y - 1) !== r;
				const shaded =
					this.get(x + 1, y) !== r ||
					this.get(x, y + 1) !== r ||
					this.get(x + 1, y + 1) !== r;
				put(i, lit ? ramp[2] : shaded ? ramp[0] : ramp[1]);
			}
		}
		return out;
	}
}

function hero(w: number, h: number, body: RampKey, trim: RampKey, extra: (p: Pix) => void): Pix {
	const p = new Pix(w, h);
	const cx = 30;
	const ground = h - 4;
	p.ellipse(cx + 2, ground + 1, 16, 2, 'shadow');
	p.rect(cx - 7, ground - 18, 5, 18, 'iron').rect(cx + 2, ground - 18, 5, 18, 'iron');
	p.rect(cx - 9, ground - 40, 18, 24, body);
	p.rect(cx - 9, ground - 22, 18, 3, trim);
	p.rect(cx - 13, ground - 38, 5, 16, body).rect(cx + 8, ground - 38, 5, 16, body);
	p.ellipse(cx, ground - 47, 7, 7, 'skin');
	extra(p);
	return p;
}

function humanoidEnemy(
	w: number,
	h: number,
	body: RampKey,
	trim: RampKey,
	extra: (p: Pix) => void,
): Pix {
	const p = hero(w, h, body, trim, extra);
	return p.mirror();
}

const CX = 30;

export const UNIT_SPRITES: Record<string, { w: number; h: number; make: () => Pix }> = {
	'hero.shieldbearer': {
		w: 64,
		h: 80,
		make: () =>
			hero(64, 80, 'iron', 'gold', (p) => {
				p.rect(CX - 8, 22, 16, 9, 'iron').rect(CX - 2, 26, 9, 2, 'shadow');
				p.rect(CX + 10, 34, 13, 34, 'iron').rect(CX + 15, 40, 3, 22, 'gold');
			}),
	},
	'hero.marksman': {
		w: 64,
		h: 80,
		make: () =>
			hero(64, 80, 'rot', 'bone', (p) => {
				p.poly(
					[
						[CX - 9, 22],
						[CX + 9, 22],
						[CX + 4, 16],
						[CX - 6, 16],
					],
					'rot',
				);
				p.line(CX + 8, 46, CX + 28, 46, 'bone', 2).line(
					CX + 22,
					38,
					CX + 22,
					54,
					'iron',
					2,
				);
			}),
	},
	'hero.arcanist': {
		w: 64,
		h: 80,
		make: () =>
			hero(64, 80, 'rift', 'ember', (p) => {
				p.poly(
					[
						[CX - 12, 76],
						[CX + 12, 76],
						[CX + 7, 36],
						[CX - 7, 36],
					],
					'rift',
				);
				p.poly(
					[
						[CX - 8, 26],
						[CX + 8, 26],
						[CX, 12],
					],
					'rift',
				);
				p.line(CX + 15, 14, CX + 15, 74, 'ash', 2).ellipse(CX + 15, 12, 4, 4, 'flame');
			}),
	},
	'hero.confessor': {
		w: 64,
		h: 80,
		make: () =>
			hero(64, 80, 'bone', 'gold', (p) => {
				p.poly(
					[
						[CX - 12, 76],
						[CX + 12, 76],
						[CX + 9, 36],
						[CX - 9, 36],
					],
					'bone',
				);
				p.ellipse(CX, 28, 8, 6, 'ash');
				p.line(CX + 12, 44, CX + 18, 56, 'gold').ellipse(CX + 19, 60, 4, 4, 'gold');
			}),
	},
	'hero.bombardier': {
		w: 64,
		h: 80,
		make: () =>
			hero(64, 80, 'ember', 'iron', (p) => {
				p.rect(CX - 6, 24, 12, 4, 'iron');
				p.line(CX - 8, 40, CX + 26, 30, 'iron', 6).ellipse(CX + 27, 30, 3, 4, 'shadow');
			}),
	},
	'enemy.husk_penitent': {
		w: 64,
		h: 80,
		make: () =>
			humanoidEnemy(64, 80, 'stone', 'ash', (p) => {
				p.line(CX - 8, 44, CX + 10, 60, 'iron').line(CX + 10, 60, CX + 14, 70, 'iron');
				p.rect(CX - 3, 31, 2, 2, 'eye');
			}),
	},
	'enemy.ash_acolyte': {
		w: 64,
		h: 80,
		make: () =>
			humanoidEnemy(64, 80, 'ash', 'ember', (p) => {
				p.poly(
					[
						[CX - 11, 76],
						[CX + 11, 76],
						[CX + 8, 36],
						[CX - 8, 36],
					],
					'ash',
				);
				p.poly(
					[
						[CX - 9, 28],
						[CX + 9, 28],
						[CX, 14],
					],
					'ash',
				);
				p.ellipse(CX + 13, 46, 3, 3, 'flame').ellipse(CX - 13, 46, 3, 3, 'flame');
			}),
	},
	'enemy.wax_mourner': {
		w: 64,
		h: 80,
		make: () =>
			humanoidEnemy(64, 80, 'bone', 'gold', (p) => {
				p.poly(
					[
						[CX - 12, 76],
						[CX + 12, 76],
						[CX + 6, 26],
						[CX - 6, 26],
					],
					'bone',
				);
				p.rect(CX - 2, 12, 4, 12, 'bone').ellipse(CX, 9, 2, 4, 'flame');
			}),
	},
	'enemy.rust_templar': {
		w: 64,
		h: 80,
		make: () =>
			humanoidEnemy(64, 80, 'ember', 'iron', (p) => {
				p.rect(CX - 8, 22, 16, 10, 'iron').rect(CX - 1, 24, 2, 7, 'shadow');
				p.line(CX + 12, 70, CX + 22, 18, 'iron', 3).rect(CX + 9, 48, 10, 3, 'gold');
			}),
	},
	'enemy.chitter_swarm': {
		w: 48,
		h: 48,
		make: () => {
			const p = new Pix(48, 48);
			p.ellipse(24, 44, 18, 2, 'shadow');
			for (const [x, y, s] of [
				[14, 36, 7],
				[30, 38, 8],
				[22, 26, 6],
			] as const) {
				p.ellipse(x, y, s, s * 0.7, 'rot');
				p.line(x - s, y + 2, x - s - 3, y + 5, 'ash').line(
					x + s,
					y + 2,
					x + s + 3,
					y + 5,
					'ash',
				);
				p.rect(x - s + 2, y - 1, 2, 2, 'eye');
			}
			return p;
		},
	},
	'enemy.lantern_leech': {
		w: 48,
		h: 48,
		make: () => {
			const p = new Pix(48, 48);
			p.ellipse(24, 45, 12, 2, 'shadow');
			p.ellipse(20, 28, 14, 7, 'rift').ellipse(34, 24, 6, 6, 'rift');
			p.ellipse(10, 32, 5, 5, 'flame').rect(8, 22, 4, 6, 'iron');
			p.rect(36, 22, 2, 2, 'eye');
			return p.mirror();
		},
	},
	'enemy.graft_hound': {
		w: 80,
		h: 64,
		make: () => {
			const p = new Pix(80, 64);
			p.ellipse(40, 60, 28, 2, 'shadow');
			p.ellipse(38, 36, 22, 11, 'blood');
			p.rect(22, 42, 5, 16, 'blood').rect(50, 42, 5, 16, 'blood');
			p.ellipse(62, 30, 10, 8, 'blood').rect(68, 32, 8, 4, 'bone');
			p.rect(30, 28, 16, 4, 'iron').rect(64, 27, 2, 2, 'eye');
			return p.mirror();
		},
	},
	'enemy.choir_thing': {
		w: 80,
		h: 112,
		make: () => {
			const p = new Pix(80, 112);
			p.ellipse(40, 108, 26, 2, 'shadow');
			p.poly(
				[
					[18, 106],
					[62, 106],
					[52, 20],
					[28, 20],
				],
				'rift',
			);
			for (let i = 0; i < 4; i++) {
				p.ellipse(40 + (i % 2 ? 6 : -6), 30 + i * 18, 7, 6, 'bone');
				p.rect(36 + (i % 2 ? 6 : -6), 32 + i * 18, 8, 2, 'shadow');
			}
			return p;
		},
	},
	'enemy.ossified_brute': {
		w: 80,
		h: 112,
		make: () => {
			const p = new Pix(80, 112);
			p.ellipse(40, 108, 30, 3, 'shadow');
			p.rect(24, 76, 10, 30, 'bone').rect(46, 76, 10, 30, 'bone');
			p.ellipse(40, 56, 26, 26, 'bone');
			p.rect(10, 44, 10, 40, 'bone').rect(60, 44, 10, 40, 'bone');
			p.ellipse(40, 24, 10, 9, 'stone').rect(34, 22, 3, 3, 'eye');
			p.line(22, 50, 58, 50, 'stone').line(22, 60, 58, 60, 'stone');
			return p.mirror();
		},
	},
	'enemy.rift_stalker': {
		w: 80,
		h: 112,
		make: () => {
			const p = new Pix(80, 112);
			p.ellipse(40, 108, 22, 2, 'shadow');
			p.line(34, 104, 38, 70, 'rot', 4).line(48, 104, 44, 70, 'rot', 4);
			p.poly(
				[
					[30, 72],
					[52, 72],
					[48, 34],
					[34, 34],
				],
				'rot',
			);
			p.ellipse(41, 26, 7, 9, 'rot').rect(37, 24, 2, 2, 'eye');
			p.line(32, 40, 18, 70, 'rot', 3).line(18, 70, 12, 78, 'bone');
			p.line(50, 40, 60, 66, 'rot', 3).line(60, 66, 66, 72, 'bone');
			return p.mirror();
		},
	},
	'enemy.bell_maw': {
		w: 160,
		h: 144,
		make: () => {
			const p = new Pix(160, 144);
			p.ellipse(80, 140, 64, 3, 'shadow');
			p.poly(
				[
					[80, 8],
					[100, 18],
					[124, 120],
					[36, 120],
					[60, 18],
				],
				'gold',
			);
			p.rect(74, 2, 12, 8, 'iron');
			p.ellipse(80, 118, 46, 14, 'blood');
			for (let i = 0; i < 9; i++)
				p.poly(
					[
						[48 + i * 8, 110],
						[54 + i * 8, 110],
						[51 + i * 8, 122],
					],
					'bone',
				);
			for (let i = 0; i < 4; i++) p.line(40 + i * 26, 128, 30 + i * 30, 140, 'rift', 3);
			p.rect(70, 50, 4, 4, 'eye').rect(86, 50, 4, 4, 'eye');
			p.line(60, 70, 100, 70, 'gold').line(56, 90, 104, 90, 'gold');
			return p;
		},
	},
};

export function spriteCanvas(key: string): HTMLCanvasElement | null {
	const spec = UNIT_SPRITES[key];
	if (!spec || typeof document === 'undefined') return null;
	const pix = spec.make();
	const canvas = document.createElement('canvas');
	canvas.width = spec.w;
	canvas.height = spec.h;
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	ctx.putImageData(new ImageData(pix.toRGBA(), spec.w, spec.h), 0, 0);
	return canvas;
}

// ---------- backgrounds (docs/art-bible.md §4: background inks only, no unit/UI accents) ----------

/** Deterministic hash noise so backgrounds are identical every session. */
function noise(x: number, y: number, seed: number): number {
	let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
	h = (h ^ (h >>> 13)) * 1274126177;
	return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function fillBg(data: Uint8ClampedArray, w: number, x: number, y: number, c: number): void {
	const i = (y * w + x) * 4;
	data[i] = (c >> 16) & 255;
	data[i + 1] = (c >> 8) & 255;
	data[i + 2] = c & 255;
	data[i + 3] = 255;
}

/** Ruined nave: back wall bands, pillars and arches, Rift glow low in the centre, ordered dither. */
function nave(w: number, h: number, seed: number, rift: number): Uint8ClampedArray {
	const data = new Uint8ClampedArray(w * h * 4);
	const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const t = y / h;
			const d = (bayer[(y % 4) * 4 + (x % 4)] ?? 0) / 16;
			let c: number = t + d * 0.15 < 0.45 ? P.ash1 : t + d * 0.15 < 0.8 ? P.ash2 : P.ash1;
			// Pillars every 96 px with arches between them.
			const px = (x + 24) % 96;
			const pillar = px < 14;
			const archY = 70 + Math.abs(px - 55) * 0.9;
			if (pillar && y > 40) c = px < 3 ? P.ash3 : px > 11 ? P.ash1 : P.ash2;
			else if (!pillar && y < archY && y > 30) c = P.iron0;
			if (!pillar && y < archY && y > archY - 3 && y > 30) c = P.ash3;
			// Rift glow near the floor centre.
			const gx = (x - w / 2) / (w * 0.35);
			const gy = (y - h * 0.85) / (h * 0.25);
			const glow = 1 - (gx * gx + gy * gy);
			if (glow > 0.55 + d * 0.3) c = rift === 0 ? P.rift0 : P.rot0;
			if (y > h * 0.86) c = noise(x >> 2, y >> 2, seed) > 0.85 ? P.ash3 : P.ash2;
			if (noise(x, y, seed) > 0.995 && y < h * 0.8) c = P.ash3;
			fillBg(data, w, x, y, c);
		}
	}
	return data;
}

const BACKGROUNDS: Record<string, (w: number, h: number) => Uint8ClampedArray> = {
	'bg.combat.act1': (w, h) => nave(w, h, 7, 0),
	'bg.title': (w, h) => nave(w, h, 3, 1),
	'bg.menu': (w, h) => nave(w, h, 5, 0),
	'bg.map.act1': (w, h) => nave(w, h, 11, 1),
};

export const BACKGROUND_KEYS = Object.keys(BACKGROUNDS);

export function backgroundCanvas(key: string, w = 640, h = 360): HTMLCanvasElement | null {
	const make = BACKGROUNDS[key];
	if (!make || typeof document === 'undefined') return null;
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	ctx.putImageData(new ImageData(make(w, h), w, h), 0, 0);
	return canvas;
}
