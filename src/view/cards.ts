import type Phaser from 'phaser';
import { cardDef, cardValues } from '../core';
import { t } from './i18n';
import { P, type PaletteKey } from './palette';
import { label } from './ui';

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
	g.fillStyle(P[OWNER_BAND[def.owner] ?? 'ash4']).fillRect(3, CARD_H - 8, CARD_W - 6, 5);
	g.fillStyle(P.ash1).fillRect(5, 16, CARD_W - 10, 24);
	g.fillStyle(P.ember3).fillCircle(8, 8, 8);
	c.add(g);
	c.add(
		label(scene, 8, 8, `${opts.cost ?? costOf(cardId, upgraded)}`, 'ui', 'ash0').setOrigin(0.5),
	);
	c.add(
		label(scene, 4, 42, cardName(cardId, upgraded), 'tiny', 'bone2').setWordWrapWidth(
			CARD_W - 8,
		),
	);
	c.add(
		label(scene, 4, 62, t(`hero.${def.owner}.name`), 'tiny', 'ash5').setWordWrapWidth(
			CARD_W - 8,
		),
	);
	c.add(label(scene, CARD_W - 4, 20, t(`cardType.${def.type}`), 'tiny', 'ash5').setOrigin(1, 0));
	c.setSize(CARD_W, CARD_H);
	return c;
}
