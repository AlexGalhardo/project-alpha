// Combat primitives shared by cards, enemies and the turn flow. Mutates the state it is given;
// `apply` always hands it a private copy.
import { ELITE, ENEMIES, EQUIPMENT_NUMBERS, RULES } from '../data/index.ts';
import { rand, shuffle } from './rng.ts';
import type {
	CombatState,
	Debuff,
	Enemy,
	GameEvent,
	HeroClass,
	HeroFx,
	HeroState,
	RunState,
	Statuses,
	UnitRef,
} from './types.ts';

export interface Ctx {
	s: RunState;
	ev: GameEvent[];
	/** Scoring run on a throwaway copy: combat end does not advance the run. */
	dry?: boolean;
}

export function emptyStatuses(): Statuses {
	return {
		block: 0,
		might: 0,
		marked: 0,
		weakened: 0,
		bleed: 0,
		burn: 0,
		ward: 0,
		stunned: false,
		stunImmune: false,
	};
}

export function emptyHeroFx(): HeroFx {
	return { ...emptyStatuses(), taunt: false, keepBlock: false };
}

export function cs(c: Ctx): CombatState {
	if (!c.s.combat) throw new Error('no combat in progress');
	return c.s.combat;
}

export function heroOf(s: RunState, id: HeroClass): HeroState {
	const h = s.party.find((x) => x.id === id);
	if (!h) throw new Error(`hero ${id} not in party`);
	return h;
}

export function maxHP(h: HeroState): number {
	const base =
		h.baseMax + (h.relic === 'eq_bone_reliquary' ? EQUIPMENT_NUMBERS.reliquaryMaxHP : 0);
	return h.injured ? Math.floor(base * RULES.injuryMaxHPMul) : base;
}

export const heroRef = (id: HeroClass): UnitRef => ({ side: 'hero', id });
export const enemyRef = (e: Enemy): UnitRef => ({ side: 'enemy', uid: e.uid });

export function enemyOf(c: CombatState, uid: number): Enemy | undefined {
	return c.enemies.find((e) => e.uid === uid);
}

/** First occupied rank (1-based) of an enemy. */
export function enemyRank(c: CombatState, e: Enemy): number {
	let r = 1;
	for (const x of c.enemies) {
		if (x === e) return r;
		r += x.size;
	}
	return r;
}

export function enemyReaches(c: CombatState, e: Enemy, ranks: number[] | 'any'): boolean {
	if (ranks === 'any') return true;
	const r = enemyRank(c, e);
	return ranks.some((x) => x >= r && x < r + e.size);
}

export function heroRank(c: CombatState, id: HeroClass): number {
	return c.lineup.indexOf(id) + 1;
}

export function fxOf(c: CombatState, ref: UnitRef): Statuses {
	if (ref.side === 'hero') return c.heroFx[ref.id] as HeroFx;
	const e = enemyOf(c, ref.uid);
	if (!e) throw new Error('unit not found');
	return e.fx;
}

export function dmgScale(e: Enemy, amount: number): number {
	return Math.round(amount * e.dmgMul);
}

/** GDD 5.5 */
export function hitDamage(base: number, attacker: Statuses | null, target: Statuses): number {
	const might = attacker ? attacker.might : 0;
	const weak = attacker && attacker.weakened > 0 ? RULES.weakenedMul : 1;
	const marked = target.marked > 0 ? RULES.markedMul : 1;
	return Math.floor((base + might) * marked * weak);
}

// ---- statuses ----
export function addDebuff(c: Ctx, ref: UnitRef, status: Debuff, amount: number): boolean {
	if (amount <= 0) return false;
	const fx = fxOf(cs(c), ref);
	if (fx.ward > 0) {
		fx.ward -= 1;
		c.ev.push({ type: 'negated', target: ref, status });
		return false;
	}
	fx[status] += amount;
	c.ev.push({ type: 'status', target: ref, status, amount });
	return true;
}

export function addStun(c: Ctx, e: Enemy): boolean {
	if (e.fx.stunImmune) return false;
	if (e.fx.ward > 0) {
		e.fx.ward -= 1;
		c.ev.push({ type: 'negated', target: enemyRef(e), status: 'stunned' });
		return false;
	}
	e.fx.stunned = true;
	c.ev.push({ type: 'status', target: enemyRef(e), status: 'stunned', amount: 1 });
	return true;
}

