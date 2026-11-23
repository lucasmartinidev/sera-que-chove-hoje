# Especificação técnica

> Funcionalidade: **Identidade Futurista Reativa** — redesenho visual completo do painel.
> Requisitos, objetivos, histórias de usuário, critérios de aceitação (CA-01…CA-19) e escopo estão definidos em [`prd.md`](./prd.md) e não são repetidos aqui.

## Resumo

A solução é 100% frontend: nenhum contrato de API, rota de backend ou regra de negócio é alterado. A identidade reativa é construída sobre três camadas desacopladas: (1) um **domínio puro de temas** — funções determinísticas que convertem os dados já existentes (`temperatureC`, `weatherCode`, `isDay`, estado da consulta) em uma faixa de temperatura, uma família de condição e um conjunto de tokens de tema com valores hex exatos; (2) uma **camada de atmosfera** — fundo decorativo em CSS puro (gradientes + `@keyframes` em camadas empilhadas, animando apenas `transform`/`opacity`), sem canvas, sem WebGL, sem novas dependências e sem requisições externas; (3) uma **camada de superfície de conteúdo** — painel opaco cujos tokens de cor são injetados como CSS custom properties a partir do módulo TypeScript de tokens, de modo que o TypeScript é a única fonte de verdade e a matriz completa de contraste WCAG AA é auditável por teste unitário.

Decisões confirmadas com o solicitante: fundo em CSS puro (gradientes + keyframes); tipografia mantém o stack de fontes do sistema (zero novos ativos); auditoria de contraste automatizada por teste unitário sobre a matriz de tokens; valores exatos (hex) de todas as faixas de temperatura e famílias de condição definidos nesta TechSpec. Movimento reduzido, cores forçadas, transição de até 600 ms e limite de 3 flashes/s são tratados por media queries CSS, constantes nomeadas e um hook `useReducedMotion`. A numeração dos casos de teste dá continuidade às suítes existentes (TU-45+, TI-10+, E2E-09+), preservando os IDs da funcionalidade anterior.

## Arquitetura do sistema

### Visão dos componentes

Fluxo de dados (inalterado até a view; novo trecho a partir dela):

```text
backend (inalterado) → services (inalterados) → useWeatherDashboard (inalterado)
  → useAtmosphereTheme (novo)
      → getTemperatureBand / getConditionFamily / resolveTheme (novos, puros)
  → WeatherDashboardView (modificada: injeta CSS vars + data-attributes)
      → AtmosphericBackground (novo, decorativo, aria-hidden)
      → CurrentWeatherCard / HourlyForecast / StatusMessage / ApiStatus (modificados: consomem tokens)
```

**Novos componentes e módulos (frontend):**

| Componente/módulo | Pasta | Responsabilidade |
| --- | --- | --- |
| `temperature-scale.ts` | `src/lib/` | Faixas de temperatura (RF13–RF19): limites, rótulos PT-BR, clamp nos extremos, `null` quando temperatura ausente |
| `condition-family.ts` | `src/lib/` | Agrupa códigos WMO nas 7 famílias (RF6): `clear`, `cloudy`, `fog`, `rain`, `snow`, `thunderstorm`, `neutral` |
| `theme-tokens.ts` | `src/lib/` | Fonte de verdade dos valores hex: superfícies por família×período, céus, acentos/profundezas por faixa, cores semânticas de status |
| `resolve-theme.ts` | `src/lib/` | `resolveTheme(input)` → `ThemeTokens`; `themeToCssVariables(tokens)` → mapa de CSS vars; `lighten()` para `--surface-raised` |
| `contrast.ts` | `src/lib/` | Luminância relativa, razão de contraste WCAG 2.2 e predicados AA (texto 4,5:1, não-texto 3:1) |
| `useMediaQuery.ts` | `src/hooks/` | Base reativa para media queries (`matchMedia` + listener) |
| `useReducedMotion.ts` | `src/hooks/` | `prefers-reduced-motion: reduce` (RF26–RF28) |
| `useAtmosphereTheme.ts` | `src/hooks/` | Deriva `ThemeInput` do estado do dashboard e devolve tokens, CSS vars, data-attributes e props do fundo |
| `AtmosphericBackground.tsx` | `src/components/atmosphere/` | Contêiner decorativo fixo (`aria-hidden`, `pointer-events-none`), orquestra camadas e o crossfade de tema |
| `SkyLayer.tsx` | `src/components/atmosphere/` | Gradiente céu (família×período) + crossfade de 600 ms entre temas |
| `BandGlowLayer.tsx` | `src/components/atmosphere/` | Brilho radial decorativo com a cor profunda da faixa de temperatura |
| `ParticleLayer.tsx` | `src/components/atmosphere/` | Partículas CSS de chuva/neve com densidade responsiva (RF32) |
| `ThunderLayer.tsx` | `src/components/atmosphere/` | Flash de trovoada com ciclo de 8 s (≤ 3 flashes/s, RF9) |
| `StarField.tsx` | `src/components/atmosphere/` | Estrelas para céu limpo noturno, com cintilação lenta (ciclo ≥ 6 s) |
| `TemperatureBandChip.tsx` | `src/components/weather/` | Rótulo textual da faixa (RF16) com fundo `--band-accent` e texto escuro fixo |

**Arquivos modificados:**

