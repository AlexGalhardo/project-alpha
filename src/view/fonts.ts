import Phaser from 'phaser';

// Runtime 1-bit bitmap fonts (ADR 0010 stand-in): until the Jersey/Tiny5 atlases ship, each UI
// size is rasterised once at boot from the browser's monospace font, thresholded to 1 bit and
// registered as a fixed-width RetroFont. Text stays pixel-exact at any integer zoom.

export type FontToken = 'tiny' | 'ui' | 'h2' | 'h1' | 'display';

export const FONT_PX: Record<FontToken, number> = { tiny: 8, ui: 11, h2: 16, h1: 22, display: 28 };

/** Alpha threshold for 1-bit glyphs. 192 (spike value for pixel fonts) breaks thin strokes of the
 * browser monospace font at 8–11 px; 96 merges the strokes of m/w/M/W into blobs; 144 keeps both legible. */
const ALPHA_THRESHOLD = 144;
const CHARS_PER_ROW = 32;

function charset(): string {
	let s = '';
	for (let c = 0x20; c <= 0x7e; c += 1) s += String.fromCharCode(c);
	for (let c = 0xa0; c <= 0xff; c += 1) s += String.fromCharCode(c);
	// Curly quotes, dashes, ellipsis, bullet + UI symbols: arrow, minus, block square, stress diamond, ×.
	return `${s}‘’“”–—…•→−▪◆×▲▼◀▶`;
}

export const CHARSET = charset();

export function fontKey(token: FontToken): string {
	return `font.${token}`;
}

function buildOne(scene: Phaser.Scene, token: FontToken): void {
	const key = fontKey(token);
	if (scene.cache.bitmapFont.exists(key)) return;
	const px = FONT_PX[token];
	const font = `${px}px monospace`;
	const probe = document.createElement('canvas').getContext('2d');
	if (!probe) return;
	probe.font = font;
	const cellW = Math.max(1, Math.ceil(probe.measureText('M').width));
	const up = probe.measureText('ÁÂÃÉÊÍÓÔÕÚÇ|');
	const down = probe.measureText('gjpqyçÇ|');
	const ascent = Math.ceil(up.actualBoundingBoxAscent);
	const cellH = ascent + Math.ceil(down.actualBoundingBoxDescent) + 1;
	const rows = Math.ceil(CHARSET.length / CHARS_PER_ROW);
	const canvas = document.createElement('canvas');
	canvas.width = cellW * CHARS_PER_ROW;
	canvas.height = cellH * rows;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return;
	ctx.font = font;
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = '#ffffff';
	for (let i = 0; i < CHARSET.length; i += 1) {
		const x = (i % CHARS_PER_ROW) * cellW;
		const y = Math.floor(i / CHARS_PER_ROW) * cellH;
		ctx.save();
		ctx.beginPath();
		ctx.rect(x, y, cellW, cellH);
		ctx.clip();
		ctx.fillText(CHARSET.charAt(i), x, y + ascent);
		ctx.restore();
	}
	const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const d = img.data;
	for (let i = 0; i < d.length; i += 4) {
		const on = (d[i + 3] ?? 0) >= ALPHA_THRESHOLD;
		d[i] = 255;
		d[i + 1] = 255;
		d[i + 2] = 255;
		d[i + 3] = on ? 255 : 0;
	}
	ctx.putImageData(img, 0, 0);
	if (scene.textures.exists(key)) scene.textures.remove(key);
	scene.textures.addCanvas(key, canvas);
	// Parse reads offset/spacing as nested paths ('offset.x'); the d.ts lists other fields, hence the cast.
	const config = {
		image: key,
		width: cellW,
		height: cellH,
		chars: CHARSET,
		charsPerRow: CHARS_PER_ROW,
		offset: { x: 0, y: 0 },
		spacing: { x: 0, y: 0 },
		lineSpacing: 0,
	} as unknown as Phaser.Types.GameObjects.BitmapText.RetroFontConfig;
	// Parse already returns the cache entry { data, texture, frame } (Phaser 4 source), despite its d.ts.
	const entry: unknown = Phaser.GameObjects.RetroFont.Parse(scene, config);
	if (!entry) return;
	scene.cache.bitmapFont.add(key, entry);
}

/** Builds every UI font once; call from BootScene before any text is drawn. */
export function buildPixelFonts(scene: Phaser.Scene): void {
	for (const token of Object.keys(FONT_PX) as FontToken[]) buildOne(scene, token);
}

/** Native size of a generated font (BitmapText must be drawn at exactly this size). */
export function fontSize(scene: Phaser.Scene, token: FontToken): number {
	const entry = scene.cache.bitmapFont.get(fontKey(token)) as
		| { data?: { size?: number } }
		| undefined;
	return entry?.data?.size ?? FONT_PX[token];
}
