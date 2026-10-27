import Phaser from 'phaser';
import { BASE_HEIGHT, BASE_WIDTH } from '../platform/zoom';
import { playMusic } from '../view/audio';
import { t } from '../view/i18n';
import { P } from '../view/palette';
import { session } from '../view/session';
import { Button, backdrop, fitCamera, keyNav, label, panel } from '../view/ui';

export class MenuScene extends Phaser.Scene {
	private credits: Phaser.GameObjects.Container | null = null;

	constructor() {
		super('Menu');
	}

	create(): void {
		this.credits = null;
		fitCamera(this);
		keyNav(this);
		playMusic(this, 'music.menu');
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu', 0.4);
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
		add(t('menu.legacy'), () => this.scene.start('Legacy'), 'menu-legacy');
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

	/** Credits overlay over the menu (one at a time); Back closes it. */
	private showCredits(): void {
		if (this.credits) return;
		const box = this.add.container(0, 0).setDepth(10);
		// Full-screen blocker so the menu buttons under the overlay do not take taps.
		const shade = this.add
			.rectangle(0, 0, BASE_WIDTH, BASE_HEIGHT, P.ash0, 0.7)
			.setOrigin(0)
			.setInteractive();
		box.add([shade, panel(this, 160, 96, 320, 176)]);
		box.add(
			label(this, BASE_WIDTH / 2, 108, t('menu.credits'), 'h2', 'gold2').setOrigin(0.5, 0),
		);
		['menu.creditsFonts', 'menu.creditsArt', 'menu.creditsAudio'].forEach((k, i) => {
			box.add(
				label(this, BASE_WIDTH / 2, 140 + i * 22, t(k), 'tiny', 'bone2')
					.setOrigin(0.5, 0)
					.setWordWrapWidth(296)
					.setAlign('center'),
			);
		});
		box.add(
			new Button(
				this,
				BASE_WIDTH / 2 - 48,
				224,
				t('settings.back'),
				() => {
					box.destroy();
					this.credits = null;
				},
				{ w: 96, h: 32, testId: 'credits-back' },
			),
		);
		this.credits = box;
	}
}
