# Especificação técnica

> Funcionalidade: **Painel de Clima** — PRD em [`tasks/prd-painel-de-clima/prd.md`](./prd.md). Problema, objetivos, histórias, escopo e critérios de aceitação (`CA-*`) estão definidos no PRD e são referenciados aqui, não repetidos.

## Resumo

A solução adiciona um painel de clima sobre a stack existente (React 19 + Vite no `frontend/`, Express 5 + TypeScript no `backend/`), preservando a separação entre os dois aplicativos e o fluxo de camadas do projeto. O backend passa a expor dois endpoints HTTP: `GET /api/geocode` (cidade → candidatos com coordenadas, via Open-Meteo Geocoding API) e `GET /api/weather` (coordenadas → clima atual + previsão das próximas 6 horas, via Open-Meteo Forecast API). O frontend consome exclusivamente esses endpoints, orquestra os fluxos de busca e de geolocalização, e fica responsável por toda a apresentação: mapeamento do código WMO para descrição PT-BR + ícone (`lucide-react`), conversão de unidades (°C/°F, km/h/mph) e formatação de horário/direção do vento.

Decisões centrais: (1) backend sempre retorna valores em unidades métricas e o frontend converte, atendendo à troca de unidades sem nova busca (RF22); (2) cache em memória de curto TTL no backend para reduzir chamadas e latência (meta de 3 s p95) e respeitar o rate limit da Open-Meteo; (3) `fetch` nativo do Node com `AbortController` para timeout, sem nova biblioteca HTTP; (4) o fluxo de geolocalização é degradado para o rótulo "Minha localização" + coordenadas, pois a Open-Meteo não oferece geocodificação reversa e optou-se por não adicionar dependência externa — desvio justificado em relação à RF17. Esta especificação também prevê a configuração das infraestruturas de teste exigidas por `tests.md` (Vitest + Testing Library no frontend, Vitest + Supertest no backend, Playwright em `e2e/`, cobertura mínima de 80%) e a correção do build do backend.

## Arquitetura do sistema

### Visão dos componentes

O fluxo respeita `configuração → rotas → serviços → dados → tipos` no backend e `view → components/hooks → services → backend` no frontend, sem referências circulares.

Backend (`backend/src/`):

- `index.ts` (modificado): inicializa o servidor, registra `cors`, rotas (`/health`, `/api/geocode`, `/api/weather`) e o middleware de erro, e implementa _graceful shutdown_ (`SIGTERM`/`SIGINT`). Corrige a falha de build (`noUnusedParameters`) renomeando parâmetros não usados do middleware de erro com prefixo `_`.
- `config.ts` (novo): carrega e valida variáveis de ambiente (`PORT`, URLs e timeouts da Open-Meteo, TTL do cache) na inicialização.
- `logger.ts` (novo): adaptador centralizado de logging (exigido por `node.md`); único ponto que usa `console.*`.
- `routes/weather.routes.ts` (novo): rotas `GET /api/geocode` e `GET /api/weather`; valida entradas básicas e monta respostas. Sem regra de negócio.
- `services/geocode.service.ts` (novo): regra de negócio da busca de cidades (normalização do termo, cache, mapeamento para o contrato, lista vazia quando não há correspondência).
- `services/weather.service.ts` (novo): regra de negócio do clima (cache, mapeamento de `current` + `hourly`, fatiamento das próximas 6 horas, derivação da probabilidade de precipitação atual).
- `data/openmeteo.client.ts` (novo): acesso às APIs externas com `fetch` + `AbortController` (timeout); funções `searchCity` e `fetchForecast`.
- `data/openmeteo.parser.ts` (novo): valida respostas externas (`unknown`) e as estreita para os tipos Open-Meteo consumidos pelo backend.
- `data/cache.ts` (novo): cache em memória genérico com TTL (`Map<string, { value; expiresAt }>`).
- `middleware/error-handler.ts` (novo): converte erros de domínio (`ApiError`) em status/payload HTTP.
- `types/*.ts` (novos): `geocoding-candidate.ts`, `weather.ts`, `open-meteo.ts`, `api-error.ts` — um conceito por arquivo.

Frontend (`frontend/src/`):

- `App.tsx` (modificado): renderiza `WeatherDashboardView`; remove a URL fixa `http://localhost:3000/health` em favor da base via `VITE_API_URL`.
- `views/WeatherDashboardView.tsx` (novo): compõe os componentes e coordena o estado da tela (busca, seleção de cidade, clima, geolocalização, unidades).
- `services/api.ts` (novo): cliente HTTP base (base URL de `import.meta.env.VITE_API_URL`, validação de respostas e tratamento do envelope de erro).
- `services/health-api.ts` (novo): consulta o health check existente pelo cliente HTTP.
- `services/weather-api.ts`, `services/weather-api.validation.ts` (novos): `searchCity(city)` → `/api/geocode`; `fetchWeather(lat, lon)` → `/api/weather`, com validação dos contratos recebidos.
- `hooks/useApiHealth.ts`, `hooks/useCitySearch.ts`, `hooks/useWeather.ts`, `hooks/useGeolocation.ts`, `hooks/useUnits.ts` (novos): encapsulam carregamento/sucesso/erro e integrações com navegador.
- `lib/weather-codes.ts` (novo): mapa código WMO → `{ labelPtBr, icon }` (componentes `lucide-react`) + fallback.
- `lib/units.ts` (novo): conversões (°C→°F, km/h→mph), formatação de temperatura/vento/pressão e direção cardeal.
- `components/weather/*` (novos): `CitySearchForm`, `CityCandidateList`, `CurrentWeatherCard`, `HourlyForecast`, `WeatherMetric`, `UnitSelector`, `LocationButton`, `WeatherIcon`, `StatusMessage`. Reuso de `components/ui/button.tsx`.
- `types/*.ts` (novos): `geocoding-candidate.ts`, `weather.ts`, `units.ts`, `weather-code.ts`.

Relacionamentos e fluxo de dados:

