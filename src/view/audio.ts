import type Phaser from 'phaser';
import { app } from './app';

// Generated ElevenLabs files play through Phaser's sound manager; the synthesized tones below are
// the fallback when a file is missing or failed to load, so the game never goes silent by error.
type Wave = OscillatorType | 'noise';

interface Tone {
	wave: Wave;
	from: number;
	to: number;
	ms: number;
	gain: number;
}

const TONES: Record<string, Tone[]> = {
	'sfx.card.play': [{ wave: 'triangle', from: 520, to: 780, ms: 70, gain: 0.25 }],
	'sfx.card.invalid': [{ wave: 'square', from: 160, to: 140, ms: 90, gain: 0.15 }],
	'sfx.hit.blunt': [
		{ wave: 'noise', from: 0, to: 0, ms: 90, gain: 0.35 },
		{ wave: 'sine', from: 140, to: 60, ms: 120, gain: 0.4 },
	],
	'sfx.block.gain': [{ wave: 'triangle', from: 300, to: 420, ms: 100, gain: 0.25 }],
	'sfx.block.absorb': [{ wave: 'square', from: 900, to: 700, ms: 60, gain: 0.12 }],
	'sfx.status.burn': [{ wave: 'noise', from: 0, to: 0, ms: 160, gain: 0.18 }],
	'sfx.stress.gain': [{ wave: 'sine', from: 220, to: 180, ms: 220, gain: 0.25 }],
	'sfx.stress.collapse': [
		{ wave: 'sawtooth', from: 110, to: 55, ms: 500, gain: 0.25 },
		{ wave: 'sine', from: 233, to: 117, ms: 500, gain: 0.2 },
	],
	'sfx.unit.heal': [{ wave: 'sine', from: 600, to: 900, ms: 180, gain: 0.2 }],
	'sfx.unit.fall': [{ wave: 'sawtooth', from: 200, to: 50, ms: 400, gain: 0.3 }],
	'sfx.unit.enemy_death': [{ wave: 'noise', from: 0, to: 0, ms: 220, gain: 0.25 }],
	'sfx.unit.boss_phase': [
		{ wave: 'sine', from: 98, to: 96, ms: 1400, gain: 0.45 },
		{ wave: 'sine', from: 196, to: 193, ms: 1200, gain: 0.25 },
	],
	'sfx.ui.tap': [{ wave: 'square', from: 1200, to: 1200, ms: 25, gain: 0.08 }],
	'sfx.ui.end_turn': [{ wave: 'triangle', from: 330, to: 220, ms: 160, gain: 0.2 }],
	'sfx.flow.victory': [
		{ wave: 'triangle', from: 392, to: 392, ms: 300, gain: 0.25 },
		{ wave: 'triangle', from: 523, to: 523, ms: 500, gain: 0.2 },
	],
	'sfx.flow.defeat': [{ wave: 'sawtooth', from: 147, to: 73, ms: 900, gain: 0.25 }],
};

function contextOf(scene: Phaser.Scene): AudioContext | null {
	const manager = scene.sound as unknown as { context?: AudioContext; locked?: boolean };
	if (manager.locked || !manager.context) return null;
	return manager.context;
}

let noise: AudioBuffer | null = null;

/** Plays a placeholder SFX; silently does nothing when audio is locked, missing or muted. */
/** Generated sound set (ElevenLabs, public/assets/audio); see art-src/audio/generation-log.json. */
export const AUDIO_KEYS = [
	'music.menu',
	'music.map',
	'music.combat',
	'music.combat.act2',
	'music.combat.act3',
	'music.boss',
	'music.boss.final',
	'music.ending',
	...[
		'block.absorb',
		'block.break',
		'block.gain',
		'card.draw',
		'card.exhaust',
		'card.invalid',
		'card.play',
		'card.upgrade',
		'flow.defeat',
		'flow.enrage',
		'flow.phase',
		'flow.reward',
		'flow.victory',
		'hit.blunt',
		'hit.fire',
		'hit.multi',
		'hit.pierce',
		'hit.slash',
		'status.bleed',
		'status.burn',
		'status.marked',
		'status.stun',
		'status.ward',
		'status.weakened',
		'stress.collapse',
		'stress.gain',
		'stress.relief',
		'ui.cancel',
		'ui.close',
		'ui.coin',
		'ui.confirm',
		'ui.end_turn',
		'ui.open',
		'ui.tap',
		'unit.boss_phase',
		'unit.enemy_death',
		'unit.hero_fall',
	].map((k) => `sfx.${k}`),
] as const;