export function addWard(c: Ctx, ref: UnitRef, amount: number): void {
	fxOf(cs(c), ref).ward += amount;
	c.ev.push({ type: 'status', target: ref, status: 'ward', amount });
}

export function gainBlock(c: Ctx, ref: UnitRef, amount: number): void {
	if (amount <= 0) return;
	fxOf(cs(c), ref).block += amount;
	c.ev.push({ type: 'block', target: ref, amount });
	if (ref.side === 'enemy') {
		const e = enemyOf(cs(c), ref.uid);
		if (e && e.trait === 'oathwall') {
			for (const o of cs(c).enemies) {
				if (o !== e) {
					o.fx.block += ELITE.oathwallBlock;
					c.ev.push({ type: 'block', target: enemyRef(o), amount: ELITE.oathwallBlock });
				}
			}
		}
	}
}

export function healHero(c: Ctx, id: HeroClass, amount: number): number {
	const k = cs(c);
	if (!k.lineup.includes(id)) return 0;
	const h = heroOf(c.s, id);
	const gain = Math.max(0, Math.min(amount, maxHP(h) - h.hp));
	h.hp += gain;
	if (gain > 0) c.ev.push({ type: 'heal', target: id, amount: gain });
	return gain;
}

export function addStress(c: Ctx, id: HeroClass, n: number): void {
	const k = cs(c);
	if (!k.lineup.includes(id) || n === 0) return;
	const h = heroOf(c.s, id);
	h.stress = Math.max(0, h.stress + n);
	c.ev.push({ type: 'stress', target: id, amount: n });
	if (n > 0 && h.stress >= RULES.stressMax) {
		h.stress = RULES.stressReset;
		k.collapsePending += 1;
		c.s.stats.collapses += 1;
		c.ev.push({ type: 'collapse', target: id });
	}
}

export function clearDebuffs(fx: Statuses): void {
	fx.marked = 0;
	fx.weakened = 0;
	fx.bleed = 0;
	fx.burn = 0;
}

// ---- hits ----
export function fallHero(c: Ctx, id: HeroClass): void {
	const k = cs(c);
	if (!k.lineup.includes(id)) return;
	k.lineup = k.lineup.filter((x) => x !== id);
	k.fallen.push(id);
	k.anyFell = true;
	c.s.stats.falls += 1;
	heroOf(c.s, id).hp = 0;
	c.ev.push({ type: 'fall', target: id });
	for (const other of [...k.lineup]) addStress(c, other, RULES.fallStressToOthers);
	if (k.lineup.length === 0) k.phase = 'lost';
}

/** Damage from an enemy (or a dot, `from` null) to a hero. */
export function hitHero(
	c: Ctx,
	id: HeroClass,
	base: number,
	from: Enemy | null,
	ignoreBlock = false,
): number {
	const k = cs(c);
	if (!k.lineup.includes(id)) return 0;
	const h = heroOf(c.s, id);
	const fx = k.heroFx[id] as HeroFx;
	const dmg = from ? hitDamage(base, from.fx, fx) : base;
	const absorbed = ignoreBlock ? 0 : Math.min(fx.block, dmg);
	fx.block -= absorbed;
	const lost = Math.min(h.hp, dmg - absorbed);
	h.hp -= lost;
	c.ev.push({
		type: 'hit',
		source: from ? enemyRef(from) : null,
		target: heroRef(id),
		amount: dmg,
		absorbed,
		hpLost: lost,
	});
	if (h.hp <= 0) fallHero(c, id);
	return lost;
}

export function killEnemy(c: Ctx, e: Enemy): void {
	const k = cs(c);
	k.enemies = k.enemies.filter((x) => x !== e);
	c.ev.push({ type: 'enemyDied', uid: e.uid, key: e.key });
	if (k.enemies.length === 0 && k.phase === 'player') k.phase = 'won';
}

function bossPhaseCheck(c: Ctx, e: Enemy): void {
	const def = ENEMIES[e.key];
	if (!def || def.phase2Hp === undefined || e.phase !== 1 || e.hp <= 0 || e.hp > def.phase2Hp)
		return;
	e.phase = 2;
	clearDebuffs(e.fx);
	e.fx.stunned = false;
	e.fx.might += 2;
	e.intentIdx = 0;
	c.ev.push({ type: 'bossPhase', uid: e.uid, phase: 2 });
}

export interface HitOpts {
	ignoreBlock?: boolean;
	noKeg?: boolean;
	/** Hero attributed as the source (its Might/Weakened apply). */
	source?: HeroClass | null;
	/** Flat extra damage before multipliers (weapon, focus, reload). */
	extra?: number;
}

