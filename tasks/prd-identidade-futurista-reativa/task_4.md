# Tarefa 4.0: Fundo atmosférico e base CSS (camadas decorativas, keyframes, reduced-motion, forced-colors)

## Visão geral

Constrói o mundo visual futurista: o componente decorativo `AtmosphericBackground` e suas camadas (céu com crossfade, glow de faixa, partículas de chuva/neve, flash de trovoada, estrelas), além da base CSS — keyframes, fallbacks de CSS vars no `:root`, regras globais de `prefers-reduced-motion` e `forced-colors` — e das cores tokenizadas no `tailwind.config.js`. Todo o fundo é CSS puro (gradientes + `transform`/`opacity`), sem novas dependências e sem requests externas.

Dependências: Tarefa 2.0 (tokens hex) e Tarefa 3.0 (`useReducedMotion` não é usado aqui diretamente, mas o mock de `matchMedia` e os contratos de movimento são).

<skills>
### Conformidade com skills

- `react` (`.agents/skills/react/SKILL.md`) — obrigatória; componentes pequenos e props tipadas, sem estado desnecessário.
- `impeccable` (`.agents/skills/impeccable/SKILL.md`) — aplicável à composição visual das camadas, animação (referência `animate`) e cor (referência `colorize`); respeitar as constantes e tokens da TechSpec sem reinventar paletas.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/`. Relevantes para esta tarefa:

- `code-standards.md`: sem comentários; arquivos ≤ 100 linhas (uma camada por arquivo); ≤ 3 parâmetros (props agrupadas em objetos — `AtmosphericBackgroundProps`); constantes nomeadas para ciclos e densidades (`THUNDER_FLASH_CYCLE_MS`, `PARTICLE_DENSITY`, `SMALL_SCREEN_MAX_WIDTH_PX` etc. — nada de valores mágicos em keyframes/JSX).
- `javascript-typescript.md`: sem `any`; props tipadas; listas de partículas geradas de forma imutável.
- `folder-structure.md`: subpasta própria `src/components/atmosphere/` para componentes coesos da tela; testes junto ao código.
- `tests.md`: TU validam comportamento visível e atributos de acessibilidade (`aria-hidden`, ausência de focáveis, camadas por família), sem acoplamento a classes de estilo.
- Ao final: `npm run lint`, `npm run typecheck` e `npm test` em `frontend/`.
</rules>

<requirements>

- RF6, RF7 — céu e camadas refletem a família de condição e diferenciam dia/noite pelos tokens de `resolveTheme`.
- RF8 — crossfade de duas camadas de céu com duração máxima de `THEME_TRANSITION_MS` (600 ms), sem cortes abruptos e sem bloquear interação (CSS puro).
- RF9 — nenhuma cintilação > 3/s: flash de trovoada em ciclo de 8 s (~0,12 flash/s), estrelas com ciclo ≥ 6 s, nenhuma keyframe com ciclo < 1000 ms.
- RF10 — fundo 100% decorativo: `aria-hidden="true"`, `pointer-events-none`, nenhum texto ou elemento focável.
- RF11 — zero novas requisições de rede, provedores ou assets externos; apenas CSS/divs.
- RF24 — elementos decorativos (glow, partículas, estrelas) isentos de contraste, sem reduzir legibilidade (ficam atrás da superfície opaca).
- RF26, RF27 — `@media (prefers-reduced-motion: reduce)` desativa todas as animações contínuas mantendo composição estática equivalente; com `motion.reduced`, `transitionMs = 0`.
- RF29 — `@media (forced-colors: active)` oculta o fundo (`display: none`).
- RF30 — animação não impede rolagem, foco nem seleção de texto (`pointer-events-none` + apenas compositor).
- RF32 — densidade de partículas reduzida em telas < 640 px via CSS (PARTICLE_DENSITY.small).
</requirements>

## Subtarefas

- [ ] 4.1 Implementar `AtmosphericBackground.tsx`: contêiner fixo (`inset-0`, `-z-10` ou equivalente), `aria-hidden="true"`, `pointer-events-none`, orquestrando as camadas segundo a família/período recebidos por props.
- [ ] 4.2 Implementar `SkyLayer.tsx`: gradiente `top → bottom` com crossfade entre o gradiente anterior e o novo (duas camadas sobrepostas, transição de `opacity` em `transitionMs`).
- [ ] 4.3 Implementar `BandGlowLayer.tsx`: brilho radial com `bandDeep` em baixa opacidade; ausente quando `bandDeep` é `null`.
- [ ] 4.4 Implementar `ParticleLayer.tsx`: partículas de chuva (faixas em translação, ciclo `RAIN_FALL_CYCLE_MS`) e neve (deriva, ciclo `SNOW_FALL_CYCLE_MS`), com `PARTICLE_DENSITY.desktop` e redução para `.small` via media query CSS.
- [ ] 4.5 Implementar `ThunderLayer.tsx`: flash com ciclo `THUNDER_FLASH_CYCLE_MS` (8 s), opacidade máx. 0,5; renderizado somente para `thunderstorm`.
- [ ] 4.6 Implementar `StarField.tsx`: estrelas para `clear` noturno com cintilação de ciclo `STAR_SHIMMER_CYCLE_MS`.
- [ ] 4.7 Atualizar `index.css`: fallbacks das CSS vars no `:root` (idênticos aos tokens neutros), `@keyframes` da atmosfera (ciclos ≥ 1000 ms), bloco global `prefers-reduced-motion: reduce` (animações zeradas, composição estática) e bloco `forced-colors: active` (fundo suprimido).
- [ ] 4.8 Atualizar `tailwind.config.js`: cores tokenizadas (`surface`, `surface-foreground`, `surface-muted`, `surface-raised`, `band`, `sky`, `status-*`, `focus-ring`) mapeando as CSS vars.
- [ ] 4.9 Escrever os testes TU-56, TU-57 e TU-58.
- [ ] 4.10 Rodar `npm run lint`, `npm run typecheck` e `npm test` em `frontend/`.

## Detalhes de implementação

Ver `techspec.md`, seções "Principais interfaces" (contrato de `AtmosphericBackgroundProps`), "Modelos de dados → Tokens de céu" e "→ Constantes nomeadas de movimento e transição" (valores e regra global de ciclos), "Mecanismo de transição de tema" (crossfade) e "Preferências do sistema" (media queries). As camadas recebem tokens prontos via props — nunca importam dados meteorológicos nem chamam services.

## Critérios de aceitação relacionados

- CA-02
- CA-05
- CA-06
- CA-13
- CA-14

## Testes da tarefa

### Testes de unidade

- [ ] TU-56 — renderiza o fundo como decorativo e inerte
- [ ] TU-57 — desativa movimento quando reduced motion está ativo
- [ ] TU-58 — limita o flash de trovoada ao ciclo seguro

### Testes de integração (se aplicável)

Não aplicável (a composição com a view é coberta por TI-10 a TI-14 na Tarefa 6.0).

### Testes E2E (se aplicável)

Não aplicável nesta tarefa (E2E-12 e E2E-17, na Tarefa 7.0, validam reduced-motion e forced-colors em navegador real).

## Arquivos relevantes

- `frontend/src/components/atmosphere/AtmosphericBackground.tsx` (novo)
- `frontend/src/components/atmosphere/SkyLayer.tsx` (novo)
- `frontend/src/components/atmosphere/BandGlowLayer.tsx` (novo)
- `frontend/src/components/atmosphere/ParticleLayer.tsx` (novo)
- `frontend/src/components/atmosphere/ThunderLayer.tsx` (novo)
- `frontend/src/components/atmosphere/StarField.tsx` (novo)
- `frontend/src/components/atmosphere/AtmosphericBackground.test.tsx` (novo — TU-56 a TU-58)
- `frontend/src/index.css` (modificado)
- `frontend/tailwind.config.js` (modificado)
- `frontend/src/lib/theme-tokens.ts`, `frontend/src/hooks/useReducedMotion.ts` (dependências)
- `tasks/prd-identidade-futurista-reativa/techspec.md` (referência)
