type DeepString<T> = {
	[K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export const en = {
	game: {
		title: 'Ossuary',
		workingTitle: 'Ossuary (working title)',
	},
	intro: {
		line1: 'The Order of the Pale Bell guarded a cathedral built over a fissure in the world.',
		line2: 'The fissure woke. It is now the Rift: a wound of bone, wax and machinery.',
		line3: 'Send three heroes down. Each descent is one run. No one is promised a return.',
	},
	menu: {
		continue: 'Continue',
		newRun: 'New run',
		settings: 'Settings',
		credits: 'Credits',
		tapToBegin: 'Tap to begin',
		version: 'Version {version}',
	},
	pause: {
		confirm: 'Confirm',
		title: 'Paused',
		resume: 'Resume',
		settings: 'Settings',
		abandon: 'Abandon run',
		mainMenu: 'Main menu',
		abandonConfirm: 'Abandon this run? Progress is lost.',
		saves: 'Progress is saved.',
	},
	settings: {
		title: 'Settings',
		language: 'Language',
		musicVolume: 'Music volume',
		sfxVolume: 'SFX volume',
		defaultSpeed: 'Default game speed',
		autoBattleStart: 'Auto battle at combat start',
		reduceShake: 'Reduce screen shake',
		reduceFlashes: 'Reduce flashes',
		fullscreen: 'Fullscreen',
		on: 'On',
		off: 'Off',
		back: 'Back',
	},
	party: {
		title: 'Choose your party',
		subtitle: 'Pick 3 of 5 and set their ranks.',
		start: 'Descend',
		selected: '{count} of 3 chosen',
		defaultHint: 'First run: Shieldbearer in rank 1, Confessor in rank 2, Marksman in rank 3.',
		noFrontWarning: 'No one holds the front rank: enemies will strike your rank 1 hero first.',
	},
	hud: {
		chooseTarget: 'Tap a highlighted target.',
		tapAgain: 'Tap the card again to play it.',
		round: 'Round {round}/10',
		act: 'Act {act}',
		turnQueue: 'Turn queue',
		gold: 'Gold',
		stash: 'Stash',
		endTurn: 'End turn',
		energy: 'Energy',
		draw: 'Draw',
		discard: 'Discard',
		exhaust: 'Exhaust',
		auto: 'Auto',
		speed: 'Speed {speed}',
		pause: 'Pause',
		intent: 'Intent',
		from: 'From',
		target: 'Target',
		preview: 'Preview',
		noTarget: 'No target selected.',
		unplayable: 'Unplayable',
		teamTurn: 'Your turn',
		enemyTurn: 'Enemy turn',
		victory: 'Victory',
		defeat: 'Defeat',
	},
	node: {
		combat: 'Combat',
		elite: 'Elite',
		rest: 'Rest',
		shop: 'Shop',
		boss: 'Boss',
		camp: 'Camp',
	},
	camp: {
		rank: 'Rank {rank}',
		swapFor: 'Swap for {hero}',
		title: 'Camp',
		swapHero: 'Swap a hero',
		swapHint: 'Choose one of the two heroes not in the party.',
		cardForSale: 'Card for sale',
		equipmentForSale: 'Equipment for sale',
		serviceBind: 'Bind wounds',
		serviceBindText: 'Heal 15% of max HP for every hero.',
		serviceVigil: 'Vigil',
		serviceVigilText: 'Relieve 3 stress from one hero.',
		reorderRanks: 'Reorder ranks',
		leave: 'Leave camp',
		price: '{gold} gold',
	},
	rest: {
		chooseCard: 'Choose a card to upgrade',
		title: 'Rest',
		recover: 'Recover',
		recoverText: 'Each hero heals 30% of max HP and loses any injury.',
		temper: 'Temper',
		temperText: 'Upgrade one card.',
		pray: 'Pray',
		prayText: 'Each hero relieves 5 stress.',
	},
	shop: {
		leave: 'Leave shop',
		chooseRemoval: 'Choose a card to remove',
		title: 'Shop',
		cards: 'Cards',
		equipment: 'Equipment',
		removal: 'Remove a card',
		removalText: 'Remove one card from your deck.',
		buy: 'Buy',
		soldOut: 'Sold out',
		notEnoughGold: 'Not enough gold',
	},
	reward: {
		skipConfirm: 'Press Esc again to skip the card.',
		equipment: 'Equipment: {item}',
		take: 'Take',
		title: 'Reward',
		pickCard: 'Pick one card',
		skip: 'Skip',
		gold: '+{gold} gold',
	},
	summary: {
		collapses: 'Collapses: {count}',
		victory: 'The Rift is closed for now.',
		defeat: 'The party has fallen.',
		rounds: 'Rounds cleared: {count}',
		elites: 'Elites won: {count}',
		bosses: 'Bosses won: {count}',
		embers: 'Embers earned: {count}',
		mainMenu: 'Main menu',
	},
	stress: {
		label: 'Stress',
		collapse: 'Collapse',
		collapseText: 'Next turn the party loses 1 energy. Stress resets to 5.',
	},
	fallen: {
		label: 'Fallen',
		returns: 'Returns next round at 1 HP.',
		injury: 'Injured',
		injuryText: 'Max HP reduced by 25% until a rest.',
	},
	status: {
		block: {
			name: 'Block',
			tooltip: "Absorbs damage from hits. Resets at the start of its owner's turn.",
		},
		might: {
			name: 'Might',
			tooltip: 'Adds {stacks} damage to each hit. Lasts the combat.',
		},
		marked: {
			name: 'Marked',
			tooltip: "Takes 1.5x hit damage. Loses 1 at the end of its owner's turn.",
		},
		weakened: {
			name: 'Weakened',
			tooltip: "Deals 0.75x hit damage. Loses 1 at the end of its owner's turn.",
		},
		bleed: {
			name: 'Bleed',
			tooltip: "Loses HP at the start of its owner's turn. Then loses 1 stack.",
		},
		burn: {
			name: 'Burn',
			tooltip: "Loses HP at the end of its owner's turn. Ignores Block. Then halves.",
		},
		ward: {
			name: 'Ward',
			tooltip: 'Negates the next debuff applications. Loses 1 per negation.',
		},
		stunned: {
			name: 'Stunned',
			tooltip: 'Skips its next action. Enemies only.',
		},
	},
	keyword: {
		exhaust: {
			name: 'Exhaust',
			tooltip: 'Removed from the deck until the end of the combat.',
		},
		retain: {
			name: 'Retain',
			tooltip: 'Not discarded at the end of the turn.',
		},
		power: {
			name: 'Power',
			tooltip: 'Stays in play for the combat after it is played.',
		},
		dread: {
			name: 'Dread',
			tooltip: 'When played, the owner gains this much stress.',
		},
		push: {
			name: 'Push',
			tooltip: 'Moves the target enemy back the given number of ranks.',
		},
		pull: {
			name: 'Pull',
			tooltip: 'Moves the target enemy forward the given number of ranks.',
		},
		swap: {
			name: 'Swap',
			tooltip: 'The owner swaps rank with the adjacent hero.',
		},
		splash: {
			name: 'Splash',
			tooltip: 'Each enemy next to the target takes this damage.',
		},
		taunt: {
			name: 'Taunt',
			tooltip: 'Until your next turn, enemy attacks on single targets go to this hero.',
		},
	},
	hero: {
		shieldbearer: {
			name: 'Shieldbearer',
			role: 'Tank',
			identity: 'Block, Taunt, protects allies.',
		},
		marksman: {
			name: 'Marksman',
			role: 'Single-target damage',
			identity: 'Marks targets, precise, reaches any rank.',
		},
		arcanist: {
			name: 'Arcanist',
			role: 'Area damage',
			identity: 'Burn, area hits, pays in stress.',
		},
		confessor: {
			name: 'Confessor',
			role: 'Support and healer',
			identity: 'Heals, Wards, relieves stress.',
		},
		bombardier: {
			name: 'Bombardier',
			role: 'Artillery',
			identity: 'Splash, back-rank hits, Stun.',
		},
	},
	enemy: {
		husk_penitent: {
			name: 'Husk Penitent',
			lore: 'A man who wore his penance until nothing of him was left but the vows.',
		},
		chitter_swarm: {
			name: 'Chitter Swarm',
			lore: 'Small things that move as one in the dark beneath the nave.',
		},
		ash_acolyte: {
			name: 'Ash Acolyte',
			lore: 'She keeps the fire lit. No one remembers what it was meant to burn.',
		},
		graft_hound: {
			name: 'Graft Hound',
			lore: 'Stitched from a dog and a pilgrim. It still knows the scent of the road.',
		},
		wax_mourner: {
			name: 'Wax Mourner',
			lore: 'It weeps candle wax for the dead and never stops.',
		},
		rust_templar: {
			name: 'Rust Templar',
			lore: 'Plate that has forgotten the knight inside. It still holds the line.',
		},
		lantern_leech: {
			name: 'Lantern Leech',
			lore: 'It feeds on light and gives back hunger.',
		},
		choir_thing: {
			name: 'Choir-Thing',
			lore: 'Voices without throats, singing a hymn the Order no longer knows.',
		},
		ossified_brute: {
			name: 'Ossified Brute',
			lore: 'Bone grown over bone. It stops only when the thing in front of it is still.',
		},
		rift_stalker: {
			name: 'Rift Stalker',
			lore: 'It walks between the folds of the Rift and steps out behind you.',
		},
	},
	elite: {
		templar_captain: {
			name: 'Templar Captain',
			trait: 'Oathwall: when it gains Block, every other enemy gains 5 Block.',
		},
		calcified_brute: {
			name: 'Calcified Brute',
			trait: 'Calcified: takes 2 less damage per hit, to a minimum of 1.',
		},
	},
	boss: {
		phase2: 'THE BELL CRACKS',
		bell_maw: {
			name: 'Bell-Maw',
			epilogue:
				'The bell stops. The Rift does not.\nThe party climbs back up the stairs, fewer than they were.\nBelow, something answers the silence.',
		},
	},
	item: {
		eq_notched_blade: {
			name: 'Notched Blade',
			effect: "The owner's attacks deal +1 damage per hit.",
		},
		eq_heavy_pavise: {
			name: 'Heavy Pavise',
			effect: "The owner's Block values +2.",
		},
		eq_bone_reliquary: {
			name: 'Bone Reliquary',
			effect: 'The owner gains +6 max HP.',
		},
		eq_ember_focus: {
			name: 'Ember Focus',
			effect: "The owner's first attack each turn also applies 2 Burn.",
		},
		eq_votive_candle: {
			name: 'Votive Candle',
			effect: 'The owner relieves 1 stress after each combat.',
		},
		eq_iron_rosary: {
			name: 'Iron Rosary',
			effect: 'The owner starts each combat with 6 Block.',
		},
		eq_hunters_lens: {
			name: "Hunter's Lens",
			effect: "The owner's first attack each combat applies 2 Marked.",
		},
		eq_bell_clapper: {
			name: 'Bell Clapper',
			effect: 'Once per turn, if a hero has 7 or more stress, gain 1 energy.',
		},
	},
	equip: {
		weapon: 'Weapon (empty)',
		relic: 'Relic (empty)',
	},
	cardType: {
		attack: 'Attack',
		power: 'Power',
		skill: 'Skill',
	},
	map: {
		choose: 'Choose your next node.',
	},
	picker: {
		empty: 'No cards.',
		page: 'Page {page}/{pages}',
		tapAgain: 'Tap again to choose.',
	},
	intent: {
		ambush: 'Ambushes a hero from the back.',
		ash_strike: 'Strikes the front hero with burning ash.',
		bite: 'Bites the front hero, twice.',
		clapper: 'Swings the clapper at the front hero.',
		cleave: 'Cleaves the two front heroes.',
		crush: 'Crushes the front hero.',
		dirge: 'Mourns for the most stressed hero.',
		drain: 'Drains the weakest hero and heals itself.',
		drip: 'Drips wax on the weakest hero.',
		fade: 'Fades into the Rift and gains Block.',
		flail: 'Strikes the front hero.',
		gather: 'Gathers its strength. Something heavy is coming.',
		hum: 'Hums: every enemy gains Ward.',
		kindle: 'Feeds the fire: every enemy gains Might.',
		lunge: 'Lunges at the front hero.',
		lure: 'Lures a hero from the back and marks it.',
		mutter: "Mutters, gnawing at the front hero's nerve.",
		peal: 'The bell peals: hits every hero.',
		raise_shield: 'Raises a shield and gains Block.',
		rake: 'Rakes the back heroes twice.',
		rend: 'Rends the front hero and leaves a Bleed.',
		resonance: 'The bell resonates: gains Block and Might.',
		shove: 'Shoves a hero and swaps the front two.',
		shriek: 'Shrieks: every hero is stressed and weakened.',
		swallow: 'Swallows the most stressed hero.',
		toll: 'The bell tolls: every hero gains stress.',
	},
	card: {
		shb_hack: {
			name: 'Hack',
			text: 'Deal {damage} damage.',
		},
		shb_brace: {
			name: 'Brace',
			text: 'Gain {block} Block. Each other hero gains {allyBlock} Block.',
		},
		shb_hold_the_line: {
			name: 'Hold the Line',
			text: 'Gain {block} Block. Taunt.',
		},
		shb_shield_slam: {
			name: 'Shield Slam',
			text: 'Deal damage equal to your Block, up to 24.',
		},
		shb_iron_stance: {
			name: 'Iron Stance',
			text: 'Gain {block} Block. Exhaust.',
		},
		shb_shove: {
			name: 'Shove',
			text: 'Deal {damage} damage. Push 1.',
		},
		shb_bulwark: {
			name: 'Bulwark',
			text: 'Gain {block} Block. It does not reset next turn.',
		},
		shb_vow_of_iron: {
			name: 'Vow of Iron',
			text: 'At the start of each turn, gain {block} Block.',
		},
		shb_last_bastion: {
			name: 'Last Bastion',
			text: 'Each hero gains {block} Block. Dread 2. Exhaust.',
		},
		mrk_aimed_shot: {
			name: 'Aimed Shot',
			text: 'Deal {damage} damage.',
		},
		mrk_sidestep: {
			name: 'Sidestep',
			text: 'Gain {block} Block. Swap with the hero behind.',
		},
		mrk_mark_prey: {
			name: 'Mark Prey',
			text: 'Deal {damage} damage. Apply {stacks} Marked.',
		},
		mrk_piercing_bolt: {
			name: 'Piercing Bolt',
			text: 'Deal {damage} damage to the target and the enemy behind it.',
		},
		mrk_quick_draw: {
			name: 'Quick Draw',
			text: 'Deal {damage} damage. Draw 1.',
		},
		mrk_pinning_shot: {
			name: 'Pinning Shot',
			text: 'Deal {damage} damage. Apply 2 Weakened.',
		},
		mrk_volley: {
			name: 'Volley',
			text: 'Deal {damage} damage twice to each enemy.',
		},
		mrk_hunters_focus: {
			name: "Hunter's Focus",
			text: 'Your first attack each turn on a Marked enemy deals +{bonus} damage.',
		},
		mrk_killshot: {
			name: 'Killshot',
			text: 'Deal {damage} damage. +{bonus} if the target is Marked. Exhaust.',
		},
		arc_ember_bolt: {
			name: 'Ember Bolt',
			text: 'Deal {damage} damage.',
		},
		arc_ash_veil: {
			name: 'Ash Veil',
			text: 'Give an ally {block} Block.',
		},
		arc_rift_spark: {
			name: 'Rift Spark',
			text: 'Deal {damage} damage to each enemy. Dread 1.',
		},
		arc_burn_hex: {
			name: 'Burn Hex',
			text: 'Apply {stacks} Burn.',
		},
		arc_channel: {
			name: 'Channel',
			text: 'Next turn gain 2 energy. Exhaust.',
		},
		arc_cinder_lance: {
			name: 'Cinder Lance',
			text: 'Deal {damage} damage to the front enemy.',
		},
		arc_firestorm: {
			name: 'Firestorm',
			text: 'Deal {damage} damage to each enemy. Dread 2.',
		},
		arc_unseal: {
			name: 'Unseal',
			text: 'Draw {draw}. Dread 1.',
		},
		arc_rift_rupture: {
			name: 'Rift Rupture',
			text: 'Deal {damage} damage. Dread 3. Exhaust.',
		},
		cnf_censer_strike: {
			name: 'Censer Strike',
			text: 'Deal {damage} damage. Heal the lowest-HP hero {heal}.',
		},
		cnf_sanctuary: {
			name: 'Sanctuary',
			text: 'Give an ally {block} Block and 1 Ward.',
		},
		cnf_mend: {
			name: 'Mend',
			text: 'Heal an ally {heal}.',
		},
		cnf_absolve: {
			name: 'Absolve',
			text: 'Remove all debuffs from an ally. Relieve {stress} stress.',
		},
		cnf_litany: {
			name: 'Litany',
			text: 'Each hero gains {block} Block and relieves 1 stress.',
		},
		cnf_rebuke: {
			name: 'Rebuke',
			text: 'Deal {damage} damage. Apply 2 Weakened.',
		},
		cnf_mass_mend: {
			name: 'Mass Mend',
			text: 'Heal each hero {heal}. Exhaust.',
		},
		cnf_steadfast_hymn: {
			name: 'Steadfast Hymn',
			text: 'At the start of each turn, the lowest-HP hero gains {block} Block.',
		},
		cnf_rekindle: {
			name: 'Rekindle',
			text: 'A fallen hero rises at 25% max HP, without injury. Exhaust.',
		},
		bmb_grapeshot: {
			name: 'Grapeshot',
			text: 'Deal {damage} damage to each of the front two enemies.',
		},
		bmb_sandbags: {
			name: 'Sandbags',
			text: 'Gain {block} Block. The adjacent hero gains {allyBlock} Block.',
		},
		bmb_shell: {
			name: 'Shell',
			text: 'Deal {damage} damage to an enemy in rank 2–4. Splash {splash}.',
		},
		bmb_incendiary: {
			name: 'Incendiary',
			text: 'Deal {damage} damage. Apply 3 Burn to the target and its neighbours.',
		},
		bmb_reload: {
			name: 'Reload',
			text: 'Draw 1. Your next Bombardier attack this turn deals +{bonus} damage.',
		},
		bmb_concussion_round: {
			name: 'Concussion Round',
			text: 'Deal {damage} damage. Stun.',
		},
		bmb_barrage: {
			name: 'Barrage',
			text: 'Deal {damage} damage three times, each hit on a random enemy.',
		},
		bmb_powder_keg: {
			name: 'Powder Keg',
			text: 'Plant a keg. Its next hit also hits neighbours for 10.',
		},
		bmb_siege_mortar: {
			name: 'Siege Mortar',
			text: 'Deal {damage} damage to each enemy. Dread 2. Exhaust.',
		},
	},
} as const;

export type Strings = DeepString<typeof en>;
