# Tarefa 2.0: Tokens de tema e resolução (superfícies, céus, semânticas, auditoria de contraste da matriz)

## Visão geral

Cria a fonte única de verdade dos valores hex da identidade (`theme-tokens.ts`) e o resolvedor determinístico de temas (`resolve-theme.ts`), que converte `ThemeInput` (família × período × faixa) em `ThemeTokens` e em CSS variables. Entrega também a auditoria automatizada de contraste WCAG AA sobre a matriz completa de combinações — o portão de qualidade que trava as paletas antes de qualquer trabalho visual.

Dependência: Tarefa 1.0 (`temperature-scale.ts`, `condition-family.ts`, `contrast.ts`).

<skills>
### Conformidade com skills

- `react` (`.agents/skills/react/SKILL.md`) — obrigatória antes de qualquer código no frontend; aplica-se às convenções de TypeScript (módulos puros).
- `impeccable` (`.agents/skills/impeccable/SKILL.md`) — referência para a coerência cromática dos tokens (contraste, variação de luminância entre faixas); os valores exatos já estão definidos na TechSpec.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Confirmada a leitura do `AGENTS.md` e de todas as rules em `.agents/rules/`. Relevantes para esta tarefa:

- `code-standards.md`: sem comentários; arquivos ≤ 100 linhas (separar `theme-tokens.ts` de `resolve-theme.ts`); ≤ 3 parâmetros (entrada agrupada em `ThemeInput`); constantes nomeadas (ex.: `SURFACE_RAISED_LIGHTEN_AMOUNT = 0.04`).
- `javascript-typescript.md`: sem `any`; `ThemeTokens` tipado como `Record<ThemeTokenName, string>` com união literal de nomes; imutabilidade (retornar novos objetos).
- `tests.md`: TU-50 é teste crítico de negócio (acessibilidade) — percorre a matriz completa com assertions por par de cores; cobertura ≥ 80%.
- Ao final: `npm run lint`, `npm run typecheck` e `npm test` em `frontend/`.
</rules>

<requirements>

- RF12, RF18 — tema neutro quando não há consulta carregada com sucesso; `--band-accent` igual a `--surface-foreground` quando a faixa é `null`.
- RF14, RF15 — tokens `accent`/`deep` exatos das oito faixas, com luminância de `accent` estritamente crescente de frio a quente.
- RF21 — superfícies e céus próprios por família de condição × período (dia/noite), distinguíveis por luminosidade.
- RF22–RF24 — contraste AA garantido e auditado para texto (4,5:1), texto grande e componentes não-textuais (3:1) em 100% da matriz.
- RF25 — tokens semânticos `--status-ok/warn/error` e `--focus-ring` exclusivos de status da API, erros e foco, distintos das cores de condição/temperatura.
- RF19 — faixa derivada sempre de `temperatureC` (entrada do resolvedor).
</requirements>

## Subtarefas

- [ ] 2.1 Implementar `theme-tokens.ts`: superfícies por família×período (13 valores + neutra), gradientes de céu, `accent`/`deep` por faixa, tokens fixos (`--surface-foreground`, `--surface-muted`, `--band-contrast-text`, `--status-*`, `--focus-ring`) — valores hex exatos das tabelas da TechSpec.
- [ ] 2.2 Implementar `resolve-theme.ts`: `resolveTheme(input: ThemeInput): ThemeTokens` (guarda neutra primeiro), `themeToCssVariables(tokens): CssVariables` (12 vars `--surface…--focus-ring`) e `lighten(hex, amount)` para `--surface-raised`.
- [ ] 2.3 Escrever a auditoria de contraste TU-50 percorrendo a matriz completa (14 superfícies + neutra × foreground/muted/accent/chip/status/focus/raised).
- [ ] 2.4 Escrever os testes TU-51 a TU-54 e TU-63.
- [ ] 2.5 Rodar `npm run lint`, `npm run typecheck` e `npm test` (com cobertura) em `frontend/`; se algum par de TU-50 falhar, ajustar o hex dentro da família de matiz da faixa e rerrodar.

## Detalhes de implementação

Ver `techspec.md`, seção "Modelos de dados": tabelas `TemperatureBand` (accent/deep), "Tokens de superfície", "Tokens fixos de texto e semânticos" e "Tokens de céu", além do blockquote de degradação (RF12/RF18) e das regras de consumo dos tokens em "Principais interfaces" (accent somente sobre `--surface`; raised somente com foreground/muted). Assinaturas em "Principais interfaces → resolve-theme". O `:root` do `index.css` com fallbacks idênticos aos tokens neutros é aplicado na Tarefa 4.0.

## Critérios de aceitação relacionados

- CA-02
- CA-03
- CA-04
- CA-08
- CA-09
- CA-12
- CA-17

## Testes da tarefa

### Testes de unidade

- [ ] TU-50 — audita contraste AA na matriz completa de tokens
- [ ] TU-51 — ordena as faixas por luminância crescente de frio a quente
- [ ] TU-52 — resolve o tema de uma consulta de sucesso
- [ ] TU-53 — resolve tema neutro sem consulta, em erro e em cidade não encontrada
- [ ] TU-54 — mantém o tema determinístico para a mesma temperatura
- [ ] TU-63 — gera todas as CSS variables obrigatórias

### Testes de integração (se aplicável)

Não aplicável.

### Testes E2E (se aplicável)

Não aplicável.

## Arquivos relevantes

- `frontend/src/lib/theme-tokens.ts` (novo)
- `frontend/src/lib/resolve-theme.ts` (novo)
- `frontend/src/lib/resolve-theme.test.ts` (novo — TU-50 a TU-54, TU-63)
- `frontend/src/lib/temperature-scale.ts`, `frontend/src/lib/condition-family.ts`, `frontend/src/lib/contrast.ts` (dependências da Tarefa 1.0)
- `tasks/prd-identidade-futurista-reativa/techspec.md` (referência)
