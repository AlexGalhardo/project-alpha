import Phaser from 'phaser';
import { type Command, type RewardView, rewardView } from '../core';
import { CARD_H, CARD_W, cardName, cardText, drawCard } from '../view/cards';
import { t } from '../view/i18n';
import { goNext, session } from '../view/session';
import { Button, label, panel } from '../view/ui';

/** Reward after a won fight (GDD §11, docs/art-bible.md §11.7): gold, pick 1 of 3 cards or skip. */
export class RewardScene extends Phaser.Scene {
	private view!: RewardView;
	private layer!: Phaser.GameObjects.Container;
	private selected: number | null = null;

	constructor() {
		super('Reward');
	}

	create(): void {
		this.cameras.main.setBackgroundColor('#1b1a22');
		this.selected = null;
		this.layer = this.add.container(0, 0);
		this.refresh();
		this.input.keyboard?.on('keydown', (e: KeyboardEvent) => this.onKey(e));
	}

	private refresh(): void {
		const state = session.state;
		const view = state ? rewardView(state) : null;
		if (!view) {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		this.view = view;
		this.layer.removeAll(true);
		this.layer.add(panel(this, 96, 40, 448, 280));
		this.layer.add(label(this, 320, 48, t('reward.title'), 'h2', 'gold2').setOrigin(0.5, 0));
		this.layer.add(label(this, 112, 76, t('reward.gold', { gold: view.gold }), 'ui', 'gold2'));
		if (view.equipmentGained) {
			this.layer.add(
				label(
					this,
					112,
					90,
					t('reward.equipment', { item: t(`item.${view.equipmentGained}.name`) }),
					'tiny',
					'ember3',
				),
			);
		}
		this.layer.add(
			label(this, 320, 100, t('reward.pickCard'), 'tiny', 'ash5').setOrigin(0.5, 0),
		);
		const n = view.cards.length;
		const startX = 320 - (n * CARD_W + (n - 1) * 8) / 2;
		view.cards.forEach((card, i) => {
			const sel = this.selected === i;
			const c = drawCard(this, card.cardId, false, { selected: sel });
			c.setPosition(startX + i * (CARD_W + 8), sel ? 108 : 114);
			c.setInteractive(
				new Phaser.Geom.Rectangle(CARD_W / 2, CARD_H / 2, CARD_W, CARD_H),
				Phaser.Geom.Rectangle.Contains,
			);
			c.setName(`reward-card-${i}`);
			c.on('pointerup', () => this.tapCard(i));
			this.layer.add(c);
		});
		if (this.selected !== null) {
			const card = view.cards[this.selected];
			if (card) {
				this.layer.add(label(this, 112, 212, cardName(card.cardId, false), 'ui', 'gold2'));
				this.layer.add(
					label(
						this,
						112,
						228,
						`${cardText(card.cardId, false)}  ${t('picker.tapAgain')}`,
						'tiny',
						'bone2',
					).setWordWrapWidth(416),
				);
			}
		}
		this.layer.add(
			new Button(this, 112, 264, t('reward.skip'), () => this.send({ type: 'skipReward' }), {
				w: 96,
				h: 44,
				testId: 'reward-skip',
			}),
		);
		const take = new Button(this, 432, 264, t('reward.take'), () => this.take(), {
			w: 96,
			h: 44,
			testId: 'reward-take',
		});
		take.setEnabled(this.selected !== null);
		this.layer.add(take);
	}

	private tapCard(i: number): void {
		if (this.selected === i) {
			this.take();
			return;
		}
		this.selected = i;
		this.refresh();
	}

	private take(): void {
		if (this.selected === null) return;
		const card = this.view.cards[this.selected];
		if (card) this.send({ type: 'chooseReward', index: card.index });
	}

	private onKey(e: KeyboardEvent): void {
		const n = Number.parseInt(e.key, 10);
		if (n >= 1 && n <= this.view.cards.length) this.tapCard(n - 1);
		else if (e.key === 'Enter') this.take();
		else if (e.key === 'Escape') {
			this.selected = null;
			this.refresh();
		}
	}

	private send(cmd: Command): void {
		session.send(cmd);
		goNext(this);
	}
}
