import { expect, type Page, test } from '@playwright/test';

// Code-driven feedback (docs/art-bible.md §12.1): heavy hits shake the camera unless
// "Reduce screen shake" is on. Combat runs through the scene's own auto battle so every
// command is animated (the __botStep hook skips animation).

type Scene = {
	cameras: { main: { shake: (...a: unknown[]) => unknown } };
	toggleAuto?: () => void;
};
type Hooks = {
	__game?: {
		scene: { isActive(k: string): boolean; getScene(k: string): Scene };
	};
	__botStep?: () => string;
	__startRun?: (seed: number, party: string[]) => void;
	__shakes?: number;
};

async function shakesInFirstCombats(page: Page, reduceShake: boolean): Promise<number> {
	await page.addInitScript((reduce) => {
		localStorage.setItem(
			'ossuary.settings.v1',
			JSON.stringify({ locale: 'en', reduceShake: reduce, defaultSpeed: 3 }),
		);
	}, reduceShake);
	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	await page.locator('canvas').click();
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Menu'));
	await page.evaluate(() => {
		const h = window as unknown as Hooks;
		h.__startRun?.(4, ['shieldbearer', 'confessor', 'marksman']);
		for (let i = 0; i < 20 && h.__botStep?.() !== 'Combat'; i++);
	});
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Combat'));
	await page.evaluate(() => {
		const h = window as unknown as Hooks;
		const scene = h.__game?.scene.getScene('Combat');
		if (!scene) return;
		h.__shakes = 0;
		const real = scene.cameras.main.shake.bind(scene.cameras.main);
		scene.cameras.main.shake = (...a: unknown[]) => {
			h.__shakes = (h.__shakes ?? 0) + 1;
			return real(...a);
		};
		scene.toggleAuto?.();
	});
	// One whole combat at 3x with auto battle.
	await page.waitForFunction(
		() => !(window as unknown as Hooks).__game?.scene.isActive('Combat'),
		null,
		{ timeout: 60_000 },
	);
	return page.evaluate(() => (window as unknown as Hooks).__shakes ?? 0);
}

test('heavy hits shake the camera', async ({ page }) => {
	expect(await shakesInFirstCombats(page, false)).toBeGreaterThan(0);
});

test('"Reduce screen shake" removes every camera shake', async ({ page }) => {
	expect(await shakesInFirstCombats(page, true)).toBe(0);
});
