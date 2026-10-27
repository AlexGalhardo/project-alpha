import type Phaser from 'phaser';
import { P } from './palette';
import { BACKGROUND_KEYS, backgroundCanvas, spriteCanvas } from './pixelgen';

// Procedural placeholders with the final keys and canvas sizes of docs/art-bible.md §7, so the
// swap to real pixel art never touches logic (.claude/rules/assets.md). Each silhouette differs
// by shape, not only by colour.

type Draw = (g: Phaser.GameObjects.Graphics, w: number, h: number) => void;

interface Spec {
	key: string;
	w: number;
	h: number;
	draw: Draw;
}

function humanoid(body: number, trim: number, prop: Draw): Draw {
	return (g, w, h) => {
		const cx = Math.floor(w / 2);
		const foot = h - 4;
		g.fillStyle(P.ash0).fillRect(cx - 13, foot - 50, 26, 50);
		g.fillStyle(body).fillRect(cx - 12, foot - 49, 24, 48);
		g.fillStyle(trim).fillRect(cx - 12, foot - 30, 24, 4);
		g.fillStyle(P.ash0).fillCircle(cx, foot - 58, 10);
		g.fillStyle(P.bone1).fillCircle(cx, foot - 58, 9);
		g.fillStyle(P.ash1).fillRect(cx - 9, foot - 60, 18, 4);
		prop(g, w, h);
	};
}

const HEROES: Spec[] = [
	{
		key: 'hero.shieldbearer',
		w: 64,
		h: 80,
		draw: humanoid(P.iron1, P.gold1, (g, w, h) => {
			g.fillStyle(P.ash0).fillRect(w / 2 + 8, h - 52, 18, 34);
			g.fillStyle(P.iron2).fillRect(w / 2 + 9, h - 51, 16, 32);
			g.fillStyle(P.gold2).fillRect(w / 2 + 15, h - 44, 4, 18);
		}),
	},
	{
		key: 'hero.marksman',
		w: 64,
		h: 80,
		draw: humanoid(P.rot0, P.bone0, (g, w, h) => {
			g.lineStyle(2, P.bone0).strokeCircle(w / 2 + 16, h - 34, 14);
			g.fillStyle(P.ash1).fillRect(w / 2 - 2, h - 34, 30, 2);
		}),
	},
	{
		key: 'hero.arcanist',
		w: 64,
		h: 80,
		draw: humanoid(P.rift1, P.ember2, (g, w, h) => {
			g.fillStyle(P.ash0).fillRect(w / 2 + 14, h - 70, 4, 66);
			g.fillStyle(P.ember3).fillCircle(w / 2 + 16, h - 72, 5);
		}),
	},
	{
		key: 'hero.confessor',
		w: 64,
		h: 80,
		draw: humanoid(P.bone1, P.gold1, (g, w, h) => {
			g.fillStyle(P.gold1).fillRect(w / 2 + 16, h - 46, 3, 14);
			g.fillStyle(P.gold2).fillCircle(w / 2 + 17, h - 30, 5);
			g.fillStyle(P.ash1).fillTriangle(w / 2 - 12, h - 4, w / 2 + 12, h - 4, w / 2, h - 28);
		}),
	},
	{
		key: 'hero.bombardier',
		w: 64,
		h: 80,
		draw: humanoid(P.ember1, P.iron2, (g, w, h) => {
			g.fillStyle(P.ash0).fillRect(w / 2 - 4, h - 50, 32, 12);
			g.fillStyle(P.iron0).fillRect(w / 2 - 3, h - 49, 30, 10);
			g.fillStyle(P.ash0).fillCircle(w / 2 + 28, h - 44, 4);
		}),
	},
];

