import Phaser from 'phaser';
import { play } from './audio';
import { type FontToken, fontKey, fontSize } from './fonts';
import { css, P, type PaletteKey } from './palette';

export type { FontToken } from './fonts';

/**
 * 1-bit BitmapText (fonts built at boot, src/view/fonts.ts) with the few Text-style helpers the
 * scenes use, so callers stay the same. Colour is a tint on white glyphs.
 */
export class PixelText extends Phaser.GameObjects.BitmapText {
	setWordWrapWidth(width: number): this {
		return this.setMaxWidth(width);
	}

	setAlign(align: 'left' | 'center' | 'right'): this {
		if (align === 'center') return this.setCenterAlign();
		if (align === 'right') return this.setRightAlign();
		return this.setLeftAlign();
	}

	setColor(color: string): this {
		return this.setTint(Number.parseInt(color.replace('#', ''), 16));
	}
}

export function label(
	scene: Phaser.Scene,
	x: number,
	y: number,
	text: string,
	font: FontToken = 'ui',
	color: PaletteKey = 'bone2',
): PixelText {
	const t = new PixelText(scene, x, y, fontKey(font), text, fontSize(scene, font));
	scene.add.existing(t);
	return t.setOrigin(0, 0).setTint(P[color]);
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
	/** Sound on activation; primary buttons confirm, back buttons cancel. */
	sfx?: string;
}

/** Hover-free button: pressed state on pointerdown, action on pointerup inside (docs/art-bible.md §9.2). */
export class Button extends Phaser.GameObjects.Container {
	private readonly bg: Phaser.GameObjects.Graphics;
	private readonly text: PixelText;
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
		let text = label(scene, this.w / 2, this.h / 2, caption, opts.font ?? 'ui').setOrigin(0.5);
		// Long captions (PT-BR) drop to the tiny font instead of overflowing the button.
		if (text.width > this.w - 6 && (opts.font ?? 'ui') === 'ui') {
			text.destroy();
			text = label(scene, this.w / 2, this.h / 2, caption, 'tiny').setOrigin(0.5);
		}
		this.text = text;
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
				play(scene, opts.sfx ?? 'sfx.ui.tap');
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

/** Full-screen background (src/view/pixelgen.ts keys) behind everything, with an optional dim layer. */
interface Bounds {
	top: number;
	bottom: number;
	cx: number;
	/** Mean x of the top rows: the head of a humanoid or a beast. */
	headX: number;
}

const opaqueCache = new Map<string, Bounds>();
const HEAD_ROWS = 16;

/** Top and bottom rows and horizontal centre of the opaque pixels of a texture (cached per key). */
function opaqueBounds(scene: Phaser.Scene, key: string): Bounds {
	const hit = opaqueCache.get(key);
	if (hit) return hit;
	const src = scene.textures.get(key).getSourceImage();
	let top = -1;
	let bottom = -1;
	let minX = src.width;
	let maxX = -1;
	let headSum = 0;
	let headN = 0;
	for (let y = 0; y < src.height; y++) {
		for (let x = 0; x < src.width; x++) {
			if ((scene.textures.getPixelAlpha(x, y, key) ?? 0) === 0) continue;
			if (top < 0) top = y;
			bottom = y;
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			if (y < top + HEAD_ROWS) {
				headSum += x;
				headN += 1;
			}
		}
	}
	const out: Bounds =
		top < 0
			? {
					top: 0,
					bottom: src.height - 1,
					cx: Math.floor(src.width / 2),
					headX: Math.floor(src.width / 2),
				}
			: {
					top,
					bottom,
					cx: Math.floor((minX + maxX) / 2),
					headX: Math.round(headSum / headN),
				};
	opaqueCache.set(key, out);
	return out;
}

/**
 * A w×h window of a sprite at 1× (art rules forbid fractional scale), taken from the top of its
 * opaque area so small slots show the head and shoulders. (x, y) is the window's top-left corner.
 */
export function portrait(
	scene: Phaser.Scene,
	key: string,
	x: number,
	y: number,
	w: number,
	h: number,
): Phaser.GameObjects.Image {
	const b = opaqueBounds(scene, key);
	const left = Math.max(0, b.headX - Math.floor(w / 2));
	return scene.add
		.image(x - left, y - b.top, key)
		.setOrigin(0)
		.setCrop(left, b.top, w, h);
}

/** A unit sprite at 1× whose opaque feet rest on `floorY` and whose opaque centre sits on `cx`. */
export function standing(
	scene: Phaser.Scene,
	key: string,
	cx: number,
	floorY: number,
): Phaser.GameObjects.Image {
	const b = opaqueBounds(scene, key);
	return scene.add.image(cx - b.cx, floorY - b.bottom - 1, key).setOrigin(0);
}

export function backdrop(scene: Phaser.Scene, key: string, dim = 0): void {
	if (!scene.textures.exists(key)) return;
	scene.add.image(0, 0, key).setOrigin(0).setDepth(-2);
	if (dim > 0) scene.add.rectangle(0, 0, 640, 360, P.ash0, dim).setOrigin(0).setDepth(-1);
}
