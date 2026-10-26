import { startCombat } from '../../src/core/combat.ts';
import { type Ctx, emptyStatuses } from '../../src/core/ops.ts';
import { newCard } from '../../src/core/rewards.ts';
import { apply, createRun } from '../../src/core/run.ts';
import type {
	CombatState,
	Command,
	Enemy,
	GameEvent,
	HeroClass,
	HeroFx,
	RunState,
	Target,
} from '../../src/core/types.ts';
import { ENEMIES } from '../../src/data/index.ts';

export const PARTY: HeroClass[] = ['shieldbearer', 'confessor', 'marksman'];

export function ctxOf(s: RunState): Ctx & { ev: GameEvent[] } {
	return { s, ev: [] };
}

/** A fresh run already inside combat `enc`. */
export function combatRun(
	enc = 'A1',
	party: HeroClass[] = PARTY,
	seed = 1,
	kind: CombatState['kind'] = 'common',
): RunState {
	const s = createRun(seed, party);
	startCombat(ctxOf(s), enc, kind);
	return s;
}

export function combat(s: RunState): CombatState {
	if (!s.combat) throw new Error('no combat');
	return s.combat;
}

/** Replace the enemy line with one enemy of `key` at intent index 0 (fully controlled). */
export function isolate(s: RunState, key = 'ossified_brute', hp?: number): Enemy {
	const def = ENEMIES[key];
	if (!def) throw new Error(`unknown enemy ${key}`);
	const k = combat(s);
	const e: Enemy = {
		uid: 99,
		key,
		hp: hp ?? def.hp,
		maxHP: hp ?? def.hp,
		speed: def.speed,
		size: def.size,
		fx: emptyStatuses(),
		intentIdx: 0,
		phase: 1,
		dmgMul: 1,
		trait: null,
		keg: 0,
	};
	k.enemies = [e];
	return e;
}

export function setHand(s: RunState, ids: string[]): number[] {
	const k = combat(s);
	k.hand = ids.map((id) => newCard(s, id));
	k.energy = 3;
	return k.hand.map((c) => c.uid);
}

export function run(s: RunState, cmd: Command): { s: RunState; ev: GameEvent[] } {
	const r = apply(s, cmd);
	return { s: r.state, ev: r.events };
}

export const enemyTarget = (uid: number): Target => ({ type: 'enemy', uid });
export const heroTarget = (id: HeroClass): Target => ({ type: 'hero', id });
export const invalidOf = (ev: GameEvent[]): GameEvent[] => ev.filter((e) => e.type === 'invalid');

export function heroFx(s: RunState, id: HeroClass): HeroFx {
	const fx = combat(s).heroFx[id];
	if (!fx) throw new Error(`no fx for ${id}`);
	return fx;
}
