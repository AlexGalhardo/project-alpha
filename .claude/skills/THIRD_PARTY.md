# Skills de terceiros

Cópia curada (só `SKILL.md` + referências, **sem** hooks, settings, agentes ou projetos de exemplo), instalada em 2026-09-27 e adaptada para o project-alpha em 2026-10-10. As skills `gd-*`, `gc-*` e `ccgs-*` têm prefixo da origem e uma nota **project-alpha** no topo dizendo como se encaixam neste projeto; em conflito valem `AGENTS.md`, `.claude/rules/` e `docs/gdd.md`.

| Prefixo | Origem | Commit | Licença | Skills |
|---|---|---|---|---|
| `gd-` | [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | `d4b0e35` | Apache-2.0 | 14: `gd-roguelike`, `gd-rpg`, `gd-procedural-gen`, `gd-save-systems`, `gd-game-ai`, `gd-ai-behavior-trees-utility-ai`, `gd-game-feel`, `gd-game-ui-ux`, `gd-input-systems`, `gd-performance-optimization`, `gd-audio-design`, `gd-prototype-fast`, `gd-create-game-assets`, `gd-steam-publish` |
| `gc-` | [PlayableIntelligence/game-creator](https://github.com/PlayableIntelligence/game-creator) | `4e64b83` | MIT | 4: `gc-game-architecture`, `gc-add-feature`, `gc-review-game`, `gc-game-qa` |
| `ccgs-` | [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) | `7ed2c3e` | MIT | 8: `ccgs-balance-check`, `ccgs-bug-report`, `ccgs-playtest-report`, `ccgs-qa-plan`, `ccgs-perf-profile`, `ccgs-scope-check`, `ccgs-release-checklist`, `ccgs-localize` |
| — | Skills oficiais do Phaser 4 para agentes de IA (Phaser Studio) | não registrado | não registrado | 25: `actions-and-utilities`, `animations`, `audio-and-sound`, `cameras`, `curves-and-paths`, `data-manager`, `events-system`, `filters-and-postfx`, `game-object-components`, `game-setup-and-config`, `geometry-and-math`, `graphics-and-shapes`, `groups-and-containers`, `input-keyboard-mouse-touch`, `loading-assets`, `particles`, `render-textures`, `scale-and-responsive`, `scenes`, `sprites-and-images`, `text-and-bitmaptext`, `tilemaps`, `time-and-timers`, `tweens`, `v4-new-features` |
| — | `agent-browser` — origem não registrada | não registrado | não registrado | 1 (`agent-browser`) |
| — | `graphify` — origem não registrada | não registrado | não registrado | 1 (`graphify`) |
| — | `grilling` / `grill-me` — origem não registrada | não registrado | não registrado | 2 (`grilling`, `grill-me`) |
| — | [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill) | `e180fc4` | MIT | 1 (`book-to-skill`, instalada em 2026-10-10; arquivo único, sem `scripts/` nem `tools/`, gera skills de um só `SKILL.md`) |
| — | [dietrichgebert/ponytail](https://github.com/dietrichgebert/ponytail) | `9b58c1f` | MIT | 6: `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help` (instaladas em 2026-10-10; só os `SKILL.md` de `skills/`, sem plugin, hooks ou comandos; texto original, sem adaptação) |
| — | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | `2c60614` | MIT | 1 (`karpathy-guidelines`, instalada em 2026-10-10; arquivo único, texto original) |

Skills próprias do projeto, sem material de terceiros copiado: `alpha-art-assets`, `alpha-audio-assets`, `aseprite-pixel-assets`, `inkscape-vector-assets` e `asset-animation`. As três últimas (2026-10-10, reescritas para o project-alpha em 2026-10-26) resumem com palavras próprias pesquisa e testes feitos com fontes do projeto anterior, não versionadas; nenhum trecho dessas fontes foi transcrito.

"Não registrado" significa que os arquivos da skill não trazem repositório, commit ou licença; preencha ao confirmar a origem, não presuma.

`karpathy-guidelines` e `caveman` são **obrigatórias no início de toda sessão** (`AGENTS.md`); `ponytail` é opcional. `ponytail-help` cita atualização por plugin e configuração por variável de ambiente que não valem aqui: a cópia é local e não se atualiza sozinha.

Ajustes locais:

- `gd-*`: nota de projeto e, onde o conteúdo original não se aplica a um roguelite de cartas com combate por turnos, uma linha **Escopo aqui** (`gd-roguelike`, `gd-rpg`, `gd-game-ai`, `gd-input-systems`, `gd-audio-design`, `gd-steam-publish`, `gd-create-game-assets`). O corpo não foi reescrito; referências cruzadas a skills do repositório de origem que não estão instaladas (`physics-tuning`, `level-design`, `camera-systems`, `shader-programming`, `itch-publish`, `phaser-core`, engines) permanecem e devem ser ignoradas.
- `gc-*`: comandos `npm`/`npx` trocados por `bun`/`bunx`; removidos o widget de placar e a hospedagem instantânea de terceiros, a etapa de monetização do review e os atalhos para skills do game-creator que não estão instaladas.
- `ccgs-*`: removidas a injeção de config via `yaml-helper.sh` e a permissão de Bash para ele; removidas as referências a documentos do CCGS que não existem aqui (`.claude/docs/automation-modes.md`, `config-resolution.md`, `director-gates.md`, `technical-preferences.md`, `workflow-modes.md`, `effects-map.md`, `code-root-resolution.md`) — no lugar, "siga `AGENTS.md`"; pastas `design/` e `production/` mapeadas na nota de projeto. `ccgs-release-checklist` sem itens de console; `ccgs-localize` sem os modos de VO e RTL (idiomas: EN e PT-BR); `ccgs-balance-check` usa o simulador headless (`bun run sim`).

Não instaladas (fora do stack): Unity, Unreal, Godot, Roblox, Three.js, Bevy, Pygame, LÖVE, gêneros não relacionados, e o restante do CCGS (sprints/épicos/agentes de estúdio). Para trazer outra: copie a pasta, aplique o mesmo prefixo/nota e registre aqui.

## Skills geradas localmente

Geradas em 2026-10-10 com `book-to-skill` a partir dos PDFs na raiz (arquivo único `SKILL.md`; resumos sintetizados, uso privado — não publicar):

| Skill | Fonte | Guia didático |
|---|---|---|
| `pixel-logic` | *Pixel Logic*, Michael Azzi (ed. 2022) — `pixel-logic.pdf` | `docs/books/pixel-logic.md` |
| `art-of-game-design` | *The Art of Game Design: A Book of Lenses*, Jesse Schell (1ª ed.) — `art-of-game-design.pdf` | `docs/books/art-of-game-design.md` |

## Skills do projeto

Escritas para o project-alpha em 2026-10-10 (arquivo único `SKILL.md`, em inglês):

| Skill | Para quê | Documento de apoio |
|---|---|---|
| `alpha-art-assets` | Criar, regenerar, animar ou trocar qualquer asset visual: placeholders SVG na Alpha, pixel art via MCP `pixellab` da Beta em diante; specs, paleta, chaves, gates de aprovação e checklist de limpeza | `docs/art-bible.md` (a definir), skill `pixel-logic` |
| `alpha-audio-assets` | Criar ou trocar música e efeitos (sem voz) pela API da ElevenLabs; lista de faixas e efeitos, chaves, loop, loudness, formatos e gate de orçamento | `docs/sdd/audio.md` (a definir), skill `audio-and-sound` |

## Removidas em 2026-10-10

Vindas do projeto anterior e sem uso em um roguelite de cartas com combate por turnos em fileira:

| Skill | Motivo |
|---|---|
| `physics-arcade` | O jogo não tem física em tempo real; o combate é por turnos, sem física em tempo real. |
| `physics-matter` | Idem: sem simulação física. |
| `gd-physics-tuning` | Ajuste de timestep/colisão não se aplica a combate por turnos. |
| `gd-shader-programming` | Sem shaders customizados no escopo; efeitos usam as skills oficiais de filtros do Phaser 4. |
| `gd-phaser-core` | Redundante com as skills oficiais do Phaser 4. |
| `gd-camera-systems` | Câmera fixa; o pouco que há é coberto pela skill oficial `cameras`. |
| `gd-level-design` | Voltada a fases de ação em tempo real; as cenas de combate são definidas em `src/data`. |
| `gd-itch-publish` | Publicação no itch.io não está no plano. |
| `gc-phaser` | Escrita para Phaser 3; substituída pelas skills oficiais do Phaser 4. |
| `gc-game-designer` | Design visual genérico de jogos arcade; a direção de arte está no GDD e em `alpha-art-assets`. |
| `gc-design-game` | Comando de polimento visual do pipeline game-creator; não se aplica a este fluxo. |
| `gc-qa-game` | Comando-atalho do game-creator; a referência `gc-game-qa` foi mantida. |
| `gc-improve-game` | Comando-atalho do game-creator; use `gc-review-game` e `gc-add-feature`. |
| `gc-game-deploy` | Deploy próprio do game-creator; o projeto define seu próprio build. |
| `gc-monetize-game` | O jogo não tem monetização. |
| `ccgs-launch-checklist` | Sobreposta a `ccgs-release-checklist`; lançamento comercial está fora do escopo atual. |
| `canvas-design` | Gera pôsteres/arte estática em PNG/PDF; não é pipeline de asset do jogo. |
| `find-skills` | Utilitário de descoberta de skills, sem relação com o projeto. |
| `pinguin-art-assets` | Pipeline de arte do projeto anterior; substituída por `alpha-art-assets`. |
| `pinguin-audio-assets` | Pipeline de áudio do projeto anterior; substituída por `alpha-audio-assets`. |