function blob(body: number, accent: number, spikes: number): Draw {
	return (g, w, h) => {
		const cx = w / 2;
		const cy = h * 0.6;
		const rx = w * 0.42;
		const ry = h * 0.36;
		g.fillStyle(P.ash0).fillEllipse(cx, cy, rx * 2 + 2, ry * 2 + 2);
		g.fillStyle(body).fillEllipse(cx, cy, rx * 2, ry * 2);
		for (let i = 0; i < spikes; i++) {
			const a = Math.PI + (i / Math.max(1, spikes - 1)) * Math.PI;
			const x = cx + Math.cos(a) * rx;
			const y = cy + Math.sin(a) * ry;
			g.fillStyle(accent).fillTriangle(x - 3, y, x + 3, y, x, y - 8);
		}
		g.fillStyle(P.rot2).fillRect(cx - 8, cy - 4, 3, 3);
		g.fillStyle(P.rot2).fillRect(cx - 14, cy - 4, 3, 3);
	};
}

function tall(body: number, accent: number): Draw {
	return (g, w, h) => {
		const cx = w / 2;
		g.fillStyle(P.ash0).fillRect(cx - 17, 10, 34, h - 14);
		g.fillStyle(body).fillRect(cx - 16, 11, 32, h - 16);
		g.fillStyle(accent).fillRect(cx - 16, 24, 32, 4);
		g.fillStyle(accent).fillRect(cx - 24, 30, 8, 30);
		g.fillStyle(P.rot2).fillRect(cx - 10, 16, 4, 3);
	};
}

function enemy(key: string, w: number, h: number, draw: Draw): Spec {
	return { key: `enemy.${key}`, w, h, draw };
}

const ENEMIES: Spec[] = [
	enemy(
		'husk_penitent',
		64,
		80,
		humanoid(P.bone0, P.ash3, () => undefined),
	),
	enemy('chitter_swarm', 48, 48, blob(P.rot1, P.ash4, 5)),
	enemy(
		'ash_acolyte',
		64,
		80,
		humanoid(P.ash3, P.ember2, () => undefined),
	),
	enemy('graft_hound', 80, 64, blob(P.blood1, P.bone1, 3)),
	enemy('wax_mourner', 64, 80, tall(P.bone1, P.gold1)),
	enemy(
		'rust_templar',
		64,
		80,
		humanoid(P.ember1, P.iron0, () => undefined),
	),
	enemy('lantern_leech', 48, 48, blob(P.rift1, P.ember3, 2)),
	enemy('choir_thing', 80, 112, tall(P.rift1, P.rift2)),
	enemy('ossified_brute', 80, 112, tall(P.bone0, P.ash5)),
	enemy('rift_stalker', 80, 112, tall(P.rot0, P.rot2)),
	// Act 3 (docs/gdd.md §23) until its generated art lands.
	enemy(
		'iron_mourner',
		64,
		80,
		humanoid(P.iron0, P.bone1, () => undefined),
	),
	enemy('grave_cur', 80, 64, blob(P.ash4, P.bone1, 3)),
	enemy(
		'ash_cantor',
		64,
		80,
		humanoid(P.ash3, P.bone2, () => undefined),
	),
	enemy(
		'bronze_scribe',
		64,
		80,
		humanoid(P.gold0, P.ember2, () => undefined),
	),
	enemy('hollow_choir', 80, 112, tall(P.bone0, P.rift2)),
	enemy('sepulchre_knight', 80, 112, tall(P.iron0, P.ash5)),
	enemy('wax_saint', 64, 80, tall(P.bone1, P.ember3)),
	enemy('chain_wraith', 64, 80, tall(P.rift0, P.iron2)),
	enemy(
		'marrow_butcher',
		64,
		80,
		humanoid(P.bone0, P.blood1, () => undefined),
	),
	enemy('rift_spawn', 48, 48, blob(P.rift1, P.rot2, 4)),
	{
		key: 'enemy.rift_mother',
		w: 160,
		h: 144,
		draw: (g, w, h) => {
			g.fillStyle(P.ash0).fillEllipse(w / 2, h / 2 + 8, w - 12, h - 20);
			g.fillStyle(P.iron0).fillEllipse(w / 2, h / 2 + 8, w - 18, h - 26);
			for (let i = 0; i < 6; i++) g.fillStyle(P.bone1).fillRect(20 + i * 22, 24, 6, h - 48);
			g.fillStyle(P.rift2).fillEllipse(w / 2, h / 2 + 10, 44, 56);
			g.fillStyle(P.rift1).fillEllipse(w / 2, h / 2 + 10, 24, 34);
		},
	},
	{
		key: 'enemy.bell_maw',
		w: 160,
		h: 144,
		draw: (g, w, h) => {
			g.fillStyle(P.ash0).fillTriangle(w / 2, 6, 8, h - 10, w - 8, h - 10);
			g.fillStyle(P.gold0).fillTriangle(w / 2, 10, 14, h - 14, w - 14, h - 14);
			g.fillStyle(P.ash0).fillEllipse(w / 2, h - 30, 90, 30);
			g.fillStyle(P.blood1).fillEllipse(w / 2, h - 30, 84, 24);
			for (let i = 0; i < 8; i++)
				g.fillStyle(P.bone2).fillRect(w / 2 - 38 + i * 10, h - 40, 4, 8);
		},
	},
];

