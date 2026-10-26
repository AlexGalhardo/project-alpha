// Card data access and card effect resolution (GDD 9).
import { CARDS, EQUIPMENT_NUMBERS } from '../data/index.ts';
import {
	addDebuff,
	addStress,
	addStun,
	addWard,
	type Ctx,
	clearDebuffs,
	cs,
	drawCards,
	enemyOf,
	enemyReaches,
	enemyRef,
	fxOf,
	gainBlock,
	healHero,
	heroOf,
	heroRef,
	hitEnemy,
	maxHP,
	moveEnemy,
	randomEnemy,
	swapHeroes,
} from './ops.ts';
import type { CardDef, CardInst, CardParams, Enemy, HeroClass, RunState, Target } from './types.ts';

export function cardDef(cardId: string): CardDef {
	const d = CARDS[cardId];
	if (!d) throw new Error(`unknown card ${cardId}`);
	return d;
}

export function paramsOf(inst: CardInst): CardParams {
	const d = cardDef(inst.cardId);
	return inst.upgraded ? { ...d.params, ...d.upgrade } : d.params;
}

export function costOf(inst: CardInst): number {
	const d = cardDef(inst.cardId);
	return inst.upgraded && d.upgradedCost !== undefined ? d.upgradedCost : d.cost;
}

/** Numbers for the i18n placeholders of `card.*.text` (damage, block, allyBlock, heal, stacks, draw, stress, bonus, splash). */
export function cardValues(cardId: string, upgraded: boolean): Record<string, number> {
	const d = cardDef(cardId);
	const p = upgraded ? { ...d.params, ...d.upgrade } : d.params;
	const out: Record<string, number> = {};
	const put = (k: string, v: number | undefined): void => {
		if (v !== undefined) out[k] = v;
	};
	put('damage', p.damage);
	put('block', p.block);
	put('allyBlock', p.blockAllies ?? p.blockAdjacent);
	put('heal', p.heal ?? p.healLowest);
	put('stacks', p.marked ?? p.burn ?? p.weakened);
	put('draw', p.draw);
	put('stress', p.stressRelief);
	put('bonus', p.bonus);
	put('splash', p.splash);
	return out;
}

// ---- playability ----
function weaponOf(s: RunState, id: HeroClass): string | null {
	return heroOf(s, id).weapon;
}

export function validTargets(s: RunState, inst: CardInst): Target[] {
	const k = s.combat;
	if (!k) return [];
	const d = cardDef(inst.cardId);
	const t = d.target;
	switch (t.kind) {
		case 'enemy':
			return k.enemies
				.filter((e) => enemyReaches(k, e, t.ranks))
				.map((e) => ({ type: 'enemy', uid: e.uid }));
		case 'enemyPair':
		case 'allEnemies':
		case 'randomEnemy':
			return k.enemies.length > 0 ? [null] : [];
		case 'self':
		case 'selfAndAllies':
		case 'allHeroes':
			return [null];
		case 'ally':
			return k.lineup.map((id) => ({ type: 'hero', id }));
		case 'fallen':
			return k.fallen.map((id) => ({ type: 'hero', id }));
		default:
			return [];
	}
}

export function playableReason(s: RunState, inst: CardInst): string | null {
	const k = s.combat;
	if (k?.phase !== 'player') return 'not-in-combat';
	const rank = k.lineup.indexOf(inst.owner) + 1;
	if (rank === 0) return 'owner-fallen';
	if (!cardDef(inst.cardId).from.includes(rank)) return 'wrong-rank';
	if (costOf(inst) > k.energy) return 'no-energy';
	if (validTargets(s, inst).length === 0) return 'no-target';
	return null;
}

export function targetMatches(s: RunState, inst: CardInst, target: Target): boolean {
	const list = validTargets(s, inst);
	return list.some((t) => {
		if (t === null || target === null) return t === target;
		if (t.type === 'enemy' && target.type === 'enemy') return t.uid === target.uid;
		if (t.type === 'hero' && target.type === 'hero') return t.id === target.id;
		return false;
	});
}