| Arquivo | Mudança |
| --- | --- |
| `src/views/WeatherDashboardView.tsx` | Raiz temática: aplica `style` com CSS vars, `data-atmosphere`/`data-period`/`data-band`/`data-motion`, renderiza `AtmosphericBackground`, reorganiza a primeira dobra (RF3, RF31); `ApiStatus` passa a usar tokens de status |
| `src/components/weather/CurrentWeatherCard.tsx` | Superfície opaca tokenizada; `TemperatureBandChip` junto à temperatura; bloco de chuva sobre `--surface-raised` sem cor própria |
| `src/components/weather/HourlyForecast.tsx` | Temperatura horária com acento da mesma escala e rótulo de faixa por hora (RF20) |
| `src/components/weather/StatusMessage.tsx` | Cores de erro/estado via tokens semânticos |
| `src/index.css` | Valores fallback das CSS vars (`:root`), `@keyframes` da atmosfera, regras globais de `prefers-reduced-motion` e `forced-colors` |
| `tailwind.config.js` | Cores tokenizadas (`surface`, `band`, `sky`, `status`, `focus-ring`) mapeando as CSS vars |
| `src/test/setup.ts` | Mock de `matchMedia` para jsdom |

Nenhum arquivo de `services/`, `types/weather.ts` ou do backend é alterado. `useWeatherDashboard` e demais hooks existentes permanecem intactos (CA-18).

## Design de implementação

### Principais interfaces

```text
temperature-scale
  getTemperatureBand(temperatureC: number | null) -> TemperatureBand | null

condition-family
  getConditionFamily(weatherCode: number | null) -> ConditionFamily

resolve-theme
  resolveTheme(input: ThemeInput) -> ThemeTokens
  themeToCssVariables(tokens: ThemeTokens) -> CssVariables   // Record<'--x', string>
  lighten(hex: string, amount: number) -> string

contrast
  relativeLuminance(hex: string) -> number
  contrastRatio(foregroundHex: string, backgroundHex: string) -> number
  meetsTextAA(fg: string, bg: string) -> boolean            // >= 4.5
  meetsNonTextAA(fg: string, bg: string) -> boolean         // >= 3

hooks
  useMediaQuery(query: string) -> boolean
  useReducedMotion() -> boolean
  useAtmosphereTheme(input: AtmosphereThemeInput) -> AtmosphereTheme
```

Exemplo das interfaces React principais (contratos de props):

```tsx
type AtmosphericBackgroundProps = {
  sky: { top: string; bottom: string };
  bandDeep: string | null;
  motion: { reduced: boolean; transitionMs: number };
};

function AtmosphericBackground(props: AtmosphericBackgroundProps): ReactElement;

type TemperatureBandChipProps = {
  band: TemperatureBand | null;
};

function TemperatureBandChip({ band }: TemperatureBandChipProps): ReactElement | null;
```

Regras de consumo dos tokens:

- Texto com `--band-accent` e o `TemperatureBandChip` (texto `#0E1524` sobre fundo `--band-accent`) aparecem **somente sobre `--surface`** (nunca sobre `--surface-raised`), garantindo ≥ 4,5:1 em toda a matriz.
- `--surface-raised` hospeda apenas texto em `--surface-foreground` ou `--surface-muted`.
- As superfícies são **opacas** (sem transparência nem backdrop-blur): o contraste do conteúdo independe do fundo decorativo (RF4, RF23, CA-08).
- O fundo decorativo nunca contém texto, foco ou conteúdo anunciável (RF10).

### Modelos de dados

Não há novos contratos JSON entre backend e frontend; `WeatherData`, `CurrentWeather` e `HourForecast` (`frontend/src/types/weather.ts`) permanecem como estão. Os novos modelos são internos ao frontend.

#### `TemperatureBand` — faixa estática de temperatura (RF13–RF17, RF19)

Identificador, rótulo PT-BR obrigatório, limites em °C e tokens de cor exatos. O cálculo usa **sempre** `temperatureC` (a conversão de exibição para °F ocorre só na formatação — RF19, CA-10). Limites inferiores são exclusivos e superiores inclusivos; valores fora da escala são fixados nas faixas extremas (clamp — RF17, CA-11).

| `id` | Faixa (°C) | `labelPtBr` | `accent` (texto/UI sobre superfície) | `deep` (atmosfera do fundo) |
| --- | --- | --- | --- | --- |
| `extreme-cold` | ≤ −10 | Frio extremo | `#9F8CF2` | `#3730A3` |
| `very-cold` | > −10 e ≤ 0 | Muito frio | `#6FA8F5` | `#1E40AF` |
| `cold` | > 0 e ≤ 10 | Frio | `#4FC3E8` | `#0E7490` |
| `cool` | > 10 e ≤ 18 | Fresco | `#5FD9A5` | `#0F766E` |
| `mild` | > 18 e ≤ 24 | Ameno | `#A8D96B` | `#4D7C0F` |
| `warm` | > 24 e ≤ 30 | Quente | `#FFC470` | `#C2410C` |
| `very-warm` | > 30 e ≤ 38 | Muito quente | `#FFC9B8` | `#B91C1C` |
| `extreme-heat` | > 38 | Calor extremo | `#FFD2F2` | `#86198F` |

Invariantes verificadas por teste (TU-45…TU-47, TU-50, TU-51):

- A luminância relativa de `accent` é **estritamente crescente** de `extreme-cold` a `extreme-heat` (ordem frio→quente perceptível em tons de cinza — RF15, CA-09).
- Todo `accent` atinge ≥ 4,5:1 sobre a mais clara das superfícies (`#1B2330`, neblina/dia).
- `getTemperatureBand(null)` → `null`: nenhuma cor de faixa é aplicada e a UI comunica a indisponibilidade (RF18, CA-12).

