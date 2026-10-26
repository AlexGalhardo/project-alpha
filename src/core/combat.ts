// Combat flow: setup, player turn, enemy phase, intents, combat end (GDD 5 and 10).
import {
	ELITE,
	ENCOUNTERS,
	ENEMIES,
	EQUIPMENT_DROP,
	EQUIPMENT_NUMBERS,
	GOLD,
	RULES,
} from '../data/index.ts';
import { cardDef, costOf, paramsOf, playableReason, resolveCard, targetMatches } from './cards.ts';
import {
	addDebuff,
	addStress,
	addWard,
	type Ctx,
	cs,
	dmgScale,
	dotEnemy,
	dotHero,
	drawCards,
	emptyHeroFx,
	emptyStatuses,
	enemyRef,
	gainBlock,
	heroOf,
	heroRef,
	hitDamage,
	hitHero,
	killEnemy,
	moveEnemy,
	swapHeroes,
} from './ops.ts';
import { addToStash, makeCardOffer, rollEquipment } from './rewards.ts';
import { randInt, shuffle } from './rng.ts';
import type {
	CombatState,
	Enemy,
	EnemyEffect,
	HeroClass,
	HeroFx,
	IntentDef,
	IntentView,
	RunState,
	Target,
	TargetRule,
} from './types.ts';

export function startCombat(c: Ctx, encounterId: string, kind: CombatState['kind']): void {
	const s = c.s;
	const enc = ENCOUNTERS[encounterId];
	if (!enc) throw new Error(`unknown encounter ${encounterId}`);
	const enemies: Enemy[] = [];
	let uid = 1;
	for (const slot of enc.enemies) {
		const def = ENEMIES[slot.key];
		if (!def) throw new Error(`unknown enemy ${slot.key}`);
		const elite = slot.elite ? ELITE.hpMul : 1;
		const maxHP = Math.max(1, Math.round(def.hp * elite * s.options.enemyHpMul));
		const list = def.intents;
		enemies.push({
			uid: uid++,
			key: def.key,
			hp: maxHP,
			maxHP,
			speed: def.speed,
			size: def.size,
			fx: emptyStatuses(),
			intentIdx: def.fixedStart ? 0 : randInt(s, 'combat', 0, list.length - 1),
			phase: 1,
			dmgMul: (slot.elite ? ELITE.damageMul : 1) * s.options.enemyDmgMul,
			trait: slot.elite ?? null,
			keg: 0,
		});
	}
	const heroFx: Record<string, HeroFx> = {};
	for (const h of s.party) heroFx[h.id] = emptyHeroFx();
	const draw = s.deck.map((x) => ({ ...x }));
	const k: CombatState = {
		encounterId,
		kind,
		turn: 0,
		phase: 'player',
		energy: 0,
		collapsePending: 0,
		energyNext: 0,
		lineup: s.party.filter((h) => h.hp > 0).map((h) => h.id),
		fallen: [],
		rekindled: [],
		anyFell: false,
		heroFx,
		enemies,
		nextEnemyUid: uid,
		draw,
		hand: [],
		discard: [],
		exhaust: [],
		powers: [],
		attackedThisTurn: [],
		lensUsed: [],
		focusUsed: [],
		reloadBonus: {},
		clapperUsed: false,
		startTurns: 0,
	};
	s.combat = k;
	s.phase = 'combat';
	shuffle(s, 'combat', k.draw);
	c.ev.push({ type: 'combatStarted', encounterId });
	beginPlayerTurn(c);
}

// ---- intents ----
export function intentOf(e: Enemy): IntentDef {
	const def = ENEMIES[e.key];
	if (!def) throw new Error(`unknown enemy ${e.key}`);
	const list = e.phase === 2 && def.phase2Intents ? def.phase2Intents : def.intents;
	return list[e.intentIdx % list.length] as IntentDef;
}

const SINGLE: TargetRule[] = ['front', 'back', 'highestStress', 'lowestHP', 'marked'];

