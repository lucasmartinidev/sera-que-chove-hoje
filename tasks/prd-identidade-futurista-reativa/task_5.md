# Tarefa 5.0: Componentes de clima tokenizados (chip de faixa, card atual, previsão horária, status)

## Visão geral

Aplica a identidade aos componentes de conteúdo: cria o `TemperatureBandChip` (rótulo textual da faixa com cor de acento — a cor nunca é o único canal), tokeniza `CurrentWeatherCard` (superfície opaca, chip junto à temperatura, bloco de chuva sobre `--surface-raised` sem cor própria), `HourlyForecast` (mesma escala por hora, com rótulo de faixa) e `StatusMessage`/`ApiStatus` (cores semânticas de status distintas das cores de dados).

Dependência: Tarefa 2.0 (tokens e `resolveTheme`). Independente das Tarefas 3.0 e 4.0.

<skills>
### Conformidade com skills

- `react` (`.agents/skills/react/SKILL.md`) — obrigatória; seguir regras de componentes, props tipadas e acessibilidade (rótulos, `aria`, contraste de foco).
- `impeccable` (`.agents/skills/impeccable/SKILL.md`) — aplicável à hierarquia visual e ao polish dos componentes (RF3), mantendo os tokens da TechSpec.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/`. Relevantes para esta tarefa:

- `code-standards.md`: sem comentários; arquivos ≤ 100 linhas (extrair subcomponentes dos cards se necessário); funções ≤ 30 linhas; constantes nomeadas para textos/limiares.
- `javascript-typescript.md`: sem `any`; props tipadas; sem ternários aninhados (usar guarda/cláusulas para `band === null`).
- `tests.md`: TU validam comportamento visível (texto do rótulo, ausência de chip com temperatura nula) e atributos acessíveis — sem acoplamento a classes de estilo; mocks apenas para services externos.
- `folder-structure.md`: componentes em `src/components/weather/`, testes junto ao código.
- Ao final: `npm run lint`, `npm run typecheck` e `npm test` em `frontend/`; os testes existentes dos componentes modificados devem continuar passando (textos e comportamentos vigentes preservados — CA-18).
</rules>

<requirements>

- RF3 — hierarquia priorizando cidade, condição, temperatura e probabilidade de chuva.
- RF4 — conteúdo sobre superfície opaca tokenizada (`--surface`), com contraste estável.
- RF16 — rótulo textual da faixa exibido junto à temperatura (chip com fundo `--band-accent` e texto `--band-contrast-text`).
- RF18 — temperatura ausente: nenhum chip/cor de faixa; comunicação textual de indisponibilidade preservada.
- RF20 — previsão de seis horas usa a mesma escala, com identificação visual e rótulo de faixa coerentes por hora.
- RF25 — `ApiStatus` e mensagens de erro usam exclusivamente `--status-*`; bloco de chuva sem cor própria (usa `--surface-raised` + foreground), eliminando ambiguidade com status e faixas.
- RF19 (suporte a CA-10) — chip/acentos derivados sempre de `temperatureC`, independentemente da unidade exibida.
</requirements>

## Subtarefas

- [x] 5.1 Implementar `TemperatureBandChip.tsx`: recebe `band: TemperatureBand | null`; com faixa, renderiza o rótulo PT-BR em chip (fundo accent, texto `--band-contrast-text`); sem faixa, não renderiza chip colorido.
- [x] 5.2 Atualizar `CurrentWeatherCard.tsx`: superfície opaca tokenizada; temperatura em `--band-accent`; `TemperatureBandChip` ao lado da temperatura; bloco "Chance de chuva" migrado do âmbar fixo para `--surface-raised` + foreground; rótulos e textos PT-BR vigentes preservados; `temperatureC: null` mantém placeholder `'—'`/indisponibilidade sem cor de faixa.
- [x] 5.3 Atualizar `HourlyForecast.tsx`: temperatura de cada hora com acento da mesma escala (faixa derivada de `temperatureC` da hora) e rótulo de faixa exposto por hora (visível ou `sr-only` + `aria-label` "HH:MM — N °C, Faixa").
- [x] 5.4 Atualizar `StatusMessage.tsx` e o `ApiStatus` (em `WeatherDashboardView.tsx`): erros com `--status-error`, indicadores `checking/online/offline` com `--status-warn/ok/error`; nenhum outro componente usa tokens de status.
- [x] 5.5 Escrever os testes TU-59 a TU-62 e atualizar os testes existentes dos componentes modificados sem alterar seus comportamentos cobertos.
- [x] 5.6 Rodar `npm run lint`, `npm run typecheck` e `npm test` em `frontend/`.

## Detalhes de implementação

Ver `techspec.md`, seções "Principais interfaces" (contrato de `TemperatureBandChipProps` e regras de consumo dos tokens: accent somente sobre `--surface`; raised somente com foreground/muted), "Modelos de dados → `TemperatureBand`" (rótulos exatos) e "→ Tokens fixos de texto e semânticos" (regra RF25). A conversão de exibição °F continua em `lib/units.ts` — os componentes nunca recalculam faixa a partir do valor convertido.

## Critérios de aceitação relacionados

- CA-04
- CA-09
- CA-10
- CA-12
- CA-17

## Testes da tarefa

### Testes de unidade

- [x] TU-59 — exibe o rótulo textual da faixa junto à temperatura
- [x] TU-60 — comunica temperatura indisponível sem cor de faixa
- [x] TU-61 — aplica a mesma escala na previsão de seis horas
- [x] TU-62 — não altera a faixa ao trocar a unidade exibida

### Testes de integração (se aplicável)

Não aplicável (cobertos por TI-10 a TI-14 na Tarefa 6.0).

### Testes E2E (se aplicável)

Não aplicável nesta tarefa (E2E-09, E2E-11, E2E-15 na Tarefa 7.0).

## Arquivos relevantes

- `frontend/src/components/weather/TemperatureBandChip.tsx` (novo)
- `frontend/src/components/weather/TemperatureBandChip.test.tsx` (novo)
- `frontend/src/components/weather/CurrentWeatherCard.tsx` (+ `.test.tsx`, modificado)
- `frontend/src/components/weather/HourlyForecast.tsx` (+ `.test.tsx`, modificado)
- `frontend/src/components/weather/StatusMessage.tsx` (+ `.test.tsx`, modificado)
- `frontend/src/views/WeatherDashboardView.tsx` (apenas `ApiStatus`; integração completa na Tarefa 6.0)
- `frontend/src/test/weather-fixtures.ts` (estendido — fixtures de faixas/famílias)
- `frontend/src/lib/theme-tokens.ts`, `frontend/src/lib/temperature-scale.ts` (dependências)
- `tasks/prd-identidade-futurista-reativa/techspec.md` (referência)