/** Damage from a hero card (or a dot) to an enemy. Returns HP lost. */
export function hitEnemy(c: Ctx, e: Enemy, base: number, opts: HitOpts = {}): number {
	const k = cs(c);
	if (!k.enemies.includes(e)) return 0;
	const attacker = opts.source ? (k.heroFx[opts.source] as HeroFx) : null;
	let dmg = hitDamage(base + (opts.extra ?? 0), attacker, e.fx);
	if (e.trait === 'calcified' && dmg > 0) dmg = Math.max(1, dmg - ELITE.calcifiedReduction);
	const absorbed = opts.ignoreBlock ? 0 : Math.min(e.fx.block, dmg);
	e.fx.block -= absorbed;
	const lost = Math.min(e.hp, dmg - absorbed);
	e.hp -= lost;
	c.ev.push({
		type: 'hit',
		source: opts.source ? heroRef(opts.source) : null,
		target: enemyRef(e),
		amount: dmg,
		absorbed,
		hpLost: lost,
	});
	if (e.hp <= 0) {
		killEnemy(c, e);
		return lost;
	}
	bossPhaseCheck(c, e);
	if (e.keg > 0 && !opts.noKeg) {
		const keg = e.keg;
		e.keg = 0;
		const idx = k.enemies.indexOf(e);
		const group = [e, k.enemies[idx - 1], k.enemies[idx + 1]].filter((x): x is Enemy => !!x);
		for (const t of group) hitEnemy(c, t, keg, { noKeg: true });
	}
	return lost;
}

export function dotEnemy(c: Ctx, e: Enemy, amount: number, status: 'bleed' | 'burn'): void {
	if (amount <= 0) return;
	const lost = Math.min(e.hp, amount);
	e.hp -= lost;
	c.ev.push({ type: 'dot', target: enemyRef(e), status, hpLost: lost });
	if (e.hp <= 0) killEnemy(c, e);
	else bossPhaseCheck(c, e);
}

export function dotHero(c: Ctx, id: HeroClass, amount: number, status: 'bleed' | 'burn'): void {
	const k = cs(c);
	if (amount <= 0 || !k.lineup.includes(id)) return;
	const h = heroOf(c.s, id);
	const lost = Math.min(h.hp, amount);
	h.hp -= lost;
	c.ev.push({ type: 'dot', target: heroRef(id), status, hpLost: lost });
	if (h.hp <= 0) fallHero(c, id);
}

// ---- positions ----
export function moveEnemy(c: Ctx, e: Enemy, delta: number): void {
	const k = cs(c);
	const from = k.enemies.indexOf(e);
	const to = Math.max(0, Math.min(k.enemies.length - 1, from + delta));
	if (to === from) return;
	const step = to > from ? 1 : -1;
	for (let i = from; i !== to; i += step) {
		const a = k.enemies[i] as Enemy;
		k.enemies[i] = k.enemies[i + step] as Enemy;
		k.enemies[i + step] = a;
	}
	c.ev.push({ type: 'moved', unit: enemyRef(e), from: from + 1, to: to + 1 });
}

export function swapHeroes(c: Ctx, a: number, b: number): void {
	const k = cs(c);
	if (a < 0 || b < 0 || a >= k.lineup.length || b >= k.lineup.length || a === b) return;
	const x = k.lineup[a] as HeroClass;
	k.lineup[a] = k.lineup[b] as HeroClass;
	k.lineup[b] = x;
	c.ev.push({ type: 'moved', unit: heroRef(x), from: a + 1, to: b + 1 });
}

// ---- piles ----
export function drawCards(c: Ctx, n: number): void {
	const k = cs(c);
	for (let i = 0; i < n; i++) {
		if (k.hand.length >= RULES.handMax) return;
		if (k.draw.length === 0) {
			if (k.discard.length === 0) return;
			k.draw = k.discard;
			k.discard = [];
			shuffle(c.s, 'combat', k.draw);
			c.ev.push({ type: 'reshuffled' });
		}
		const card = k.draw.pop();
		if (!card) return;
		k.hand.push(card);
		c.ev.push({ type: 'cardDrawn', cardUid: card.uid });
	}
}

export function randomEnemy(c: Ctx): Enemy | undefined {
	const k = cs(c);
	if (k.enemies.length === 0) return undefined;
	return k.enemies[Math.floor(rand(c.s, 'combat') * k.enemies.length)];
}
