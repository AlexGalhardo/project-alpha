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
		const story = label(
			this,
			48,
			52,
			t(`event.${ev.id}.text`),
			'tiny',
			'bone2',
		).setWordWrapWidth(544);
		// Choices follow the text (no empty band), but never run off the panel.
		const top = Math.min(360 - 16 - def.choices.length * 52, story.y + story.height + 24);
		def.choices.forEach((choice, i) => {
			const y = top + i * 52;
			const ok = choiceAvailable(state, i);
			// "Verb: outcome." → the verb is the button caption, the outcome sits beside it.
			const full = t(`event.${ev.id}.choice${i + 1}`, choiceVars(choice));
			const cut = full.indexOf(':');
			const verb = cut > 0 ? full.slice(0, cut) : full.replace(/\.$/, '');
			const after = cut > 0 ? full.slice(cut + 1).trim() : '';
			const rest = after.charAt(0).toUpperCase() + after.slice(1);
			new Button(this, 48, y, verb, () => this.choose(i), {
				w: 152,
				h: 44,
				font: 'tiny',
				sfx: i === def.choices.length - 1 ? 'sfx.ui.cancel' : 'sfx.ui.confirm',
				testId: `event-choice-${i}`,
			}).setEnabled(ok);
			const text = label(
				this,
				208,
				y + 2,
				rest,
				'tiny',
				ok ? 'bone2' : 'ash4',
			).setWordWrapWidth(384);
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
					208,
					text.y + text.height + 3,
					detail,
					'tiny',
					ok ? 'gold2' : 'ash4',
				).setWordWrapWidth(384);
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
		const party = session.state?.party ?? [];
		for (const e of choice.effects) {
			// Name the hero who pays, as it is now (same rule as src/core/events.ts).
			if (e.kind === 'damageH1' || e.kind === 'damageLowest' || e.kind === 'stressH1') {
				const h =
					e.kind === 'damageLowest'
						? [...party].sort((a, b) => a.hp - b.hp)[0]
						: party[0];
				const name = h ? t(`hero.${h.id}.name`) : '';
				if (name && !parts.includes(name)) parts.push(name);
			} else if ((e.kind === 'relic' || e.kind === 'equipment') && ev.item)
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