```ts
type TemperatureBand = {
  id: TemperatureBandId;
  labelPtBr: string;
  accent: string;
  deep: string;
};
```

#### `ConditionFamily` — família de condição (RF6, RF21)

Mapeamento determinístico do código WMO (`CurrentWeather.weatherCode` / `HourForecast.weatherCode`) para a família. Ícones Lucide e descrições textuais existentes (`describeWeatherCode`) continuam sendo o canal redundante de cor (CA-09).

| `id` | Códigos WMO |
| --- | --- |
| `clear` | 0 |
| `cloudy` | 1, 2, 3 |
| `fog` | 45, 48 |
| `rain` | 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82 |
| `snow` | 71, 73, 75, 77, 85, 86 |
| `thunderstorm` | 95, 96, 97, 99 |
| `neutral` | qualquer outro código, `null`, ou ausência de consulta |

#### `ThemeInput` / `ThemeTokens` — entrada e saída do tema

```ts
type ThemeInput = {
  conditionFamily: ConditionFamily;
  temperatureBand: TemperatureBand | null;
  isDay: boolean;
};

type ThemeTokens = Record<ThemeTokenName, string>;
```

> **Degradação (RF12, RF18, CA-12):** quando não há consulta carregada com sucesso (estado inicial, carregando sem dados anteriores, erro, cidade não encontrada), `useAtmosphereTheme` produz `conditionFamily: 'neutral'` e `temperatureBand: null`. `resolveTheme` retorna superfície neutra, céus neutros e `--band-accent` igual a `--surface-foreground` (nenhuma cor de temperatura é sugerida).

#### Tokens de superfície — conteúdo (opacos, por família × período)

| Família | Dia | Noite |
| --- | --- | --- |
| `neutral` | `#0E1524` (período único) | — |
| `clear` | `#14243F` | `#0A1226` |
| `cloudy` | `#171F2D` | `#0C121B` |
| `fog` | `#1B2330` | `#10161F` |
| `rain` | `#101D2B` | `#0A121C` |
| `snow` | `#182434` | `#0D1520` |
| `thunderstorm` | `#1A1628` | `#0D0A16` |

Tokens fixos de texto e semânticos:

| Token | Valor | Uso |
| --- | --- | --- |
| `--surface-foreground` | `#F5F8FC` | Todo texto principal (≥ 13:1 sobre qualquer superfície) |
| `--surface-muted` | `#C3CEDD` | Texto secundário (≥ 9:1) |
| `--surface-raised` | `lighten(superfície, 4%)` | Blocos internos (ex.: chance de chuva); só texto foreground/muted |
| `--band-accent` | `accent` da faixa | Temperatura atual e horária, chip de faixa (≥ 4,5:1 sobre `--surface`) |
| `--band-contrast-text` | `#0E1524` | Texto sobre fundo `--band-accent` no chip (≥ 4,5:1) |
| `--band-deep` | `deep` da faixa | Apenas decorativo (glow do fundo; isento — RF24) |
| `--status-ok` | `#34D399` | Indicador "API online" (RF25) |
| `--status-warn` | `#FBBF24` | Indicador "Verificando API" (RF25) |
| `--status-error` | `#FB7185` | Mensagens de erro e "API indisponível" (RF25) |
| `--focus-ring` | `#7DD3FC` | Anel de foco visível (≥ 3:1 — RF30, CA-13) |

Regra de distinção semântica (RF25, CA-17): `--status-*` e `--focus-ring` são usados **exclusivamente** no indicador de status da API, em mensagens de erro e no anel de foco; nunca em elementos meteorológicos. As cores de faixa nunca são usadas em componentes de status. O bloco de probabilidade de chuva deixa de ter cor âmbar própria e passa a usar `--surface-raised` + texto foreground, eliminando ambiguidade com `--status-warn`.

#### Tokens de céu — fundo decorativo (gradiente top → bottom)

| Família | Dia | Noite |
| --- | --- | --- |
| `neutral` | `#1F2937 → #0B1220` | idem (período único) |
| `clear` | `#0EA5E9 → #BAE6FD` | `#070B1A → #1E1B4B` |
| `cloudy` | `#475569 → #94A3B8` | `#0B111C → #1F2937` |
| `fog` | `#6B7280 → #CBD5E1` | `#1F2733 → #3B4657` |
| `rain` | `#1E293B → #475569` | `#070D17 → #16202E` |
| `snow` | `#60A5FA → #DBEAFE` | `#0D1A2E → #233A54` |
| `thunderstorm` | `#1F2937 → #4C1D95` | `#05050C → #1E1640` |

Sobre o gradiente do céu, `BandGlowLayer` aplica um brilho radial com `--band-deep` em baixa opacidade (decorativo, isento de contraste — RF24).

#### Constantes nomeadas de movimento e transição

