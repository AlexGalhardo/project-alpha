import Phaser from 'phaser';
import {
	type CombatView,
	type Command,
	chooseAutoCommand,
	combatView,
	type EnemyView,
	type GameEvent,
	type HandCardView,
	type HeroView,
	preview,
	type Target,
} from '../core';
import { app } from '../view/app';
import { play } from '../view/audio';
import { CARD_H, CARD_W, cardName, cardText, drawCard } from '../view/cards';
import { t } from '../view/i18n';
import { css, P } from '../view/palette';
import { session } from '../view/session';
import { Button, label, panel } from '../view/ui';

const HERO_X = (rank: number): number => 16 + (3 - rank) * 88;
const ENEMY_X = (rank: number): number => 304 + (rank - 1) * 80;
const SLOT_W = 80;

type UnitKey = string; // 'h:<class>' | 'e:<uid>'

/** Combat screen (GDD §5, docs/art-bible.md §11.5). Rules come from src/core; this only draws and animates. */
export class CombatScene extends Phaser.Scene {
	private view!: CombatView;
	private layer!: Phaser.GameObjects.Container;
	private selected: HandCardView | null = null;
	private busy = false;
	private unitPos = new Map<UnitKey, { x: number; y: number; w: number }>();
	private autoTimer: Phaser.Time.TimerEvent | null = null;
	private speedBtn!: Button;
	private autoBtn!: Button;

	constructor() {
		super('Combat');
	}

	create(): void {
		this.cameras.main.setBackgroundColor('#1b1a22');
		app.applySpeed(this);
		this.layer = this.add.container(0, 0);
		this.buildStatic();
		this.refresh();
		this.input.keyboard?.on('keydown', (e: KeyboardEvent) => this.onKey(e));
		const onResume = (): void => {
			app.applySpeed(this);
			this.refresh();
		};
		this.events.on('resume', onResume);
		// Scene events outlive a restart: remove what create() added so handlers do not pile up.
		this.events.once('shutdown', () => {
			this.events.off('resume', onResume);
			this.autoTimer = null;
			this.busy = false;
			this.selected = null;
		});
	}

	// ---------- static HUD ----------
	private buildStatic(): void {
		// Background bands sit under the dynamic layer; buttons stay above it.
		const g = this.add.graphics().setDepth(-1);
		g.fillStyle(P.ash1).fillRect(0, 0, 640, 24);
		g.fillStyle(P.gold0).fillRect(0, 23, 640, 1);
		g.fillStyle(P.ash1).fillRect(0, 222, 640, 138);
		g.fillStyle(P.ash0).fillRect(0, 222, 640, 1);
		g.fillStyle(P.ash0).fillRect(0, 190, 640, 1);
		new Button(this, 608, 0, 'II', () => this.openPause(), {
			w: 32,
			h: 24,
			testId: 'hud-pause',
		});
		this.speedBtn = new Button(this, 534, 228, '', () => this.cycleSpeed(), {
			w: 44,
			h: 28,
			testId: 'hud-speed',
		});
		this.autoBtn = new Button(this, 584, 228, t('hud.auto'), () => this.toggleAuto(), {
			w: 48,
			h: 28,
			testId: 'hud-auto',
		});
		new Button(this, 534, 312, t('hud.endTurn'), () => this.send({ type: 'endTurn' }), {
			w: 96,
			h: 40,
			testId: 'hud-end-turn',
		});
		this.updateToggles();
	}

	private updateToggles(): void {
		this.speedBtn.setCaption(`${app.speed}x`);
		this.autoBtn.setSelected(app.auto);
	}

	private cycleSpeed(): void {
		app.speed = ((app.speed % 3) + 1) as 1 | 2 | 3;
		app.applySpeed(this);
		this.updateToggles();
	}

	private toggleAuto(): void {
		app.auto = !app.auto;
		this.updateToggles();
		this.scheduleAuto();
	}

