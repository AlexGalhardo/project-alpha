import Phaser from 'phaser';
import {
	type CampView,
	type Command,
	campView,
	type HeroClass,
	type HeroState,
	maxHP,
} from '../core';
import { CARDS } from '../data/cards';
import { EQUIPMENT } from '../data/equipment';
import { play, playMusic } from '../view/audio';
import { cardName, cardText } from '../view/cards';
import { t } from '../view/i18n';
import { P } from '../view/palette';
import { session } from '../view/session';
import {
	Button,
	backdrop,
	fitCamera,
	fitText,
	itemIcon,
	keyNav,
	label,
	panel,
	portrait,
} from '../view/ui';

/**
 * Camp after every round except the boss (GDD §4.4, docs/art-bible.md §11.8): swap a hero, buy one
 * of three offers, equip from the stash, reorder ranks. Select a party hero first; swap, Vigil and
 * equip act on that hero.
 */
export class CampScene extends Phaser.Scene {
	private view!: CampView;
	private layer!: Phaser.GameObjects.Container;
	private hero: HeroClass | null = null;
	private reorderFrom: HeroClass | null = null;

	constructor() {
		super('Camp');
	}

	create(): void {
		fitCamera(this);
		keyNav(this, { activate: [' '] });
		playMusic(this, 'music.map');
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu', 0.6);
		this.hero = null;
		this.reorderFrom = null;
		this.layer = this.add.container(0, 0);
		this.refresh();
		// Keys: 1–3 select a party hero (target of swap, Vigil, equip), Enter or Esc leaves the camp.
		this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
			const party = session.state?.party ?? [];
			const n = Number.parseInt(e.key, 10);
			const hero = party[n - 1];
			if (hero) {
				this.hero = hero.id;
				this.refresh();
			} else if (e.key === 'Enter' || e.key === 'Escape') this.send({ type: 'campLeave' });
		});
	}

	private refresh(): void {
		const state = session.state;
		const view = state ? campView(state) : null;
		if (!state || !view) {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		this.view = view;
		const party = state.party;
		if (!this.hero || !party.some((h) => h.id === this.hero))
			this.hero = party[party.length - 1]?.id ?? null;
		this.layer.removeAll(true);
		this.layer.add(panel(this, 32, 24, 576, 312));
		this.layer.add(label(this, 48, 30, t('camp.title'), 'h2', 'gold2'));
		this.layer.add(
			label(this, 592, 32, `${t('hud.gold')} ${view.gold}`, 'ui', 'gold2').setOrigin(1, 0),
		);
		party.forEach((h, i) => {
			this.drawHero(h, 48 + i * 80, 56);
		});
		this.drawSwap(view, 300, 56);
		this.drawOffers(view);
		this.drawStash(view);
		this.layer.add(
			new Button(this, 496, 284, t('camp.leave'), () => this.send({ type: 'campLeave' }), {
				w: 96,
				h: 44,
				sfx: 'sfx.ui.confirm',
				testId: 'camp-leave',
			}),
		);
	}

	private drawHero(h: HeroState, x: number, y: number): void {
		const sel = this.hero === h.id;
		const frame = this.add.rectangle(x, y, 72, 96, sel ? P.gold2 : P.ash0).setOrigin(0);
		const inner = this.add.rectangle(x + 1, y + 1, 70, 94, P.ash1).setOrigin(0);
		const img = portrait(this, `hero.${h.id}`, x + 16, y + 4, 40, 50);
		inner.setInteractive().setName(`camp-hero-${h.id}`);
		inner.on('pointerup', () => {
			this.hero = h.id;
			this.refresh();
		});
		this.layer.add([frame, inner, img]);
		this.layer.add(
			label(this, x + 36, y + 56, t(`hero.${h.id}.name`), 'tiny', 'bone2').setOrigin(0.5, 0),
		);
		this.layer.add(
			label(
				this,
				x + 4,
				y + 68,
				`${h.hp}/${maxHP(h)}`,
				'tiny',
				h.injured ? 'blood2' : 'bone2',
			),
		);
		this.layer.add(
			label(this, x + 4, y + 80, `${t('stress.label')} ${h.stress}`, 'tiny', 'rift2'),
		);
		// Equipment slots: tap to unequip into the stash.
		(['weapon', 'relic'] as const).forEach((slot, i) => {
			const item = slot === 'weapon' ? h.weapon : h.relic;
			const b = new Button(
				this,
				x,
				y + 100 + i * 26,
				item ? t(`item.${item}.name`) : t(`equip.${slot}`),
				() => this.send({ type: 'equip', heroId: h.id, slot, item: null }, false),
				{
					w: 72,
					h: 24,
					font: 'tiny',
					testId: `camp-unequip-${h.id}-${slot}`,
					icon: item ? `icon.item.${item}` : undefined,
				},
			);
			b.setEnabled(item !== null);
			this.layer.add(b);
		});
		// Reorder: tap "rank" on two heroes to swap their ranks (free).
		const rank = new Button(
			this,
			x,
			y + 154,
			t('camp.rank', { rank: this.rankOf(h.id) }),
			() => this.reorder(h.id),
			{
				w: 72,
				h: 24,
				font: 'tiny',
				testId: `camp-rank-${h.id}`,
			},
		);
		rank.setSelected(this.reorderFrom === h.id);
		this.layer.add(rank);
	}

	private rankOf(id: HeroClass): number {
		return (session.state?.party.findIndex((h) => h.id === id) ?? 0) + 1;
	}

	private reorder(id: HeroClass): void {
		const party = session.state?.party;
		if (!party) return;
		if (this.reorderFrom === null || this.reorderFrom === id) {
			this.reorderFrom = this.reorderFrom === id ? null : id;
			this.refresh();
			return;
		}
		const order = party.map((h) => h.id);
		const a = order.indexOf(this.reorderFrom);
		const b = order.indexOf(id);
		[order[a], order[b]] = [order[b] as HeroClass, order[a] as HeroClass];
		this.reorderFrom = null;
		this.send({ type: 'reorder', order }, false);
	}

	private drawSwap(view: CampView, x: number, y: number): void {
		this.layer.add(label(this, x, y, t('camp.swapHero'), 'ui', 'bone2'));
		this.layer.add(
			label(
				this,
				x,
				y + 16,
				`${t('camp.price', { gold: view.swapPrice })} · ${t('camp.swapHint')}`,
				'tiny',
				'ash5',
			).setWordWrapWidth(290),
		);
		// The hint must stay above the swap buttons at every text size (A3.5).
		const hint = this.layer.last as Phaser.GameObjects.Text;
		fitText(hint, 290, 23);
		view.swapCandidates.forEach((id, i) => {
			const b = new Button(
				this,
				x + i * 148,
				y + 40,
				t('camp.swapFor', { hero: t(`hero.${id}.name`) }),
				() => {
					if (this.hero)
						this.send({ type: 'campSwap', leave: this.hero, join: id }, false);
				},
				{ w: 140, h: 44, font: 'tiny', testId: `camp-swap-${id}` },
			);
			b.setEnabled(!view.swapped && this.hero !== null && view.gold >= view.swapPrice);
			this.layer.add(b);
		});
	}

	private drawOffers(view: CampView): void {
		const y = 152;
		const tiles: {
			key: 'card' | 'equipment' | 'service';
			title: string;
			name: string;
			/** What it does, so the purchase is a decision (GDD 19). */
			effect: string;
			price: number;
			sold: boolean;
			item?: string;
		}[] = [];
		if (view.card) {
			const owner = CARDS[view.card.cardId]?.owner;
			tiles.push({
				key: 'card',
				title: t('camp.cardForSale'),
				name: `${cardName(view.card.cardId, false)}${owner ? ` · ${t(`hero.${owner}.name`)}` : ''}`,
				effect: cardText(view.card.cardId, false),
				price: view.card.price,
				sold: view.card.sold,
			});
		}
		if (view.equipment)
			tiles.push({
				key: 'equipment',
				title: t('camp.equipmentForSale'),
				name: t(`item.${view.equipment.item}.name`),
				effect: t(`item.${view.equipment.item}.effect`),
				item: view.equipment.item,
				price: view.equipment.price,
				sold: view.equipment.sold,
			});
		const svc = view.service;
		tiles.push({
			key: 'service',
			title: svc.kind === 'bind' ? t('camp.serviceBind') : t('camp.serviceVigil'),
			name: '',
			effect: svc.kind === 'bind' ? t('camp.serviceBindText') : t('camp.serviceVigilText'),
			price: svc.price,
			sold: svc.sold,
		});
		tiles.forEach((o, i) => {
			const x = 300 + (i % 2) * 152;
			const ty = y + Math.floor(i / 2) * 80;
			this.layer.add(panel(this, x, ty, 144, 76, 'ash1'));
			this.layer.add(label(this, x + 6, ty + 4, o.title, 'tiny', 'ash5'));
			const ic = o.item ? itemIcon(this, x + 6, ty + 16, o.item) : null;
			if (ic) this.layer.add(ic);
			let ey = ty + 16;
			if (o.name) {
				const n = label(
					this,
					x + (ic ? 26 : 6),
					ey,
					o.name,
					'tiny',
					'bone2',
				).setWordWrapWidth(ic ? 56 : 78);
				fitText(n, ic ? 56 : 78, 20);
				this.layer.add(n);
				ey = Math.max(ey + n.displayHeight, ic ? ty + 36 : 0) + 2;
			}
			this.layer.add(
				fitText(
					label(this, x + 6, ey, o.effect, 'tiny', 'ash5').setWordWrapWidth(78),
					78,
					ty + 73 - ey,
				),
			);
			const caption = o.sold ? t('shop.soldOut') : t('camp.price', { gold: o.price });
			const b = new Button(this, x + 88, ty + 18, caption, () => this.buy(o.key), {
				w: 52,
				h: 40,
				font: 'tiny',
				testId: `camp-buy-${o.key}`,
			});
			b.setEnabled(!o.sold && view.gold >= o.price);
			this.layer.add(b);
		});
	}

	private drawStash(view: CampView): void {
		const x = 48;
		const y = 240;
		this.layer.add(
			label(this, x, y, `${t('hud.stash')} (${view.stash.length}/6)`, 'tiny', 'ash5'),
		);
		view.stash.forEach((item, i) => {
			const slot = EQUIPMENT[item]?.slot ?? 'weapon';
			const b = new Button(
				this,
				x + (i % 3) * 76,
				y + 12 + Math.floor(i / 3) * 30,
				t(`item.${item}.name`),
				() => {
					if (this.hero)
						this.send({ type: 'equip', heroId: this.hero, slot, item }, false);
				},
				{
					w: 72,
					h: 28,
					font: 'tiny',
					testId: `camp-equip-${i}`,
					icon: `icon.item.${item}`,
				},
			);
			b.setEnabled(this.hero !== null);
			this.layer.add(b);
		});
	}

	private buy(offer: 'card' | 'equipment' | 'service'): void {
		const heroId =
			offer === 'service' && this.view.service.kind === 'vigil'
				? (this.hero ?? undefined)
				: undefined;
		this.send(heroId ? { type: 'campBuy', offer, heroId } : { type: 'campBuy', offer }, false);
	}

	/** Sends a command; leaves the scene when the screen changed, otherwise re-renders in place. */
	private send(cmd: Command, leaving = true): void {
		const result = session.send(cmd);
		if (cmd.type === 'campBuy' && result && !result.events.some((e) => e.type === 'invalid'))
			play(this, 'sfx.ui.coin');
		const next = session.sceneForScreen();
		if (leaving || next !== 'Camp') this.scene.start(next);
		else this.refresh();
	}
}
