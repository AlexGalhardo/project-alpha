import Phaser from 'phaser';
import { playMusic } from '../view/audio';
import { t } from '../view/i18n';
import { goNext, session } from '../view/session';
import { Button, backdrop, label, panel } from '../view/ui';

/** Treasure node (docs/gdd.md §22.4): the gold and the rolled item are shown, one tap claims them. */
export class TreasureScene extends Phaser.Scene {
	constructor() {
		super('Treasure');
	}

	create(): void {
		playMusic(this, 'music.map');
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu', 0.6);
		const state = session.state;
		const treasure = state?.treasure;
		if (state?.phase !== 'treasure' || !treasure) {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		panel(this, 128, 56, 384, 232);
		label(this, 320, 66, t('treasure.title'), 'h2', 'gold2').setOrigin(0.5, 0);
		label(
			this,
			144,
			100,
			t('treasure.text', { gold: treasure.gold }),
			'tiny',
			'bone2',
		).setWordWrapWidth(352);
		label(this, 144, 160, `+${treasure.gold} ${t('hud.gold')}`, 'ui', 'gold2');
		if (treasure.item) {
			label(this, 144, 180, t(`item.${treasure.item}.name`), 'ui', 'ember3');
			label(
				this,
				144,
				198,
				t(`item.${treasure.item}.effect`),
				'tiny',
				'ash5',
			).setWordWrapWidth(352);
		}
		new Button(this, 240, 232, t('treasure.claim'), () => this.claim(), {
			w: 160,
			h: 40,
			sfx: 'sfx.ui.coin',
			testId: 'treasure-claim',
		});
		this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') this.claim();
		});
	}

	private claim(): void {
		session.send({ type: 'claimTreasure' });
		goNext(this);
	}
}
