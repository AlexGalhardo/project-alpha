import { expect, test } from '@playwright/test';

type GameWindow = Window & {
	__game?: {
		scene: {
			isActive(key: string): boolean;
		};
	};
};

test('boots to the Title scene and opens the Menu on click', async ({ page }) => {
	const consoleErrors: string[] = [];
	const pageErrors: string[] = [];

	page.on('console', (message) => {
		if (message.type() === 'error') {
			consoleErrors.push(message.text());
		}
	});
	page.on('pageerror', (error) => {
		pageErrors.push(error.message);
	});

	await page.goto('/');

	const canvas = page.locator('canvas').first();
	await expect(canvas).toBeVisible();

	await page.waitForFunction(() => {
		const game = (window as GameWindow).__game;
		return game !== undefined && game.scene.isActive('Title');
	});

	const box = await canvas.boundingBox();
	if (box === null) {
		throw new Error('canvas has no bounding box');
	}
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

	await page.waitForFunction(() => {
		const game = (window as GameWindow).__game;
		return game !== undefined && game.scene.isActive('Menu');
	});

	expect(pageErrors).toEqual([]);
	expect(consoleErrors).toEqual([]);
});
