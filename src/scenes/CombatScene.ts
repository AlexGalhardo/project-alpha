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
import { ACT_RULES, CARDS } from '../data';
import { app } from '../view/app';
import { play, playMusic } from '../view/audio';
import { CARD_H, CARD_W, cardKeywords, cardName, cardText, drawCard } from '../view/cards';
import { enemyName, t } from '../view/i18n';
import { css, P, type PaletteKey } from '../view/palette';
import { session } from '../view/session';
import { Button, backdrop, fitCamera, label, panel, portrait, sized, standing } from '../view/ui';

const HERO_X = (rank: number): number => 16 + (3 - rank) * 88;
const ENEMY_X = (rank: number): number => 304 + (rank - 1) * 80;
const SLOT_W = 80;

type UnitKey = string; // 'h:<class>' | 'e:<uid>'

interface UnitDelta {
	name: string;
	hpFrom: number;
	hpTo: number;
	block: number;
	stress: number;
	statuses: [string, number][];
}

interface UnitSnapshot {
	name: string;
	hp: number;
	block: number;
	stress: number;
	status: HeroView['status'];
}

const STATUS_KEYS = ['might', 'marked', 'weakened', 'bleed', 'burn', 'ward'] as const;

/** Named elites (i18n `elite.<id>.name`) by their base enemy. */
const ELITE_NAME: Record<string, string> = {
	rust_templar: 'templar_captain',
	ossified_brute: 'calcified_brute',
};

/** i18n entry that holds each elite trait's text. */
const TRAIT_KEY: Record<NonNullable<EnemyView['trait']>, string> = {
	oathwall: 'templar_captain',
	calcified: 'calcified_brute',
};

function snapshots(view: CombatView | null): Map<UnitKey, UnitSnapshot> {
	const out = new Map<UnitKey, UnitSnapshot>();
	if (!view) return out;
	for (const h of view.heroes)
		out.set(`h:${h.id}`, {
			name: t(`hero.${h.id}.name`),
			hp: h.hp,
			block: h.status.block,
			stress: h.stress,
			status: h.status,
		});
	for (const e of view.enemies)
		out.set(`e:${e.uid}`, {
			name: enemyName(e.key),
			hp: e.hp,
			block: e.status.block,
			stress: 0,
			status: e.status,
		});
	return out;
}

/** Per-unit change between two combat views; units missing afterwards are dead (HP 0). */
function diffViews(before: CombatView, after: CombatView | null): Map<UnitKey, UnitDelta> {
	const a = snapshots(before);
	const b = snapshots(after);
	const out = new Map<UnitKey, UnitDelta>();
	for (const [key, s] of a) {
		const n = b.get(key);
		const hpTo = n ? n.hp : key.startsWith('e:') ? 0 : s.hp;
		const statuses: [string, number][] = [];
		if (n) {
			for (const k of STATUS_KEYS) {
				const d = n.status[k] - s.status[k];
				if (d > 0) statuses.push([k, d]);
			}
			if (n.status.stunned && !s.status.stunned) statuses.push(['stunned', 1]);
		}
		const d: UnitDelta = {
			name: s.name,
			hpFrom: s.hp,
			hpTo,
			block: n ? n.block - s.block : -s.block,
			stress: n ? n.stress - s.stress : 0,
			statuses,
		};
		if (d.hpFrom !== d.hpTo || d.block !== 0 || d.stress !== 0 || statuses.length > 0)
			out.set(key, d);
	}
	return out;
}

function targetKey(target: Target): UnitKey | null {
	if (!target) return null;
	return target.type === 'enemy' ? `e:${target.uid}` : `h:${target.id}`;
}

/** Combat screen (GDD §5, docs/art-bible.md §11.5). Rules come from src/core; this only draws and animates. */
// Core status names to generated sound keys; statuses without a sound stay silent.
/** Feet line of every unit (docs/art-bible.md combat layout). */
const FLOOR_Y = 190;

const STATUS_SFX: Record<string, string> = {
	marked: 'sfx.status.marked',
	weakened: 'sfx.status.weakened',
	bleed: 'sfx.status.bleed',
	burn: 'sfx.status.burn',
	ward: 'sfx.status.ward',
	stunned: 'sfx.status.stun',
};

export class CombatScene extends Phaser.Scene {
	private view!: CombatView;
	private layer!: Phaser.GameObjects.Container;
	private selected: HandCardView | null = null;
	private busy = false;
	/** One command tapped during an animation; it runs when the animation ends (latest wins). */
	private queued: Command | null = null;
	private unitPos = new Map<UnitKey, { x: number; y: number; w: number }>();
	/** Unit sprites of the current frame: pop-ups start at their top, lunges move them. */
	private unitImg = new Map<UnitKey, Phaser.GameObjects.Image>();
	private tipObjs: Phaser.GameObjects.GameObject[] = [];
	private autoTimer: Phaser.Time.TimerEvent | null = null;
	private speedBtn!: Button;
	private autoBtn!: Button;
	/** Result previews of the selected card, one per valid target (GDD invariant: preview before confirm). */
	private previews: { target: Target; deltas: Map<UnitKey, UnitDelta> }[] = [];
	private previewUid: number | null = null;
	private focusIdx = 0;