export function resolveTargets(s: RunState, rule: TargetRule): HeroClass[] {
	const k = s.combat;
	if (!k || k.lineup.length === 0) return [];
	const line = k.lineup;
	if (rule === 'all') return [...line];
	if (rule === 'frontTwo') return line.slice(0, 2);
	const taunter = line.find((id) => (k.heroFx[id] as HeroFx).taunt);
	if (taunter && SINGLE.includes(rule)) return [taunter];
	const front = line[0] as HeroClass;
	switch (rule) {
		case 'back':
			return [line.length >= 3 ? (line[2] as HeroClass) : front];
		case 'highestStress': {
			let best = front;
			for (const id of line) if (heroOf(s, id).stress > heroOf(s, best).stress) best = id;
			return [best];
		}
		case 'lowestHP': {
			let best = front;
			for (const id of line) if (heroOf(s, id).hp < heroOf(s, best).hp) best = id;
			return [best];
		}
		case 'marked':
			return [line.find((id) => (k.heroFx[id] as HeroFx).marked > 0) ?? front];
		default:
			return [front];
	}
}

export function intentView(s: RunState, e: Enemy): IntentView {
	const k = s.combat as CombatState;
	const it = intentOf(e);
	const targets = resolveTargets(s, it.target);
	const damage: IntentView['damage'] = [];
	let stress = 0;
	let block = 0;
	const debuffs: string[] = [];
	let telegraph = false;
	for (const ef of it.effects) {
		if (ef.kind === 'damage') {
			for (const t of targets) {
				const per = hitDamage(dmgScale(e, ef.amount), e.fx, k.heroFx[t] as HeroFx);
				damage.push({ target: t, perHit: per, hits: ef.hits ?? 1 });
			}
		} else if (ef.kind === 'stress') stress += ef.amount;
		else if (ef.kind === 'selfBlock') block += ef.amount;
		else if (ef.kind === 'status') debuffs.push(ef.status);
		else if (ef.kind === 'telegraph') telegraph = true;
	}
	return { intentId: it.id, targets, damage, stress, block, debuffs, telegraph };
}

/** Expected damage each hero takes from the intents visible now (ignores Block). */
export function incomingDamage(s: RunState): Record<string, number> {
	const k = s.combat;
	const out: Record<string, number> = {};
	if (!k) return out;
	for (const id of k.lineup) out[id] = 0;
	for (const e of k.enemies) {
		if (e.fx.stunned) continue;
		for (const d of intentView(s, e).damage)
			out[d.target] = (out[d.target] ?? 0) + d.perHit * d.hits;
	}
	return out;
}

export function turnQueue(k: CombatState): number[] {
	const order = new Map(k.enemies.map((e, i) => [e.uid, i]));
	return [...k.enemies]
		.sort((a, b) => b.speed - a.speed || (order.get(a.uid) ?? 0) - (order.get(b.uid) ?? 0))
		.map((e) => e.uid);
}

// ---- enemy actions ----
function performEffect(
	c: Ctx,
	e: Enemy,
	it: IntentDef,
	ef: EnemyEffect,
	victims: HeroClass[],
): void {
	const k = cs(c);
	const resolve = (): HeroClass[] => resolveTargets(c.s, it.target);
	switch (ef.kind) {
		case 'damage': {
			const base = dmgScale(e, ef.amount);
			const hits = ef.hits ?? 1;
			victims.length = 0;
			for (let i = 0; i < hits; i++) {
				for (const t of resolve()) {
					hitHero(c, t, base, e);
					if (!victims.includes(t)) victims.push(t);
				}
				if (k.phase === 'lost') return;
			}
			break;
		}
		case 'stress':
			for (const t of victims.length
				? victims.filter((v) => k.lineup.includes(v))
				: resolve()) {
				addStress(c, t, ef.amount);
			}
			break;
		case 'status':
			for (const t of victims.length
				? victims.filter((v) => k.lineup.includes(v))
				: resolve()) {
				addDebuff(c, heroRef(t), ef.status, ef.amount);
			}
			break;
		case 'selfBlock':
			gainBlock(c, enemyRef(e), ef.amount);
			break;
		case 'selfMight':
			e.fx.might += ef.amount;
			c.ev.push({ type: 'status', target: enemyRef(e), status: 'might', amount: ef.amount });
			break;
		case 'mightAllEnemies':
			for (const o of k.enemies) {
				o.fx.might += ef.amount;
				c.ev.push({
					type: 'status',
					target: enemyRef(o),
					status: 'might',
					amount: ef.amount,
				});
			}
			break;
		case 'selfHeal':
			e.hp = Math.min(e.maxHP, e.hp + ef.amount);
			break;
		case 'moveToBack':
			moveEnemy(c, e, k.enemies.length);
			break;
		case 'swapFrontHeroes':
			swapHeroes(c, 0, 1);
			break;
		case 'wardAllEnemies':
			for (const o of k.enemies) addWard(c, enemyRef(o), ef.amount);
			break;
		default:
			break;
	}
}

