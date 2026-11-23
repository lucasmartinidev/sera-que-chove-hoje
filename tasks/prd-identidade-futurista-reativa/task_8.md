# Tarefa 8.0: Não regressão, casos manuais de QA e fechamento

## Visão geral

Fecha a entrega: executa as suítes completas dos três aplicativos (frontend, backend e e2e) comprovando a não regressão (CA-18), aplica ajustes finos de design com a skill `impeccable` (modo Operate) atualizando o surface brief, e registra os casos que só podem ser validados manualmente na fase de QA (zoom 200%, leitura em 3 s, p95 de ponta a ponta, tons de cinza/daltonismo), com evidências.

Dependências: Tarefas 1.0 a 7.0 concluídas.

<skills>
### Conformidade com skills

- `react` (`.agents/skills/react/SKILL.md`) — obrigatória para qualquer ajuste de código frontend realizado nesta tarefa.
- `impeccable` (`.agents/skills/impeccable/SKILL.md`) — aplicável ao polish final da identidade (modo Operate): atualização do surface brief `.impeccable/surfaces/frontend-src-views-weatherdashboardview-tsx.md` com as decisões implementadas (paletas, tipografia de sistema, composição do fundo), conforme a TechSpec.
- `executar-qa` (`.agents/skills/executar-qa/SKILL.md`) — aplicável à validação manual com evidências dos casos não automatizáveis listados abaixo.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/`. Relevantes para esta tarefa:

- `AGENTS.md`: antes de concluir alterações no frontend, executar `npm run lint`, `npm run typecheck`, `npm run build` e `npm test` em `frontend/`; no backend, `npm run build` e `npm test`; preservar a separação `frontend/`/`backend/`.
- `tests.md`: cobertura mínima de 80% respeitada nos dois aplicativos; alteração só é concluída com testes passando e cenários críticos protegidos.
- `code-standards.md` / `javascript-typescript.md`: aplicáveis a qualquer ajuste fino de código; sem novos números mágicos (ajustes de hex passam por `theme-tokens.ts` e pela auditoria TU-50).
</rules>

<requirements>

- CA-18 — 100% dos testes existentes de frontend, backend e E2E continuam passando; comportamentos de busca, desambiguação, geolocalização, unidades, erros e anúncios intactos.
- RF22–RF24 — qualquer ajuste de hex durante o polish rerodado obrigatoriamente contra a matriz de contraste (TU-50).
- RF33 / objetivo de desempenho — bundle sem crescimento relevante; interatividade independente das animações.
- Restrição "Qualidade verificável" do PRD — matriz completa auditada (automatizada) + casos manuais documentados com evidências.
</requirements>

## Subtarefas

- [ ] 8.1 Rodar a suíte completa do frontend: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` (cobertura ≥ 80%); registrar o tamanho do bundle produzido.
- [ ] 8.2 Rodar `npm run build` e `npm test` no backend (sem alterações de código esperadas — apenas comprovação de não regressão).
- [ ] 8.3 Rodar `npm test` e `npm run typecheck` em `e2e/` (suíte completa: E2E-01 a E2E-18).
- [ ] 8.4 Executar o polish final com `impeccable` (Operate) e atualizar o surface brief com as decisões visuais implementadas; rerodar TU-50 e a suíte do frontend se qualquer token mudar.
- [ ] 8.5 Registrar o plano de QA manual (para a skill `executar-qa`), com evidências: CA-15 (zoom de navegador 200% sem corte/sobreposição/perda de contraste), CA-16 (p95 da consulta ≤ 3 s em ambiente real; tela interativa antes do fim das animações), CA-19 (leitura de cidade/condição/temperatura/chuva em ≤ 3 s, sem rolagem, em desktop e celular) e CA-09 (distinguibilidade em tons de cinza e com filtros de daltonismo).
- [ ] 8.6 Marcar as tarefas concluídas em `tasks.md` e reportar o resultado final das suítes.

## Detalhes de implementação

Ver `techspec.md`, seções "Abordagem de testes" (parágrafo final: "Casos não automatizáveis, validados na fase de QA"), "Monitoramento e observabilidade" (acompanhamento do bundle) e "Sequenciamento do desenvolvimento → Ordem de construção", item 7. Nenhum detalhe novo de implementação é introduzido nesta tarefa; ajustes são limitados a polish visual e correções apontadas pelas suítes.

## Critérios de aceitação relacionados

- CA-09 (validação manual complementar a TU-50/TU-51/TU-61)
- CA-15
- CA-16
- CA-18
- CA-19

## Testes da tarefa

### Testes de unidade (se aplicável)

Não aplicável como casos novos — regressão das suítes existentes (TU-01 a TU-63 do frontend e TU/TI do backend).

### Testes de integração (se aplicável)

Não aplicável como casos novos — regressão de TI-01 a TI-14.

### Testes E2E (se aplicável)

Não aplicável como casos novos — regressão de E2E-01 a E2E-18 (subtarefa 8.3).

## Arquivos relevantes

- `frontend/`, `backend/`, `e2e/` (suítes completas)
- `.impeccable/surfaces/frontend-src-views-weatherdashboardview-tsx.md` (atualizado)
- `frontend/src/lib/theme-tokens.ts` (único ponto permitido para ajuste de hex, sempre com TU-50)
- `tasks/prd-identidade-futurista-reativa/tasks.md` (marcação de conclusão)
- `tasks/prd-identidade-futurista-reativa/techspec.md` (referência)
