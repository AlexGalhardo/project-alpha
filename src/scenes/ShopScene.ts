import Phaser from 'phaser';
import { type Command, shopView } from '../core';
import { play, playMusic } from '../view/audio';
import { CARD_H, CARD_W, cardName, cardText, drawCard } from '../view/cards';
import { t } from '../view/i18n';
import { session } from '../view/session';
import { Button, backdrop, fitCamera, itemIcon, label, panel } from '../view/ui';
import { openCardPicker } from './RestScene';

/** Shop node (GDD §4.6, docs/art-bible.md §11.9): 5 cards, 2 equipment, one card removal per visit. */
export class ShopScene extends Phaser.Scene {
	private layer!: Phaser.GameObjects.Container;
	private selected: number | null = null;
	private picker: Phaser.GameObjects.Container | null = null;

	constructor() {
		super('Shop');
	}

	create(): void {
		fitCamera(this);
		playMusic(this, 'music.map');
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu', 0.6);
		this.selected = null;
		this.picker = null;
		this.layer = this.add.container(0, 0);
		this.refresh();
		// Keys: 1–5 select a card, Enter buys it (or leaves when nothing is selected), R removes a card, Esc leaves.
		this.input.keyboard?.on('keydown', (e: KeyboardEvent) => this.onKey(e));
	}

	private refresh(): void {
		const state = session.state;
		const view = state ? shopView(state) : null;
		if (!view) {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		this.layer.removeAll(true);
		this.layer.add(panel(this, 16, 32, 608, 312));
		this.layer.add(label(this, 32, 38, t('shop.title'), 'h2', 'gold2'));
		this.layer.add(
			label(this, 608, 38, `${t('hud.gold')} ${view.gold}`, 'ui', 'gold2').setOrigin(1, 0),
		);

		view.cards.forEach((offer, i) => {
			const x = 40 + i * 76;
			const sel = this.selected === i;
			const c = drawCard(this, offer.cardId, false, { selected: sel, playable: !offer.sold });
			c.setPosition(x, sel ? 60 : 64);
			c.setInteractive(
				new Phaser.Geom.Rectangle(CARD_W / 2, CARD_H / 2, CARD_W, CARD_H),
				Phaser.Geom.Rectangle.Contains,
			);
			c.setName(`shop-card-${i}`);
			c.on('pointerup', () => {
				this.selected = i;
				this.refresh();
			});
			this.layer.add(c);
			const caption = offer.sold ? t('shop.soldOut') : t('camp.price', { gold: offer.price });
			const b = new Button(
				this,
				x,
				158,
				caption,
				() => this.send({ type: 'shopBuy', kind: 'card', index: i }),
				{
					w: CARD_W,
					h: 24,
					font: 'tiny',
					testId: `shop-buy-card-${i}`,
				},
			);
			b.setEnabled(!offer.sold && view.gold >= offer.price);
			this.layer.add(b);
		});

		if (this.selected !== null) {
			const offer = view.cards[this.selected];
			if (offer) {
				this.layer.add(label(this, 432, 64, cardName(offer.cardId, false), 'ui', 'gold2'));
				this.layer.add(
					label(
						this,
						432,
						82,
						cardText(offer.cardId, false),
						'tiny',
						'bone2',
					).setWordWrapWidth(176),
				);
			}
		}

		view.equipment.forEach((offer, i) => {
			const x = 40 + i * 200;
			this.layer.add(panel(this, x, 192, 192, 72, 'ash1'));
			const ic = itemIcon(this, x + 6, 196, offer.item);
			if (ic) this.layer.add(ic);
			this.layer.add(
				label(this, x + (ic ? 26 : 6), 200, t(`item.${offer.item}.name`), 'tiny', 'bone2'),
			);
			this.layer.add(
				label(
					this,
					x + 6,
					216,
					t(`item.${offer.item}.effect`),
					'tiny',
					'ash5',
				).setWordWrapWidth(120),
			);
			const caption = offer.sold ? t('shop.soldOut') : t('camp.price', { gold: offer.price });
			const b = new Button(
				this,
				x + 132,
				206,
				caption,
				() => this.send({ type: 'shopBuy', kind: 'equipment', index: i }),
				{
					w: 56,
					h: 44,
					font: 'tiny',
					testId: `shop-buy-equipment-${i}`,
				},
			);
			b.setEnabled(!offer.sold && view.gold >= offer.price && view.stash.length < 6);
			this.layer.add(b);
		});

		this.layer.add(panel(this, 448, 192, 160, 56, 'ash1'));
		this.layer.add(label(this, 454, 196, t('shop.removal'), 'tiny', 'bone2'));
		this.layer.add(
			label(this, 454, 208, t('camp.price', { gold: view.removalPrice }), 'tiny', 'gold2'),
		);
		const remove = new Button(this, 540, 200, t('shop.buy'), () => this.openRemoval(), {
			w: 64,
			h: 44,
			font: 'tiny',
			testId: 'shop-remove',
		});
		remove.setEnabled(view.canRemove);
		this.layer.add(remove);

		this.layer.add(
			new Button(this, 504, 288, t('shop.leave'), () => this.send({ type: 'leaveShop' }), {
				w: 96,
				h: 44,
				sfx: 'sfx.ui.confirm',
				testId: 'shop-leave',
			}),
		);
	}

	private openRemoval(): void {
		const state = session.state;
		if (!state) return;
		this.picker = openCardPicker(this, {
			title: t('shop.chooseRemoval'),
			cards: state.deck,
			testPrefix: 'shop-remove-card',
			onPick: (card) => this.send({ type: 'shopRemoveCard', cardUid: card.uid }),
			onBack: () => {
				this.picker = null;
				this.refresh();
			},
		});
	}

	private onKey(e: KeyboardEvent): void {
		if (this.picker?.active) return; // the picker handles its own keys
		const state = session.state;
		const view = state ? shopView(state) : null;
		if (!view) return;
		const n = Number.parseInt(e.key, 10);
		if (n >= 1 && n <= view.cards.length) {
			this.selected = n - 1;
			this.refresh();
		} else if (e.key === 'Enter') {
			const offer = this.selected === null ? undefined : view.cards[this.selected];
			if (offer && !offer.sold && view.gold >= offer.price && this.selected !== null) {
				this.send({ type: 'shopBuy', kind: 'card', index: this.selected });
			} else if (this.selected === null) this.send({ type: 'leaveShop' });
		} else if (e.key.toLowerCase() === 'r' && view.canRemove) this.openRemoval();
		else if (e.key === 'Escape') this.send({ type: 'leaveShop' });
	}

	/** Re-renders in place while still in the shop; otherwise moves to the next screen. */
	private send(cmd: Command): void {
		const result = session.send(cmd);
		const bought = cmd.type === 'shopBuy' || cmd.type === 'shopRemoveCard';
		if (bought && result && !result.events.some((e) => e.type === 'invalid'))
			play(this, 'sfx.ui.coin');
		const next = session.sceneForScreen();
		if (next !== 'Shop') this.scene.start(next);
		else this.scene.restart();
	}
}