| Constante | Valor | Requisito |
| --- | --- | --- |
| `THEME_TRANSITION_MS` | `600` | Duração máxima do crossfade de céu e da transição de cores de superfície (RF8, CA-07) |
| `THUNDER_FLASH_CYCLE_MS` | `8000` | Flash de trovoada: 1 clareamento breve (~400 ms, opacidade máx. 0,5) a cada 8 s → ~0,12 flash/s, muito abaixo de 3/s (RF9, CA-06) |
| `STAR_SHIMMER_CYCLE_MS` | `6000` | Variação lenta e sutil de opacidade das estrelas (RF9) |
| `RAIN_FALL_CYCLE_MS` | `1200` | Translação contínua das faixas de chuva (movimento, não flash) |
| `SNOW_FALL_CYCLE_MS` | `6000` | Queda/deriva lenta dos flocos |
| `PARTICLE_DENSITY` | `{ desktop: { rain: 60, snow: 40 }, small: { rain: 24, snow: 16 } }` | Densidade reduzida em telas < 640 px via CSS (RF32) |
| `SMALL_SCREEN_MAX_WIDTH_PX` | `640` | Ponto de corte da densidade de partículas |

Regra global: nenhuma `@keyframes` da atmosfera pode ter ciclo inferior a `1000 ms`, e nenhuma animação altera luminosidade de forma brusca — apenas `transform` e `opacity` com curvas suaves (RF9, RF30).

#### Mecanismo de transição de tema (RF8, RF27, CA-07)

- `SkyLayer` mantém o gradiente anterior e renderiza duas camadas sobrepostas; a nova entra com `opacity 0 → 1` em `THEME_TRANSITION_MS`. Gradientes CSS não interpolam nativamente — o crossfade resolve isso sem JS de animação.
- Superfícies e textos transitam com `transition: background-color 600ms, color 600ms, border-color 600ms` sobre as CSS vars.
- Com `prefers-reduced-motion: reduce`, `useReducedMotion` devolve `true` e `transitionMs` passa a `0` (troca instantânea, cores corretas mantidas — RF27); as `@keyframes` são desativadas pela media query global no CSS (RF26).
- Como toda a animação é CSS (compositor), nenhum JS concorre com eventos: cliques e teclas durante a transição são respondidos pelo ciclo normal do React (< 100 ms — CA-07).

#### Comportamento por estado da interface

| Estado | Atmosfera | Observações |
| --- | --- | --- |
| Inicial (sem consulta) | `neutral`, sem faixa | RF12 |
| Carregando (busca/clima) | `neutral`, sem faixa | Mensagens de estado existentes preservadas |
| Sucesso | família × período × faixa derivados dos dados | Transição de 600 ms a partir do estado anterior |
| Cidade não encontrada | `neutral`, sem faixa | Mensagem existente `'Nenhuma cidade encontrada. Tente outro nome.'` |
| Erro de serviço | `neutral`, sem faixa | `--status-error` + retry existente |
| Geolocalização (prompting/granted/denied) | segue o estado da consulta de clima | Comportamentos existentes intactos |
| Temperatura `null` em consulta de sucesso | família da condição aplicada; **sem** cor de faixa | Comunicação textual de indisponibilidade (padrão `'—'`/`indisponível` existente) — RF18 |

#### Preferências do sistema (RF26–RF29)

- `@media (prefers-reduced-motion: reduce)` no `index.css` zera `animation` das camadas decorativas e mantém a composição estática equivalente (mesmos gradientes, partículas estáticas em baixa opacidade ou ocultas, mesmo glow de faixa) — nenhuma informação é perdida (CA-05).
- `@media (forced-colors: active)` oculta `AtmosphericBackground` (`display: none`) e deixa superfícies/textos usarem as cores do sistema (`Canvas`/`CanvasText` via `forced-color-adjust`), mantendo a legibilidade (RF29, CA-14).
- Nenhuma animação é necessária para compreender a informação: todo conteúdo é renderizado imediatamente com os dados (RF28).

### Endpoints da API (se aplicável)

**Não aplicável.** Esta funcionalidade não cria, altera nem remove endpoints. O frontend continua consumindo exclusivamente `GET /health`, `GET /api/geocode?city=` e `GET /api/weather?lat=&lon=` do backend existente, cujos contratos estão documentados em `tasks/prd-painel-de-clima/techspec.md` e permanecem válidos sem alteração (restrição "Fonte de dados inalterada" do PRD; CA-17, CA-18). O navegador não faz nenhuma nova requisição externa: toda a atmosfera é gerada por CSS local (verificado em E2E-13).

## Pontos de integração

Não aplicável — nenhuma nova integração externa. A integração existente frontend → backend (Open-Meteo por trás) permanece inalterada; nenhum provedor, asset externo, fonte web ou analytics é adicionado (RF11, restrições de privacidade e propriedade intelectual do PRD).

## Abordagem de testes

Estratégia: a maior parte do risco (escala de temperaturas, famílias de condição, contraste AA, determinismo do tema) concentra-se em **funções puras**, cobertas por testes de unidade rápidos. A composição tema + atmosfera + componentes é verificada em testes de integração no Vitest/Testing Library (view completa com services mockados). Fluxos de navegador reais (movimento reduzido, cores forçadas, ausência de requests externos, transição) ficam no Playwright. A numeração continua as suítes existentes (TU-01…TU-44, TI-01…TI-09, E2E-01…E2E-08 da funcionalidade anterior permanecem válidos e devem continuar passando — CA-18). Cobertura mínima de 80% (`.agents/rules/tests.md`); os novos arquivos de `lib/`, `hooks/` e `components/` entram no `include` de cobertura do `vite.config.ts`.

Pré-requisitos de infraestrutura de teste: adicionar mock de `matchMedia` em `frontend/src/test/setup.ts` (jsdom não o implementa) e novos fixtures em `e2e/fixtures/` (ex.: `weather-thunder-night.json`, `weather-clear-day.json`, `weather-null-temperature.json`), reutilizando `e2e/weather-dashboard.helpers.ts`.

