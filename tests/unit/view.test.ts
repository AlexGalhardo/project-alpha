import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
	BASE_HEIGHT,
	BASE_WIDTH,
	RENDER_HEIGHT,
	RENDER_WIDTH,
	VIEW_ZOOM,
} from '../../src/platform/zoom';
import { detectLocale, getLocale, setLocale, t } from '../../src/view/i18n';
import { defaultSettings, loadSettings, type Settings } from '../../src/view/settings';

const KEY = 'ossuary.settings.v1';

function stubLocalStorage(): Map<string, string> {
	const store = new Map<string, string>();
	const stub = {
		getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
		setItem: (k: string, v: string) => {
			store.set(k, String(v));
		},
		removeItem: (k: string) => {
			store.delete(k);
		},
		clear: () => store.clear(),
	};
	Object.defineProperty(globalThis, 'localStorage', { value: stub, configurable: true });
	return store;
}

describe('render size (ADR 0015)', () => {
	test('1920×1080 render is the 640×360 layout at an integer camera zoom', () => {
		expect([RENDER_WIDTH, RENDER_HEIGHT]).toEqual([1920, 1080]);
		expect(RENDER_WIDTH / BASE_WIDTH).toBe(VIEW_ZOOM);
		expect(RENDER_HEIGHT / BASE_HEIGHT).toBe(VIEW_ZOOM);
	});
});

describe('t() lookup (ADR 0009)', () => {
	beforeEach(() => setLocale('en'));
	afterEach(() => setLocale('en'));

	test('looks up a dotted key', () => {
		expect(t('hud.endTurn')).toBe('End turn');
	});

	test('fills {name} placeholders', () => {
		expect(t('hud.round', { round: 4 })).toBe('Round 4/10');
	});

	test('leaves a placeholder unfilled when no value is given', () => {
		expect(t('hud.round')).toBe('Round {round}/10');
	});

	test('a missing key returns the key itself', () => {
		expect(t('does.not.exist')).toBe('does.not.exist');
	});

	test('a key that points at an object (not a string) returns the key itself', () => {
		expect(t('hud')).toBe('hud');
	});

	test('switching locale changes the table used', () => {
		setLocale('pt-BR');
		expect(getLocale()).toBe('pt-BR');
		expect(t('hud.endTurn')).not.toBe('End turn');
		setLocale('en');
		expect(t('hud.endTurn')).toBe('End turn');
	});
});

describe('detectLocale', () => {
	test('Portuguese browser languages map to pt-BR', () => {
		expect(detectLocale('pt-BR')).toBe('pt-BR');
		expect(detectLocale('pt')).toBe('pt-BR');
		expect(detectLocale('PT-br')).toBe('pt-BR');
	});

	test('other languages and missing values fall back to en', () => {
		expect(detectLocale('en-US')).toBe('en');
		expect(detectLocale('fr')).toBe('en');
		expect(detectLocale(undefined)).toBe('en');
	});
});

describe('loadSettings validation', () => {
	let store: Map<string, string>;
	const fallback: Settings = defaultSettings('en');

	beforeEach(() => {
		store = stubLocalStorage();
	});
	afterEach(() => {
		store.clear();
	});

	test('no saved value returns the fallback', () => {
		expect(loadSettings(fallback)).toEqual(fallback);
	});

	test('corrupt JSON returns the fallback', () => {
		store.set(KEY, '{not json');
		expect(loadSettings(fallback)).toEqual(fallback);
	});

	test('a non-object JSON value returns the fallback', () => {
		store.set(KEY, '42');
		expect(loadSettings(fallback)).toEqual(fallback);
	});

	test('out-of-range volume falls back to the default', () => {
		store.set(KEY, JSON.stringify({ musicVolume: 150, sfxVolume: -1 }));
		const s = loadSettings(fallback);
		expect(s.musicVolume).toBe(fallback.musicVolume);
		expect(s.sfxVolume).toBe(fallback.sfxVolume);
	});

	test('a valid in-range volume is kept and rounded', () => {
		store.set(KEY, JSON.stringify({ musicVolume: 42.6 }));
		expect(loadSettings(fallback).musicVolume).toBe(43);
	});

	test('a speed other than 1, 2 or 3 falls back to the default', () => {
		store.set(KEY, JSON.stringify({ defaultSpeed: 5 }));
		expect(loadSettings(fallback).defaultSpeed).toBe(fallback.defaultSpeed);
	});

	test('a valid speed is kept', () => {
		store.set(KEY, JSON.stringify({ defaultSpeed: 3 }));
		expect(loadSettings(fallback).defaultSpeed).toBe(3);
	});

	// A3.5 text scale: 100, 125 or 150 percent, default 100.
	test('text scale defaults to 100 and keeps 125 or 150', () => {
		expect(fallback.textScale).toBe(100);
		store.set(KEY, JSON.stringify({ textScale: 150 }));
		expect(loadSettings(fallback).textScale).toBe(150);
		store.set(KEY, JSON.stringify({ textScale: 125 }));
		expect(loadSettings(fallback).textScale).toBe(125);
	});

	test('any other text scale falls back to the default', () => {
		store.set(KEY, JSON.stringify({ textScale: 300 }));
		expect(loadSettings(fallback).textScale).toBe(100);
	});

	test('an unknown locale falls back to the default locale', () => {
		store.set(KEY, JSON.stringify({ locale: 'fr' }));
		expect(loadSettings(fallback).locale).toBe(fallback.locale);
	});

	test('non-boolean flags fall back to their defaults', () => {
		store.set(KEY, JSON.stringify({ reduceShake: 'yes', fullscreen: 1 }));
		const s = loadSettings(fallback);
		expect(s.reduceShake).toBe(fallback.reduceShake);
		expect(s.fullscreen).toBe(fallback.fullscreen);
	});
});
