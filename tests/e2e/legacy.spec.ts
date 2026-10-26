import { expect, type Page, test } from '@playwright/test';

type Obj = { name: string; x: number; y: number; width: number; height: number; list?: Obj[] };
type Hooks = {
	__game?: {
		scene: {
			isActive(k: string): boolean;
			start(k: string): void;
			stop(k: string): void;
			getScene(k: string): { children: { list: Obj[] } };
		};
	};
};

async function clickNamed(page: Page, scene: string, name: string): Promise<void> {
	const pos = await page.evaluate(
		([s, n]) => {
			const g = (window as unknown as Hooks).__game;
			const find = (list: Obj[]): Obj | null => {
				for (const o of list) {
					if (o.name === n) return o;
					const inner = o.list ? find(o.list) : null;
					if (inner) return inner;
				}
				return null;
			};
			const o = g ? find(g.scene.getScene(s as string).children.list) : null;
			return o ? { x: o.x + o.width / 2, y: o.y + o.height / 2 } : null;
		},
		[scene, name],
	);
	if (!pos) throw new Error(`${name} not found`);
	const box = await page.locator('canvas').boundingBox();
	if (!box) throw new Error('no canvas');
	await page.mouse.click(box.x + (pos.x / 640) * box.width, box.y + (pos.y / 360) * box.height);
}

test('Legacy: banked Embers buy skill-tree nodes and persist', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.addInitScript(() => {
		localStorage.setItem(
			'ossuary.profile.v1',
			JSON.stringify({ version: 1, embers: 40, nodes: {}, banked: [] }),
		);
	});
	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	await page.locator('canvas').click();
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Menu'));
	await clickNamed(page, 'Menu', 'menu-legacy');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Legacy'));
	await clickNamed(page, 'Legacy', 'legacy-buy-marksman');
	await clickNamed(page, 'Legacy', 'legacy-buy-marksman');
	await page.waitForTimeout(200);
	const profile = await page.evaluate(() =>
		JSON.parse(localStorage.getItem('ossuary.profile.v1') ?? '{}'),
	);
	expect(profile.nodes.marksman).toBe(2);
	expect(profile.embers).toBe(5);
	await page.screenshot({ path: 'test-results/screens/legacy.png' });
	expect(errors).toEqual([]);
});
