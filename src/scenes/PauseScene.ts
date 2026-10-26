import Phaser from 'phaser';
import { BASE_WIDTH } from '../platform/zoom';
import { t } from '../view/i18n';
import { session } from '../view/session';
import { Button, label, panel } from '../view/ui';

export class PauseScene extends Phaser.Scene {
	private returnTo = 'Map';
	private confirming = false;

	constructor() {
		super('Pause');
	}

	init(data: { returnTo?: string }): void {
		this.returnTo = data.returnTo ?? 'Map';
		this.confirming = false;
	}

	create(): void {
		this.add.rectangle(0, 0, 640, 360, 0x0e0d12, 0.8).setOrigin(0).setInteractive();
		panel(this, 220, 60, 200, 240);
		label(this, BASE_WIDTH / 2, 72, t('pause.title'), 'h2', 'gold2').setOrigin(0.5, 0);
		const x = BASE_WIDTH / 2 - 70;
		new Button(this, x, 110, t('pause.resume'), () => this.resume(), {
			w: 140,
			testId: 'pause-resume',
		});
		new Button(this, x, 148, t('pause.settings'), () => this.openSettings(), {
			w: 140,
			testId: 'pause-settings',
		});
		new Button(this, x, 186, t('pause.mainMenu'), () => this.toMenu(), {
			w: 140,
			testId: 'pause-menu',
		});
		const abandon: Button = new Button(
			this,
			x,
			224,
			t('pause.abandon'),
			() => this.abandon(abandon),
			{
				w: 140,
				danger: true,
				testId: 'pause-abandon',
			},
		);
		label(this, BASE_WIDTH / 2, 268, t('pause.saves'), 'tiny', 'ash5').setOrigin(0.5, 0);
		this.input.keyboard?.on('keydown-ESC', () => this.resume());
		// Rebuild after Settings closes so a language change shows here too.
		const onSettingsClosed = (): void => {
			this.scene.restart({ returnTo: this.returnTo });
		};
		this.events.once('settings-closed', onSettingsClosed);
		this.events.once('shutdown', () => this.events.off('settings-closed', onSettingsClosed));
	}

	private resume(): void {
		this.scene.stop();
		this.scene.resume(this.returnTo);
	}

	private openSettings(): void {
		this.scene.pause();
		this.scene.launch('Settings', { returnTo: 'Pause' });
	}

	private toMenu(): void {
		session.save();
		this.scene.stop(this.returnTo);
		this.scene.stop();
		this.scene.start('Menu');
	}

	/** Two-step confirmation without a browser dialog. */
	private abandon(button: Button): void {
		if (!this.confirming) {
			this.confirming = true;
			button.setCaption(t('pause.confirm'));
			label(this, BASE_WIDTH / 2, 284, t('pause.abandonConfirm'), 'tiny', 'blood2').setOrigin(
				0.5,
				0,
			);
			return;
		}
		session.clear();
		this.scene.stop(this.returnTo);
		this.scene.stop();
		this.scene.start('Menu');
	}
}