1. Busca: `WeatherDashboardView` → `useCitySearch` → `weather-api.searchCity` → `GET /api/geocode` → `geocode.service` → `openmeteo.client.searchCity` (+ `cache`) → Open-Meteo Geocoding. Retorna candidatos; se houver mais de um, `CityCandidateList` permite escolher.
2. Clima: coordenada selecionada → `useWeather` → `weather-api.fetchWeather` → `GET /api/weather` → `weather.service` → `openmeteo.client.fetchForecast` (+ `cache`) → Open-Meteo Forecast. `CurrentWeatherCard` + `HourlyForecast` renderizam; `lib/weather-codes` e `lib/units` fazem a apresentação.
3. Geolocalização: `useGeolocation` obtém coordenadas do navegador → rotula "Minha localização" → chama `useWeather` diretamente com as coordenadas (sem geocodificação).

## Design de implementação

### Principais interfaces

```text
# backend/src/data/openmeteo.client.ts
OpenMeteoClient
  searchCity(name: string): Promise<OpenMeteoGeocodingResult[]>
  fetchForecast(coords: Coordinates): Promise<OpenMeteoForecast>

# backend/src/services
GeocodeService
  findCandidates(city: string): Promise<GeocodingCandidate[]>
WeatherService
  getWeather(coords: Coordinates): Promise<WeatherData>

# backend/src/data/cache.ts
MemoryCache
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T): void
```

```text
# frontend/src/services/weather-api.ts
searchCity(city: string): Promise<GeocodingCandidate[]>
fetchWeather(lat: number, lon: number): Promise<WeatherData>

# frontend/src/lib/weather-codes.ts
describeWeatherCode(code: number): WeatherCondition   # { labelPtBr, icon }

# frontend/src/lib/units.ts
formatTemperature(celsius: number, unit: TemperatureUnit): string
formatWindSpeed(kmh: number, unit: WindSpeedUnit): string
toCardinalDirection(degrees: number): string
```

### Modelos de dados

Contratos JSON entre backend e UI, prontos para exibição. Unidades sempre métricas na origem do contrato; campos ausentes na Open-Meteo são normalizados para `null`.

#### `GeocodingCandidate` — cidade candidata retornada pela busca

| Campo         | Tipo     | Obrigatório | Descrição                                        |
| ------------- | -------- | ----------- | ------------------------------------------------ |
| `id`          | `number` | sim         | Identificador GeoNames da localidade             |
| `name`        | `string` | sim         | Nome da cidade (PT quando disponível)            |
| `admin1`      | `string \| null` | não  | Primeira região administrativa (estado/província)|
| `country`     | `string \| null` | não  | Nome do país                                     |
| `countryCode` | `string \| null` | não  | Código ISO-3166-1 alpha-2 (ex.: `BR`)            |
| `latitude`    | `number` | sim         | Coordenada WGS84                                 |
| `longitude`   | `number` | sim         | Coordenada WGS84                                 |
| `timezone`    | `string \| null` | não  | Fuso IANA da localidade                          |
| `population`  | `number \| null` | não  | População (usada para ranquear/desambiguar)      |

```text
{
  "id": 3448439,
  "name": "São Paulo",
  "admin1": "São Paulo",
  "country": "Brasil",
  "countryCode": "BR",
  "latitude": -23.5475,
  "longitude": -46.63611,
  "timezone": "America/Sao_Paulo",
  "population": 10021295
}
```

#### `GeocodeResponse` — envelope de sucesso da busca

| Campo        | Tipo                     | Obrigatório | Descrição                                   |
| ------------ | ------------------------ | ----------- | ------------------------------------------- |
| `candidates` | `GeocodingCandidate[]`   | sim         | Lista de correspondências; `[]` se nenhuma   |

```text
{
  "candidates": [
    { "id": 3448439, "name": "São Paulo", "admin1": "São Paulo", "country": "Brasil", "countryCode": "BR", "latitude": -23.5475, "longitude": -46.63611, "timezone": "America/Sao_Paulo", "population": 10021295 }
  ]
}
```

> **Lista vazia (sem correspondência):** quando a Open-Meteo não retorna resultados, o backend responde `200` com `{ "candidates": [] }`. O frontend exibe a mensagem "cidade não encontrada" (CA-06). Não se usa `404` para esse caso.

```text
{
  "candidates": []
}
```

#### `WeatherData` — clima atual + previsão resumida (payload agregado)

| Campo      | Tipo            | Obrigatório | Descrição                                            |
| ---------- | --------------- | ----------- | ---------------------------------------------------- |
| `location` | `WeatherLocation` | sim        | Coordenadas e fuso usados na consulta                |
| `current`  | `CurrentWeather`  | sim        | Condições atuais normalizadas                        |
| `hourly`   | `HourForecast[]`  | sim        | Próximas 6 horas (6 itens; pode ser menor se a origem não cobrir) |
| `units`    | `WeatherUnits`    | sim        | Unidades métricas fixas do payload                   |

```text
{
  "location": { "latitude": -23.5475, "longitude": -46.63611, "timezone": "America/Sao_Paulo", "utcOffsetSeconds": -10800 },
  "current": {
    "time": "2026-11-22T14:00",
    "temperatureC": 27.3,
    "apparentTemperatureC": 29.1,
    "relativeHumidity": 62,
    "precipitationProbability": 35,
    "precipitationMm": 0.0,
    "weatherCode": 2,
    "windSpeedKmh": 12.4,
    "windDirectionDeg": 145,
    "surfacePressureHpa": 1013,
    "isDay": true
  },
  "hourly": [
    { "time": "2026-11-22T15:00", "temperatureC": 27.8, "weatherCode": 2, "precipitationProbability": 40, "precipitationMm": 0.1 }
  ],
  "units": { "temperature": "celsius", "windSpeed": "kmh", "precipitation": "mm", "pressure": "hpa" }
}
```

##### `WeatherLocation`

