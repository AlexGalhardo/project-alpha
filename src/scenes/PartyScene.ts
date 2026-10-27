import Phaser from 'phaser';
import { applyMeta, applyRite, canVeteran, type HeroClass } from '../core';
import { HEROES } from '../data/heroes';
import { RITES } from '../data/rites';
import { BASE_WIDTH } from '../platform/zoom';
import { playMusic } from '../view/audio';
import { t } from '../view/i18n';
import { P } from '../view/palette';
import { loadProfile } from '../view/profile';
import { session } from '../view/session';
import { Button, backdrop, fitCamera, keyNav, label, panel, sized } from '../view/ui';

const ROSTER: HeroClass[] = ['shieldbearer', 'marksman', 'arcanist', 'confessor', 'bombardier'];

/** Pick 3 of 5; the order of picking sets ranks 1→3 (B02, docs/art-bible.md §11.3). */
export class PartyScene extends Phaser.Scene {
	private picked: HeroClass[] = [];
	private veteran = true;
	/** Chosen Rite (docs/gdd.md §13.3); starts at the highest unlocked one. */
	private rite = 0;

	constructor() {
		super('Party');
	}

	create(): void {
		fitCamera(this);
		keyNav(this);
		playMusic(this, 'music.menu');
		this.picked = ['shieldbearer', 'confessor', 'marksman'];
		this.rite = loadProfile().unlockedRite;
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
			sized(this.add.image(x + 56, 140, `hero.${id}`).setOrigin(0.5, 1));
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
			230,
			t('party.selected', { count: this.picked.length }),
			'ui',
		).setOrigin(0.5, 0);
		label(this, BASE_WIDTH / 2, 244, t('party.defaultHint'), 'tiny', 'ash5').setOrigin(0.5, 0);
		this.drawRiteRow();
		// Allowed but weak (balance report: three back-liners win about 2%), so warn instead of block.
		if (this.picked.length === 3 && !this.picked.some((id) => HEROES[id].frontOrder <= 1))
			label(this, BASE_WIDTH / 2, 256, `▲ ${t('party.noFrontWarning')}`, 'tiny', 'ember3')
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

	/** ◀ Rite n ▶ (only up to the unlocked Rite) and a button that lists the active rules. */
	private drawRiteRow(): void {
		const unlocked = loadProfile().unlockedRite;
		const y = 270;
		new Button(this, 232, y - 2, '◀', () => this.setRite(this.rite - 1), {
			w: 28,
			h: 24,
			font: 'tiny',
			testId: 'party-rite-down',
		}).setEnabled(this.rite > 0);
		label(
			this,
			BASE_WIDTH / 2,
			y + 5,
			this.rite > 0 ? t('party.rite', { n: this.rite }) : t('party.riteNone'),
			'ui',
			this.rite > 0 ? 'ember3' : 'ash5',
		)
			.setOrigin(0.5, 0)
			.setName('party-rite');
		new Button(this, 380, y - 2, '▶', () => this.setRite(this.rite + 1), {
			w: 28,
			h: 24,
			font: 'tiny',
			testId: 'party-rite-up',
		}).setEnabled(this.rite < unlocked);
		if (this.rite > 0)
			new Button(this, 412, y, '?', () => this.showRules(unlocked), {
				w: 20,
				h: 20,
				font: 'tiny',
				testId: 'party-rite-rules',
			});
	}

	private setRite(rite: number): void {
		this.rite = Math.max(0, Math.min(loadProfile().unlockedRite, rite));
		this.render();
	}

	/** Overlay listing every rule active at the chosen Rite (rules are cumulative). */
	private showRules(unlocked: number): void {
		const root = this.add.container(0, 0).setDepth(100);
		const shade = this.add
			.rectangle(0, 0, 640, 360, P.ash0, 0.85)
			.setOrigin(0)
			.setInteractive();
		root.add(shade);
		root.add(panel(this, 120, 40, 400, 280));
		root.add(
			label(this, 320, 50, t('party.rite', { n: this.rite }), 'h2', 'ember3').setOrigin(
				0.5,
				0,
			),
		);
		for (let i = 1; i <= this.rite; i++) {
			root.add(label(this, 136, 64 + i * 18, `${i}. ${t(`rite.${i}`)}`, 'tiny', 'bone2'));
		}
		if (unlocked < RITES.max && this.rite === unlocked)
			root.add(
				label(
					this,
					320,
					268,
					t('party.riteLocked', { n: unlocked }),
					'tiny',
					'ash5',
				).setOrigin(0.5, 0),
			);
		const close = new Button(this, 270, 284, t('settings.back'), () => root.destroy(), {
			w: 100,
			h: 28,
			sfx: 'sfx.ui.cancel',
			testId: 'party-rite-close',
		});
		root.add(close);
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
			session.state = applyRite(applyMeta(session.state, profile, veteran), this.rite);
			session.save();
		}
		this.scene.start(session.sceneForScreen());
	}
}
