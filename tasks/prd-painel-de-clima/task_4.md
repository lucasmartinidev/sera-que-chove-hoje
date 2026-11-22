# Tarefa 4.0: Backend — clima (`GET /api/weather`)

## Visão geral

Implementa o serviço de clima e a rota `GET /api/weather`. O serviço usa cache por coordenadas, chama `openmeteo.client.fetchForecast`, mapeia `current` + `hourly` para o contrato `WeatherData`, fatia as próximas 6 horas e deriva a probabilidade de precipitação atual a partir da série horária. A rota valida `lat`/`lon` e delega ao serviço; falhas de origem viram `502`. Depende das tarefas 1 e 2.

<skills>
### Conformidade com skills

Nenhuma skill de `.agents/skills` é específica para backend. Segue as rules em `.agents/rules/`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules. Relevantes aqui:

- `folder-structure.md`: fluxo `routes → services → data`; sem regra de negócio em `routes`.
- `node.md`: `async/await`; propagação de erros com `throw`; não bloquear o event loop; sem referências circulares.
- `javascript-typescript.md`: proibido `any`; validação de `unknown`; campos opcionais normalizados para `null`; `Promise<T>`; imutabilidade.
- `code-standards.md`: funções ≤ 30 linhas (extrair fatiamento/mapeamento); constantes nomeadas (ex.: `FORECAST_HOURS = 6`); cláusulas de guarda; sem comentários.
- `tests.md`: unidade com cliente mockado e relógio controlado; integração com Supertest; cobertura ≥ 80%.
</rules>

<requirements>
- RF7–RF15 (dados do clima atual e previsão das próximas 6 horas).
- Restrição: unidades métricas no contrato (conversão é responsabilidade do frontend).
- CA-01, CA-02, CA-07.
</requirements>

## Subtarefas

- [x] 4.1 Criar `backend/src/services/weather.service.ts` — `getWeather(coords)`: cache por coordenadas (arredondadas), chamar `fetchForecast`, mapear `current`, fatiar as próximas 6 horas (primeiro índice com `time >= current.time`; origem com `forecast_days=2`), derivar `precipitationProbability` atual do `hourly` (ou `null`), montar `WeatherData` com `units` métricas.
- [x] 4.2 Estender `backend/src/routes/weather.routes.ts` — `GET /api/weather`: validar `lat`/`lon` (faixas `-90..90`, `-180..180`) → `400 INVALID_PARAM`; sucesso → `200` com `WeatherData`; erro de origem → `502` via `error-handler`.
- [x] 4.3 Implementar testes de unidade do serviço (mock do cliente; casos de fatiamento e probabilidade `null`).
- [x] 4.4 Implementar testes de integração da rota (Supertest, cliente/`fetch` mockado).

## Detalhes de implementação

Ver `techspec.md`: "Endpoints da API › `GET /api/weather`", "Modelos de dados › `WeatherData`/`CurrentWeather`/`HourForecast`/`WeatherLocation`/`WeatherUnits`", nota de degradação da probabilidade de precipitação, "Mapeamento Open-Meteo → contrato" (Forecast) e regra de fatiamento das 6 horas, "Parâmetros fixos na origem" (Forecast), "Sequenciamento › Ordem de construção" (item 4).

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-07

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-04 — `weather.service` mapeia `current`+`hourly` e fatia as próximas 6 horas
- [x] TU-05 — `weather.service` deriva `precipitationProbability` atual do índice do horário corrente
- [x] TU-06 — `weather.service` lança `UPSTREAM_ERROR` quando `fetchForecast` falha

### Testes de integração (se aplicável)

- [x] TI-05 — `GET /api/weather?lat&lon` retorna `200` com `WeatherData`
- [x] TI-06 — `GET /api/weather` com `lat`/`lon` inválidos retorna `400 INVALID_PARAM`
- [x] TI-07 — `GET /api/weather` com falha na origem retorna `502 UPSTREAM_ERROR`

### Testes E2E (se aplicável)

- Não aplicável (coberto na tarefa 8).

## Arquivos relevantes

- `backend/src/services/weather.service.ts` (novo)
- `backend/src/routes/weather.routes.ts` (estendido)
- `backend/src/data/openmeteo.client.ts`, `backend/src/data/cache.ts` (usados)
- `backend/src/types/weather.ts`, `backend/src/types/api-error.ts` (usados)
- `backend/src/services/weather.service.test.ts`, `backend/src/routes/weather.routes.test.ts` (testes)
- `backend/src/routes/weather.routes.weather.test.ts` (testes de integração de `/api/weather`)