| Campo              | Tipo     | Obrigatório | Descrição                          |
| ------------------ | -------- | ----------- | ---------------------------------- |
| `latitude`         | `number` | sim         | Latitude consultada                |
| `longitude`        | `number` | sim         | Longitude consultada               |
| `timezone`         | `string \| null` | não | Fuso IANA resolvido (`timezone=auto`) |
| `utcOffsetSeconds` | `number \| null` | não | Offset UTC em segundos no momento  |

##### `CurrentWeather`

| Campo                     | Tipo     | Obrigatório | Descrição                                                     |
| ------------------------- | -------- | ----------- | ------------------------------------------------------------- |
| `time`                    | `string` | sim         | Horário de referência local (ISO 8601 sem offset, ex.: `2026-11-22T14:00`) |
| `temperatureC`            | `number \| null` | não | Temperatura do ar (°C)                                         |
| `apparentTemperatureC`    | `number \| null` | não | Sensação térmica (°C)                                          |
| `relativeHumidity`        | `number \| null` | não | Umidade relativa (%)                                           |
| `precipitationProbability`| `number \| null` | não | Probabilidade de precipitação (%) — derivada do `hourly` no horário atual |
| `precipitationMm`         | `number \| null` | não | Precipitação atual (mm)                                        |
| `weatherCode`             | `number` | sim         | Código WMO da condição (mapeado para texto/ícone no frontend)  |
| `windSpeedKmh`            | `number \| null` | não | Velocidade do vento (km/h)                                     |
| `windDirectionDeg`        | `number \| null` | não | Direção do vento (graus, 0–360)                                |
| `surfacePressureHpa`      | `number \| null` | não | Pressão atmosférica (hPa)                                      |
| `isDay`                   | `boolean` | sim        | `true` se dia, `false` se noite (afeta ícone)                 |

> **Degradação — probabilidade de precipitação atual:** o bloco `current` da Open-Meteo não inclui `precipitation_probability`. O backend deriva esse valor do ponto da série `hourly` cujo `time` coincide com `current.time` (ou o mais próximo). Se não houver valor, normaliza para `null` e o frontend oculta/rotula a métrica.

```text
{
  "current": { "precipitationProbability": null }
}
```

##### `HourForecast`

| Campo                     | Tipo     | Obrigatório | Descrição                                    |
| ------------------------- | -------- | ----------- | -------------------------------------------- |
| `time`                    | `string` | sim         | Horário local da hora (ISO 8601 sem offset)  |
| `temperatureC`            | `number \| null` | não | Temperatura (°C)                             |
| `weatherCode`             | `number \| null` | não | Código WMO da hora                           |
| `precipitationProbability`| `number \| null` | não | Probabilidade de precipitação (%)            |
| `precipitationMm`         | `number \| null` | não | Precipitação (mm)                            |

##### `WeatherUnits`

| Campo           | Tipo     | Obrigatório | Descrição                    |
| --------------- | -------- | ----------- | ---------------------------- |
| `temperature`   | `string` | sim         | Fixo `"celsius"`             |
| `windSpeed`     | `string` | sim         | Fixo `"kmh"`                 |
| `precipitation` | `string` | sim         | Fixo `"mm"`                  |
| `pressure`      | `string` | sim         | Fixo `"hpa"`                 |

#### `ApiError` — envelope de erro

| Código           | HTTP  | Significado                                            |
| ---------------- | ----- | ------------------------------------------------------ |
| `INVALID_PARAM`  | `400` | Parâmetro ausente/inválido (ex.: `city` vazio, `lat`/`lon` fora de faixa) |
| `UPSTREAM_ERROR` | `502` | Falha/timeout/indisponibilidade na Open-Meteo          |
| `INTERNAL_ERROR` | `500` | Erro inesperado no backend                             |

```text
{
  "error": {
    "code": "UPSTREAM_ERROR",
    "message": "Não foi possível obter os dados de clima agora. Tente novamente."
  }
}
```

> As mensagens são amigáveis e em PT-BR (padrão de UI do produto), sem detalhes técnicos internos (CA-07). O `code` permite ao frontend decidir o texto/ação (ex.: "tentar novamente").

#### Mapeamento Open-Meteo → contrato

Geocoding (`https://geocoding-api.open-meteo.com/v1/search`):

| Origem (Open-Meteo)    | Destino (contrato) |
| ---------------------- | ------------------ |
| `results[].id`         | `candidates[].id`  |
| `results[].name`       | `candidates[].name`|
| `results[].admin1`     | `candidates[].admin1` |
| `results[].country`    | `candidates[].country` |
| `results[].country_code` | `candidates[].countryCode` |
| `results[].latitude`   | `candidates[].latitude` |
| `results[].longitude`  | `candidates[].longitude` |
| `results[].timezone`   | `candidates[].timezone` |
| `results[].population` | `candidates[].population` |

Forecast (`https://api.open-meteo.com/v1/forecast`):

| Origem (Open-Meteo)                 | Destino (contrato)                     |
| ----------------------------------- | -------------------------------------- |
| `current.time`                      | `current.time`                          |
| `current.temperature_2m`            | `current.temperatureC`                  |
| `current.apparent_temperature`      | `current.apparentTemperatureC`          |
| `current.relative_humidity_2m`      | `current.relativeHumidity`             |
| `current.precipitation`             | `current.precipitationMm`              |
| `current.weather_code`              | `current.weatherCode`                  |
| `current.wind_speed_10m`            | `current.windSpeedKmh`                 |
| `current.wind_direction_10m`        | `current.windDirectionDeg`             |
| `current.surface_pressure`          | `current.surfacePressureHpa`           |
| `current.is_day`                    | `current.isDay` (`1`→`true`, `0`→`false`) |
| `hourly.precipitation_probability[índiceAtual]` | `current.precipitationProbability` |
| `hourly.time[i]`                    | `hourly[i].time`                        |
| `hourly.temperature_2m[i]`          | `hourly[i].temperatureC`                |
| `hourly.weather_code[i]`            | `hourly[i].weatherCode`                 |
| `hourly.precipitation_probability[i]`| `hourly[i].precipitationProbability`    |
| `hourly.precipitation[i]`           | `hourly[i].precipitationMm`             |
| `timezone`                          | `location.timezone`                     |
| `utc_offset_seconds`                | `location.utcOffsetSeconds`             |