### Testes de unidade

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| TU-45 | mapeia temperaturas nos limites exatos das oito faixas | CA-04 | −10→Frio extremo; −9,9→Muito frio; 0→Muito frio; 0,1→Frio; 10→Frio; 18→Fresco; 24→Ameno; 30→Quente; 38→Muito quente; 38,1→Calor extremo |
| TU-46 | fixa temperaturas fora da escala nas faixas extremas | CA-11 | −80→`extreme-cold`; 55→`extreme-heat`; nenhum token fora da paleta definida |
| TU-47 | retorna faixa nula quando a temperatura está ausente | CA-12 | `getTemperatureBand(null)` → `null` |
| TU-48 | agrupa todos os códigos WMO nas famílias corretas | CA-02 | cada código da tabela → família esperada; código desconhecido e `null` → `neutral` |
| TU-49 | calcula luminância e razão de contraste WCAG | CA-08 | preto/branco = 21:1 (±0,1); cores iguais = 1:1 |
| TU-50 | audita contraste AA na matriz completa de tokens | CA-08 | para cada família×período (14 superfícies) + neutra: foreground/muted ≥ 4,5:1; cada `accent` (8) ≥ 4,5:1; `--band-contrast-text` sobre `accent` ≥ 4,5:1; `--status-*` ≥ 4,5:1 (texto) e ≥ 3:1 (gráfico); `--focus-ring` ≥ 3:1; foreground/muted sobre `--surface-raised` ≥ 4,5:1 |
| TU-51 | ordena as faixas por luminância crescente de frio a quente | CA-09 | `L(extreme-cold) < L(very-cold) < … < L(extreme-heat)` |
| TU-52 | resolve o tema de uma consulta de sucesso | CA-02, CA-03, CA-04 | família×período×faixa produzem superfície, céus e acento exatamente como nas tabelas de tokens |
| TU-53 | resolve tema neutro sem consulta, em erro e em cidade não encontrada | CA-12 | superfície/céus neutros; `--band-accent` = `--surface-foreground` |
| TU-54 | mantém o tema determinístico para a mesma temperatura | CA-03 | duas cidades distintas com 20 °C → tokens idênticos (`mild`/"Ameno") |
| TU-55 | detecta movimento reduzido e reage à mudança | CA-05 | `useReducedMotion` reflete o mock de `matchMedia` e atualiza ao disparar o evento `change` |
| TU-56 | renderiza o fundo como decorativo e inerte | CA-02, CA-13 | `AtmosphericBackground` tem `aria-hidden="true"`, nenhum elemento focável, e renderiza as camadas da família (partículas só em `rain`/`snow`, flash só em `thunderstorm`, estrelas só em `clear` noturno) |
| TU-57 | desativa movimento quando reduced motion está ativo | CA-05 | camadas sem animação aplicada; `transitionMs` = 0 |
| TU-58 | limita o flash de trovoada ao ciclo seguro | CA-06 | duração da animação do `ThunderLayer` = `THUNDER_FLASH_CYCLE_MS` (8 s) → frequência ≪ 3/s |
| TU-59 | exibe o rótulo textual da faixa junto à temperatura | CA-04 | `CurrentWeatherCard` com 28 °C mostra "Quente" visível ao lado da temperatura |
| TU-60 | comunica temperatura indisponível sem cor de faixa | CA-12 | `CurrentWeatherCard` com `temperatureC: null` não renderiza chip colorido e exibe texto de indisponibilidade |
| TU-61 | aplica a mesma escala na previsão de seis horas | CA-04, CA-09 | cada hora do `HourlyForecast` expõe rótulo de faixa e acento coerentes com sua temperatura |
| TU-62 | não altera a faixa ao trocar a unidade exibida | CA-10 | com `temperatureUnit: 'fahrenheit'`, chip/acentos continuam derivados de `temperatureC` (20 °C → "Ameno") |
| TU-63 | gera todas as CSS variables obrigatórias | CA-01 | `themeToCssVariables` produz os 12 tokens (`--surface`…`--focus-ring`) com valores hex válidos |

Estratégia: funções puras de `lib/` testadas diretamente, sem mocks (exceto `matchMedia` para hooks). Componentes testados com props/fixtures (`src/test/weather-fixtures.ts` estendido), validando comportamento visível e atributos de acessibilidade, sem acoplamento a classes de estilo (regra `tests.md`).

### Testes de integração

Integração no frontend (Vitest + Testing Library): `WeatherDashboardView` completa com `services` mockados (stub de `fetch`), verificando a colaboração hooks → tema → atmosfera → componentes.

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| TI-10 | aplica a identidade de ponta a ponta após consulta de sucesso | CA-01, CA-02, CA-04 | raiz com `data-atmosphere`, `data-period`, `data-band` corretos, CSS vars injetadas, fundo presente e `aria-hidden`, título "Será que chove hoje?" e hierarquia cidade→condição→temperatura→chuva mantidos |
| TI-11 | troca de cidade atualiza o tema em transição limitada | CA-07 | ao receber novos dados, tokens/atributos mudam imediatamente; duração de transição configurada ≤ `THEME_TRANSITION_MS`; nenhum estado intermediário bloqueia novos envios de busca |
| TI-12 | mantém atmosfera neutra em erro e cidade não encontrada | CA-12, CA-17 | `data-atmosphere="neutral"`, sem `data-band` de faixa, mensagem acionável e retry exibidos com `--status-error` |
| TI-13 | alterna unidades sem nova busca e sem mudar a faixa | CA-10 | valores °F/mph exibidos, `data-band` inalterado, `fetch` não chamado novamente |
| TI-14 | preserva os fluxos vigentes sob a nova identidade | CA-18 | desambiguação, geolocalização (concedida/negada), status da API e estados de carregamento continuam com os textos, rótulos e comportamentos atuais |

