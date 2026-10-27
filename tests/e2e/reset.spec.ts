import { expect, type Page, test } from '@playwright/test';

// Settings → Reset progress (from the main menu): an in-game confirm step, then Embers, Legacy,
// Rites and the run save are gone while settings stay.

type Hooks = {
	__game?: {
		scene: {
			isActive(k: string): boolean;
			getScenes(active: boolean): { children: { list: unknown[] } }[];
		};
	};
};

async function clickObj(page: Page, name: string): Promise<void> {
	const at = await page.evaluate((n) => {
		const game = (window as unknown as Hooks).__game;
		const find = (
			list: unknown[],
		): { getBounds(): { centerX: number; centerY: number } } | undefined => {
			for (const c of list) {
				if ((c as { name?: string }).name === n) return c as never;
				const kids = (c as { list?: unknown[] }).list;
				const hit = kids ? find(kids) : undefined;
				if (hit) return hit;
			}
			return undefined;
		};
		for (const scene of game?.scene.getScenes(true) ?? []) {
			const obj = find(scene.children.list);
			if (obj) return { x: obj.getBounds().centerX, y: obj.getBounds().centerY };
		}
		return null;
	}, name);
	if (!at) throw new Error(`no game object named ${name}`);
	const box = await page.locator('canvas').boundingBox();
	if (!box) throw new Error('no canvas');
	await page.mouse.click(box.x + (at.x / 640) * box.width, box.y + (at.y / 360) * box.height);
	await page.waitForTimeout(200);
}

test('Reset progress asks first, then erases the profile and the run save', async ({ page }) => {
	await page.addInitScript(() => {
		if (sessionStorage.getItem('seeded')) return;
		sessionStorage.setItem('seeded', '1');
		localStorage.setItem(
			'ossuary.profile.v1',
			JSON.stringify({ version: 1, embers: 77, nodes: {}, banked: [], unlockedRite: 2 }),
		);
		localStorage.setItem(
			'ossuary.settings.v1',
			JSON.stringify({ locale: 'en', textScale: 125 }),
		);
	});
	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	await page.locator('canvas').click();
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Menu'));
	await clickObj(page, 'menu-settings');
	await clickObj(page, 'settings-reset');
	// Cancel keeps everything.
	await clickObj(page, 'settings-reset-cancel');
	expect(await page.evaluate(() => localStorage.getItem('ossuary.profile.v1'))).toContain('77');
	await clickObj(page, 'settings-reset');
	await clickObj(page, 'settings-reset-confirm');
	const profile = await page.evaluate(() =>
		JSON.parse(localStorage.getItem('ossuary.profile.v1') ?? '{}'),
	);
	expect(profile.embers).toBe(0);
	expect(profile.unlockedRite).toBe(0);
	const settings = await page.evaluate(() =>
		JSON.parse(localStorage.getItem('ossuary.settings.v1') ?? '{}'),
	);
	expect(settings.textScale).toBe(125);
});