> **Fatiamento das próximas 6 horas:** o backend localiza o índice da série `hourly` cujo `time` seja o primeiro `>= current.time` e seleciona 6 elementos consecutivos a partir dele. Para garantir cobertura perto da meia-noite, a consulta pede `forecast_days=2`.

#### Parâmetros fixos na origem

| API               | Parâmetros principais                                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Geocoding API** | `name=<termo>`, `count=10`, `language=pt`, `format=json`                                                                                                                     |
| **Forecast API**  | `latitude`, `longitude`, `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m`, `hourly=temperature_2m,weather_code,precipitation_probability,precipitation`, `timezone=auto`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `precipitation_unit=mm`, `forecast_days=2` |

### Endpoints da API

#### Visão geral

| Método | Rota            | Descrição                                                        |
| ------ | --------------- | ---------------------------------------------------------------- |
| `GET`  | `/health`       | Health check existente (mantido, sem regressão)                  |
| `GET`  | `/api/geocode`  | Converte nome de cidade em lista de candidatos com coordenadas   |
| `GET`  | `/api/weather`  | Retorna clima atual + previsão de 6 h para coordenadas           |

---

#### `GET /api/geocode`

Resolve o nome de cidade digitado em candidatos geográficos (busca da Open-Meteo). Suporta acentuação e maiúsculas/minúsculas (a Open-Meteo faz correspondência sem distinção de diacríticos e caixa).

**Parâmetros de consulta**

| Parâmetro | Tipo     | Padrão | Regras                                                             |
| --------- | -------- | ------ | ------------------------------------------------------------------ |
| `city`    | `string` | —      | Obrigatório; após `trim`, mínimo 2 caracteres; senão `400 INVALID_PARAM` |

**Respostas**

| Status  | Corpo            | Quando                                              |
| ------- | ---------------- | --------------------------------------------------- |
| `200`   | `GeocodeResponse`| Busca processada (inclui `candidates: []` se nenhuma correspondência) |
| `400`   | `ApiError`       | `city` ausente ou com menos de 2 caracteres         |
| `502`   | `ApiError`       | Falha/timeout na Geocoding API                       |

**Exemplo — sucesso (múltiplas correspondências)**

```http
GET /api/geocode?city=S%C3%A3o%20Paulo
```

```text
{
  "candidates": [
    { "id": 3448439, "name": "São Paulo", "admin1": "São Paulo", "country": "Brasil", "countryCode": "BR", "latitude": -23.5475, "longitude": -46.63611, "timezone": "America/Sao_Paulo", "population": 10021295 }
  ]
}
```

**Exemplo — nenhuma correspondência**

```http
GET /api/geocode?city=asdfg
```

```text
{
  "candidates": []
}
```

> No frontend, `candidates.length === 0` aciona a mensagem "cidade não encontrada" (CA-06); `candidates.length > 1` aciona `CityCandidateList` para seleção (CA-05); `=== 1` carrega o clima diretamente.

**Exemplo — erro de validação**

```http
GET /api/geocode?city=a
```

```text
{
  "error": { "code": "INVALID_PARAM", "message": "Informe uma cidade com pelo menos 2 caracteres." }
}
```

---

#### `GET /api/weather`

Retorna clima atual e previsão das próximas 6 horas para coordenadas. Usado tanto pelo fluxo de busca (coordenadas do candidato escolhido) quanto pelo de geolocalização (coordenadas do navegador).

**Parâmetros de consulta**

| Parâmetro | Tipo     | Padrão | Regras                                                        |
| --------- | -------- | ------ | ------------------------------------------------------------- |
| `lat`     | `number` | —      | Obrigatório; `-90 ≤ lat ≤ 90`; senão `400 INVALID_PARAM`       |
| `lon`     | `number` | —      | Obrigatório; `-180 ≤ lon ≤ 180`; senão `400 INVALID_PARAM`     |

**Respostas**

| Status  | Corpo        | Quando                                            |
| ------- | ------------ | ------------------------------------------------- |
| `200`   | `WeatherData`| Clima obtido com sucesso                           |
| `400`   | `ApiError`   | `lat`/`lon` ausentes ou fora de faixa             |
| `502`   | `ApiError`   | Falha/timeout na Forecast API                      |

**Exemplo — sucesso**

```http
GET /api/weather?lat=-23.5475&lon=-46.63611
```

```text
{
  "location": { "latitude": -23.5475, "longitude": -46.63611, "timezone": "America/Sao_Paulo", "utcOffsetSeconds": -10800 },
  "current": { "time": "2026-11-22T14:00", "temperatureC": 27.3, "apparentTemperatureC": 29.1, "relativeHumidity": 62, "precipitationProbability": 35, "precipitationMm": 0.0, "weatherCode": 2, "windSpeedKmh": 12.4, "windDirectionDeg": 145, "surfacePressureHpa": 1013, "isDay": true },
  "hourly": [ { "time": "2026-11-22T15:00", "temperatureC": 27.8, "weatherCode": 2, "precipitationProbability": 40, "precipitationMm": 0.1 } ],
  "units": { "temperature": "celsius", "windSpeed": "kmh", "precipitation": "mm", "pressure": "hpa" }
}
```

> O array `hourly` contém 6 itens na resposta real. O payload acima mostra 1 por brevidade; ver `WeatherData`.

**Exemplo — erro na origem**

```http
GET /api/weather?lat=-23.5475&lon=-46.63611
```

```text
{
  "error": { "code": "UPSTREAM_ERROR", "message": "Não foi possível obter os dados de clima agora. Tente novamente." }
}
```

> O frontend exibe o `message` e uma ação "Tentar novamente" que repete a última consulta (CA-07). Nenhum detalhe técnico (stack, URL da Open-Meteo) é exposto ao navegador.

---

## Pontos de integração

