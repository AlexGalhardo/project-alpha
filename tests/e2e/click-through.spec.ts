import { expect, type Page, test } from '@playwright/test';

interface Card {
	uid: number;
	cardId: string;
	cost: number;
	playable: boolean;
	autoTarget: boolean;
	validTargets: ({ type: 'enemy'; uid: number } | { type: 'hero'; id: string } | null)[];
}
interface View {
	turn: number;
	round: number;
	phase: 'player' | 'won' | 'lost';
	energy: number;
	hand: Card[];
}
type Hooks = {
	__game?: {
		scene: {
			isActive(k: string): boolean;
			getScene(k: string): { children: { list: unknown[] } } | null;
			getScenes(active: boolean): { children: { list: unknown[] } }[];
		};
	};
	__combat?: () => View | null;
};

const MAX_TURNS = 40;
const AUTO_AFTER_TURNS = 25;

function trackErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	return errors;
}

async function waitScene(page: Page, key: string): Promise<void> {
	await page.waitForFunction(
		(k) => (window as unknown as Hooks).__game?.scene.isActive(k) ?? false,
		key,
	);
}

/** Clicks the centre of a named game object with a real mouse click at its canvas position. */
async function clickObj(page: Page, name: string): Promise<void> {
	const at = await page.evaluate((n) => {
		const game = (window as unknown as Hooks).__game;
		// Recursive: cards and zones sit inside layer containers.
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

async function texts(page: Page, key: string): Promise<string[]> {
	return page.evaluate((k) => {
		const scene = (window as unknown as Hooks).__game?.scene.getScene(k);
		return (scene?.children.list ?? [])
			.map((c) => (c as { text?: unknown }).text)
			.filter((t): t is string => typeof t === 'string');
	}, key);
}

/** Waits for CombatScene's animation lock (`busy`) to clear. Read-only: the flag is never set from the test. */
async function waitCombatIdle(page: Page): Promise<void> {
	await page.waitForFunction(
		() => {
			const scene = (window as unknown as Hooks).__game?.scene.getScene('Combat') as
				| { busy?: boolean }
				| null
				| undefined;
			return !scene?.busy;
		},
		undefined,
		{ timeout: 15_000 },
	);
}

async function combat(page: Page): Promise<View | null> {
	return page.evaluate(() => (window as unknown as Hooks).__combat?.() ?? null);
}

/** Waits until the combat state differs from `before`, or the scene leaves Combat. */
async function waitCombatChange(page: Page, before: View | null): Promise<void> {
	const signature = (v: View | null): string =>
		v ? JSON.stringify([v.phase, v.round, v.turn, v.energy, v.hand.map((c) => c.uid)]) : '';
	const prev = signature(before);
	await page.waitForFunction(
		(p) => {
			const h = window as unknown as Hooks;
			if (!h.__game?.scene.isActive('Combat')) return true;
			const v = h.__combat?.();
			return (
				!v ||
				JSON.stringify([v.phase, v.round, v.turn, v.energy, v.hand.map((c) => c.uid)]) !== p
			);
		},
		prev,
		{ timeout: 10_000 },
	);
}

test('a full click-through: Menu to Camp with real pointer clicks only', async ({ page }) => {
	const errors = trackErrors(page);
	const sequence: string[] = [];
	const note = async (key: string): Promise<void> => {
		await waitScene(page, key);
		sequence.push(key);
	};

	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	await page.locator('canvas').click();
	await note('Menu');

	await clickObj(page, 'menu-new');
	await note('Party');
	expect((await texts(page, 'Party')).some((t) => t === '3 of 3 chosen')).toBe(true);

	await clickObj(page, 'party-marksman');
	await page.waitForTimeout(100);
	expect((await texts(page, 'Party')).some((t) => t === '2 of 3 chosen')).toBe(true);
	await clickObj(page, 'party-arcanist');
	await page.waitForTimeout(100);
	expect((await texts(page, 'Party')).some((t) => t === '3 of 3 chosen')).toBe(true);

	await clickObj(page, 'party-start');
	await note('Map');

	await page.waitForFunction(() =>
		(window as unknown as Hooks).__game?.scene
			.getScene('Map')
			?.children.list.some((c) => (c as { name?: string }).name?.startsWith('node-')),
	);
	const node = await page.evaluate(() => {
		const scene = (window as unknown as Hooks).__game?.scene.getScene('Map');
		const img = (scene?.children.list ?? []).find(
			(c) =>
				(c as { name?: string }).name?.startsWith('node-') &&
				(c as { texture?: { key: string } }).texture?.key === 'icon.node.combat',
		) as { name: string } | undefined;
		return img?.name ?? null;
	});
	if (!node) throw new Error('no combat node available on the first map');
	await clickObj(page, node);
	await note('Combat');

	let ends = 0;
	let autoTried = false;
	while (
		await page.evaluate(() => (window as unknown as Hooks).__game?.scene.isActive('Combat'))
	) {
		// Taps are ignored while CombatScene.busy is set; read the hand only once the animation has finished.
		await waitCombatIdle(page);
		const v = await combat(page);
		// Null after the final blow: the state is cleared before the scene leaves Combat.
		if (!v) {
			await page.waitForTimeout(200);
			continue;
		}
		if (v.phase !== 'player') {
			await page.waitForTimeout(200);
			continue;
		}
		const idx = v.hand.findIndex(
			(c) =>
				c.playable && c.cost <= v.energy && (c.autoTarget || c.validTargets.some((t) => t)),
		);
		if (idx >= 0) {
			const card = v.hand[idx] as Card;
			// First tap selects the card. An auto-target card plays on the second tap; others need a target tap.
			await clickObj(page, `card-${idx}`);
			await page.waitForTimeout(400);
			if (card.autoTarget) {
				await clickObj(page, `card-${idx}`);
			} else {
				const target = card.validTargets.find((t) => t) as NonNullable<
					Card['validTargets'][number]
				>;
				const tname = target.type === 'enemy' ? `enemy-${target.uid}` : `hero-${target.id}`;
				await clickObj(page, tname);
				await page.waitForTimeout(200);
			}
			await waitCombatChange(page, v);
			continue;
		}
		ends++;
		if (ends > MAX_TURNS) throw new Error(`combat not finished after ${MAX_TURNS} turns`);
		if (ends > AUTO_AFTER_TURNS && !autoTried) {
			autoTried = true;
			await clickObj(page, 'hud-auto');
		}
		await clickObj(page, 'hud-end-turn');
		await waitCombatChange(page, v);
	}

	await note('Reward');
	await clickObj(page, 'reward-card-0');
	await page.waitForTimeout(100);
	await clickObj(page, 'reward-take');
	await note('Camp');
	await clickObj(page, 'camp-leave');
	await note('Map');

	expect(sequence).toEqual(['Menu', 'Party', 'Map', 'Combat', 'Reward', 'Camp', 'Map']);
	expect(errors).toEqual([]);
});
