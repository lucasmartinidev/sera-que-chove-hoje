# Tarefa 6.0: Integração na view (useAtmosphereTheme, raiz temática, primeira dobra)

## Visão geral

Conecta tudo: cria o hook `useAtmosphereTheme` (deriva `ThemeInput` do estado do dashboard), transforma `WeatherDashboardView` na raiz temática (CSS vars injetadas via `style`, data-attributes `data-atmosphere`/`data-period`/`data-band`/`data-motion`, renderização do `AtmosphericBackground`) e reorganiza a primeira dobra para priorizar cidade → condição → temperatura com rótulo de faixa → chance de chuva, em desktop e celular. Fecha com os testes de integração da view e a garantia de não regressão dos fluxos vigentes.

Dependências: Tarefa 4.0 (atmosfera) e Tarefa 5.0 (componentes tokenizados); indiretamente 1.0–3.0.

<skills>
### Conformidade com skills

- `react` (`.agents/skills/react/SKILL.md`) — obrigatória; regras de hooks (memoização adequada, sem efeitos desnecessários), componentes e acessibilidade (ordem lógica, foco, anúncios preservados).
- `impeccable` (`.agents/skills/impeccable/SKILL.md`) — aplicável ao layout da primeira dobra, hierarquia tipográfica e responsividade (referências de layout/craft), mantendo os tokens da TechSpec.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/`. Relevantes para esta tarefa:

- `code-standards.md`: sem comentários; arquivos ≤ 100 linhas — a view provavelmente exigirá extração de subcomponentes (padrão `ApiStatus`/`WeatherResults` já existente); ≤ 3 parâmetros (`AtmosphereThemeInput` como objeto).
- `javascript-typescript.md`: sem `any`; tipos explícitos para `AtmosphereTheme`; imutabilidade.
- `folder-structure.md`: hook em `src/hooks/`; nenhum acesso a backend fora de `services/` (o hook deriva apenas do estado já fornecido por `useWeatherDashboard`).
- `tests.md`: TI com services mockados (stub de `fetch`), Given/When/Then, um conceito por teste; mocks com intenção (substituir backend, não esconder a integração tema→view).
- `AGENTS.md`: antes de concluir, executar `npm run lint`, `npm run typecheck`, `npm run build` e `npm test` em `frontend/`.
</rules>

<requirements>

- RF1 — identidade aplicada à tela como um todo, em todos os estados (inicial, carregando, sucesso, cidade não encontrada, erro, geolocalização).
- RF2 — título "Será que chove hoje?" e todos os textos em PT-BR preservados.
- RF3, RF31 — hierarquia e primeira dobra: cidade, condição (ícone + descrição), temperatura com rótulo de faixa e chance de chuva visíveis sem rolagem em 1440×900 e 390×844; demais métricas e previsão de 6 horas em seguida.
- RF5 — direção futurista sem copiar marcas/ativos de terceiros (composição com camadas e tokens próprios).
- RF8, RF27 — transição de tema de até 600 ms ao trocar de cidade, iniciada imediatamente na chegada dos dados; instantânea com movimento reduzido.
- RF10 — fundo decorativo ignorado por tecnologia assistiva (`aria-hidden` herdado do `AtmosphericBackground`).
- RF12, RF18 — atmosfera neutra sem consulta carregada; sem cor de faixa com temperatura ausente.
- RF25 — status da API e erros com cores semânticas próprias.
- RF33 — tela interativa independentemente das animações (CSS puro, sem JS por frame); nenhuma request nova.
- CA-18 — todos os comportamentos e testes existentes (busca, desambiguação, geolocalização, unidades, erros, anúncios) permanecem intactos.
</requirements>

## Subtarefas

- [ ] 6.1 Implementar `useAtmosphereTheme.ts`: recebe o estado do dashboard (weather/feedback), deriva `getConditionFamily` + `getTemperatureBand` + `isDay`, chama `resolveTheme`/`themeToCssVariables`, combina com `useReducedMotion` (`transitionMs = reduced ? 0 : THEME_TRANSITION_MS`) e devolve `{ cssVariables, attributes, backgroundProps }`; tema neutro quando não há consulta de sucesso.
- [ ] 6.2 Atualizar `WeatherDashboardView.tsx`: aplicar `style={cssVariables}` e `data-atmosphere`/`data-period`/`data-band`/`data-motion` na raiz; renderizar `AtmosphericBackground` (decorativo, atrás do conteúdo); garantir que o conteúdo fica sobre `--surface` opaca.
- [ ] 6.3 Reorganizar a primeira dobra (subcomponentes extraídos da view, se necessário): cidade → condição com ícone/descrição → temperatura com `TemperatureBandChip` → chance de chuva, responsiva em 390×844 e 1440×900; demais métricas e `HourlyForecast` abaixo.
- [ ] 6.4 Escrever os testes de integração TI-10 a TI-14 (view completa com `fetch` stubado) e atualizar os testes existentes da view (`WeatherDashboardView*.test.tsx`) sem remover cobertura vigente.
- [ ] 6.5 Rodar a suíte completa do frontend (`npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, `npm run test:coverage`) — 100% dos testes existentes passando e cobertura ≥ 80%.

## Detalhes de implementação

Ver `techspec.md`, seções "Arquitetura do sistema → Visão dos componentes" (fluxo view → hook → domínio), "Principais interfaces → hooks" (`useAtmosphereTheme`), "Modelos de dados → Comportamento por estado da interface" (tabela estado × atmosfera) e "Mecanismo de transição de tema". A tabela de data-attributes esperados pelos testes está nos resultados de TI-10 a TI-13 e E2E-10/11/15/16.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-07
- CA-10
- CA-12
- CA-13
- CA-17
- CA-18

## Testes da tarefa

### Testes de unidade

Não aplicável (os módulos puros e componentes foram cobertos nas Tarefas 1.0 a 5.0; `useAtmosphereTheme` é exercitado pelos TI abaixo).

### Testes de integração

- [ ] TI-10 — aplica a identidade de ponta a ponta após consulta de sucesso
- [ ] TI-11 — troca de cidade atualiza o tema em transição limitada
- [ ] TI-12 — mantém atmosfera neutra em erro e cidade não encontrada
- [ ] TI-13 — alterna unidades sem nova busca e sem mudar a faixa
- [ ] TI-14 — preserva os fluxos vigentes sob a nova identidade

### Testes E2E (se aplicável)

Não aplicável nesta tarefa (Tarefa 7.0).

## Arquivos relevantes

- `frontend/src/hooks/useAtmosphereTheme.ts` (novo)
- `frontend/src/views/WeatherDashboardView.tsx` (modificado — raiz temática e primeira dobra)
- `frontend/src/views/WeatherDashboardView.test.tsx`, `WeatherDashboardView.states.test.tsx`, `WeatherDashboardView.location.test.tsx` (atualizados + TI-10 a TI-14)
- `frontend/src/hooks/useAtmosphereTheme.test.ts` (novo, se necessário para cobertura do hook)
- `frontend/src/components/atmosphere/*`, `frontend/src/components/weather/*` (dependências das Tarefas 4.0/5.0)
- `frontend/vite.config.ts` (include de cobertura dos novos diretórios, se ainda não ajustado)
- `tasks/prd-identidade-futurista-reativa/techspec.md` (referência)
