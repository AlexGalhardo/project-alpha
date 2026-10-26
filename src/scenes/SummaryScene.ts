import Phaser from 'phaser';
import { bankRun, summaryView } from '../core';
import { BASE_WIDTH } from '../platform/zoom';
import { stopMusic } from '../view/audio';
import { t } from '../view/i18n';
import { loadProfile, saveProfile } from '../view/profile';
import { session } from '../view/session';
import { Button, backdrop, label, panel } from '../view/ui';

export class SummaryScene extends Phaser.Scene {
	constructor() {
		super('Summary');
	}

	create(): void {
		stopMusic();
		this.cameras.main.setBackgroundColor('#0e0d12');
		backdrop(this, 'bg.menu', 0.6);
		const view = session.state ? summaryView(session.state) : null;
		if (!view) {
			this.scene.start('Menu');
			return;
		}
		// Bank this run's Embers once (the profile remembers the seed).
		if (session.state) saveProfile(bankRun(loadProfile(), session.state.seed, view.embers));
		panel(this, 160, 40, 320, 280);
		const title = view.victory ? t('hud.victory') : t('hud.defeat');
		label(this, BASE_WIDTH / 2, 56, title, 'h1', view.victory ? 'gold2' : 'blood2').setOrigin(
			0.5,
			0,
		);
		const line = view.victory ? t('summary.victory') : t('summary.defeat');
		label(this, BASE_WIDTH / 2, 90, line, 'ui', 'ash5').setOrigin(0.5, 0);
		if (view.victory) {
			label(this, BASE_WIDTH / 2, 110, t('boss.bell_maw.epilogue'), 'tiny', 'bone1')
				.setOrigin(0.5, 0)
				.setWordWrapWidth(290)
				.setAlign('center');
		}
		const rows = [
			t('summary.rounds', { count: view.roundsCleared }),
			t('summary.elites', { count: view.elitesWon }),
			t('summary.bosses', { count: view.bossesWon }),
			t('summary.collapses', { count: view.collapses }),
			t('summary.embers', { count: view.embers }),
		];
		rows.forEach((r, i) => {
			label(this, 200, 166 + i * 18, r, 'ui');
		});
		new Button(this, BASE_WIDTH / 2 - 70, 272, t('summary.mainMenu'), () => this.toMenu(), {
			w: 140,
			h: 32,
			testId: 'summary-menu',
		});
	}

	private toMenu(): void {
		session.clear();
		this.scene.start('Menu');
	}
}
