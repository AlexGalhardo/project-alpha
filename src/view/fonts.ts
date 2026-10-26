// UI type (ADR 0015): Roboto from Google Fonts, rendered as Phaser Text at the camera zoom so it stays
// crisp at 1920×1080. Sizes are in the 640×360 layout space.

export type FontToken = 'tiny' | 'ui' | 'h2' | 'h1' | 'display';

export const FONT_FAMILY = 'Roboto, "Segoe UI", Arial, sans-serif';

export const FONT_PX: Record<FontToken, number> = { tiny: 7, ui: 9, h2: 14, h1: 20, display: 26 };

export const FONT_WEIGHT: Record<FontToken, string> = {
	tiny: '400',
	ui: '500',
	h2: '700',
	h1: '700',
	display: '700',
};

/** Resolves once Roboto is ready (or after `timeoutMs`), so Text measures with the real font. */
export function waitForFonts(timeoutMs = 3000): Promise<void> {
	if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
	const loads = Promise.all(
		['400', '500', '700'].map((w) => document.fonts.load(`${w} 16px Roboto`)),
	).then(() => undefined);
	const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
	// A blocked or offline font CDN must not stop the game: fall back to the system font.
	return Promise.race([loads.catch(() => undefined), timeout]);
}
