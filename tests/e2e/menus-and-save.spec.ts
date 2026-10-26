import { expect, type Page, test } from '@playwright/test';

type Hooks = {
	__game?: {
		scene: {
			isActive(key: string): boolean;
			getScenes(active: boolean): { scene: { key: string }; children: { list: unknown[] } }[];
			start(key: string, data?: unknown): void;
			stop(key: string): void;
			pause(key: string): void;
			resume(key: string): void;
			launch(key: string, data?: unknown): void;
		};
	};
	__botStep?: () => string;
	__combat?: () => unknown;
	__startRun?: (seed: number, party: string[]) => void;
};

const SETTINGS_KEY = 'ossuary.settings.v1';
const SAVE_KEY_PREFIX = 'ossuary';
const PARTY = ['shieldbearer', 'confessor', 'marksman'];

function trackErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	return errors;
}

async function isActive(page: Page, key: string): Promise<boolean> {
	return page.evaluate(
		(k) => (window as unknown as Hooks).__game?.scene.isActive(k) ?? false,
		key,
	);
}

async function waitActive(page: Page, key: string): Promise<void> {
	await page.waitForFunction(
		(k) => (window as unknown as Hooks).__game?.scene.isActive(k) ?? false,
		key,
	);
}

/** Fires the Button's own pointerup handler, the same path a tap takes. */
async function press(page: Page, testId: string): Promise<boolean> {
	return page.evaluate((id) => {
		const game = (window as unknown as Hooks).__game;
		if (!game) return false;
		for (const scene of game.scene.getScenes(true)) {
			const sceneWithChildren = scene as unknown as {
				children: { list: unknown[] };
			};
			const found = sceneWithChildren.children.list.find(
				(c) => (c as { name?: string }).name === id,
			) as { emit(e: string): void } | undefined;
			if (found) {
				found.emit('pointerup');
				return true;
			}
		}
		return false;
	}, testId);
}

async function texts(page: Page, key: string): Promise<string[]> {
	return page.evaluate((k) => {
		const game = (window as unknown as Hooks).__game;
		const scene = game?.scene.getScenes(true).find((s) => s.scene.key === k);
		if (!scene) return [];
		const out: string[] = [];
		const walk = (list: unknown[]): void => {
			for (const c of list) {
				const node = c as { text?: unknown; list?: unknown[] };
				if (typeof node.text === 'string') out.push(node.text);
				if (Array.isArray(node.list)) walk(node.list);
			}
		};
		walk(scene.children.list);
		return out;
	}, key);
}

async function boot(page: Page): Promise<void> {
	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	await page.locator('canvas').click();
	await waitActive(page, 'Menu');
}

async function startRunToCombat(page: Page, seed: number): Promise<void> {
	await page.evaluate(
		({ s, party }) => {
			const h = window as unknown as Hooks;
			h.__startRun?.(s, party);
			const game = h.__game;
			game?.scene.getScenes(true).forEach((sc) => {
				if (sc.scene.key !== 'Title') game.scene.stop(sc.scene.key);
			});
			game?.scene.start('Map');
		},
		{ s: seed, party: PARTY },
	);
	for (let i = 0; i < 3000; i++) {
		const scene = await page.evaluate(() => (window as unknown as Hooks).__botStep?.() ?? '');
		if (scene === 'Combat') break;
	}
	await waitActive(page, 'Combat');
}

async function combatView(page: Page): Promise<unknown> {
	return page.evaluate(() => (window as unknown as Hooks).__combat?.() ?? null);
}

test.describe('menu', () => {
	test('every menu button works', async ({ page }) => {
		const errors = trackErrors(page);
		await boot(page);
		const hasSave = await page.evaluate(
			(k) => localStorage.getItem(k) !== null,
			SAVE_KEY_PREFIX,
		);
		expect(hasSave).toBe(false);

		await press(page, 'menu-continue');
		expect(await isActive(page, 'Menu')).toBe(true);

		await press(page, 'menu-credits');
		expect((await texts(page, 'Menu')).some((t) => t.includes('Fonts:'))).toBe(true);

		await press(page, 'menu-settings');
		await waitActive(page, 'Settings');
		await press(page, 'settings-back');
		await waitActive(page, 'Menu');

		await press(page, 'menu-new');
		await waitActive(page, 'Party');
		expect(errors).toEqual([]);
	});
});