	private openPause(): void {
		this.autoTimer?.remove();
		this.scene.pause();
		this.scene.launch('Pause', { returnTo: 'Combat' });
	}

	// ---------- render ----------
	private refresh(): void {
		const state = session.state;
		const view = state ? combatView(state) : null;
		if (!view) {
			this.scene.start(session.nextSceneFrom(this.scene.key));
			return;
		}
		this.view = view;
		if (this.selected && !view.hand.some((c) => c.uid === this.selected?.uid))
			this.selected = null;
		this.layer.removeAll(true);
		this.unitPos.clear();
		this.drawTopBar();
		for (const h of view.heroes) this.drawHero(h);
		for (const e of view.enemies) this.drawEnemy(e);
		this.drawActionBand();
		if (this.selected) this.drawDetail(this.selected);
		this.scheduleAuto();
	}

	private drawTopBar(): void {
		const v = this.view;
		const state = session.state;
		this.layer.add(
			label(
				this,
				8,
				6,
				`${t('hud.act', { act: 1 })} · ${t('hud.round', { round: v.round })}`,
				'ui',
			),
		);
		v.queue.forEach((uid, i) => {
			const e = v.enemies.find((x) => x.uid === uid);
			if (!e) return;
			const x = 200 + i * 22;
			const frame = this.add.rectangle(x, 2, 20, 20, i === 0 ? P.gold2 : P.ash3).setOrigin(0);
			const img = this.add.image(x + 10, 12, `enemy.${e.key}`).setDisplaySize(18, 18);
			this.layer.add([frame, img]);
		});
		this.layer.add(label(this, 488, 6, `${t('hud.gold')} ${state?.gold ?? 0}`, 'ui', 'gold2'));
	}

	private statusRow(x: number, y: number, s: HeroView['status']): void {
		const entries: [string, number][] = [
			['block', s.block],
			['might', s.might],
			['marked', s.marked],
			['weakened', s.weakened],
			['bleed', s.bleed],
			['burn', s.burn],
			['ward', s.ward],
			['stunned', s.stunned ? 1 : 0],
		];
		let i = 0;
		for (const [key, n] of entries) {
			if (n <= 0) continue;
			const ix = x + i * 18;
			const icon = this.add.image(ix, y, `icon.status.${key}`).setOrigin(0);
			const num = label(this, ix + 10, y - 1, `${n}`, 'tiny', 'bone2');
			icon.setInteractive().on('pointerup', () => this.tooltip(t(`status.${key}.tooltip`)));
			this.layer.add([icon, num]);
			i++;
		}
	}

	private hpBar(x: number, y: number, hp: number, max: number, block: number): void {
		const g = this.add.graphics();
		g.fillStyle(P.ash0).fillRect(x - 1, y - 1, 66, 7);
		g.fillStyle(P.blood0).fillRect(x, y, 64, 5);
		g.fillStyle(P.blood2).fillRect(
			x,
			y,
			Math.round((64 * Math.max(0, hp)) / Math.max(1, max)),
			5,
		);
		if (block > 0) g.fillStyle(P.ward1).fillRect(x + 56, y - 2, 8, 9);
		this.layer.add(g);
		this.layer.add(
			label(this, x + 32, y + 6, `${hp}/${max}`, 'tiny', 'bone2').setOrigin(0.5, 0),
		);
	}

