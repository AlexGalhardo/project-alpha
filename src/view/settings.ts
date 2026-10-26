import { readText, writeText } from '../platform/storage';
import type { Locale } from './i18n';

export type Speed = 1 | 2 | 3;

export interface Settings {
	locale: Locale;
	musicVolume: number;
	sfxVolume: number;
	defaultSpeed: Speed;
	autoBattleAtStart: boolean;
	reduceShake: boolean;
	reduceFlashes: boolean;
	fullscreen: boolean;
}

const KEY = 'ossuary.settings.v1';

export function defaultSettings(locale: Locale): Settings {
	return {
		locale,
		musicVolume: 60,
		sfxVolume: 80,
		defaultSpeed: 1,
		autoBattleAtStart: false,
		reduceShake: false,
		reduceFlashes: false,
		fullscreen: false,
	};
}

function isSpeed(value: unknown): value is Speed {
	return value === 1 || value === 2 || value === 3;
}

/** Reads saved settings, keeping only valid fields; anything unreadable falls back to defaults. */
export function loadSettings(fallback: Settings): Settings {
	const raw = readText(KEY);
	if (!raw) return fallback;
	try {
		const data: unknown = JSON.parse(raw);
		if (typeof data !== 'object' || data === null) return fallback;
		const d = data as Record<string, unknown>;
		const vol = (v: unknown, def: number): number =>
			typeof v === 'number' && v >= 0 && v <= 100 ? Math.round(v) : def;
		const bool = (v: unknown, def: boolean): boolean => (typeof v === 'boolean' ? v : def);
		return {
			locale: d.locale === 'en' || d.locale === 'pt-BR' ? d.locale : fallback.locale,
			musicVolume: vol(d.musicVolume, fallback.musicVolume),
			sfxVolume: vol(d.sfxVolume, fallback.sfxVolume),
			defaultSpeed: isSpeed(d.defaultSpeed) ? d.defaultSpeed : fallback.defaultSpeed,
			autoBattleAtStart: bool(d.autoBattleAtStart, fallback.autoBattleAtStart),
			reduceShake: bool(d.reduceShake, fallback.reduceShake),
			reduceFlashes: bool(d.reduceFlashes, fallback.reduceFlashes),
			fullscreen: bool(d.fullscreen, fallback.fullscreen),
		};
	} catch {
		return fallback;
	}
}

export function saveSettings(settings: Settings): void {
	writeText(KEY, JSON.stringify(settings));
}