### Testes E2E

Playwright em `e2e/`, com backend real (porta 3001) e rotas de API mockadas por fixtures (padrão existente em `weather-dashboard.helpers.ts`). Novos specs: `e2e/futuristic-identity.spec.ts` e `e2e/futuristic-identity.motion.spec.ts`.

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| E2E-09 | exibe a informação principal na primeira dobra em desktop e celular | CA-01, CA-14, CA-19 | viewports 1440×900 e 390×844: cidade, condição, temperatura com rótulo de faixa e chance de chuva visíveis sem rolagem (bounding boxes dentro da viewport) |
| E2E-10 | representa a condição e o período da cidade consultada | CA-02 | fixture chuva/noite → `data-atmosphere="rain"`, `data-period="night"`; fixture trovoada/dia → `data-atmosphere="thunderstorm"` |
| E2E-11 | aplica a mesma faixa para a mesma temperatura em cidades diferentes | CA-03 | duas buscas com 20 °C (cidades distintas) → mesmo `data-band="mild"` e mesmo rótulo "Ameno" |
| E2E-12 | respeita movimento reduzido com alternativa estática | CA-05 | `page.emulateMedia({ reducedMotion: 'reduce' })`: nenhuma camada decorativa com animação ativa (computed style), cores/rótulos corretos mantidos, todo o conteúdo presente |
| E2E-13 | não faz requisições externas além da API local | CA-17 | durante o fluxo completo, todas as requests capturadas apontam para `127.0.0.1` (backend) — zero hits a domínios externos, fontes ou imagens |
| E2E-14 | conclui a transição de tema em até 600 ms sem bloquear interação | CA-07 | `transition-duration` computada ≤ 600 ms; clique no seletor de unidades durante a troca de cidade é processado imediatamente, sem esperar a transição |
| E2E-15 | alterna unidades mantendo a faixa de cor | CA-10 | °C→°F: valores atualizam, `data-band` inalterado, nenhuma nova request a `/api/weather` |
| E2E-16 | mantém atmosfera neutra e cores de status distintas em falhas | CA-12, CA-17 | cidade não encontrada e 502 → `data-atmosphere="neutral"`, mensagens existentes, indicador de erro com cor semântica |
| E2E-17 | permanece legível em cores forçadas do sistema | CA-14 | `page.emulateMedia({ forcedColors: 'active' })`: fundo decorativo suprimido (`display: none`), conteúdo visível e operável |
| E2E-18 | preserva acessibilidade de teclado e leitor de tela | CA-13 | Tab percorre busca → candidatos → unidades sem passar pelo fundo (`aria-hidden`), foco visível com anel tokenizado, resultados anunciados via `role="status"`/`"alert"` existentes |

Casos não automatizáveis, validados na fase de QA (skill `executar-qa`) com registro de evidências: leitura em 3 s por participantes (CA-19 — teste de usabilidade); zoom de navegador a 200% (CA-15 — zoom real do Chromium não é controlável pelo Playwright; inspeção manual de corte/sobreposição/contraste); p95 de 3 s da consulta (CA-16 — métrica de ambiente real, com tendência inalterada pois não há novas requests nem JS de animação); distinção em tons de cinza/daltonismo (CA-09 — complementada por TU-50/TU-51 e simulação manual de filtros).

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Domínio puro** (`temperature-scale.ts`, `condition-family.ts`, `contrast.ts`) + TU-45…TU-49, TU-51 — base sem dependências; valida imediatamente a tabela RF14, os limites e a ordenação de luminância.
2. **Tokens e resolução de tema** (`theme-tokens.ts`, `resolve-theme.ts`) + auditoria de contraste TU-50 e TU-52…TU-54, TU-63 — trava a matriz AA antes de qualquer visual; se algum par falhar, ajustar o hex dentro da família de matiz da faixa.
3. **Hooks de preferência** (`useMediaQuery.ts`, `useReducedMotion.ts`, mock de `matchMedia` no setup de testes) + TU-55.
4. **Atmosfera** (`components/atmosphere/*`, keyframes e media queries no `index.css`, cores tokenizadas no `tailwind.config.js`) + TU-56…TU-58 — depende dos tokens (2) e dos hooks (3).
5. **Hook de tema da view** (`useAtmosphereTheme.ts`) e **integração na view/componentes** (`WeatherDashboardView`, `CurrentWeatherCard`, `TemperatureBandChip`, `HourlyForecast`, `StatusMessage`, `ApiStatus`) + TU-59…TU-62 e TI-10…TI-14 — depende de (2) e (4).
6. **E2E** (`e2e/futuristic-identity*.spec.ts` + fixtures) — depende da interface integrada.
7. **Não regressão e fechamento**: rodar as suítes completas (`frontend`: lint, typecheck, build, test, test:coverage; `backend`: build, test; `e2e`: test) — CA-18; ajustes finos de design com a skill `impeccable` (modo Operate, atualizando o surface brief `.impeccable/surfaces/frontend-src-views-weatherdashboardview-tsx.md`).

### Dependências técnicas

