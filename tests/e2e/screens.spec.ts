import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';

type Hooks = {
	__game?: {
		scene: {
			isActive(key: string): boolean;
			pause(key: string): void;
			resume(key: string): void;
			run(key: string, data?: unknown): void;
			stop(key: string): void;
			start(key: string, data?: unknown): void;
		};
	};
	__botStep?: () => string;
};

const SCREEN_DIR = join('test-results', 'screens');
const SETTINGS_KEY = 'ossuary.settings.v1';

function hooks(page: Page): Promise<void> {
	return page
		.waitForFunction(() => (window as unknown as Hooks).__game !== undefined)
		.then(() => undefined);
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

async function shot(page: Page, dir: string, name: string): Promise<void> {
	// One folder per Playwright project so the desktop and mobile tours do not overwrite each other.
	const out = join(SCREEN_DIR, test.info().project.name, dir);
	mkdirSync(out, { recursive: true });
	await page.screenshot({ path: join(out, name) });
}

function trackErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	return errors;
}

async function openSettingsFromMenu(page: Page): Promise<void> {
	await page.evaluate(() => {
		const g = (window as unknown as Hooks).__game;
		g?.scene.stop('Menu');
		g?.scene.run('Settings', { returnTo: 'Menu' });
	});
	await waitActive(page, 'Settings');
}

async function walkRun(page: Page, dir: string, order: number, seen: Set<string>): Promise<number> {
	let index = order;
	let pausedOnce = false;
	for (let i = 0; i < 3000; i++) {
		const scene = await page.evaluate(() => (window as unknown as Hooks).__botStep?.() ?? '');
		if (scene === 'Summary' && seen.has('Summary')) break;
		if (!seen.has(scene) && (await isActive(page, scene))) {
			seen.add(scene);
			index += 1;
			await shot(page, dir, `${String(index).padStart(2, '0')}-${scene.toLowerCase()}.png`);
		}
		if (scene === 'Combat' && !pausedOnce) {
			pausedOnce = true;
			await page.evaluate(() => {
				const g = (window as unknown as Hooks).__game;
				g?.scene.pause('Combat');
				g?.scene.run('Pause', { returnTo: 'Combat' });
			});
			await waitActive(page, 'Pause');
			index += 1;
			await shot(page, dir, `${String(index).padStart(2, '0')}-pause.png`);
			await page.evaluate(() => {
				const g = (window as unknown as Hooks).__game;
				g?.scene.stop('Pause');
				g?.scene.resume('Combat');
			});
		}
		if (scene === 'Summary') break;
	}
	return index;
}

test('screens: title to summary, one capture per scene (EN)', async ({ page }) => {
	test.setTimeout(300_000);
	const errors = trackErrors(page);
	await page.goto('/');
	await hooks(page);
	await waitActive(page, 'Title');
	await shot(page, 'en', '01-title.png');

	const canvas = page.locator('canvas');
	await canvas.click();
	await waitActive(page, 'Menu');
	await shot(page, 'en', '02-menu.png');

	await openSettingsFromMenu(page);
	await shot(page, 'en', '03-settings.png');
	await page.evaluate(() => {
		const g = (window as unknown as Hooks).__game;
		g?.scene.stop('Settings');
		g?.scene.start('Menu');
	});
	await waitActive(page, 'Menu');

	await page.evaluate(() => {
		const g = (window as unknown as Hooks).__game;
		g?.scene.stop('Menu');
		g?.scene.start('Party');
	});
	await waitActive(page, 'Party');
	await shot(page, 'en', '04-party.png');

	const box = await canvas.boundingBox();
	if (!box) throw new Error('canvas not visible');
	await page.mouse.click(box.x + (320 / 640) * box.width, box.y + (312 / 360) * box.height);

	const seen = new Set<string>(['Title', 'Menu', 'Settings', 'Party']);
	await walkRun(page, 'en', 4, seen);
	expect(await isActive(page, 'Summary')).toBe(true);
	expect(errors).toEqual([]);
});

test('screens: PT-BR menu and combat', async ({ page }) => {
	test.setTimeout(120_000);
	const errors = trackErrors(page);
	await page.addInitScript((key) => {
		try {
			window.localStorage.setItem(key, JSON.stringify({ locale: 'pt-BR' }));
		} catch {
			// storage unavailable: the test then runs in English and the capture names still apply
		}
	}, SETTINGS_KEY);

	await page.goto('/');
	await hooks(page);
	await waitActive(page, 'Title');
	await page.locator('canvas').click();
	await waitActive(page, 'Menu');
	await shot(page, 'pt', '01-menu.png');

	await page.evaluate(() => {
		const g = (window as unknown as Hooks).__game;
		g?.scene.stop('Menu');
		g?.scene.start('Party');
	});
	await waitActive(page, 'Party');
	const canvas = page.locator('canvas');
	const box = await canvas.boundingBox();
	if (!box) throw new Error('canvas not visible');
	await page.mouse.click(box.x + (320 / 640) * box.width, box.y + (312 / 360) * box.height);

	for (let i = 0; i < 3000; i++) {
		const scene = await page.evaluate(() => (window as unknown as Hooks).__botStep?.() ?? '');
		if (scene === 'Combat') break;
	}
	await waitActive(page, 'Combat');
	await shot(page, 'pt', '02-combat.png');
	expect(errors).toEqual([]);
});
