import Phaser from 'phaser';
import { type CardInst, type Command, cardsToChoose, choiceAvailable } from '../core';
import { EVENTS, type EventChoiceDef } from '../data/events';
import { playMusic } from '../view/audio';
import { cardName } from '../view/cards';
import { t } from '../view/i18n';
import { goNext, session } from '../view/session';
import { Button, backdrop, fitCamera, label, panel } from '../view/ui';
import { openCardPicker } from './RestScene';

/** Placeholders of `event.<id>.choice<n>` filled from the choice's own numbers. */
function choiceVars(choice: EventChoiceDef): Record<string, number> {
	const vars: Record<string, number> = {};
	if (choice.cost) vars.gold = choice.cost;
	for (const e of choice.effects) {
		if (e.kind === 'healPctEach') vars.heal = e.pct;
		else if (e.kind === 'healEach') vars.heal = e.amount;
		else if (e.kind === 'stressEach' || e.kind === 'stressH1') {
			if (e.amount >= 0) vars.stress = e.amount;
			else vars.relief = -e.amount;
		} else if (e.kind === 'gold') vars.gold = e.amount;
		else if (e.kind === 'damageH1' || e.kind === 'damageLowest') vars.cost = e.amount;
	}
	return vars;
}

/** Event node (docs/gdd.md §22.4): every outcome, including the rolled item or cards, is shown first. */
export class EventScene extends Phaser.Scene {
	private picker: Phaser.GameObjects.Container | null = null;

	constructor() {
		super('Event');
	}

	create(): void {
		fitCamera(this);
		playMusic(this, 'music.map');
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu', 0.6);
		this.picker = null;
		const state = session.state;
		const ev = state?.event;
		const def = ev ? EVENTS[ev.id] : undefined;
		if (state?.phase !== 'event' || !ev || !def) {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		panel(this, 32, 16, 576, 328);
		label(this, 320, 24, t(`event.${ev.id}.title`), 'h2', 'gold2').setOrigin(0.5, 0);
		label(this, 48, 52, t(`event.${ev.id}.text`), 'tiny', 'bone2').setWordWrapWidth(544);

		const top = 360 - 16 - def.choices.length * 52;
		def.choices.forEach((choice, i) => {
			const y = top + i * 52;
			const ok = choiceAvailable(state, i);
			new Button(this, 48, y, `${i + 1}`, () => this.choose(i), {
				w: 40,
				h: 44,
				sfx: i === def.choices.length - 1 ? 'sfx.ui.cancel' : 'sfx.ui.confirm',
				testId: `event-choice-${i}`,
			}).setEnabled(ok);
			const text = label(
				this,
				96,
				y + 2,
				t(`event.${ev.id}.choice${i + 1}`, choiceVars(choice)),
				'tiny',
				ok ? 'bone2' : 'ash4',
			).setWordWrapWidth(496);
			// An unavailable choice says why: the price, or nothing left to give.
			const poor = (choice.cost ?? 0) > state.gold;
			const detail = ok
				? this.detail(choice)
				: poor
					? t('shop.notEnoughGold')
					: t('shop.soldOut');
			if (detail)
				label(
					this,
					96,
					text.y + text.height + 3,
					detail,
					'tiny',
					ok ? 'gold2' : 'ash4',
				).setWordWrapWidth(496);
		});

		this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
			if (this.picker?.active) return;
			const i = Number.parseInt(e.key, 10) - 1;
			if (i >= 0 && i < def.choices.length && choiceAvailable(state, i)) this.choose(i);
		});
	}

	/** The rolled outcome of a choice (which item, which cards), shown before it is taken. */
	private detail(choice: EventChoiceDef): string {
		const ev = session.state?.event;
		if (!ev) return '';
		const parts: string[] = [];
		for (const e of choice.effects) {
			if ((e.kind === 'relic' || e.kind === 'equipment') && ev.item)
				parts.push(t(`item.${ev.item}.name`));
			else if (e.kind === 'cardOffer')
				parts.push(ev.cards.map((c) => cardName(c, false)).join(', '));
			else if (e.kind === 'upgradeRandom') {
				const deck = session.state?.deck ?? [];
				parts.push(
					ev.upgradeUids
						.map((u) => deck.find((c) => c.uid === u))
						.filter((c): c is CardInst => !!c)
						.map((c) => `${cardName(c.cardId, false)} → ${cardName(c.cardId, true)}`)
						.join(', '),
				);
			}
		}
		return parts.join(' · ');
	}

	private choose(index: number): void {
		const state = session.state;
		const ev = state?.event;
		const choice = ev ? EVENTS[ev.id]?.choices[index] : undefined;
		if (!state || !choice) return;
		const effect = choice.effects.find((e) => cardsToChoose(state, e) > 0);
		if (!effect) {
			this.send({ type: 'eventChoose', index });
			return;
		}
		const need = cardsToChoose(state, effect);
		const picked: number[] = [];
		const pickNext = (): void => {
			this.picker = openCardPicker(this, {
				title: t(effect.kind === 'removeChoose' ? 'shop.chooseRemoval' : 'rest.chooseCard'),
				cards: state.deck.filter(
					(c) =>
						!picked.includes(c.uid) && (effect.kind === 'removeChoose' || !c.upgraded),
				),
				testPrefix: 'event-card',
				onPick: (card) => {
					picked.push(card.uid);
					if (picked.length < need) pickNext();
					else this.send({ type: 'eventChoose', index, cardUids: picked });
				},
				onBack: () => {
					this.picker = null;
				},
			});
		};
		pickNext();
	}

	private send(cmd: Command): void {
		session.send(cmd);
		goNext(this);
	}
}
