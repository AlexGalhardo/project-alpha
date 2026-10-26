import Phaser from 'phaser';
import type { HeroClass } from '../core';
import { BASE_WIDTH } from '../platform/zoom';
import { t } from '../view/i18n';
import { session } from '../view/session';
import { Button, label, panel } from '../view/ui';

const ROSTER: HeroClass[] = ['shieldbearer', 'marksman', 'arcanist', 'confessor', 'bombardier'];

/** Pick 3 of 5; the order of picking sets ranks 1→3 (B02, docs/art-bible.md §11.3). */
export class PartyScene extends Phaser.Scene {
	private picked: HeroClass[] = [];

	constructor() {
		super('Party');
	}

	create(): void {
		this.picked = ['shieldbearer', 'confessor', 'marksman'];
		this.render();
	}

	private render(): void {
		this.children.removeAll(true);
		this.cameras.main.setBackgroundColor('#1b1a22');
		label(this, BASE_WIDTH / 2, 10, t('party.title'), 'h2', 'gold2').setOrigin(0.5, 0);
		label(this, BASE_WIDTH / 2, 32, t('party.subtitle'), 'tiny', 'ash5').setOrigin(0.5, 0);
		ROSTER.forEach((id, i) => {
			const x = 24 + i * 120;
			const rank = this.picked.indexOf(id);
			panel(
				this,
				x,
				48,
				112,
				176,
				rank >= 0 ? 'iron0' : 'ash2',
				rank >= 0 ? 'gold2' : 'ash0',
			);
			this.add.image(x + 56, 140, `hero.${id}`).setOrigin(0.5, 1);
			label(this, x + 56, 146, t(`hero.${id}.name`), 'ui').setOrigin(0.5, 0);
			label(this, x + 56, 162, t(`hero.${id}.role`), 'tiny', 'ash5').setOrigin(0.5, 0);
			label(this, x + 6, 178, t(`hero.${id}.identity`), 'tiny', 'ash5').setWordWrapWidth(100);
			if (rank >= 0) label(this, x + 8, 54, `R${rank + 1}`, 'ui', 'gold2');
			const zone = this.add
				.zone(x, 48, 112, 176)
				.setOrigin(0)
				.setInteractive()
				.setName(`party-${id}`);
			zone.on('pointerup', () => this.toggle(id));
		});
		label(
			this,
			BASE_WIDTH / 2,
			236,
			t('party.selected', { count: this.picked.length }),
			'ui',
		).setOrigin(0.5, 0);
		label(this, BASE_WIDTH / 2, 256, t('party.defaultHint'), 'tiny', 'ash5').setOrigin(0.5, 0);
		new Button(this, BASE_WIDTH / 2 - 70, 296, t('party.start'), () => this.startRun(), {
			w: 140,
			h: 32,
			testId: 'party-start',
		}).setEnabled(this.picked.length === 3);
		new Button(this, 16, 320, t('settings.back'), () => this.scene.start('Menu'), {
			w: 80,
			h: 28,
			testId: 'party-back',
		});
	}

	private toggle(id: HeroClass): void {
		if (this.picked.includes(id)) this.picked = this.picked.filter((h) => h !== id);
		else if (this.picked.length < 3) this.picked = [...this.picked, id];
		this.render();
	}

	private startRun(): void {
		if (this.picked.length !== 3) return;
		session.start(this.picked);
		this.scene.start(session.sceneForScreen());
	}
}