function enemyPhase(c: Ctx): void {
	const k = cs(c);
	for (const uid of turnQueue(k)) {
		const e = k.enemies.find((x) => x.uid === uid);
		if (!e || k.phase !== 'player') continue;
		e.fx.block = 0;
		if (e.fx.bleed > 0) {
			const b = e.fx.bleed;
			e.fx.bleed -= 1;
			dotEnemy(c, e, b, 'bleed');
			if (!k.enemies.includes(e)) continue;
		}
		if (e.fx.stunned) {
			e.fx.stunned = false;
			e.fx.stunImmune = true;
			c.ev.push({ type: 'enemyStunned', uid: e.uid });
		} else {
			const it = intentOf(e);
			c.ev.push({ type: 'enemyAction', uid: e.uid, intentId: it.id });
			const victims: HeroClass[] = [];
			for (const ef of it.effects) {
				performEffect(c, e, it, ef, victims);
				if (k.phase !== 'player') return;
			}
			e.fx.stunImmune = false;
		}
		e.intentIdx += 1;
		if (e.fx.burn > 0) {
			const b = e.fx.burn;
			e.fx.burn = Math.floor(b / 2);
			dotEnemy(c, e, b, 'burn');
			if (!k.enemies.includes(e)) continue;
		}
		e.fx.marked = Math.max(0, e.fx.marked - 1);
		e.fx.weakened = Math.max(0, e.fx.weakened - 1);
	}
}

// ---- player turn ----
function lowestHero(c: Ctx): HeroClass | undefined {
	const k = cs(c);
	return [...k.lineup].sort((a, b) => heroOf(c.s, a).hp - heroOf(c.s, b).hp)[0];
}

function blockBonus(c: Ctx, owner: HeroClass, v: number): number {
	return v > 0 && heroOf(c.s, owner).weapon === 'eq_heavy_pavise'
		? v + EQUIPMENT_NUMBERS.paviseBlockBonus
		: v;
}

function beginPlayerTurn(c: Ctx): void {
	const k = cs(c);
	k.turn += 1;
	for (const id of k.lineup) {
		const fx = k.heroFx[id] as HeroFx;
		fx.taunt = false;
		if (fx.keepBlock) fx.keepBlock = false;
		else fx.block = 0;
	}
	for (const id of [...k.lineup]) {
		const fx = k.heroFx[id] as HeroFx;
		if (fx.bleed > 0) {
			const b = fx.bleed;
			fx.bleed -= 1;
			dotHero(c, id, b, 'bleed');
		}
	}
	if (k.phase !== 'player') return;
	let energy = Math.max(0, RULES.energy - k.collapsePending) + k.energyNext;
	k.collapsePending = 0;
	k.energyNext = 0;
	const clapper = k.lineup.some((id) => heroOf(c.s, id).relic === 'eq_bell_clapper');
	if (
		clapper &&
		k.lineup.some((id) => heroOf(c.s, id).stress >= EQUIPMENT_NUMBERS.clapperStressThreshold)
	) {
		energy += EQUIPMENT_NUMBERS.clapperEnergy;
	}
	k.energy = energy;
	k.attackedThisTurn = [];
	k.focusUsed = [];
	k.reloadBonus = {};
	drawCards(c, RULES.draw);
	for (const p of k.powers) {
		if (!k.lineup.includes(p.owner)) continue;
		const v = paramsOf(p).block ?? 0;
		if (p.cardId === 'shb_vow_of_iron')
			gainBlock(c, heroRef(p.owner), blockBonus(c, p.owner, v));
		if (p.cardId === 'cnf_steadfast_hymn') {
			const l = lowestHero(c);
			if (l) gainBlock(c, heroRef(l), blockBonus(c, p.owner, v));
		}
	}
	if (k.turn === 1) {
		for (const id of k.lineup) {
			if (heroOf(c.s, id).relic === 'eq_iron_rosary')
				gainBlock(c, heroRef(id), EQUIPMENT_NUMBERS.rosaryBlock);
		}
	}
	c.ev.push({ type: 'turnStarted', turn: k.turn, energy: k.energy });
}

