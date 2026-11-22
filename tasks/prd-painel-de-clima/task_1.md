# Tarefa 1.0: Backend — infra de testes + fundação

## Visão geral

Prepara a base do backend para a funcionalidade: configura Vitest + Supertest com cobertura mínima de 80%, cria configuração de ambiente validada, logger centralizado, tipos de domínio, o envelope de erro `ApiError` e o middleware de tratamento de erros. Também corrige a falha de build existente em `index.ts` (`noUnusedParameters`), adiciona _graceful shutdown_ e mantém o `GET /health` sem regressão. Não há regra de negócio nesta tarefa.

<skills>
### Conformidade com skills

Nenhuma skill de `.agents/skills` é específica para backend (a skill `react` aplica-se apenas ao frontend). Esta tarefa segue exclusivamente as rules em `.agents/rules/`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules. Relevantes aqui:

- `node.md`: `dotenv` com validação de variáveis na inicialização; _graceful shutdown_ idempotente (`SIGTERM`/`SIGINT`); logging centralizado (único uso de `console.*`); `npm` + lock files versionados; sem referências circulares (`configuração → rotas → serviços → dados → tipos`).
- `code-standards.md`: arquivos ≤ 100 linhas e funções ≤ 30 linhas; constantes nomeadas para limites/valores (timeout, TTL); sem comentários; dados sensíveis/URLs em `.env` com `.env.example` sem valores reais.
- `javascript-typescript.md`: `const` por padrão; `===`/`!==`; proibido `any`; tipagem explícita e `Promise<T>`.
- `tests.md`: Vitest para unidade/integração; cobertura mínima 80% com falha abaixo disso; FIRST; Given/When/Then; mocks apenas para externos.
- `folder-structure.md`: backend em camadas (`routes/`, `services/`, `data/`, `types/`); um conceito por arquivo em `types/`; testes próximos ao código em `src/`.
- `AGENTS.md`: corrigir o build do backend (`_req`/`_next`); executar `npm run build` e `npm run test` ao final.
</rules>

<requirements>
- RF6 (o backend é a única fonte de dados para o frontend — esta tarefa cria a base dos endpoints).
- Restrição técnica: reuso da stack existente (Express 5 + TypeScript) e configuração via variáveis de ambiente.
- Base para CA-07 (envelope de erro amigável e centralizado).
</requirements>

## Subtarefas

- [x] 1.1 Configurar Vitest + Supertest no backend: devDeps (`vitest`, `@vitest/coverage-v8`, `supertest`, `@types/supertest`), scripts `test`/`test:coverage`, threshold de cobertura 80%; atualizar `package-lock.json` via `npm install`.
- [x] 1.2 Criar `backend/src/config.ts` (`PORT`, `GEOCODING_API_URL`, `FORECAST_API_URL`, `OPEN_METEO_TIMEOUT_MS=8000`, `CACHE_TTL_MS=600000`) com validação na inicialização e `backend/.env.example`.
- [x] 1.3 Criar `backend/src/logger.ts` (adaptador centralizado).
- [x] 1.4 Criar `backend/src/types/`: `api-error.ts`, `geocoding-candidate.ts`, `weather.ts`, `open-meteo.ts` (um conceito por arquivo).
- [x] 1.5 Criar `backend/src/middleware/error-handler.ts` (converte `ApiError` em status/payload HTTP).
- [x] 1.6 Refatorar `backend/src/index.ts`: corrigir build (`_req`/`_next`), registrar `/health` + router, usar logger e implementar _graceful shutdown_.
- [x] 1.7 Separar a criação do `app` do `listen` (ex.: `backend/src/app.ts`) para permitir testes com Supertest.
- [x] 1.8 Implementar os casos de teste desta tarefa (incluindo logger, middleware e ciclo de shutdown) e validar cobertura.

## Detalhes de implementação

Ver `techspec.md`: "Arquitetura do sistema" (backend), "Modelos de dados › `ApiError`", "Considerações técnicas › Principais decisões", "Considerações técnicas › Conformidade com o AGENTS.md e as rules", "Sequenciamento do desenvolvimento › Ordem de construção" (item 1) e "Dependências técnicas" (backend).

## Critérios de aceitação relacionados

- CA-07 (base: envelope/middleware de erro que fundamenta as mensagens amigáveis)

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-09 — `config` valida `PORT` numérico e aplica padrões de URL/timeout/TTL
- [x] TU-21 — `errorHandler` serializa `ApiError` e oculta mensagens de erros inesperados
- [x] TU-22 — `logger` escreve logs JSON estruturados pelo adaptador central
- [x] TU-23 — `registerGracefulShutdown` fecha o servidor uma única vez ao receber sinais repetidos
- [x] TU-24 — `registerGracefulShutdown` registra falha quando o fechamento HTTP falha
- [x] TU-25 — `registerGracefulShutdown` força encerramento quando o fechamento excede o prazo

### Testes de integração (se aplicável)

- [x] TI-08 — `GET /health` permanece `200` após as mudanças

### Testes E2E (se aplicável)

- Não aplicável.

## Arquivos relevantes

- `backend/src/config.ts` (novo)
- `backend/src/logger.ts` (novo)
- `backend/src/types/api-error.ts` (novo)
- `backend/src/types/geocoding-candidate.ts` (novo)
- `backend/src/types/weather.ts` (novo)
- `backend/src/types/open-meteo.ts` (novo)
- `backend/src/middleware/error-handler.ts` (novo)
- `backend/src/app.ts` (novo, se separar app/listen)
- `backend/src/server-lifecycle.ts` (novo)
- `backend/src/routes/weather.routes.ts` (router registrado; endpoints entram nas tarefas 3 e 4)
- `backend/src/index.ts` (modificado)
- `backend/vitest.config.mts` (novo)
- `backend/package.json`, `backend/package-lock.json`, `backend/tsconfig.json` (modificados)
- `backend/.env.example` (novo)
- `backend/src/config.test.ts`, `backend/src/app.test.ts`, `backend/src/logger.test.ts`, `backend/src/middleware/error-handler.test.ts`, `backend/src/server-lifecycle.test.ts` (testes)
