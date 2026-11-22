# Tarefa 8.0: E2E — fluxos críticos com Playwright (`e2e/`)

## Visão geral

Cria a suíte E2E na pasta `e2e/` (fora de `frontend/` e `backend/`), com Playwright, e cobre os fluxos críticos pela perspectiva do usuário: busca com candidato único, cidade ambígua (seleção), cidade não encontrada, erro de origem com "Tentar novamente", alternância de unidades e geolocalização (concedida/negada) e acessibilidade por teclado. Para determinismo e velocidade, as respostas de `/api/geocode` e `/api/weather` são interceptadas com `page.route` a partir de fixtures. Depende de backend e frontend implementados (tarefas 1–7).

<skills>
### Conformidade com skills

Nenhuma skill de `.agents/skills` é específica para E2E nesta fase de implementação. A skill `executar-qa` será aplicável posteriormente, na validação/QA dos fluxos. Segue as rules em `.agents/rules/tests.md`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules. Relevantes aqui:

- `tests.md`: Playwright preferencial para E2E; testes em `e2e/` (fora de frontend/backend); poucos E2E, cobrindo fluxos críticos completos pela perspectiva do usuário; não substituir unidade/integração por E2E.
- `folder-structure.md`: `e2e/*.spec.ts` na raiz do projeto.
- `AGENTS.md`: não há `package.json` na raiz; `e2e/` mantém `package.json` e lock file próprios; instalar dependências no diretório.
- `code-standards.md`/`javascript-typescript.md`: sem comentários; `const`; tipagem; sem `any`.
</rules>

<requirements>
- Validação ponta a ponta dos critérios de aceitação do PRD sob a ótica do usuário.
- CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07, CA-08, CA-10, CA-11.
</requirements>

## Subtarefas

- [ ] 8.1 Criar `e2e/` com `package.json` próprio, `@playwright/test` e `playwright.config.ts` (web servers de frontend/backend ou baseURL configurada).
- [ ] 8.2 Criar `e2e/fixtures/*.json` com respostas de `/api/geocode` (único, múltiplo, vazio) e `/api/weather` (sucesso, erro 502).
- [ ] 8.3 Criar `e2e/weather-dashboard.spec.ts` com os casos E2E-01…E2E-08, usando `page.route` para interceptar as chamadas do backend e `context.setGeolocation`/`grantPermissions` para geolocalização.
- [ ] 8.4 Documentar como executar a suíte (instalação em `e2e/`, servidores necessários e comando de execução).

## Detalhes de implementação

Ver `techspec.md`: "Abordagem de testes › Testes E2E" (estratégia de interceptação e fixtures), "Sequenciamento › Ordem de construção" (itens 10–11) e "Dependências técnicas › E2E".

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-10
- CA-11

## Testes da tarefa

### Testes de unidade (se aplicável)

- Não aplicável.

### Testes de integração (se aplicável)

- Não aplicável.

### Testes E2E (se aplicável)

- [ ] E2E-01 — Buscar cidade com candidato único exibe clima atual + 6 h
- [ ] E2E-02 — Buscar cidade ambígua exibe lista; selecionar carrega o clima
- [ ] E2E-03 — Cidade inexistente exibe mensagem "não encontrada"
- [ ] E2E-04 — Backend/origem indisponível exibe erro amigável + "Tentar novamente"
- [ ] E2E-05 — Alternar unidades atualiza valores exibidos
- [ ] E2E-06 — Geolocalização concedida carrega "Minha localização"
- [ ] E2E-07 — Geolocalização negada mantém a busca manual funcional
- [ ] E2E-08 — Navegação por teclado/acessibilidade na busca e na lista

## Arquivos relevantes

- `e2e/package.json` (novo)
- `e2e/playwright.config.ts` (novo)
- `e2e/weather-dashboard.spec.ts` (novo)
- `e2e/fixtures/geocode-single.json`, `geocode-multiple.json`, `geocode-empty.json`, `weather-ok.json`, `weather-error.json` (novos)