let audioLoading = false;

/**
 * Loads every sound in the background after the boot (docs/reports/2026-10-26-performance.md #3):
 * SFX first (small; `play()` synthesizes a tone until a file arrives), then the music loops. The
 * requested track starts, or replaces its fallback, when its file arrives. Missing files only log.
 */
export function loadAudioInBackground(scene: Phaser.Scene): void {
	if (audioLoading) return;
	audioLoading = true;
	const keys = [...AUDIO_KEYS].sort(
		(a, b) => Number(a.startsWith('music.')) - Number(b.startsWith('music.')),
	);
	for (const key of keys) {
		if (scene.cache.audio.exists(key)) continue;
		scene.load.audio(key, [`assets/audio/${key}.ogg`, `assets/audio/${key}.mp3`]);
	}
	scene.load.on('filecomplete', (key: string) => {
		if (key !== currentMusicKey || playingKey === key) return;
		const wanted = currentMusicKey;
		stopMusic();
		playMusic(scene, wanted);
	});
	scene.load.start();
}

// Older code keys mapped to the generated set.
const ALIAS: Record<string, string> = {
	'sfx.unit.fall': 'sfx.unit.hero_fall',
	'sfx.unit.heal': 'sfx.stress.relief',
};

let currentMusic: Phaser.Sound.BaseSound | null = null;
/** Track the game asked for; `playingKey` is what actually plays (its fallback while it loads). */
let currentMusicKey = '';
let playingKey = '';

/**
 * Loops one music track for the whole game; switching keys stops the old one. `fallback` plays
 * while `key` is not loaded (per-act tracks fall back to the Act 1 ones).
 */
export function playMusic(scene: Phaser.Scene, key: string, fallback?: string): void {
	if (currentMusicKey === key && currentMusic) return;
	currentMusic?.stop();
	currentMusic = null;
	playingKey = '';
	currentMusicKey = key;
	const k = scene.cache.audio.exists(key)
		? key
		: fallback && scene.cache.audio.exists(fallback)
			? fallback
			: null;
	if (!k) return;
	playingKey = k;
	const volume = app.settings.musicVolume / 100;
	currentMusic = scene.sound.add(k, { loop: true, volume });
	// Locked audio (no gesture yet) starts automatically on unlock; otherwise play now.
	if (scene.sound.locked) scene.sound.once('unlocked', () => currentMusic?.play());
	else currentMusic.play();
}

export function stopMusic(): void {
	currentMusic?.stop();
	currentMusic = null;
	currentMusicKey = '';
	playingKey = '';
}

export function setMusicVolume(volume: number): void {
	const sound = currentMusic as
		| (Phaser.Sound.BaseSound & { setVolume?: (v: number) => void })
		| null;
	sound?.setVolume?.(volume / 100);
}

export function play(scene: Phaser.Scene, rawKey: string): void {
	const key = ALIAS[rawKey] ?? rawKey;
	const volume = app.settings.sfxVolume / 100;
	if (volume <= 0) return;
	if (scene.cache.audio.exists(key) && !scene.sound.locked) {
		scene.sound.play(key, { volume });
		return;
	}
	const tones = TONES[rawKey] ?? TONES[key];
	const ctx = contextOf(scene);
	if (!tones || !ctx) return;
	const now = ctx.currentTime;
	for (const tone of tones) {
		const gain = ctx.createGain();
		const seconds = tone.ms / 1000;
		gain.gain.setValueAtTime(tone.gain * volume, now);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
		gain.connect(ctx.destination);
		if (tone.wave === 'noise') {
			if (!noise) {
				noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
				const data = noise.getChannelData(0);
				// Fixed LCG so the noise buffer is identical every session.
				let s = 12345;
				for (let i = 0; i < data.length; i++) {
					s = (s * 1103515245 + 12345) & 0x7fffffff;
					data[i] = (s / 0x7fffffff) * 2 - 1;
				}
			}
			const src = ctx.createBufferSource();
			src.buffer = noise;
			src.connect(gain);
			src.start(now);
			src.stop(now + seconds);
		} else {
			const osc = ctx.createOscillator();
			osc.type = tone.wave;
			osc.frequency.setValueAtTime(tone.from, now);
			osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.to), now + seconds);
			osc.connect(gain);
			osc.start(now);
			osc.stop(now + seconds);
		}
	}
}
