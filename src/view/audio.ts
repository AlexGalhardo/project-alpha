import type Phaser from 'phaser';
import { app } from './app';

// shortcut: synthesized placeholder SFX keyed like docs/gdd.md §17.1 until the ElevenLabs set
// passes the cost gate; swap `play` to Phaser's sound manager with the same keys then.
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
export function play(scene: Phaser.Scene, key: string): void {
	const tones = TONES[key];
	const ctx = contextOf(scene);
	const volume = app.settings.sfxVolume / 100;
	if (!tones || !ctx || volume <= 0) return;
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
