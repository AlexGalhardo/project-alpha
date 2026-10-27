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
		creditsFonts: 'Fonte: Roboto (SIL OFL 1.1) · Motor: Phaser 4',
		creditsArt: 'Pixel art: gerada com PixelLab, depois limpa e editada para o jogo.',
		creditsAudio: 'Efeitos sonoros e música: gerados com ElevenLabs.',
		tapToBegin: 'Toque para começar',
		version: 'Versão {version}',
		legacy: 'Legado',
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
		textScale: 'Tamanho do texto',
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
		noFrontWarning:
			'Ninguém segura a linha de frente: os inimigos golpeiam primeiro o herói na posição 1.',
		veteran: 'Início veterano',
		rite: 'Rito {n}',
		riteNone: 'Sem Rito',
		riteLocked: 'Vença o Rito {n} para desbloquear',
	},
	hud: {
		chooseTarget: 'Toque em um alvo destacado.',
		tapAgain: 'Toque na carta de novo para jogá-la.',
		round: 'Rodada {round}/10',
		act: 'Ato {act}',
		turn: 'Turno {turn}',
		enraged: 'Enfurecidos: inimigos +1 de Força por turno',
		enrageIn: 'Inimigos enfurecem em {n}',
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
		event: 'Evento',
		treasure: 'Tesouro',
	},
	camp: {
		rank: 'Posição {rank}',
		swapFor: 'Trocar por {hero}',
		title: 'Acampamento',
		swapHero: 'Trocar um herói',
		swapHint:
			'O herói selecionado sai com todas as suas cartas; o novo entra com vida cheia e suas 4 cartas iniciais.',
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
		skipConfirm: 'Toque de novo ou Esc para pular a carta.',
		equipment: 'Equipamento: {item}',
		take: 'Pegar',
		title: 'Recompensa',
		pickCard: 'Escolha uma carta',
		skip: 'Pular',
		gold: '+{gold} de ouro',
	},
	sanctum: {
		title: 'Santuário',
		text: 'Os ferimentos foram curados. Escolha uma bênção.',
		heal: 'Repouso',
		healText: 'Todo herói volta à vida máxima.',
		remove: 'Expurgo',
		removeText: 'Remova {count} cartas à sua escolha do baralho.',
		upgrade: 'Têmpera',
		upgradeText: 'Aprimore {count} cartas à sua escolha.',
		gold: 'Dízimo',
		goldText: '+{gold} de ouro (você ficará com {total}).',
		pickRemove: 'Expurgo: escolha a carta {n} de {count}',
		pickUpgrade: 'Têmpera: escolha a carta {n} de {count}',
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
		riteWon: 'Rito {n} conquistado. Rito {next} desbloqueado.',
		firstRite: 'Primeira vitória: Rito 1 desbloqueado.',
		party: 'O grupo',
		hero: '{name}: {hp}/{max} de vida · {stress} de estresse',
		injured: 'ferido',
		fellTo: 'Caiu diante de: {enemies}',
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
		enraged: {
			name: 'Enfurecido',
			tooltip: 'A partir do turno {turn}, todo inimigo ganha +1 de Força a cada turno.',
		},
		might: {
			name: 'Força',
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
			name: 'Empurrão',
			tooltip: 'Move o inimigo alvo para trás o número indicado de posições.',
		},
		pull: {
			name: 'Puxão',
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
			identity: 'Respingo, golpes na retaguarda, atordoa.',
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
		vault_warden: {
			name: 'Guardião da Câmara',
			lore: 'Ainda guarda uma porta aberta há muito tempo.',
		},
		bone_lancer: {
			name: 'Lanceiro de Osso',
			lore: 'A lança é uma costela. Lembra de quem era.',
		},
		censer_wraith: {
			name: 'Espectro do Turíbulo',
			lore: 'Fumaça de um turíbulo que ninguém acendeu.',
		},
		flesh_organ: {
			name: 'Órgão de Carne',
			lore: 'Um órgão de tubos cultivado do coro. Ainda toca.',
		},
		gutter_crawler: {
			name: 'Rastejante da Sarjeta',
			lore: 'Pequeno, rápido, faminto pelo que a chuva arrasta.',
		},
		relic_thief: {
			name: 'Ladrão de Relíquias',
			lore: 'Leva as relíquias primeiro e as mãos depois.',
		},
		mirror_saint: {
			name: 'Santo do Espelho',
			lore: 'Um santo de vidro polido. Mostra o seu próprio rosto, tarde demais.',
		},
		hollow_bishop: {
			name: 'Bispo Oco',
			lore: 'Prega de uma mitra vazia e espera que você escute.',
		},
		chain_golem: {
			name: 'Golem de Correntes',
			lore: 'Forjado das correntes do rebanho do Penitente. Não tem boca para rezar.',
		},
		rot_cherub: {
			name: 'Querubim Podre',
			lore: 'Forma de criança com asas de mofo.',
		},
		iron_mourner: {
			name: 'Carpideiro de Ferro',
			lore: 'Bate um sino de ferro num funeral que nunca termina.',
		},
		grave_cur: {
			name: 'Cão de Cova',
			lore: 'Ainda escava atrás dos ossos com que foi enterrado.',
		},
		ash_cantor: {
			name: 'Cantor de Cinza',
			lore: 'Canta os nomes dos queimados, devagar, e esquece um a cada vez.',
		},
		bronze_scribe: {
			name: 'Escriba de Bronze',
			lore: 'Escreve cada herói em bronze e marca os que não vão durar.',
		},
		hollow_choir: {
			name: 'Coro Oco',
			lore: 'Quarenta vozes, uma garganta, e nenhuma delas viva.',
		},
		sepulchre_knight: {
			name: 'Cavaleiro do Sepulcro',
			lore: 'Guarda o túmulo de ferro atrás de uma parede de placas que nunca cai.',
		},
		wax_saint: {
			name: 'Santo de Cera',
			lore: 'Um santo derretido devagar para que a Fenda vestisse seu rosto.',
		},
		chain_wraith: {
			name: 'Espectro de Correntes',
			lore: 'As correntes com que foi preso ainda estão apertando.',
		},
		marrow_butcher: {
			name: 'Açougueiro de Medula',
			lore: 'Trabalha os ossos atrás da medula e nunca levanta os olhos.',
		},
		rift_spawn: {
			name: 'Cria da Fenda',
			lore: 'Pequena, faminta, nascida da ferida.',
		},
		rift_mother: {
			name: 'A Mãe da Fenda',
			lore: 'A própria ferida, com corpo.',
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
			phase2: 'O SINO RACHA',
			epilogue:
				'O sino para. A Fenda não.\nO grupo sobe de volta a escada, menor do que era.\nLá embaixo, algo responde ao silêncio.',
		},
		gilded_penitent: {
			name: 'Penitente Dourado',
			phase2: 'O OURO SE PARTE',
			epilogue:
				'O ouro se solta em lâminas. Por baixo, a mesma madeira de antes.\nO grupo não leva nada da capela.\nA Fenda guarda o resto.',
		},
		rift_mother: {
			name: 'A Mãe da Fenda',
			phase2: 'O VÉU RASGA',
			phase3: 'O SEPULCRO SE ABRE',
			epilogue:
				'A Fenda se fecha por dentro, como uma ferida que não tem mais o que comer.\nO sepulcro cala. A Ordem sela as portas de ferro e grava nelas os nomes do grupo, um sob o outro, até não restar espaço.\nNa catedral, o sino toca uma vez. Ninguém está na torre para tocá-lo.',
		},
	},
	item: {
		eq_notched_blade: {
			name: 'Lâmina Entalhada',
			effect: 'Os ataques do dono causam +1 de dano por golpe.',
		},
		eq_heavy_pavise: {
			name: 'Pavês Pesado',
			effect: 'O bloqueio do dono aumenta em 2.',
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
			effect: 'Uma vez por turno, se um herói tiver 7 ou mais de estresse, o grupo ganha 1 de energia.',
		},
	},
	equip: {
		weapon: 'Arma (vazia)',
		relic: 'Relíquia (vazia)',
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
	event: {
		ev_weeping_font: {
			title: 'A Fonte que Chora',
			text: 'Uma pia de pedra fica na nave. A água escorre pelo rosto dela sem parar.\nA água é fria e tem gosto de sal. Alguém deixou frascos vazios ao lado.\nO grupo pode beber, encher os frascos ou seguir em frente.',
			choice1: 'Beber: cada herói cura {heal}% da vida máxima e ganha {stress} de estresse.',
			choice2: 'Encher os frascos: ganhar {gold} de ouro.',
			choice3: 'Sair.',
		},
		ev_ossuary_shrine: {
			title: 'Santuário do Ossário',
			text: 'Ossos empilhados formam um santuário, cada um com um nome riscado.\nUm sino votivo pende acima, em silêncio. Há uma bandeja de moedas na base.\nUm osso solto fica na frente. Ninguém o reivindicou.',
			choice1: 'Oferecer {gold} de ouro: cada herói perde {relief} de estresse.',
			choice2:
				'Pegar um osso: ganhar uma relíquia comum aleatória; o primeiro herói ganha {stress} de estresse.',
			choice3: 'Sair.',
		},
		ev_chained_penitent: {
			title: 'O Penitente Acorrentado',
			text: 'Um homem ajoelha com os pulsos presos ao chão. Ele não levanta a cabeça.\nPede para ser libertado. Diz que já pagou por isso.\nA corrente é de bom ferro. Poderia ser levada.',
			choice1:
				'Libertá-lo: o primeiro herói perde {cost} de vida; escolher 1 de 3 cartas incomuns.',
			choice2: 'Pegar a corrente dele: aprimorar uma carta aleatória.',
			choice3: 'Sair.',
		},
		ev_forgotten_armory: {
			title: 'Armaria Esquecida',
			text: 'Uma porta atrás do altar abre para prateleiras de equipamento antigo, com ferrugem em cada lâmina.\nAlgo se move na escuridão entre as prateleiras.\nUma boa peça pode ainda estar sob a poeira. Algo mais também pode.',
			choice1:
				'Vasculhar: ganhar um equipamento comum; o herói com menos vida perde {cost} de vida.',
			choice2: 'Sair.',
		},
		ev_whispering_choir: {
			title: 'Coro Sussurrante',
			text: 'Vozes zumbem nas paredes de uma capela vazia. Cantam um hino sem palavras.\nAs palavras estão na sua cabeça, e são suas.\nO coro oferece levar uma lembrança do seu baralho.',
			choice1:
				'Ouvir: remover uma carta (você escolhe); cada herói ganha {stress} de estresse.',
			choice2: 'Sair.',
		},
		ev_ember_pilgrim: {
			title: 'Peregrino da Brasa',
			text: 'Um peregrino senta junto a um fogo de brasas que nunca se apagam.\nCaminhou muito e quer descansar.\nTroca o fogo por ouro ou divide-o de graça.',
			choice1: 'Trocar: pagar {gold} de ouro; aprimorar duas cartas (você escolhe).',
			choice2: 'Dividir o fogo: cada herói cura {heal} de vida.',
			choice3: 'Sair.',
		},
		ev_drowned_reliquary: {
			title: 'O Relicário Afogado',
			text: 'Um relicário jaz no fundo de uma cripta alagada. O vidro mostra uma mão, pressionada por dentro.\nA água é negra e muito fria. Uma corrente desce do teto da cúpula até ele.\nAlgo na ponta da corrente puxa, devagar, como se quisesse companhia.',
			choice1:
				'Mergulhar: o primeiro herói perde {cost} de vida e ganha um equipamento comum.',
			choice2:
				'Puxar a corrente: o herói com menos vida perde {cost} de vida; ganhar {gold} de ouro.',
			choice3: 'Sair.',
		},
		ev_bone_cartographer: {
			title: 'O Cartógrafo de Ossos',
			text: 'Um homem senta numa tenda costurada de pele pálida, desenhando mapas sobre osso.\nOs mapas mostram a Fenda como era, e as estradas como serão.\nEle não pede que você compre. Apenas oferece.',
			choice1: 'Comprar um mapa: pagar {gold} de ouro; escolher 1 de 3 cartas incomuns.',
			choice2: 'Vender uma página: remover 1 carta (você escolhe) e ganhar {gold} de ouro.',
			choice3: 'Sair.',
		},
		ev_ashen_vigil: {
			title: 'Vigília de Cinza',
			text: 'Uma fila de carpideiras senta em volta de um fogo de cinza, vigiando ninguém.\nO fogo não aquece. Apenas mostra o que cada um carrega.\nDuas delas se levantam e oferecem um lugar junto às brasas.',
			choice1:
				'Vigiar: o primeiro herói ganha {stress} de estresse; cada herói cura {heal}% da vida máxima.',
			choice2:
				'Dormir junto às cinzas: cada herói cura {heal} de vida e ganha {stress} de estresse.',
			choice3: 'Sair.',
		},
		ev_flagellant_procession: {
			title: 'Procissão dos Flagelantes',
			text: 'Penitentes andam pela nave com as costas nuas, cantando uma nota só.\nNão olham para você. Pedem que caminhe com eles, sem prometer nada.\nNão se sabe se saem da capela ou trazem algo para dentro.',
			choice1:
				'Caminhar com eles: cada herói ganha {stress} de estresse; aprimorar 2 cartas (você escolhe).',
			choice2: 'Dar esmolas: pagar {gold} de ouro; cada herói perde {relief} de estresse.',
			choice3: 'Sair.',
		},
		ev_gravewright: {
			title: 'O Gravador de Túmulos',
			text: 'Um artesão talha nomes em lajes que não têm túmulo debaixo.\nSua bancada tem uma bandeja de pequenas relíquias, ainda mornas.\nPergunta o que você quer enterrar e o que prefere guardar.',
			choice1:
				'Enterrar uma lembrança: o herói com menos vida perde {cost} de vida; remover 1 carta (você escolhe).',
			choice2: 'Comprar uma relíquia: pagar {gold} de ouro e ganhar a relíquia comum.',
			choice3: 'Sair.',
		},
		ev_sealed_grille: {
			title: 'Grade Selada',
			text: 'Uma grade selada com cera e barras de ferro fecha um nicho na parede.\nAtrás dela, algo respira devagar e diz o nome do primeiro herói.\nOferece uma confissão ou uma escuta, e não pede mais nada.',
			choice1: 'Confessar: o primeiro herói perde {relief} de estresse e {cost} de vida.',
			choice2:
				'Escutar na grade: aprimorar 2 cartas aleatórias (visíveis); cada herói ganha {stress} de estresse.',
			choice3: 'Sair.',
		},
	},
	treasure: {
		title: 'Tesouro',
		text: 'Um baú relicário repousa sob a poeira. A fechadura está quebrada.\nDentro: {gold} de ouro e uma peça de equipamento.',
		claim: 'Pegar o tesouro',
	},
	legacy: {
		title: 'Legado',
		embers: 'Brasas: {count}',
		node: {
			unlockCard: 'Desbloquear {card}',
			veteran: 'Início veterano: começa com {card}',
		},
		buy: 'Comprar',
		owned: 'Adquirido',
		locked: 'Bloqueado',
	},
	act: {
		transition: 'A descida continua. Ato {act}.',
		3: {
			name: 'O Sepulcro de Ferro',
		},
	},
	rite: {
		'1': 'Elites têm 20% mais vida.',
		'2': 'Inimigos comuns causam 7,5% mais dano.',
		'3': 'Comece a corrida com 30 de ouro.',
		'4': 'O chefe tem 20% mais vida.',
		'5': 'Recuperar no descanso cura 20%, não 30%.',
		'6': 'Heróis começam a corrida com 2 de estresse.',
		'7': 'Preços da loja e do acampamento sobem 15%.',
		'8': 'Todo inimigo começa o combate com 1 de Força.',
		'9': 'Ferimento custa 35% da vida máxima.',
		'10': 'A fase 2 do chefe ganha uma quarta intenção.',
	},
	intent: {
		ambush: 'Ataca de emboscada um herói da retaguarda.',
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
		kindle: 'Alimenta o fogo: todos os inimigos ganham Força.',
		lunge: 'Avança sobre o herói da frente.',
		lure: 'Atrai um herói da retaguarda e o marca.',
		mutter: 'Murmura, corroendo os nervos do herói da frente.',
		peal: 'O sino repica: atinge todos os heróis.',
		raise_shield: 'Ergue um escudo e ganha bloqueio.',
		rake: 'Retalha os heróis da retaguarda, duas vezes.',
		rend: 'Dilacera o herói da frente e deixa Sangramento.',
		resonance: 'O sino ressoa: ganha bloqueio e Força.',
		shove: 'Empurra um herói e troca os dois da frente.',
		shriek: 'Grita: todos os heróis ficam estressados e enfraquecidos.',
		swallow: 'Engole o herói mais estressado.',
		toll: 'O sino toca: todos os heróis ganham estresse.',
		shield_bash: 'Golpeia o herói da frente com o escudo.',
		brace: 'Firma-se atrás do escudo e ganha bloqueio.',
		pierce: 'Perfura os dois primeiros heróis.',
		withdraw: 'Recua para as fileiras de trás.',
		choke: 'Sufoca o herói mais fraco.',
		smoke: 'Enche a sala de fumaça: todos os heróis ficam enfraquecidos.',
		hymn: 'Entoa um hino: todos os inimigos ganham Força.',
		drone: 'Zumbe sem parar: todos os heróis ganham estresse.',
		gnaw: 'Rói o herói da frente, duas vezes.',
		cut: 'Corta um herói por trás e deixa Sangramento.',
		vanish: 'Escorrega para a escuridão e ganha bloqueio.',
		reflect: 'Reflete golpes e ganha bloqueio.',
		glare: 'Encara os heróis de trás e marca um.',
		smite: 'Golpeia o herói marcado.',
		sermon: 'Prega para o herói mais estressado.',
		rebuke: 'Repreende o herói da frente.',
		wind_up: 'Prepara o golpe. Algo pesado vem aí.',
		chain_sweep: 'Varre correntes sobre os dois primeiros heróis.',
		spit: 'Cospe podridão no herói mais fraco e deixa Sangramento.',
		hover: 'Paira e ganha bloqueio.',
		lash: 'Açoita o herói da frente.',
		confession: 'Força uma confissão: todos os heróis ganham estresse.',
		gild: 'Recobre-se de ouro: ganha bloqueio e Força.',
		scourge: 'Açoita todos os heróis.',
		toll_hammer: 'Balança um martelo de sino contra o herói da frente.',
		snap: 'Dá botes no herói da frente, duas vezes.',
		lament: 'Lamenta pelo herói mais estressado.',
		ember: 'Lança uma brasa contra os heróis de trás.',
		mark_the_name: 'Marca o herói da frente pelo nome.',
		etch: 'Grava o herói marcado na pedra.',
		seal: 'Sela: todos os inimigos ganham Proteção.',
		hush: 'Cala todos os heróis até enfraquecerem.',
		execution: 'Executa o herói da frente.',
		iron_wall: 'Ergue uma muralha de ferro e ganha bloqueio.',
		mend_wax: 'Remenda o corpo de cera e se cura.',
		drag: 'Arrasta os heróis da frente e troca os dois primeiros.',
		frenzy: 'Entra em frenesi e ganha Força.',
		embrace: 'Envolve o herói da frente.',
		wail: 'Geme: todos os heróis ganham estresse.',
		coil: 'Enrola-se e ganha bloqueio.',
		rend_the_veil: 'Rasga o véu: todos os heróis sofrem dano.',
		devour: 'Devora o herói mais estressado.',
		unmaking: 'Desfaz: todos os heróis sofrem dano e ganham estresse.',
		heartbeat: 'Batimento: cura a si mesma e ganha bloqueio.',
		devour_weakest: 'Devora o herói com menos vida.',
		choir_dirge: 'Entoa um réquiem: todos os heróis ganham estresse.',
		cur_rend: 'Rasga o herói com menos vida e deixa Sangramento.',
		chain_lash: 'Açoita os dois primeiros heróis com suas correntes.',
		wraith_fade: 'Recua para a última posição e ganha bloqueio.',
		wax_drip: 'Pinga cera escaldante no herói com menos vida; a queimadura sangra.',
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
			name: 'Postura',
			text: 'Ganha {block} de bloqueio. Exaustão.',
		},
		shb_shove: {
			name: 'Empurrão',
			text: 'Causa {damage} de dano. Empurrão 1.',
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
			name: 'Virote',
			text: 'Causa {damage} de dano ao alvo e ao inimigo atrás dele.',
		},
		mrk_quick_draw: {
			name: 'Saque Rápido',
			text: 'Causa {damage} de dano. Compra 1.',
		},
		mrk_pinning_shot: {
			name: 'Imobilização',
			text: 'Causa {damage} de dano. Aplica 2 de Enfraquecido.',
		},
		mrk_volley: {
			name: 'Rajada',
			text: 'Causa {damage} de dano duas vezes em cada inimigo.',
		},
		mrk_hunters_focus: {
			name: 'Foco do Caçador',
			text: 'Primeiro ataque do turno contra um inimigo Marcado causa +{bonus} de dano.',
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
			name: 'Centelha',
			text: 'Causa {damage} de dano em cada inimigo. Temor 1.',
		},
		arc_burn_hex: {
			name: 'Feitiço',
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
			name: 'Tempestade',
			text: 'Causa {damage} de dano em cada inimigo. Temor 2.',
		},
		arc_unseal: {
			name: 'Romper Selo',
			text: 'Compra {draw}. Temor 1.',
		},
		arc_rift_rupture: {
			name: 'Ruptura',
			text: 'Causa {damage} de dano. Temor 3. Exaustão.',
		},
		cnf_censer_strike: {
			name: 'Turíbulo',
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
			text: 'Remove todos os efeitos negativos de um aliado. Alivia {stress} de estresse.',
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
			text: 'No início do turno, o herói mais fraco ganha {block} de bloqueio.',
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
			text: 'Causa {damage} de dano na posição 2 a 4. Respingo {splash}.',
		},
		bmb_incendiary: {
			name: 'Incendiário',
			text: 'Causa {damage} de dano. Aplica 3 de Queimadura no alvo e vizinhos.',
		},
		bmb_reload: {
			name: 'Recarregar',
			text: 'Compra 1. Próximo ataque do Bombardeiro neste turno causa +{bonus} de dano.',
		},
		bmb_concussion_round: {
			name: 'Concussão',
			text: 'Causa {damage} de dano. Aplica Atordoado.',
		},
		bmb_barrage: {
			name: 'Barragem',
			text: 'Causa {damage} de dano três vezes, cada golpe em um inimigo aleatório.',
		},
		bmb_powder_keg: {
			name: 'Barril',
			text: 'Planta um barril. O próximo golpe nele atinge os vizinhos por 10.',
		},
		bmb_siege_mortar: {
			name: 'Morteiro',
			text: 'Causa {damage} de dano em cada inimigo. Temor 2. Exaustão.',
		},
		shb_rampart: {
			name: 'Muralha',
			text: 'Dá {block} de bloqueio a cada herói.',
		},
		shb_riposte: {
			name: 'Revide',
			text: 'Causa dano igual à metade do seu bloqueio, mais {damage}.',
		},
		mrk_ricochet: {
			name: 'Ricochete',
			text: 'Causa {damage} de dano duas vezes a inimigos aleatórios.',
		},
		mrk_deadeye: {
			name: 'Olho Certeiro',
			text: 'Marca cada inimigo {stacks} vezes.',
		},
		arc_cinder_ward: {
			name: 'Guarda de Brasa',
			text: 'Dá {block} de bloqueio a um aliado. {stacks} de Queimadura na frente.',
		},
		arc_inferno: {
			name: 'Inferno',
			text: 'Causa {damage} de dano três vezes em cada inimigo. Temor 3. Exaustão.',
		},
		cnf_penance: {
			name: 'Penitência',
			text: 'Causa {damage} de dano. O dono perde {stress} de estresse.',
		},
		cnf_last_rites: {
			name: 'Últimos Ritos',
			text: 'Cura o herói com menos vida em {heal}. Exaustão.',
		},
		bmb_shrapnel: {
			name: 'Estilhaços',
			text: 'Causa {damage} de dano a cada inimigo.',
		},
		bmb_flashbang: {
			name: 'Granada de Luz',
			text: 'Causa {damage} de dano e aplica {stacks} de Enfraquecido a cada inimigo.',
		},
	},
};
