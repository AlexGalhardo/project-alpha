import Phaser from 'phaser';
import { type Command, type RewardView, rewardView } from '../core';
import { play, playMusic } from '../view/audio';
import { CARD_H, CARD_W, cardText, drawCard } from '../view/cards';
import { t } from '../view/i18n';
import { goNext, session } from '../view/session';
import { Button, backdrop, fitCamera, itemIcon, label, panel } from '../view/ui';

/** Reward after a won fight (GDD §11, docs/art-bible.md §11.7): gold, pick 1 of 3 cards or skip. */
export class RewardScene extends Phaser.Scene {
	private view!: RewardView;
	private layer!: Phaser.GameObjects.Container;
	private selected: number | null = null;
	private skipArmed = false;

	constructor() {
		super('Reward');
	}

	create(): void {
		fitCamera(this);
		playMusic(this, 'music.map');
		play(this, 'sfx.flow.reward');
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu', 0.6);
		this.skipArmed = false;
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
		// Event card offers (GDD 22.4) give no gold.
		if (view.gold > 0)
			this.layer.add(
				label(this, 112, 76, t('reward.gold', { gold: view.gold }), 'ui', 'gold2'),
			);
		if (view.equipmentGained) {
			const ic = itemIcon(this, 112, 88, view.equipmentGained);
			if (ic) this.layer.add(ic);
			this.layer.add(
				label(
					this,
					ic ? 132 : 112,
					92,
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
		// 120 px pitch leaves room for each card's full text under it (readable without a tap).
		const PITCH = 120;
		const startX = 320 - ((n - 1) * PITCH + CARD_W) / 2;
		view.cards.forEach((card, i) => {
			const sel = this.selected === i;
			const c = drawCard(this, card.cardId, false, { selected: sel });
			c.setPosition(startX + i * PITCH, sel ? 108 : 114);
			this.layer.add(
				label(
					this,
					startX + i * PITCH + CARD_W / 2,
					210,
					cardText(card.cardId, false),
					'tiny',
					'ash5',
				)
					.setOrigin(0.5, 0)
					.setAlign('center')
					.setWordWrapWidth(PITCH - 8),
			);
			c.setInteractive(
				new Phaser.Geom.Rectangle(CARD_W / 2, CARD_H / 2, CARD_W, CARD_H),
				Phaser.Geom.Rectangle.Contains,
			);
			c.setName(`reward-card-${i}`);
			c.on('pointerup', () => this.tapCard(i));
			this.layer.add(c);
		});
		if (this.selected !== null) {
			this.layer.add(
				label(this, 320, 252, t('picker.tapAgain'), 'tiny', 'gold2').setOrigin(0.5, 0),
			);
		}
		this.layer.add(
			new Button(this, 112, 264, t('reward.skip'), () => this.send({ type: 'skipReward' }), {
				w: 96,
				h: 44,
				sfx: 'sfx.ui.cancel',
				testId: 'reward-skip',
			}),
		);
		if (this.skipArmed) {
			this.layer.add(label(this, 112, 250, t('reward.skipConfirm'), 'tiny', 'ember3'));
		}
		const take = new Button(this, 432, 264, t('reward.take'), () => this.take(), {
			w: 96,
			h: 44,
			sfx: 'sfx.ui.confirm',
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

	/** Keys: 1–3 select, arrows move, Enter takes (or skips when there is no card), Esc clears, Esc twice skips. */
	private onKey(e: KeyboardEvent): void {
		const count = this.view.cards.length;
		const n = Number.parseInt(e.key, 10);
		if (n >= 1 && n <= count) this.tapCard(n - 1);
		else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && count > 0) {
			const step = e.key === 'ArrowRight' ? 1 : count - 1;
			this.selected = this.selected === null ? 0 : (this.selected + step) % count;
			this.refresh();
		} else if (e.key === 'Enter') {
			if (count === 0) this.send({ type: 'skipReward' });
			else this.take();
		} else if (e.key === 'Escape') {
			if (this.selected !== null) {
				this.selected = null;
				this.skipArmed = false;
			} else if (this.skipArmed) {
				this.send({ type: 'skipReward' });
				return;
			} else this.skipArmed = true;
			this.refresh();
		}
	}

	private send(cmd: Command): void {
		session.send(cmd);
		goNext(this);
	}
}
