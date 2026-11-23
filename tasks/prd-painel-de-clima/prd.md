# Documento de Requisitos do Produto (PRD)

## Visão geral

O Painel de Clima é uma funcionalidade web que permite a qualquer pessoa consultar as condições meteorológicas atuais de uma cidade digitando o seu nome, respondendo de forma rápida e direta à pergunta central do produto: "será que chove hoje?". A funcionalidade é direcionada a usuários comuns que desejam uma consulta simples e confiável de clima, sem cadastro, sem configuração e sem necessidade de chaves de API, aproveitando a infraestrutura de frontend (React) e backend (Node.js/Express) já existente.

O valor entregue é uma resposta imediata e legível sobre o tempo em qualquer cidade do mundo: temperatura e sensação térmica, descrição e ícone da condição, umidade, vento, probabilidade de precipitação/chuva, pressão atmosférica e uma previsão resumida das próximas 6 horas. Como conveniência adicional, o painel pode obter as coordenadas aproximadas do usuário mediante permissão explícita, carregar o clima dessas coordenadas e identificar a consulta como “Minha localização”. Nesta versão, não é necessário identificar o nome da cidade por geocodificação reversa. Todos os dados meteorológicos são obtidos pelo backend a partir da API Open-Meteo; o frontend consome exclusivamente o backend.

## Objetivos

- Permitir que o usuário consulte o clima atual de qualquer cidade digitando o nome, com resultado exibido em até 3 segundos (p95) após o envio da busca em condições normais de rede.
- Reduzir o esforço de consulta: quando a geolocalização for concedida, carregar automaticamente o clima das coordenadas e identificar a consulta como “Minha localização” em até 90% das sessões em que a permissão é aceita, sem exigir digitação.
- Responder de forma clara à pergunta "vai chover?": exibir probabilidade de precipitação e condições das próximas 6 horas para 100% das consultas bem-sucedidas.
- Eliminar ambiguidade de cidades homônimas: quando a busca retornar múltiplas correspondências, apresentar uma lista de seleção em 100% dos casos, garantindo que o usuário escolha a cidade correta.
- Cobrir localidades globais: aceitar buscas em português e em outros idiomas, com cobertura mundial de cidades fornecida pela Open-Meteo.
- Comunicar erros de forma útil: exibir mensagem amigável e acionável em 100% dos casos de falha (cidade não encontrada, permissão negada, indisponibilidade da API), sem telas em branco ou erros técnicos expostos.

## Histórias de usuário

- US1: Como usuário comum, quero digitar o nome de uma cidade e ver o clima atual para saber rapidamente como está o tempo naquele local.
- US2: Como usuário comum, quero ver a probabilidade de chuva e a previsão das próximas 6 horas para decidir se levo guarda-chuva ou adio um compromisso ("será que chove hoje?").
- US3: Como usuário em deslocamento, quero permitir o acesso à minha localização para que o painel carregue automaticamente o clima das minhas coordenadas e o identifique como “Minha localização”, sem precisar digitar.
- US4: Como usuário que busca uma cidade com nome ambíguo (ex.: "São Paulo", "Vitória", "Londres"), quero escolher entre as correspondências listadas (nome, região, país) para consultar a cidade correta.
- US5: Como usuário que prefere outras unidades, quero alternar entre °C/°F e km/h/mph para ler os dados no formato que me é familiar.
- US6: Como usuário, quero receber uma mensagem clara quando a cidade não for encontrada ou o serviço estiver indisponível, para entender o que houve e tentar novamente.
- US7: Como usuário que nega a permissão de localização, quero continuar podendo digitar a cidade manualmente, sem que a recusa impeça o uso do painel.
- US8 (borda): Como usuário, quero que o painel trate cidades com caracteres especiais/acentuação e nomes parciais, sugerindo correspondências quando a busca não for exata.
- US9 (borda): Como usuário com leitor de tela ou navegação por teclado, quero consultar o clima e a lista de cidades de forma acessível.

## Principais funcionalidades

