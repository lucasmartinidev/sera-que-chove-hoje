# Tarefa 2.0: Backend — camada de dados (cache + cliente Open-Meteo)

## Visão geral

Implementa o acesso às APIs externas e o cache de curto TTL. O cliente usa `fetch` nativo com `AbortController` para timeout (padrão 8 s), tipa as respostas brutas da Open-Meteo e lança erros de domínio (`UPSTREAM_ERROR`) em falha/timeout. O cache reduz chamadas e latência e mitiga o rate limit da Open-Meteo. Depende da fundação (tarefa 1).

<skills>
### Conformidade com skills

Nenhuma skill de `.agents/skills` é específica para backend. Segue as rules em `.agents/rules/`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules. Relevantes aqui:

- `node.md`: `async/await`; não bloquear o event loop (I/O assíncrono, sem `*Sync` no fluxo); sem referências circulares (a camada `data` não importa `routes`/`services`).
- `javascript-typescript.md`: validação de entrada externa com `unknown` antes de acessar propriedades (respostas da Open-Meteo); proibido `any`; `Promise<T>`; imutabilidade.
- `code-standards.md`: funções ≤ 30 linhas; constantes nomeadas (timeout, TTL, arredondamento de coordenadas); sem comentários; cláusulas de guarda.
- `tests.md`: mocks apenas para a dependência externa (`fetch`); relógio controlado (`vi.setSystemTime`/fake timers) para timeout e TTL; cobertura ≥ 80%.
- `folder-structure.md`: `data/` concentra integrações e acesso a APIs externas.
</rules>

<requirements>
- RF6 (dados obtidos pelo backend a partir da Open-Meteo).
- Restrições técnicas: timeout ~8 s por chamada; cache em memória de curto TTL (padrão 10 min); rate limit ~10k req/dia/IP.
- Suporta CA-07 (falha/timeout → erro de origem) e CA-01 (desempenho via cache).
</requirements>

## Subtarefas

- [ ] 2.1 Criar `backend/src/data/cache.ts` — `MemoryCache` (`get`/`set`, expiração por TTL) usando `CACHE_TTL_MS` do `config`.
- [ ] 2.2 Criar `backend/src/data/openmeteo.client.ts` — `searchCity(name)` e `fetchForecast(coords)` com `fetch` + `AbortController` (`OPEN_METEO_TIMEOUT_MS`), tipando respostas com `types/open-meteo.ts`.
- [ ] 2.3 Validar respostas externas (`unknown`) e lançar erro de domínio `UPSTREAM_ERROR` em HTTP não-OK, corpo inválido ou timeout.
- [ ] 2.4 Implementar testes de unidade (mock de `fetch`; fake timers para timeout e expiração de cache).

## Detalhes de implementação

Ver `techspec.md`: "Principais interfaces" (`OpenMeteoClient`, `MemoryCache`), "Pontos de integração" (timeout, rate limit, idempotência), "Parâmetros fixos na origem", "Considerações técnicas › Principais decisões" (cache e `fetch` nativo), "Sequenciamento › Ordem de construção" (item 2).

## Critérios de aceitação relacionados

- CA-07
- CA-01 (desempenho: cache reduz latência/chamadas)

## Testes da tarefa

### Testes de unidade (se aplicável)

- [ ] TU-07 — `openmeteo.client` aborta a chamada ao exceder o timeout (`AbortController`)
- [ ] TU-08 — `MemoryCache` retorna valor dentro do TTL e busca novamente após expirar

### Testes de integração (se aplicável)

- Não aplicável (a integração HTTP é coberta nas tarefas 3 e 4).

### Testes E2E (se aplicável)

- Não aplicável.

## Arquivos relevantes

- `backend/src/data/cache.ts` (novo)
- `backend/src/data/openmeteo.client.ts` (novo)
- `backend/src/types/open-meteo.ts` (usado; criado na tarefa 1)
- `backend/src/config.ts`, `backend/src/logger.ts` (usados)
- `backend/src/data/cache.test.ts`, `backend/src/data/openmeteo.client.test.ts` (testes)
