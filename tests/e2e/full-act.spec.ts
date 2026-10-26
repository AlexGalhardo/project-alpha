import { expect, type Page, test } from '@playwright/test';

type Hooks = {
	__game?: { scene: { isActive(key: string): boolean } };
	__botStep?: () => string;
};

async function activeScene(page: Page, key: string): Promise<boolean> {
	return page.evaluate(
		(k) => (window as unknown as Hooks).__game?.scene.isActive(k) ?? false,
		key,
	);
}

test('a full Act 1 run reaches the summary through the UI layer with no errors', async ({
	page,
}) => {
	test.setTimeout(240_000);
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});

	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	const canvas = page.locator('canvas');
	await canvas.click();
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Menu'));

	// New run → party select → default party → descend.
	await page.evaluate(() => {
		const g = (
			window as unknown as {
				__game: { scene: { start(k: string): void; stop(k: string): void } };
			}
		).__game;
		g.scene.stop('Menu');
		g.scene.start('Party');
	});
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Party'));
	const box = await canvas.boundingBox();
	if (!box) throw new Error('canvas not visible');
	// "Descend" button: centre at (320, 312) in game pixels.
	await page.mouse.click(box.x + (320 / 640) * box.width, box.y + (312 / 360) * box.height);
	await page.waitForFunction(() => {
		const g = (window as unknown as Hooks).__game;
		return g?.scene.isActive('Map') || g?.scene.isActive('Combat');
	});

	let scene = '';
	for (let i = 0; i < 3000 && scene !== 'Summary'; i++) {
		scene = await page.evaluate(() => (window as unknown as Hooks).__botStep?.() ?? '');
	}
	expect(scene).toBe('Summary');
	expect(await activeScene(page, 'Summary')).toBe(true);
	expect(errors).toEqual([]);
});