### Busca de cidade

Permite ao usuário informar a cidade desejada e dispara a consulta de clima. É o ponto de entrada principal da funcionalidade.

- Em alto nível: o usuário digita o nome da cidade no campo de busca e confirma o envio; o sistema resolve a cidade em coordenadas geográficas (geocodificação) e solicita as condições meteorológicas correspondentes.
- RF1: O painel deve oferecer um campo de texto para digitação do nome da cidade e um meio explícito de envio (botão e/ou tecla Enter).
- RF2: O painel deve aceitar nomes de cidades com acentuação e caracteres especiais, e tolerar maiúsculas/minúsculas.
- RF3: A busca deve ser processada somente após envio explícito pelo usuário (não é obrigatória busca a cada tecla digitada).
- RF4: Quando a geocodificação retornar múltiplas correspondências, o painel deve apresentar uma lista de seleção contendo, no mínimo, nome da cidade, região administrativa e país, para que o usuário escolha uma.
- RF5: Quando a geocodificação não retornar nenhuma correspondência, o painel deve exibir mensagem informando que a cidade não foi encontrada e permitir nova busca.
- RF6: O frontend deve obter todos os dados de clima exclusivamente por meio do backend, nunca chamando a Open-Meteo diretamente.

### Painel de clima atual

Exibe as condições meteorológicas atuais da cidade selecionada. É o núcleo de valor do produto.

- Em alto nível: após a resolução da cidade, o painel apresenta de forma destacada os dados atuais retornados pelo backend.
- RF7: O painel deve exibir a temperatura atual e a sensação térmica.
- RF8: O painel deve exibir a descrição textual da condição do tempo (derivada do código meteorológico) acompanhada de um ícone representativo.
- RF9: O painel deve exibir a umidade relativa do ar e a velocidade do vento com sua direção.
- RF10: O painel deve exibir a probabilidade de precipitação/chuva.
- RF11: O painel deve exibir a pressão atmosférica ao nível do mar.
- RF12: O painel deve identificar a cidade e o país aos quais os dados de uma busca por cidade se referem. Em consultas por geolocalização sem geocodificação reversa, deve identificá-las como “Minha localização”.
- RF13: O painel deve indicar o horário de referência dos dados atuais (fuso local da cidade consultada).

### Previsão resumida das próximas 6 horas

Complementa o clima atual com a evolução de curto prazo, reforçando a resposta à pergunta "vai chover?".

- Em alto nível: além das condições atuais, o painel apresenta uma previsão resumida hora a hora para as próximas 6 horas.
- RF14: O painel deve exibir a previsão das próximas 6 horas contendo, por hora, ao menos temperatura, condição do tempo (descrição/ícone) e probabilidade de precipitação.
- RF15: A previsão resumida deve ser apresentada em conjunto com o clima atual, sem exigir navegação adicional.

### Consulta da localização por geolocalização

Recurso opcional de conveniência que reduz a digitação ao carregar o clima das coordenadas autorizadas pelo usuário.

- Em alto nível: o painel pode solicitar permissão de localização ao navegador; se concedida, usa as coordenadas para carregar o clima e identifica a consulta como “Minha localização”. O nome da cidade não precisa ser identificado nesta versão.
- RF16: O painel pode solicitar a geolocalização do navegador; o uso deve depender de permissão explícita do usuário.
- RF17: Quando a permissão for concedida e as coordenadas forem obtidas, o painel deve carregar automaticamente o clima dessas coordenadas como consulta inicial e identificá-la como “Minha localização”. Não é necessário obter o nome da cidade.
- RF18: Quando a permissão for negada, indisponível ou a localização não puder ser determinada, o painel deve funcionar normalmente por digitação manual, sem bloqueios ou erros impeditivos.
- RF19: O painel deve comunicar de forma clara o estado da tentativa de geolocalização (em andamento, sucesso, negada/indisponível).

### Seletor de unidades

Permite adequar a leitura dos dados à preferência do usuário.

