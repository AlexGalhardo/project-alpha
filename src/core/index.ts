// Stable facade of the deterministic core. The view layer imports only from here.
export { chooseAutoCommand } from './auto.ts';
export { chooseBotCommand } from './bot.ts';
export { cardDef, cardValues } from './cards.ts';
export { cardsToChoose, choiceAvailable } from './events.ts';
export {
	applyMeta,
	bankRun,
	buyNode,
	canVeteran,
	emptyProfile,
	nextNodeCost,
	type Profile,
	parseProfile,
	recordWin,
	unlockedCards,
} from './meta.ts';
export { maxHP } from './ops.ts';
export { applyRite, riteLevel } from './rites.ts';
export { apply, createRun, deserialize, embers, preview, serialize } from './run.ts';
export type {
	ApplyResult,
	CampView,
	CardDef,
	CardInst,
	CombatView,
	Command,
	EnemyDef,
	EnemyView,
	EquipmentDef,
	GameEvent,
	HandCardView,
	HeroClass,
	HeroState,
	HeroView,
	IntentView,
	MapView,
	RewardView,
	RunOptions,
	RunState,
	ScreenKey,
	ShopView,
	SummaryView,
	Target,
} from './types.ts';
export {
	campView,
	combatView,
	currentScreen,
	mapView,
	rewardView,
	selectParty,
	shopView,
	summaryView,
} from './views.ts';