	private drawHero(h: HeroView): void {
		const x = HERO_X(h.rank);
		this.unitPos.set(`h:${h.id}`, { x, y: 24, w: SLOT_W });
		const img = this.add.image(x + 40, 190, `hero.${h.id}`).setOrigin(0.5, 1);
		this.layer.add(img);
		if (h.taunt)
			this.layer.add(this.add.rectangle(x + 40, 104, 70, 150).setStrokeStyle(1, P.gold1));
		const pips = this.add.graphics();
		for (let i = 0; i < 10; i++) {
			pips.fillStyle(i < h.stress ? P.rift2 : P.rift0).fillRect(x + 8 + i * 5, 186, 4, 3);
		}
		this.layer.add(pips);
		this.hpBar(x + 8, 193, h.hp, h.maxHP, h.status.block);
		this.statusRow(x + 4, 210, h.status);
		if (h.status.block > 0)
			this.layer.add(label(this, x + 66, 182, `${h.status.block}`, 'tiny', 'ward1'));
		const valid = this.validTargetFor({ type: 'hero', id: h.id });
		const zone = this.add
			.zone(x, 24, SLOT_W, 166)
			.setOrigin(0)
			.setInteractive()
			.setName(`hero-${h.id}`);
		zone.on('pointerup', () => this.onUnitTap({ type: 'hero', id: h.id }));
		this.layer.add(zone);
		if (valid)
			this.layer.add(
				this.add
					.rectangle(x + 2, 26, SLOT_W - 4, 162)
					.setOrigin(0)
					.setStrokeStyle(2, P.gold2),
			);
	}

	private drawEnemy(e: EnemyView): void {
		const x = ENEMY_X(e.rank);
		const w = SLOT_W * e.size;
		this.unitPos.set(`e:${e.uid}`, { x, y: 24, w });
		const img = this.add
			.image(x + w / 2, 190, `enemy.${e.key}`)
			.setOrigin(0.5, 1)
			.setFlipX(false);
		if (e.trait) img.setTint(P.ember3);
		this.layer.add(img);
		if (e.trait)
			this.layer.add(
				this.add.rectangle(x + w / 2, 104, w - 6, 150).setStrokeStyle(2, P.ember3),
			);
		this.hpBar(x + (w - 64) / 2, 193, e.hp, e.maxHP, e.status.block);
		this.statusRow(x + 4, 210, e.status);
		if (e.status.block > 0)
			this.layer.add(label(this, x + w - 14, 182, `${e.status.block}`, 'tiny', 'ward1'));
		if (e.intent) this.drawIntent(e, x, w);
		const zone = this.add
			.zone(x, 24, w, 166)
			.setOrigin(0)
			.setInteractive()
			.setName(`enemy-${e.uid}`);
		zone.on('pointerup', () => this.onUnitTap({ type: 'enemy', uid: e.uid }));
		this.layer.add(zone);
		if (this.validTargetFor({ type: 'enemy', uid: e.uid })) {
			this.layer.add(
				this.add
					.rectangle(x + 2, 26, w - 4, 162)
					.setOrigin(0)
					.setStrokeStyle(2, P.gold2),
			);
		}
	}

	private drawIntent(e: EnemyView, x: number, w: number): void {
		const it = e.intent;
		if (!it) return;
		const kind = it.telegraph
			? 'telegraph'
			: it.damage.length > 0
				? 'attack'
				: it.stress > 0
					? 'stress'
					: it.block > 0
						? 'block'
						: it.debuffs.length > 0
							? 'debuff'
							: 'buff';
		const parts: string[] = [];
		const first = it.damage[0];
		if (first) parts.push(first.hits > 1 ? `${first.perHit}x${first.hits}` : `${first.perHit}`);
		if (it.stress > 0) parts.push(`+${it.stress}s`);
		if (it.block > 0) parts.push(`${it.block}`);
		const cx = x + w / 2;
		const icon = this.add.image(cx - 14, 32, `icon.intent.${kind}`);
		const txt = label(this, cx - 6, 26, parts.join(' '), 'ui', 'bone2');
		icon.setInteractive().on('pointerup', () => this.tooltip(t(`intent.${it.intentId}`)));
		this.layer.add([icon, txt]);
		// Target markers on heroes: a small downward triangle above each targeted hero.
		for (const target of it.targets) {
			const pos = this.unitPos.get(`h:${target}`) ?? this.heroSlot(target);
			if (!pos) continue;
			const tri = this.add.triangle(pos.x + 40, 44, 0, 0, 10, 0, 5, 7, P.blood2);
			this.layer.add(tri);
		}
	}

