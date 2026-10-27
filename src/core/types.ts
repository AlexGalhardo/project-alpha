// Shared types of the deterministic core. No imports from phaser, scenes, view or DOM.

export type HeroClass = 'shieldbearer' | 'marksman' | 'arcanist' | 'confessor' | 'bombardier';
export type Rarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'legendary';
export type CardType = 'attack' | 'skill' | 'power';
export type EquipSlot = 'weapon' | 'relic';
export type Debuff = 'marked' | 'weakened' | 'bleed' | 'burn';
export type RngStream = 'map' | 'meta' | 'combat';

export interface Statuses {
	block: number;
	might: number;
	marked: number;
	weakened: number;
	bleed: number;
	burn: number;
	ward: number;
	stunned: boolean;
	stunImmune: boolean;
}

/** Numeric card parameters; the card handler in `cards.ts` knows what each key means. */
export interface CardParams {
	damage?: number;
	hits?: number;
	block?: number;
	blockAllies?: number;
	blockAdjacent?: number;
	heal?: number;
	healLowest?: number;
	marked?: number;
	weakened?: number;
	burn?: number;
	draw?: number;
	dread?: number;
	stressRelief?: number;
	splash?: number;
	push?: number;
	bonus?: number;
	cap?: number;
	preBlock?: number;
	ward?: number;
	energyNext?: number;
	keg?: number;
	pct?: number;
	stun?: number;
	taunt?: number;
	keepBlock?: number;
	swapBehind?: number;
	/** Stress the owner relieves when the card is played. */
	selfRelief?: number;
}

export type CardTarget =
	| { kind: 'enemy'; ranks: number[] | 'any' }
	| { kind: 'enemyPair' }
	| { kind: 'allEnemies' }
	| { kind: 'randomEnemy' }
	| { kind: 'self' }
	| { kind: 'ally' }
	| { kind: 'allHeroes' }
	| { kind: 'selfAndAllies' }
	| { kind: 'fallen' };

export interface CardDef {
	id: string;
	name: string;
	cost: number;
	upgradedCost?: number;
	type: CardType;
	rarity: Rarity;
	owner: HeroClass;
	from: number[];
	target: CardTarget;
	params: CardParams;
	upgrade: CardParams;
	exhaust?: boolean;
}

export interface CardInst {
	uid: number;
	cardId: string;
	upgraded: boolean;
	owner: HeroClass;
}

export interface HeroDef {
	key: HeroClass;
	maxHP: number;
	starters: string[];
	pool: string[];
	/** Preferred rank order used by default party layouts (lower = more front). */
	frontOrder: number;
}

export interface HeroState {
	id: HeroClass;
	/** Max HP before relic and injury (class value times the dev hero HP multiplier). */
	baseMax: number;
	hp: number;
	stress: number;
	injured: boolean;
	/** Max HP multiplier of the current injury (Rite 9 makes it harsher); absent means the base rule. */
	injuryMul?: number;
	weapon: string | null;
	relic: string | null;
}

// ---- enemies ----
export type TargetRule =
	| 'front'
	| 'back'
	| 'highestStress'
	| 'lowestHP'
	| 'marked'
	| 'all'
	| 'frontTwo';

export type EnemyEffect =
	| { kind: 'damage'; amount: number; hits?: number }
	| { kind: 'stress'; amount: number }
	| { kind: 'status'; status: 'bleed' | 'marked' | 'weakened'; amount: number }
	| { kind: 'selfBlock'; amount: number }
	| { kind: 'selfMight'; amount: number }
	| { kind: 'mightAllEnemies'; amount: number }
	| { kind: 'selfHeal'; amount: number }
	| { kind: 'moveToBack' }
	| { kind: 'swapFrontHeroes' }
	| { kind: 'wardAllEnemies'; amount: number }
	| { kind: 'telegraph' };

export interface IntentDef {
	id: string;
	target: TargetRule;
	effects: EnemyEffect[];
}

export interface EnemyDef {
	key: string;
	hp: number;
	speed: number;
	size: 1 | 2;
	intents: IntentDef[];
	/** Phase 2 intents (boss). */
	phase2Intents?: IntentDef[];
	phase2Hp?: number;
	/** Might gained on entering phase 2. */
	phase2Might?: number;
	/** Third phase (final boss only, docs/gdd.md §23.4). */
	phase3Intents?: IntentDef[];
	phase3Hp?: number;
	phase3Might?: number;
	fixedStart?: boolean;
}

