# Tarefa 1.0: Domínio puro de identidade (faixas de temperatura, famílias de condição, contraste WCAG)

## Visão geral

Cria os módulos puros e determinísticos que sustentam toda a identidade reativa: a escala estática de faixas de temperatura em °C (com rótulos PT-BR e clamp nos extremos), o agrupamento de códigos WMO nas sete famílias de condição e as funções de contraste WCAG 2.2. Nenhum componente visual é alterado; esta tarefa entrega apenas `frontend/src/lib/` com testes.

<skills>
### Conformidade com skills

- `react` (`.agents/skills/react/SKILL.md`) — obrigatória antes de qualquer código no frontend; aplica-se aqui às convenções de TypeScript do projeto (módulos puros, sem componentes).
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/`. Relevantes para esta tarefa:

- `code-standards.md`: sem comentários; arquivos `.ts` ≤ 100 linhas; funções ≤ 30 linhas; cláusulas de guarda (early-return para `null`); constantes nomeadas para todos os limites de faixa (nada de números mágicos).
- `javascript-typescript.md`: `const`, `===`/`!==`, tipagem explícita sem `any` (uniões literais para `TemperatureBandId` e `ConditionFamily`), imutabilidade.
- `tests.md`: cobertura ≥ 80%; FIRST (funções puras, sem relógio/rede); Given/When/Then; nomes de teste descrevendo o requisito, incluindo os IDs `TU-*` da TechSpec.
- `folder-structure.md`: domínio puro em `frontend/src/lib/` (convenção existente), testes `*.test.ts` junto ao código.
- Ao final: `npm run lint`, `npm run typecheck` e `npm test` em `frontend/`.
</rules>

<requirements>

- RF6, RF21 — famílias de condição: `clear`, `cloudy`, `fog`, `rain`, `snow`, `thunderstorm`, `neutral`, com mapeamento determinístico dos códigos WMO.
- RF13–RF17, RF19 — escala de temperatura estática e absoluta em °C, oito faixas com limites e rótulos PT-BR exatos, clamp nos extremos, `null` quando a temperatura está ausente (base do RF18).
- RF22–RF24 (suporte) — funções de luminância relativa e razão de contraste WCAG 2.2 com predicados AA (texto ≥ 4,5:1, não-texto ≥ 3:1) que viabilizam a auditoria da Tarefa 2.0.
</requirements>

## Subtarefas

- [ ] 1.1 Implementar `temperature-scale.ts`: tipo `TemperatureBand` (`id`, `labelPtBr`), tabela de limites da TechSpec (inferior exclusivo, superior inclusivo), `getTemperatureBand(temperatureC: number | null)` com clamp em `extreme-cold`/`extreme-heat` e retorno `null` para entrada `null`.
- [ ] 1.2 Implementar `condition-family.ts`: tipo `ConditionFamily` e `getConditionFamily(weatherCode: number | null)` com o mapeamento WMO da TechSpec; código desconhecido ou `null` → `neutral`.
- [ ] 1.3 Implementar `contrast.ts`: `relativeLuminance(hex)`, `contrastRatio(fg, bg)`, `meetsTextAA(fg, bg)`, `meetsNonTextAA(fg, bg)`, aceitando hex de 3 ou 6 dígitos.
- [ ] 1.4 Escrever os testes de unidade TU-45 a TU-49 junto aos módulos.
- [ ] 1.5 Rodar `npm run lint`, `npm run typecheck` e `npm test` (com cobertura) em `frontend/`.

## Detalhes de implementação

Ver `techspec.md`, seções "Principais interfaces" (assinaturas de `temperature-scale`, `condition-family` e `contrast`) e "Modelos de dados → `TemperatureBand`" (tabela exata de faixas, limites e rótulos) e "→ `ConditionFamily`" (tabela WMO). A definição de limites usa o valor numérico extraído em constantes nomeadas (ex.: `MILD_UPPER_LIMIT_C = 24`). Os valores hex de `accent`/`deep` por faixa ficam na Tarefa 2.0 (`theme-tokens.ts`); esta tarefa entrega apenas `id` e `labelPtBr`.

## Critérios de aceitação relacionados

- CA-02
- CA-04
- CA-08
- CA-11
- CA-12

## Testes da tarefa

### Testes de unidade

- [ ] TU-45 — mapeia temperaturas nos limites exatos das oito faixas
- [ ] TU-46 — fixa temperaturas fora da escala nas faixas extremas
- [ ] TU-47 — retorna faixa nula quando a temperatura está ausente
- [ ] TU-48 — agrupa todos os códigos WMO nas famílias corretas
- [ ] TU-49 — calcula luminância e razão de contraste WCAG

> TU-51 (ordenar as faixas por luminância crescente — RF15/CA-09) depende dos valores hex de `accent`, definidos em `theme-tokens.ts`; por isso é implementado na Tarefa 2.0.

### Testes de integração (se aplicável)

Não aplicável.

### Testes E2E (se aplicável)

Não aplicável.

## Arquivos relevantes

- `frontend/src/lib/temperature-scale.ts` (novo)
- `frontend/src/lib/temperature-scale.test.ts` (novo)
- `frontend/src/lib/condition-family.ts` (novo)
- `frontend/src/lib/condition-family.test.ts` (novo)
- `frontend/src/lib/contrast.ts` (novo)
- `frontend/src/lib/contrast.test.ts` (novo)
- `tasks/prd-identidade-futurista-reativa/techspec.md` (referência)