	private heroSlot(id: string): { x: number; y: number; w: number } | null {
		const h = this.view.heroes.find((x) => x.id === id);
		return h ? { x: HERO_X(h.rank), y: 24, w: SLOT_W } : null;
	}

	private drawActionBand(): void {
		const v = this.view;
		const orb = this.add
			.circle(34, 258, 22, v.energy > 0 ? P.ember3 : P.ash3)
			.setStrokeStyle(1, P.ash0);
		this.layer.add(orb);
		this.layer.add(label(this, 34, 258, `${v.energy}/3`, 'h2', 'ash0').setOrigin(0.5));
		if (v.collapsePending > 0)
			this.layer.add(label(this, 12, 284, t('stress.collapse'), 'tiny', 'rift2'));
		this.layer.add(label(this, 64, 236, `${t('hud.draw')} ${v.piles.draw}`, 'tiny', 'ash5'));
		this.layer.add(
			label(this, 64, 250, `${t('hud.discard')} ${v.piles.discard}`, 'tiny', 'ash5'),
		);
		this.layer.add(
			label(this, 64, 264, `${t('hud.exhaust')} ${v.piles.exhaust}`, 'tiny', 'ash5'),
		);
		const n = v.hand.length;
		const spacing = n <= 6 ? CARD_W + 4 : Math.floor((404 - CARD_W) / Math.max(1, n - 1));
		const total = spacing * (n - 1) + CARD_W;
		const startX = 118 + Math.max(0, (404 - total) / 2);
		v.hand.forEach((card, i) => {
			const sel = this.selected?.uid === card.uid;
			const c = drawCard(this, card.cardId, card.upgraded, {
				playable: card.playable,
				selected: sel,
				cost: card.cost,
			});
			c.setPosition(startX + i * spacing, sel ? 242 : 258);
			c.setInteractive(
				new Phaser.Geom.Rectangle(CARD_W / 2, CARD_H / 2, CARD_W, CARD_H),
				Phaser.Geom.Rectangle.Contains,
			);
			c.setName(`card-${i}`);
			c.on('pointerup', () => this.onCardTap(card));
			this.layer.add(c);
		});
	}

	private drawDetail(card: HandCardView): void {
		const x = 236;
		const y = 70;
		this.layer.add(panel(this, x, y, 168, 120, 'ash1', 'gold1'));
		this.layer.add(
			label(this, x + 6, y + 4, cardName(card.cardId, card.upgraded), 'ui', 'gold2'),
		);
		this.layer.add(
			label(
				this,
				x + 6,
				y + 22,
				cardText(card.cardId, card.upgraded),
				'tiny',
				'bone2',
			).setWordWrapWidth(156),
		);
		const hint = !card.playable
			? (card.reason ?? t('hud.unplayable'))
			: card.autoTarget
				? t('hud.tapAgain')
				: t('hud.chooseTarget');
		this.layer.add(
			label(this, x + 6, y + 104, hint, 'tiny', card.playable ? 'ash5' : 'blood2'),
		);
	}

	// ---------- input ----------
	private validTargetFor(target: Target): boolean {
		const card = this.selected;
		if (!card?.playable || card.autoTarget || target === null) return false;
		return card.validTargets.some(
			(v) =>
				v !== null &&
				v.type === target.type &&
				(v.type === 'enemy'
					? target.type === 'enemy' && v.uid === target.uid
					: target.type === 'hero' && v.id === target.id),
		);
	}

	private onCardTap(card: HandCardView): void {
		if (this.busy) return;
		if (this.selected?.uid === card.uid) {
			if (card.playable && card.autoTarget) this.play(card, null);
			else this.selected = null;
		} else {
			this.selected = card;
		}
		this.refresh();
	}