// ---- resolution ----
export function resolveCard(c: Ctx, inst: CardInst, target: Target): void {
	const k = cs(c);
	const d = cardDef(inst.cardId);
	const p = paramsOf(inst);
	const owner = inst.owner;
	const weapon = weaponOf(c.s, owner);
	const isAttack = d.type === 'attack';
	const heroTarget: HeroClass | null = target && target.type === 'hero' ? target.id : null;
	const enemyTarget: Enemy | undefined =
		target && target.type === 'enemy' ? enemyOf(k, target.uid) : undefined;
	const struck: Enemy[] = [];

	const blk = (v: number): number =>
		v > 0 && weapon === 'eq_heavy_pavise' ? v + EQUIPMENT_NUMBERS.paviseBlockBonus : v;
	const focusPower = k.powers.some((x) => x.owner === owner && x.cardId === 'mrk_hunters_focus');
	const focusBonus = focusPower
		? ((k.powers.find((x) => x.owner === owner && x.cardId === 'mrk_hunters_focus')?.upgraded
				? cardDef('mrk_hunters_focus').upgrade.bonus
				: cardDef('mrk_hunters_focus').params.bonus) ?? 0)
		: 0;
	const reload = isAttack && owner === 'bombardier' ? (k.reloadBonus[owner] ?? 0) : 0;
	const lowest = (): HeroClass | undefined =>
		[...k.lineup].sort((a, b) => heroOf(c.s, a).hp - heroOf(c.s, b).hp)[0];

	const strike = (e: Enemy, base: number, times = 1): void => {
		for (let i = 0; i < times; i++) {
			if (!k.enemies.includes(e)) break;
			let extra =
				(isAttack && weapon === 'eq_notched_blade'
					? EQUIPMENT_NUMBERS.notchedBladeBonus
					: 0) + reload;
			if (isAttack && focusBonus > 0 && !k.focusUsed.includes(owner) && e.fx.marked > 0) {
				extra += focusBonus;
				k.focusUsed.push(owner);
			}
			hitEnemy(c, e, base, { source: owner, extra });
			if (!struck.includes(e)) struck.push(e);
		}
	};

	if (p.preBlock) gainBlock(c, heroRef(owner), blk(p.preBlock));

	// ---- damage ----
	const hits = p.hits ?? 1;
	let damage = p.damage;
	if (inst.cardId === 'shb_shield_slam')
		damage = Math.min(fxOf(k, heroRef(owner)).block, p.cap ?? Number.POSITIVE_INFINITY);
	if (inst.cardId === 'mrk_killshot' && enemyTarget && enemyTarget.fx.marked > 0)
		damage = (damage ?? 0) + (p.bonus ?? 0);
	const idx = enemyTarget ? k.enemies.indexOf(enemyTarget) : -1;
	const neighbours = (): Enemy[] =>
		[k.enemies[idx - 1], k.enemies[idx + 1]].filter(
			(x): x is Enemy => !!x && x !== enemyTarget,
		);
	const preNeighbours = neighbours();
	const behind = idx >= 0 ? k.enemies[idx + 1] : undefined;

	switch (d.target.kind) {
		case 'enemy':
			if (enemyTarget) {
				if (damage !== undefined) strike(enemyTarget, damage, hits);
				if (inst.cardId === 'mrk_piercing_bolt' && behind && damage !== undefined)
					strike(behind, damage);
				if (inst.cardId === 'bmb_incendiary') {
					for (const n of preNeighbours) {
						if (damage !== undefined) strike(n, damage);
					}
				}
				if (p.splash)
					for (const n of preNeighbours) hitEnemy(c, n, p.splash, { source: owner });
			}
			break;
		case 'enemyPair':
			for (const e of k.enemies.filter((x) => enemyReaches(k, x, [1, 2]))) {
				if (damage !== undefined) strike(e, damage, hits);
			}
			break;
		case 'allEnemies':
			for (const e of [...k.enemies]) if (damage !== undefined) strike(e, damage, hits);
			break;
		case 'randomEnemy':
			for (let i = 0; i < hits; i++) {
				const e = randomEnemy(c);
				if (e && damage !== undefined) strike(e, damage);
			}
			break;
		default:
			break;
	}

	// ---- enemy riders ----
	const riderTargets = d.target.kind === 'enemy' ? (enemyTarget ? [enemyTarget] : []) : struck;
	const live = (e: Enemy): boolean => k.enemies.includes(e);
	for (const e of riderTargets) {
		if (!live(e)) continue;
		const ref = enemyRef(e);
		if (p.marked) addDebuff(c, ref, 'marked', p.marked);
		if (p.weakened) addDebuff(c, ref, 'weakened', p.weakened);
		if (p.burn) {
			if (inst.cardId === 'bmb_incendiary') {
				for (const x of [e, ...preNeighbours])
					if (live(x)) addDebuff(c, enemyRef(x), 'burn', p.burn);
			} else addDebuff(c, ref, 'burn', p.burn);
		}
		if (p.stun) addStun(c, e);
		if (p.keg) e.keg = p.keg;
	}
	if (p.push && enemyTarget && live(enemyTarget)) moveEnemy(c, enemyTarget, p.push);

	// ---- weapon riders on attack cards ----
	if (isAttack) {
		const first = !k.attackedThisTurn.includes(owner);
		for (const e of struck) {
			if (!live(e)) continue;
			if (first && weapon === 'eq_ember_focus')
				addDebuff(c, enemyRef(e), 'burn', EQUIPMENT_NUMBERS.emberFocusBurn);
			if (!k.lensUsed.includes(owner) && weapon === 'eq_hunters_lens') {
				addDebuff(c, enemyRef(e), 'marked', EQUIPMENT_NUMBERS.lensMarked);
			}
		}
		if (struck.length > 0 && weapon === 'eq_hunters_lens' && !k.lensUsed.includes(owner))
			k.lensUsed.push(owner);
		if (first) k.attackedThisTurn.push(owner);
		if (reload > 0) k.reloadBonus[owner] = 0;
	}

	// ---- block ----
	if (p.block !== undefined && d.type !== 'power') {
		switch (d.target.kind) {
			case 'self':
				gainBlock(c, heroRef(owner), blk(p.block));
				if (p.blockAdjacent) {
					const i = k.lineup.indexOf(owner);
					const adj = k.lineup[i + 1] ?? k.lineup[i - 1];
					if (adj) gainBlock(c, heroRef(adj), blk(p.blockAdjacent));
				}
				break;
			case 'ally':
				if (heroTarget) gainBlock(c, heroRef(heroTarget), blk(p.block));
				break;
			case 'allHeroes':
				for (const h of [...k.lineup]) gainBlock(c, heroRef(h), blk(p.block));
				break;
			case 'selfAndAllies':
				gainBlock(c, heroRef(owner), blk(p.block));
				for (const h of k.lineup)
					if (h !== owner && p.blockAllies) gainBlock(c, heroRef(h), blk(p.blockAllies));
				break;
			default:
				break;
		}
	}

	// ---- heal, ward, stress, cleanse ----
	if (p.heal) {
		if (d.target.kind === 'ally' && heroTarget) healHero(c, heroTarget, p.heal);
		if (d.target.kind === 'allHeroes') for (const h of [...k.lineup]) healHero(c, h, p.heal);
	}
	if (p.healLowest) {
		const l = lowest();
		if (l) healHero(c, l, p.healLowest);
	}
	if (p.ward && heroTarget) addWard(c, heroRef(heroTarget), p.ward);
	if (inst.cardId === 'cnf_absolve' && heroTarget) clearDebuffs(fxOf(k, heroRef(heroTarget)));
	if (p.stressRelief) {
		if (d.target.kind === 'ally' && heroTarget) addStress(c, heroTarget, -p.stressRelief);
		if (d.target.kind === 'allHeroes')
			for (const h of [...k.lineup]) addStress(c, h, -p.stressRelief);
	}

	// ---- misc ----
	if (p.taunt) (k.heroFx[owner] as { taunt: boolean }).taunt = true;
	if (p.keepBlock && p.block !== undefined)
		(k.heroFx[owner] as { keptBlock: number }).keptBlock += blk(p.block);
	if (p.energyNext) k.energyNext += p.energyNext;
	if (inst.cardId === 'bmb_reload' && p.bonus) k.reloadBonus[owner] = p.bonus;
	if (p.swapBehind) {
		const i = k.lineup.indexOf(owner);
		if (i >= 0 && i + 1 < k.lineup.length) swapHeroes(c, i, i + 1);
	}
	if (inst.cardId === 'cnf_rekindle' && heroTarget && k.fallen.includes(heroTarget)) {
		k.fallen = k.fallen.filter((x) => x !== heroTarget);
		k.lineup.push(heroTarget);
		k.rekindled.push(heroTarget);
		const h = heroOf(c.s, heroTarget);
		h.hp = Math.max(1, Math.floor((maxHP(h) * (p.pct ?? 0)) / 100));
		const fx = k.heroFx[heroTarget];
		if (fx)
			Object.assign(fx, {
				block: 0,
				might: 0,
				marked: 0,
				weakened: 0,
				bleed: 0,
				burn: 0,
				ward: 0,
				taunt: false,
				keptBlock: 0,
			});
		c.ev.push({ type: 'rekindle', target: heroTarget });
	}
	if (p.draw) drawCards(c, p.draw);
	if (p.dread) addStress(c, owner, p.dread);
}
