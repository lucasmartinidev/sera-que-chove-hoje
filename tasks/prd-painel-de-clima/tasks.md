# Resumo das tarefas de implementação do Painel de Clima

> PRD: [`prd.md`](./prd.md) · TechSpec: [`techspec.md`](./techspec.md). Os casos de teste (`TU-*`, `TI-*`, `E2E-*`) e os detalhes de implementação têm como fonte de verdade a TechSpec; cada tarefa os referencia em vez de repeti-los.
>
> Ordem: backend (1–4) antes do frontend (5–7), que depende dos contratos; ambos antes do E2E (8).

## Tarefas

- [x] 1.0 Backend: infra de testes + fundação (config, logger, types, erro, `index.ts`)
- [x] 2.0 Backend: camada de dados (cache TTL + cliente Open-Meteo)
- [x] 3.0 Backend: geocodificação (`GET /api/geocode`)
- [x] 4.0 Backend: clima (`GET /api/weather`)
- [ ] 5.0 Frontend: infra de testes + fundação (services, types, lib)
- [ ] 6.0 Frontend: hooks de integração
- [ ] 7.0 Frontend: componentes + view do painel
- [ ] 8.0 E2E: fluxos críticos com Playwright (`e2e/`)