- **Nenhuma dependência npm nova** (frontend, backend ou e2e). Tudo é implementado com React 19, Tailwind 3.4, CSS nativo, Vitest 5, Testing Library e Playwright 1.65 já instalados.
- Playwright `page.emulateMedia` suporta `reducedMotion` e `forcedColors` no projeto Chromium existente — já disponível.
- Sem bloqueadores de infraestrutura ou de serviços externos; backend inalterado.

## Monitoramento e observabilidade

Não aplicável além do existente. O PRD proíbe analytics e novas coletas; o frontend não ganha telemetria. O backend mantém o `GET /health` e o logger estruturado sem alterações. As "métricas" desta funcionalidade são verificáveis em tempo de build/teste: auditoria de contraste (TU-50), ausência de requests externos (E2E-13) e suíte de não regressão (CA-18). Recomenda-se apenas acompanhar o tamanho do bundle em `npm run build` (a atmosfera é CSS/divs; não deve haver crescimento relevante).

## Considerações técnicas

### Principais decisões

- **CSS puro (gradientes + keyframes) para o fundo** — decidido com o solicitante. Alternativas descartadas: Canvas 2D/rAF (loop de animação em JS, limpeza manual, maior risco de travamento e de consumo de bateria — US5; difícil auditoria de contraste) e WebGL (complexidade desproporcional; o PRD exclui cenas 3D). CSS anima `transform`/`opacity` no compositor, é desativável por media query e testável por atributos.
- **Tokens hex exatos em TypeScript como fonte única de verdade, injetados como CSS vars inline** — alternativa descartada: definir paletas só no CSS (duplicação e risco de drift entre o que a auditoria testa e o que é renderizado). Com `resolveTheme` → `style={{ '--surface': … }}`, o teste de contraste audita exatamente os valores renderizados. O `:root` do `index.css` mantém apenas fallbacks idênticos aos tokens neutros.
- **Superfícies de conteúdo totalmente opacas, sem blur/transparência** — garante que o contraste independe do fundo animado (RF4, RF23, CA-08) e torna a matriz auditável com cores planas. O efeito futurista vem de gradientes, glow e partículas fora do painel, não de vidro translúcido.
- **Crossfade de duas camadas para trocar gradientes** — gradientes CSS não interpolam com `transition`; duas camadas sobrepostas com transição de `opacity` resolvem o RF8 sem JS de animação.
- **Escala sempre em °C e clamp nos extremos** — `getTemperatureBand` só aceita Celsius; a conversão para °F permanece confinada a `lib/units.ts` (formatação). CA-10 e CA-11 tornam-se estruturais.
- **Stack de fontes do sistema** — decidido com o solicitante; zero novos ativos e zero requests externas (CA-17). A identidade tipográfica vem de peso, tracking e escala.
- **Cor de status separada da cor de dados** — `--status-*` exclusivos de ApiStatus/erros; bloco de chuva sem cor própria (usa `--surface-raised`), eliminando confusão com faixas de temperatura (RF25).
- **Numeração de testes continua as suítes existentes** (TU-45+, TI-10+, E2E-09+) para preservar a rastreabilidade dos IDs já gravados nos nomes de teste do repositório.

### Riscos conhecidos

- **Drift de contraste após ajustes finos de design**: mitigado por TU-50, que falha a suíte; qualquer alteração de hex passa obrigatoriamente pela matriz.
- **Performance em celulares de baixa gama** (muitas camadas animadas): mitigado por animar apenas `transform`/`opacity`, densidade reduzida < 640 px (RF32), `contain`/`pointer-events: none` no fundo e ausência de JS por frame; validar em QA com CPU throttling.
- **jsdom não implementa `matchMedia` nem animações CSS**: hooks de media query exigem mock no setup; comportamentos visuais de animação só são verificáveis em E2E (Chromium real) — os testes unitários validam atributos e constantes, não a renderização do frame.
- **Limite de 3 flashes/s em trovoada**: ciclo fixo de 8 s por constante nomeada e TU-58; qualquer alteração da keyframe precisa manter `THUNDER_FLASH_CYCLE_MS ≥ 2000`.
- **Zoom 200% e usabilidade (3 s) não automatizáveis**: cobertos por auditoria manual na fase QA com evidências (registro explícito na abordagem de testes).
- **`WeatherDashboardView` crescer além de 100 linhas** na reorganização da primeira dobra: mitigado extraindo subcomponentes (padrão já usado com `ApiStatus`/`WeatherResults`) para arquivos coesos.

### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/` (`code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md`, `tests.md`). Restrições e decisões relevantes para esta especificação:

