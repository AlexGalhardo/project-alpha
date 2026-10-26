import type Phaser from 'phaser';
import { detectLocale, setLocale } from './i18n';
import { defaultSettings, loadSettings, type Settings, type Speed, saveSettings } from './settings';

// Presentation-side state shared by scenes. Game rules live in src/core; this only holds
// settings and the session's speed/auto toggles, which never change a combat result.
class AppState {
	settings: Settings;
	speed: Speed;
	auto: boolean;

	constructor() {
		const nav = globalThis.navigator as Navigator | undefined;
		this.settings = loadSettings(defaultSettings(detectLocale(nav?.language)));
		setLocale(this.settings.locale);
		this.speed = this.settings.defaultSpeed;
		this.auto = this.settings.autoBattleAtStart;
	}

	update(patch: Partial<Settings>): void {
		this.settings = { ...this.settings, ...patch };
		setLocale(this.settings.locale);
		saveSettings(this.settings);
	}

	/** Applies the presentation speed factor to a scene (docs/art-bible.md §12, spike findings). */
	applySpeed(scene: Phaser.Scene): void {
		scene.time.timeScale = this.speed;
		scene.tweens.timeScale = this.speed;
		scene.anims.globalTimeScale = this.speed;
	}

	/** Duration in ms for a 1x timing at the current speed; 3x skips to a 50 ms floor. */
	ms(base: number): number {
		return this.speed === 3 ? Math.max(50, base / 3) : base / this.speed;
	}
}

export const app = new AppState();
