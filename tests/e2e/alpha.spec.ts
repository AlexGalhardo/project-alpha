import { expect, type Page, test } from '@playwright/test';

// Alpha flows: event and treasure nodes, act transition, and the Legacy veteran start.
// Map and party clicks are real pointer clicks. Fights, rewards and camps are resolved by
// __botStep, which issues the same commands a player could. Fixed seeds come from __startRun,
// because the party-start button draws a random seed.

type NodeType = 'combat' | 'elite' | 'shop' | 'rest' | 'boss' | 'event' | 'treasure';
interface MapNode {
	row: number;
	index: number;
	type: NodeType;
	next: number[];
}
interface MapView {
	rows: MapNode[][];
	available: { row: number; index: number }[];
	currentRow: number;
}
interface RunState {
	act: number;
	gold: number;
	deck: { owner: string; cardId: string }[];
	event?: { id: string } | null;
}
type Hooks = {
	__game?: {
		scene: {
			isActive(k: string): boolean;
			start(k: string): void;
			stop(k: string): void;
			getScenes(active: boolean): { scene: { key: string }; children: { list: unknown[] } }[];
			getScene(k: string): { children: { list: unknown[] } } | null;
		};
	};
	__botStep?: () => string;
	__startRun?: (seed: number, party: string[]) => void;
	__map?: () => MapView | null;
	__run?: () => RunState | null;
};

const PARTY = ['shieldbearer', 'confessor', 'marksman'];
const SPECIAL: NodeType[] = ['event', 'treasure'];
const FIGHT_SCENES = ['Combat', 'Reward', 'Camp', 'Rest', 'Shop'];
const SCENE_KEYS = [
	'Title',
	'Menu',
	'Party',
	'Map',
	'Combat',
	'Reward',
	'Camp',
	'Rest',
	'Shop',
	'Event',
	'Treasure',
	'Summary',
	'Legacy',
];

function trackErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	return errors;
}

async function bootToMenu(page: Page): Promise<void> {
	await page.goto('/');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Title'));
	await page.locator('canvas').click();
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Menu'));
}

async function activeScene(page: Page): Promise<string> {
	return page.evaluate((keys) => {
		const h = window as unknown as Hooks;
		return keys.find((k) => h.__game?.scene.isActive(k)) ?? '';
	}, SCENE_KEYS);
}

/** Clicks the centre of a named game object with a real mouse click at its canvas position. */
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

async function hasObj(page: Page, name: string): Promise<boolean> {
	return page.evaluate((n) => {
		const find = (list: unknown[]): boolean =>
			list.some(
				(c) =>
					(c as { name?: string }).name === n ||
					find((c as { list?: unknown[] }).list ?? []),
			);
		const game = (window as unknown as Hooks).__game;
		return (game?.scene.getScenes(true) ?? []).some((s) => find(s.children.list));
	}, name);
}

async function texts(page: Page, key: string): Promise<string[]> {
	return page.evaluate((k) => {
		const scene = (window as unknown as Hooks).__game?.scene.getScene(k);
		return (scene?.children.list ?? [])
			.map((c) => (c as { text?: unknown }).text)
			.filter((t): t is string => typeof t === 'string');
	}, key);
}

/** Next map click on a route to any node of `target`, avoiding other special nodes. Null if none. */
function routeStep(map: MapView, target: NodeType): { row: number; index: number } | null {
	const byKey = new Map<string, MapNode>(map.rows.flat().map((n) => [`${n.row}:${n.index}`, n]));
	const nodeAt = (row: number, index: number): MapNode | undefined =>
		byKey.get(`${row}:${index}`);
	const reaches = (start: MapNode): boolean => {
		const seen = new Set<string>();
		const queue: MapNode[] = [start];
		while (queue.length) {
			const n = queue.shift() as MapNode;
			const key = `${n.row}:${n.index}`;
			if (seen.has(key)) continue;
			seen.add(key);
			if (n.type === target) return true;
			if (SPECIAL.includes(n.type)) continue;
			for (const j of n.next) {
				const nxt = nodeAt(n.row + 1, j);
				if (nxt) queue.push(nxt);
			}
		}
		return false;
	};
	for (const a of map.available) {
		const n = nodeAt(a.row, a.index);
		if (n && reaches(n)) return a;
	}
	return null;
}

/** First seed (1..maxSeed) whose opening map has a route to a node of `target`. */
async function findSeed(page: Page, target: NodeType, maxSeed = 400): Promise<number | null> {
	for (let seed = 1; seed <= maxSeed; seed++) {
		const map = await page.evaluate(
			([s, party]) => {
				const h = window as unknown as Hooks;
				h.__startRun?.(s, party);
				return h.__map?.() ?? null;
			},
			[seed, PARTY] as [number, string[]],
		);
		if (map && routeStep(map, target)) return seed;
	}
	return null;
}