- **Open-Meteo Geocoding API** (`https://geocoding-api.open-meteo.com/v1/search`): sem autenticação/chave (uso não comercial). Chamada por `openmeteo.client.searchCity`. Erros HTTP/timeout → `UPSTREAM_ERROR`.
- **Open-Meteo Forecast API** (`https://api.open-meteo.com/v1/forecast`): sem autenticação/chave. Chamada por `openmeteo.client.fetchForecast`. Erros HTTP/timeout → `UPSTREAM_ERROR`.
- **Autenticação:** nenhuma. As URLs base são configuráveis via `.env` (com padrões), sem segredos — não há dados sensíveis de credencial.
- **Timeout:** cada chamada externa usa `AbortController` com `OPEN_METEO_TIMEOUT_MS` (padrão 8000 ms). Estouro de tempo é tratado como `UPSTREAM_ERROR`.
- **Rate limit / disponibilidade:** a Open-Meteo aplica fair-use (~10.000 req/dia/IP). O cache em memória (TTL padrão 10 min) por termo de busca (normalizado) e por coordenadas (arredondadas a 2 casas) reduz chamadas e latência. Sem retry automático nesta versão; falha → `502` com orientação de nova tentativa.
- **Idempotência:** ambos os endpoints são `GET` (leitura), portanto idempotentes e seguros para cache.
- **Geolocalização (navegador):** o frontend usa a API `navigator.geolocation` do navegador, mediante permissão. As coordenadas trafegam apenas como parâmetros de `/api/weather`, não são persistidas pelo backend e não passam por geocodificação reversa (recurso inexistente na Open-Meteo).
- **Tratamento de erros:** `openmeteo.client` lança erros de domínio; `services` propagam; `middleware/error-handler` converte para o envelope `ApiError` com o status adequado e registra via `logger`.

## Abordagem de testes

Estratégia conforme `tests.md`: Vitest (unidade/integração) no frontend e backend com cobertura mínima de **80%** (falha na execução abaixo disso); Playwright para E2E em `e2e/`. Mocks apenas para a Open-Meteo (externa) e para `navigator.geolocation`/`fetch` do navegador. Testes independentes, repetíveis (relógio fixo com `vi.setSystemTime`), auto-validados e estruturados em Given/When/Then. Camadas de unidade e integração são obrigatórias; E2E cobre os fluxos críticos.

Ferramentas a adicionar: backend — `vitest`, `@vitest/coverage-v8`, `supertest`, `@types/supertest`; frontend — `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`; `e2e/` — `@playwright/test`. Scripts `test`/`test:coverage` em cada app.

### Testes de unidade

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| TU-01 | `geocode.service` mapeia `results` da Open-Meteo para `GeocodingCandidate[]` | CA-05, CA-09 | Candidatos com campos normalizados (nome/admin1/país/coords) |
| TU-02 | `geocode.service` retorna `[]` quando não há `results` | CA-06 | `candidates` vazio, sem erro |
| TU-03 | `geocode.service` normaliza termo (trim/caixa) e usa a chave de cache correta | CA-09 | Mesma chave para variações de caixa/espaços |
| TU-04 | `weather.service` mapeia `current`+`hourly` e fatia as próximas 6 horas | CA-01, CA-02 | Payload com `current` e 6 itens em `hourly` |
| TU-05 | `weather.service` deriva `precipitationProbability` atual do índice do horário corrente | CA-01 | Valor da hora atual; `null` se ausente |
| TU-06 | `weather.service` lança `UPSTREAM_ERROR` quando `fetchForecast` falha | CA-07 | Erro de domínio propagado |
| TU-07 | `openmeteo.client` aborta a chamada ao exceder o timeout (`AbortController`) | CA-07 | Rejeição por timeout convertida em erro de origem |
| TU-08 | `MemoryCache` retorna valor dentro do TTL e busca novamente após expirar | CA-01 (desempenho) | Hit antes do TTL; miss/refetch depois |
| TU-09 | `config` valida `PORT` numérico e aplica padrões de URL/timeout/TTL | — | Startup falha com `PORT` inválido; padrões corretos |
| TU-10 | `describeWeatherCode` mapeia códigos WMO conhecidos e usa fallback para desconhecido | CA-01 | Rótulo PT-BR + ícone; fallback para código inválido |
| TU-11 | `units` converte °C→°F e km/h→mph e formata com a unidade correta | CA-08 | Valores e sufixos corretos |
| TU-12 | `toCardinalDirection` converte graus em direção cardeal | CA-01 | Ex.: `145` → `SE` |
| TU-13 | `useCitySearch` expõe loading→sucesso com candidatos e estado "não encontrado" | CA-05, CA-06 | Estados corretos conforme resposta |
| TU-14 | `useWeather` busca por coordenadas e expõe dados/loading/erro | CA-01, CA-02, CA-07 | Estados e dados corretos |
| TU-15 | `useGeolocation` retorna coords + status `granted` quando concedido | CA-03 | Coordenadas e status disponíveis |
| TU-16 | `useGeolocation` retorna status `denied`/`unavailable` sem bloquear a busca manual | CA-04 | Nenhum erro impeditivo; busca manual segue funcional |
| TU-17 | `CitySearchForm` envia com Enter e com clique no botão | RF1–RF3 (CA-01) | `onSubmit` chamado com o termo digitado |
| TU-18 | `CurrentWeatherCard` renderiza todas as métricas com nomes/estados acessíveis | CA-01, CA-11 | Textos e `aria-*` presentes |
| TU-19 | `HourlyForecast` renderiza os 6 horários com temperatura, condição e probabilidade | CA-02 | 6 itens visíveis |
| TU-20 | `UnitSelector` alterna unidades e atualiza valores sem nova busca | CA-08 | Valores reexibidos; `fetchWeather` não é chamado de novo |
| TU-21 | `errorHandler` serializa `ApiError` e oculta mensagens de erros inesperados | CA-07 | Status/envelope apropriados, sem detalhes internos |
| TU-22 | `logger` escreve logs JSON estruturados pelo adaptador central | — | Níveis e contexto enviados pelo logger centralizado |
| TU-23 | `registerGracefulShutdown` fecha o servidor uma única vez ao receber sinais repetidos | — | `SIGTERM`/`SIGINT` fecham o servidor uma vez e limpam o timer |
| TU-24 | `registerGracefulShutdown` registra falha quando o fechamento HTTP falha | — | Erro registrado e `process.exitCode` não zero |
| TU-25 | `registerGracefulShutdown` força encerramento quando o fechamento excede o prazo | — | Função de saída chamada com código 1 após timeout |
| TU-26 | `searchCity` constrói parâmetros de geocodificação e decodifica resultados válidos ou vazios | CA-09 | URL contém os parâmetros fixos e resultado é tipado (ou lista vazia) |
| TU-27 | `fetchForecast` envia parâmetros métricos e valida o payload de previsão | CA-01, CA-02 | URL contém variáveis/unidades especificadas e resposta validada |
| TU-28 | Cliente Open-Meteo converte erros HTTP e payloads inválidos em `UPSTREAM_ERROR` | CA-07 | Erro de domínio `502`, sem detalhes da origem |
| TU-29 | `apiRequest` usa a base configurada do backend e valida respostas de sucesso | CA-10 | Requisição aponta ao backend configurado e retorno respeita o validador |
| TU-30 | `apiRequest` converte erros HTTP, de rede e de JSON em `ApiError` | CA-07, CA-10 | Erros tipados e mensagens seguras para exibição |
| TU-31 | `weather-api` chama os endpoints do backend e rejeita contratos inválidos | CA-10 | URLs `/api/geocode` e `/api/weather`; respostas inválidas rejeitadas |
| TU-32 | `useApiHealth` atualiza o estado para online ou offline | — | Estados refletem sucesso e falha do health check |
| TU-33 | `App` anuncia o estado da API com papel acessível `status` | CA-11 | Estado disponível a tecnologias assistivas |

