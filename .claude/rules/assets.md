# Regras de assets

## Visual

- Pixel art segue a skill `pixel-logic`, `docs/books/pixel-logic.md` e `docs/art-bible.md` (resolução base, escala, paleta, contorno, animação).
- Escala sempre inteira (`pixelArt: true`, `roundPixels: true`). Sem escala fracionária, sem mixels, sem antialias na borda externa.
- Placeholder (SVG ou retângulo) usa as **mesmas dimensões e chaves** da arte final. Trocar placeholder por sprite nunca toca em lógica.
- Paleta-mestra compartilhada definida na Art Bible; sem preto puro.
- A silhueta identifica herói e inimigo. Aliado e inimigo nunca se distinguem só por cor.
- Saída de gerador (PixelLab ou outro) é rascunho: limpeza manual e revisão em 1× sobre o fundo real antes de entrar no jogo.

## Áudio

- Só efeitos e música, via ElevenLabs. Sem dublagem.
- Loops sem emenda audível; volume normalizado; `ogg` principal, `mp3` de fallback.
- O jogo funciona com áudio bloqueado ou ausente (política de autoplay do navegador).

## Geração

- **Portão de custo**: antes de qualquer geração em lote (PixelLab ou ElevenLabs), apresentar lista e estimativa ao desenvolvedor e aguardar aprovação.
- Toda geração é registrada (prompt, parâmetros, data, custo) em `art-src/`.
- Scripts de geração são idempotentes: não regeram o que já existe.

## Organização

- Chaves: `hero.<class>.<pose>`, `enemy.<id>.<pose>`, `card.<id>`, `icon.<kind>.<id>`, `ui.<id>`, `bg.<act>.<id>`, `vfx.<id>`, `music.<id>`, `sfx.<category>.<id>`.
- Arquivos do jogo em `public/assets/`; fontes e logs em `art-src/`.
- `references/` é material de terceiros, só local: nunca copiar, recortar, rastrear (trace) ou embarcar.
