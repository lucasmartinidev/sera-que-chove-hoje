# Testes E2E

Instale as dependências e o Chromium uma vez:

```bash
npm install
npx playwright install chromium
```

Execute toda a suíte com:

```bash
npm test
```

O Playwright inicia e encerra o backend na porta 3001 e o frontend na porta 5101. Se uma porta estiver ocupada, ajuste `E2E_BACKEND_PORT` ou `E2E_FRONTEND_PORT`. A suíte usa fixtures locais para geocodificação e clima, sem depender da Open-Meteo.