Detalhamento: no backend, testar `services`, `data/openmeteo.client` (com `fetch` mockado), `data/cache` e `config`. No frontend, testar `lib/*` (funções puras), `hooks/*` (com `fetch`/`geolocation` mockados e `renderHook`) e `components/weather/*` (com Testing Library, validando comportamento visível e acessibilidade, sem acoplamento a estilos).

### Testes de integração

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| TI-01 | `GET /api/geocode?city=São Paulo` retorna `200` com candidatos | CA-01, CA-05, CA-09 | Status 200 e `candidates` mapeados (Open-Meteo mockada) |
| TI-02 | `GET /api/geocode` sem `city` retorna `400 INVALID_PARAM` | CA-06 | Status 400 e envelope de erro |
| TI-03 | `GET /api/geocode` sem correspondência retorna `200 { candidates: [] }` | CA-06 | Status 200 e lista vazia |
| TI-04 | `GET /api/geocode` com falha na origem retorna `502 UPSTREAM_ERROR` | CA-07 | Status 502 e envelope de erro |
| TI-05 | `GET /api/weather?lat&lon` retorna `200` com `WeatherData` | CA-01, CA-02 | Status 200, `current` + 6 `hourly` |
| TI-06 | `GET /api/weather` com `lat`/`lon` inválidos retorna `400 INVALID_PARAM` | — | Status 400 e envelope de erro |
| TI-07 | `GET /api/weather` com falha na origem retorna `502 UPSTREAM_ERROR` | CA-07 | Status 502 e envelope de erro |
| TI-08 | `GET /health` permanece `200` após as mudanças | — | Sem regressão do health check |
| TI-09 | Cache evita segunda chamada à Open-Meteo dentro do TTL | CA-01 (desempenho) | Cliente externo chamado 1x para 2 requisições iguais |

Detalhamento: usar Supertest contra o `app` Express, com `openmeteo.client` (ou `fetch`) mockado para respostas determinísticas; validar status HTTP, payloads e o envelope de erro. Sem rede real.

### Testes E2E

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| E2E-01 | Buscar cidade com candidato único exibe clima atual + 6 h | CA-01, CA-02 | Painel completo visível |
| E2E-02 | Buscar cidade ambígua exibe lista; selecionar carrega o clima | CA-05 | Lista exibida; seleção carrega painel |
| E2E-03 | Cidade inexistente exibe mensagem "não encontrada" | CA-06 | Mensagem visível; nova busca possível |
| E2E-04 | Backend/origem indisponível exibe erro amigável + "Tentar novamente" | CA-07 | Erro sem detalhes técnicos; ação disponível |
| E2E-05 | Alternar unidades atualiza valores exibidos | CA-08 | °C/°F e km/h/mph reexibidos sem nova busca |
| E2E-06 | Geolocalização concedida carrega "Minha localização" | CA-03 | Clima carregado a partir das coordenadas |
| E2E-07 | Geolocalização negada mantém a busca manual funcional | CA-04 | Sem bloqueio; digitação funciona |
| E2E-08 | Navegação por teclado/acessibilidade na busca e na lista | CA-11 | Elementos alcançáveis e anunciados |

