# Regras de engenharia

## Camadas

- `src/core/` é lógica pura e determinística. Proibido importar `phaser`, `src/scenes`, `src/view`, usar DOM, `Math.random`, `Date`, `performance.now` ou temporizadores.
- `src/scenes/` e `src/view/` apresentam: consomem eventos do núcleo e animam. Nunca decidem regra de jogo.
- Toda aleatoriedade vem do RNG com seed injetado. Mesma seed + mesmos comandos = mesmo estado.
- Número de balanceamento vive em `src/data/`. Número mágico em lógica é defeito.
- Texto exibido ao jogador vive em `src/i18n/`, em EN e PT-BR. String de jogador em código é defeito.

## TypeScript

- Sem `any`. Tipo desconhecido usa `unknown` com narrowing.
- Tipo de retorno explícito em toda função exportada.
- Sem `@ts-ignore` e sem `@ts-expect-error` para "passar".
- Estado do núcleo é tratado como imutável: comando devolve novo estado.

## Testes

- Lógica em `src/core/`: teste primeiro, implementação depois.
- Bug corrigido ganha teste que o reproduz.
- Teste instável nunca é reexecutado até passar: corrige-se a causa (quase sempre determinismo).
- Nunca desativar, pular ou afrouxar um teste para o CI passar.
- Antes de declarar pronto: rodar o comando do assert e `bun run ci`, e ler o resultado.
- Testes rápidos (unit, integração) durante o desenvolvimento; simulação de balanceamento, e2e e QA humano só no fim de cada fase.

## Dependências e ferramentas

- Bun para tudo (`bun`, `bunx`). Node/npm só quando uma ferramenta exigir, com registro em `docs/adrs/`.
- Dependência nova exige aprovação do desenvolvedor.
- Versão estável exata no `package.json`: sem `^`, `~`, `latest`, `next`, `rc`, `beta`, `alpha`.
- Phaser 4: consultar a skill oficial do assunto antes de usar uma API. Não aplicar padrões do Phaser 3.

## Código

- Comentário só para o porquê, caso de borda não óbvio ou workaround com motivo.
- Corrigir a causa raiz. Nunca engolir exceção.
- Formatação e lint pelo Biome; markdown pelo markdownlint. Não discutir estilo à mão.

## Segredos

- `.env` nunca é lido para exibição, impresso, registrado em log nem versionado.
- Chave de API só em scripts de `scripts/`, nunca no bundle do jogo.