/** Walks the map with real clicks on the route to `target`; resolves fights with the bot. */
async function walkTo(page: Page, target: 'Event' | 'Treasure'): Promise<void> {
	const nodeType: NodeType = target === 'Event' ? 'event' : 'treasure';
	for (let step = 0; step < 200; step++) {
		const scene = await activeScene(page);
		if (scene === target) return;
		if (scene === 'Summary') throw new Error('run ended before reaching the target node');
		if (scene === 'Map') {
			const map = await page.evaluate(() => (window as unknown as Hooks).__map?.() ?? null);
			if (!map) throw new Error('no map view');
			const pick = routeStep(map, nodeType);
			if (!pick) {
				throw new Error(
					`no route to a ${nodeType} node; currentRow=${map.currentRow} available=${JSON.stringify(map.available)}`,
				);
			}
			await clickObj(page, `node-${pick.row}-${pick.index}`);
		} else if (FIGHT_SCENES.includes(scene)) {
			await page.evaluate(() => (window as unknown as Hooks).__botStep?.());
		}
		await page.waitForTimeout(150);
	}
	throw new Error(`did not reach ${target} within the step budget`);
}

async function gold(page: Page): Promise<number> {
	return page.evaluate(() => (window as unknown as Hooks).__run?.()?.gold ?? -1);
}

async function startSeededMap(page: Page, seed: number): Promise<void> {
	await page.evaluate(
		([s, party]) => {
			const h = window as unknown as Hooks;
			h.__startRun?.(s, party);
			h.__game?.scene.stop('Menu');
			h.__game?.scene.start('Map');
		},
		[seed, PARTY] as [number, string[]],
	);
	await page.waitForTimeout(300);
}

test('event node: walk to it, pick Fill vials, gold rises by 40', async ({ page }) => {
	const errors = trackErrors(page);
	await bootToMenu(page);
	const seed = await findSeed(page, 'event');
	expect(seed).not.toBeNull();
	await startSeededMap(page, seed as number);

	await walkTo(page, 'Event');
	const eventId = await page.evaluate(
		() => (window as unknown as Hooks).__run?.()?.event?.id ?? null,
	);
	expect(eventId).not.toBeNull();

	const before = await gold(page);
	if (eventId === 'ev_weeping_font') {
		await clickObj(page, 'event-choice-1');
		await page.waitForFunction(
			() => (window as unknown as Hooks).__game?.scene.isActive('Event') === false,
		);
		expect(await gold(page)).toBe(before + 40);
	} else {
		// Other events: take the first choice and check only that the event closes.
		await clickObj(page, 'event-choice-0');
		await page.waitForFunction(
			() => (window as unknown as Hooks).__game?.scene.isActive('Event') === false,
		);
	}
	expect(errors).toEqual([]);
});

test('treasure node: walk to it, claim, gold rises by 25', async ({ page }) => {
	const errors = trackErrors(page);
	await bootToMenu(page);
	const seed = await findSeed(page, 'treasure');
	expect(seed).not.toBeNull();
	await startSeededMap(page, seed as number);

	await walkTo(page, 'Treasure');
	const before = await gold(page);
	await clickObj(page, 'treasure-claim');
	await page.waitForFunction(
		() => (window as unknown as Hooks).__game?.scene.isActive('Treasure') === false,
	);
	expect(await gold(page)).toBe(before + 25);
	expect(errors).toEqual([]);
});

test('act transition: after the Act 1 boss the Map shows Act 2', async ({ page }) => {
	const errors = trackErrors(page);
	await bootToMenu(page);
	// Bot-driven run: stop at the first seed whose bot run reaches Act 2 on the Map.
	let reached: number | null = null;
	for (let seed = 1; seed <= 60 && reached === null; seed++) {
		reached = await page.evaluate(async (s) => {
			const h = window as unknown as Hooks;
			const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()));
			h.__startRun?.(s, ['shieldbearer', 'confessor', 'marksman']);
			h.__game?.scene.stop('Menu');
			h.__game?.scene.start('Map');
			// Scene starts and stops apply on the next frame, so yield one frame per bot step.
			for (let i = 0; i < 1500; i++) {
				await frame();
				if (h.__game?.scene.isActive('Summary')) return null;
				if ((h.__run?.()?.act ?? 0) === 2 && h.__game?.scene.isActive('Map')) return s;
				h.__botStep?.();
			}
			return null;
		}, seed);
	}
	expect(reached).not.toBeNull();
	expect(await activeScene(page)).toBe('Map');
	expect((await texts(page, 'Map')).some((t) => t.includes('Act 2'))).toBe(true);
	expect(errors).toEqual([]);
});

test('Legacy veteran start: node III shows the toggle and the run starts with Ricochet', async ({
	page,
}) => {
	const errors = trackErrors(page);
	await page.addInitScript(() => {
		try {
			localStorage.setItem(
				'ossuary.profile.v1',
				JSON.stringify({
					version: 1,
					embers: 0,
					nodes: {
						shieldbearer: 0,
						marksman: 3,
						arcanist: 0,
						confessor: 0,
						bombardier: 0,
					},
					banked: [],
				}),
			);
		} catch {
			// Storage blocked: the toggle check below fails.
		}
	});
	await bootToMenu(page);
	await clickObj(page, 'menu-new');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Party'));
	expect(await hasObj(page, 'party-veteran')).toBe(true);
	await clickObj(page, 'party-start');
	await page.waitForFunction(() => (window as unknown as Hooks).__game?.scene.isActive('Map'));
	const deck = await page.evaluate(() => (window as unknown as Hooks).__run?.()?.deck ?? []);
	expect(deck.some((c) => c.owner === 'marksman' && c.cardId === 'mrk_ricochet')).toBe(true);
	expect(errors).toEqual([]);
});
