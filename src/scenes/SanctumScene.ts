import Phaser from 'phaser';
import { type CardInst, type Command, maxHP, type SanctumOption } from '../core';
import { SANCTUM } from '../data';
import { playMusic } from '../view/audio';
import { t } from '../view/i18n';
import { P } from '../view/palette';
import { goNext, session } from '../view/session';
import { Button, backdrop, fitCamera, label, panel } from '../view/ui';
import { openCardPicker } from './RestScene';

const OPTIONS: { option: SanctumOption; color: number }[] = [
	{ option: 'heal', color: P.rot2 },
	{ option: 'remove', color: P.blood2 },
	{ option: 'upgrade', color: P.gold2 },
	{ option: 'gold', color: P.gold2 },
];

/**
 * Sanctum between acts (docs/gdd.md §23.1, §23.6): injuries are already healed; the player takes one
 * of four recoveries. Tap a tile to select it, tap it again (or its button, or Enter) to confirm.
 */
export class SanctumScene extends Phaser.Scene {
	private selected: SanctumOption | null = null;
	private picker: Phaser.GameObjects.Container | null = null;
	private layer!: Phaser.GameObjects.Container;

	constructor() {
		super('Sanctum');
	}

	create(): void {
		fitCamera(this);
		playMusic(this, 'music.map');
		this.cameras.main.setBackgroundColor('#1b1a22');
		backdrop(this, 'bg.menu', 0.6);
		if (session.state?.phase !== 'sanctum') {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		this.selected = null;
		this.picker = null;
		this.layer = this.add.container(0, 0);
		this.render();
		this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
			if (this.picker?.active) return;
			const o = OPTIONS[Number.parseInt(e.key, 10) - 1];
			if (o && this.available(o.option)) {
				this.selected = o.option;
				this.render();
			} else if (e.key === 'Enter' && this.selected) this.confirm(this.selected);
		});
	}

	/** Purge and Temper need at least one eligible card. */
	private available(option: SanctumOption): boolean {
		const deck = session.state?.deck ?? [];
		if (option === 'remove') return deck.length > 0;
		if (option === 'upgrade') return deck.some((c) => !c.upgraded);
		return true;
	}

	/** The exact outcome, with the real numbers (GDD §23.6). */
	private outcome(option: SanctumOption): string {
		const state = session.state;
		if (!state) return '';
		if (option === 'heal') {
			const rows = state.party
				.filter((h) => h.hp < maxHP(h))
				.map((h) => `${t(`hero.${h.id}.name`)} ${h.hp} → ${maxHP(h)}`);
			return `${t('sanctum.healText')}${rows.length ? `\n${rows.join('\n')}` : ''}`;
		}
		if (option === 'remove') return t('sanctum.removeText', { count: SANCTUM.removeCount });
		if (option === 'upgrade') return t('sanctum.upgradeText', { count: SANCTUM.upgradeCount });
		return t('sanctum.goldText', { gold: SANCTUM.gold, total: state.gold + SANCTUM.gold });
	}

	private render(): void {
		this.layer.removeAll(true);
		this.layer.add(label(this, 320, 24, t('sanctum.title'), 'h2', 'gold2').setOrigin(0.5, 0));
		this.layer.add(label(this, 320, 52, t('sanctum.text'), 'tiny', 'ash5').setOrigin(0.5, 0));
		OPTIONS.forEach((o, i) => {
			const x = 40 + i * 144;
			const sel = this.selected === o.option;
			const ok = this.available(o.option);
			const tile = panel(
				this,
				x,
				96,
				128,
				160,
				sel ? 'iron0' : 'ash2',
				sel ? 'gold2' : 'ash0',
			);
			// Graphics draw in scene space, so the hit area sits at the tile position.
			tile.setInteractive(
				new Phaser.Geom.Rectangle(x, 96, 128, 160),
				Phaser.Geom.Rectangle.Contains,
			);
			tile.on('pointerup', () => {
				if (!ok) return;
				if (this.selected === o.option) this.confirm(o.option);
				else {
					this.selected = o.option;
					this.render();
				}
			});
			this.layer.add(tile);
			this.layer.add(this.icon(o.option, x + 64, 124, ok ? o.color : P.ash4));
			this.layer.add(
				label(
					this,
					x + 64,
					148,
					t(`sanctum.${o.option}`),
					'ui',
					ok ? 'bone2' : 'ash4',
				).setOrigin(0.5, 0),
			);
			this.layer.add(
				label(this, x + 6, 166, this.outcome(o.option), 'tiny', 'ash5').setWordWrapWidth(
					116,
				),
			);
			const b = new Button(
				this,
				x + 16,
				220,
				t(`sanctum.${o.option}`),
				() => this.confirm(o.option),
				{
					w: 96,
					h: 28,
					font: 'tiny',
					sfx: 'sfx.ui.confirm',
					testId: `sanctum-${o.option}`,
				},
			);
			b.setEnabled(ok);
			b.setSelected(sel);
			this.layer.add(b);
		});
	}

	/** Shape + colour per option: cross (Rest), X (Purge), anvil bar (Temper), coin (Tithe). */
	private icon(
		option: SanctumOption,
		cx: number,
		cy: number,
		color: number,
	): Phaser.GameObjects.Graphics {
		const g = this.add.graphics().fillStyle(color);
		if (option === 'heal')
			g.fillRect(cx - 6, cy - 16, 12, 32).fillRect(cx - 16, cy - 6, 32, 12);
		else if (option === 'remove') {
			g.lineStyle(8, color).lineBetween(cx - 14, cy - 14, cx + 14, cy + 14);
			g.lineBetween(cx + 14, cy - 14, cx - 14, cy + 14);
		} else if (option === 'upgrade')
			g.fillRect(cx - 22, cy - 10, 44, 10).fillRect(cx - 8, cy, 16, 14);
		else g.fillCircle(cx, cy, 15).fillStyle(P.gold0).fillCircle(cx, cy, 8);
		return g;
	}

	private confirm(option: SanctumOption): void {
		const state = session.state;
		if (!state || !this.available(option)) return;
		if (option === 'heal' || option === 'gold') {
			this.send({ type: 'sanctumChoose', option });
			return;
		}
		const upgrade = option === 'upgrade';
		const eligible = state.deck.filter((c) => !upgrade || !c.upgraded);
		const need = Math.min(
			upgrade ? SANCTUM.upgradeCount : SANCTUM.removeCount,
			eligible.length,
		);
		const picked: number[] = [];
		const next = (): void => {
			this.picker = openCardPicker(this, {
				title: t(upgrade ? 'sanctum.pickUpgrade' : 'sanctum.pickRemove', {
					n: picked.length + 1,
					count: need,
				}),
				cards: eligible.filter((c: CardInst) => !picked.includes(c.uid)),
				testPrefix: 'sanctum-card',
				onPick: (card) => {
					picked.push(card.uid);
					if (picked.length < need) next();
					else this.send({ type: 'sanctumChoose', option, cardUids: picked });
				},
				onBack: () => {
					// Back cancels the whole choice; nothing is spent.
					this.picker = null;
				},
			});
		};
		next();
	}

	private send(cmd: Command): void {
		session.send(cmd);
		goNext(this);
	}
}
