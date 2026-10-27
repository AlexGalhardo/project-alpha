// Read-only selectors for the view layer. Pure functions of RunState.
import { CAMP, HERO_CLASSES, RULES } from '../data/index.ts';
import { costOf, hasVanguard, playableReason, validTargets } from './cards.ts';
import { intentView, projectEnemyPhase, turnQueue } from './combat.ts';
import { availableNodes } from './map.ts';
import { enemyRank, maxHP } from './ops.ts';
import { removalPrice } from './rewards.ts';
import { ritePrice } from './rites.ts';
import { embers } from './run.ts';
import type {
	CampView,
	CombatView,
	Enemy,
	EnemyView,
	HeroClass,
	HeroFx,
	HeroView,
	IntentView,
	MapView,
	RewardView,
	RunState,
	ScreenKey,
	ShopView,
	Statuses,
	StatusView,
	SummaryView,
} from './types.ts';

export function currentScreen(s: RunState): ScreenKey {
	switch (s.phase) {
		case 'victory':
		case 'defeat':
			return 'summary';
		default:
			return s.phase;
	}
}

function statusView(fx: Statuses): StatusView {
	return {
		block: fx.block,
		might: fx.might,
		marked: fx.marked,
		weakened: fx.weakened,
		bleed: fx.bleed,
		burn: fx.burn,
		ward: fx.ward,
		stunned: fx.stunned,
	};
}

function heroView(s: RunState, id: HeroClass, rank: number): HeroView {
	const h = s.party.find((x) => x.id === id);
	if (!h) throw new Error('hero not found');
	const fx = s.combat?.heroFx[id] as HeroFx | undefined;
	return {
		id,
		rank,
		vanguard: hasVanguard(id, rank),
		hp: h.hp,
		maxHP: maxHP(h),
		stress: h.stress,
		injured: h.injured,
		fallen: rank === 0,
		status: statusView(
			fx ?? {
				block: 0,
				might: 0,
				marked: 0,
				weakened: 0,
				bleed: 0,
				burn: 0,
				ward: 0,
				stunned: false,
				stunImmune: false,
			},
		),
		taunt: fx?.taunt ?? false,
		weapon: h.weapon,
		relic: h.relic,
	};
}

/** Party with HP, stress and equipment, usable inside and outside combat. */
export function selectParty(s: RunState): HeroView[] {
	return s.party.map((h, i) => {
		const rank = s.combat ? s.combat.lineup.indexOf(h.id) + 1 : i + 1;
		return heroView(s, h.id, rank);
	});
}

type Damage = IntentView['damage'];

/**
 * Damage each enemy will really deal this enemy phase, from a projection of it (GDD P3). Consecutive
 * equal hits on one hero merge into "perHit x hits".
 */
function projectedDamage(s: RunState): Map<number, Damage> {
	const out = new Map<number, Damage>();
	for (const ev of projectEnemyPhase(s)) {
		if (ev.type !== 'hit' || ev.source?.side !== 'enemy' || ev.target.side !== 'hero') continue;
		const list = out.get(ev.source.uid) ?? [];
		const last = list[list.length - 1];
		if (last && last.target === ev.target.id && last.perHit === ev.amount) last.hits += 1;
		else list.push({ target: ev.target.id, perHit: ev.amount, hits: 1 });
		out.set(ev.source.uid, list);
	}
	return out;
}

function enemyView(s: RunState, e: Enemy, damage: Map<number, Damage>): EnemyView {
	const k = s.combat;
	if (!k) throw new Error('no combat');
	const intent = e.fx.stunned ? null : intentView(s, e);
	return {
		uid: e.uid,
		key: e.key,
		rank: enemyRank(k, e),
		size: e.size,
		hp: e.hp,
		maxHP: e.maxHP,
		speed: e.speed,
		status: statusView(e.fx),
		intent: intent && { ...intent, damage: damage.get(e.uid) ?? [] },
		trait: e.trait,
		keg: e.keg,
		phase: e.phase,
		stunned: e.fx.stunned,
	};
}

export function combatView(s: RunState): CombatView | null {
	const k = s.combat;
	if (!k) return null;
	const damage = projectedDamage(s);
	return {
		turn: k.turn,
		enraged: k.turn >= RULES.enrageTurn,
		enrageTurn: RULES.enrageTurn,
		phase: k.phase,
		kind: k.kind,
		energy: k.energy,
		collapsePending: k.collapsePending,
		heroes: k.lineup.map((id, i) => heroView(s, id, i + 1)),
		fallen: k.fallen.map((id) => heroView(s, id, 0)),
		enemies: k.enemies.map((e) => enemyView(s, e, damage)),
		hand: k.hand.map((inst) => {
			const reason = playableReason(s, inst);
			const targets = validTargets(s, inst);
			return {
				uid: inst.uid,
				cardId: inst.cardId,
				owner: inst.owner,
				upgraded: inst.upgraded,
				cost: costOf(inst),
				playable: reason === null,
				reason,
				validTargets: targets,
				autoTarget: targets.length === 1 && targets[0] === null,
			};
		}),
		piles: {
			draw: k.draw.length,
			discard: k.discard.length,
			exhaust: k.exhaust.length,
			powers: k.powers.length,
		},
		queue: turnQueue(k),
		round: s.currentNode?.row ?? 0,
	};
}

export function mapView(s: RunState): MapView | null {
	if (s.map.length === 0) return null;
	return {
		rows: s.map,
		cursor: s.cursor,
		available: availableNodes(s).map((n) => ({ row: n.row, index: n.index })),
		currentRow: s.cursor ? s.cursor.row : 0,
	};
}

export function rewardView(s: RunState): RewardView | null {
	const r = s.reward;
	if (s.phase !== 'reward' || !r) return null;
	return {
		gold: r.gold,
		cards: r.cards.map((cardId, index) => ({ cardId, index })),
		equipmentGained: r.equipmentGained,
		boss: r.boss,
	};
}

export function campView(s: RunState): CampView | null {
	const c = s.camp;
	if (s.phase !== 'camp' || !c) return null;
	return {
		gold: s.gold,
		card: c.card,
		equipment: c.equipment,
		service: c.service,
		swapCandidates: HERO_CLASSES.filter((id) => !s.party.some((h) => h.id === id)),
		swapPrice: ritePrice(s, CAMP.swapPrice),
		swapped: c.swapped,
		stash: s.stash,
	};
}

export function shopView(s: RunState): ShopView | null {
	const sh = s.shop;
	if (s.phase !== 'shop' || !sh) return null;
	return {
		gold: s.gold,
		cards: sh.cards,
		equipment: sh.equipment,
		removalPrice: removalPrice(s),
		canRemove: !sh.removedHere && s.gold >= removalPrice(s),
		stash: s.stash,
	};
}

export function summaryView(s: RunState): SummaryView | null {
	if (s.phase !== 'victory' && s.phase !== 'defeat') return null;
	return {
		victory: s.phase === 'victory',
		embers: embers(s),
		roundsCleared: s.roundsCleared,
		elitesWon: s.elitesWon,
		bossesWon: s.bossesWon,
		collapses: s.stats.collapses,
	};
}
