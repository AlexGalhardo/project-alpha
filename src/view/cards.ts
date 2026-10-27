import type Phaser from 'phaser';
import { cardDef, cardValues } from '../core';
import { t } from './i18n';
import { P, type PaletteKey } from './palette';
import { label, texelScale } from './ui';

export const CARD_W = 64;
export const CARD_H = 90;

const RARITY_EDGE: Record<string, PaletteKey> = {
	starter: 'ash4',
	common: 'ash4',
	uncommon: 'iron2',
	rare: 'gold2',
	legendary: 'ember3',
};

const OWNER_BAND: Record<string, PaletteKey> = {
	shieldbearer: 'iron2',
	marksman: 'rot1',
	arcanist: 'rift1',
	confessor: 'bone1',
	bombardier: 'ember2',
};

export function cardName(cardId: string, upgraded: boolean): string {
	return `${t(`card.${cardId}.name`)}${upgraded ? '+' : ''}`;
}

export function cardText(cardId: string, upgraded: boolean): string {
	return t(`card.${cardId}.text`, cardValues(cardId, upgraded));
}

export function costOf(cardId: string, upgraded: boolean): number {
	const def = cardDef(cardId);
	return upgraded && def.upgradedCost !== undefined ? def.upgradedCost : def.cost;
}

/**
 * Draws a 64×90 card (docs/art-bible.md §10.1). Rarity changes the frame shape (notches), not
 * only its colour, so it reads without colour.
 */