function icon(
	key: string,
	size: number,
	color: number,
	shape: 'circle' | 'diamond' | 'square' | 'tri' | 'cross' | 'chest',
): Spec {
	return {
		key,
		w: size,
		h: size,
		draw: (g, w, h) => {
			g.fillStyle(P.ash0);
			const c = w / 2;
			const t = Math.round(w / 3);
			const lid = Math.round(h / 3);
			if (shape === 'circle') g.fillCircle(c, c, c);
			else if (shape === 'square' || shape === 'chest') g.fillRect(0, 0, w, h);
			else if (shape === 'cross') {
				g.fillRect(t, 0, w - 2 * t, h);
				g.fillRect(0, t, w, h - 2 * t);
			} else if (shape === 'tri') g.fillTriangle(0, h, w, h, c, 0);
			else {
				g.fillTriangle(c, 0, w, c, 0, c);
				g.fillTriangle(0, c, w, c, c, h);
			}
			g.fillStyle(color);
			if (shape === 'circle') g.fillCircle(c, c, c - 1);
			else if (shape === 'square') g.fillRect(1, 1, w - 2, h - 2);
			else if (shape === 'cross') {
				g.fillRect(t + 1, 1, w - 2 * t - 2, h - 2);
				g.fillRect(1, t + 1, w - 2, h - 2 * t - 2);
			} else if (shape === 'chest') {
				// Lid and body split by a dark band, with a lock: reads as a chest, not as the shop square.
				g.fillRect(1, 1, w - 2, lid - 1);
				g.fillRect(1, lid + 1, w - 2, h - lid - 2);
				g.fillStyle(P.ash0).fillRect(c - 2, lid - 1, 4, 5);
			} else if (shape === 'tri') g.fillTriangle(2, h - 1, w - 2, h - 1, c, 2);
			else {
				g.fillTriangle(c, 1, w - 1, c, 1, c);
				g.fillTriangle(1, c, w - 1, c, c, h - 1);
			}
		},
	};
}

/**
 * 9×9 status icons drawn pixel by pixel per docs/art-bible.md §7.3: shape + colour, and a
 * chevron in the corner (▲ buff, ▼ debuff) so colour is never the only cue. `#` = colour,
 * `o` = ash0 outline.
 */
function mask(key: string, color: number, rows: string[]): Spec {
	return {
		key,
		w: 9,
		h: 9,
		draw: (g) => {
			rows.forEach((row, y) => {
				[...row].forEach((ch, x) => {
					if (ch === '#') g.fillStyle(color).fillRect(x, y, 1, 1);
					else if (ch === 'o') g.fillStyle(P.ash0).fillRect(x, y, 1, 1);
					else if (ch === '^' || ch === 'v') g.fillStyle(P.bone2).fillRect(x, y, 1, 1);
				});
			});
		},
	};
}