export type EliteTrait = 'oathwall' | 'calcified';

export interface EncounterDef {
	id: string;
	/** Act the encounter belongs to; absent means Act 1. */
	act?: number;
	pool: 'A' | 'B' | 'elite' | 'boss';
	enemies: { key: string; elite?: EliteTrait }[];
}

export interface EquipmentDef {
	key: string;
	slot: EquipSlot;
	rarity: Rarity;
}

// ---- combat state ----
export interface HeroFx extends Statuses {
	taunt: boolean;
	/** Block that survives the next turn-start reset (Bulwark); only this much is kept. */
	keptBlock: number;
}

export interface Enemy {
	uid: number;
	key: string;
	hp: number;
	maxHP: number;
	speed: number;
	size: 1 | 2;
	fx: Statuses;
	intentIdx: number;
	phase: 1 | 2 | 3;
	dmgMul: number;
	trait: EliteTrait | null;
	keg: number;
	/** Phase-1 intent id appended to the phase-2 cycle (Rite 10). */
	extraIntent?: string;
}

export interface CombatState {
	encounterId: string;
	kind: 'common' | 'elite' | 'boss';
	turn: number;
	phase: 'player' | 'won' | 'lost';
	energy: number;
	collapsePending: number;
	energyNext: number;
	lineup: HeroClass[];
	fallen: HeroClass[];
	rekindled: HeroClass[];
	anyFell: boolean;
	heroFx: Record<string, HeroFx>;
	enemies: Enemy[];
	nextEnemyUid: number;
	draw: CardInst[];
	hand: CardInst[];
	discard: CardInst[];
	exhaust: CardInst[];
	powers: CardInst[];
	attackedThisTurn: HeroClass[];
	lensUsed: HeroClass[];
	focusUsed: HeroClass[];
	reloadBonus: Record<string, number>;
	clapperUsed: boolean;
	startTurns: number;
}

// ---- map ----
export type NodeType = 'combat' | 'elite' | 'shop' | 'rest' | 'boss' | 'event' | 'treasure';
export interface MapNode {
	row: number;
	index: number;
	type: NodeType;
	/** Indices of connected nodes in the next row. */
	next: number[];
}

// ---- offers ----
export interface CardOffer {
	cardId: string;
	price: number;
	sold: boolean;
}
export interface EquipOffer {
	item: string;
	price: number;
	sold: boolean;
}
export interface RewardState {
	gold: number;
	cards: string[];
	equipmentGained: string | null;
	boss: boolean;
}
export interface CampState {
	card: CardOffer | null;
	equipment: EquipOffer | null;
	service: { kind: 'bind' | 'vigil'; price: number; sold: boolean };
	swapped: boolean;
}
/** An open event node (docs/gdd.md §22.4). Random outcomes are rolled on entry so the preview shows them. */
export interface EventState {
	id: string;
	/** Item a `relic` / `equipment` effect grants (null when nothing is left to give). */
	item: string | null;
	/** Cards a `cardOffer` effect offers. */
	cards: string[];
	/** Deck cards an `upgradeRandom` effect upgrades. */
	upgradeUids: number[];
}
export interface TreasureState {
	gold: number;
	item: string | null;
}
export interface ShopState {
	cards: CardOffer[];
	equipment: EquipOffer[];
	removalsAtVisit: number;
	removedHere: boolean;
}

export type RunPhase =
	| 'map'
	| 'combat'
	| 'reward'
	| 'camp'
	| 'shop'
	| 'rest'
	| 'event'
	| 'treasure'
	| 'sanctum'
	| 'victory'
	| 'defeat';

export interface RunStats {
	collapses: number;
	combats: { kind: 'common' | 'elite' | 'boss'; turns: number; won: boolean; id: string }[];
	goldEarned: number;
	falls: number;
}

export interface RunOptions {
	enemyHpMul?: number;
	enemyDmgMul?: number;
	heroHpMul?: number;
}