export function drawCard(
	scene: Phaser.Scene,
	cardId: string,
	upgraded: boolean,
	opts: { playable?: boolean; selected?: boolean; cost?: number } = {},
): Phaser.GameObjects.Container {
	const def = cardDef(cardId);
	const c = scene.add.container(0, 0);
	const g = scene.add.graphics();
	const edge = opts.selected ? P.gold2 : P[RARITY_EDGE[def.rarity] ?? 'ash4'];
	g.fillStyle(P.ash0).fillRect(0, 0, CARD_W, CARD_H);
	g.fillStyle(edge).fillRect(1, 1, CARD_W - 2, CARD_H - 2);
	g.fillStyle(opts.playable === false ? P.ash3 : P.ash2).fillRect(3, 3, CARD_W - 6, CARD_H - 6);
	// Rarity shape: uncommon = side notches, rare = corner studs, legendary = crown spike.
	if (def.rarity === 'uncommon') {
		g.fillStyle(P.ash0)
			.fillRect(0, 40, 2, 10)
			.fillRect(CARD_W - 2, 40, 2, 10);
	} else if (def.rarity === 'rare') {
		g.fillStyle(P.gold1)
			.fillRect(0, 0, 5, 5)
			.fillRect(CARD_W - 5, 0, 5, 5);
	} else if (def.rarity === 'legendary') {
		g.fillStyle(P.ember3).fillTriangle(CARD_W / 2 - 6, 0, CARD_W / 2 + 6, 0, CARD_W / 2, -6);
	}
	const band = P[OWNER_BAND[def.owner] ?? 'ash4'];
	g.fillStyle(band).fillRect(3, CARD_H - 8, CARD_W - 6, 5);
	// Art window (60×26) with a type emblem in the owner colour until card art exists (B29):
	// Attack = blade, Skill = shield, Power = diamond.
	g.fillStyle(P.ash1).fillRect(4, 14, CARD_W - 8, 26);
	g.fillStyle(band);
	const cx = CARD_W / 2;
	if (def.type === 'attack')
		g.fillRect(cx - 1, 17, 3, 16)
			.fillRect(cx - 6, 31, 13, 2)
			.fillRect(cx - 1, 33, 3, 4);
	else if (def.type === 'skill')
		g.fillRect(cx - 7, 18, 15, 10).fillTriangle(cx - 7, 28, cx + 8, 28, cx, 37);
	else
		g.fillTriangle(cx, 16, cx + 9, 27, cx - 9, 27).fillTriangle(cx - 9, 27, cx + 9, 27, cx, 38);
	g.fillStyle(P.ember3).fillCircle(8, 8, 8);
	c.add(g);
	// Generated 60×40 card art, cropped to the 56×26 window of the hand card (centre band).
	const artKey = `card.${cardId}`;
	if (scene.textures.exists(artKey)) {
		// Art may be drawn at 2-3× (ADR 0015): crop in texture pixels, show at the logical size.
		const k = texelScale(scene, artKey);
		c.add(
			scene.add
				.image(2, 7, artKey)
				.setOrigin(0)
				.setScale(1 / k)
				.setCrop(2 * k, 7 * k, 56 * k, 26 * k),
		);
		const gem = scene.add.graphics();
		gem.fillStyle(P.ember3).fillCircle(8, 8, 8);
		c.add(gem);
	}
	c.add(
		label(
			scene,
			8,
			8,
			`${opts.cost ?? costOf(cardId, upgraded)}`,
			'ui',
			'ash0',
			false,
		).setOrigin(0.5),
	);
	const name = label(
		scene,
		4,
		41,
		cardName(cardId, upgraded),
		'tiny',
		'bone2',
		false,
	).setWordWrapWidth(CARD_W - 8);
	c.add(name);
	// Value chips: shape + colour + number (art bible §5 tokens), so the card reads without its text.
	const v = cardValues(cardId, upgraded);
	const hits = (upgraded ? def.upgrade.hits : undefined) ?? def.params.hits ?? 1;
	const p = upgraded ? { ...def.params, ...def.upgrade } : def.params;
	// [kind, text]: numbers for plain values; glyph text for effects with no single number
	// (Shield Slam "=", Absolve stress relief, Rekindle revive %, Channel energy next turn).
	const chips: [string, string][] = [];
	if (v.damage !== undefined)
		chips.push(['damage', hits > 1 ? `${v.damage}x${hits}` : `${v.damage}`]);
	else if (p.cap !== undefined) chips.push(['damage', '=']);
	if (v.block !== undefined) chips.push(['block', `${v.block}`]);
	else if (p.cap !== undefined) chips.push(['block', p.preBlock ? `+${p.preBlock}` : '']);
	if (v.heal !== undefined) chips.push(['heal', `${v.heal}`]);
	if (p.pct !== undefined) chips.push(['heal', `${p.pct}%`]);
	if (v.stacks !== undefined) chips.push(['stacks', `${v.stacks}`]);
	if (v.stress !== undefined) chips.push(['stacks', `-${v.stress}`]);
	if (v.draw !== undefined) chips.push(['draw', `${v.draw}`]);
	if (p.energyNext !== undefined) chips.push(['energy', `+${p.energyNext}`]);
	const chipY = name.height > 12 ? 62 : 54;
	const cg = scene.add.graphics();
	let x = 4;
	for (const [kind, text] of chips.slice(0, 3)) {
		const color =
			kind === 'damage'
				? P.blood2
				: kind === 'block'
					? P.ward1
					: kind === 'heal'
						? P.rot2
						: kind === 'stacks'
							? P.rift2
							: kind === 'energy'
								? P.ember3
								: P.bone1;
		cg.fillStyle(color);
		if (kind === 'damage') cg.fillTriangle(x, chipY + 7, x + 6, chipY + 7, x + 3, chipY + 1);
		else if (kind === 'block') cg.fillRect(x, chipY + 1, 6, 6);
		else if (kind === 'heal') cg.fillRect(x + 2, chipY, 2, 7).fillRect(x, chipY + 2, 6, 2);
		else if (kind === 'stacks')
			cg.fillTriangle(x + 3, chipY, x + 6, chipY + 4, x, chipY + 4).fillTriangle(
				x,
				chipY + 4,
				x + 6,
				chipY + 4,
				x + 3,
				chipY + 8,
			);
		else if (kind === 'energy') cg.fillCircle(x + 3, chipY + 4, 3);
		else cg.fillRect(x + 1, chipY, 4, 7);
		const t2 = label(scene, x + 8, chipY - 1, text, 'tiny', 'bone2', false);
		c.add(t2);
		x += 10 + t2.width + 2;
	}
	c.add(cg);
	// Owner name only when the card name fits on one line; the owner band always shows.
	if (chipY === 54)
		c.add(label(scene, 4, 68, t(`hero.${def.owner}.name`), 'tiny', 'ash5', false));
	c.setSize(CARD_W, CARD_H);
	return c;
}