	private onUnitTap(target: Target): void {
		if (this.busy || !this.selected) return;
		if (this.validTargetFor(target)) this.play(this.selected, target);
	}

	private play(card: HandCardView, target: Target): void {
		this.selected = null;
		this.send({ type: 'playCard', cardUid: card.uid, target });
	}

	private onKey(e: KeyboardEvent): void {
		if (this.busy || !this.scene.isActive()) return;
		const hand = this.view.hand;
		if (e.key >= '1' && e.key <= '9') {
			const card = hand[Number(e.key) - 1];
			if (card) this.onCardTap(card);
		} else if (e.key === '0' && hand[9]) this.onCardTap(hand[9]);
		else if (e.key === ' ') this.send({ type: 'endTurn' });
		else if (e.key === 'Enter' && this.selected) {
			const first = this.selected.validTargets[0];
			if (this.selected.playable) this.play(this.selected, first ?? null);
		} else if (e.key === 'Escape') {
			if (this.selected) {
				this.selected = null;
				this.refresh();
			} else this.openPause();
		} else if (e.key.toLowerCase() === 'a') this.toggleAuto();
		else if (e.key.toLowerCase() === 's') this.cycleSpeed();
	}

	// ---------- commands + animation ----------
	private send(cmd: Command): void {
		if (this.busy) return;
		const result = session.send(cmd);
		if (!result) return;
		const invalid = result.events.some((e) => e.type === 'invalid');
		if (invalid) play(this, 'sfx.card.invalid');
		else if (cmd.type === 'playCard') play(this, 'sfx.card.play');
		else if (cmd.type === 'endTurn') play(this, 'sfx.ui.end_turn');
		if (result.events.some((e) => e.type === 'combatWon')) play(this, 'sfx.flow.victory');
		if (result.events.some((e) => e.type === 'defeat')) play(this, 'sfx.flow.defeat');
		this.animate(result.events);
	}

	private animate(events: GameEvent[]): void {
		this.busy = true;
		const step = app.ms(110);
		let delay = 0;
		for (const ev of events) {
			const d = delay;
			const pos = this.eventPos(ev);
			if (pos) {
				this.time.delayedCall(d, () => this.popFor(ev, pos));
				delay += step;
			}
		}
		this.time.delayedCall(delay + app.ms(150), () => {
			this.busy = false;
			if (
				events.some(
					(e) =>
						e.type === 'combatWon' ||
						e.type === 'combatLost' ||
						e.type === 'defeat' ||
						e.type === 'victory',
				)
			) {
				this.time.delayedCall(app.ms(500), () =>
					this.scene.start(session.sceneForScreen()),
				);
				return;
			}
			this.refresh();
		});
	}

	private eventPos(ev: GameEvent): { x: number; y: number } | null {
		const ref = (u: { side: 'hero'; id: string } | { side: 'enemy'; uid: number }): string =>
			u.side === 'hero' ? `h:${u.id}` : `e:${u.uid}`;
		let key: string | null = null;
		if (ev.type === 'hit' || ev.type === 'dot' || ev.type === 'block' || ev.type === 'status')
			key = ref(ev.target);
		else if (
			ev.type === 'heal' ||
			ev.type === 'stress' ||
			ev.type === 'collapse' ||
			ev.type === 'fall'
		)
			key = `h:${ev.target}`;
		else if (ev.type === 'bossPhase' || ev.type === 'enemyDied') key = `e:${ev.uid}`;
		if (!key) return null;
		const p = this.unitPos.get(key);
		return p ? { x: p.x + p.w / 2, y: 100 } : null;
	}

