# Tarefa 3.0: Backend — geocodificação (`GET /api/geocode`)

## Visão geral

Implementa o serviço de busca de cidades e a rota `GET /api/geocode`. O serviço normaliza o termo (trim/caixa), usa cache, chama o cliente Open-Meteo e mapeia `results` para `GeocodingCandidate[]`, retornando `[]` quando não há correspondência. A rota valida `city` e delega ao serviço; falhas de origem viram `502`. Depende das tarefas 1 e 2.

<skills>
### Conformidade com skills

Nenhuma skill de `.agents/skills` é específica para backend. Segue as rules em `.agents/rules/`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules. Relevantes aqui:

- `folder-structure.md`: fluxo `routes → services → data`; sem regra de negócio em `routes`.
- `node.md`: `async/await`; propagação de erros com `throw` para a camada HTTP converter; sem referências circulares.
- `javascript-typescript.md`: proibido `any`; `Promise<T>`; `===`; validação de `unknown`; imutabilidade.
- `code-standards.md`: funções ≤ 30 linhas; ≤ 3 parâmetros (agrupar em objetos); constantes nomeadas (ex.: mínimo de caracteres, `count=10`); cláusulas de guarda; sem comentários.
- `tests.md`: integração com Supertest e dependência externa mockada; casos independentes e auto-validados; cobertura ≥ 80%.
</rules>

<requirements>
- RF1–RF5 (resolução de cidade; múltiplas correspondências; nenhuma correspondência).
- RF6 (frontend obtém dados só do backend).
- CA-01, CA-05, CA-06, CA-09.
</requirements>

## Subtarefas

- [x] 3.1 Criar `backend/src/services/geocode.service.ts` — `findCandidates(city)`: normalizar termo, chave de cache, chamar `openmeteo.client.searchCity`, mapear para `GeocodingCandidate[]`, retornar `[]` sem resultados.
- [x] 3.2 Criar/estender `backend/src/routes/weather.routes.ts` — `GET /api/geocode`: validar `city` (obrigatório, ≥ 2 chars após trim) → `400 INVALID_PARAM`; sucesso → `200` com `{ candidates }`; erro de origem → `502` via `error-handler`.
- [x] 3.3 Implementar testes de unidade do serviço (mock do cliente).
- [x] 3.4 Implementar testes de integração da rota (Supertest, cliente/`fetch` mockado).

## Detalhes de implementação

Ver `techspec.md`: "Endpoints da API › `GET /api/geocode`", "Modelos de dados › `GeocodingCandidate`/`GeocodeResponse`" (inclui lista vazia), "Mapeamento Open-Meteo → contrato" (Geocoding), "Parâmetros fixos na origem" (Geocoding: `count=10`, `language=pt`), "Sequenciamento › Ordem de construção" (item 3).

## Critérios de aceitação relacionados

- CA-01
- CA-05
- CA-06
- CA-09

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-01 — `geocode.service` mapeia `results` da Open-Meteo para `GeocodingCandidate[]`
- [x] TU-02 — `geocode.service` retorna `[]` quando não há `results`
- [x] TU-03 — `geocode.service` normaliza termo (trim/caixa) e usa a chave de cache correta

### Testes de integração (se aplicável)

- [x] TI-01 — `GET /api/geocode?city=São Paulo` retorna `200` com candidatos
- [x] TI-02 — `GET /api/geocode` sem `city` retorna `400 INVALID_PARAM`
- [x] TI-03 — `GET /api/geocode` sem correspondência retorna `200 { candidates: [] }`
- [x] TI-04 — `GET /api/geocode` com falha na origem retorna `502 UPSTREAM_ERROR`
- [x] TI-09 — Cache evita segunda chamada à Open-Meteo dentro do TTL

### Testes E2E (se aplicável)

- Não aplicável (coberto na tarefa 8).

## Arquivos relevantes

- `backend/src/services/geocode.service.ts` (novo)
- `backend/src/routes/weather.routes.ts` (novo/estendido)
- `backend/src/data/openmeteo.client.ts`, `backend/src/data/cache.ts` (usados)
- `backend/src/types/geocoding-candidate.ts`, `backend/src/types/api-error.ts` (usados)
- `backend/src/services/geocode.service.test.ts`, `backend/src/routes/weather.routes.test.ts` (testes)
