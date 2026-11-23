# Relatório de QA — Painel de Clima

As evidências de navegador estão em `tasks/prd-painel-de-clima/evidences/`.

## Resumo
- Data: 2026-11-23
- Status: APROVADO
- Total de critérios de aceitação: 11
- Critérios de aceitação atendidos: 11
- Bugs encontrados: 2 (ambos corrigidos)
- Ambiente: Playwright Chromium; frontend `http://127.0.0.1:5101`; backend `http://127.0.0.1:3001`; sem banco ou serviço adicional.
- Inicialização gerenciada pelo Playwright `webServer`: `npm run dev --prefix ../backend` (`PORT=3001`) e `npm run dev --prefix ../frontend -- --host 127.0.0.1 --port 5101 --strictPort` (`VITE_API_URL=http://127.0.0.1:3001`).
- As portas 3001 e 5101 foram verificadas livres antes do início e liberadas após os testes. Os processos foram encerrados pelo Playwright com `SIGTERM` (prazo configurado: 5 s).
- Open-Meteo foi chamada pelo backend somente na medição live de CA-01; os demais E2E usaram fixtures locais.

## Critérios de aceitação verificados
| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Busca válida exibe o clima atual completo, local e horário em até 3 s (p95). | TU-04, TU-05, TU-10, TU-12, TU-14, TU-17, TU-18, TU-39, TI-01, TI-05, E2E-01 | PASSOU | [clima](evidences/02-clima-atual-e-previsao-desktop.png); [medição live](evidences/13-ca01-consulta-live.png) |
| CA-02 | Previsão das próximas 6 horas aparece junto ao clima, com dados por hora. | TU-04, TU-14, TU-19, TI-05, E2E-01, E2E-09 | PASSOU | [desktop](evidences/02-clima-atual-e-previsao-desktop.png); [mobile rolado](evidences/11-previsao-mobile-teclado.png) |
| CA-03 | Com permissão concedida, carrega o clima das coordenadas, identifica a consulta como “Minha localização” e informa o estado; nome da cidade não exigido. | TU-15, TU-37, TU-40, E2E-06 | PASSOU | [localização concedida](evidences/07-geolocalizacao-concedida.png) |
| CA-04 | Recusa/indisponibilidade da geolocalização não bloqueia a busca manual. | TU-16, TU-41, E2E-07 | PASSOU | [recusa](evidences/10-geolocalizacao-negada.png); [busca manual](evidences/10b-busca-manual-apos-recusa.png) |
| CA-05 | Cidades ambíguas mostram nome, região e país; seleção carrega o item escolhido. | TU-01, TU-13, TU-36, TU-39, TI-01, E2E-02 | PASSOU | [candidatas](evidences/04-selecao-cidade-ambigua.png); [selecionada](evidences/04b-cidade-selecionada.png) |
| CA-06 | Cidade inexistente gera mensagem clara e permite nova busca. | TU-02, TU-13, TU-44, TI-03, E2E-03 | PASSOU | [cidade não encontrada](evidences/05-cidade-nao-encontrada.png) |
| CA-07 | Indisponibilidade gera erro amigável sem detalhes técnicos e permite retry. | TU-06, TU-07, TU-14, TU-21, TU-28, TU-30, TU-35, TU-38, TU-42, TU-43, TI-04, TI-07, E2E-04, E2E-10 | PASSOU | [erro](evidences/06-erro-do-servico-com-retry.png); [recuperação](evidences/06b-retry-recuperado.png) |
| CA-08 | °C/°F e km/h/mph atualizam os valores sem nova consulta. | TU-11, TU-20, TU-34, E2E-05 | PASSOU | [unidades imperiais](evidences/03-unidades-imperiais.png) |
| CA-09 | Busca trata acentuação, caracteres especiais e variação de caixa. | TU-01, TU-03, TU-26, TI-01, E2E-01 | PASSOU | [resultado com cidade](evidences/02-clima-atual-e-previsao-desktop.png) |
| CA-10 | Navegador recebe dados exclusivamente do backend, sem chamar Open-Meteo. | TU-29, TU-30, TU-31, E2E-01 | PASSOU | [consulta](evidences/02-clima-atual-e-previsao-desktop.png) |
| CA-11 | Busca, lista e painel são acessíveis por teclado/leitor de tela, com nomes e estados. | TU-18, TU-19, TU-33, TU-36, TU-37, TU-38, E2E-08, E2E-09, E2E-10 | PASSOU | [lista focada](evidences/08-candidato-focado-por-teclado.png); [previsão por teclado](evidences/11-previsao-mobile-teclado.png); [erro/contraste](evidences/12-erro-contraste-final.png) |

