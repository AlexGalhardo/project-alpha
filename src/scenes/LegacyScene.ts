import Phaser from 'phaser';
import { buyNode, type HeroClass, nextNodeCost, type Profile } from '../core';
import { TREE } from '../data/meta';
import { BASE_WIDTH } from '../platform/zoom';
import { playMusic } from '../view/audio';
import { cardName } from '../view/cards';
import { t } from '../view/i18n';
import { loadProfile, saveProfile } from '../view/profile';
import { Button, backdrop, fitCamera, label, panel, sized } from '../view/ui';

const HEROES: HeroClass[] = ['shieldbearer', 'marksman', 'arcanist', 'confessor', 'bombardier'];

/** Skill tree v1: spend banked Embers on one 3-node branch per hero (docs/gdd.md §22.5). */
export class LegacyScene extends Phaser.Scene {
	private profile!: Profile;

	constructor() {
		super('Legacy');
	}

	create(): void {
		fitCamera(this);
		this.profile = loadProfile();
		playMusic(this, 'music.menu');
		this.render();
		this.input.keyboard?.on('keydown-ESC', () => this.scene.start('Menu'));
	}

	private render(): void {
		this.children.removeAll(true);
		backdrop(this, 'bg.menu', 0.6);
		label(this, BASE_WIDTH / 2, 10, t('legacy.title'), 'h2', 'gold2').setOrigin(0.5, 0);
		label(
			this,
			BASE_WIDTH / 2,
			34,
			t('legacy.embers', { count: this.profile.embers }),
			'ui',
			'ember3',
		).setOrigin(0.5, 0);
		HEROES.forEach((hero, i) => {
			const x = 16 + i * 122;
			panel(this, x, 56, 114, 236);
			sized(this.add.image(x + 57, 132, `hero.${hero}`).setOrigin(0.5, 1));
			label(this, x + 57, 136, t(`hero.${hero}.name`), 'ui').setOrigin(0.5, 0);
			const owned = this.profile.nodes[hero];
			const [cardA, cardB] = TREE.cards[hero];
			const rows = [
				t('legacy.node.unlockCard', { card: cardName(cardA, false) }),
				t('legacy.node.unlockCard', { card: cardName(cardB, false) }),
				t('legacy.node.veteran', { card: cardName(cardA, false) }),
			];
			rows.forEach((text, n) => {
				const y = 156 + n * 34;
				const state = n < owned ? 'owned' : n === owned ? 'next' : 'locked';
				const mark = state === 'owned' ? '◆' : state === 'next' ? '▲' : '·';
				const color = state === 'owned' ? 'gold2' : state === 'next' ? 'bone2' : 'ash4';
				label(this, x + 6, y, `${mark} ${TREE.nodeCosts[n]}`, 'tiny', color);
				label(this, x + 30, y, text, 'tiny', color).setWordWrapWidth(80);
			});
			const cost = nextNodeCost(this.profile, hero);
			const caption = cost === null ? t('legacy.owned') : `${t('legacy.buy')} ${cost}`;
			new Button(this, x + 7, 258, caption, () => this.buy(hero), {
				w: 100,
				h: 28,
				testId: `legacy-buy-${hero}`,
			}).setEnabled(cost !== null && this.profile.embers >= cost);
		});
		new Button(this, 16, 320, t('settings.back'), () => this.scene.start('Menu'), {
			w: 80,
			h: 28,
			testId: 'legacy-back',
			sfx: 'sfx.ui.cancel',
		});
	}

	private buy(hero: HeroClass): void {
		const next = buyNode(this.profile, hero);
		if (next === this.profile) return;
		this.profile = next;
		saveProfile(next);
		this.render();
	}
}
