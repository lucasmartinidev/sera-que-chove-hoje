# Relatório de revisão de código — Painel de Clima

## Resumo
- Data: 2026-11-23
- Branch: main
- Status: APROVADO COM RESSALVAS

## Conformidade com regras
| Regra | Status | Observações |
|------|--------|-------------|
| `code-standards.md` | OK | Camadas respeitadas, limites de arquivos/funções atendidos e warning do Fast Refresh eliminado ao separar as variantes do botão. |
| `javascript-typescript.md` | OK | Sem `any`, comparações explícitas, validação de entradas externas e retornos tipados. |
| `node.md` | OK | `async/await`, `fetch` com timeout, shutdown idempotente, logger centralizado e lock files preservados. |
| `folder-structure.md` | OK | Backend em `routes/services/data/types`, frontend em `views/components/hooks/services` e E2E separado. |
| `tests.md` | OK | Vitest, Testing Library e Playwright; cobertura acima de 80%; testes independentes e mocks apenas para integrações externas. |
| Skill `react` | OK | Acesso ao backend isolado, componentes sem spread de props, estados assíncronos anunciados e proteção contra respostas obsoletas. |

## Aderência à TechSpec
| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| Separação de camadas backend/frontend | SIM | Rotas delegam aos serviços; serviços usam cliente/cache; views usam hooks/services. |
| `GET /api/geocode` e `GET /api/weather` | SIM | Validações, envelopes de erro e contratos implementados. |
| Cliente Open-Meteo com `fetch` e `AbortController` | SIM | URLs, parâmetros métricos, timeout e normalização de payloads implementados. |
| Cache em memória com TTL | SIM | Cache por cidade/coordenadas; entradas expiradas são limpas durante novas gravações. |
| WeatherData métrico com previsão de 6 horas | SIM | Probabilidade atual é derivada da série horária e valores ausentes viram `null`. |
| Frontend via `VITE_API_URL` | SIM | Nenhuma chamada direta do navegador à Open-Meteo. |
| Busca, seleção, geolocalização e unidades | SIM | Consultas concorrentes não permitem respostas antigas sobrescreverem o estado atual. |
| Acessibilidade e responsividade | SIM | Formulário, lista dinâmica, estados assíncronos, teclado e previsão mobile cobertos. |
| Observabilidade | SIM | Logs estruturados incluem duração, resultado da chamada externa e hit/miss de cache sem coordenadas precisas. |

## Tarefas verificadas
| Tarefa | Status | Observações |
|------|--------|-------------|
| 1.0 Backend: infra e fundação | COMPLETA | Config, logger, tipos, erros, health, shutdown, app separado e testes presentes. |
| 2.0 Backend: cache e cliente Open-Meteo | COMPLETA | Cache TTL, timeout, parser de `unknown`, parâmetros fixos e testes de payload inválido presentes. |
| 3.0 Backend: geocodificação | COMPLETA | Serviço, rota, normalização, cache, mapeamento e testes unitários/integrados presentes. |
| 4.0 Backend: clima | COMPLETA | Serviço, rota, fatiamento, derivação da probabilidade, contrato métrico e testes presentes. |
| 5.0 Frontend: fundação | COMPLETA | Serviços, validações, tipos, utilitários, configuração por ambiente e testes presentes. |
| 6.0 Frontend: hooks | COMPLETA | Busca, clima, geolocalização, unidades, retry e proteção contra respostas obsoletas implementados e testados. |
| 7.0 Frontend: componentes e view | COMPLETA | Fluxos, estados, acessibilidade, ícone noturno, unidades e responsividade implementados e testados. |
| 8.0 E2E com Playwright | COMPLETA | 10 fluxos funcionais/regressivos passam; evidências são executadas separadamente por `test:evidence`. |

## Testes
- Total de testes: 78 (34 frontend, 29 backend, 10 E2E funcionais, 5 de evidências)
- Passando: 78
- Falhando: 0
- Cobertura: frontend 94,64% statements / 87,76% branches / 98% functions / 96,86% lines; backend 96,62% statements / 93,29% branches / 100% functions / 99,16% lines; meta 80%

