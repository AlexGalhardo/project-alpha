import Phaser from 'phaser';
import { play } from './audio';
import { css, P, type PaletteKey } from './palette';

// shortcut: Phaser Text (browser-rasterised) until the BitmapText atlases of docs/art-bible.md §8
// are generated; swap these helpers to BitmapText when `font.*` atlases land (PLAN P2.3).
export type FontToken = 'tiny' | 'ui' | 'h2' | 'h1' | 'display';

const FONT_PX: Record<FontToken, number> = { tiny: 8, ui: 11, h2: 16, h1: 22, display: 28 };

export function label(
	scene: Phaser.Scene,
	x: number,
	y: number,
	text: string,
	font: FontToken = 'ui',
	color: PaletteKey = 'bone2',
): Phaser.GameObjects.Text {
	return scene.add
		.text(x, y, text, {
			fontFamily: 'monospace',
			fontSize: `${FONT_PX[font]}px`,
			color: css(color),
			resolution: 1,
		})
		.setOrigin(0, 0);
}

export function panel(
	scene: Phaser.Scene,
	x: number,
	y: number,
	w: number,
	h: number,
	fill: PaletteKey = 'ash2',
	border: PaletteKey = 'ash0',
): Phaser.GameObjects.Graphics {
	const g = scene.add.graphics();
	g.fillStyle(P[border]).fillRect(x, y, w, h);
	g.fillStyle(P[fill]).fillRect(x + 1, y + 1, w - 2, h - 2);
	g.fillStyle(P.ash4).fillRect(x + 1, y + 1, w - 2, 1);
	g.fillStyle(P.ash1).fillRect(x + 1, y + h - 2, w - 2, 1);
	return g;
}

export interface ButtonOptions {
	w?: number;
	h?: number;
	font?: FontToken;
	danger?: boolean;
	testId?: string;
}

/** Hover-free button: pressed state on pointerdown, action on pointerup inside (docs/art-bible.md §9.2). */
export class Button extends Phaser.GameObjects.Container {
	private readonly bg: Phaser.GameObjects.Graphics;
	private readonly text: Phaser.GameObjects.Text;
	private enabled = true;
	private selected = false;
	readonly w: number;
	readonly h: number;
	private readonly danger: boolean;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		caption: string,
		onClick: () => void,
		opts: ButtonOptions = {},
	) {
		super(scene, x, y);
		this.w = opts.w ?? 120;
		this.h = opts.h ?? 28;
		this.danger = opts.danger ?? false;
		this.bg = scene.add.graphics();
		this.text = label(scene, this.w / 2, this.h / 2, caption, opts.font ?? 'ui').setOrigin(0.5);
		this.add([this.bg, this.text]);
		this.setSize(this.w, this.h);
		this.setInteractive(
			new Phaser.Geom.Rectangle(this.w / 2, this.h / 2, this.w, this.h),
			Phaser.Geom.Rectangle.Contains,
		);
		if (opts.testId) this.setName(opts.testId);
		this.on('pointerdown', () => this.enabled && this.draw(true));
		this.on('pointerout', () => this.draw(false));
		this.on('pointerup', () => {
			this.draw(false);
			if (this.enabled) {
				play(scene, 'sfx.ui.tap');
				onClick();
			}
		});
		this.draw(false);
		scene.add.existing(this);
	}

	setCaption(caption: string): this {
		this.text.setText(caption);
		return this;
	}

	setEnabled(enabled: boolean): this {
		this.enabled = enabled;
		this.draw(false);
		return this;
	}

	setSelected(selected: boolean): this {
		this.selected = selected;
		this.draw(false);
		return this;
	}

	private draw(pressed: boolean): void {
		const g = this.bg;
		g.clear();
		const fill = !this.enabled ? P.ash3 : this.danger ? P.blood1 : pressed ? P.iron0 : P.iron1;
		const edge = this.selected ? P.gold2 : P.ash0;
		g.fillStyle(edge).fillRect(0, 0, this.w, this.h);
		g.fillStyle(fill).fillRect(1, 1, this.w - 2, this.h - 2);
		if (!pressed && this.enabled) g.fillStyle(P.iron2).fillRect(1, 1, this.w - 2, 1);
		this.text.setColor(this.enabled ? css('bone2') : css('ash5'));
		this.text.setY(this.h / 2 + (pressed ? 1 : 0));
	}
}
