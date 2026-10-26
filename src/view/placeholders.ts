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
	shape: 'circle' | 'diamond' | 'square' | 'tri',
): Spec {
	return {
		key,
		w: size,
		h: size,
		draw: (g, w, h) => {
			g.fillStyle(P.ash0);
			const c = w / 2;
			if (shape === 'circle') g.fillCircle(c, c, c);
			else if (shape === 'square') g.fillRect(0, 0, w, h);
			else if (shape === 'tri') g.fillTriangle(0, h, w, h, c, 0);
			else {
				g.fillTriangle(c, 0, w, c, 0, c);
				g.fillTriangle(0, c, w, c, c, h);
			}
			g.fillStyle(color);
			if (shape === 'circle') g.fillCircle(c, c, c - 1);
			else if (shape === 'square') g.fillRect(1, 1, w - 2, h - 2);
			else if (shape === 'tri') g.fillTriangle(2, h - 1, w - 2, h - 1, c, 2);
			else {
				g.fillTriangle(c, 1, w - 1, c, 1, c);
				g.fillTriangle(1, c, w - 1, c, c, h - 1);
			}
		},
	};
}

const ICONS: Spec[] = [
	icon('icon.status.block', 9, P.ward1, 'square'),
	icon('icon.status.might', 9, P.ember3, 'tri'),
	icon('icon.status.marked', 9, P.gold2, 'diamond'),
	icon('icon.status.weakened', 9, P.rift2, 'tri'),
	icon('icon.status.bleed', 9, P.blood2, 'circle'),
	icon('icon.status.burn', 9, P.ember2, 'tri'),
	icon('icon.status.ward', 9, P.ward0, 'diamond'),
	icon('icon.status.stunned', 9, P.ash5, 'circle'),
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