	constructor() {
		super('Combat');
	}

	create(): void {
		fitCamera(this);
		this.cameras.main.setBackgroundColor('#1b1a22');
		const bg = backdrop(
			this,
			[`bg.combat.act${session.state?.act ?? 1}`, 'bg.combat.act1'],
			0.35,
		);
		// Stitched 1080p backdrops (scripts/assets/stitch-bg.ts) have their floor line at 270 of 360:
		// lift them so it meets the units' feet (FLOOR_Y); the empty sky above leaves the screen.
		if (bg && bg.texture.getSourceImage().height >= 1080) bg.setY(FLOOR_Y - 270);
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
			this.queued = null;
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
		g.fillStyle(P.ash0).fillRect(0, FLOOR_Y, 640, 1);
		// Tapping the stage outside any unit cancels the selected card (GDD 15.3).
		this.add
			.zone(0, 24, 640, 198)
			.setOrigin(0)
			.setDepth(-1)
			.setInteractive()
			.on('pointerup', () => {
				if (!this.selected || this.busy) return;
				this.selected = null;
				this.refresh();
			});
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
		const act = state?.act ?? 1;
		// Per-act tracks; the last act's boss has its own. Act 1 tracks play while they load.
		if (view.kind === 'boss')
			playMusic(
				this,
				act >= ACT_RULES.acts ? 'music.boss.final' : 'music.boss',
				'music.boss',
			);
		else playMusic(this, act > 1 ? `music.combat.act${act}` : 'music.combat', 'music.combat');
		if (this.selected && !view.hand.some((c) => c.uid === this.selected?.uid))
			this.selected = null;
		this.layer.removeAll(true);
		this.unitPos.clear();
		this.unitImg.clear();
		this.drawTopBar();
		this.computePreviews();
		for (const h of view.heroes) this.drawHero(h);
		for (const e of view.enemies) this.drawEnemy(e);
		this.drawIncoming();
		this.drawPreviewChips();
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
				`${t('hud.act', { act: session.state?.act ?? 1 })} · ${t('hud.round', { round: v.round })} · ${t('hud.turn', { turn: v.turn })}`,
				'ui',
			),
		);
		// Enrage (GDD 5.2) is announced two turns ahead, then stays on screen while it lasts.
		if (v.turn >= v.enrageTurn - 2) {
			const text = v.enraged
				? t('hud.enraged')
				: t('hud.enrageIn', { n: v.enrageTurn - v.turn });
			const warn = label(this, 360, 6, text, 'ui', 'ember3');
			warn.setInteractive().on('pointerup', () =>
				this.tooltip(t('status.enraged.tooltip', { turn: v.enrageTurn })),
			);
			this.layer.add(warn);
		}
		v.queue.forEach((uid, i) => {
			const e = v.enemies.find((x) => x.uid === uid);
			if (!e) return;
			const x = 200 + i * 22;
			const frame = this.add
				.rectangle(x, 2, 20, 20, P.ash1)
				.setOrigin(0)
				.setStrokeStyle(1, i === 0 ? P.gold2 : P.ash3);
			const img = portrait(this, `enemy.${e.key}`, x + 1, 3, 18, 18);
			frame.setInteractive().on('pointerup', () => {
				const order = v.queue
					.map((u) => v.enemies.find((x) => x.uid === u))
					.filter((x): x is EnemyView => !!x)
					.map((x) => enemyName(x.key));
				this.tooltip(`${t('hud.turnQueue')}: ${order.join(' → ')}`);
			});
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
			const icon = sized(this.add.image(ix, y, `icon.status.${key}`).setOrigin(0));
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
		const img = standing(this, `hero.${h.id}`, x + 40, FLOOR_Y);
		this.unitImg.set(`h:${h.id}`, img);
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
		// The zone starts below the intent strip (y 24–44) so intent icons keep their own taps.
		const zone = this.add
			.zone(x, 44, SLOT_W, FLOOR_Y - 44)
			.setOrigin(0)
			.setInteractive()
			.setName(`hero-${h.id}`);
		zone.on('pointerup', () => this.onUnitTap({ type: 'hero', id: h.id }));
		this.layer.add(zone);
		this.targetMark({ type: 'hero', id: h.id }, x, SLOT_W);
	}

	private drawEnemy(e: EnemyView): void {
		const x = ENEMY_X(e.rank);
		const w = SLOT_W * e.size;
		this.unitPos.set(`e:${e.uid}`, { x, y: 24, w });
		// Enemy sprites are drawn facing left; a size-2 boss is centred across its two slots.
		const img = standing(this, `enemy.${e.key}`, x + Math.floor(w / 2), FLOOR_Y);
		if (e.trait) img.setTint(P.ember3);
		this.unitImg.set(`e:${e.uid}`, img);
		this.layer.add(img);
		if (e.trait)
			this.layer.add(
				this.add.rectangle(x + w / 2, 104, w - 6, 150).setStrokeStyle(2, P.ember3),
			);
		this.hpBar(x + (w - 64) / 2, 193, e.hp, e.maxHP, e.status.block);
		this.statusRow(x + 4, 210, e.status);
		if (e.intent) this.drawIntent(e, x, w);
		const zone = this.add
			.zone(x, 44, w, FLOOR_Y - 44)
			.setOrigin(0)
			.setInteractive()
			.setName(`enemy-${e.uid}`);
		zone.on('pointerup', () => this.onUnitTap({ type: 'enemy', uid: e.uid }));
		this.layer.add(zone);
		this.targetMark({ type: 'enemy', uid: e.uid }, x, w);
	}

	/** Valid targets get a gold outline; the focused one pulses (shape + motion, not only colour). */
	private targetMark(target: Target, x: number, w: number): void {
		if (!this.validTargetFor(target)) return;
		const focused = targetKey(this.focusedTarget()) === targetKey(target);
		const r = this.add
			.rectangle(x + 2, 26, w - 4, 162)
			.setOrigin(0)
			.setStrokeStyle(focused ? 3 : 1, focused ? P.ember3 : P.gold2);
		this.layer.add(r);
		if (focused)
			this.tweens.add({ targets: r, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
	}

	// ---------- result preview ----------
	private focusedTarget(): Target {
		return this.previews[this.focusIdx]?.target ?? null;
	}

	/** Runs `preview` once per valid target when the selection changes (not per frame). */
	private computePreviews(): void {
		const card = this.selected;
		const state = session.state;
		if (!card?.playable || !state) {
			this.previews = [];
			this.previewUid = null;
			return;
		}
		if (this.previewUid === card.uid) return;
		this.previewUid = card.uid;
		this.focusIdx = 0;
		const targets: Target[] = card.autoTarget ? [null] : card.validTargets;
		this.previews = targets.map((target) => {
			const result = preview(state, { type: 'playCard', cardUid: card.uid, target });
			return { target, deltas: diffViews(this.view, combatView(result.state)) };
		});
	}

	/** Chips above the HP bar (y 176) for every unit the focused play would change. */
	private drawPreviewChips(): void {
		const p = this.previews[this.focusIdx];
		if (!p) return;
		for (const [key, d] of p.deltas) {
			const pos = this.unitPos.get(key);
			if (!pos) continue;
			const parts: [string, PaletteKey][] = [];
			if (d.hpTo !== d.hpFrom)
				parts.push([
					`${d.hpFrom}→${Math.max(0, d.hpTo)}`,
					d.hpTo < d.hpFrom ? 'blood2' : 'rot2',
				]);
			if (d.block !== 0) parts.push([`${d.block > 0 ? '+' : ''}${d.block}▪`, 'ward1']);
			if (d.stress !== 0) parts.push([`${d.stress > 0 ? '+' : ''}${d.stress}◆`, 'rift2']);
			for (const [k, n] of d.statuses)
				parts.push([`+${n} ${t(`status.${k}.name`)}`, 'gold2']);
			let y = 176;
			for (const [text, color] of parts.reverse()) {
				const chip = label(this, pos.x + pos.w / 2, y, text, 'tiny', color).setOrigin(
					0.5,
					1,
				);
				const bg = this.add
					.rectangle(chip.x, y + 1, chip.width + 6, chip.height + 2, P.ash0, 0.85)
					.setOrigin(0.5, 1);
				this.layer.add([bg, chip]);
				y -= chip.height + 3;
			}
		}
	}

	/** One line for the detail panel: what the focused play does to its main target. */
	private previewLine(): string | null {
		const p = this.previews[this.focusIdx];
		if (!p) return null;
		const key = targetKey(p.target) ?? p.deltas.keys().next().value;
		const d = key ? p.deltas.get(key) : undefined;
		if (!d) return null;
		const dealt = d.hpFrom - d.hpTo - Math.min(0, d.block);
		if (d.hpTo !== d.hpFrom || d.block < 0)
			return `→ ${d.name}: ${d.hpFrom}→${Math.max(0, d.hpTo)} (−${dealt})`;
		if (d.block > 0) return `→ ${d.name}: +${d.block}▪`;
		if (d.stress !== 0) return `→ ${d.name}: ${d.stress > 0 ? '+' : ''}${d.stress}◆`;
		return `→ ${d.name}`;
	}

	private cycleFocus(step: number): void {
		const n = this.previews.length;
		if (n < 2) return;
		this.focusIdx = (this.focusIdx + step + n) % n;
		this.refresh();
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
		if (kind === 'stress') parts.push(`+${it.stress}`);
		if (it.block > 0) parts.push(`${it.block}`);
		const cx = x + w / 2;
		const icon = sized(this.add.image(cx - 14, 32, `icon.intent.${kind}`));
		const txt = label(this, cx - 6, 26, parts.join(' '), 'ui', 'bone2');
		icon.setInteractive().on('pointerup', () => this.tooltip(t(`intent.${it.intentId}`)));
		this.layer.add([icon, txt]);
		let nx = txt.x + txt.width + 8;
		// Debuffs ride along as "<status icon> n" (core sends "<status> <amount>").
		for (const d of it.debuffs) {
			const [status, n] = d.split(' ');
			if (!status || !this.textures.exists(`icon.status.${status}`)) continue;
			const dIcon = sized(this.add.image(nx, 32, `icon.status.${status}`));
			const dTxt = label(this, nx + 7, 26, n ?? '', 'ui', 'gold2');
			this.layer.add([dIcon, dTxt]);
			nx = dTxt.x + dTxt.width + 8;
		}
		// Stress on top of another intent gets its own stress icon + "+n" (shape, not a letter).
		if (kind !== 'stress' && it.stress > 0) {
			const sx = nx;
			const sIcon = sized(this.add.image(sx, 32, 'icon.intent.stress'));
			const sTxt = label(this, sx + 8, 26, `+${it.stress}`, 'ui', 'rift2');
			this.layer.add([sIcon, sTxt]);
		}
	}

	/** Damage and stress each hero will take from the shown intents, as "▼ 7" / "+2" over the hero. */
	private drawIncoming(): void {
		for (const h of this.view.heroes) {
			let dmg = 0;
			let stress = 0;
			for (const e of this.view.enemies) {
				const it = e.intent;
				if (!it) continue;
				for (const d of it.damage) if (d.target === h.id) dmg += d.perHit * d.hits;
				if (it.stress > 0 && it.targets.includes(h.id)) stress += it.stress;
			}
			if (dmg === 0 && stress === 0) continue;
			// Row centred on the hero at y 26–38: red ▼ + damage, then stress icon + "+n".
			const row = this.add.container(0, 0);
			let x = 0;
			if (dmg > 0) {
				row.add(this.add.triangle(x, 30, 0, 0, 10, 0, 5, 7, P.blood2).setOrigin(0));
				const n = label(this, x + 12, 26, `${dmg}`, 'ui', 'blood2');
				row.add(n);
				x += 12 + n.width + 6;
			}
			if (stress > 0) {
				row.add(sized(this.add.image(x + 5, 33, 'icon.intent.stress')));
				const n = label(this, x + 12, 26, `+${stress}`, 'ui', 'rift2');
				row.add(n);
				x += 12 + n.width;
			}
			row.x = Math.round(HERO_X(h.rank) + SLOT_W / 2 - x / 2);
			this.layer.add(row);
		}
	}

	/** Detail for a tapped unit when no card is selected (docs/art-bible.md §11.6). */
	private unitInfo(target: Target): void {
		if (!target) return;
		const lines: string[] = [];
		const statusLine = (s: HeroView['status']): void => {
			for (const k of STATUS_KEYS)
				if (s[k] > 0) lines.push(`${t(`status.${k}.name`)} ${s[k]}`);
			if (s.block > 0) lines.push(`${t('status.block.name')} ${s.block}`);
		};
		if (target.type === 'enemy') {
			const e = this.view.enemies.find((x) => x.uid === target.uid);
			if (!e) return;
			// Act 1 elites have their own names; other elites keep the enemy name plus the trait line.
			const elite = e.trait ? ELITE_NAME[e.key] : undefined;
			const name = elite ? t(`elite.${elite}.name`) : enemyName(e.key);
			lines.push(`${name} — ${e.hp}/${e.maxHP}`);
			const it = e.intent;
			if (it) {
				const hits = it.damage.map(
					(d) =>
						`${d.hits > 1 ? `${d.perHit}×${d.hits}` : d.perHit} → ${t(`hero.${d.target}.name`)}`,
				);
				lines.push(`${t(`intent.${it.intentId}`)} ${hits.join(', ')}`.trim());
				const debuffs = it.debuffs.map((d) => {
					const [status, n] = d.split(' ');
					return `${t(`status.${status}.name`)}${n ? ` ${n}` : ''}`;
				});
				if (debuffs.length) lines.push(`+ ${debuffs.join(', ')}`);
				if (it.stress > 0)
					lines.push(
						`+${it.stress} ${t('stress.label')} → ${it.targets.map((h) => t(`hero.${h}.name`)).join(', ')}`,
					);
			}
			if (e.trait) lines.push(t(`elite.${TRAIT_KEY[e.trait]}.trait`));
			statusLine(e.status);
		} else {
			const h = this.view.heroes.find((x) => x.id === target.id);
			if (!h) return;
			lines.push(`${t(`hero.${h.id}.name`)} — ${h.hp}/${h.maxHP}`);
			lines.push(`${t('stress.label')} ${h.stress}/10`);
			if (h.injured) lines.push(`${t('fallen.injury')}: ${t('fallen.injuryText')}`);
			statusLine(h.status);
		}
		this.tooltip(lines.join('\n'), 4000);
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
		// Opposite side of the focused target so its preview chips stay visible: over the heroes
		// when aiming at an enemy (or no target), over the enemies when aiming at a hero.
		const focus = this.focusedTarget();
		const deltas = this.previews[this.focusIdx]?.deltas;
		const hitsEnemies = focus
			? focus.type === 'enemy'
			: [...(deltas?.keys() ?? [])].some((k) => k.startsWith('e:'));
		// Enemy-targeting card: panel top-left over the heroes (ends at y 148, above their HP bars);
		// hero/ally card: top-right over the enemies. 80% fill so the units stay visible.
		const x = hitsEnemies || card.validTargets.length === 0 ? 8 : 464;
		const y = 28;
		// The panel height grows to fit its lines, so it is added last, behind the labels.
		const w = 168;
		const px = x === 8 ? 8 : 632 - w;
		const name = label(
			this,
			px + 6,
			y + 4,
			cardName(card.cardId, card.upgraded),
			'ui',
			'gold2',
		);
		const body = label(
			this,
			px + 6,
			y + 22,
			cardText(card.cardId, card.upgraded),
			'tiny',
			'bone2',
		).setWordWrapWidth(w - 12);
		this.layer.add([name, body]);
		let bottom = body.y + body.height + 6;
		// Keyword chips (GDD 6.2): tap one to learn what it means.
		let kx = px + 6;
		let chipH = 0;
		for (const k of cardKeywords(card.cardId, card.upgraded)) {
			const chip = label(this, kx + 3, bottom, t(`keyword.${k}.name`), 'tiny', 'gold2');
			const bg = this.add
				.rectangle(kx, bottom - 1, chip.width + 6, chip.height + 2, P.ash0, 0.9)
				.setOrigin(0)
				.setStrokeStyle(1, P.gold0)
				.setInteractive()
				.setName(`keyword-${k}`);
			bg.on('pointerup', () =>
				this.tooltip(`${t(`keyword.${k}.name`)}: ${t(`keyword.${k}.tooltip`)}`),
			);
			this.layer.add([bg, chip]);
			kx += chip.width + 10;
			chipH = chip.height + 6;
		}
		bottom += chipH;
		const line = this.previewLine();
		if (line) {
			const l = label(this, px + 6, bottom, line, 'tiny', 'gold2').setWordWrapWidth(w - 12);
			this.layer.add(l);
			bottom = l.y + l.height + 2;
		}
		const hint = !card.playable
			? (card.reason ?? t('hud.unplayable'))
			: card.autoTarget
				? t('hud.tapAgain')
				: t('hud.chooseTarget');
		const h = label(
			this,
			px + 6,
			bottom,
			hint,
			'tiny',
			card.playable ? 'ash5' : 'blood2',
		).setWordWrapWidth(w - 12);
		this.layer.add(h);
		const height = h.y + h.height + 4 - y;
		this.layer.addAt(
			panel(this, px, y, w, height, 'ash1', 'gold1').setAlpha(0.8),
			this.layer.getIndex(name),
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
		if (this.busy) {
			// Input stays live during animations: select at once, queue the play for when it ends.
			if (this.selected?.uid === card.uid) {
				if (card.playable && card.autoTarget) this.play(card, null);
				else this.selected = null;
			} else this.selected = card;
			this.raiseSelected();
			play(this, 'sfx.ui.tap');
			return;
		}
		if (this.selected?.uid === card.uid) {
			if (card.playable && card.autoTarget) this.play(card, null);
			else this.selected = null;
		} else {
			this.selected = card;
		}
		this.refresh();
	}

	private onUnitTap(target: Target): void {
		if (!this.selected) {
			this.unitInfo(target);
			return;
		}
		if (this.validTargetFor(target)) this.play(this.selected, target);
		else {
			// Not a target of this card: drop the selection and show the unit instead.
			this.selected = null;
			if (this.busy) this.raiseSelected();
			else this.refresh();
			this.unitInfo(target);
		}
	}

	private play(card: HandCardView, target: Target): void {
		this.selected = null;
		if (this.busy) this.raiseSelected();
		else this.flyCard(card, target);
		this.send({ type: 'playCard', cardUid: card.uid, target });
	}

	/** Art Bible §12.1 card fly: the played card travels to its target (or up) and fades. */
	private flyCard(card: HandCardView, target: Target): void {
		const i = this.view.hand.findIndex((c) => c.uid === card.uid);
		const obj = this.layer.getByName(`card-${i}`) as Phaser.GameObjects.Container | null;
		if (!obj) return;
		const key = targetKey(target);
		const pos = key ? this.unitPos.get(key) : undefined;
		const tx = pos ? pos.x + pos.w / 2 - CARD_W / 2 : obj.x;
		obj.disableInteractive();
		this.tweens.add({
			targets: obj,
			x: tx,
			y: pos ? 110 : obj.y - 40,
			scale: 0.6,
			alpha: 0,
			duration: 180,
			ease: 'Quad.easeIn',
		});
	}

	/** Moves the selected hand card up without a full redraw (used while an animation runs). */
	private raiseSelected(): void {
		this.view.hand.forEach((card, i) => {
			const obj = this.layer.getByName(`card-${i}`) as Phaser.GameObjects.Container | null;
			obj?.setY(this.selected?.uid === card.uid ? 242 : 258);
		});
	}

	private onKey(e: KeyboardEvent): void {
		if (!this.scene.isActive()) return;
		// During an animation only card, play and end-turn keys act (they queue); the rest wait.
		if (this.busy && !/^[0-9 ]$|^Enter$|^Escape$/.test(e.key)) return;
		if (this.busy && e.key === 'Escape') {
			this.selected = null;
			this.raiseSelected();
			return;
		}
		const hand = this.view.hand;
		if (e.key >= '1' && e.key <= '9') {
			const card = hand[Number(e.key) - 1];
			if (card) this.onCardTap(card);
		} else if (e.key === '0' && hand[9]) this.onCardTap(hand[9]);
		else if (e.key === ' ') this.send({ type: 'endTurn' });
		else if (e.key === 'Enter' && this.selected) {
			if (this.selected.playable) this.play(this.selected, this.focusedTarget());
		} else if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			this.cycleFocus(1);
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			this.cycleFocus(-1);
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
		if (this.busy) {
			this.queued = cmd;
			play(this, 'sfx.ui.tap');
			return;
		}
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
		// Durations are at 1x: the scene clock already runs at app.speed (applySpeed), so
		// app.ms() here would speed them up twice.
		const step = 110;
		let delay = 0;
		let lastHit: string | null = null;
		let enemyBanner = false;
		// The enrage sting plays once, on the turn enrage begins (later turns only pop "Enraged 1").
		const started = events.find((e) => e.type === 'turnStarted');
		if (started?.type === 'turnStarted' && started.turn === this.view.enrageTurn)
			play(this, 'sfx.flow.enrage');
		for (const ev of events) {
			if (ev.type === 'enemyAction') {
				if (!enemyBanner) {
					enemyBanner = true;
					const at0 = delay;
					this.time.delayedCall(at0, () => this.turnBanner(t('hud.enemyTurn'), 'blood2'));
				}
				// Each enemy acts on its own beat: a pause, then a lunge towards the heroes.
				delay += 250;
				const at = delay;
				this.time.delayedCall(at, () => this.lunge(`e:${ev.uid}`));
				delay += 140;
				continue;
			}
			if (ev.type === 'cardPlayed' && CARDS[ev.cardId]?.type === 'attack') {
				// The attacking hero steps forward as the card lands.
				this.time.delayedCall(delay, () => this.lunge(`h:${ev.owner}`));
				delay += 90;
			}
			const d = delay;
			const pos = this.eventPos(ev);
			if (ev.type === 'hit' && pos && this.isBigHit(ev)) delay += 50; // hit-stop beat
			// Consecutive hits from one source on one target are one multi-hit card or intent.
			const hitKey = ev.type === 'hit' ? JSON.stringify([ev.source, ev.target]) : null;
			const multi = hitKey !== null && hitKey === lastHit;
			if (ev.type !== 'hit' || pos) lastHit = hitKey;
			if (pos) {
				this.time.delayedCall(d, () => this.popFor(ev, pos, multi));
				delay += step;
			} else if (ev.type === 'turnStarted') {
				this.time.delayedCall(d, () => {
					play(this, 'sfx.card.draw');
					this.turnBanner(t('hud.teamTurn'), 'gold2');
				});
			} else if (ev.type === 'cardExhausted') {
				this.time.delayedCall(d, () => play(this, 'sfx.card.exhaust'));
			}
		}
		this.time.delayedCall(delay + 150, () => {
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
				this.queued = null;
				this.time.delayedCall(500, () => this.scene.start(session.sceneForScreen()));
				return;
			}
			this.refresh();
			const next = this.queued;
			this.queued = null;
			if (next) this.send(next);
		});
	}

	private hitSfx(ev: Extract<GameEvent, { type: 'hit' }>, multi: boolean): string {
		// Block absorbed part of the hit and HP still dropped: the block is gone.
		if (ev.absorbed > 0 && ev.hpLost > 0) return 'sfx.block.break';
		if (ev.hpLost === 0) return 'sfx.block.absorb';
		return multi ? 'sfx.hit.multi' : 'sfx.hit.blunt';
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
		else if (ev.type === 'bossPhase' || ev.type === 'enemyDied' || ev.type === 'enemyHeal')
			key = `e:${ev.uid}`;
		if (!key) return null;
		const p = this.unitPos.get(key);
		if (!p) return null;
		// Pop-ups start just above the sprite's head, below the intent strip.
		const img = this.unitImg.get(key);
		const top = img ? img.y : 100;
		return { x: p.x + p.w / 2, y: Math.max(56, top - 4) };
	}

	/** Heavy hit (Art Bible §12.1): HP lost ≥ 25% of the target's max HP. */
	private isBigHit(ev: Extract<GameEvent, { type: 'hit' }>): boolean {
		const t = ev.target;
		const max =
			t.side === 'hero'
				? this.view.heroes.find((h) => h.id === t.id)?.maxHP
				: this.view.enemies.find((e) => e.uid === t.uid)?.maxHP;
		return max !== undefined && ev.hpLost >= max * 0.25;
	}

	/** Knockback 3 px away from the attacker in 80 ms, back in 120 ms. */
	private knockback(key: UnitKey, dir: number): void {
		const img = this.unitImg.get(key);
		if (!img || this.tweens.isTweening(img)) return;
		const x0 = img.x;
		this.tweens.chain({
			targets: img,
			tweens: [
				{ x: x0 + 3 * dir, duration: 80, ease: 'Cubic.easeOut' },
				{ x: x0, duration: 120, ease: 'Quad.easeInOut' },
			],
		});
	}

	/** Hit-stop: every tween freezes for 50 ms of real time on a heavy hit (skipped at 3x). */
	private hitStop(): void {
		if (app.speed === 3) return;
		this.tweens.pauseAll();
		window.setTimeout(() => this.tweens?.resumeAll(), 50);
	}

	/** Art Bible §12.1 lunge: back 2 px, forward 8 px towards the heroes, return. */
	private lunge(key: UnitKey): void {
		const img = this.unitImg.get(key);
		if (!img) return;
		const x0 = img.x;
		const dir = key.startsWith('e:') ? -1 : 1;
		this.tweens.chain({
			targets: img,
			tweens: [
				{ x: x0 - 2 * dir, duration: 90, ease: 'Quad.easeOut' },
				{ x: x0 + 8 * dir, duration: 50, ease: 'Cubic.easeIn' },
				{ x: x0, duration: 140, ease: 'Quad.easeInOut' },
			],
		});
	}

	private popFor(ev: GameEvent, pos: { x: number; y: number }, multi = false): void {
		const sfx: Partial<Record<GameEvent['type'], string>> = {
			hit: ev.type === 'hit' ? this.hitSfx(ev, multi) : '',
			dot: ev.type === 'dot' ? STATUS_SFX[ev.status] : '',
			status: ev.type === 'status' ? (STATUS_SFX[ev.status] ?? '') : '',
			block: 'sfx.block.gain',
			heal: 'sfx.unit.heal',
			enemyHeal: 'sfx.unit.heal',
			stress: ev.type === 'stress' && ev.amount < 0 ? 'sfx.stress.relief' : 'sfx.stress.gain',
			collapse: 'sfx.stress.collapse',
			fall: 'sfx.unit.fall',
			enemyDied: 'sfx.unit.enemy_death',
			bossPhase: 'sfx.flow.phase',
		};
		const key = sfx[ev.type];
		if (key) play(this, key);
		let text = '';
		let color: Parameters<typeof css>[0] = 'bone2';
		if (ev.type === 'hit') {
			text = ev.hpLost > 0 ? `-${ev.hpLost}` : `(${ev.absorbed})`;
			color = ev.hpLost > 0 ? 'blood2' : 'ward1';
			const key = ev.target.side === 'hero' ? `h:${ev.target.id}` : `e:${ev.target.uid}`;
			this.knockback(key, ev.target.side === 'hero' ? -1 : 1);
			// Small camera shake only on heavy hits (≥ 25% max HP); every hit flashes.
			if (this.isBigHit(ev)) {
				this.shake();
				this.hitStop();
			}
			this.flashAt(pos);
		} else if (ev.type === 'dot') {
			text = `-${ev.hpLost}`;
			color = ev.status === 'burn' ? 'ember3' : 'blood2';
		} else if (ev.type === 'block') {
			text = `+${ev.amount}`;
			color = 'ward1';
		} else if (ev.type === 'heal' || ev.type === 'enemyHeal') {
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
			// Say what a Collapse does where it happens (GDD 7.1).
			this.tooltip(
				`${t(`hero.${ev.target}.name`)}: ${t('stress.collapse')}. ${t('stress.collapseText')}`,
				4000,
			);
		} else if (ev.type === 'fall') {
			text = t('fallen.label');
			color = 'blood2';
			// GDD 5.6: falling is not death; say so when it happens.
			this.tooltip(
				`${t(`hero.${ev.target}.name`)}: ${t('fallen.label')}. ${t('fallen.returns')} ${t('fallen.injury')}: ${t('fallen.injuryText')}`,
				4500,
			);
		} else if (ev.type === 'bossPhase') {
			// Per-boss banner (boss.<key>.phase<n>) with the generic phase-2 line as fallback.
			const key = `boss.${this.view.enemies.find((e) => e.uid === ev.uid)?.key}.phase${ev.phase}`;
			this.phaseBanner(t(key) === key ? t('boss.phase2') : t(key));
			this.shake(true);
			this.flashAt(pos, true);
		} else if (ev.type === 'enemyDied') {
			text = '†';
			color = 'ash5';
			// Art Bible §12.1 death: sink and fade.
			const img = this.unitImg.get(`e:${ev.uid}`);
			if (img)
				this.tweens.add({
					targets: img,
					alpha: 0,
					y: img.y + 4,
					duration: 350,
					ease: 'Quad.easeIn',
				});
		}
		if (!text) return;
		// Art Bible §12.1 number pop: h2, rise 12 px in 600 ms, hold 200 ms, fade 200 ms.
		const pop = label(this, pos.x, pos.y, text, 'h2', color)
			.setOrigin(0.5, 1)
			.setStroke(css('ash0'), 4)
			.setDepth(40);
		this.tweens.add({ targets: pop, y: pos.y - 12, duration: 600, ease: 'Cubic.easeOut' });
		this.tweens.add({
			targets: pop,
			alpha: 0,
			delay: 800,
			duration: 200,
			onComplete: () => pop.destroy(),
		});
	}

	private shake(big = false): void {
		if (app.settings.reduceShake) return;
		this.cameras.main.shake(big ? 220 : 90, big ? 0.008 : 0.004);
	}

	/** Short "Enemy turn" / "Your turn" marker over the centre gap, so the phases read apart. */
	private turnBanner(text: string, color: PaletteKey): void {
		const b = label(this, 320, 132, text, 'h2', color)
			.setOrigin(0.5)
			.setStroke(css('ash0'), 4)
			.setDepth(45);
		this.tweens.add({
			targets: b,
			alpha: 0,
			delay: 500,
			duration: 250,
			onComplete: () => b.destroy(),
		});
	}

	/** Full-width banner over the stage for a boss phase change; it holds long enough to be read. */
	private phaseBanner(text: string): void {
		const band = this.add.rectangle(0, 92, 640, 40, P.ash0, 0.9).setOrigin(0).setDepth(60);
		const line = this.add.rectangle(0, 92, 640, 1, P.ember3).setOrigin(0).setDepth(60);
		const line2 = this.add.rectangle(0, 131, 640, 1, P.ember3).setOrigin(0).setDepth(60);
		const banner = label(this, 320, 112, text, 'h2', 'ember3').setOrigin(0.5).setDepth(61);
		this.tweens.add({
			targets: [band, line, line2, banner],
			alpha: 0,
			delay: 1400,
			duration: 300,
			onComplete: () => {
				for (const o of [band, line, line2, banner]) o.destroy();
			},
		});
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

	/** One tooltip at a time, top-centre over the stage (below the intent strip). */
	private tooltip(text: string, ms = 2500): void {
		for (const o of this.tipObjs) o.destroy();
		const tip = label(this, 320, 52, text, 'tiny', 'bone2')
			.setOrigin(0.5, 0)
			.setWordWrapWidth(300);
		const bg = this.add
			.rectangle(320, 49, tip.width + 12, tip.height + 6, P.ash1, 0.92)
			.setOrigin(0.5, 0)
			.setStrokeStyle(1, P.gold1);
		tip.setDepth(51);
		bg.setDepth(50);
		this.tipObjs = [bg, tip];
		// Real-time, so the tooltip reads the same at every game speed.
		window.setTimeout(() => {
			tip.destroy();
			bg.destroy();
		}, ms);
	}

	// ---------- auto battle ----------
	private scheduleAuto(): void {
		this.autoTimer?.remove();
		this.autoTimer = null;
		if (!app.auto || this.busy || this.view?.phase !== 'player') return;
		this.autoTimer = this.time.delayedCall(350, () => {
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
