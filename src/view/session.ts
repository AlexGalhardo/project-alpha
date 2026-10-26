import type Phaser from 'phaser';
import {
	type ApplyResult,
	apply,
	type Command,
	createRun,
	currentScreen,
	deserialize,
	type GameEvent,
	type HeroClass,
	type RunState,
	type ScreenKey,
	serialize,
} from '../core';
import { readText, removeKey, writeText } from '../platform/storage';

const SAVE_KEY = 'ossuary.run.v1';

const SCENE_FOR: Record<ScreenKey, string> = {
	map: 'Map',
	combat: 'Combat',
	reward: 'Reward',
	camp: 'Camp',
	shop: 'Shop',
	rest: 'Rest',
	summary: 'Summary',
};

type Listener = (events: GameEvent[], state: RunState) => void;

/** Owns the current run state; every change goes through `send`, which applies a core command and autosaves. */
class Session {
	state: RunState | null = null;
	private listeners = new Set<Listener>();

	hasSave(): boolean {
		const raw = readText(SAVE_KEY);
		return raw !== null && deserialize(raw) !== null;
	}

	load(): boolean {
		const raw = readText(SAVE_KEY);
		const state = raw === null ? null : deserialize(raw);
		if (!state) {
			removeKey(SAVE_KEY);
			return false;
		}
		this.state = state;
		return true;
	}

	start(party: HeroClass[], seed = (Date.now() ^ 0x9e3779b9) >>> 0): void {
		this.state = createRun(seed, party);
		this.save();
	}

	send(command: Command): ApplyResult | null {
		if (!this.state) return null;
		const result = apply(this.state, command);
		this.state = result.state;
		this.save();
		for (const l of this.listeners) l(result.events, result.state);
		return result;
	}

	on(listener: Listener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	sceneForScreen(): string {
		return this.state ? SCENE_FOR[currentScreen(this.state)] : 'Menu';
	}

	/** Scene for the current screen, falling back to the menu instead of restarting `from` in a loop. */
	nextSceneFrom(from: string): string {
		const next = this.sceneForScreen();
		return next === from ? 'Menu' : next;
	}

	save(): void {
		if (this.state) writeText(SAVE_KEY, serialize(this.state));
	}

	clear(): void {
		this.state = null;
		removeKey(SAVE_KEY);
	}
}

export const session = new Session();

/** After a command: re-render the same scene if the screen did not change, otherwise go to the new one. */
export function goNext(scene: Phaser.Scene): void {
	const next = session.sceneForScreen();
	if (next === scene.scene.key) scene.scene.restart();
	else scene.scene.start(next);
}