	private popFor(ev: GameEvent, pos: { x: number; y: number }): void {
		const sfx: Partial<Record<GameEvent['type'], string>> = {
			hit: ev.type === 'hit' && ev.hpLost === 0 ? 'sfx.block.absorb' : 'sfx.hit.blunt',
			dot: 'sfx.status.burn',
			block: 'sfx.block.gain',
			heal: 'sfx.unit.heal',
			stress: 'sfx.stress.gain',
			collapse: 'sfx.stress.collapse',
			fall: 'sfx.unit.fall',
			enemyDied: 'sfx.unit.enemy_death',
			bossPhase: 'sfx.unit.boss_phase',
		};
		const key = sfx[ev.type];
		if (key) play(this, key);
		let text = '';
		let color: Parameters<typeof css>[0] = 'bone2';
		if (ev.type === 'hit') {
			text = ev.hpLost > 0 ? `-${ev.hpLost}` : `(${ev.absorbed})`;
			color = ev.hpLost > 0 ? 'blood2' : 'ward1';
			this.shake();
			this.flashAt(pos);
		} else if (ev.type === 'dot') {
			text = `-${ev.hpLost}`;
			color = ev.status === 'burn' ? 'ember3' : 'blood2';
		} else if (ev.type === 'block') {
			text = `+${ev.amount}`;
			color = 'ward1';
		} else if (ev.type === 'heal') {
			text = `+${ev.amount}`;
			color = 'rot2';
		} else if (ev.type === 'stress') {
			text = `${ev.amount > 0 ? '+' : ''}${ev.amount} ${t('stress.label')}`;
			color = 'rift2';
		} else if (ev.type === 'status') {
			text = `${t(`status.${ev.status}.name`)} ${ev.amount}`;
			color = 'gold2';
		} else if (ev.type === 'collapse') {
			text = t('stress.collapse');
			color = 'rift2';
			this.shake(true);
		} else if (ev.type === 'fall') {
			text = t('fallen.label');
			color = 'blood2';
		} else if (ev.type === 'bossPhase') {
			text = t('boss.phase2');
			color = 'ember3';
			this.shake(true);
			this.flashAt(pos, true);
		} else if (ev.type === 'enemyDied') {
			text = '†';
			color = 'ash5';
		}
		if (!text) return;
		const pop = label(this, pos.x, pos.y, text, 'ui', color).setOrigin(0.5);
		this.tweens.add({
			targets: pop,
			y: pos.y - 24,
			alpha: 0,
			duration: 700,
			ease: 'Cubic.easeOut',
			onComplete: () => pop.destroy(),
		});
	}

	private shake(big = false): void {
		if (app.settings.reduceShake) return;
		this.cameras.main.shake(big ? 220 : 90, big ? 0.008 : 0.004);
	}

	private flashAt(pos: { x: number; y: number }, big = false): void {
		if (app.settings.reduceFlashes) return;
		const r = this.add.rectangle(pos.x, pos.y, big ? 160 : 60, big ? 160 : 90, P.bone2, 0.6);
		this.tweens.add({
			targets: r,
			alpha: 0,
			duration: big ? 300 : 120,
			onComplete: () => r.destroy(),
		});
	}

	private tooltip(text: string): void {
		const tip = label(this, 320, 196, text, 'tiny', 'bone2')
			.setOrigin(0.5)
			.setBackgroundColor(css('ash1'))
			.setPadding(4, 2, 4, 2)
			.setWordWrapWidth(300);
		this.time.delayedCall(2500, () => tip.destroy());
	}

	// ---------- auto battle ----------
	private scheduleAuto(): void {
		this.autoTimer?.remove();
		this.autoTimer = null;
		if (!app.auto || this.busy || this.view?.phase !== 'player') return;
		this.autoTimer = this.time.delayedCall(app.ms(350), () => {
			const state = session.state;
			if (!state || this.busy || !app.auto) return;
			const cmd = chooseAutoCommand(state);
			if (cmd) this.send(cmd);
		});
	}

	/** Exposed for tests: result of a command without changing the run. */
	previewCommand(cmd: Command): ReturnType<typeof preview> | null {
		return session.state ? preview(session.state, cmd) : null;
	}
}