## Testes E2E executados
| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 | Busca uma cidade, exibe clima + 6 h, observa rede e erros do browser. | PASSOU | Respostas 200; nenhum erro de console/page; nenhuma chamada do browser a `open-meteo.com`. |
| E2E-02 | Seleciona a cidade correta entre correspondências ambíguas. | PASSOU | Seleção ES verificada pelas coordenadas da requisição de clima. |
| E2E-03 | Informa cidade inexistente e permite nova busca. | PASSOU | — |
| E2E-04 | Exibe erro de serviço sem detalhes técnicos e recupera por retry. | PASSOU | — |
| E2E-05 | Alterna temperatura e vento sem refazer consulta. | PASSOU | Uma requisição de clima. |
| E2E-06 | Concede geolocalização, carrega o clima das coordenadas e identifica “Minha localização”. | PASSOU | Latitude e longitude autorizadas verificadas na requisição. |
| E2E-07 | Nega geolocalização e mantém busca manual. | PASSOU | — |
| E2E-08 | Usa teclado na busca e seleção de cidade. | PASSOU | Tab, Enter e Esc verificados. |
| E2E-09 | Rola previsão mobile até a última hora usando teclado. | PASSOU | Regressão de CA-11; setas navegam a região focável. |
| E2E-10 | Verifica contraste WCAG AA da mensagem de erro. | PASSOU | Regressão de CA-11; contraste final ≥ 4,5:1. |
| QA-CAP-01 a QA-CAP-05 | Captura estados de sucesso, vazio, erro/retry, geolocalização, teclado e breakpoints. | PASSOU | 5 testes de captura; imagens gravadas em `evidences/`. |
| QA-PERF-01 | Mede 20 buscas no browser contra backend e Open-Meteo reais. | PASSOU | 20/20 respostas geocode/weather `200`; primeira busca 1.676 ms; p95 observado 163 ms. A busca inclui seleção da candidata “Lisboa, Distrito de Lisboa · Portugal”. |

