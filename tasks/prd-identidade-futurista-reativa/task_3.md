# Tarefa 3.0: Hooks de preferências do sistema (useMediaQuery, useReducedMotion, mock matchMedia)

## Visão geral

Cria a base reativa para detecção de preferências do sistema: `useMediaQuery` (genérico, com listener de mudança) e `useReducedMotion` (`prefers-reduced-motion: reduce`), além do mock de `matchMedia` no setup de testes do frontend (jsdom não o implementa). Estes hooks alimentam o crossfade instantâneo (RF27) e os testes de movimento reduzido das tarefas seguintes.

Dependência: nenhuma (pode ser executada em paralelo às Tarefas 1.0 e 2.0).

<skills>
### Conformidade com skills

- `react` (`.agents/skills/react/SKILL.md`) — obrigatória; seguir suas regras de hooks (efeitos com limpeza de listener, dependências corretas, sem estado derivado redundante).
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/`. Relevantes para esta tarefa:

- `code-standards.md`: funções ≤ 30 linhas; constantes nomeadas (query string `'(prefers-reduced-motion: reduce)'` extraída).
- `javascript-typescript.md`: sem `any`; retorno tipado `boolean`; tratamento de ambiente sem `matchMedia` com cláusula de guarda.
- `folder-structure.md`: hooks reutilizáveis em `frontend/src/hooks/`, testes `*.test.ts` junto ao código.
- `tests.md`: FIRST — testes independentes e repetíveis com mock de `matchMedia` controlado (disparo manual do evento `change`), sem depender do ambiente real.
- Ao final: `npm run lint`, `npm run typecheck` e `npm test` em `frontend/`.
</rules>

<requirements>

- RF26–RF28 (suporte) — detectar a preferência de movimento reduzido do sistema de forma reativa, permitindo à atmosfera desativar animações (CSS) e ao tema usar transição instantânea (`transitionMs = 0`).
- RF30 (suporte) — o hook não pode introduzir efeitos que degradem interação; listener removido no cleanup.
</requirements>

## Subtarefas

- [x] 3.1 Implementar `useMediaQuery(query: string): boolean` com `useState` + `useEffect`, listener `change` e cleanup; retorno `false` quando `matchMedia` não existe no ambiente.
- [x] 3.2 Implementar `useReducedMotion(): boolean` sobre `useMediaQuery` com a query extraída em constante nomeada.
- [x] 3.3 Adicionar mock de `matchMedia` em `frontend/src/test/setup.ts` (implementação padrão que respeita `matches` configurável por teste, sem quebrar os testes existentes).
- [x] 3.4 Escrever o teste TU-55 (reflete o valor do mock e atualiza ao disparar `change`).
- [x] 3.5 Rodar `npm run lint`, `npm run typecheck` e `npm test` em `frontend/` (suíte completa, garantindo que o mock não quebrou testes existentes).

## Detalhes de implementação

Ver `techspec.md`, seção "Principais interfaces → hooks" (assinaturas) e "Mecanismo de transição de tema" (papel do `useReducedMotion` no `transitionMs = 0` — RF27). O mock de `matchMedia` é pré-requisito de infraestrutura declarado na seção "Abordagem de testes".

## Critérios de aceitação relacionados

- CA-05

## Testes da tarefa

### Testes de unidade

- [x] TU-55 — detecta movimento reduzido e reage à mudança

### Testes de integração (se aplicável)

Não aplicável.

### Testes E2E (se aplicável)

Não aplicável (o comportamento de navegador real é coberto por E2E-12 na Tarefa 7.0).

## Arquivos relevantes

- `frontend/src/hooks/useMediaQuery.ts` (novo)
- `frontend/src/hooks/useReducedMotion.ts` (novo)
- `frontend/src/hooks/useReducedMotion.test.ts` (novo — TU-55)
- `frontend/src/test/setup.ts` (modificado — mock `matchMedia`)
- `tasks/prd-identidade-futurista-reativa/techspec.md` (referência)