export interface RunState {
	version: 1;
	/** Current act, 1-based; absent in saves made before Act 2 (treated as 1). */
	act?: number;
	seed: number;
	options: Required<RunOptions>;
	rng: Record<RngStream, number>;
	phase: RunPhase;
	party: HeroState[];
	deck: CardInst[];
	nextUid: number;
	gold: number;
	stash: string[];
	map: MapNode[][];
	/** Last visited node (row, index) or null before row 1. */
	cursor: { row: number; index: number } | null;
	currentNode: { row: number; index: number; type: NodeType } | null;
	seenEnemies: string[];
	removals: number;
	rarePity: number;
	roundsCleared: number;
	elitesWon: number;
	bossesWon: number;
	combat: CombatState | null;
	reward: RewardState | null;
	camp: CampState | null;
	shop: ShopState | null;
	/** Absent in saves made before events existed. */
	event?: EventState | null;
	treasure?: TreasureState | null;
	seenEvents?: string[];
	stats: RunStats;
	/** Difficulty ladder level 0–10 (docs/gdd.md §13.3); absent in old saves (= 0). */
	rite?: number;
	/** Cards unlocked by the skill tree for this run (docs/gdd.md §22.5); absent in old saves. */
	unlocked?: string[];
}

// ---- commands and events ----
export type Target = { type: 'enemy'; uid: number } | { type: 'hero'; id: HeroClass } | null;

export type Command =
	| { type: 'selectNode'; index: number }
	| { type: 'playCard'; cardUid: number; target: Target }
	| { type: 'endTurn' }
	| { type: 'chooseReward'; index: number }
	| { type: 'skipReward' }
	| { type: 'campBuy'; offer: 'card' | 'equipment' | 'service'; heroId?: HeroClass }
	| { type: 'campSwap'; leave: HeroClass; join: HeroClass }
	| { type: 'campLeave' }
	| { type: 'shopBuy'; kind: 'card' | 'equipment'; index: number }
	| { type: 'shopRemoveCard'; cardUid: number }
	| { type: 'leaveShop' }
	| { type: 'eventChoose'; index: number; cardUids?: number[] }
	| { type: 'claimTreasure' }
	| { type: 'sanctumChoose'; option: SanctumOption; cardUids?: number[] }
	| { type: 'restChoose'; option: 'recover' | 'temper' | 'pray'; cardUid?: number }
	| { type: 'equip'; heroId: HeroClass; slot: EquipSlot; item: string | null }
	| { type: 'reorder'; order: HeroClass[] };

export type UnitRef = { side: 'hero'; id: HeroClass } | { side: 'enemy'; uid: number };

export type GameEvent =
	| { type: 'invalid'; reason: string }
	| { type: 'nodeEntered'; row: number; index: number; nodeType: NodeType }
	| { type: 'combatStarted'; encounterId: string }
	| { type: 'turnStarted'; turn: number; energy: number }
	| { type: 'cardDrawn'; cardUid: number }
	| { type: 'reshuffled' }
	| { type: 'cardPlayed'; cardUid: number; cardId: string; owner: HeroClass; target: Target }
	| { type: 'cardExhausted'; cardUid: number }
	| {
			type: 'hit';
			source: UnitRef | null;
			target: UnitRef;
			amount: number;
			absorbed: number;
			hpLost: number;
	  }
	| { type: 'dot'; target: UnitRef; status: 'bleed' | 'burn'; hpLost: number }
	| { type: 'block'; target: UnitRef; amount: number }
	| { type: 'heal'; target: HeroClass; amount: number }
	| { type: 'enemyHeal'; uid: number; amount: number }
	| { type: 'status'; target: UnitRef; status: string; amount: number }
	| { type: 'negated'; target: UnitRef; status: string }
	| { type: 'stress'; target: HeroClass; amount: number }
	| { type: 'collapse'; target: HeroClass }
	| { type: 'fall'; target: HeroClass }
	| { type: 'rekindle'; target: HeroClass }
	| { type: 'enemyDied'; uid: number; key: string }
	| { type: 'enemyAction'; uid: number; intentId: string }
	| { type: 'enemyStunned'; uid: number }
	| { type: 'moved'; unit: UnitRef; from: number; to: number }
	| { type: 'bossPhase'; uid: number; phase: 2 | 3 }
	| { type: 'combatWon' }
	| { type: 'combatLost' }
	| { type: 'gold'; amount: number }
	| { type: 'rewardOffered'; cards: string[] }
	| { type: 'equipmentGained'; item: string; kept: boolean }
	| { type: 'bought'; what: string; price: number }
	| { type: 'eventChosen'; id: string; index: number }
	| { type: 'treasureClaimed'; gold: number; item: string | null }
	| { type: 'removed'; cardUid: number }
	| { type: 'upgraded'; cardUid: number }
	| { type: 'swapped'; leave: HeroClass; join: HeroClass }
	| { type: 'victory'; embers: number }
	| { type: 'defeat'; embers: number };

