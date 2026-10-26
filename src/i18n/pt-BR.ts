import type { Strings } from './en';

export const ptBR: Strings = {
	game: {
		title: 'Ossuary',
		workingTitle: 'Ossuary (título provisório)',
	},
	intro: {
		line1: 'A Ordem do Sino Pálido guardava uma catedral erguida sobre uma fissura no mundo.',
		line2: 'A fissura acordou. Agora é a Fenda: uma ferida de osso, cera e maquinaria.',
		line3: 'Desça com três heróis. Cada descida é uma run. Ninguém tem promessa de volta.',
	},
	menu: {
		continue: 'Continuar',
		newRun: 'Nova run',
		settings: 'Configurações',
		credits: 'Créditos',
		tapToBegin: 'Toque para começar',
		version: 'Versão {version}',
	},
	pause: {
		confirm: 'Confirmar',
		title: 'Pausado',
		resume: 'Continuar',
		settings: 'Configurações',
		abandon: 'Abandonar run',
		mainMenu: 'Menu principal',
		abandonConfirm: 'Abandonar esta run? O progresso será perdido.',
		saves: 'O progresso é salvo.',
	},
	settings: {
		title: 'Configurações',
		language: 'Idioma',
		musicVolume: 'Volume da música',
		sfxVolume: 'Volume dos efeitos',
		defaultSpeed: 'Velocidade padrão do jogo',
		autoBattleStart: 'Batalha automática no início do combate',
		reduceShake: 'Reduzir tremor da tela',
		reduceFlashes: 'Reduzir flashes',
		fullscreen: 'Tela cheia',
		on: 'Ligado',
		off: 'Desligado',
		back: 'Voltar',
	},
	party: {
		title: 'Escolha seu grupo',
		subtitle: 'Escolha 3 de 5 e defina as posições.',
		start: 'Descer',
		selected: '{count} de 3 escolhidos',
		defaultHint: 'Primeira run: Escudeiro na posição 1, Confessor na 2, Atirador na 3.',
	},
	hud: {
		chooseTarget: 'Toque em um alvo destacado.',
		tapAgain: 'Toque na carta de novo para jogá-la.',
		round: 'Rodada {round}/10',
		act: 'Ato {act}',
		turnQueue: 'Fila de turnos',
		gold: 'Ouro',
		stash: 'Depósito',
		endTurn: 'Encerrar turno',
		energy: 'Energia',
		draw: 'Compra',
		discard: 'Descarte',
		exhaust: 'Exaustão',
		auto: 'Auto',
		speed: 'Velocidade {speed}',
		pause: 'Pausar',
		intent: 'Intenção',
		from: 'De',
		target: 'Alvo',
		preview: 'Prévia',
		noTarget: 'Nenhum alvo selecionado.',
		unplayable: 'Não jogável',
		teamTurn: 'Seu turno',
		enemyTurn: 'Turno inimigo',
		victory: 'Vitória',
		defeat: 'Derrota',
	},
	node: {
		combat: 'Combate',
		elite: 'Elite',
		rest: 'Descanso',
		shop: 'Loja',
		boss: 'Chefe',
		camp: 'Acampamento',
	},
	camp: {
		rank: 'Posição {rank}',
		swapFor: 'Trocar por {hero}',
		title: 'Acampamento',
		swapHero: 'Trocar um herói',
		swapHint: 'Escolha um dos dois heróis que não estão no grupo.',
		cardForSale: 'Carta à venda',
		equipmentForSale: 'Equipamento à venda',
		serviceBind: 'Enfaixar feridas',
		serviceBindText: 'Cura 15% da vida máxima de cada herói.',
		serviceVigil: 'Vigília',
		serviceVigilText: 'Alivia 3 de estresse de um herói.',
		reorderRanks: 'Reordenar posições',
		leave: 'Deixar o acampamento',
		price: '{gold} de ouro',
	},
	rest: {
		chooseCard: 'Escolha uma carta para melhorar',
		title: 'Descanso',
		recover: 'Recuperar',
		recoverText: 'Cada herói cura 30% da vida máxima e perde qualquer ferimento.',
		temper: 'Temperar',
		temperText: 'Melhora uma carta.',
		pray: 'Rezar',
		prayText: 'Cada herói alivia 5 de estresse.',
	},
	shop: {
		leave: 'Sair da loja',
		chooseRemoval: 'Escolha uma carta para remover',
		title: 'Loja',
		cards: 'Cartas',
		equipment: 'Equipamentos',
		removal: 'Remover uma carta',
		removalText: 'Remove uma carta do seu baralho.',
		buy: 'Comprar',
		soldOut: 'Esgotado',
		notEnoughGold: 'Ouro insuficiente',
	},
	reward: {
		skipConfirm: 'Pressione Esc de novo para pular a carta.',
		equipment: 'Equipamento: {item}',
		take: 'Pegar',
		title: 'Recompensa',
		pickCard: 'Escolha uma carta',
		skip: 'Pular',
		gold: '+{gold} de ouro',
	},
	summary: {
		collapses: 'Colapsos: {count}',
		victory: 'A Fenda está fechada por enquanto.',
		defeat: 'O grupo caiu.',
		rounds: 'Rodadas vencidas: {count}',
		elites: 'Elites vencidos: {count}',
		bosses: 'Chefes vencidos: {count}',
		embers: 'Brasas ganhas: {count}',
		mainMenu: 'Menu principal',
	},
	stress: {
		label: 'Estresse',
		collapse: 'Colapso',
		collapseText: 'No próximo turno o grupo perde 1 de energia. O estresse volta a 5.',
	},
	fallen: {
		label: 'Caído',
		returns: 'Volta na próxima rodada com 1 de vida.',
		injury: 'Ferido',
		injuryText: 'Vida máxima reduzida em 25% até um descanso.',
	},
	status: {
		block: {
			name: 'Bloqueio',
			tooltip: 'Absorve dano dos golpes. Zera no início do turno do dono.',
		},
		might: {
			name: 'Vigor',
			tooltip: 'Soma {stacks} de dano a cada golpe. Dura o combate.',
		},
		marked: {
			name: 'Marcado',
			tooltip: 'Recebe 1,5x de dano dos golpes. Perde 1 no fim do turno do dono.',
		},
		weakened: {
			name: 'Enfraquecido',
			tooltip: 'Causa 0,75x de dano dos golpes. Perde 1 no fim do turno do dono.',
		},
		bleed: {
			name: 'Sangramento',
			tooltip: 'Perde vida no início do turno do dono. Depois perde 1 acúmulo.',
		},
		burn: {
			name: 'Queimadura',
			tooltip: 'Perde vida no fim do turno do dono. Ignora bloqueio. Depois divide por dois.',
		},
		ward: {
			name: 'Proteção',
			tooltip: 'Anula as próximas aplicações de enfraquecimento. Perde 1 por anulação.',
		},
		stunned: {
			name: 'Atordoado',
			tooltip: 'Perde a próxima ação. Apenas inimigos.',
		},
	},
	keyword: {
		exhaust: {
			name: 'Exaustão',
			tooltip: 'Removida do baralho até o fim do combate.',
		},
		retain: {
			name: 'Retenção',
			tooltip: 'Não vai para o descarte no fim do turno.',
		},
		power: {
			name: 'Poder',
			tooltip: 'Fica em jogo pelo resto do combate depois de jogada.',
		},
		dread: {
			name: 'Temor',
			tooltip: 'Ao ser jogada, o dono ganha este tanto de estresse.',
		},
		push: {
			name: 'Empurrar',
			tooltip: 'Move o inimigo alvo para trás o número indicado de posições.',
		},
		pull: {
			name: 'Puxar',
			tooltip: 'Move o inimigo alvo para frente o número indicado de posições.',
		},
		swap: {
			name: 'Trocar',
			tooltip: 'O dono troca de posição com o herói vizinho.',
		},
		splash: {
			name: 'Respingo',
			tooltip: 'Cada inimigo ao lado do alvo sofre este dano.',
		},
		taunt: {
			name: 'Provocar',
			tooltip: 'Até o seu próximo turno, ataques inimigos a um alvo vão para este herói.',
		},
	},
	hero: {
		shieldbearer: {
			name: 'Escudeiro',
			role: 'Tanque',
			identity: 'Bloqueio, Provocar, protege os aliados.',
		},
		marksman: {
			name: 'Atirador',
			role: 'Dano em alvo único',
			identity: 'Marca alvos, preciso, alcança qualquer posição.',
		},
		arcanist: {
			name: 'Arcanista',
			role: 'Dano em área',
			identity: 'Queimadura, golpes em área, paga com estresse.',
		},
		confessor: {
			name: 'Confessor',
			role: 'Apoio e cura',
			identity: 'Cura, Proteção, alivia estresse.',
		},
		bombardier: {
			name: 'Bombardeiro',
			role: 'Artilharia',
			identity: 'Respingo, golpes na retaguarda, Atordoar.',
		},
	},
	enemy: {
		husk_penitent: {
			name: 'Penitente Oco',
			lore: 'Um homem que usou a penitência até não sobrar nada dele além dos votos.',
		},
		chitter_swarm: {
			name: 'Enxame Guinchante',
			lore: 'Coisas pequenas que se movem como uma só na escuridão sob a nave.',
		},
		ash_acolyte: {
			name: 'Acólita de Cinza',
			lore: 'Ela mantém o fogo aceso. Ninguém lembra o que ele deveria queimar.',
		},
		graft_hound: {
			name: 'Cão Enxertado',
			lore: 'Costurado de um cachorro e de um peregrino. Ainda conhece o cheiro da estrada.',
		},
		wax_mourner: {
			name: 'Carpideira de Cera',
			lore: 'Chora cera de vela pelos mortos e nunca para.',
		},
		rust_templar: {
			name: 'Templário Enferrujado',
			lore: 'Placas que esqueceram o cavaleiro dentro. Ainda segura a linha.',
		},
		lantern_leech: {
			name: 'Sanguessuga da Lanterna',
			lore: 'Alimenta-se de luz e devolve fome.',
		},
		choir_thing: {
			name: 'Coisa do Coro',
			lore: 'Vozes sem garganta, cantando um hino que a Ordem já não conhece.',
		},
		ossified_brute: {
			name: 'Brutamontes Ossificado',
			lore: 'Osso crescido sobre osso. Só para quando a coisa à frente fica parada.',
		},
		rift_stalker: {
			name: 'Espreitador da Fenda',
			lore: 'Anda entre as dobras da Fenda e surge atrás de você.',
		},
	},
	elite: {
		templar_captain: {
			name: 'Capitão Templário',
			trait: 'Muralha do Juramento: quando ganha bloqueio, cada outro inimigo ganha 5 de bloqueio.',
		},
		calcified_brute: {
			name: 'Brutamontes Calcificado',
			trait: 'Calcificado: recebe 2 de dano a menos por golpe, com mínimo de 1.',
		},
	},
	boss: {
		phase2: 'O SINO RACHA',
		bell_maw: {
			name: 'Boca-do-Sino',
			epilogue:
				'O sino para. A Fenda não.\nO grupo sobe de volta a escada, menor do que era.\nLá embaixo, algo responde ao silêncio.',
		},
	},
	item: {
		eq_notched_blade: {
			name: 'Lâmina Entalhada',
			effect: 'Os ataques do dono causam +1 de dano por golpe.',
		},
		eq_heavy_pavise: {
			name: 'Pavês Pesado',
			effect: 'Os valores de bloqueio do dono +2.',
		},
		eq_bone_reliquary: {
			name: 'Relicário de Osso',
			effect: 'O dono ganha +6 de vida máxima.',
		},
		eq_ember_focus: {
			name: 'Foco de Brasa',
			effect: 'O primeiro ataque do dono em cada turno também aplica 2 de Queimadura.',
		},
		eq_votive_candle: {
			name: 'Vela Votiva',
			effect: 'O dono alivia 1 de estresse depois de cada combate.',
		},
		eq_iron_rosary: {
			name: 'Rosário de Ferro',
			effect: 'O dono começa cada combate com 6 de bloqueio.',
		},
		eq_hunters_lens: {
			name: 'Lente do Caçador',
			effect: 'O primeiro ataque do dono em cada combate aplica 2 de Marcado.',
		},
		eq_bell_clapper: {
			name: 'Badalo do Sino',
			effect: 'Uma vez por turno, se um herói tiver 7 ou mais de estresse, ganha 1 de energia.',
		},
	},
	equip: {
		weapon: 'Arma (vazio)',
		relic: 'Relíquia (vazio)',
	},
	cardType: {
		attack: 'Ataque',
		power: 'Poder',
		skill: 'Habilidade',
	},
	map: {
		choose: 'Escolha seu próximo nó.',
	},
	picker: {
		empty: 'Sem cartas.',
		page: 'Página {page}/{pages}',
		tapAgain: 'Toque de novo para escolher.',
	},
	intent: {
		ambush: 'Ataca uma emboscada contra um herói da retaguarda.',
		ash_strike: 'Golpeia o herói da frente com cinza ardente.',
		bite: 'Morde o herói da frente, duas vezes.',
		clapper: 'Balança o badalo contra o herói da frente.',
		cleave: 'Racha os dois heróis da frente.',
		crush: 'Esmaga o herói da frente.',
		dirge: 'Lamenta pelo herói mais estressado.',
		drain: 'Drena o herói com menos vida e se cura.',
		drip: 'Pinga cera sobre o herói com menos vida.',
		fade: 'Some na Fenda e ganha bloqueio.',
		flail: 'Golpeia o herói da frente.',
		gather: 'Reúne forças. Algo pesado está vindo.',
		hum: 'Zumbe: todos os inimigos ganham Proteção.',
		kindle: 'Alimenta o fogo: todos os inimigos ganham Vigor.',
		lunge: 'Avança sobre o herói da frente.',
		lure: 'Atrai um herói da retaguarda e o marca.',
		mutter: 'Murmura, corroendo os nervos do herói da frente.',
		peal: 'O sino repica: atinge todos os heróis.',
		raise_shield: 'Ergue um escudo e ganha bloqueio.',
		rake: 'Retalha os heróis da retaguarda, duas vezes.',
		rend: 'Dilacera o herói da frente e deixa Sangramento.',
		resonance: 'O sino ressoa: ganha bloqueio e Vigor.',
		shove: 'Empurra um herói e troca os dois da frente.',
		shriek: 'Grita: todos os heróis ficam estressados e enfraquecidos.',
		swallow: 'Engole o herói mais estressado.',
		toll: 'O sino toca: todos os heróis ganham estresse.',
	},
	card: {
		shb_hack: {
			name: 'Talho',
			text: 'Causa {damage} de dano.',
		},
		shb_brace: {
			name: 'Escora',
			text: 'Ganha {block} de bloqueio. Cada outro herói ganha {allyBlock} de bloqueio.',
		},
		shb_hold_the_line: {
			name: 'Manter a Linha',
			text: 'Ganha {block} de bloqueio. Provocar.',
		},
		shb_shield_slam: {
			name: 'Golpe de Escudo',
			text: 'Causa dano igual ao seu bloqueio, até 24.',
		},
		shb_iron_stance: {
			name: 'Postura de Ferro',
			text: 'Ganha {block} de bloqueio. Exaustão.',
		},
		shb_shove: {
			name: 'Empurrão',
			text: 'Causa {damage} de dano. Empurrar 1.',
		},
		shb_bulwark: {
			name: 'Baluarte',
			text: 'Ganha {block} de bloqueio. Não zera no próximo turno.',
		},
		shb_vow_of_iron: {
			name: 'Voto de Ferro',
			text: 'No início de cada turno, ganha {block} de bloqueio.',
		},
		shb_last_bastion: {
			name: 'Último Baluarte',
			text: 'Cada herói ganha {block} de bloqueio. Temor 2. Exaustão.',
		},
		mrk_aimed_shot: {
			name: 'Tiro Mirado',
			text: 'Causa {damage} de dano.',
		},
		mrk_sidestep: {
			name: 'Passo de Lado',
			text: 'Ganha {block} de bloqueio. Trocar com o herói de trás.',
		},
		mrk_mark_prey: {
			name: 'Marcar a Presa',
			text: 'Causa {damage} de dano. Aplica {stacks} de Marcado.',
		},
		mrk_piercing_bolt: {
			name: 'Virote Perfurante',
			text: 'Causa {damage} de dano ao alvo e ao inimigo atrás dele.',
		},
		mrk_quick_draw: {
			name: 'Saque Rápido',
			text: 'Causa {damage} de dano. Compra 1.',
		},
		mrk_pinning_shot: {
			name: 'Tiro de Imobilização',
			text: 'Causa {damage} de dano. Aplica 2 de Enfraquecido.',
		},
		mrk_volley: {
			name: 'Rajada',
			text: 'Causa {damage} de dano duas vezes em cada inimigo.',
		},
		mrk_hunters_focus: {
			name: 'Foco do Caçador',
			text: 'Seu primeiro ataque no turno contra um inimigo Marcado causa +{bonus} de dano.',
		},
		mrk_killshot: {
			name: 'Golpe Final',
			text: 'Causa {damage} de dano. +{bonus} se o alvo estiver Marcado. Exaustão.',
		},
		arc_ember_bolt: {
			name: 'Raio de Brasa',
			text: 'Causa {damage} de dano.',
		},
		arc_ash_veil: {
			name: 'Véu de Cinza',
			text: 'Dá {block} de bloqueio a um aliado.',
		},
		arc_rift_spark: {
			name: 'Centelha da Fenda',
			text: 'Causa {damage} de dano em cada inimigo. Temor 1.',
		},
		arc_burn_hex: {
			name: 'Feitiço de Queima',
			text: 'Aplica {stacks} de Queimadura.',
		},
		arc_channel: {
			name: 'Canalizar',
			text: 'No próximo turno ganha 2 de energia. Exaustão.',
		},
		arc_cinder_lance: {
			name: 'Lança de Cinza',
			text: 'Causa {damage} de dano ao inimigo da frente.',
		},
		arc_firestorm: {
			name: 'Tempestade de Fogo',
			text: 'Causa {damage} de dano em cada inimigo. Temor 2.',
		},
		arc_unseal: {
			name: 'Desselar',
			text: 'Compra {draw}. Temor 1.',
		},
		arc_rift_rupture: {
			name: 'Ruptura da Fenda',
			text: 'Causa {damage} de dano. Temor 3. Exaustão.',
		},
		cnf_censer_strike: {
			name: 'Golpe do Turíbulo',
			text: 'Causa {damage} de dano. Cura o herói com menos vida em {heal}.',
		},
		cnf_sanctuary: {
			name: 'Santuário',
			text: 'Dá {block} de bloqueio a um aliado e 1 de Proteção.',
		},
		cnf_mend: {
			name: 'Remendar',
			text: 'Cura um aliado em {heal}.',
		},
		cnf_absolve: {
			name: 'Absolvição',
			text: 'Remove todos os debuffs de um aliado. Alivia {stress} de estresse.',
		},
		cnf_litany: {
			name: 'Ladainha',
			text: 'Cada herói ganha {block} de bloqueio e alivia 1 de estresse.',
		},
		cnf_rebuke: {
			name: 'Repreensão',
			text: 'Causa {damage} de dano. Aplica 2 de Enfraquecido.',
		},
		cnf_mass_mend: {
			name: 'Remendo Coletivo',
			text: 'Cura cada herói em {heal}. Exaustão.',
		},
		cnf_steadfast_hymn: {
			name: 'Hino Firme',
			text: 'No início de cada turno, o herói com menos vida ganha {block} de bloqueio.',
		},
		cnf_rekindle: {
			name: 'Reacender',
			text: 'Um herói caído volta com 25% da vida máxima, sem ferimento. Exaustão.',
		},
		bmb_grapeshot: {
			name: 'Metralha',
			text: 'Causa {damage} de dano em cada um dos dois inimigos da frente.',
		},
		bmb_sandbags: {
			name: 'Sacos de Areia',
			text: 'Ganha {block} de bloqueio. O herói ao lado ganha {allyBlock} de bloqueio.',
		},
		bmb_shell: {
			name: 'Granada',
			text: 'Causa {damage} de dano a um inimigo na posição 2 a 4. Respingo {splash}.',
		},
		bmb_incendiary: {
			name: 'Incendiário',
			text: 'Causa {damage} de dano e aplica 3 de Queimadura no alvo e nos vizinhos.',
		},
		bmb_reload: {
			name: 'Recarregar',
			text: 'Compra 1. Seu próximo ataque do Bombardeiro neste turno causa +{bonus} de dano.',
		},
		bmb_concussion_round: {
			name: 'Projétil de Concussão',
			text: 'Causa {damage} de dano. Atordoar.',
		},
		bmb_barrage: {
			name: 'Barragem',
			text: 'Causa {damage} de dano três vezes, cada golpe em um inimigo aleatório.',
		},
		bmb_powder_keg: {
			name: 'Barril de Pólvora',
			text: 'Planta um barril. O próximo golpe nesse inimigo também atinge os vizinhos por 10.',
		},
		bmb_siege_mortar: {
			name: 'Morteiro de Cerco',
			text: 'Causa {damage} de dano em cada inimigo. Temor 2. Exaustão.',
		},
	},
};