Comandos executados:
- `frontend`: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`
- `backend`: `npm run build`, `npm test`
- `e2e`: `npm run typecheck`, `E2E_BACKEND_PORT=3001 E2E_FRONTEND_PORT=5101 npm test`, `E2E_BACKEND_PORT=3001 E2E_FRONTEND_PORT=5101 npm run test:evidence`

## Problemas encontrados
| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| Alta | `frontend/src/hooks/useCitySearch.ts:22-39`, `frontend/src/hooks/useWeather.ts:21-34` | estado assíncrono | Respostas antigas podiam sobrescrever buscas/climas mais novos. Corrigido com identificadores de requisição e testes de concorrência. | Manter os testes de ordem invertida. |
| Média | `frontend/src/components/weather/CityCandidateList.tsx:17`, `frontend/src/views/WeatherDashboardView.tsx:28` | lista/status | Resultados dinâmicos não eram anunciados adequadamente e o status usava rótulo não localizado. Corrigido com `aria-live` e nomes PT-BR. | Manter cobertura de leitor de tela no QA. |
| Média | `frontend/src/components/weather/WeatherIcon.tsx:4-12`, `frontend/src/lib/weather-codes.ts:48-56` | ícone atual | `isDay` era ignorado. Corrigido com ícones diurnos/noturnos e teste correspondente. | — |
| Média | `backend/vitest.config.mts:7-16`, `frontend/package.json:12-13` | cobertura | O comando padrão não aplicava cobertura e o entrypoint backend era excluído. Corrigido: `npm test` aplica coverage e `index.ts` possui teste. | — |
| Média | `backend/src/data/openmeteo.parser.ts:27-29,53-66` | parser | Timestamps arbitrários eram aceitos como payload válido. Corrigido com validação ISO/parseável e teste de erro upstream. | — |
| Baixa | `backend/src/data/cache.ts:23-34`, `backend/src/data/openmeteo.client.ts:41-58` | operação/cache | Havia limpeza limitada de entradas expiradas e ausência de logs de duração/hit/miss. Corrigido com limpeza no `set` e logging estruturado. | Evoluir para métricas dedicadas se o volume exigir. |
| Baixa | `e2e/weather-dashboard.spec.ts:4-111`, `e2e/playwright.config.ts:9-16` | E2E | Asserções de CA-01/CA-06/CA-09 eram incompletas e o spec de evidências alterava arquivos na execução normal. Corrigido com asserções adicionais, fixture consistente e script separado. | Atualizar a TechSpec/task 8 para listar E2E-09/E2E-10 e `test:evidence`. |

## Pontos positivos
- Contratos externos são validados como `unknown` antes do mapeamento.
- O frontend não acessa diretamente a Open-Meteo.
- Os fluxos de erro, retry, geolocalização negada e alternância de unidades estão cobertos.
- O shutdown, os limites de entrada e os envelopes de erro são testados sem rede real.
- Os serviços E2E usam portas isoladas e foram encerrados graciosamente após a execução.

## Recomendações
- Transformar a medição de p95 de `qa.md` em uma verificação reproduzível de performance; a suíte atual valida comportamento, não a meta estatística de 3 segundos.
- Documentar explicitamente que a versão atual do Playwright requer Node.js 20 ou superior no README/pré-requisitos do E2E.
- Alinhar a TechSpec e `task_8.md` com os testes regressivos E2E-09/E2E-10 e o comando separado de evidências.

## Conclusão
Revisão aprovada com ressalvas não bloqueantes. Os problemas funcionais, de acessibilidade, cobertura, validação externa, concorrência e execução E2E encontrados durante a revisão foram corrigidos e revalidados. Todos os testes aplicáveis passaram, os builds passaram e a cobertura excede a meta de 80%; permanecem apenas as recomendações de automação de performance e atualização documental.