export interface ApplyResult {
	state: RunState;
	events: GameEvent[];
}

// ---- view model (read-only selectors for the view layer) ----
export type SanctumOption = 'heal' | 'remove' | 'upgrade' | 'gold';

export type ScreenKey =
	| 'map'
	| 'combat'
	| 'reward'
	| 'camp'
	| 'shop'
	| 'rest'
	| 'event'
	| 'treasure'
	| 'sanctum'
	| 'summary';

export interface StatusView {
	block: number;
	might: number;
	marked: number;
	weakened: number;
	bleed: number;
	burn: number;
	ward: number;
	stunned: boolean;
}

export interface HeroView {
	id: HeroClass;
	rank: number;
	hp: number;
	maxHP: number;
	stress: number;
	injured: boolean;
	fallen: boolean;
	status: StatusView;
	taunt: boolean;
	weapon: string | null;
	relic: string | null;
}

export interface IntentView {
	intentId: string;
	/** Heroes the intent will hit now (retargets live). */
	targets: HeroClass[];
	/** Damage per hit after modifiers, per target (0 when the intent deals no damage). */
	damage: { target: HeroClass; perHit: number; hits: number }[];
	stress: number;
	block: number;
	/** "<status> <amount>", e.g. "bleed 3": the amount is shown so the preview matches the tick (GDD P3). */
	debuffs: string[];
	telegraph: boolean;
}

export interface EnemyView {
	uid: number;
	key: string;
	/** First occupied rank, 1-based. */
	rank: number;
	size: 1 | 2;
	hp: number;
	maxHP: number;
	speed: number;
	status: StatusView;
	intent: IntentView | null;
	trait: EliteTrait | null;
	keg: number;
	phase: 1 | 2 | 3;
	stunned: boolean;
}

export interface HandCardView {
	uid: number;
	cardId: string;
	owner: HeroClass;
	upgraded: boolean;
	cost: number;
	playable: boolean;
	reason: string | null;
	validTargets: Target[];
	/** True when the card needs no target choice (targets=[null]). */
	autoTarget: boolean;
}

export interface CombatView {
	turn: number;
	/** Enemies gain Might every turn from `enrageTurn` (GDD 5.2). */
	enraged: boolean;
	enrageTurn: number;
	phase: 'player' | 'won' | 'lost';
	kind: 'common' | 'elite' | 'boss';
	energy: number;
	collapsePending: number;
	heroes: HeroView[];
	fallen: HeroView[];
	enemies: EnemyView[];
	hand: HandCardView[];
	piles: { draw: number; discard: number; exhaust: number; powers: number };
	/** Enemy uids in action order. */
	queue: number[];
	round: number;
}

export interface MapView {
	rows: MapNode[][];
	cursor: { row: number; index: number } | null;
	/** Nodes (row, index) that can be selected now. */
	available: { row: number; index: number }[];
	currentRow: number;
}

export interface RewardView {
	gold: number;
	cards: { cardId: string; index: number }[];
	equipmentGained: string | null;
	boss: boolean;
}

export interface CampView {
	gold: number;
	card: CardOffer | null;
	equipment: EquipOffer | null;
	service: CampState['service'];
	swapCandidates: HeroClass[];
	swapPrice: number;
	swapped: boolean;
	stash: string[];
}

export interface ShopView {
	gold: number;
	cards: CardOffer[];
	equipment: EquipOffer[];
	removalPrice: number;
	canRemove: boolean;
	stash: string[];
}

export interface SummaryView {
	victory: boolean;
	embers: number;
	roundsCleared: number;
	elitesWon: number;
	bossesWon: number;
	collapses: number;
}
