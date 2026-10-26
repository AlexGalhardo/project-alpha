import Phaser from 'phaser';
import { BASE_HEIGHT, BASE_WIDTH } from '../platform/zoom';
import { playMusic } from '../view/audio';
import { t } from '../view/i18n';
import { session } from '../view/session';
import { Button, backdrop, label } from '../view/ui';

export class MenuScene extends Phaser.Scene {
	constructor() {
		super('Menu');
	}

	create(): void {
		playMusic(this, 'music.menu');
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu');
		label(this, BASE_WIDTH / 2, 48, t('game.title'), 'h1', 'gold2').setOrigin(0.5);
		const x = BASE_WIDTH / 2 - 80;
		let y = 120;
		const add = (caption: string, action: () => void, id: string, enabled = true): void => {
			new Button(this, x, y, caption, action, { w: 160, h: 32, testId: id }).setEnabled(
				enabled,
			);
			y += 44;
		};
		add(t('menu.continue'), () => this.continueRun(), 'menu-continue', session.hasSave());
		add(t('menu.newRun'), () => this.scene.start('Party'), 'menu-new');
		add(t('menu.settings'), () => this.openSettings(), 'menu-settings');
		add(t('menu.credits'), () => this.showCredits(), 'menu-credits');
		const onSettingsClosed = (): void => {
			this.scene.restart();
		};
		this.events.once('settings-closed', onSettingsClosed);
		this.events.once('shutdown', () => this.events.off('settings-closed', onSettingsClosed));
		label(
			this,
			8,
			BASE_HEIGHT - 14,
			t('menu.version', { version: __APP_VERSION__ }),
			'tiny',
			'ash5',
		);
	}

	private continueRun(): void {
		if (session.load()) this.scene.start(session.sceneForScreen());
	}

	private openSettings(): void {
		this.scene.pause();
		this.scene.launch('Settings', { returnTo: 'Menu' });
	}

	private showCredits(): void {
		const text = label(
			this,
			BASE_WIDTH / 2,
			300,
			'Fonts: Jersey, Tiny5 (SIL OFL 1.1) · Engine: Phaser 4',
			'tiny',
			'ash5',
		).setOrigin(0.5);
		this.time.delayedCall(4000, () => text.destroy());
	}
}
