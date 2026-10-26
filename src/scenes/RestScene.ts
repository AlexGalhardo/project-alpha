import Phaser from 'phaser';
import type { CardInst, Command } from '../core';
import { CARD_H, CARD_W, cardName, cardText, drawCard } from '../view/cards';
import { t } from '../view/i18n';
import { P } from '../view/palette';
import { goNext, session } from '../view/session';
import { Button, label, panel } from '../view/ui';

const GRID_X = 24;
const GRID_Y = 40;
const COLS = 8;
const ROWS = 2;
const PER_PAGE = COLS * ROWS;
const STEP_X = CARD_W + 8;
const STEP_Y = CARD_H + 8;

export interface CardPickerOptions {
	title: string;
	cards: readonly CardInst[];
	/** testId prefix for each card: `<prefix>-<index>`. */
	testPrefix: string;
	onPick: (card: CardInst) => void;
	onBack: () => void;
}

/**
 * Full-screen card picker: 8×2 grid of 64×90 cards, paged with the wheel, a drag or the arrow
 * buttons. First tap shows the card text; a second tap on the same card picks it (B30).
 */
export function openCardPicker(
	scene: Phaser.Scene,
	opts: CardPickerOptions,
): Phaser.GameObjects.Container {
	const root = scene.add.container(0, 0).setDepth(100);
	const pages = Math.max(1, Math.ceil(opts.cards.length / PER_PAGE));
	let page = 0;
	let selected: number | null = null;
	const grid = scene.add.container(0, 0);
	const blocker = scene.add.rectangle(0, 0, 640, 360, P.ash0, 0.85).setOrigin(0).setInteractive();
	root.add([blocker, panel(scene, 8, 8, 624, 344, 'ash1', 'gold1')]);
	root.add(label(scene, 20, 16, opts.title, 'h2', 'gold2'));
	const pageLabel = label(scene, 320, 252, '', 'tiny', 'ash5').setOrigin(0.5, 0);
	const detail = label(scene, 20, 270, '', 'tiny', 'bone2').setWordWrapWidth(470);
	root.add([grid, pageLabel, detail]);

	const render = (): void => {
		grid.removeAll(true);
		const slice = opts.cards.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
		slice.forEach((card, i) => {
			const index = page * PER_PAGE + i;
			const c = drawCard(scene, card.cardId, card.upgraded, { selected: selected === index });
			c.setPosition(
				GRID_X + (i % COLS) * STEP_X,
				GRID_Y + Math.floor(i / COLS) * STEP_Y - (selected === index ? 4 : 0),
			);
			c.setInteractive(
				new Phaser.Geom.Rectangle(CARD_W / 2, CARD_H / 2, CARD_W, CARD_H),
				Phaser.Geom.Rectangle.Contains,
			);
			c.setName(`${opts.testPrefix}-${index}`);
			c.on('pointerup', () => {
				if (selected === index) {
					opts.onPick(card);
					return;
				}
				selected = index;
				detail.setText(
					`${cardName(card.cardId, card.upgraded)}: ${cardText(card.cardId, card.upgraded)}  ${t('picker.tapAgain')}`,
				);
				render();
			});
			grid.add(c);
		});
		pageLabel.setText(
			opts.cards.length === 0
				? t('picker.empty')
				: t('picker.page', { page: page + 1, pages }),
		);
	};
	const turn = (delta: number): void => {
		const next = Phaser.Math.Clamp(page + delta, 0, pages - 1);
		if (next === page) return;
		page = next;
		render();
	};

	const prev = new Button(scene, 520, 300, '▲', () => turn(-1), {
		w: 44,
		h: 44,
		testId: `${opts.testPrefix}-prev`,
	});
	const next = new Button(scene, 572, 300, '▼', () => turn(1), {
		w: 44,
		h: 44,
		testId: `${opts.testPrefix}-next`,
	});
	const back = new Button(
		scene,
		24,
		300,
		t('settings.back'),
		() => {
			root.destroy();
			opts.onBack();
		},
		{ w: 96, h: 44, testId: `${opts.testPrefix}-back` },
	);
	root.add([prev, next, back]);

	const onWheel = (_p: unknown, _o: unknown, _dx: number, dy: number): void =>
		turn(dy > 0 ? 1 : -1);
	scene.input.on('wheel', onWheel);
	root.once('destroy', () => scene.input.off('wheel', onWheel));
	let dragStart: number | null = null;
	blocker.on('pointerdown', (p: Phaser.Input.Pointer) => {
		dragStart = p.y;
	});
	blocker.on('pointerup', (p: Phaser.Input.Pointer) => {
		if (dragStart !== null && Math.abs(p.y - dragStart) > 24) turn(p.y < dragStart ? 1 : -1);
		dragStart = null;
	});
	render();
	return root;
}

/** Rest node, row 9 (GDD §4.5, docs/art-bible.md §11.10): exclusive Recover / Temper / Pray. */
export class RestScene extends Phaser.Scene {
	constructor() {
		super('Rest');
	}

	create(): void {
		this.cameras.main.setBackgroundColor('#1b1a22');
		const state = session.state;
		if (state?.phase !== 'rest') {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		label(this, 320, 24, t('rest.title'), 'h2', 'gold2').setOrigin(0.5, 0);
		const options: {
			option: 'recover' | 'temper' | 'pray';
			title: string;
			text: string;
			color: number;
		}[] = [
			{
				option: 'recover',
				title: t('rest.recover'),
				text: t('rest.recoverText'),
				color: P.blood2,
			},
			{
				option: 'temper',
				title: t('rest.temper'),
				text: t('rest.temperText'),
				color: P.gold2,
			},
			{ option: 'pray', title: t('rest.pray'), text: t('rest.prayText'), color: P.rift2 },
		];
		const upgradable = state.deck.filter((c) => !c.upgraded);
		options.forEach((o, i) => {
			const x = 56 + i * 184;
			panel(this, x, 80, 160, 176);
			const g = this.add.graphics();
			// Shape + colour per option: cross (recover), anvil bar (temper), diamond (pray).
			g.fillStyle(o.color);
			if (o.option === 'recover')
				g.fillRect(x + 74, 96, 12, 36).fillRect(x + 62, 108, 36, 12);
			else if (o.option === 'temper')
				g.fillRect(x + 56, 104, 48, 12).fillRect(x + 72, 116, 16, 16);
			else
				g.fillTriangle(x + 80, 92, x + 98, 114, x + 62, 114).fillTriangle(
					x + 62,
					114,
					x + 98,
					114,
					x + 80,
					136,
				);
			label(this, x + 80, 146, o.title, 'ui', 'bone2').setOrigin(0.5, 0);
			label(this, x + 10, 166, o.text, 'tiny', 'ash5').setWordWrapWidth(140);
			const btn = new Button(this, x + 32, 208, o.title, () => this.choose(o.option), {
				w: 96,
				h: 40,
				testId: `rest-${o.option}`,
			});
			if (o.option === 'temper' && upgradable.length === 0) btn.setEnabled(false);
		});
	}

	private choose(option: 'recover' | 'temper' | 'pray'): void {
		const state = session.state;
		if (!state) return;
		if (option !== 'temper') {
			this.send({ type: 'restChoose', option });
			return;
		}
		openCardPicker(this, {
			title: t('rest.chooseCard'),
			cards: state.deck.filter((c) => !c.upgraded),
			testPrefix: 'rest-card',
			onPick: (card) =>
				this.send({ type: 'restChoose', option: 'temper', cardUid: card.uid }),
			onBack: () => undefined,
		});
	}

	private send(cmd: Command): void {
		session.send(cmd);
		goNext(this);
	}
}