export function playCard(c: Ctx, cardUid: number, target: Target): boolean {
	const k = cs(c);
	const bad = (reason: string): boolean => {
		c.ev.push({ type: 'invalid', reason });
		return false;
	};
	if (k.phase !== 'player') return bad('combat-over');
	const idx = k.hand.findIndex((x) => x.uid === cardUid);
	if (idx < 0) return bad('not-in-hand');
	const inst = k.hand[idx] as (typeof k.hand)[number];
	const why = playableReason(c.s, inst);
	if (why) return bad(why);
	if (!targetMatches(c.s, inst, target)) return bad('bad-target');
	k.hand.splice(idx, 1);
	k.energy -= costOf(inst);
	c.ev.push({ type: 'cardPlayed', cardUid, cardId: inst.cardId, owner: inst.owner, target });
	resolveCard(c, inst, target);
	const d = cardDef(inst.cardId);
	if (d.type === 'power') k.powers.push(inst);
	else if (d.exhaust) {
		k.exhaust.push(inst);
		c.ev.push({ type: 'cardExhausted', cardUid });
	} else k.discard.push(inst);
	settle(c);
	return true;
}

export function endTurn(c: Ctx): boolean {
	const k = cs(c);
	if (k.phase !== 'player') {
		c.ev.push({ type: 'invalid', reason: 'combat-over' });
		return false;
	}
	k.discard.push(...k.hand);
	k.hand = [];
	for (const id of [...k.lineup]) {
		const fx = k.heroFx[id] as HeroFx;
		if (fx.burn > 0) {
			const b = fx.burn;
			fx.burn = Math.floor(b / 2);
			dotHero(c, id, b, 'burn');
		}
		fx.marked = Math.max(0, fx.marked - 1);
		fx.weakened = Math.max(0, fx.weakened - 1);
	}
	if (k.phase === 'player') enemyPhase(c);
	if (k.phase === 'player' && k.turn >= RULES.turnCap) k.phase = 'lost';
	if (k.phase === 'player') beginPlayerTurn(c);
	settle(c);
	return true;
}

// ---- combat end ----
function settle(c: Ctx): void {
	if (c.dry) return;
	const k = cs(c);
	if (k.phase === 'won') finishCombat(c);
	else if (k.phase === 'lost') {
		c.ev.push({ type: 'combatLost' });
		c.s.stats.combats.push({ kind: k.kind, turns: k.turn, won: false, id: k.encounterId });
		c.s.combat = null;
		c.s.phase = 'defeat';
	}
}

function finishCombat(c: Ctx): void {
	const s = c.s;
	const k = cs(c);
	c.ev.push({ type: 'combatWon' });
	const gold =
		k.kind === 'boss'
			? GOLD.boss
			: k.kind === 'elite'
				? GOLD.eliteBase + randInt(s, 'meta', 0, GOLD.eliteRange)
				: GOLD.combatBase + randInt(s, 'meta', 0, GOLD.combatRange);
	s.gold += gold;
	s.stats.goldEarned += gold;
	c.ev.push({ type: 'gold', amount: gold });
	for (const id of k.fallen) {
		const h = heroOf(s, id);
		h.hp = RULES.fallenReturnHP;
		h.injured = true;
	}
	for (const h of s.party) {
		if (!k.anyFell) h.stress = Math.max(0, h.stress - RULES.winStressRelief);
		if (h.relic === 'eq_votive_candle')
			h.stress = Math.max(0, h.stress - EQUIPMENT_NUMBERS.votiveStressRelief);
	}
	s.roundsCleared += 1;
	if (k.kind === 'elite') s.elitesWon += 1;
	if (k.kind === 'boss') s.bossesWon += 1;
	let eq: string | null = null;
	if (k.kind === 'elite') eq = rollEquipment(s, EQUIPMENT_DROP.elite);
	if (k.kind === 'boss') eq = 'eq_bell_clapper';
	if (eq) addToStash(s, eq, c.ev);
	const cards = makeCardOffer(s, k.kind);
	c.ev.push({ type: 'rewardOffered', cards });
	s.reward = { gold, cards, equipmentGained: eq, boss: k.kind === 'boss' };
	s.stats.combats.push({ kind: k.kind, turns: k.turn, won: true, id: k.encounterId });
	s.combat = null;
	s.phase = 'reward';
	void killEnemy;
}
