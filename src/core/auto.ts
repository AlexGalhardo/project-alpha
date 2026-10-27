// Auto battle policy (GDD 14.1): greedy, one (card, target) per step.
import { RULES } from '../data/index.ts';
import { cardDef, paramsOf, playableReason, validTargets } from './cards.ts';
import { incomingDamage, playCard } from './combat.ts';
import type { CombatState, Command, GameEvent, HeroFx, RunState, Target } from './types.ts';

/** Value of putting a Power into play (the formula in GDD 14.1 scores them 0, so the bot would never play them). */
const POWER_VALUE = 6;
/** Value of one point of energy gained for next turn: about one 1-cost play (auto scores damage in points). */
const ENERGY_VALUE = 6;
/** Value of one card drawn. */
const CARD_VALUE = 4;
/** Share of a Reload bonus counted as value when the owner has an attack in hand to use it on. */
const BONUS_WEIGHT = 0.8;
/** A hero returning to the line from a fall (Rekindle): fixed value on top of the HP restored. */
const RETURN_VALUE = 15;
/** Penalty for a play that pushes its owner to a Collapse (GDD 7.1): losing energy next turn is a real cost. */
const COLLAPSE_PENALTY = 50;

export function cloneCombat(k: CombatState): CombatState {
	const heroFx: Record<string, HeroFx> = {};
	for (const [id, fx] of Object.entries(k.heroFx)) heroFx[id] = { ...fx };
	return {
		...k,
		lineup: [...k.lineup],
		fallen: [...k.fallen],
		rekindled: [...k.rekindled],
		heroFx,
		enemies: k.enemies.map((e) => ({ ...e, fx: { ...e.fx } })),
		draw: [...k.draw],
		hand: [...k.hand],
		discard: [...k.discard],
		exhaust: [...k.exhaust],
		powers: [...k.powers],
		attackedThisTurn: [...k.attackedThisTurn],
		lensUsed: [...k.lensUsed],
		focusUsed: [...k.focusUsed],
		reloadBonus: { ...k.reloadBonus },
	};
}

/** Scratch copy that card resolution may mutate (combat, party, rng, counters). */
export function scratch(s: RunState): RunState {
	return {
		...s,
		party: s.party.map((h) => ({ ...h })),
		rng: { ...s.rng },
		stats: { ...s.stats },
		combat: s.combat ? cloneCombat(s.combat) : null,
	};
}

const stacks = (fx: {
	marked: number;
	weakened: number;
	burn: number;
	bleed: number;
	stunned: boolean;
}): number => fx.marked + fx.weakened + fx.burn + fx.bleed + (fx.stunned ? 1 : 0);

/** score = 100 x kills + damage + 0.8 min(block, incoming) + 0.8 min(heal, missing) + 2 stress relieved - 3 dread + 4 status stacks */
export function scoreCardPlay(
	s: RunState,
	cardUid: number,
	target: Target,
	incoming: Record<string, number>,
): number {
	const k = s.combat as CombatState;
	const inst = k.hand.find((x) => x.uid === cardUid);
	if (!inst) return Number.NEGATIVE_INFINITY;
	const sim = scratch(s);
	const ev: GameEvent[] = [];
	if (!playCard({ s: sim, ev, dry: true }, cardUid, target)) return Number.NEGATIVE_INFINITY;
	const after = sim.combat as CombatState;
	const kills = k.enemies.length - after.enemies.length;
	let damage = 0;
	let status = 0;
	for (const e of k.enemies) {
		const a = after.enemies.find((x) => x.uid === e.uid);
		damage += e.hp - (a ? a.hp : 0);
		if (a) status += Math.max(0, stacks(a.fx) - stacks(e.fx)) + (a.keg > e.keg ? 1 : 0);
	}
	let block = 0;
	let heal = 0;
	let relief = 0;
	const collapsed = new Set(
		ev.filter((x) => x.type === 'collapse').map((x) => (x as { target: string }).target),
	);
	for (const id of k.lineup) {
		const fxB = k.heroFx[id] as HeroFx;
		const fxA = after.heroFx[id] as HeroFx;
		block += Math.min(Math.max(0, fxA.block - fxB.block), incoming[id] ?? 0);
		status += Math.max(0, fxA.ward - fxB.ward);
		const hb = s.party.find((h) => h.id === id);
		const ha = sim.party.find((h) => h.id === id);
		if (hb && ha) {
			heal += Math.max(0, ha.hp - hb.hp);
			if (!collapsed.has(id)) relief += Math.max(0, hb.stress - ha.stress);
		}
	}
	const p = paramsOf(inst);
	const power = cardDef(inst.cardId).type === 'power' ? POWER_VALUE : 0;
	const drawn = Math.max(0, after.hand.length - (k.hand.length - 1));
	const energy = ENERGY_VALUE * (p.energyNext ?? 0);
	const owner = inst.owner;
	const attackInHand = k.hand.some(
		(c) => c.uid !== cardUid && c.owner === owner && cardDef(c.cardId).type === 'attack',
	);
	const bonusGain = (after.reloadBonus[owner] ?? 0) - (k.reloadBonus[owner] ?? 0);
	const reload = attackInHand ? BONUS_WEIGHT * bonusGain : 0;
	let returned = 0;
	for (const id of after.lineup) {
		if (k.lineup.includes(id)) continue;
		const hb = s.party.find((h) => h.id === id);
		const ha = sim.party.find((h) => h.id === id);
		returned += RETURN_VALUE + BONUS_WEIGHT * Math.max(0, (ha?.hp ?? 0) - (hb?.hp ?? 0));
	}
	const ownerStress = s.party.find((h) => h.id === owner)?.stress ?? 0;
	const dread = p.dread ?? 0;
	const collapse = dread > 0 && ownerStress + dread >= RULES.stressMax ? COLLAPSE_PENALTY : 0;
	return (
		100 * kills +
		damage +
		0.8 * block +
		0.8 * heal +
		2 * relief -
		3 * dread +
		4 * status +
		power +
		energy +
		CARD_VALUE * drawn +
		reload +
		returned -
		collapse
	);
}

export function chooseAutoCommand(s: RunState): Command | null {
	const k = s.combat;
	if (s.phase !== 'combat' || !k || k.phase !== 'player') return null;
	const incoming = incomingDamage(s);
	let best: { cardUid: number; target: Target; score: number } | null = null;
	for (const inst of k.hand) {
		if (playableReason(s, inst)) continue;
		for (const target of validTargets(s, inst)) {
			const score = scoreCardPlay(s, inst.uid, target, incoming);
			if (score > 0 && (!best || score > best.score))
				best = { cardUid: inst.uid, target, score };
		}
	}
	if (best) return { type: 'playCard', cardUid: best.cardUid, target: best.target };
	return { type: 'endTurn' };
}