const STATUS_ICONS: Spec[] = [
	mask('icon.status.block', P.ward1, [
		'ooooooo..',
		'o#####o..',
		'o#####o..',
		'o#####o..',
		'o#####o..',
		'.o###o...',
		'..o#o....',
		'...o.....',
		'.........',
	]),
	mask('icon.status.might', P.gold2, [
		'.ooooo.^.',
		'o#####o^^',
		'o#o#o#o..',
		'o#####o..',
		'o#####o..',
		'.o###o...',
		'.o###o...',
		'.ooooo...',
		'.........',
	]),
	mask('icon.status.ward', P.bone2, [
		'..ooo..^.',
		'.o###o.^^',
		'o#ooo#o..',
		'o#o#o#o..',
		'o#ooo#o..',
		'.o###o...',
		'..ooo....',
		'.........',
		'.........',
	]),
	mask('icon.status.marked', P.ember3, [
		'...o.....',
		'..o#o....',
		'.oo#oo...',
		'o##o##o..',
		'.oo#oo...',
		'..o#o....',
		'...o...vv',
		'.......v.',
		'.........',
	]),
	mask('icon.status.weakened', P.ash5, [
		'......o..',
		'.....o#o.',
		'....o#o..',
		'...o#o...',
		'..o.o....',
		'.o#o.....',
		'o#o....vv',
		'.o.....v.',
		'.........',
	]),
	mask('icon.status.bleed', P.blood2, [
		'...o.....',
		'..o#o....',
		'..o#o....',
		'.o###o...',
		'o#####o..',
		'o#####o..',
		'.o###o.vv',
		'..ooo..v.',
		'.........',
	]),
	mask('icon.status.burn', P.ember2, [
		'..o......',
		'.o#o.o...',
		'.o#oo#o..',
		'o###o#o..',
		'o#####o..',
		'o#####o..',
		'.o###o.vv',
		'..ooo..v.',
		'.........',
	]),
	mask('icon.status.stunned', P.gold1, [
		'.ooooo...',
		'o#####o..',
		'o#ooo#o..',
		'o#o#o#o..',
		'o#o##o...',
		'o#ooo....',
		'.o#####vv',
		'..ooooo v',
		'.........',
	]),
];

const ICONS: Spec[] = [
	...STATUS_ICONS,
	icon('icon.intent.attack', 12, P.blood2, 'tri'),
	icon('icon.intent.block', 12, P.ward1, 'square'),
	icon('icon.intent.buff', 12, P.ember3, 'diamond'),
	icon('icon.intent.debuff', 12, P.rift2, 'diamond'),
	icon('icon.intent.stress', 12, P.rift1, 'circle'),
	icon('icon.intent.telegraph', 12, P.gold2, 'circle'),
	icon('icon.node.combat', 24, P.blood1, 'tri'),
	icon('icon.node.elite', 24, P.gold1, 'diamond'),
	icon('icon.node.rest', 24, P.ember2, 'circle'),
	icon('icon.node.shop', 24, P.gold2, 'square'),
	icon('icon.node.boss', 24, P.rift1, 'diamond'),
	icon('icon.node.event', 24, P.bone2, 'cross'),
	icon('icon.node.treasure', 24, P.ember3, 'chest'),
];

export const PLACEHOLDER_SPECS: readonly Spec[] = [...HEROES, ...ENEMIES, ...ICONS];

export function generatePlaceholders(scene: Phaser.Scene): void {
	for (const key of BACKGROUND_KEYS) {
		const bg = scene.textures.exists(key) ? null : backgroundCanvas(key);
		if (bg) scene.textures.addCanvas(key, bg);
	}
	for (const spec of PLACEHOLDER_SPECS) {
		if (scene.textures.exists(spec.key)) continue;
		const pixel = spriteCanvas(spec.key);
		if (pixel) {
			scene.textures.addCanvas(spec.key, pixel);
			continue;
		}
		const g = scene.make.graphics({}, false);
		spec.draw(g, spec.w, spec.h);
		g.generateTexture(spec.key, spec.w, spec.h);
		g.destroy();
	}
}
