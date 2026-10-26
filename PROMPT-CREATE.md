<papel>
Você é um game director e desenvolvedor de jogos sênior, com 30 anos de experiência e mais de 1000 horas em Darkest Dungeon 1 e 2 e Slay the Spire 1 e 2. 

Você pensa como diretor (visão, pilares, diversão, escopo) e executa como engenheiro (arquitetura, testes, automação). 

Seja direto, técnico e honesto: aponte riscos, escopo excessivo e decisões ruins, e não apenas concorde comigo.
</papel>

<objetivo>
Arquitetar e planejar todo o início de um novo jogo, até o PLAN.md final. Nesta sessão você NÃO implementa o jogo. Você produz pesquisa, brainstorming, GDD, Art Bible, SDD, ADRs, a estrutura de documentação para agentes e o PLAN.md.
</objetivo>

<projeto>
- Nome do jogo: sugira opções no brainstorming (nome provisório do repositório: project-alpha).
- Gênero: roguelite + deckbuilding + mecânicas de RPG (árvore de habilidades, status dos personagens, equipamentos, raridade de itens, inimigos elite etc.).
- Tema: Dark Fantasy, muito inspirado em Warhammer 40k, DOOM The Dark Ages e nas franquias Alien e Predator.
- Estilo artístico: PIXEL ART.
- Engine: Phaser v4 (https://phaser.io/).
- Inspirações principais:
  - Darkest Dungeon: https://store.steampowered.com/app/262060/Darkest_Dungeon/
  - Darkest Dungeon II: https://store.steampowered.com/app/1940340/Darkest_Dungeon_II/
  - Slay the Spire: https://store.steampowered.com/app/646570/Slay_the_Spire/
  - Slay the Spire 2: https://store.steampowered.com/app/2868840/Slay_the_Spire_2/
- Plataformas: foco apenas na WEB agora. Desktop/Steam (ElectronJS) e Android (CapacitorJS) só no final da fase BETA.
- Remote Git: https://github.com/AlexGalhardo/project-alpha.git
- Deploy inicial (fase protótipo): alpha.lekzera.xyz (GitHub Actions → Vercel).
</projeto>

<como_trabalhar>
1. Execute as tarefas na ordem, de 1 a 5. Antes de começar cada uma, crie uma lista de tarefas e marque os itens conforme avançar.
2. Ao terminar cada tarefa, PARE e me mostre um resumo curto (máx. 10 linhas) com os arquivos criados. Só avance quando eu aprovar. Exceção: a tarefa 2 é interativa (veja abaixo).
3. Não invente dados. Se algo não puder ser verificado, marque como "não verificado". Sempre que citar uma fonte, inclua a URL.
4. Se uma instrução minha for ambígua ou conflitar com outra, faça no máximo 3 perguntas objetivas antes de prosseguir. Se for algo pequeno, escolha o padrão mais sensato e registre a decisão em docs/adrs/.
5. Documentação escrita para agentes de IA: específica, técnica, didática, com exemplos e sem floreio. Prefira listas, tabelas e valores concretos (px, hex, ms, números) a descrições vagas.
6. Tudo em português do Brasil, exceto nomes de arquivos, código e termos técnicos consagrados.
</como_trabalhar>

<setup_inicial>
Antes da tarefa 1, configure o repositório. Faça commit e push do setup como o primeiro grupo de tarefas.

Ferramentas e padrões:
- Gerenciador/runtime: Bun 1.4.4 como ferramenta principal. Para checar typos e erros, use as ferramentas da última release do Bun/Biome que existirem de fato. Verifique antes qual comando existe e documente o que escolheu.
- TypeScript formatado e lintado com Biome v2.
- Markdown formatado com markdownlint.
- Changelog no padrão Keep a Changelog.
- Commits no padrão Conventional Commits.
- SemVer: 0.0.1 no alpha → 0.1.0 no beta → 1.0.0 na versão stable.
- Cada push gera 1 release no GitHub com o changelog das mudanças. O padrão de qualidade das releases deve ser exatamente o de https://github.com/AlexGalhardo/vukem/releases (analise esse repositório e replique o formato).
- CI/CD com GitHub Actions → deploy web na Vercel.

Arquivos de agente:
- AGENTS.md: no máximo ~50 linhas, com introdução curta do projeto, melhores práticas, workflow e links para as subdocumentações (docs/, skills, rules). CLAUDE.md apenas referencia @AGENTS.md.
- Destaque obrigatório no AGENTS.md:
  - skills/pixel-logic/ e docs/books/pixel-logic.md → criação de assets visuais em pixel art.
  - skills/art-of-game-design/ e docs/books/art-of-game-design.md → princípios de bom game design ao desenvolver.
- .claude/skills/: crie, atualize, refatore ou delete skills sempre que julgar necessário durante o projeto.
- .claude/rules/: crie regras para os agentes seguirem durante o desenvolvimento.

Paralelização de trabalho: crie 3 worktres/agentes de trabalho paralelo e deixe eles standby sem nunca encerrar eles. Vai delegando trabalhos paralelos para eles irem fazendo, enquanto você trabalha na sessão principal.
	- Nunca fique ocioso e nunca deixe um agente paralelo ocioso.
	- Lembre-se de usar os modelos corretos do claude para cada agente:
		- 1 agente usando claude opus 5.5 -> revisões gerais para verificar e auditar o que foi feito;
		- 1 agente usando claude sonnet 5.5 -> implementação técnica de código geral;
		- 1 agente usando claude haiku 5.5 -> i8n, escrever documentações, textos, testes, balanceamentos, simulações pontuais, etc.

Estratégia de commit/push: faça microcommits a cada microtarefa terminada e push para main ao final de cada grupo de tarefas concluído, e cada push gera uma release (regra acima).
</setup_inicial>

<tarefas>

<tarefa id="1" nome="Pesquisa na web">
Pesquise e documente:
- Aspectos técnicos desse estilo de jogo: câmera, visual, áudio, UI, UX, categoria, jogabilidade, loop de combate, progressão, economia, balanceamento e o que mais for útil para o jogo ter qualidade e ser divertido.
- Skills, plugins, rules e exemplos de prompts úteis para o desenvolvimento deste jogo.
- Imagens de referência dos 4 jogos, salvas em references/<nome_do_jogo>/images/ (mínimo de 20 por jogo). Elas servem de referência para criar os assets visuais, UI/HUD e interfaces. Priorize imagens in-game (combate, mapa, deck, inventário, menus, HUD). Se o ambiente não permitir download, gere references/<nome_do_jogo>/images.md com as URLs e uma descrição do que cada uma mostra, e me avise. Adicione references/ ao .gitignore (material de terceiros, só para uso local).
- Referências que eu já tenho (leia todas antes de pesquisar):
  - references/chatgpt/ (minhas conversas com o ChatGPT)
  - references/concept-arts/ e references/wireframes/ (imagens que eu gerei)
  - https://github.com/AlexGalhardo/zeta-c (outro jogo meu, em fase avançada, para entender minha estrutura de projeto)

Entrega: docs/web-research.md, com resumo executivo no topo, seções por tema e fontes com URL.
Critério de aceite: cada afirmação relevante tem fonte, e há uma seção "O que isso significa para o nosso jogo".
</tarefa>

<tarefa id="2" nome="Brainstorming (interativo)">
Use a skill de brainstorming. Conduza o brainstorming comigo usando a ferramenta de perguntas interativas (AskUserQuestion), com UMA pergunta por vez, opções de múltipla escolha e sem enviar texto no chat entre as perguntas. As respostas servem como checklist de ideias, sugestões, implementações técnicas e mecânicas.

Cubra no mínimo: pilares do jogo, fantasia do jogador, classes/personagens, estrutura da run, mapa, combate, cartas e deckbuilding, árvore de habilidades, equipamentos e raridades, elites e chefes, metaprogressão roguelite, narrativa e tom, direção de arte, áudio, UI/UX, escopo do protótipo/alpha/beta e opções de nome do jogo.

Seja crítico: se uma ideia aumentar muito o escopo, ofereça uma versão menor.
Entrega: docs/brainstorming.md com todas as decisões tomadas, ideias descartadas e questões em aberto.
</tarefa>

<tarefa id="3" nome="GDD e Art Bible">
Crie docs/gdd.md e docs/art-bible.md, o "coração e alma" do jogo. Devem ser específicos, técnicos e didáticos o bastante para um agente de IA sem contexto continuar evoluindo o jogo.

Cobrir:
- Mecânicas roguelite, loop de gameplay, evolução dos personagens e personagens.
- Estilo de câmera, visual, assets, UI/UX, HUD e interfaces.
- Estrutura de menus, UIs, HUDs, interfaces e ícones.
- Sons: músicas, SFX, VFX.
- Princípios e heurísticas de diversão.
- Design system.
- Especificações de pixel art: resolução base, escala, grid, margens, padding, tamanhos de sprite, paleta de cores (hex), regras de contorno, sombreamento e animação (frames, fps).

Critério de aceite: nenhum "TBD" sem um dono e uma data, e todo número de design (HP, dano, custo etc.) tem uma tabela ou uma fórmula.
</tarefa>

<tarefa id="4" nome="SDD e ADRs">
- docs/sdd/*.md: specs de desenvolvimento (spec driven development), uma por sistema (combate, cartas, mapa, save, UI etc.), com requisitos, critérios de aceite, casos de borda e estratégia de testes.
- docs/adrs/*.md: decisões de arquitetura e estrutura, com contexto, decisão, alternativas e consequências.
- Referência de formato: https://github.com/AlexGalhardo/agentic-personal-finances/tree/main/docs/specs
- Se você julgar necessário, crie documentações adicionais na pasta docs/ nessa etapa também.
</tarefa>

<tarefa id="5" nome="PLAN.md">
Crie o PLAN.md na raiz. É o arquivo mais importante do projeto: o principal documento de onboarding para futuras sessões e agentes retomarem o trabalho. Deve ser específico, didático, técnico e assertivo.

Estrutura:
- 5 fases: ESTRUTURA → PROTÓTIPO → ALPHA → BETA → 1.0 RC.
	- Já na fase protótipo -> crie a game feature de "AUTO BATTLE" e "GAME SPEED" de 2x e 3x -> coloque essas opções no settings/pause do jogo e na UI do jogo também, para agilizar os testes do desenvolvedor depois.
	- Ainda na fase protótipo -> crie os assets visuais e sonoros do jogo já
		- Os assets visuais foque apenas nos 10 primeiros rounds, com 10 inimigos diferentes (apenas assets estaticos, sem nenhuma animação), os 5 heróis, e o primeiro chefão do round 10
		- Crie alguns assets de VFX de combate também
		- Crie alguns assets de itens, de ui, menu, HUD, etc
		- Crie os assets sonoros
		- Me de um orçamento estimado de quanto vai ficar +/- esses assets do prototipo
		- Eu quero ter uma noção de como será o jogo, antes de decidir se vai valer continuar o desenvolvimento ou não
- Início da fase ESTRUTURA: revisar todas as skills, rules, workflows, releases e documentação para garantir que estão coerentes e atualizados com o contexto do projeto.
- Cada fase dividida em grupos de tarefas → subtarefas → microtarefas, com checklists [ ] e asserts de entrega e qualidade.
- Testes rápidos durante o desenvolvimento. Testes grandes (simulações de balanceamento, e2e, Q.A humano) apenas no final de cada fase.
- Desktop (ElectronJS) e mobile Android (CapacitorJS) apenas no final da fase BETA.
- Push para main apenas ao final de cada grupo de tarefas.
- Um "Status atual" no topo (fase, grupo atual, próximo passo) para retomada rápida.

Plano de qualidade a incluir:
- Testes: unitários, integração, smoke, e2e e um script de "Q.A humano profissional" que testa todos os botões, mecânicas, tipos de erro, edge cases e fallbacks. Ferramentas: Playwright, agent-browser e outras que você julgar necessárias.
- Simulações de gameplay e balanceamento variando dificuldade, HP e ataque dos inimigos, velocidade de gameplay etc.
</tarefa>

</tarefas>

<formato_de_resposta>
No chat, seja conciso: o que foi feito, onde estão os arquivos, decisões que dependem de mim e o próximo passo. O conteúdo longo vai nos arquivos, não no chat.
</formato_de_resposta>

<comece_agora>
Comece pelo setup inicial e pela tarefa 1. Não peça confirmação para começar. Se algo bloquear (acesso, ferramenta ausente), diga o que falta e prossiga com o que for possível.
</comece_agora>