## Testes automatizados e cobertura
| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|------------|
| Unidade | TU-01 | PASSOU | `npm run test:coverage` em `backend/` | Mapeia candidatos. |
| Unidade | TU-02 | PASSOU | `npm run test:coverage` em `backend/` | Lista vazia. |
| Unidade | TU-03 | PASSOU | `npm run test:coverage` em `backend/` | Normalização/cache. |
| Unidade | TU-04 | PASSOU | `npm run test:coverage` em `backend/` | Clima atual + 6 h. |
| Unidade | TU-05 | PASSOU | `npm run test:coverage` em `backend/` | Probabilidade atual. |
| Unidade | TU-06 | PASSOU | `npm run test:coverage` em `backend/` | Falha upstream. |
| Unidade | TU-07 | PASSOU | `npm run test:coverage` em `backend/` | Timeout. |
| Unidade | TU-08 | PASSOU | `npm run test:coverage` em `backend/` | Cache TTL. |
| Unidade | TU-09 | PASSOU | `npm run test:coverage` em `backend/` | Configuração. |
| Unidade | TU-10 | PASSOU | `npm run test:coverage` em `frontend/` | Códigos WMO/fallback. |
| Unidade | TU-11 | PASSOU | `npm run test:coverage` em `frontend/` | Conversão de unidades. |
| Unidade | TU-12 | PASSOU | `npm run test:coverage` em `frontend/` | Direção cardeal. |
| Unidade | TU-13 | PASSOU | `npm run test:coverage` em `frontend/` | Busca/sucesso/vazio. |
| Unidade | TU-14 | PASSOU | `npm run test:coverage` em `frontend/` | Estado do clima/erro/retry. |
| Unidade | TU-15 | PASSOU | `npm run test:coverage` em `frontend/` | Geolocalização concedida. |
| Unidade | TU-16 | PASSOU | `npm run test:coverage` em `frontend/` | Geolocalização negada/indisponível. |
| Unidade | TU-17 | PASSOU | `npm run test:coverage` em `frontend/` | Envio por Enter/botão. |
| Unidade | TU-18 | PASSOU | `npm run test:coverage` em `frontend/` | Métricas e acessibilidade. |
| Unidade | TU-19 | PASSOU | `npm run test:coverage` em `frontend/` | 6 horas; região nomeada e focável. |
| Unidade | TU-20 | PASSOU | `npm run test:coverage` em `frontend/` | Unidades sem nova busca. |
| Unidade | TU-21 | PASSOU | `npm run test:coverage` em `backend/` | Envelope de erro. |
| Unidade | TU-22 | PASSOU | `npm run test:coverage` em `backend/` | Logger JSON. |
| Unidade | TU-23 | PASSOU | `npm run test:coverage` em `backend/` | Shutdown idempotente. |
| Unidade | TU-24 | PASSOU | `npm run test:coverage` em `backend/` | Falha de fechamento. |
| Unidade | TU-25 | PASSOU | `npm run test:coverage` em `backend/` | Timeout de shutdown. |
| Unidade | TU-26 | PASSOU | `npm run test:coverage` em `backend/` | Cliente de geocoding. |
| Unidade | TU-27 | PASSOU | `npm run test:coverage` em `backend/` | Cliente forecast. |
| Unidade | TU-28 | PASSOU | `npm run test:coverage` em `backend/` | Erros/payload upstream. |
| Unidade | TU-29 | PASSOU | `npm run test:coverage` em `frontend/` | Base configurada/health. |
| Unidade | TU-30 | PASSOU | `npm run test:coverage` em `frontend/` | Erros HTTP/rede/JSON. |
| Unidade | TU-31 | PASSOU | `npm run test:coverage` em `frontend/` | Endpoints/contratos do backend. |
| Unidade | TU-32 | PASSOU | `npm run test:coverage` em `frontend/` | Estado do health check. |
| Unidade | TU-33 | PASSOU | `npm run test:coverage` em `frontend/` | Papel acessível de status. |
| Unidade | TU-34 | PASSOU | `npm run test:coverage` em `frontend/` | Unidades independentes. |
| Unidade | TU-35 | PASSOU | `npm run test:coverage` em `frontend/` | Erro de busca amigável. |
| Unidade | TU-36 | PASSOU | `npm run test:coverage` em `frontend/` | Contexto/seleção de candidata. |
| Unidade | TU-37 | PASSOU | `npm run test:coverage` em `frontend/` | Estado do botão de localização. |
| Unidade | TU-38 | PASSOU | `npm run test:coverage` em `frontend/` | Anúncio/retry. |
| Unidade | TU-39 | PASSOU | `npm run test:coverage` em `frontend/` | Seleção na view. |
| Unidade | TU-40 | PASSOU | `npm run test:coverage` em `frontend/` | Clima da localização. |
| Unidade | TU-41 | PASSOU | `npm run test:coverage` em `frontend/` | Busca manual após recusa. |
| Unidade | TU-42 | PASSOU | `npm run test:coverage` em `frontend/` | Retry do clima. |
| Unidade | TU-43 | PASSOU | `npm run test:coverage` em `frontend/` | Retry da busca. |
| Unidade | TU-44 | PASSOU | `npm run test:coverage` em `frontend/` | Cidade não encontrada. |
| Integração | TI-01 | PASSOU | `npm run test:coverage` em `backend/` | Geocode válido/acentuado. |
| Integração | TI-02 | PASSOU | `npm run test:coverage` em `backend/` | Cidade ausente/curta. |
| Integração | TI-03 | PASSOU | `npm run test:coverage` em `backend/` | Sem correspondência. |
| Integração | TI-04 | PASSOU | `npm run test:coverage` em `backend/` | Erro upstream. |
| Integração | TI-05 | PASSOU | `npm run test:coverage` em `backend/` | Weather + 6 h. |
| Integração | TI-06 | PASSOU | `npm run test:coverage` em `backend/` | Coordenadas inválidas. |
| Integração | TI-07 | PASSOU | `npm run test:coverage` em `backend/` | Erro upstream. |
| Integração | TI-08 | PASSOU | `npm run test:coverage` em `backend/` | Health sem regressão. |
| Integração | TI-09 | PASSOU | `npm run test:coverage` em `backend/` | Cache evita chamada duplicada. |
| Build | — | PASSOU | `npm run build` em `backend/` | TypeScript compilado. |
| Frontend | — | PASSOU | `npm run lint`, `npm run typecheck`, `npm run build` | Lint encerra sem erros; 1 warning preexistente em `components/ui/button.tsx:51` (Fast Refresh). |
| E2E | E2E-01 a E2E-10 + QA-CAP-01 a QA-CAP-05 | PASSOU | `npm test` em `e2e/`; `npm run typecheck` | 15 testes passaram na suíte completa; E2E-06/07 foram reexecutados após alinhar o critério (2 passaram). |

