import Phaser from 'phaser';
import { chooseBotCommand, combatView, type HeroClass } from './core';
import { BASE_HEIGHT, BASE_WIDTH, pickZoom } from './platform/zoom';
import { BootScene } from './scenes/BootScene';
import { CampScene } from './scenes/CampScene';
import { CombatScene } from './scenes/CombatScene';
import { MapScene } from './scenes/MapScene';
import { MenuScene } from './scenes/MenuScene';
import { PartyScene } from './scenes/PartyScene';
import { PauseScene } from './scenes/PauseScene';
import { RestScene } from './scenes/RestScene';
import { RewardScene } from './scenes/RewardScene';
import { SettingsScene } from './scenes/SettingsScene';
import { ShopScene } from './scenes/ShopScene';
import { SummaryScene } from './scenes/SummaryScene';
import { TitleScene } from './scenes/TitleScene';
import { session } from './view/session';

const zoom = (): number =>
	pickZoom(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);

const game = new Phaser.Game({
	type: Phaser.AUTO,
	parent: 'game',
	width: BASE_WIDTH,
	height: BASE_HEIGHT,
	pixelArt: true,
	backgroundColor: '#0e0d12',
	scale: { mode: Phaser.Scale.NONE, zoom: zoom() },
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
		SummaryScene,
		PauseScene,
	],
});

const resize = (): void => {
	game.scale.setZoom(zoom());
};
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

// Test hooks for Playwright smoke/e2e: the running game, and one bot step that issues the same
// commands a player could (chooseBotCommand) and moves to the matching scene.
const hooks = window as unknown as {
	__game?: Phaser.Game;
	__botStep?: () => string;
	__combat?: () => ReturnType<typeof combatView>;
	__startRun?: (seed: number, party: HeroClass[]) => void;
};
hooks.__game = game;
hooks.__combat = () => (session.state ? combatView(session.state) : null);
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