Detalhamento: Playwright em `e2e/`. Para determinismo e velocidade, interceptar `/api/geocode` e `/api/weather` com `page.route` retornando fixtures (evita depender da Open-Meteo em CI). Geolocalização simulada com `context.setGeolocation` + `context.grantPermissions` (concedido) e permissão negada para o caso de recusa. As specs validam a perspectiva do usuário (textos visíveis, papéis acessíveis).

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Fundação do backend**: `config.ts`, `logger.ts`, `types/*`, envelope `ApiError`, `middleware/error-handler.ts`; ajustar `index.ts` (rotas, graceful shutdown) e corrigir a falha de build (`_req`/`_next`). Base necessária para tudo.
2. **Camada de dados**: `data/cache.ts` e `data/openmeteo.client.ts` (fetch + `AbortController`/timeout). Depende de `config`/`logger`/`types`.
3. **Serviços**: `geocode.service.ts` e `weather.service.ts` (mapeamento, fatiamento 6 h, derivação de probabilidade, cache). Depende da camada de dados.
4. **Rotas**: `weather.routes.ts` com validação de `city`/`lat`/`lon`. Depende dos serviços.
5. **Testes de backend**: unidade (services/data/config) + integração (Supertest), com mocks da Open-Meteo; atingir 80%.
6. **Fundação do frontend**: `VITE_API_URL` + `.env.example`; `services/api.ts` e `services/weather-api.ts`; `types/*`; `lib/weather-codes.ts` e `lib/units.ts`. Depende do contrato do backend.
7. **Hooks**: `useCitySearch`, `useWeather`, `useGeolocation`, `useUnits`. Dependem dos services/lib.
8. **Componentes + view**: `components/weather/*` e `WeatherDashboardView`; ligar em `App.tsx`. Depende de hooks.
9. **Testes de frontend**: unidade (lib/hooks) + componentes (Testing Library); atingir 80%.
10. **E2E**: criar `e2e/` (Playwright config + fixtures) e specs dos fluxos críticos.
11. **Validação final**: `frontend` (`lint`, `typecheck`, `build`, `test`), `backend` (`build`, `test`), `e2e` (`test`).

### Dependências técnicas

- **Backend**: `fetch` global do Node (Node 18+); adicionar `vitest`, `@vitest/coverage-v8`, `supertest`, `@types/supertest` (dev). Configurar `test`/`coverage` no `package.json` e thresholds no Vitest.
- **Frontend**: `lucide-react` (já presente) para ícones; adicionar `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` (dev); configurar `test` no `vite.config.ts`.
- **E2E**: nova pasta `e2e/` com `package.json` próprio (não há `package.json` na raiz), `@playwright/test` e `playwright.config.ts`; web servers de frontend/backend ou mocks via `page.route`.
- **Infra externa**: Open-Meteo Geocoding + Forecast (sem chave). Não há nova dependência de geocodificação reversa (fluxo degradado).
- **Lock files**: atualizar `package-lock.json` de cada app via `npm install` (regra `node.md`).

## Monitoramento e observabilidade

- **Health check**: manter `GET /health` (status + timestamp). Pode ser estendido com `uptime` sem quebrar consumidores.
- **Logging centralizado** (`logger.ts`, único uso de `console.*`): 
  - `info`: inicialização (porta), shutdown.
  - `info`/`debug`: chamadas à Open-Meteo com duração e resultado (hit/miss de cache), sem registrar coordenadas exatas do usuário em nível `info` (privacidade — PRD).
  - `warn`: busca sem correspondência; resposta degradada (probabilidade `null`).
  - `error`: falhas/timeout na origem e erros internos, com contexto (rota, duração), sem expor dados sensíveis.
- **Métricas mínimas**: duração das chamadas externas e taxa de hit de cache (logadas), suficientes para acompanhar a meta de 3 s p95 e o consumo do rate limit.
- Nenhum dado de geolocalização é persistido; logs evitam coordenadas precisas em níveis padrão.

## Considerações técnicas

### Principais decisões

- **Dois endpoints (`/api/geocode` + `/api/weather`)** em vez de um agregado: separa responsabilidades, permite reuso do clima por coordenadas (fluxo de geolocalização sem geocodificação) e mantém contratos simples. Trade-off: o fluxo de busca faz duas chamadas, o que é aceitável e ainda cabe na meta de 3 s p95.
- **Backend métrico + conversão no frontend**: atende RF22 (trocar unidades sem nova busca) e mantém o backend agnóstico de apresentação. Alternativa descartada: parâmetro `units` no backend (exigiria refetch/cache por unidade).
- **Mapeamento WMO → texto/ícone no frontend**: apresentação é preocupação do cliente; `lucide-react` já é dependência. Backend retorna o código numérico estável.
- **Cache em memória de curto TTL**: mitiga rate limit (~10k/dia/IP) e latência; simples e sem dependência externa. Trade-off: por processo, não compartilhado; aceitável para o escopo. Alternativa descartada: cache externo/Redis (complexidade desnecessária).
- **`fetch` nativo + `AbortController`**: evita nova biblioteca HTTP; atende `node.md` (I/O assíncrono, não bloquear o event loop).
- **Geolocalização degradada para "Minha localização"**: a Open-Meteo não tem geocodificação reversa; optou-se por não adicionar serviço externo. Desvio da RF17 ("sugerir a cidade"), registrado e justificado.
- **E2E com interceptação de rede**: determinismo e velocidade em CI, sem depender da Open-Meteo.

### Riscos conhecidos

- **`precipitation_probability` ausente em `current`**: mitigado derivando do `hourly` no horário atual e normalizando para `null`; UI trata a ausência.
- **Fatiamento das 6 h perto da meia-noite/fuso**: mitigado pedindo `forecast_days=2` e selecionando a partir do índice `>= current.time`; coberto por TU-04.
- **Rate limit/indisponibilidade da Open-Meteo**: mitigado por cache e timeout; sem retry nesta versão. Área para evolução futura se necessário.
- **Flakiness de E2E com API real**: mitigado por `page.route` com fixtures.
- **Build do backend quebrado (`noUnusedParameters`)**: corrigido com prefixo `_` nos parâmetros não usados; novos handlers devem evitar parâmetros ociosos.
- **Ausência total de infra de testes**: a configuração adiciona dependências e scripts; risco de setup inicial, mitigado seguindo `tests.md` e validando cobertura ≥ 80%.
- **Privacidade de coordenadas**: não persistir e não logar coordenadas precisas em nível padrão.

### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules em `.agents/rules/` (`code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md`, `tests.md`). Restrições e decisões relevantes aplicadas:

