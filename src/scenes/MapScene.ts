import Phaser from 'phaser';
import { type MapView, mapView, maxHP } from '../core';
import { app } from '../view/app';
import { t } from '../view/i18n';
import { P } from '../view/palette';
import { goNext, session } from '../view/session';
import { Button, label, panel } from '../view/ui';

/** Column centre for a round (docs/art-bible.md §11.4): x = 40 + (round − 1) × 62. */
const COL_X = (round: number): number => 40 + (round - 1) * 62 + 12;
/** Node centres per row size: 3 nodes at y 88/152/216, 2 at 120/184, 1 (boss) at 152. */
const NODE_Y: Record<number, number[]> = { 1: [152], 2: [120, 184], 3: [88, 152, 216] };
const nodeY = (index: number, count: number): number => NODE_Y[count]?.[index] ?? 152;
const LEGEND = ['combat', 'elite', 'shop', 'rest', 'boss'];

/** Act map: 10 columns left to right, one per round (GDD §4.2, docs/art-bible.md §11.4). */
export class MapScene extends Phaser.Scene {
	private view!: MapView;
	private focus = 0;
	private focusMark: Phaser.GameObjects.Graphics | null = null;

	constructor() {
		super('Map');
	}

	create(): void {
		this.cameras.main.setBackgroundColor('#1b1a22');
		this.focus = 0;
		const state = session.state;
		const view = state ? mapView(state) : null;
		if (!state || !view) {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		this.view = view;

		// Top bar (same as combat, without the turn queue).
		const bar = this.add.graphics();
		bar.fillStyle(P.ash1).fillRect(0, 0, 640, 24);
		bar.fillStyle(P.gold0).fillRect(0, 23, 640, 1);
		const round = Math.min(10, view.currentRow + 1);
		label(this, 8, 6, `${t('hud.act', { act: 1 })} · ${t('hud.round', { round })}`, 'ui');
		label(this, 488, 6, `${t('hud.gold')} ${state.gold}`, 'ui', 'gold2');
		new Button(this, 608, 0, 'II', () => this.openPause(), {
			w: 32,
			h: 24,
			testId: 'map-pause',
		});

		panel(this, 16, 32, 608, 256, 'ash1');
		label(this, 24, 36, t('map.choose'), 'tiny', 'ash5');

		const pos = (row: number, index: number): { x: number; y: number } => {
			const count = view.rows[row - 1]?.length ?? 1;
			return { x: COL_X(row), y: nodeY(index, count) };
		};

		// Paths between rows.
		const g = this.add.graphics();
		for (const row of view.rows) {
			for (const node of row) {
				const a = pos(node.row, node.index);
				for (const ni of node.next) {
					const b = pos(node.row + 1, ni);
					// Gold = the choices leaving the current node; the rest is dotted grey.
					const taken = view.cursor?.row === node.row && view.cursor.index === node.index;
					this.dotted(g, a.x, a.y, b.x, b.y, taken ? P.gold2 : P.ash4, taken);
				}
			}
		}

		const available = new Set(view.available.map((a) => `${a.row}:${a.index}`));
		for (const row of view.rows) {
			for (const node of row) {
				const { x, y } = pos(node.row, node.index);
				const open = available.has(`${node.row}:${node.index}`);
				const isCursor = view.cursor?.row === node.row && view.cursor.index === node.index;
				const r = node.type === 'boss' ? 18 : 14;
				if (open) this.add.circle(x, y, r + 2, P.ember3).setStrokeStyle(1, P.ash0);
				else if (isCursor) this.add.circle(x, y, r + 2, P.bone2).setStrokeStyle(1, P.ash0);
				const img = this.add.image(x, y, `icon.node.${node.type}`);
				if (!open && !isCursor && node.row <= view.currentRow) img.setAlpha(0.35);
				if (open) {
					img.setInteractive().setName(`node-${node.row}-${node.index}`);
					img.on('pointerup', () => this.pick(node.index));
				}
			}
		}
		this.drawFocus();
		this.drawPartyStrip();

		// Legend (bottom right).
		LEGEND.forEach((n, i) => {
			const x = 432 + (i % 3) * 64;
			const y = 300 + Math.floor(i / 3) * 24;
			this.add.image(x + 8, y + 8, `icon.node.${n}`).setScale(0.5);
			label(this, x + 20, y + 2, t(`node.${n}`), 'tiny', 'ash5');
		});

		this.input.keyboard?.on('keydown', (e: KeyboardEvent) => this.onKey(e));
		const onResume = (): void => {
			this.scene.restart();
		};
		this.events.once('resume', onResume);
		this.events.once('shutdown', () => {
			this.events.off('resume', onResume);
			this.focusMark = null;
		});
		const first = view.available[0];
		// Auto battle at 3x also walks the map, so testers can play a whole act unattended.
		if (app.auto && app.speed === 3 && first)
			this.time.delayedCall(app.ms(400), () => this.pick(first.index));
	}

	private dotted(
		g: Phaser.GameObjects.Graphics,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		color: number,
		solid: boolean,
	): void {
		if (solid) {
			g.lineStyle(1, color).lineBetween(x1, y1, x2, y2);
			return;
		}
		const len = Math.hypot(x2 - x1, y2 - y1);
		const steps = Math.floor(len / 4);
		g.fillStyle(color);
		for (let i = 0; i <= steps; i += 1) {
			const k = i / Math.max(1, steps);
			g.fillRect(Math.round(x1 + (x2 - x1) * k), Math.round(y1 + (y2 - y1) * k), 1, 1);
		}
	}

	/** Keyboard focus brackets (docs/art-bible.md §5 `focus`) on the focused available node. */
	private drawFocus(): void {
		this.focusMark?.destroy();
		const target = this.view.available[this.focus];
		if (!target) return;
		const count = this.view.rows[target.row - 1]?.length ?? 1;
		const x = COL_X(target.row);
		const y = nodeY(target.index, count);
		const g = this.add.graphics();
		g.fillStyle(P.ember3);
		const s = 18;
		for (const [dx, dy] of [
			[-1, -1],
			[1, -1],
			[-1, 1],
			[1, 1],
		] as const) {
			const cx = x + dx * s;
			const cy = y + dy * s;
			g.fillRect(dx < 0 ? cx : cx - 3, cy, 4, 1).fillRect(cx, dy < 0 ? cy : cy - 3, 1, 4);
		}
		this.focusMark = g;
	}

	private drawPartyStrip(): void {
		const party = session.state?.party ?? [];
		party.forEach((h, i) => {
			const x = 16 + i * 136;
			const y = 296;
			// 64×80 placeholder at exactly 1/4 scale (integer ratio) until icon.queue.* exists.
			this.add.image(x + 10, y + 12, `hero.${h.id}`).setDisplaySize(16, 20);
			label(this, x + 24, y, t(`hero.${h.id}.name`), 'tiny', 'bone2');
			const max = maxHP(h);
			const bar = this.add.graphics();
			bar.fillStyle(P.ash0).fillRect(x + 23, y + 11, 66, 7);
			bar.fillStyle(P.blood0).fillRect(x + 24, y + 12, 64, 5);
			bar.fillStyle(P.blood2).fillRect(
				x + 24,
				y + 12,
				Math.round((64 * Math.max(0, h.hp)) / Math.max(1, max)),
				5,
			);
			label(this, x + 92, y + 9, `${h.hp}/${max}`, 'tiny', h.injured ? 'blood2' : 'bone2');
			for (let s = 0; s < 10; s += 1)
				bar.fillStyle(s < h.stress ? P.rift2 : P.rift0).fillRect(
					x + 24 + s * 5,
					y + 22,
					4,
					3,
				);
		});
	}

	private onKey(e: KeyboardEvent): void {
		if (!this.scene.isActive()) return;
		const n = this.view.available.length;
		if (n === 0) return;
		if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Tab') {
			e.preventDefault();
			this.focus = (this.focus + 1) % n;
			this.drawFocus();
		} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			this.focus = (this.focus - 1 + n) % n;
			this.drawFocus();
		} else if (e.key === 'Enter' || e.key === ' ') {
			const node = this.view.available[this.focus];
			if (node) this.pick(node.index);
		} else if (e.key >= '1' && e.key <= '3') {
			const node = this.view.available[Number(e.key) - 1];
			if (node) this.pick(node.index);
		} else if (e.key === 'Escape') this.openPause();
	}

	private pick(index: number): void {
		session.send({ type: 'selectNode', index });
		goNext(this);
	}

	private openPause(): void {
		this.scene.pause();
		this.scene.launch('Pause', { returnTo: 'Map' });
	}
}
