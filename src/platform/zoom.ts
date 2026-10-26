export const BASE_WIDTH = 640;
export const BASE_HEIGHT = 360;

/** Largest zoom that keeps an integer number of device pixels per game pixel (docs/art-bible.md §3.1). */
export function pickZoom(viewportWidth: number, viewportHeight: number, dpr: number): number {
	const fit = Math.min(viewportWidth / BASE_WIDTH, viewportHeight / BASE_HEIGHT);
	return Math.max(1, Math.floor(fit * dpr)) / dpr;
}