- **code-standards**: sem comentários no código; arquivos `.ts` ≤ 100 linhas (módulos de tokens/tema separados por coesão); funções ≤ 30 linhas; ≤ 3 parâmetros (props e entradas agrupadas em objetos de domínio — `ThemeInput`, `AtmosphericBackgroundProps`); cláusulas de guarda (`getTemperatureBand` e `resolveTheme` com early-return neutro); constantes nomeadas para todos os limites, ciclos e densidades (nenhum número mágico); nenhum segredo envolvido.
- **javascript-typescript**: `const` por padrão; `===`/`!==`; tipagem explícita e proibição de `any` (tokens tipados como uniões literais + `Record<ThemeTokenName, string>`); arrow functions apenas em callbacks; sem ternários aninhados; imutabilidade (`resolveTheme` retorna novos objetos, tokens derivados por spread); `npm run lint` obrigatório ao final de cada alteração.
- **folder-structure**: novos componentes em `src/components/atmosphere/` e `src/components/weather/`; hooks em `src/hooks/`; domínio puro em `src/lib/` (pasta já consagrada no projeto, embora a rule liste apenas components/views/services/hooks/assets/types — segue-se a convenção existente); nenhum acesso ao backend fora de `services/`; fluxo `view → components/hooks → services` preservado; E2E em `e2e/` na raiz.
- **node**: não aplicável diretamente (backend inalterado); registrado para evitar qualquer mudança acidental em rotas/serviços.
- **tests**: cobertura mínima de 80% mantida nos thresholds do Vitest; FIRST (testes rápidos, independentes, repetíveis — sem relógio/aleatoriedade reais, `matchMedia` mockado); Given/When/Then; pirâmide respeitada (base ampla de TU em funções puras, TI de view integrada, poucos E2E de fluxo crítico); E2E não substitui testes unitários.
- **AGENTS.md**: antes de concluir alterações no frontend, executar `npm run lint`, `npm run typecheck`, `npm run build` e `npm test` em `frontend/`; no backend, `npm run build` e `npm test` (sem alterações esperadas); preserve a separação `frontend/`/`backend/`; não há mudança de porta nem de URL de API.

### Conformidade com skills

Skills do projeto aplicáveis a esta especificação:

- **`react`** (`.agents/skills/react/SKILL.md`) — obrigatória antes de qualquer implementação no frontend (componentes de atmosfera, hooks de media query/tema, alterações na view e nos cards). Sem desvios previstos.
- **`impeccable`** (`.agents/skills/impeccable/SKILL.md`) — aplicável à fase de implementação/ajuste fino da identidade visual (modo Operate); o surface brief existente em `.impeccable/surfaces/frontend-src-views-weatherdashboardview-tsx.md` deve ser atualizado com as decisões desta TechSpec (paletas, tipografia de sistema, composição do fundo). Desvio registrado: a direção estética "vidro/transparência" comum em dashboards futuristas foi descartada em favor de superfícies opacas, por exigência de contraste auditável (RF23, CA-08).
- **`executar-task`**, **`executar-qa`** e **`executar-review`** — aplicáveis às fases seguintes do fluxo (implementação, QA e revisão), não a esta especificação. QA deve cobrir os casos manuais listados na abordagem de testes (CA-15, CA-16, CA-19, tons de cinza de CA-09).
- Demais skills (`caveman`, `criar-prd`, `criar-techspec`, `criar-tasks`) não se aplicam a esta especificação.

### Arquivos relevantes e dependentes

**Novos (frontend):**

- `frontend/src/lib/temperature-scale.ts`
- `frontend/src/lib/condition-family.ts`
- `frontend/src/lib/theme-tokens.ts`
- `frontend/src/lib/resolve-theme.ts`
- `frontend/src/lib/contrast.ts` (+ `contrast.test.ts`, `temperature-scale.test.ts`, `condition-family.test.ts`, `resolve-theme.test.ts`)
- `frontend/src/hooks/useMediaQuery.ts` (+ `.test.ts`)
- `frontend/src/hooks/useReducedMotion.ts` (+ `.test.ts`)
- `frontend/src/hooks/useAtmosphereTheme.ts` (+ `.test.ts`)
- `frontend/src/components/atmosphere/AtmosphericBackground.tsx`, `SkyLayer.tsx`, `BandGlowLayer.tsx`, `ParticleLayer.tsx`, `ThunderLayer.tsx`, `StarField.tsx` (+ `AtmosphericBackground.test.tsx`)
- `frontend/src/components/weather/TemperatureBandChip.tsx` (+ `.test.tsx`)
- `e2e/futuristic-identity.spec.ts`, `e2e/futuristic-identity.motion.spec.ts`
- `e2e/fixtures/weather-thunder-night.json`, `e2e/fixtures/weather-clear-day.json`, `e2e/fixtures/weather-null-temperature.json`

**Modificados (frontend):**

- `frontend/src/views/WeatherDashboardView.tsx` (+ testes existentes atualizados)
- `frontend/src/components/weather/CurrentWeatherCard.tsx` (+ `.test.tsx`)
- `frontend/src/components/weather/HourlyForecast.tsx` (+ `.test.tsx`)
- `frontend/src/components/weather/StatusMessage.tsx` (+ `.test.tsx`)
- `frontend/src/index.css`
- `frontend/tailwind.config.js`
- `frontend/src/test/setup.ts` (mock `matchMedia`)
- `frontend/src/test/weather-fixtures.ts` (fixtures de faixas/famílias)
- `frontend/vite.config.ts` (include de cobertura dos novos diretórios)
- `.impeccable/surfaces/frontend-src-views-weatherdashboardview-tsx.md` (registro das decisões visuais)

**Dependentes sem alteração (regressão vigiada — CA-18):**

- `frontend/src/hooks/useWeatherDashboard.ts`, `weather-dashboard.logic.ts`, `useWeather.ts`, `useCitySearch.ts`, `useGeolocation.ts`, `useUnits.ts`, `useApiHealth.ts`
- `frontend/src/services/*`, `frontend/src/types/*`, `frontend/src/lib/units.ts`, `frontend/src/lib/weather-codes.ts`
- Todo o `backend/` e os specs existentes em `e2e/`

**Referências:**

- `tasks/prd-identidade-futurista-reativa/prd.md` (requisitos e CA-01…CA-19)
- `tasks/prd-painel-de-clima/techspec.md` (contratos de API vigentes)
- `PRODUCT.md` (direção aprovada e vinculante da identidade reativa)