- Em alto nível: o usuário alterna as unidades de temperatura e velocidade do vento, e o painel reexibe os valores no formato escolhido.
- RF20: O painel deve oferecer alternância de unidades de temperatura entre °C e °F.
- RF21: O painel deve oferecer alternância de unidades de velocidade do vento entre km/h e mph.
- RF22: A mudança de unidade deve atualizar os valores exibidos sem exigir nova busca.

## Critérios de aceitação

- CA-01 (US1, RF1–RF3, RF6–RF13): Dado que o usuário está no painel, quando digita o nome de uma cidade válida e envia a busca, então o clima atual daquela cidade é exibido com temperatura, sensação térmica, descrição com ícone, umidade, vento com direção, probabilidade de precipitação, pressão atmosférica, identificação da cidade/país e horário de referência, em até 3 segundos (p95) em condições normais.
- CA-02 (US2, RF14–RF15): Dado que o clima atual foi carregado, quando o usuário visualiza o painel, então a previsão resumida das próximas 6 horas é exibida junto ao clima atual, com temperatura, condição e probabilidade de precipitação por hora.
- CA-03 (US3, RF16–RF19): Dado que o usuário concede a permissão de geolocalização, quando o painel obtém as coordenadas, então carrega automaticamente o clima dessas coordenadas, identifica a consulta como “Minha localização” e indica o estado da geolocalização. A identificação do nome da cidade não é exigida.
- CA-04 (US7, RF18): Dado que o usuário nega a permissão de geolocalização ou ela é indisponível, quando o painel é utilizado, então a busca manual por cidade continua plenamente funcional, sem erros impeditivos.
- CA-05 (US4, RF4): Dado que a busca por cidade retorna múltiplas correspondências, quando o envio é processado, então uma lista com nome, região administrativa e país é exibida para seleção, e a escolha de um item carrega o clima da cidade selecionada.
- CA-06 (US6, RF5): Dado que a cidade digitada não corresponde a nenhuma localidade, quando a busca é processada, então uma mensagem clara de "cidade não encontrada" é exibida e o usuário pode realizar nova busca.
- CA-07 (US6): Dado que o backend ou a Open-Meteo está indisponível, quando o usuário realiza uma busca, então uma mensagem de erro amigável é exibida, sem detalhes técnicos internos nem tela em branco, com possibilidade de tentar novamente.
- CA-08 (US5, RF20–RF22): Dado que o clima está sendo exibido, quando o usuário alterna as unidades de temperatura (°C/°F) ou de vento (km/h/mph), então os valores exibidos são atualizados no novo formato sem necessidade de nova busca.
- CA-09 (US8, RF2): Dado um nome de cidade com acentuação, caracteres especiais ou grafia em maiúsculas/minúsculas variadas, quando a busca é enviada, então o sistema a trata de forma consistente, retornando correspondências ou a mensagem apropriada de não encontrado.
- CA-10 (RF6): Dado qualquer consulta de clima, quando os dados são obtidos, então o frontend os recebe exclusivamente do backend, sem chamadas diretas do navegador à Open-Meteo.
- CA-11 (US9): Dado um usuário que navega por teclado ou leitor de tela, quando interage com o campo de busca, a lista de cidades e o painel, então os elementos são alcançáveis e anunciados de forma acessível (rótulos, estados e resultados).

## Experiência do usuário

Perfis e necessidades:

- Usuário comum (principal): quer uma resposta rápida e legível sobre o tempo em uma cidade, com destaque para "vai chover?". Prioriza simplicidade e clareza sobre densidade de dados.
- Usuário em deslocamento (secundário): beneficia-se do carregamento automático do clima da sua localização para evitar digitação; a consulta é identificada como “Minha localização”.
- Usuário com preferências específicas (secundário): necessita de unidades alternativas (°F, mph) e de acessibilidade (leitor de tela, teclado).

Fluxos principais e interações:

1. Fluxo por digitação: o usuário abre o painel, digita a cidade e envia; se houver múltiplas correspondências, seleciona a desejada na lista; o clima atual e a previsão de 6 horas são exibidos.
2. Fluxo por geolocalização: o painel solicita permissão; se concedida, carrega o clima das coordenadas e identifica a consulta como “Minha localização”; se negada, o fluxo por digitação permanece disponível.
3. Ajuste de unidades: o usuário alterna °C/°F e km/h/mph e os valores são reexibidos imediatamente.

Requisitos de UI/UX e acessibilidade:

- Interface em português (PT-BR), com textos claros e mensagens de erro amigáveis e acionáveis.
- Hierarquia visual que destaque a temperatura atual, a condição (descrição + ícone) e a probabilidade de chuva, seguidas das demais métricas e da previsão de 6 horas.
- Estados visuais explícitos para carregamento, sucesso, cidade não encontrada, geolocalização (em andamento/concedida/negada) e erro de serviço.
- Lista de correspondências de cidades claramente selecionável, mostrando nome, região e país.
- Acessibilidade: campo de busca e lista de cidades operáveis por teclado; rótulos acessíveis; comunicação de estados/resultados para leitores de tela (ex.: regiões "live"); contraste adequado; ícones acompanhados de descrição textual.
- Layout responsivo, utilizável em telas de dispositivos móveis e desktop.

## Restrições técnicas de alto nível

- Integração externa obrigatória: dados meteorológicos e de geocodificação obtidos da API Open-Meteo — Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`) para converter cidade em coordenadas e Weather/Forecast API (`https://api.open-meteo.com/v1/forecast`) para as condições atuais e a previsão por hora. A Open-Meteo é gratuita e não exige chave de API para uso não comercial.
- Frontend consome exclusivamente o backend: as chamadas à Open-Meteo devem ser feitas pelo backend (Node.js/Express existente), que expõe endpoint(s) próprio(s) para o frontend (React existente). O navegador não chama a Open-Meteo diretamente.
- Reuso da stack existente: a funcionalidade deve ser implementada sobre o frontend (React 19, TypeScript, Vite, Tailwind) e o backend (Node.js, Express 5, TypeScript, CORS) já presentes, preservando a separação entre `frontend/` e `backend/`.
- Desempenho: tempo de resposta de ponta a ponta da consulta de clima com meta de até 3 segundos (p95) em condições normais de rede, incluindo geocodificação e previsão.
- Privacidade e dados sensíveis: a geolocalização do usuário é dado sensível e deve ser usada somente mediante permissão explícita do navegador para consultar o clima das coordenadas; não deve ser armazenada de forma persistente além do necessário para a sessão/consulta.
- Idioma e unidades: interface e descrições em PT-BR; dados meteorológicos solicitados em unidades métricas por padrão (°C, km/h, mm, hPa), com conversão para unidades imperiais (°F, mph) no seletor de unidades.
- Fusos horários: horários exibidos no fuso local da cidade consultada, conforme retornado pela Open-Meteo.

## Fora do escopo

- Cadastro, autenticação, contas de usuário ou histórico personalizado de consultas.
- Persistência de cidades favoritas ou consultadas entre sessões (no máximo, comportamento de sessão).
- Previsão estendida além das próximas 6 horas (ex.: previsão de 7/16 dias) e dados históricos de clima.
- Variáveis meteorológicas adicionais não listadas (ex.: UV, radiação solar, visibilidade, qualidade do ar, nascer/pôr do sol, fases da lua, dados de solo).
- Chamadas diretas do frontend à Open-Meteo (toda obtenção de dados passa pelo backend).
- Uso comercial da Open-Meteo ou qualquer integração que exija chave de API paga/self-hosted.
- Localização/idioma da interface além de PT-BR (sem i18n multi-idioma nesta versão).
- Mapas, animações meteorológicas, gráficos interativos avançados ou widgets incorporáveis.
- Notificações, alertas push ou avisos de condições severas.
- Monetização, analytics de negócio ou métricas de uso além das necessárias para validar os objetivos desta funcionalidade.
