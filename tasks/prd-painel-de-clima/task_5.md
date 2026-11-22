# Tarefa 5.0: Frontend — infra de testes + fundação

## Visão geral

Prepara a base do frontend: configura Vitest + Testing Library + jsdom com cobertura mínima de 80%, extrai a URL da API para `VITE_API_URL` (removendo o endereço fixo), cria os serviços de acesso ao backend (`api.ts`, `weather-api.ts`), os tipos que espelham os contratos e as bibliotecas de apresentação (`lib/weather-codes.ts` e `lib/units.ts`). Todo acesso ao backend fica isolado em `services/` (nunca em components/views). Depende dos contratos do backend (tarefas 1–4).

<skills>
### Conformidade com skills

- `react` (obrigatória para qualquer código do frontend): acesso ao backend isolado em módulos próprios (`services/`), separado do código visual; utilitários puros em `lib/`; tipagem explícita; componentes/hooks virão nas tarefas 6–7 seguindo a mesma skill.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules. Relevantes aqui:

- `AGENTS.md`: extrair a URL da API do frontend para variável de ambiente (`VITE_API_URL`) em vez de manter `http://localhost:3000` fixo; executar `npm run lint`, `npm run typecheck`, `npm run build` e `npm run test` ao final.
- `folder-structure.md`: `services/` para acesso ao backend; `types/` com um conceito por arquivo; sem acesso direto ao backend em `components`/`views`.
- `javascript-typescript.md`: proibido `any`; validação de respostas externas (`unknown`); `Promise<T>`; `const`; `===`; imutabilidade.
- `code-standards.md`: funções ≤ 30 linhas; constantes nomeadas (mapa WMO, fatores de conversão); sem comentários; segredos/URLs em `.env` com `.env.example`.
- `tests.md`: Vitest + Testing Library; cobertura ≥ 80%; testar comportamento; mocks apenas para `fetch`.
</rules>

<requirements>
- RF6 (frontend consome exclusivamente o backend).
- CA-08 (conversão de unidades disponível no frontend) e CA-10 (nenhuma chamada direta do navegador à Open-Meteo).
- Restrição: dados do backend sempre em unidades métricas; conversão local no cliente.
</requirements>

## Subtarefas

- [x] 5.1 Configurar Vitest + Testing Library + jsdom no frontend: devDeps (`vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`), config de `test`/coverage em `vite.config.ts` (threshold 80%), scripts `test`/`test:coverage`; atualizar lock file.
- [x] 5.2 Criar `frontend/.env.example` com `VITE_API_URL=http://localhost:3000` e ler via `import.meta.env.VITE_API_URL` nos serviços do backend.
- [x] 5.3 Criar `frontend/src/services/api.ts` (cliente HTTP base: base URL, tratamento do envelope `ApiError`).
- [x] 5.4 Criar `frontend/src/services/weather-api.ts` — `searchCity(city)` → `/api/geocode`; `fetchWeather(lat, lon)` → `/api/weather`, com retornos tipados.
- [x] 5.5 Criar `frontend/src/types/`: `geocoding-candidate.ts`, `weather.ts`, `units.ts`, `weather-code.ts`.
- [x] 5.6 Criar `frontend/src/lib/weather-codes.ts` — `describeWeatherCode(code)` → `{ labelPtBr, icon }` (lucide-react) + fallback.
- [x] 5.7 Criar `frontend/src/lib/units.ts` — `formatTemperature`, `formatWindSpeed`, `toCardinalDirection` e conversões (°C→°F, km/h→mph).
- [x] 5.8 Implementar testes de unidade das funções puras de `lib/`.
- [x] 5.9 Remover URL fixa do health check existente: criar `services/health-api.ts` e `hooks/useApiHealth.ts`, e atualizar `App.tsx` para consumir o hook.
- [x] 5.10 Implementar testes dos serviços de API, hook de health e estado acessível de `App`.

## Detalhes de implementação

Ver `techspec.md`: "Arquitetura do sistema" (frontend), "Principais interfaces" (frontend), "Modelos de dados" (contratos espelhados), "Considerações técnicas › Conformidade com skills › `react`", "Sequenciamento › Ordem de construção" (item 6) e "Dependências técnicas" (frontend).

## Critérios de aceitação relacionados

- CA-08
- CA-10

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-10 — `describeWeatherCode` mapeia códigos WMO conhecidos e usa fallback para desconhecido
- [x] TU-11 — `units` converte °C→°F e km/h→mph e formata com a unidade correta
- [x] TU-12 — `toCardinalDirection` converte graus em direção cardeal
- [x] TU-29 — `apiRequest` usa a base configurada do backend e valida respostas de sucesso
- [x] TU-30 — `apiRequest` converte erros HTTP, de rede e de JSON em `ApiError`
- [x] TU-31 — `weather-api` chama os endpoints do backend e rejeita contratos inválidos
- [x] TU-32 — `useApiHealth` atualiza o estado para online ou offline
- [x] TU-33 — `App` anuncia o estado da API com papel acessível `status`

### Testes de integração (se aplicável)

- Não aplicável.

### Testes E2E (se aplicável)

- Não aplicável (coberto na tarefa 8).

## Arquivos relevantes

- `frontend/src/services/api.ts`, `frontend/src/services/health-api.ts` (novos)
- `frontend/src/services/weather-api.ts`, `frontend/src/services/weather-api.validation.ts` (novos)
- `frontend/src/hooks/useApiHealth.ts` (novo)
- `frontend/src/App.tsx` (modificado para remover URL fixa)
- `frontend/src/types/geocoding-candidate.ts`, `weather.ts`, `units.ts`, `weather-code.ts` (novos)
- `frontend/src/lib/weather-codes.ts`, `frontend/src/lib/units.ts` (novos)
- `frontend/vite.config.ts`, `frontend/package.json`, `frontend/package-lock.json` (modificados)
- `frontend/eslint.config.js` (ignora os relatórios gerados em `coverage/`)
- `frontend/.env.example` (novo)
- `frontend/src/test/setup.ts` (novo)
- `frontend/src/lib/weather-codes.test.ts`, `frontend/src/lib/units.test.ts`, `frontend/src/services/*.test.ts`, `frontend/src/hooks/useApiHealth.test.ts`, `frontend/src/App.test.tsx` (testes)
