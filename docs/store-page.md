# Store page draft (itch.io, later Steam)

Draft for the store listing. Not published. The title is provisional: "Ossuary" has not passed the trademark and domain checks (Q-NAME-CHECK, B39). Do not publish until those checks are done. Ratings and content descriptors below are a draft; the official rating questionnaire has not been filled in (not verified).

## Titles

- Working title: Ossuary
- Fallbacks if the name check fails: Blightwake, Ferrum Requiem, Ironvigil (from the name check in `docs/brainstorming.md`).

## Short description

**EN:** A dark roguelite deckbuilder. Lead three condemned heroes down into the Rift. Cards decide what happens. Ranks decide who acts and who is hit.

**PT-BR:** Um roguelite de construção de baralho sombrio. Leve três heróis condenados para dentro da Fenda. As cartas decidem o que acontece. As posições decidem quem age e quem é atingido.

## Long description

**EN:**

Ossuary is a dark roguelite deckbuilder with RPG progression, in pixel art. The Order that kept the cathedral above the Rift is gone. You command three condemned heroes on a descent through the wound beneath it, in three acts, to the Iron Sepulchre where the Rift was first sealed and where it is born again.

Every fight is a turn-based battle on a board of ranks. Your heroes stand in three ranks; the enemies in four. Each card can only be played from certain ranks and aims at certain targets. Every enemy shows its next action before you decide, and hits always land. There is no dice roll and no hidden chance. Stress builds in each hero and, when it fills, costs you energy. When a hero falls, the party loses a rank and the others pay for it.

Between fights you choose: a route through rounds of combat, rest, shops, camps, events and treasure. Gold buys cards and equipment. Each run banks Embers, which open new cards and options for the next run through the Legacy screen. Harder difficulty tiers, the Rites, unlock one at a time.

**PT-BR:**

Ossuary é um roguelite de construção de baralho sombrio, com progressão de RPG, em pixel art. A Ordem que guardava a catedral sobre a Fenda desapareceu. Você comanda três heróis condenados numa descida pela ferida que está embaixo dela, em três atos, até o Sepulcro de Ferro, onde a Fenda foi selada pela primeira vez e onde nasce de novo.

Cada luta é uma batalha por turnos num tabuleiro de posições. Seus heróis ficam em três posições; os inimigos, em quatro. Cada carta só pode ser jogada de certas posições e mira certos alvos. Todo inimigo mostra a próxima ação antes de você decidir, e os golpes sempre acertam. Não há dado nem chance escondida. O estresse cresce em cada herói e, quando enche, custa energia. Quando um herói cai, o grupo perde uma posição e os outros pagam por isso.

Entre as lutas você escolhe o caminho: uma rota de rodadas com combate, descanso, lojas, acampamentos, eventos e tesouros. O ouro compra cartas e equipamentos. Cada run deposita Brasas, que abrem novas cartas e opções na próxima run pela Tela de Legado. Níveis de dificuldade mais altos, os Ritos, são desbloqueados um de cada vez.

## Feature bullets

### English

- Turn-based battles on a rank board: where a card is played from matters.
- Guaranteed hits and visible enemy intents. Every card shows its result before you confirm.
- Three acts, a final boss with three phases, and events, shops, camps and treasure on the route.
- Stress and collapse: heroes who carry too much cost the party energy.
- Permanent progression that adds options, not raw power (the Legacy skill tree).
- Auto battle and 1x, 2x, 3x speed for long runs.
- Pixel art and a Portuguese (PT-BR) and English interface.

### Português (PT-BR)

- Batalhas por turnos num tabuleiro de posições: de onde a carta é jogada importa.
- Golpes garantidos e intenções dos inimigos à vista. Toda carta mostra o resultado antes da confirmação.
- Três atos, um chefe final com três fases, e eventos, lojas, acampamentos e tesouros na rota.
- Estresse e colapso: heróis que carregam demais custam energia ao grupo.
- Progressão permanente que dá opções, não poder bruto (a árvore de habilidades do Legado).
- Batalha automática e velocidade 1x, 2x, 3x para runs longas.
- Pixel art e interface em português (PT-BR) e inglês.

## Screenshot captions (5)

Captions in EN and PT-BR. Capture from the build with `bunx playwright test tests/e2e/screens.spec.ts`, which writes scene captures to `test-results/screens/` (not committed).

1. **EN:** Choose three heroes and set their ranks before the descent. **PT-BR:** Escolha três heróis e defina as posições antes da descida.
2. **EN:** Each card shows its exact result before you play it. **PT-BR:** Cada carta mostra o resultado exato antes de ser jogada.
3. **EN:** Enemy intents are visible before the player's turn ends. **PT-BR:** As intenções dos inimigos ficam visíveis antes do fim do seu turno.
4. **EN:** The route: fights, rests, shops, events and treasure. **PT-BR:** A rota: lutas, descansos, lojas, eventos e tesouros.
5. **EN:** The Legacy screen turns banked Embers into options for the next run. **PT-BR:** A Tela de Legado transforma Brasas acumuladas em opções para a próxima run.

## Content descriptors (draft)

Draft for the rating questionnaire. Not submitted; check the store's current categories before filling in.

- Violence: fantasy violence, suggested rather than graphic. Heroes fall and enemies are destroyed. No gore on screen is the intent (not verified by review).
- Blood: no gore. Damage numbers and red hit feedback are the intent (not verified by review).
- Language: no strong language in the game text (intent; not reviewed by a human).
- Sexual content: none.
- Drugs and alcohol: none.
- Gambling: none. There are no purchases of random items.
- Religious imagery: the setting is a fallen cathedral order. Religious symbols are used as fiction, not as endorsement of any real faith.
- Online features: none.

## Platforms

- Web (current build, alpha.lekzera.xyz).
- Windows desktop: an exe is attached to GitHub releases from v0.0.6 (Electron, not store-signed).
- Android: APK build exists in the repo (Capacitor); it is not attached to the current release.
- Steam and itch.io: not yet published. Steam build depends on the Beta plan (GDD §2).

## Open items before publishing

- Name check (Q-NAME-CHECK) and the domain.
- Content rating questionnaire.
- Final screenshots from the released build, not the test captures.
- Human read of the PT-BR text.