- **folder-structure**: backend em `routes/ → services/ → data/`, contratos em `types/` (um conceito por arquivo); frontend em `views/ → components/hooks → services`, utilitários em `lib/`, tipos em `types/`; E2E em `e2e/` (fora de frontend/backend). Sem regra de negócio em rotas/components/views; acesso ao backend só em `services/`.
- **code-standards**: arquivos ≤ 100 linhas e funções ≤ 30 linhas (componentes/serviços pequenos e coesos); ≤ 3 parâmetros (agrupados em objetos, ex.: `Coordinates`); cláusulas de guarda; constantes nomeadas para limites (timeout, TTL, `FORECAST_HOURS = 6`); sem comentários; segredos/URLs em `.env` (`.env.example` sem valores reais).
- **javascript-typescript**: `const` por padrão; `===`/`!==`; proibido `any` (usar `unknown` + validação de entrada externa nos mapeadores da Open-Meteo); tipagem explícita de parâmetros/retornos e `Promise<T>`; arrow functions em callbacks; imutabilidade (novos objetos/arrays).
- **node**: `async/await`; não bloquear o event loop (I/O assíncrono, sem `*Sync` no fluxo); `dotenv` + validação de variáveis na inicialização; _graceful shutdown_ idempotente (`SIGTERM`/`SIGINT`); logging centralizado; `npm` + lock files versionados; sem referências circulares (`configuração → rotas → serviços → dados → tipos`).
- **tests**: Vitest no frontend/backend, Playwright em `e2e/`, cobertura mínima 80% com falha abaixo disso; FIRST; Given/When/Then; mocks só para externos; casos nomeados e associados a `CA-*`.
- **AGENTS.md (observações)**: extrair a URL da API do frontend para variável de ambiente (`VITE_API_URL`) em vez de manter `http://localhost:3000` fixo; executar `lint`/`typecheck`/`build`/`test` nos apps afetados; no backend `npm run build` e `npm run test`.

### Conformidade com skills

Skills do projeto (`.agents/skills/`) aplicáveis a esta especificação:

- **`react` (obrigatória para o frontend)**: aplicada no desenho — componentes pequenos (≤ 30 linhas) e de responsabilidade única; props explícitas (sem spread); hooks com prefixo `use`; `useEffect` apenas para sincronizar com sistemas externos (fetch e `navigator.geolocation`), sem efeitos para valores derivados; acesso ao backend isolado em `services/` + hooks; acessibilidade com elementos semânticos e `aria-*` (busca, lista de cidades, estados assíncronos via `aria-live`/`aria-busy`); estilização com Tailwind e reuso de `components/ui/button.tsx`. Sem desvios.
- **`impeccable`**: disponível para o refinamento de UI/UX durante a implementação (hierarquia visual, estados, responsividade); não aplicada nesta fase de especificação. Sem desvios.
- **`executar-task`, `executar-review`, `executar-qa`**: skills de processo para as fases seguintes (implementação, revisão e QA) a partir desta TechSpec; não aplicáveis à redação da especificação.
- **`criar-techspec`**: skill em execução; estrutura do `references/TEMPLATE.md` seguida integralmente.

### Arquivos relevantes e dependentes

Backend (novos):

- `backend/src/config.ts`
- `backend/src/logger.ts`
- `backend/src/routes/weather.routes.ts`
- `backend/src/services/geocode.service.ts`
- `backend/src/services/weather.service.ts`
- `backend/src/data/openmeteo.client.ts`
- `backend/src/data/openmeteo.parser.ts`
- `backend/src/data/cache.ts`
- `backend/src/middleware/error-handler.ts`
- `backend/src/types/geocoding-candidate.ts`
- `backend/src/types/weather.ts`
- `backend/src/types/open-meteo.ts`
- `backend/src/types/api-error.ts`

Backend (modificados):

- `backend/src/index.ts` (rotas, graceful shutdown, logger, correção do build)
- `backend/package.json` (scripts `test`/`test:coverage`; devDeps de teste)
- `backend/tsconfig.json` (ajustes se necessários p/ testes)
- `backend/.env.example` (novo conteúdo: `PORT`, URLs, timeout, TTL)

Frontend (novos):

- `frontend/src/views/WeatherDashboardView.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/services/health-api.ts`
- `frontend/src/services/weather-api.ts`
- `frontend/src/services/weather-api.validation.ts`
- `frontend/src/hooks/useApiHealth.ts`
- `frontend/src/hooks/useCitySearch.ts`
- `frontend/src/hooks/useWeather.ts`
- `frontend/src/hooks/useGeolocation.ts`
- `frontend/src/hooks/useUnits.ts`
- `frontend/src/lib/weather-codes.ts`
- `frontend/src/lib/units.ts`
- `frontend/src/components/weather/CitySearchForm.tsx`
- `frontend/src/components/weather/CityCandidateList.tsx`
- `frontend/src/components/weather/CurrentWeatherCard.tsx`
- `frontend/src/components/weather/HourlyForecast.tsx`
- `frontend/src/components/weather/WeatherMetric.tsx`
- `frontend/src/components/weather/UnitSelector.tsx`
- `frontend/src/components/weather/LocationButton.tsx`
- `frontend/src/components/weather/WeatherIcon.tsx`
- `frontend/src/components/weather/StatusMessage.tsx`
- `frontend/src/types/geocoding-candidate.ts`
- `frontend/src/types/weather.ts`
- `frontend/src/types/units.ts`
- `frontend/src/types/weather-code.ts`

Frontend (modificados):

- `frontend/src/App.tsx` (renderiza a view; usa `VITE_API_URL`)
- `frontend/package.json` (scripts de teste; devDeps)
- `frontend/vite.config.ts` (configuração de `test`/coverage do Vitest)
- `frontend/.env.example` (novo: `VITE_API_URL`)

E2E (novos):

- `e2e/package.json`
- `e2e/playwright.config.ts`
- `e2e/weather-dashboard.spec.ts`
- `e2e/fixtures/*.json` (respostas de `/api/geocode` e `/api/weather`)

Reutilizados (existentes):

- `frontend/src/components/ui/button.tsx`
- `frontend/src/lib/utils.ts` (`cn`)
- `frontend/tailwind.config.js`, `frontend/src/index.css` (tema/cores)
- `backend` `GET /health` (mantido)
