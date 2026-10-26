import Phaser from 'phaser';
import { BASE_HEIGHT, BASE_WIDTH } from '../platform/zoom';
import { app } from '../view/app';
import { playMusic } from '../view/audio';
import { t } from '../view/i18n';
import { P } from '../view/palette';
import { backdrop, fitCamera, label } from '../view/ui';

export class TitleScene extends Phaser.Scene {
	private started = false;

	constructor() {
		super('Title');
	}

	create(): void {
		fitCamera(this);
		playMusic(this, 'music.menu');
		this.started = false;
		this.cameras.main.setBackgroundColor('#0e0d12');
		backdrop(this, 'bg.title', 0.35);
		label(this, BASE_WIDTH / 2, 110, t('game.title'), 'display', 'gold2').setOrigin(0.5);
		// Dark band so the intro reads over the bright backdrop.
		this.add.rectangle(0, 146, BASE_WIDTH, 50, P.ash0, 0.6).setOrigin(0);
		const lines = [t('intro.line1'), t('intro.line2'), t('intro.line3')];
		lines.forEach((line, i) => {
			label(this, BASE_WIDTH / 2, 158 + i * 13, line, 'tiny', 'bone1').setOrigin(0.5);
		});
		const tap = label(this, BASE_WIDTH / 2, 240, t('menu.tapToBegin'), 'ui', 'bone2').setOrigin(
			0.5,
		);
		this.tweens.add({ targets: tap, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
		label(
			this,
			8,
			BASE_HEIGHT - 14,
			t('menu.version', { version: __APP_VERSION__ }),
			'tiny',
			'ash5',
		);
		this.input.once('pointerup', () => this.begin());
		this.input.keyboard?.once('keydown', () => this.begin());
	}

	private begin(): void {
		if (this.started) return;
		this.started = true;
		// The first gesture unlocks Web Audio; the game keeps working if audio stays locked.
		if (this.sound.locked) this.sound.unlock();
		if (app.settings.fullscreen && !this.scale.isFullscreen) this.scale.startFullscreen();
		this.scene.start('Menu');
	}
}
