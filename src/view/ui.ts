import Phaser from 'phaser';
import { VIEW_ZOOM } from '../platform/zoom';
import { play } from './audio';
import { FONT_FAMILY, FONT_PX, FONT_WEIGHT, type FontToken } from './fonts';
import { css, P, type PaletteKey } from './palette';
import { PLACEHOLDER_SPECS } from './placeholders';

export type { FontToken } from './fonts';

/** UI text: Roboto via Phaser Text, rendered at the camera zoom so glyphs stay sharp (ADR 0015). */
export type UiText = Phaser.GameObjects.Text;

export function label(
	scene: Phaser.Scene,
	x: number,
	y: number,
	text: string,
	font: FontToken = 'ui',
	color: PaletteKey = 'bone2',
): UiText {
	return scene.add
		.text(x, y, text, {
			fontFamily: FONT_FAMILY,
			fontSize: `${FONT_PX[font]}px`,
			fontStyle: FONT_WEIGHT[font] === '400' ? 'normal' : FONT_WEIGHT[font],
			color: css(color),
			resolution: VIEW_ZOOM,
		})
		.setOrigin(0, 0);
}

/** Every scene lays out in 640×360 and its camera zooms ×3 onto the 1920×1080 render (ADR 0015). */
export function fitCamera(scene: Phaser.Scene): void {
	scene.cameras.main.setZoom(VIEW_ZOOM).centerOn(320, 180);
}

const SPEC_SIZE = new Map(PLACEHOLDER_SPECS.map((s) => [s.key, { w: s.w, h: s.h }]));

/**
 * Logical (640×360-space) size of a texture: generated art may be drawn at 2× or 3× and is shown at
 * this size, so higher-resolution textures add detail instead of growing (ADR 0015).
 */
export function logicalSize(scene: Phaser.Scene, key: string): { w: number; h: number } {
	const spec = SPEC_SIZE.get(key);
	if (spec) return spec;
	if (key.startsWith('bg.')) return { w: 640, h: 360 };
	if (key.startsWith('card.')) return { w: 60, h: 40 };
	if (key.startsWith('icon.item.')) return { w: 16, h: 16 };
	const f = scene.textures.getFrame(key);
	return { w: f?.width ?? 1, h: f?.height ?? 1 };
}

/** Texture pixels per logical pixel for `key` (1 for placeholders, 3 for Full HD art). */
export function texelScale(scene: Phaser.Scene, key: string): number {
	const f = scene.textures.getFrame(key);
	return f ? f.width / logicalSize(scene, key).w : 1;
}

/** An image shown at its logical size whatever the texture resolution. */
export function sized<T extends Phaser.GameObjects.Image>(img: T): T {
	const l = logicalSize(img.scene, img.texture.key);
	return img.setDisplaySize(l.w, l.h);
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
	/** Texture key of a 16x16 icon drawn at the left; the caption is centred in the rest. */
	icon?: string;
}

/** 16x16 equipment icon (`icon.item.<key>`) with its top-left at (x, y), or null when the texture is missing. */
export function itemIcon(
	scene: Phaser.Scene,
	x: number,
	y: number,
	item: string,
): Phaser.GameObjects.Image | null {
	const key = `icon.item.${item}`;
	if (!scene.textures.exists(key)) return null;
	return sized(scene.add.image(x, y, key).setOrigin(0, 0));
}

/** Hover-free button: pressed state on pointerdown, action on pointerup inside (docs/art-bible.md §9.2). */
export class Button extends Phaser.GameObjects.Container {
	private readonly bg: Phaser.GameObjects.Graphics;
	private readonly text: UiText;
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
		const iconKey = opts.icon && scene.textures.exists(opts.icon) ? opts.icon : null;
		const pad = iconKey ? 20 : 0;
		const cx = pad + (this.w - pad) / 2;
		let text = label(scene, cx, this.h / 2, caption, opts.font ?? 'ui').setOrigin(0.5);
		// Long captions (PT-BR) drop to the tiny font instead of overflowing the button.
		if (text.width > this.w - pad - 6 && (opts.font ?? 'ui') === 'ui') {
			text.destroy();
			text = label(scene, cx, this.h / 2, caption, 'tiny').setOrigin(0.5);
		}
		this.text = text;
		this.add([this.bg, this.text]);
		if (iconKey) this.add(sized(scene.add.image(12, Math.round(this.h / 2), iconKey)));
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
 * A w×h (logical) window of a sprite, taken from the top of its opaque area so small slots show the
 * head and shoulders. (x, y) is the window's top-left corner. Works at any texture resolution.
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
	const k = texelScale(scene, key);
	const left = Math.max(0, b.headX - Math.floor((w * k) / 2));
	return scene.add
		.image(x - left / k, y - b.top / k, key)
		.setOrigin(0)
		.setScale(1 / k)
		.setCrop(left, b.top, w * k, h * k);
}

/** A unit sprite at its logical size whose opaque feet rest on `floorY` and opaque centre on `cx`. */
export function standing(
	scene: Phaser.Scene,
	key: string,
	cx: number,
	floorY: number,
): Phaser.GameObjects.Image {
	const b = opaqueBounds(scene, key);
	const k = texelScale(scene, key);
	return scene.add
		.image(cx - b.cx / k, floorY - (b.bottom + 1) / k, key)
		.setOrigin(0)
		.setScale(1 / k);
}

/** Full-scene background shown at 640×360 whatever its texture size, with an optional dim layer. */
export function backdrop(scene: Phaser.Scene, keys: string | string[], dim = 0): void {
	// First key that is loaded (per-act art falls back to Act 1 until it is in the manifest).
	const key = (Array.isArray(keys) ? keys : [keys]).find((k) => scene.textures.exists(k));
	if (!key) return;
	scene.add.image(0, 0, key).setOrigin(0).setDisplaySize(640, 360).setDepth(-2);
	if (dim > 0) scene.add.rectangle(0, 0, 640, 360, P.ash0, dim).setOrigin(0).setDepth(-1);
}
