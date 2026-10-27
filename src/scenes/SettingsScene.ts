import Phaser from 'phaser';
import { emptyProfile } from '../core';
import { BASE_WIDTH } from '../platform/zoom';
import { app } from '../view/app';
import { setMusicVolume } from '../view/audio';
import { t } from '../view/i18n';
import { saveProfile } from '../view/profile';
import { session } from '../view/session';
import type { Speed, TextScale } from '../view/settings';
import { Button, fitCamera, fitText, keyNav, label, panel } from '../view/ui';

interface SettingsData {
	returnTo: string;
}

/** Overlay launched over another scene; "Back" resumes the caller (docs/art-bible.md §11.12). */
export class SettingsScene extends Phaser.Scene {
	private returnTo = 'Menu';

	constructor() {
		super('Settings');
	}

	init(data: SettingsData): void {
		this.returnTo = data.returnTo ?? 'Menu';
	}

	create(): void {
		fitCamera(this);
		keyNav(this);
		this.add.rectangle(0, 0, 640, 360, 0x0e0d12, 0.85).setOrigin(0).setInteractive();
		panel(this, 120, 24, 400, 312);
		label(this, BASE_WIDTH / 2, 36, t('settings.title'), 'h2', 'gold2').setOrigin(0.5, 0);
		this.render();
	}

	private render(): void {
		this.children.list
			.filter((o) => o.getData('row') === true)
			.forEach((o) => {
				o.destroy();
			});
		const s = app.settings;
		const onOff = (v: boolean): string => (v ? t('settings.on') : t('settings.off'));
		const rows: [string, string, () => void][] = [
			[
				t('settings.language'),
				s.locale === 'en' ? 'English' : 'Português (Brasil)',
				() => app.update({ locale: s.locale === 'en' ? 'pt-BR' : 'en' }),
			],
			[
				t('settings.musicVolume'),
				`${s.musicVolume}`,
				() => {
					const musicVolume = (s.musicVolume + 20) % 120;
					app.update({ musicVolume });
					setMusicVolume(musicVolume);
				},
			],
			[
				t('settings.sfxVolume'),
				`${s.sfxVolume}`,
				() => app.update({ sfxVolume: (s.sfxVolume + 20) % 120 }),
			],
			[
				t('settings.defaultSpeed'),
				`${s.defaultSpeed}x`,
				() => {
					const next = ((s.defaultSpeed % 3) + 1) as Speed;
					app.update({ defaultSpeed: next });
					app.speed = next;
				},
			],
			[
				t('settings.autoBattleStart'),
				onOff(s.autoBattleAtStart),
				() => app.update({ autoBattleAtStart: !s.autoBattleAtStart }),
			],
			[
				t('settings.reduceShake'),
				onOff(s.reduceShake),
				() => app.update({ reduceShake: !s.reduceShake }),
			],
			[
				t('settings.reduceFlashes'),
				onOff(s.reduceFlashes),
				() => app.update({ reduceFlashes: !s.reduceFlashes }),
			],
			[
				t('settings.textScale'),
				`${s.textScale}%`,
				() => {
					const next: TextScale =
						s.textScale === 100 ? 125 : s.textScale === 125 ? 150 : 100;
					app.update({ textScale: next });
				},
			],
			[
				t('settings.fullscreen'),
				onOff(s.fullscreen),
				() => {
					app.update({ fullscreen: !s.fullscreen });
					if (app.settings.fullscreen) this.scale.startFullscreen();
					else this.scale.stopFullscreen();
				},
			],
		];
		rows.forEach(([name, value, action], i) => {
			const y = 64 + i * 26;
			label(this, 136, y + 6, name, 'ui').setData('row', true);
			new Button(
				this,
				376,
				y,
				value,
				() => {
					action();
					this.render();
				},
				{ w: 128, h: 24, testId: `settings-${i}` },
			).setData('row', true);
		});
		// From the main menu only: resetting inside a run would pull the run out from under the player.
		const fromMenu = this.returnTo === 'Menu';
		new Button(
			this,
			fromMenu ? 136 : BASE_WIDTH / 2 - 60,
			302,
			t('settings.back'),
			() => this.close(),
			{ sfx: 'sfx.ui.cancel', testId: 'settings-back' },
		).setData('row', true);
		if (fromMenu)
			new Button(this, 384, 302, t('settings.reset'), () => this.confirmReset(), {
				danger: true,
				testId: 'settings-reset',
			}).setData('row', true);
	}

	/** In-game confirm step (no browser dialog): Erase wipes Embers, Legacy, Rites and the run save. */
	private confirmReset(): void {
		const box = this.add.container(0, 0).setDepth(20);
		const shade = this.add
			.rectangle(0, 0, 640, 360, 0x0e0d12, 0.8)
			.setOrigin(0)
			.setInteractive();
		box.add([shade, panel(this, 160, 112, 320, 136, 'ash2', 'blood1')]);
		box.add(
			label(this, BASE_WIDTH / 2, 124, t('settings.resetTitle'), 'h2', 'blood2').setOrigin(
				0.5,
				0,
			),
		);
		box.add(
			fitText(
				label(this, BASE_WIDTH / 2, 152, t('settings.resetText'), 'tiny', 'bone2')
					.setOrigin(0.5, 0)
					.setWordWrapWidth(296)
					.setAlign('center'),
				296,
				40,
			),
		);
		box.add(
			new Button(this, 176, 204, t('settings.resetCancel'), () => box.destroy(), {
				sfx: 'sfx.ui.cancel',
				testId: 'settings-reset-cancel',
			}),
		);
		box.add(
			new Button(
				this,
				344,
				204,
				t('settings.resetConfirm'),
				() => {
					saveProfile(emptyProfile());
					session.clear();
					box.destroy();
					label(this, BASE_WIDTH / 2, 286, t('settings.resetDone'), 'tiny', 'ember3')
						.setOrigin(0.5, 0)
						.setData('row', true);
				},
				{ danger: true, testId: 'settings-reset-confirm' },
			),
		);
	}

	private close(): void {
		this.scene.stop();
		this.scene.resume(this.returnTo);
		this.scene.get(this.returnTo).events.emit('settings-closed');
	}
}
