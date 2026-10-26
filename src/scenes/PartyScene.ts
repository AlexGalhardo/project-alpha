import Phaser from 'phaser';
import { applyMeta, canVeteran, type HeroClass } from '../core';
import { HEROES } from '../data/heroes';
import { BASE_WIDTH } from '../platform/zoom';
import { playMusic } from '../view/audio';
import { t } from '../view/i18n';
import { loadProfile } from '../view/profile';
import { session } from '../view/session';
import { Button, backdrop, label, panel } from '../view/ui';

const ROSTER: HeroClass[] = ['shieldbearer', 'marksman', 'arcanist', 'confessor', 'bombardier'];

/** Pick 3 of 5; the order of picking sets ranks 1→3 (B02, docs/art-bible.md §11.3). */
export class PartyScene extends Phaser.Scene {
	private picked: HeroClass[] = [];
	private veteran = true;

	constructor() {
		super('Party');
	}

	create(): void {
		playMusic(this, 'music.menu');
		this.picked = ['shieldbearer', 'confessor', 'marksman'];
		this.render();
	}

	private render(): void {
		this.children.removeAll(true);
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu', 0.6);
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
		// Allowed but weak (balance report: three back-liners win about 2%), so warn instead of block.
		if (this.picked.length === 3 && !this.picked.some((id) => HEROES[id].frontOrder <= 1))
			label(this, BASE_WIDTH / 2, 272, `▲ ${t('party.noFrontWarning')}`, 'tiny', 'ember3')
				.setOrigin(0.5, 0)
				.setWordWrapWidth(600)
				.setName('party-no-front');
		new Button(this, BASE_WIDTH / 2 - 70, 296, t('party.start'), () => this.startRun(), {
			w: 140,
			h: 32,
			sfx: 'sfx.ui.confirm',
			testId: 'party-start',
		}).setEnabled(this.picked.length === 3);
		// Veteran start is an option, offered only when a picked hero owns node III (GDD §22.5).
		const profile = loadProfile();
		if (this.picked.some((h) => canVeteran(profile, h))) {
			const caption = `${t('party.veteran')}: ${this.veteran ? t('settings.on') : t('settings.off')}`;
			new Button(this, BASE_WIDTH - 196, 320, caption, () => this.toggleVeteran(), {
				w: 180,
				h: 28,
				testId: 'party-veteran',
			}).setSelected(this.veteran);
		}
		new Button(this, 16, 320, t('settings.back'), () => this.scene.start('Menu'), {
			w: 80,
			h: 28,
			sfx: 'sfx.ui.cancel',
			testId: 'party-back',
		});
	}

	private toggleVeteran(): void {
		this.veteran = !this.veteran;
		this.render();
	}

	private toggle(id: HeroClass): void {
		if (this.picked.includes(id)) this.picked = this.picked.filter((h) => h !== id);
		else if (this.picked.length < 3) this.picked = [...this.picked, id];
		this.render();
	}

	private startRun(): void {
		if (this.picked.length !== 3) return;
		session.start(this.picked);
		// Skill-tree options (docs/gdd.md §22.5): unlocked cards always join the pools; heroes with
		// node III take the Veteran start when the player keeps the option on.
		const profile = loadProfile();
		const veteran = this.veteran ? this.picked.filter((h) => canVeteran(profile, h)) : [];
		if (session.state) {
			session.state = applyMeta(session.state, profile, veteran);
			session.save();
		}
		this.scene.start(session.sceneForScreen());
	}
}
