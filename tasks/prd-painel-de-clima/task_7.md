# Tarefa 7.0: Frontend — componentes + view do painel

## Visão geral

Constrói a interface do painel: componentes de apresentação e interação em `components/weather/*`, a tela `WeatherDashboardView` que os compõe e coordena os hooks, e o ajuste do `App.tsx` para renderizar a view. Cobre busca por cidade, seleção em caso de ambiguidade, clima atual, previsão de 6 horas, seletor de unidades, botão/estado de geolocalização e mensagens de status/erro acessíveis. Depende dos hooks (tarefa 6).

<skills>
### Conformidade com skills

- `react` (obrigatória): componentes pequenos (≤ 30 linhas) e de responsabilidade única; props explícitas (sem spread); elementos semânticos + `aria-*` (rótulos, `aria-live`/`aria-busy` para estados assíncronos, ícones com texto equivalente); estilização com Tailwind; reuso de `components/ui/button.tsx`.
- `impeccable` (opcional): aplicada no refinamento de UI/UX — hierarquia visual (destaque para temperatura, condição e probabilidade de chuva), estados, contraste e responsividade.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada do `AGENTS.md` e de todas as rules. Relevantes aqui:

- `folder-structure.md`: `components/` reutilizáveis; `views/` compõe componentes e coordena estado da tela; sem acesso direto ao backend em components/views (usar hooks/services).
- `code-standards.md`: arquivos ≤ 100 linhas e funções/componentes ≤ 30 linhas; extrair subcomponentes; constantes nomeadas; sem comentários.
- `javascript-typescript.md`: proibido `any`; props tipadas; imutabilidade; `===`.
- `tests.md`: testes de componente validam comportamento visível e acessibilidade, sem acoplamento a estilos/estrutura interna; cobertura ≥ 80%.
- `AGENTS.md`: executar `npm run lint`, `npm run typecheck`, `npm run build` e `npm run test` ao final.
</rules>

<requirements>
- RF1–RF22 (interface completa: busca, seleção, clima atual, previsão 6h, unidades, geolocalização, estados/erros).
- CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07, CA-08, CA-10, CA-11.
</requirements>

## Subtarefas

- [ ] 7.1 Criar `components/weather/CitySearchForm.tsx` (campo + envio por botão e Enter).
- [ ] 7.2 Criar `components/weather/CityCandidateList.tsx` (lista de seleção acessível: nome, região, país).
- [ ] 7.3 Criar `components/weather/WeatherIcon.tsx` e `components/weather/WeatherMetric.tsx` (reutilizáveis).
- [ ] 7.4 Criar `components/weather/CurrentWeatherCard.tsx` (temperatura, sensação, descrição+ícone, umidade, vento+direção, prob. precipitação, pressão, cidade/país ou "Minha localização", horário local).
- [ ] 7.5 Criar `components/weather/HourlyForecast.tsx` (próximas 6 horas: temperatura, condição, prob. precipitação).
- [ ] 7.6 Criar `components/weather/UnitSelector.tsx` (alternância °C/°F e km/h/mph).
- [ ] 7.7 Criar `components/weather/LocationButton.tsx` (disparo + estado da geolocalização).
- [ ] 7.8 Criar `components/weather/StatusMessage.tsx` (carregando/erro/não encontrado + "Tentar novamente", `aria-live`).
- [ ] 7.9 Criar `views/WeatherDashboardView.tsx` (compõe componentes, coordena hooks e os fluxos por digitação e por geolocalização).
- [ ] 7.10 Modificar `frontend/src/App.tsx` para renderizar `WeatherDashboardView` (base via `VITE_API_URL`).
- [ ] 7.11 Implementar testes de componente (Testing Library: comportamento visível + acessibilidade).

## Detalhes de implementação

Ver `techspec.md`: "Arquitetura do sistema" (components/view e fluxos), PRD "Experiência do usuário" (hierarquia, estados, acessibilidade), "Sequenciamento › Ordem de construção" (item 8) e "Considerações técnicas › Conformidade com skills › `react`/`impeccable`". Reuso de `frontend/src/lib/utils.ts` (`cn`) e do tema em `index.css`/`tailwind.config.js`.

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

- [ ] TU-17 — `CitySearchForm` envia com Enter e com clique no botão
- [ ] TU-18 — `CurrentWeatherCard` renderiza todas as métricas com nomes/estados acessíveis
- [ ] TU-19 — `HourlyForecast` renderiza os 6 horários com temperatura, condição e probabilidade
- [ ] TU-20 — `UnitSelector` alterna unidades e atualiza valores sem nova busca

### Testes de integração (se aplicável)

- Não aplicável.

### Testes E2E (se aplicável)

- Não aplicável (coberto na tarefa 8).

## Arquivos relevantes

- `frontend/src/components/weather/CitySearchForm.tsx` (novo)
- `frontend/src/components/weather/CityCandidateList.tsx` (novo)
- `frontend/src/components/weather/WeatherIcon.tsx` (novo)
- `frontend/src/components/weather/WeatherMetric.tsx` (novo)
- `frontend/src/components/weather/CurrentWeatherCard.tsx` (novo)
- `frontend/src/components/weather/HourlyForecast.tsx` (novo)
- `frontend/src/components/weather/UnitSelector.tsx` (novo)
- `frontend/src/components/weather/LocationButton.tsx` (novo)
- `frontend/src/components/weather/StatusMessage.tsx` (novo)
- `frontend/src/views/WeatherDashboardView.tsx` (novo)
- `frontend/src/App.tsx` (modificado)
- `frontend/src/components/ui/button.tsx`, `frontend/src/lib/utils.ts` (reuso)
- `frontend/src/components/weather/*.test.tsx` (testes)
