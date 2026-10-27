import { expect, type Page, test } from '@playwright/test';

// Sanctum between acts (docs/gdd.md §23.1, §23.6): the bot plays Act 1, then the player picks
// Temper with real clicks, chooses two cards in the picker and lands in the camp.

interface RunState {
	phase: string;
	deck: { uid: number; upgraded: boolean }[];
}
type Hooks = {
	__game?: {
		scene: {
			isActive(k: string): boolean;
			getScenes(active: boolean): { children: { list: unknown[] } }[];
		};
	};
	__botStep?: () => string;
	__startRun?: (seed: number, party: string[]) => void;
	__run?: () => RunState | null;
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
}

const upgraded = (page: Page): Promise<number> =>
	page.evaluate(
		() => (window as unknown as Hooks).__run?.()?.deck.filter((c) => c.upgraded).length ?? 0,
	);

test('Sanctum: Temper upgrades the two chosen cards, then the camp opens', async ({ page }) => {
	test.setTimeout(180_000);
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	await page.locator('canvas').click();
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Menu'));

	// First seed whose bot run reaches the Sanctum after the Act 1 boss.
	const reached = await page.evaluate(() => {
		const h = window as unknown as Hooks;
		for (let seed = 1; seed < 20; seed++) {
			h.__startRun?.(seed, ['shieldbearer', 'confessor', 'marksman']);
			for (let i = 0; i < 5000; i++) {
				const scene = h.__botStep?.();
				if (scene === 'Sanctum') return true;
				if (scene === 'Summary') break;
			}
		}
		return false;
	});
	expect(reached).toBe(true);
	await page.waitForFunction(() =>
		(window as unknown as Hooks).__game?.scene.isActive('Sanctum'),
	);
	await page.waitForTimeout(300);

	const before = await upgraded(page);
	await clickObj(page, 'sanctum-upgrade');
	// Picker: tap a card to select, tap again to choose; the second pick excludes the first.
	for (let pick = 0; pick < 2; pick++) {
		await page.waitForTimeout(250);
		await clickObj(page, 'sanctum-card-0');
		await page.waitForTimeout(150);
		await clickObj(page, 'sanctum-card-0');
	}
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Camp'));
	expect(await upgraded(page)).toBe(before + 2);
	expect(errors).toEqual([]);
});
