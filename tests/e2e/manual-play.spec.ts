import { expect, type Page, test } from '@playwright/test';

interface Card {
	uid: number;
	cost: number;
	playable: boolean;
	autoTarget: boolean;
	validTargets: ({ type: 'enemy'; uid: number } | { type: 'hero'; id: string } | null)[];
}
interface View {
	energy: number;
	hand: Card[];
	enemies: { uid: number; rank: number; size: number; hp: number }[];
	heroes: { id: string; rank: number }[];
}
type Hooks = {
	__game?: {
		scene: { isActive(k: string): boolean; start(k: string): void; stop(k: string): void };
	};
	__botStep?: () => string;
	__combat?: () => View | null;
};

async function toGame(page: Page, x: number, y: number): Promise<void> {
	const box = await page.locator('canvas').boundingBox();
	if (!box) throw new Error('no canvas');
	await page.mouse.click(box.x + (x / 640) * box.width, box.y + (y / 360) * box.height);
}

/** Card i centre, mirroring CombatScene.drawActionBand for hands of ≤ 6 cards. */
function cardCentre(i: number, n: number): [number, number] {
	const spacing = 68;
	const total = spacing * (n - 1) + 64;
	const startX = 118 + Math.max(0, (404 - total) / 2);
	return [startX + i * spacing + 32, 258 + 45];
}

test('the player plays cards by tapping a card and then a target', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	await page.locator('canvas').click();
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Menu'));
	await page.evaluate(() => {
		const g = (window as unknown as Hooks).__game;
		g?.scene.stop('Menu');
		g?.scene.start('Party');
	});
	await toGame(page, 320, 312);
	// Walk to the first combat with the bot (map choice only).
	for (let i = 0; i < 5; i++) {
		const s = await page.evaluate(() =>
			(window as unknown as Hooks).__game?.scene.isActive('Combat'),
		);
		if (s) break;
		await page.evaluate(() => (window as unknown as Hooks).__botStep?.());
	}
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Combat'));
	await page.waitForTimeout(300);

	const before = await page.evaluate(() => (window as unknown as Hooks).__combat?.());
	if (!before) throw new Error('no combat view');
	const idx = before.hand.findIndex(
		(c) =>
			c.playable &&
			c.cost > 0 &&
			!c.autoTarget &&
			c.validTargets.some((t) => t?.type === 'enemy'),
	);
	expect(idx).toBeGreaterThanOrEqual(0);
	const card = before.hand[idx] as Card;
	const target = card.validTargets.find((t) => t?.type === 'enemy') as {
		type: 'enemy';
		uid: number;
	};
	const enemy = before.enemies.find((e) => e.uid === target.uid);
	if (!enemy) throw new Error('target enemy missing');

	const [cx, cy] = cardCentre(idx, before.hand.length);
	await toGame(page, cx, cy);
	await page.waitForTimeout(150);
	await toGame(page, 304 + (enemy.rank - 1) * 80 + (80 * enemy.size) / 2, 120);
	await page.waitForTimeout(1500);

	const after = await page.evaluate(() => (window as unknown as Hooks).__combat?.());
	expect(after?.hand.some((c) => c.uid === card.uid)).toBe(false);
	expect(after?.energy).toBeLessThan(before.energy);
	expect(errors).toEqual([]);
});
