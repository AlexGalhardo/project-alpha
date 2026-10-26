import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { AUDIO_KEYS } from '../../src/view/audio.ts';

// A listed file that is missing (e.g. not committed) makes the browser log a 404 console error on
// boot, so every requested asset must exist in public/assets.
describe('asset manifest', () => {
	test('every sprite in the manifest exists', () => {
		const names: unknown = JSON.parse(
			readFileSync('public/assets/sprites/manifest.json', 'utf8'),
		);
		expect(Array.isArray(names)).toBe(true);
		const missing = (names as string[]).filter(
			(n) => !existsSync(`public/assets/sprites/${n}.png`),
		);
		expect(missing).toEqual([]);
	});

	test('every audio key has its ogg and mp3 file', () => {
		const missing = AUDIO_KEYS.flatMap((k) =>
			['ogg', 'mp3'].map((ext) => `${k}.${ext}`),
		).filter((f) => !existsSync(`public/assets/audio/${f}`));
		expect(missing).toEqual([]);
	});
});
