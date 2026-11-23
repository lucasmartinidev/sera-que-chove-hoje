# Tarefa 7.0: Testes E2E da identidade (specs Playwright e fixtures)

## Visão geral

Valida a identidade em navegador real com Playwright: aplicação do tema por condição/período/faixa, primeira dobra em desktop e celular, movimento reduzido e cores forçadas via `page.emulateMedia`, ausência de requisições externas, transição de até 600 ms sem bloqueio de interação, alternância de unidades sem mudar a faixa e acessibilidade de teclado. Reutiliza a infraestrutura existente (`weather-dashboard.helpers.ts`, backend na porta 3001, rotas mockadas por fixtures).

Dependência: Tarefa 6.0 (interface integrada).

<skills>
### Conformidade com skills

- `react` (`.agents/skills/react/SKILL.md`) — aplicável apenas se algum ajuste de componente for exigido por falha de E2E.
- `impeccable` (`.agents/skills/impeccable/SKILL.md`) — aplicável a correções visuais motivadas por falhas de E2E (primeira dobra, contraste percebido).
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/`. Relevantes para esta tarefa:

- `tests.md`: E2E em `e2e/` na raiz, fora de `frontend/` e `backend/`; Playwright preferencial; poucos E2E para fluxos críticos — não substituir TU/TI; testes independentes e repetíveis (fixtures locais, sem rede real); nomes descrevendo requisito e resultado.
- `folder-structure.md`: specs `*.spec.ts` e fixtures em `e2e/`.
- `code-standards.md` / `javascript-typescript.md`: sem comentários, sem `any`, constantes nomeadas (portas, limites de duração).
- Ao final: `npm test` e `npm run typecheck` em `e2e/`; suíte existente E2E-01 a E2E-08 continua passando (CA-18).
</rules>

<requirements>

- RF8, RF33 (CA-07) — transição concluída em ≤ 600 ms e interação imediata durante ela.
- RF10, RF30 (CA-13) — fundo ignorado por tecnologia assistiva; foco visível e ordem de Tab preservadas.
- RF11 (CA-17) — zero requisições do navegador além da API local.
- RF12, RF18 (CA-12) — atmosfera neutra em falhas e dados ausentes.
- RF13, RF14, RF16, RF19, RF20 (CA-03, CA-04, CA-10) — mesma temperatura → mesma faixa; rótulo textual; unidades não alteram a faixa.
- RF26–RF29 (CA-05, CA-14) — movimento reduzido com alternativa estática; cores forçadas com fundo suprimido.
- RF31 (CA-01, CA-14, CA-19) — primeira dobra em 1440×900 e 390×844.
</requirements>

## Subtarefas

- [ ] 7.1 Criar fixtures em `e2e/fixtures/`: `weather-thunder-night.json` (trovoada, `isDay: false`), `weather-clear-day.json` (céu limpo diurno) e `weather-null-temperature.json` (`temperatureC: null`), coerentes com o contrato vigente de `GET /api/weather`.
- [ ] 7.2 Criar `e2e/futuristic-identity.spec.ts` com E2E-09, E2E-10, E2E-11, E2E-13, E2E-14, E2E-15, E2E-16 e E2E-18, reutilizando `mockApi`/`searchCity` de `weather-dashboard.helpers.ts`.
- [ ] 7.3 Criar `e2e/futuristic-identity.motion.spec.ts` com E2E-12 (`emulateMedia reducedMotion`) e E2E-17 (`emulateMedia forcedColors`).
- [ ] 7.4 Rodar a suíte E2E completa (`npm test` em `e2e/`): E2E-01 a E2E-08 existentes + novos, todos passando.
- [ ] 7.5 Rodar `npm run typecheck` em `e2e/`.

## Detalhes de implementação

Ver `techspec.md`, seção "Abordagem de testes → Testes E2E" (tabela com resultados esperados exatos por caso, incluindo data-attributes `data-atmosphere`/`data-period`/`data-band` e medições de `transition-duration`/computed styles) e "Pré-requisitos de infraestrutura de teste" (fixtures). A configuração do Playwright (`e2e/playwright.config.ts`) não muda; os novos specs usam o projeto `chromium` existente.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-05
- CA-07
- CA-10
- CA-12
- CA-13
- CA-14
- CA-17
- CA-18
- CA-19 (parcial — primeira dobra sem rolagem; leitura em 3 s por participantes é validada na Tarefa 8.0)

## Testes da tarefa

### Testes de unidade (se aplicável)

Não aplicável.

### Testes de integração (se aplicável)

Não aplicável.

### Testes E2E

- [ ] E2E-09 — exibe a informação principal na primeira dobra em desktop e celular
- [ ] E2E-10 — representa a condição e o período da cidade consultada
- [ ] E2E-11 — aplica a mesma faixa para a mesma temperatura em cidades diferentes
- [ ] E2E-12 — respeita movimento reduzido com alternativa estática
- [ ] E2E-13 — não faz requisições externas além da API local
- [ ] E2E-14 — conclui a transição de tema em até 600 ms sem bloquear interação
- [ ] E2E-15 — alterna unidades mantendo a faixa de cor
- [ ] E2E-16 — mantém atmosfera neutra e cores de status distintas em falhas
- [ ] E2E-17 — permanece legível em cores forçadas do sistema
- [ ] E2E-18 — preserva acessibilidade de teclado e leitor de tela

## Arquivos relevantes

- `e2e/futuristic-identity.spec.ts` (novo)
- `e2e/futuristic-identity.motion.spec.ts` (novo)
- `e2e/fixtures/weather-thunder-night.json` (novo)
- `e2e/fixtures/weather-clear-day.json` (novo)
- `e2e/fixtures/weather-null-temperature.json` (novo)
- `e2e/weather-dashboard.helpers.ts` (reutilizado; estender se necessário)
- `e2e/weather-dashboard.spec.ts`, `e2e/weather-dashboard.location.spec.ts` (regressão — sem mudança esperada)
- `tasks/prd-identidade-futurista-reativa/techspec.md` (referência)
