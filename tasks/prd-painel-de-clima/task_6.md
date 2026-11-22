# Tarefa 6.0: Frontend — hooks de integração

## Visão geral

Cria os hooks que encapsulam carregamento/sucesso/erro e as integrações com o backend e o navegador: `useCitySearch` (busca de cidades), `useWeather` (clima por coordenadas + "tentar novamente"), `useGeolocation` (permissão e coordenadas do navegador, sem bloquear em caso de recusa) e `useUnits` (estado de unidades com troca sem nova busca). Os componentes/views consumirão esses hooks na tarefa 7. Depende da fundação do frontend (tarefa 5).

<skills>
### Conformidade com skills

- `react` (obrigatória): hooks customizados com prefixo `use`; `useEffect` somente para sincronizar com sistemas externos (requisições e `navigator.geolocation`), nunca para valores derivados; acesso ao backend via `services/`; estado modelado de forma explícita.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules. Relevantes aqui:

- `folder-structure.md`: `hooks/` para lógica de estado/comportamento compartilhado; acesso ao backend só em `services/` (chamado pelos hooks).
- `javascript-typescript.md`: proibido `any`; tipagem explícita; imutabilidade (novos objetos/arrays); `===`.
- `code-standards.md`: funções/hooks ≤ 30 linhas; sem comentários; constantes nomeadas para estados/status.
- `tests.md`: testar comportamento dos hooks com `renderHook`; mocks apenas para `fetch` e `navigator.geolocation`; casos independentes; cobertura ≥ 80%.
</rules>

<requirements>
- RF3 (busca após envio explícito), RF16–RF19 (geolocalização opcional, estados claros, sem bloqueio), RF22 (troca de unidades sem nova busca).
- CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07, CA-08.
</requirements>

## Subtarefas

- [x] 6.1 Criar `frontend/src/hooks/useCitySearch.ts` — gerenciar termo, loading, candidatos (sucesso), "não encontrado" (lista vazia) e erro; chama `searchCity`.
- [x] 6.2 Criar `frontend/src/hooks/useWeather.ts` — buscar clima por coordenadas; expor dados/loading/erro e ação "tentar novamente" (reexecutar a última consulta); chama `fetchWeather`.
- [x] 6.3 Criar `frontend/src/hooks/useGeolocation.ts` — usar `navigator.geolocation` com permissão; status `idle`/`prompting`/`granted`/`denied`/`unavailable`; retornar coordenadas; recusa/indisponibilidade não pode bloquear a busca manual.
- [x] 6.4 Criar `frontend/src/hooks/useUnits.ts` — estado de unidades (temperatura/vento) e funções de alternância sem refetch.
- [x] 6.5 Implementar testes de unidade dos hooks (mock de `fetch`/`geolocation`, `renderHook`).

## Detalhes de implementação

Ver `techspec.md`: "Arquitetura do sistema" (hooks), "Pontos de integração › Geolocalização (navegador)", "Sequenciamento › Ordem de construção" (item 7) e "Considerações técnicas › Conformidade com skills › `react`" (uso de `useEffect`).

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-13 — `useCitySearch` expõe loading→sucesso com candidatos e estado "não encontrado"
- [x] TU-14 — `useWeather` busca por coordenadas e expõe dados/loading/erro
- [x] TU-15 — `useGeolocation` retorna coords + status `granted` quando concedido
- [x] TU-16 — `useGeolocation` retorna status `denied`/`unavailable` sem bloquear a busca manual
- [x] TU-34 — `useUnits` alterna temperatura e velocidade do vento independentemente
- [x] TU-35 — `useCitySearch` expõe erro amigável quando uma busca falha

### Testes de integração (se aplicável)

- Não aplicável.

### Testes E2E (se aplicável)

- Não aplicável (coberto na tarefa 8).

## Arquivos relevantes

- `frontend/src/hooks/useCitySearch.ts` (novo)
- `frontend/src/hooks/useWeather.ts` (novo)
- `frontend/src/hooks/useGeolocation.ts` (novo)
- `frontend/src/hooks/useUnits.ts` (novo)
- `frontend/src/hooks/useCitySearch.test.ts`, `useWeather.test.ts`, `useGeolocation.test.ts`, `useUnits.test.ts` (testes)
- `frontend/src/services/weather-api.ts` (usado)
- `frontend/src/hooks/useCitySearch.test.ts`, `useWeather.test.ts`, `useGeolocation.test.ts`, `useUnits.test.ts` (testes)