- Cobertura backend: statements 95,96%; branches 91,86%; functions 100%; lines 100% (26 testes, 11 arquivos).
- Cobertura frontend: statements 96,02%; branches 89,24%; functions 98%; lines 97,5% (31 testes, 21 arquivos).
- Meta do projeto: 80%; atendida em todas as métricas cobertas.

## Acessibilidade
- [x] Navegação por teclado (Tab, Enter, Esc); previsão mobile alcançável por Tab e rolável com setas.
- [x] Elementos interativos com rótulos descritivos; campo “Cidade”, botões nomeados, estado via `status`/`alert` e candidatas com região/país.
- [x] Imagens com texto alternativo apropriado; não há elementos `<img>`. Ícones SVG são decorativos (`aria-hidden`) e acompanhados de texto.
- [x] Contraste: mensagem de erro corrigida de 3,12:1 para aproximadamente 5,91:1; teste E2E verifica mínimo 4,5:1.
- [x] Formulário: rótulo “Cidade” associado ao campo por `htmlFor`/`id`.
- [x] Mensagens de erro claras e acessíveis; `role="alert"`, texto acionável e botão de retry.
- [x] Fontes: campo 16 px; textos auxiliares 14 px; detalhes secundários da previsão 12 px. Inspecionados nos breakpoints registrados.

## Visual e responsividade
- Estado vazio/inicial capturado em [01](evidences/01-estado-inicial-desktop.png).
- Estado com dados capturado em [desktop](evidences/02-clima-atual-e-previsao-desktop.png), [390 px](evidences/09-clima-390px.png), [768 px](evidences/09-clima-768px.png) e [1280 px](evidences/09-clima-1280px.png).
- Estado de cidade inexistente em [05](evidences/05-cidade-nao-encontrada.png); serviço indisponível e retry em [06](evidences/06-erro-do-servico-com-retry.png) e [06b](evidences/06b-retry-recuperado.png).
- Geolocalização concedida em [07](evidences/07-geolocalizacao-concedida.png); negada/manual em [10](evidences/10-geolocalizacao-negada.png) e [10b](evidences/10b-busca-manual-apos-recusa.png).
- Seleção ambígua em [04](evidences/04-selecao-cidade-ambigua.png) e [04b](evidences/04b-cidade-selecionada.png); unidades em [03](evidences/03-unidades-imperiais.png); navegação por teclado em [08](evidences/08-candidato-focado-por-teclado.png) e [11](evidences/11-previsao-mobile-teclado.png).
- As páginas não excedem a largura nos breakpoints 390/768/1280 px. Em mobile, as seis horas usam rolagem horizontal; a região agora tem nome acessível, foco visível e navegação por setas.
- Não restaram inconsistências visuais bloqueantes nos estados e breakpoints capturados.

## Bugs encontrados e corrigidos
| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|----|-----------|------------|--------|----------|--------------------|-----------|
| BUG-01 | Texto de erro tinha contraste 3,12:1 sobre o fundo (`rgb(239,68,68)` / `rgb(241,245,248)`), abaixo de WCAG AA. | Média | Corrigido | Escurecidos os tokens `--destructive` nos temas claro e escuro. | E2E-10 verifica contraste mínimo 4,5:1. | [estado final](evidences/12-erro-contraste-final.png) |
| BUG-02 | A previsão horizontal mobile não era alcançável/rolável com teclado. | Média | Corrigido | Região nomeada e focável, foco visível e rolagem com ArrowLeft/ArrowRight. | TU-19 verifica região focável; E2E-09 alcança 18:00 por teclado. | [previsão rolada](evidences/11-previsao-mobile-teclado.png) |

## Conclusão
QA aprovado: os 11 critérios de aceitação estão atendidos. O PRD e a TechSpec foram alinhados para aceitar o carregamento pelas coordenadas autorizadas, identificado como “Minha localização”, sem exigir geocodificação reversa. E2E-06 foi reexecutado após a atualização e verificou as coordenadas e o rótulo apresentados.
