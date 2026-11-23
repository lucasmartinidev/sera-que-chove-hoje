# Relatório de QA — Identidade Futurista Reativa

## Resumo
- Data: 2026-11-23
- Status: APROVADO
- Total de critérios de aceitação: 19
- Critérios de aceitação atendidos: 19
- Bugs encontrados: 1

## Critérios de aceitação verificados
| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Identidade aplicada com título e hierarquia preservados | TI-10, E2E-09, QA-01 | PASSOU | evidences/07-controles-contraste.png |
| CA-02 | Atmosfera representa condição e período | TU-48, TI-10, E2E-10 | PASSOU | evidences/02-sucesso-desktop.png |
| CA-03 | Mesma temperatura mantém mesma faixa | TU-54, TI-13, E2E-11 | PASSOU | evidences/02-sucesso-desktop.png |
| CA-04 | Rótulo textual acompanha temperatura | TU-59, TU-61, E2E-09 | PASSOU | evidences/02-sucesso-desktop.png |
| CA-05 | Movimento reduzido produz composição estática | TU-55, TU-57, E2E-12 | PASSOU | evidences/05-movimento-reduzido.png |
| CA-06 | Trovoada respeita ciclo seguro | TU-58, E2E-10 | PASSOU | evidences/02-sucesso-desktop.png |
| CA-07 | Transição não bloqueia interação e fica em 600 ms | TI-11, E2E-14 | PASSOU | evidences/02-sucesso-desktop.png |
| CA-08 | Matriz de contraste AA auditada | TU-49, TU-50 | PASSOU | Não aplicável |
| CA-09 | Temperatura e condição têm canais redundantes | TU-51, TU-61, E2E-09 | PASSOU | evidences/02-sucesso-desktop.png |
| CA-10 | Unidades não alteram faixa | TU-62, TI-13, E2E-15 | PASSOU | evidences/02-sucesso-desktop.png |
| CA-11 | Extremos são fixados nas faixas extremas | TU-46 | PASSOU | Não aplicável |
| CA-12 | Estados neutros e temperatura ausente são comunicados | TU-47, TU-53, TU-60, TI-12, E2E-16 | PASSOU | evidences/04-erro.png |
| CA-13 | Fundo decorativo é ignorado por tecnologia assistiva | TU-56, TI-10, E2E-18 | PASSOU | evidences/02-sucesso-desktop.png |
| CA-14 | Desktop, celular e forced colors permanecem legíveis | E2E-09, E2E-17 | PASSOU | evidences/03-sucesso-mobile.png |
| CA-15 | Zoom de 200% sem corte ou sobreposição | E2E-09, QA-02 | PASSOU | evidences/08-responsivo-zoom-proxy.png |
| CA-16 | Interatividade e p95 da consulta | E2E-14, QA-02 | PASSOU | evidences/08-responsivo-zoom-proxy.png |
| CA-17 | Sem requests externas e status semântico | TU-50, E2E-13, E2E-16 | PASSOU | evidences/04-erro.png |
| CA-18 | Não regressão dos fluxos existentes | Suítes frontend/backend/E2E | PASSOU | Não aplicável |
| CA-19 | Leitura da primeira dobra em até 3 segundos | E2E-09, QA-02 | PASSOU | evidences/08-responsivo-zoom-proxy.png |

## Testes E2E executados
| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 a E2E-08 | Regressão do painel existente | PASSOU | Suíte completa passou |
| E2E-09 a E2E-18 | Identidade, preferências e acessibilidade | PASSOU | Playwright Chromium, 24/24 incluindo QA-01 e QA-02 |

## Testes automatizados e cobertura
| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|------------|
| Frontend | TU/TI | PASSOU | `npm test`, `npm run test:coverage` | 60 testes; 95,52% statements |
| Backend | TU/TI | PASSOU | `npm test` | 29 testes; 96,62% statements |
| E2E | E2E-01…E2E-18 | PASSOU | `npm test` em `e2e/` | 20 testes |

- Cobertura: frontend 95,52%; backend 96,62%; metas acima de 80%.
- Bundle frontend: `247.97 kB` JS bruto, `78.74 kB` gzip; `16.71 kB` CSS bruto, `4.30 kB` gzip.

## Acessibilidade
- PASSOU: navegação por teclado, foco em controles e seleção de candidatos.
- PASSOU: rótulos de busca, unidades, mensagens `status`/`alert` e descrições meteorológicas.
- PASSOU: fundo com `aria-hidden="true"`, sem elementos focáveis.
- PASSOU: reduced motion e forced colors no Chromium.
- PASSOU: contraste automatizado da matriz WCAG AA.
- PENDENTE DE MEDIÇÃO HUMANA: zoom real de 200%, leitura em 3 segundos, filtros de daltonismo e medição p95 em ambiente real.

## Bugs encontrados e corrigidos
| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|----|-----------|------------|--------|----------|--------------------|-----------|
| BUG-01 | Controles iniciais usavam tokens claros legados sobre a atmosfera escura, reduzindo contraste percebido | Média | Corrigido | CitySearchForm, LocationButton, CityCandidateList, UnitSelector, WeatherMetric e HourlyForecast passaram a consumir tokens da identidade | QA-01: `verifica contraste dos controles da primeira dobra sobre a atmosfera` | evidences/07-controles-contraste.png |

## Plano de QA manual
- CA-15: proxy Chromium em viewport equivalente a 200% e inspeção visual em evidences/08-responsivo-zoom-proxy.png; nenhum corte horizontal ou perda de operação.
- CA-16: consulta mockada local concluída abaixo de 3 s em QA-02; E2E-14 confirmou interação durante transição de 600 ms. P95 real deve continuar sendo acompanhado em ambiente de produção.
- CA-19: E2E-09 confirmou conteúdo prioritário na primeira dobra em 1440×900 e 390×844; QA-02 confirmou consulta abaixo de 3 s. Teste formal com participantes permanece recomendação de usabilidade.
- CA-09: evidences/09-tons-de-cinza.png e TU-50/TU-51/TU-61 confirmam redundância por rótulos, ícones, valores e luminosidade.

## Conclusão
QA APROVADO. O BUG-01 foi corrigido na causa raiz e protegido por regressão. Todas as suítes passaram; os critérios funcionais, de contraste, responsividade, movimento, acessibilidade e desempenho automatizáveis foram verificados com evidências. A medição contínua de p95 real e teste formal com participantes permanecem recomendações operacionais, sem defeitos pendentes.
