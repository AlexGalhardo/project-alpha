import Phaser from 'phaser';
import { chooseBotCommand, combatView, type HeroClass, mapView } from './core';
import { RENDER_HEIGHT, RENDER_WIDTH } from './platform/zoom';
import { BootScene } from './scenes/BootScene';
import { CampScene } from './scenes/CampScene';
import { CombatScene } from './scenes/CombatScene';
import { EventScene } from './scenes/EventScene';
import { LegacyScene } from './scenes/LegacyScene';
import { MapScene } from './scenes/MapScene';
import { MenuScene } from './scenes/MenuScene';
import { PartyScene } from './scenes/PartyScene';
import { PauseScene } from './scenes/PauseScene';
import { RestScene } from './scenes/RestScene';
import { RewardScene } from './scenes/RewardScene';
import { SanctumScene } from './scenes/SanctumScene';
import { SettingsScene } from './scenes/SettingsScene';
import { ShopScene } from './scenes/ShopScene';
import { SummaryScene } from './scenes/SummaryScene';
import { TitleScene } from './scenes/TitleScene';
import { TreasureScene } from './scenes/TreasureScene';
import { session } from './view/session';

const game = new Phaser.Game({
	type: Phaser.AUTO,
	parent: 'game',
	// 1920×1080 render, fitted to the viewport; scenes keep the 640×360 layout through a ×3 camera.
	// Smooth sampling for Roboto text; pixel-art textures get nearest filtering at boot (ADR 0015).
	width: RENDER_WIDTH,
	height: RENDER_HEIGHT,
	pixelArt: false,
	backgroundColor: '#0e0d12',
	scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
	scene: [
		BootScene,
		TitleScene,
		MenuScene,
		SettingsScene,
		PartyScene,
		MapScene,
		CombatScene,
		RewardScene,
		CampScene,
		ShopScene,
		RestScene,
		SanctumScene,
		EventScene,
		TreasureScene,
		SummaryScene,
		LegacyScene,
		PauseScene,
	],
});

// Test hooks for Playwright smoke/e2e: the running game, and one bot step that issues the same
// commands a player could (chooseBotCommand) and moves to the matching scene.
const hooks = window as unknown as {
	__game?: Phaser.Game;
	__botStep?: () => string;
	__combat?: () => ReturnType<typeof combatView>;
	__startRun?: (seed: number, party: HeroClass[]) => void;
	__map?: () => ReturnType<typeof mapView>;
	__run?: () => typeof session.state;
};
hooks.__game = game;
hooks.__combat = () => (session.state ? combatView(session.state) : null);
// Read-only views for e2e assertions; they never change state.
hooks.__map = () => (session.state ? mapView(session.state) : null);
hooks.__run = () => session.state;
hooks.__startRun = (seed: number, party: HeroClass[]): void => {
	session.start(party, seed);
};
hooks.__botStep = (): string => {
	const state = session.state;
	const cmd = state ? chooseBotCommand(state) : null;
	if (cmd) session.send(cmd);
	const target = session.sceneForScreen();
	for (const scene of game.scene.getScenes(true)) {
		if (scene.scene.key !== target) scene.scene.stop();
	}
	if (!game.scene.isActive(target)) game.scene.start(target);
	return target;
};