test.describe('settings', () => {
	test('each row toggles and persists after reload; language switch changes the menu', async ({
		page,
	}) => {
		const errors = trackErrors(page);
		await boot(page);
		await press(page, 'menu-settings');
		await waitActive(page, 'Settings');

		const before = await page.evaluate((k) => localStorage.getItem(k), SETTINGS_KEY);
		await press(page, 'settings-4');
		await press(page, 'settings-5');
		await press(page, 'settings-6');
		const after = await page.evaluate((k) => localStorage.getItem(k), SETTINGS_KEY);
		expect(after).not.toBe(before);

		await press(page, 'settings-0');
		await page.reload();
		await page.waitForFunction(() =>
			(window as unknown as Hooks).__game?.scene.isActive('Title'),
		);
		await page.locator('canvas').click();
		await waitActive(page, 'Menu');
		const saved = JSON.parse(
			(await page.evaluate((k) => localStorage.getItem(k), SETTINGS_KEY)) ?? '{}',
		);
		expect(saved.locale).toBe('pt-BR');
		expect((await texts(page, 'Menu')).some((t) => t === 'Nova run')).toBe(true);
		expect(errors).toEqual([]);
	});
});

test.describe('pause in combat', () => {
	test('resume, settings back, main menu then continue keeps the same combat; abandon needs two taps', async ({
		page,
	}) => {
		const errors = trackErrors(page);
		await boot(page);
		await startRunToCombat(page, 4242);
		const view = await combatView(page);

		await press(page, 'hud-pause');
		await waitActive(page, 'Pause');
		await press(page, 'pause-resume');
		await waitActive(page, 'Combat');

		await press(page, 'hud-pause');
		await waitActive(page, 'Pause');
		await press(page, 'pause-settings');
		await waitActive(page, 'Settings');
		await press(page, 'settings-back');
		await page.waitForTimeout(50);

		await press(page, 'pause-menu');
		await waitActive(page, 'Menu');
		await press(page, 'menu-continue');
		await waitActive(page, 'Combat');
		expect(await combatView(page)).toEqual(view);

		await press(page, 'hud-pause');
		await waitActive(page, 'Pause');
		await press(page, 'pause-abandon');
		expect(await isActive(page, 'Pause')).toBe(true);
		await press(page, 'pause-abandon');
		await waitActive(page, 'Menu');
		await press(page, 'menu-continue');
		expect(await isActive(page, 'Menu')).toBe(true);
		expect(errors).toEqual([]);
	});
});

test.describe('save and resume', () => {
	test('reload mid-combat, then Continue lands in the same combat view', async ({ page }) => {
		const errors = trackErrors(page);
		await boot(page);
		await startRunToCombat(page, 777);
		const view = await combatView(page);
		await page.reload();
		await page.waitForFunction(() =>
			(window as unknown as Hooks).__game?.scene.isActive('Title'),
		);
		await page.locator('canvas').click();
		await waitActive(page, 'Menu');
		await press(page, 'menu-continue');
		await waitActive(page, 'Combat');
		expect(await combatView(page)).toEqual(view);
		expect(errors).toEqual([]);
	});
});

test.describe('speed parity', () => {
	async function playToSummary(page: Page, speed: number): Promise<string[]> {
		await page.goto('/');
		await page.evaluate(
			([k, s]) => {
				localStorage.setItem(k, JSON.stringify({ defaultSpeed: s }));
				// Same starting profile for both runs: a win unlocks a Rite and adds a line to the summary.
				localStorage.removeItem('ossuary.profile.v1');
			},
			[SETTINGS_KEY, speed] as const,
		);
		await page.reload();
		await page.waitForFunction(() =>
			(window as unknown as Hooks).__game?.scene.isActive('Title'),
		);
		await page.locator('canvas').click();
		await waitActive(page, 'Menu');
		await page.evaluate(
			({ s, party }) => {
				const h = window as unknown as Hooks;
				h.__startRun?.(s, party);
				const game = h.__game;
				game?.scene.getScenes(true).forEach((sc) => {
					if (sc.scene.key !== 'Title') game.scene.stop(sc.scene.key);
				});
				game?.scene.start('Map');
			},
			{ s: 9001, party: PARTY },
		);
		let scene = '';
		for (let i = 0; i < 3000 && scene !== 'Summary'; i++) {
			scene = await page.evaluate(() => (window as unknown as Hooks).__botStep?.() ?? '');
		}
		await waitActive(page, 'Summary');
		return (await texts(page, 'Summary')).filter((t) => t.length > 0);
	}

	test('the same seed at speed 1x and 3x gives the same summary', async ({ page }) => {
		test.setTimeout(240_000);
		const errors = trackErrors(page);
		const slow = await playToSummary(page, 1);
		const fast = await playToSummary(page, 3);
		expect(fast).toEqual(slow);
		expect(errors).toEqual([]);
	});
});
